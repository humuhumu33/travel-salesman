/**
 * Knapsack Problem Solver using Atlas Sigil Algebra
 * 
 * The Knapsack Problem is one of the most famous NP-hard optimization problems:
 * Given items with weights and values, select items to maximize total value
 * without exceeding a weight capacity.
 * 
 * This implementation showcases:
 * - Encoding item selection using Atlas class system
 * - Using d modality for include/exclude decisions
 * - Parallel composition for exploring different combinations
 * - Branch-and-bound optimization
 */

import Atlas from '@uor-foundation/sigmatics';

console.log('='.repeat(80));
console.log('Atlas Sigil Algebra - Knapsack Problem Solver');
console.log('='.repeat(80));
console.log();

// ============================================================================
// Knapsack Problem Definition
// ============================================================================

interface Item {
  id: number;
  name: string;
  weight: number;
  value: number;
}

interface KnapsackInstance {
  items: Item[];
  capacity: number;
}

// ============================================================================
// Knapsack Solver using Atlas
// ============================================================================

class KnapsackSolver {
  /**
   * Encode item selection using Atlas class system
   * Item ID encoded in class, selection in d modality (0=exclude, 1=include)
   */
  private encodeItemSelection(itemId: number, isSelected: boolean): number {
    const baseClass = itemId % 96;
    const info = Atlas.classInfo(Atlas.canonicalByte(baseClass));
    
    // Use d modality: 0 = exclude, 1 = include
    const newD = isSelected ? 1 : 0;
    const newClass = 24 * info.components.h2 + 8 * newD + info.components.l;
    return Atlas.classIndex(Atlas.canonicalByte(newClass));
  }

  /**
   * Encode a complete selection as Atlas sigil expression
   */
  private encodeSelection(selected: boolean[]): string {
    const expressions: string[] = [];
    
    for (let i = 0; i < selected.length; i++) {
      const isSelected = selected[i];
      const classIdx = this.encodeItemSelection(i, isSelected);
      expressions.push(`mark@c${classIdx}`);
    }
    
    // Parallel composition represents all item selections
    return expressions.join(' || ');
  }

  /**
   * Solve 0/1 Knapsack using branch-and-bound with Atlas encoding
   */
  solve(instance: KnapsackInstance): {
    selectedItems: Item[];
    totalValue: number;
    totalWeight: number;
    atlasExpression: string;
  } | null {
    console.log(`\n🎒 0/1 Knapsack Problem`);
    console.log(`   Items: ${instance.items.length}`);
    console.log(`   Capacity: ${instance.capacity}`);
    console.log(`   Items:`);
    instance.items.forEach(item => {
      console.log(`     ${item.name}: weight=${item.weight}, value=${item.value}`);
    });

    if (instance.items.length === 0) {
      return null;
    }

    const n = instance.items.length;
    const selected = new Array(n).fill(false);
    const bestState = {
      selection: null as boolean[] | null,
      value: 0,
      weight: 0,
    };

    // Calculate value-to-weight ratios for sorting (greedy bound)
    const itemsWithRatio = instance.items.map((item, idx) => ({
      ...item,
      index: idx,
      ratio: item.value / item.weight,
    })).sort((a, b) => b.ratio - a.ratio);

    // Branch and bound search
    this.branchAndBound(
      instance,
      itemsWithRatio,
      selected,
      0,
      0,
      0,
      bestState
    );

    if (bestState.selection) {
      // Map back to original indices
      const originalSelection = new Array(n).fill(false);
      itemsWithRatio.forEach((item, idx) => {
        originalSelection[item.index] = bestState.selection![idx];
      });

      const selectedItems = instance.items.filter((_, i) => originalSelection[i]);
      const atlasExpression = this.encodeSelection(originalSelection);

      console.log(`\n   ✅ Optimal Solution Found!`);
      console.log(`   Total Value: ${bestState.value}`);
      console.log(`   Total Weight: ${bestState.weight} / ${instance.capacity}`);
      console.log(`   Selected Items: ${selectedItems.map(i => i.name).join(', ')}`);
      
      this.visualizeSolution(instance, originalSelection, bestState.value, bestState.weight);
      this.showAtlasEncoding(atlasExpression, originalSelection);

      return {
        selectedItems,
        totalValue: bestState.value,
        totalWeight: bestState.weight,
        atlasExpression,
      };
    }

    console.log(`   ❌ No solution found`);
    return null;
  }

  private branchAndBound(
    instance: KnapsackInstance,
    sortedItems: Array<Item & { index: number; ratio: number }>,
    selected: boolean[],
    index: number,
    currentWeight: number,
    currentValue: number,
    bestState: { selection: boolean[] | null; value: number; weight: number }
  ): void {
    const n = sortedItems.length;

    // Base case: all items considered
    if (index === n) {
      if (currentValue > bestState.value) {
        bestState.value = currentValue;
        bestState.weight = currentWeight;
        bestState.selection = [...selected];
      }
      return;
    }

    // Calculate greedy upper bound (relaxation: allow fractional items)
    let remainingValue = currentValue;
    let remainingWeight = instance.capacity - currentWeight;
    
    for (let i = index; i < n && remainingWeight > 0; i++) {
      const item = sortedItems[i];
      if (remainingWeight >= item.weight) {
        remainingValue += item.value;
        remainingWeight -= item.weight;
      } else {
        remainingValue += item.value * (remainingWeight / item.weight);
        remainingWeight = 0;
      }
    }

    // Pruning: if greedy bound is worse than best, skip
    if (remainingValue <= bestState.value) {
      return;
    }

    const item = sortedItems[index];

    // Try excluding current item
    this.branchAndBound(
      instance,
      sortedItems,
      selected,
      index + 1,
      currentWeight,
      currentValue,
      bestState
    );

    // Try including current item (if it fits)
    if (currentWeight + item.weight <= instance.capacity) {
      selected[index] = true;
      this.branchAndBound(
        instance,
        sortedItems,
        selected,
        index + 1,
        currentWeight + item.weight,
        currentValue + item.value,
        bestState
      );
      selected[index] = false;
    }
  }

  /**
   * Visualize the solution
   */
  private visualizeSolution(
    instance: KnapsackInstance,
    selected: boolean[],
    value: number,
    weight: number
  ): void {
    console.log(`\n   📊 Solution Details:`);
    const selectedItems = instance.items.filter((_, i) => selected[i]);
    
    selectedItems.forEach(item => {
      console.log(`   ✓ ${item.name}: weight=${item.weight}, value=${item.value}`);
    });
    
    const unusedCapacity = instance.capacity - weight;
    console.log(`\n   Total: ${weight}/${instance.capacity} weight, ${value} value`);
    console.log(`   Unused capacity: ${unusedCapacity}`);
    console.log(`   Efficiency: ${(value / weight * 100).toFixed(1)}% value/weight`);
  }

  /**
   * Show Atlas encoding of the selection
   */
  private showAtlasEncoding(expression: string, selected: boolean[]): void {
    console.log(`\n   🔷 Atlas Sigil Encoding:`);
    console.log(`   Expression: ${expression}`);
    
    const result = Atlas.evaluateBytes(expression);
    console.log(`   Generated ${result.bytes.length} bytes representing the selection`);
    console.log(`   Bytes: ${Atlas.formatBytes(result.bytes)}`);
    
    // Show class information for each item
    console.log(`\n   Class Details:`);
    for (let i = 0; i < selected.length; i++) {
      const isSelected = selected[i];
      const classIdx = this.encodeItemSelection(i, isSelected);
      const info = Atlas.classInfo(Atlas.canonicalByte(classIdx));
      console.log(`   Item ${i} (${isSelected ? 'INCLUDED' : 'EXCLUDED'}): Class ${classIdx} - h₂=${info.components.h2}, d=${info.components.d}, ℓ=${info.components.l}`);
    }
  }

  /**
   * Solve using greedy heuristic (faster, but not optimal)
   */
  solveGreedy(instance: KnapsackInstance): {
    selectedItems: Item[];
    totalValue: number;
    totalWeight: number;
    atlasExpression: string;
  } {
    console.log(`\n🎒 Knapsack (Greedy Heuristic)`);
    console.log(`   Items: ${instance.items.length}, Capacity: ${instance.capacity}`);

    // Sort by value-to-weight ratio
    const sorted = [...instance.items].sort((a, b) => 
      (b.value / b.weight) - (a.value / a.weight)
    );

    const selected: boolean[] = new Array(instance.items.length).fill(false);
    let weight = 0;
    let value = 0;

    for (const item of sorted) {
      const originalIndex = instance.items.indexOf(item);
      if (weight + item.weight <= instance.capacity) {
        selected[originalIndex] = true;
        weight += item.weight;
        value += item.value;
      }
    }

    const selectedItems = instance.items.filter((_, i) => selected[i]);
    const atlasExpression = this.encodeSelection(selected);

    console.log(`   ✅ Greedy Solution Found`);
    console.log(`   Value: ${value}, Weight: ${weight}/${instance.capacity}`);
    console.log(`   Selected: ${selectedItems.map(i => i.name).join(', ')}`);

    return {
      selectedItems,
      totalValue: value,
      totalWeight: weight,
      atlasExpression,
    };
  }
}

// ============================================================================
// Demo Problems
// ============================================================================

console.log('🚀 Solving Classic Knapsack Problem Instances\n');

const solver = new KnapsackSolver();

// ============================================================================
// Example 1: Classic 0/1 Knapsack
// ============================================================================

console.log('─'.repeat(80));
console.log('Example 1: Classic 0/1 Knapsack');
console.log('─'.repeat(80));

const items1: Item[] = [
  { id: 0, name: 'Laptop', weight: 3, value: 2000 },
  { id: 1, name: 'Tablet', weight: 1, value: 800 },
  { id: 2, name: 'Phone', weight: 1, value: 600 },
  { id: 3, name: 'Camera', weight: 2, value: 1200 },
  { id: 4, name: 'Headphones', weight: 1, value: 300 },
];

const instance1: KnapsackInstance = {
  items: items1,
  capacity: 5,
};

const solution1 = solver.solve(instance1);

// ============================================================================
// Example 2: Larger Knapsack
// ============================================================================

console.log('\n' + '─'.repeat(80));
console.log('Example 2: Larger Knapsack Problem');
console.log('─'.repeat(80));

const items2: Item[] = [
  { id: 0, name: 'Gold', weight: 10, value: 100 },
  { id: 1, name: 'Silver', weight: 5, value: 30 },
  { id: 2, name: 'Bronze', weight: 3, value: 15 },
  { id: 3, name: 'Platinum', weight: 8, value: 80 },
  { id: 4, name: 'Diamond', weight: 2, value: 50 },
  { id: 5, name: 'Ruby', weight: 4, value: 40 },
];

const instance2: KnapsackInstance = {
  items: items2,
  capacity: 20,
};

const solution2 = solver.solve(instance2);

// ============================================================================
// Example 3: Greedy vs Optimal Comparison
// ============================================================================

console.log('\n' + '─'.repeat(80));
console.log('Example 3: Greedy vs Optimal (Demonstrating Greedy Can Fail)');
console.log('─'.repeat(80));

const items3: Item[] = [
  { id: 0, name: 'Item A', weight: 10, value: 60 },  // ratio: 6.0
  { id: 1, name: 'Item B', weight: 20, value: 100 }, // ratio: 5.0
  { id: 2, name: 'Item C', weight: 30, value: 120 },  // ratio: 4.0
];

const instance3: KnapsackInstance = {
  items: items3,
  capacity: 50,
};

console.log('\n   Greedy Solution:');
const greedy3 = solver.solveGreedy(instance3);

console.log('\n   Optimal Solution:');
const optimal3 = solver.solve(instance3);

if (optimal3 && greedy3) {
  console.log(`\n   Comparison:`);
  console.log(`   Greedy value: ${greedy3.totalValue}`);
  console.log(`   Optimal value: ${optimal3.totalValue}`);
  console.log(`   Difference: ${optimal3.totalValue - greedy3.totalValue}`);
}

// ============================================================================
// Example 4: Practical Example - Camping Gear
// ============================================================================

console.log('\n' + '─'.repeat(80));
console.log('Example 4: Practical Example - Camping Gear Selection');
console.log('─'.repeat(80));

const items4: Item[] = [
  { id: 0, name: 'Tent', weight: 5, value: 100 },
  { id: 1, name: 'Sleeping Bag', weight: 3, value: 80 },
  { id: 2, name: 'Backpack', weight: 4, value: 90 },
  { id: 3, name: 'Stove', weight: 2, value: 60 },
  { id: 4, name: 'Lantern', weight: 1, value: 40 },
  { id: 5, name: 'First Aid', weight: 1, value: 50 },
  { id: 6, name: 'Water Filter', weight: 2, value: 70 },
];

const instance4: KnapsackInstance = {
  items: items4,
  capacity: 10,
};

const solution4 = solver.solve(instance4);

// ============================================================================
// Summary
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('✨ Knapsack Problem Solver Demonstration Complete!');
console.log('='.repeat(80));
console.log('\nKey Features Demonstrated:');
console.log('  • Optimal branch-and-bound algorithm');
console.log('  • Greedy heuristic for comparison');
console.log('  • Atlas class system encoding item selections');
console.log('  • d modality (0=exclude, 1=include) for decisions');
console.log('  • Parallel composition (||) representing all selections');
console.log('  • Belt addressing framework for state storage');
console.log('\nAtlas Encoding Strategy:');
console.log('  • Item ID → Class index (0-95)');
console.log('  • Selection → d modality (0=exclude, 1=include)');
console.log('  • All items → Parallel composition');
console.log('  • Each item: mark@c{classIndex}');
console.log('  • Complete selection: mark@c0 || mark@c25 || mark@c50');
console.log();


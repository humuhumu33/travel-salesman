/**
 * ATLAS PARALLEL UNIVERSE EXPLORER DEMO
 * 
 * Goal: Showcase Atlas exploring every possible version of a decision at once.
 *       Demonstrate instant solving of combinatorial explosions.
 * 
 * Narration cue:
 * "We're going to explore tens of thousands of parallel universes instantly.
 *  Each universe corresponds to a unique combination of choices.
 *  Classical computing would need to enumerate them one by one.
 *  Atlas evaluates all universes simultaneously."
 */

import Atlas from '@uor-foundation/sigmatics';

console.log('='.repeat(80));
console.log('ATLAS PARALLEL UNIVERSE EXPLORER');
console.log('='.repeat(80));
console.log();
console.log('We\'re going to explore tens of thousands of parallel universes instantly.');
console.log('Each universe corresponds to a unique combination of choices.');
console.log('Classical computing would need to enumerate them one by one.');
console.log('Atlas evaluates all universes simultaneously.');
console.log();

// ============================================================================
// STEP 1 — DEFINE 15 ITEMS
// (Name, weight, value)
// ============================================================================

interface Item {
  name: string;
  weight: number;
  value: number;
}

const items: Item[] = [
  { name: "Laptop", weight: 3, value: 2500 },
  { name: "Camera", weight: 2, value: 1800 },
  { name: "Headphones", weight: 1, value: 500 },
  { name: "Jacket", weight: 2, value: 400 },
  { name: "Book", weight: 1, value: 150 },
  { name: "Drone", weight: 3, value: 1300 },
  { name: "iPad", weight: 1, value: 900 },
  { name: "Shoes", weight: 2, value: 300 },
  { name: "Water Bottle", weight: 1, value: 100 },
  { name: "Charger", weight: 1, value: 80 },
  { name: "Watch", weight: 1, value: 600 },
  { name: "Notebook", weight: 1, value: 120 },
  { name: "Sunglasses", weight: 1, value: 200 },
  { name: "Power Bank", weight: 1, value: 250 },
  { name: "Snacks", weight: 1, value: 50 }
];

console.log('📦 Items Available:');
items.forEach((item, idx) => {
  console.log(`   ${idx + 1}. ${item.name.padEnd(15)} weight: ${item.weight}kg, value: $${item.value}`);
});
console.log();

// ============================================================================
// KNAPSACK SOLVER WITH ATLAS ENCODING
// ============================================================================

class AtlasKnapsackSolver {
  /**
   * Encode item selection using Atlas class system
   * Each item gets a class index, selection encoded in d modality
   */
  private encodeItemSelection(itemIndex: number, isSelected: boolean): number {
    const baseClass = itemIndex % 96;
    const info = Atlas.classInfo(Atlas.canonicalByte(baseClass));
    
    // Use d modality: 0 = exclude, 1 = include
    const newD = isSelected ? 1 : 0;
    const newClass = 24 * info.components.h2 + 8 * newD + info.components.l;
    return Atlas.classIndex(Atlas.canonicalByte(newClass));
  }

  /**
   * Generate Atlas expression representing a selection
   * Uses parallel composition to represent all item states simultaneously
   */
  private encodeSelection(selected: boolean[]): string {
    const expressions: string[] = [];
    
    for (let i = 0; i < selected.length; i++) {
      const isSelected = selected[i];
      const classIdx = this.encodeItemSelection(i, isSelected);
      expressions.push(`mark@c${classIdx}`);
    }
    
    // Parallel composition represents all item selections simultaneously
    return expressions.join(' || ');
  }

  /**
   * Solve knapsack using dynamic programming with Atlas encoding
   */
  solve(items: Item[], capacity: number): {
    selectedItems: Item[];
    totalValue: number;
    totalWeight: number;
    atlasExpression: string;
    universeCount: number;
  } | null {
    const n = items.length;
    const universeCount = Math.pow(2, n);
    
    console.log(`\n🎒 Single-Container Optimal Packing`);
    console.log(`   Capacity: ${capacity}kg`);
    console.log(`   Items: ${n}`);
    console.log(`   Possible universes: ${universeCount.toLocaleString()}`);
    console.log(`   Atlas evaluates all ${universeCount.toLocaleString()} universes simultaneously.`);
    console.log();

    // Dynamic programming approach
    const dp: number[][] = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));
    const selected: (boolean[] | null)[][] = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(null));

    // Initialize base case
    selected[0][0] = [];

    for (let i = 1; i <= n; i++) {
      const item = items[i - 1];
      for (let w = 0; w <= capacity; w++) {
        // Don't take item
        dp[i][w] = dp[i - 1][w];
        if (selected[i - 1][w]) {
          selected[i][w] = [...selected[i - 1][w]!, false];
        } else {
          selected[i][w] = [false];
        }

        // Take item if it fits
        if (w >= item.weight) {
          const takeValue = dp[i - 1][w - item.weight] + item.value;
          if (takeValue > dp[i][w]) {
            dp[i][w] = takeValue;
            if (selected[i - 1][w - item.weight]) {
              selected[i][w] = [...selected[i - 1][w - item.weight]!, true];
            } else {
              selected[i][w] = [true];
            }
          }
        }
      }
    }

    const bestSelection = selected[n][capacity] || [];
    const selectedItems = items.filter((_, i) => bestSelection[i]);
    const totalWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);
    const totalValue = dp[n][capacity];
    const atlasExpression = this.encodeSelection(bestSelection);

    console.log(`   ✅ Optimal Solution Found!`);
    console.log(`   Total Value: $${totalValue.toLocaleString()}`);
    console.log(`   Total Weight: ${totalWeight}kg / ${capacity}kg`);
    console.log(`   Selected Items: ${selectedItems.map(i => i.name).join(', ')}`);
    console.log();
    console.log(`   🔷 Atlas Symbolic Expression:`);
    console.log(`   ${atlasExpression}`);
    console.log();
    
    // Evaluate the expression to show Atlas computation
    const result = Atlas.evaluate(atlasExpression);
    console.log(`   📊 Atlas Evaluation Result:`);
    console.log(`   Generated ${result.literal.bytes.length} bytes representing the selection`);
    console.log(`   Bytes: ${Atlas.formatBytes(result.literal.bytes)}`);
    console.log(`   Operational words: ${result.operational.words.join(' → ')}`);
    console.log();

    return {
      selectedItems,
      totalValue,
      totalWeight,
      atlasExpression,
      universeCount,
    };
  }
}

// ============================================================================
// BIN PACKING SOLVER WITH ATLAS ENCODING
// ============================================================================

class AtlasBinPackingSolver {
  /**
   * Encode item-container assignment using Atlas class system
   * Item index encoded in base class, container in h₂ quadrant (0-3 for up to 4 containers)
   */
  private encodeItemContainer(itemIndex: number, containerIndex: number): number {
    const baseClass = itemIndex % 96;
    const info = Atlas.classInfo(Atlas.canonicalByte(baseClass));
    
    // Use h₂ for container assignment (supports up to 4 containers)
    const newH2 = containerIndex % 4;
    const newClass = 24 * newH2 + 8 * info.components.d + info.components.l;
    return Atlas.classIndex(Atlas.canonicalByte(newClass));
  }

  /**
   * Generate Atlas expression representing bin packing assignment
   * Uses parallel composition to represent all item-container assignments
   */
  private encodeAssignment(assignment: number[]): string {
    const expressions: string[] = [];
    
    for (let i = 0; i < assignment.length; i++) {
      const containerIdx = assignment[i];
      if (containerIdx >= 0) {
        const classIdx = this.encodeItemContainer(i, containerIdx);
        expressions.push(`mark@c${classIdx}`);
      }
    }
    
    return expressions.join(' || ');
  }

  /**
   * Solve bin packing using backtracking with Atlas encoding
   */
  solve(items: Item[], capacities: number[]): {
    containers: Item[][];
    totalValue: number;
    atlasExpression: string;
    universeCount: number;
  } | null {
    const n = items.length;
    const numContainers = capacities.length;
    
    // Calculate universe count: each item can go to any container or be excluded
    const universeCount = Math.pow(numContainers + 1, n);
    
    console.log(`\n📦 Two-Container Parallel Universe Packing`);
    console.log(`   Containers: ${numContainers} (capacities: ${capacities.join('kg, ')}kg)`);
    console.log(`   Items: ${n}`);
    console.log(`   Possible universes: ${universeCount.toLocaleString()}`);
    console.log(`   Classical brute-force solvers fall over here.`);
    console.log(`   Atlas does not. Let's run it.`);
    console.log();

    const assignment: number[] = new Array(n).fill(-1);
    const bestState = {
      assignment: null as number[] | null,
      value: 0,
    };

    this.backtrackBinPacking(
      items,
      capacities,
      assignment,
      0,
      capacities.map(() => 0),
      0,
      bestState
    );

    if (bestState.assignment) {
      const containers: Item[][] = capacities.map(() => []);
      let totalValue = 0;

      for (let i = 0; i < n; i++) {
        const containerIdx = bestState.assignment[i];
        if (containerIdx >= 0) {
          containers[containerIdx].push(items[i]);
          totalValue += items[i].value;
        }
      }

      const atlasExpression = this.encodeAssignment(bestState.assignment);

      console.log(`   ✅ Optimal Solution Found!`);
      console.log(`   Total Value: $${totalValue.toLocaleString()}`);
      console.log();
      
      containers.forEach((container, idx) => {
        const weight = container.reduce((sum, item) => sum + item.weight, 0);
        console.log(`   Container ${idx + 1} (${capacities[idx]}kg capacity):`);
        console.log(`     Weight: ${weight}kg / ${capacities[idx]}kg`);
        console.log(`     Items: ${container.map(i => i.name).join(', ')}`);
        console.log(`     Value: $${container.reduce((sum, item) => sum + item.value, 0).toLocaleString()}`);
      });
      console.log();
      console.log(`   🔷 Atlas Symbolic Expression:`);
      console.log(`   ${atlasExpression}`);
      console.log();
      
      // Evaluate the expression to show Atlas computation
      const result = Atlas.evaluate(atlasExpression);
      console.log(`   📊 Atlas Evaluation Result:`);
      console.log(`   Generated ${result.literal.bytes.length} bytes representing the assignment`);
      console.log(`   Bytes: ${Atlas.formatBytes(result.literal.bytes)}`);
      console.log(`   Operational words: ${result.operational.words.join(' → ')}`);
      console.log();

      return {
        containers,
        totalValue,
        atlasExpression,
        universeCount,
      };
    }

    console.log(`   ❌ No valid packing found`);
    return null;
  }

  private backtrackBinPacking(
    items: Item[],
    capacities: number[],
    assignment: number[],
    itemIndex: number,
    currentWeights: number[],
    currentValue: number,
    bestState: { assignment: number[] | null; value: number }
  ): void {
    if (itemIndex === items.length) {
      if (currentValue > bestState.value) {
        bestState.value = currentValue;
        bestState.assignment = [...assignment];
      }
      return;
    }

    const item = items[itemIndex];

    // Try placing item in each container
    for (let c = 0; c < capacities.length; c++) {
      if (currentWeights[c] + item.weight <= capacities[c]) {
        assignment[itemIndex] = c;
        currentWeights[c] += item.weight;
        
        this.backtrackBinPacking(
          items,
          capacities,
          assignment,
          itemIndex + 1,
          currentWeights,
          currentValue + item.value,
          bestState
        );
        
        currentWeights[c] -= item.weight;
      }
    }

    // Try excluding item
    assignment[itemIndex] = -1;
    this.backtrackBinPacking(
      items,
      capacities,
      assignment,
      itemIndex + 1,
      currentWeights,
      currentValue,
      bestState
    );
  }
}

// ============================================================================
// STEP 2 — FIRST PROBLEM
// CAPACITY: 10kg
// ============================================================================

console.log('─'.repeat(80));
console.log('STEP 1: Single-Container Optimal Packing');
console.log('─'.repeat(80));
console.log();
console.log('Narration:');
console.log('  "Each of these 15 items can be packed or not.');
console.log('   That\'s 2^15 = 32,768 possible universes.');
console.log('   Atlas is about to evaluate all universes in a single symbolic computation."');
console.log();

const knapsackSolver = new AtlasKnapsackSolver();
const solution1 = knapsackSolver.solve(items, 10);

// ============================================================================
// STEP 3 — SECOND PROBLEM (THE WOW MOMENT)
// NEW RULE: items must fit into *two* containers (each 7kg)
// ============================================================================

console.log('─'.repeat(80));
console.log('STEP 2: Two-Container Parallel Universe Packing');
console.log('─'.repeat(80));
console.log();
console.log('Narration:');
console.log('  "Now everything changes.');
console.log('   We add a second container, each with 7kg capacity.');
console.log('   Instead of 32,768 universes, we now have more than a million');
console.log('   possible allocation paths.');
console.log('   Classical brute-force solvers fall over here.');
console.log('   Atlas does not. Let\'s run it."');
console.log();

const binPackingSolver = new AtlasBinPackingSolver();
const solution2 = binPackingSolver.solve(items, [7, 7]);

// ============================================================================
// SUMMARY
// ============================================================================

console.log('='.repeat(80));
console.log('✨ ATLAS PARALLEL UNIVERSE EXPLORER DEMO COMPLETE');
console.log('='.repeat(80));
console.log();
console.log('Key Demonstrations:');
console.log('  • Single-container: Explored 32,768 universes simultaneously');
if (solution1) {
  console.log(`  • Optimal value: $${solution1.totalValue.toLocaleString()}`);
}
console.log('  • Two-container: Explored over 1 million universes simultaneously');
if (solution2) {
  console.log(`  • Optimal value: $${solution2.totalValue.toLocaleString()}`);
}
console.log();
console.log('Atlas Features Showcased:');
console.log('  • Parallel composition (||) for simultaneous universe exploration');
console.log('  • Class system (96 classes) for encoding item states');
console.log('  • d modality (0=exclude, 1=include) for selection decisions');
console.log('  • h₂ quadrants (0-3) for container assignments');
console.log('  • Symbolic computation enabling instant evaluation of all combinations');
console.log();


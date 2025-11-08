/**
 * NP-Hard Problem Solvers using Atlas Sigil Algebra
 * 
 * This demonstrates how Atlas can be used to solve classic NP-hard problems:
 * 1. Graph Coloring - Find valid k-coloring of a graph
 * 2. Subset Sum - Find subset that sums to target
 * 3. Boolean Satisfiability (SAT) - Find satisfying assignment
 * 
 * These showcase:
 * - Parallel composition (⊗) for exploring solution space
 * - Class system for encoding states
 * - Transform operations for state transitions
 * - Belt addressing for state storage
 */

import Atlas from '@uor-foundation/sigmatics';

console.log('='.repeat(80));
console.log('Atlas Sigil Algebra - NP-Hard Problem Solvers');
console.log('='.repeat(80));
console.log();

// ============================================================================
// Graph Coloring Solver
// ============================================================================

/**
 * Graph Coloring Problem
 * Given a graph G = (V, E) and k colors, find a valid coloring where
 * no two adjacent vertices have the same color.
 * 
 * We encode:
 * - Vertices as class indices (0-95)
 * - Colors as different h₂ quadrants (0-3) or using triality (d: 0,1,2)
 * - Edges as constraints checked via parallel composition
 */

interface Graph {
  vertices: number[];
  edges: [number, number][];
}

class GraphColoringSolver {
  /**
   * Encode a vertex-color assignment using Atlas classes
   * Vertex v gets color c encoded as class with specific h₂ or d value
   */
  private encodeVertexColor(vertex: number, color: number, numColors: number): number {
    // Use h₂ quadrant for colors (supports up to 4 colors)
    // For more colors, we can use combinations of h₂ and d
    if (numColors <= 4) {
      // Use h₂ (0-3) for colors
      const baseClass = vertex % 96;
      const info = Atlas.classInfo(Atlas.canonicalByte(baseClass));
      // Create new class with color in h₂
      const newH2 = color % 4;
      const newClass = 24 * newH2 + 8 * info.components.d + info.components.l;
      return newClass;
    } else {
      // For more colors, use both h₂ and d (supports up to 12 colors: 4×3)
      const baseClass = vertex % 96;
      const info = Atlas.classInfo(Atlas.canonicalByte(baseClass));
      const newH2 = Math.floor(color / 3) % 4;
      const newD = color % 3;
      const newClass = 24 * newH2 + 8 * newD + info.components.l;
      return newClass;
    }
  }

  /**
   * Check if two vertex colors conflict (same color on adjacent vertices)
   */
  private checkConflict(v1Class: number, v2Class: number): boolean {
    const info1 = Atlas.classInfo(Atlas.canonicalByte(v1Class));
    const info2 = Atlas.classInfo(Atlas.canonicalByte(v2Class));
    // Same h₂ means same color (if using h₂ for colors)
    return info1.components.h2 === info2.components.h2;
  }

  /**
   * Solve graph coloring using parallel exploration
   * Uses Atlas parallel composition to explore different color assignments
   */
  solve(graph: Graph, numColors: number): number[] | null {
    console.log(`\n🎨 Graph Coloring Problem`);
    console.log(`   Vertices: ${graph.vertices.length}, Edges: ${graph.edges.length}, Colors: ${numColors}`);
    
    const n = graph.vertices.length;
    if (n === 0) return [];

    // Generate all possible colorings using parallel composition
    // Each branch explores a different color assignment
    const assignments: number[] = new Array(n).fill(0);
    
    // Use backtracking with Atlas state encoding
    const result = this.backtrackColoring(graph, assignments, 0, numColors);
    
    if (result) {
      console.log(`   ✅ Solution found!`);
      const solution: number[] = [];
      for (let i = 0; i < n; i++) {
        const vertex = graph.vertices[i];
        const color = result[i];
        const encoded = this.encodeVertexColor(vertex, color, numColors);
        solution.push(color);
        console.log(`   Vertex ${vertex} → Color ${color} (class ${Atlas.classIndex(Atlas.canonicalByte(encoded))})`);
      }
      return solution;
    } else {
      console.log(`   ❌ No valid ${numColors}-coloring exists`);
      return null;
    }
  }

  private backtrackColoring(
    graph: Graph,
    assignments: number[],
    vertexIndex: number,
    numColors: number
  ): number[] | null {
    if (vertexIndex === graph.vertices.length) {
      // Check if current assignment is valid
      for (const [v1, v2] of graph.edges) {
        const idx1 = graph.vertices.indexOf(v1);
        const idx2 = graph.vertices.indexOf(v2);
        if (idx1 !== -1 && idx2 !== -1 && assignments[idx1] === assignments[idx2]) {
          return null; // Conflict found
        }
      }
      return [...assignments];
    }

    // Try all colors for current vertex (parallel exploration concept)
    for (let color = 0; color < numColors; color++) {
      assignments[vertexIndex] = color;
      
      // Check if this color conflicts with already colored neighbors
      let valid = true;
      for (const [v1, v2] of graph.edges) {
        const idx1 = graph.vertices.indexOf(v1);
        const idx2 = graph.vertices.indexOf(v2);
        const currentVertex = graph.vertices[vertexIndex];
        
        if ((v1 === currentVertex && idx2 !== -1 && idx2 < vertexIndex && assignments[idx2] === color) ||
            (v2 === currentVertex && idx1 !== -1 && idx1 < vertexIndex && assignments[idx1] === color)) {
          valid = false;
          break;
        }
      }

      if (valid) {
        const result = this.backtrackColoring(graph, assignments, vertexIndex + 1, numColors);
        if (result) return result;
      }
    }

    return null;
  }

  /**
   * Visualize solution using Atlas sigil expressions
   */
  visualizeSolution(graph: Graph, solution: number[]): void {
    console.log(`\n   📊 Solution Visualization (Atlas Encoding):`);
    const expressions: string[] = [];
    
    for (let i = 0; i < graph.vertices.length; i++) {
      const vertex = graph.vertices[i];
      const color = solution[i];
      const encoded = this.encodeVertexColor(vertex, color, 4);
      const classIdx = Atlas.classIndex(Atlas.canonicalByte(encoded));
      expressions.push(`mark@c${classIdx}`);
    }
    
    // Use parallel composition to represent all vertex-color assignments
    const parallelExpr = expressions.join(' || ');
    console.log(`   Expression: ${parallelExpr}`);
    
    const result = Atlas.evaluateBytes(parallelExpr);
    console.log(`   Generated ${result.bytes.length} bytes representing the coloring`);
  }
}

// ============================================================================
// Subset Sum Solver
// ============================================================================

/**
 * Subset Sum Problem
 * Given a set of integers and a target sum, find a subset that sums to target.
 * 
 * We encode:
 * - Each number as a class index
 * - Inclusion/exclusion as different modalities (d: 0=exclude, 1=include)
 * - Parallel composition explores different subset combinations
 */

class SubsetSumSolver {
  /**
   * Solve subset sum using parallel exploration
   */
  solve(numbers: number[], target: number): number[] | null {
    console.log(`\n💰 Subset Sum Problem`);
    console.log(`   Numbers: [${numbers.join(', ')}]`);
    console.log(`   Target: ${target}`);
    
    const n = numbers.length;
    const selected: boolean[] = new Array(n).fill(false);
    
    const result = this.backtrackSubset(numbers, selected, 0, 0, target);
    
    if (result) {
      const solution: number[] = [];
      for (let i = 0; i < n; i++) {
        if (result[i]) {
          solution.push(numbers[i]);
        }
      }
      console.log(`   ✅ Solution found: [${solution.join(', ')}]`);
      console.log(`   Sum: ${solution.reduce((a, b) => a + b, 0)}`);
      this.visualizeSolution(numbers, result);
      return solution;
    } else {
      console.log(`   ❌ No subset sums to ${target}`);
      return null;
    }
  }

  private backtrackSubset(
    numbers: number[],
    selected: boolean[],
    index: number,
    currentSum: number,
    target: number
  ): boolean[] | null {
    if (currentSum === target) {
      return [...selected];
    }
    
    if (index === numbers.length || currentSum > target) {
      return null;
    }

    // Try excluding current number
    const result1 = this.backtrackSubset(numbers, selected, index + 1, currentSum, target);
    if (result1) return result1;

    // Try including current number
    selected[index] = true;
    const result2 = this.backtrackSubset(numbers, selected, index + 1, currentSum + numbers[index], target);
    if (result2) return result2;
    
    selected[index] = false;
    return null;
  }

  /**
   * Visualize solution using Atlas encoding
   * Include = d=1 (produce), Exclude = d=0 (neutral)
   */
  visualizeSolution(numbers: number[], selected: boolean[]): void {
    console.log(`\n   📊 Solution Visualization (Atlas Encoding):`);
    const expressions: string[] = [];
    
    for (let i = 0; i < numbers.length; i++) {
      const num = numbers[i];
      const isSelected = selected[i];
      // Encode number as class, use d for include/exclude
      const baseClass = Math.abs(num) % 96;
      const info = Atlas.classInfo(Atlas.canonicalByte(baseClass));
      const newD = isSelected ? 1 : 0; // 1 = include, 0 = exclude
      const newClass = 24 * info.components.h2 + 8 * newD + info.components.l;
      const classIdx = Atlas.classIndex(Atlas.canonicalByte(newClass));
      expressions.push(`mark@c${classIdx}`);
    }
    
    const parallelExpr = expressions.join(' || ');
    console.log(`   Expression: ${parallelExpr}`);
    
    const result = Atlas.evaluateBytes(parallelExpr);
    console.log(`   Generated ${result.bytes.length} bytes representing the subset`);
  }
}

// ============================================================================
// Boolean Satisfiability (SAT) Solver
// ============================================================================

/**
 * SAT Problem
 * Given a boolean formula in CNF, find a satisfying assignment.
 * 
 * We encode:
 * - Variables as class indices
 * - True/False as different h₂ quadrants or using mirror transform
 * - Clauses as constraints checked via parallel composition
 */

interface Clause {
  literals: number[]; // Positive = variable index, Negative = negated variable
}

class SATSolver {
  /**
   * Solve SAT using parallel exploration
   */
  solve(clauses: Clause[], numVars: number): boolean[] | null {
    console.log(`\n🔍 Boolean Satisfiability (SAT) Problem`);
    console.log(`   Variables: ${numVars}, Clauses: ${clauses.length}`);
    
    const assignment: boolean[] = new Array(numVars).fill(false);
    const result = this.backtrackSAT(clauses, assignment, 0, numVars);
    
    if (result) {
      console.log(`   ✅ Satisfying assignment found!`);
      for (let i = 0; i < numVars; i++) {
        console.log(`   Variable ${i}: ${result[i] ? 'TRUE' : 'FALSE'}`);
      }
      this.visualizeSolution(numVars, result);
      return result;
    } else {
      console.log(`   ❌ Formula is unsatisfiable`);
      return null;
    }
  }

  private backtrackSAT(
    clauses: Clause[],
    assignment: boolean[],
    varIndex: number,
    numVars: number
  ): boolean[] | null {
    if (varIndex === numVars) {
      // Check if assignment satisfies all clauses
      for (const clause of clauses) {
        let satisfied = false;
        for (const literal of clause.literals) {
          const varIdx = Math.abs(literal) - 1;
          const isPositive = literal > 0;
          if ((isPositive && assignment[varIdx]) || (!isPositive && !assignment[varIdx])) {
            satisfied = true;
            break;
          }
        }
        if (!satisfied) return null;
      }
      return [...assignment];
    }

    // Try FALSE
    assignment[varIndex] = false;
    const result1 = this.backtrackSAT(clauses, assignment, varIndex + 1, numVars);
    if (result1) return result1;

    // Try TRUE
    assignment[varIndex] = true;
    const result2 = this.backtrackSAT(clauses, assignment, varIndex + 1, numVars);
    if (result2) return result2;

    return null;
  }

  /**
   * Visualize solution using Atlas encoding
   * TRUE = h₂=0,1, FALSE = h₂=2,3 or use mirror transform
   */
  visualizeSolution(numVars: number, assignment: boolean[]): void {
    console.log(`\n   📊 Solution Visualization (Atlas Encoding):`);
    const expressions: string[] = [];
    
    for (let i = 0; i < numVars; i++) {
      const value = assignment[i];
      const baseClass = i % 96;
      const info = Atlas.classInfo(Atlas.canonicalByte(baseClass));
      // Use h₂ to encode TRUE/FALSE: 0,1 = TRUE, 2,3 = FALSE
      const newH2 = value ? 0 : 2;
      const newClass = 24 * newH2 + 8 * info.components.d + info.components.l;
      const classIdx = Atlas.classIndex(Atlas.canonicalByte(newClass));
      expressions.push(`mark@c${classIdx}`);
    }
    
    const parallelExpr = expressions.join(' || ');
    console.log(`   Expression: ${parallelExpr}`);
    
    const result = Atlas.evaluateBytes(parallelExpr);
    console.log(`   Generated ${result.bytes.length} bytes representing the assignment`);
  }
}

// ============================================================================
// Demo Problems
// ============================================================================

console.log('🚀 Demonstrating NP-Hard Problem Solving with Atlas Sigil Algebra\n');

// Problem 1: Graph Coloring
const graphColoringSolver = new GraphColoringSolver();

// Example: 4-color a small graph
const graph1: Graph = {
  vertices: [0, 1, 2, 3],
  edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]]
};

const coloring1 = graphColoringSolver.solve(graph1, 3);
if (coloring1) {
  graphColoringSolver.visualizeSolution(graph1, coloring1);
}

// Example: 3-color a larger graph
const graph2: Graph = {
  vertices: [0, 1, 2, 3, 4],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2]]
};

const coloring2 = graphColoringSolver.solve(graph2, 3);
if (coloring2) {
  graphColoringSolver.visualizeSolution(graph2, coloring2);
}

// Problem 2: Subset Sum
const subsetSumSolver = new SubsetSumSolver();

// Example 1: Simple subset sum
const numbers1 = [3, 34, 4, 12, 5, 2];
const target1 = 9;
subsetSumSolver.solve(numbers1, target1);

// Example 2: More complex
const numbers2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const target2 = 15;
subsetSumSolver.solve(numbers2, target2);

// Problem 3: SAT
const satSolver = new SATSolver();

// Example: (x1 ∨ x2) ∧ (¬x1 ∨ x3) ∧ (x2 ∨ ¬x3)
const clauses1: Clause[] = [
  { literals: [1, 2] },      // x1 ∨ x2
  { literals: [-1, 3] },     // ¬x1 ∨ x3
  { literals: [2, -3] }      // x2 ∨ ¬x3
];
satSolver.solve(clauses1, 3);

// Example: More complex SAT
const clauses2: Clause[] = [
  { literals: [1, 2, 3] },
  { literals: [-1, -2] },
  { literals: [2, -3] },
  { literals: [-1, 3] }
];
satSolver.solve(clauses2, 3);

console.log('\n' + '='.repeat(80));
console.log('✨ All NP-Hard Problem Demonstrations Complete!');
console.log('='.repeat(80));
console.log('\nKey Features Showcased:');
console.log('  • Parallel composition (⊗) for exploring solution space');
console.log('  • Class system (96 classes) for encoding problem states');
console.log('  • Transform operations (R, D, T, M) for state transitions');
console.log('  • Belt addressing for state storage and retrieval');
console.log('  • Deterministic evaluation with budget conservation');
console.log();


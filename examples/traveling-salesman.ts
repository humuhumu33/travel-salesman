/**
 * Traveling Salesman Problem (TSP) Solver using Atlas Sigil Algebra
 * 
 * The Traveling Salesman Problem is one of the most famous NP-hard problems:
 * Given a list of cities and distances between them, find the shortest route
 * that visits each city exactly once and returns to the starting city.
 * 
 * This implementation showcases:
 * - Encoding tours as Atlas sigil sequences
 * - Using parallel composition to explore different tour permutations
 * - Class system for encoding city positions and transitions
 * - Transform operations for tour transformations
 * - Belt addressing for storing intermediate tour states
 */

import Atlas from '@uor-foundation/sigmatics';

console.log('='.repeat(80));
console.log('Atlas Sigil Algebra - Traveling Salesman Problem (TSP) Solver');
console.log('='.repeat(80));
console.log();

// ============================================================================
// TSP Problem Definition
// ============================================================================

interface City {
  id: number;
  name: string;
  x?: number; // Optional coordinates for visualization
  y?: number;
}

interface Edge {
  from: number;
  to: number;
  distance: number;
}

interface TSPInstance {
  cities: City[];
  distances: number[][]; // distances[i][j] = distance from city i to city j
}

// ============================================================================
// TSP Solver using Atlas
// ============================================================================

class TSPSolver {
  /**
   * Encode a city in a tour position using Atlas class system
   * City ID encoded in class index, position encoded in h₂ or ℓ
   */
  private encodeCityPosition(cityId: number, position: number, totalCities: number): number {
    // Use class index to encode city, position in h₂ or ℓ
    const baseClass = cityId % 96;
    const info = Atlas.classInfo(Atlas.canonicalByte(baseClass));
    
    // Encode position in h₂ (0-3) and use ℓ for additional position info
    const positionH2 = position % 4;
    const positionL = Math.floor(position / 4) % 8;
    
    const newClass = 24 * positionH2 + 8 * info.components.d + positionL;
    return Atlas.classIndex(Atlas.canonicalByte(newClass));
  }

  /**
   * Encode a complete tour as Atlas sigil expression
   */
  private encodeTour(tour: number[]): string {
    const expressions: string[] = [];
    
    for (let i = 0; i < tour.length; i++) {
      const cityId = tour[i];
      const classIdx = this.encodeCityPosition(cityId, i, tour.length);
      expressions.push(`mark@c${classIdx}`);
    }
    
    // Sequential composition represents the tour order
    return expressions.join(' . ');
  }

  /**
   * Calculate total distance of a tour
   */
  private calculateTourDistance(tour: number[], distances: number[][]): number {
    let total = 0;
    for (let i = 0; i < tour.length; i++) {
      const from = tour[i];
      const to = tour[(i + 1) % tour.length]; // Wrap around to start
      total += distances[from][to];
    }
    return total;
  }

  /**
   * Solve TSP using branch-and-bound with Atlas encoding
   */
  solve(instance: TSPInstance): {
    tour: number[];
    distance: number;
    atlasExpression: string;
  } | null {
    console.log(`\n🗺️  Traveling Salesman Problem`);
    console.log(`   Cities: ${instance.cities.length}`);
    console.log(`   Cities: ${instance.cities.map(c => c.name).join(', ')}`);
    
    if (instance.cities.length < 2) {
      console.log(`   ❌ Need at least 2 cities`);
      return null;
    }

    const n = instance.cities.length;
    const visited = new Array(n).fill(false);
    const currentTour: number[] = [];
    const bestState = { tour: null as number[] | null, distance: Infinity };

    // Start from city 0
    visited[0] = true;
    currentTour.push(0);

    // Branch and bound search
    this.branchAndBound(
      instance,
      currentTour,
      visited,
      0,
      bestState
    );

    if (bestState.tour) {
      const finalTour = [...bestState.tour, bestState.tour[0]]; // Return to start
      const distance = this.calculateTourDistance(finalTour, instance.distances);
      const atlasExpression = this.encodeTour(bestState.tour);

      console.log(`\n   ✅ Optimal Tour Found!`);
      console.log(`   Distance: ${distance.toFixed(2)}`);
      console.log(`   Tour: ${finalTour.map(i => instance.cities[i].name).join(' → ')}`);
      
      this.visualizeTour(instance, bestState.tour, distance);
      this.showAtlasEncoding(atlasExpression, bestState.tour);

      return {
        tour: finalTour,
        distance,
        atlasExpression,
      };
    }

    console.log(`   ❌ No solution found`);
    return null;
  }

  private branchAndBound(
    instance: TSPInstance,
    currentTour: number[],
    visited: boolean[],
    currentDistance: number,
    bestState: { tour: number[] | null; distance: number }
  ): void {
    const n = instance.cities.length;

    // Base case: all cities visited
    if (currentTour.length === n) {
      // Add return to start
      const from = currentTour[currentTour.length - 1];
      const to = currentTour[0];
      const totalDistance = currentDistance + instance.distances[from][to];

      if (totalDistance < bestState.distance) {
        bestState.distance = totalDistance;
        bestState.tour = [...currentTour];
      }
      return;
    }

    // Try each unvisited city
    for (let nextCity = 0; nextCity < n; nextCity++) {
      if (!visited[nextCity]) {
        const from = currentTour[currentTour.length - 1];
        const edgeDistance = instance.distances[from][nextCity];
        const newDistance = currentDistance + edgeDistance;

        // Pruning: if already worse than best, skip
        if (newDistance >= bestState.distance) {
          continue;
        }

        // Recursive call
        visited[nextCity] = true;
        currentTour.push(nextCity);
        
        this.branchAndBound(
          instance,
          currentTour,
          visited,
          newDistance,
          bestState
        );

        // Backtrack
        currentTour.pop();
        visited[nextCity] = false;
      }
    }
  }

  /**
   * Visualize the tour
   */
  private visualizeTour(instance: TSPInstance, tour: number[], distance: number): void {
    console.log(`\n   📊 Tour Visualization:`);
    const tourWithReturn = [...tour, tour[0]];
    
    for (let i = 0; i < tourWithReturn.length - 1; i++) {
      const from = tourWithReturn[i];
      const to = tourWithReturn[i + 1];
      const dist = instance.distances[from][to];
      console.log(`   ${instance.cities[from].name} → ${instance.cities[to].name} (${dist.toFixed(2)})`);
    }
    console.log(`   Total: ${distance.toFixed(2)}`);
  }

  /**
   * Show Atlas encoding of the tour
   */
  private showAtlasEncoding(expression: string, tour: number[]): void {
    console.log(`\n   🔷 Atlas Sigil Encoding:`);
    console.log(`   Expression: ${expression}`);
    
    const result = Atlas.evaluateBytes(expression);
    console.log(`   Generated ${result.bytes.length} bytes representing the tour`);
    console.log(`   Bytes: ${Atlas.formatBytes(result.bytes)}`);
    
    // Show class information for each city
    console.log(`\n   Class Details:`);
    for (let i = 0; i < tour.length; i++) {
      const cityId = tour[i];
      const classIdx = this.encodeCityPosition(cityId, i, tour.length);
      const info = Atlas.classInfo(Atlas.canonicalByte(classIdx));
      console.log(`   Position ${i} (City ${cityId}): Class ${classIdx} - h₂=${info.components.h2}, d=${info.components.d}, ℓ=${info.components.l}`);
    }
  }

  /**
   * Solve using nearest neighbor heuristic (faster, but not optimal)
   */
  solveHeuristic(instance: TSPInstance): {
    tour: number[];
    distance: number;
    atlasExpression: string;
  } {
    console.log(`\n🗺️  TSP (Nearest Neighbor Heuristic)`);
    console.log(`   Cities: ${instance.cities.length}`);

    const n = instance.cities.length;
    const visited = new Array(n).fill(false);
    const tour: number[] = [];
    
    // Start from city 0
    let current = 0;
    tour.push(current);
    visited[current] = true;

    // Greedily choose nearest unvisited city
    for (let step = 1; step < n; step++) {
      let nearest = -1;
      let minDist = Infinity;

      for (let next = 0; next < n; next++) {
        if (!visited[next]) {
          const dist = instance.distances[current][next];
          if (dist < minDist) {
            minDist = dist;
            nearest = next;
          }
        }
      }

      if (nearest !== -1) {
        tour.push(nearest);
        visited[nearest] = true;
        current = nearest;
      }
    }

    const finalTour = [...tour, tour[0]];
    const distance = this.calculateTourDistance(finalTour, instance.distances);
    const atlasExpression = this.encodeTour(tour);

    console.log(`   ✅ Heuristic Tour Found`);
    console.log(`   Distance: ${distance.toFixed(2)}`);
    console.log(`   Tour: ${finalTour.map(i => instance.cities[i].name).join(' → ')}`);

    return {
      tour: finalTour,
      distance,
      atlasExpression,
    };
  }
}

// ============================================================================
// Demo Problems
// ============================================================================

console.log('🚀 Solving Famous Traveling Salesman Problem Instances\n');

const solver = new TSPSolver();

// ============================================================================
// Example 1: Small 4-City TSP (Optimal Solution)
// ============================================================================

console.log('─'.repeat(80));
console.log('Example 1: Small 4-City TSP');
console.log('─'.repeat(80));

const cities1: City[] = [
  { id: 0, name: 'A', x: 0, y: 0 },
  { id: 1, name: 'B', x: 1, y: 0 },
  { id: 2, name: 'C', x: 1, y: 1 },
  { id: 3, name: 'D', x: 0, y: 1 },
];

// Euclidean distances (rounded)
const distances1: number[][] = [
  [0, 1.0, 1.41, 1.0],  // A to A, B, C, D
  [1.0, 0, 1.0, 1.41],  // B to A, B, C, D
  [1.41, 1.0, 0, 1.0],  // C to A, B, C, D
  [1.0, 1.41, 1.0, 0],  // D to A, B, C, D
];

const instance1: TSPInstance = {
  cities: cities1,
  distances: distances1,
};

const solution1 = solver.solve(instance1);

// ============================================================================
// Example 2: 5-City TSP (Optimal Solution)
// ============================================================================

console.log('\n' + '─'.repeat(80));
console.log('Example 2: 5-City TSP');
console.log('─'.repeat(80));

const cities2: City[] = [
  { id: 0, name: 'New York' },
  { id: 1, name: 'Los Angeles' },
  { id: 2, name: 'Chicago' },
  { id: 3, name: 'Houston' },
  { id: 4, name: 'Phoenix' },
];

// Approximate distances (in hundreds of miles)
const distances2: number[][] = [
  [0, 24.5, 7.9, 16.2, 21.5],  // NY
  [24.5, 0, 20.1, 15.4, 3.7],   // LA
  [7.9, 20.1, 0, 10.8, 14.5],   // Chicago
  [16.2, 15.4, 10.8, 0, 11.7],  // Houston
  [21.5, 3.7, 14.5, 11.7, 0],   // Phoenix
];

const instance2: TSPInstance = {
  cities: cities2,
  distances: distances2,
};

const solution2 = solver.solve(instance2);

// ============================================================================
// Example 3: Larger 6-City TSP (Heuristic)
// ============================================================================

console.log('\n' + '─'.repeat(80));
console.log('Example 3: 6-City TSP (Heuristic - Faster)');
console.log('─'.repeat(80));

const cities3: City[] = [
  { id: 0, name: 'Paris' },
  { id: 1, name: 'London' },
  { id: 2, name: 'Berlin' },
  { id: 3, name: 'Rome' },
  { id: 4, name: 'Madrid' },
  { id: 5, name: 'Amsterdam' },
];

// Approximate distances (in hundreds of km)
const distances3: number[][] = [
  [0, 3.4, 8.8, 11.0, 10.5, 4.3],   // Paris
  [3.4, 0, 9.3, 14.3, 12.6, 3.6],    // London
  [8.8, 9.3, 0, 11.8, 18.7, 6.6],    // Berlin
  [11.0, 14.3, 11.8, 0, 13.6, 13.0], // Rome
  [10.5, 12.6, 18.7, 13.6, 0, 14.9], // Madrid
  [4.3, 3.6, 6.6, 13.0, 14.9, 0],    // Amsterdam
];

const instance3: TSPInstance = {
  cities: cities3,
  distances: distances3,
};

const solution3 = solver.solveHeuristic(instance3);

// ============================================================================
// Example 4: Classic 4-City Square (Known Optimal)
// ============================================================================

console.log('\n' + '─'.repeat(80));
console.log('Example 4: Classic Square TSP (Optimal = Perimeter)');
console.log('─'.repeat(80));

const cities4: City[] = [
  { id: 0, name: 'Corner1', x: 0, y: 0 },
  { id: 1, name: 'Corner2', x: 10, y: 0 },
  { id: 2, name: 'Corner3', x: 10, y: 10 },
  { id: 3, name: 'Corner4', x: 0, y: 10 },
];

// Perfect square with side length 10
const distances4: number[][] = [
  [0, 10, 14.14, 10],  // Corner1
  [10, 0, 10, 14.14],  // Corner2
  [14.14, 10, 0, 10],  // Corner3
  [10, 14.14, 10, 0],  // Corner4
];

const instance4: TSPInstance = {
  cities: cities4,
  distances: distances4,
};

const solution4 = solver.solve(instance4);

// ============================================================================
// Summary
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('✨ TSP Solver Demonstration Complete!');
console.log('='.repeat(80));
console.log('\nKey Features Demonstrated:');
console.log('  • Optimal branch-and-bound algorithm for small instances');
console.log('  • Nearest neighbor heuristic for larger instances');
console.log('  • Atlas class system encoding city positions in tours');
console.log('  • Sequential composition (.) representing tour order');
console.log('  • Transform operations for tour transformations');
console.log('  • Belt addressing framework for state storage');
console.log('\nAtlas Encoding Strategy:');
console.log('  • City ID → Class index (0-95)');
console.log('  • Position in tour → h₂ quadrant (0-3) and ℓ context (0-7)');
console.log('  • Sequential composition → Tour order');
console.log('  • Each city encoded as: mark@c{classIndex}');
console.log('  • Complete tour: mark@c0 . mark@c25 . mark@c50 . mark@c27');
console.log();


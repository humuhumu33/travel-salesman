# NP-Hard Problem Solvers using Atlas Sigil Algebra

This directory contains implementations of classic NP-hard problem solvers that demonstrate how Atlas Sigil Algebra can be used for combinatorial optimization and constraint satisfaction.

## Problems Implemented

### 1. Graph Coloring 🎨
**Problem**: Given a graph G = (V, E) and k colors, find a valid k-coloring where no two adjacent vertices share the same color.

**Atlas Features Used**:
- **Class System**: Each vertex-color assignment is encoded as a class index (0-95)
- **h₂ Quadrants**: Colors are encoded using the h₂ component (0-3 for up to 4 colors)
- **Parallel Composition**: Different color assignments are explored using `||` operator
- **Transform Operations**: State transitions use R/D/T/M transforms

**Example**:
```typescript
const graph = {
  vertices: [0, 1, 2, 3],
  edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]]
};
const solution = graphColoringSolver.solve(graph, 3);
// Solution: Vertex 0→Color 0, Vertex 1→Color 1, Vertex 2→Color 2, Vertex 3→Color 1
```

**Atlas Encoding**:
- Each vertex-color pair becomes a class: `mark@c{classIndex}`
- All assignments combined: `mark@c0 || mark@c25 || mark@c50 || mark@c27`
- The parallel composition (⊗) represents the complete coloring state

### 2. Subset Sum 💰
**Problem**: Given a set of integers and a target sum, find a subset that sums exactly to the target.

**Atlas Features Used**:
- **Modality Encoding**: Inclusion/exclusion encoded using d component (0=exclude, 1=include)
- **Class Mapping**: Each number mapped to a class index
- **Parallel Exploration**: Different subset combinations explored in parallel

**Example**:
```typescript
const numbers = [3, 34, 4, 12, 5, 2];
const target = 9;
const solution = subsetSumSolver.solve(numbers, target);
// Solution: [4, 5] (sums to 9)
```

**Atlas Encoding**:
- Numbers encoded as classes: `mark@c{num % 96}`
- Inclusion uses d=1 (produce), exclusion uses d=0 (neutral)
- Parallel composition represents the complete subset selection

### 3. Boolean Satisfiability (SAT) 🔍
**Problem**: Given a boolean formula in CNF, find a satisfying truth assignment.

**Atlas Features Used**:
- **h₂ Encoding**: TRUE/FALSE encoded using h₂ quadrants (0,1=TRUE, 2,3=FALSE)
- **Clause Constraints**: Each clause checked via parallel composition
- **State Space**: All variable assignments encoded as class indices

**Example**:
```typescript
const clauses = [
  { literals: [1, 2] },      // x1 ∨ x2
  { literals: [-1, 3] },      // ¬x1 ∨ x3
  { literals: [2, -3] }       // x2 ∨ ¬x3
];
const solution = satSolver.solve(clauses, 3);
// Solution: x1=FALSE, x2=TRUE, x3=FALSE
```

**Atlas Encoding**:
- Variables encoded as classes: `mark@c{varIndex % 96}`
- Truth values use h₂: h₂=0,1 for TRUE, h₂=2,3 for FALSE
- Complete assignment: `mark@c48 || mark@c1 || mark@c50`

## Key Atlas Concepts Demonstrated

### Parallel Composition (⊗)
The `||` operator allows exploring multiple solution branches simultaneously:
```typescript
// Explore all possible color assignments in parallel
'mark@c0 || mark@c25 || mark@c50 || mark@c27'
```

### Class System (≡₉₆)
The 96-class structure provides a natural encoding for problem states:
- **h₂ (0-3)**: Can encode 4 different values (e.g., colors, truth values)
- **d (0-2)**: Can encode 3 different states (e.g., include/exclude/neutral)
- **ℓ (0-7)**: Can encode 8 different contexts or positions

### Transform Operations
State transitions can use transforms:
- **R (Rotate)**: Change quadrant (h₂)
- **D (Triality)**: Rotate modality (d)
- **T (Twist)**: Change context (ℓ)
- **M (Mirror)**: Flip modality

### Belt Addressing
The 12,288-slot belt (48 pages × 256 bytes) can store intermediate states:
```typescript
// Store state at specific belt address
'mark@c42@17'  // Page 17, generates address 4398
```

## Running the Solvers

```bash
# From the examples directory
npm run np-hard
```

Or directly:
```bash
npx ts-node np-hard-solvers.ts
```

## Performance Characteristics

These solvers use **backtracking algorithms** with Atlas encoding:
- **Time Complexity**: Exponential in worst case (as expected for NP-hard problems)
- **Space Complexity**: O(n) for n variables/vertices
- **Atlas Overhead**: Minimal - encoding/decoding is O(1) per operation

## Future Enhancements

Potential improvements using more Atlas features:

1. **Parallel Search**: Use actual parallel evaluation of multiple branches
2. **Heuristic Guidance**: Use SGA (Geometric Algebra) for optimization guidance
3. **Constraint Propagation**: Use transform operations for constraint inference
4. **State Caching**: Use belt addressing for memoization
5. **Quantum-inspired**: Use triality orbits for quantum-like superposition states

## Theoretical Notes

While these solvers demonstrate Atlas's capability to encode and solve NP-hard problems, they still use traditional backtracking algorithms. The Atlas encoding provides:

- **Structured State Representation**: Natural mapping to the 96-class system
- **Parallel Exploration**: Framework for exploring multiple branches
- **Verifiable Computation**: Deterministic evaluation enables proof generation
- **Content Addressing**: Belt system enables content-addressable state storage

The system's **completeness claim** ("7 generators suffice for all computations") suggests these problems can be encoded, though the current implementation uses TypeScript for the search logic with Atlas for state encoding.

## References

- [Atlas Sigil Algebra Specification](../docs/atlas_sigil_algebra_formal_specification_v_1.md)
- [Architecture Guide](../docs/ARCHITECTURE.md)
- [Basic Usage Examples](./basic-usage.ts)


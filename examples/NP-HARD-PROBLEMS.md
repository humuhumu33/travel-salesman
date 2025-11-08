# NP-Hard Problems Solvable with Atlas Sigil Algebra

This document catalogs NP-hard problems that can be encoded and solved using Atlas Sigil Algebra, along with encoding strategies for each.

## Currently Implemented

### ✅ 1. Traveling Salesman Problem (TSP)
**Status**: Implemented  
**File**: `traveling-salesman.ts`

**Problem**: Find shortest route visiting all cities exactly once and returning to start.

**Atlas Encoding**:
- Cities → Class indices (0-95)
- Tour positions → h₂ quadrants (0-3) + ℓ context (0-7)
- Tour order → Sequential composition (`.`)
- Expression: `mark@c0 . mark@c24 . mark@c48 . mark@c72`

### ✅ 2. Graph Coloring
**Status**: Implemented  
**File**: `np-hard-solvers.ts`

**Problem**: Color graph vertices with k colors such that no adjacent vertices share a color.

**Atlas Encoding**:
- Vertices → Class indices
- Colors → h₂ quadrants (0-3) or d modality (0-2)
- All assignments → Parallel composition (`||`)
- Expression: `mark@c0 || mark@c25 || mark@c50 || mark@c27`

### ✅ 3. Subset Sum
**Status**: Implemented  
**File**: `np-hard-solvers.ts`

**Problem**: Find subset of numbers that sums to target.

**Atlas Encoding**:
- Numbers → Class indices
- Inclusion/exclusion → d modality (0=exclude, 1=include)
- Expression: `mark@c3 || mark@c26 || mark@c12`

### ✅ 4. Boolean Satisfiability (SAT)
**Status**: Implemented  
**File**: `np-hard-solvers.ts`

**Problem**: Find truth assignment satisfying CNF formula.

**Atlas Encoding**:
- Variables → Class indices
- TRUE/FALSE → h₂ quadrants (0,1=TRUE, 2,3=FALSE)
- Expression: `mark@c48 || mark@c1 || mark@c50`

---

## Additional NP-Hard Problems (Encodable)

### 5. Knapsack Problem
**Problem**: Select items with maximum value without exceeding weight capacity.

**Atlas Encoding Strategy**:
- Items → Class indices
- Selection → d modality (0=exclude, 1=include)
- Value/Weight → Encode in h₂ and ℓ
- Parallel composition for exploring combinations

**Implementation Complexity**: Medium  
**Use Case**: Resource allocation, portfolio optimization

### 6. Bin Packing
**Problem**: Pack items into minimum number of bins of fixed capacity.

**Atlas Encoding Strategy**:
- Items → Class indices
- Bin assignment → h₂ quadrant (0-3 for up to 4 bins, or use ℓ for more)
- Bin state → d modality (0=empty, 1=partial, 2=full)
- Parallel composition for different bin assignments

**Implementation Complexity**: Medium  
**Use Case**: Resource scheduling, memory allocation

### 7. Set Cover
**Problem**: Find minimum number of sets whose union covers all elements.

**Atlas Encoding Strategy**:
- Sets → Class indices
- Selection → d modality (0=exclude, 1=include)
- Coverage → Track via parallel composition
- Expression: `mark@c{set1} || mark@c{set2} || ...`

**Implementation Complexity**: Medium  
**Use Case**: Test case selection, feature selection

### 8. Vertex Cover
**Problem**: Find minimum set of vertices covering all edges.

**Atlas Encoding Strategy**:
- Vertices → Class indices
- Selection → d modality (0=exclude, 1=include)
- Edge coverage → Check via parallel composition
- Similar to set cover encoding

**Implementation Complexity**: Medium  
**Use Case**: Network security, monitoring placement

### 9. Hamiltonian Path/Cycle
**Problem**: Find path/cycle visiting each vertex exactly once.

**Atlas Encoding Strategy**:
- Vertices → Class indices
- Path order → Sequential composition (`.`)
- Position in path → h₂ quadrant
- Expression: `mark@c0 . mark@c24 . mark@c48 . mark@c72`

**Implementation Complexity**: Medium  
**Use Case**: Route planning, sequencing

### 10. Maximum Clique
**Problem**: Find largest complete subgraph.

**Atlas Encoding Strategy**:
- Vertices → Class indices
- Inclusion → d modality
- Clique property → Check via parallel composition
- Size tracking → Use ℓ context

**Implementation Complexity**: Medium  
**Use Case**: Social network analysis, pattern matching

### 11. Independent Set
**Problem**: Find largest set of non-adjacent vertices.

**Atlas Encoding Strategy**:
- Vertices → Class indices
- Selection → d modality
- Adjacency constraints → Check via parallel composition
- Similar to clique encoding

**Implementation Complexity**: Medium  
**Use Case**: Resource allocation, scheduling

### 12. Partition Problem
**Problem**: Partition set into two subsets with equal sums.

**Atlas Encoding Strategy**:
- Numbers → Class indices
- Partition assignment → h₂ quadrant (0=subset1, 1=subset2)
- Sum tracking → Use d modality or ℓ context
- Expression: `mark@c{num1} || mark@c{num2} || ...`

**Implementation Complexity**: Medium  
**Use Case**: Load balancing, fair division

### 13. 3-Partition
**Problem**: Partition set into triples with equal sums.

**Atlas Encoding Strategy**:
- Numbers → Class indices
- Triple assignment → Use h₂ (0-2) for triple ID, ℓ for position in triple
- Sum tracking → Encode in class structure
- More complex encoding needed

**Implementation Complexity**: High  
**Use Case**: Task scheduling, resource allocation

### 14. Job Scheduling
**Problem**: Schedule jobs on machines to minimize makespan.

**Atlas Encoding Strategy**:
- Jobs → Class indices
- Machine assignment → h₂ quadrant
- Time slots → ℓ context (0-7)
- Schedule → Sequential + parallel composition

**Implementation Complexity**: High  
**Use Case**: Production scheduling, cloud computing

### 15. Longest Path
**Problem**: Find longest simple path in graph.

**Atlas Encoding Strategy**:
- Vertices → Class indices
- Path sequence → Sequential composition
- Length tracking → Use transform operations
- Similar to TSP encoding

**Implementation Complexity**: Medium  
**Use Case**: Critical path analysis, dependency resolution

### 16. Steiner Tree
**Problem**: Find minimum tree connecting required vertices.

**Atlas Encoding Strategy**:
- Vertices → Class indices
- Tree edges → Sequential composition for paths
- Required vertices → Marked with d modality
- Complex encoding for tree structure

**Implementation Complexity**: High  
**Use Case**: Network design, VLSI routing

### 17. Max Cut
**Problem**: Partition vertices to maximize edges between partitions.

**Atlas Encoding Strategy**:
- Vertices → Class indices
- Partition → h₂ quadrant (0=partition1, 1=partition2)
- Edge counting → Check via parallel composition
- Expression: `mark@c0 || mark@c24 || mark@c48 || mark@c72`

**Implementation Complexity**: Medium  
**Use Case**: Graph partitioning, clustering

### 18. Minimum Dominating Set
**Problem**: Find minimum set of vertices where every vertex is adjacent to at least one in the set.

**Atlas Encoding Strategy**:
- Vertices → Class indices
- Selection → d modality
- Domination check → Parallel composition
- Similar to vertex cover

**Implementation Complexity**: Medium  
**Use Case**: Network monitoring, facility location

### 19. Feedback Vertex Set
**Problem**: Find minimum set of vertices whose removal makes graph acyclic.

**Atlas Encoding Strategy**:
- Vertices → Class indices
- Selection → d modality
- Cycle detection → Complex, requires graph traversal encoding
- Advanced encoding needed

**Implementation Complexity**: High  
**Use Case**: Deadlock prevention, dependency resolution

### 20. Clique Cover
**Problem**: Partition graph into minimum number of cliques.

**Atlas Encoding Strategy**:
- Vertices → Class indices
- Clique assignment → h₂ quadrant
- Clique property → Check via parallel composition
- Similar to graph coloring

**Implementation Complexity**: High  
**Use Case**: Graph decomposition, clustering

---

## Encoding Patterns

### Pattern 1: Selection Problems
**Examples**: Subset Sum, Knapsack, Set Cover, Vertex Cover

**Encoding**:
- Items → Class indices
- Selection → d modality (0=exclude, 1=include)
- Expression: `mark@c{item1} || mark@c{item2} || ...`

### Pattern 2: Ordering Problems
**Examples**: TSP, Hamiltonian Path, Job Scheduling

**Encoding**:
- Elements → Class indices
- Order → Sequential composition (`.`)
- Position → h₂ quadrant
- Expression: `mark@c0 . mark@c24 . mark@c48`

### Pattern 3: Assignment Problems
**Examples**: Graph Coloring, Bin Packing, Partition

**Encoding**:
- Elements → Class indices
- Assignment → h₂ quadrant or d modality
- All assignments → Parallel composition (`||`)
- Expression: `mark@c0 || mark@c25 || mark@c50`

### Pattern 4: Constraint Satisfaction
**Examples**: SAT, Graph Coloring, Set Cover

**Encoding**:
- Variables/Items → Class indices
- Values → h₂ or d
- Constraints → Checked via parallel composition
- Expression: `mark@c{var1} || mark@c{var2} || ...`

---

## Atlas Features Used

### Class System (≡₉₆)
- **96 classes** provide natural encoding space
- **h₂ (0-3)**: 4-way choices (colors, partitions, positions)
- **d (0-2)**: 3-way states (include/exclude/neutral, produce/consume/neutral)
- **ℓ (0-7)**: 8-way contexts (time slots, positions, phases)

### Composition Operators
- **Sequential (`.`)**: Order, sequence, path
- **Parallel (`||`)**: Combinations, assignments, constraints

### Transform Operations
- **R (Rotate)**: Change quadrant/position
- **D (Triality)**: Rotate modality
- **T (Twist)**: Change context
- **M (Mirror)**: Flip state

### Belt Addressing
- **12,288 slots** (48 pages × 256 bytes)
- Store intermediate states
- Content-addressable lookup

---

## Implementation Priority

### High Priority (Most Impressive)
1. ✅ **TSP** - Most famous, already done
2. **Knapsack** - Very practical, easy to understand
3. **Bin Packing** - Visual, practical applications
4. **Hamiltonian Path** - Classic graph problem

### Medium Priority
5. **Set Cover** - Important combinatorial problem
6. **Vertex Cover** - Graph theory classic
7. **Partition** - Simple but NP-hard
8. **Max Clique** - Graph analysis

### Lower Priority (More Complex)
9. **Job Scheduling** - Complex constraints
10. **Steiner Tree** - Complex structure
11. **3-Partition** - Complex encoding

---

## Notes

- All problems use **backtracking/branch-and-bound** algorithms
- Atlas provides **encoding framework**, not the algorithm itself
- **Time complexity** remains exponential (NP-hard nature)
- **Atlas encoding** is O(1) per operation
- **Parallel composition** enables exploring multiple branches
- **Class system** provides structured state representation

---

## References

- [Atlas Specification](../docs/atlas_sigil_algebra_formal_specification_v_1.md)
- [Current Implementations](./np-hard-solvers.ts)
- [TSP Solver](./traveling-salesman.ts)


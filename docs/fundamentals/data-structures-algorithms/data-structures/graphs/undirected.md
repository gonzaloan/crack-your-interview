---
sidebar_position: 2
title: "Undirected Graphs"
description: "Undirected Graphs"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔄 Data Structures: Undirected Graphs

## Overview

An undirected graph is a graph structure where edges have no direction, representing bilateral relationships between vertices. Each edge connects two vertices symmetrically, meaning if vertex A is connected to vertex B, then vertex B is also connected to vertex A.

### Real-World Analogy 🌎
Think of undirected graphs like:
- Friendship networks where relationships are mutual
- Road networks where streets are two-way
- Electrical circuits with connections between components
- Social networks with mutual connections

## Key Concepts 🎯

### Core Components

1. **Vertices (Nodes)**
    - Store data
    - Track connections
    - Degree (number of edges)

2. **Edges**
    - Connect two vertices
    - Optional weight/cost
    - Bidirectional connection

3. **Graph Properties**
    - Connectivity
    - Cycles
    - Components
    - Tree characteristics

## Implementation Examples

### Undirected Graph Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    public class UndirectedGraph<T> {
        private class Vertex {
            T data;
            Map<Vertex, Integer> neighbors; // neighbor -> weight

            Vertex(T data) {
                this.data = data;
                this.neighbors = new HashMap<>();
            }
        }
        
        private Map<T, Vertex> vertices;
        
        public UndirectedGraph() {
            vertices = new HashMap<>();
        }
        
        // Add vertex
        public void addVertex(T data) {
            vertices.putIfAbsent(data, new Vertex(data));
        }
        
        // Add edge with weight
        public void addEdge(T v1, T v2, int weight) {
            Vertex vertex1 = vertices.get(v1);
            Vertex vertex2 = vertices.get(v2);
            
            if (vertex1 == null || vertex2 == null) {
                throw new IllegalArgumentException("Vertex not found");
            }
            
            vertex1.neighbors.put(vertex2, weight);
            vertex2.neighbors.put(vertex1, weight);
        }
        
        // Get vertex degree
        public int getDegree(T data) {
            Vertex vertex = vertices.get(data);
            if (vertex == null) {
                throw new IllegalArgumentException("Vertex not found");
            }
            return vertex.neighbors.size();
        }
        
        // Find connected components using DFS
        public List<List<T>> findConnectedComponents() {
            List<List<T>> components = new ArrayList<>();
            Set<Vertex> visited = new HashSet<>();
            
            for (Vertex vertex : vertices.values()) {
                if (!visited.contains(vertex)) {
                    List<T> component = new ArrayList<>();
                    dfs(vertex, visited, component);
                    components.add(component);
                }
            }
            
            return components;
        }
        
        private void dfs(Vertex vertex, Set<Vertex> visited, List<T> component) {
            visited.add(vertex);
            component.add(vertex.data);
            
            for (Vertex neighbor : vertex.neighbors.keySet()) {
                if (!visited.contains(neighbor)) {
                    dfs(neighbor, visited, component);
                }
            }
        }
        
        // Minimum Spanning Tree using Kruskal's Algorithm
        public List<Edge<T>> minimumSpanningTree() {
            List<Edge<T>> edges = new ArrayList<>();
            
            // Collect all edges
            for (Map.Entry<T, Vertex> entry : vertices.entrySet()) {
                for (Map.Entry<Vertex, Integer> neighbor : entry.getValue().neighbors.entrySet()) {
                    if (entry.getValue().data.compareTo(neighbor.getKey().data) < 0) {
                        edges.add(new Edge<>(entry.getValue().data, 
                                          neighbor.getKey().data, 
                                          neighbor.getValue()));
                    }
                }
            }
            
            // Sort edges by weight
            Collections.sort(edges);
            
            UnionFind<T> unionFind = new UnionFind<>(vertices.keySet());
            List<Edge<T>> mst = new ArrayList<>();
            
            for (Edge<T> edge : edges) {
                if (unionFind.union(edge.v1, edge.v2)) {
                    mst.add(edge);
                }
            }
            
            return mst;
        }
        
        private static class Edge<T> implements Comparable<Edge<T>> {
            T v1, v2;
            int weight;
            
            Edge(T v1, T v2, int weight) {
                this.v1 = v1;
                this.v2 = v2;
                this.weight = weight;
            }
            
            @Override
            public int compareTo(Edge<T> other) {
                return Integer.compare(this.weight, other.weight);
            }
        }
        
        private static class UnionFind<T> {
            private Map<T, T> parent;
            private Map<T, Integer> rank;
            
            UnionFind(Set<T> vertices) {
                parent = new HashMap<>();
                rank = new HashMap<>();
                for (T vertex : vertices) {
                    parent.put(vertex, vertex);
                    rank.put(vertex, 0);
                }
            }
            
            T find(T vertex) {
                if (!parent.get(vertex).equals(vertex)) {
                    parent.put(vertex, find(parent.get(vertex)));
                }
                return parent.get(vertex);
            }
            
            boolean union(T v1, T v2) {
                T root1 = find(v1);
                T root2 = find(v2);
                
                if (root1.equals(root2)) {
                    return false;
                }
                
                if (rank.get(root1) < rank.get(root2)) {
                    parent.put(root1, root2);
                } else if (rank.get(root1) > rank.get(root2)) {
                    parent.put(root2, root1);
                } else {
                    parent.put(root2, root1);
                    rank.put(root1, rank.get(root1) + 1);
                }
                
                return true;
            }
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "sort"
    )

    type Vertex[T comparable] struct {
        data      T
        neighbors map[*Vertex[T]]int // neighbor -> weight
    }

    type UndirectedGraph[T comparable] struct {
        vertices map[T]*Vertex[T]
    }

    func NewUndirectedGraph[T comparable]() *UndirectedGraph[T] {
        return &UndirectedGraph[T]{
            vertices: make(map[T]*Vertex[T]),
        }
    }

    func (g *UndirectedGraph[T]) AddVertex(data T) {
        if _, exists := g.vertices[data]; !exists {
            g.vertices[data] = &Vertex[T]{
                data:      data,
                neighbors: make(map[*Vertex[T]]int),
            }
        }
    }

    func (g *UndirectedGraph[T]) AddEdge(v1, v2 T, weight int) error {
        vertex1 := g.vertices[v1]
        vertex2 := g.vertices[v2]

        if vertex1 == nil || vertex2 == nil {
            return fmt.Errorf("vertex not found")
        }

        vertex1.neighbors[vertex2] = weight
        vertex2.neighbors[vertex1] = weight
        return nil
    }

    func (g *UndirectedGraph[T]) GetDegree(data T) int {
        vertex := g.vertices[data]
        if vertex == nil {
            return 0
        }
        return len(vertex.neighbors)
    }

    func (g *UndirectedGraph[T]) FindConnectedComponents() [][]T {
        var components [][]T
        visited := make(map[*Vertex[T]]bool)

        for _, vertex := range g.vertices {
            if !visited[vertex] {
                var component []T
                g.dfs(vertex, visited, &component)
                components = append(components, component)
            }
        }

        return components
    }

    func (g *UndirectedGraph[T]) dfs(vertex *Vertex[T], visited map[*Vertex[T]]bool, component *[]T) {
        visited[vertex] = true
        *component = append(*component, vertex.data)

        for neighbor := range vertex.neighbors {
            if !visited[neighbor] {
                g.dfs(neighbor, visited, component)
            }
        }
    }

    type Edge[T comparable] struct {
        v1, v2 T
        weight int
    }

    type UnionFind[T comparable] struct {
        parent map[T]T
        rank   map[T]int
    }

    func NewUnionFind[T comparable](vertices map[T]*Vertex[T]) *UnionFind[T] {
        uf := &UnionFind[T]{
            parent: make(map[T]T),
            rank:   make(map[T]int),
        }
        for data := range vertices {
            uf.parent[data] = data
            uf.rank[data] = 0
        }
        return uf
    }

    func (uf *UnionFind[T]) Find(vertex T) T {
        if uf.parent[vertex] != vertex {
            uf.parent[vertex] = uf.Find(uf.parent[vertex])
        }
        return uf.parent[vertex]
    }

    func (uf *UnionFind[T]) Union(v1, v2 T) bool {
        root1 := uf.Find(v1)
        root2 := uf.Find(v2)

        if root1 == root2 {
            return false
        }

        if uf.rank[root1] < uf.rank[root2] {
            uf.parent[root1] = root2
        } else if uf.rank[root1] > uf.rank[root2] {
            uf.parent[root2] = root1
        } else {
            uf.parent[root2] = root1
            uf.rank[root1]++
        }

        return true
    }

    func (g *UndirectedGraph[T]) MinimumSpanningTree() []Edge[T] {
        var edges []Edge[T]

        // Collect all edges
        for data, vertex := range g.vertices {
            for neighbor, weight := range vertex.neighbors {
                if data < neighbor.data { // Avoid duplicates
                    edges = append(edges, Edge[T]{data, neighbor.data, weight})
                }
            }
        }

        // Sort edges by weight
        sort.Slice(edges, func(i, j int) bool {
            return edges[i].weight < edges[j].weight
        })

        uf := NewUnionFind(g.vertices)
        var mst []Edge[T]

        for _, edge := range edges {
            if uf.Union(edge.v1, edge.v2) {
                mst = append(mst, edge)
            }
        }

        return mst
    }
    ```
  </TabItem>
</Tabs>

## Related Patterns 🔄

1. **Composite Pattern**
    - Graph structure representation
    - Component traversal

2. **Iterator Pattern**
    - Graph traversal
    - Edge enumeration

3. **Strategy Pattern**
    - Different traversal strategies
    - Path finding algorithms

## Best Practices 👍

### Configuration
1. **Graph Initialization**
    - Proper vertex allocation
    - Edge weight handling
    - Memory efficiency

2. **Edge Management**
    - Bidirectional consistency
    - Weight validation
    - Connection tracking

### Monitoring
1. **Graph State**
    - Vertex count
    - Edge density
    - Component sizes

2. **Performance Metrics**
    - Operation timing
    - Memory usage
    - Traversal efficiency

### Testing
1. **Structural Tests**
    - Connectivity verification
    - Edge consistency
    - Component validation

2. **Algorithm Tests**
    - MST correctness
    - Path finding
    - Component detection

## Common Pitfalls ⚠️

1. **Inconsistent Edges**
    - One-way connections
    - Solution: Edge validation

2. **Memory Leaks**
    - Orphaned vertices
    - Solution: Proper cleanup

3. **Performance Issues**
    - Inefficient traversal
    - Solution: Optimized algorithms

## Use Cases 🎯

### 1. Social Networks
- **Usage**: Friend connections
- **Why**: Mutual relationships
- **Implementation**: Connected components

### 2. Infrastructure Planning
- **Usage**: Network design
- **Why**: Cost optimization
- **Implementation**: Minimum spanning tree

### 3. Communication Networks
- **Usage**: Network topology
- **Why**: Redundancy planning
- **Implementation**: Path finding

## Deep Dive Topics 🤿

### Thread Safety

1. **Concurrent Access**
    - Edge modification locks
    - Vertex state protection
    - Atomic operations

2. **Parallel Processing**
    - Component detection
    - Path finding
    - Graph updates

### Performance

1. **Time Complexity**
    - Edge addition: O(1)
    - MST: O(E log V)
    - Component finding: O(V + E)

2. **Space Optimization**
    - Adjacency representation
    - Component storage
    - Path caching

### Distributed Systems

1. **Graph Partitioning**
    - Component distribution
    - Edge synchronization
    - Consistency maintenance

## Additional Resources 📚

### References
1. "Graph Theory" - Reinhard Diestel
2. "Algorithms" - Robert Sedgewick
3. "Network Analysis" - Mark Newman

### Tools
1. Graph Visualization
    - Gephi
    - Cytoscape
    - GraphViz

2. Analysis Tools
    - NetworkX
    - JGraphT
    - Graph-Tool

## FAQs ❓

### Q: When to use undirected vs directed graphs?
A: Use undirected graphs when:
- Relationships are mutual
- Direction doesn't matter
- Connections are symmetric

### Q: How to handle large graphs?
A: Consider:
- Sparse representation
- Partitioning
- Incremental processing

### Q: Best practices for graph traversal?
A: Implement:
- BFS for shortest paths
- DFS for connectivity
- Custom iterators for specific needs
---
sidebar_position: 1
title: "Directed Graphs"
description: "Directed Graphs"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🎯 Data Structures: Directed Graphs

## Overview

A directed graph (digraph) is a graph where edges have a direction, pointing from one vertex to another. Unlike undirected graphs, relationships in directed graphs are one-way unless explicitly defined otherwise.

### Real-World Analogy 🌎
Think of directed graphs like:
- One-way streets in a city
- Social media following relationships
- Web page links
- Dependencies in a software project

## Key Concepts 🎯

### Core Components

1. **Vertices (Nodes)**
    - Unique identifiers
    - Optional vertex data
    - In-degree and out-degree

2. **Edges (Arcs)**
    - Source vertex
    - Destination vertex
    - Optional weight/cost
    - Direction

3. **Graph Properties**
    - Cyclicity
    - Connectivity
    - Strong/Weak components
    - DAG (Directed Acyclic Graph)

## Implementation Examples

### Directed Graph Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    public class DirectedGraph<T> {
        private class Vertex {
            T data;
            Map<Vertex, Integer> edges; // destination -> weight

            Vertex(T data) {
                this.data = data;
                this.edges = new HashMap<>();
            }
        }
        
        private Map<T, Vertex> vertices;
        
        public DirectedGraph() {
            vertices = new HashMap<>();
        }
        
        // Add vertex to graph
        public void addVertex(T data) {
            vertices.putIfAbsent(data, new Vertex(data));
        }
        
        // Add directed edge with weight
        public void addEdge(T source, T destination, int weight) {
            Vertex sourceVertex = vertices.get(source);
            Vertex destVertex = vertices.get(destination);
            
            if (sourceVertex == null || destVertex == null) {
                throw new IllegalArgumentException("Vertex not found");
            }
            
            sourceVertex.edges.put(destVertex, weight);
        }
        
        // Get in-degree of a vertex
        public int getInDegree(T data) {
            return (int) vertices.values().stream()
                .filter(v -> v.edges.containsKey(vertices.get(data)))
                .count();
        }
        
        // Get out-degree of a vertex
        public int getOutDegree(T data) {
            Vertex vertex = vertices.get(data);
            if (vertex == null) {
                throw new IllegalArgumentException("Vertex not found");
            }
            return vertex.edges.size();
        }
        
        // Check if graph is cyclic using DFS
        public boolean hasCycle() {
            Set<Vertex> visited = new HashSet<>();
            Set<Vertex> recStack = new HashSet<>();
            
            for (Vertex vertex : vertices.values()) {
                if (hasCycleUtil(vertex, visited, recStack)) {
                    return true;
                }
            }
            
            return false;
        }
        
        private boolean hasCycleUtil(Vertex vertex, Set<Vertex> visited, Set<Vertex> recStack) {
            if (recStack.contains(vertex)) {
                return true;
            }
            
            if (visited.contains(vertex)) {
                return false;
            }
            
            visited.add(vertex);
            recStack.add(vertex);
            
            for (Vertex neighbor : vertex.edges.keySet()) {
                if (hasCycleUtil(neighbor, visited, recStack)) {
                    return true;
                }
            }
            
            recStack.remove(vertex);
            return false;
        }
        
        // Find strongly connected components using Kosaraju's algorithm
        public List<List<T>> findSCCs() {
            Stack<Vertex> stack = new Stack<>();
            Set<Vertex> visited = new HashSet<>();
            
            // First DFS to fill stack
            for (Vertex vertex : vertices.values()) {
                if (!visited.contains(vertex)) {
                    fillOrder(vertex, visited, stack);
                }
            }
            
            // Create transpose graph
            DirectedGraph<T> transposed = getTranspose();
            
            // Second DFS
            visited.clear();
            List<List<T>> sccs = new ArrayList<>();
            
            while (!stack.isEmpty()) {
                Vertex vertex = stack.pop();
                if (!visited.contains(vertex)) {
                    List<T> scc = new ArrayList<>();
                    transposed.DFSUtil(vertices.get(vertex.data), visited, scc);
                    sccs.add(scc);
                }
            }
            
            return sccs;
        }
        
        private void fillOrder(Vertex vertex, Set<Vertex> visited, Stack<Vertex> stack) {
            visited.add(vertex);
            
            for (Vertex neighbor : vertex.edges.keySet()) {
                if (!visited.contains(neighbor)) {
                    fillOrder(neighbor, visited, stack);
                }
            }
            
            stack.push(vertex);
        }
        
        private DirectedGraph<T> getTranspose() {
            DirectedGraph<T> transposed = new DirectedGraph<>();
            
            // Add all vertices
            for (T data : vertices.keySet()) {
                transposed.addVertex(data);
            }
            
            // Add reversed edges
            for (Map.Entry<T, Vertex> entry : vertices.entrySet()) {
                for (Map.Entry<Vertex, Integer> edge : entry.getValue().edges.entrySet()) {
                    transposed.addEdge(edge.getKey().data, entry.getKey(), edge.getValue());
                }
            }
            
            return transposed;
        }
        
        private void DFSUtil(Vertex vertex, Set<Vertex> visited, List<T> component) {
            visited.add(vertex);
            component.add(vertex.data);
            
            for (Vertex neighbor : vertex.edges.keySet()) {
                if (!visited.contains(neighbor)) {
                    DFSUtil(neighbor, visited, component);
                }
            }
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "errors"
    )

    type Vertex[T comparable] struct {
        data  T
        edges map[*Vertex[T]]int // destination -> weight
    }

    type DirectedGraph[T comparable] struct {
        vertices map[T]*Vertex[T]
    }

    func NewDirectedGraph[T comparable]() *DirectedGraph[T] {
        return &DirectedGraph[T]{
            vertices: make(map[T]*Vertex[T]),
        }
    }

    func (g *DirectedGraph[T]) AddVertex(data T) {
        if _, exists := g.vertices[data]; !exists {
            g.vertices[data] = &Vertex[T]{
                data:  data,
                edges: make(map[*Vertex[T]]int),
            }
        }
    }

    func (g *DirectedGraph[T]) AddEdge(source, destination T, weight int) error {
        sourceVertex := g.vertices[source]
        destVertex := g.vertices[destination]

        if sourceVertex == nil || destVertex == nil {
            return errors.New("vertex not found")
        }

        sourceVertex.edges[destVertex] = weight
        return nil
    }

    func (g *DirectedGraph[T]) GetInDegree(data T) int {
        count := 0
        vertex := g.vertices[data]
        if vertex == nil {
            return 0
        }

        for _, v := range g.vertices {
            if _, exists := v.edges[vertex]; exists {
                count++
            }
        }
        return count
    }

    func (g *DirectedGraph[T]) GetOutDegree(data T) int {
        vertex := g.vertices[data]
        if vertex == nil {
            return 0
        }
        return len(vertex.edges)
    }

    func (g *DirectedGraph[T]) HasCycle() bool {
        visited := make(map[*Vertex[T]]bool)
        recStack := make(map[*Vertex[T]]bool)

        for _, vertex := range g.vertices {
            if g.hasCycleUtil(vertex, visited, recStack) {
                return true
            }
        }

        return false
    }

    func (g *DirectedGraph[T]) hasCycleUtil(vertex *Vertex[T], visited, recStack map[*Vertex[T]]bool) bool {
        if recStack[vertex] {
            return true
        }

        if visited[vertex] {
            return false
        }

        visited[vertex] = true
        recStack[vertex] = true

        for neighbor := range vertex.edges {
            if g.hasCycleUtil(neighbor, visited, recStack) {
                return true
            }
        }

        recStack[vertex] = false
        return false
    }

    func (g *DirectedGraph[T]) FindSCCs() [][]T {
        // Implementation of Kosaraju's algorithm
        stack := make([]*Vertex[T], 0)
        visited := make(map[*Vertex[T]]bool)

        // First DFS to fill stack
        for _, vertex := range g.vertices {
            if !visited[vertex] {
                g.fillOrder(vertex, visited, &stack)
            }
        }

        // Create transpose graph
        transposed := g.getTranspose()

        // Second DFS
        visited = make(map[*Vertex[T]]bool)
        var sccs [][]T

        for i := len(stack) - 1; i >= 0; i-- {
            vertex := stack[i]
            if !visited[vertex] {
                var component []T
                transposed.dfsUtil(g.vertices[vertex.data], visited, &component)
                sccs = append(sccs, component)
            }
        }

        return sccs
    }

    func (g *DirectedGraph[T]) fillOrder(vertex *Vertex[T], visited map[*Vertex[T]]bool, stack *[]*Vertex[T]) {
        visited[vertex] = true

        for neighbor := range vertex.edges {
            if !visited[neighbor] {
                g.fillOrder(neighbor, visited, stack)
            }
        }

        *stack = append(*stack, vertex)
    }

    func (g *DirectedGraph[T]) getTranspose() *DirectedGraph[T] {
        transposed := NewDirectedGraph[T]()

        // Add all vertices
        for data := range g.vertices {
            transposed.AddVertex(data)
        }

        // Add reversed edges
        for data, vertex := range g.vertices {
            for neighbor, weight := range vertex.edges {
                transposed.AddEdge(neighbor.data, data, weight)
            }
        }

        return transposed
    }

    func (g *DirectedGraph[T]) dfsUtil(vertex *Vertex[T], visited map[*Vertex[T]]bool, component *[]T) {
        visited[vertex] = true
        *component = append(*component, vertex.data)

        for neighbor := range vertex.edges {
            if !visited[neighbor] {
                g.dfsUtil(neighbor, visited, component)
            }
        }
    }
    ```
  </TabItem>
</Tabs>

## Related Patterns 🔄

1. **Visitor Pattern**
    - Graph traversal
    - Node processing

2. **Iterator Pattern**
    - Edge traversal
    - Path iteration

3. **Observer Pattern**
    - Graph modifications
    - State changes

## Best Practices 👍

### Configuration
1. **Storage Selection**
    - Adjacency list for sparse graphs
    - Adjacency matrix for dense graphs

2. **Edge Representation**
    - Weight handling
    - Direction management

### Monitoring
1. **Graph Metrics**
    - Vertex count
    - Edge density
    - Component size

2. **Performance Tracking**
    - Traversal time
    - Memory usage
    - Operation counts

### Testing
1. **Graph Properties**
    - Connectivity
    - Cycles
    - Components

2. **Edge Cases**
    - Empty graph
    - Single vertex
    - Complete graph

## Common Pitfalls ⚠️

1. **Direction Errors**
    - Incorrect edge direction
    - Solution: Edge validation

2. **Component Isolation**
    - Unreachable vertices
    - Solution: Connectivity check

3. **Memory Management**
    - Vertex/edge cleanup
    - Solution: Proper deletion

## Use Cases 🎯

### 1. Dependency Management
- **Usage**: Software dependencies
- **Why**: Circular dependency detection
- **Implementation**: Cycle detection

### 2. Web Crawling
- **Usage**: Website navigation
- **Why**: Link traversal
- **Implementation**: DFS/BFS

### 3. Network Routing
- **Usage**: Data flow
- **Why**: Path optimization
- **Implementation**: Shortest path

## Deep Dive Topics 🤿

### Thread Safety

1. **Concurrent Access**
    - Read-write locks
    - Vertex locking
    - Edge synchronization

2. **Parallel Operations**
    - Concurrent traversal
    - Safe modifications
    - State consistency

### Performance

1. **Time Complexity**
    - Edge addition: O(1)
    - Vertex search: O(1)
    - Cycle detection: O(V + E)

2. **Space Optimization**
    - Edge representation
    - Vertex storage
    - Component tracking

### Distributed Systems

1. **Graph Partitioning**
    - Vertex distribution
    - Edge handling
    - Consistency management

## Additional Resources 📚

### References
1. "Introduction to Algorithms" - CLRS
2. "Graph Theory" - Reinhard Diestel
3. "Algorithms in Java" - Robert Sedgewick

### Tools
1. Graph Visualization
    - GraphViz
    - Neo4j
    - Cytoscape

### Libraries
1. JGraphT (Java)
2. Boost Graph Library (C++)
3. NetworkX (Python)

## FAQs ❓

### Q: When should I use a directed vs undirected graph?
A: Use directed graphs when:
- Relationships are one-way
- Order matters
- Flow direction is important

### Q: How to handle strongly connected components?
A: Use algorithms like:
- Kosaraju's algorithm
- Tarjan's algorithm
- Path-based algorithm

### Q: Best practices for cycle detection?
A: Consider:
- DFS with visited set
- Color marking approach
- Topological sort

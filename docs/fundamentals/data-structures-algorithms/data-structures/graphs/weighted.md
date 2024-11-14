---
sidebar_position: 3
title: "Weighted Graphs"
description: "Weighted Graphs"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚖️ Data Structures: Weighted Graphs

## Overview

A weighted graph is a graph where each edge has an associated weight or cost. These weights can represent various metrics like distance, time, cost, capacity, or any other quantifiable relationship between vertices.

### Real-World Analogy 🌎
Think of weighted graphs like:
- Road networks with distances between cities
- Flight routes with travel costs
- Computer networks with bandwidth capacity
- Project dependencies with task durations

## Key Concepts 🎯

### Core Components

1. **Vertices (Nodes)**
    - Data element
    - Adjacent edges list
    - Optional metadata

2. **Weighted Edges**
    - Source vertex
    - Destination vertex
    - Weight/cost value
    - Optional direction

3. **Graph Properties**
    - Total weight
    - Path costs
    - Minimum/maximum weights
    - Weight distributions

## Implementation Examples

### Weighted Graph Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    public class WeightedGraph<T> {
        private class Vertex {
            T data;
            Map<Vertex, Double> edges; // neighbor -> weight

            Vertex(T data) {
                this.data = data;
                this.edges = new HashMap<>();
            }
        }
        
        private Map<T, Vertex> vertices;
        private boolean isDirected;
        
        public WeightedGraph(boolean isDirected) {
            this.vertices = new HashMap<>();
            this.isDirected = isDirected;
        }
        
        // Add vertex
        public void addVertex(T data) {
            vertices.putIfAbsent(data, new Vertex(data));
        }
        
        // Add weighted edge
        public void addEdge(T source, T dest, double weight) {
            Vertex sourceVertex = vertices.get(source);
            Vertex destVertex = vertices.get(dest);
            
            if (sourceVertex == null || destVertex == null) {
                throw new IllegalArgumentException("Vertex not found");
            }
            
            sourceVertex.edges.put(destVertex, weight);
            if (!isDirected) {
                destVertex.edges.put(sourceVertex, weight);
            }
        }
        
        // Dijkstra's shortest path algorithm
        public Map<T, Double> shortestPaths(T start) {
            Vertex startVertex = vertices.get(start);
            if (startVertex == null) {
                throw new IllegalArgumentException("Start vertex not found");
            }
            
            Map<T, Double> distances = new HashMap<>();
            PriorityQueue<Vertex> pq = new PriorityQueue<>(
                (v1, v2) -> Double.compare(distances.get(v1.data), distances.get(v2.data))
            );
            Set<Vertex> visited = new HashSet<>();
            
            // Initialize distances
            for (T vertex : vertices.keySet()) {
                distances.put(vertex, Double.POSITIVE_INFINITY);
            }
            distances.put(start, 0.0);
            
            pq.offer(startVertex);
            
            while (!pq.isEmpty()) {
                Vertex current = pq.poll();
                if (visited.contains(current)) continue;
                visited.add(current);
                
                for (Map.Entry<Vertex, Double> edge : current.edges.entrySet()) {
                    Vertex neighbor = edge.getKey();
                    if (visited.contains(neighbor)) continue;
                    
                    double newDist = distances.get(current.data) + edge.getValue();
                    if (newDist < distances.get(neighbor.data)) {
                        distances.put(neighbor.data, newDist);
                        pq.offer(neighbor);
                    }
                }
            }
            
            return distances;
        }
        
        // Minimum Spanning Tree using Prim's Algorithm
        public WeightedGraph<T> minimumSpanningTree() {
            if (isDirected) {
                throw new IllegalStateException("MST requires undirected graph");
            }
            
            WeightedGraph<T> mst = new WeightedGraph<>(false);
            if (vertices.isEmpty()) return mst;
            
            Set<Vertex> visited = new HashSet<>();
            PriorityQueue<Edge> pq = new PriorityQueue<>();
            Vertex start = vertices.values().iterator().next();
            
            // Add all vertices to MST
            vertices.forEach((data, vertex) -> mst.addVertex(data));
            
            visited.add(start);
            addEdgesToPQ(start, pq, visited);
            
            while (!pq.isEmpty() && visited.size() < vertices.size()) {
                Edge edge = pq.poll();
                if (visited.contains(edge.dest)) continue;
                
                mst.addEdge(edge.source.data, edge.dest.data, edge.weight);
                visited.add(edge.dest);
                addEdgesToPQ(edge.dest, pq, visited);
            }
            
            return mst;
        }
        
        private void addEdgesToPQ(Vertex vertex, PriorityQueue<Edge> pq, Set<Vertex> visited) {
            for (Map.Entry<Vertex, Double> edge : vertex.edges.entrySet()) {
                if (!visited.contains(edge.getKey())) {
                    pq.offer(new Edge(vertex, edge.getKey(), edge.getValue()));
                }
            }
        }
        
        private class Edge implements Comparable<Edge> {
            Vertex source;
            Vertex dest;
            double weight;
            
            Edge(Vertex source, Vertex dest, double weight) {
                this.source = source;
                this.dest = dest;
                this.weight = weight;
            }
            
            @Override
            public int compareTo(Edge other) {
                return Double.compare(this.weight, other.weight);
            }
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "container/heap"
        "fmt"
        "math"
    )

    type Vertex[T comparable] struct {
        data  T
        edges map[*Vertex[T]]float64 // neighbor -> weight
    }

    type WeightedGraph[T comparable] struct {
        vertices   map[T]*Vertex[T]
        isDirected bool
    }

    func NewWeightedGraph[T comparable](isDirected bool) *WeightedGraph[T] {
        return &WeightedGraph[T]{
            vertices:   make(map[T]*Vertex[T]),
            isDirected: isDirected,
        }
    }

    func (g *WeightedGraph[T]) AddVertex(data T) {
        if _, exists := g.vertices[data]; !exists {
            g.vertices[data] = &Vertex[T]{
                data:  data,
                edges: make(map[*Vertex[T]]float64),
            }
        }
    }

    func (g *WeightedGraph[T]) AddEdge(source, dest T, weight float64) error {
        sourceVertex := g.vertices[source]
        destVertex := g.vertices[dest]

        if sourceVertex == nil || destVertex == nil {
            return fmt.Errorf("vertex not found")
        }

        sourceVertex.edges[destVertex] = weight
        if !g.isDirected {
            destVertex.edges[sourceVertex] = weight
        }
        return nil
    }

    // Priority Queue implementation
    type PQItem[T comparable] struct {
        vertex   *Vertex[T]
        priority float64
        index    int
    }

    type PriorityQueue[T comparable] []*PQItem[T]

    func (pq PriorityQueue[T]) Len() int           { return len(pq) }
    func (pq PriorityQueue[T]) Less(i, j int) bool { return pq[i].priority < pq[j].priority }
    func (pq PriorityQueue[T]) Swap(i, j int) {
        pq[i], pq[j] = pq[j], pq[i]
        pq[i].index = i
        pq[j].index = j
    }
    func (pq *PriorityQueue[T]) Push(x interface{}) {
        n := len(*pq)
        item := x.(*PQItem[T])
        item.index = n
        *pq = append(*pq, item)
    }
    func (pq *PriorityQueue[T]) Pop() interface{} {
        old := *pq
        n := len(old)
        item := old[n-1]
        old[n-1] = nil
        item.index = -1
        *pq = old[0 : n-1]
        return item
    }

    // Dijkstra's shortest path algorithm
    func (g *WeightedGraph[T]) ShortestPaths(start T) map[T]float64 {
        distances := make(map[T]float64)
        visited := make(map[*Vertex[T]]bool)
        pq := &PriorityQueue[T]{}
        heap.Init(pq)

        // Initialize distances
        for vertex := range g.vertices {
            distances[vertex] = math.Inf(1)
        }
        distances[start] = 0

        startVertex := g.vertices[start]
        heap.Push(pq, &PQItem[T]{vertex: startVertex, priority: 0})

        for pq.Len() > 0 {
            current := heap.Pop(pq).(*PQItem[T]).vertex
            if visited[current] {
                continue
            }
            visited[current] = true

            for neighbor, weight := range current.edges {
                if visited[neighbor] {
                    continue
                }

                newDist := distances[current.data] + weight
                if newDist < distances[neighbor.data] {
                    distances[neighbor.data] = newDist
                    heap.Push(pq, &PQItem[T]{vertex: neighbor, priority: newDist})
                }
            }
        }

        return distances
    }

    // Edge type for MST
    type Edge[T comparable] struct {
        source *Vertex[T]
        dest   *Vertex[T]
        weight float64
    }

    // Minimum Spanning Tree using Prim's Algorithm
    func (g *WeightedGraph[T]) MinimumSpanningTree() (*WeightedGraph[T], error) {
        if g.isDirected {
            return nil, fmt.Errorf("MST requires undirected graph")
        }

        mst := NewWeightedGraph[T](false)
        if len(g.vertices) == 0 {
            return mst, nil
        }

        visited := make(map[*Vertex[T]]bool)
        pq := &PriorityQueue[T]{}
        heap.Init(pq)

        // Add all vertices to MST
        for data := range g.vertices {
            mst.AddVertex(data)
        }

        // Start with first vertex
        var start *Vertex[T]
        for _, v := range g.vertices {
            start = v
            break
        }

        visited[start] = true
        g.addEdgesToPQ(start, pq, visited)

        for pq.Len() > 0 && len(visited) < len(g.vertices) {
            item := heap.Pop(pq).(*PQItem[T])
            vertex := item.vertex
            if visited[vertex] {
                continue
            }

            // Add edge to MST
            for v, w := range vertex.edges {
                if visited[v] {
                    mst.AddEdge(v.data, vertex.data, w)
                    break
                }
            }

            visited[vertex] = true
            g.addEdgesToPQ(vertex, pq, visited)
        }

        return mst, nil
    }

    func (g *WeightedGraph[T]) addEdgesToPQ(vertex *Vertex[T], pq *PriorityQueue[T], visited map[*Vertex[T]]bool) {
        for neighbor, weight := range vertex.edges {
            if !visited[neighbor] {
                heap.Push(pq, &PQItem[T]{
                    vertex:   neighbor,
                    priority: weight,
                })
            }
        }
    }
    ```
  </TabItem>
</Tabs>

## Related Patterns 🔄

1. **Strategy Pattern**
    - Path finding algorithms
    - Weight calculations

2. **Observer Pattern**
    - Weight changes
    - Path updates

3. **Composite Pattern**
    - Graph structure
    - Weight aggregation

## Best Practices 👍

### Configuration
1. **Weight Design**
    - Appropriate scale
    - Unit consistency
    - Precision handling

2. **Graph Structure**
    - Edge representation
    - Weight storage
    - Update efficiency

### Monitoring
1. **Weight Statistics**
    - Distribution
    - Anomalies
    - Trends

2. **Performance Metrics**
    - Path computation time
    - Memory usage
    - Operation costs

### Testing
1. **Weight Validation**
    - Range checks
    - Type safety
    - Edge cases

2. **Algorithm Testing**
    - Shortest paths
    - MST verification
    - Weight updates

## Common Pitfalls ⚠️

1. **Weight Precision**
    - Floating-point errors
    - Solution: Proper scaling

2. **Performance Issues**
    - Large graphs
    - Solution: Efficient algorithms

3. **Negative Cycles**
    - Invalid paths
    - Solution: Cycle detection

## Use Cases 🎯

### 1. Transportation Networks
- **Usage**: Route planning
- **Why**: Distance/time optimization
- **Implementation**: Shortest paths

### 2. Network Flow
- **Usage**: Resource allocation
- **Why**: Capacity planning
- **Implementation**: Maximum flow

### 3. Cost Optimization
- **Usage**: Infrastructure planning
- **Why**: Budget constraints
- **Implementation**: Minimum spanning tree

## Deep Dive Topics 🤿

### Thread Safety

1. **Weight Updates**
    - Atomic operations
    - Lock strategies
    - Consistency maintenance

2. **Concurrent Access**
    - Read/write locks
    - Path computation
    - Weight modifications

### Performance

1. **Time Complexity**
    - Dijkstra: O(E log V)
    - Prim's: O(E log V)
    - Bellman-Ford: O(VE)

2. **Space Optimization**
    - Weight storage
    - Path caching
    - Memory efficiency

### Distributed Systems

1. **Weight Synchronization**
    - Update propagation
    - Consistency models
    - Conflict resolution

## Additional Resources 📚

### References
1. "Introduction to Algorithms" - CLRS
2. "Network Flows" - Ahuja, Magnanti, Orlin
3. "Graph Theory" - Diestel

### Tools
1. Graph Libraries
    - JGraphT
    - NetworkX
    - Boost

2. Visualization Tools
    - Graphviz
    - D3.js
    - Cytoscape

## FAQs ❓

### Q: How to handle negative weights?
A: Consider:
- Use Bellman-Ford algorithm
- Validate weight constraints
- Handle negative cycles

### Q: When to use different shortest path algorithms?
A: Choose based on:
- Graph properties
- Weight characteristics
- Performance requirements

### Q: How to optimize weight storage?
A: Strategies include:
- Efficient data structures
- Compression techniques
- Caching mechanisms

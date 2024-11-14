---
sidebar_position: 4
title: "Graph Algorithms"
description: "Graph Algorithms"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔄 Data Structures: Graph Algorithms

## Overview

Graph algorithms are fundamental procedures for working with graph data structures. They solve various problems such as finding shortest paths, detecting cycles, determining connectivity, and optimizing network flows.

### Real-World Analogy 🌎
Graph algorithms can be understood through real-world networks:
- Road networks (shortest path algorithms)
- Social networks (community detection)
- Internet routing (network flow)
- Flight schedules (minimum spanning trees)

## Key Concepts 🎯

### Types of Algorithms

1. **Path Finding**
    - Dijkstra's Algorithm
    - Bellman-Ford Algorithm
    - A* Search
    - Floyd-Warshall Algorithm

2. **Spanning Trees**
    - Kruskal's Algorithm
    - Prim's Algorithm

3. **Graph Traversal**
    - Depth-First Search (DFS)
    - Breadth-First Search (BFS)

4. **Graph Properties**
    - Cycle Detection
    - Topological Sort
    - Strongly Connected Components

## Implementation Examples

### Core Graph Algorithms

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    public class GraphAlgorithms {
        // Graph representation
        private static class Graph {
            private int V;
            private List<List<Edge>> adj;

            public Graph(int V) {
                this.V = V;
                adj = new ArrayList<>(V);
                for (int i = 0; i < V; i++) {
                    adj.add(new ArrayList<>());
                }
            }
            
            public void addEdge(int u, int v, int weight) {
                adj.get(u).add(new Edge(v, weight));
                adj.get(v).add(new Edge(u, weight)); // For undirected graph
            }
        }
        
        private static class Edge {
            int dest, weight;
            
            Edge(int dest, int weight) {
                this.dest = dest;
                this.weight = weight;
            }
        }
        
        // Dijkstra's Algorithm
        public static int[] dijkstra(Graph g, int src) {
            int[] dist = new int[g.V];
            boolean[] visited = new boolean[g.V];
            Arrays.fill(dist, Integer.MAX_VALUE);
            dist[src] = 0;
            
            PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
            pq.offer(new int[]{src, 0});
            
            while (!pq.isEmpty()) {
                int u = pq.poll()[0];
                if (visited[u]) continue;
                visited[u] = true;
                
                for (Edge e : g.adj.get(u)) {
                    int v = e.dest;
                    if (!visited[v] && dist[u] + e.weight < dist[v]) {
                        dist[v] = dist[u] + e.weight;
                        pq.offer(new int[]{v, dist[v]});
                    }
                }
            }
            return dist;
        }
        
        // Depth-First Search
        public static void dfs(Graph g, int v, boolean[] visited) {
            visited[v] = true;
            System.out.print(v + " ");
            
            for (Edge e : g.adj.get(v)) {
                if (!visited[e.dest]) {
                    dfs(g, e.dest, visited);
                }
            }
        }
        
        // Breadth-First Search
        public static void bfs(Graph g, int start) {
            boolean[] visited = new boolean[g.V];
            Queue<Integer> queue = new LinkedList<>();
            
            visited[start] = true;
            queue.offer(start);
            
            while (!queue.isEmpty()) {
                int v = queue.poll();
                System.out.print(v + " ");
                
                for (Edge e : g.adj.get(v)) {
                    if (!visited[e.dest]) {
                        visited[e.dest] = true;
                        queue.offer(e.dest);
                    }
                }
            }
        }
        
        // Cycle Detection using DFS
        public static boolean hasCycle(Graph g) {
            boolean[] visited = new boolean[g.V];
            boolean[] recStack = new boolean[g.V];
            
            for (int i = 0; i < g.V; i++) {
                if (hasCycleUtil(g, i, visited, recStack)) {
                    return true;
                }
            }
            return false;
        }
        
        private static boolean hasCycleUtil(Graph g, int v, boolean[] visited, boolean[] recStack) {
            if (recStack[v]) return true;
            if (visited[v]) return false;
            
            visited[v] = true;
            recStack[v] = true;
            
            for (Edge e : g.adj.get(v)) {
                if (hasCycleUtil(g, e.dest, visited, recStack)) {
                    return true;
                }
            }
            
            recStack[v] = false;
            return false;
        }
        
        // Topological Sort
        public static List<Integer> topologicalSort(Graph g) {
            boolean[] visited = new boolean[g.V];
            Stack<Integer> stack = new Stack<>();
            
            for (int i = 0; i < g.V; i++) {
                if (!visited[i]) {
                    topologicalSortUtil(g, i, visited, stack);
                }
            }
            
            List<Integer> result = new ArrayList<>();
            while (!stack.isEmpty()) {
                result.add(stack.pop());
            }
            return result;
        }
        
        private static void topologicalSortUtil(Graph g, int v, boolean[] visited, Stack<Integer> stack) {
            visited[v] = true;
            
            for (Edge e : g.adj.get(v)) {
                if (!visited[e.dest]) {
                    topologicalSortUtil(g, e.dest, visited, stack);
                }
            }
            
            stack.push(v);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "container/heap"
        "math"
    )

    // Graph representation
    type Edge struct {
        dest   int
        weight int
    }

    type Graph struct {
        V   int
        adj [][]Edge
    }

    func NewGraph(V int) *Graph {
        adj := make([][]Edge, V)
        for i := range adj {
            adj[i] = make([]Edge, 0)
        }
        return &Graph{V: V, adj: adj}
    }

    func (g *Graph) AddEdge(u, v, weight int) {
        g.adj[u] = append(g.adj[u], Edge{dest: v, weight: weight})
        g.adj[v] = append(g.adj[v], Edge{dest: u, weight: weight}) // For undirected graph
    }

    // Priority Queue implementation for Dijkstra
    type Item struct {
        vertex   int
        distance int
        index    int
    }

    type PriorityQueue []*Item

    func (pq PriorityQueue) Len() int           { return len(pq) }
    func (pq PriorityQueue) Less(i, j int) bool { return pq[i].distance < pq[j].distance }
    func (pq PriorityQueue) Swap(i, j int) {
        pq[i], pq[j] = pq[j], pq[i]
        pq[i].index = i
        pq[j].index = j
    }
    func (pq *PriorityQueue) Push(x interface{}) {
        n := len(*pq)
        item := x.(*Item)
        item.index = n
        *pq = append(*pq, item)
    }
    func (pq *PriorityQueue) Pop() interface{} {
        old := *pq
        n := len(old)
        item := old[n-1]
        old[n-1] = nil
        item.index = -1
        *pq = old[0 : n-1]
        return item
    }

    // Dijkstra's Algorithm
    func Dijkstra(g *Graph, src int) []int {
        dist := make([]int, g.V)
        visited := make([]bool, g.V)
        for i := range dist {
            dist[i] = math.MaxInt32
        }
        dist[src] = 0

        pq := make(PriorityQueue, 0)
        heap.Init(&pq)
        heap.Push(&pq, &Item{vertex: src, distance: 0})

        for pq.Len() > 0 {
            u := heap.Pop(&pq).(*Item).vertex
            if visited[u] {
                continue
            }
            visited[u] = true

            for _, e := range g.adj[u] {
                v := e.dest
                if !visited[v] && dist[u]+e.weight < dist[v] {
                    dist[v] = dist[u] + e.weight
                    heap.Push(&pq, &Item{vertex: v, distance: dist[v]})
                }
            }
        }
        return dist
    }

    // Depth-First Search
    func DFS(g *Graph, v int, visited []bool) {
        visited[v] = true
        println(v)

        for _, e := range g.adj[v] {
            if !visited[e.dest] {
                DFS(g, e.dest, visited)
            }
        }
    }

    // Breadth-First Search
    func BFS(g *Graph, start int) {
        visited := make([]bool, g.V)
        queue := make([]int, 0)

        visited[start] = true
        queue = append(queue, start)

        for len(queue) > 0 {
            v := queue[0]
            queue = queue[1:]
            println(v)

            for _, e := range g.adj[v] {
                if !visited[e.dest] {
                    visited[e.dest] = true
                    queue = append(queue, e.dest)
                }
            }
        }
    }

    // Cycle Detection
    func HasCycle(g *Graph) bool {
        visited := make([]bool, g.V)
        recStack := make([]bool, g.V)

        for i := 0; i < g.V; i++ {
            if hasCycleUtil(g, i, visited, recStack) {
                return true
            }
        }
        return false
    }

    func hasCycleUtil(g *Graph, v int, visited, recStack []bool) bool {
        if recStack[v] {
            return true
        }
        if visited[v] {
            return false
        }

        visited[v] = true
        recStack[v] = true

        for _, e := range g.adj[v] {
            if hasCycleUtil(g, e.dest, visited, recStack) {
                return true
            }
        }

        recStack[v] = false
        return false
    }

    // Topological Sort
    func TopologicalSort(g *Graph) []int {
        visited := make([]bool, g.V)
        stack := make([]int, 0)

        for i := 0; i < g.V; i++ {
            if !visited[i] {
                topologicalSortUtil(g, i, visited, &stack)
            }
        }

        // Reverse stack to get correct order
        result := make([]int, len(stack))
        for i := len(stack) - 1; i >= 0; i-- {
            result[len(stack)-1-i] = stack[i]
        }
        return result
    }

    func topologicalSortUtil(g *Graph, v int, visited []bool, stack *[]int) {
        visited[v] = true

        for _, e := range g.adj[v] {
            if !visited[e.dest] {
                topologicalSortUtil(g, e.dest, visited, stack)
            }
        }

        *stack = append(*stack, v)
    }
    ```
  </TabItem>
</Tabs>

## Related Patterns 🔄

1. **Observer Pattern**
    - Graph change notifications
    - Event propagation

2. **Strategy Pattern**
    - Different traversal strategies
    - Path finding algorithms

3. **Iterator Pattern**
    - Graph traversal
    - Path iteration

## Best Practices 👍

### Configuration
1. **Graph Representation**
    - Adjacency list for sparse graphs
    - Adjacency matrix for dense graphs
    - Edge list for algorithms like Kruskal's

2. **Algorithm Selection**
    - Based on graph properties
    - Performance requirements
    - Memory constraints

### Monitoring
1. **Performance Metrics**
    - Execution time
    - Memory usage
    - Operation counts

2. **Algorithm Behavior**
    - Convergence monitoring
    - Path quality
    - Resource utilization

### Testing
1. **Graph Types**
    - Different sizes
    - Various densities
    - Special cases

2. **Algorithm Testing**
    - Correctness verification
    - Performance benchmarks
    - Edge cases

## Common Pitfalls ⚠️

1. **Incorrect Graph Representation**
    - Wrong data structure
    - Solution: Match to use case

2. **Memory Issues**
    - Large graphs
    - Solution: Efficient storage

3. **Performance Problems**
    - Poor algorithm choice
    - Solution: Proper algorithm selection

## Use Cases 🎯

### 1. Navigation Systems
- **Usage**: Shortest path finding
- **Why**: Route optimization
- **Implementation**: Dijkstra/A*

### 2. Social Networks
- **Usage**: Community detection
- **Why**: Connection analysis
- **Implementation**: BFS/DFS

### 3. Network Design
- **Usage**: Minimum spanning tree
- **Why**: Cost optimization
- **Implementation**: Prim's/Kruskal's

## Deep Dive Topics 🤿

### Thread Safety

1. **Concurrent Processing**
    - Parallel algorithms
    - Lock strategies
    - Thread-safe data structures

2. **Parallel Graph Algorithms**
    - Parallel BFS
    - Distributed shortest paths
    - Concurrent updates

### Performance

1. **Time Complexity**
    - BFS: O(V + E)
    - Dijkstra: O(E log V)
    - Floyd-Warshall: O(V³)

2. **Space Optimization**
    - Compressed graphs
    - Memory-efficient representations
    - Cache optimization

### Distributed Systems

1. **Distributed Algorithms**
    - Partitioning strategies
    - Communication protocols
    - Consistency models

## Additional Resources 📚

### References
1. "Introduction to Algorithms" - CLRS
2. "Algorithm Design" - Kleinberg & Tardos
3. "Graph Algorithms" - Shimon Even

### Tools
1. Graph Visualization Libraries
    - GraphViz
    - D3.js
    - Cytoscape

2. Algorithm Visualizers
    - Algorithm Visualizer
    - VisuAlgo

## FAQs ❓

### Q: How to choose between different shortest path algorithms?
A: Consider:
- Negative weights: Bellman-Ford
- Non-negative weights: Dijkstra
- All pairs: Floyd-Warshall
- Heuristic available: A*

### Q: When to use DFS vs BFS?
A: Choose based on:
- Memory constraints (DFS uses less)
- Path finding requirements

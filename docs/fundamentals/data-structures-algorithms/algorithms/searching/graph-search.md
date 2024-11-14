---
sidebar_position: 2
title: "Graph Search"
description: "Graph Search Algorithms"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Graph Search Algorithms

## Overview

Graph search algorithms are techniques for exploring or traversing nodes and edges in a graph data structure. These algorithms help find paths, detect cycles, identify connected components, and solve various graph-related problems.

### Real-World Analogy
Think of a city's road network where intersections are nodes and roads are edges. Finding the best route from one location to another is like running a graph search algorithm - you explore possible paths through the network until you reach your destination.

## 🎯 Key Concepts

### Components
1. **Graph Elements**
    - Nodes/Vertices
    - Edges (directed/undirected)
    - Weights (for weighted graphs)

2. **Search Types**
    - Breadth-First Search (BFS)
    - Depth-First Search (DFS)
    - Bidirectional Search
    - A* Search

3. **Data Structures**
    - Adjacency List/Matrix
    - Queue (BFS)
    - Stack (DFS)
    - Priority Queue (A*)

## 💻 Implementation

### Basic Graph Search Implementations

<Tabs>
  <TabItem value="java" label="Java">
```java
import java.util.*;

public class GraphSearch {
// Graph representation using adjacency list
static class Graph<T> {
private Map<T, List<T>> adjacencyList = new HashMap<>();

        public void addVertex(T vertex) {
            adjacencyList.putIfAbsent(vertex, new ArrayList<>());
        }
        
        public void addEdge(T source, T destination) {
            adjacencyList.get(source).add(destination);
        }
        
        // BFS implementation
        public List<T> bfs(T start) {
            List<T> result = new ArrayList<>();
            Set<T> visited = new HashSet<>();
            Queue<T> queue = new LinkedList<>();
            
            queue.offer(start);
            visited.add(start);
            
            while (!queue.isEmpty()) {
                T vertex = queue.poll();
                result.add(vertex);
                
                for (T neighbor : adjacencyList.get(vertex)) {
                    if (!visited.contains(neighbor)) {
                        visited.add(neighbor);
                        queue.offer(neighbor);
                    }
                }
            }
            
            return result;
        }
        
        // DFS implementation
        public List<T> dfs(T start) {
            List<T> result = new ArrayList<>();
            Set<T> visited = new HashSet<>();
            dfsHelper(start, visited, result);
            return result;
        }
        
        private void dfsHelper(T vertex, Set<T> visited, List<T> result) {
            visited.add(vertex);
            result.add(vertex);
            
            for (T neighbor : adjacencyList.get(vertex)) {
                if (!visited.contains(neighbor)) {
                    dfsHelper(neighbor, visited, result);
                }
            }
        }
        
        // A* Search implementation for weighted graphs
        public List<T> astar(T start, T goal, Map<T, Double> heuristic) {
            Map<T, T> cameFrom = new HashMap<>();
            Map<T, Double> gScore = new HashMap<>();
            Map<T, Double> fScore = new HashMap<>();
            PriorityQueue<T> openSet = new PriorityQueue<>(
                Comparator.comparingDouble(node -> fScore.getOrDefault(node, Double.MAX_VALUE))
            );
            
            gScore.put(start, 0.0);
            fScore.put(start, heuristic.get(start));
            openSet.add(start);
            
            while (!openSet.isEmpty()) {
                T current = openSet.poll();
                
                if (current.equals(goal)) {
                    return reconstructPath(cameFrom, current);
                }
                
                for (T neighbor : adjacencyList.get(current)) {
                    double tentativeGScore = gScore.get(current) + 1; // Assuming unit edge weights
                    
                    if (tentativeGScore < gScore.getOrDefault(neighbor, Double.MAX_VALUE)) {
                        cameFrom.put(neighbor, current);
                        gScore.put(neighbor, tentativeGScore);
                        fScore.put(neighbor, tentativeGScore + heuristic.get(neighbor));
                        
                        if (!openSet.contains(neighbor)) {
                            openSet.add(neighbor);
                        }
                    }
                }
            }
            
            return Collections.emptyList(); // Path not found
        }
        
        private List<T> reconstructPath(Map<T, T> cameFrom, T current) {
            List<T> path = new ArrayList<>();
            path.add(current);
            
            while (cameFrom.containsKey(current)) {
                current = cameFrom.get(current);
                path.add(0, current);
            }
            
            return path;
        }
    }
}
```
  </TabItem>
  <TabItem value="go" label="Go">
```go
package graph

import (
    "container/heap"
    "math"
)

// Graph represents a graph using adjacency list
type Graph struct {
    adjacencyList map[interface{}][]interface{}
}

// NewGraph creates a new graph
func NewGraph() *Graph {
    return &Graph{
        adjacencyList: make(map[interface{}][]interface{}),
    }
}

// AddVertex adds a vertex to the graph
func (g *Graph) AddVertex(vertex interface{}) {
    if _, exists := g.adjacencyList[vertex]; !exists {
        g.adjacencyList[vertex] = []interface{}{}
    }
}

// AddEdge adds an edge to the graph
func (g *Graph) AddEdge(source, destination interface{}) {
    g.adjacencyList[source] = append(g.adjacencyList[source], destination)
}

// BFS performs breadth-first search
func (g *Graph) BFS(start interface{}) []interface{} {
    result := make([]interface{}, 0)
    visited := make(map[interface{}]bool)
    queue := make([]interface{}, 0)
    
    queue = append(queue, start)
    visited[start] = true
    
    for len(queue) > 0 {
        vertex := queue[0]
        queue = queue[1:]
        result = append(result, vertex)
        
        for _, neighbor := range g.adjacencyList[vertex] {
            if !visited[neighbor] {
                visited[neighbor] = true
                queue = append(queue, neighbor)
            }
        }
    }
    
    return result
}

// DFS performs depth-first search
func (g *Graph) DFS(start interface{}) []interface{} {
    result := make([]interface{}, 0)
    visited := make(map[interface{}]bool)
    g.dfsHelper(start, visited, &result)
    return result
}

func (g *Graph) dfsHelper(vertex interface{}, visited map[interface{}]bool, result *[]interface{}) {
    visited[vertex] = true
    *result = append(*result, vertex)
    
    for _, neighbor := range g.adjacencyList[vertex] {
        if !visited[neighbor] {
            g.dfsHelper(neighbor, visited, result)
        }
    }
}

// PriorityQueue implementation for A*
type PriorityQueue struct {
    items []interface{}
    fScore map[interface{}]float64
}

func (pq PriorityQueue) Len() int { return len(pq.items) }
func (pq PriorityQueue) Less(i, j int) bool {
    return pq.fScore[pq.items[i]] < pq.fScore[pq.items[j]]
}
func (pq PriorityQueue) Swap(i, j int) {
    pq.items[i], pq.items[j] = pq.items[j], pq.items[i]
}
func (pq *PriorityQueue) Push(x interface{}) {
    pq.items = append(pq.items, x)
}
func (pq *PriorityQueue) Pop() interface{} {
    old := pq.items
    n := len(old)
    item := old[n-1]
    pq.items = old[0 : n-1]
    return item
}

// AStar performs A* search
func (g *Graph) AStar(start, goal interface{}, heuristic map[interface{}]float64) []interface{} {
    cameFrom := make(map[interface{}]interface{})
    gScore := make(map[interface{}]float64)
    fScore := make(map[interface{}]float64)
    
    for vertex := range g.adjacencyList {
        gScore[vertex] = math.Inf(1)
        fScore[vertex] = math.Inf(1)
    }
    
    gScore[start] = 0
    fScore[start] = heuristic[start]
    
    openSet := &PriorityQueue{
        items: []interface{}{start},
        fScore: fScore,
    }
    heap.Init(openSet)
    
    for openSet.Len() > 0 {
        current := heap.Pop(openSet).(interface{})
        
        if current == goal {
            return g.reconstructPath(cameFrom, current)
        }
        
        for _, neighbor := range g.adjacencyList[current] {
            tentativeGScore := gScore[current] + 1 // Assuming unit edge weights
            
            if tentativeGScore < gScore[neighbor] {
                cameFrom[neighbor] = current
                gScore[neighbor] = tentativeGScore
                fScore[neighbor] = tentativeGScore + heuristic[neighbor]
                heap.Push(openSet, neighbor)
            }
        }
    }
    
    return []interface{}{} // Path not found
}

func (g *Graph) reconstructPath(cameFrom map[interface{}]interface{}, current interface{}) []interface{} {
    path := []interface{}{current}
    
    for {
        if prev, exists := cameFrom[current]; exists {
            path = append([]interface{}{prev}, path...)
            current = prev
        } else {
            break
        }
    }
    
    return path
}
```
  </TabItem>
</Tabs>

## 🔗 Related Patterns

1. **Backtracking**
    - Similar to DFS exploration
    - State space traversal
    - Solution verification

2. **Dynamic Programming**
    - Path optimization
    - Shortest path algorithms
    - Cycle detection

3. **Greedy Algorithms**
    - Best-first search
    - Minimum spanning trees
    - Path finding

## ⚙️ Best Practices

### Configuration
- Choose appropriate graph representation
- Set proper visit tracking
- Configure search parameters
- Handle cycles properly

### Monitoring
- Track visited nodes
- Monitor memory usage
- Log search progress
- Time execution

### Testing
- Test with different graph types
- Verify cycle handling
- Check edge cases
- Validate path correctness

## ⚠️ Common Pitfalls

1. **Infinite Loops**
    - Solution: Proper cycle detection
    - Track visited nodes carefully

2. **Memory Overflow**
    - Solution: Iterative over recursive implementation
    - Memory-efficient data structures

3. **Poor Performance**
    - Solution: Optimize graph representation
    - Choose appropriate algorithm

## 🎯 Use Cases

### 1. Social Networks
- Friend recommendations
- Connection paths
- Community detection

### 2. Navigation Systems
- Route finding
- Traffic optimization
- Alternative paths

### 3. Network Analysis
- Network topology
- Fault detection
- Resource allocation

## 🔍 Deep Dive Topics

### Thread Safety
- Concurrent graph traversal
- Parallel search algorithms
- Synchronized data structures

### Distributed Systems
- Distributed graph processing
- Partition strategies
- Network optimization

### Performance Optimization
- Memory locality
- Cache efficiency
- Algorithm selection

## 📚 Additional Resources

### References
1. Introduction to Algorithms (CLRS)
2. Graph Theory and Applications
3. Network Flows: Theory and Applications

### Tools
- Graph visualization libraries
- Performance profilers
- Testing frameworks

## ❓ FAQs

### Q: When should I use BFS vs DFS?
A: Use BFS for:
- Shortest path in unweighted graphs
- Level-wise traversal
- Closer neighbors first
  Use DFS for:
- Memory efficiency
- Path finding
- Cycle detection

### Q: How do I handle disconnected components?
A: Implement a wrapper function that iterates through all vertices and initiates search for unvisited nodes.

### Q: What's the best way to represent a graph?
A: Choose based on:
- Graph density (sparse vs dense)
- Operation frequency
- Memory constraints
- Access patterns

### Q: How do I optimize graph search for large graphs?
A: Consider:
- Bidirectional search
- Parallel processing
- Memory-efficient structures
- Pruning techniques


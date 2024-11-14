---
sidebar_position: 1
title: "Greedy"
description: "Greedy Algorithm"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🎯 Greedy Algorithms

## Overview

Greedy algorithms make locally optimal choices at each step, hoping to find a global optimum. While they don't always yield the best solution, they're often used for their simplicity and efficiency when the local optimal choice leads to a globally optimal solution.

### Real-World Analogy
Imagine making change with coins. You start with the largest denomination and work your way down, always choosing the biggest coin that fits. While this works for most currency systems (like US coins), it might not always give the optimal solution in all cases, just like greedy algorithms.

## 🎯 Key Concepts

### Components
1. **Greedy Choice Property**
    - Local optimal choice
    - Current best option
    - No backtracking

2. **Optimal Substructure**
    - Problem can be broken down
    - Subproblems are independent
    - Solutions combine optimally

3. **Selection Function**
    - Chooses next element
    - Defines optimization criteria
    - Determines priority

## 💻 Implementation

### Classic Greedy Problems

<Tabs>
  <TabItem value="java" label="Java">
```java
import java.util.*;

public class GreedyAlgorithms {
// Fractional Knapsack
public static class Item {
int weight;
int value;

        public Item(int weight, int value) {
            this.weight = weight;
            this.value = value;
        }
        
        public double getValuePerWeight() {
            return (double) value / weight;
        }
    }
    
    public static double fractionalKnapsack(Item[] items, int capacity) {
        // Sort items by value per weight in descending order
        Arrays.sort(items, (a, b) -> 
            Double.compare(b.getValuePerWeight(), a.getValuePerWeight()));
        
        double totalValue = 0.0;
        int currentWeight = 0;
        
        for (Item item : items) {
            if (currentWeight + item.weight <= capacity) {
                // Take whole item
                currentWeight += item.weight;
                totalValue += item.value;
            } else {
                // Take fraction of the item
                int remainingWeight = capacity - currentWeight;
                totalValue += item.getValuePerWeight() * remainingWeight;
                break;
            }
        }
        
        return totalValue;
    }
    
    // Activity Selection
    public static class Activity {
        int start, finish;
        
        public Activity(int start, int finish) {
            this.start = start;
            this.finish = finish;
        }
    }
    
    public static List<Activity> activitySelection(Activity[] activities) {
        // Sort activities by finish time
        Arrays.sort(activities, (a, b) -> a.finish - b.finish);
        
        List<Activity> selected = new ArrayList<>();
        selected.add(activities[0]);
        
        int lastFinish = activities[0].finish;
        
        for (int i = 1; i < activities.length; i++) {
            if (activities[i].start >= lastFinish) {
                selected.add(activities[i]);
                lastFinish = activities[i].finish;
            }
        }
        
        return selected;
    }
    
    // Huffman Coding
    public static class HuffmanNode {
        char ch;
        int freq;
        HuffmanNode left, right;
        
        public HuffmanNode(char ch, int freq) {
            this.ch = ch;
            this.freq = freq;
        }
    }
    
    public static Map<Character, String> huffmanCoding(Map<Character, Integer> frequencies) {
        PriorityQueue<HuffmanNode> pq = new PriorityQueue<>(
            (a, b) -> a.freq - b.freq
        );
        
        // Create leaf nodes
        for (Map.Entry<Character, Integer> entry : frequencies.entrySet()) {
            pq.offer(new HuffmanNode(entry.getKey(), entry.getValue()));
        }
        
        // Build Huffman tree
        while (pq.size() > 1) {
            HuffmanNode left = pq.poll();
            HuffmanNode right = pq.poll();
            
            HuffmanNode parent = new HuffmanNode('\0', left.freq + right.freq);
            parent.left = left;
            parent.right = right;
            
            pq.offer(parent);
        }
        
        // Generate codes
        Map<Character, String> codes = new HashMap<>();
        generateCodes(pq.peek(), "", codes);
        
        return codes;
    }
    
    private static void generateCodes(HuffmanNode node, String code, 
                                    Map<Character, String> codes) {
        if (node == null) return;
        
        if (node.ch != '\0') {
            codes.put(node.ch, code);
        }
        
        generateCodes(node.left, code + "0", codes);
        generateCodes(node.right, code + "1", codes);
    }
}
```
  </TabItem>
  <TabItem value="go" label="Go">
```go
package greedy

import (
    "container/heap"
    "sort"
)

// Item represents an item for Fractional Knapsack
type Item struct {
    Weight int
    Value  int
}

func (i Item) ValuePerWeight() float64 {
    return float64(i.Value) / float64(i.Weight)
}

// FractionalKnapsack solves the fractional knapsack problem
func FractionalKnapsack(items []Item, capacity int) float64 {
    // Sort items by value per weight
    sort.Slice(items, func(i, j int) bool {
        return items[i].ValuePerWeight() > items[j].ValuePerWeight()
    })
    
    totalValue := 0.0
    currentWeight := 0
    
    for _, item := range items {
        if currentWeight+item.Weight <= capacity {
            // Take whole item
            currentWeight += item.Weight
            totalValue += float64(item.Value)
        } else {
            // Take fraction of the item
            remainingWeight := capacity - currentWeight
            totalValue += item.ValuePerWeight() * float64(remainingWeight)
            break
        }
    }
    
    return totalValue
}

// Activity represents an activity for Activity Selection
type Activity struct {
    Start  int
    Finish int
}

// ActivitySelection solves the activity selection problem
func ActivitySelection(activities []Activity) []Activity {
    // Sort activities by finish time
    sort.Slice(activities, func(i, j int) bool {
        return activities[i].Finish < activities[j].Finish
    })
    
    selected := []Activity{activities[0]}
    lastFinish := activities[0].Finish
    
    for i := 1; i < len(activities); i++ {
        if activities[i].Start >= lastFinish {
            selected = append(selected, activities[i])
            lastFinish = activities[i].Finish
        }
    }
    
    return selected
}

// HuffmanNode represents a node in Huffman tree
type HuffmanNode struct {
    Ch    rune
    Freq  int
    Left  *HuffmanNode
    Right *HuffmanNode
}

// HuffmanHeap implements heap.Interface
type HuffmanHeap []*HuffmanNode

func (h HuffmanHeap) Len() int           { return len(h) }
func (h HuffmanHeap) Less(i, j int) bool { return h[i].Freq < h[j].Freq }
func (h HuffmanHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *HuffmanHeap) Push(x interface{}) { *h = append(*h, x.(*HuffmanNode)) }
func (h *HuffmanHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

// HuffmanCoding generates Huffman codes for characters
func HuffmanCoding(frequencies map[rune]int) map[rune]string {
    // Create priority queue
    h := &HuffmanHeap{}
    heap.Init(h)
    
    // Create leaf nodes
    for ch, freq := range frequencies {
        heap.Push(h, &HuffmanNode{Ch: ch, Freq: freq})
    }
    
    // Build Huffman tree
    for h.Len() > 1 {
        left := heap.Pop(h).(*HuffmanNode)
        right := heap.Pop(h).(*HuffmanNode)
        
        parent := &HuffmanNode{
            Ch:    0,
            Freq:  left.Freq + right.Freq,
            Left:  left,
            Right: right,
        }
        
        heap.Push(h, parent)
    }
    
    // Generate codes
    codes := make(map[rune]string)
    generateCodes((*h)[0], "", codes)
    
    return codes
}

func generateCodes(node *HuffmanNode, code string, codes map[rune]string) {
    if node == nil {
        return
    }
    
    if node.Ch != 0 {
        codes[node.Ch] = code
    }
    
    generateCodes(node.Left, code+"0", codes)
    generateCodes(node.Right, code+"1", codes)
}
```
  </TabItem>
</Tabs>

## 🔗 Related Patterns

1. **Dynamic Programming**
    - Similar optimal substructure
    - More comprehensive solution space
    - Guaranteed optimality

2. **Divide and Conquer**
    - Problem decomposition
    - Independent subproblems
    - Solution combination

3. **Branch and Bound**
    - Similar optimization goals
    - More exhaustive search
    - Guarantees optimality

## ⚙️ Best Practices

### Configuration
- Define clear selection criteria
- Validate problem properties
- Optimize data structures
- Handle edge cases

### Monitoring
- Track solution quality
- Measure performance
- Log decision points
- Validate optimality

### Testing
- Verify correctness
- Test edge cases
- Benchmark performance
- Compare with alternatives

## ⚠️ Common Pitfalls

1. **Wrong Problem Type**
    - Solution: Verify greedy choice property
    - Check optimal substructure

2. **Incorrect Selection Criteria**
    - Solution: Validate selection function
    - Test with various inputs

3. **Local Optima Trap**
    - Solution: Verify global optimality
    - Consider alternatives

## 🎯 Use Cases

### 1. Resource Scheduling
- Task allocation
- CPU scheduling
- Memory management

### 2. Network Design
- Routing protocols
- Load balancing
- Bandwidth allocation

### 3. Data Compression
- Huffman coding
- File compression
- Stream encoding

## 🔍 Deep Dive Topics

### Thread Safety
- Concurrent selection
- Resource locking
- Atomic operations

### Distributed Systems
- Distributed decision making
- Consensus protocols
- Network optimization

### Performance Optimization
- Data structure selection
- Algorithm tuning
- Memory efficiency

## 📚 Additional Resources

### References
1. "Introduction to Algorithms" (CLRS)
2. "Algorithm Design Manual" by Skiena
3. "Programming Pearls" by Bentley

### Tools
- Optimization libraries
- Profiling tools
- Benchmarking frameworks

## ❓ FAQs

### Q: When should I use greedy algorithms?
A: Use greedy when:
- Local choices lead to global optimum
- Problem has optimal substructure
- Quick solution is needed
- Approximation is acceptable

### Q: How do I prove greedy correctness?
A: Consider:
- Greedy choice property
- Optimal substructure
- Exchange arguments
- Induction proofs

### Q: What are alternatives to greedy?
A: Consider:
- Dynamic programming
- Branch and bound
- Integer programming
- Heuristic search

### Q: How do I handle sub-optimal solutions?
A: Consider:
- Solution quality bounds
- Multiple criteria
- Hybrid approaches
- Post-processing optimization

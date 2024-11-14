---
sidebar_position: 1
title: "Memoization"
description: "Memoization Algorithms"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🧠 Dynamic Programming: Memoization Approach

## Overview

Memoization is a top-down approach in dynamic programming where solutions to subproblems are cached and reused during recursive calls. Unlike tabulation, memoization computes solutions only for needed subproblems and maintains a natural recursive structure.

### Real-World Analogy
Think of solving a jigsaw puzzle where you take photos of completed sections. Instead of rebuilding a section when you need to reference it again, you look at the photo. Similarly, memoization stores solutions to subproblems so they don't need to be recalculated.

## 🎯 Key Concepts

### Components
1. **Cache Structure**
    - Storage mechanism
    - Key design
    - Value representation

2. **Recursive Function**
    - Base cases
    - State transitions
    - Cache integration

3. **State Management**
    - Problem decomposition
    - State representation
    - Cache invalidation

## 💻 Implementation

### Classic Dynamic Programming Problems Using Memoization

<Tabs>
  <TabItem value="java" label="Java">
```java
import java.util.*;

public class DynamicProgramming {
// Fibonacci using memoization
public static long fibonacci(int n) {
return fibonacciMemo(n, new HashMap<>());
}

    private static long fibonacciMemo(int n, Map<Integer, Long> memo) {
        if (n <= 1) return n;
        
        if (memo.containsKey(n)) {
            return memo.get(n);
        }
        
        long result = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);
        memo.put(n, result);
        return result;
    }
    
    // Longest Common Subsequence
    public static int lcs(String text1, String text2) {
        int[][] memo = new int[text1.length()][text2.length()];
        for (int[] row : memo) {
            Arrays.fill(row, -1);
        }
        return lcsHelper(text1, text2, text1.length() - 1, text2.length() - 1, memo);
    }
    
    private static int lcsHelper(String text1, String text2, int i, int j, int[][] memo) {
        if (i < 0 || j < 0) return 0;
        
        if (memo[i][j] != -1) {
            return memo[i][j];
        }
        
        if (text1.charAt(i) == text2.charAt(j)) {
            memo[i][j] = 1 + lcsHelper(text1, text2, i - 1, j - 1, memo);
        } else {
            memo[i][j] = Math.max(
                lcsHelper(text1, text2, i - 1, j, memo),
                lcsHelper(text1, text2, i, j - 1, memo)
            );
        }
        
        return memo[i][j];
    }
    
    // 0/1 Knapsack
    public static int knapsack(int[] weights, int[] values, int capacity) {
        Integer[][] memo = new Integer[weights.length][capacity + 1];
        return knapsackHelper(weights, values, capacity, weights.length - 1, memo);
    }
    
    private static int knapsackHelper(int[] weights, int[] values, int capacity, 
                                    int index, Integer[][] memo) {
        if (index < 0 || capacity <= 0) {
            return 0;
        }
        
        if (memo[index][capacity] != null) {
            return memo[index][capacity];
        }
        
        if (weights[index] > capacity) {
            memo[index][capacity] = knapsackHelper(weights, values, capacity, 
                                                 index - 1, memo);
            return memo[index][capacity];
        }
        
        memo[index][capacity] = Math.max(
            values[index] + knapsackHelper(weights, values, 
                                         capacity - weights[index], index - 1, memo),
            knapsackHelper(weights, values, capacity, index - 1, memo)
        );
        
        return memo[index][capacity];
    }
    
    // Edit Distance
    public static int editDistance(String word1, String word2) {
        int[][] memo = new int[word1.length()][word2.length()];
        for (int[] row : memo) {
            Arrays.fill(row, -1);
        }
        return editDistanceHelper(word1, word2, word1.length() - 1, 
                                word2.length() - 1, memo);
    }
    
    private static int editDistanceHelper(String word1, String word2, int i, int j, 
                                        int[][] memo) {
        if (i < 0) return j + 1;
        if (j < 0) return i + 1;
        
        if (memo[i][j] != -1) {
            return memo[i][j];
        }
        
        if (word1.charAt(i) == word2.charAt(j)) {
            memo[i][j] = editDistanceHelper(word1, word2, i - 1, j - 1, memo);
        } else {
            memo[i][j] = 1 + Math.min(
                editDistanceHelper(word1, word2, i - 1, j - 1, memo),  // replace
                Math.min(
                    editDistanceHelper(word1, word2, i - 1, j, memo),  // delete
                    editDistanceHelper(word1, word2, i, j - 1, memo)   // insert
                )
            );
        }
        
        return memo[i][j];
    }
}
```
  </TabItem>
  <TabItem value="go" label="Go">
```go
package dp

// Fibonacci using memoization
func Fibonacci(n int) int64 {
    memo := make(map[int]int64)
    return fibonacciMemo(n, memo)
}

func fibonacciMemo(n int, memo map[int]int64) int64 {
    if n <= 1 {
        return int64(n)
    }
    
    if val, exists := memo[n]; exists {
        return val
    }
    
    memo[n] = fibonacciMemo(n-1, memo) + fibonacciMemo(n-2, memo)
    return memo[n]
}

// LongestCommonSubsequence using memoization
func LCS(text1, text2 string) int {
    memo := make([][]int, len(text1))
    for i := range memo {
        memo[i] = make([]int, len(text2))
        for j := range memo[i] {
            memo[i][j] = -1
        }
    }
    return lcsHelper(text1, text2, len(text1)-1, len(text2)-1, memo)
}

func lcsHelper(text1, text2 string, i, j int, memo [][]int) int {
    if i < 0 || j < 0 {
        return 0
    }
    
    if memo[i][j] != -1 {
        return memo[i][j]
    }
    
    if text1[i] == text2[j] {
        memo[i][j] = 1 + lcsHelper(text1, text2, i-1, j-1, memo)
    } else {
        memo[i][j] = max(
            lcsHelper(text1, text2, i-1, j, memo),
            lcsHelper(text1, text2, i, j-1, memo),
        )
    }
    
    return memo[i][j]
}

// Knapsack using memoization
func Knapsack(weights, values []int, capacity int) int {
    memo := make([][]int, len(weights))
    for i := range memo {
        memo[i] = make([]int, capacity+1)
        for j := range memo[i] {
            memo[i][j] = -1
        }
    }
    return knapsackHelper(weights, values, capacity, len(weights)-1, memo)
}

func knapsackHelper(weights, values []int, capacity, index int, 
                   memo [][]int) int {
    if index < 0 || capacity <= 0 {
        return 0
    }
    
    if memo[index][capacity] != -1 {
        return memo[index][capacity]
    }
    
    if weights[index] > capacity {
        memo[index][capacity] = knapsackHelper(weights, values, capacity, 
                                             index-1, memo)
        return memo[index][capacity]
    }
    
    memo[index][capacity] = max(
        values[index]+knapsackHelper(weights, values, 
                                   capacity-weights[index], index-1, memo),
        knapsackHelper(weights, values, capacity, index-1, memo),
    )
    
    return memo[index][capacity]
}

// EditDistance using memoization
func EditDistance(word1, word2 string) int {
    memo := make([][]int, len(word1))
    for i := range memo {
        memo[i] = make([]int, len(word2))
        for j := range memo[i] {
            memo[i][j] = -1
        }
    }
    return editDistanceHelper(word1, word2, len(word1)-1, len(word2)-1, memo)
}

func editDistanceHelper(word1, word2 string, i, j int, memo [][]int) int {
    if i < 0 {
        return j + 1
    }
    if j < 0 {
        return i + 1
    }
    
    if memo[i][j] != -1 {
        return memo[i][j]
    }
    
    if word1[i] == word2[j] {
        memo[i][j] = editDistanceHelper(word1, word2, i-1, j-1, memo)
    } else {
        memo[i][j] = 1 + min(
            editDistanceHelper(word1, word2, i-1, j-1, memo), // replace
            min(
                editDistanceHelper(word1, word2, i-1, j, memo),   // delete
                editDistanceHelper(word1, word2, i, j-1, memo),   // insert
            ),
        )
    }
    
    return memo[i][j]
}

func max(a, b int) int {
    if a > b {
        return a
    }
    return b
}

func min(a, b int) int {
    if a < b {
        return a
    }
    return b
}
```
  </TabItem>
</Tabs>

## 🔗 Related Patterns

1. **Tabulation (Bottom-Up)**
    - Iterative approach
    - Complete subproblem solution
    - Space optimization options

2. **Recursion with Backtracking**
    - State exploration
    - Solution construction
    - No caching

3. **Divide and Conquer**
    - Problem decomposition
    - No solution caching
    - Independent subproblems

## ⚙️ Best Practices

### Configuration
- Choose appropriate cache structure
- Design efficient state representation
- Handle cache invalidation
- Optimize memory usage

### Monitoring
- Track cache hits/misses
- Monitor memory usage
- Log recursion depth
- Profile performance

### Testing
- Verify base cases
- Test cache behavior
- Check memory limits
- Validate solutions

## ⚠️ Common Pitfalls

1. **Stack Overflow**
    - Solution: Consider tail recursion
    - Monitor stack depth
    - Switch to iteration if needed

2. **Inefficient Cache Keys**
    - Solution: Design compact state representation
    - Use efficient data structures

3. **Memory Leaks**
    - Solution: Implement cache cleanup
    - Monitor memory usage
    - Clear unnecessary entries

## 🎯 Use Cases

### 1. String Processing
- DNA sequence alignment
- String similarity
- Pattern matching

### 2. Financial Calculations
- Investment strategies
- Trading algorithms
- Risk analysis

### 3. Path Finding
- Game strategies
- Robot navigation
- Network routing

## 🔍 Deep Dive Topics

### Thread Safety
- Concurrent cache access
- Synchronized memoization
- Thread-local caching

### Distributed Systems
- Distributed caching
- Cache synchronization
- Network latency handling

### Performance Optimization
- Cache eviction policies
- Memory management
- State compression

## 📚 Additional Resources

### References
1. "Dynamic Programming for Interviews"
2. "Algorithm Design Manual" by Skiena
3. "Introduction to Algorithms" (CLRS)

### Tools
- Profiling tools
- Memory analyzers
- Cache visualization tools

## ❓ FAQs

### Q: When should I use memoization over tabulation?
A: Use memoization when:
- Not all subproblems are needed
- Natural recursive structure exists
- Space optimization isn't critical
- Problem state is complex

### Q: How do I handle cache overflow?
A: Consider:
- Cache eviction strategies
- State compression
- Partial memoization
- Bounded caches

### Q: What's the best way to design cache keys?
A: Consider:
- State uniqueness
- Memory efficiency
- Access speed
- Collision avoidance

### Q: How do I debug memoized solutions?
A: Use:
- Cache hit/miss logging
- State visualization
- Recursion tracking
- Memory profiling

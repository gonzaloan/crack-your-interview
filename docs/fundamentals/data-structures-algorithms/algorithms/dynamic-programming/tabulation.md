---
sidebar_position: 2
title: "Tabulation"
description: "Tabulation Algorithms"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📊 Dynamic Programming: Tabulation Approach

## Overview

Tabulation is a bottom-up approach in dynamic programming where solutions to subproblems are built iteratively using a table, starting from the simplest cases and working up to the desired solution. Unlike memoization, tabulation solves problems in a systematic order and avoids recursive overhead.

### Real-World Analogy
Think of building a pyramid: you start by laying the base blocks completely, then build each subsequent layer using the support of completed layers below. Similarly, tabulation solves simpler subproblems first and uses their results to solve more complex ones.

## 🎯 Key Concepts

### Components
1. **Table Structure**
    - Dimensional analysis
    - State representation
    - Result storage

2. **Base Cases**
    - Initial values
    - Boundary conditions
    - Starting points

3. **State Transitions**
    - Recurrence relations
    - Value dependencies
    - Update rules

4. **Table Access Pattern**
    - Iteration order
    - Dependency management
    - Space optimization

## 💻 Implementation

### Classic Dynamic Programming Problems Using Tabulation

<Tabs>
  <TabItem value="java" label="Java">
```java
public class DynamicProgramming {
    // Fibonacci using tabulation
    public static long fibonacci(int n) {
        if (n <= 1) return n;

        long[] dp = new long[n + 1];
        dp[0] = 0;
        dp[1] = 1;
        
        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i-1] + dp[i-2];
        }
        
        return dp[n];
    }
    
    // Longest Common Subsequence
    public static int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length();
        int n = text2.length();
        int[][] dp = new int[m + 1][n + 1];
        
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i-1) == text2.charAt(j-1)) {
                    dp[i][j] = dp[i-1][j-1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
                }
            }
        }
        
        return dp[m][n];
    }
    
    // 0/1 Knapsack Problem
    public static int knapsack(int[] weights, int[] values, int capacity) {
        int n = weights.length;
        int[][] dp = new int[n + 1][capacity + 1];
        
        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= capacity; w++) {
                if (weights[i-1] <= w) {
                    dp[i][w] = Math.max(
                        values[i-1] + dp[i-1][w - weights[i-1]],
                        dp[i-1][w]
                    );
                } else {
                    dp[i][w] = dp[i-1][w];
                }
            }
        }
        
        return dp[n][capacity];
    }
    
    // Matrix Chain Multiplication
    public static int matrixChainMultiplication(int[] dimensions) {
        int n = dimensions.length - 1;
        int[][] dp = new int[n][n];
        
        // Initialize for length 1
        for (int i = 0; i < n; i++) {
            dp[i][i] = 0;
        }
        
        // Fill table by chain length
        for (int len = 2; len <= n; len++) {
            for (int i = 0; i < n - len + 1; i++) {
                int j = i + len - 1;
                dp[i][j] = Integer.MAX_VALUE;
                
                for (int k = i; k < j; k++) {
                    int cost = dp[i][k] + dp[k+1][j] + 
                              dimensions[i] * dimensions[k+1] * dimensions[j+1];
                    dp[i][j] = Math.min(dp[i][j], cost);
                }
            }
        }
        
        return dp[0][n-1];
    }
    
    // Space-Optimized Fibonacci
    public static long fibonacciOptimized(int n) {
        if (n <= 1) return n;
        
        long prev2 = 0;
        long prev1 = 1;
        long current = 0;
        
        for (int i = 2; i <= n; i++) {
            current = prev1 + prev2;
            prev2 = prev1;
            prev1 = current;
        }
        
        return current;
    }
}
```
  </TabItem>
  <TabItem value="go" label="Go">
```go
package dp

import "math"

// Fibonacci using tabulation
func Fibonacci(n int) int64 {
    if n <= 1 {
        return int64(n)
    }
    
    dp := make([]int64, n+1)
    dp[0] = 0
    dp[1] = 1
    
    for i := 2; i <= n; i++ {
        dp[i] = dp[i-1] + dp[i-2]
    }
    
    return dp[n]
}

// LongestCommonSubsequence finds the length of LCS
func LongestCommonSubsequence(text1, text2 string) int {
    m, n := len(text1), len(text2)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }
    
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if text1[i-1] == text2[j-1] {
                dp[i][j] = dp[i-1][j-1] + 1
            } else {
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
            }
        }
    }
    
    return dp[m][n]
}

// Knapsack solves the 0/1 knapsack problem
func Knapsack(weights, values []int, capacity int) int {
    n := len(weights)
    dp := make([][]int, n+1)
    for i := range dp {
        dp[i] = make([]int, capacity+1)
    }
    
    for i := 1; i <= n; i++ {
        for w := 0; w <= capacity; w++ {
            if weights[i-1] <= w {
                dp[i][w] = max(
                    values[i-1]+dp[i-1][w-weights[i-1]],
                    dp[i-1][w],
                )
            } else {
                dp[i][w] = dp[i-1][w]
            }
        }
    }
    
    return dp[n][capacity]
}

// MatrixChainMultiplication finds minimum operations
func MatrixChainMultiplication(dimensions []int) int {
    n := len(dimensions) - 1
    dp := make([][]int, n)
    for i := range dp {
        dp[i] = make([]int, n)
    }
    
    // Initialize for length 1
    for i := 0; i < n; i++ {
        dp[i][i] = 0
    }
    
    // Fill table by chain length
    for length := 2; length <= n; length++ {
        for i := 0; i < n-length+1; i++ {
            j := i + length - 1
            dp[i][j] = math.MaxInt32
            
            for k := i; k < j; k++ {
                cost := dp[i][k] + dp[k+1][j] +
                        dimensions[i] * dimensions[k+1] * dimensions[j+1]
                dp[i][j] = min(dp[i][j], cost)
            }
        }
    }
    
    return dp[0][n-1]
}

// FibonacciOptimized uses space optimization
func FibonacciOptimized(n int) int64 {
    if n <= 1 {
        return int64(n)
    }
    
    prev2 := int64(0)
    prev1 := int64(1)
    var current int64
    
    for i := 2; i <= n; i++ {
        current = prev1 + prev2
        prev2 = prev1
        prev1 = current
    }
    
    return current
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

1. **Memoization (Top-Down)**
    - Similar subproblem structure
    - Different execution order
    - Recursive approach

2. **Divide and Conquer**
    - Problem decomposition
    - Subproblem independence
    - Solution combination

3. **Greedy Algorithms**
    - Local optimization
    - Simpler decision making
    - No guaranteed optimality

## ⚙️ Best Practices

### Configuration
- Choose appropriate table dimensions
- Initialize base cases correctly
- Optimize space usage
- Handle boundary conditions

### Monitoring
- Track table filling process
- Monitor memory usage
- Validate state transitions
- Profile performance

### Testing
- Verify base cases
- Test boundary conditions
- Check space optimization
- Validate results

## ⚠️ Common Pitfalls

1. **Incorrect Table Size**
    - Solution: Analyze problem dimensions
    - Include extra row/column for base cases

2. **Wrong Iteration Order**
    - Solution: Map dependencies
    - Ensure required values are computed first

3. **Memory Issues**
    - Solution: Implement space optimization
    - Use sliding window technique

## 🎯 Use Cases

### 1. String Processing
- Sequence alignment
- Pattern matching
- Text similarity

### 2. Resource Optimization
- Investment strategies
- Resource allocation
- Scheduling problems

### 3. Graph Algorithms
- Shortest paths
- Maximum flow
- Optimal trees

## 🔍 Deep Dive Topics

### Thread Safety
- Parallel table filling
- Synchronized access
- Concurrent optimization

### Distributed Systems
- Distributed table computation
- Data partitioning
- Result aggregation

### Performance Optimization
- Space reduction techniques
- Cache-friendly access patterns
- Memory management

## 📚 Additional Resources

### References
1. "Introduction to Algorithms" (CLRS)
2. "Dynamic Programming for Coding Interviews"
3. "Algorithm Design Manual" by Skiena

### Tools
- Visualization tools
- Performance profilers
- Memory analyzers

## ❓ FAQs

### Q: When should I use tabulation over memoization?
A: Use tabulation when:
- All subproblems must be solved
- Memory usage is critical
- Iteration order is clear
- Stack overflow is a concern

### Q: How do I optimize space complexity?
A: Consider:
- Using sliding windows
- Reducing dimensions
- Reusing space
- State compression

### Q: How do I identify the table dimensions?
A: Analyze:
- State variables
- Input parameters
- Dependency relationships
- Minimum required information

### Q: How do I handle multiple subproblems?
A: Consider:
- Multiple tables
- Combined state representation
- Auxiliary data structures
- Problem decomposition
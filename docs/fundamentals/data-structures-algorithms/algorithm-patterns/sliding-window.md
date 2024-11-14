---
sidebar_position: 2
title: "Sliding Window"
description: "Sliding Window Algorithms"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🪟 Sliding Window Algorithm Pattern

## Overview

The Sliding Window pattern is a computational technique that reduces the use of nested loops in algorithms. It converts two nested loops into a single loop by using a "window" that slides through the data structure, typically maintaining a subset of elements.

### Real-World Analogy
Imagine looking through a moving train window. As the train moves, your view (window) shifts, showing you a new scene while the previous scene disappears. Similarly, the sliding window technique maintains a view of a portion of the data that moves through the entire dataset.

## 🎯 Key Concepts

### Components
1. **Window Structure**
    - Start pointer
    - End pointer
    - Window size (fixed or variable)
    - Window state

2. **Window Operations**
    - Expansion
    - Contraction
    - Sliding
    - State update

3. **Window Types**
    - Fixed size
    - Variable size
    - Dynamic size

## 💻 Implementation

### Common Sliding Window Problems

<Tabs>
  <TabItem value="java" label="Java">
```java
import java.util.*;

public class SlidingWindow {
// Fixed Window: Maximum Average Subarray
public double findMaxAverage(int[] nums, int k) {
double sum = 0;
// Calculate sum of first window
for (int i = 0; i < k; i++) {
sum += nums[i];
}

        double maxSum = sum;
        
        // Slide window
        for (int i = k; i < nums.length; i++) {
            sum = sum - nums[i - k] + nums[i];
            maxSum = Math.max(maxSum, sum);
        }
        
        return maxSum / k;
    }
    
    // Variable Window: Longest Substring Without Repeating Characters
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> charIndex = new HashMap<>();
        int maxLength = 0;
        int windowStart = 0;
        
        for (int windowEnd = 0; windowEnd < s.length(); windowEnd++) {
            char currentChar = s.charAt(windowEnd);
            
            if (charIndex.containsKey(currentChar)) {
                windowStart = Math.max(windowStart, charIndex.get(currentChar) + 1);
            }
            
            charIndex.put(currentChar, windowEnd);
            maxLength = Math.max(maxLength, windowEnd - windowStart + 1);
        }
        
        return maxLength;
    }
    
    // Minimum Window Substring
    public String minWindow(String s, String t) {
        if (s == null || t == null || s.length() == 0 || t.length() == 0) {
            return "";
        }
        
        // Character frequency map for pattern
        Map<Character, Integer> patternMap = new HashMap<>();
        for (char c : t.toCharArray()) {
            patternMap.put(c, patternMap.getOrDefault(c, 0) + 1);
        }
        
        int windowStart = 0;
        int minLength = s.length() + 1;
        int matched = 0;
        int minStart = 0;
        
        // Character frequency map for current window
        Map<Character, Integer> windowMap = new HashMap<>();
        
        for (int windowEnd = 0; windowEnd < s.length(); windowEnd++) {
            char rightChar = s.charAt(windowEnd);
            windowMap.put(rightChar, windowMap.getOrDefault(rightChar, 0) + 1);
            
            if (patternMap.containsKey(rightChar) && 
                windowMap.get(rightChar).intValue() == patternMap.get(rightChar).intValue()) {
                matched++;
            }
            
            while (matched == patternMap.size()) {
                if (windowEnd - windowStart + 1 < minLength) {
                    minLength = windowEnd - windowStart + 1;
                    minStart = windowStart;
                }
                
                char leftChar = s.charAt(windowStart);
                windowMap.put(leftChar, windowMap.get(leftChar) - 1);
                
                if (patternMap.containsKey(leftChar) && 
                    windowMap.get(leftChar) < patternMap.get(leftChar)) {
                    matched--;
                }
                
                windowStart++;
            }
        }
        
        return minLength > s.length() ? "" : s.substring(minStart, minStart + minLength);
    }
    
    // Maximum Sum Subarray of Size K
    public int maxSubArraySum(int[] arr, int k) {
        int maxSum = 0;
        int windowSum = 0;
        
        // First window
        for (int i = 0; i < k; i++) {
            windowSum += arr[i];
        }
        
        maxSum = windowSum;
        
        // Slide window
        for (int i = k; i < arr.length; i++) {
            windowSum = windowSum - arr[i - k] + arr[i];
            maxSum = Math.max(maxSum, windowSum);
        }
        
        return maxSum;
    }
}
```
  </TabItem>
  <TabItem value="go" label="Go">
```go
package slidingwindow

// FindMaxAverage finds maximum average in a fixed window
func FindMaxAverage(nums []int, k int) float64 {
    sum := 0.0
    
    // Calculate sum of first window
    for i := 0; i < k; i++ {
        sum += float64(nums[i])
    }
    
    maxSum := sum
    
    // Slide window
    for i := k; i < len(nums); i++ {
        sum = sum - float64(nums[i-k]) + float64(nums[i])
        maxSum = max(maxSum, sum)
    }
    
    return maxSum / float64(k)
}

// LengthOfLongestSubstring finds length of longest substring without repeating characters
func LengthOfLongestSubstring(s string) int {
    charIndex := make(map[rune]int)
    maxLength := 0
    windowStart := 0
    
    for windowEnd, char := range s {
        if lastIndex, exists := charIndex[char]; exists {
            windowStart = max(windowStart, lastIndex+1)
        }
        
        charIndex[char] = windowEnd
        maxLength = max(maxLength, windowEnd-windowStart+1)
    }
    
    return maxLength
}

// MinWindow finds minimum window substring
func MinWindow(s string, t string) string {
    if len(s) == 0 || len(t) == 0 {
        return ""
    }
    
    // Character frequency map for pattern
    patternMap := make(map[rune]int)
    for _, char := range t {
        patternMap[char]++
    }
    
    windowStart := 0
    minLength := len(s) + 1
    matched := 0
    minStart := 0
    
    // Character frequency map for current window
    windowMap := make(map[rune]int)
    
    for windowEnd, char := range s {
        windowMap[char]++
        
        if count, exists := patternMap[char]; exists && windowMap[char] == count {
            matched++
        }
        
        for matched == len(patternMap) {
            if windowEnd-windowStart+1 < minLength {
                minLength = windowEnd - windowStart + 1
                minStart = windowStart
            }
            
            leftChar := rune(s[windowStart])
            windowMap[leftChar]--
            
            if count, exists := patternMap[leftChar]; exists && windowMap[leftChar] < count {
                matched--
            }
            
            windowStart++
        }
    }
    
    if minLength > len(s) {
        return ""
    }
    return s[minStart : minStart+minLength]
}

// MaxSubArraySum finds maximum sum subarray of size k
func MaxSubArraySum(arr []int, k int) int {
    maxSum := 0
    windowSum := 0
    
    // First window
    for i := 0; i < k; i++ {
        windowSum += arr[i]
    }
    
    maxSum = windowSum
    
    // Slide window
    for i := k; i < len(arr); i++ {
        windowSum = windowSum - arr[i-k] + arr[i]
        maxSum = max(maxSum, windowSum)
    }
    
    return maxSum
}

func max(a, b int) int {
    if a > b {
        return a
    }
    return b
}
```
  </TabItem>
</Tabs>

## 🔗 Related Patterns

1. **Two Pointers**
    - Similar array traversal
    - Multiple pointer manipulation
    - Range processing

2. **Dynamic Programming**
    - Subproblem optimization
    - State maintenance
    - Optimal substructure

3. **Hash Table Pattern**
    - State tracking
    - Window content management
    - Frequency counting

## ⚙️ Best Practices

### Configuration
- Choose appropriate window size
- Initialize window correctly
- Handle edge cases
- Optimize state tracking

### Monitoring
- Track window boundaries
- Monitor window state
- Validate window operations
- Check termination conditions

### Testing
- Test edge cases
- Verify window movements
- Check state updates
- Validate results

## ⚠️ Common Pitfalls

1. **Incorrect Window Size**
    - Solution: Validate window boundaries
    - Handle edge cases properly

2. **State Management**
    - Solution: Proper state initialization
    - Accurate state updates

3. **Off-by-One Errors**
    - Solution: Careful boundary handling
    - Proper window sliding

## 🎯 Use Cases

### 1. Data Streaming
- Moving averages
- Traffic monitoring
- Trend analysis

### 2. String Processing
- Pattern matching
- Substring search
- String comparison

### 3. Array Analysis
- Subarray sums
- Continuous sequences
- Moving calculations

## 🔍 Deep Dive Topics

### Thread Safety
- Concurrent window operations
- Synchronized state updates
- Thread-safe data structures

### Distributed Systems
- Distributed window processing
- State synchronization
- Parallel window operations

### Performance Optimization
- Memory efficiency
- State compression
- Early termination

## 📚 Additional Resources

### References
1. "Introduction to Algorithms" (CLRS)
2. "Algorithm Design Manual"
3. "Coding Interview Patterns"

### Tools
- Visualization tools
- Performance profilers
- Debugging helpers

## ❓ FAQs

### Q: When should I use Sliding Window?
A: Use Sliding Window when:
- Processing contiguous sequences
- Need efficient array/string traversal
- Calculating running metrics
- Finding optimal subarrays

### Q: Fixed vs Variable Window?
A: Choose based on:
- Problem constraints
- Data characteristics
- Performance requirements
- Space limitations

### Q: How to handle window state?
A: Consider:
- Efficient data structures
- State update strategy
- Memory management
- Performance trade-offs

### Q: What's the time complexity benefit?
A: Sliding Window typically provides:
- O(n) time complexity
- Reduced space usage
- Efficient updates
- Linear traversal


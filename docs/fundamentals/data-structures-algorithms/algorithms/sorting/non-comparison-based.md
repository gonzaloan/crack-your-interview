---
sidebar_position: 2
title: "Non Comparison Based"
description: "Non Comparison Based Algorithms"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔄 Non-Comparison Based Sorting Algorithms

## Overview

Non-comparison based sorting algorithms are specialized sorting techniques that don't rely on comparing elements to determine their order. Instead, they use the properties of the elements themselves to determine their position in the final sorted array.

### Real-World Analogy
Imagine sorting mail into different zip code boxes at a post office. Instead of comparing addresses between letters, you simply look at each zip code and place it in its corresponding box. This direct placement based on the value itself is how non-comparison sorts work.

## 🎯 Key Concepts

### Components
- **Key Function**: Extracts the sorting key from elements
- **Counting Array**: Tracks frequency of elements
- **Buckets**: Subdivisions for element distribution
- **Time Complexity**: Often O(n + k) where k is the range of input
- **Space Complexity**: Usually requires additional memory

### Main Algorithms
1. **Counting Sort**
    - Uses counting array
    - Integer-based sorting
    - O(n + k) complexity

2. **Radix Sort**
    - Digit-by-digit sorting
    - Can use any base
    - O(d * (n + k)) complexity

3. **Bucket Sort**
    - Distributes into buckets
    - Useful for uniform distributions
    - O(n + k) average case

## 💻 Implementation

### Counting Sort and Radix Sort Implementations

<Tabs>
  <TabItem value="java" label="Java">
```java
import java.util.Arrays;

public class NonComparisonSort {
// Counting Sort
public static void countingSort(int[] arr) {
if (arr == null || arr.length <= 1) return;

        // Find the range of input array
        int max = Arrays.stream(arr).max().getAsInt();
        int min = Arrays.stream(arr).min().getAsInt();
        int range = max - min + 1;
        
        int[] count = new int[range];
        int[] output = new int[arr.length];
        
        // Store count of each element
        for (int i = 0; i < arr.length; i++) {
            count[arr[i] - min]++;
        }
        
        // Modify count array to contain actual positions
        for (int i = 1; i < count.length; i++) {
            count[i] += count[i - 1];
        }
        
        // Build output array
        for (int i = arr.length - 1; i >= 0; i--) {
            output[count[arr[i] - min] - 1] = arr[i];
            count[arr[i] - min]--;
        }
        
        // Copy output array to input array
        System.arraycopy(output, 0, arr, 0, arr.length);
    }
    
    // Radix Sort
    public static void radixSort(int[] arr) {
        if (arr == null || arr.length <= 1) return;
        
        // Find the maximum number to know number of digits
        int max = Arrays.stream(arr).max().getAsInt();
        
        // Do counting sort for every digit
        for (int exp = 1; max / exp > 0; exp *= 10) {
            countingSortByDigit(arr, exp);
        }
    }
    
    private static void countingSortByDigit(int[] arr, int exp) {
        int[] output = new int[arr.length];
        int[] count = new int[10];
        
        // Store count of occurrences
        for (int i = 0; i < arr.length; i++) {
            count[(arr[i] / exp) % 10]++;
        }
        
        // Change count to actual position
        for (int i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        
        // Build output array
        for (int i = arr.length - 1; i >= 0; i--) {
            output[count[(arr[i] / exp) % 10] - 1] = arr[i];
            count[(arr[i] / exp) % 10]--;
        }
        
        System.arraycopy(output, 0, arr, 0, arr.length);
    }
}
```
  </TabItem>
  <TabItem value="go" label="Go">
```go
package sorting

// CountingSort performs counting sort on an integer array
func CountingSort(arr []int) {
    if len(arr) <= 1 {
        return
    }
    
    // Find max and min values
    max, min := arr[0], arr[0]
    for _, num := range arr {
        if num > max {
            max = num
        }
        if num < min {
            min = num
        }
    }
    
    range_ := max - min + 1
    count := make([]int, range_)
    output := make([]int, len(arr))
    
    // Store count of each element
    for _, num := range arr {
        count[num-min]++
    }
    
    // Modify count array to contain actual positions
    for i := 1; i < len(count); i++ {
        count[i] += count[i-1]
    }
    
    // Build output array
    for i := len(arr) - 1; i >= 0; i-- {
        output[count[arr[i]-min]-1] = arr[i]
        count[arr[i]-min]--
    }
    
    // Copy output array to input array
    copy(arr, output)
}

// RadixSort performs radix sort on an integer array
func RadixSort(arr []int) {
    if len(arr) <= 1 {
        return
    }
    
    // Find the maximum number to know number of digits
    max := arr[0]
    for _, num := range arr {
        if num > max {
            max = num
        }
    }
    
    // Do counting sort for every digit
    for exp := 1; max/exp > 0; exp *= 10 {
        countingSortByDigit(arr, exp)
    }
}

func countingSortByDigit(arr []int, exp int) {
    n := len(arr)
    output := make([]int, n)
    count := make([]int, 10)
    
    // Store count of occurrences
    for i := 0; i < n; i++ {
        count[(arr[i]/exp)%10]++
    }
    
    // Change count to actual position
    for i := 1; i < 10; i++ {
        count[i] += count[i-1]
    }
    
    // Build output array
    for i := n - 1; i >= 0; i-- {
        output[count[(arr[i]/exp)%10]-1] = arr[i]
        count[(arr[i]/exp)%10]--
    }
    
    copy(arr, output)
}
```
  </TabItem>
</Tabs>

## 🔗 Related Patterns

1. **Divide and Distribute**
    - Similar to bucket sort distribution
    - Used in parallel processing

2. **Linear-time Processing**
    - Complement to hash tables
    - Used in counting-based algorithms

3. **Recursive Decomposition**
    - Used in radix sort
    - Applies to parallel implementations

## ⚙️ Best Practices

### Configuration
- Choose appropriate bucket size for bucket sort
- Select optimal radix for radix sort
- Consider input range for counting sort

### Monitoring
- Track memory usage
- Monitor distribution patterns
- Measure sorting stability

### Testing
- Test with various input ranges
- Verify handling of negative numbers
- Check for memory constraints
- Validate stability requirements

## ⚠️ Common Pitfalls

1. **Memory Overflow**
    - Solution: Validate input range
    - Implement range checking

2. **Negative Numbers**
    - Solution: Add offset to make all numbers positive
    - Track minimum value for adjustment

3. **Uneven Distribution**
    - Solution: Adjust bucket sizes
    - Implement dynamic bucket allocation

## 🎯 Use Cases

### 1. Integer Processing Systems
- Sorting age data
- Processing numeric IDs
- Handling fixed-range values

### 2. String Processing
- Sorting fixed-length strings
- Dictionary sorting
- URL processing

### 3. Network Packet Processing
- IP address sorting
- Network traffic analysis
- Packet prioritization

## 🔍 Deep Dive Topics

### Thread Safety
- Parallel bucket processing
- Concurrent counting sort
- Thread-safe accumulation

### Distributed Systems
- Distributed bucket sort
- Network-aware partitioning
- Load balancing strategies

### Performance Optimization
- Memory locality
- Cache utilization
- SIMD opportunities

## 📚 Additional Resources

### References
1. Algorithms, 4th Edition (Sedgewick)
2. The Art of Computer Programming (Knuth)
3. Introduction to Algorithms (CLRS)

### Tools
- Performance profilers
- Memory analyzers
- Visualization tools

## ❓ FAQs

### Q: When should I use non-comparison based sorting?
A: Use these algorithms when dealing with integers or fixed-length strings within a known range, especially when the range is not significantly larger than the input size.

### Q: How do I handle floating-point numbers?
A: Convert floating-point numbers to integers by scaling them up, sort using radix or counting sort, then scale back down.

### Q: What's the space-time tradeoff?
A: Non-comparison sorts typically trade memory for speed, using O(k) extra space to achieve O(n) time complexity.

### Q: Can these algorithms be stable?
A: Yes, counting sort and radix sort are naturally stable. Bucket sort's stability depends on the sorting method used within buckets.
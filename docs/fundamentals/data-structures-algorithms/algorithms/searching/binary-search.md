---
sidebar_position: 1
title: "Binary Search"
description: "Binary Search Algorithms"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Binary Search Algorithm

## Overview

Binary Search is an efficient algorithm for finding a target value within a sorted array. It works by repeatedly dividing the search interval in half, eliminating half of the remaining elements with each iteration.

### Real-World Analogy
Imagine looking up a word in a physical dictionary. Instead of checking every page, you open the book in the middle. If your word comes later alphabetically, you only look at the second half; if it comes earlier, you only look at the first half. You repeat this process until you find your word. This is exactly how binary search works!

## 🎯 Key Concepts

### Components
- **Sorted Array**: The input must be sorted
- **Search Space**: The range of elements being searched
- **Mid Point**: The middle element of the current search space
- **Target Value**: The value being searched for
- **Pointers**: Left and right boundaries of the search space

### Time Complexity
- Average: O(log n)
- Worst: O(log n)
- Best: O(1)

### Space Complexity
- O(1) for iterative implementation
- O(log n) for recursive implementation

## 💻 Implementation

### Standard Binary Search Implementation

<Tabs>
  <TabItem value="java" label="Java">
```java
public class BinarySearch {
    // Iterative Binary Search
    public static <T extends Comparable<T>> int binarySearch(T[] array, T target) {
        int left = 0;
        int right = array.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;
            int comparison = array[mid].compareTo(target);

            if (comparison == 0) {
                return mid;  // Found the target
            } else if (comparison < 0) {
                left = mid + 1;  // Target is in the right half
            } else {
                right = mid - 1;  // Target is in the left half
            }
        }
        return -1;  // Target not found
    }

    // Recursive Binary Search
    public static <T extends Comparable<T>> int binarySearchRecursive(T[] array, T target) {
        return binarySearchRecursiveHelper(array, target, 0, array.length - 1);
    }

    private static <T extends Comparable<T>> int binarySearchRecursiveHelper(
            T[] array, T target, int left, int right) {
        if (left > right) {
            return -1;
        }

        int mid = left + (right - left) / 2;
        int comparison = array[mid].compareTo(target);

        if (comparison == 0) {
            return mid;
        } else if (comparison < 0) {
            return binarySearchRecursiveHelper(array, target, mid + 1, right);
        } else {
            return binarySearchRecursiveHelper(array, target, left, mid - 1);
        }
    }

    // Binary Search with custom comparator
    public static <T> int binarySearchWithComparator(
            T[] array, T target, Comparator<T> comparator) {
        int left = 0;
        int right = array.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;
            int comparison = comparator.compare(array[mid], target);

            if (comparison == 0) {
                return mid;
            } else if (comparison < 0) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return -1;
    }

    // Find insert position
    public static <T extends Comparable<T>> int findInsertPosition(T[] array, T target) {
        int left = 0;
        int right = array.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;
            int comparison = array[mid].compareTo(target);

            if (comparison == 0) {
                return mid;
            } else if (comparison < 0) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return left;  // Position where element should be inserted
    }
}
```
  </TabItem>
  <TabItem value="go" label="Go">
```go
package search

import "golang.org/x/exp/constraints"

// BinarySearch performs binary search on a sorted slice
func BinarySearch[T constraints.Ordered](slice []T, target T) int {
    left := 0
    right := len(slice) - 1

    for left <= right {
        mid := left + (right-left)/2

        if slice[mid] == target {
            return mid
        } else if slice[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}

// BinarySearchRecursive performs recursive binary search
func BinarySearchRecursive[T constraints.Ordered](slice []T, target T) int {
    return binarySearchRecursiveHelper(slice, target, 0, len(slice)-1)
}

func binarySearchRecursiveHelper[T constraints.Ordered](
    slice []T, target T, left, right int) int {
    if left > right {
        return -1
    }

    mid := left + (right-left)/2

    if slice[mid] == target {
        return mid
    } else if slice[mid] < target {
        return binarySearchRecursiveHelper(slice, target, mid+1, right)
    }
    return binarySearchRecursiveHelper(slice, target, left, mid-1)
}

// BinarySearchWithComparator performs binary search using a custom comparator
func BinarySearchWithComparator[T any](
    slice []T, target T, compare func(T, T) int) int {
    left := 0
    right := len(slice) - 1

    for left <= right {
        mid := left + (right-left)/2
        comparison := compare(slice[mid], target)

        if comparison == 0 {
            return mid
        } else if comparison < 0 {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}

// FindInsertPosition finds the position where an element should be inserted
func FindInsertPosition[T constraints.Ordered](slice []T, target T) int {
    left := 0
    right := len(slice) - 1

    for left <= right {
        mid := left + (right-left)/2

        if slice[mid] == target {
            return mid
        } else if slice[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return left
}
```
  </TabItem>
</Tabs>

## 🔗 Related Patterns

1. **Divide and Conquer**
    - Similar division strategy
    - Recursive problem solving
    - Logarithmic complexity

2. **Two Pointers**
    - Using left and right boundaries
    - Space-efficient traversal
    - Common in array algorithms

3. **Decrease and Conquer**
    - Reducing problem size
    - Systematic elimination
    - Optimal subproblem solution

## ⚙️ Best Practices

### Configuration
- Ensure input is sorted
- Choose appropriate data types
- Handle edge cases properly
- Use appropriate comparators

### Monitoring
- Track number of iterations
- Monitor execution time
- Log search boundaries

### Testing
- Test sorted arrays
- Verify edge cases
- Include duplicates
- Test empty arrays
- Check boundary conditions

## ⚠️ Common Pitfalls

1. **Integer Overflow**
    - Solution: Use `left + (right - left) / 2`
    - Avoid `(left + right) / 2`

2. **Infinite Loops**
    - Solution: Ensure proper boundary updates
    - Verify loop termination conditions

3. **Unsorted Input**
    - Solution: Validate input sorting
    - Add pre-sort step if needed

## 🎯 Use Cases

### 1. Database Indexing
- Finding records quickly
- Index-based searches
- Range queries

### 2. Version Control
- Finding commits
- Binary search debugging
- Regression analysis

### 3. Resource Allocation
- Memory management
- Process scheduling
- Load balancing

## 🔍 Deep Dive Topics

### Thread Safety
- Concurrent binary search
- Read-write locks
- Atomic operations

### Distributed Systems
- Distributed binary search
- Sharded data searching
- Network-aware implementations

### Performance Optimization
- Cache efficiency
- Branch prediction
- SIMD operations
- Memory alignment

## 📚 Additional Resources

### References
1. Introduction to Algorithms (CLRS)
2. Algorithm Design Manual
3. Programming Pearls

### Tools
- Profiling tools
- Visualization libraries
- Benchmarking frameworks

## ❓ FAQs

### Q: When should I use binary search over linear search?
A: Use binary search when:
- The data is sorted
- Multiple searches will be performed
- The dataset is large
- O(log n) complexity is required

### Q: How do I handle duplicates in binary search?
A: You can modify the algorithm to:
- Find the first occurrence
- Find the last occurrence
- Find all occurrences
- Return any matching element

### Q: What's the impact of cache misses on binary search?
A: Binary search can suffer from cache misses due to non-sequential memory access. For very small datasets, linear search might be faster due to better cache utilization.

### Q: How do I implement binary search for floating-point numbers?
A: Use an epsilon value for comparisons to handle floating-point imprecision. Consider using a tolerance threshold for equality comparisons.

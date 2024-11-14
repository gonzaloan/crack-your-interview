---
sidebar_position: 3
title: "Two Pointers"
description: "Two Pointers Algorithms"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👉👈 Two Pointers Algorithm Pattern

## Overview

The Two Pointers pattern involves using two pointers to traverse an array/linked list from opposite ends or different positions. This pattern is particularly useful for solving problems that involve searching pairs in a sorted array or comparing values at different indices.

### Real-World Analogy
Think of two people cleaning a room from opposite ends, gradually moving towards each other until they meet in the middle. Each person (pointer) keeps track of their position and coordinates with the other to ensure complete coverage, just like how two pointers work together to solve array problems.

## 🎯 Key Concepts

### Components
1. **Pointer Types**
    - Same direction pointers
    - Opposite direction pointers
    - Fast and slow pointers

2. **Movement Patterns**
    - Towards center
    - Same direction
    - Different speeds

3. **Common Operations**
    - Comparison
    - Sum calculation
    - Element swapping
    - Position tracking

## 💻 Implementation

### Common Two Pointer Problem Solutions

<Tabs>
  <TabItem value="java" label="Java">
```java
public class TwoPointers {
    // Two Sum II (sorted array)
    public int[] findTwoSum(int[] numbers, int target) {
        int left = 0;
        int right = numbers.length - 1;

        while (left < right) {
            int sum = numbers[left] + numbers[right];
            
            if (sum == target) {
                return new int[]{left + 1, right + 1};
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        
        return new int[]{};
    }
    
    // Remove Duplicates from Sorted Array
    public int removeDuplicates(int[] nums) {
        if (nums.length <= 1) return nums.length;
        
        int writePointer = 1;
        
        for (int readPointer = 1; readPointer < nums.length; readPointer++) {
            if (nums[readPointer] != nums[readPointer - 1]) {
                nums[writePointer] = nums[readPointer];
                writePointer++;
            }
        }
        
        return writePointer;
    }
    
    // Container With Most Water
    public int maxArea(int[] height) {
        int maxArea = 0;
        int left = 0;
        int right = height.length - 1;
        
        while (left < right) {
            int width = right - left;
            maxArea = Math.max(maxArea, Math.min(height[left], height[right]) * width);
            
            if (height[left] <= height[right]) {
                left++;
            } else {
                right--;
            }
        }
        
        return maxArea;
    }
    
    // Three Sum
    public List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        Arrays.sort(nums);
        
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            
            int left = i + 1;
            int right = nums.length - 1;
            
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                
                if (sum == 0) {
                    result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        
        return result;
    }
}
```
  </TabItem>
  <TabItem value="go" label="Go">
```go
package twopointers

// FindTwoSum finds two numbers that add up to target
func FindTwoSum(numbers []int, target int) []int {
    left, right := 0, len(numbers)-1
    
    for left < right {
        sum := numbers[left] + numbers[right]
        
        if sum == target {
            return []int{left + 1, right + 1}
        } else if sum < target {
            left++
        } else {
            right--
        }
    }
    
    return []int{}
}

// RemoveDuplicates removes duplicates from sorted array
func RemoveDuplicates(nums []int) int {
    if len(nums) <= 1 {
        return len(nums)
    }
    
    writePointer := 1
    
    for readPointer := 1; readPointer < len(nums); readPointer++ {
        if nums[readPointer] != nums[readPointer-1] {
            nums[writePointer] = nums[readPointer]
            writePointer++
        }
    }
    
    return writePointer
}

// MaxArea finds container with most water
func MaxArea(height []int) int {
    maxArea := 0
    left, right := 0, len(height)-1
    
    for left < right {
        width := right - left
        area := min(height[left], height[right]) * width
        maxArea = max(maxArea, area)
        
        if height[left] <= height[right] {
            left++
        } else {
            right--
        }
    }
    
    return maxArea
}

// ThreeSum finds all unique triplets that sum to zero
func ThreeSum(nums []int) [][]int {
    sort.Ints(nums)
    result := make([][]int, 0)
    
    for i := 0; i < len(nums)-2; i++ {
        if i > 0 && nums[i] == nums[i-1] {
            continue
        }
        
        left, right := i+1, len(nums)-1
        
        for left < right {
            sum := nums[i] + nums[left] + nums[right]
            
            if sum == 0 {
                result = append(result, []int{nums[i], nums[left], nums[right]})
                
                for left < right && nums[left] == nums[left+1] {
                    left++
                }
                for left < right && nums[right] == nums[right-1] {
                    right--
                }
                
                left++
                right--
            } else if sum < 0 {
                left++
            } else {
                right--
            }
        }
    }
    
    return result
}

func min(a, b int) int {
    if a < b {
        return a
    }
    return b
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

1. **Sliding Window**
    - Similar array traversal
    - Different size windows
    - Continuous range processing

2. **Fast and Slow Pointers**
    - Cycle detection
    - Middle finding
    - Linked list operations

3. **Merge Intervals**
    - Interval comparison
    - Range merging
    - Boundary handling

## ⚙️ Best Practices

### Configuration
- Choose appropriate pointer movement
- Initialize pointers correctly
- Handle edge cases
- Consider sorted vs. unsorted data

### Monitoring
- Track pointer positions
- Validate pointer movements
- Monitor array bounds
- Check termination conditions

### Testing
- Test edge cases
- Verify pointer movements
- Check boundary conditions
- Validate results

## ⚠️ Common Pitfalls

1. **Incorrect Initialization**
    - Solution: Validate starting positions
    - Check boundary conditions

2. **Missing Edge Cases**
    - Solution: Handle empty arrays
    - Consider single-element arrays

3. **Infinite Loops**
    - Solution: Ensure proper termination
    - Validate pointer movements

## 🎯 Use Cases

### 1. Array Operations
- Pair finding
- Duplicate removal
- Element comparison

### 2. String Manipulation
- Palindrome checking
- String reversal
- Character comparison

### 3. Container Problems
- Area calculation
- Range finding
- Boundary optimization

## 🔍 Deep Dive Topics

### Thread Safety
- Concurrent pointer access
- Synchronized movements
- Atomic operations

### Distributed Systems
- Distributed array processing
- Parallel pointer operations
- Data partitioning

### Performance Optimization
- Memory efficiency
- Pointer movement optimization
- Early termination

## 📚 Additional Resources

### References
1. "Introduction to Algorithms" (CLRS)
2. "Algorithm Design Manual"
3. "Coding Interview Patterns"

### Tools
- Visualization tools
- Debug helpers
- Performance profilers

## ❓ FAQs

### Q: When should I use Two Pointers?
A: Use Two Pointers when:
- Working with sorted arrays
- Finding pairs/triplets
- Comparing elements from ends
- Need O(n) time complexity

### Q: How do I choose pointer direction?
A: Consider:
- Problem requirements
- Array ordering
- Comparison needs
- Target optimization

### Q: What's the time complexity benefit?
A: Two Pointers typically provides:
- O(n) for sorted arrays
- Better than nested loops
- Efficient space usage
- Linear traversal

### Q: How do I handle duplicates?
A: Implement:
- Skip duplicate logic
- Proper pointer movement
- Result deduplication
- Sorted array handling


---
sidebar_position: 1
title: "Collections API"
description: "Overview of the Java Collections API for software architects and senior engineers"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📚 Java Core Collections: List, Set, Map

## Overview 🎯

Java Collections Framework provides a unified architecture for storing and manipulating groups of objects. The three main interfaces - List, Set, and Map - form the backbone of data collection handling in Java applications.

### Real-World Analogy
Think of Java Collections like different types of containers:
- **List**: A todo list where order matters and items can repeat
- **Set**: A basket of unique fruits where duplicates are automatically removed
- **Map**: A phone book where each name (key) is associated with a phone number (value)

## Key Concepts 🔑

### Core Interfaces

#### List Interface
- Ordered collection (sequence)
- Elements are indexed (zero-based)
- Allows duplicate elements
- Main implementations: ArrayList, LinkedList, Vector

#### Set Interface
- Unordered collection of unique elements
- No duplicate elements allowed
- Main implementations: HashSet, TreeSet, LinkedHashSet

#### Map Interface
- Key-value pairs collection
- Keys must be unique
- Values can be duplicated
- Main implementations: HashMap, TreeMap, LinkedHashMap

## Implementation Examples 💻

### Basic Usage Examples

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.*;

    public class CollectionsExample {
        public void demonstrateCollections() {
            // List example
            List<String> list = new ArrayList<>();
            list.add("Apple");
            list.add("Banana");
            list.add("Apple");  // Duplicates allowed
            
            // Set example
            Set<String> set = new HashSet<>();
            set.add("Apple");
            set.add("Banana");
            set.add("Apple");  // Duplicate not added
            
            // Map example
            Map<String, Integer> map = new HashMap<>();
            map.put("Apple", 1);
            map.put("Banana", 2);
            map.put("Orange", 3);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
    )

    func demonstrateCollections() {
        // Slice (similar to List)
        list := make([]string, 0)
        list = append(list, "Apple")
        list = append(list, "Banana")
        list = append(list, "Apple")  // Duplicates allowed
        
        // Map for unique keys (similar to Set)
        set := make(map[string]bool)
        set["Apple"] = true
        set["Banana"] = true
        set["Apple"] = true  // Overwrites previous value
        
        // Map (similar to Java Map)
        valueMap := make(map[string]int)
        valueMap["Apple"] = 1
        valueMap["Banana"] = 2
        valueMap["Orange"] = 3
    }
    ```
  </TabItem>
</Tabs>

### Advanced Operations

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.*;
    import java.util.stream.*;

    public class AdvancedCollections {
        public void advancedOperations() {
            // List operations
            List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
            List<Integer> doubled = numbers.stream()
                .map(n -> n * 2)
                .collect(Collectors.toList());
            
            // Set operations
            Set<String> set1 = new HashSet<>(Arrays.asList("A", "B", "C"));
            Set<String> set2 = new HashSet<>(Arrays.asList("B", "C", "D"));
            
            // Union
            Set<String> union = new HashSet<>(set1);
            union.addAll(set2);
            
            // Intersection
            Set<String> intersection = new HashSet<>(set1);
            intersection.retainAll(set2);
            
            // Map operations
            Map<String, Integer> scores = new HashMap<>();
            scores.computeIfAbsent("Player1", k -> 0);
            scores.merge("Player1", 10, Integer::sum);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    func advancedOperations() {
        // Slice operations
        numbers := []int{1, 2, 3, 4, 5}
        doubled := make([]int, len(numbers))
        for i, n := range numbers {
            doubled[i] = n * 2
        }
        
        // Set operations using maps
        set1 := map[string]bool{"A": true, "B": true, "C": true}
        set2 := map[string]bool{"B": true, "C": true, "D": true}
        
        // Union
        union := make(map[string]bool)
        for k := range set1 {
            union[k] = true
        }
        for k := range set2 {
            union[k] = true
        }
        
        // Intersection
        intersection := make(map[string]bool)
        for k := range set1 {
            if set2[k] {
                intersection[k] = true
            }
        }
        
        // Map operations
        scores := make(map[string]int)
        if _, exists := scores["Player1"]; !exists {
            scores["Player1"] = 0
        }
        scores["Player1"] += 10
    }
    ```
  </TabItem>
</Tabs>

## Best Practices 🌟

### Choice of Implementation

1. **List Implementation**
    - Use ArrayList for random access and fixed-size lists
    - Use LinkedList for frequent insertions/deletions
    - Avoid Vector unless thread safety is required

2. **Set Implementation**
    - Use HashSet for best performance
    - Use TreeSet when ordered iteration is needed
    - Use LinkedHashSet for insertion-order iteration

3. **Map Implementation**
    - Use HashMap for general purpose
    - Use TreeMap for sorted keys
    - Use LinkedHashMap for predictable iteration order

### Performance Considerations

- Initial Capacity
```java
// Good: Set initial capacity
List<String> list = new ArrayList<>(10000);

// Bad: Let it resize multiple times
List<String> list = new ArrayList<>();
```

- Collection Sizing
```java
// Good: Use correct collection size
Map<String, String> map = new HashMap<>(expectedSize / 0.75f + 1);

// Bad: Default size with many elements
Map<String, String> map = new HashMap<>();
```

## Common Pitfalls 🚨

1. **Concurrent Modification**
```java
// Wrong:
for (String item : list) {
    if (condition) list.remove(item); // ConcurrentModificationException
}

// Correct:
list.removeIf(item -> condition);
```

2. **Null Handling**
```java
// Wrong:
map.put("key", null); // May throw NullPointerException in some implementations

// Correct:
map.putIfAbsent("key", "defaultValue");
```

## Use Cases 🎯

### 1. Shopping Cart (List)
```java
public class ShoppingCart {
    private List<Item> items = new ArrayList<>();
    
    public void addItem(Item item) {
        items.add(item);
    }
    
    public double getTotal() {
        return items.stream()
            .mapToDouble(Item::getPrice)
            .sum();
    }
}
```

### 2. User Session Management (Set)
```java
public class SessionManager {
    private Set<String> activeSessions = new HashSet<>();
    
    public void addSession(String sessionId) {
        activeSessions.add(sessionId);
    }
    
    public boolean isSessionActive(String sessionId) {
        return activeSessions.contains(sessionId);
    }
}
```

### 3. Cache Implementation (Map)
```java
public class SimpleCache<K, V> {
    private Map<K, V> cache = new HashMap<>();
    
    public V get(K key, Supplier<V> compute) {
        return cache.computeIfAbsent(key, k -> compute.get());
    }
}
```

## Deep Dive Topics 🔍

### Thread Safety

1. **Synchronized Collections**
```java
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
Set<String> syncSet = Collections.synchronizedSet(new HashSet<>());
Map<String, String> syncMap = Collections.synchronizedMap(new HashMap<>());
```

2. **Concurrent Collections**
```java
import java.util.concurrent.*;

ConcurrentHashMap<String, String> concurrentMap = new ConcurrentHashMap<>();
CopyOnWriteArrayList<String> copyOnWriteList = new CopyOnWriteArrayList<>();
CopyOnWriteArraySet<String> copyOnWriteSet = new CopyOnWriteArraySet<>();
```

### Performance Optimization

1. **Bulk Operations**
```java
// Good: Bulk add
list.addAll(collection);

// Bad: Individual adds
for (Item item : collection) {
    list.add(item);
}
```

2. **Using the Right Collection**
```java
// Good: Using Set for lookups
Set<String> lookupSet = new HashSet<>(items);
boolean contains = lookupSet.contains(item); // O(1)

// Bad: Using List for lookups
List<String> lookupList = new ArrayList<>(items);
boolean contains = lookupList.contains(item); // O(n)
```

## Additional Resources 📚

### Official Documentation
- [Java Collections Framework Documentation](https://docs.oracle.com/javase/8/docs/technotes/guides/collections/)
- [Oracle Java Tutorials - Collections](https://docs.oracle.com/javase/tutorial/collections/)

### Tools
- [JMH (Java Microbenchmark Harness)](https://github.com/openjdk/jmh)
- [Eclipse Collections](https://www.eclipse.org/collections/)
- [Google Guava Collections](https://github.com/google/guava)

## FAQs ❓

### Q: When should I use ArrayList vs LinkedList?
A: Use ArrayList for random access and when the size doesn't change much. Use LinkedList for frequent insertions/deletions in the middle of the list.

### Q: How do I make my collections thread-safe?
A: Use Collections.synchronizedXXX() methods or concurrent collections from java.util.concurrent package.

### Q: What's the difference between HashMap and Hashtable?
A: Hashtable is thread-safe but obsolete. Use ConcurrentHashMap for thread-safe operations or HashMap for single-threaded scenarios.

### Q: How do I sort a Collection?
A: Use Collections.sort() for Lists or TreeSet/TreeMap for automatically sorted collections. You can also use stream().sorted() for custom sorting.

### Q: What's the best way to iterate over a Map?
A: Use the entrySet() method with a for-each loop or Map.forEach() for the most efficient iteration:

```java
map.forEach((key, value) -> {
    // Process key and value
});
```
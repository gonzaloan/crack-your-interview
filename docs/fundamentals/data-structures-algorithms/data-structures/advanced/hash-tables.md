---
sidebar_position: 1
title: "Hash Tables"
description: "Hash Tables"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗃️ Advanced Data Structures: Hash Tables

## Overview

A Hash Table (also known as Hash Map) is a data structure that implements an associative array abstract data type, a structure that can map keys to values. It uses a hash function to compute an index into an array of buckets or slots, from which the desired value can be found.

### Real World Analogy
Think of a library's card catalog system. Instead of searching through every book to find what you want, you can quickly look up a book's location using a card catalog that's organized by categories (like the hash function) and specific locations (like the buckets). This organization allows you to find any book quickly without searching through the entire library.

## 🔑 Key Concepts

### Components
1. **Hash Function**: Converts keys into array indices
2. **Buckets/Slots**: Array locations where values are stored
3. **Collision Resolution**: Methods to handle when different keys hash to the same index
4. **Load Factor**: Ratio of filled slots to total slots

### States
- **Empty**: No key-value pairs stored
- **Balanced**: Good distribution of elements
- **Resizing**: Growing or shrinking the internal array
- **Colliding**: Multiple keys mapping to the same bucket

### Collision Resolution Strategies
1. **Chaining**: Store colliding elements in a linked list
2. **Open Addressing**: Probe for next empty slot
    - Linear Probing
    - Quadratic Probing
    - Double Hashing

## 💻 Implementation

### Chaining Implementation

<Tabs>
  <TabItem value="java" label="Java">
```java
import java.util.LinkedList;

public class HashTable<K, V> {
private static final int INITIAL_CAPACITY = 16;
private static final double LOAD_FACTOR_THRESHOLD = 0.75;

    private LinkedList<Entry<K, V>>[] buckets;
    private int size;
    
    @SuppressWarnings("unchecked")
    public HashTable() {
        buckets = new LinkedList[INITIAL_CAPACITY];
        for (int i = 0; i < INITIAL_CAPACITY; i++) {
            buckets[i] = new LinkedList<>();
        }
        size = 0;
    }
    
    public void put(K key, V value) {
        if (loadFactor() >= LOAD_FACTOR_THRESHOLD) {
            resize();
        }
        
        int index = hash(key);
        LinkedList<Entry<K, V>> bucket = buckets[index];
        
        for (Entry<K, V> entry : bucket) {
            if (entry.key.equals(key)) {
                entry.value = value;
                return;
            }
        }
        
        bucket.add(new Entry<>(key, value));
        size++;
    }
    
    public V get(K key) {
        int index = hash(key);
        LinkedList<Entry<K, V>> bucket = buckets[index];
        
        for (Entry<K, V> entry : bucket) {
            if (entry.key.equals(key)) {
                return entry.value;
            }
        }
        
        return null;
    }
    
    private int hash(K key) {
        return Math.abs(key.hashCode() % buckets.length);
    }
    
    private double loadFactor() {
        return (double) size / buckets.length;
    }
    
    @SuppressWarnings("unchecked")
    private void resize() {
        LinkedList<Entry<K, V>>[] oldBuckets = buckets;
        buckets = new LinkedList[oldBuckets.length * 2];
        
        for (int i = 0; i < buckets.length; i++) {
            buckets[i] = new LinkedList<>();
        }
        
        size = 0;
        for (LinkedList<Entry<K, V>> bucket : oldBuckets) {
            for (Entry<K, V> entry : bucket) {
                put(entry.key, entry.value);
            }
        }
    }
    
    private static class Entry<K, V> {
        K key;
        V value;
        
        Entry(K key, V value) {
            this.key = key;
            this.value = value;
        }
    }
}
```
  </TabItem>
  <TabItem value="go" label="Go">
```go
package hashtable

type Entry struct {
    key   interface{}
    value interface{}
}

type HashTable struct {
    buckets    [][]Entry
    size       int
    capacity   int
    loadFactor float64
}

func NewHashTable() *HashTable {
    initialCapacity := 16
    return &HashTable{
        buckets:    make([][]Entry, initialCapacity),
        size:       0,
        capacity:   initialCapacity,
        loadFactor: 0.75,
    }
}

func (ht *HashTable) hash(key interface{}) int {
    // Simple hash function for demonstration
    h := 0
    for _, ch := range []byte(key.(string)) {
        h = 31*h + int(ch)
    }
    return abs(h) % ht.capacity
}

func (ht *HashTable) Put(key, value interface{}) {
    if float64(ht.size)/float64(ht.capacity) >= ht.loadFactor {
        ht.resize()
    }

    index := ht.hash(key)
    
    // Initialize bucket if nil
    if ht.buckets[index] == nil {
        ht.buckets[index] = make([]Entry, 0)
    }

    // Update existing key
    for i, entry := range ht.buckets[index] {
        if entry.key == key {
            ht.buckets[index][i].value = value
            return
        }
    }

    // Add new entry
    ht.buckets[index] = append(ht.buckets[index], Entry{key, value})
    ht.size++
}

func (ht *HashTable) Get(key interface{}) interface{} {
    index := ht.hash(key)
    
    if ht.buckets[index] != nil {
        for _, entry := range ht.buckets[index] {
            if entry.key == key {
                return entry.value
            }
        }
    }
    
    return nil
}

func (ht *HashTable) resize() {
    oldBuckets := ht.buckets
    ht.capacity *= 2
    ht.buckets = make([][]Entry, ht.capacity)
    ht.size = 0

    for _, bucket := range oldBuckets {
        for _, entry := range bucket {
            ht.Put(entry.key, entry.value)
        }
    }
}

func abs(x int) int {
    if x < 0 {
        return -x
    }
    return x
}
```
  </TabItem>
</Tabs>

## 🔄 Related Patterns

1. **Skip Lists**
    - Alternative to balanced trees
    - Complements hash tables in ordered data scenarios

2. **Bloom Filters**
    - Used for membership testing
    - Can be used as a pre-filter before hash table lookups

3. **LRU Cache**
    - Often implemented using hash tables
    - Provides O(1) access with size limits

## ⚙️ Best Practices

### Configuration
1. **Initial Capacity**
    - Choose based on expected data size
    - Consider memory constraints

2. **Load Factor**
    - Default: 0.75
    - Lower for better performance
    - Higher for space efficiency

3. **Hash Function Selection**
    - Use well-distributed hash functions
    - Consider domain-specific requirements

### Monitoring
1. **Load Factor Tracking**
2. **Collision Statistics**
3. **Resize Operations Frequency**
4. **Access Patterns Analysis**

### Testing
1. **Distribution Tests**
2. **Collision Handling**
3. **Performance Benchmarks**
4. **Edge Cases**

## 🚫 Common Pitfalls

1. **Poor Hash Function**
    - Impact: Uneven distribution
    - Solution: Use well-tested hash functions

2. **Inadequate Initial Capacity**
    - Impact: Frequent resizing
    - Solution: Size appropriately for expected load

3. **Ignoring Load Factor**
    - Impact: Performance degradation
    - Solution: Monitor and adjust as needed

## 🎯 Use Cases

### 1. Caching System
Example implementation:

<Tabs>
  <TabItem value="java" label="Java">
```java
public class Cache<K, V> {
    private final HashTable<K, V> storage;
    private final int capacity;

    public Cache(int capacity) {
        this.storage = new HashTable<>();
        this.capacity = capacity;
    }
    
    public void put(K key, V value) {
        if (storage.size() >= capacity) {
            evictOldest();
        }
        storage.put(key, value);
    }
    
    public V get(K key) {
        return storage.get(key);
    }
    
    private void evictOldest() {
        // Implement eviction strategy
    }
}
```
  </TabItem>
  <TabItem value="go" label="Go">
```go
type Cache struct {
    storage   *HashTable
    capacity  int
}

func NewCache(capacity int) *Cache {
    return &Cache{
        storage:  NewHashTable(),
        capacity: capacity,
    }
}

func (c *Cache) Put(key, value interface{}) {
    if c.storage.size >= c.capacity {
        c.evictOldest()
    }
    c.storage.Put(key, value)
}

func (c *Cache) Get(key interface{}) interface{} {
    return c.storage.Get(key)
}

func (c *Cache) evictOldest() {
    // Implement eviction strategy
}
```
  </TabItem>
</Tabs>

### 2. Database Indexing
- Use: Quick record lookup
- Benefits: O(1) average access time
- Application: In-memory databases

### 3. Symbol Tables
- Use: Compiler symbol management
- Benefits: Fast identifier lookup
- Application: Programming language implementations

## 🔍 Deep Dive Topics

### Thread Safety
1. **Concurrent Access**
    - Use locks for bucket access
    - Consider concurrent hash map implementations
    - Handle resize operations safely

### Distributed Systems
1. **Consistent Hashing**
    - Distribute keys across nodes
    - Handle node addition/removal
    - Minimize key redistribution

### Performance Optimization
1. **Memory Layout**
    - Cache-friendly bucket organization
    - Optimal probe sequences
    - Memory-aligned structures

## 📚 Additional Resources

### Libraries
1. Java ConcurrentHashMap
2. Go sync.Map
3. Google's Dense Hash Map

### References
1. "The Art of Computer Programming, Vol. 3: Sorting and Searching" by Donald Knuth
2. "Introduction to Algorithms" by CLRS
3. "Algorithms, 4th Edition" by Sedgewick and Wayne

### Tools
1. Hash Function Testers
2. Performance Profilers
3. Visualization Tools

## ❓ FAQs

1. **Q: When should I use a hash table instead of a tree?**
   A: Use hash tables when you need average O(1) access time and don't require ordered data traversal.

2. **Q: What's a good load factor to use?**
   A: 0.75 is a common choice, balancing space efficiency and performance.

3. **Q: How do I handle collisions effectively?**
   A: Choose between chaining (linked lists) or open addressing based on your use case and load factor.

4. **Q: What makes a good hash function?**
   A: Good distribution, fast computation, and deterministic results are key characteristics.

5. **Q: How do I handle resizing in a concurrent environment?**
   A: Use a concurrent hash map implementation or implement proper locking mechanisms.
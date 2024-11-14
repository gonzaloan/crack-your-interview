---
sidebar_position: 3
title: "B Trees"
description: "B Trees"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌳 Data Structures: B-Trees

## Overview

A B-tree is a self-balancing tree data structure that maintains sorted data and allows searches, sequential access, insertions, and deletions in logarithmic time. Unlike binary trees, a B-tree node can have more than two children and is optimized for systems that read and write large blocks of data, like databases and file systems.

### Real-World Analogy 🌎
Think of a B-tree like:
- A library catalog system where each drawer (node) contains multiple sorted index cards
- A multi-level parking garage where each level can hold multiple cars
- A hierarchical file system where each directory can contain multiple files and subdirectories

## Key Concepts 🎯

### Core Properties

1. **Node Structure**
    - Multiple keys per node
    - Multiple children per node
    - Keys are stored in sorted order

2. **B-tree Order (m)**
    - Each node can have up to m children
    - Each node (except root) has at least ⌈m/2⌉ children
    - Keys in each node = children - 1

3. **Balance Properties**
    - All leaf nodes are at the same level
    - Tree grows and shrinks from root
    - Perfect balance maintained

### Operations

1. **Search**
    - Start from root
    - Binary search within nodes
    - Follow appropriate child pointers

2. **Insert**
    - Find appropriate leaf
    - Split nodes if necessary
    - Propagate splits upward

3. **Delete**
    - Find key
    - Merge nodes if necessary
    - Rebalance if required

## Implementation Examples

### B-Tree Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    public class BTree<K extends Comparable<K>> {
        private static final int MIN_DEGREE = 2;

        private class Node {
            private int n;              // Current number of keys
            private K[] keys;           // Array of keys
            private Node[] children;    // Array of child pointers
            private boolean leaf;       // Is this a leaf node?
            
            @SuppressWarnings("unchecked")
            Node(boolean leaf) {
                this.leaf = leaf;
                this.keys = (K[]) new Comparable[2 * MIN_DEGREE - 1];
                this.children = new Node[2 * MIN_DEGREE];
                this.n = 0;
            }
        }
        
        private Node root;
        
        public BTree() {
            root = new Node(true);
        }
        
        // Search operation
        public K search(K key) {
            return search(root, key);
        }
        
        private K search(Node node, K key) {
            int i = 0;
            while (i < node.n && key.compareTo(node.keys[i]) > 0) {
                i++;
            }
            
            if (i < node.n && key.compareTo(node.keys[i]) == 0) {
                return node.keys[i];
            }
            
            if (node.leaf) {
                return null;
            }
            
            return search(node.children[i], key);
        }
        
        // Insert operation
        public void insert(K key) {
            Node r = root;
            
            if (r.n == 2 * MIN_DEGREE - 1) {
                Node s = new Node(false);
                root = s;
                s.children[0] = r;
                splitChild(s, 0, r);
                insertNonFull(s, key);
            } else {
                insertNonFull(r, key);
            }
        }
        
        private void insertNonFull(Node node, K key) {
            int i = node.n - 1;
            
            if (node.leaf) {
                while (i >= 0 && key.compareTo(node.keys[i]) < 0) {
                    node.keys[i + 1] = node.keys[i];
                    i--;
                }
                node.keys[i + 1] = key;
                node.n++;
            } else {
                while (i >= 0 && key.compareTo(node.keys[i]) < 0) {
                    i--;
                }
                i++;
                
                if (node.children[i].n == 2 * MIN_DEGREE - 1) {
                    splitChild(node, i, node.children[i]);
                    if (key.compareTo(node.keys[i]) > 0) {
                        i++;
                    }
                }
                insertNonFull(node.children[i], key);
            }
        }
        
        private void splitChild(Node parent, int i, Node child) {
            Node newChild = new Node(child.leaf);
            newChild.n = MIN_DEGREE - 1;
            
            for (int j = 0; j < MIN_DEGREE - 1; j++) {
                newChild.keys[j] = child.keys[j + MIN_DEGREE];
            }
            
            if (!child.leaf) {
                for (int j = 0; j < MIN_DEGREE; j++) {
                    newChild.children[j] = child.children[j + MIN_DEGREE];
                }
            }
            
            child.n = MIN_DEGREE - 1;
            
            for (int j = parent.n; j >= i + 1; j--) {
                parent.children[j + 1] = parent.children[j];
            }
            
            parent.children[i + 1] = newChild;
            
            for (int j = parent.n - 1; j >= i; j--) {
                parent.keys[j + 1] = parent.keys[j];
            }
            
            parent.keys[i] = child.keys[MIN_DEGREE - 1];
            parent.n++;
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

    const MIN_DEGREE = 2

    type Node[K comparable] struct {
        n        int          // Current number of keys
        keys     []K          // Array of keys
        children []*Node[K]   // Array of child pointers
        leaf     bool         // Is this a leaf node?
    }

    type BTree[K comparable] struct {
        root *Node[K]
    }

    func NewNode[K comparable](leaf bool) *Node[K] {
        return &Node[K]{
            n:        0,
            keys:     make([]K, 2*MIN_DEGREE-1),
            children: make([]*Node[K], 2*MIN_DEGREE),
            leaf:     leaf,
        }
    }

    func NewBTree[K comparable]() *BTree[K] {
        return &BTree[K]{
            root: NewNode[K](true),
        }
    }

    func (t *BTree[K]) Search(key K) (K, bool) {
        return t.search(t.root, key)
    }

    func (t *BTree[K]) search(node *Node[K], key K) (K, bool) {
        i := 0
        for i < node.n && key > node.keys[i] {
            i++
        }

        if i < node.n && key == node.keys[i] {
            return node.keys[i], true
        }

        if node.leaf {
            var zero K
            return zero, false
        }

        return t.search(node.children[i], key)
    }

    func (t *BTree[K]) Insert(key K) {
        root := t.root

        if root.n == 2*MIN_DEGREE-1 {
            newRoot := NewNode[K](false)
            t.root = newRoot
            newRoot.children[0] = root
            t.splitChild(newRoot, 0, root)
            t.insertNonFull(newRoot, key)
        } else {
            t.insertNonFull(root, key)
        }
    }

    func (t *BTree[K]) insertNonFull(node *Node[K], key K) {
        i := node.n - 1

        if node.leaf {
            for i >= 0 && key < node.keys[i] {
                node.keys[i+1] = node.keys[i]
                i--
            }
            node.keys[i+1] = key
            node.n++
        } else {
            for i >= 0 && key < node.keys[i] {
                i--
            }
            i++

            if node.children[i].n == 2*MIN_DEGREE-1 {
                t.splitChild(node, i, node.children[i])
                if key > node.keys[i] {
                    i++
                }
            }
            t.insertNonFull(node.children[i], key)
        }
    }

    func (t *BTree[K]) splitChild(parent *Node[K], i int, child *Node[K]) {
        newChild := NewNode[K](child.leaf)
        newChild.n = MIN_DEGREE - 1

        for j := 0; j < MIN_DEGREE-1; j++ {
            newChild.keys[j] = child.keys[j+MIN_DEGREE]
        }

        if !child.leaf {
            for j := 0; j < MIN_DEGREE; j++ {
                newChild.children[j] = child.children[j+MIN_DEGREE]
            }
        }

        child.n = MIN_DEGREE - 1

        for j := parent.n; j >= i+1; j-- {
            parent.children[j+1] = parent.children[j]
        }

        parent.children[i+1] = newChild

        for j := parent.n - 1; j >= i; j-- {
            parent.keys[j+1] = parent.keys[j]
        }

        parent.keys[i] = child.keys[MIN_DEGREE-1]
        parent.n++
    }
    ```
  </TabItem>
</Tabs>

## Related Patterns 🔄

1. **Composite Pattern**
    - Node hierarchy management
    - Tree traversal operations

2. **Strategy Pattern**
    - Different split/merge strategies
    - Custom key comparison

3. **Iterator Pattern**
    - In-order traversal
    - Range queries

## Best Practices 👍

### Configuration
1. **Degree Selection**
    - Based on disk block size
    - Memory constraints
    - Access patterns

2. **Caching Strategy**
    - Node caching
    - Frequent access optimization
    - Memory management

### Monitoring
1. **Performance Metrics**
    - Node utilization
    - Split/merge frequency
    - Height changes

2. **Health Checks**
    - Balance verification
    - Node occupancy
    - Disk I/O patterns

### Testing
1. **Functional Testing**
    - Insert/delete sequences
    - Range queries
    - Edge cases

2. **Performance Testing**
    - Large datasets
    - Random access patterns
    - Concurrent operations

## Common Pitfalls ⚠️

1. **Improper Degree Selection**
    - Too small/large
    - Solution: Profile-based tuning

2. **Memory Management**
    - Excessive node splits
    - Solution: Proper caching

3. **Concurrency Issues**
    - Race conditions
    - Solution: Proper locking

## Use Cases 🎯

### 1. Database Systems
- **Usage**: Index management
- **Why**: Optimized for disk access
- **Implementation**: Multiple indices

### 2. File Systems
- **Usage**: Directory structure
- **Why**: Block-aligned access
- **Implementation**: File metadata

### 3. Search Engines
- **Usage**: Inverted index
- **Why**: Range queries
- **Implementation**: Term dictionary

## Deep Dive Topics 🤿

### Thread Safety

1. **Locking Strategies**
    - Read-write locks
    - Lock-coupling
    - Lock-free algorithms

2. **Concurrent Operations**
    - Split coordination
    - Merge synchronization
    - Version control

### Performance

1. **Time Complexity**
    - Search: O(log_m n)
    - Insert: O(log_m n)
    - Delete: O(log_m n)
    - Space: O(n)

2. **I/O Optimization**
    - Block alignment
    - Buffer management
    - Prefetching

### Distributed Systems

1. **Distributed B-trees**
    - Partition strategies
    - Replication methods
    - Consistency models

## Additional Resources 📚

### References
1. "Database Management Systems" - Ramakrishnan
2. "The Art of Computer Programming" - Knuth
3. "Advanced Data Structures" - Peter Brass

### Tools
1. Database Analyzers
2. I/O Profilers
3. Visualization Tools

## FAQs ❓

### Q: When should I use B-trees over other trees?
A: Use B-trees when:
- Working with disk-based storage
- Need efficient range queries
- Handling large datasets

### Q: How to choose the right degree?
A: Consider:
- Disk block size
- Key size
- Child pointer size
- Cache line size

### Q: B-tree vs B+ tree?
A: Key differences:
- B+ trees store data only in leaves
- B+ trees have leaf-level links
- B+ trees optimize range queries
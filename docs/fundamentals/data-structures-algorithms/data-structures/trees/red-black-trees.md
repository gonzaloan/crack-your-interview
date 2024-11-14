---
sidebar_position: 4
title: "Red Black Trees"
description: "Red Black Trees"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔴⚫ Data Structures: Red-Black Trees

## Overview

A Red-Black Tree is a self-balancing binary search tree where each node has an extra color property (red or black) that helps maintain balance during operations. The tree's special properties ensure that it remains approximately balanced, guaranteeing O(log n) time for basic operations.

### Real-World Analogy 🌎
Think of a Red-Black Tree like:
- A traffic management system where red signals (red nodes) act as temporary stops while black signals (black nodes) represent main intersections
- A corporate hierarchy with permanent positions (black nodes) and temporary roles (red nodes)
- A book organization system where main categories (black) and subcategories (red) maintain balance

## Key Concepts 🎯

### Red-Black Properties

1. **Node Properties**
    - Color: Red or Black
    - Key/Value
    - Left/Right children
    - Parent reference

2. **Tree Invariants**
    - Root is always black
    - All leaves (NIL) are black
    - Red nodes have black children
    - Same number of black nodes in all paths to leaves
    - New nodes are inserted as red

### Balancing Operations

1. **Color Changes**
    - Flips between red and black
    - Maintains tree properties

2. **Rotations**
    - Left rotation
    - Right rotation
    - Used with color changes

3. **Recoloring**
    - Uncle-based recoloring
    - Path recoloring

## Implementation Examples

### Red-Black Tree Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    public class RedBlackTree<K extends Comparable<K>, V> {
        private static final boolean RED = true;
        private static final boolean BLACK = false;

        private class Node {
            K key;
            V value;
            Node left, right, parent;
            boolean color;
            
            Node(K key, V value, boolean color) {
                this.key = key;
                this.value = value;
                this.color = color;
            }
        }
        
        private Node root;
        
        // Insert operation
        public void put(K key, V value) {
            root = put(root, key, value);
            root.color = BLACK;
        }
        
        private Node put(Node node, K key, V value) {
            if (node == null) {
                return new Node(key, value, RED);
            }
            
            int cmp = key.compareTo(node.key);
            if (cmp < 0) {
                node.left = put(node.left, key, value);
                node.left.parent = node;
            } else if (cmp > 0) {
                node.right = put(node.right, key, value);
                node.right.parent = node;
            } else {
                node.value = value;
            }
            
            // Fix Red-Black violations
            if (isRed(node.right) && !isRed(node.left)) {
                node = rotateLeft(node);
            }
            if (isRed(node.left) && isRed(node.left.left)) {
                node = rotateRight(node);
            }
            if (isRed(node.left) && isRed(node.right)) {
                flipColors(node);
            }
            
            return node;
        }
        
        private boolean isRed(Node node) {
            return node != null && node.color == RED;
        }
        
        private Node rotateLeft(Node h) {
            Node x = h.right;
            h.right = x.left;
            if (x.left != null) {
                x.left.parent = h;
            }
            x.left = h;
            x.color = h.color;
            h.color = RED;
            x.parent = h.parent;
            h.parent = x;
            return x;
        }
        
        private Node rotateRight(Node h) {
            Node x = h.left;
            h.left = x.right;
            if (x.right != null) {
                x.right.parent = h;
            }
            x.right = h;
            x.color = h.color;
            h.color = RED;
            x.parent = h.parent;
            h.parent = x;
            return x;
        }
        
        private void flipColors(Node h) {
            h.color = RED;
            h.left.color = BLACK;
            h.right.color = BLACK;
        }
        
        // Get operation
        public V get(K key) {
            Node x = root;
            while (x != null) {
                int cmp = key.compareTo(x.key);
                if (cmp < 0) x = x.left;
                else if (cmp > 0) x = x.right;
                else return x.value;
            }
            return null;
        }
        
        // Check if tree is valid Red-Black tree
        public boolean isRedBlackTree() {
            if (root == null) return true;
            
            if (root.color == RED) return false;
            
            int blackHeight = getBlackHeight(root);
            if (blackHeight == -1) return false;
            
            return true;
        }
        
        private int getBlackHeight(Node node) {
            if (node == null) return 0;
            
            int leftHeight = getBlackHeight(node.left);
            int rightHeight = getBlackHeight(node.right);
            
            if (leftHeight == -1 || rightHeight == -1 || leftHeight != rightHeight) {
                return -1;
            }
            
            if (isRed(node) && (isRed(node.left) || isRed(node.right))) {
                return -1;
            }
            
            return leftHeight + (node.color == BLACK ? 1 : 0);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    type Color bool

    const (
        RED   Color = true
        BLACK Color = false
    )

    type Node[K comparable, V any] struct {
        key    K
        value  V
        left   *Node[K, V]
        right  *Node[K, V]
        parent *Node[K, V]
        color  Color
    }

    type RedBlackTree[K comparable, V any] struct {
        root *Node[K, V]
    }

    func NewRedBlackTree[K comparable, V any]() *RedBlackTree[K, V] {
        return &RedBlackTree[K, V]{}
    }

    func (t *RedBlackTree[K, V]) Put(key K, value V) {
        t.root = t.put(t.root, key, value)
        t.root.color = BLACK
    }

    func (t *RedBlackTree[K, V]) put(node *Node[K, V], key K, value V) *Node[K, V] {
        if node == nil {
            return &Node[K, V]{key: key, value: value, color: RED}
        }

        if key < node.key {
            node.left = t.put(node.left, key, value)
            node.left.parent = node
        } else if key > node.key {
            node.right = t.put(node.right, key, value)
            node.right.parent = node
        } else {
            node.value = value
        }

        // Fix Red-Black violations
        if t.isRed(node.right) && !t.isRed(node.left) {
            node = t.rotateLeft(node)
        }
        if t.isRed(node.left) && t.isRed(node.left.left) {
            node = t.rotateRight(node)
        }
        if t.isRed(node.left) && t.isRed(node.right) {
            t.flipColors(node)
        }

        return node
    }

    func (t *RedBlackTree[K, V]) isRed(node *Node[K, V]) bool {
        return node != nil && node.color == RED
    }

    func (t *RedBlackTree[K, V]) rotateLeft(h *Node[K, V]) *Node[K, V] {
        x := h.right
        h.right = x.left
        if x.left != nil {
            x.left.parent = h
        }
        x.left = h
        x.color = h.color
        h.color = RED
        x.parent = h.parent
        h.parent = x
        return x
    }

    func (t *RedBlackTree[K, V]) rotateRight(h *Node[K, V]) *Node[K, V] {
        x := h.left
        h.left = x.right
        if x.right != nil {
            x.right.parent = h
        }
        x.right = h
        x.color = h.color
        h.color = RED
        x.parent = h.parent
        h.parent = x
        return x
    }

    func (t *RedBlackTree[K, V]) flipColors(h *Node[K, V]) {
        h.color = RED
        h.left.color = BLACK
        h.right.color = BLACK
    }

    func (t *RedBlackTree[K, V]) Get(key K) (V, bool) {
        var zero V
        x := t.root
        for x != nil {
            switch {
            case key < x.key:
                x = x.left
            case key > x.key:
                x = x.right
            default:
                return x.value, true
            }
        }
        return zero, false
    }

    func (t *RedBlackTree[K, V]) IsRedBlackTree() bool {
        if t.root == nil {
            return true
        }

        if t.root.color == RED {
            return false
        }

        blackHeight := t.getBlackHeight(t.root)
        return blackHeight != -1
    }

    func (t *RedBlackTree[K, V]) getBlackHeight(node *Node[K, V]) int {
        if node == nil {
            return 0
        }

        leftHeight := t.getBlackHeight(node.left)
        rightHeight := t.getBlackHeight(node.right)

        if leftHeight == -1 || rightHeight == -1 || leftHeight != rightHeight {
            return -1
        }

        if t.isRed(node) && (t.isRed(node.left) || t.isRed(node.right)) {
            return -1
        }

        blackIncrement := 0
        if node.color == BLACK {
            blackIncrement = 1
        }
        return leftHeight + blackIncrement
    }
    ```
  </TabItem>
</Tabs>

## Related Patterns 🔄

1. **Composite Pattern**
    - Tree structure management
    - Recursive operations

2. **Strategy Pattern**
    - Different balancing strategies
    - Color assignment policies

3. **Iterator Pattern**
    - Tree traversal
    - Range queries

## Best Practices 👍

### Configuration
1. **Initial Setup**
    - Root color setup
    - NIL nodes handling
    - Parent pointers

2. **Balancing Strategy**
    - Rotation timing
    - Color flip decisions
    - Violation checks

### Monitoring
1. **Tree Health**
    - Black height
    - Red violations
    - Path lengths

2. **Performance Metrics**
    - Rotation count
    - Color changes
    - Operation timing

### Testing
1. **Invariant Testing**
    - Property verification
    - Balance checking
    - Color rules

2. **Operation Testing**
    - Insertion scenarios
    - Deletion cases
    - Search patterns

## Common Pitfalls ⚠️

1. **Red Property Violations**
    - Consecutive red nodes
    - Solution: Proper rotations

2. **Black Height Inconsistency**
    - Unequal black paths
    - Solution: Rebalancing

3. **Parent Pointers**
    - Incorrect updates
    - Solution: Careful maintenance

## Use Cases 🎯

### 1. Java TreeMap
- **Usage**: Key-value storage
- **Why**: Guaranteed performance
- **Implementation**: Core collection

### 2. Linux Kernel
- **Usage**: CPU scheduling
- **Why**: Fast insertion/deletion
- **Implementation**: Process management

### 3. Database Indices
- **Usage**: Index management
- **Why**: Balanced operations
- **Implementation**: Query optimization

## Deep Dive Topics 🤿

### Thread Safety

1. **Concurrent Operations**
    - Read-write locks
    - Atomic rotations
    - Color synchronization

2. **Safe Modifications**
    - Lock ordering
    - Atomic updates
    - Recovery handling

### Performance

1. **Time Complexity**
    - Insert: O(log n)
    - Delete: O(log n)
    - Search: O(log n)

2. **Memory Usage**
    - Color storage
    - Parent pointers
    - NIL node handling

### Distributed Systems

1. **Distributed Trees**
    - Partition strategies
    - Color consistency
    - Rebalancing coordination

## Additional Resources 📚

### References
1. "Introduction to Algorithms" - CLRS
2. "Algorithms" - Robert Sedgewick
3. "The Art of Computer Programming" - Donald Knuth

### Tools
1. Tree Visualizers
2. Testing Frameworks
3. Performance Profilers

## FAQs ❓

### Q: Red-Black vs AVL Trees?
A: Choose based on:
- Red-Black for more writes
- AVL for more reads
- Red-Black for general use

### Q: Why not just use AVL trees?
A: Red-Black advantages:
- Fewer rotations
- Better write performance
- More flexible balance

### Q: How to handle concurrent access?
A: Strategies include:
- Reader-writer locks
- Lock-free algorithms
- Versioned nodes
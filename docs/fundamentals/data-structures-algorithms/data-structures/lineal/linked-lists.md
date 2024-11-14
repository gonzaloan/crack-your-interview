---
sidebar_position: 2
title: "Linked Lists"
description: "Linked Lists"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔗 Data Structures: Linked Lists

## Overview

A linked list is a linear data structure where elements are stored in nodes, and each node points to the next node in the sequence. Unlike arrays, linked lists don't require contiguous memory allocation and can grow or shrink dynamically.

### Real-World Analogy 🌎
Think of a scavenger hunt where each clue contains directions to find the next clue. Like:
- Each clue (node) contains information (data)
- Each clue points to the next location (reference/pointer)
- You can't skip ahead; you must follow the sequence
- New clues can be easily added by updating references

## Key Concepts 🎯

### Node Structure
1. **Data**
    - Holds the actual value
    - Can be any data type

2. **Reference(s)**
    - Points to the next node
    - Points to previous node (in doubly-linked lists)
    - Null for last node

### Types of Linked Lists

1. **Singly Linked List**
    - Each node points to next node
    - Last node points to null
    - One-way traversal

2. **Doubly Linked List**
    - Each node points to next and previous nodes
    - Bi-directional traversal
    - More memory usage

3. **Circular Linked List**
    - Last node points to first node
    - Can be singly or doubly linked
    - No null references

## Implementation Examples

### Basic Linked List Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    public class LinkedList<T> {
        private class Node {
            T data;
            Node next;

            Node(T data) {
                this.data = data;
                this.next = null;
            }
        }
        
        private Node head;
        private int size;
        
        public LinkedList() {
            head = null;
            size = 0;
        }
        
        // Add element to the end
        public void add(T data) {
            Node newNode = new Node(data);
            if (head == null) {
                head = newNode;
            } else {
                Node current = head;
                while (current.next != null) {
                    current = current.next;
                }
                current.next = newNode;
            }
            size++;
        }
        
        // Remove first occurrence of element
        public boolean remove(T data) {
            if (head == null) return false;
            
            if (head.data.equals(data)) {
                head = head.next;
                size--;
                return true;
            }
            
            Node current = head;
            while (current.next != null) {
                if (current.next.data.equals(data)) {
                    current.next = current.next.next;
                    size--;
                    return true;
                }
                current = current.next;
            }
            return false;
        }
        
        // Get element at index
        public T get(int index) {
            if (index < 0 || index >= size) {
                throw new IndexOutOfBoundsException("Index: " + index);
            }
            
            Node current = head;
            for (int i = 0; i < index; i++) {
                current = current.next;
            }
            return current.data;
        }
        
        // Print list
        public void printList() {
            Node current = head;
            while (current != null) {
                System.out.print(current.data + " -> ");
                current = current.next;
            }
            System.out.println("null");
        }
        
        public int size() {
            return size;
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "errors"
    )

    type Node[T any] struct {
        data T
        next *Node[T]
    }

    type LinkedList[T any] struct {
        head *Node[T]
        size int
    }

    func NewLinkedList[T any]() *LinkedList[T] {
        return &LinkedList[T]{
            head: nil,
            size: 0,
        }
    }

    // Add element to the end
    func (ll *LinkedList[T]) Add(data T) {
        newNode := &Node[T]{data: data}
        if ll.head == nil {
            ll.head = newNode
        } else {
            current := ll.head
            for current.next != nil {
                current = current.next
            }
            current.next = newNode
        }
        ll.size++
    }

    // Remove first occurrence of element
    func (ll *LinkedList[T]) Remove(data T) bool {
        if ll.head == nil {
            return false
        }

        if ll.head.data == data {
            ll.head = ll.head.next
            ll.size--
            return true
        }

        current := ll.head
        for current.next != nil {
            if current.next.data == data {
                current.next = current.next.next
                ll.size--
                return true
            }
            current = current.next
        }
        return false
    }

    // Get element at index
    func (ll *LinkedList[T]) Get(index int) (T, error) {
        var zero T
        if index < 0 || index >= ll.size {
            return zero, errors.New("index out of bounds")
        }

        current := ll.head
        for i := 0; i < index; i++ {
            current = current.next
        }
        return current.data, nil
    }

    // Print list
    func (ll *LinkedList[T]) PrintList() {
        current := ll.head
        for current != nil {
            fmt.Printf("%v -> ", current.data)
            current = current.next
        }
        fmt.Println("nil")
    }

    func (ll *LinkedList[T]) Size() int {
        return ll.size
    }
    ```
  </TabItem>
</Tabs>

## Related Patterns 🔄

1. **Iterator Pattern**
    - Sequential access to elements
    - Common in linked list traversal

2. **Composite Pattern**
    - Building tree structures
    - Hierarchical data representation

3. **Observer Pattern**
    - Notification chains
    - Event handling systems

## Best Practices 👍

### Configuration
1. **Memory Management**
    - Proper node cleanup
    - Reference management
    - Memory leak prevention

2. **Type Safety**
    - Use generics
    - Implement type constraints
    - Handle null cases

### Monitoring
1. **Performance Tracking**
    - Operation timings
    - Memory usage
    - List size changes

2. **Error Handling**
    - Boundary conditions
    - Null references
    - Invalid operations

### Testing
1. **Unit Tests**
    - Empty list operations
    - Single element operations
    - Multiple elements operations
    - Edge cases

2. **Integration Tests**
    - With other data structures
    - In larger systems
    - Concurrent access

## Common Pitfalls ⚠️

1. **Memory Leaks**
    - Not clearing references
    - Circular references
    - Solution: Proper cleanup

2. **Null Pointer Exceptions**
    - Not checking for null
    - Solution: Null checks

3. **Performance Issues**
    - Linear search time
    - Solution: Use appropriate variants

## Use Cases 🎯

### 1. Undo/Redo System
- **Usage**: Text editors
- **Why**: Easy insertion/deletion
- **Implementation**: Doubly linked list

### 2. Music Playlist
- **Usage**: Media players
- **Why**: Dynamic song addition/removal
- **Implementation**: Circular linked list

### 3. Symbol Table
- **Usage**: Compiler design
- **Why**: Frequent insertions
- **Implementation**: Singly linked list

## Deep Dive Topics 🤿

### Thread Safety

1. **Synchronized List**
    - Mutex locks
    - Read-write locks
    - Atomic operations

2. **Concurrent Access**
    - Copy-on-write
    - Lock-free algorithms
    - Compare-and-swap

### Performance

1. **Time Complexity**
    - Access: O(n)
    - Insertion: O(1) at known position
    - Deletion: O(1) at known position
    - Search: O(n)

2. **Memory Usage**
    - Per node overhead
    - Reference storage
    - Cache performance

### Distributed Systems

1. **Distributed Lists**
    - Partitioning strategies
    - Replication
    - Consistency models

## Additional Resources 📚

### References
1. "Introduction to Algorithms" - CLRS
2. "Data Structures and Algorithm Analysis" - Mark Allen Weiss
3. "Programming Pearls" - Jon Bentley

### Tools
1. Visualizers: https://visualgo.net
2. Memory Profilers
3. Testing Frameworks

## FAQs ❓

### Q: When should I use a linked list instead of an array?
A: Use linked lists when:
- Frequent insertions/deletions
- Dynamic size needed
- Memory fragmentation is a concern
- Sequential access is primary pattern

### Q: What's the difference between singly and doubly linked lists?
A: Key differences:
- Memory usage (doubly uses more)
- Bi-directional vs one-way traversal
- Deletion operation complexity
- Use cases (undo/redo vs simple chains)

### Q: How do I handle concurrent access to linked lists?
A: Strategies include:
- Synchronized wrappers
- Lock-based synchronization
- Copy-on-write implementations
- Atomic operations
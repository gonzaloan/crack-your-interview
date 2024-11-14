---
sidebar_position: 4
title: "Queues"
description: "Queues"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🎯 Data Structures: Queues

## Overview

A queue is a linear data structure that follows the First-In-First-Out (FIFO) principle. Elements are added at the rear (enqueue) and removed from the front (dequeue), similar to a line of people waiting for a service.

### Real-World Analogy 🌎
Think of a queue like:
- A line at a ticket counter
- Print jobs waiting to be processed
- Cars at a drive-through
- Tasks waiting for CPU processing

## Key Concepts 🎯

### Core Operations

1. **Enqueue**
    - Add element to rear
    - O(1) time complexity

2. **Dequeue**
    - Remove element from front
    - O(1) time complexity

3. **Peek/Front**
    - View front element
    - No removal

### Types of Queues

1. **Simple Queue**
    - Basic FIFO implementation
    - Single ended

2. **Circular Queue**
    - Ring buffer implementation
    - Efficient memory usage

3. **Priority Queue**
    - Elements have priority
    - Higher priority served first

4. **Deque (Double-ended queue)**
    - Insert/remove from both ends
    - More flexible than simple queue

## Implementation Examples

### Basic Queue Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    public class Queue<T> {
        private static class Node<T> {
            T data;
            Node<T> next;

            Node(T data) {
                this.data = data;
            }
        }
        
        private Node<T> front;
        private Node<T> rear;
        private int size;
        
        public Queue() {
            front = null;
            rear = null;
            size = 0;
        }
        
        // Add element to queue
        public void enqueue(T item) {
            Node<T> newNode = new Node<>(item);
            if (isEmpty()) {
                front = newNode;
            } else {
                rear.next = newNode;
            }
            rear = newNode;
            size++;
        }
        
        // Remove element from queue
        public T dequeue() {
            if (isEmpty()) {
                throw new IllegalStateException("Queue is empty");
            }
            
            T item = front.data;
            front = front.next;
            size--;
            
            if (isEmpty()) {
                rear = null;
            }
            
            return item;
        }
        
        // Get front element without removing
        public T peek() {
            if (isEmpty()) {
                throw new IllegalStateException("Queue is empty");
            }
            return front.data;
        }
        
        public boolean isEmpty() {
            return size == 0;
        }
        
        public int size() {
            return size;
        }
    }

    // Priority Queue Example
    public class PriorityQueue<T extends Comparable<T>> {
        private final List<T> heap;
        
        public PriorityQueue() {
            heap = new ArrayList<>();
        }
        
        public void enqueue(T item) {
            heap.add(item);
            heapifyUp(heap.size() - 1);
        }
        
        public T dequeue() {
            if (isEmpty()) {
                throw new IllegalStateException("Queue is empty");
            }
            
            T item = heap.get(0);
            T lastItem = heap.remove(heap.size() - 1);
            
            if (!isEmpty()) {
                heap.set(0, lastItem);
                heapifyDown(0);
            }
            
            return item;
        }
        
        private void heapifyUp(int index) {
            while (index > 0) {
                int parent = (index - 1) / 2;
                if (heap.get(parent).compareTo(heap.get(index)) <= 0) {
                    break;
                }
                Collections.swap(heap, parent, index);
                index = parent;
            }
        }
        
        private void heapifyDown(int index) {
            int size = heap.size();
            while (true) {
                int minIndex = index;
                int left = 2 * index + 1;
                int right = 2 * index + 2;
                
                if (left < size && heap.get(left).compareTo(heap.get(minIndex)) < 0) {
                    minIndex = left;
                }
                if (right < size && heap.get(right).compareTo(heap.get(minIndex)) < 0) {
                    minIndex = right;
                }
                
                if (minIndex == index) {
                    break;
                }
                
                Collections.swap(heap, index, minIndex);
                index = minIndex;
            }
        }
        
        public boolean isEmpty() {
            return heap.isEmpty();
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "errors"
        "container/heap"
    )

    // Basic Queue
    type Queue[T any] struct {
        items []T
    }

    func NewQueue[T any]() *Queue[T] {
        return &Queue[T]{
            items: make([]T, 0),
        }
    }

    func (q *Queue[T]) Enqueue(item T) {
        q.items = append(q.items, item)
    }

    func (q *Queue[T]) Dequeue() (T, error) {
        var zero T
        if q.IsEmpty() {
            return zero, errors.New("queue is empty")
        }
        
        item := q.items[0]
        q.items = q.items[1:]
        return item, nil
    }

    func (q *Queue[T]) Peek() (T, error) {
        var zero T
        if q.IsEmpty() {
            return zero, errors.New("queue is empty")
        }
        return q.items[0], nil
    }

    func (q *Queue[T]) IsEmpty() bool {
        return len(q.items) == 0
    }

    func (q *Queue[T]) Size() int {
        return len(q.items)
    }

    // Priority Queue Implementation
    type Item struct {
        value    interface{}
        priority int
        index    int
    }

    type PriorityQueue []*Item

    func (pq PriorityQueue) Len() int { return len(pq) }

    func (pq PriorityQueue) Less(i, j int) bool {
        return pq[i].priority < pq[j].priority
    }

    func (pq PriorityQueue) Swap(i, j int) {
        pq[i], pq[j] = pq[j], pq[i]
        pq[i].index = i
        pq[j].index = j
    }

    func (pq *PriorityQueue) Push(x interface{}) {
        n := len(*pq)
        item := x.(*Item)
        item.index = n
        *pq = append(*pq, item)
    }

    func (pq *PriorityQueue) Pop() interface{} {
        old := *pq
        n := len(old)
        item := old[n-1]
        old[n-1] = nil
        item.index = -1
        *pq = old[0 : n-1]
        return item
    }

    // Usage example
    func main() {
        // Basic Queue
        queue := NewQueue[int]()
        queue.Enqueue(1)
        queue.Enqueue(2)
        value, _ := queue.Dequeue()
        
        // Priority Queue
        pq := make(PriorityQueue, 0)
        heap.Init(&pq)
        
        item := &Item{
            value:    "high priority",
            priority: 1,
        }
        heap.Push(&pq, item)
    }
    ```
  </TabItem>
</Tabs>

## Related Patterns 🔄

1. **Producer-Consumer Pattern**
    - Queue as buffer between components
    - Async processing

2. **Observer Pattern**
    - Event queue implementation
    - Message distribution

3. **Command Pattern**
    - Task queuing
    - Operation scheduling

## Best Practices 👍

### Configuration
1. **Capacity Planning**
    - Initial size estimation
    - Growth strategy
    - Memory constraints

2. **Type Selection**
    - Queue type based on use case
    - Priority implementation
    - Thread-safety requirements

### Monitoring
1. **Queue Metrics**
    - Length/size
    - Wait times
    - Throughput
    - Rejection rate

2. **Performance Tracking**
    - Memory usage
    - Operation latency
    - Bottlenecks

### Testing
1. **Functional Testing**
    - FIFO behavior
    - Boundary conditions
    - Priority ordering

2. **Load Testing**
    - High concurrency
    - Large data sets
    - Recovery scenarios

## Common Pitfalls ⚠️

1. **Memory Leaks**
    - Not cleaning up references
    - Solution: Proper dequeue cleanup

2. **Unbounded Growth**
    - No size limits
    - Solution: Implement capacity constraints

3. **Priority Inversion**
    - In priority queues
    - Solution: Proper priority handling

## Use Cases 🎯

### 1. Print Spooler
- **Usage**: Document printing
- **Why**: Order preservation
- **Implementation**: Simple queue

### 2. CPU Scheduling
- **Usage**: Process management
- **Why**: Priority-based execution
- **Implementation**: Priority queue

### 3. Message Brokers
- **Usage**: Application communication
- **Why**: Asynchronous processing
- **Implementation**: Distributed queue

## Deep Dive Topics 🤿

### Thread Safety

1. **Concurrent Queues**
    - Blocking queues
    - Non-blocking algorithms
    - Lock-free implementations

2. **Synchronization**
    - Mutex locks
    - Condition variables
    - Atomic operations

### Performance

1. **Time Complexity**
    - Enqueue: O(1)
    - Dequeue: O(1)
    - Priority Queue: O(log n)

2. **Memory Usage**
    - Array-based vs linked
    - Memory fragmentation
    - Cache efficiency

### Distributed Systems

1. **Distributed Queues**
    - Partitioning
    - Replication
    - Consistency models

2. **Scalability**
    - Horizontal scaling
    - Load balancing
    - Fault tolerance

## Additional Resources 📚

### References
1. "Queue Theory and Practice" - Technical Papers
2. "Distributed Systems Concepts" - Academic Resources
3. "Performance Patterns" - Design Guidelines

### Tools
1. JMH (Java Microbenchmark Harness)
2. Queue Visualization Tools
3. Monitoring Systems

## FAQs ❓

### Q: When should I use a queue vs. stack?
A: Use queues when:
- FIFO order is required
- Need fair processing
- Managing async operations

### Q: How do I handle queue overflow?
A: Strategies include:
- Bounded queues
- Rejection policies
- Back-pressure mechanisms

### Q: What's the difference between blocking and non-blocking queues?
A: Key differences:
- Blocking: Waits when full/empty
- Non-blocking: Returns immediately
- Thread interaction patterns
- Performance characteristics

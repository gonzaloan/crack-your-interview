---
sidebar_position: 4
title: "Synchronization"
description: "Synchronization"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔒 Java Core Concurrency: Synchronization

## Overview 🎯

Java Synchronization provides mechanisms to control access to shared resources in a multi-threaded environment, preventing race conditions and ensuring thread safety. It's a fundamental concept in concurrent programming that helps maintain data consistency.

### Real-World Analogy
Think of synchronization like:
- **Mutex/Lock**: A single-key bathroom - only one person can use it at a time
- **ReadWriteLock**: A library with special rules - many can read simultaneously, but writing requires exclusive access
- **Semaphore**: A parking lot with limited spaces - only a fixed number of cars can enter
- **Monitor**: A bank vault with a guard - controlling both access and the order of operations

## Key Concepts 🔑

### Core Components

1. **Synchronization Types**
    - Method Synchronization
    - Block Synchronization
    - Static Synchronization
    - Volatile Variables
    - Lock Interfaces
    - Atomic Classes

2. **Lock Types**
    - Intrinsic Locks (synchronized)
    - ReentrantLock
    - ReadWriteLock
    - StampedLock
    - Semaphore

3. **Monitor Concepts**
    - wait()
    - notify()
    - notifyAll()

## Implementation Examples 💻

### Basic Synchronization

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.concurrent.locks.*;

    public class SynchronizationBasics {
        private int count = 0;
        private final Object lock = new Object();
        private final ReentrantLock reentrantLock = new ReentrantLock();
        
        // Method Synchronization
        public synchronized void incrementSync() {
            count++;
        }
        
        // Block Synchronization
        public void incrementBlock() {
            synchronized(lock) {
                count++;
            }
        }
        
        // Using ReentrantLock
        public void incrementLock() {
            reentrantLock.lock();
            try {
                count++;
            } finally {
                reentrantLock.unlock();
            }
        }
        
        // Using Atomic Variable
        private final AtomicInteger atomicCount = new AtomicInteger(0);
        
        public void incrementAtomic() {
            atomicCount.incrementAndGet();
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "sync"
        "sync/atomic"
    )

    type SynchronizationBasics struct {
        count       int
        atomicCount int64
        mutex       sync.Mutex
        rwMutex     sync.RWMutex
    }

    // Using Mutex
    func (s *SynchronizationBasics) incrementSync() {
        s.mutex.Lock()
        defer s.mutex.Unlock()
        s.count++
    }

    // Using RWMutex
    func (s *SynchronizationBasics) incrementRWLock() {
        s.rwMutex.Lock()
        defer s.rwMutex.Unlock()
        s.count++
    }

    // Using Atomic Operations
    func (s *SynchronizationBasics) incrementAtomic() {
        atomic.AddInt64(&s.atomicCount, 1)
    }
    ```
  </TabItem>
</Tabs>

### Advanced Lock Usage

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.concurrent.locks.*;
    import java.util.concurrent.TimeUnit;

    public class AdvancedLocking {
        private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
        private final StampedLock stampedLock = new StampedLock();
        private final Semaphore semaphore = new Semaphore(5);
        private String data = "";
        
        // ReadWriteLock Example
        public String readData() {
            rwLock.readLock().lock();
            try {
                return data;
            } finally {
                rwLock.readLock().unlock();
            }
        }
        
        public void writeData(String newData) {
            rwLock.writeLock().lock();
            try {
                data = newData;
            } finally {
                rwLock.writeLock().unlock();
            }
        }
        
        // StampedLock Example
        public String readWithOptimisticLock() {
            long stamp = stampedLock.tryOptimisticRead();
            String currentData = data;
            if (!stampedLock.validate(stamp)) {
                stamp = stampedLock.readLock();
                try {
                    currentData = data;
                } finally {
                    stampedLock.unlockRead(stamp);
                }
            }
            return currentData;
        }
        
        // Semaphore Example
        public void accessResource() throws InterruptedException {
            semaphore.acquire();
            try {
                // Use resource
            } finally {
                semaphore.release();
            }
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "sync"
    )

    type AdvancedLocking struct {
        data     string
        rwMutex  sync.RWMutex
        semaphore chan struct{}
    }

    func NewAdvancedLocking() *AdvancedLocking {
        return &AdvancedLocking{
            semaphore: make(chan struct{}, 5),
        }
    }

    // RWMutex Example
    func (a *AdvancedLocking) readData() string {
        a.rwMutex.RLock()
        defer a.rwMutex.RUnlock()
        return a.data
    }

    func (a *AdvancedLocking) writeData(newData string) {
        a.rwMutex.Lock()
        defer a.rwMutex.Unlock()
        a.data = newData
    }

    // Semaphore Example
    func (a *AdvancedLocking) accessResource() {
        a.semaphore <- struct{}{} // Acquire
        defer func() { <-a.semaphore }() // Release
        // Use resource
    }
    ```
  </TabItem>
</Tabs>

## Best Practices 🌟

### Lock Management

1. **Always Release Locks**
```java
// Good: Lock released in finally block
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // Critical section
} finally {
    lock.unlock();
}
```

2. **Use Appropriate Lock Types**
```java
// Good: ReadWriteLock for read-heavy scenarios
private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
public String read() {
    rwLock.readLock().lock();
    try {
        return data;
    } finally {
        rwLock.readLock().unlock();
    }
}
```

### Performance Considerations

1. **Lock Granularity**
```java
// Bad: Too coarse-grained
public synchronized void processData() {
    readData();
    processData();
    writeData();
}

// Good: Fine-grained locking
public void processData() {
    String data = readData();  // Separate read lock
    String processed = processData(data);  // No lock needed
    writeData(processed);  // Separate write lock
}
```

2. **Avoid Nested Locks**
```java
// Bad: Potential deadlock
synchronized(lockA) {
    synchronized(lockB) {
        // Logic
    }
}

// Good: Use tryLock with timeout
if (lockA.tryLock(1, TimeUnit.SECONDS)) {
    try {
        if (lockB.tryLock(1, TimeUnit.SECONDS)) {
            try {
                // Logic
            } finally {
                lockB.unlock();
            }
        }
    } finally {
        lockA.unlock();
    }
}
```

## Common Pitfalls 🚨

1. **Double-Checked Locking**
```java
// Wrong: Broken double-checked locking
private static Instance instance;
public static Instance getInstance() {
    if (instance == null) {  // First check
        synchronized(Instance.class) {
            if (instance == null) {  // Second check
                instance = new Instance();
            }
        }
    }
    return instance;
}

// Correct: Using volatile
private static volatile Instance instance;
public static Instance getInstance() {
    Instance result = instance;
    if (result == null) {
        synchronized(Instance.class) {
            result = instance;
            if (result == null) {
                instance = result = new Instance();
            }
        }
    }
    return result;
}
```

2. **Lock Ordering**
```java
// Wrong: Inconsistent lock ordering
void method1() {
    synchronized(lockA) {
        synchronized(lockB) { }
    }
}
void method2() {
    synchronized(lockB) {  // Different order!
        synchronized(lockA) { }
    }
}

// Correct: Consistent lock ordering
void method1() {
    synchronized(lockA) {
        synchronized(lockB) { }
    }
}
void method2() {
    synchronized(lockA) {  // Same order
        synchronized(lockB) { }
    }
}
```

## Use Cases 🎯

### 1. Cache Implementation
```java
public class ThreadSafeCache<K, V> {
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    private final Map<K, V> cache = new HashMap<>();
    
    public V get(K key) {
        lock.readLock().lock();
        try {
            return cache.get(key);
        } finally {
            lock.readLock().unlock();
        }
    }
    
    public void put(K key, V value) {
        lock.writeLock().lock();
        try {
            cache.put(key, value);
        } finally {
            lock.writeLock().unlock();
        }
    }
}
```

### 2. Resource Pool
```java
public class ResourcePool<T> {
    private final Semaphore semaphore;
    private final Queue<T> resources;
    private final Lock lock = new ReentrantLock();
    
    public ResourcePool(int poolSize, Supplier<T> resourceFactory) {
        this.semaphore = new Semaphore(poolSize);
        this.resources = new LinkedList<>();
        for (int i = 0; i < poolSize; i++) {
            resources.offer(resourceFactory.get());
        }
    }
    
    public T acquire() throws InterruptedException {
        semaphore.acquire();
        lock.lock();
        try {
            return resources.poll();
        } finally {
            lock.unlock();
        }
    }
    
    public void release(T resource) {
        lock.lock();
        try {
            resources.offer(resource);
        } finally {
            lock.unlock();
        }
        semaphore.release();
    }
}
```

### 3. Producer-Consumer Queue
```java
public class BoundedQueue<T> {
    private final Queue<T> queue;
    private final int capacity;
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();
    
    public BoundedQueue(int capacity) {
        this.capacity = capacity;
        this.queue = new LinkedList<>();
    }
    
    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            while (queue.size() == capacity) {
                notFull.await();
            }
            queue.offer(item);
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }
    
    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (queue.isEmpty()) {
                notEmpty.await();
            }
            T item = queue.poll();
            notFull.signal();
            return item;
        } finally {
            lock.unlock();
        }
    }
}
```

## Deep Dive Topics 🔍

### Lock Implementations

1. **ReentrantLock Internals**
```java
public class CustomReentrantLock {
    private final AtomicReference<Thread> owner = new AtomicReference<>();
    private final AtomicInteger count = new AtomicInteger(0);
    
    public void lock() {
        Thread current = Thread.currentThread();
        if (current == owner.get()) {
            count.incrementAndGet();
            return;
        }
        
        while (!owner.compareAndSet(null, current)) {
            Thread.yield();
        }
    }
    
    public void unlock() {
        Thread current = Thread.currentThread();
        if (current != owner.get()) {
            throw new IllegalMonitorStateException();
        }
        
        if (count.get() > 0) {
            count.decrementAndGet();
        } else {
            owner.set(null);
        }
    }
}
```

### Performance Optimization

1. **Lock Stripping**
```java
public class StripedMap<K, V> {
    private static final int STRIPES = 16;
    private final Node<K, V>[] buckets;
    private final ReentrantLock[] locks;
    
    @SuppressWarnings("unchecked")
    public StripedMap(int numBuckets) {
        buckets = (Node<K, V>[]) new Node[numBuckets];
        locks = new ReentrantLock[STRIPES];
        for (int i = 0; i < STRIPES; i++) {
            locks[i] = new ReentrantLock();
        }
    }
    
    private final int hash(Object key) {
        return Math.abs(key.hashCode() % buckets.length);
    }
    
    private ReentrantLock lockFor(int hash) {
        return locks[hash % STRIPES];
    }
    
    public V get(K key) {
        int hash = hash(key);
        ReentrantLock lock = lockFor(hash);
        lock.lock();
        try {
            for (Node<K, V> m = buckets[hash]; m != null; m = m.next) {
                if (m.key.equals(key)) {
                    return m.value;
                }
            }
            return null;
        } finally {
            lock.unlock();
        }
    }
}
```

## Additional Resources 📚

### Official Documentation
- [Java Concurrency in Practice](https://jcip.net/)
- [Oracle Synchronization Tutorial](https://docs.oracle.com/javase/tutorial/essential/concurrency/sync.html)
- [Lock Framework Documentation](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/package-summary.html)

### Tools
- [JVM Thread Dump Analyzer](https://github.com/irockel/tda)
- [Java Mission Control](https://www.oracle.com/java/technologies/jdk-mission-control.html)
- [VisualVM](https://visualvm.github.io/)

## FAQs ❓

### Q: When should I use synchronized vs Lock?
A: Use synchronized for simple scenarios and Lock for more control (timeouts, interruptibility, multiple conditions).

### Q: What's the difference between ReentrantLock and synchronized?
A: ReentrantLock offers more features like timed lock attempts, interruptible locking, and fairness control.

### Q: How do I choose between ReadWriteLock and StampedLock?
A: Use ReadWriteLock for simple read-write scenarios and Stamp
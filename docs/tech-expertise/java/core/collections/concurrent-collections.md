---
sidebar_position: 2
title: "Concurrent Collections"
description: "Concurrent Collections"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔄 Java Concurrent Collections

## Overview 🎯

Java Concurrent Collections provide thread-safe collection implementations designed for concurrent access from multiple threads. These collections are part of the `java.util.concurrent` package and offer better performance than synchronized collections in concurrent scenarios.

### Real-World Analogy
Think of concurrent collections like:
- **ConcurrentHashMap**: A thread-safe bank vault where multiple tellers can access different safety deposit boxes simultaneously
- **CopyOnWriteArrayList**: A company's contact list where changes create a new copy to ensure readers always see a consistent version
- **BlockingQueue**: A restaurant kitchen's order queue where chefs and waiters can safely add and remove orders

## Key Concepts 🔑

### Main Components

1. **Concurrent Maps**
    - ConcurrentHashMap
    - ConcurrentSkipListMap

2. **Copy-On-Write Collections**
    - CopyOnWriteArrayList
    - CopyOnWriteArraySet

3. **Blocking Queues**
    - ArrayBlockingQueue
    - LinkedBlockingQueue
    - PriorityBlockingQueue
    - DelayQueue

4. **Concurrent Sets**
    - ConcurrentSkipListSet
    - CopyOnWriteArraySet

## Implementation Examples 💻

### Basic Concurrent Map Usage

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.concurrent.*;
    import java.util.*;

    public class ConcurrentMapExample {
        private final ConcurrentMap<String, Integer> scores = new ConcurrentHashMap<>();
        
        public void updateScore(String player, int newScore) {
            scores.compute(player, (key, oldValue) -> 
                (oldValue == null) ? newScore : oldValue + newScore
            );
        }
        
        public Integer getScore(String player) {
            return scores.getOrDefault(player, 0);
        }
        
        public void addIfAbsent(String player) {
            scores.putIfAbsent(player, 0);
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

    type ConcurrentMapExample struct {
        scores sync.Map
    }

    func (c *ConcurrentMapExample) updateScore(player string, newScore int) {
        value, _ := c.scores.LoadOrStore(player, 0)
        oldScore := value.(int)
        c.scores.Store(player, oldScore + newScore)
    }

    func (c *ConcurrentMapExample) getScore(player string) int {
        value, exists := c.scores.Load(player)
        if !exists {
            return 0
        }
        return value.(int)
    }

    func (c *ConcurrentMapExample) addIfAbsent(player string) {
        c.scores.LoadOrStore(player, 0)
    }
    ```
  </TabItem>
</Tabs>

### Copy-On-Write Collections Example

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.concurrent.*;

    public class EventListenerRegistry {
        private final CopyOnWriteArrayList<EventListener> listeners = 
            new CopyOnWriteArrayList<>();
        
        public void addListener(EventListener listener) {
            listeners.add(listener);
        }
        
        public void removeListener(EventListener listener) {
            listeners.remove(listener);
        }
        
        public void fireEvent(String event) {
            for (EventListener listener : listeners) {
                listener.onEvent(event);
            }
        }
    }

    interface EventListener {
        void onEvent(String event);
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "sync"
    )

    type EventListener interface {
        OnEvent(event string)
    }

    type EventListenerRegistry struct {
        listeners []EventListener
        mutex    sync.RWMutex
    }

    func (r *EventListenerRegistry) AddListener(listener EventListener) {
        r.mutex.Lock()
        defer r.mutex.Unlock()
        r.listeners = append(r.listeners, listener)
    }

    func (r *EventListenerRegistry) RemoveListener(listener EventListener) {
        r.mutex.Lock()
        defer r.mutex.Unlock()
        for i, l := range r.listeners {
            if l == listener {
                r.listeners = append(r.listeners[:i], r.listeners[i+1:]...)
                break
            }
        }
    }

    func (r *EventListenerRegistry) FireEvent(event string) {
        r.mutex.RLock()
        defer r.mutex.RUnlock()
        for _, listener := range r.listeners {
            listener.OnEvent(event)
        }
    }
    ```
  </TabItem>
</Tabs>

### Blocking Queue Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.concurrent.*;

    public class WorkQueue {
        private final BlockingQueue<Runnable> queue;
        private final Thread[] workers;
        private volatile boolean running = true;
        
        public WorkQueue(int capacity, int workerCount) {
            this.queue = new ArrayBlockingQueue<>(capacity);
            this.workers = new Thread[workerCount];
            
            for (int i = 0; i < workerCount; i++) {
                workers[i] = new Thread(() -> {
                    while (running) {
                        try {
                            Runnable task = queue.poll(1, TimeUnit.SECONDS);
                            if (task != null) {
                                task.run();
                            }
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                });
                workers[i].start();
            }
        }
        
        public void submit(Runnable task) throws InterruptedException {
            queue.put(task);
        }
        
        public void shutdown() {
            running = false;
            for (Thread worker : workers) {
                worker.interrupt();
            }
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    type WorkQueue struct {
        queue    chan func()
        workers  int
        running  bool
        shutdown chan struct{}
    }

    func NewWorkQueue(capacity, workerCount int) *WorkQueue {
        wq := &WorkQueue{
            queue:    make(chan func(), capacity),
            workers:  workerCount,
            running:  true,
            shutdown: make(chan struct{}),
        }

        for i := 0; i < workerCount; i++ {
            go func() {
                for {
                    select {
                    case task := <-wq.queue:
                        if task != nil {
                            task()
                        }
                    case <-wq.shutdown:
                        return
                    }
                }
            }()
        }

        return wq
    }

    func (wq *WorkQueue) Submit(task func()) {
        wq.queue <- task
    }

    func (wq *WorkQueue) Shutdown() {
        close(wq.shutdown)
        close(wq.queue)
    }
    ```
  </TabItem>
</Tabs>

## Best Practices 🌟

### Configuration

1. **Sizing**
```java
// Good: Proper initial capacity
ConcurrentHashMap<String, String> map = 
    new ConcurrentHashMap<>(expectedSize / 0.75f + 1);

// Good: Bounded blocking queue
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(1000);
```

2. **Choosing the Right Collection**
```java
// Good: ConcurrentHashMap for high concurrency
ConcurrentMap<String, String> concurrent = new ConcurrentHashMap<>();

// Good: CopyOnWriteArrayList for read-heavy scenarios
List<String> copyOnWrite = new CopyOnWriteArrayList<>();
```

### Monitoring

1. **Size and Capacity**
```java
public class CollectionMonitor {
    private final ConcurrentMap<String, Object> map;
    
    public MonitoringStats getStats() {
        return new MonitoringStats(
            map.size(),
            map.isEmpty(),
            Runtime.getRuntime().freeMemory()
        );
    }
}
```

2. **Performance Metrics**
```java
public class QueueMonitor {
    private final BlockingQueue<?> queue;
    
    public QueueStats getStats() {
        return new QueueStats(
            queue.size(),
            queue.remainingCapacity(),
            queue.isEmpty(),
            queue.isFull()
        );
    }
}
```

## Common Pitfalls 🚨

1. **Iteration During Modification**
```java
// Wrong: May throw ConcurrentModificationException
Map<String, String> syncMap = Collections.synchronizedMap(new HashMap<>());
for (String key : syncMap.keySet()) {
    if (condition) syncMap.remove(key);
}

// Correct: Use ConcurrentHashMap
ConcurrentMap<String, String> concMap = new ConcurrentHashMap<>();
concMap.forEach((key, value) -> {
    if (condition) concMap.remove(key);
});
```

2. **Blocking Queue Timeouts**
```java
// Wrong: Infinite wait
queue.put(element);

// Correct: Use timeout
boolean added = queue.offer(element, 5, TimeUnit.SECONDS);
if (!added) {
    // Handle timeout
}
```

## Use Cases 🎯

### 1. Cache Implementation
```java
public class ConcurrentCache<K, V> {
    private final ConcurrentMap<K, V> cache = new ConcurrentHashMap<>();
    private final int maxSize;
    
    public ConcurrentCache(int maxSize) {
        this.maxSize = maxSize;
    }
    
    public V get(K key, Supplier<V> loader) {
        return cache.computeIfAbsent(key, k -> {
            if (cache.size() >= maxSize) {
                // Evict oldest entry
                Iterator<Map.Entry<K, V>> it = cache.entrySet().iterator();
                if (it.hasNext()) {
                    it.next();
                    it.remove();
                }
            }
            return loader.get();
        });
    }
}
```

### 2. Event Processing System
```java
public class EventProcessor {
    private final BlockingQueue<Event> eventQueue;
    private final CopyOnWriteArrayList<EventHandler> handlers;
    
    public EventProcessor(int queueCapacity) {
        this.eventQueue = new ArrayBlockingQueue<>(queueCapacity);
        this.handlers = new CopyOnWriteArrayList<>();
    }
    
    public void processEvents() {
        while (true) {
            Event event = eventQueue.take();
            handlers.forEach(handler -> handler.handle(event));
        }
    }
}
```

### 3. Task Scheduler
```java
public class TaskScheduler {
    private final DelayQueue<DelayedTask> tasks = new DelayQueue<>();
    
    public void schedule(Runnable task, long delay, TimeUnit unit) {
        tasks.put(new DelayedTask(task, delay, unit));
    }
    
    public void start() {
        while (true) {
            DelayedTask task = tasks.take();
            task.run();
        }
    }
}
```

## Deep Dive Topics 🔍

### Thread Safety Mechanisms

1. **Lock Striping in ConcurrentHashMap**
```java
ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
// Segments are internally divided for concurrent access
map.put("key1", "value1"); // Different segment than key2
map.put("key2", "value2"); // Can be accessed concurrently
```

2. **Copy-On-Write Mechanism**
```java
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
// Each modification creates a new copy
list.add("item"); // Creates new array
// Readers still see old version until copy is complete
```

### Performance Considerations

1. **Read vs Write Trade-offs**
```java
// High read performance, expensive writes
CopyOnWriteArrayList<String> cowList = new CopyOnWriteArrayList<>();

// Balanced read/write performance
ConcurrentHashMap<String, String> chm = new ConcurrentHashMap<>();
```

2. **Memory Impact**
```java
// Memory-efficient for small lists
List<String> synchronizedList = Collections.synchronizedList(new ArrayList<>());

// Memory overhead for copy-on-write
CopyOnWriteArrayList<String> cowList = new CopyOnWriteArrayList<>();
```

## Additional Resources 📚

### Official Documentation
- [Java Concurrent Collections JavaDoc](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/package-summary.html)
- [Java Concurrency in Practice (book)](https://jcip.net/)

### Tools
- [JMH (Java Microbenchmark Harness)](https://openjdk.java.net/projects/code-tools/jmh/)
- [Java Mission Control](https://www.oracle.com/java/technologies/jdk-mission-control.html)
- [VisualVM](https://visualvm.github.io/)

## FAQs ❓

### Q: When should I use ConcurrentHashMap vs synchronized HashMap?
A: Use ConcurrentHashMap when you need better concurrent performance and don't require synchronization of the entire map for each operation.

### Q: What's the difference between BlockingQueue implementations?
A: ArrayBlockingQueue is bounded with fixed capacity, LinkedBlockingQueue can be unbounded, PriorityBlockingQueue maintains priority order, and DelayQueue handles delayed elements.

### Q: When should I use CopyOnWriteArrayList?
A: Use it when reads greatly outnumber writes and you need thread-safety. Perfect for maintaining listener lists or similar rarely-modified collections.

### Q: How does ConcurrentHashMap handle null values?
A: ConcurrentHashMap doesn't allow null keys or values. Use Optional or a sentinel value instead.

### Q: What's the performance impact of CopyOnWriteArrayList?
A: Writes are expensive (O(n)) as they copy the entire array. Reads are very fast (O(1)) and never blocked.
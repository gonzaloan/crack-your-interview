---
sidebar_position: 3
title: "Memory Leaks"
description: "Memory Leaks"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Java Memory Leaks

## Overview 🎯

Memory leaks in Java occur when objects are no longer used by an application but cannot be garbage collected because they are still being referenced. Despite Java's automatic garbage collection, memory leaks can still happen due to programming mistakes that maintain unnecessary references to objects.

### Real-World Analogy
Think of memory leaks like:
- **Library Books**: Keeping checked-out books without returning them, even though you'll never read them again
- **Storage Unit**: Paying for a storage unit full of items you'll never use but can't get rid of
- **Subscriptions**: Maintaining subscriptions to services you no longer use but forgot to cancel

## Key Concepts 🔑

### Common Types of Memory Leaks

1. **Static Fields**
    - Long-lived references
    - Growing collections
    - Static caches

2. **Unclosed Resources**
    - Database connections
    - File handles
    - Network sockets

3. **Inner Class References**
    - Anonymous classes
    - Non-static inner classes
    - Event listeners

4. **Collection Issues**
    - HashMap with broken equals/hashCode
    - Unbounded caches
    - Forgotten references in custom collections

## Implementation Examples 💻

### Memory Leak Detection and Prevention

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.lang.ref.*;
    import java.util.*;
    import java.util.concurrent.*;

    public class MemoryLeakExamples {
        // BAD: Static collection that grows indefinitely
        private static final List<Object> leakyList = new ArrayList<>();
        
        // GOOD: Bounded collection
        private static final Queue<Object> boundedQueue = 
            new ArrayBlockingQueue<>(1000);
            
        // BAD: Non-static inner class holding reference to outer
        private class LeakyInnerClass {
            public void doSomething() {
                // Implicitly holds reference to outer class
            }
        }
        
        // GOOD: Static inner class
        private static class NonLeakyInnerClass {
            public void doSomething() {
                // No reference to outer class
            }
        }
        
        // BAD: Unbounded cache
        private static final Map<String, Object> leakyCache = 
            new HashMap<>();
            
        // GOOD: Cache with WeakReferences
        private static final Map<String, WeakReference<Object>> 
            properCache = new WeakHashMap<>();
            
        // GOOD: Cache with size limit and eviction
        private static final Map<String, Object> boundedCache = 
            new LinkedHashMap<String, Object>(100, 0.75f, true) {
                @Override
                protected boolean removeEldestEntry(
                    Map.Entry<String, Object> eldest
                ) {
                    return size() > 100;
                }
            };
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "container/list"
        "sync"
    )

    type MemoryLeakExamples struct {
        // BAD: Unbounded slice
        leakySlice []interface{}
        
        // GOOD: Fixed-size channel
        boundedChannel chan interface{}
        
        // BAD: Unbounded map
        leakyMap map[string]interface{}
        
        // GOOD: Cache with eviction
        cache     map[string]interface{}
        evictList *list.List
        mutex     sync.RWMutex
        capacity  int
    }

    func NewMemoryLeakExamples(capacity int) *MemoryLeakExamples {
        return &MemoryLeakExamples{
            boundedChannel: make(chan interface{}, 1000),
            cache:         make(map[string]interface{}),
            evictList:     list.New(),
            capacity:      capacity,
        }
    }

    // GOOD: Cache with eviction
    func (m *MemoryLeakExamples) Add(key string, value interface{}) {
        m.mutex.Lock()
        defer m.mutex.Unlock()

        if m.evictList.Len() >= m.capacity {
            oldest := m.evictList.Front()
            if oldestKey, ok := oldest.Value.(string); ok {
                delete(m.cache, oldestKey)
            }
            m.evictList.Remove(oldest)
        }

        m.cache[key] = value
        m.evictList.PushBack(key)
    }
    ```
  </TabItem>
</Tabs>

### Resource Management

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.io.*;
    import java.sql.*;
    import java.util.concurrent.*;

    public class ResourceManagement {
        // BAD: Resource leak
        public void leakyMethod() throws SQLException {
            Connection conn = getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM users");
            // Resources never closed
        }
        
        // GOOD: try-with-resources
        public void properResourceManagement() throws SQLException {
            try (
                Connection conn = getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SELECT * FROM users")
            ) {
                while (rs.next()) {
                    // Process results
                }
            }
        }
        
        // GOOD: AutoCloseable implementation
        public class ManagedResource implements AutoCloseable {
            private final ExecutorService executor;
            private final Connection connection;
            
            public ManagedResource() throws SQLException {
                this.executor = Executors.newFixedThreadPool(10);
                this.connection = getConnection();
            }
            
            @Override
            public void close() {
                executor.shutdown();
                try {
                    if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
                        executor.shutdownNow();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    executor.shutdownNow();
                }
                try {
                    connection.close();
                } catch (SQLException e) {
                    // Log error
                }
            }
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "context"
        "database/sql"
        "io"
        "time"
    )

    type ResourceManager struct {
        db *sql.DB
    }

    // BAD: Resource leak
    func (rm *ResourceManager) LeakyMethod() error {
        rows, err := rm.db.Query("SELECT * FROM users")
        if err != nil {
            return err
        }
        // rows never closed
        return nil
    }

    // GOOD: Proper resource cleanup
    func (rm *ResourceManager) ProperMethod() error {
        rows, err := rm.db.Query("SELECT * FROM users")
        if err != nil {
            return err
        }
        defer rows.Close()

        for rows.Next() {
            // Process rows
        }
        return rows.Err()
    }

    // GOOD: Resource cleanup with context
    func (rm *ResourceManager) ManagedOperation(
        ctx context.Context,
    ) error {
        ctx, cancel := context.WithTimeout(
            ctx,
            time.Second*10,
        )
        defer cancel()

        rows, err := rm.db.QueryContext(ctx, "SELECT * FROM users")
        if err != nil {
            return err
        }
        defer rows.Close()

        for rows.Next() {
            select {
            case <-ctx.Done():
                return ctx.Err()
            default:
                // Process rows
            }
        }
        return rows.Err()
    }
    ```
  </TabItem>
</Tabs>

## Best Practices 🌟

### Memory Management

1. **Use Weak References for Caches**
```java
public class WeakCache<K, V> {
    private final Map<K, WeakReference<V>> cache = 
        new ConcurrentHashMap<>();
    private final ReferenceQueue<V> refQueue = 
        new ReferenceQueue<>();
        
    public void put(K key, V value) {
        cache.put(key, new WeakReference<>(value, refQueue));
        cleanupQueue();
    }
    
    private void cleanupQueue() {
        Reference<?> ref;
        while ((ref = refQueue.poll()) != null) {
            cache.values().remove(ref);
        }
    }
}
```

2. **Implement Proper Cleanup**
```java
public class CleanupExample implements AutoCloseable {
    private final List<AutoCloseable> resources = 
        new ArrayList<>();
        
    public void addResource(AutoCloseable resource) {
        resources.add(resource);
    }
    
    @Override
    public void close() throws Exception {
        List<Exception> exceptions = new ArrayList<>();
        
        for (AutoCloseable resource : resources) {
            try {
                resource.close();
            } catch (Exception e) {
                exceptions.add(e);
            }
        }
        
        if (!exceptions.isEmpty()) {
            throw new RuntimeException(
                "Multiple resources failed to close", 
                exceptions.get(0)
            );
        }
    }
}
```

## Common Pitfalls 🚨

1. **Event Listener Leaks**
```java
// Wrong: Listener never removed
public class LeakyListener {
    private final EventProducer producer;
    
    public LeakyListener(EventProducer producer) {
        this.producer = producer;
        this.producer.addEventListener(event -> {
            // Handle event
        });
    }
}

// Correct: Removable listener
public class ProperListener implements AutoCloseable {
    private final EventProducer producer;
    private final EventListener listener;
    
    public ProperListener(EventProducer producer) {
        this.producer = producer;
        this.listener = event -> {
            // Handle event
        };
        this.producer.addEventListener(listener);
    }
    
    @Override
    public void close() {
        producer.removeEventListener(listener);
    }
}
```

2. **ThreadLocal Leaks**
```java
// Wrong: ThreadLocal value never removed
public class LeakyThreadLocal {
    private static final ThreadLocal<byte[]> buffer = 
        new ThreadLocal<>() {
            @Override
            protected byte[] initialValue() {
                return new byte[1024];
            }
        };
        
    public void process() {
        byte[] buf = buffer.get();
        // Use buffer but never remove it
    }
}

// Correct: Proper ThreadLocal cleanup
public class ProperThreadLocal {
    private static final ThreadLocal<byte[]> buffer = 
        new ThreadLocal<>() {
            @Override
            protected byte[] initialValue() {
                return new byte[1024];
            }
        };
        
    public void process() {
        try {
            byte[] buf = buffer.get();
            // Use buffer
        } finally {
            buffer.remove();
        }
    }
}
```

## Use Cases 🎯

### 1. Connection Pool Manager
```java
public class ConnectionPoolManager implements AutoCloseable {
    private final List<Connection> connections = 
        new ArrayList<>();
    private final Map<Connection, Long> lastUsed = 
        new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanup = 
        Executors.newSingleThreadScheduledExecutor();
        
    public ConnectionPoolManager() {
        cleanup.scheduleAtFixedRate(
            this::removeIdleConnections,
            1, 1, TimeUnit.MINUTES
        );
    }
    
    private void removeIdleConnections() {
        long now = System.currentTimeMillis();
        lastUsed.entrySet().removeIf(entry -> {
            if (now - entry.getValue() > TimeUnit.MINUTES.toMillis(5)) {
                closeConnection(entry.getKey());
                return true;
            }
            return false;
        });
    }
    
    @Override
    public void close() {
        cleanup.shutdown();
        connections.forEach(this::closeConnection);
    }
    
    private void closeConnection(Connection conn) {
        try {
            conn.close();
        } catch (Exception e) {
            // Log error
        }
    }
}
```

### 2. Image Cache Manager
```java
public class ImageCacheManager {
    private final Map<String, SoftReference<BufferedImage>> 
        imageCache = new ConcurrentHashMap<>();
    private final ReferenceQueue<BufferedImage> refQueue = 
        new ReferenceQueue<>();
    private final Thread cleanupThread;
    
    public ImageCacheManager() {
        cleanupThread = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    Reference<?> ref = refQueue.remove();
                    imageCache.values().remove(ref);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        cleanupThread.setDaemon(true);
        cleanupThread.start();
    }
    
    public void cacheImage(String key, BufferedImage image) {
        imageCache.put(
            key, 
            new SoftReference<>(image, refQueue)
        );
    }
}
```

### 3. Event Handler Registry
```java
public class EventHandlerRegistry {
    private final Map<String, List<WeakReference<EventHandler>>> 
        handlers = new ConcurrentHashMap<>();
    private final ReferenceQueue<EventHandler> refQueue = 
        new ReferenceQueue<>();
        
    public void registerHandler(
        String event, 
        EventHandler handler
    ) {
        cleanupStaleReferences();
        handlers.computeIfAbsent(
            event, 
            k -> new CopyOnWriteArrayList<>()
        ).add(new WeakReference<>(handler, refQueue));
    }
    
    private void cleanupStaleReferences() {
        Reference<?> ref;
        while ((ref = refQueue.poll()) != null) {
            handlers.values().forEach(list -> 
                list.removeIf(weakRef -> weakRef == ref)
            );
        }
    }
}
```

## Deep Dive Topics 🔍

### Memory Leak Profiling

```java
public class MemoryLeakProfiler {
    private static final Map<Class<?>, AtomicInteger> objectCount = 
        new ConcurrentHashMap<>();
        
    public static void trackObject(Object obj) {
        objectCount.computeIfAbsent(
            obj.getClass(), 
            k -> new AtomicInteger()
        ).incrementAndGet();
    }
    
    public static void releaseObject(Object obj) {
        AtomicInteger count = objectCount.get(obj.getClass());
        if (count != null) {
            count.decrementAndGet();
        }
    }
    
    public static void printLeakReport() {
        System.out.println("Memory Leak Report:");
        objectCount.forEach((clazz, count) -> {
            if (count.get() > 0) {
                System.out.printf(
                    "Class: %s, Count: %d%n",
                    clazz.getName(),
                    count.get()
                );
            }
        });
    }
}
```

### Heap Dump Analysis

```java
public class HeapDumpAnalyzer {
    public static void triggerHeapDump(String fileName) {
        try {
            ManagementFactory.getPlatformMBeanServer()
                .invoke(
                    ObjectName.getInstance(
                        "com.sun.management:type=HotSpotDiagnostic"
                    ),
                    "dumpHeap",
                    new Object[]{fileName, true},
                    new String[]{String.class.getName(), boolean.class.getName()}
                );
        } catch (Exception e) {
            throw new RuntimeException("Failed to create heap dump", e);
        }
    }
    
    public static void analyzeHeapUsage() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        
        System.out.printf("""
            Heap Usage Analysis:
            Used: %d MB
            Committed: %d MB
            Max: %d MB
            Usage Ratio: %.2f%%%n""",
            heapUsage.getUsed() / (1024 * 1024),
            heapUsage.getCommitted() / (1024 * 1024),
            heapUsage.getMax() / (1024 * 1024),
            (double) heapUsage.getUsed() / heapUsage.getMax() * 100
        );
    }
}
```

### Thread Memory Leak Detection

```java
public class ThreadLeakDetector {
    private static final Set<Thread> monitoredThreads = 
        ConcurrentHashMap.newKeySet();
    
    public static void startMonitoring(Thread thread) {
        monitoredThreads.add(thread);
    }
    
    public static void stopMonitoring(Thread thread) {
        monitoredThreads.remove(thread);
    }
    
    public static void detectLeaks() {
        monitoredThreads.forEach(thread -> {
            if (thread.getState() == Thread.State.TERMINATED) {
                System.out.printf(
                    "Potential thread leak detected: %s%n",
                    thread.getName()
                );
            }
        });
    }
    
    public static class ThreadLeakMonitor {
        private final ScheduledExecutorService scheduler = 
            Executors.newSingleThreadScheduledExecutor();
            
        public void startMonitoring() {
            scheduler.scheduleAtFixedRate(
                ThreadLeakDetector::detectLeaks,
                0, 1, TimeUnit.MINUTES
            );
        }
    }
}
```

## Additional Resources 📚

### Documentation and Articles
- [Java Memory Management Documentation](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/)
- [Understanding Memory Leaks in Java](https://www.baeldung.com/java-memory-leaks)
- [Java Garbage Collection Handbook](https://plumbr.io/java-garbage-collection-handbook)

### Tools
1. **Memory Analyzers**
    - Eclipse Memory Analyzer (MAT)
    - JProfiler
    - YourKit Java Profiler
    - VisualVM

2. **Heap Dump Analysis Tools**
    - jhat (JDK built-in)
    - Eclipse Memory Analyzer (MAT)
    - IBM HeapAnalyzer

3. **Monitoring Tools**
    - JConsole
    - Java Mission Control
    - Prometheus with JMX Exporter

## FAQs ❓

### Q: How can I identify a memory leak in my application?
A: Look for these signs:
1. Increasing memory usage over time
2. OutOfMemoryError exceptions
3. Degrading performance
4. Growing heap size in monitoring tools
5. Increasing GC frequency

### Q: What are the most common causes of memory leaks in Java?
A: Common causes include:
1. Static collections growing unbounded
2. Unclosed resources (streams, connections)
3. Event listeners not being unregistered
4. Long-lived objects holding references to shorter-lived ones
5. ThreadLocal variables not being removed

### Q: How can I prevent memory leaks in my application?
A: Key practices:
1. Use try-with-resources for AutoCloseable resources
2. Implement proper cleanup in close() methods
3. Use WeakReferences for caches
4. Unregister event listeners
5. Clear ThreadLocal variables when done
6. Use bounded collections
7. Regularly profile your application

### Q: How do I generate and analyze heap dumps?
A: Steps:
1. Generate heap dump:
   ```bash
   jmap -dump:format=b,file=heap.bin <pid>
   ```
2. Use tools like MAT to analyze:
    - Look for biggest objects
    - Check reference chains
    - Analyze dominator tree
    - Look for memory leaks suspects

### Q: What's the difference between soft leaks and hard leaks?
A:
- **Soft leaks**: Objects that are still referenced but not needed. GC can't remove them but they're not technically leaks.
- **Hard leaks**: Objects that are never eligible for GC due to permanent references, causing true memory leaks.


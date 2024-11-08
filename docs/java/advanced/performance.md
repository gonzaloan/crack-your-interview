---
sidebar_position: 3
title: "Java Performance"
description: "Advanced performance optimization techniques in Java"
---

# Java Performance Optimization

## Core Understanding
Java performance optimization involves understanding and improving application efficiency through:
- Memory usage optimization
- CPU utilization
- Thread management
- I/O operations optimization
- Garbage collection tuning
- Code optimization techniques

## Key Concepts

### 1. Memory Management
```java
// Stack vs Heap
class MemoryExample {
    public void stackMemory() {
        int x = 5;                     // Stack
        long y = 10L;                  // Stack
        double z = 3.14;               // Stack
    }
    
    public void heapMemory() {
        Object obj = new Object();     // Heap
        String str = new String("text"); // Heap
        List<Integer> list = new ArrayList<>(); // Heap
    }
}
```

### 2. Garbage Collection
- Types of GC (G1, ZGC, Parallel, etc.)
- GC tuning parameters
```bash
# Common GC parameters
-XX:+UseG1GC                    # Use G1 Garbage Collector
-XX:MaxGCPauseMillis=200       # Target pause time
-XX:InitiatingHeapOccupancyPercent=45  # Start GC
```

### 3. Thread Pools
```java
// Thread pool configuration
ExecutorService executor = new ThreadPoolExecutor(
    10,                 // Core pool size
    20,                // Maximum pool size
    60L,               // Keep alive time
    TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100),  // Work queue
    new ThreadPoolExecutor.CallerRunsPolicy()  // Rejection policy
);
```

### 4. Performance Monitoring Tools
```java
// JMX Monitoring
@MXBean
public interface ApplicationStats {
    int getActiveUsers();
    long getAverageResponseTime();
    int getPendingRequests();
}
```

### Important Classes and Methods

1. **System.nanoTime() vs System.currentTimeMillis()**
```java
// High-precision timing
long start = System.nanoTime();
// ... operation
long duration = System.nanoTime() - start;
```

2. **StringBuilder vs String concatenation**
```java
// String building optimization
StringBuilder builder = new StringBuilder(estimatedSize);
for (String item : items) {
    builder.append(item).append(',');
}
```

3. **Collection Sizing**
```java
// Proper collection initialization
List<String> list = new ArrayList<>(initialCapacity);
Map<String, Integer> map = new HashMap<>(expectedSize, 0.75f);
```

## Examples

### ❌ Bad Example
```java
public class DataProcessor {
    // Bad: Creating new objects in loop
    public String processData(List<String> data) {
        String result = "";
        for (String item : data) {
            result += item.toUpperCase() + ","; // Creates many objects
        }
        return result;
    }
    
    // Bad: Inefficient resource management
    public void processFiles(List<String> paths) {
        for (String path : paths) {
            BufferedReader reader = new BufferedReader(
                new FileReader(path));
            // Process file
            reader.close(); // Manual resource management
        }
    }
    
    // Bad: Unnecessary object creation
    public Boolean isValid(String input) {
        Boolean result = new Boolean(input != null); // Unnecessary boxing
        return result;
    }
}
```

**Why it's bad:**
- Excessive object creation
- Poor resource management
- Inefficient string concatenation
- Memory leaks potential
- Unnecessary boxing/unboxing

### ✅ Good Example
```java
public class OptimizedDataProcessor {
    private static final int BUFFER_SIZE = 8192;
    private final ExecutorService executor;
    
    // Good: Efficient string processing
    public String processData(List<String> data) {
        StringBuilder result = new StringBuilder(data.size() * 20);
        for (String item : data) {
            result.append(item.toUpperCase()).append(',');
        }
        return result.toString();
    }
    
    // Good: Proper resource management
    public void processFiles(List<String> paths) {
        try (var executor = Executors.newFixedThreadPool(Runtime
                .getRuntime().availableProcessors())) {
            paths.forEach(path -> executor.submit(() -> processFile(path)));
        }
    }
    
    private void processFile(String path) {
        try (var reader = new BufferedReader(
                new FileReader(path), BUFFER_SIZE)) {
            reader.lines()
                .parallel()
                .forEach(this::processLine);
        }
    }
    
    // Good: Avoiding unnecessary object creation
    public boolean isValid(String input) {
        return input != null; // Direct boolean return
    }
    
    // Good: Bulk operations
    public List<String> processItems(List<String> items) {
        return items.parallelStream()
            .filter(Objects::nonNull)
            .map(String::toUpperCase)
            .collect(Collectors.toList());
    }
}
```

**Why it's good:**
- Efficient resource usage
- Proper buffer sizing
- Parallel processing where appropriate
- Try-with-resources for cleanup
- Minimized object creation

## Best Practices

1. **Use Appropriate Data Structures**
```java
// Choose the right collection
Set<String> uniqueItems = new HashSet<>();     // O(1) lookup
List<String> orderedItems = new ArrayList<>();  // O(1) append
Map<String, Integer> cache = new LinkedHashMap<>(100, 0.75f, true) {
    protected boolean removeEldestEntry(Map.Entry eldest) {
        return size() > 100;
    }
};
```

2. **Optimize I/O Operations**
```java
// Buffered I/O and NIO
public void copyFile(String source, String dest) {
    try (var sourceChannel = FileChannel.open(Path.of(source));
         var destChannel = FileChannel.open(Path.of(dest),
             StandardOpenOption.CREATE,
             StandardOpenOption.WRITE)) {
        sourceChannel.transferTo(0, sourceChannel.size(), destChannel);
    }
}
```

3. **Use Batch Processing**
```java
public void batchInsert(List<Entity> entities) {
    final int batchSize = 1000;
    for (int i = 0; i < entities.size(); i += batchSize) {
        List<Entity> batch = entities.subList(
            i, Math.min(i + batchSize, entities.size()));
        repository.saveAll(batch);
    }
}
```

## Use Cases

1. **High-Throughput Data Processing**
```java
public class StreamProcessor {
    public List<Result> processLargeDataset(List<Data> dataset) {
        return dataset.parallelStream()
            .filter(this::isValid)
            .map(this::transform)
            .collect(Collectors.toList());
    }
}
```

2. **Cache Implementation**
```java
public class PerformanceCache<K, V> {
    private final Map<K, V> cache;
    private final Function<K, V> computeFunction;
    
    public V get(K key) {
        return cache.computeIfAbsent(key, computeFunction);
    }
}
```

3. **Async Processing**
```java
public class AsyncProcessor {
    private final CompletableFuture<Void> processAsync(List<Task> tasks) {
        return CompletableFuture.allOf(
            tasks.stream()
                .map(this::processTask)
                .toArray(CompletableFuture[]::new)
        );
    }
}
```

## Anti-patterns to Avoid

1. **Premature Optimization**
```java
// Don't optimize without measuring
public void process(List<String> items) {
    // First make it work correctly
    // Then profile and optimize if needed
}
```

2. **Memory Leaks**
```java
// Avoid holding references unnecessarily
public class Cache {
    private static final Map<String, byte[]> cache = new HashMap<>();
    // Need to implement cleanup mechanism
}
```

3. **Thread Pool Misuse**
```java
// Don't create thread pools for every operation
ExecutorService executor = Executors.newFixedThreadPool(10);
// Must be shared and properly managed
```

## Interview Questions

### Q1: "How would you optimize a memory-intensive application?"
**A**:
```java
public class MemoryOptimization {
    // Use primitive arrays instead of collections where possible
    private final int[] data = new int[1000];
    
    // Implement custom object pooling
    public class ObjectPool<T> {
        private final Queue<T> pool;
        private final Supplier<T> factory;
        
        public T borrow() {
            T item = pool.poll();
            return item != null ? item : factory.get();
        }
        
        public void returnToPool(T item) {
            pool.offer(item);
        }
    }
    
    // Use weak references for caches
    private final Map<String, WeakReference<ExpensiveObject>> cache = 
        new WeakHashMap<>();
}
```

### Q2: "How do you handle high-concurrency scenarios?"
**A**:
```java
public class ConcurrencyHandler {
    private final StampedLock lock = new StampedLock();
    
    public Value read() {
        long stamp = lock.tryOptimisticRead();
        Value value = current.get();
        
        if (!lock.validate(stamp)) {
            stamp = lock.readLock();
            try {
                value = current.get();
            } finally {
                lock.unlockRead(stamp);
            }
        }
        return value;
    }
    
    public void write(Value value) {
        long stamp = lock.writeLock();
        try {
            current.set(value);
        } finally {
            lock.unlockWrite(stamp);
        }
    }
}
```

### Q3: "How would you implement a performant cache?"
**A**:
```java
public class PerformantCache<K, V> {
    private final int maxSize;
    private final Map<K, V> cache;
    private final Queue<K> accessOrder;
    
    public V get(K key, Supplier<V> loader) {
        return cache.computeIfAbsent(key, k -> {
            if (cache.size() >= maxSize) {
                K oldest = accessOrder.poll();
                cache.remove(oldest);
            }
            V value = loader.get();
            accessOrder.offer(key);
            return value;
        });
    }
    
    public void evict(K key) {
        cache.remove(key);
        accessOrder.remove(key);
    }
}
```
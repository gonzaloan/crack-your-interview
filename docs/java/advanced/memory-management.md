---
sidebar_position: 4
title: "Java Memory Management"
description: "Understanding and optimizing Java memory management"
---

# Java Memory Management

## Core Understanding
Java Memory Management involves understanding how the JVM manages memory, including:
- Memory allocation and deallocation
- Garbage collection processes
- Memory regions (heap, stack, metaspace)
- Memory leaks prevention
- Memory optimization techniques

## Key Concepts

### 1. Memory Regions
```java
public class MemoryRegions {
    // Stack - primitive local variables and references
    public void stackExample() {
        int x = 10;                // Stack
        long y = 20L;              // Stack
        String ref;                // Stack (reference)
    }
    
    // Heap - objects and arrays
    Object obj = new Object();     // Heap
    int[] array = new int[1000];   // Heap
    
    // Metaspace - class metadata
    static class InnerClass {}     // Class metadata in Metaspace
}
```

### 2. Garbage Collection Types
1. **Serial GC**
   ```bash
   -XX:+UseSerialGC              # Single thread GC
   ```

2. **Parallel GC**
   ```bash
   -XX:+UseParallelGC           # Multiple threads GC
   -XX:ParallelGCThreads=4      # Number of threads
   ```

3. **G1 GC (Garbage First)**
   ```bash
   -XX:+UseG1GC                 # G1 collector
   -XX:MaxGCPauseMillis=200     # Target pause time
   ```

4. **ZGC**
   ```bash
   -XX:+UseZGC                  # ZGC for low latency
   ```

### 3. Memory Profiling Tools
```java
// JMX Memory Monitoring
@MXBean
public interface MemoryStatistics {
    long getHeapMemoryUsage();
    long getObjectsPendingFinalization();
    List<GarbageCollectorInfo> getGcInfo();
}
```

### Important Methods and Classes

1. **Reference Types**
```java
// Different reference types for memory management
public class ReferenceDemo {
    // Strong reference
    Object strong = new Object();
    
    // Weak reference
    WeakReference<Cache> weak = new WeakReference<>(new Cache());
    
    // Soft reference
    SoftReference<Image> soft = new SoftReference<>(image);
    
    // Phantom reference
    ReferenceQueue<Object> queue = new ReferenceQueue<>();
    PhantomReference<Object> phantom = 
        new PhantomReference<>(obj, queue);
}
```

2. **DirectByteBuffer**
```java
// Direct memory access
public class DirectMemoryAccess {
    public ByteBuffer allocateDirect(int capacity) {
        return ByteBuffer.allocateDirect(capacity);
    }
}
```

3. **System.gc() and finalize()**
```java
// Note: Not recommended for production use
public class MemoryManagement {
    @Override
    protected void finalize() {
        // Cleanup resources
    }
}
```

## Examples

### ❌ Bad Example
```java
public class MemoryLeakExample {
    // Bad: Static collection that grows indefinitely
    private static final List<Object> leakingList = new ArrayList<>();
    
    // Bad: Unclosed resources
    public void processFile(String path) {
        FileInputStream fis = new FileInputStream(path);
        // Process file without closing
    }
    
    // Bad: Inner class memory leak
    public class InnerClassLeak {
        private byte[] largeArray = new byte[10000];
    }
    
    // Bad: Thread that prevents garbage collection
    Thread leakingThread = new Thread(() -> {
        while(true) {
            // Never ending thread holding references
        }
    });
}
```

**Why it's bad:**
- Memory leaks through static collections
- Unclosed resources
- Reference holding preventing GC
- Unnecessary object retention
- Poor resource management

### ✅ Good Example
```java
public class MemoryEfficientExample {
    // Good: Using weak references for cache
    private final Map<String, WeakReference<Resource>> cache = 
        new WeakHashMap<>();
        
    // Good: Proper resource management
    public void processFile(String path) {
        try (var fis = new FileInputStream(path)) {
            // Process file with automatic resource management
        }
    }
    
    // Good: Memory-efficient collection usage
    public class LRUCache<K, V> extends LinkedHashMap<K, V> {
        private final int maxEntries;
        
        public LRUCache(int maxEntries) {
            super(maxEntries + 1, 0.75f, true);
            this.maxEntries = maxEntries;
        }
        
        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > maxEntries;
        }
    }
    
    // Good: Proper cleanup implementation
    public class CleanupAware implements AutoCloseable {
        private final ByteBuffer buffer;
        
        public CleanupAware() {
            buffer = ByteBuffer.allocateDirect(1024);
        }
        
        @Override
        public void close() {
            // Explicit cleanup of DirectByteBuffer
            if (buffer instanceof DirectBuffer) {
                ((DirectBuffer) buffer).cleaner().clean();
            }
        }
    }
}
```

**Why it's good:**
- Proper resource management
- Memory-efficient collections
- Automatic cleanup
- Weak references for caches
- Clear lifecycle management

## Best Practices

1. **Use AutoCloseable Resources**
```java
public class ResourceManagement {
    public void processResources() {
        try (var connection = getConnection();
             var statement = connection.prepareStatement(sql)) {
            // Process with automatic resource cleanup
        }
    }
}
```

2. **Implement Object Pools**
```java
public class ObjectPool<T> {
    private final Queue<T> pool;
    private final Supplier<T> factory;
    
    public T acquire() {
        T obj = pool.poll();
        return obj != null ? obj : factory.get();
    }
    
    public void release(T obj) {
        pool.offer(obj);
    }
}
```

3. **Use Proper Reference Types**
```java
public class CacheImplementation {
    // Use WeakHashMap for caches
    private final Map<Key, WeakReference<Value>> cache = 
        new WeakHashMap<>();
        
    // Use SoftReference for memory-sensitive resources
    private final Map<String, SoftReference<Image>> imageCache = 
        new ConcurrentHashMap<>();
}
```

## Use Cases

1. **Cache Implementation**
```java
public class MemoryAwareCache<K, V> {
    private final Map<K, SoftReference<V>> cache = new ConcurrentHashMap<>();
    
    public V get(K key, Supplier<V> loader) {
        return Optional.ofNullable(cache.get(key))
            .map(SoftReference::get)
            .orElseGet(() -> {
                V value = loader.get();
                cache.put(key, new SoftReference<>(value));
                return value;
            });
    }
}
```

2. **Resource Pool Management**
```java
public class ConnectionPool {
    private final BlockingQueue<Connection> pool;
    
    public Connection borrowConnection(Duration timeout) 
            throws InterruptedException {
        return pool.poll(timeout.toMillis(), TimeUnit.MILLISECONDS);
    }
    
    public void returnConnection(Connection conn) {
        pool.offer(conn);
    }
}
```

3. **Large Data Processing**
```java
public class StreamProcessor {
    public void processLargeFile(Path path) {
        try (var stream = Files.lines(path)) {
            stream.forEach(this::processLine);
        }
    }
}
```

## Anti-patterns to Avoid

1. **Memory Leaks in Collections**
```java
// Bad: Memory leak in listener pattern
public class EventManager {
    // Leaked listeners
    private final List<EventListener> listeners = new ArrayList<>();
    
    // Good: Use weak references
    private final List<WeakReference<EventListener>> listeners = 
        new ArrayList<>();
}
```

2. **Unnecessary Object Creation**
```java
// Bad: Creating objects in loop
String result = "";
for (String item : items) {
    result += item;
}

// Good: Use StringBuilder
StringBuilder builder = new StringBuilder();
for (String item : items) {
    builder.append(item);
}
```

3. **Resource Leaks**
```java
// Bad: Resource leak
InputStream is = new FileInputStream(file);
processStream(is);
// Stream never closed

// Good: Use try-with-resources
try (InputStream is = new FileInputStream(file)) {
    processStream(is);
}
```

## Interview Questions

### Q1: "Explain the different types of references in Java"
**A**:
```java
public class ReferenceTypesExample {
    // Strong Reference
    Object strong = new Object(); // Not eligible for GC while reachable
    
    // Weak Reference
    WeakReference<Object> weak = new WeakReference<>(object);
    // Eligible for GC when only weakly reachable
    
    // Soft Reference
    SoftReference<Object> soft = new SoftReference<>(object);
    // Eligible for GC when memory is tight
    
    // Phantom Reference
    ReferenceQueue<Object> queue = new ReferenceQueue<>();
    PhantomReference<Object> phantom = 
        new PhantomReference<>(object, queue);
    // Used for cleanup actions
}
```

### Q2: "How would you detect and fix memory leaks?"
**A**:
```java
public class MemoryLeakDetection {
    // Use heap dumps
    public void analyzeHeapDump() {
        ManagementFactory.getMemoryMXBean()
            .dumpHeap("heap-dump.hprof", true);
    }
    
    // Monitor memory usage
    public void monitorMemory() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        long used = heapUsage.getUsed();
        long max = heapUsage.getMax();
        
        if ((double) used / max > 0.9) {
            // Alert high memory usage
        }
    }
}
```

### Q3: "Explain the impact of GC on application performance"
**A**:
```java
public class GCTuning {
    // GC logging configuration
    public static void main(String[] args) {
        // -XX:+UseG1GC
        // -XX:MaxGCPauseMillis=200
        // -Xlog:gc*:file=gc.log
        
        // Monitor GC events
        for (GarbageCollectorMXBean gc : 
                ManagementFactory.getGarbageCollectorMXBeans()) {
            System.out.println("GC: " + gc.getName());
            System.out.println("Collections: " + gc.getCollectionCount());
            System.out.println("Time spent: " + gc.getCollectionTime() + "ms");
        }
    }
}
```
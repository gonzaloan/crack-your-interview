---
sidebar_position: 2
title: "Garbage Collector"
description: "Garbage Collector"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ♻️ Java Garbage Collector

## Overview 🎯

Java's Garbage Collector (GC) is an automatic memory management system that identifies and removes objects that are no longer being used by the application. It helps prevent memory leaks and ensures efficient memory utilization.

### Real-World Analogy
Think of Garbage Collection like:
- **City Waste Management**: Just as a city collects and disposes of unused items
- **Library Book Returns**: Returning books that are no longer being read
- **Restaurant Table Clearing**: Cleaning tables after customers leave
- **Mail Room**: Sorting and removing outdated/unused mail

## Key Concepts 🔑

### Core Components

1. **Memory Spaces**
    - Young Generation (Eden + Survivor Spaces)
    - Old Generation
    - Metaspace (Permanent Generation in older versions)

2. **Collection Types**
    - Minor Collection (Young Generation)
    - Major Collection (Old Generation)
    - Full GC (Entire Heap)

3. **Garbage Collectors**
    - Serial GC
    - Parallel GC
    - CMS (Concurrent Mark Sweep)
    - G1 (Garbage First)
    - ZGC (Z Garbage Collector)

4. **Memory Management Concepts**
    - Mark and Sweep
    - Copying Collection
    - Generational Collection
    - Reference Counting

## Implementation Examples 💻

### Memory Management Best Practices

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.lang.ref.*;
    import java.util.*;

    public class MemoryManagementExample {
        // Using soft references for cache
        private Map<String, SoftReference<byte[]>> cache = 
            new HashMap<>();
            
        public void cacheData(String key, byte[] data) {
            cache.put(key, new SoftReference<>(data));
        }
        
        public byte[] getData(String key) {
            SoftReference<byte[]> ref = cache.get(key);
            if (ref != null) {
                byte[] data = ref.get();
                if (data != null) {
                    return data;
                } else {
                    cache.remove(key);
                }
            }
            return null;
        }
        
        // Proper resource cleanup
        public class ResourceHandler implements AutoCloseable {
            private final List<byte[]> resources = new ArrayList<>();
            
            public void allocateResource(int size) {
                resources.add(new byte[size]);
            }
            
            @Override
            public void close() {
                resources.clear();
            }
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "runtime"
        "sync"
    )

    type MemoryManagementExample struct {
        cache sync.Map
    }

    func (m *MemoryManagementExample) CacheData(key string, data []byte) {
        m.cache.Store(key, data)
    }

    func (m *MemoryManagementExample) GetData(key string) []byte {
        value, ok := m.cache.Load(key)
        if !ok {
            return nil
        }
        return value.([]byte)
    }

    func (m *MemoryManagementExample) CleanCache() {
        m.cache.Range(func(key, value interface{}) bool {
            m.cache.Delete(key)
            return true
        })
        runtime.GC() // Force garbage collection
    }
    ```
  </TabItem>
</Tabs>

### Memory Leak Prevention

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.concurrent.*;
    import java.util.*;

    public class MemoryLeakPrevention {
        // Using WeakHashMap for cache
        private final Map<String, byte[]> cache = 
            new WeakHashMap<>();
            
        // Bounded cache with eviction
        private final Map<String, byte[]> boundedCache = 
            new LinkedHashMap<String, byte[]>(100, 0.75f, true) {
                @Override
                protected boolean removeEldestEntry(
                    Map.Entry<String, byte[]> eldest
                ) {
                    return size() > 100;
                }
            };
            
        // ThreadLocal cleanup
        private static final ThreadLocal<byte[]> buffer = 
            new ThreadLocal<byte[]>() {
                @Override
                protected void finalize() {
                    remove();
                }
            };
            
        public void processWithBuffer() {
            try {
                buffer.set(new byte[1024]);
                // Process data
            } finally {
                buffer.remove();
            }
        }
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

    type MemoryLeakPrevention struct {
        cache     sync.Map
        maxItems  int
        itemList  *list.List
        itemsLock sync.Mutex
    }

    func NewMemoryLeakPrevention(maxItems int) *MemoryLeakPrevention {
        return &MemoryLeakPrevention{
            maxItems: maxItems,
            itemList: list.New(),
        }
    }

    func (m *MemoryLeakPrevention) Add(key string, value []byte) {
        m.itemsLock.Lock()
        defer m.itemsLock.Unlock()

        if m.itemList.Len() >= m.maxItems {
            eldest := m.itemList.Front()
            if eldestKey, ok := eldest.Value.(string); ok {
                m.cache.Delete(eldestKey)
            }
            m.itemList.Remove(eldest)
        }

        m.cache.Store(key, value)
        m.itemList.PushBack(key)
    }

    func (m *MemoryLeakPrevention) Get(key string) []byte {
        value, ok := m.cache.Load(key)
        if !ok {
            return nil
        }
        return value.([]byte)
    }
    ```
  </TabItem>
</Tabs>

## Best Practices 🌟

### GC Configuration

1. **Heap Size Settings**
```bash
# Minimum heap size
-Xms2g

# Maximum heap size
-Xmx2g

# Young generation size
-Xmn512m

# Old generation size (by difference)
```

2. **GC Type Selection**
```bash
# G1GC (recommended for most applications)
-XX:+UseG1GC

# For low latency applications
-XX:+UseZGC

# For small heaps
-XX:+UseSerialGC
```

### Monitoring

1. **GC Logging**
```bash
# Enable GC logging
-Xlog:gc*:file=gc.log:time,uptime:filecount=5,filesize=100m

# Detailed GC logging
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
```

2. **Memory Monitoring**
```java
public class MemoryMonitor {
    public static void printMemoryStats() {
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long maxMemory = runtime.maxMemory();
        
        System.out.printf(
            "Memory - Total: %d MB, Free: %d MB, Max: %d MB%n",
            totalMemory / 1024 / 1024,
            freeMemory / 1024 / 1024,
            maxMemory / 1024 / 1024
        );
    }
}
```

## Common Pitfalls 🚨

1. **Memory Leaks**
```java
// Wrong: Unclosed resources
public class ResourceLeak {
    private List<byte[]> leakyList = new ArrayList<>();
    
    public void addData() {
        // Memory leak: continuously growing list
        leakyList.add(new byte[1024 * 1024]);
    }
}

// Correct: Proper resource management
public class ResourceManagement {
    private final int maxSize;
    private Queue<byte[]> boundedQueue;
    
    public ResourceManagement(int maxSize) {
        this.maxSize = maxSize;
        this.boundedQueue = new ArrayBlockingQueue<>(maxSize);
    }
    
    public void addData(byte[] data) {
        if (boundedQueue.size() >= maxSize) {
            boundedQueue.poll(); // Remove oldest
        }
        boundedQueue.offer(data);
    }
}
```

2. **Static References**
```java
// Wrong: Static cache without size limit
public class StaticCache {
    private static final Map<String, Object> cache = 
        new HashMap<>();
        
    public static void addToCache(String key, Object value) {
        cache.put(key, value); // Never gets cleared
    }
}

// Correct: Using weak references
public class WeakCache {
    private static final Map<String, WeakReference<Object>> cache = 
        new WeakHashMap<>();
        
    public static void addToCache(String key, Object value) {
        cache.put(key, new WeakReference<>(value));
    }
}
```

## Use Cases 🎯

### 1. Large Object Cache
```java
public class LargeObjectCache {
    private final Map<String, SoftReference<byte[]>> cache;
    private final ReferenceQueue<byte[]> refQueue;
    
    public LargeObjectCache() {
        this.cache = new ConcurrentHashMap<>();
        this.refQueue = new ReferenceQueue<>();
        startCleanupThread();
    }
    
    private void startCleanupThread() {
        Thread cleanupThread = new Thread(() -> {
            while (true) {
                try {
                    Reference<?> ref = refQueue.remove();
                    cache.values().remove(ref);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        cleanupThread.setDaemon(true);
        cleanupThread.start();
    }
}
```

### 2. Memory-Sensitive Image Processing
```java
public class ImageProcessor {
    private final int maxBufferSize;
    private final Queue<BufferedImage> imageQueue;
    
    public ImageProcessor(int maxBufferSize) {
        this.maxBufferSize = maxBufferSize;
        this.imageQueue = new ArrayBlockingQueue<>(maxBufferSize);
    }
    
    public void processImage(BufferedImage image) {
        try {
            // Process in chunks to avoid OOM
            int chunks = calculateChunks(image);
            for (int i = 0; i < chunks; i++) {
                BufferedImage chunk = extractChunk(image, i);
                processChunk(chunk);
                chunk.flush(); // Release memory
            }
        } finally {
            image.flush();
        }
    }
}
```

### 3. Database Connection Pool
```java
public class ConnectionPool {
    private final Queue<Connection> pool;
    private final int maxConnections;
    
    public ConnectionPool(int maxConnections) {
        this.maxConnections = maxConnections;
        this.pool = new ConcurrentLinkedQueue<>();
    }
    
    public Connection getConnection() {
        Connection conn = pool.poll();
        if (conn == null && pool.size() < maxConnections) {
            conn = createConnection();
        }
        return conn;
    }
    
    public void releaseConnection(Connection conn) {
        if (pool.size() < maxConnections) {
            pool.offer(conn);
        } else {
            closeConnection(conn);
        }
    }
}
```

## Deep Dive Topics 🔍

### GC Algorithms

1. **G1GC Internal Working**
```java
/**
 * G1GC divides heap into regions
 * 
 * 1. Initial Mark (STW)
 * 2. Root Region Scan
 * 3. Concurrent Mark
 * 4. Remark (STW)
 * 5. Cleanup (STW + Concurrent)
 * 6. Copying (STW)
 */
public class G1GCExample {
    // Configure G1GC
    // -XX:+UseG1GC
    // -XX:G1HeapRegionSize=n
    // -XX:MaxGCPauseMillis=200
    // -XX:G1NewSizePercent=n
    // -XX:G1MaxNewSizePercent=n
}
```

### Memory Analysis

```java
public class MemoryAnalyzer {
    public static void analyzeHeap() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        
        System.out.printf(
            "Heap Memory Usage:%n" +
            "Initial: %d%n" +
            "Used: %d%n" +
            "Committed: %d%n" +
            "Max: %d%n",
            heapUsage.getInit(),
            heapUsage.getUsed(),
            heapUsage.getCommitted(),
            heapUsage.getMax()
        );
    }
}
```

## Additional Resources 📚

### Documentation
- [JVM Garbage Collection Documentation](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/)
- [G1GC Tuning Guide](https://www.oracle.com/technical-resources/articles/java/g1gc.html)
- [GC Tuning Guide](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/index.html)

### Tools
- [JVisualVM](https://visualvm.github.io/)
- [Eclipse Memory Analyzer (MAT)](https://www.eclipse.org/mat/)
- [JProfiler](https://www.ej-technologies.com/products/jprofiler/overview.html)

## FAQs ❓

### Q: How do I choose the right garbage collector?
A: Consider your application's requirements:
- G1GC: General purpose, balanced performance
- ZGC: Low latency requirements
- Serial: Small applications, limited resources
- Parallel: Batch processing, high throughput

### Q: What are the signs of memory leaks?
A: Look for:
- Increasing memory usage over time
- OutOfMemoryError exceptions
- Slower application performance
- Increasing GC frequency and duration

### Q: How do I tune GC for optimal performance?
A: Key steps:
1. Monitor GC behavior
2. Set appropriate heap sizes
3. Choose the right collector
4. Adjust generation sizes
5. Set appropriate GC pause targets

### Q: When should I trigger System.gc()?
A: Generally, you shouldn't. Let the JVM manage GC. If needed, use `System.gc()` only for testing/benchmarking.

### Q: How can I prevent memory leaks?
A: Best practices:
1. Use proper resource cleanup (try-with-resources)
2. Avoid static collections
3. Use WeakReferences for caches
4. Implement proper close/cleanup methods
5. Regular memory profiling
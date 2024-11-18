---
sidebar_position: 1
title: "Heap Stack"
description: "Heap Stack"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🧠 Java Memory: Heap & Stack

## Overview 🎯

Java's memory structure is divided into two main regions: Heap and Stack. This architecture is fundamental to how Java manages memory and executes programs. Each region serves different purposes and has distinct characteristics.

### Real-World Analogy
Think of Java memory like an office space:
- **Stack**: Like your desk where you keep current work items (local variables, method calls)
- **Heap**: Like a shared storage room where everyone keeps larger items (objects)
- **Stack Frames**: Like organized trays on your desk for different tasks
- **References**: Like sticky notes on your desk pointing to items in storage

## Key Concepts 🔑

### Memory Structure

1. **Stack Memory**
    - Thread-specific memory
    - LIFO (Last In, First Out) structure
    - Stores method frames
    - Contains primitive values
    - Contains object references

2. **Heap Memory**
    - Shared across threads
    - Stores objects
    - String pool
    - Class metadata
    - Dynamic size

3. **Memory Regions**
    - Young Generation (Eden, Survivor spaces)
    - Old Generation
    - Metaspace (Class metadata)

## Implementation Examples 💻

### Memory Usage Patterns

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    public class MemoryExample {
        // Stack: primitiveVar
        // Heap: none
        private int primitiveVar;

        // Stack: objectRef
        // Heap: new StringBuilder object
        private StringBuilder objectRef = new StringBuilder();
        
        public void demonstrateMemory() {
            // Stack: localPrimitive
            int localPrimitive = 42;
            
            // Stack: localObject reference
            // Heap: new String object
            String localObject = new String("Hello");
            
            // Stack: array reference
            // Heap: array object and all Integer objects
            Integer[] numbers = new Integer[3];
            for (int i = 0; i < 3; i++) {
                numbers[i] = Integer.valueOf(i);
            }
        }
        
        public void recursiveMethod(int count) {
            // Each call creates a new stack frame
            if (count > 0) {
                recursiveMethod(count - 1);
            }
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    type MemoryExample struct {
        // Stack: primitiveVar
        primitiveVar int
        
        // Heap: objectRef points to heap-allocated string builder
        objectRef strings.Builder
    }

    func (m *MemoryExample) DemonstrateMemory() {
        // Stack: localPrimitive
        localPrimitive := 42
        
        // Stack: localObject pointer
        // Heap: string data
        localObject := "Hello"
        
        // Stack: numbers pointer
        // Heap: array and integers
        numbers := make([]int, 3)
        for i := 0; i < 3; i++ {
            numbers[i] = i
        }
    }

    func (m *MemoryExample) RecursiveMethod(count int) {
        // Each call creates a new stack frame
        if count > 0 {
            m.RecursiveMethod(count - 1)
        }
    }
    ```
  </TabItem>
</Tabs>

### Memory-Efficient Data Structures

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.nio.ByteBuffer;
    import java.util.*;

    public class MemoryEfficientStructures {
        // Direct ByteBuffer for large data
        private final ByteBuffer directBuffer;
        
        // Object pooling for reuse
        private final Queue<byte[]> bufferPool;
        
        public MemoryEfficientStructures() {
            // Allocated in native memory
            directBuffer = ByteBuffer.allocateDirect(1024);
            
            // Object pool initialization
            bufferPool = new ArrayDeque<>();
            for (int i = 0; i < 10; i++) {
                bufferPool.offer(new byte[1024]);
            }
        }
        
        public byte[] borrowBuffer() {
            byte[] buffer = bufferPool.poll();
            if (buffer == null) {
                buffer = new byte[1024];
            }
            return buffer;
        }
        
        public void returnBuffer(byte[] buffer) {
            Arrays.fill(buffer, (byte) 0); // Clear data
            bufferPool.offer(buffer);
        }
        
        // Using primitive arrays instead of object arrays
        public static class CompactUser {
            private final int[] data; // [id, age, score]
            private final String name;
            
            public CompactUser(int id, String name, int age, int score) {
                this.data = new int[]{id, age, score};
                this.name = name;
            }
            
            public int getId() { return data[0]; }
            public int getAge() { return data[1]; }
            public int getScore() { return data[2]; }
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

    type MemoryEfficientStructures struct {
        // Buffer pool
        bufferPool sync.Pool
    }

    func NewMemoryEfficientStructures() *MemoryEfficientStructures {
        return &MemoryEfficientStructures{
            bufferPool: sync.Pool{
                New: func() interface{} {
                    return make([]byte, 1024)
                },
            },
        }
    }

    func (m *MemoryEfficientStructures) BorrowBuffer() []byte {
        return m.bufferPool.Get().([]byte)
    }

    func (m *MemoryEfficientStructures) ReturnBuffer(buffer []byte) {
        // Clear buffer
        for i := range buffer {
            buffer[i] = 0
        }
        m.bufferPool.Put(buffer)
    }

    // Compact data structure
    type CompactUser struct {
        data [3]int  // [id, age, score]
        name string
    }

    func NewCompactUser(id int, name string, age int, score int) *CompactUser {
        return &CompactUser{
            data: [3]int{id, age, score},
            name: name,
        }
    }

    func (u *CompactUser) GetId() int    { return u.data[0] }
    func (u *CompactUser) GetAge() int   { return u.data[1] }
    func (u *CompactUser) GetScore() int { return u.data[2] }
    ```
  </TabItem>
</Tabs>

## Best Practices 🌟

### Memory Management

1. **Stack Usage**
```java
// Good: Local variables scope
public void processData() {
    int temp = 0;
    {
        int localScope = calculateValue();
        temp = processValue(localScope);
    } // localScope released here
    useResult(temp);
}

// Bad: Large objects in recursion
public void recursiveMethod() {
    byte[] largeArray = new byte[1000000]; // Stack pressure
    recursiveMethod();
}
```

2. **Heap Management**
```java
// Good: Object reuse
public class ObjectPool<T> {
    private final Queue<T> pool;
    private final Supplier<T> factory;
    
    public T borrow() {
        T obj = pool.poll();
        return obj != null ? obj : factory.get();
    }
    
    public void giveBack(T obj) {
        pool.offer(obj);
    }
}

// Bad: Constant object creation
public String processString(String input) {
    String result = "";
    for (char c : input.toCharArray()) {
        result += c; // Creates new String each time
    }
    return result;
}
```

### Monitoring

1. **Memory Usage Tracking**
```java
public class MemoryMonitor {
    public static void printMemoryStats() {
        Runtime runtime = Runtime.getRuntime();
        
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long maxMemory = runtime.maxMemory();
        
        System.out.printf("""
            Memory Usage:
            Total: %d MB
            Free: %d MB
            Used: %d MB
            Max: %d MB%n""",
            totalMemory / 1024 / 1024,
            freeMemory / 1024 / 1024,
            (totalMemory - freeMemory) / 1024 / 1024,
            maxMemory / 1024 / 1024
        );
    }
}
```

## Common Pitfalls 🚨

1. **Stack Overflow**
```java
// Wrong: Unbounded recursion
public void infiniteRecursion() {
    infiniteRecursion(); // StackOverflowError
}

// Correct: Bounded recursion
public void boundedRecursion(int depth) {
    if (depth <= 0) return;
    boundedRecursion(depth - 1);
}
```

2. **Memory Leaks**
```java
// Wrong: Growing collection
public class LeakyClass {
    private static final List<Object> leakyList = new ArrayList<>();
    
    public void add(Object obj) {
        leakyList.add(obj); // Never cleared
    }
}

// Correct: Bounded collection
public class BoundedClass {
    private final int maxSize;
    private final Queue<Object> boundedQueue;
    
    public void add(Object obj) {
        if (boundedQueue.size() >= maxSize) {
            boundedQueue.poll();
        }
        boundedQueue.offer(obj);
    }
}
```

## Use Cases 🎯

### 1. High-Performance Cache
```java
public class MemoryEfficientCache<K, V> {
    private final int maxSize;
    private final Map<K, SoftReference<V>> cache;
    private final ReferenceQueue<V> refQueue;
    
    public MemoryEfficientCache(int maxSize) {
        this.maxSize = maxSize;
        this.cache = new LinkedHashMap<>(maxSize, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<K, SoftReference<V>> eldest) {
                return size() > maxSize;
            }
        };
        this.refQueue = new ReferenceQueue<>();
        
        // Start cleanup thread
        Thread cleanupThread = new Thread(this::cleanupReferences);
        cleanupThread.setDaemon(true);
        cleanupThread.start();
    }
    
    private void cleanupReferences() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                Reference<?> ref = refQueue.remove();
                cache.values().remove(ref);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
}
```

### 2. Large Data Processor
```java
public class StreamProcessor {
    private static final int BUFFER_SIZE = 8192;
    private final BufferPool bufferPool;
    
    private class BufferPool {
        private final Queue<byte[]> pool = new ConcurrentLinkedQueue<>();
        
        public byte[] acquire() {
            byte[] buffer = pool.poll();
            return buffer != null ? buffer : new byte[BUFFER_SIZE];
        }
        
        public void release(byte[] buffer) {
            if (pool.size() < 10) {
                Arrays.fill(buffer, (byte) 0);
                pool.offer(buffer);
            }
        }
    }
    
    public void processStream(InputStream input) throws IOException {
        byte[] buffer = bufferPool.acquire();
        try {
            int read;
            while ((read = input.read(buffer)) != -1) {
                processBuffer(buffer, read);
            }
        } finally {
            bufferPool.release(buffer);
        }
    }
}
```

### 3. Memory-Conscious Collection
```java
public class MemoryOptimizedList<E> {
    private static final int SEGMENT_SIZE = 1024;
    private final List<Object[]> segments;
    private int size;
    
    @SuppressWarnings("unchecked")
    public E get(int index) {
        if (index >= size) throw new IndexOutOfBoundsException();
        int segmentIndex = index / SEGMENT_SIZE;
        int offset = index % SEGMENT_SIZE;
        return (E) segments.get(segmentIndex)[offset];
    }
    
    public void add(E element) {
        int segmentIndex = size / SEGMENT_SIZE;
        int offset = size % SEGMENT_SIZE;
        
        if (offset == 0) {
            segments.add(new Object[SEGMENT_SIZE]);
        }
        
        segments.get(segmentIndex)[offset] = element;
        size++;
    }
}
```

## Deep Dive Topics 🔍

### Stack Memory Management

```java
public class StackAnalysis {
    // Each method call creates a stack frame
    public void methodA() {
        int a = 1;
        methodB();  // New stack frame
    }
    
    public void methodB() {
        int b = 2;
        methodC();  // New stack frame
    }
    
    public void methodC() {
        int c = 3;
        // Stack frame sequence: methodC -> methodB -> methodA
    }
}
```

### Heap Memory Analysis

```java
public class HeapAnalysis {
    public static void analyzeHeap() {
        // Get memory beans
        List<MemoryPoolMXBean> memoryPools = 
            ManagementFactory.getMemoryPoolMXBeans();
            
        for (MemoryPoolMXBean pool : memoryPools) {
            MemoryUsage usage = pool.getUsage();
            System.out.printf("""
                Pool: %s
                Used: %d
                Committed: %d
                Max: %d%n""",
                pool.getName(),
                usage.getUsed(),
                usage.getCommitted(),
                usage.getMax()
            );
        }
    }
}
```

## Additional Resources 📚

### Documentation
- [Java Memory Model Specification](https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html#jls-17.4)
- [JVM Specification - Memory Areas](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-2.html#jvms-2.5)
- [Understanding Java Memory Model](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/toc.html)

### Tools
- [Java VisualVM](https://visualvm.github.io/)
- [Eclipse Memory Analyzer (MAT)](https://www.eclipse.org/mat/)
- [JProfiler](https://www.ej-technologies.com/products/jprofiler/overview.html)

## FAQs ❓

### Q: What's the difference between Stack and Heap memory?
A: Stack is thread-specific, LIFO structured, and stores method frames and primitives. Heap is shared memory that stores objects and is garbage collected.

### Q: How do I know if I'm running out of stack space?
A: Watch for StackOverflowError exceptions and monitor thread stack sizes with -Xss parameter.

### Q: What causes memory leaks in Java?
A: Common causes include:
1. Unclosed resources
2. Static collections growing indefinitely
3. Long-lived object references
4. Inner class references
5. ThreadLocal variables not removed

###
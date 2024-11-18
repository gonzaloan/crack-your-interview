---
sidebar_position: 1
title: "Threads"
description: "Threads"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🧵 Java Core Concurrency: Threads

## Overview 🎯

Java Threads are the fundamental unit of program execution in concurrent programming. A thread represents an independent path of execution within a program, allowing multiple tasks to run concurrently.

### Real-World Analogy
Think of threads like workers in a restaurant:
- **Main Thread**: The head chef coordinating everything
- **Worker Threads**: Line cooks handling different dishes simultaneously
- **Thread Synchronization**: Kitchen stations that can only be used by one cook at a time
- **Thread Pool**: A team of servers ready to take orders to tables

## Key Concepts 🔑

### Core Components

1. **Thread States**
    - NEW: Created but not yet started
    - RUNNABLE: Executing or ready to execute
    - BLOCKED: Waiting for monitor lock
    - WAITING: Waiting indefinitely
    - TIMED_WAITING: Waiting for specified time
    - TERMINATED: Completed execution

2. **Thread Creation Methods**
    - Extending Thread class
    - Implementing Runnable interface
    - Using ExecutorService
    - Anonymous classes
    - Lambda expressions

### Implementation Examples 💻

#### Basic Thread Creation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.concurrent.*;

    public class ThreadExamples {
        // Method 1: Extending Thread
        class MyThread extends Thread {
            @Override
            public void run() {
                System.out.println("Thread running: " + Thread.currentThread().getName());
            }
        }

        // Method 2: Implementing Runnable
        class MyRunnable implements Runnable {
            @Override
            public void run() {
                System.out.println("Runnable running: " + Thread.currentThread().getName());
            }
        }

        public void demonstrateThreads() {
            // Using Thread class
            Thread thread1 = new MyThread();
            thread1.start();

            // Using Runnable
            Thread thread2 = new Thread(new MyRunnable());
            thread2.start();

            // Using Lambda
            Thread thread3 = new Thread(() -> 
                System.out.println("Lambda thread: " + Thread.currentThread().getName())
            );
            thread3.start();

            // Using ExecutorService
            ExecutorService executor = Executors.newSingleThreadExecutor();
            executor.submit(() -> 
                System.out.println("Executor thread: " + Thread.currentThread().getName())
            );
            executor.shutdown();
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "sync"
    )

    func main() {
        // Using goroutines (Go's lightweight threads)
        var wg sync.WaitGroup

        // Method 1: Simple goroutine
        wg.Add(1)
        go func() {
            defer wg.Done()
            fmt.Printf("Goroutine running\n")
        }()

        // Method 2: Named function
        wg.Add(1)
        go runTask(&wg)

        // Wait for all goroutines to complete
        wg.Wait()
    }

    func runTask(wg *sync.WaitGroup) {
        defer wg.Done()
        fmt.Printf("Named function running\n")
    }
    ```
  </TabItem>
</Tabs>

#### Thread Synchronization

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    public class SynchronizationExample {
        private int count = 0;
        private final Object lock = new Object();

        // Method level synchronization
        public synchronized void incrementSync() {
            count++;
        }

        // Block level synchronization
        public void incrementBlock() {
            synchronized(lock) {
                count++;
            }
        }

        // Using ReentrantLock
        private final ReentrantLock reentrantLock = new ReentrantLock();
        
        public void incrementWithLock() {
            reentrantLock.lock();
            try {
                count++;
            } finally {
                reentrantLock.unlock();
            }
        }

        // Using ReadWriteLock
        private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
        
        public void writeWithLock() {
            rwLock.writeLock().lock();
            try {
                count++;
            } finally {
                rwLock.writeLock().unlock();
            }
        }

        public int readWithLock() {
            rwLock.readLock().lock();
            try {
                return count;
            } finally {
                rwLock.readLock().unlock();
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

    type SynchronizationExample struct {
        count int
        mutex sync.Mutex
        rwMutex sync.RWMutex
    }

    // Using Mutex
    func (s *SynchronizationExample) incrementSync() {
        s.mutex.Lock()
        defer s.mutex.Unlock()
        s.count++
    }

    // Using RWMutex for read/write operations
    func (s *SynchronizationExample) writeWithLock() {
        s.rwMutex.Lock()
        defer s.rwMutex.Unlock()
        s.count++
    }

    func (s *SynchronizationExample) readWithLock() int {
        s.rwMutex.RLock()
        defer s.rwMutex.RUnlock()
        return s.count
    }
    ```
  </TabItem>
</Tabs>

## Best Practices 🌟

### Thread Creation and Management

1. **Use Thread Pools**
```java
// Good: Using thread pool
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(task);

// Bad: Creating new threads manually
new Thread(task).start();
```

2. **Thread Naming**
```java
// Good: Named threads for debugging
Thread thread = new Thread(task);
thread.setName("Worker-" + threadId);
thread.start();

// Bad: Default thread names
new Thread(task).start();
```

3. **Exception Handling**
```java
// Good: Proper exception handling
Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
    logger.error("Thread " + thread.getName() + " failed", throwable);
});
```

### Thread Safety Guidelines

1. **Immutable Objects**
```java
public final class ImmutableValue {
    private final int value;
    
    public ImmutableValue(int value) {
        this.value = value;
    }
    
    public int getValue() {
        return value;
    }
}
```

2. **Atomic Operations**
```java
private final AtomicInteger counter = new AtomicInteger(0);

public void increment() {
    counter.incrementAndGet();
}
```

## Common Pitfalls 🚨

1. **Deadlocks**
```java
// Wrong: Potential deadlock
public void method1() {
    synchronized(lockA) {
        synchronized(lockB) {
            // do something
        }
    }
}

public void method2() {
    synchronized(lockB) {  // Reverse order of locks
        synchronized(lockA) {
            // do something
        }
    }
}

// Correct: Consistent lock ordering
public void method1() {
    synchronized(lockA) {
        synchronized(lockB) {
            // do something
        }
    }
}

public void method2() {
    synchronized(lockA) {  // Same order as method1
        synchronized(lockB) {
            // do something
        }
    }
}
```

2. **Thread Leaks**
```java
// Wrong: Unclosed executor
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(task);
// ... program ends without shutdown

// Correct: Proper shutdown
ExecutorService executor = Executors.newFixedThreadPool(10);
try {
    executor.submit(task);
} finally {
    executor.shutdown();
    executor.awaitTermination(10, TimeUnit.SECONDS);
}
```

## Use Cases 🎯

### 1. Background Task Processor
```java
public class BackgroundTaskProcessor {
    private final ExecutorService executor;
    
    public BackgroundTaskProcessor(int threadCount) {
        this.executor = Executors.newFixedThreadPool(threadCount);
    }
    
    public Future<Result> processTask(Task task) {
        return executor.submit(() -> {
            // Process task
            return new Result();
        });
    }
    
    public void shutdown() {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
```

### 2. Web Server Request Handler
```java
public class RequestHandler {
    private final ThreadPoolExecutor executor;
    
    public RequestHandler(int corePoolSize, int maxPoolSize) {
        this.executor = new ThreadPoolExecutor(
            corePoolSize,
            maxPoolSize,
            60L, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(100)
        );
    }
    
    public void handleRequest(Request request) {
        executor.execute(() -> {
            try {
                processRequest(request);
            } catch (Exception e) {
                logger.error("Error processing request", e);
            }
        });
    }
    
    private void processRequest(Request request) {
        // Process the request
    }
}
```

### 3. Parallel Data Processor
```java
public class ParallelDataProcessor {
    private final ForkJoinPool forkJoinPool;
    
    public ParallelDataProcessor() {
        this.forkJoinPool = new ForkJoinPool();
    }
    
    public <T> List<T> processData(List<T> data, Function<T, T> processor) {
        return data.parallelStream()
            .map(processor)
            .collect(Collectors.toList());
    }
}
```

## Deep Dive Topics 🔍

### Thread Scheduling

1. **Priority and Time Slicing**
```java
Thread thread = new Thread(task);
thread.setPriority(Thread.MAX_PRIORITY);
thread.start();
```

2. **Yielding**
```java
public void cooperativeMultitasking() {
    while (processing) {
        // Do some work
        if (shouldYield) {
            Thread.yield();
        }
    }
}
```

### Thread Local Storage

```java
public class ThreadLocalExample {
    private static final ThreadLocal<UserContext> userContext = 
        new ThreadLocal<>();
        
    public void setContext(UserContext context) {
        userContext.set(context);
    }
    
    public UserContext getContext() {
        return userContext.get();
    }
    
    public void clearContext() {
        userContext.remove();
    }
}
```

## Additional Resources 📚

### Official Documentation
- [Java Thread Documentation](https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html)
- [Java Concurrency in Practice](https://jcip.net/)
- [Oracle Concurrency Tutorial](https://docs.oracle.com/javase/tutorial/essential/concurrency/)

### Tools
- [JConsole](https://docs.oracle.com/javase/7/docs/technotes/guides/management/jconsole.html)
- [Java Mission Control](https://www.oracle.com/java/technologies/jdk-mission-control.html)
- [VisualVM](https://visualvm.github.io/)

## FAQs ❓

### Q: When should I use Thread vs ExecutorService?
A: Use ExecutorService for most cases as it provides better thread management, reuse, and control. Use raw threads only for simple, one-off tasks.

### Q: How do I handle InterruptedException?
A: Either propagate it up the call stack or restore the interrupt status:
```java
try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    // Handle interruption
}
```

### Q: What's the difference between synchronized and Lock?
A: Lock provides more flexibility with features like tryLock(), timed lock attempts, and interruptible lock attempts. synchronized is simpler but less flexible.

### Q: How do I prevent deadlocks?
A: Follow these guidelines:
1. Use consistent lock ordering
2. Avoid nested locks
3. Use lock timeouts
4. Use Lock.tryLock() when appropriate
5. Implement deadlock detection

### Q: What is thread starvation and how to prevent it?
A: Thread starvation occurs when threads can't access shared resources. Prevent it by:
1. Using fair locks
2. Avoiding long-held locks
3. Using appropriate thread priorities
4. Implementing timeouts
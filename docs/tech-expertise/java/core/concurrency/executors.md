---
sidebar_position: 2
title: "Executors"
description: "Executors"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚡ Java Core Concurrency: Executors

## Overview 🎯

Java Executors provide a framework for asynchronous task execution, offering a higher-level replacement for working with threads directly. They manage thread lifecycles, scheduling, and task execution, allowing developers to focus on business logic rather than thread management.

### Real-World Analogy
Think of Executors like different types of task management systems:
- **Fixed Thread Pool**: A team of workers with fixed size (like a restaurant kitchen staff)
- **Cached Thread Pool**: A flexible workforce that grows/shrinks with demand (like an event staffing agency)
- **Scheduled Executor**: A scheduling system (like a calendar with reminders)
- **Single Thread Executor**: A single worker handling tasks sequentially (like a one-person post office)

## Key Concepts 🔑

### Core Components

1. **Executor Types**
    - ThreadPoolExecutor
    - ScheduledThreadPoolExecutor
    - ForkJoinPool
    - CompletableFuture

2. **Task Types**
    - Runnable
    - Callable
    - Future
    - CompletableFuture

3. **Thread Pool Types**
    - Fixed Thread Pool
    - Cached Thread Pool
    - Scheduled Thread Pool
    - Single Thread Executor
    - Custom Thread Pool

## Implementation Examples 💻

### Basic Executor Usage

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.concurrent.*;
    import java.util.*;

    public class ExecutorBasics {
        // Fixed Thread Pool
        private final ExecutorService fixedPool = 
            Executors.newFixedThreadPool(4);
            
        // Cached Thread Pool
        private final ExecutorService cachedPool = 
            Executors.newCachedThreadPool();
            
        // Scheduled Executor
        private final ScheduledExecutorService scheduledPool = 
            Executors.newScheduledThreadPool(2);
            
        public void demonstrateExecutors() {
            // Submit Runnable
            fixedPool.execute(() -> {
                System.out.println("Task running in thread: " 
                    + Thread.currentThread().getName());
            });
            
            // Submit Callable
            Future<String> future = cachedPool.submit(() -> {
                Thread.sleep(1000);
                return "Task completed";
            });
            
            // Schedule task
            scheduledPool.scheduleAtFixedRate(
                () -> System.out.println("Periodic task"),
                0, 1, TimeUnit.SECONDS
            );
        }
        
        public void shutdown() {
            fixedPool.shutdown();
            cachedPool.shutdown();
            scheduledPool.shutdown();
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
        "time"
    )

    type ExecutorBasics struct {
        workerPool chan struct{}
        wg         sync.WaitGroup
    }

    func NewExecutorBasics(poolSize int) *ExecutorBasics {
        return &ExecutorBasics{
            workerPool: make(chan struct{}, poolSize),
        }
    }

    func (e *ExecutorBasics) Execute(task func()) {
        e.wg.Add(1)
        go func() {
            defer e.wg.Done()
            // Acquire worker
            e.workerPool <- struct{}{}
            defer func() { <-e.workerPool }()
            
            task()
        }()
    }

    func (e *ExecutorBasics) ScheduleAtFixedRate(
        task func(), 
        interval time.Duration,
    ) {
        ticker := time.NewTicker(interval)
        go func() {
            for range ticker.C {
                e.Execute(task)
            }
        }()
    }

    func (e *ExecutorBasics) Shutdown() {
        e.wg.Wait()
    }
    ```
  </TabItem>
</Tabs>

### Custom Thread Pool

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.concurrent.*;

    public class CustomThreadPool {
        private final ThreadPoolExecutor executor;
        
        public CustomThreadPool(
            int corePoolSize,
            int maxPoolSize,
            long keepAliveTime,
            int queueCapacity
        ) {
            this.executor = new ThreadPoolExecutor(
                corePoolSize,
                maxPoolSize,
                keepAliveTime,
                TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(queueCapacity),
                new ThreadPoolExecutor.CallerRunsPolicy()
            );
        }
        
        public void executeTask(Runnable task) {
            executor.execute(task);
        }
        
        public <T> Future<T> submitTask(Callable<T> task) {
            return executor.submit(task);
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
        
        public ThreadPoolMetrics getMetrics() {
            return new ThreadPoolMetrics(
                executor.getPoolSize(),
                executor.getActiveCount(),
                executor.getCompletedTaskCount(),
                executor.getQueue().size()
            );
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "context"
        "sync"
        "time"
    )

    type CustomThreadPool struct {
        workers    chan struct{}
        tasks     chan func()
        wg        sync.WaitGroup
        ctx       context.Context
        cancel    context.CancelFunc
    }

    func NewCustomThreadPool(
        poolSize int,
        queueSize int,
    ) *CustomThreadPool {
        ctx, cancel := context.WithCancel(context.Background())
        pool := &CustomThreadPool{
            workers: make(chan struct{}, poolSize),
            tasks:   make(chan func(), queueSize),
            ctx:     ctx,
            cancel:  cancel,
        }
        
        // Start worker goroutines
        for i := 0; i < poolSize; i++ {
            go pool.worker()
        }
        
        return pool
    }

    func (p *CustomThreadPool) worker() {
        for {
            select {
            case <-p.ctx.Done():
                return
            case task := <-p.tasks:
                task()
                p.wg.Done()
            }
        }
    }

    func (p *CustomThreadPool) Execute(task func()) {
        p.wg.Add(1)
        p.tasks <- task
    }

    func (p *CustomThreadPool) Shutdown() {
        p.cancel()
        p.wg.Wait()
        close(p.tasks)
    }
    ```
  </TabItem>
</Tabs>

## Best Practices 🌟

### Thread Pool Configuration

1. **Pool Sizing**
```java
// CPU-intensive tasks
int threads = Runtime.getRuntime().availableProcessors();
ExecutorService executor = Executors.newFixedThreadPool(threads);

// I/O-intensive tasks
int threads = Runtime.getRuntime().availableProcessors() * 2;
ExecutorService executor = Executors.newFixedThreadPool(threads);
```

2. **Queue Configuration**
```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    corePoolSize,
    maxPoolSize,
    keepAliveTime,
    TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(queueCapacity), // Bounded queue
    new ThreadPoolExecutor.CallerRunsPolicy() // Rejection policy
);
```

### Monitoring and Management

1. **Metrics Collection**
```java
public class ExecutorMetrics {
    private final ThreadPoolExecutor executor;
    
    public ExecutorStats getStats() {
        return new ExecutorStats(
            executor.getPoolSize(),
            executor.getActiveCount(),
            executor.getCompletedTaskCount(),
            executor.getQueue().size(),
            executor.getLargestPoolSize()
        );
    }
    
    public void adjustPoolSize(int newSize) {
        executor.setCorePoolSize(newSize);
        executor.setMaximumPoolSize(newSize);
    }
}
```

## Common Pitfalls 🚨

1. **Not Shutting Down Executors**
```java
// Wrong: Executor never shut down
ExecutorService executor = Executors.newFixedThreadPool(4);
executor.submit(task);
// Program ends

// Correct: Proper shutdown
try {
    executor.submit(task);
} finally {
    executor.shutdown();
    executor.awaitTermination(10, TimeUnit.SECONDS);
}
```

2. **Queue Saturation**
```java
// Wrong: Unbounded queue
ExecutorService executor = Executors.newFixedThreadPool(4);

// Correct: Bounded queue with rejection policy
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    4, 4, 0L, TimeUnit.MILLISECONDS,
    new ArrayBlockingQueue<>(1000),
    new ThreadPoolExecutor.CallerRunsPolicy()
);
```

## Use Cases 🎯

### 1. Web Server Request Handler
```java
public class RequestHandler {
    private final ExecutorService executor;
    
    public RequestHandler(int maxThreads) {
        this.executor = Executors.newFixedThreadPool(maxThreads);
    }
    
    public CompletableFuture<Response> handleRequest(Request request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return processRequest(request);
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        }, executor);
    }
    
    private Response processRequest(Request request) {
        // Process request
        return new Response();
    }
}
```

### 2. Batch Job Processor
```java
public class BatchProcessor {
    private final ScheduledExecutorService scheduler;
    private final ExecutorService workers;
    
    public BatchProcessor(int workerThreads) {
        this.scheduler = Executors.newSingleThreadScheduledExecutor();
        this.workers = Executors.newFixedThreadPool(workerThreads);
    }
    
    public void scheduleJob(BatchJob job) {
        scheduler.scheduleAtFixedRate(
            () -> processJob(job),
            0, 1, TimeUnit.HOURS
        );
    }
    
    private void processJob(BatchJob job) {
        List<CompletableFuture<Void>> tasks = job.getTasks()
            .stream()
            .map(task -> CompletableFuture.runAsync(
                () -> processTask(task), 
                workers
            ))
            .collect(Collectors.toList());
            
        CompletableFuture.allOf(
            tasks.toArray(new CompletableFuture[0])
        ).join();
    }
}
```

### 3. Async Event Processor
```java
public class EventProcessor {
    private final ExecutorService executor;
    private final BlockingQueue<Event> eventQueue;
    
    public EventProcessor(int threads) {
        this.executor = Executors.newFixedThreadPool(threads);
        this.eventQueue = new LinkedBlockingQueue<>();
    }
    
    public void submitEvent(Event event) {
        eventQueue.offer(event);
    }
    
    public void startProcessing() {
        for (int i = 0; i < threads; i++) {
            executor.submit(this::processEvents);
        }
    }
    
    private void processEvents() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                Event event = eventQueue.take();
                processEvent(event);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
}
```

## Deep Dive Topics 🔍

### Thread Pool Internals

1. **Work Stealing Algorithm**
```java
public class WorkStealingPool {
    private final ForkJoinPool executor;
    
    public WorkStealingPool() {
        this.executor = new ForkJoinPool(
            Runtime.getRuntime().availableProcessors(),
            ForkJoinPool.defaultForkJoinWorkerThreadFactory,
            null,
            true // Enable work stealing
        );
    }
    
    public <T> Future<T> submit(ForkJoinTask<T> task) {
        return executor.submit(task);
    }
}
```

2. **Custom Thread Factory**
```java
public class MonitoredThreadFactory implements ThreadFactory {
    private final AtomicInteger threadCount = new AtomicInteger(0);
    private final String namePrefix;
    
    public MonitoredThreadFactory(String namePrefix) {
        this.namePrefix = namePrefix;
    }
    
    @Override
    public Thread newThread(Runnable r) {
        Thread thread = new Thread(r);
        thread.setName(namePrefix + "-" + threadCount.incrementAndGet());
        thread.setDaemon(true);
        return thread;
    }
}
```

## Additional Resources 📚

### Documentation
- [Java Executor Framework Documentation](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Executors.html)
- [Thread Pool Executor JavaDoc](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ThreadPoolExecutor.html)
- [Fork/Join Framework Documentation](https://docs.oracle.com/javase/tutorial/essential/concurrency/forkjoin.html)

### Tools
- [JMX Monitoring Tools](https://docs.oracle.com/javase/8/docs/technotes/guides/management/jconsole.html)
- [Visual VM](https://visualvm.github.io/)
- [Java Mission Control](https://www.oracle.com/java/technologies/jdk-mission-control.html)

## FAQs ❓

### Q: How do I choose the right type of executor?
A: Consider:
- Fixed Thread Pool: For stable, predictable workloads
- Cached Thread Pool: For varying, short-lived tasks
- Scheduled Thread Pool: For periodic tasks
- Single Thread: For sequential task execution

### Q: What's the difference between execute() and submit()?
A: execute() takes a Runnable and returns void, while submit() can take either Runnable or Callable and returns a Future.

### Q: How do I handle executor exceptions?
A: Use try-catch in tasks, UncaughtExceptionHandler, or check the Future.get() result.

### Q: What's the best way to shut down an executor?
A: Use shutdown() followed by awaitTermination(), with shutdownNow() as a fallback.

### Q: How do I size my thread pool?
A: For CPU-intensive tasks, use number of CPU cores. For I/O-intensive tasks, use higher numbers based on profiling and testing.
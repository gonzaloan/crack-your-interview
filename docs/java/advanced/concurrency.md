---
sidebar_position: 5
title: "Concurrency and Parallelism"
description: "Concurrency and Parallelism in Java for software architects and senior engineers"
---

# Concurrency and Parallelism

## Introduction to Concurrency and Parallelism

Concurrency and parallelism are fundamental concepts in Java for achieving efficient utilization of system resources and improving application performance. Concurrency refers to the ability to execute multiple tasks or processes simultaneously, while parallelism involves actually executing multiple tasks or processes at the same time.

### Concurrency

Concurrency is about dealing with multiple tasks or processes that are in progress at the same time, but not necessarily executing simultaneously. It allows different parts of a program to make progress without waiting for each other to complete.

### Parallelism

Parallelism is a specific form of concurrency where multiple tasks or processes are executed simultaneously on different CPU cores or machines. It allows the program to truly execute multiple tasks at the same time, taking advantage of multi-core processors or distributed systems.

## Core Understanding

### Threads and Runnables

Threads are the fundamental units of execution in Java. They allow concurrent execution of tasks within a program. The `Runnable` interface is used to define the task that a thread should execute.

```java
public class MyRunnable implements Runnable {
    @Override
    public void run() {
        // Task to be executed by the thread
        System.out.println("Thread is running");
    }
}

Thread thread = new Thread(new MyRunnable());
thread.start();
```

### Synchronization

Synchronization is a mechanism to coordinate access to shared resources among multiple threads. It ensures that only one thread can access a shared resource at a time, preventing race conditions and data inconsistencies.

```java
public class Counter {
    private int count;

    public synchronized void increment() {
        count++;
    }

    public synchronized int getCount() {
        return count;
    }
}
```

### Concurrent Collections

Java provides thread-safe collections in the `java.util.concurrent` package. These collections are designed to support concurrent access and modification by multiple threads.

```java
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put("key", 1);
map.putIfAbsent("key", 2);
```

### Executors and Thread Pools

Executors and thread pools provide a higher-level abstraction for managing and executing tasks concurrently. They manage a pool of worker threads and assign tasks to them for execution.

```java
ExecutorService executor = Executors.newFixedThreadPool(5);

Runnable task = () -> {
    // Task to be executed
    System.out.println("Task is running");
};

executor.submit(task);
executor.shutdown();
```

### Parallel Streams

Java 8 introduced parallel streams, which allow processing of collections in parallel. Parallel streams leverage the Fork/Join framework to distribute the workload among multiple threads.

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int sum = numbers.parallelStream()
    .mapToInt(Integer::intValue)
    .sum();
```

### CompletableFuture and Asynchronous Programming

`CompletableFuture` is a class introduced in Java 8 that provides an easy way to write asynchronous and event-driven programs. It allows composing and chaining asynchronous operations and handling their results.

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    // Asynchronous task
    return "Hello, World!";
});

future.thenAccept(result -> {
    System.out.println(result);
});
```

## Best Practices

- Use appropriate concurrency primitives and utilities from the `java.util.concurrent` package, such as `ExecutorService`, `Callable`, `Future`, and `CompletableFuture`.
- Prefer using high-level concurrency abstractions like `ExecutorService` and parallel streams over low-level constructs like `Thread` and `synchronized` when possible.
- Avoid shared mutable state whenever possible. Use immutable objects and thread-safe data structures to minimize the need for synchronization.
- Use synchronization primitives like `synchronized`, `Lock`, and `Semaphore` judiciously to coordinate access to shared resources and prevent race conditions.
- Be mindful of the potential for deadlocks when using multiple locks or synchronized blocks. Acquire locks in a consistent order to prevent circular wait conditions.
- Consider using thread-local variables (`ThreadLocal`) for storing thread-specific data and avoiding shared mutable state.
- Use the `volatile` keyword for variables that are accessed by multiple threads to ensure visibility and prevent inconsistent reads.
- Leverage parallel stream operations and the `Fork/Join` framework for parallelizing compute-intensive tasks and algorithms.
- Understand the implications of the Java Memory Model (JMM) and how it affects the visibility and ordering of memory operations across threads.

## Use Cases

- Implementing reactive and event-driven architectures using non-blocking I/O and asynchronous programming models.
- Building scalable and responsive web applications and services that can handle high levels of concurrency.
- Parallelizing computationally intensive tasks, such as scientific simulations, data processing pipelines, and machine learning algorithms.
- Developing multi-threaded desktop applications with responsive user interfaces and background processing capabilities.
- Implementing distributed systems and concurrent data structures that can scale horizontally across multiple nodes.

## Common Mistakes and Anti-Patterns

### Shared Mutable State

Sharing mutable state among multiple threads without proper synchronization can lead to race conditions and data inconsistencies.

```java
// Bad example
public class Counter {
    private int count;

    public void increment() {
        count++;  // Not thread-safe
    }
}
```

### Excessive Synchronization

Overusing synchronization can lead to performance bottlenecks and reduced concurrency.

```java
// Bad example
public class Calculator {
    public synchronized int add(int a, int b) {
        return a + b;  // Synchronization not needed for read-only operations
    }
}
```

### Incorrect Synchronization

Using synchronization incorrectly, such as synchronizing on the wrong object or not covering all critical sections, can lead to race conditions and incorrect behavior.

```java
// Bad example
public class Counter {
    private int count;

    public void increment() {
        synchronized (this) {
            count++;
        }
        // Critical section not fully covered
        System.out.println(count);
    }
}
```

### Deadlocks

Deadlocks occur when two or more threads are waiting for each other to release resources, resulting in a circular dependency and program freeze.

```java
// Bad example
public class DeadlockExample {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();

    public void method1() {
        synchronized (lock1) {
            synchronized (lock2) {
                // ...
            }
        }
    }

    public void method2() {
        synchronized (lock2) {
            synchronized (lock1) {
                // ...
            }
        }
    }
}
```

### Inefficient Parallel Processing

Incorrectly using parallel streams or the `Fork/Join` framework can lead to inefficient parallel processing and degraded performance.

```java
// Bad example
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int sum = numbers.parallelStream()
    .mapToInt(Integer::intValue)
    .sum();  // Overhead of parallel processing outweighs the benefits for small collections
```

## Interview Questions and Answers

Q1: What is the difference between concurrency and parallelism?
A1: Concurrency refers to the ability to execute multiple tasks or processes simultaneously, but not necessarily at the same time. It allows different parts of a program to make progress without waiting for each other to complete. Parallelism, on the other hand, involves actually executing multiple tasks or processes at the same time, taking advantage of multi-core processors or distributed systems.

Q2: What is the purpose of the `synchronized` keyword in Java?
A2: The `synchronized` keyword is used to achieve thread synchronization in Java. It ensures that only one thread can execute a synchronized block or method at a time, preventing multiple threads from accessing shared resources simultaneously. Synchronization helps prevent race conditions and ensures data consistency in multi-threaded environments.

Q3: What is the difference between `Runnable` and `Callable` in Java?
A3: Both `Runnable` and `Callable` are interfaces used to define tasks that can be executed by threads. The main difference is that `Runnable` represents a task that does not return a result and cannot throw checked exceptions, while `Callable` represents a task that can return a result and can throw checked exceptions. `Runnable` is used with the `execute()` method of `ExecutorService`, while `Callable` is used with the `submit()` method, which returns a `Future` object representing the result of the task.

Q4: What is a `ThreadLocal` and when would you use it?
A4: `ThreadLocal` is a class in Java that provides thread-local variables. Each thread has its own instance of a thread-local variable, and changes made to the variable by one thread do not affect the values seen by other threads. `ThreadLocal` is useful in scenarios where you need to associate data with a specific thread, such as storing user-specific information in a web application or managing thread-specific resources like database connections.

Q5: What is the Java Memory Model (JMM) and why is it important?
A5: The Java Memory Model (JMM) is a specification that defines how threads in Java interact with the memory of the computer. It specifies the rules for memory visibility, ordering, and atomicity in a multi-threaded environment. The JMM is important because it ensures that the behavior of concurrent programs is predictable and consistent across different hardware architectures and Java implementations. It provides guarantees about when changes made by one thread become visible to other threads and helps prevent issues like race conditions and memory inconsistencies.

## Conclusion

Concurrency and parallelism are essential concepts in Java for developing efficient and scalable applications. By understanding the core concepts, best practices, and common pitfalls, software architects and senior engineers can design and implement robust concurrent and parallel systems.

Java provides a rich set of concurrency utilities and abstractions, such as threads, synchronization primitives, concurrent collections, executors, and parallel streams, to simplify concurrent programming. However, it's important to use these tools judiciously and follow best practices to avoid common mistakes and anti-patterns.

When designing concurrent and parallel systems, consider factors such as task decomposition, synchronization, resource management, and performance optimization. Proper testing and debugging techniques should also be employed to ensure the correctness and reliability of concurrent code.

By mastering concurrency and parallelism in Java, software architects and senior engineers can build high-performance, responsive, and scalable applications that effectively utilize system resources and deliver optimal user experiences.
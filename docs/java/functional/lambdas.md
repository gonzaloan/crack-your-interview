---
sidebar_position: 3
title: "Lambda Expressions"
description: "Advanced Lambda patterns and functional interfaces in Java"
---

# Lambda Expressions

## Core Understanding
Lambda expressions are anonymous functions that enable functional programming in Java. They provide a clear and concise way to implement single abstract method interfaces (functional interfaces).

## Key Concepts

### Functional Interface Types


1.  **`Consumer<T>`**

```java
Consumer<String> printer = s -> System.out.println(s);
BiConsumer<String, Integer> keyValue = (key, value) -> System.out.println(key + "=" + value);
```
- Accepts an argument and returns nothing
- Used for operations with side effects

2. **`Supplier<T>`**
```java
Supplier<UUID> uuidGenerator = UUID::randomUUID;
Supplier<User> userCreator = User::new;
```
- Takes no arguments and returns a result
- Used for lazy evaluation and factory methods.

3. **`Function<T,R>`**

```java
Function<String, Integer> parser = Integer::parseInt;
BiFunction<String, Integer, String> repeater = String::repeat;
```
- Transforms input into output
- Core functional interface for transformations

4. **`Predicate<T>`**
```java
Predicate<String> isEmpty = String::isEmpty;
BiPredicate<String, String> contains = String::contains;
```
- Tests a condition
- Returns boolean
- Used for filtering

5. **`UnaryOperator<T>`**
   ```java
   UnaryOperator<String> toUpperCase = String::toUpperCase;
   ```
   - Special case of Function where input and output types are the same

### Method References Types
1. **Static Method Reference**
   ```java
   Function<String, Integer> parser = Integer::parseInt;
   ```

2. **Instance Method Reference**
   ```java
   String str = "hello";
   Supplier<Integer> lengthSupplier = str::length;
   ```

3. **Constructor Reference**
   ```java
   Supplier<ArrayList<String>> listCreator = ArrayList::new;
   ```

### Important Features
1. **Closure Scope**
   - Access to final or effectively final variables
   - Enclosing class members access

2. **Type Inference**
   ```java
   // Compiler infers parameter types
   Comparator<String> comp = (s1, s2) -> s1.length() - s2.length();
   ```

3. **Target Typing**
   - Lambda type is inferred from context
   - Same lambda can be used for different functional interfaces

## Examples

### ❌ Bad Example
```java
public class EventManager {
    private List<EventHandler> handlers = new ArrayList<>();

    // Bad: Using anonymous classes
    public void registerHandlers() {
        handlers.add(new EventHandler() {
            @Override
            public void handle(Event event) {
                System.out.println(event);
            }
        });

        // Mixed styles and verbose
        EventHandler handler = new EventHandler() {
            @Override
            public void handle(Event event) {
                processEvent(event);
            }
        };
        handlers.add(handler);
    }

    // Complex error handling
    public void processEvent(Event event) {
        for(EventHandler handler : handlers) {
            try {
                handler.handle(event);
            } catch(Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

**Why it's bad:**
- Verbose anonymous classes
- Inconsistent style
- Poor error handling
- No use of functional interfaces
- Hard to read and maintain

### ✅ Good Example
```java
public class EventManager {
    private final List<Consumer<Event>> handlers = new CopyOnWriteArrayList<>();
    private final ErrorHandler errorHandler;

    // Clean lambda usage
    public void registerCommonHandlers() {
        // Method reference
        addHandler(this::logEvent);
        
        // Simple lambda
        addHandler(event -> metrics.recordEvent(event));
        
        // Multi-line with specific logic
        addHandler(event -> {
            if (event.isHighPriority()) {
                notificationService.notify(event);
                metrics.recordHighPriority(event);
            }
        });
    }

    public void addHandler(Consumer<Event> handler) {
        handlers.add(Objects.requireNonNull(handler));
    }

    public void processEvent(Event event) {
        handlers.forEach(handler -> 
            executeHandler(handler, event));
    }

    private void executeHandler(Consumer<Event> handler, Event event) {
        try {
            handler.accept(event);
        } catch (Exception e) {
            errorHandler.handle(e, event);
        }
    }
}
```

**Why it's good:**
- Clean lambda syntax
- Proper error handling
- Type safety
- Thread-safe collection
- Easy to test and maintain

## Best Practices

1. **Prefer Method References**
```java
// Instead of
list.forEach(s -> System.out.println(s));
// Use
list.forEach(System.out::println);
```

2. **Keep Lambdas Small**
```java
// Extract complex logic to methods
list.stream()
    .filter(this::isValidForProcessing)
    .map(this::processItem)
    .forEach(this::saveResult);
```

3. **Use Built-in Functional Interfaces**
```java
// Instead of creating custom interfaces
public interface Processor<T> {
    void process(T t);
}

// Use existing
Consumer<T> processor = item -> processItem(item);
```

## Use Cases

1. **Event Handling**
```java
button.setOnAction(event -> handleClick());
executorService.submit(() -> processInBackground());
```

2. **Strategy Pattern**
```java
Map<String, Function<Data, Result>> strategies = Map.of(
    "fast", this::processFast,
    "accurate", this::processAccurate
);
```

3. **Builders and Fluent APIs**
```java
User user = User.builder()
    .withName("John")
    .withAge(30)
    .build();
```

## Anti-patterns to Avoid

1. **Complex Lambda Bodies**
```java
// Bad
stream.forEach(item -> {
    // Many lines of complex logic
});

// Good
stream.forEach(this::processItem);
```

2. **Lambda Side Effects**
```java
// Bad
List<String> results = new ArrayList<>();
items.forEach(item -> results.add(process(item)));

// Good
List<String> results = items.stream()
    .map(this::process)
    .collect(Collectors.toList());
```

3. **Overcomplicating Simple Operations**
```java
// Bad
Function<String, String> processor = str -> str.toLowerCase();

// Good
Function<String, String> processor = String::toLowerCase;
```

## Interview Questions

### Q1: "What's the difference between Lambda expressions and Method References?"
**A**:
```java
// Lambda expression vs Method reference examples
List<String> names = Arrays.asList("John", "Jane", "Bob");

// Lambda expression
names.forEach(name -> System.out.println(name));

// Method reference - cleaner when directly passing parameter
names.forEach(System.out::println);

// Lambda required when manipulating parameter
names.forEach(name -> System.out.println("Name: " + name));
```

### Q2: "How do you handle checked exceptions in Lambda expressions?"
**A**:
```java
@FunctionalInterface
public interface ThrowingFunction<T, R, E extends Exception> {
    R apply(T t) throws E;
    
    static <T, R> Function<T, R> unchecked(
            ThrowingFunction<T, R, Exception> f) {
        return t -> {
            try {
                return f.apply(t);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        };
    }
}

// Usage
List<String> files = paths.stream()
    .map(ThrowingFunction.unchecked(Files::readString))
    .collect(Collectors.toList());
```

### Q3: "Explain variable capture in Lambda expressions"
**A**:
```java
public class LambdaCaptureExample {
    private int instanceVar = 1;
    
    public Consumer<Integer> createLambda(int methodParam) {
        int localVar = 2;
        
        return num -> {
            // Can access instance variables
            System.out.println(instanceVar);
            
            // Can access final or effectively final method parameters
            System.out.println(methodParam);
            
            // Can access final or effectively final local variables
            System.out.println(localVar);
            
            // Cannot modify any captured variables
            // localVar++; // Compilation error
            // methodParam++; // Compilation error
            
            // Can modify instance variables
            instanceVar++;
        };
    }
}
```
---
sidebar_position: 2
title: "Java 11-17 Features"
description: "New features and improvements in Java versions 11 through 17"
---

# Java 11-17 Features

## Core Understanding
Modern Java versions (11-17) introduce significant improvements in language syntax, APIs, and performance. These versions focus on enhancing developer productivity, application performance, and maintaining Java's position as a leading enterprise platform.

## Key Concepts

### 1. Record Classes (Java 16)
- Immutable data carriers
- Automatic getter methods
- Built-in equals(), hashCode(), and toString()

```java
// Record declaration
public record Person(String name, int age) {
    // Compact constructor
    public Person {
        if (age < 0) throw new IllegalArgumentException("Age cannot be negative");
    }
    
    // Additional methods can be added
    public boolean isAdult() {
        return age >= 18;
    }
}
```

### 2. Sealed Classes (Java 17)
- Restrict class hierarchy
- Explicit subclass declaration
```java
public sealed interface Shape 
    permits Circle, Rectangle, Square {
    double area();
}

public final class Circle implements Shape {
    private final double radius;
    
    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}
```

### 3. Pattern Matching (Java 16-17)
```java
// instanceof pattern matching
if (obj instanceof String str && !str.isEmpty()) {
    // Use str directly
}

// switch expression with pattern matching
String result = switch (obj) {
    case Integer i -> String.format("int %d", i);
    case Long l    -> String.format("long %d", l);
    case Double d  -> String.format("double %f", d);
    case String s  -> String.format("String %s", s);
    default        -> obj.toString();
};
```

### 4. Text Blocks (Java 15)
```java
String query = """
    SELECT u.id, u.name, u.email
    FROM users u
    WHERE u.active = true
    ORDER BY u.name
    """;
```

### 5. Helpful NullPointerExceptions (Java 14)
- More precise null pointer detection
- Clearer error messages

### 6. Foreign Memory Access API (Java 14+)
```java
// Direct memory access
try (MemorySegment segment = MemorySegment.allocateNative(100)) {
    segment.set(ValueLayout.JAVA_INT, 0, 42);
    int value = segment.get(ValueLayout.JAVA_INT, 0);
}
```

### Important APIs and Changes

1. **HTTP Client (Java 11)**
```java
HttpClient client = HttpClient.newBuilder()
    .version(Version.HTTP_2)
    .connectTimeout(Duration.ofSeconds(10))
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com"))
    .header("Content-Type", "application/json")
    .POST(BodyPublishers.ofString("{\"key\":\"value\"}"))
    .build();
```

2. **Files API Enhancements**
```java
// Reading/Writing Strings (Java 11)
String content = Files.readString(Path.of("file.txt"));
Files.writeString(Path.of("file.txt"), "content");

// File mapping improvements
try (var channel = FileChannel.open(path)) {
    MappedByteBuffer buffer = channel.map(
        FileChannel.MapMode.READ_WRITE, 0, size);
}
```

## Examples

### ❌ Bad Example
```java
// Old style verbose code
public class UserDTO {
    private final String name;
    private final String email;
    private final int age;

    public UserDTO(String name, String email, int age) {
        this.name = name;
        this.email = email;
        this.age = age;
    }

    // Getters
    public String getName() { return name; }
    public String getEmail() { return email; }
    public int getAge() { return age; }

    // equals, hashCode, toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDTO userDTO = (UserDTO) o;
        return age == userDTO.age &&
               Objects.equals(name, userDTO.name) &&
               Objects.equals(email, userDTO.email);
    }
    // More boilerplate...
}
```

**Why it's bad:**
- Verbose boilerplate code
- Error-prone manual implementations
- Higher maintenance burden
- Less readable

### ✅ Good Example
```java
// Modern Java features utilization
public record UserDTO(String name, String email, int age) {
    // Compact constructor for validation
    public UserDTO {
        if (age < 0) throw new IllegalArgumentException("Invalid age");
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email");
        }
    }
}

public sealed interface PaymentMethod permits 
    CreditCard, PayPal, BankTransfer {
    boolean processPayment(BigDecimal amount);
}

public final class PaymentProcessor {
    public String handlePayment(PaymentMethod method, BigDecimal amount) {
        return switch (method) {
            case CreditCard c  -> processCard(c, amount);
            case PayPal p      -> processPalPay(p, amount);
            case BankTransfer b -> processBank(b, amount);
        };
    }
    
    private String processCard(CreditCard card, BigDecimal amount) {
        String details = """
            Processing credit card payment:
            Amount: %s
            Card: %s
            """.formatted(amount, card.maskNumber());
        return details;
    }
}
```

**Why it's good:**
- Concise and clear
- Type-safe pattern matching
- Built-in immutability
- Self-documenting code
- Enhanced maintainability

## Best Practices

1. **Use Records for Data Transfer**
```java
// Instead of POJOs
public record CustomerData(
    String id,
    String name,
    Address address,
    List<Order> orders
) {}
```

2. **Leverage Pattern Matching**
```java
public String processShape(Shape shape) {
    return switch (shape) {
        case Circle c    -> handleCircle(c);
        case Rectangle r -> handleRectangle(r);
        case null       -> throw new IllegalArgumentException();
    };
}
```

3. **Utilize Text Blocks for Complex Strings**
```java
String html = """
    <html>
        <body>
            <h1>%s</h1>
            <p>%s</p>
        </body>
    </html>
    """.formatted(title, content);
```

## Use Cases

1. **Data Transfer Objects (DTOs)**
```java
// Perfect for API responses
public record ApiResponse<T>(
    int status,
    String message,
    T data,
    Instant timestamp
) {}
```

2. **Domain Modeling**
```java
public sealed interface Vehicle 
    permits Car, Truck, Motorcycle {
    String getRegistration();
}

public final class Car implements Vehicle {
    // Implementation
}
```

3. **Configuration Classes**
```java
public record DatabaseConfig(
    String url,
    String username,
    String password,
    int maxConnections,
    Duration timeout
) {}
```

## Anti-patterns to Avoid

1. **Mutable Records**
```java
// Bad: Attempting to make record mutable
public record MutableRecord(List<String> items) {
    public void addItem(String item) { // Don't do this
        items.add(item);
    }
}

// Good: Immutable operations
public record ImmutableRecord(List<String> items) {
    public ImmutableRecord {
        items = List.copyOf(items); // Defensive copy
    }
}
```

2. **Overusing Pattern Matching**
```java
// Bad: Overcomplicated pattern matching
if (obj instanceof String s && s.length() > 0 &&
    s.charAt(0) == 'A' && s.endsWith("ing")) {
    // Complex condition
}

// Good: Clear and focused
if (obj instanceof String s && isValidString(s)) {
    // Better abstraction
}
```

3. **Misusing Sealed Classes**
```java
// Bad: Too many permitted classes
public sealed class Base 
    permits A, B, C, D, E, F, G, H, I, J {
}

// Good: Focused hierarchy
public sealed interface PaymentMethod 
    permits CreditCard, DebitCard, BankTransfer {
}
```

## Interview Questions

### Q1: "What are the main benefits of Records over traditional POJOs?"
**A**:
```java
// Traditional POJO - verbose
public class User {
    private final String name;
    private final String email;
    
    // Constructor, getters, equals, hashCode, toString
    // 50+ lines of code
}

// Record - concise and immutable
public record User(String name, String email) {
    // Validation in compact constructor
    public User {
        Objects.requireNonNull(name);
        Objects.requireNonNull(email);
    }
    
    // Additional methods if needed
    public String fullDetails() {
        return "%s (%s)".formatted(name, email);
    }
}
```

### Q2: "How do sealed classes improve domain modeling?"
**A**:
```java
public sealed interface PaymentResult 
    permits Success, Failure {
    
    record Success(String transactionId, BigDecimal amount) 
        implements PaymentResult {}
    
    record Failure(String errorCode, String message) 
        implements PaymentResult {}
}

public class PaymentProcessor {
    public void handleResult(PaymentResult result) {
        switch (result) {
            case Success s -> processSuccess(s);
            case Failure f -> handleFailure(f);
        }; // Exhaustive by design
    }
}
```

### Q3: "What's the difference between switch expressions and switch statements?"
**A**:
```java
// Traditional switch statement
String result;
switch (day) {
    case MONDAY:
    case FRIDAY:
        result = "Work";
        break;
    case SATURDAY:
    case SUNDAY:
        result = "Weekend";
        break;
    default:
        result = "Unknown";
}

// Modern switch expression
String result = switch (day) {
    case MONDAY, FRIDAY -> "Work";
    case SATURDAY, SUNDAY -> "Weekend";
    default -> "Unknown";
};

// With code blocks
String result = switch (day) {
    case MONDAY, FRIDAY -> {
        System.out.println("Processing work day");
        yield "Work";
    }
    case SATURDAY, SUNDAY -> {
        System.out.println("Processing weekend");
        yield "Weekend";
    }
    default -> "Unknown";
};
```
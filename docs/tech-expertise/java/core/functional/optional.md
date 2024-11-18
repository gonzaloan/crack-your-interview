---
sidebar_position: 4
title: "Optional API"
description: "Advanced Optional usage and patterns in Java"
---

# Java Optional

## Core Understanding
Optional is a container object that may or may not contain a non-null value. It helps avoid null pointer exceptions and provides a more functional approach to handling null values.

## Key Concepts

### Creation Methods
1. **Optional.empty()**
   ```java
   Optional<String> empty = Optional.empty();
   ```

2. **Optional.of()**
   ```java
   Optional<String> present = Optional.of("value"); // Throws NPE if null
   ```

3. **Optional.ofNullable()**
   ```java
   Optional<String> nullable = Optional.ofNullable(mayBeNullString);
   ```

### Common Operations
1. **Retrieving Values**
   ```java
   // Basic retrieving methods
   value.get()                    // Throws NoSuchElementException if empty
   value.orElse("default")       // Returns default if empty
   value.orElseGet(() -> "lazy") // Lazy default evaluation
   value.orElseThrow()           // Throws NoSuchElementException
   value.orElseThrow(CustomException::new) // Custom exception
   ```

2. **Transforming Values**
   ```java
   // Transformation methods
   value.map(String::toUpperCase)     // Transform value if present
   value.flatMap(this::findByName)    // Transform to another Optional
   value.filter(s -> s.length() > 5)  // Filter based on predicate
   ```

3. **Conditional Actions**
   ```java
   // Conditional operations
   value.ifPresent(System.out::println)    // Execute if present
   value.ifPresentOrElse(               // Execute with empty handler
       System.out::println,
       () -> System.out.println("Empty")
   )
   ```

### Important Features
1. **Stream Integration**
   ```java
   value.stream()  // Convert to Stream (0 or 1 element)
   ```

2. **Chaining Operations**
   ```java
   optional
       .map(...)
       .filter(...)
       .flatMap(...)
   ```

3. **Exception Handling**
   ```java
   optional.orElseThrow(() -> new CustomException("Not found"))
   ```

## Examples

### ❌ Bad Example
```java
public class UserService {
    private UserRepository repository;

    // Bad: Null checks everywhere
    public String getUserEmail(Long userId) {
        User user = repository.findById(userId);
        if (user != null) {
            Address address = user.getAddress();
            if (address != null) {
                return address.getEmail();
            }
        }
        return "default@email.com";
    }

    // Bad: Throwing exceptions for flow control
    public User getUser(Long id) {
        User user = repository.findById(id);
        if (user == null) {
            throw new UserNotFoundException("User not found");
        }
        return user;
    }

    // Bad: Nested null checks
    public String getUserCompany(Long userId) {
        User user = repository.findById(userId);
        if (user != null && user.getEmployment() != null 
            && user.getEmployment().getCompany() != null) {
            return user.getEmployment().getCompany().getName();
        }
        return "Unknown";
    }
}
```

**Why it's bad:**
- Verbose null checks
- Prone to NPE
- Hard to maintain
- Poor readability
- Exception for control flow

### ✅ Good Example
```java
public class UserService {
    private final UserRepository repository;

    public Optional<String> getUserEmail(Long userId) {
        return repository.findById(userId)
            .map(User::getAddress)
            .map(Address::getEmail);
    }

    public User getUser(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
    }

    public String getUserCompany(Long userId) {
        return repository.findById(userId)
            .map(User::getEmployment)
            .map(Employment::getCompany)
            .map(Company::getName)
            .orElse("Unknown");
    }

    public UserDTO getUserDetails(Long userId) {
        return repository.findById(userId)
            .map(user -> UserDTO.builder()
                .name(user.getName())
                .email(getUserEmail(user.getId()).orElse("N/A"))
                .company(getUserCompany(user.getId()))
                .build())
            .orElseThrow(() -> new UserNotFoundException(userId));
    }
}
```

**Why it's good:**
- Clean and readable
- Type-safe
- Functional approach
- Proper exception handling
- Chainable operations

## Best Practices

1. **Don't Use Optional as Method Parameter**
```java
// Bad
public void processUser(Optional<User> user)

// Good
public void processUser(User user)
```

2. **Use Optional for Return Types**
```java
public Optional<User> findUserByEmail(String email) {
    return Optional.ofNullable(
        repository.findByEmail(email)
    );
}
```

3. **Avoid Optional.get() Without Checks**
```java
// Bad
Optional<User> user = findUser(id);
User realUser = user.get(); // Might throw exception

// Good
User realUser = findUser(id)
    .orElseThrow(() -> new UserNotFoundException(id));
```

## Use Cases

1. **Repository Methods**
```java
public interface UserRepository {
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
}
```

2. **Service Layer Returns**
```java
public class UserService {
    public Optional<UserDTO> findActiveUser(Long id) {
        return repository.findById(id)
            .filter(User::isActive)
            .map(userMapper::toDTO);
    }
}
```

3. **Chained Operations**
```java
public class OrderService {
    public Optional<Double> calculateDiscount(Long userId) {
        return findUser(userId)
            .map(User::getMembership)
            .map(Membership::getLevel)
            .map(this::getDiscountForLevel);
    }
}
```

## Anti-patterns to Avoid

1. **Optional of Collections**
```java
// Bad
Optional<List<User>> users;

// Good
List<User> users = Collections.emptyList();
```

2. **Optional.isPresent() followed by get()**
```java
// Bad
if (optional.isPresent()) {
    doSomething(optional.get());
}

// Good
optional.ifPresent(this::doSomething);
```

3. **Nested Optionals**
```java
// Bad
Optional<Optional<String>> nested;

// Good
Optional<String> simple;
```

## Interview Questions

### Q1: "When should you use Optional.of() vs Optional.ofNullable()?"
**A**:
```java
public class OptionalUsage {
    // Use Optional.of() when you're certain the value is not null
    public Optional<User> getAuthenticatedUser() {
        User user = securityContext.getCurrentUser();
        return Optional.of(user); // Will throw NPE if user is null
    }

    // Use Optional.ofNullable() when the value might be null
    public Optional<String> getMiddleName(User user) {
        return Optional.ofNullable(user.getMiddleName());
    }
}
```

### Q2: "How do you handle Optional with streams?"
**A**:
```java
public class OptionalStreamHandler {
    public List<String> getValidEmails(List<User> users) {
        return users.stream()
            .map(User::getEmail)        // Stream<Optional<String>>
            .filter(Optional::isPresent) // Filter empty optionals
            .map(Optional::get)         // Get values
            .collect(Collectors.toList());

        // Or better, using flatMap
        return users.stream()
            .map(User::getEmail)
            .flatMap(Optional::stream)   // Flatten Optional to Stream
            .collect(Collectors.toList());
    }
}
```

### Q3: "How to avoid Optional abuse?"
**A**:
```java
public class OptionalUsageExample {
    // Bad - Optional as field
    private Optional<String> name; // Don't do this

    // Bad - Optional as parameter
    public void updateUser(Optional<String> name) {} // Don't do this

    // Good - Clear return type indicating possible absence
    public Optional<User> findUser(String email) {
        return repository.findByEmail(email);
    }

    // Good - Using Optional as a transformation chain
    public String getUserStatus(Long userId) {
        return findUser(userId)
            .map(User::getStatus)
            .map(Status::getName)
            .orElse("Unknown");
    }
}
```
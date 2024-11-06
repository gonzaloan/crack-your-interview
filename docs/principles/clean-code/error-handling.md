---
sidebar_position: 5
title: "Error Handling"
description: "Clean approaches to error handling and exception management"
---

# Clean Error Handling

## Principles
- Use exceptions for exceptional cases
- Don't return null
- Provide context in exceptions
- Create custom exceptions when needed
- Use try-with-resources

## Examples
```java
// Bad Error Handling
public User findUser(String id) {
    try {
        // Database operation
        return userDao.find(id);
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    }
}

// Good Error Handling
public Optional<User> findUser(String id) {
    try {
        return Optional.ofNullable(userRepository.findById(id));
    } catch (DatabaseException e) {
        logger.error("Database error while finding user: {}", id, e);
        throw new UserNotFoundException("User not found: " + id, e);
    }
}
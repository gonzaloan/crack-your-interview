---
sidebar_position: 3
title: "Data Structures"
description: "Data Structures"
---

# Understanding NoSQL Key-Value Data Structures

## 1. Introduction to Key-Value Data Structures 🔑

Key-value data structures form the foundation of modern NoSQL databases. Let's explore how these structures work and how they can be used effectively.

### Basic Structure

At its core, a key-value store works like an enormous hash table. Every piece of data is stored as a pair consisting of a unique key and its associated value. Think of it as a vast dictionary where you can look up values using their corresponding keys.

```javascript
// Basic key-value structure
{
    "user:1000": "John Doe",
    "email:john": "john@example.com",
    "session:abc123": "{\"user_id\": 1000, \"login_time\": \"2024-03-15T10:00:00Z\"}"
}
```

## 2. Core Data Structure Types 📊

### Simple Strings

Strings are the most basic but versatile data structure in key-value stores. They can hold various types of data:

```javascript
// Text data
SET greeting "Hello, World!"

// Numeric data (stored as string but can be incremented)
SET counter "42"
INCR counter    // Now 43

// Binary data (useful for images or files)
SET image:profile:1000 <binary_data>

// JSON strings (structured data in string form)
SET user:profile "{"name": "John", "age": 30}"
```

### Lists

Lists maintain an ordered sequence of elements. They're perfect for tasks like maintaining activity feeds, queues, or recent items:

```javascript
// Adding items to a list (from left)
LPUSH recent:articles "article:1001"    // Most recent first
LPUSH recent:articles "article:1002"
LPUSH recent:articles "article:1003"

// Reading the latest 5 articles
LRANGE recent:articles 0 4

// Using lists as a queue
LPUSH task:queue "send-email:user123"   // Add task
RPOP task:queue                         // Process next task
```

### Sets

Sets store unique, unordered collections of strings. They're excellent for tracking unique items or implementing relationships:

```javascript
// Adding members to a set
SADD user:123:permissions "read"
SADD user:123:permissions "write"
SADD user:123:permissions "delete"

// Checking permissions
SISMEMBER user:123:permissions "write"   // Returns 1 (true)

// Finding common permissions between users
SINTER user:123:permissions user:456:permissions

// Tracking unique visitors
SADD visitors:2024-03-15 "user:123"
SADD visitors:2024-03-15 "user:456"
SCARD visitors:2024-03-15               // Count unique visitors
```

### Sorted Sets

Sorted sets combine sets with a scoring mechanism, making them perfect for leaderboards, priority queues, or time-based data:

```javascript
// Adding scored items
ZADD leaderboard 1000 "player:123"
ZADD leaderboard 2000 "player:456"
ZADD leaderboard 1500 "player:789"

// Getting top players
ZREVRANGE leaderboard 0 2 WITHSCORES

// Using timestamps as scores for time-ordered data
ZADD user:activity 1710489600 "logged_in"
ZADD user:activity 1710493200 "posted_comment"
```

### Hashes

Hashes store field-value pairs under a single key, perfect for structured objects:

```javascript
// Creating a user profile
HSET user:profile:123 name "John Doe" 
                      email "john@example.com" 
                      age "30" 
                      city "New York"

// Reading specific fields
HGET user:profile:123 name
HMGET user:profile:123 name email

// Getting all fields and values
HGETALL user:profile:123

// Incrementing numeric fields
HINCRBY user:profile:123 login_count 1
```

## 3. Advanced Data Structure Patterns 🎯

### Composite Keys

Combining multiple identifiers in keys helps create logical groupings:

```javascript
// User-specific data with timestamps
SET user:123:login:2024-03-15 "logged_in_from_web"

// Product inventory by location
HSET inventory:warehouse1:product123 
     quantity 500
     min_threshold 100
     last_restocked "2024-03-15"

// Time-based analytics
INCR pageviews:page123:2024:03:15:10  // Hour-level tracking
```

### Secondary Indexes

Creating secondary access patterns through additional key structures:

```javascript
// Primary data
HSET user:123 name "John" email "john@example.com"

// Secondary index by email
SET email:john@example.com "user:123"

// Secondary index for search
SADD users:city:newyork "user:123"
SADD users:age:30 "user:123"
```

### Hierarchical Data

Representing hierarchical relationships effectively:

```javascript
// Department hierarchy
SADD org:dept:engineering:employees "user:123" "user:456"
SADD org:dept:engineering:teams "frontend" "backend"
SADD org:dept:engineering:team:frontend:members "user:123"
SADD org:dept:engineering:team:backend:members "user:456"
```

## 4. Implementation Patterns 🔨

### Caching Pattern

Using key-value stores as a caching layer:

```javascript
// Function to get user data with cache
async function getUserData(userId) {
    // Try cache first
    const cacheKey = `user:${userId}:data`
    let userData = await redis.get(cacheKey)
    
    if (userData) {
        return JSON.parse(userData)
    }
    
    // Cache miss - get from database
    userData = await database.getUserById(userId)
    
    // Store in cache with expiration
    await redis.setex(cacheKey, 3600, JSON.stringify(userData))
    
    return userData
}
```

### Session Management

Handling user sessions efficiently:

```javascript
// Create new session
async function createSession(userId, sessionData) {
    const sessionId = generateUniqueId()
    const sessionKey = `session:${sessionId}`
    
    await redis.hset(sessionKey, {
        userId,
        data: JSON.stringify(sessionData),
        createdAt: Date.now()
    })
    
    await redis.expire(sessionKey, 86400)  // 24 hours
    
    return sessionId
}

// Validate session
async function validateSession(sessionId) {
    const sessionKey = `session:${sessionId}`
    const session = await redis.hgetall(sessionKey)
    
    if (!session.userId) {
        return null
    }
    
    // Extend session timeout
    await redis.expire(sessionKey, 86400)
    
    return {
        userId: session.userId,
        data: JSON.parse(session.data)
    }
}
```

### Rate Limiting

Implementing rate limiting using key-value structures:

```javascript
// Rate limiting implementation
async function checkRateLimit(userId, limit = 100, window = 3600) {
    const key = `ratelimit:${userId}`
    
    // Get current count
    let count = await redis.get(key)
    
    if (!count) {
        // First request
        await redis.setex(key, window, 1)
        return true
    }
    
    count = parseInt(count)
    
    if (count >= limit) {
        return false
    }
    
    // Increment counter
    await redis.incr(key)
    return true
}
```

## 5. Design Considerations 🎨

### Key Design

Keys should be designed with these principles in mind:

1. Meaningful and consistent naming
2. Appropriate level of granularity
3. Efficient for pattern matching
4. Consideration for key expiry

Example key naming patterns:

```javascript
// Object type-based
user:{id}
order:{id}
product:{id}

// Action or event-based
login:{userId}:{timestamp}
purchase:{orderId}:{timestamp}

// Time-based
pageviews:{date}:{hour}
events:{year}:{month}:{day}

// Location or hierarchy-based
inventory:{warehouse}:{product}
org:{department}:{team}:{employee}
```

### Memory Management

Strategies for efficient memory usage:

```javascript
// Using smaller data structures
HSET user:compact username "john" email "john@example.com"  // Better than separate keys

// Setting expiration for temporary data
SETEX cache:user:123 3600 "user_data"  // Expires in 1 hour

// Using sorted sets for time-based cleanup
ZADD events:timestamps 1710489600 "event:123"
ZREMRANGEBYSCORE events:timestamps -inf 1710403200  // Remove old events
```

## References 📚

1. Official Documentation
- Redis Data Types
- Memcached Documentation
- DynamoDB Data Types

2. Best Practices
- Key-Value Design Patterns
- Memory Optimization
- Performance Guidelines

3. Tools and Resources
- Redis CLI
- Memcached Tools
- Key-Value Monitoring Tools

4. Community Resources
- Stack Overflow
- Redis University
- NoSQL Forums
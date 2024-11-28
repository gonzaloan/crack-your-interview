---
sidebar_position: 1
title: "Redis Fundamentals"
description: "Redis Fundamentals"
---
# Redis Fundamentals: Key-Value Store Deep Dive

## 1. Core Concepts 📝

Redis (Remote Dictionary Server) is an open-source, in-memory data structure store that can be used as a database, cache, message broker, and queue. Let's explore its fundamental concepts through practical examples.

### Data Structures

Redis supports multiple data structures. Here's how each one works:

```bash
# Strings - Most basic data type
SET user:1:name "John Doe"
GET user:1:name                 # Returns: "John Doe"

# Numbers are also stored as strings but can be incremented
SET user:1:score 10
INCR user:1:score              # Returns: 11
INCRBY user:1:score 5          # Returns: 16

# Lists - Ordered collection of strings
LPUSH user:1:tasks "Send email"
LPUSH user:1:tasks "Review code"
LPUSH user:1:tasks "Update docs"
LRANGE user:1:tasks 0 -1       # Returns all tasks from start to end

# Sets - Unordered collection of unique strings
SADD user:1:skills "python"
SADD user:1:skills "javascript" "python"  # Won't add duplicate "python"
SMEMBERS user:1:skills         # Returns all skills

# Sorted Sets - Sets with scores for ordering
ZADD leaderboard 100 "player1"
ZADD leaderboard 200 "player2"
ZADD leaderboard 150 "player3"
ZRANGE leaderboard 0 -1 WITHSCORES  # Returns players sorted by score

# Hashes - Maps of field-value pairs
HSET user:1 name "John Doe" age "30" city "New York"
HGET user:1 name              # Returns: "John Doe"
HGETALL user:1               # Returns all fields and values
```

### Time-To-Live (TTL)

Redis supports automatic key expiration, perfect for caching:

```bash
# Set key with expiration in seconds
SET session:123 "user_data" EX 3600    # Expires in 1 hour

# Check remaining time
TTL session:123                        # Returns seconds remaining

# Remove expiration
PERSIST session:123                    # Key will not expire

# Set expiration on existing key
EXPIRE session:123 1800               # Set to expire in 30 minutes
```

## 2. Advanced Operations 🔄

### Transactions

Redis transactions allow executing multiple commands in a single step:

```bash
# Start transaction
MULTI

# Queue commands
SET user:2:name "Jane Smith"
HSET user:2 email "jane@example.com" age "28"
SADD active:users "user:2"

# Execute transaction
EXEC

# Transaction with conditions
WATCH user:2:name              # Watch for changes
MULTI
SET user:2:name "Jane Doe"     # Only executes if user:2:name hasn't changed
EXEC
```

### Pub/Sub Messaging

Redis can act as a message broker using publish/subscribe:

```bash
# In subscriber terminal
SUBSCRIBE news:tech            # Subscribe to tech news channel

# In publisher terminal
PUBLISH news:tech "New Redis version released!"

# Pattern-based subscription
PSUBSCRIBE news:*             # Subscribe to all news channels

# Multiple channel subscription
SUBSCRIBE news:tech news:science
```

## 3. Data Persistence 💾

Redis offers different persistence options:

```bash
# RDB Snapshot
SAVE                          # Synchronous save
BGSAVE                        # Asynchronous save

# Append-only file configuration
CONFIG SET appendonly yes     # Enable AOF
CONFIG SET appendfsync always # Sync after every command

# Hybrid persistence
CONFIG SET aof-use-rdb-preamble yes
```

## 4. Real-World Use Cases 🌐

### Caching Layer

```bash
# Function to get user data with cache
def get_user_data(user_id):
    # Check cache first
    cache_key = f"user:{user_id}:data"
    
    # Try to get from cache
    cached_data = redis.get(cache_key)
    if cached_data:
        return json.loads(cached_data)
    
    # If not in cache, get from database
    user_data = database.get_user(user_id)
    
    # Store in cache with expiration
    redis.setex(
        cache_key,
        3600,  # 1 hour expiration
        json.dumps(user_data)
    )
    
    return user_data
```

### Rate Limiting

```bash
# Rate limiting implementation
def is_rate_limited(user_id, limit=10, window=60):
    key = f"ratelimit:{user_id}"
    
    # Get current count
    current = redis.get(key)
    
    if not current:
        # First request
        redis.setex(key, window, 1)
        return False
    
    if int(current) >= limit:
        # Rate limit exceeded
        return True
    
    # Increment counter
    redis.incr(key)
    return False
```

### Session Storage

```bash
# Session management
def create_session(user_id, data):
    session_id = generate_session_id()
    
    # Store session with expiration
    redis.hset(f"session:{session_id}", mapping={
        'user_id': user_id,
        'created_at': datetime.now().isoformat(),
        'data': json.dumps(data)
    })
    
    # Set expiration (24 hours)
    redis.expire(f"session:{session_id}", 86400)
    
    return session_id

def get_session(session_id):
    session_data = redis.hgetall(f"session:{session_id}")
    if not session_data:
        return None
    
    session_data['data'] = json.loads(session_data['data'])
    return session_data
```

### Leaderboard System

```bash
# Leaderboard implementation
def update_score(user_id, score):
    redis.zadd('leaderboard', {user_id: score})

def get_top_players(limit=10):
    return redis.zrevrange(
        'leaderboard',
        0,
        limit-1,
        withscores=True
    )

def get_user_rank(user_id):
    rank = redis.zrevrank('leaderboard', user_id)
    return rank + 1 if rank is not None else None
```

## 5. Performance Optimization 🚀

### Pipelining

Pipelining reduces network roundtrips:

```bash
# Without pipelining
for i in range(100):
    redis.set(f"key:{i}", f"value:{i}")

# With pipelining
with redis.pipeline() as pipe:
    for i in range(100):
        pipe.set(f"key:{i}", f"value:{i}")
    pipe.execute()
```

### Memory Optimization

```bash
# Memory usage commands
MEMORY USAGE key              # Check memory used by key
MEMORY DOCTOR                 # Get memory usage reports

# Using smaller data structures
HSET user:compact username "john" \  # More efficient than separate keys
                  email "john@example.com" \
                  age "30"

# Key expiration strategies
SETEX cache:key 3600 "value"  # Set with expiration
```

## 6. Monitoring and Maintenance 🔧

### Monitoring Commands

```bash
# Server information
INFO                         # Get server statistics
INFO memory                  # Memory-specific information
INFO clients                 # Connected client information

# Slow log analysis
SLOWLOG GET 10              # Get last 10 slow commands
SLOWLOG RESET               # Reset slow log

# Client connections
CLIENT LIST                 # List connected clients
CLIENT KILL                 # Kill client connections
```

### Backup and Recovery

```bash
# Manual backup
SAVE                        # Synchronous save to disk
BGSAVE                      # Asynchronous save to disk

# Replication setup
SLAVEOF master-host 6379    # Set up as replica
SLAVEOF NO ONE             # Promote to master

# Persistence configuration
CONFIG SET save "900 1 300 10"  # Save after 900s if 1 key changed
                               # or 300s if 10 keys changed
```

## References 📚

1. Official Documentation
- Redis Commands Reference
- Redis Administration Guide
- Redis Security Guide

2. Best Practices
- Redis Memory Optimization
- Redis Persistence Guide
- High Availability Patterns

3. Tools
- Redis CLI
- Redis Desktop Manager
- Redis Insight

4. Community Resources
- Redis University
- Redis Forums
- Stack Overflow Redis Tag
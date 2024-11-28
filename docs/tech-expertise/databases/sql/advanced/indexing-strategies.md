---
sidebar_position: 2
title: "Indexing Strategies"
description: "Indexing Strategies"
---

# 📑 SQL: Indexing Strategies

## 1. Overview and Problem Statement 📋

Database indexing is crucial for optimizing query performance by providing fast data access paths. Proper indexing strategies can dramatically improve query execution times while balancing maintenance overhead and storage costs.

### Business Value
- Faster query response times
- Reduced server load
- Improved application scalability
- Lower infrastructure costs
- Better user experience
- Efficient data retrieval

## 2. Types of Indexes 🏗️

### B-Tree Indexes
- Default index type
- Balanced tree structure
- Optimal for equality and range queries
- Supports sorting operations

### Hash Indexes
- Perfect for equality comparisons
- Not suitable for range queries
- Faster than B-tree for exact matches
- Cannot support sorting or partial matches

### Bitmap Indexes
- Efficient for low-cardinality columns
- Good for data warehouse environments
- Excellent for AND/OR operations
- Space-efficient for specific use cases

### Specialized Indexes
- GiST (Generalized Search Tree)
- SP-GiST (Space-Partitioned GiST)
- GIN (Generalized Inverted Index)
- BRIN (Block Range INdex)

## 3. Technical Implementation 💻

### Basic Index Creation

```sql
-- Simple index
CREATE INDEX idx_customers_email 
ON customers(email);

-- Unique index
CREATE UNIQUE INDEX idx_users_username 
ON users(username);

-- Composite index
CREATE INDEX idx_orders_customer_date 
ON orders(customer_id, order_date DESC);

-- Partial index
CREATE INDEX idx_orders_status 
ON orders(status) 
WHERE status IN ('PENDING', 'PROCESSING');

-- Covering index
CREATE INDEX idx_products_category 
ON products(category_id) 
INCLUDE (name, price);
```

### Index Organization

#### Index Column Order
```sql
-- Good: Most selective column first
CREATE INDEX idx_employees_dept_salary 
ON employees(department_id, salary);

-- Query examples that can use this index:
SELECT * FROM employees WHERE department_id = 5;
SELECT * FROM employees WHERE department_id = 5 AND salary > 50000;
```

#### Functional Indexes
```sql
-- Index for case-insensitive searches
CREATE INDEX idx_users_email_lower 
ON users(LOWER(email));

-- Index for date truncation
CREATE INDEX idx_orders_date_trunc 
ON orders(DATE_TRUNC('day', created_at));
```

## 4. Performance Considerations 📊

### Index Analysis

```sql
-- Check index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan < 50  -- Identify unused indexes
ORDER BY idx_scan DESC;

-- Analyze query execution plan
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM orders 
WHERE customer_id = 1000 
AND order_date >= '2024-01-01';
```

### Index Maintenance

```sql
-- Rebuild fragmented indexes
REINDEX INDEX idx_orders_customer_date;

-- Update statistics
ANALYZE orders;

-- Monitor index size
SELECT 
    pg_size_pretty(pg_total_relation_size(indexname::regclass)) as index_size,
    indexname
FROM pg_indexes
WHERE tablename = 'orders'
ORDER BY pg_total_relation_size(indexname::regclass) DESC;
```

## 5. Anti-Patterns 🚫

### Common Mistakes

1. Over-Indexing
   Wrong:
```sql
-- Redundant indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_status ON users(email, status);
CREATE INDEX idx_users_email_created ON users(email, created_at);
```

Correct:
```sql
-- Single composite index
CREATE INDEX idx_users_email_status_created 
ON users(email, status, created_at);
```

2. Function-Based Column Usage
   Wrong:
```sql
SELECT * FROM users WHERE LOWER(email) = 'john@example.com';
-- Regular index on email won't be used
```

Correct:
```sql
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'john@example.com';
```

## 6. Best Practices & Guidelines 📚

### Index Design Principles

1. Column Selection
```sql
-- Consider query patterns
CREATE INDEX idx_orders_search 
ON orders(customer_id, status, order_date DESC)
INCLUDE (total_amount);

-- Supports queries like:
SELECT total_amount 
FROM orders 
WHERE customer_id = 1 
AND status = 'COMPLETED' 
ORDER BY order_date DESC;
```

2. Partial Indexes
```sql
-- Index only relevant data
CREATE INDEX idx_active_users 
ON users(last_login) 
WHERE active = true;

-- Index recent orders
CREATE INDEX idx_recent_orders 
ON orders(order_date, customer_id) 
WHERE order_date >= CURRENT_DATE - INTERVAL '3 months';
```

## 7. Real-world Examples 🌐

### E-commerce Platform Indexing

```sql
-- Orders table indexing strategy
CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    order_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL
);

-- Primary search patterns
CREATE INDEX idx_orders_customer 
ON orders(customer_id, order_date DESC);

-- Status monitoring
CREATE INDEX idx_orders_status 
ON orders(status, order_date DESC);

-- Financial reporting
CREATE INDEX idx_orders_date_amount 
ON orders(order_date, total_amount)
WHERE status = 'COMPLETED';

-- Recent order processing
CREATE INDEX idx_orders_processing 
ON orders(order_date DESC) 
WHERE status IN ('PENDING', 'PROCESSING');
```

### User Activity Tracking

```sql
-- User sessions table
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL,
    started_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT
);

-- Active session lookup
CREATE INDEX idx_sessions_user_active 
ON user_sessions(user_id, last_activity DESC)
WHERE last_activity >= CURRENT_TIMESTAMP - INTERVAL '24 hours';

-- Security monitoring
CREATE INDEX idx_sessions_ip 
ON user_sessions(ip_address, started_at DESC)
WHERE last_activity >= CURRENT_TIMESTAMP - INTERVAL '1 hour';
```

## 8. Monitoring and Maintenance 🔧

### Index Health Checks

```sql
-- Check for unused indexes
WITH index_usage AS (
    SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        pg_size_pretty(pg_relation_size(quote_ident(schemaname) || '.' || 
            quote_ident(indexname)::regclass)) as index_size
    FROM pg_stat_user_indexes
)
SELECT *
FROM index_usage
WHERE idx_scan = 0
AND indexname NOT LIKE 'pk_%'
ORDER BY pg_relation_size(quote_ident(schemaname) || '.' || 
    quote_ident(indexname)::regclass) DESC;

-- Check for duplicate indexes
SELECT 
    ind.indexname,
    ind.indexdef
FROM pg_indexes ind
JOIN pg_indexes ind2 
    ON ind.tablename = ind2.tablename
    AND ind.indexname <> ind2.indexname
    AND ind.indexdef LIKE '%' || 
        split_part(split_part(ind2.indexdef, '(', 2), ')', 1) || '%'
WHERE ind.schemaname = 'public';
```

## 9. References and Additional Resources 📚

1. Documentation
- PostgreSQL Indexing Strategies
- MySQL Index Best Practices
- Oracle Index Design Guidelines

2. Books
- SQL Performance Explained
- Database Indexing Strategies

3. Tools
- pg_stat_statements
- pgHero
- Index Advisor Tools

4. Community Resources
- Database Administrators Stack Exchange
- PostgreSQL Performance Mailing List
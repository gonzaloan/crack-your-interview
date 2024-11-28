---
sidebar_position: 3
title: "Performance Tuning"
description: "Performance Tuning"
---

# 🚀 SQL: Performance Tuning

## 1. Overview and Problem Statement 📋

SQL performance tuning is the process of optimizing SQL queries and database configuration to achieve maximum efficiency and throughput. This involves analyzing and improving query execution plans, optimizing database design, and configuring system resources.

### Business Value
- Reduced query response times
- Improved application performance
- Lower infrastructure costs
- Better resource utilization
- Enhanced user experience
- Increased system throughput

## 2. Performance Analysis Tools 🔍

### EXPLAIN ANALYZE
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM orders 
WHERE customer_id = 1000 
AND order_date >= '2024-01-01';
```

### Query Statistics
```sql
-- PostgreSQL query statistics
SELECT 
    queryid,
    calls,
    total_exec_time / 1000 as total_exec_secs,
    mean_exec_time / 1000 as mean_exec_secs,
    rows / calls as avg_rows,
    query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

## 3. Query Optimization Techniques 💡

### Join Optimization
Before:
```sql
SELECT o.*, c.name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
WHERE c.status = 'ACTIVE'
AND o.order_date >= '2024-01-01';
```

After:
```sql
SELECT o.*, c.name
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
WHERE c.status = 'ACTIVE'
AND o.order_date >= '2024-01-01';
```

### Subquery Optimization
Before:
```sql
SELECT 
    product_id,
    name,
    (SELECT COUNT(*) 
     FROM order_items oi 
     WHERE oi.product_id = p.product_id) as order_count
FROM products p;
```

After:
```sql
SELECT 
    p.product_id,
    p.name,
    COUNT(oi.order_id) as order_count
FROM products p
LEFT JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.name;
```

### IN Clause Optimization
Before:
```sql
SELECT * FROM orders
WHERE customer_id IN (
    SELECT customer_id 
    FROM customers 
    WHERE status = 'VIP'
);
```

After:
```sql
SELECT o.* 
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE c.status = 'VIP';
```

## 4. Index Optimization 📑

### Strategic Index Creation
```sql
-- Composite index for common query pattern
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date DESC);

-- Partial index for active records
CREATE INDEX idx_active_users ON users(last_login)
WHERE status = 'ACTIVE';

-- Covering index to avoid table lookups
CREATE INDEX idx_products_search 
ON products(category_id, status)
INCLUDE (name, price);
```

### Index Usage Analysis
```sql
-- Find unused indexes
SELECT 
    schemaname || '.' || tablename as table_name,
    indexname as index_name,
    idx_scan as number_of_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(schemaname || '.' || indexname::regclass)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname NOT IN ('pg_catalog', 'pg_toast')
ORDER BY pg_relation_size(schemaname || '.' || indexname::regclass) DESC;
```

## 5. Data Model Optimization 🏗️

### Table Partitioning
```sql
-- Range partitioning for orders
CREATE TABLE orders (
    order_id BIGINT,
    order_date DATE,
    customer_id INTEGER,
    total_amount DECIMAL(10,2)
) PARTITION BY RANGE (order_date);

-- Create partitions
CREATE TABLE orders_2024_q1 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE orders_2024_q2 PARTITION OF orders
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
```

### Materialized Views
```sql
-- Create materialized view for expensive calculations
CREATE MATERIALIZED VIEW mv_daily_sales AS
SELECT 
    DATE_TRUNC('day', order_date) as sale_date,
    COUNT(*) as order_count,
    SUM(total_amount) as total_sales,
    AVG(total_amount) as avg_order_value
FROM orders
WHERE status = 'COMPLETED'
GROUP BY DATE_TRUNC('day', order_date)
WITH DATA;

-- Create index on materialized view
CREATE INDEX idx_mv_daily_sales_date ON mv_daily_sales(sale_date);

-- Refresh materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales;
```

## 6. Query Pattern Optimization 📝

### Batch Processing
```sql
-- Process records in batches
DO $$
DECLARE
    batch_size INTEGER := 1000;
    total_processed INTEGER := 0;
    batch_count INTEGER := 0;
BEGIN
    LOOP
        WITH batch AS (
            SELECT order_id
            FROM orders
            WHERE status = 'PENDING'
            ORDER BY order_id
            LIMIT batch_size
            FOR UPDATE SKIP LOCKED
        )
        UPDATE orders o
        SET status = 'PROCESSING'
        FROM batch b
        WHERE o.order_id = b.order_id;
        
        GET DIAGNOSTICS batch_count = ROW_COUNT;
        
        EXIT WHEN batch_count = 0;
        
        total_processed := total_processed + batch_count;
        COMMIT;
    END LOOP;
END $$;
```

### Pagination Optimization
Before:
```sql
SELECT * FROM products
ORDER BY created_at DESC
LIMIT 20 OFFSET 10000;
```

After:
```sql
-- Using keyset pagination
SELECT p.*
FROM products p
WHERE (created_at, product_id) < (
    SELECT created_at, product_id
    FROM products
    WHERE product_id = :last_seen_id
)
ORDER BY created_at DESC, product_id DESC
LIMIT 20;
```

## 7. Configuration Optimization ⚙️

### PostgreSQL Configuration Parameters
```sql
-- Memory settings
shared_buffers = '4GB'
work_mem = '16MB'
maintenance_work_mem = '256MB'
effective_cache_size = '12GB'

-- Query planner settings
random_page_cost = 1.1
effective_io_concurrency = 200
default_statistics_target = 100

-- Write performance
wal_buffers = '16MB'
checkpoint_completion_target = 0.9
max_wal_size = '2GB'
```

### Autovacuum Settings
```sql
-- Autovacuum configuration
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05
autovacuum_vacuum_cost_delay = 2
autovacuum_vacuum_cost_limit = 200
```

## 8. Monitoring and Maintenance 📊

### Performance Monitoring
```sql
-- Table bloat check
WITH constants AS (
    SELECT current_setting('block_size')::numeric AS bs,
           23 AS hdr,
           8 AS ma
),
no_stats AS (
    SELECT table_schema, table_name, 
           n_live_tup::numeric as est_rows,
           pg_table_size(relid)::numeric as table_size
    FROM information_schema.columns
        JOIN pg_stat_user_tables as psut
           ON table_schema = psut.schemaname
           AND table_name = psut.relname
        LEFT OUTER JOIN pg_stats
        ON table_schema = pg_stats.schemaname
            AND table_name = pg_stats.tablename
            AND column_name = attname 
    WHERE attname IS NULL
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
    GROUP BY table_schema, table_name, relid, n_live_tup
),
null_headers AS (
    SELECT
        hdr+1+(sum(case when null_frac <> 0 THEN 1 else 0 END)/8) as nullhdr,
        SUM((1-null_frac)*avg_width) as datawidth,
        MAX(null_frac) as maxfracsum,
        schemaname,
        tablename,
        hdr
    FROM pg_stats CROSS JOIN constants
        LEFT OUTER JOIN pg_class c ON pg_stats.tablename = c.relname
    GROUP BY schemaname, tablename, hdr
)
SELECT 
    format('%.2f MB',
           pg_total_relation_size(format('%I.%I', schemaname, tablename)::regclass)::numeric/1024/1024) as table_size,
    format('%.2f MB',
           bloat_size::numeric /1024/1024) as bloat_size,
    format('%.2f%%', bloat_ratio::numeric) as bloat_ratio,
    schemaname as schema,
    tablename as table
FROM (
    SELECT *,
           CASE WHEN avg_width = 0 OR avg_width IS NULL THEN 0
                ELSE (bs-page_hdr)*page_count::numeric END as null_data_size,
           CASE WHEN avg_width = 0 OR avg_width IS NULL THEN 0
                ELSE (bs-page_hdr)*page_count::numeric - actual_size END as bloat_size,
           CASE WHEN avg_width = 0 OR avg_width IS NULL OR actual_size = 0 THEN 0
                ELSE round(100 * ((bs-page_hdr)*page_count::numeric - actual_size)::numeric / actual_size) END as bloat_ratio
    FROM (
        SELECT 
            maxfracsum*(n_live_tup/est_rows) as null_frac,
            avg_width, schemaname, tablename, bs,
            CASE WHEN avg_width IS NOT NULL
                 THEN (1-null_frac)*avg_width
                 ELSE 0 END as avgwidth_actual,
            CASE WHEN avg_width IS NOT NULL
                 THEN bs-page_hdr-nullhdr
                 ELSE 0 END as no_nulls_actual_width,
            page_hdr, nullhdr, est_rows, n_live_tup,
            round(reltuples) as est_rows_roundup,
            ceil(reltuples/ceil((bs-page_hdr-nullhdr)::numeric / 
                 (CASE WHEN avg_width IS NOT NULL
                       THEN (1-null_frac)*avg_width
                       ELSE 0 END + 4))) as est_pages_ff,
            ceil(est_rows_roundup/ceil((bs-page_hdr-nullhdr)::numeric / 
                (CASE WHEN avg_width IS NOT NULL
                      THEN (1-null_frac)*avg_width
                      ELSE 0 END + 4))) as est_pages_roundup,
            relpages as page_count,
            bs*(relpages)::numeric as total_bytes,
            bs*(relpages-est_pages_ff)::numeric as bloat_size,
            100*(relpages-est_pages_ff)::numeric/relpages as bloat_ratio
            FROM (
                SELECT schemaname, tablename, bs, n_live_tup,
                       reltuples::numeric as reltuples, relpages,
                       COALESCE(null_frac, 0) as null_frac,
                       avg_width, page_hdr, nullhdr
                FROM null_headers nh
                     JOIN pg_class c ON nh.tablename = c.relname
                     LEFT JOIN no_stats ns ON ns.table_schema = nh.schemaname
                          AND ns.table_name = nh.tablename
            ) as foo
    ) as bar
) as baz
WHERE bloat_ratio >= 30
ORDER BY bloat_size DESC
LIMIT 10;

-- Lock monitoring
SELECT 
    pid,
    usename,
    pg_blocking_pids(pid) as blocked_by,
    query as blocked_query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;

-- Cache hit ratio
SELECT 
    sum(heap_blks_read) as heap_read,
    sum(heap_blks_hit)  as heap_hit,
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))::float as ratio
FROM pg_statio_user_tables;
```

## 9. Real-world Optimization Examples 🌐

### E-commerce Query Optimization

```sql
-- Before: Slow product search
SELECT p.*, 
       c.name as category_name,
       (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.product_id) as times_ordered,
       (SELECT AVG(r.rating) FROM product_reviews r WHERE r.product_id = p.product_id) as avg_rating
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
WHERE p.price BETWEEN 10 AND 100
AND p.status = 'ACTIVE'
ORDER BY times_ordered DESC
LIMIT 20;

-- After: Optimized query with materialized data
CREATE MATERIALIZED VIEW mv_product_stats AS
SELECT 
    product_id,
    COUNT(*) as times_ordered,
    COUNT(DISTINCT order_id) as unique_orders
FROM order_items
GROUP BY product_id;

CREATE MATERIALIZED VIEW mv_product_ratings AS
SELECT 
    product_id,
    AVG(rating) as avg_rating,
    COUNT(*) as review_count
FROM product_reviews
GROUP BY product_id;

-- Optimized query
SELECT 
    p.*,
    c.name as category_name,
    COALESCE(ps.times_ordered, 0) as times_ordered,
    COALESCE(pr.avg_rating, 0) as avg_rating
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN mv_product_stats ps ON p.product_id = ps.product_id
LEFT JOIN mv_product_ratings pr ON p.product_id = pr.product_id
WHERE p.price BETWEEN 10 AND 100
AND p.status = 'ACTIVE'
ORDER BY ps.times_ordered DESC NULLS LAST
LIMIT 20;
```

## 10. References and Additional Resources 📚

1. Documentation
- PostgreSQL Performance Optimization
- MySQL Query Optimization
- Oracle Performance Tuning Guide

2. Books
- SQL Performance Explained
- High Performance MySQL
- PostgreSQL High Performance

3. Tools
- pg_stat_statements
- pgBadger
- MySQL Performance Schema
- Slow Query Log Analyzer

4. Community Resources
- Database Administrators Stack Exchange
- PostgreSQL Performance Mailing List
- MySQL Performance Blog

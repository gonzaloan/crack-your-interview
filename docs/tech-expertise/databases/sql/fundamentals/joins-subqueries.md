---
sidebar_position: 2
title: "Joins / Subqueries"
description: "Joins / Subqueries"
---

# 🔄 SQL: Joins, Subqueries, and Common Table Expressions (CTEs)

## 1. Overview and Problem Statement 📋

SQL Joins, Subqueries, and CTEs are essential tools for combining and manipulating data across multiple tables or derived result sets. They solve complex data retrieval and analysis challenges in relational databases.

### Business Value
- Complex data analysis capabilities
- Efficient data relationships handling
- Improved query readability and maintenance
- Enhanced data integrity
- Optimized query performance

## 2. Detailed Solution/Architecture 🏗️

### Join Types
1. INNER JOIN: Returns matching records from both tables
2. LEFT JOIN: Returns all records from left table and matching from right
3. RIGHT JOIN: Returns all records from right table and matching from left
4. FULL OUTER JOIN: Returns all records from both tables
5. CROSS JOIN: Returns Cartesian product of both tables

### Subquery Types
1. Scalar Subqueries: Return single value
2. Row Subqueries: Return single row
3. Table Subqueries: Return result set
4. Correlated Subqueries: Reference outer query

### CTE Characteristics
1. Named temporary result sets
2. Recursive capabilities
3. Multiple CTEs in single query
4. Improved readability

## 3. Technical Implementation 💻

### Sample Database Schema
```sql
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10,2)
);

CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

CREATE TABLE order_items (
    item_id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10,2)
);
```

### Join Examples

#### Basic INNER JOIN
**Purpose:** Retrieve orders with customer information

**Dependencies:** orders and customers tables

**Expected Outcome:** Combined order and customer data

```sql
SELECT 
    o.order_id,
    c.name AS customer_name,
    o.order_date,
    o.total_amount
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id;
```

#### Multiple Joins
**Purpose:** Get complete order details with items and customer info

**Expected Outcome:** Detailed order information

```sql
SELECT 
    o.order_id,
    c.name AS customer_name,
    oi.product_id,
    oi.quantity,
    oi.price
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id;
```

### Subquery Examples

#### Scalar Subquery
**Purpose:** Find orders above average amount

**Expected Outcome:** List of high-value orders

```sql
SELECT order_id, total_amount
FROM orders
WHERE total_amount > (
    SELECT AVG(total_amount)
    FROM orders
);
```

#### Correlated Subquery
**Purpose:** Find customers' latest orders

**Expected Outcome:** Most recent order for each customer

```sql
SELECT *
FROM orders o1
WHERE order_date = (
    SELECT MAX(order_date)
    FROM orders o2
    WHERE o2.customer_id = o1.customer_id
);
```

### CTE Examples

#### Basic CTE
**Purpose:** Calculate customer order statistics

**Expected Outcome:** Customer ordering patterns

```sql
WITH CustomerStats AS (
    SELECT 
        customer_id,
        COUNT(*) as order_count,
        SUM(total_amount) as total_spent
    FROM orders
    GROUP BY customer_id
)
SELECT 
    c.name,
    cs.order_count,
    cs.total_spent
FROM CustomerStats cs
JOIN customers c ON cs.customer_id = c.customer_id;
```

#### Recursive CTE
**Purpose:** Generate date series

**Expected Outcome:** Continuous date range

```sql
WITH RECURSIVE DateSeries AS (
    SELECT CAST('2024-01-01' AS DATE) AS date
    UNION ALL
    SELECT date + INTERVAL 1 DAY
    FROM DateSeries
    WHERE date < '2024-12-31'
)
SELECT date
FROM DateSeries;
```

## 4. Anti-Patterns 🚫

### Join Anti-Patterns

1. Implicit Joins
   Wrong:
```sql
SELECT o.order_id, c.name
FROM orders o, customers c
WHERE o.customer_id = c.customer_id;
```

Correct:
```sql
SELECT o.order_id, c.name
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id;
```

2. Missing Join Conditions
   Wrong:
```sql
SELECT *
FROM orders o
LEFT JOIN order_items oi;  -- Missing ON clause!
```

### Subquery Anti-Patterns

1. Unnecessary Subqueries
   Wrong:
```sql
SELECT *
FROM orders
WHERE customer_id IN (
    SELECT customer_id
    FROM customers
    WHERE customer_id > 100
);
```

Correct:
```sql
SELECT o.*
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE c.customer_id > 100;
```

## 5. Performance Metrics & Optimization 📊

### Join Optimization
1. Use appropriate indexes
2. Join order matters
3. Minimize number of joins
4. Use appropriate join types

```sql
-- Create indexes for join columns
CREATE INDEX idx_customer_id ON orders(customer_id);
CREATE INDEX idx_order_id ON order_items(order_id);
```

### Subquery Optimization
1. Consider replacing with joins
2. Use EXISTS for row existence checks
3. Minimize correlated subqueries
4. Index subquery predicates

## 6. Best Practices & Guidelines 📚

### Join Best Practices
1. Always use explicit join syntax
2. Specify join conditions clearly
3. Use table aliases
4. Consider index usage
5. Minimize number of joined tables

### Subquery Best Practices
1. Use meaningful aliases
2. Consider performance implications
3. Use CTEs for complex queries
4. Proper indentation for readability

### CTE Best Practices
1. Use meaningful names
2. Break complex logic into steps
3. Consider materialization
4. Document recursive CTEs

## 7. Real-world Use Cases 🌐

### Sales Analysis
```sql
WITH MonthlyStats AS (
    SELECT 
        DATE_TRUNC('month', order_date) AS month,
        SUM(total_amount) as revenue,
        COUNT(DISTINCT customer_id) as unique_customers
    FROM orders
    GROUP BY DATE_TRUNC('month', order_date)
),
CustomerSegments AS (
    SELECT 
        customer_id,
        CASE 
            WHEN SUM(total_amount) > 1000 THEN 'High Value'
            WHEN SUM(total_amount) > 500 THEN 'Medium Value'
            ELSE 'Low Value'
        END as segment
    FROM orders
    GROUP BY customer_id
)
SELECT 
    ms.month,
    ms.revenue,
    ms.unique_customers,
    COUNT(cs.customer_id) as high_value_customers
FROM MonthlyStats ms
LEFT JOIN orders o ON DATE_TRUNC('month', o.order_date) = ms.month
LEFT JOIN CustomerSegments cs ON o.customer_id = cs.customer_id
WHERE cs.segment = 'High Value'
GROUP BY ms.month, ms.revenue, ms.unique_customers
ORDER BY ms.month;
```

### Hierarchical Data
```sql
WITH RECURSIVE EmployeeHierarchy AS (
    -- Base case: top-level employees
    SELECT 
        employee_id,
        manager_id,
        name,
        1 as level
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case: employees with managers
    SELECT 
        e.employee_id,
        e.manager_id,
        e.name,
        eh.level + 1
    FROM employees e
    JOIN EmployeeHierarchy eh ON e.manager_id = eh.employee_id
)
SELECT 
    REPEAT('  ', level - 1) || name as org_chart
FROM EmployeeHierarchy
ORDER BY level, name;
```

## 8. References and Additional Resources 📚

1. Official Documentation
- PostgreSQL Joins Documentation
- MySQL Subquery Optimization
- SQL Server CTE Guide

2. Books
- SQL Antipatterns by Bill Karwin
- SQL Performance Explained by Markus Winand

3. Online Resources
- Modern SQL Window Functions
- PostgreSQL CTE Documentation
- Use The Index, Luke!

4. Community Resources
- Database Administrators Stack Exchange
- PostgreSQL Performance Mailing List
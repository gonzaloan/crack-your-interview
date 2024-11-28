---
sidebar_position: 3
title: "Functions & Procedures"
description: "Functions & Procedures"
---

# 🛠️ SQL: Functions and Stored Procedures

## 1. Overview and Problem Statement 📋

SQL Functions and Stored Procedures are database objects that encapsulate reusable business logic and complex operations within the database layer. They provide modularity, security, and improved performance for database operations.

### Business Value
- Code reusability
- Enhanced security through encapsulation
- Reduced network traffic
- Consistent business logic implementation
- Improved maintenance and versioning
- Better performance for complex operations

## 2. Detailed Solution/Architecture 🏗️

### Function Types
1. Scalar Functions: Return single value
2. Table-Valued Functions: Return result set
3. Aggregate Functions: Operate on sets of values
4. User-Defined Functions (UDFs)

### Stored Procedure Types
1. Regular Procedures: Execute series of statements
2. Parameterized Procedures: Accept input parameters
3. Output Parameter Procedures: Return multiple values
4. Result Set Procedures: Return result sets

## 3. Technical Implementation 💻

### Function Examples

#### Scalar Function
**Purpose:** Calculate age from birthdate

**Dependencies:** None

**Expected Outcome:** Age in years

```sql
CREATE OR REPLACE FUNCTION calculate_age(birthdate DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM age(current_date, birthdate));
END;
$$ LANGUAGE plpgsql;

-- Usage
SELECT calculate_age('1990-05-15');
```

#### Table-Valued Function
**Purpose:** Get customer orders within date range

**Expected Outcome:** Order details for specified period

```sql
CREATE OR REPLACE FUNCTION get_customer_orders(
    p_customer_id INTEGER,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    order_id INTEGER,
    order_date DATE,
    total_amount DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.order_id,
        o.order_date,
        o.total_amount
    FROM orders o
    WHERE o.customer_id = p_customer_id
    AND o.order_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Usage
SELECT * FROM get_customer_orders(101, '2024-01-01', '2024-12-31');
```

### Stored Procedure Examples

#### Basic Procedure
**Purpose:** Create new customer

**Expected Outcome:** New customer record created

```sql
CREATE OR REPLACE PROCEDURE create_customer(
    p_name VARCHAR(100),
    p_email VARCHAR(100),
    p_phone VARCHAR(20)
)
AS $$
BEGIN
    INSERT INTO customers (name, email, phone)
    VALUES (p_name, p_email, p_phone);
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
$$ LANGUAGE plpgsql;

-- Usage
CALL create_customer('John Doe', 'john@example.com', '555-0123');
```

#### Output Parameter Procedure
**Purpose:** Process order and return order ID

**Expected Outcome:** Create order and return its ID

```sql
CREATE OR REPLACE PROCEDURE process_order(
    p_customer_id INTEGER,
    p_amount DECIMAL,
    INOUT p_order_id INTEGER
)
AS $$
BEGIN
    INSERT INTO orders (customer_id, total_amount, order_date)
    VALUES (p_customer_id, p_amount, CURRENT_DATE)
    RETURNING order_id INTO p_order_id;
    
    -- Update customer statistics
    UPDATE customer_stats
    SET total_orders = total_orders + 1,
        total_spent = total_spent + p_amount
    WHERE customer_id = p_customer_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
$$ LANGUAGE plpgsql;

-- Usage
DO $$
DECLARE
    v_order_id INTEGER;
BEGIN
    CALL process_order(101, 99.99, v_order_id);
    RAISE NOTICE 'Created order ID: %', v_order_id;
END $$;
```

## 4. Anti-Patterns 🚫

### Function Anti-Patterns

1. Side Effects in Functions
   Wrong:
```sql
CREATE FUNCTION update_and_return(p_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
    UPDATE some_table SET status = 'PROCESSED'
    WHERE id = p_id;  -- Side effect!
    RETURN p_id;
END;
$$ LANGUAGE plpgsql;
```

Correct:
```sql
CREATE PROCEDURE update_status(p_id INTEGER) AS $$
BEGIN
    UPDATE some_table SET status = 'PROCESSED'
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
```

2. Non-Deterministic Functions
   Wrong:
```sql
CREATE FUNCTION get_random_status()
RETURNS VARCHAR AS $$
BEGIN
    RETURN CASE WHEN RANDOM() > 0.5 THEN 'ACTIVE' ELSE 'INACTIVE' END;
END;
$$ LANGUAGE plpgsql;
```

### Procedure Anti-Patterns

1. Excessive Logic in Procedures
   Wrong:
```sql
CREATE PROCEDURE do_everything() AS $$
BEGIN
    -- Hundreds of lines of business logic
    -- Mixed concerns
    -- No modularity
END;
$$ LANGUAGE plpgsql;
```

Correct:
```sql
CREATE PROCEDURE process_order_workflow() AS $$
BEGIN
    CALL validate_order();
    CALL calculate_totals();
    CALL apply_discounts();
    CALL update_inventory();
END;
$$ LANGUAGE plpgsql;
```

## 5. Best Practices & Guidelines 📚

### Function Best Practices
1. Keep functions pure (no side effects)
2. Use appropriate return types
3. Handle NULL values properly
4. Document parameters and return values
5. Use schema qualification

### Procedure Best Practices
1. Use transactions appropriately
2. Implement error handling
3. Follow naming conventions
4. Modularize complex logic
5. Validate input parameters

### Error Handling Example
```sql
CREATE OR REPLACE PROCEDURE safe_update_customer(
    p_customer_id INTEGER,
    p_name VARCHAR,
    p_email VARCHAR
)
AS $$
BEGIN
    -- Input validation
    IF p_customer_id IS NULL OR p_name IS NULL THEN
        RAISE EXCEPTION 'Invalid input parameters';
    END IF;

    -- Start transaction
    BEGIN
        UPDATE customers
        SET name = p_name,
            email = p_email,
            updated_at = CURRENT_TIMESTAMP
        WHERE customer_id = p_customer_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Customer ID % not found', p_customer_id;
        END IF;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;
END;
$$ LANGUAGE plpgsql;
```

## 6. Performance Optimization 📊

### Function Optimization
1. Use IMMUTABLE/STABLE when applicable
2. Minimize database calls
3. Use appropriate variable types
4. Consider inlining for simple functions

```sql
CREATE OR REPLACE FUNCTION get_customer_status(p_customer_id INTEGER)
RETURNS VARCHAR
STABLE  -- Optimization hint
AS $$
BEGIN
    RETURN (
        SELECT status
        FROM customers
        WHERE customer_id = p_customer_id
    );
END;
$$ LANGUAGE plpgsql;
```

### Procedure Optimization
1. Use SET NOCOUNT ON (SQL Server)
2. Minimize transaction scope
3. Use appropriate isolation levels
4. Consider batch processing

## 7. Real-world Use Cases 🌐

### Order Processing System
```sql
CREATE OR REPLACE PROCEDURE process_order_complete(
    p_customer_id INTEGER,
    p_items JSON,
    INOUT p_order_id INTEGER
)
AS $$
DECLARE
    v_total_amount DECIMAL(10,2) := 0;
    v_item JSON;
BEGIN
    -- Create order header
    INSERT INTO orders (customer_id, order_date, status)
    VALUES (p_customer_id, CURRENT_DATE, 'PENDING')
    RETURNING order_id INTO p_order_id;
    
    -- Process items
    FOR v_item IN SELECT * FROM json_array_elements(p_items)
    LOOP
        -- Insert order item
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            price
        )
        VALUES (
            p_order_id,
            (v_item->>'product_id')::INTEGER,
            (v_item->>'quantity')::INTEGER,
            (v_item->>'price')::DECIMAL
        );
        
        -- Update total
        v_total_amount := v_total_amount + 
            ((v_item->>'quantity')::INTEGER * (v_item->>'price')::DECIMAL);
    END LOOP;
    
    -- Update order total
    UPDATE orders
    SET total_amount = v_total_amount,
        status = 'CONFIRMED'
    WHERE order_id = p_order_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
$$ LANGUAGE plpgsql;
```

### Reporting Functions
```sql
CREATE OR REPLACE FUNCTION generate_sales_report(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    year_month VARCHAR,
    total_sales DECIMAL(12,2),
    order_count INTEGER,
    avg_order_value DECIMAL(10,2),
    top_product VARCHAR,
    top_customer VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_stats AS (
        SELECT
            TO_CHAR(order_date, 'YYYY-MM') as year_month,
            SUM(total_amount) as total_sales,
            COUNT(*) as order_count,
            AVG(total_amount) as avg_order_value
        FROM orders
        WHERE order_date BETWEEN p_start_date AND p_end_date
        GROUP BY TO_CHAR(order_date, 'YYYY-MM')
    ),
    top_products AS (
        SELECT
            TO_CHAR(o.order_date, 'YYYY-MM') as year_month,
            p.name as product_name,
            ROW_NUMBER() OVER (
                PARTITION BY TO_CHAR(o.order_date, 'YYYY-MM')
                ORDER BY SUM(oi.quantity * oi.price) DESC
            ) as rn
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE o.order_date BETWEEN p_start_date AND p_end_date
        GROUP BY TO_CHAR(o.order_date, 'YYYY-MM'), p.name
    ),
    top_customers AS (
        SELECT
            TO_CHAR(o.order_date, 'YYYY-MM') as year_month,
            c.name as customer_name,
            ROW_NUMBER() OVER (
                PARTITION BY TO_CHAR(o.order_date, 'YYYY-MM')
                ORDER BY SUM(o.total_amount) DESC
            ) as rn
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        WHERE o.order_date BETWEEN p_start_date AND p_end_date
        GROUP BY TO_CHAR(o.order_date, 'YYYY-MM'), c.name
    )
    SELECT
        ms.year_month,
        ms.total_sales,
        ms.order_count,
        ms.avg_order_value,
        tp.product_name,
        tc.customer_name
    FROM monthly_stats ms
    LEFT JOIN top_products tp ON ms.year_month = tp.year_month AND tp.rn = 1
    LEFT JOIN top_customers tc ON ms.year_month = tc.year_month AND tc.rn = 1
    ORDER BY ms.year_month;
END;
$$ LANGUAGE plpgsql;
```

## 8. References and Additional Resources 📚

1. Official Documentation
- PostgreSQL PL/pgSQL Functions
- MySQL Stored Procedures
- Oracle PL/SQL Guide

2. Books
- PostgreSQL Server Programming
- Oracle PL/SQL Programming by Steven Feuerstein

3. Performance Resources
- PostgreSQL Function Performance
- SQL Server Stored Procedure Optimization

4. Community Resources
- Database Administrators Stack Exchange
- PostgreSQL Procedure Examples
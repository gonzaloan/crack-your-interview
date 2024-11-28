---
sidebar_position: 2
title: "Advanced Concepts"
description: "Advanced Concepts"
---

# 🎓 PL/SQL: Advanced Concepts

## 1. Dynamic SQL 🔄

### Native Dynamic SQL (NDS)
```sql
DECLARE
    v_sql VARCHAR2(4000);
    v_department_id NUMBER := 10;
    v_result SYS_REFCURSOR;
BEGIN
    -- Basic dynamic SQL
    v_sql := 'SELECT * FROM employees WHERE department_id = :1';
    
    EXECUTE IMMEDIATE v_sql 
    INTO v_result
    USING v_department_id;
END;
/

-- Dynamic DDL execution
CREATE OR REPLACE PROCEDURE create_dynamic_table(
    p_table_name IN VARCHAR2,
    p_columns IN VARCHAR2
) IS
    v_sql VARCHAR2(4000);
BEGIN
    v_sql := 'CREATE TABLE ' || DBMS_ASSERT.SIMPLE_SQL_NAME(p_table_name) || 
             ' (' || p_columns || ')';
             
    EXECUTE IMMEDIATE v_sql;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        RAISE;
END;
/
```

### DBMS_SQL Package
```sql
CREATE OR REPLACE PROCEDURE dynamic_query(
    p_table_name IN VARCHAR2,
    p_where_clause IN VARCHAR2 DEFAULT NULL
) IS
    v_cursor NUMBER;
    v_columns DBMS_SQL.DESC_TAB;
    v_col_cnt NUMBER;
    v_sql VARCHAR2(4000);
    v_column_value VARCHAR2(4000);
    v_rows_processed NUMBER;
BEGIN
    -- Open cursor
    v_cursor := DBMS_SQL.OPEN_CURSOR;
    
    -- Prepare SQL
    v_sql := 'SELECT * FROM ' || DBMS_ASSERT.SIMPLE_SQL_NAME(p_table_name);
    IF p_where_clause IS NOT NULL THEN
        v_sql := v_sql || ' WHERE ' || p_where_clause;
    END IF;
    
    -- Parse and describe
    DBMS_SQL.PARSE(v_cursor, v_sql, DBMS_SQL.NATIVE);
    DBMS_SQL.DESCRIBE_COLUMNS(v_cursor, v_col_cnt, v_columns);
    
    -- Define columns
    FOR i IN 1..v_col_cnt LOOP
        DBMS_SQL.DEFINE_COLUMN(v_cursor, i, v_column_value, 4000);
    END LOOP;
    
    -- Execute and fetch
    v_rows_processed := DBMS_SQL.EXECUTE(v_cursor);
    
    WHILE DBMS_SQL.FETCH_ROWS(v_cursor) > 0 LOOP
        FOR i IN 1..v_col_cnt LOOP
            DBMS_SQL.COLUMN_VALUE(v_cursor, i, v_column_value);
            DBMS_OUTPUT.PUT_LINE(v_columns(i).col_name || ': ' || v_column_value);
        END LOOP;
        DBMS_OUTPUT.PUT_LINE('---');
    END LOOP;
    
    DBMS_SQL.CLOSE_CURSOR(v_cursor);
EXCEPTION
    WHEN OTHERS THEN
        IF DBMS_SQL.IS_OPEN(v_cursor) THEN
            DBMS_SQL.CLOSE_CURSOR(v_cursor);
        END IF;
        RAISE;
END;
/
```

## 2. Advanced Package Concepts 📦

### Package with State Management
```sql
CREATE OR REPLACE PACKAGE stateful_pkg IS
    -- Public variables
    g_last_execution_time TIMESTAMP;
    
    -- Public procedures
    PROCEDURE initialize;
    PROCEDURE process_data(p_data_id NUMBER);
    FUNCTION get_execution_count RETURN NUMBER;
    
    -- Public constants
    c_max_retries CONSTANT NUMBER := 3;
END stateful_pkg;
/

CREATE OR REPLACE PACKAGE BODY stateful_pkg IS
    -- Private variables
    v_execution_count NUMBER := 0;
    v_initialized BOOLEAN := FALSE;
    
    -- Private procedures
    PROCEDURE log_execution IS
    BEGIN
        v_execution_count := v_execution_count + 1;
        g_last_execution_time := SYSTIMESTAMP;
    END;
    
    -- Public procedure implementations
    PROCEDURE initialize IS
    BEGIN
        v_execution_count := 0;
        v_initialized := TRUE;
        g_last_execution_time := SYSTIMESTAMP;
    END;
    
    PROCEDURE process_data(p_data_id NUMBER) IS
    BEGIN
        IF NOT v_initialized THEN
            RAISE_APPLICATION_ERROR(-20001, 'Package not initialized');
        END IF;
        
        -- Process data
        log_execution;
    END;
    
    FUNCTION get_execution_count RETURN NUMBER IS
    BEGIN
        RETURN v_execution_count;
    END;
END stateful_pkg;
/
```

## 3. Object-Oriented PL/SQL 🎯

### Object Types and Methods
```sql
-- Create object type
CREATE OR REPLACE TYPE employee_typ AS OBJECT (
    employee_id NUMBER,
    first_name VARCHAR2(50),
    last_name VARCHAR2(50),
    salary NUMBER,
    
    -- Member function
    MEMBER FUNCTION get_annual_salary RETURN NUMBER,
    
    -- Member procedure
    MEMBER PROCEDURE give_raise(p_percent NUMBER),
    
    -- Static function
    STATIC FUNCTION validate_salary(p_salary NUMBER) RETURN BOOLEAN
);
/

-- Create type body
CREATE OR REPLACE TYPE BODY employee_typ AS
    MEMBER FUNCTION get_annual_salary RETURN NUMBER IS
    BEGIN
        RETURN salary * 12;
    END;
    
    MEMBER PROCEDURE give_raise(p_percent NUMBER) IS
    BEGIN
        salary := salary * (1 + p_percent/100);
    END;
    
    STATIC FUNCTION validate_salary(p_salary NUMBER) RETURN BOOLEAN IS
    BEGIN
        RETURN p_salary BETWEEN 0 AND 1000000;
    END;
END;
/

-- Usage example
DECLARE
    v_emp employee_typ;
BEGIN
    v_emp := employee_typ(1, 'John', 'Doe', 5000);
    
    -- Call member function
    DBMS_OUTPUT.PUT_LINE('Annual salary: ' || v_emp.get_annual_salary());
    
    -- Call member procedure
    v_emp.give_raise(10);
    
    -- Call static function
    IF employee_typ.validate_salary(v_emp.salary) THEN
        DBMS_OUTPUT.PUT_LINE('Valid salary');
    END IF;
END;
/
```

## 4. Advanced Collections 📚

### Nested Tables with Objects
```sql
-- Create nested table type
CREATE OR REPLACE TYPE address_typ AS OBJECT (
    street VARCHAR2(100),
    city VARCHAR2(50),
    postal_code VARCHAR2(10)
);
/

CREATE OR REPLACE TYPE address_list_typ AS TABLE OF address_typ;
/

CREATE TABLE customers (
    customer_id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    addresses address_list_typ
)
NESTED TABLE addresses STORE AS customer_addresses_tab;

-- Insert with nested table
INSERT INTO customers VALUES (
    1,
    'John Doe',
    address_list_typ(
        address_typ('123 Main St', 'New York', '10001'),
        address_typ('456 Park Ave', 'Boston', '02101')
    )
);

-- Query nested table
SELECT c.name, a.*
FROM customers c,
TABLE(c.addresses) a
WHERE c.customer_id = 1;
```

## 5. Advanced Error Handling 🚨

### Custom Exception Handling Framework
```sql
CREATE OR REPLACE PACKAGE error_handling_pkg IS
    -- Custom exception types
    e_business_rule_violation EXCEPTION;
    e_data_validation_error EXCEPTION;
    
    -- Error codes
    PRAGMA EXCEPTION_INIT(e_business_rule_violation, -20001);
    PRAGMA EXCEPTION_INIT(e_data_validation_error, -20002);
    
    -- Error handling procedures
    PROCEDURE log_error(
        p_error_code IN NUMBER,
        p_error_message IN VARCHAR2,
        p_procedure_name IN VARCHAR2,
        p_additional_info IN VARCHAR2 DEFAULT NULL
    );
    
    PROCEDURE raise_business_error(
        p_error_message IN VARCHAR2,
        p_procedure_name IN VARCHAR2
    );
END error_handling_pkg;
/

CREATE OR REPLACE PACKAGE BODY error_handling_pkg IS
    PROCEDURE log_error(
        p_error_code IN NUMBER,
        p_error_message IN VARCHAR2,
        p_procedure_name IN VARCHAR2,
        p_additional_info IN VARCHAR2 DEFAULT NULL
    ) IS
        PRAGMA AUTONOMOUS_TRANSACTION;
    BEGIN
        INSERT INTO error_log (
            error_code,
            error_message,
            procedure_name,
            additional_info,
            created_at,
            created_by
        ) VALUES (
            p_error_code,
            p_error_message,
            p_procedure_name,
            p_additional_info,
            SYSTIMESTAMP,
            USER
        );
        
        COMMIT;
    END;
    
    PROCEDURE raise_business_error(
        p_error_message IN VARCHAR2,
        p_procedure_name IN VARCHAR2
    ) IS
    BEGIN
        log_error(
            -20001,
            p_error_message,
            p_procedure_name
        );
        
        RAISE_APPLICATION_ERROR(
            -20001,
            p_error_message
        );
    END;
END error_handling_pkg;
/
```

## 6. Advanced Performance Concepts ⚡

### Bulk Processing
```sql
CREATE OR REPLACE PROCEDURE process_bulk_data(
    p_batch_size IN NUMBER DEFAULT 1000
) IS
    TYPE t_id_array IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    TYPE t_name_array IS TABLE OF VARCHAR2(100) INDEX BY PLS_INTEGER;
    
    v_ids t_id_array;
    v_names t_name_array;
    v_processed NUMBER := 0;
    
    CURSOR c_data IS 
        SELECT customer_id, name 
        FROM customers 
        WHERE processed_flag = 'N';
BEGIN
    LOOP
        -- Bulk collect
        FETCH c_data 
        BULK COLLECT INTO v_ids, v_names
        LIMIT p_batch_size;
        
        EXIT WHEN v_ids.COUNT = 0;
        
        -- Bulk process
        FORALL i IN 1..v_ids.COUNT
            UPDATE customer_processed
            SET 
                processed_date = SYSDATE,
                processed_name = v_names(i)
            WHERE customer_id = v_ids(i);
        
        -- Bulk update source
        FORALL i IN 1..v_ids.COUNT
            UPDATE customers
            SET processed_flag = 'Y'
            WHERE customer_id = v_ids(i);
            
        v_processed := v_processed + v_ids.COUNT;
        COMMIT;
        
        -- Exit if no more rows
        EXIT WHEN v_ids.COUNT < p_batch_size;
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('Processed ' || v_processed || ' records');
END;
/
```

## 7. Real-world Examples 🌐

### Data Archival System
```sql
CREATE OR REPLACE PACKAGE archive_pkg IS
    -- Types for archival
    TYPE t_archive_config IS RECORD (
        source_table VARCHAR2(30),
        archive_table VARCHAR2(30),
        partition_column VARCHAR2(30),
        archive_condition VARCHAR2(1000),
        retention_months NUMBER
    );
    
    TYPE t_archive_config_list IS TABLE OF t_archive_config;
    
    -- Main procedures
    PROCEDURE initialize_archival;
    PROCEDURE execute_archival(p_config_id NUMBER);
    PROCEDURE cleanup_archives;
    
    -- Monitoring procedures
    PROCEDURE log_archival_status(
        p_config_id NUMBER,
        p_status VARCHAR2,
        p_rows_archived NUMBER,
        p_error_message VARCHAR2 DEFAULT NULL
    );
END archive_pkg;
/

CREATE OR REPLACE PACKAGE BODY archive_pkg IS
    -- Private variables
    v_archive_configs t_archive_config_list;
    
    -- Private procedures
    PROCEDURE load_configurations IS
        -- Implementation
    END;
    
    PROCEDURE validate_configuration(
        p_config t_archive_config
    ) IS
        -- Implementation
    END;
    
    PROCEDURE archive_partition(
        p_config t_archive_config,
        p_partition_key VARCHAR2
    ) IS
        -- Implementation
    END;
    
    -- Public procedure implementations
    PROCEDURE initialize_archival IS
    BEGIN
        load_configurations;
        -- Additional initialization
    END;
    
    PROCEDURE execute_archival(p_config_id NUMBER) IS
        v_config t_archive_config;
        v_sql VARCHAR2(4000);
        v_rows_archived NUMBER := 0;
    BEGIN
        -- Get configuration
        SELECT * INTO v_config
        FROM archive_configurations
        WHERE config_id = p_config_id;
        
        -- Validate configuration
        validate_configuration(v_config);
        
        -- Build dynamic SQL
        v_sql := 'INSERT INTO ' || v_config.archive_table || 
                 ' SELECT * FROM ' || v_config.source_table ||
                 ' WHERE ' || v_config.archive_condition;
                 
        -- Execute archival
        EXECUTE IMMEDIATE v_sql;
        
        -- Log results
        v_rows_archived := SQL%ROWCOUNT;
        log_archival_status(
            p_config_id,
            'SUCCESS',
            v_rows_archived
        );
        
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            log_archival_status(
                p_config_id,
                'ERROR',
                0,
                SQLERRM
            );
            ROLLBACK;
            RAISE;
    END;
END archive_pkg;
/
```

## 8. Best Practices & Guidelines 📚

1. Performance Optimization
```sql
-- Use BULK COLLECT and FORALL
-- Minimize context switches
-- Use appropriate collection types
-- Handle memory efficiently
```

2. Error Handling
```sql
-- Implement consistent error handling
-- Use custom exception framework
-- Log errors appropriately
-- Include error context
```

3. Security
```sql
-- Use bind variables
-- Implement proper authorization
-- Validate input parameters
-- Avoid SQL injection vulnerabilities
```

## 9. References 📖

1. Official Documentation
- Oracle PL/SQL Language Reference
- Oracle Advanced PL/SQL Developer's Guide
- Oracle Performance Tuning Guide

2. Books
- Oracle PL/SQL Programming by Steven Feuerstein
- Expert Oracle PL/SQL
- Oracle Database 19c Advanced PL/SQL

3. Online Resources
- Oracle Developer Community
- AskTOM
- Oracle Learning Library

4. Performance Tools
- DBMS_PROFILER
- DBMS_HPROF
- DBMS_APPLICATION_INFO
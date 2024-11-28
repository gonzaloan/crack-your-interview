---
sidebar_position: 1
title: "PLSQL Basics"
description: "PLSQL Basics"
---

# 📘 PL/SQL: Programming Language Basics

## 1. Overview and Problem Statement 📋

PL/SQL (Procedural Language/SQL) extends SQL with procedural programming capabilities. It provides a robust programming environment within the database, enabling complex business logic implementation, data validation, and process automation.

### Business Value
- Reduced network traffic
- Enhanced security through encapsulation
- Better performance for complex operations
- Consistent business logic implementation
- Code reusability
- Maintainable database applications

## 2. PL/SQL Block Structure 🏗️

### Basic Block Syntax
```sql
DECLARE
    -- Declaration section (optional)
    variable_name datatype;
BEGIN
    -- Executable section (required)
    statements;
EXCEPTION
    -- Exception handling section (optional)
    WHEN exception_name THEN
        handler_statements;
END;
/
```

### Variables and Constants
```sql
DECLARE
    -- Variable declarations
    v_employee_id NUMBER(6);
    v_hire_date DATE := SYSDATE;
    v_department_name VARCHAR2(30) NOT NULL := 'Sales';
    
    -- Constant declaration
    c_tax_rate CONSTANT NUMBER := 0.15;
    
    -- Record type
    TYPE employee_record IS RECORD (
        emp_id NUMBER,
        name VARCHAR2(100),
        salary NUMBER
    );
    
    -- Record variable
    v_emp_rec employee_record;
BEGIN
    v_employee_id := 100;
    v_emp_rec.emp_id := v_employee_id;
    v_emp_rec.name := 'John Doe';
    v_emp_rec.salary := 5000;
END;
/
```

## 3. Control Structures 🔄

### IF Statements
```sql
DECLARE
    v_grade CHAR(1);
    v_score NUMBER := 85;
BEGIN
    IF v_score >= 90 THEN
        v_grade := 'A';
    ELSIF v_score >= 80 THEN
        v_grade := 'B';
    ELSIF v_score >= 70 THEN
        v_grade := 'C';
    ELSE
        v_grade := 'F';
    END IF;
    
    DBMS_OUTPUT.PUT_LINE('Grade: ' || v_grade);
END;
/
```

### CASE Statements
```sql
DECLARE
    v_department_id NUMBER := 10;
    v_department_name VARCHAR2(30);
BEGIN
    v_department_name := 
        CASE v_department_id
            WHEN 10 THEN 'Finance'
            WHEN 20 THEN 'Sales'
            WHEN 30 THEN 'IT'
            ELSE 'Unknown Department'
        END;
    
    DBMS_OUTPUT.PUT_LINE('Department: ' || v_department_name);
END;
/
```

### Loops
```sql
-- Basic LOOP
DECLARE
    v_counter NUMBER := 1;
BEGIN
    LOOP
        DBMS_OUTPUT.PUT_LINE('Counter: ' || v_counter);
        v_counter := v_counter + 1;
        EXIT WHEN v_counter > 5;
    END LOOP;
END;
/

-- FOR LOOP
BEGIN
    FOR i IN 1..5 LOOP
        DBMS_OUTPUT.PUT_LINE('Iteration: ' || i);
    END LOOP;
END;
/

-- WHILE LOOP
DECLARE
    v_counter NUMBER := 1;
BEGIN
    WHILE v_counter <= 5 LOOP
        DBMS_OUTPUT.PUT_LINE('Counter: ' || v_counter);
        v_counter := v_counter + 1;
    END LOOP;
END;
/
```

## 4. Exception Handling 🚨

### Built-in Exceptions
```sql
DECLARE
    v_result NUMBER;
BEGIN
    -- This will raise a ZERO_DIVIDE exception
    v_result := 100/0;
    
EXCEPTION
    WHEN ZERO_DIVIDE THEN
        DBMS_OUTPUT.PUT_LINE('Cannot divide by zero!');
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No data found!');
    WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('Multiple rows found!');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('An error occurred: ' || SQLERRM);
END;
/
```

### User-defined Exceptions
```sql
DECLARE
    e_invalid_salary EXCEPTION;
    v_salary NUMBER := -100;
BEGIN
    IF v_salary < 0 THEN
        RAISE e_invalid_salary;
    END IF;
    
EXCEPTION
    WHEN e_invalid_salary THEN
        DBMS_OUTPUT.PUT_LINE('Salary cannot be negative!');
END;
/
```

## 5. Cursors 📑

### Implicit Cursors
```sql
BEGIN
    UPDATE employees
    SET salary = salary * 1.1
    WHERE department_id = 20;
    
    IF SQL%FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Number of rows updated: ' || SQL%ROWCOUNT);
    ELSE
        DBMS_OUTPUT.PUT_LINE('No rows updated');
    END IF;
END;
/
```

### Explicit Cursors
```sql
DECLARE
    CURSOR emp_cursor IS
        SELECT employee_id, first_name, salary
        FROM employees
        WHERE department_id = 20;
    
    v_emp_record emp_cursor%ROWTYPE;
BEGIN
    OPEN emp_cursor;
    
    LOOP
        FETCH emp_cursor INTO v_emp_record;
        EXIT WHEN emp_cursor%NOTFOUND;
        
        DBMS_OUTPUT.PUT_LINE(
            'Employee: ' || v_emp_record.first_name ||
            ', Salary: ' || v_emp_record.salary
        );
    END LOOP;
    
    CLOSE emp_cursor;
END;
/
```

### Cursor FOR Loop
```sql
DECLARE
    CURSOR dept_cursor IS
        SELECT department_id, department_name
        FROM departments
        WHERE location_id = 1700;
BEGIN
    FOR dept_rec IN dept_cursor LOOP
        DBMS_OUTPUT.PUT_LINE(
            'Department: ' || dept_rec.department_name
        );
    END LOOP;
END;
/
```

## 6. Collections 📚

### Associative Arrays (Index-By Tables)
```sql
DECLARE
    TYPE salary_table_type IS TABLE OF NUMBER
        INDEX BY PLS_INTEGER;
    
    v_salary_table salary_table_type;
BEGIN
    -- Populate array
    v_salary_table(1) := 1000;
    v_salary_table(2) := 2000;
    v_salary_table(3) := 3000;
    
    -- Access elements
    FOR i IN 1..3 LOOP
        DBMS_OUTPUT.PUT_LINE(
            'Salary ' || i || ': ' || v_salary_table(i)
        );
    END LOOP;
END;
/
```

### Nested Tables
```sql
DECLARE
    TYPE name_list_type IS TABLE OF VARCHAR2(50);
    v_names name_list_type;
BEGIN
    v_names := name_list_type('John', 'Jane', 'Bob');
    
    FOR i IN 1..v_names.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE('Name: ' || v_names(i));
    END LOOP;
END;
/
```

## 7. Real-world Examples 🌐

### Employee Salary Management
```sql
CREATE OR REPLACE PROCEDURE process_salary_increase(
    p_department_id IN NUMBER,
    p_increase_percent IN NUMBER,
    p_max_increase IN NUMBER DEFAULT 5000
) IS
    v_total_increases NUMBER := 0;
    v_employees_updated NUMBER := 0;
    e_budget_exceeded EXCEPTION;
    
    CURSOR emp_cursor IS
        SELECT employee_id, salary
        FROM employees
        WHERE department_id = p_department_id
        FOR UPDATE;
BEGIN
    -- Validate input
    IF p_increase_percent <= 0 OR p_increase_percent > 50 THEN
        RAISE_APPLICATION_ERROR(
            -20001,
            'Invalid increase percentage. Must be between 0 and 50.'
        );
    END IF;
    
    -- Process increases
    FOR emp_rec IN emp_cursor LOOP
        DECLARE
            v_increase_amount NUMBER;
        BEGIN
            -- Calculate increase
            v_increase_amount := LEAST(
                emp_rec.salary * (p_increase_percent/100),
                p_max_increase
            );
            
            -- Update salary
            UPDATE employees
            SET salary = salary + v_increase_amount
            WHERE CURRENT OF emp_cursor;
            
            -- Track totals
            v_total_increases := v_total_increases + v_increase_amount;
            v_employees_updated := v_employees_updated + 1;
            
            -- Check budget
            IF v_total_increases > 1000000 THEN
                RAISE e_budget_exceeded;
            END IF;
        END;
    END LOOP;
    
    -- Log results
    INSERT INTO salary_adjustment_log (
        department_id,
        adjustment_date,
        total_amount,
        employees_affected
    ) VALUES (
        p_department_id,
        SYSDATE,
        v_total_increases,
        v_employees_updated
    );
    
    COMMIT;
    
EXCEPTION
    WHEN e_budget_exceeded THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(
            -20002,
            'Budget exceeded. Total increases cannot exceed $1,000,000'
        );
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/
```

## 8. Best Practices 📝

1. Code Organization
```sql
-- Use consistent formatting and indentation
-- Organize code into logical blocks
DECLARE
    -- Constants first
    c_max_salary CONSTANT NUMBER := 100000;
    
    -- Variables grouped by purpose
    -- Employee information
    v_employee_id NUMBER;
    v_first_name VARCHAR2(50);
    v_last_name VARCHAR2(50);
    
    -- Salary calculations
    v_current_salary NUMBER;
    v_new_salary NUMBER;
    v_increase_amount NUMBER;
BEGIN
    -- Initialize variables
    -- Perform calculations
    -- Handle results
EXCEPTION
    -- Handle specific exceptions first
    WHEN NO_DATA_FOUND THEN
        -- Handle exception
    WHEN OTHERS THEN
        -- Handle all other exceptions
END;
/
```

2. Naming Conventions
```sql
-- Prefix variables with v_
-- Prefix constants with c_
-- Prefix parameters with p_
-- Use meaningful names
CREATE OR REPLACE PROCEDURE update_employee_salary(
    p_employee_id IN NUMBER,
    p_new_salary IN NUMBER,
    p_effective_date IN DATE DEFAULT SYSDATE
) IS
    v_old_salary NUMBER;
    c_max_increase CONSTANT NUMBER := 5000;
    e_invalid_increase EXCEPTION;
BEGIN
    -- Procedure body
END;
/
```

## 9. References and Resources 📚

1. Official Documentation
- Oracle PL/SQL Language Reference
- Oracle PL/SQL Packages and Types Reference
- Oracle Database Development Guide

2. Books
- Oracle PL/SQL Programming by Steven Feuerstein
- Oracle Database 19c PL/SQL Advanced Programming
- Murach's Oracle SQL and PL/SQL

3. Online Resources
- Oracle Live SQL
- Oracle Developer Community
- PL/SQL Best Practices on Oracle Technology Network

4. Community Resources
- Oracle Forums
- Stack Overflow PL/SQL Tag
- Oracle ACE Program Resources
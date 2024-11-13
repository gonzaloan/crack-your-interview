---
sidebar_position: 3
title: "Monolithic App"
description: "Clean Architecture Examples - Monolithic App"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🏛️ Clean Architecture in Monolithic Applications

## Overview

Clean Architecture in a monolithic application is an architectural pattern that organizes code into concentric circles, representing different layers of the application, with dependencies pointing inward. Each layer is independent of external concerns, making the system highly maintainable and testable.

### Real-World Analogy
Think of a well-designed library building:
- The entrance desk (Controllers) handles visitor interactions
- The catalog system (Use Cases) manages book operations
- The book collection (Entities) represents core business objects
- The building utilities (Frameworks) support everything but can be replaced without moving books

## 🔑 Key Concepts

### Architectural Layers

1. **Entities (Enterprise Business Rules)**
    - Core business objects
    - Business rules that rarely change
    - Independent of application specific rules

2. **Use Cases (Application Business Rules)**
    - Application specific business rules
    - Orchestrates data flow between entities
    - Contains application business rules

3. **Interface Adapters**
    - Converts data between use cases and external formats
    - Contains controllers, presenters, and gateways
    - Implements interfaces defined by use cases

4. **Frameworks & Drivers**
    - Database
    - Web framework
    - External interfaces
    - UI components

### Core Principles

1. **Dependency Rule**: Dependencies only point inward
2. **Independence from Frameworks**: Core business logic is isolated
3. **Testability**: Business rules can be tested without external elements
4. **Isolation**: External changes don't affect internal layers

## 💻 Implementation

Let's implement a library management system using Clean Architecture.

### Core Entities

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    // Domain/Entity/Book.java
    package com.example.library.domain.entity;

    import java.util.UUID;

    public class Book {
        private final UUID id;
        private String title;
        private String author;
        private String isbn;
        private BookStatus status;

        public Book(String title, String author, String isbn) {
            this.id = UUID.randomUUID();
            this.title = title;
            this.author = author;
            this.isbn = isbn;
            this.status = BookStatus.AVAILABLE;
        }

        public void borrowBook() {
            if (status != BookStatus.AVAILABLE) {
                throw new IllegalStateException("Book is not available");
            }
            status = BookStatus.BORROWED;
        }

        public void returnBook() {
            if (status != BookStatus.BORROWED) {
                throw new IllegalStateException("Book is not borrowed");
            }
            status = BookStatus.AVAILABLE;
        }

        // Getters and setters
    }

    enum BookStatus {
        AVAILABLE, BORROWED, MAINTENANCE
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    // domain/entity/book.go
    package entity

    import (
        "errors"
        "github.com/google/uuid"
    )

    type BookStatus string

    const (
        Available   BookStatus = "AVAILABLE"
        Borrowed    BookStatus = "BORROWED"
        Maintenance BookStatus = "MAINTENANCE"
    )

    type Book struct {
        ID     uuid.UUID
        Title  string
        Author string
        ISBN   string
        Status BookStatus
    }

    func NewBook(title, author, isbn string) *Book {
        return &Book{
            ID:     uuid.New(),
            Title:  title,
            Author: author,
            ISBN:   isbn,
            Status: Available,
        }
    }

    func (b *Book) BorrowBook() error {
        if b.Status != Available {
            return errors.New("book is not available")
        }
        b.Status = Borrowed
        return nil
    }

    func (b *Book) ReturnBook() error {
        if b.Status != Borrowed {
            return errors.New("book is not borrowed")
        }
        b.Status = Available
        return nil
    }
    ```
  </TabItem>
</Tabs>

### Use Cases

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    // Application/UseCase/BorrowBookUseCase.java
    package com.example.library.application.usecase;

    import com.example.library.domain.entity.Book;
    import com.example.library.application.port.BookRepository;
    import com.example.library.application.port.NotificationService;

    public class BorrowBookUseCase {
        private final BookRepository bookRepository;
        private final NotificationService notificationService;

        public BorrowBookUseCase(
            BookRepository bookRepository,
            NotificationService notificationService
        ) {
            this.bookRepository = bookRepository;
            this.notificationService = notificationService;
        }

        public void execute(UUID bookId, String userId) {
            Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));
            
            book.borrowBook();
            bookRepository.save(book);
            notificationService.notifyBookBorrowed(book, userId);
        }
    }

    // Application/Port/BookRepository.java
    public interface BookRepository {
        Optional<Book> findById(UUID id);
        void save(Book book);
        List<Book> findAvailable();
    }

    // Application/Port/NotificationService.java
    public interface NotificationService {
        void notifyBookBorrowed(Book book, String userId);
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    // application/usecase/borrow_book.go
    package usecase

    import (
        "github.com/example/library/domain/entity"
        "github.com/google/uuid"
    )

    type BookRepository interface {
        FindById(id uuid.UUID) (*entity.Book, error)
        Save(book *entity.Book) error
        FindAvailable() ([]*entity.Book, error)
    }

    type NotificationService interface {
        NotifyBookBorrowed(book *entity.Book, userId string) error
    }

    type BorrowBookUseCase struct {
        bookRepository     BookRepository
        notificationService NotificationService
    }

    func NewBorrowBookUseCase(
        repo BookRepository,
        notifier NotificationService,
    ) *BorrowBookUseCase {
        return &BorrowBookUseCase{
            bookRepository:     repo,
            notificationService: notifier,
        }
    }

    func (uc *BorrowBookUseCase) Execute(bookId uuid.UUID, userId string) error {
        book, err := uc.bookRepository.FindById(bookId)
        if err != nil {
            return err
        }

        if err := book.BorrowBook(); err != nil {
            return err
        }

        if err := uc.bookRepository.Save(book); err != nil {
            return err
        }

        return uc.notificationService.NotifyBookBorrowed(book, userId)
    }
    ```
  </TabItem>
</Tabs>

### Interface Adapters

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    // Interface/Controller/BookController.java
    @RestController
    @RequestMapping("/api/books")
    public class BookController {
        private final BorrowBookUseCase borrowBookUseCase;
        private final BookDTOMapper mapper;

        public BookController(BorrowBookUseCase borrowBookUseCase, BookDTOMapper mapper) {
            this.borrowBookUseCase = borrowBookUseCase;
            this.mapper = mapper;
        }

        @PostMapping("/{bookId}/borrow")
        public ResponseEntity<BookDTO> borrowBook(
            @PathVariable UUID bookId,
            @RequestHeader("User-Id") String userId
        ) {
            borrowBookUseCase.execute(bookId, userId);
            return ResponseEntity.ok().build();
        }
    }

    // Interface/Repository/JpaBookRepository.java
    @Repository
    public class JpaBookRepository implements BookRepository {
        private final JpaBookEntityRepository jpaRepository;
        private final BookEntityMapper mapper;

        @Override
        public Optional<Book> findById(UUID id) {
            return jpaRepository.findById(id)
                .map(mapper::toDomain);
        }

        @Override
        public void save(Book book) {
            BookEntity entity = mapper.toEntity(book);
            jpaRepository.save(entity);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    // interface/controller/book_controller.go
    package controller

    import (
        "github.com/gin-gonic/gin"
        "github.com/example/library/application/usecase"
    )

    type BookController struct {
        borrowBookUseCase *usecase.BorrowBookUseCase
        mapper           *BookDTOMapper
    }

    func NewBookController(
        useCase *usecase.BorrowBookUseCase,
        mapper *BookDTOMapper,
    ) *BookController {
        return &BookController{
            borrowBookUseCase: useCase,
            mapper:           mapper,
        }
    }

    func (c *BookController) BorrowBook(ctx *gin.Context) {
        bookId := ctx.Param("bookId")
        userId := ctx.GetHeader("User-Id")

        if err := c.borrowBookUseCase.Execute(bookId, userId); err != nil {
            ctx.JSON(400, gin.H{"error": err.Error()})
            return
        }

        ctx.Status(200)
    }

    // interface/repository/postgres_book_repository.go
    type PostgresBookRepository struct {
        db     *sql.DB
        mapper *BookEntityMapper
    }

    func (r *PostgresBookRepository) FindById(id uuid.UUID) (*entity.Book, error) {
        var entity BookEntity
        err := r.db.QueryRow(
            "SELECT * FROM books WHERE id = $1",
            id,
        ).Scan(&entity.ID, &entity.Title, &entity.Author, &entity.ISBN, &entity.Status)

        if err != nil {
            return nil, err
        }

        return r.mapper.ToDomain(&entity), nil
    }
    ```
  </TabItem>
</Tabs>

## 🔄 Related Patterns

1. **Hexagonal Architecture**
    - Similar separation of concerns
    - Uses ports and adapters concept
    - Complements Clean Architecture's layer organization

2. **Domain-Driven Design**
    - Provides strategic design patterns
    - Helps identify bounded contexts
    - Natural fit with Clean Architecture entities

3. **Event-Driven Architecture**
    - Can be implemented within use cases
    - Helps decouple components
    - Useful for complex workflows

## ✅ Best Practices

### Configuration
1. Use dependency injection
2. Externalize configuration
3. Use environment variables
4. Implement feature toggles

### Monitoring
1. Add structured logging
2. Implement health checks
3. Track metrics per use case
4. Monitor response times

### Testing
1. Use TDD approach
2. Write unit tests for entities
3. Test use cases in isolation
4. Implement integration tests

## ⚠️ Common Pitfalls

1. **Breaking the Dependency Rule**
    - Solution: Use dependency inversion
    - Implement interfaces in inner layers

2. **Database-Driven Design**
    - Solution: Design entities first
    - Use repository abstractions

3. **Fat Controllers**
    - Solution: Keep controllers thin
    - Move business logic to use cases

4. **Leaking Domain Concepts**
    - Solution: Use DTOs
    - Define clear boundaries

## 🎯 Use Cases

### 1. E-commerce Platform
- Product catalog management
- Order processing
- Inventory tracking
- Customer management

### 2. HR Management System
- Employee onboarding
- Leave management
- Performance reviews
- Payroll processing

### 3. Content Management System
- Content creation
- Publishing workflow
- User management
- Media management

## 🔍 Deep Dive Topics

### Thread Safety
1. **Immutable Entities**
    - Use final fields
    - Implement thread-safe collections
    - Avoid shared state

2. **Transaction Management**
    - Use proper isolation levels
    - Implement optimistic locking
    - Handle concurrent modifications

### Performance Optimization
1. **Caching Strategies**
    - Implement caching layers
    - Use read/write caching
    - Cache invalidation patterns

2. **Database Optimization**
    - Connection pooling
    - Query optimization
    - Proper indexing

### Database Management
1. **Migration Strategies**
    - Version control schemas
    - Handle backward compatibility
    - Implement rollback procedures

## 📚 Additional Resources

### Books
1. Clean Architecture by Robert C. Martin
2. Implementing Domain-Driven Design by Vaughn Vernon
3. Patterns of Enterprise Application Architecture by Martin Fowler

### Tools
1. Spring Framework
2. Gin Web Framework
3. JUnit & Testify
4. SonarQube

### Online Resources
1. Clean Architecture Blog
2. Martin Fowler's Blog
3. DDD Community

## ❓ FAQs

**Q: How do I handle database transactions in Clean Architecture?**  
A: Implement transactions at the use case level using a transaction manager in the infrastructure layer.

**Q: Should I create DTOs for all layers?**  
A: No, use DTOs only at boundaries between the application and external world.

**Q: How do I handle validation?**  
A: Implement domain validation in entities, input validation in controllers, and business rules in use cases.

**Q: How do I manage dependencies between modules?**  
A: Use dependency injection and define clear interfaces between modules.

**Q: What's the best way to handle cross-cutting concerns?**  
A: Use aspects or middleware at the infrastructure layer, keeping core business logic clean.
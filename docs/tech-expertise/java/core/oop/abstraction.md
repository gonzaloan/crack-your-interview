---
sidebar_position: 5
title: "Abstraction"
description: "Master abstraction principles and patterns in Java"
---

# Abstraction in Java

## Core Understanding

Abstraction is about hiding complex implementation details and showing only necessary features of an object:
- Reduces complexity by hiding unnecessary details
- Provides high-level interfaces for interaction
- Separates interface from implementation
- Enables modular design
- Supports loose coupling between components

## ❌ Bad Example

```java
public class ReportGenerator {
    public byte[] generateReport(String reportData) {
        // Direct low-level implementation without abstraction
        Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/db");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM data");
        
        // Direct file handling
        File file = new File("report.pdf");
        PDDocument document = new PDDocument();
        PDPage page = new PDPage();
        document.addPage(page);
        
        // Direct email sending
        Session session = Session.getInstance(new Properties());
        MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress("sender@example.com"));
        
        // Mix of different concerns without abstraction
        while (rs.next()) {
            // Complex PDF generation logic
            // Mixed with data access and email logic
        }
        
        document.save(file);
        Transport.send(message);
        return Files.readAllBytes(file.toPath());
    }
}
```
**Why it's bad**:

- No separation of concerns
- Direct coupling to implementation details
- Hard to test and maintain
- No abstraction layers
- Mixed responsibilities

## ✅ Good Example
Let's fix this:
```java
public interface ReportGenerator {
    Report generateReport(ReportRequest request);
}

public interface ReportStorage {
    void store(Report report);
    Optional<Report> retrieve(String reportId);
}

public interface ReportNotifier {
    void notifyReportCompletion(Report report);
}

@Service
public class PDFReportGenerator implements ReportGenerator {
    private final DataSource dataSource;
    private final ReportTemplate template;
    private final PDFEngine pdfEngine;
    
    @Override
    public Report generateReport(ReportRequest request) {
        List<ReportData> data = dataSource.fetchData(request.getQuery());
        Document document = template.applyData(data);
        byte[] pdfContent = pdfEngine.generate(document);
        
        return new Report(
            request.getReportId(),
            pdfContent,
            ReportFormat.PDF,
            LocalDateTime.now()
        );
    }
}

@Service
public class ReportingService {
    private final ReportGenerator generator;
    private final ReportStorage storage;
    private final ReportNotifier notifier;
    
    public ReportResult createReport(ReportRequest request) {
        try {
            Report report = generator.generateReport(request);
            storage.store(report);
            notifier.notifyReportCompletion(report);
            
            return ReportResult.success(report.getId());
        } catch (Exception e) {
            return ReportResult.failure("Failed to generate report: " + e.getMessage());
        }
    }
}
```
**Why it's good**:
- Clear separation of concerns
- Well-defined interfaces
- Hidden implementation details
- Easy to test and modify
- Loose coupling between components
## Best Practices

- Use Interface Segregation
```java
// Split interfaces based on client needs
public interface Readable {
    byte[] read();
}

public interface Writable {
    void write(byte[] data);
}

public interface Closeable {
    void close();
}

// Combine when needed
public interface FileOperation extends Readable, Writable, Closeable {
    void sync();
}
```

- Abstract Factory Pattern

```java
public interface ConnectionFactory {
    Connection createConnection(ConnectionConfig config);
}

@Service
public class DatabaseConnectionFactory implements ConnectionFactory {
    @Override
    public Connection createConnection(ConnectionConfig config) {
        return switch(config.getType()) {
            case POSTGRES -> createPostgresConnection(config);
            case MYSQL -> createMysqlConnection(config);
            default -> throw new UnsupportedDatabaseException(config.getType());
        };
    }
}
```

- Layer Abstraction

```java
public interface UserRepository {
    Optional<User> findById(Long id);
    User save(User user);
}

@Repository
public class JpaUserRepository implements UserRepository {
    private final JpaRepository<UserEntity, Long> jpaRepository;
    private final UserMapper mapper;
    
    @Override
    public Optional<User> findById(Long id) {
        return jpaRepository.findById(id)
            .map(mapper::toDomain);
    }
}
```

## Use Cases
- Database Access
  - Repository pattern
  - Data access objects
  - Connection pooling

- External Services
  - API clients
  - Message queues
  - Cache implementations

- Business Logic
  - Service layer
  - Domain models
  - Validation rules

## Anti-patterns to Avoid

- Leaky Abstraction
```java
// Avoid exposing implementation details
public interface UserService {
    // Don't expose SQL!
    List<User> findByCustomQuery(String sqlQuery);
    
    // Better
    List<User> findByAttributes(UserSearchCriteria criteria);
}
```

- Concrete Class Dependencies

```java
// Avoid
public class OrderService {
    private MySQLOrderRepository repository; // Concrete class
    
    // Better
    private OrderRepository repository; // Interface
}
```

- Mixed Abstraction Levels
```java
// Avoid mixing abstraction levels
public interface ReportService {
    Report generateReport(); // High-level
    void connectToDatabase(); // Low-level
    byte[] convertToPdf(); // Low-level
}
```
## Interview Questions & Answers

Q1: "How do you handle abstraction in distributed systems?"

Answer:

```java
public interface RemoteService {
    // High-level abstraction for remote operations
    <T> CompletableFuture<T> executeRemote(RemoteCommand<T> command);
    
    // Circuit breaker abstraction
    interface CircuitBreaker {
        <T> CompletableFuture<T> execute(Supplier<CompletableFuture<T>> command);
    }
}

@Service
public class RemoteServiceImpl implements RemoteService {
    private final CircuitBreaker circuitBreaker;
    private final RetryTemplate retryTemplate;
    
    @Override
    public <T> CompletableFuture<T> executeRemote(RemoteCommand<T> command) {
        return circuitBreaker.execute(() ->
            retryTemplate.executeAsync(() ->
                command.execute()
            )
        );
    }
}
```


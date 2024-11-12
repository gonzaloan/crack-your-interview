---
sidebar_position: 4
title: "Frameworks & Drivers"
description: "Clean Architecture Layers - Frameworks"
---
# 🛠️ Clean Architecture: Frameworks & Drivers Layer

## Overview

The Frameworks & Drivers layer (also known as the Infrastructure layer) is the outermost layer of Clean Architecture. It contains all the technical details and tools that power your application: frameworks, databases, UI, web servers, external services, and device-specific implementations. This layer acts as a glue between the external world and your application's core business logic.

### Real-World Analogy
Think of the Frameworks & Drivers layer as the power grid of a city. Just as the power grid provides essential infrastructure (electricity, transformers, cables) that enables buildings to function without the buildings needing to know how electricity is generated, this layer provides the technical infrastructure that enables your application to run without the inner layers needing to know the implementation details.

## Key Concepts 🔑

### Core Components

1. **Web Frameworks**
   - HTTP servers
   - Routing
   - Middleware
   - Request/Response handling

2. **Database Systems**
   - SQL/NoSQL implementations
   - Connection management
   - Query execution
   - Migration tools

3. **External Services**
   - API clients
   - Message queues
   - Cache systems
   - File systems

## Implementation 💻

### Web Framework Configuration Example

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    package com.example.infrastructure.config;

    import org.springframework.boot.SpringApplication;
    import org.springframework.boot.autoconfigure.SpringBootApplication;
    import org.springframework.context.annotation.Bean;
    import org.springframework.web.servlet.config.annotation.EnableWebMvc;
    import io.swagger.v3.oas.models.OpenAPI;
    import io.swagger.v3.oas.models.info.Info;

    @SpringBootApplication
    @EnableWebMvc
    public class ApplicationConfig {
        public static void main(String[] args) {
            SpringApplication.run(ApplicationConfig.class, args);
        }

        @Bean
        public OpenAPI apiDocs() {
            return new OpenAPI()
                .info(new Info()
                    .title("Clean Architecture API")
                    .version("1.0.0")
                    .description("REST API following Clean Architecture principles"));
        }

        @Bean
        public TransactionManager transactionManager(
            EntityManagerFactory entityManagerFactory
        ) {
            return new JpaTransactionManager(entityManagerFactory);
        }

        @Bean
        public ObjectMapper objectMapper() {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            return mapper;
        }
    }

    // Exception Handler
    @ControllerAdvice
    public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
        
        @ExceptionHandler(BusinessException.class)
        public ResponseEntity<Object> handleBusinessException(
            BusinessException ex, WebRequest request
        ) {
            Map<String, Object> body = new HashMap<>();
            body.put("timestamp", LocalDateTime.now());
            body.put("message", ex.getMessage());
            
            return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
        }
        
        @ExceptionHandler(Exception.class)
        public ResponseEntity<Object> handleAllUncaughtException(
            Exception ex, WebRequest request
        ) {
            Map<String, Object> body = new HashMap<>();
            body.put("timestamp", LocalDateTime.now());
            body.put("message", "An unexpected error occurred");
            
            return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package infrastructure

    import (
        "context"
        "log"
        "net/http"
        "time"

        "github.com/gin-gonic/gin"
        "go.uber.org/zap"
        "gorm.io/gorm"
    )

    type Server struct {
        router *gin.Engine
        logger *zap.Logger
        db     *gorm.DB
    }

    func NewServer(db *gorm.DB, logger *zap.Logger) *Server {
        router := gin.New()
        
        // Middleware
        router.Use(gin.Recovery())
        router.Use(RequestLogger(logger))
        
        return &Server{
            router: router,
            logger: logger,
            db:     db,
        }
    }

    func (s *Server) SetupRoutes() {
        // Health check
        s.router.GET("/health", func(c *gin.Context) {
            c.JSON(http.StatusOK, gin.H{"status": "healthy"})
        })

        // API routes
        v1 := s.router.Group("/api/v1")
        {
            // Money transfer routes
            transfers := v1.Group("/transfers")
            {
                controller := NewMoneyTransferController(
                    s.db,
                    s.logger,
                )
                transfers.POST("/", controller.TransferMoney)
                transfers.GET("/:id", controller.GetTransfer)
            }
        }
    }

    func (s *Server) Start(addr string) error {
        srv := &http.Server{
            Addr:         addr,
            Handler:      s.router,
            ReadTimeout:  15 * time.Second,
            WriteTimeout: 15 * time.Second,
        }

        // Graceful shutdown
        go func() {
            if err := srv.ListenAndServe(); err != nil && 
               err != http.ErrServerClosed {
                s.logger.Fatal("Failed to start server", zap.Error(err))
            }
        }()

        return nil
    }

    // Middleware
    func RequestLogger(logger *zap.Logger) gin.HandlerFunc {
        return func(c *gin.Context) {
            start := time.Now()
            path := c.Request.URL.Path
            
            c.Next()
            
            latency := time.Since(start)
            status := c.Writer.Status()
            
            logger.Info("Request processed",
                zap.String("path", path),
                zap.Int("status", status),
                zap.Duration("latency", latency),
            )
        }
    }
    ```
  </TabItem>
</Tabs>

### Database Configuration Example

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    package com.example.infrastructure.persistence;

    import org.springframework.context.annotation.Configuration;
    import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
    import javax.sql.DataSource;
    import org.springframework.boot.jdbc.DataSourceBuilder;
    import org.springframework.context.annotation.Bean;

    @Configuration
    @EnableJpaRepositories(basePackages = "com.example.infrastructure.persistence")
    public class DatabaseConfig {
        
        @Bean
        public DataSource dataSource() {
            return DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url("jdbc:postgresql://localhost:5432/cleanarch")
                .username("postgres")
                .password("postgres")
                .build();
        }
        
        @Bean
        public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            DataSource dataSource
        ) {
            LocalContainerEntityManagerFactoryBean em = 
                new LocalContainerEntityManagerFactoryBean();
            em.setDataSource(dataSource);
            em.setPackagesToScan("com.example.infrastructure.persistence");
            
            JpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
            em.setJpaVendorAdapter(vendorAdapter);
            
            Properties properties = new Properties();
            properties.setProperty("hibernate.hbm2ddl.auto", "update");
            properties.setProperty("hibernate.dialect", 
                "org.hibernate.dialect.PostgreSQLDialect");
            em.setJpaProperties(properties);
            
            return em;
        }
    }

    // Connection Pool Configuration
    @Configuration
    public class ConnectionPoolConfig {
        
        @Bean
        public HikariConfig hikariConfig() {
            HikariConfig config = new HikariConfig();
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(5);
            config.setIdleTimeout(300000);
            config.setConnectionTimeout(20000);
            config.setMaxLifetime(600000);
            return config;
        }
        
        @Bean
        public DataSource pooledDataSource(HikariConfig config) {
            return new HikariDataSource(config);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package infrastructure

    import (
        "context"
        "fmt"
        "time"

        "gorm.io/gorm"
        "gorm.io/driver/postgres"
    )

    type DatabaseConfig struct {
        Host     string
        Port     int
        User     string
        Password string
        DBName   string
        SSLMode  string
    }

    func NewDatabase(config DatabaseConfig) (*gorm.DB, error) {
        dsn := fmt.Sprintf(
            "host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
            config.Host,
            config.Port,
            config.User,
            config.Password,
            config.DBName,
            config.SSLMode,
        )

        db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
            NowFunc: func() time.Time {
                return time.Now().UTC()
            },
            Logger: logger.Default.LogMode(logger.Info),
        })
        if err != nil {
            return nil, fmt.Errorf("failed to connect to database: %w", err)
        }

        sqlDB, err := db.DB()
        if err != nil {
            return nil, fmt.Errorf("failed to get database instance: %w", err)
        }

        // Connection pool settings
        sqlDB.SetMaxIdleConns(10)
        sqlDB.SetMaxOpenConns(100)
        sqlDB.SetConnMaxLifetime(time.Hour)

        // Test connection
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        if err := sqlDB.PingContext(ctx); err != nil {
            return nil, fmt.Errorf("failed to ping database: %w", err)
        }

        // Run migrations
        if err := runMigrations(db); err != nil {
            return nil, fmt.Errorf("failed to run migrations: %w", err)
        }

        return db, nil
    }

    func runMigrations(db *gorm.DB) error {
        return db.AutoMigrate(
            &AccountEntity{},
            &TransferEntity{},
        )
    }
    ```
  </TabItem>
</Tabs>

## Related Patterns 🔄

1. **Dependency Injection**
   - Manages framework dependencies
   - Provides inversion of control
   - Enables testability

2. **Repository Pattern**
   - Abstracts data access
   - Implements persistence logic
   - Manages database connections

3. **Factory Pattern**
   - Creates framework components
   - Manages object lifecycle
   - Configures dependencies

## Best Practices ✨

### Configuration
1. Use environment variables
2. Implement proper logging
3. Configure security settings
4. Handle connection pooling

### Monitoring
1. Implement health checks
2. Track metrics
3. Set up alerting
4. Monitor resource usage

### Testing
1. Integration tests
2. Performance tests
3. Load tests
4. Security tests

## Common Pitfalls 🚫

1. **Framework Lock-in**
   - Solution: Use adapters
   - Keep framework code isolated

2. **Configuration Sprawl**
   - Solution: Centralize configuration
   - Use configuration management

3. **Resource Leaks**
   - Solution: Proper connection management
   - Implement cleanup routines

4. **Security Misconfiguration**
   - Solution: Security best practices
   - Regular security audits

## Use Cases 🎯

### 1. Web Application
- HTTP server setup
- REST API configuration
- Authentication middleware
- Request/response handling

### 2. Database Integration
- Connection pooling
- Migration management
- Query optimization
- Backup/restore

### 3. External Services
- Message queue setup
- Cache configuration
- File storage integration
- API client configuration

## Deep Dive Topics 🤿

### Thread Safety
1. **Connection Pooling**
   - Pool sizing
   - Connection lifecycle
   - Thread management

### Distributed Systems
1. **Service Discovery**
   - Load balancing
   - Circuit breaking
   - Health checking

### Performance
1. **Resource Management**
   - Memory optimization
   - Connection pooling
   - Cache strategies

## Additional Resources 📚

### References
1. [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
2. [Spring Framework Documentation](https://docs.spring.io/spring-framework/reference/)
3. [Gin Framework Documentation](https://gin-gonic.com/docs/)

### Tools
1. [Spring Boot](https://spring.io/projects/spring-boot)
2. [Gin Web Framework](https://github.com/gin-gonic/gin)
3. [GORM](https://gorm.io/)

## FAQs ❓

### Q: How do I manage framework upgrades?
A: Use semantic versioning, maintain compatibility tests, and implement gradual upgrades.

### Q: Should business logic leak into frameworks?
A: No, keep business logic in the inner layers and use adapters to interact with frameworks.

### Q: How to handle framework-specific exceptions?
A: Convert framework exceptions to domain exceptions at the boundary.

### Q: How to manage multiple frameworks?
A: Use adapters to isolate framework code and maintain clean boundaries.

### Q: Should I use ORMs or raw SQL?
A: Choose based on requirements, but keep data access code isolated in repositories.
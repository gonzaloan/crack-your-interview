---
sidebar_position: 1
title: "Spring Core Introduction"
description: "Comprehensive guide to Spring Core fundamentals and advanced concepts"
---

# Spring Core

## Core Understanding

Spring Core is the foundation module of the Spring Framework that provides the essential building blocks for enterprise applications. It implements the Inversion of Control (IoC) principle through Dependency Injection (DI).

### Primary Components

1. **IoC Container**
    - Acts as the central component that manages bean lifecycle
    - Creates and maintains application objects (beans)
    - Handles dependency injection
    - Two main types: BeanFactory and ApplicationContext

2. **Bean Management System**
    - Manages object creation and disposal
    - Handles scoping of objects
    - Controls object lifecycle
    - Manages dependencies between objects

3. **Configuration System**
    - Supports multiple configuration approaches:
        * Java-based (@Configuration)
        * Annotation-based (@Component, etc.)
        * XML-based (beans.xml)
    - Handles property management and profiles

## Key Concepts

### 1. IoC Container Types

#### BeanFactory
- Basic container providing fundamental IoC functionality
- Lightweight and suitable for resource-constrained environments
- Lazy initialization of beans
```java
// Basic BeanFactory usage
DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
XmlBeanDefinitionReader reader = new XmlBeanDefinitionReader(factory);
reader.loadBeanDefinitions(new ClassPathResource("beans.xml"));

// Features:
// - Lazy loading
UserService userService = factory.getBean(UserService.class);
// - Singleton management
boolean isSingleton = factory.isSingleton("userService");
// - Bean definition access
BeanDefinition definition = factory.getBeanDefinition("userService");
```

#### ApplicationContext
- Advanced container with enterprise-level features
- Extends BeanFactory capabilities
- Eager initialization of singleton beans
```java
// Different types of ApplicationContext
ApplicationContext context;

// For Java configuration
context = new AnnotationConfigApplicationContext(AppConfig.class);

// For XML configuration
context = new ClassPathXmlApplicationContext("beans.xml");

// For web applications
context = new AnnotationConfigWebApplicationContext();

// Additional features:
// - Event publishing
context.publishEvent(new CustomEvent(this));
// - Resource loading
Resource resource = context.getResource("classpath:config.xml");
// - Environment access
Environment env = context.getEnvironment();
```

### 2. Bean Definition and Lifecycle

#### Bean Definition
A bean definition contains the configuration metadata needed to create a bean:
```java
// Java-based configuration
@Configuration
public class AppConfig {
    @Bean
    @Scope("singleton")
    public UserService userService(UserRepository repository) {
        return new UserServiceImpl(repository);
    }
}

// XML configuration equivalent
<bean id="userService" 
      class="com.example.UserServiceImpl"
      scope="singleton">
    <constructor-arg ref="userRepository"/>
</bean>
```

#### Lifecycle Phases
1. **Instantiation**
    - Bean instance created
    - Constructor called
```java
@Component
public class MyBean {
    public MyBean() {
        // Constructor phase
        System.out.println("Bean instantiated");
    }
}
```

2. **Population**
    - Dependencies injected
    - Properties set
```java
@Component
public class MyBean {
    private final DependencyA dependencyA;
    private final DependencyB dependencyB;

    // Dependencies injected through constructor
    public MyBean(DependencyA dependencyA, DependencyB dependencyB) {
        this.dependencyA = dependencyA;
        this.dependencyB = dependencyB;
    }
}
```

3. **Initialization**
    - Post-construction processing
    - Custom initialization
```java
@Component
public class MyBean implements InitializingBean {
    @PostConstruct
    public void init() {
        // Post-construction initialization
    }

    @Override
    public void afterPropertiesSet() {
        // InitializingBean initialization
    }
}
```

4. **Usage**
    - Bean is ready for use
    - Singleton beans are cached

5. **Destruction**
    - Cleanup before bean is destroyed
```java
@Component
public class MyBean implements DisposableBean {
    @PreDestroy
    public void cleanup() {
        // Pre-destruction cleanup
    }

    @Override
    public void destroy() {
        // DisposableBean cleanup
    }
}
```

### 3. Basic Configuration Types

#### Java-based Configuration (Recommended)
```java
@Configuration
@ComponentScan("com.example")
public class AppConfig {
    // Configuration metadata included in the class
    @Bean
    public DataSource dataSource() {
        DataSourceBuilder dataSourceBuilder = DataSourceBuilder.create();
        dataSourceBuilder.url("jdbc:mysql://localhost:3306/db");
        return dataSourceBuilder.build();
    }
}
```

#### Annotation-based Configuration
```java
// Component scanning and auto-configuration
@Service
@Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository repository;

    // Constructor injection
    public UserServiceImpl(UserRepository repository) {
        this.repository = repository;
    }
}
```

#### XML-based Configuration
```xml
<!-- Traditional XML configuration -->
<beans>
    <bean id="userRepository" 
          class="com.example.UserRepositoryImpl"/>
          
    <bean id="userService" 
          class="com.example.UserServiceImpl">
        <constructor-arg ref="userRepository"/>
    </bean>
</beans>
```

## Important Classes and Interfaces

### 1. Core Container Interfaces

#### ApplicationContext
Principal Interface for the advanced IoC container.
```java
public interface ApplicationContext extends EnvironmentCapable, 
    ListableBeanFactory, HierarchicalBeanFactory,
    MessageSource, ApplicationEventPublisher, ResourcePatternResolver {
    // Methods inherited from parent interfaces
}
```

Principal Characteristics:
- **EnvironmentCapable**: Access to environment variables
  ```java
  Environment env = context.getEnvironment();
  String dbUrl = env.getProperty("database.url");
  ```
- **ListableBeanFactory**: List and search for beans
  ```java
  // List all beans of a specific type
  Map<String, UserService> userServices = context.getBeansOfType(UserService.class);
  ```
- **MessageSource**: Support for i18n
  ```java
  String message = context.getMessage("welcome.message", null, Locale.US);
  ```
- **ApplicationEventPublisher**: Event Publish
  ```java
  context.publishEvent(new UserCreatedEvent(user));
  ```

#### BeanFactory
Base interface for IoC container:
```java
public interface BeanFactory {
    Object getBean(String name);
    <T> T getBean(Class<T> requiredType);
    boolean containsBean(String name);
    boolean isSingleton(String name);
    boolean isPrototype(String name);
    Class<?> getType(String name);
}
```
Key Functionalities:
- **Bean Retrieval**: Obtain beans
  ```java
  UserService userService = beanFactory.getBean("userService", UserService.class);
  ```
- **Bean Metadata**: Access to bean information
  ```java
  Class<?> beanType = beanFactory.getType("userService");
  boolean isSingleton = beanFactory.isSingleton("userService");
  ```

### 2. Bean Management Classes

#### BeanDefinition
Interface to define bean configuration.
```java
public interface BeanDefinition extends AttributeAccessor, BeanMetadataElement {
    void setBeanClassName(String beanClassName);
    String getBeanClassName();
    void setScope(String scope);
    String getScope();
    void setLazyInit(boolean lazyInit);
    boolean isLazyInit();
    void setDependsOn(String... dependsOn);
    String[] getDependsOn();
}
```
Principal Usage:
- **Bean Configuration**
  ```java
  BeanDefinitionBuilder builder = BeanDefinitionBuilder
      .genericBeanDefinition(UserService.class)
      .setScope(BeanDefinition.SCOPE_SINGLETON)
      .setLazyInit(true)
      .addConstructorArgReference("userRepository");
  ```
- **Runtime Bean Modification**
  ```java
  DefaultListableBeanFactory factory = (DefaultListableBeanFactory) context;
  BeanDefinition def = factory.getBeanDefinition("userService");
  def.setScope(BeanDefinition.SCOPE_PROTOTYPE);
  ```

#### BeanFactoryPostProcessor
Allows modify bean definitions before its instantiation.
```java
public interface BeanFactoryPostProcessor {
    void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) 
        throws BeansException;
}
```
Example of usage:
```java
@Component
public class CustomBeanFactoryPostProcessor implements BeanFactoryPostProcessor {
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory factory) {
        BeanDefinition def = factory.getBeanDefinition("userService");
        def.setScope(BeanDefinition.SCOPE_PROTOTYPE);
        
        // Add property values
        MutablePropertyValues pvs = def.getPropertyValues();
        pvs.addPropertyValue("timeout", 5000);
    }
}
```

### 3. Dependency Injection Support

#### AutowiredAnnotationBeanPostProcessor
Process the annotation @Autowired and the DI.
```java
public class AutowiredAnnotationBeanPostProcessor 
    implements BeanPostProcessor, BeanFactoryAware {
    // Internal implementation
}
```
Functionalities:
- **Field Injection**:
  ```java
  public class UserService {
      @Autowired
      private UserRepository userRepository;
  }
  ```
- **Constructor Injection** (Recommended):
  ```java
  public class UserService {
      private final UserRepository userRepository;
      
      @Autowired
      public UserService(UserRepository userRepository) {
          this.userRepository = userRepository;
      }
  }
  ```
- **Method Injection**:
  ```java
  public class UserService {
      private UserRepository userRepository;
      
      @Autowired
      public void setUserRepository(UserRepository userRepository) {
          this.userRepository = userRepository;
      }
  }
  ```

### 4. Configuration Support

#### ConfigurationClassPostProcessor
Process annotated classes with @Configuration.
```java
public class ConfigurationClassPostProcessor 
    implements BeanDefinitionRegistryPostProcessor, PriorityOrdered {
    // Internal implementation
}
```
Principal characteristics:
- **Configuration Processing**:
  ```java
  @Configuration
  public class AppConfig {
      @Bean
      public UserService userService(UserRepository repository) {
          return new UserServiceImpl(repository);
      }
  }
  ```
- **Component Scanning**:
  ```java
  @Configuration
  @ComponentScan("com.example")
  public class AppConfig {
      // Configuration methods
  }
  ```
- **Import Support**:
  ```java
  @Configuration
  @Import({SecurityConfig.class, JpaConfig.class})
  public class AppConfig {
      // Main configuration
  }
  ```

### 5. Event Support

#### ApplicationEventPublisher
Interface to publish events in the application.
```java
public interface ApplicationEventPublisher {
    void publishEvent(ApplicationEvent event);
    void publishEvent(Object event);
}
```
Implementation example:
```java
@Service
public class UserService {
    private final ApplicationEventPublisher eventPublisher;

    public UserService(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    public void createUser(User user) {
        // Save user
        eventPublisher.publishEvent(new UserCreatedEvent(user));
    }
}

// Event listener
@Component
public class UserEventListener {
    @EventListener
    public void handleUserCreated(UserCreatedEvent event) {
        User user = event.getUser();
        // Handle event
    }
}
```

## Implementation Examples

### ❌ Bad Examples

#### 1. Dependency Management Anti-patterns
```java
// ❌ Field Injection
@Service
public class UserServiceBad {
    @Autowired // Bad: Field injection makes testing difficult
    private UserRepository userRepository;
    
    @Autowired // Bad: Multiple dependencies injected through fields
    private EmailService emailService;
    
    @Autowired // Bad: Direct dependency on external service
    private ThirdPartyAPIClient apiClient;
    
    public User createUser(UserDTO dto) {
        User user = new User(dto);
        userRepository.save(user);
        emailService.sendWelcomeEmail(user);
        apiClient.notifyExternalSystem(user);
        return user;
    }
}

// ❌ Service Locator Pattern
public class ServiceLocatorBad {
    private static ApplicationContext context;
    
    // Bad: Static context access
    public static void setContext(ApplicationContext applicationContext) {
        context = applicationContext;
    }
    
    // Bad: Service locator pattern
    public static UserService getUserService() {
        return context.getBean(UserService.class);
    }
}
```

#### 2. Configuration Anti-patterns
```java
// ❌ Mixed Configuration Styles
@Configuration
public class MixedConfigBad {
    // Bad: Mixing XML and Java configuration without clear separation
    @ImportResource("classpath:legacy-config.xml")
    public class Config {
        @Bean
        public UserService userService() {
            return new UserService();
        }
    }
}

// ❌ Bean Creation Anti-pattern
@Component
public class BeanCreationBad {
    // Bad: Direct instantiation instead of dependency injection
    private UserRepository repository = new UserRepositoryImpl();
    
    // Bad: Hardcoded configuration
    private EmailService emailService = new EmailService("smtp.server.com", 587);
}
```

#### 3. Lifecycle Management Anti-patterns
```java
// ❌ Resource Management
@Service
public class ResourceManagementBad {
    private Connection connection;
    
    // Bad: Resource leak potential
    public void processData() {
        connection = DriverManager.getConnection("jdbc:mysql://localhost/db");
        // Use connection without proper cleanup
    }
    
    // Bad: Manual resource management
    public void cleanup() {
        if (connection != null) {
            try {
                connection.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
```

### ✅ Good Examples

#### 1. Proper Dependency Management
```java
@Service
@Validated
public class UserServiceGood {
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ExternalServiceAdapter externalService;
    private final ApplicationEventPublisher eventPublisher;

    // Good: Constructor injection
    public UserServiceGood(
            UserRepository userRepository,
            EmailService emailService,
            ExternalServiceAdapter externalService,
            ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.externalService = externalService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public User createUser(@Valid UserDTO dto) {
        // Validation
        validateUserData(dto);
        
        // Domain logic
        User user = new User(dto);
        user = userRepository.save(user);
        
        // Event publishing
        eventPublisher.publishEvent(new UserCreatedEvent(user));
        
        // Async operations through events
        CompletableFuture.runAsync(() -> {
            emailService.sendWelcomeEmail(user);
            externalService.notifyUserCreation(user);
        });
        
        return user;
    }

    private void validateUserData(UserDTO dto) {
        Assert.hasText(dto.getEmail(), "Email is required");
        Assert.isTrue(dto.getAge() >= 18, "User must be 18 or older");
    }
}
```

#### 2. Configuration Best Practices
```java
@Configuration
@EnableTransactionManagement
@PropertySource("classpath:application.properties")
public class AppConfigGood {
    private final Environment env;

    public AppConfigGood(Environment env) {
        this.env = env;
    }

    // Good: Modular configuration
    @Bean
    @ConfigurationProperties(prefix = "app.datasource")
    public DataSource dataSource() {
        return DataSourceBuilder.create()
            .build();
    }

    // Good: Factory method pattern
    @Bean
    public UserRepository userRepository(DataSource dataSource) {
        UserRepositoryImpl repository = new UserRepositoryImpl(dataSource);
        repository.setQueryTimeout(env.getProperty(
            "app.repository.timeout", 
            Integer.class, 
            5000
        ));
        return repository;
    }

    // Good: Conditional bean creation
    @Bean
    @Profile("production")
    public EmailService productionEmailService() {
        return new SmtpEmailService(
            env.getRequiredProperty("mail.host"),
            env.getRequiredProperty("mail.port")
        );
    }

    @Bean
    @Profile("development")
    public EmailService developmentEmailService() {
        return new MockEmailService();
    }
}
```

#### 3. Resource and Lifecycle Management
```java
@Service
@Slf4j
public class ResourceManagementGood {
    private final DataSource dataSource;

    public ResourceManagementGood(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // Good: Try-with-resources
    public void processData() {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users")) {
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    processRow(rs);
                }
            }
        } catch (SQLException e) {
            log.error("Error processing data", e);
            throw new DataProcessingException("Failed to process data", e);
        }
    }

    // Good: Proper lifecycle management
    @PostConstruct
    public void initialize() {
        log.info("Initializing resource management service");
        // Initialization logic
    }

    @PreDestroy
    public void cleanup() {
        log.info("Cleaning up resources");
        // Cleanup logic
    }
}
```

#### 4. Event-Driven Architecture
```java
@Service
public class UserOperationsGood {
    private final ApplicationEventPublisher eventPublisher;

    public UserOperationsGood(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void processUserRegistration(User user) {
        // Domain logic
        validateAndSaveUser(user);
        
        // Publish domain events
        eventPublisher.publishEvent(new UserRegisteredEvent(user));
    }
}

@Component
@Slf4j
public class UserEventHandlers {
    private final EmailService emailService;
    private final NotificationService notificationService;

    public UserEventHandlers(
            EmailService emailService,
            NotificationService notificationService) {
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    @EventListener
    @Async
    public void handleUserRegistered(UserRegisteredEvent event) {
        try {
            User user = event.getUser();
            emailService.sendWelcomeEmail(user);
            notificationService.notifyAdmins("New user registered: " + user.getEmail());
        } catch (Exception e) {
            log.error("Error handling user registration event", e);
            // Consider retry or fallback strategy
        }
    }
}
```

## Best Practices

### 1. Dependency Injection
Best practices for managing dependencies in Spring applications.

#### Constructor Injection
```java
@Service
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final UserMapper userMapper;

    // Best Practice: Constructor injection for required dependencies
    public UserService(
            UserRepository userRepository,
            EmailService emailService,
            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.userMapper = userMapper;
    }
}
```
**Why?**
- Ensures immutability
- Makes dependencies explicit
- Facilitates testing
- Prevents null pointer exceptions

#### Optional Dependencies
```java
@Service
public class NotificationService {
    private final MessageService messageService;
    private final Optional<AuditService> auditService;

    // Best Practice: Handle optional dependencies with Optional
    public NotificationService(
            MessageService messageService,
            @Autowired(required = false) AuditService auditService) {
        this.messageService = messageService;
        this.auditService = Optional.ofNullable(auditService);
    }

    public void sendNotification(String message) {
        messageService.send(message);
        auditService.ifPresent(audit -> 
            audit.recordNotification(message));
    }
}
```

### 2. Configuration Management
Best practices for organizing and managing Spring configurations.

#### Module-Based Configuration
```java
@Configuration
public class DatabaseConfig {
    // Database-specific beans
    @Bean
    @ConfigurationProperties(prefix = "app.datasource")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }
}

@Configuration
public class SecurityConfig {
    // Security-specific beans
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        return http
            .authorizeRequests()
            .anyRequest().authenticated()
            .and().build();
    }
}

@Configuration
@Import({DatabaseConfig.class, SecurityConfig.class})
public class AppConfig {
    // Application-wide configuration
}
```
**Why?**
- Better organization
- Easier maintenance
- Clear separation of concerns
- Modular testing

#### Environment-Specific Configuration
```java
@Configuration
public class AppConfig {
    @Bean
    @Profile("development")
    public DataSource developmentDataSource() {
        return DataSourceBuilder.create()
            .url("jdbc:h2:mem:testdb")
            .build();
    }

    @Bean
    @Profile("production")
    public DataSource productionDataSource(
            @Value("${db.url}") String url,
            @Value("${db.username}") String username,
            @Value("${db.password}") String password) {
        return DataSourceBuilder.create()
            .url(url)
            .username(username)
            .password(password)
            .build();
    }
}
```

### 3. Bean Lifecycle Management
Best practices for managing bean lifecycle and resources.

#### Proper Resource Cleanup
```java
@Component
public class ResourceManager implements DisposableBean {
    private final ExecutorService executorService;
    private final Connection connection;

    public ResourceManager() {
        this.executorService = Executors.newFixedThreadPool(10);
        this.connection = createConnection();
    }

    @PreDestroy
    public void preDestroy() {
        // Cleanup during container shutdown
        executorService.shutdown();
        try {
            if (!executorService.awaitTermination(800, TimeUnit.MILLISECONDS)) {
                executorService.shutdownNow();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    @Override
    public void destroy() {
        // Additional cleanup if needed
        try {
            connection.close();
        } catch (SQLException e) {
            logger.error("Error closing connection", e);
        }
    }
}
```

### 4. Exception Handling
Best practices for handling exceptions in Spring applications.

#### Custom Exception Hierarchy
```java
// Base exception for all business exceptions
public abstract class BusinessException extends RuntimeException {
    private final String errorCode;
    
    protected BusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}

// Specific business exceptions
public class UserNotFoundException extends BusinessException {
    public UserNotFoundException(String userId) {
        super("User not found: " + userId, "USER-001");
    }
}

// Exception handling in service
@Service
public class UserService {
    public User getUser(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));
    }
}

// Global exception handling
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException ex) {
        ErrorResponse error = new ErrorResponse(
            ex.getErrorCode(),
            ex.getMessage()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
```

### 5. Testing Practices
Best practices for testing Spring components.

#### Component Testing
```java
@SpringBootTest
class UserServiceTest {
    @MockBean
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    @Test
    void whenUserExists_thenShouldReturnUser() {
        // Given
        String userId = "123";
        User expectedUser = new User(userId);
        given(userRepository.findById(userId))
            .willReturn(Optional.of(expectedUser));
            
        // When
        User actualUser = userService.getUser(userId);
        
        // Then
        assertThat(actualUser).isEqualTo(expectedUser);
    }
    
    @Test
    void whenUserDoesNotExist_thenShouldThrowException() {
        // Given
        String userId = "123";
        given(userRepository.findById(userId))
            .willReturn(Optional.empty());
            
        // When/Then
        assertThrows(UserNotFoundException.class, 
            () -> userService.getUser(userId));
    }
}
```

## Use Cases

### 1. Multi-tenant Application Architecture
Implementation of multi-tenant support using Spring Core features.

```java
// Tenant context holder
public class TenantContext {
    private static final ThreadLocal<String> CURRENT_TENANT = 
        new ThreadLocal<>();
    
    public static void setTenant(String tenant) {
        CURRENT_TENANT.set(tenant);
    }
    
    public static String getTenant() {
        return CURRENT_TENANT.get();
    }
    
    public static void clear() {
        CURRENT_TENANT.remove();
    }
}

// Multi-tenant configuration
@Configuration
public class MultiTenantConfig {
    @Bean
    public DataSource multiTenantDataSource(
            Map<String, DataSource> dataSources) {
        return new AbstractRoutingDataSource() {
            @Override
            protected Object determineCurrentLookupKey() {
                return TenantContext.getTenant();
            }
        };
    }
}

// Usage in service layer
@Service
@Transactional
public class MultiTenantUserService {
    private final UserRepository userRepository;
    
    public User createUser(User user, String tenant) {
        try {
            TenantContext.setTenant(tenant);
            return userRepository.save(user);
        } finally {
            TenantContext.clear();
        }
    }
}
```

### 2. Dynamic Bean Registration
Runtime bean registration and management.

```java
@Service
public class DynamicBeanRegistrar {
    private final ConfigurableApplicationContext applicationContext;
    private final BeanDefinitionRegistry registry;

    public DynamicBeanRegistrar(ConfigurableApplicationContext context) {
        this.applicationContext = context;
        this.registry = (BeanDefinitionRegistry) context.getBeanFactory();
    }

    public void registerServiceForTenant(String tenant) {
        // Create bean definition
        BeanDefinition beanDefinition = BeanDefinitionBuilder
            .genericBeanDefinition(TenantService.class)
            .addConstructorArgValue(tenant)
            .getBeanDefinition();

        // Register bean
        String beanName = tenant + "Service";
        registry.registerBeanDefinition(beanName, beanDefinition);
        
        // Trigger post-processing
        applicationContext.getBeanFactory()
            .getBean(beanName);
    }
}
```

### 3. Event-Driven Architecture
Implementation of complex business processes using Spring events.

```java
// Custom events
@Getter
public class OrderCreatedEvent extends ApplicationEvent {
    private final Order order;
    
    public OrderCreatedEvent(Order order) {
        super(order);
        this.order = order;
    }
}

// Event publishers
@Service
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;

    public Order createOrder(OrderRequest request) {
        Order order = orderRepository.save(
            new Order(request)
        );
        
        eventPublisher.publishEvent(
            new OrderCreatedEvent(order)
        );
        
        return order;
    }
}

// Event listeners
@Component
@Slf4j
public class OrderEventHandlers {
    private final InventoryService inventoryService;
    private final NotificationService notificationService;
    private final ShippingService shippingService;

    @EventListener
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderCreated(OrderCreatedEvent event) {
        Order order = event.getOrder();
        
        try {
            // Update inventory
            inventoryService.reserveItems(order.getItems());
            
            // Schedule shipping
            shippingService.scheduleDelivery(order);
            
            // Notify customer
            notificationService.sendOrderConfirmation(order);
            
        } catch (Exception e) {
            log.error("Error processing order: {}", order.getId(), e);
            // Handle compensation logic
            compensateFailedOrder(order);
        }
    }
}
```

### 4. Caching Implementation
Advanced caching strategies using Spring's caching abstraction.

```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        
        // Configure various caches
        GuavaCache userCache = new GuavaCache("users",
            CacheBuilder.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(1000)
                .build());
                
        GuavaCache productCache = new GuavaCache("products",
            CacheBuilder.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .maximumSize(5000)
                .build());
                
        cacheManager.setCaches(Arrays.asList(userCache, productCache));
        return cacheManager;
    }
}

@Service
public class CachingUserService {
    private final UserRepository userRepository;
    
    @Cacheable(value = "users", key = "#id")
    public User getUser(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
    }
    
    @CachePut(value = "users", key = "#user.id")
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
    
    @CacheEvict(value = "users", allEntries = true)
    public void clearUserCache() {
        // Method to clear all cached user data
    }
}
```

### 5. Aspect-Oriented Programming Use Cases
Implementation of cross-cutting concerns using AOP.

```java
// Performance monitoring aspect
@Aspect
@Component
@Slf4j
public class PerformanceMonitoringAspect {
    @Around("@annotation(Monitored)")
    public Object monitorPerformance(ProceedingJoinPoint joinPoint) 
            throws Throwable {
        long start = System.nanoTime();
        
        try {
            return joinPoint.proceed();
        } finally {
            long duration = System.nanoTime() - start;
            log.info("Method {} took {} ms", 
                joinPoint.getSignature().getName(),
                TimeUnit.NANOSECONDS.toMillis(duration));
        }
    }
}

// Security aspect
@Aspect
@Component
public class SecurityAspect {
    private final SecurityService securityService;

    @Before("@annotation(secured)")
    public void checkSecurity(JoinPoint joinPoint, Secured secured) {
        String[] requiredRoles = secured.value();
        if (!securityService.hasAnyRole(requiredRoles)) {
            throw new AccessDeniedException("Insufficient privileges");
        }
    }
}
```

## Anti-patterns and Common Mistakes

### 1. Bean Management Anti-patterns

#### Singleton State Mutation
```java
// ❌ BAD: Mutable state in singleton bean
@Service
public class UserStateService {
    private List<User> userCache = new ArrayList<>();  // Mutable state
    
    public void addUser(User user) {
        userCache.add(user);  // Thread-unsafe operation
    }
}

// ✅ GOOD: Thread-safe state management
@Service
public class UserStateService {
    private final ConcurrentHashMap<String, User> userCache = 
        new ConcurrentHashMap<>();
    
    public void addUser(User user) {
        userCache.put(user.getId(), user);
    }
}
```

#### Service Locator Pattern
```java
// ❌ BAD: Service locator anti-pattern
public class ServiceLocator {
    private static ApplicationContext context;
    
    public static <T> T getBean(Class<T> clazz) {
        return context.getBean(clazz);
    }
}

// ✅ GOOD: Dependency injection
@Service
public class UserService {
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

### 2. Configuration Anti-patterns

#### Mixed Configuration Styles
```java
// ❌ BAD: Mixing different configuration styles
@Configuration
@ImportResource("classpath:legacy-config.xml")
public class MixedConfig {
    @Bean
    public UserService userService() {
        return new UserService();
    }
}

// ✅ GOOD: Consistent configuration style
@Configuration
public class ModernConfig {
    @Bean
    public LegacyService legacyService(
            @Value("${legacy.property}") String property) {
        return new LegacyService(property);
    }
    
    @Bean
    public UserService userService(LegacyService legacyService) {
        return new UserService(legacyService);
    }
}
```

### 3. Resource Management Anti-patterns

#### Memory Leaks
```java
// ❌ BAD: Memory leak in event listener
@Component
public class LeakyEventListener {
    private final List<String> eventHistory = new ArrayList<>();
    
    @EventListener
    public void handleEvent(BusinessEvent event) {
        eventHistory.add(event.toString());  // List grows indefinitely
    }
}

// ✅ GOOD: Bounded event history
@Component
public class BoundedEventListener {
    private final Queue<String> eventHistory = 
        new CircularFifoQueue<>(1000);  // Fixed size
    
    @EventListener
    public void handleEvent(BusinessEvent event) {
        eventHistory.add(event.toString());
    }
}
```

#### Resource Cleanup
```java
// ❌ BAD: Missing resource cleanup
@Service
public class FileProcessor {
    public void processFile(String path) {
        FileInputStream fis = new FileInputStream(path);
        // Process file without cleanup
    }
}

// ✅ GOOD: Proper resource management
@Service
public class FileProcessor {
    public void processFile(String path) {
        try (FileInputStream fis = new FileInputStream(path)) {
            // Process file with automatic cleanup
        }
    }
}
```

### 4. Transaction Management Anti-patterns

#### Transaction Propagation
```java
// ❌ BAD: Inconsistent transaction boundaries
@Service
public class OrderService {
    @Transactional
    public void processOrder(Order order) {
        saveOrder(order);      // Needs transaction
        processPayment(order); // Needs separate transaction
    }
    
    private void saveOrder(Order order) {
        // Database operations
    }
    
    private void processPayment(Order order) {
        // Payment processing
    }
}

// ✅ GOOD: Clear transaction boundaries
@Service
public class OrderService {
    private final PaymentService paymentService;
    
    @Transactional
    public void processOrder(Order order) {
        saveOrder(order);
        paymentService.processPayment(order);
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processPayment(Order order) {
        // Payment processing in separate transaction
    }
}
```

### 5. Dependency Injection Anti-patterns

#### Constructor Over-injection
```java
// ❌ BAD: Too many dependencies
@Service
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final PushNotificationService pushService;
    private final AuditService auditService;
    private final MetricsService metricsService;
    private final CacheService cacheService;
    // More dependencies...

    public UserService(UserRepository userRepository,
                      EmailService emailService,
                      SmsService smsService,
                      PushNotificationService pushService,
                      AuditService auditService,
                      MetricsService metricsService,
                      CacheService cacheService) {
        // Too many parameters indicates potential design issues
    }
}

// ✅ GOOD: Focused service with composition
@Service
public class UserService {
    private final UserRepository userRepository;
    private final NotificationFacade notificationFacade;
    private final AuditingFacade auditingFacade;

    public UserService(
            UserRepository userRepository,
            NotificationFacade notificationFacade,
            AuditingFacade auditingFacade) {
        this.userRepository = userRepository;
        this.notificationFacade = notificationFacade;
        this.auditingFacade = auditingFacade;
    }
}

@Service
public class NotificationFacade {
    private final EmailService emailService;
    private final SmsService smsService;
    private final PushNotificationService pushService;
    
    // Constructor injection...
}
```

### 6. Event Handling Anti-patterns

#### Event Chain
```java
// ❌ BAD: Long event chain
@Component
public class EventChainExample {
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        // Publishes PaymentEvent
    }
    
    @EventListener
    public void handlePayment(PaymentEvent event) {
        // Publishes ShippingEvent
    }
    
    @EventListener
    public void handleShipping(ShippingEvent event) {
        // Publishes NotificationEvent
    }
}

// ✅ GOOD: Orchestrated process
@Service
public class OrderOrchestrator {
    private final PaymentService paymentService;
    private final ShippingService shippingService;
    private final NotificationService notificationService;

    @Transactional
    public void processOrder(Order order) {
        PaymentResult payment = paymentService.processPayment(order);
        if (payment.isSuccessful()) {
            ShippingResult shipping = shippingService.arrangeShipping(order);
            notificationService.notifyCustomer(order, payment, shipping);
        }
    }
}
```

## Interview Questions and Answers

### 1. Core Container Questions

#### Q: "Explain the difference between BeanFactory and ApplicationContext."
**A**:
```java
// BeanFactory Example
public class BeanFactoryDemo {
    public void demonstrate() {
        // Basic IoC container
        DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
        XmlBeanDefinitionReader reader = new XmlBeanDefinitionReader(factory);
        reader.loadBeanDefinitions(new ClassPathResource("beans.xml"));
        
        // Lazy initialization
        MyBean bean = factory.getBean(MyBean.class);
    }
}

// ApplicationContext Example
public class ApplicationContextDemo {
    public void demonstrate() {
        // Advanced container with enterprise features
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        
        // Additional features demonstration
        context.publishEvent(new CustomEvent("test"));  // Event publishing
        MessageSource messageSource = context;          // i18n support
        Resource resource = context.getResource("classpath:config.xml"); // Resource loading
        Environment env = context.getEnvironment();     // Environment access
    }
}
```
**Key Differences:**
- BeanFactory is basic, ApplicationContext is feature-rich
- BeanFactory uses lazy initialization, ApplicationContext uses eager initialization
- ApplicationContext includes enterprise features (events, i18n, etc.)
- ApplicationContext automatically registers BeanFactoryPostProcessor

#### Q: "How does Spring handle circular dependencies?"
**A**:
```java
// Circular Dependency Example
@Service
public class ServiceA {
    private final ServiceB serviceB;

    // Constructor injection will fail with circular dependency
    public ServiceA(ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}

@Service
public class ServiceB {
    private final ServiceA serviceA;

    public ServiceB(ServiceA serviceA) {
        this.serviceA = serviceA;
    }
}

// Solutions:

// 1. @Lazy annotation
@Service
public class ServiceA {
    private final ServiceB serviceB;

    public ServiceA(@Lazy ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}

// 2. Setter injection
@Service
public class ServiceA {
    private ServiceB serviceB;

    @Autowired
    public void setServiceB(ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}

// 3. Redesign using events
@Service
public class ServiceA {
    private final ApplicationEventPublisher publisher;

    public void doSomething() {
        publisher.publishEvent(new ServiceAEvent());
    }
}

@Service
public class ServiceB {
    @EventListener
    public void handleServiceAEvent(ServiceAEvent event) {
        // Handle event
    }
}
```

### 2. Bean Lifecycle Questions

#### Q: "Explain the complete lifecycle of a Spring bean"
**A**:
```java
@Component
public class CompleteLifecycleDemonstration implements 
        InitializingBean, DisposableBean, 
        BeanNameAware, BeanFactoryAware, ApplicationContextAware {
    
    // 1. Constructor
    public CompleteLifecycleDemonstration() {
        System.out.println("1. Constructor called");
    }

    // 2. Aware interfaces
    @Override
    public void setBeanName(String name) {
        System.out.println("2. Bean name set: " + name);
    }

    @Override
    public void setBeanFactory(BeanFactory factory) {
        System.out.println("3. Bean factory set");
    }

    @Override
    public void setApplicationContext(ApplicationContext context) {
        System.out.println("4. Application context set");
    }

    // 3. Post-construction
    @PostConstruct
    public void postConstruct() {
        System.out.println("5. @PostConstruct called");
    }

    @Override
    public void afterPropertiesSet() {
        System.out.println("6. InitializingBean's afterPropertiesSet called");
    }

    // 4. Custom init method
    @Bean(initMethod = "customInit")
    public void customInit() {
        System.out.println("7. Custom init method called");
    }

    // 5. Pre-destruction
    @PreDestroy
    public void preDestroy() {
        System.out.println("8. @PreDestroy called");
    }

    @Override
    public void destroy() {
        System.out.println("9. DisposableBean's destroy called");
    }

    // 6. Custom destroy method
    @Bean(destroyMethod = "customDestroy")
    public void customDestroy() {
        System.out.println("10. Custom destroy method called");
    }
}
```

### 3. Configuration Questions

#### Q: "Compare different ways of configuring Spring applications"
**A**:
```java
// 1. Java Configuration
@Configuration
@ComponentScan("com.example")
public class JavaConfig {
    @Bean
    @Profile("production")
    public DataSource productionDataSource(
            @Value("${db.url}") String url) {
        return DataSourceBuilder.create()
            .url(url)
            .build();
    }
}

// 2. XML Configuration
<!-- applicationContext.xml -->
<beans>
    <context:component-scan base-package="com.example"/>
    <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource">
        <property name="url" value="${db.url}"/>
    </bean>
</beans>

// 3. Annotation Configuration
@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository repository;
    
    @Value("${app.feature.enabled}")
    private boolean featureEnabled;
}

// 4. Hybrid Configuration
@Configuration
@ImportResource("classpath:legacy-config.xml")
public class HybridConfig {
    @Bean
    public ModernService modernService() {
        return new ModernService();
    }
}
```

### 4. Advanced Spring Features Questions

#### Q: "How would you implement custom scopes in Spring?"
**A**:
```java
// Custom scope implementation
public class ThreadScope implements Scope {
    private final ThreadLocal<Map<String, Object>> threadScope = 
        ThreadLocal.withInitial(HashMap::new);

    @Override
    public Object get(String name, ObjectFactory<?> objectFactory) {
        Map<String, Object> scope = threadScope.get();
        return scope.computeIfAbsent(name, k -> objectFactory.getObject());
    }

    @Override
    public Object remove(String name) {
        return threadScope.get().remove(name);
    }

    @Override
    public void registerDestructionCallback(String name, Runnable callback) {
        // Implementation for cleanup
    }
    
    // Other required methods...
}

// Registering custom scope
@Configuration
public class CustomScopeConfig implements BeanFactoryPostProcessor {
    @Override
    public void postProcessBeanFactory(ConfigurableBeanFactory beanFactory) {
        beanFactory.registerScope("thread", new ThreadScope());
    }
}

// Using custom scope
@Component
@Scope("thread")
public class ThreadScopedBean {
    // Bean implementation
}
```

#### Q: "Explain Spring's transaction propagation levels with examples"
**A**:
```java
@Service
public class TransactionExampleService {
    
    // REQUIRED (Default)
    @Transactional
    public void methodA() {
        // Uses existing transaction or creates new one
    }
    
    // REQUIRES_NEW
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void methodB() {
        // Always creates new transaction
    }
    
    // NESTED
    @Transactional(propagation = Propagation.NESTED)
    public void methodC() {
        // Creates nested transaction if exists, new if none
    }
    
    // SUPPORTS
    @Transactional(propagation = Propagation.SUPPORTS)
    public void methodD() {
        // Uses existing transaction if any, runs non-transactional if none
    }
    
    // Complex example
    @Transactional
    public void complexOperation() {
        methodA();  // Joins current transaction
        try {
            methodB();  // Runs in new transaction
        } catch (Exception e) {
            // Only methodB is rolled back
        }
        methodC();  // Creates savepoint in current transaction
    }
}
```

# Spring Core Summary

## 1. Core Components Covered
- **IoC Container**
    - BeanFactory vs ApplicationContext
    - Bean lifecycle management
    - Dependency injection patterns

- **Configuration Approaches**
    - Java Configuration
    - Annotation-based Configuration
    - Bean registration and management

- **Bean Management**
    - Scopes and lifecycles
    - Bean instantiation strategies
    - Dependency resolution

## 2. Key Implementation Topics

### Dependency Injection
```java
// Best Practice: Constructor Injection
@Service
public class UserService {
    private final UserRepository repository;
    private final EmailService emailService;

    public UserService(UserRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }
}
```

### Configuration Management
```java
@Configuration
@PropertySource("classpath:application.properties")
public class AppConfig {
    @Bean
    public DataSource dataSource(@Value("${db.url}") String url) {
        return DataSourceBuilder.create()
            .url(url)
            .build();
    }
}
```

### Bean Lifecycle
```java
@Component
public class LifecycleBean {
    @PostConstruct
    public void init() {}

    @PreDestroy
    public void cleanup() {}
}
```

## 3. Best Practices Highlighted

### Do's ✅
- Use constructor injection
- Implement proper resource cleanup
- Follow single responsibility principle
- Use appropriate scopes
- Implement proper exception handling

### Don'ts ❌
- Avoid field injection
- Avoid circular dependencies
- Don't use singleton beans with mutable state
- Avoid mixing configuration styles
- Don't use Service Locator pattern

## 4. Common Design Patterns Used

### Factory Pattern
```java
@Configuration
public class ServiceFactory {
    @Bean
    public PaymentService paymentService() {
        return new PaymentServiceImpl();
    }
}
```

### Builder Pattern
```java
@Component
public class QueryBuilder {
    public Query build() {
        return Query.builder()
            .withParameters()
            .withConditions()
            .build();
    }
}
```

### Template Pattern
```java
@Component
public abstract class AbstractProcessor {
    public final void process() {
        preProcess();
        doProcess();
        postProcess();
    }

    protected abstract void doProcess();
}
```

## 5. Important Interfaces Covered
- ApplicationContext
- BeanFactory
- BeanDefinition
- InitializingBean
- DisposableBean

## 6. Key Concepts Emphasized

### Dependency Management
- Proper injection techniques
- Dependency resolution
- Scope management

### Configuration
- Modular configuration
- Environment-specific settings
- Property management

### Resource Management
- Proper cleanup
- Resource handling
- Memory management

## 7. Critical Anti-patterns Identified
- Service Locator pattern
- Singleton state mutation
- Resource leaks
- Circular dependencies
- Over-injection

## 8. Interview Topics Covered
- Bean lifecycle
- Configuration approaches
- Dependency injection
- Transaction management
- Scope implementation
- Bean post-processing

## Next Steps
1. **Spring Data**
    - JPA integration
    - Transaction management
    - Repository pattern

2. **Spring Security**
    - Authentication
    - Authorization
    - Security configurations

3. **Spring Cloud**
    - Service discovery
    - Configuration management
    - Circuit breakers
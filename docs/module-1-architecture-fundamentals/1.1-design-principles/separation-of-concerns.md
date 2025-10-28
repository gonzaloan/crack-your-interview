# Separation of Concerns

Separation of Concerns (SoC) is the principle of dividing a program into distinct sections, each addressing a separate concern or responsibility. A "concern" is a specific aspect of functionality, such as business logic, data access, or user interface. This principle reduces complexity by ensuring that each component focuses on a single aspect of the system.

## Key Concepts

- **Single focus**: Each module, class, or function should address one specific concern and not mix multiple responsibilities
- **Low coupling**: Components handling different concerns should be loosely coupled, minimizing dependencies between them
- **High cohesion**: Code handling the same concern should be grouped together, making it easier to locate and modify
- **Layered architecture**: Common implementation uses layers (presentation, business logic, data access) with clear boundaries
- **Maintainability**: Changes to one concern shouldn't ripple across the entire system; modifications are localized

## Diagram

```
Separation of Concerns in Layered Architecture:

┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  Concern: User Interface & User Interaction                 │
│  (Controllers, Views, API Endpoints)                        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/Events
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
│  Concern: Core Business Rules & Domain Logic                │
│  (Services, Domain Models, Business Validations)            │
└────────────────────┬────────────────────────────────────────┘
                     │ Method Calls
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                        │
│  Concern: Data Persistence & Retrieval                      │
│  (Repositories, DAOs, Database Queries)                     │
└────────────────────┬────────────────────────────────────────┘
                     │ SQL/NoSQL
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       Database                              │
└─────────────────────────────────────────────────────────────┘


Example: User Registration Flow

  Browser ──────► Controller ──────► Service ──────► Repository ──────► DB
              (Presentation)     (Business)      (Data Access)

  Concerns:
  - Controller: HTTP handling, validation, response formatting
  - Service: Business rules, password hashing, email notification
  - Repository: Database operations, query optimization
```

## Example in Java

```java
// Presentation Layer - Handles HTTP concerns
@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/users")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        User user = userService.createUser(userDTO);
        return ResponseEntity.ok(UserDTO.from(user));
    }
}

// Business Logic Layer - Handles domain concerns
@Service
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public User createUser(UserDTO userDTO) {
        // Business logic: validation, password hashing
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new UserAlreadyExistsException();
        }

        User user = new User(userDTO.getEmail(), hashPassword(userDTO.getPassword()));
        User savedUser = userRepository.save(user);

        // Business logic: send welcome email
        emailService.sendWelcomeEmail(savedUser.getEmail());

        return savedUser;
    }

    private String hashPassword(String password) {
        // Password hashing logic
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }
}

// Data Access Layer - Handles persistence concerns
@Repository
public class UserRepository {
    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public User save(User user) {
        String sql = "INSERT INTO users (email, password) VALUES (?, ?)";
        jdbcTemplate.update(sql, user.getEmail(), user.getPassword());
        return user;
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }
}
```

## Example in Go

```go
package main

import (
    "database/sql"
    "net/http"
)

// Presentation Layer - Handles HTTP concerns
type UserController struct {
    userService *UserService
}

func NewUserController(userService *UserService) *UserController {
    return &UserController{userService: userService}
}

func (c *UserController) CreateUser(w http.ResponseWriter, r *http.Request) {
    var userDTO UserDTO
    // Parse request, handle HTTP concerns
    json.NewDecoder(r.Body).Decode(&userDTO)

    user, err := c.userService.CreateUser(userDTO)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Format response, handle HTTP concerns
    json.NewEncoder(w).Encode(user)
}

// Business Logic Layer - Handles domain concerns
type UserService struct {
    userRepo     *UserRepository
    emailService *EmailService
}

func NewUserService(userRepo *UserRepository, emailService *EmailService) *UserService {
    return &UserService{
        userRepo:     userRepo,
        emailService: emailService,
    }
}

func (s *UserService) CreateUser(userDTO UserDTO) (*User, error) {
    // Business logic: validation
    exists, err := s.userRepo.ExistsByEmail(userDTO.Email)
    if err != nil {
        return nil, err
    }
    if exists {
        return nil, errors.New("user already exists")
    }

    // Business logic: password hashing
    hashedPassword := hashPassword(userDTO.Password)
    user := &User{
        Email:    userDTO.Email,
        Password: hashedPassword,
    }

    // Save user
    savedUser, err := s.userRepo.Save(user)
    if err != nil {
        return nil, err
    }

    // Business logic: send welcome email
    s.emailService.SendWelcomeEmail(savedUser.Email)

    return savedUser, nil
}

func hashPassword(password string) string {
    // Password hashing logic
    return bcrypt.HashPassword(password)
}

// Data Access Layer - Handles persistence concerns
type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (r *UserRepository) Save(user *User) (*User, error) {
    query := "INSERT INTO users (email, password) VALUES ($1, $2)"
    _, err := r.db.Exec(query, user.Email, user.Password)
    return user, err
}

func (r *UserRepository) ExistsByEmail(email string) (bool, error) {
    query := "SELECT COUNT(*) FROM users WHERE email = $1"
    var count int
    err := r.db.QueryRow(query, email).Scan(&count)
    return count > 0, err
}
```

## Key Takeaways

- **When to apply**: Always separate concerns from the beginning; refactoring mixed concerns later is expensive
- **Layer benefits**: Each layer can be tested, modified, or replaced independently without affecting others
- **Database independence**: Business logic shouldn't know about database implementation details
- **UI independence**: Business logic shouldn't depend on specific UI framework or presentation format
- **Testing advantage**: Separated concerns make unit testing easier; mock dependencies for each layer
- **Common pitfall**: Leaking concerns across boundaries (e.g., SQL in controllers, HTTP status codes in services)
- **Warning sign**: If changing database requires modifying UI code, concerns aren't properly separated
- **Pro tip**: Use dependency injection to enforce separation and make dependencies explicit
- **Remember**: "Separation of Concerns is not about separating code, it's about separating responsibilities"

## Related Concepts

- **Single Responsibility Principle**: SoC is the broader principle; SRP applies it at the class/function level
- **Layered Architecture**: Direct implementation of SoC using horizontal layers (presentation, business, data)
- **Hexagonal Architecture**: Takes SoC further by isolating core business logic from external concerns
- **Model-View-Controller (MVC)**: UI pattern implementing SoC by separating data, presentation, and control logic

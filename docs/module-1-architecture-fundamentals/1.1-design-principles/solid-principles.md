# SOLID Principles

SOLID is an acronym for five design principles that make software designs more understandable, flexible, and maintainable. These principles guide developers in creating code that's easier to refactor, test, and extend. Following SOLID principles reduces code complexity and minimizes the risk of introducing bugs when making changes.

## Key Concepts

- **Single Responsibility Principle (SRP)**: A class should have only one reason to change, meaning it should have only one job or responsibility
- **Open/Closed Principle (OCP)**: Software entities should be open for extension but closed for modification
- **Liskov Substitution Principle (LSP)**: Objects of a superclass should be replaceable with objects of its subclasses without breaking the application
- **Interface Segregation Principle (ISP)**: Clients should not be forced to depend on interfaces they don't use
- **Dependency Inversion Principle (DIP)**: High-level modules should not depend on low-level modules; both should depend on abstractions

## Example in Java

### ❌ WRONG: The God Class of Doom (Violates Multiple SOLID Principles)

```java
// This class does EVERYTHING - a classic violation of SRP
class PizzaOrderGodClass {
    // Handles database connection (responsibility #1)
    public void saveToDatabase(String pizza) {
        MySQLConnection conn = new MySQLConnection("localhost"); // Violates DIP!
        conn.execute("INSERT INTO pizzas VALUES ('" + pizza + "')");
    }

    // Sends emails (responsibility #2)
    public void notifyCustomer(String email, String pizza) {
        SmtpServer smtp = new SmtpServer(); // Violates DIP!
        smtp.send(email, "Your " + pizza + " is ready!");
    }

    // Calculates price (responsibility #3)
    public double calculatePrice(String size) {
        if (size.equals("small")) return 10.0;
        if (size.equals("medium")) return 15.0;
        if (size.equals("large")) return 20.0;
        return 0.0;
    }

    // Processes payment (responsibility #4)
    public void charge(String cardNumber, double amount) {
        // Directly coupled to specific payment provider - Violates OCP!
        StripeAPI stripe = new StripeAPI();
        stripe.charge(cardNumber, amount);
    }
}

// Fat interface - forces classes to implement methods they don't need (Violates ISP)
interface PizzaMaker {
    void makePizza();
    void deliverPizza();
    void washDishes();
    void mopFloor();
}

class PizzaChef implements PizzaMaker {
    public void makePizza() { /* Chef makes pizza */ }
    public void deliverPizza() { /* Chef shouldn't deliver! */ throw new UnsupportedOperationException(); }
    public void washDishes() { /* Chef shouldn't wash dishes! */ throw new UnsupportedOperationException(); }
    public void mopFloor() { /* Chef shouldn't mop! */ throw new UnsupportedOperationException(); }
}
```

### ✅ CORRECT: SOLID Pizza Shop

```java
// ===== Single Responsibility Principle =====
// Each class has ONE reason to change

class PizzaRepository {
    public void save(Pizza pizza) {
        // Only handles database operations
        System.out.println("Saving pizza to database: " + pizza.getName());
    }
}

class EmailNotificationService {
    public void sendOrderConfirmation(String email, Pizza pizza) {
        // Only handles email notifications
        System.out.println("Sending email to " + email + " about " + pizza.getName());
    }
}

class PizzaPriceCalculator {
    public double calculate(PizzaSize size) {
        // Only handles price calculations
        return switch (size) {
            case SMALL -> 10.0;
            case MEDIUM -> 15.0;
            case LARGE -> 20.0;
            case EXTRA_LARGE -> 25.0;
        };
    }
}

// ===== Open/Closed Principle =====
// Open for extension, closed for modification

interface PaymentProcessor {
    void processPayment(double amount);
}

class CreditCardPaymentProcessor implements PaymentProcessor {
    public void processPayment(double amount) {
        System.out.println("Charging $" + amount + " to credit card");
    }
}

class PayPalPaymentProcessor implements PaymentProcessor {
    public void processPayment(double amount) {
        System.out.println("Charging $" + amount + " via PayPal");
    }
}

class CryptoPaymentProcessor implements PaymentProcessor {
    public void processPayment(double amount) {
        System.out.println("Charging $" + amount + " in Bitcoin");
    }
}

// Adding new payment methods doesn't require modifying existing code!

// ===== Liskov Substitution Principle =====
// Subtypes must be substitutable for their base types

abstract class Beverage {
    protected String name;
    public abstract double getPrice();
}

class Soda extends Beverage {
    public Soda() { this.name = "Soda"; }
    public double getPrice() { return 2.0; }
}

class Beer extends Beverage {
    public Beer() { this.name = "Beer"; }
    public double getPrice() { return 5.0; }
}

// Any Beverage can be used interchangeably
void addBeverageToOrder(Beverage beverage) {
    System.out.println("Adding " + beverage.name + " - $" + beverage.getPrice());
}

// ===== Interface Segregation Principle =====
// Clients shouldn't depend on interfaces they don't use

interface PizzaMaker {
    void makePizza();
}

interface PizzaDeliverer {
    void deliverPizza();
}

interface KitchenCleaner {
    void washDishes();
    void mopFloor();
}

class Chef implements PizzaMaker {
    public void makePizza() {
        System.out.println("Chef is making a delicious pizza!");
    }
}

class DeliveryDriver implements PizzaDeliverer {
    public void deliverPizza() {
        System.out.println("Delivering hot pizza to customer!");
    }
}

class JanitorBob implements KitchenCleaner {
    public void washDishes() {
        System.out.println("Bob is washing dishes");
    }
    public void mopFloor() {
        System.out.println("Bob is mopping the floor");
    }
}

// ===== Dependency Inversion Principle =====
// Depend on abstractions, not concretions

interface PizzaStorage {
    void store(Pizza pizza);
}

class DatabaseStorage implements PizzaStorage {
    public void store(Pizza pizza) {
        System.out.println("Storing in MySQL database");
    }
}

class FileStorage implements PizzaStorage {
    public void store(Pizza pizza) {
        System.out.println("Storing in file system");
    }
}

class PizzaOrderService {
    private final PizzaStorage storage; // Depends on abstraction!

    public PizzaOrderService(PizzaStorage storage) {
        this.storage = storage; // Can be ANY storage implementation
    }

    public void placeOrder(Pizza pizza) {
        storage.store(pizza); // Doesn't care about implementation details
    }
}
```

## Example in Go

### ❌ WRONG: The Taco Truck of Chaos (Violates Multiple SOLID Principles)

```go
package main

import "fmt"

// This struct does EVERYTHING - massive SRP violation!
type TacoTruckGodStruct struct {
    dbConnection *MySQLConnection // Violates DIP - depends on concrete type!
}

func (t *TacoTruckGodStruct) ProcessOrder(tacoType string, customerEmail string, cardNumber string) {
    // Responsibility #1: Calculate price
    var price float64
    if tacoType == "chicken" {
        price = 3.50
    } else if tacoType == "beef" {
        price = 4.00
    } else {
        price = 3.00
    }

    // Responsibility #2: Save to database
    t.dbConnection.Execute("INSERT INTO orders...") // Tightly coupled to MySQL!

    // Responsibility #3: Process payment
    stripe := &StripeAPI{} // Violates OCP - can't add new payment methods easily!
    stripe.Charge(cardNumber, price)

    // Responsibility #4: Send email
    smtp := &SmtpMailer{} // Violates DIP!
    smtp.SendEmail(customerEmail, "Your taco is ready!")

    // Responsibility #5: Print receipt
    fmt.Println("Receipt for taco...")
}

// Fat interface - forces unnecessary implementations (Violates ISP)
type TacoWorker interface {
    CookTacos()
    DeliverOrders()
    CleanKitchen()
    ManageMoney()
    FixTruck()
}

type TacoCook struct{}

func (c TacoCook) CookTacos() { fmt.Println("Cooking tacos!") }
func (c TacoCook) DeliverOrders() { panic("Cook doesn't deliver!") }
func (c TacoCook) CleanKitchen() { panic("Cook doesn't clean!") }
func (c TacoCook) ManageMoney() { panic("Cook doesn't manage money!") }
func (c TacoCook) FixTruck() { panic("Cook doesn't fix trucks!") }
```

### ✅ CORRECT: The Well-Organized Taco Empire

```go
package main

import "fmt"

// ===== Single Responsibility Principle =====
// Each struct has ONE job

type TacoRepository struct{}

func (r *TacoRepository) Save(taco Taco) error {
    // Only handles data persistence
    fmt.Println("Saving taco to database:", taco.Type)
    return nil
}

type EmailNotifier struct{}

func (n *EmailNotifier) SendOrderConfirmation(email string, taco Taco) error {
    // Only handles email notifications
    fmt.Printf("Sending email to %s about %s taco\n", email, taco.Type)
    return nil
}

type TacoPriceCalculator struct{}

func (c *TacoPriceCalculator) Calculate(tacoType TacoType) float64 {
    // Only handles pricing logic
    switch tacoType {
    case Chicken:
        return 3.50
    case Beef:
        return 4.00
    case Fish:
        return 4.50
    default:
        return 3.00
    }
}

// ===== Open/Closed Principle =====
// Open for extension, closed for modification

type PaymentProcessor interface {
    ProcessPayment(amount float64) error
}

type CreditCardProcessor struct{}

func (p *CreditCardProcessor) ProcessPayment(amount float64) error {
    fmt.Printf("Charging $%.2f to credit card\n", amount)
    return nil
}

type VenmoProcessor struct{}

func (p *VenmoProcessor) ProcessPayment(amount float64) error {
    fmt.Printf("Charging $%.2f via Venmo\n", amount)
    return nil
}

type BitcoinProcessor struct{}

func (p *BitcoinProcessor) ProcessPayment(amount float64) error {
    fmt.Printf("Charging $%.2f in Bitcoin\n", amount)
    return nil
}

// Adding new payment methods doesn't modify existing code!

// ===== Liskov Substitution Principle =====
// Subtypes must be substitutable for base types

type SideDish interface {
    GetPrice() float64
    GetName() string
}

type Chips struct{}

func (c Chips) GetPrice() float64 { return 1.50 }
func (c Chips) GetName() string   { return "Chips" }

type Guacamole struct{}

func (g Guacamole) GetPrice() float64 { return 2.00 }
func (g Guacamole) GetName() string   { return "Guacamole" }

// Any SideDish can be used interchangeably
func AddSideToOrder(side SideDish) {
    fmt.Printf("Adding %s - $%.2f\n", side.GetName(), side.GetPrice())
}

// ===== Interface Segregation Principle =====
// Small, focused interfaces

type TacoCooker interface {
    CookTaco() error
}

type OrderDeliverer interface {
    DeliverOrder() error
}

type KitchenCleaner interface {
    CleanKitchen() error
}

type ChefCarlos struct{}

func (c ChefCarlos) CookTaco() error {
    fmt.Println("Carlos is cooking an amazing taco!")
    return nil
}

type DriverDiana struct{}

func (d DriverDiana) DeliverOrder() error {
    fmt.Println("Diana is delivering your order!")
    return nil
}

type JanitorJake struct{}

func (j JanitorJake) CleanKitchen() error {
    fmt.Println("Jake is cleaning the kitchen!")
    return nil
}

// Each role only implements what they need!

// ===== Dependency Inversion Principle =====
// Depend on abstractions, not concrete implementations

type TacoStorage interface {
    Store(taco Taco) error
}

type PostgresStorage struct{}

func (s *PostgresStorage) Store(taco Taco) error {
    fmt.Println("Storing in PostgreSQL database")
    return nil
}

type RedisStorage struct{}

func (s *RedisStorage) Store(taco Taco) error {
    fmt.Println("Storing in Redis cache")
    return nil
}

type TacoOrderService struct {
    storage TacoStorage // Depends on interface, not concrete type!
}

func NewTacoOrderService(storage TacoStorage) *TacoOrderService {
    return &TacoOrderService{storage: storage}
}

func (s *TacoOrderService) PlaceOrder(taco Taco) error {
    return s.storage.Store(taco) // Works with ANY storage implementation!
}

// Usage example:
// service := NewTacoOrderService(&PostgresStorage{})  // or &RedisStorage{}
// service.PlaceOrder(taco)
```

## Key Takeaways

- **When to use**: Apply SOLID principles from the beginning of any project to ensure maintainability and scalability
- **SRP benefit**: Makes code easier to test and reduces coupling between different concerns
- **OCP benefit**: Allows adding new functionality without modifying existing code, reducing regression risk
- **LSP warning**: Violation often indicates poor inheritance design; prefer composition over inheritance
- **ISP benefit**: Prevents "fat interfaces" that force clients to depend on methods they don't use
- **DIP benefit**: Makes code more flexible and testable by depending on abstractions rather than concrete implementations
- **Common pitfall**: Over-engineering simple solutions; apply SOLID pragmatically, not dogmatically
- **Pro tip**: Start with SRP and DIP—they provide the most immediate benefits and naturally lead to other principles
- **Remember**: SOLID principles work together; applying one often naturally encourages others

## Related Concepts

- **Design Patterns**: SOLID principles form the foundation for many Gang of Four design patterns
- **Clean Architecture**: SOLID principles are core tenets of clean architecture and hexagonal architecture
- **Test-Driven Development**: Following SOLID makes code more testable and TDD more effective

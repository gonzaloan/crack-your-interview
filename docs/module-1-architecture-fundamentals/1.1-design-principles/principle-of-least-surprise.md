# Principle of Least Astonishment (POLA)

The Principle of Least Astonishment (also called Principle of Least Surprise) states that a system should behave in a way that users expect. Functions, classes, and APIs should do what their names suggest and follow established conventions. When code behaves unexpectedly, it creates cognitive overhead, bugs, and maintenance challenges.

## Key Concepts

- **Intuitive behavior**: Code should behave exactly as its name, signature, and context suggest—no hidden surprises
- **Consistent conventions**: Follow established patterns, naming conventions, and idioms of the language and framework
- **Clear naming**: Function and variable names should accurately describe what they do; misleading names violate POLA
- **Expected side effects**: Functions should only produce side effects that users would reasonably expect based on the name
- **Discoverability**: APIs should be easy to learn and hard to misuse; users should intuitively understand how to use them

## Diagram

```
Violation of POLA vs. Following POLA:

❌ VIOLATES POLA (Surprising Behavior):

    calculateTotal(items)  ───► Returns total
                               AND
                               Saves to database (SURPRISE!)
                               Sends email (SURPRISE!)
                               Logs user out (SURPRISE!)


✅ FOLLOWS POLA (Expected Behavior):

    calculateTotal(items)  ───► Returns total (AS EXPECTED)

    saveOrder(order)       ───► Saves to database (AS EXPECTED)

    sendOrderEmail(order)  ───► Sends email (AS EXPECTED)


Naming Impact:

❌ BAD (Surprising):
    getUserData()          ───► Deletes user?! 😱
    isValid()              ───► Modifies state?! 😱
    getData()              ───► Makes HTTP call?! 😱

✅ GOOD (Expected):
    deleteUser()           ───► Deletes user ✓
    validateAndUpdate()    ───► Validates AND updates ✓
    fetchDataFromAPI()     ───► Makes HTTP call ✓


API Design:

❌ VIOLATES POLA:
    list.add(item)         ───► Returns void (Java)
    list.append(item)      ───► Returns new list (Python)
                               [Different behaviors, same concept]

✅ FOLLOWS POLA:
    list.add(item)         ───► Mutates list, returns void
    list.with(item)        ───► Returns new list (immutable)
                               [Names indicate behavior]
```

## Example in Java

```java
// ❌ VIOLATES Principle of Least Astonishment
class UserService {
    // Surprise #1: Getter has side effects
    public User getUser(String id) {
        User user = repository.findById(id);
        user.incrementLoginCount(); // SURPRISE! Modifying state
        emailService.sendLoginNotification(user); // SURPRISE! Sending email
        return user;
    }

    // Surprise #2: Calculate method saves data
    public double calculateOrderTotal(Order order) {
        double total = order.getItems().stream()
            .mapToDouble(Item::getPrice)
            .sum();
        orderRepository.save(order); // SURPRISE! Saving to DB
        return total;
    }

    // Surprise #3: Boolean method name but returns String
    public String isEmailValid(String email) {
        return email.contains("@") ? "valid" : "invalid"; // SURPRISE! Not boolean
    }
}

// ✅ FOLLOWS Principle of Least Astonishment
class UserService {
    // Clear: Getter just retrieves data
    public User getUser(String id) {
        return repository.findById(id);
    }

    // Clear: Name indicates action being performed
    public User recordUserLogin(String id) {
        User user = repository.findById(id);
        user.incrementLoginCount();
        repository.save(user);
        emailService.sendLoginNotification(user);
        return user;
    }

    // Clear: Calculate only calculates
    public double calculateOrderTotal(Order order) {
        return order.getItems().stream()
            .mapToDouble(Item::getPrice)
            .sum();
    }

    // Clear: Save method saves
    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    // Clear: Boolean method returns boolean
    public boolean isEmailValid(String email) {
        return email != null && email.contains("@");
    }
}

// API Design Example
class ShoppingCart {
    private List<Item> items = new ArrayList<>();

    // ✅ GOOD: Mutating method uses verb
    public void addItem(Item item) {
        items.add(item);
    }

    // ✅ GOOD: Non-mutating method indicates immutability
    public ShoppingCart withItem(Item item) {
        ShoppingCart newCart = new ShoppingCart();
        newCart.items.addAll(this.items);
        newCart.items.add(item);
        return newCart;
    }
}
```

## Example in Go

```go
package main

// ❌ VIOLATES Principle of Least Astonishment
type UserService struct {
    repo         *UserRepository
    emailService *EmailService
}

// Surprise #1: Getter has side effects
func (s *UserService) GetUser(id string) (*User, error) {
    user, err := s.repo.FindByID(id)
    if err != nil {
        return nil, err
    }

    user.LoginCount++ // SURPRISE! Modifying state
    s.emailService.SendLoginNotification(user) // SURPRISE! Sending email
    return user, nil
}

// Surprise #2: Calculate method saves data
func (s *UserService) CalculateOrderTotal(order *Order) float64 {
    var total float64
    for _, item := range order.Items {
        total += item.Price
    }
    s.repo.SaveOrder(order) // SURPRISE! Saving to DB
    return total
}

// ✅ FOLLOWS Principle of Least Astonishment
type UserServiceGood struct {
    repo         *UserRepository
    emailService *EmailService
}

// Clear: Getter just retrieves data
func (s *UserServiceGood) GetUser(id string) (*User, error) {
    return s.repo.FindByID(id)
}

// Clear: Name indicates all actions being performed
func (s *UserServiceGood) RecordUserLogin(id string) (*User, error) {
    user, err := s.repo.FindByID(id)
    if err != nil {
        return nil, err
    }

    user.LoginCount++
    if err := s.repo.Save(user); err != nil {
        return nil, err
    }

    s.emailService.SendLoginNotification(user)
    return user, nil
}

// Clear: Calculate only calculates
func (s *UserServiceGood) CalculateOrderTotal(order *Order) float64 {
    var total float64
    for _, item := range order.Items {
        total += item.Price
    }
    return total
}

// Clear: Save method saves
func (s *UserServiceGood) SaveOrder(order *Order) error {
    return s.repo.SaveOrder(order)
}

// Clear: Validation returns boolean
func (s *UserServiceGood) IsEmailValid(email string) bool {
    return email != "" && strings.Contains(email, "@")
}

// API Design Example
type ShoppingCart struct {
    items []Item
}

// ✅ GOOD: Clear that this mutates the cart
func (c *ShoppingCart) AddItem(item Item) {
    c.items = append(c.items, item)
}

// ✅ GOOD: "With" prefix indicates immutability (common Go pattern)
func (c *ShoppingCart) WithItem(item Item) *ShoppingCart {
    newCart := &ShoppingCart{
        items: make([]Item, len(c.items)),
    }
    copy(newCart.items, c.items)
    newCart.items = append(newCart.items, item)
    return newCart
}
```

## Key Takeaways

- **When to apply**: Always; POLA should guide every naming and design decision
- **Naming matters**: Spend time choosing accurate names; misleading names cause more bugs than bad logic
- **Side effects**: If a function has side effects, the name should indicate it (e.g., `saveAndNotify` not just `save`)
- **Return types**: Boolean-named methods (`isValid`, `hasPermission`) should return booleans, not strings or objects
- **Getters should get**: Methods starting with `get` should retrieve data without side effects
- **Follow conventions**: Use language/framework idioms (e.g., `with*` for immutable operations in functional languages)
- **Common pitfall**: Hiding complex operations behind simple names (e.g., `toString()` making database calls)
- **Warning sign**: If you need extensive documentation to explain what a function does, the name probably violates POLA
- **Pro tip**: Code reviews should actively challenge surprising behavior; ask "Would this surprise a new team member?"
- **Remember**: "Code should read like well-written prose" - functions should do exactly what their name says, nothing more

## Related Concepts

- **KISS Principle**: Simple, unsurprising code is easier to understand and maintain
- **Single Responsibility Principle**: Functions with single responsibility are less likely to surprise users
- **API Design**: POLA is fundamental to creating usable, learnable APIs
- **Clean Code**: Meaningful names and predictable behavior are core clean code principles

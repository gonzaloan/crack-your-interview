# DRY, KISS, YAGNI

Three fundamental principles that guide developers toward writing simpler, more maintainable code. DRY (Don't Repeat Yourself) eliminates duplication, KISS (Keep It Simple, Stupid) favors simplicity over complexity, and YAGNI (You Aren't Gonna Need It) prevents premature optimization. Together, they combat over-engineering and technical debt.

## Key Concepts

- **DRY (Don't Repeat Yourself)**: Every piece of knowledge should have a single, unambiguous representation in the system—avoid code duplication
- **KISS (Keep It Simple, Stupid)**: Simplicity should be a key goal; most systems work best if kept simple rather than made complex
- **YAGNI (You Aren't Gonna Need It)**: Don't add functionality until it's actually needed—avoid premature optimization and speculative features
- **Balance**: These principles must be balanced with each other and with other design goals; extreme adherence can be counterproductive
- **Context matters**: Apply these principles pragmatically based on team size, project complexity, and business requirements

## Diagram

```
Principle Application Flow:

    New Feature Request
           │
           ▼
    ┌──────────────────┐
    │  YAGNI Check     │──────► Do we need this NOW?
    └──────┬───────────┘         │
           │ YES                 │ NO → Don't build it
           ▼                     │
    ┌──────────────────┐         │
    │  KISS Design     │◄────────┘
    │  Keep it simple  │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │  DRY Check       │──────► Is there duplication?
    └──────┬───────────┘         │
           │ NO                  │ YES → Refactor
           ▼                     │
    ┌──────────────────┐         │
    │  Implement       │◄────────┘
    └──────────────────┘


DRY Violation Example:
    Before (Duplicated):              After (DRY):
    ┌────────────────┐               ┌────────────────┐
    │ calculateTax() │               │ calculateTax() │
    │   tax logic    │◄──────────────┤   tax logic    │
    └────────────────┘               └────────────────┘
    ┌────────────────┐                      ▲
    │ calculateTax() │                      │
    │   tax logic    │                      │ reuse
    └────────────────┘                      │
    ┌────────────────┐               ┌─────┴──────────┐
    │ calculateTax() │               │   All callers  │
    │   tax logic    │               └────────────────┘
    └────────────────┘
```

## Example in Java

```java
// DRY Principle - Before (Violation)
class OrderService {
    public double calculateDiscount(Order order) {
        if (order.getTotal() > 100 && order.getCustomer().isPremium()) {
            return order.getTotal() * 0.15;
        }
        return order.getTotal() * 0.05;
    }
}

class InvoiceService {
    public double calculateDiscount(Invoice invoice) {
        if (invoice.getTotal() > 100 && invoice.getCustomer().isPremium()) {
            return invoice.getTotal() * 0.15; // Duplicated logic
        }
        return invoice.getTotal() * 0.05;
    }
}

// DRY Principle - After (Fixed)
class DiscountCalculator {
    public double calculate(double total, boolean isPremium) {
        if (total > 100 && isPremium) {
            return total * 0.15;
        }
        return total * 0.05;
    }
}

// KISS Principle - Simple is better
class UserValidator {
    public boolean isValid(User user) {
        return user != null
            && user.getEmail() != null
            && user.getEmail().contains("@");
    }
}

// YAGNI Principle - Don't build what you don't need
class ShoppingCart {
    private List<Item> items = new ArrayList<>();

    public void addItem(Item item) {
        items.add(item);
    }

    public double getTotal() {
        return items.stream()
                   .mapToDouble(Item::getPrice)
                   .sum();
    }

    // DON'T add methods like:
    // - exportToXML() - unless XML export is needed NOW
    // - applyFutureDiscounts() - unless future discounts are needed NOW
    // - calculateShippingToMars() - unless... you get the idea
}
```

## Example in Go

```go
package main

// DRY Principle - Before (Violation)
type OrderService struct{}

func (s *OrderService) CalculateDiscount(total float64, isPremium bool) float64 {
    if total > 100 && isPremium {
        return total * 0.15
    }
    return total * 0.05
}

type InvoiceService struct{}

func (s *InvoiceService) CalculateDiscount(total float64, isPremium bool) float64 {
    if total > 100 && isPremium {
        return total * 0.15 // Duplicated logic
    }
    return total * 0.05
}

// DRY Principle - After (Fixed)
type DiscountCalculator struct{}

func (c *DiscountCalculator) Calculate(total float64, isPremium bool) float64 {
    if total > 100 && isPremium {
        return total * 0.15
    }
    return total * 0.05
}

// Now both services use the same calculator
func (s *OrderService) GetDiscount(total float64, isPremium bool) float64 {
    calc := &DiscountCalculator{}
    return calc.Calculate(total, isPremium)
}

// KISS Principle - Simple is better
type UserValidator struct{}

func (v *UserValidator) IsValid(email string) bool {
    return email != "" && strings.Contains(email, "@")
}

// YAGNI Principle - Don't build what you don't need
type ShoppingCart struct {
    items []Item
}

func (c *ShoppingCart) AddItem(item Item) {
    c.items = append(c.items, item)
}

func (c *ShoppingCart) GetTotal() float64 {
    var total float64
    for _, item := range c.items {
        total += item.Price
    }
    return total
}

// DON'T add methods like:
// - ExportToXML() - unless XML export is needed NOW
// - ApplyFutureDiscounts() - unless future discounts are needed NOW
```

## Key Takeaways

- **When to apply DRY**: When you see the same logic in 3+ places (Rule of Three); don't DRY too early
- **When to violate DRY**: Accidental duplication that serves different business contexts; premature abstraction is worse than duplication
- **KISS benefit**: Simple code is easier to understand, test, debug, and maintain; complexity should be justified
- **KISS in practice**: Prefer straightforward solutions over clever ones; avoid unnecessary patterns and abstractions
- **YAGNI benefit**: Reduces wasted effort, keeps codebase lean, and prevents maintenance burden of unused features
- **YAGNI warning**: Don't confuse YAGNI with poor planning; architectural decisions (databases, frameworks) require forethought
- **Common pitfall**: Over-abstracting in the name of DRY; sometimes duplication is better than wrong abstraction
- **Pro tip**: YAGNI + KISS together prevent over-engineering; DRY prevents maintenance nightmares
- **Remember**: "Duplication is far cheaper than the wrong abstraction" - Sandi Metz

## Related Concepts

- **SOLID Principles**: DRY aligns with Single Responsibility Principle; these principles complement each other
- **Refactoring**: DRY is often achieved through refactoring; apply when patterns emerge, not speculatively
- **Technical Debt**: Violating these principles creates technical debt; following them reduces long-term costs

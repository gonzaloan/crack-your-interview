---
sidebar_position: 2
title: "DDD Value Objects"
description: "DDD Value Objects"
---

# Value Objects in Domain-Driven Design 💎

## Overview and Problem Statement

In many software systems, we often need to represent concepts that are defined by their attributes rather than any sense of identity. For instance, when describing a color, weight, or monetary amount, we care about what it is, not which specific instance it is. Unfortunately, many codebases treat these concepts as primitive types or basic data structures, leading to scattered business rules, inconsistent validation, and difficult-to-maintain code.

Value Objects in Domain-Driven Design solve this problem by encapsulating these attribute-based concepts into immutable objects that express both their data and related behaviors. Unlike entities, which track identity through time, value objects are replaceable and interchangeable as long as their attributes are the same.

The business impact of properly implementing value objects includes:
- Improved code maintainability through centralized business rules
- Reduced bugs through consistent validation
- Better domain modeling that captures business concepts precisely
- Enhanced code reusability across different parts of the system
- Clearer and more expressive domain model

## Core Concepts and Implementation 🏗️

Let's explore how to implement value objects effectively, starting with a classic example - Money:

```java
public final class Money {
    private final BigDecimal amount;
    private final Currency currency;
    
    public Money(BigDecimal amount, Currency currency) {
        // Validate the attributes
        validateAmount(amount);
        this.amount = amount.setScale(
            currency.getDefaultFractionDigits(), 
            RoundingMode.HALF_EVEN
        );
        this.currency = Objects.requireNonNull(currency, "Currency cannot be null");
    }
    
    private void validateAmount(BigDecimal amount) {
        if (amount == null) {
            throw new IllegalArgumentException("Amount cannot be null");
        }
        // Ensure precision matches currency
        if (amount.scale() > currency.getDefaultFractionDigits()) {
            throw new IllegalArgumentException(
                "Amount has more decimal places than currency allows"
            );
        }
    }
    
    // Value objects should be immutable - operations return new instances
    public Money add(Money other) {
        assertSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }
    
    public Money subtract(Money other) {
        assertSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }
    
    public Money multiply(BigDecimal multiplier) {
        return new Money(this.amount.multiply(multiplier), this.currency);
    }
    
    private void assertSameCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                "Cannot operate on money with different currencies"
            );
        }
    }
    
    // Value objects are equal if all their attributes are equal
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Money money = (Money) o;
        return amount.equals(money.amount) && 
               currency.equals(money.currency);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(amount, currency);
    }
    
    @Override
    public String toString() {
        return currency.getSymbol() + amount.toString();
    }
}
```

Let's look at another example - an Email value object that ensures email addresses are valid:

```java
public final class Email {
    private final String address;
    
    public Email(String address) {
        validateAddress(address);
        this.address = address.toLowerCase();  // Normalize for consistency
    }
    
    private void validateAddress(String address) {
        if (address == null || address.isBlank()) {
            throw new IllegalArgumentException("Email address cannot be empty");
        }
        
        // Use a comprehensive email validation regex
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        if (!address.matches(emailRegex)) {
            throw new IllegalArgumentException("Invalid email address format");
        }
    }
    
    public String getDomain() {
        return address.substring(address.indexOf("@") + 1);
    }
    
    public String getLocalPart() {
        return address.substring(0, address.indexOf("@"));
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Email email = (Email) o;
        return address.equals(email.address);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(address);
    }
    
    @Override
    public String toString() {
        return address;
    }
}
```

Now, let's examine a more complex value object that represents a date range:

```java
public final class DateRange {
    private final LocalDate startDate;
    private final LocalDate endDate;
    
    public DateRange(LocalDate startDate, LocalDate endDate) {
        validateDates(startDate, endDate);
        this.startDate = startDate;
        this.endDate = endDate;
    }
    
    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Dates cannot be null");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
    }
    
    public boolean overlaps(DateRange other) {
        return !(this.endDate.isBefore(other.startDate) || 
                other.endDate.isBefore(this.startDate));
    }
    
    public DateRange merge(DateRange other) {
        if (!this.overlaps(other)) {
            throw new IllegalArgumentException("Cannot merge non-overlapping ranges");
        }
        
        return new DateRange(
            startDate.isBefore(other.startDate) ? startDate : other.startDate,
            endDate.isAfter(other.endDate) ? endDate : other.endDate
        );
    }
    
    public long getDurationInDays() {
        return ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }
    
    public boolean contains(LocalDate date) {
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }
}
```

## Best Practices & Guidelines 🎯

### 1. Ensure Immutability

Value objects should be immutable to prevent bugs and maintain thread safety:

```java
public final class Temperature {
    private final BigDecimal value;
    private final TemperatureUnit unit;
    
    // Constructor validates and sets final fields
    public Temperature(BigDecimal value, TemperatureUnit unit) {
        this.value = Objects.requireNonNull(value);
        this.unit = Objects.requireNonNull(unit);
    }
    
    // Operations return new instances
    public Temperature convertTo(TemperatureUnit newUnit) {
        if (this.unit == newUnit) {
            return this;
        }
        
        BigDecimal convertedValue = switch(newUnit) {
            case CELSIUS -> convertToCelsius();
            case FAHRENHEIT -> convertToFahrenheit();
            case KELVIN -> convertToKelvin();
        };
        
        return new Temperature(convertedValue, newUnit);
    }
    
    private BigDecimal convertToCelsius() {
        return switch(this.unit) {
            case CELSIUS -> this.value;
            case FAHRENHEIT -> 
                this.value.subtract(BigDecimal.valueOf(32))
                    .multiply(BigDecimal.valueOf(5))
                    .divide(BigDecimal.valueOf(9), RoundingMode.HALF_UP);
            case KELVIN ->
                this.value.subtract(BigDecimal.valueOf(273.15));
        };
    }
}
```

### 2. Implement Value Semantics

Value objects should be equal if their attributes are equal:

```java
public final class Coordinate {
    private final double latitude;
    private final double longitude;
    
    public Coordinate(double latitude, double longitude) {
        validateLatitude(latitude);
        validateLongitude(longitude);
        this.latitude = latitude;
        this.longitude = longitude;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Coordinate that = (Coordinate) o;
        return Double.compare(that.latitude, latitude) == 0 &&
               Double.compare(that.longitude, longitude) == 0;
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(latitude, longitude);
    }
    
    public double distanceTo(Coordinate other) {
        // Haversine formula implementation
        double earthRadius = 6371; // kilometers
        
        double latDistance = Math.toRadians(other.latitude - this.latitude);
        double lonDistance = Math.toRadians(other.longitude - this.longitude);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                 + Math.cos(Math.toRadians(this.latitude))
                 * Math.cos(Math.toRadians(other.latitude))
                 * Math.sin(lonDistance / 2)
                 * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return earthRadius * c;
    }
}
```

### 3. Validate in Constructor

Ensure value objects are always valid:

```java
public final class PhoneNumber {
    private final String countryCode;
    private final String number;
    
    public PhoneNumber(String countryCode, String number) {
        validateCountryCode(countryCode);
        validateNumber(number);
        
        this.countryCode = countryCode;
        this.number = number;
    }
    
    private void validateCountryCode(String countryCode) {
        if (countryCode == null || countryCode.isBlank()) {
            throw new IllegalArgumentException("Country code cannot be empty");
        }
        if (!countryCode.matches("^\\+[1-9][0-9]{0,2}$")) {
            throw new IllegalArgumentException("Invalid country code format");
        }
    }
    
    private void validateNumber(String number) {
        if (number == null || number.isBlank()) {
            throw new IllegalArgumentException("Number cannot be empty");
        }
        // Remove all non-digit characters for validation
        String digitsOnly = number.replaceAll("[^0-9]", "");
        if (digitsOnly.length() < 8 || digitsOnly.length() > 15) {
            throw new IllegalArgumentException("Invalid number length");
        }
    }
    
    public String getFormattedNumber() {
        return countryCode + " " + number;
    }
}
```

## Testing Value Objects 🧪

Value objects should be thoroughly tested:

```java
class MoneyTest {
    @Test
    void shouldCreateValidMoney() {
        Money money = new Money(BigDecimal.valueOf(100.50), Currency.getInstance("USD"));
        assertEquals(BigDecimal.valueOf(100.50), money.getAmount());
        assertEquals(Currency.getInstance("USD"), money.getCurrency());
    }
    
    @Test
    void shouldBeEqualWhenAttributesAreEqual() {
        Money money1 = new Money(BigDecimal.valueOf(100), Currency.getInstance("USD"));
        Money money2 = new Money(BigDecimal.valueOf(100), Currency.getInstance("USD"));
        
        assertEquals(money1, money2);
        assertEquals(money1.hashCode(), money2.hashCode());
    }
    
    @Test
    void shouldAddMoneyWithSameCurrency() {
        Money money1 = new Money(BigDecimal.valueOf(100), Currency.getInstance("USD"));
        Money money2 = new Money(BigDecimal.valueOf(50), Currency.getInstance("USD"));
        
        Money result = money1.add(money2);
        
        assertEquals(
            new Money(BigDecimal.valueOf(150), Currency.getInstance("USD")),
            result
        );
    }
    
    @Test
    void shouldThrowExceptionWhenAddingDifferentCurrencies() {
        Money usd = new Money(BigDecimal.valueOf(100), Currency.getInstance("USD"));
        Money eur = new Money(BigDecimal.valueOf(100), Currency.getInstance("EUR"));
        
        assertThrows(IllegalArgumentException.class, () -> usd.add(eur));
    }
}
```

## Real-world Use Cases 🌍

### E-commerce System

Here's how value objects work together in an e-commerce system:

```java
public class Order {
    private final OrderId id;
    private final CustomerId customerId;
    private final List<OrderLine> lines;
    private final Money total;
    private final ShippingAddress shippingAddress;
    private final Email customerEmail;
    
    public class OrderLine {
        private final ProductId productId;
        private final Quantity quantity;
        private final Money unitPrice;
        
        public Money getLineTotal() {
            return unitPrice.multiply(BigDecimal.valueOf(quantity.getValue()));
        }
    }
    
    public boolean canShipTo(Country country) {
        return shippingAddress.getCountry().equals(country) &&
               country.acceptsShipmentsFor(total.getCurrency());
    }
    
    public DeliveryEstimate calculateDeliveryEstimate() {
        return shippingAddress.getCountry()
            .getDeliveryTimeEstimate()
            .addBusinessDays(lines.size() / 10); // Add processing time
    }
}
```

## References and Additional Resources 📚

Essential reading materials:
- "Domain-Driven Design" by Eric Evans (Chapter on Value Objects)
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Patterns, Principles, and Practices of Domain-Driven Design" by Scott Millett

Community resources:
- DDD Community Discord
- Value Objects Pattern Repository
- Domain-Driven Design Weekly Newsletter

Value objects are essential building blocks in Domain-Driven Design that help create more expressive and maintainable domain models. By properly implementing value objects, we can capture business concepts more precisely and ensure our code better reflects the domain it models. Remember that value objects are defined by their attributes and should be immutable to prevent bugs and maintain system integrity.
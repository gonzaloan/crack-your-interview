---
sidebar_position: 4
title: "DDD Domain Services"
description: "DDD Domain Services"
---

# Domain Services in Domain-Driven Design 🔄

## Overview and Problem Statement

When modeling complex business domains, we often encounter operations or behaviors that don't naturally belong to any single entity or value object. For example, calculating shipping costs might depend on multiple factors like the order, shipping address, and carrier rates. Forcing such operations into entities can lead to bloated objects and unclear responsibilities.

Domain Services solve this problem by providing a home for domain logic that operates across multiple domain objects. Unlike application services that orchestrate use cases, domain services encapsulate core business rules and calculations that are essential parts of the domain model but don't belong to any particular entity.

The business impact of properly implementing domain services includes:
- Clearer separation of concerns in the domain model
- More maintainable and testable business logic
- Better representation of complex domain operations
- Reduced coupling between domain objects
- Improved reusability of domain logic across different use cases

## Core Concepts and Implementation 🏗️

Let's explore how to implement domain services effectively, starting with a classic example - a pricing service:

```java
public class PricingService {
    private final TaxCalculator taxCalculator;
    private final DiscountPolicy discountPolicy;
    private final PricingRules pricingRules;
    
    public Money calculateFinalPrice(Order order, Customer customer) {
        // Calculate base price from order lines
        Money basePrice = calculateBasePrice(order);
        
        // Apply customer-specific discounts
        Money priceAfterDiscounts = applyDiscounts(basePrice, customer, order);
        
        // Calculate taxes based on shipping destination
        Money taxes = taxCalculator.calculateTax(
            priceAfterDiscounts,
            order.getShippingAddress()
        );
        
        return priceAfterDiscounts.add(taxes);
    }
    
    private Money calculateBasePrice(Order order) {
        return order.getOrderLines().stream()
            .map(line -> {
                Money basePrice = line.getUnitPrice();
                // Apply product-specific pricing rules
                return pricingRules.applyProductRules(
                    basePrice,
                    line.getProductId(),
                    line.getQuantity()
                );
            })
            .reduce(Money.zero(Currency.getInstance("USD")), Money::add);
    }
    
    private Money applyDiscounts(Money price, Customer customer, Order order) {
        // Apply volume discounts
        Money afterVolumeDiscount = discountPolicy.applyVolumeDiscount(
            price,
            order.getTotalQuantity()
        );
        
        // Apply customer loyalty discounts
        Money afterLoyaltyDiscount = discountPolicy.applyLoyaltyDiscount(
            afterVolumeDiscount,
            customer.getLoyaltyTier()
        );
        
        // Apply seasonal promotions
        return discountPolicy.applySeasonalDiscount(
            afterLoyaltyDiscount,
            LocalDate.now()
        );
    }
}
```

Let's look at another example - a shipping cost calculator service:

```java
public class ShippingCostService {
    private final CarrierRateRepository carrierRates;
    private final DistanceCalculator distanceCalculator;
    
    public ShippingCostEstimate calculateShippingCost(
            Order order,
            ShippingAddress destination,
            ShippingSpeed speed) {
            
        // Calculate package dimensions and weight
        PackageMetrics packageMetrics = calculatePackageMetrics(order);
        
        // Find available carriers and their base rates
        List<CarrierRate> availableRates = carrierRates.findRatesForPackage(
            packageMetrics,
            destination.getCountry(),
            speed
        );
        
        // Calculate distance-based costs
        Distance distance = distanceCalculator.calculateDistance(
            order.getWarehouse().getLocation(),
            destination.toLocation()
        );
        
        // Calculate final costs for each carrier
        return availableRates.stream()
            .map(rate -> calculateCarrierCost(rate, distance, packageMetrics))
            .min(Comparator.comparing(ShippingCostEstimate::getCost))
            .orElseThrow(() -> new NoAvailableCarriersException());
    }
    
    private PackageMetrics calculatePackageMetrics(Order order) {
        return order.getOrderLines().stream()
            .map(line -> line.getProduct().getPackaging().multiply(line.getQuantity()))
            .reduce(PackageMetrics.empty(), PackageMetrics::combine);
    }
    
    private ShippingCostEstimate calculateCarrierCost(
            CarrierRate rate,
            Distance distance,
            PackageMetrics metrics) {
            
        Money baseCost = rate.getBaseCost();
        
        // Add distance-based costs
        Money distanceCost = rate.calculateDistanceCost(distance);
        
        // Add weight-based costs
        Money weightCost = rate.calculateWeightCost(metrics.getWeight());
        
        // Add dimensional weight costs
        Money dimensionalCost = rate.calculateDimensionalCost(
            metrics.getLength(),
            metrics.getWidth(),
            metrics.getHeight()
        );
        
        // Add fuel surcharge
        Money fuelSurcharge = rate.calculateFuelSurcharge(
            baseCost.add(distanceCost).add(weightCost).add(dimensionalCost)
        );
        
        return new ShippingCostEstimate(
            rate.getCarrier(),
            baseCost.add(distanceCost)
                    .add(weightCost)
                    .add(dimensionalCost)
                    .add(fuelSurcharge)
        );
    }
}
```

Now let's examine a domain service that handles complex business rules - a loan approval service:

```java
public class LoanApprovalService {
    private final CreditScoreService creditScoreService;
    private final RiskAssessmentPolicy riskPolicy;
    private final ComplianceService complianceService;
    
    public LoanApprovalResult evaluateLoanApplication(LoanApplication application) {
        // Validate basic eligibility
        validateBasicEligibility(application);
        
        // Calculate debt-to-income ratio
        BigDecimal debtToIncomeRatio = calculateDebtToIncomeRatio(
            application.getMonthlyIncome(),
            application.getExistingDebts()
        );
        
        // Get credit assessment
        CreditAssessment creditAssessment = creditScoreService
            .assessCredit(application.getApplicantId());
            
        // Evaluate compliance requirements
        ComplianceResult compliance = complianceService
            .evaluateCompliance(application);
            
        if (!compliance.isCompliant()) {
            return LoanApprovalResult.rejected(
                "Compliance check failed: " + compliance.getReason()
            );
        }
        
        // Apply risk assessment rules
        RiskAssessment risk = riskPolicy.evaluateRisk(
            creditAssessment,
            debtToIncomeRatio,
            application.getLoanAmount(),
            application.getLoanPurpose()
        );
        
        // Make final decision
        if (risk.isAcceptable()) {
            return LoanApprovalResult.approved(
                calculateInterestRate(risk, creditAssessment),
                calculateLoanTerms(application, risk)
            );
        } else {
            return LoanApprovalResult.rejected(risk.getRejectionReason());
        }
    }
    
    private void validateBasicEligibility(LoanApplication application) {
        if (application.getApplicantAge() < 18) {
            throw new IneligibleApplicantException("Applicant must be 18 or older");
        }
        
        if (application.getMonthlyIncome().isLessThan(Money.of(2000))) {
            throw new IneligibleApplicantException(
                "Minimum monthly income requirement not met"
            );
        }
    }
    
    private BigDecimal calculateDebtToIncomeRatio(
            Money monthlyIncome,
            List<Debt> existingDebts) {
            
        Money totalMonthlyDebt = existingDebts.stream()
            .map(Debt::getMonthlyPayment)
            .reduce(Money.zero(Currency.getInstance("USD")), Money::add);
            
        return totalMonthlyDebt.getAmount()
            .divide(monthlyIncome.getAmount(), 2, RoundingMode.HALF_UP);
    }
    
    private InterestRate calculateInterestRate(
            RiskAssessment risk,
            CreditAssessment creditAssessment) {
            
        BigDecimal baseRate = getBaseRate();
        BigDecimal riskPremium = risk.calculateRiskPremium();
        BigDecimal creditAdjustment = creditAssessment.calculateRateAdjustment();
        
        return new InterestRate(
            baseRate.add(riskPremium).add(creditAdjustment)
        );
    }
}
```

## Best Practices & Guidelines 🎯

### 1. Keep Services Focused

Each domain service should have a single responsibility:

```java
// Bad: Service doing too many things
public class OrderService {
    public void processOrder(Order order) {
        validateInventory(order);
        calculatePricing(order);
        arrangeShipping(order);
        handlePayment(order);
    }
}

// Good: Separate focused services
public class InventoryValidationService {
    public void validateInventory(Order order) {
        // Inventory validation logic
    }
}

public class PricingService {
    public Money calculatePrice(Order order) {
        // Pricing logic
    }
}

public class ShippingService {
    public ShippingArrangement arrangeShipping(Order order) {
        // Shipping logic
    }
}
```

### 2. Make Services Stateless

Domain services should be stateless and operate purely on their inputs:

```java
// Bad: Stateful service
public class PaymentProcessor {
    private Money totalProcessed;  // Don't maintain state
    
    public void processPayment(Payment payment) {
        // Process payment
        totalProcessed = totalProcessed.add(payment.getAmount());
    }
}

// Good: Stateless service
public class PaymentProcessor {
    public PaymentResult processPayment(
            Payment payment,
            PaymentMethod paymentMethod) {
        // Process payment based only on inputs
        return paymentMethod.process(payment);
    }
}
```

### 3. Use Meaningful Interfaces

Define clear interfaces for domain services:

```java
public interface ExchangeRateService {
    // Clear contract for currency conversion
    ExchangeRate getExchangeRate(Currency from, Currency to, LocalDate date);
    
    Money convert(Money amount, Currency targetCurrency, LocalDate date);
}

public interface FraudDetectionService {
    // Clear contract for fraud detection
    FraudAssessment assessTransaction(
        TransactionDetails transaction,
        CustomerProfile customer
    );
    
    RiskScore calculateRiskScore(CustomerProfile customer);
}
```

## Testing Domain Services 🧪

Domain services should be thoroughly tested:

```java
class PricingServiceTest {
    private PricingService pricingService;
    private Order order;
    private Customer customer;
    
    @BeforeEach
    void setUp() {
        pricingService = new PricingService(
            new TaxCalculator(),
            new DiscountPolicy(),
            new PricingRules()
        );
        
        order = createTestOrder();
        customer = createTestCustomer();
    }
    
    @Test
    void shouldApplyVolumeDiscounts() {
        // Given
        order.addProduct(product, new Quantity(10));
        
        // When
        Money finalPrice = pricingService.calculateFinalPrice(order, customer);
        
        // Then
        assertTrue(finalPrice.isLessThan(order.getBasePrice()));
    }
    
    @Test
    void shouldCalculateTaxesCorrectly() {
        // Given
        order.setShippingAddress(new Address("US", "CA"));
        
        // When
        Money finalPrice = pricingService.calculateFinalPrice(order, customer);
        
        // Then
        Money expectedTax = order.getBasePrice()
            .multiply(BigDecimal.valueOf(0.0725));  // CA tax rate
        assertEquals(
            order.getBasePrice().add(expectedTax),
            finalPrice
        );
    }
}
```

## Real-world Use Cases 🌍

Here's how domain services work together in a complete system:

```java
public class OrderProcessor {
    private final InventoryService inventoryService;
    private final PricingService pricingService;
    private final ShippingService shippingService;
    private final PaymentService paymentService;
    private final NotificationService notificationService;
    
    @Transactional
    public OrderResult processOrder(Order order, Customer customer) {
        // Validate inventory
        InventoryResult inventory = inventoryService.validateAvailability(order);
        if (!inventory.isAvailable()) {
            return OrderResult.rejected("Items not available: " + 
                inventory.getUnavailableItems());
        }
        
        // Calculate final price
        Money finalPrice = pricingService.calculateFinalPrice(order, customer);
        order.setFinalPrice(finalPrice);
        
        // Arrange shipping
        ShippingArrangement shipping = shippingService
            .arrangeShipping(order, customer.getShippingAddress());
        order.setShippingArrangement(shipping);
        
        // Process payment
        PaymentResult payment = paymentService
            .processPayment(order, customer.getDefaultPaymentMethod());
            
        if (!payment.isSuccessful()) {
            return OrderResult.rejected("Payment failed: " + 
                payment.getFailureReason());
        }
        
        // Reserve inventory
        inventoryService.reserveInventory(order);
        
        // Notify customer
        notificationService.sendOrderConfirmation(order, customer);
        
        return OrderResult.success(order);
    }
}
```

## References and Additional Resources 📚

Essential reading materials:
- "Domain-Driven Design" by Eric Evans (Chapter on Services)
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Patterns, Principles, and Practices of Domain-Driven Design" by Scott Millett

Community resources:
- DDD Community Discord
- Domain Services Pattern Repository
- Domain-Driven Design Weekly Newsletter

Domain Services are essential building blocks in Domain-Driven Design that help maintain clean separation of concerns while implementing complex business rules. When used appropriately, they provide a natural home for domain logic that doesn't belong to entities or value objects, making the overall domain model more maintainable and easier to understand.
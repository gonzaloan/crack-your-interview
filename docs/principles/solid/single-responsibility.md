---
sidebar_position: 1
title: Single Responsibility Principle (SRP)
description: A class should only have one reason to change, meaning it should only have one job or responsibility
---

# Single Responsibility Principle (SRP)

## Core Understanding

The SRP states that a class should only have one reason to change. This means:

- Each class should focus on doing one thing correctly.
- Changes to one aspect of the software should only affect classes responsible for that aspect.
- Responsibilities should be clearly defined and encapsulated.

## ❌ Bad Practice

```java
// ❌ BAD PRACTICE: Class with multiple responsibilities
@Service
public class OrderProcessor {
    private final JdbcTemplate jdbcTemplate;
    private final JavaMailSender emailSender;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public OrderProcessor(JdbcTemplate jdbcTemplate, 
                         JavaMailSender emailSender, 
                         RestTemplate restTemplate,
                         ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.emailSender = emailSender;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public void processOrder(Order order) {
        // Validation logic
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new ValidationException("Order must have at least one item");
        }
        if (order.getCustomerEmail() == null || order.getCustomerEmail().isEmpty()) {
            throw new ValidationException("Customer email is required");
        }
        
        // Calculate total and apply discounts
        double total = 0;
        for (OrderItem item : order.getItems()) {
            double itemPrice = jdbcTemplate.queryForObject(
                "SELECT price FROM products WHERE id = ?",
                Double.class,
                item.getProductId()
            );
            total += itemPrice * item.getQuantity();
        }
        if (total > 100) {
            total = total * 0.9; // 10% discount
        }
        order.setTotal(total);

        // Save to database
        jdbcTemplate.update(
            "INSERT INTO orders (customer_email, total, status) VALUES (?, ?, ?)",
            order.getCustomerEmail(),
            order.getTotal(),
            "PENDING"
        );
        
        // Send confirmation email
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        try {
            helper.setTo(order.getCustomerEmail());
            helper.setSubject("Order Confirmation");
            helper.setText("Your order has been processed. Total: $" + total);
            emailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
        
        // Notify inventory system
        try {
            String inventoryPayload = objectMapper.writeValueAsString(order.getItems());
            restTemplate.postForEntity(
                "http://inventory-service/api/update",
                inventoryPayload,
                Void.class
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize inventory update", e);
        }
        
        // Update payment system
        try {
            PaymentRequest paymentRequest = new PaymentRequest(order.getId(), total);
            restTemplate.postForEntity(
                "http://payment-service/api/process",
                paymentRequest,
                PaymentResponse.class
            );
        } catch (Exception e) {
            throw new RuntimeException("Payment processing failed", e);
        }
    }
    
    public OrderStatus checkOrderStatus(String orderId) {
        return jdbcTemplate.queryForObject(
            "SELECT status FROM orders WHERE id = ?",
            OrderStatus.class,
            orderId
        );
    }
    
    public void cancelOrder(String orderId) {
        jdbcTemplate.update(
            "UPDATE orders SET status = 'CANCELLED' WHERE id = ?",
            orderId
        );
        
        // Refund logic
        try {
            restTemplate.postForEntity(
                "http://payment-service/api/refund",
                orderId,
                Void.class
            );
        } catch (Exception e) {
            throw new RuntimeException("Refund processing failed", e);
        }
    }
}
```

Problems with this implementation? 
- Multiple Responsibilities:
  - Validation Logic
  - Price Calculation and Discount Rules
  - Database Operations
  - Notifications
  - Etc

- Issues:
  - Hard to test.
  - Hard to maintain.
  - Hard to read. 

## ✅ Good Practice

Let's use different components to fix this.

```java
// Separated responsibilities

// 1. Order Validation
@Component
public class OrderValidator {
    public void validate(Order order) {
        List<String> violations = new ArrayList<>();
        
        if (order.getItems() == null || order.getItems().isEmpty()) {
            violations.add("Order must have at least one item");
        }
        
        if (order.getCustomerEmail() == null || order.getCustomerEmail().isEmpty()) {
            violations.add("Customer email is required");
        }
        
        if (!violations.isEmpty()) {
            throw new OrderValidationException(violations);
        }
    }
}

// 2. Price Calculation
@Component
public class PriceCalculator {
    private final ProductRepository productRepository;
    private final DiscountStrategy discountStrategy;
    
    public PriceCalculator(ProductRepository productRepository, DiscountStrategy discountStrategy) {
        this.productRepository = productRepository;
        this.discountStrategy = discountStrategy;
    }
    
    public OrderPricing calculatePrice(Order order) {
        double subtotal = order.getItems().stream()
            .mapToDouble(this::calculateItemPrice)
            .sum();
            
        return new OrderPricing(
            subtotal,
            discountStrategy.calculateDiscount(subtotal),
            calculateTax(subtotal)
        );
    }
    
    private double calculateItemPrice(OrderItem item) {
        Product product = productRepository.findById(item.getProductId())
            .orElseThrow(() -> new ProductNotFoundException(item.getProductId()));
        return product.getPrice() * item.getQuantity();
    }
}

// 3. Order Repository
@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    @Modifying
    @Query("UPDATE Order o SET o.status = :status WHERE o.id = :orderId")
    void updateStatus(@Param("orderId") String orderId, @Param("status") OrderStatus status);
}

// 4. Notification Service
@Service
public class NotificationService {
    private final JavaMailSender emailSender;
    private final TemplateEngine templateEngine;
    
    public void sendOrderConfirmation(Order order, OrderPricing pricing) {
        try {
            EmailTemplate template = templateEngine.getTemplate("order-confirmation");
            template.setVariable("order", order);
            template.setVariable("pricing", pricing);
            
            emailSender.send(template.getTo(order.getCustomerEmail()));
        } catch (MessagingException e) {
            throw new NotificationException("Failed to send order confirmation", e);
        }
    }
}

// 5. Inventory Service
@Service
public class InventoryService {
    private final InventoryClient inventoryClient;
    
    public void updateInventory(Order order) {
        try {
            InventoryUpdateRequest request = InventoryUpdateRequest.fromOrder(order);
            inventoryClient.updateInventory(request);
        } catch (Exception e) {
            throw new InventoryUpdateException("Failed to update inventory", e);
        }
    }
}

// 6. Payment Service
@Service
public class PaymentService {
    private final PaymentClient paymentClient;
    
    public PaymentResult processPayment(Order order, OrderPricing pricing) {
        try {
            PaymentRequest request = new PaymentRequest(order.getId(), pricing.getTotal());
            return paymentClient.processPayment(request);
        } catch (Exception e) {
            throw new PaymentProcessingException("Payment processing failed", e);
        }
    }
    
    public RefundResult processRefund(String orderId) {
        try {
            return paymentClient.processRefund(orderId);
        } catch (Exception e) {
            throw new RefundProcessingException("Refund processing failed", e);
        }
    }
}

// 7. Order Orchestrator
@Service
@Transactional
public class OrderProcessor {
    private final OrderValidator validator;
    private final PriceCalculator priceCalculator;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;
    
    public OrderResult processOrder(Order order) {
        // Validate order
        validator.validate(order);
        
        // Calculate pricing
        OrderPricing pricing = priceCalculator.calculatePrice(order);
        order.setPricing(pricing);
        
        // Save initial order
        Order savedOrder = orderRepository.save(order);
        
        try {
            // Process payment
            PaymentResult paymentResult = paymentService.processPayment(order, pricing);
            
            if (paymentResult.isSuccessful()) {
                // Update inventory
                inventoryService.updateInventory(order);
                
                // Update order status
                order.setStatus(OrderStatus.CONFIRMED);
                orderRepository.save(order);
                
                // Send confirmation
                notificationService.sendOrderConfirmation(order, pricing);
                
                return OrderResult.success(order);
            } else {
                order.setStatus(OrderStatus.PAYMENT_FAILED);
                orderRepository.save(order);
                return OrderResult.failed(paymentResult.getErrorMessage());
            }
        } catch (Exception e) {
            order.setStatus(OrderStatus.ERROR);
            orderRepository.save(order);
            throw new OrderProcessingException("Order processing failed", e);
        }
    }
}

// 8. Configuration
@Configuration
public class OrderProcessingConfig {
    @Bean
    public DiscountStrategy volumeDiscountStrategy() {
        return amount -> amount > 100 ? amount * 0.1 : 0;
    }
    
    @Bean
    public RetryTemplate orderProcessingRetryTemplate() {
        RetryTemplate retryTemplate = new RetryTemplate();
        
        FixedBackOffPolicy backOffPolicy = new FixedBackOffPolicy();
        backOffPolicy.setBackOffPeriod(1000L);
        retryTemplate.setBackOffPolicy(backOffPolicy);
        
        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(3);
        retryTemplate.setRetryPolicy(retryPolicy);
        
        return retryTemplate;
    }
}
```

Improvements:
- Clear Responsibilities
- Easy to Understand and Maintain.
- Changes are isolated to their components.
- Easy to test.




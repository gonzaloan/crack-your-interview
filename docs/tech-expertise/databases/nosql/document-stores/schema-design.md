---
sidebar_position: 2
title: "Schema Design"
description: "Schema Design"
---

# NoSQL Document Store Schema Design: A Complete Guide

## 1. Schema Design Principles 🎯

When designing schemas for document databases, we need to think differently than we do with relational databases. The fundamental principles revolve around optimizing for data access patterns rather than normalizing to reduce redundancy. Here's how we approach it:

### Data Access Patterns First

The most important principle in document database schema design is to structure your data based on how your application will access it. Let's look at an e-commerce example:

```javascript
// Approach 1: Normalized (Like a relational database)
// Orders Collection
{
    "_id": ObjectId("..."),
    "orderId": "ORD-2024-1001",
    "customerId": ObjectId("..."),
    "status": "processing"
}

// Order Items Collection
{
    "_id": ObjectId("..."),
    "orderId": ObjectId("..."),
    "productId": ObjectId("..."),
    "quantity": 2,
    "price": 29.99
}

// VS

// Approach 2: Denormalized (Document-oriented)
// Orders Collection
{
    "_id": ObjectId("..."),
    "orderId": "ORD-2024-1001",
    "customer": {
        "_id": ObjectId("..."),
        "name": "John Doe",
        "email": "john@example.com",
        "shippingAddress": {
            "street": "123 Main St",
            "city": "New York",
            "state": "NY"
        }
    },
    "items": [
        {
            "productId": ObjectId("..."),
            "name": "Premium Headphones",
            "quantity": 2,
            "price": 29.99,
            "subtotal": 59.98
        }
    ],
    "status": "processing",
    "totalAmount": 59.98,
    "createdAt": ISODate("2024-03-15T10:00:00Z")
}
```

The second approach embeds frequently accessed related data within the order document, eliminating the need for joins (which don't exist in document databases) and optimizing for the most common query pattern: "Get all information about an order."

## 2. Embedding vs. Referencing 🔄

Understanding when to embed documents and when to use references is crucial for effective schema design. Let's explore both patterns:

### Embedding Pattern

Use embedding when:
- Data is frequently accessed together
- The embedded data is relatively small
- The data belongs to only one parent document
- The data doesn't change frequently

```javascript
// Product document with embedded variants
{
    "_id": ObjectId("..."),
    "name": "Ergonomic Office Chair",
    "brand": "ComfortPlus",
    "basePrice": 299.99,
    "description": "Professional-grade office chair with...",
    "variants": [
        {
            "sku": "CHR-BLK-STD",
            "color": "Black",
            "size": "Standard",
            "price": 299.99,
            "inventory": 45,
            "specifications": {
                "weight": "35 lbs",
                "dimensions": "26x26x48",
                "materials": ["mesh", "aluminum"]
            }
        },
        {
            "sku": "CHR-GRY-STD",
            "color": "Gray",
            "size": "Standard",
            "price": 299.99,
            "inventory": 32,
            "specifications": {
                "weight": "35 lbs",
                "dimensions": "26x26x48",
                "materials": ["mesh", "aluminum"]
            }
        }
    ],
    "reviews": [
        {
            "userId": ObjectId("..."),
            "rating": 5,
            "comment": "Excellent chair for long work hours",
            "date": ISODate("2024-03-10")
        }
    ]
}
```

### Referencing Pattern

Use references when:
- Data is shared across multiple documents
- The data is large
- The data changes frequently
- You need to access the data independently

```javascript
// User Profile with References
{
    "_id": ObjectId("..."),
    "username": "john_doe",
    "email": "john@example.com",
    "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://..."
    },
    "orderIds": [
        ObjectId("..."),
        ObjectId("...")
    ],
    "addressIds": [
        ObjectId("..."),
        ObjectId("...")
    ]
}

// Separate Orders Collection
{
    "_id": ObjectId("..."),
    "userId": ObjectId("..."),
    "orderDetails": {
        "items": [...],
        "total": 299.99
    }
}

// Separate Addresses Collection
{
    "_id": ObjectId("..."),
    "userId": ObjectId("..."),
    "type": "shipping",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY"
}
```

## 3. Schema Versioning and Evolution 📈

As applications evolve, schemas need to change. Here's how to handle schema versioning:

```javascript
// Version 1 of Customer Document
{
    "_id": ObjectId("..."),
    "schemaVersion": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St, New York, NY"
}

// Version 2 of Customer Document
{
    "_id": ObjectId("..."),
    "schemaVersion": 2,
    "name": {
        "first": "John",
        "last": "Doe"
    },
    "email": "john@example.com",
    "addresses": [
        {
            "type": "home",
            "street": "123 Main St",
            "city": "New York",
            "state": "NY"
        }
    ]
}

// Migration Script
db.customers.find({ schemaVersion: 1 }).forEach(function(doc) {
    // Split name into first and last
    const nameParts = doc.name.split(' ');
    
    // Transform address into structured format
    const addressParts = doc.address.split(',').map(part => part.trim());
    
    // Update to new schema
    db.customers.updateOne(
        { _id: doc._id },
        {
            $set: {
                schemaVersion: 2,
                name: {
                    first: nameParts[0],
                    last: nameParts[1] || ''
                },
                addresses: [{
                    type: "home",
                    street: addressParts[0],
                    city: addressParts[1],
                    state: addressParts[2]
                }]
            },
            $unset: {
                address: ""
            }
        }
    );
});
```

## 4. Optimization Patterns 🚀

### Subset Pattern

When dealing with large documents, we can use the subset pattern to store a subset of data in a frequently accessed document:

```javascript
// Full Product Document
{
    "_id": ObjectId("..."),
    "name": "4K Smart TV",
    "price": 899.99,
    "description": "Long detailed description...",
    "specifications": {
        // Detailed technical specs
    },
    "reviews": [
        // Hundreds of reviews
    ],
    "relatedProducts": [
        // Related product references
    ]
}

// Product Summary Document (for listing pages)
{
    "_id": ObjectId("..."),
    "name": "4K Smart TV",
    "price": 899.99,
    "thumbnailUrl": "https://...",
    "averageRating": 4.5,
    "reviewCount": 324
}
```

### Computed Pattern

Pre-calculate and store frequently needed values:

```javascript
// Order document with computed values
{
    "_id": ObjectId("..."),
    "items": [
        {
            "productId": ObjectId("..."),
            "quantity": 2,
            "price": 29.99,
            "subtotal": 59.98  // Pre-computed
        }
    ],
    "metrics": {
        "totalItems": 2,       // Pre-computed
        "totalAmount": 59.98,  // Pre-computed
        "tax": 5.99,          // Pre-computed
        "grandTotal": 65.97    // Pre-computed
    }
}
```

## 5. Advanced Patterns for Specific Use Cases 🎯

### Hierarchical Data Pattern

For storing and querying hierarchical data like categories or organizational structures:

```javascript
// Materialized Paths Pattern
{
    "_id": ObjectId("..."),
    "name": "Electronics",
    "path": ",root,electronics,",
    "level": 1
}

{
    "_id": ObjectId("..."),
    "name": "Smartphones",
    "path": ",root,electronics,smartphones,",
    "level": 2
}

// Ancestry Array Pattern
{
    "_id": ObjectId("..."),
    "name": "iPhone",
    "ancestors": [
        {
            "_id": ObjectId("..."),
            "name": "Electronics"
        },
        {
            "_id": ObjectId("..."),
            "name": "Smartphones"
        }
    ]
}
```

### Time-Series Data Pattern

For handling time-series data efficiently:

```javascript
// Daily Rollup Pattern
{
    "_id": ObjectId("..."),
    "sensorId": "TEMP-001",
    "date": ISODate("2024-03-15"),
    "readings": [
        {
            "hour": 0,
            "values": [21.5, 21.3, 21.4, ...), // 15-minute intervals
            "stats": {
                "min": 21.2,
                "max": 21.8,
                "avg": 21.4
            }
        },
        // Additional hours...
    ],
    "dailyStats": {
        "min": 20.5,
        "max": 23.8,
        "avg": 22.1
    }
}
```

### Versioning Pattern

For maintaining document history:

```javascript
// Document with version history
{
    "_id": ObjectId("..."),
    "productId": "PRD-001",
    "currentVersion": {
        "name": "Premium Headphones",
        "price": 129.99,
        "description": "Latest version of description"
    },
    "versions": [
        {
            "timestamp": ISODate("2024-03-01"),
            "changes": {
                "price": 99.99,
                "description": "Previous version of description"
            },
            "modifiedBy": "user123"
        }
    ]
}
```

## 6. Schema Validation 📋

Implement schema validation to maintain data integrity:

```javascript
db.createCollection("products", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "price", "category"],
            properties: {
                name: {
                    bsonType: "string",
                    minLength: 3,
                    maxLength: 100
                },
                price: {
                    bsonType: "number",
                    minimum: 0
                },
                category: {
                    bsonType: "string",
                    enum: ["Electronics", "Clothing", "Books", "Home"]
                },
                variants: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["sku", "price"],
                        properties: {
                            sku: {
                                bsonType: "string",
                                pattern: "^[A-Z]{3}-[0-9]{6}$"
                            },
                            price: {
                                bsonType: "number",
                                minimum: 0
                            }
                        }
                    }
                }
            }
        }
    },
    validationLevel: "strict",
    validationAction: "error"
})
```

## References 📚

1. Schema Design Patterns
- MongoDB Schema Design Documentation
- NoSQL Database Patterns
- Data Modeling Guidelines

2. Best Practices
- Performance Best Practices
- Schema Validation Best Practices
- Migration Strategies

3. Tools
- MongoDB Compass
- Schema Visualization Tools
- MongoDB Schema Validator

4. Community Resources
- MongoDB University
- Schema Design Case Studies
- Best Practices Guide

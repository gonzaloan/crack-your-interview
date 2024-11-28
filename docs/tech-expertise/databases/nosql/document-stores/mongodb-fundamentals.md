---
sidebar_position: 1
title: "MongoDB Fundamentals"
description: "MongoDB Fundamentals"
---

# MongoDB Fundamentals: Document Store Database

## 1. Core Concepts and Architecture 🏗️

MongoDB is a document-oriented database that stores data in flexible, JSON-like documents. Unlike traditional relational databases that store data in rows and columns, MongoDB's document model maps naturally to objects in application code.

### Document Structure
A MongoDB document represents a single record and can have varying structures. Here's a basic document example:

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "phoneNumbers": [
    {"type": "home", "number": "212-555-1234"},
    {"type": "mobile", "number": "646-555-5678"}
  ],
  "createdAt": ISODate("2024-03-15T09:00:00Z")
}
```

### Collections
Collections in MongoDB are analogous to tables in relational databases. Let's explore collection management:

```javascript
// Creating a collection with validation
db.createCollection("customers", {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["firstName", "lastName", "email"],
         properties: {
            firstName: {
               bsonType: "string",
               description: "must be a string and is required"
            },
            lastName: {
               bsonType: "string",
               description: "must be a string and is required"
            },
            email: {
               bsonType: "string",
               pattern: "^.+@.+$",
               description: "must be a valid email address"
            },
            address: {
               bsonType: "object",
               properties: {
                  street: { bsonType: "string" },
                  city: { bsonType: "string" },
                  state: { bsonType: "string" },
                  zipCode: { bsonType: "string" }
               }
            }
         }
      }
   }
})
```

## 2. CRUD Operations 📝

### Create Operations

```javascript
// Insert a single document
db.customers.insertOne({
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    address: {
        street: "456 Oak Ave",
        city: "Boston",
        state: "MA",
        zipCode: "02108"
    }
})

// Insert multiple documents
db.customers.insertMany([
    {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.j@example.com"
    },
    {
        firstName: "Bob",
        lastName: "Wilson",
        email: "bob.w@example.com"
    }
])
```

### Read Operations

```javascript
// Find all documents matching criteria
db.customers.find({
    "address.state": "NY",
    lastName: "Doe"
})

// Find one document
db.customers.findOne({
    email: "john.doe@example.com"
})

// Projection (selecting specific fields)
db.customers.find(
    { state: "NY" },
    { firstName: 1, lastName: 1, email: 1, _id: 0 }
)

// Complex queries using operators
db.customers.find({
    $and: [
        { "address.state": "NY" },
        { "phoneNumbers.type": "mobile" },
        { createdAt: { $gte: ISODate("2024-01-01") } }
    ]
})
```

### Update Operations

```javascript
// Update a single document
db.customers.updateOne(
    { email: "john.doe@example.com" },
    {
        $set: {
            "address.street": "789 Pine St",
            updatedAt: new Date()
        }
    }
)

// Update multiple documents
db.customers.updateMany(
    { "address.state": "NY" },
    {
        $set: { region: "Northeast" },
        $currentDate: { lastModified: true }
    }
)

// Upsert operation
db.customers.updateOne(
    { email: "new.customer@example.com" },
    {
        $set: {
            firstName: "New",
            lastName: "Customer",
            createdAt: new Date()
        }
    },
    { upsert: true }
)
```

### Delete Operations

```javascript
// Delete a single document
db.customers.deleteOne({
    email: "john.doe@example.com"
})

// Delete multiple documents
db.customers.deleteMany({
    "address.state": "NY"
})

// Delete all documents in a collection
db.customers.deleteMany({})
```

## 3. Indexing and Performance 🚀

### Index Creation and Management

```javascript
// Create a single field index
db.customers.createIndex(
    { email: 1 },
    { unique: true }
)

// Create a compound index
db.customers.createIndex(
    { lastName: 1, firstName: 1 }
)

// Create a text index for full-text search
db.customers.createIndex(
    { firstName: "text", lastName: "text" }
)

// Create a geospatial index
db.locations.createIndex(
    { coordinates: "2dsphere" }
)

// List all indexes
db.customers.getIndexes()

// Remove an index
db.customers.dropIndex("email_1")
```

### Query Performance Analysis

```javascript
// Explain query execution plan
db.customers.find(
    { "address.state": "NY" }
).explain("executionStats")

// Collection statistics
db.customers.stats()

// Index usage statistics
db.customers.aggregate([
    { $indexStats: {} }
])
```

## 4. Aggregation Framework 📊

```javascript
// Basic aggregation pipeline
db.orders.aggregate([
    // Stage 1: Match documents
    {
        $match: {
            status: "completed",
            orderDate: {
                $gte: ISODate("2024-01-01"),
                $lt: ISODate("2024-04-01")
            }
        }
    },
    // Stage 2: Group and calculate
    {
        $group: {
            _id: {
                year: { $year: "$orderDate" },
                month: { $month: "$orderDate" }
            },
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
            averageOrderValue: { $avg: "$totalAmount" }
        }
    },
    // Stage 3: Sort results
    {
        $sort: {
            "_id.year": 1,
            "_id.month": 1
        }
    },
    // Stage 4: Project final shape
    {
        $project: {
            yearMonth: {
                $concat: [
                    { $toString: "$_id.year" },
                    "-",
                    { $toString: "$_id.month" }
                ]
            },
            totalOrders: 1,
            totalRevenue: { $round: ["$totalRevenue", 2] },
            averageOrderValue: { $round: ["$averageOrderValue", 2] }
        }
    }
])
```

## 5. Data Modeling Best Practices 📐

### Embedded Documents Pattern

```javascript
// Product catalog with variants
{
    "_id": ObjectId("..."),
    "name": "Classic T-Shirt",
    "brand": "Fashion Co",
    "variants": [
        {
            "sku": "TS-BLK-S",
            "color": "Black",
            "size": "S",
            "price": 19.99,
            "inventory": 100
        },
        {
            "sku": "TS-BLK-M",
            "color": "Black",
            "size": "M",
            "price": 19.99,
            "inventory": 150
        }
    ],
    "categories": ["Apparel", "T-Shirts"],
    "tags": ["casual", "cotton", "basic"]
}
```

### References Pattern

```javascript
// Order document with references
{
    "_id": ObjectId("..."),
    "orderId": "ORD-2024-1001",
    "customerId": ObjectId("..."),  // Reference to customers collection
    "orderDate": ISODate("2024-03-15"),
    "items": [
        {
            "productId": ObjectId("..."),  // Reference to products collection
            "quantity": 2,
            "price": 19.99
        }
    ],
    "shippingAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
    },
    "totalAmount": 39.98,
    "status": "processing"
}
```

## 6. Security and Authentication 🔒

```javascript
// Create a user with specific roles
db.createUser({
    user: "appUser",
    pwd: "securePassword123",
    roles: [
        { role: "readWrite", db: "myapp" },
        { role: "read", db: "reporting" }
    ]
})

// Enable authentication
mongod --auth

// Create role with specific privileges
db.createRole({
    role: "orderProcessor",
    privileges: [
        {
            resource: { db: "myapp", collection: "orders" },
            actions: [ "find", "update" ]
        },
        {
            resource: { db: "myapp", collection: "customers" },
            actions: [ "find" ]
        }
    ],
    roles: []
})
```

## 7. Monitoring and Maintenance 🔧

```javascript
// Monitor database statistics
db.serverStatus()

// Collection maintenance
db.runCommand({ compact: "customers" })

// Monitor current operations
db.currentOp()

// Replica set status
rs.status()

// Database profiling
db.setProfilingLevel(1, { slowms: 100 })
```

## 8. Best Practices and Tips 💡

1. Document Size: Keep documents under 16MB limit
2. Indexing: Create indexes to support common queries
3. Data Model: Choose appropriate embedding vs referencing
4. Validation: Use JSON Schema for document validation
5. Security: Always enable authentication and authorization
6. Backup: Regular backup strategy with mongodump
7. Monitoring: Set up monitoring for performance metrics
8. Updates: Use atomic operations for consistency

## References 📚

1. Official Documentation
- MongoDB Manual
- Best Practice Guides
- Security Checklist

2. Tools
- MongoDB Compass
- Mongosh (MongoDB Shell)
- MongoDB Atlas

3. Community Resources
- MongoDB University
- MongoDB Forums
- Stack Overflow MongoDB Tag
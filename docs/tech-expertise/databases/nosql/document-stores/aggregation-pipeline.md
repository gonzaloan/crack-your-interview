---
sidebar_position: 3
title: "Aggregation Pipeline"
description: "Aggregation Pipeline"
---
# NoSQL Document Store: Aggregation Pipeline Deep Dive

## 1. Understanding Aggregation Pipelines 🌊

Think of an aggregation pipeline as an assembly line for your data, where each stage transforms the documents in a specific way before passing them to the next stage. Each stage has a specific purpose, like filtering, grouping, or calculating new values.

Let's start with a simple example to understand the concept:

```javascript
// Sample customer orders collection
{
    "_id": ObjectId("..."),
    "customerId": "C1001",
    "orderDate": ISODate("2024-03-15"),
    "items": [
        { "product": "Laptop", "price": 999.99, "quantity": 1 },
        { "product": "Mouse", "price": 29.99, "quantity": 2 }
    ],
    "status": "completed"
}

// Basic aggregation pipeline
db.orders.aggregate([
    // Stage 1: Filter completed orders from 2024
    {
        $match: {
            status: "completed",
            orderDate: {
                $gte: ISODate("2024-01-01"),
                $lt: ISODate("2025-01-01")
            }
        }
    },
    // Stage 2: Calculate order totals
    {
        $addFields: {
            orderTotal: {
                $reduce: {
                    input: "$items",
                    initialValue: 0,
                    in: {
                        $add: [
                            "$$value",
                            { $multiply: ["$$this.price", "$$this.quantity"] }
                        ]
                    }
                }
            }
        }
    },
    // Stage 3: Group by month and calculate statistics
    {
        $group: {
            _id: {
                month: { $month: "$orderDate" },
                year: { $year: "$orderDate" }
            },
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$orderTotal" },
            averageOrderValue: { $avg: "$orderTotal" }
        }
    }
])
```

## 2. Essential Pipeline Stages 🔄

Let's explore each major pipeline stage with practical examples:

### $match: Filtering Documents

```javascript
// Complex matching with multiple conditions
db.products.aggregate([
    {
        $match: {
            $and: [
                // Price range condition
                {
                    price: {
                        $gte: 100,
                        $lte: 500
                    }
                },
                // In-stock items only
                { "inventory.quantity": { $gt: 0 } },
                // Specific categories
                {
                    category: {
                        $in: ["Electronics", "Home Appliances"]
                    }
                },
                // Active products with good ratings
                {
                    isActive: true,
                    "ratings.average": { $gte: 4.0 }
                }
            ]
        }
    }
])
```

### $group: Aggregating Data

```javascript
// Advanced grouping with multiple calculations
db.sales.aggregate([
    {
        $group: {
            _id: {
                store: "$storeId",
                category: "$category",
                month: { $month: "$date" }
            },
            // Count transactions
            transactionCount: { $sum: 1 },
            // Sum total sales
            totalSales: { $sum: "$amount" },
            // Calculate averages
            averageTransaction: { $avg: "$amount" },
            // Find highest sale
            maxSale: { $max: "$amount" },
            // Create array of all sales
            allSales: { $push: "$amount" },
            // Get unique customers
            uniqueCustomers: { $addToSet: "$customerId" },
            // Calculate standard deviation
            standardDeviation: { $stdDevPop: "$amount" }
        }
    }
])
```

### $project: Reshaping Documents

```javascript
// Advanced projection with calculations
db.orders.aggregate([
    {
        $project: {
            _id: 0,
            orderId: 1,
            customer: {
                // Combine first and last name
                fullName: {
                    $concat: [
                        "$customer.firstName",
                        " ",
                        "$customer.lastName"
                    ]
                },
                // Format phone number
                formattedPhone: {
                    $concat: [
                        "+1 (",
                        { $substr: ["$customer.phone", 0, 3] },
                        ") ",
                        { $substr: ["$customer.phone", 3, 3] },
                        "-",
                        { $substr: ["$customer.phone", 6, 4] }
                    ]
                }
            },
            // Calculate order metrics
            orderMetrics: {
                itemCount: { $size: "$items" },
                totalQuantity: {
                    $reduce: {
                        input: "$items",
                        initialValue: 0,
                        in: { $add: ["$$value", "$$this.quantity"] }
                    }
                },
                hasDiscounts: {
                    $gt: [{ $size: { $ifNull: ["$discounts", []] } }, 0]
                }
            }
        }
    }
])
```

## 3. Advanced Pipeline Operations 🎯

### Window Operations

```javascript
// Analyzing sales trends with window functions
db.sales.aggregate([
    {
        $setWindowFields: {
            partitionBy: "$productId",
            sortBy: { date: 1 },
            output: {
                // Calculate moving average of sales
                movingAverage: {
                    $avg: "$quantity",
                    window: {
                        range: [-7, 0],
                        unit: "day"
                    }
                },
                // Calculate rank within category
                salesRank: {
                    $rank: {}
                },
                // Calculate running total
                runningTotal: {
                    $sum: "$quantity",
                    window: {
                        documents: ["unbounded", "current"]
                    }
                }
            }
        }
    }
])
```

### Text Analysis

```javascript
// Advanced text analysis pipeline
db.reviews.aggregate([
    // Split text into words
    {
        $addFields: {
            words: {
                $split: [
                    { $toLower: "$reviewText" },
                    " "
                ]
            }
        }
    },
    // Unwind words array
    {
        $unwind: "$words"
    },
    // Remove common words
    {
        $match: {
            words: {
                $nin: ["the", "a", "an", "and", "or", "but"]
            }
        }
    },
    // Group and count words
    {
        $group: {
            _id: "$words",
            count: { $sum: 1 }
        }
    },
    // Sort by frequency
    {
        $sort: { count: -1 }
    },
    // Take top 10 words
    {
        $limit: 10
    }
])
```

## 4. Real-world Analysis Examples 🌍

### Customer Behavior Analysis

```javascript
// Analyze customer purchase patterns
db.orders.aggregate([
    // Match relevant time period
    {
        $match: {
            orderDate: {
                $gte: ISODate("2024-01-01"),
                $lt: ISODate("2024-04-01")
            }
        }
    },
    // Unwind order items
    {
        $unwind: "$items"
    },
    // Group by customer and product
    {
        $group: {
            _id: {
                customerId: "$customerId",
                productId: "$items.productId"
            },
            purchaseCount: { $sum: 1 },
            totalSpent: {
                $sum: { $multiply: ["$items.price", "$items.quantity"] }
            },
            lastPurchase: { $max: "$orderDate" },
            quantityBought: { $sum: "$items.quantity" }
        }
    },
    // Group by customer for overall metrics
    {
        $group: {
            _id: "$_id.customerId",
            distinctProducts: { $sum: 1 },
            totalOrders: { $sum: "$purchaseCount" },
            totalSpent: { $sum: "$totalSpent" },
            favoriteProduct: {
                $top: {
                    output: {
                        productId: "$_id.productId",
                        quantity: "$quantityBought"
                    },
                    sortBy: { quantity: -1 }
                }
            }
        }
    },
    // Calculate customer segments
    {
        $addFields: {
            segment: {
                $switch: {
                    branches: [
                        {
                            case: { $gte: ["$totalSpent", 1000] },
                            then: "VIP"
                        },
                        {
                            case: { $gte: ["$totalSpent", 500] },
                            then: "Regular"
                        }
                    ],
                    default: "Occasional"
                }
            }
        }
    }
])
```

### Sales Performance Analysis

```javascript
// Complex sales analysis pipeline
db.sales.aggregate([
    // Match time period and valid sales
    {
        $match: {
            date: {
                $gte: ISODate("2024-01-01"),
                $lt: ISODate("2024-04-01")
            },
            status: "completed"
        }
    },
    // Add calculated fields
    {
        $addFields: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            week: { $week: "$date" },
            dayOfWeek: { $dayOfWeek: "$date" },
            margin: {
                $subtract: ["$totalAmount", "$costAmount"]
            }
        }
    },
    // Group by multiple time dimensions
    {
        $facet: {
            "monthlyStats": [
                {
                    $group: {
                        _id: {
                            year: "$year",
                            month: "$month"
                        },
                        sales: { $sum: "$totalAmount" },
                        margin: { $sum: "$margin" },
                        transactions: { $sum: 1 }
                    }
                }
            ],
            "weeklyStats": [
                {
                    $group: {
                        _id: {
                            year: "$year",
                            week: "$week"
                        },
                        sales: { $sum: "$totalAmount" },
                        margin: { $sum: "$margin" },
                        transactions: { $sum: 1 }
                    }
                }
            ],
            "dayOfWeekStats": [
                {
                    $group: {
                        _id: "$dayOfWeek",
                        avgSales: { $avg: "$totalAmount" },
                        avgTransactions: { $avg: { $sum: 1 } }
                    }
                }
            ]
        }
    }
])
```

## 5. Performance Optimization Tips 🚀

1. Use Early Filtering
```javascript
// Good: Filter early
db.orders.aggregate([
    { $match: { status: "completed" } },  // Filter first
    { $group: { _id: "$customerId", total: { $sum: "$amount" } } }
])

// Less Efficient: Filter late
db.orders.aggregate([
    { $group: { _id: "$customerId", total: { $sum: "$amount" } } },
    { $match: { total: { $gt: 1000 } } }  // Filter after expensive operation
])
```

2. Use Indexes Effectively
```javascript
// Create indexes for frequently used fields in $match and $sort
db.orders.createIndex({ orderDate: 1, status: 1 })
db.orders.createIndex({ "customer.region": 1, orderDate: 1 })

// Use index for sorting
db.orders.aggregate([
    { $match: { status: "completed" } },
    { $sort: { orderDate: -1 } }  // Will use index
])
```

## References 📚

1. Official Documentation
- MongoDB Aggregation Pipeline
- Pipeline Operators
- Performance Best Practices

2. Tools
- MongoDB Compass Aggregation Pipeline Builder
- Studio 3T Aggregation Editor

3. Additional Resources
- MongoDB University Aggregation Courses
- Community Examples and Patterns
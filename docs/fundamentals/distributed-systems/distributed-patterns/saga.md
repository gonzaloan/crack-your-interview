---
sidebar_position: 6
title: "Saga"
description: "Distributed Patterns - Saga"
---
# 🔄 Distributed Patterns: Saga Pattern

## 1. Overview and Problem Statement 🎯

### Definition
The Saga Pattern is a distributed transactions pattern that manages data consistency across multiple services in a microservices architecture. It breaks down long-running transactions into a sequence of local transactions, where each local transaction updates data within a single service.

### Problems Solved
- Maintaining data consistency across services
- Managing distributed transactions
- Handling partial failures
- Coordinating complex business processes
- Implementing compensating transactions

### Business Value
- **Data Consistency**: Ensures business data remains consistent
- **System Reliability**: Handles failures gracefully
- **Scalability**: Enables distributed transaction management
- **Visibility**: Provides clear transaction state tracking
- **Maintainability**: Simplifies complex workflows

## 2. Detailed Solution/Architecture 🏗️

### Core Components

```mermaid
graph TD
    A[Saga Coordinator] --> B[Service A Transaction]
    A --> C[Service B Transaction]
    A --> D[Service C Transaction]
    
    B --> B1[Compensating Transaction A]
    C --> C1[Compensating Transaction B]
    D --> D1[Compensating Transaction C]
    
    subgraph "Success Flow"
        B --> C --> D
    end
    
    subgraph "Failure Flow"
        D --x D1 --> C1 --> B1
    end
```

### Implementation Types
1. **Choreography-based Saga**
    - Services publish events
    - Each service listens and reacts
    - Decentralized coordination

2. **Orchestration-based Saga**
    - Central coordinator
    - Explicit flow control
    - Centralized monitoring

## 3. Technical Implementation 💻

### 1. Basic Saga Implementation

```python
from enum import Enum
from typing import List, Callable, Dict, Any
from dataclasses import dataclass
import logging
import uuid

class TransactionStatus(Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    COMPENSATING = "COMPENSATING"
    COMPENSATED = "COMPENSATED"

@dataclass
class SagaStep:
    name: str
    execute: Callable
    compensate: Callable
    status: TransactionStatus = TransactionStatus.PENDING
    data: Dict[str, Any] = None

class SagaCoordinator:
    def __init__(self):
        self.steps: List[SagaStep] = []
        self.saga_id = str(uuid.uuid4())
        self.logger = logging.getLogger(__name__)
        
    def add_step(self, name: str, execute: Callable, compensate: Callable):
        step = SagaStep(name=name, execute=execute, compensate=compensate)
        self.steps.append(step)
        
    async def execute(self):
        current_step_index = 0
        
        try:
            # Execute forward transactions
            for step in self.steps:
                self.logger.info(f"Executing step: {step.name}")
                step.data = await step.execute()
                step.status = TransactionStatus.COMPLETED
                current_step_index += 1
                
        except Exception as e:
            self.logger.error(f"Step {step.name} failed: {str(e)}")
            step.status = TransactionStatus.FAILED
            
            # Execute compensating transactions
            await self._compensate(current_step_index)
            raise
            
    async def _compensate(self, failed_step_index: int):
        self.logger.info("Starting compensation process")
        
        # Execute compensating transactions in reverse order
        for step in reversed(self.steps[:failed_step_index]):
            try:
                self.logger.info(f"Compensating step: {step.name}")
                step.status = TransactionStatus.COMPENSATING
                await step.compensate(step.data)
                step.status = TransactionStatus.COMPENSATED
            except Exception as e:
                self.logger.error(f"Compensation failed for step {step.name}: {str(e)}")
                # Handle compensation failure (might need manual intervention)
                raise

# Usage Example
async def book_trip():
    saga = SagaCoordinator()
    
    # Add saga steps
    saga.add_step(
        name="Reserve Hotel",
        execute=reserve_hotel,
        compensate=cancel_hotel_reservation
    )
    saga.add_step(
        name="Book Flight",
        execute=book_flight,
        compensate=cancel_flight
    )
    saga.add_step(
        name="Charge Payment",
        execute=charge_payment,
        compensate=refund_payment
    )
    
    await saga.execute()
```

### 2. Choreography-based Saga Implementation

```python
from abc import ABC, abstractmethod
from typing import Dict, Any
import asyncio
import json

class EventBus:
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
        
    def subscribe(self, event_type: str, callback: Callable):
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(callback)
        
    async def publish(self, event_type: str, data: Any):
        if event_type in self.subscribers:
            for callback in self.subscribers[event_type]:
                await callback(data)

class SagaParticipant(ABC):
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.register_handlers()
        
    @abstractmethod
    def register_handlers(self):
        pass
        
    @abstractmethod
    async def execute_transaction(self, data: Dict):
        pass
        
    @abstractmethod
    async def execute_compensation(self, data: Dict):
        pass

class HotelService(SagaParticipant):
    def register_handlers(self):
        self.event_bus.subscribe("BookTrip", self.handle_book_trip)
        self.event_bus.subscribe("CompensateHotel", self.execute_compensation)
        
    async def handle_book_trip(self, data: Dict):
        try:
            result = await self.execute_transaction(data)
            await self.event_bus.publish("HotelBooked", result)
        except Exception as e:
            await self.event_bus.publish("HotelBookingFailed", str(e))
            
    async def execute_transaction(self, data: Dict):
        # Implement hotel booking logic
        return {"reservation_id": "123"}
        
    async def execute_compensation(self, data: Dict):
        # Implement hotel cancellation logic
        pass

class ChoreographySaga:
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.completed_steps = []
        self.failed = False
        
    async def start(self, data: Dict):
        await self.event_bus.publish("BookTrip", data)
        
    def handle_success(self, step: str):
        self.completed_steps.append(step)
        
    def handle_failure(self, step: str):
        self.failed = True
        # Start compensation
        self._start_compensation()
        
    async def _start_compensation(self):
        for step in reversed(self.completed_steps):
            await self.event_bus.publish(f"Compensate{step}", {})

# Usage Example
async def main():
    event_bus = EventBus()
    hotel_service = HotelService(event_bus)
    flight_service = FlightService(event_bus)
    payment_service = PaymentService(event_bus)
    
    saga = ChoreographySaga(event_bus)
    await saga.start({"trip_id": "T123"})
```

### 3. Orchestration-based Saga Implementation

```python
from dataclasses import dataclass
from typing import List, Dict, Optional
import asyncio

@dataclass
class SagaDefinition:
    steps: List[Dict[str, Callable]]
    compensation_steps: List[Dict[str, Callable]]

class SagaOrchestrator:
    def __init__(self):
        self.sagas: Dict[str, SagaDefinition] = {}
        self.active_sagas: Dict[str, Dict] = {}
        
    def define_saga(self, saga_name: str, saga_definition: SagaDefinition):
        self.sagas[saga_name] = saga_definition
        
    async def start_saga(self, saga_name: str, initial_data: Dict) -> str:
        if saga_name not in self.sagas:
            raise ValueError(f"Saga {saga_name} not found")
            
        saga_instance_id = str(uuid.uuid4())
        self.active_sagas[saga_instance_id] = {
            "definition": self.sagas[saga_name],
            "state": initial_data,
            "current_step": 0,
            "status": "RUNNING"
        }
        
        await self._execute_saga(saga_instance_id)
        return saga_instance_id
        
    async def _execute_saga(self, saga_instance_id: str):
        saga = self.active_sagas[saga_instance_id]
        current_step = saga["current_step"]
        
        try:
            while current_step < len(saga["definition"].steps):
                step = saga["definition"].steps[current_step]
                result = await step["execute"](saga["state"])
                saga["state"].update(result)
                saga["current_step"] += 1
                current_step += 1
                
            saga["status"] = "COMPLETED"
            
        except Exception as e:
            saga["status"] = "FAILED"
            await self._compensate_saga(saga_instance_id)
            
    async def _compensate_saga(self, saga_instance_id: str):
        saga = self.active_sagas[saga_instance_id]
        current_step = saga["current_step"]
        
        for compensation_step in reversed(saga["definition"].compensation_steps[:current_step]):
            try:
                await compensation_step["compensate"](saga["state"])
            except Exception as e:
                # Log compensation failure
                pass
                
        saga["status"] = "COMPENSATED"

# Usage Example
async def create_order_saga():
    orchestrator = SagaOrchestrator()
    
    saga_definition = SagaDefinition(
        steps=[
            {"execute": create_order},
            {"execute": reserve_inventory},
            {"execute": process_payment},
            {"execute": ship_order}
        ],
        compensation_steps=[
            {"compensate": cancel_shipment},
            {"compensate": refund_payment},
            {"compensate": release_inventory},
            {"compensate": cancel_order}
        ]
    )
    
    orchestrator.define_saga("CreateOrder", saga_definition)
    return orchestrator
```

## 4. Best Practices and Guidelines 📝

### 1. Idempotency Implementation

```python
from functools import wraps
import hashlib

def idempotent(key_generator):
    def decorator(func):
        @wraps(func)
        async def wrapper(self, *args, **kwargs):
            # Generate idempotency key
            key = key_generator(*args, **kwargs)
            
            # Check if operation was already executed
            if await self.is_already_executed(key):
                return await self.get_stored_result(key)
                
            # Execute operation
            result = await func(self, *args, **kwargs)
            
            # Store result
            await self.store_result(key, result)
            return result
        return wrapper
    return decorator

class PaymentService:
    @idempotent(lambda transaction_id: f"payment_{transaction_id}")
    async def process_payment(self, transaction_id: str, amount: float):
        # Process payment logic
        pass
```

### 2. Error Handling

```python
class SagaError(Exception):
    def __init__(self, step_name: str, original_error: Exception):
        self.step_name = step_name
        self.original_error = original_error
        super().__init__(f"Saga step {step_name} failed: {str(original_error)}")

class CompensationError(Exception):
    def __init__(self, step_name: str, original_error: Exception):
        self.step_name = step_name
        self.original_error = original_error
        super().__init__(f"Compensation for step {step_name} failed: {str(original_error)}")

class SagaErrorHandler:
    @staticmethod
    async def handle_error(error: Exception, saga_instance: Dict):
        if isinstance(error, SagaError):
            # Log error details
            logging.error(f"Saga failed at step {error.step_name}: {error.original_error}")
            
            # Start compensation
            await saga_instance["orchestrator"].compensate()
            
        elif isinstance(error, CompensationError):
            # Log compensation failure
            logging.error(f"Compensation failed at step {error.step_name}: {error.original_error}")
            
            # Notify administrators
            await notify_administrators(error)
```

## 5. Monitoring and Observability 📊

### Implementation

```python
from dataclasses import dataclass
from datetime import datetime
import prometheus_client as prom

@dataclass
class SagaMetrics:
    saga_duration = prom.Histogram(
        'saga_duration_seconds',
        'Time spent executing saga',
        ['saga_name']
    )
    saga_success = prom.Counter(
        'saga_success_total',
        'Number of successfully completed sagas',
        ['saga_name']
    )
    saga_failures = prom.Counter(
        'saga_failures_total',
        'Number of failed sagas',
        ['saga_name']
    )
    compensation_success = prom.Counter(
        'compensation_success_total',
        'Number of successful compensations',
        ['saga_name']
    )
    compensation_failures = prom.Counter(
        'compensation_failures_total',
        'Number of failed compensations',
        ['saga_name']
    )

class MonitoredSagaOrchestrator:
    def __init__(self):
        self.metrics = SagaMetrics()
        
    @contextlib.contextmanager
    def monitor_saga_execution(self, saga_name: str):
        start_time = time.time()
        try:
            yield
            self.metrics.saga_success.labels(saga_name).inc()
        except Exception:
            self.metrics.saga_failures.labels(saga_name).inc()
            raise
        finally:
            duration = time.time() - start_time
            self.metrics.saga_duration.labels(saga_name).observe(duration)
```

## 6. Testing Strategies 🧪

### Integration Testing

```python
from typing import AsyncGenerator
import pytest
import pytest_asyncio
import asyncio
from databases import Database

class TestSagaIntegration:
    @pytest_asyncio.fixture
    async def database(self) -> AsyncGenerator[Database, None]:
        db = Database("postgresql://user:pass@localhost/test")
        await db.connect()
        yield db
        await db.disconnect()
    
    @pytest_asyncio.fixture
    async def saga_orchestrator(self, database):
        orchestrator = SagaOrchestrator()
        
        async def create_order(data):
            await database.execute(
                "INSERT INTO orders (id, status) VALUES (:id, :status)",
                {"id": data["order_id"], "status": "PENDING"}
            )
            return {"order_created": True}
            
        async def reserve_inventory(data):
            await database.execute(
                "UPDATE inventory SET quantity = quantity - :quantity WHERE product_id = :product_id",
                {"product_id": data["product_id"], "quantity": data["quantity"]}
            )
            return {"inventory_reserved": True}
            
        saga_definition = SagaDefinition(
            steps=[
                {"execute": create_order},
                {"execute": reserve_inventory}
            ],
            compensation_steps=[
                {"compensate": release_inventory},
                {"compensate": cancel_order}
            ]
        )
        
        orchestrator.define_saga("CreateOrder", saga_definition)
        return orchestrator
    
    async def test_create_order_saga(self, saga_orchestrator, database):
        # Setup test data
        initial_data = {
            "order_id": "O123",
            "product_id": "P456",
            "quantity": 1
        }
        
        # Execute saga
        saga_id = await saga_orchestrator.start_saga("CreateOrder", initial_data)
        
        # Verify final state
        order = await database.fetch_one(
            "SELECT status FROM orders WHERE id = :id",
            {"id": initial_data["order_id"]}
        )
        assert order["status"] == "COMPLETED"
        
        inventory = await database.fetch_one(
            "SELECT quantity FROM inventory WHERE product_id = :id",
            {"id": initial_data["product_id"]}
        )
        assert inventory["quantity"] == initial_data["quantity"]
```

### Failure Testing

```python
class TestSagaFailures:
    @pytest.fixture
    def failing_saga(self):
        orchestrator = SagaOrchestrator()
        
        async def failing_step(data):
            raise Exception("Simulated failure")
        
        async def compensation_step(data):
            return {"compensated": True}
        
        saga_definition = SagaDefinition(
            steps=[
                {"execute": Mock(return_value={"step1": "completed"})},
                {"execute": failing_step}
            ],
            compensation_steps=[
                {"compensate": compensation_step},
                {"compensate": Mock()}
            ]
        )
        
        orchestrator.define_saga("FailingSaga", saga_definition)
        return orchestrator
    
    async def test_saga_compensation_on_failure(self, failing_saga):
        with pytest.raises(Exception) as exc_info:
            await failing_saga.start_saga("FailingSaga", {})
        
        assert str(exc_info.value) == "Simulated failure"
        
        # Verify compensation was executed
        saga_state = failing_saga.active_sagas[0]
        assert saga_state["status"] == "COMPENSATED"
        assert saga_state["state"].get("compensated") == True
```

## 7. Performance Optimization ⚡

### 1. Parallel Execution

```python
class ParallelSagaOrchestrator:
    async def _execute_parallel_steps(self, steps: List[Dict], state: Dict) -> Dict:
        tasks = []
        for step in steps:
            if step.get("parallel", False):
                task = asyncio.create_task(step["execute"](state))
                tasks.append(task)
            else:
                # Execute non-parallel steps sequentially
                result = await step["execute"](state)
                state.update(result)
        
        if tasks:
            # Wait for all parallel tasks to complete
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Handle any exceptions from parallel execution
            for result in results:
                if isinstance(result, Exception):
                    raise result
                state.update(result)
        
        return state

# Usage Example
saga_definition = SagaDefinition(
    steps=[
        {"execute": create_order},
        {
            "execute": reserve_inventory,
            "parallel": True
        },
        {
            "execute": process_payment,
            "parallel": True
        }
    ],
    compensation_steps=[...]
)
```

### 2. Batch Processing

```python
class BatchSagaOrchestrator:
    def __init__(self, batch_size: int = 10):
        self.batch_size = batch_size
        self.pending_sagas: List[Dict] = []
    
    async def add_to_batch(self, saga_name: str, initial_data: Dict):
        self.pending_sagas.append({
            "saga_name": saga_name,
            "data": initial_data
        })
        
        if len(self.pending_sagas) >= self.batch_size:
            await self.process_batch()
    
    async def process_batch(self):
        tasks = []
        for saga in self.pending_sagas:
            task = self.start_saga(saga["saga_name"], saga["data"])
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        self.pending_sagas = []
        return results
```

## 8. Common Patterns and Use Cases 🌟

### 1. Order Processing Saga

```python
class OrderProcessingSaga:
    def __init__(self):
        self.orchestrator = SagaOrchestrator()
        
        saga_definition = SagaDefinition(
            steps=[
                {
                    "name": "Validate Order",
                    "execute": self.validate_order
                },
                {
                    "name": "Reserve Inventory",
                    "execute": self.reserve_inventory
                },
                {
                    "name": "Process Payment",
                    "execute": self.process_payment
                },
                {
                    "name": "Ship Order",
                    "execute": self.ship_order
                }
            ],
            compensation_steps=[
                {
                    "name": "Cancel Shipment",
                    "compensate": self.cancel_shipment
                },
                {
                    "name": "Refund Payment",
                    "compensate": self.refund_payment
                },
                {
                    "name": "Release Inventory",
                    "compensate": self.release_inventory
                },
                {
                    "name": "Cancel Order",
                    "compensate": self.cancel_order
                }
            ]
        )
        
        self.orchestrator.define_saga("OrderProcessing", saga_definition)
    
    async def process_order(self, order_data: Dict):
        return await self.orchestrator.start_saga("OrderProcessing", order_data)
```

### 2. Travel Booking Saga

```python
class TravelBookingSaga:
    def __init__(self):
        self.orchestrator = SagaOrchestrator()
        
        saga_definition = SagaDefinition(
            steps=[
                {
                    "name": "Book Flight",
                    "execute": self.book_flight,
                    "parallel": True
                },
                {
                    "name": "Book Hotel",
                    "execute": self.book_hotel,
                    "parallel": True
                },
                {
                    "name": "Book Car",
                    "execute": self.book_car,
                    "parallel": True
                },
                {
                    "name": "Process Payment",
                    "execute": self.process_payment
                }
            ],
            compensation_steps=[
                {
                    "name": "Refund Payment",
                    "compensate": self.refund_payment
                },
                {
                    "name": "Cancel Car",
                    "compensate": self.cancel_car
                },
                {
                    "name": "Cancel Hotel",
                    "compensate": self.cancel_hotel
                },
                {
                    "name": "Cancel Flight",
                    "compensate": self.cancel_flight
                }
            ]
        )
        
        self.orchestrator.define_saga("TravelBooking", saga_definition)
```

## 9. Security Considerations 🔒

### 1. Transaction Isolation

```python
class IsolatedSagaOrchestrator:
    def __init__(self):
        self.locked_resources: Dict[str, str] = {}
    
    async def acquire_lock(self, resource_id: str, saga_id: str) -> bool:
        if resource_id in self.locked_resources:
            return False
        self.locked_resources[resource_id] = saga_id
        return True
    
    async def release_lock(self, resource_id: str, saga_id: str):
        if self.locked_resources.get(resource_id) == saga_id:
            del self.locked_resources[resource_id]
    
    async def execute_isolated_step(self, step: Dict, saga_id: str, data: Dict):
        required_resources = step.get("required_resources", [])
        
        # Acquire all locks
        locks_acquired = all(
            await self.acquire_lock(resource, saga_id)
            for resource in required_resources
        )
        
        if not locks_acquired:
            raise ResourceLockError("Failed to acquire required locks")
        
        try:
            return await step["execute"](data)
        finally:
            # Release all locks
            for resource in required_resources:
                await self.release_lock(resource, saga_id)
```

## 10. References and Resources 📚

### Books
- "Microservices Patterns" by Chris Richardson
- "Domain-Driven Design" by Eric Evans
- "Building Microservices" by Sam Newman

### Articles
- [Pattern: Saga](https://microservices.io/patterns/data/saga.html)
- [SAGA Pattern for Microservices Distributed Transactions](https://docs.microsoft.com/en-us/azure/architecture/reference-architectures/saga/saga)
- [Implementing the Saga Pattern](https://www.baeldung.com/saga-pattern)

### Academic Papers
- Garcia-Molina, H. & Salem, K. (1987). "Sagas"
- Clemens Vasters. "Messaging Patterns in Service-Oriented Architecture"
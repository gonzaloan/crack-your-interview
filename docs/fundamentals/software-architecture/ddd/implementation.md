---
sidebar_position: 5
title: "DDD Implementation"
description: "DDD Implementation"
---

# Implementing Domain-Driven Design: A Practical Guide 🏗️

## Introduction

Domain-Driven Design is like building a model of a city. Just as a city planner must understand how people live, work, and move through the city before designing it, we must deeply understand our business domain before we can build software for it. In this guide, we'll explore how to bring DDD concepts to life in actual code, focusing on practical implementation patterns and real-world considerations.

Let's start with a concrete example that we'll develop throughout this guide - an airline booking system. This domain has rich business rules, complex workflows, and multiple stakeholders, making it perfect for demonstrating DDD implementation.

## Project Structure 📁

Let's organize the airline booking system code into a clear and maintainable structure that reflects DDD principles. Each folder and file has a specific responsibility aligned with DDD architectural layers.

```
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── airline/
│   │           ├── domain/                    # Domain Layer
│   │           │   ├── booking/               # Booking Bounded Context
│   │           │   │   ├── model/
│   │           │   │   │   ├── FlightBooking.java
│   │           │   │   │   ├── BookingId.java
│   │           │   │   │   ├── BookingStatus.java
│   │           │   │   │   ├── SeatAssignment.java
│   │           │   │   │   └── BookingRule.java
│   │           │   │   ├── events/
│   │           │   │   │   ├── BookingConfirmedEvent.java
│   │           │   │   │   └── BookingCancelledEvent.java
│   │           │   │   ├── repository/
│   │           │   │   │   └── BookingRepository.java
│   │           │   │   └── exception/
│   │           │   │       ├── InvalidBookingStateException.java
│   │           │   │       └── FlightFullException.java
│   │           │   │
│   │           │   ├── passenger/             # Passenger Bounded Context
│   │           │   │   ├── model/
│   │           │   │   │   ├── Passenger.java
│   │           │   │   │   ├── PassengerId.java
│   │           │   │   │   ├── PassengerName.java
│   │           │   │   │   ├── PassengerType.java
│   │           │   │   │   ├── SpecialAssistance.java
│   │           │   │   │   └── FrequentFlyerStatus.java
│   │           │   │   ├── events/
│   │           │   │   │   └── FrequentFlyerStatusUpgradedEvent.java
│   │           │   │   └── repository/
│   │           │   │       └── PassengerRepository.java
│   │           │   │
│   │           │   ├── flight/                # Flight Bounded Context
│   │           │   │   ├── model/
│   │           │   │   │   ├── Flight.java
│   │           │   │   │   ├── FlightId.java
│   │           │   │   │   ├── SeatClass.java
│   │           │   │   │   └── SeatLocation.java
│   │           │   │   └── repository/
│   │           │   │       └── FlightRepository.java
│   │           │   │
│   │           │   └── shared/                # Shared Kernel
│   │           │       ├── DomainEvent.java
│   │           │       └── Money.java
│   │           │
│   │           ├── application/               # Application Layer
│   │           │   ├── booking/
│   │           │   │   ├── BookingApplicationService.java
│   │           │   │   ├── CreateBookingCommand.java
│   │           │   │   └── BookingEventHandler.java
│   │           │   └── passenger/
│   │           │       └── PassengerApplicationService.java
│   │           │
│   │           ├── infrastructure/            # Infrastructure Layer
│   │           │   ├── persistence/
│   │           │   │   ├── jpa/
│   │           │   │   │   ├── entity/
│   │           │   │   │   │   ├── BookingEntity.java
│   │           │   │   │   │   ├── PassengerEntity.java
│   │           │   │   │   │   └── FlightEntity.java
│   │           │   │   │   └── repository/
│   │           │   │   │       ├── BookingJpaRepository.java
│   │           │   │   │       ├── PassengerJpaRepository.java
│   │           │   │   │       └── FlightJpaRepository.java
│   │           │   │   └── mapper/
│   │           │   │       ├── BookingMapper.java
│   │           │   │       ├── PassengerMapper.java
│   │           │   │       └── FlightMapper.java
│   │           │   ├── messaging/
│   │           │   │   └── RabbitMQEventPublisher.java
│   │           │   └── services/
│   │           │       ├── EmailService.java
│   │           │       └── CateringService.java
│   │           │
│   │           └── interfaces/                # Interface Layer
│   │               ├── rest/
│   │               │   ├── BookingController.java
│   │               │   └── dto/
│   │               │       ├── BookingRequest.java
│   │               │       └── BookingResponse.java
│   │               └── async/
│   │                   └── BookingMessageConsumer.java
│   │
│   └── resources/
│       ├── application.properties
│       └── db/
│           └── migration/
│               └── V1__create_tables.sql
│
└── test/                                      # Test Layer
    └── java/
        └── com/
            └── airline/
                ├── domain/
                │   ├── booking/
                │   │   └── FlightBookingTest.java
                │   └── passenger/
                │       └── PassengerTest.java
                ├── application/
                │   └── booking/
                │       └── BookingApplicationServiceTest.java
                └── infrastructure/
                    └── persistence/
                        └── BookingRepositoryTest.java
```

Let's understand the key aspects of this structure:

1. **Domain Layer** (`domain/`)
    - Organized by bounded contexts (booking, passenger, flight)
    - Each context has its own model, events, and repository interfaces
    - Shared kernel contains common domain concepts

2. **Application Layer** (`application/`)
    - Contains application services that coordinate use cases
    - Command objects define input for use cases
    - Event handlers manage reactions to domain events

3. **Infrastructure Layer** (`infrastructure/`)
    - Handles technical concerns like persistence and messaging
    - Implements repository interfaces from domain layer
    - Contains mappers to convert between domain and persistence models

4. **Interface Layer** (`interfaces/`)
    - REST controllers and DTOs for API endpoints
    - Message consumers for async operations
    - Adapts external requests to application services

5. **Test Layer** (`test/`)
    - Mirrors the main source structure
    - Contains unit tests for each layer
    - Integration tests for infrastructure components

This structure follows several important principles:

1. **Separation of Concerns**
    - Each layer has clear responsibilities
    - Domain logic is isolated from infrastructure concerns
    - Interface adapters are separated from application logic

2. **Domain-Centric Organization**
    - Domain model is at the heart of the structure
    - Bounded contexts are clearly separated
    - Shared concepts are explicitly identified

3. **Dependency Rule**
    - Inner layers don't depend on outer layers
    - Domain layer has no external dependencies
    - Infrastructure depends on domain interfaces

4. **Package by Feature**
    - Code is organized around business capabilities
    - Related classes stay together
    - Makes it easier to find and modify related code


## Core Domain Implementation

Let's begin with the heart of our system - the flight booking process:

```java
public class FlightBooking {
    private final BookingId id;
    private final PassengerId passengerId;
    private final FlightId flightId;
    private BookingStatus status;
    private SeatAssignment seatAssignment;
    private final List<BookingRule> specialRequirements;
    private final List<DomainEvent> domainEvents;

    // Private constructor enforces the use of factory method
    private FlightBooking(
            BookingId id,
            PassengerId passengerId,
            FlightId flightId) {
        this.id = Objects.requireNonNull(id, "Booking ID cannot be null");
        this.passengerId = Objects.requireNonNull(passengerId, "Passenger ID cannot be null");
        this.flightId = Objects.requireNonNull(flightId, "Flight ID cannot be null");
        this.status = BookingStatus.PENDING;
        this.specialRequirements = new ArrayList<>();
        this.domainEvents = new ArrayList<>();
    }

    // Factory method ensures valid initial state
    public static FlightBooking initiate(
            PassengerId passengerId,
            FlightId flightId) {
        BookingId id = BookingId.generate();
        return new FlightBooking(id, passengerId, flightId);
    }

    public void confirmBooking(
            Flight flight,
            SeatAssignment requestedSeat) {
        // Think of this like checking all requirements before confirming a reservation
        validateCanConfirm(flight);
        ensureSeatAvailable(flight, requestedSeat);
        
        // Like putting a "reserved" sign on a restaurant table
        this.seatAssignment = requestedSeat;
        this.status = BookingStatus.CONFIRMED;
        
        // Announce the reservation to interested parties
        domainEvents.add(new BookingConfirmedEvent(
            this.id,
            this.passengerId,
            this.flightId,
            this.seatAssignment
        ));
    }

    private void validateCanConfirm(Flight flight) {
        // Just as a restaurant checks if they're open and have capacity
        if (status != BookingStatus.PENDING) {
            throw new InvalidBookingStateException(
                "Can only confirm pending bookings"
            );
        }

        if (!flight.hasAvailableSeats()) {
            throw new FlightFullException(flight.getId());
        }

        // Ensure all special requirements can be met
        for (BookingRule requirement : specialRequirements) {
            requirement.validate(flight);
        }
    }
}
```

Now let's explore how we handle the concepts of seats and seat assignments, which are important value objects in our domain:

```java
// Value objects are like descriptions of things - they're defined by their attributes
public record SeatAssignment(
        String seatNumber,
        SeatClass seatClass,
        SeatLocation location) {
    
    public SeatAssignment {
        // Like checking if a restaurant table description makes sense
        validateSeatNumber(seatNumber);
        Objects.requireNonNull(seatClass, "Seat class cannot be null");
        Objects.requireNonNull(location, "Seat location cannot be null");
    }

    private static void validateSeatNumber(String seatNumber) {
        // Airline seats follow a specific pattern (e.g., "12A", "15F")
        if (!seatNumber.matches("\\d{1,2}[A-F]")) {
            throw new InvalidSeatNumberException(
                "Seat number must be in format: 12A"
            );
        }
    }

    public boolean isEmergencyExit() {
        // Emergency exit rows are typically rows 12-14
        int row = Integer.parseInt(seatNumber.substring(0, 
            seatNumber.length() - 1));
        return row >= 12 && row <= 14;
    }
}
```

Let's implement how we handle passenger information, which is another important entity in our domain:

```java
public class Passenger {
    private final PassengerId id;
    private PassengerName name;
    private PassengerType type;
    private List<SpecialAssistance> specialAssistance;
    private FrequentFlyerStatus frequentFlyerStatus;

    public boolean canSitInEmergencyExit() {
        // Just as emergency exit seats have special requirements
        if (type == PassengerType.INFANT) {
            return false;
        }

        if (specialAssistance.stream()
                .anyMatch(SpecialAssistance::requiresAssistance)) {
            return false;
        }

        return true;
    }

    public void upgradeFrequentFlyerStatus() {
        // Like getting promoted to VIP status at a hotel
        switch (frequentFlyerStatus) {
            case REGULAR -> frequentFlyerStatus = FrequentFlyerStatus.SILVER;
            case SILVER -> frequentFlyerStatus = FrequentFlyerStatus.GOLD;
            case GOLD -> frequentFlyerStatus = FrequentFlyerStatus.PLATINUM;
            case PLATINUM -> {} // Already at highest level
        }

        // Announce the upgrade
        addDomainEvent(new FrequentFlyerStatusUpgradedEvent(
            this.id,
            frequentFlyerStatus
        ));
    }
}
```

Our domain events help different parts of the system stay coordinated:

```java
public record BookingConfirmedEvent(
        BookingId bookingId,
        PassengerId passengerId,
        FlightId flightId,
        SeatAssignment seatAssignment,
        LocalDateTime occurredOn) implements DomainEvent {
    
    public BookingConfirmedEvent(
            BookingId bookingId,
            PassengerId passengerId,
            FlightId flightId,
            SeatAssignment seatAssignment) {
        this(bookingId, passengerId, flightId, seatAssignment, 
             LocalDateTime.now());
    }
}

// Event handlers respond to important domain events
@Component
public class BookingEventHandler {
    private final EmailService emailService;
    private final CateringService cateringService;
    
    @EventListener
    public void on(BookingConfirmedEvent event) {
        // Send confirmation email to passenger
        emailService.sendBookingConfirmation(
            event.passengerId(),
            event.bookingId()
        );
        
        // Update meal requirements if applicable
        if (event.seatAssignment().seatClass() == SeatClass.FIRST) {
            cateringService.registerFirstClassMeal(
                event.flightId(),
                event.passengerId()
            );
        }
    }
}
```

The application layer coordinates the use cases:

```java
@Service
public class BookingApplicationService {
    private final PassengerRepository passengerRepository;
    private final FlightRepository flightRepository;
    private final BookingRepository bookingRepository;
    private final DomainEventPublisher eventPublisher;

    @Transactional
    public BookingId makeBooking(CreateBookingCommand command) {
        // Load required entities
        Passenger passenger = passengerRepository
            .findById(command.passengerId())
            .orElseThrow(() -> new PassengerNotFoundException(
                command.passengerId()
            ));

        Flight flight = flightRepository
            .findById(command.flightId())
            .orElseThrow(() -> new FlightNotFoundException(
                command.flightId()
            ));

        // Create and confirm the booking
        FlightBooking booking = FlightBooking.initiate(
            passenger.getId(),
            flight.getId()
        );

        // If special seat was requested, attempt to assign it
        if (command.hasSeatPreference()) {
            SeatAssignment requestedSeat = command.getSeatPreference();
            
            // Check if passenger can sit in emergency exit if applicable
            if (requestedSeat.isEmergencyExit() && 
                !passenger.canSitInEmergencyExit()) {
                throw new InvalidSeatAssignmentException(
                    "Passenger cannot sit in emergency exit row"
                );
            }
            
            booking.confirmBooking(flight, requestedSeat);
        } else {
            // Assign best available seat based on passenger status
            SeatAssignment bestSeat = flight.findBestAvailableSeat(
                passenger.getFrequentFlyerStatus()
            );
            booking.confirmBooking(flight, bestSeat);
        }

        // Save the booking
        bookingRepository.save(booking);

        // Publish all domain events
        booking.getDomainEvents().forEach(eventPublisher::publish);

        return booking.getId();
    }
}
```

The infrastructure layer handles the technical details:

```java
@Repository
public class JpaBookingRepository implements BookingRepository {
    private final BookingJpaRepository jpaRepository;
    private final BookingMapper mapper;

    @Override
    public Optional<FlightBooking> findById(BookingId id) {
        return jpaRepository.findById(id.getValue())
            .map(mapper::toDomain);
    }

    @Override
    public FlightBooking save(FlightBooking booking) {
        BookingEntity entity = mapper.toEntity(booking);
        BookingEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }
}

@Component
public class BookingMapper {
    public BookingEntity toEntity(FlightBooking domain) {
        BookingEntity entity = new BookingEntity();
        // Map basic fields
        entity.setId(domain.getId().getValue());
        entity.setPassengerId(domain.getPassengerId().getValue());
        entity.setFlightId(domain.getFlightId().getValue());
        entity.setStatus(domain.getStatus().name());
        
        // Map seat assignment
        if (domain.hasSeatAssignment()) {
            entity.setSeatNumber(
                domain.getSeatAssignment().seatNumber()
            );
            entity.setSeatClass(
                domain.getSeatAssignment().seatClass().name()
            );
        }
        
        return entity;
    }

    public FlightBooking toDomain(BookingEntity entity) {
        return FlightBooking.reconstitute(
            new BookingId(entity.getId()),
            new PassengerId(entity.getPassengerId()),
            new FlightId(entity.getFlightId()),
            entity.getStatus() != null ? 
                BookingStatus.valueOf(entity.getStatus()) : 
                null,
            entity.getSeatNumber() != null ?
                new SeatAssignment(
                    entity.getSeatNumber(),
                    SeatClass.valueOf(entity.getSeatClass()),
                    SeatLocation.fromSeatNumber(entity.getSeatNumber())
                ) : null
        );
    }
}
```

This implementation demonstrates key DDD principles in action:

1. The domain model captures essential business rules (like seat assignment rules and booking confirmation requirements)
2. Value objects encapsulate related attributes and validation (like SeatAssignment)
3. Entities maintain identity and track change (like FlightBooking)
4. Domain events communicate important changes (like BookingConfirmedEvent)
5. The application layer coordinates use cases while keeping domain logic in the model
6. The infrastructure layer handles technical concerns without polluting the domain model

Remember, the goal is to create a model that domain experts would recognize and understand. Each piece of code should reflect some concept from the business domain, making the system easier to maintain and evolve as business needs change.

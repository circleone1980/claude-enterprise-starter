---
name: java-coding-standards
description: "Java coding standards for Spring Boot services: naming, immutability, Optional usage, streams, exceptions, generics, and project layout."
origin: ECC
paths: "**/*.java"
---

# Java Coding Standards

Standards for readable, maintainable Java (17+) code in Spring Boot services.

## When to Activate

- Writing or reviewing Java code in Spring Boot projects
- Enforcing naming, immutability, or exception handling conventions
- Working with records, sealed classes, or pattern matching (Java 17+)

## Core Principles

- Prefer clarity over cleverness
- Immutable by default; minimize shared mutable state
- Fail fast with meaningful exceptions
- Consistent naming and package structure

## Naming

```java
// Classes/Records: PascalCase
public class MarketService {}
public record Money(BigDecimal amount, Currency currency) {}

// Methods/fields: camelCase
private final MarketRepository marketRepository;

// Constants: UPPER_SNAKE_CASE
private static final int MAX_PAGE_SIZE = 100;
```

## Immutability

```java
// Favor records and final fields
public record MarketDto(Long id, String name, MarketStatus status) {}
```

## Optional Usage

```java
// Return Optional from find* methods
return marketRepository.findBySlug(slug)
    .map(MarketResponse::from)
    .orElseThrow(() -> new EntityNotFoundException("Market not found"));
```

## Exceptions

- Use unchecked exceptions for domain errors
- Create domain-specific exceptions (e.g., `MarketNotFoundException`)
- Avoid broad `catch (Exception ex)` unless rethrowing/logging centrally

## Project Structure

```
src/main/java/com/example/app/
  config/
  controller/
  service/
  repository/
  domain/
  dto/
  util/
src/test/java/... (mirrors main)
```

## Code Smells to Avoid

- Long parameter lists -> use DTO/builders
- Deep nesting -> early returns
- Magic numbers -> named constants
- Static mutable state -> prefer dependency injection

## Logging

```java
private static final Logger log = LoggerFactory.getLogger(MarketService.class);
log.info("fetch_market slug={}", slug);
log.error("failed_fetch_market slug={}", slug, ex);
```

**Remember**: Keep code intentional, typed, and observable. Optimize for maintainability.

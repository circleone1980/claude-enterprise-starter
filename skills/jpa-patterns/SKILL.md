---
name: jpa-patterns
description: JPA/Hibernate patterns for entity design, relationships, query optimization, transactions, auditing, indexing, pagination, and pooling in Spring Boot.
origin: ECC
paths: "**/repository/**/*.java,**/entity/**/*.java,**/domain/**/*.java"
---

# JPA/Hibernate Patterns

Use for data modeling, repositories, and performance tuning in Spring Boot.

## When to Activate

- Designing JPA entities and table mappings
- Defining relationships (@OneToMany, @ManyToOne, @ManyToMany)
- Optimizing queries (N+1 prevention, fetch strategies, projections)
- Configuring transactions, auditing, or soft deletes
- Setting up pagination, sorting, or custom repository methods

## Entity Design

```java
@Entity
@Table(name = "markets", indexes = {
  @Index(name = "idx_markets_slug", columnList = "slug", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
public class MarketEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(nullable = false, unique = true, length = 120)
  private String slug;

  @Enumerated(EnumType.STRING)
  private MarketStatus status = MarketStatus.ACTIVE;

  @CreatedDate private Instant createdAt;
  @LastModifiedDate private Instant updatedAt;
}
```

## Relationships and N+1 Prevention

- Default to lazy loading; use `JOIN FETCH` in queries when needed
- Avoid `EAGER` on collections; use DTO projections for read paths

```java
@Query("select m from MarketEntity m left join fetch m.positions where m.id = :id")
Optional<MarketEntity> findWithPositions(@Param("id") Long id);
```

## Repository Patterns

```java
public interface MarketRepository extends JpaRepository<MarketEntity, Long> {
  Optional<MarketEntity> findBySlug(String slug);

  // Projections for lightweight queries
  Page<MarketSummary> findAllBy(Pageable pageable);
}
```

## Transactions

```java
@Transactional
public Market updateStatus(Long id, MarketStatus status) {
  MarketEntity entity = repo.findById(id)
      .orElseThrow(() -> new EntityNotFoundException("Market"));
  entity.setStatus(status);
  return Market.from(entity);
}
```

## Pagination

```java
PageRequest page = PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());
```

## Indexing and Performance

- Add indexes for common filters (`status`, `slug`, foreign keys)
- Use composite indexes matching query patterns (`status, created_at`)
- Batch writes with `saveAll` and `hibernate.jdbc.batch_size`

## Connection Pooling (HikariCP)

```
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
```

## Migrations

- Use Flyway or Liquibase; never rely on Hibernate auto DDL in production
- Keep migrations idempotent and additive

## Testing Data Access

- Prefer `@DataJpaTest` with Testcontainers to mirror production
- Assert SQL efficiency: `logging.level.org.hibernate.SQL=DEBUG`

**Remember**: Keep entities lean, queries intentional, and transactions short. Prevent N+1 with fetch strategies and projections.

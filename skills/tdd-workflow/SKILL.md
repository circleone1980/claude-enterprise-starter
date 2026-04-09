---
name: tdd-workflow
description: |
  Test-driven development with Red-Green-Refactor loop.

  TRIGGER when: user wants to implement a feature, fix a bug, write tests, mentions "TDD", "测试驱动开发", "test-driven", "unit test", "testing", "Red-Green", "覆盖率", "pytest", "jest".

  Use this skill BEFORE writing implementation code. TDD is mandatory for all development work - backend (Python/FastAPI) and frontend (React/TypeScript). Even if user doesn't explicitly mention TDD, suggest this workflow for any new feature development.
origin: ECC
effort: low
---

# Test-Driven Development Workflow

Systematic approach to writing code through tests first.

## Why TDD Matters

Writing tests before implementation:
- Forces clear understanding of requirements
- Produces modular, testable code
- Creates living documentation
- Enables confident refactoring
- Reduces bug count significantly

## The Red-Green-Refactor Cycle

### 🔴 Red Phase: Write Failing Test

1. **Understand the requirement** - What should the code do?
2. **Write a test** - Express the expected behavior
3. **Run the test** - Confirm it fails for the right reason

```python
# Example: Python/pytest
def test_user_creation():
    """Test that a user can be created with valid data."""
    user = User.create(name="Alice", email="alice@example.com")
    assert user.name == "Alice"
    assert user.email == "alice@example.com"
```

```typescript
// Example: TypeScript/Jest
describe('UserService', () => {
  it('should create user with valid data', () => {
    const user = UserService.create('Alice', 'alice@example.com');
    expect(user.name).toBe('Alice');
    expect(user.email).toBe('alice@example.com');
  });
});
```

**Run and verify failure:**
```bash
pytest tests/test_user.py -v  # Should FAIL
npm test -- UserService.test.ts  # Should FAIL
```

### 🟢 Green Phase: Make It Pass

1. **Write minimal code** - Just enough to pass the test
2. **Don't over-engineer** - Simple is better
3. **Run the test** - Confirm it passes

```python
# Minimal implementation
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
    
    @classmethod
    def create(cls, name, email):
        return cls(name, email)
```

**Run and verify success:**
```bash
pytest tests/test_user.py -v  # Should PASS
```

### 🔵 Refactor Phase: Clean Up

1. **Optimize structure** - Remove duplication, improve naming
2. **Keep tests passing** - Run after each change
3. **Add clarity** - Improve code readability

```python
# Refactored implementation
@dataclass
class User:
    name: str
    email: str
    
    @classmethod
    def create(cls, name: str, email: str) -> 'User':
        """Create a new user instance."""
        return cls(name=name, email=email)
```

## Coverage Requirements

| Metric | Requirement |
|--------|-------------|
| Overall coverage | > 80% |
| Core business logic | 100% |
| Critical paths | 100% |
| New code | > 90% |

## Test Types

| Type | Purpose | Tools |
|------|---------|-------|
| Unit | Test individual functions | pytest, jest |
| Integration | Test module interactions | pytest, jest |
| E2E | Test user workflows | Playwright |
| Contract | Test API contracts | schemathesis |

## TDD Checklist

Before any code review:
- [ ] Tests written first (Red)
- [ ] Implementation minimal (Green)
- [ ] Code refactored cleanly (Refactor)
- [ ] All tests passing
- [ ] Coverage meets threshold (>80%)
- [ ] Edge cases covered
- [ ] Error paths tested

## Common Anti-Patterns to Avoid

❌ Writing implementation before tests
❌ Testing implementation details instead of behavior
❌ Skipping the refactor phase
❌ Writing tests that always pass
❌ Ignoring coverage requirements

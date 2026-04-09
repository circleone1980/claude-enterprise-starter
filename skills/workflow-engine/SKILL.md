---
name: workflow-engine
origin: custom
description: |
  Workflow 编排模式 — 状态机、DAG 工作流、审批流、任务调度。
  TRIGGER when: 实现审批流、任务编排、异步工作流、定时任务。
paths: "**/workflow/**,**/engine/**"
effort: high
---

# Workflow 编排模式

工作流引擎集成的生产级模式。

## 触发场景

- 审批流程（多级审批、条件分支）
- 任务编排（DAG 依赖、并行执行）
- 异步工作流（长时间运行任务）
- 定时任务调度
- 状态机管理（订单状态、文档状态）

## 技术选型

| 场景 | Java 方案 | Python 方案 |
|------|-----------|-------------|
| 状态机 | Spring Statemachine | `transitions` / `python-statemachine` |
| 工作流引擎 | Camunda / Flowable | `prefect` / `temporal` / `n8n` |
| DAG 编排 | Airflow (Python) | Airflow / Prefect / Dagster |
| 审批流 | Flowable BPMN | `spiffworkflow` |
| 定时任务 | Quartz / Spring @Scheduled | `celery-beat` / APScheduler |
| 消息驱动 | Kafka + Spring Streams | Celery + Redis/RabbitMQ |

## 状态机模式

```java
// Spring Statemachine 配置
@Configuration
@EnableStateMachineFactory
public class OrderStateMachineConfig extends EnumStateMachineConfigurerAdapter<OrderState, OrderEvent> {

    @Override
    public void configure(StateMachineStateConfigurer<OrderState, OrderEvent> states) throws Exception {
        states.withStates()
            .initial(OrderState.CREATED)
            .states(EnumSet.allOf(OrderState.class))
            .end(OrderState.COMPLETED)
            .end(OrderState.CANCELLED);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<OrderState, OrderEvent> transitions) throws Exception {
        transitions
            .withExternal().source(CREATED).target(PENDING_PAYMENT).event(SUBMIT)
            .and()
            .withExternal().source(PENDING_PAYMENT).target(PROCESSING).event(PAY)
            .and()
            .withExternal().source(PROCESSING).target(COMPLETED).event(COMPLETE)
            .and()
            .withExternal().source(CREATED).target(CANCELLED).event(CANCEL)
            .and()
            .withExternal().source(PENDING_PAYMENT).target(CANCELLED).event(CANCEL);
    }
}
```

```python
# Python: 简单状态机
from enum import Enum
from typing import Callable

class OrderState(Enum):
    CREATED = "created"
    PENDING_PAYMENT = "pending_payment"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

TRANSITIONS = {
    (OrderState.CREATED, "submit"): OrderState.PENDING_PAYMENT,
    (OrderState.PENDING_PAYMENT, "pay"): OrderState.PROCESSING,
    (OrderState.PROCESSING, "complete"): OrderState.COMPLETED,
    (OrderState.CREATED, "cancel"): OrderState.CANCELLED,
    (OrderState.PENDING_PAYMENT, "cancel"): OrderState.CANCELLED,
}

class OrderWorkflow:
    def __init__(self, state: OrderState = OrderState.CREATED):
        self.state = state
        self._listeners: list[Callable] = []

    def transition(self, event: str) -> OrderState:
        key = (self.state, event)
        if key not in TRANSITIONS:
            raise InvalidTransitionError(self.state, event)
        old_state = self.state
        self.state = TRANSITIONS[key]
        self._notify(old_state, self.state, event)
        return self.state
```

## 审批流模式

```java
// 多级审批
@Service
public class ApprovalWorkflow {
    private final ApprovalRepository repo;

    @Transactional
    public Approval submit(ApprovalRequest request) {
        Approval approval = new Approval();
        approval.setStatus(PENDING);
        approval.setRequiredApprovers(determineApprovers(request));
        approval.setCurrentLevel(1);
        return repo.save(approval);
    }

    @Transactional
    public Approval approve(Long approvalId, Long userId, String comment) {
        Approval approval = repo.findById(approvalId).orElseThrow();
        validateApprover(approval, userId);

        approval.addDecision(userId, APPROVED, comment);
        approval.setCurrentLevel(approval.getCurrentLevel() + 1);

        if (approval.getCurrentLevel() > approval.getRequiredApprovers().size()) {
            approval.setStatus(APPROVED);
        }
        return repo.save(approval);
    }
}
```

## DAG 工作流

```python
# Prefect DAG
from prefect import flow, task

@task(retries=3, retry_delay_seconds=60)
def extract_data(source: str) -> dict:
    ...

@task
def transform_data(raw: dict) -> dict:
    ...

@task
def load_data(processed: dict) -> None:
    ...

@flow(name="etl-pipeline")
def etl_pipeline(source: str):
    raw = extract_data(source)
    processed = transform_data(raw)
    load_data(processed)
```

## 关键设计原则

1. **幂等性**: 每个步骤可安全重试
2. **可观测性**: 每个状态变更都记录日志和事件
3. **超时保护**: 所有步骤设置超时
4. **补偿事务**: 失败时支持回滚/补偿
5. **持久化**: 状态持久化到数据库，不依赖内存

## 反模式（禁止）

- ❌ 状态转换无验证（任何人可触发任何状态）
- ❌ 无超时的异步任务（可能永远阻塞）
- ❌ 状态仅存在内存（重启丢失）
- ❌ 循环依赖的 DAG（死锁）

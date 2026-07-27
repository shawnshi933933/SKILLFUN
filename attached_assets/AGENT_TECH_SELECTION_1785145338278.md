# Agent 技术选型与落地规范

## 1. 文档目标

这份文档用于统一 Agent 在本仓库中的技术选型与架构决策，减少讨论成本，保证实现路径稳定、可维护、可部署。

适用场景：
- 新建 Web3 前端项目
- 新增页面、路由、链上交互功能
- 需要补充轻量后端 API 或缓存层
- 部署到边缘平台

---

## 2. 默认技术栈（Baseline）

### 2.1 前端基础栈

默认使用：
- Vite 8
- React
- Tailwind CSS
- @tanstack/react-query

选型原则：
- 优先沿用该基础栈，不引入重复能力框架
- 组件库可按需增加，但不替代 Tailwind 的样式主导地位
- 数据请求与缓存统一走 React Query

### 2.2 Web3 栈

默认使用：
- wagmi
- viem
- RainbowKit

选型原则：
- 钱包连接和账户状态由 wagmi + RainbowKit 负责
- 链上读写通过 viem（或 wagmi 封装）实现
- ABI、链配置、合约地址统一集中管理，避免散落在页面组件中

### 2.3 后端与 BFF（Backend For Frontend）

默认策略：
- 后端一般不做索引服务
- 后端主要包装前端的 RPC 请求，并根据业务场景做缓存
- 尽量不要在前端直接调用 RPC

选型原则：
- 先做“轻后端 + 缓存”而不是“重索引系统”
- 仅在明确需要历史聚合、复杂检索、跨链大规模数据回放时，再评估索引体系

### 2.4 Router 与 API 框架

在后端逻辑不复杂时，优先使用：
- @tanstack/start

使用方式：
- 用其统一管理路由（router）
- 用其提供 API 能力（server functions / route handlers）
- 在同一工程内组织前后端代码，降低上下文切换成本

### 2.5 部署平台

部署优先级：
1. Cloudflare Workers（默认优先）
2. 其他平台（仅在 Workers 不满足约束时）

选择 Workers 的理由：
- 边缘部署成本和性能平衡较好
- 与轻量 API + 缓存模式匹配
- 适合高并发读请求与低延迟响应

---

## 3. 架构约束（必须遵守）

1. 前端禁止直接裸连 RPC（特殊场景需明确说明并评审）
2. 所有链上请求优先走后端 BFF 统一出口
3. 后端必须对可缓存请求设置缓存策略（TTL、失效机制）
4. 链配置、合约地址、ABI 需集中管理并可环境切换
5. 错误处理统一化：区分用户可见错误与系统日志错误
6. 不为“可能会复杂”提前引入重型基础设施

---

## 4. Agent 决策流程（简化版）

### Step 1：判断是否为标准场景

如果是常规 DApp 页面 + 合约读写：
- 直接采用 Baseline 全栈

### Step 2：判断后端复杂度

如果只是：
- 转发 RPC
- 参数校验
- 基础鉴权
- 结果缓存

则：
- 使用 @tanstack/start 做 router + API
- 部署到 Cloudflare Workers

### Step 3：判断是否需要索引

只有满足以下任一条件才考虑索引：
- 需要跨多合约、多链的大规模历史数据查询
- 查询条件复杂且无法通过 RPC + 缓存满足
- 对时间窗口聚合统计有高频需求

否则：
- 继续保持“无索引 + 缓存”的轻架构

### Step 4：前端数据策略

- 前端仅请求 BFF API
- 使用 React Query 做请求状态管理、缓存和重试
- 页面层不直接拼装复杂链上请求

---

## 5. 推荐项目结构（示例）

```txt
apps/
  web/
    src/
      app/
      components/
      features/
      lib/
        query-client.ts
        wagmi.ts
        chains.ts
      styles/
      routes/
  server/
    src/
      api/
      services/
        rpc/
        cache/
      config/
      utils/
packages/
  abi/
  shared/
```

说明：
- `lib/wagmi.ts`：钱包与链配置入口
- `services/rpc`：统一 RPC 调用封装
- `services/cache`：缓存策略与适配层
- `packages/abi`：集中管理 ABI 与合约元数据

---

## 6. 缓存策略建议

按数据类型设置缓存：
- 强实时（如余额、nonce）：短 TTL（5-15 秒）
- 准实时（如价格、池子状态）：中 TTL（15-60 秒）
- 低频变化（如代币元数据）：长 TTL（5-30 分钟）

同时要求：
- 提供手动失效机制（按 key 清理）
- 对异常响应不做长时间缓存
- 缓存 key 包含 chainId、address、method、参数摘要

---

## 7. 可观测性与错误处理

最低要求：
- API 统一错误码和错误结构
- 记录 RPC 上游错误（含 chainId、method、耗时）
- 记录缓存命中率（hit/miss）
- 对用户返回可理解的失败提示，不暴露内部细节

---

## 8. Agent 执行清单（每次实现前自检）

1. 是否使用了 Vite 8 + React + Tailwind + React Query？
2. 是否使用 wagmi + viem + RainbowKit 作为 Web3 基础？
3. 是否避免了前端直接调用 RPC？
4. 是否通过后端 BFF 做了 RPC 包装？
5. 是否根据请求类型配置了缓存？
6. 后端不复杂时，是否使用了 @tanstack/start 做 router + API？
7. 是否优先选择 Cloudflare Workers 部署？
8. 是否引入了不必要的重型组件（索引、队列、复杂中间件）？

若第 8 项为“是”，需补充“必要性说明”。

---

## 9. 偏离默认方案的准入规则

允许偏离，但必须记录以下内容：
- 偏离点
- 原因与收益
- 替代方案评估
- 回滚方案
- 维护成本评估

未完成记录，不应合并到主分支。

---

## 10. 一句话原则

默认采用“前端标准栈 + Web3 标准栈 + 轻量 BFF + 缓存 + Workers 边缘部署”，只有在证据充分时才升级复杂度。

# Video Workflow 3 天收口冲刺

更新日期：2026-05-01

## 目标

用 3 天时间把当前视频 workflow 从“能跑一些”收成“可以继续半自动批量推进”。

这 3 天不追求把 191 个知识点全部做完，只追求 4 件事：

1. 把 verified family 的 script review 从人工队列里剥离出来
2. 把 `logic_counting_v1` 和 `travel_blackboard_v2` 两个问题 family 定位到 family 级问题
3. 用 `6030105 / 3040103 / 3050102` 完成一轮模板修复回归
4. 给所有 family 一个明确结论：
   - 可放量
   - 继续 canary
   - 继续冻结

## 当前 Day 1 已完成

今天已经实际推进的动作：

1. 在自动审核策略里增加了临时黑名单：
   - `travel_blackboard_v2`
2. 对 verified family 执行了脚本自动审核：
   - `calculation_blackboard_v1`
   - `geometry_measure_v1`
   - `relation_word_problem_v1`
3. 一次性自动批准了 9 个 `ready_for_script_review` 项
4. 这 9 个 item 已经全部推进到 `ready_for_tts`

已推进 item：

- `5010106`
- `5020106`
- `5020203`
- `4020106`
- `4030204`
- `6010103`
- `6010104`
- `6010105`
- `6020105`

说明：

- Day 1 的 script review 提吞吐已经生效
- 当前下一个卡点不是脚本审核，而是 `TTS / render`

## Day 1

### 目标

止血，提吞吐，确认下一卡点。

### 任务

1. 冻结这两个 family 的新放量：
   - `logic_counting_v1`
   - `travel_blackboard_v2`
2. 对 verified family 打开脚本自动审批
3. 把 verified family 的 pending 脚本项推进到下一个阶段
4. 确认下一卡点到底在：
   - TTS
   - render
   - QA

### 完成标准

- `ready_for_script_review` 队列明显下降
- verified family 不再靠人工脚本审核卡住
- 已定位脚本审核之后的第一实际瓶颈

### Day 1 结束必须产出

- 一个最新队列分层：
  - `ready_for_tts`
  - `ready_for_render`
  - `ready_for_qa`
  - `qa_failed`

## Day 2

### 目标

只做问题 family，不扩散。

### 核心样本

- `6030105` -> `travel_blackboard_v2`
- `3040103` -> `logic_counting_v1`
- `3050102` -> `logic_counting_v1`

### 任务

1. 对比失败样本和成功样本

`travel_blackboard_v2`

- 失败：`6030105`
- 成功：`6030104`

`logic_counting_v1`

- 失败：`3040103`
- 失败：`3050102`
- 回归候选：`4050101`

2. 逐项检查：

- teacher script
- spoken script
- timing
- review snapshot
- qa summary
- scene 结构
- visual mode
- narration 密度

3. 判断失败归因：

- `template_issue`
- `content_issue`
- `render_issue`

4. 修改 family 级模板/scene/QA 规则
5. 只重跑这 3 个样本

### 完成标准

- `6030105` 有明确修复结论
- `3040103 / 3050102` 有明确修复结论
- 不允许只停留在“改了一点试试看”

### Day 2 结束必须产出

- 每个失败样本都要有一句根因总结
- 每个问题 family 都要有一条“继续冻结 / 可以回归”的判断

## Day 3

### 目标

恢复节奏，形成下一阶段准入规则。

### 任务

1. 根据 Day 2 回归结果，给 family 分 3 类：

- 可放量
- 继续 canary
- 继续冻结

2. 推进 verified family 当前队列：

- `4010101~4010106`
- `4020106`
- `4030204`
- `5010106`
- `6010103~6010105`

3. 如果 `travel_blackboard_v2` 修好：

- 只恢复 `6030105` 单点回归
- 不直接恢复全 family 放量

4. 如果 `logic_counting_v1` 修好：

- 只恢复 1 到 2 个 canary
- 不直接释放全部 13 个 pending

5. 固化准入规则：

- verified family：默认 auto pass script review
- verifying family：只做小 canary
- 出现重复 `template_issue`：自动冻结

### 完成标准

- 你能明确说出下周该放量哪些 family
- 你能明确说出哪些 family 继续冻结
- workflow 不再靠感觉推进

### Day 3 结束必须产出

- family 状态表 v2
- 当前放量白名单
- 当前冻结名单
- 模板修复样本名单

## 3 天里每天固定动作

每天都要做这 4 件事：

1. 更新 `video-batch-state` 统计
2. 更新 family 状态
3. 记录当天新出现的 `qa_failed`
4. 记录第二天只处理哪几个 sample

## 当前执行顺序

### 先做

- `calculation_blackboard_v1`
- `geometry_measure_v1`
- `relation_word_problem_v1`

原因：

- 这三类 family 已 verified
- script auto pass 已经能真正提吞吐

### 暂停扩量

- `logic_counting_v1`
- `travel_blackboard_v2`

原因：

- 已出现 family 级失败信号

### 最后处理

- `number_theory_v1`
- `geometry_construction_v1`
- `pattern_sequence_v1`

原因：

- 现在的主问题不是它们，而是先把能放量和该冻结的边界拉清楚

## 一句话判断标准

3 天结束后，如果还没有做到下面 4 条，就说明这轮收口不算完成：

1. verified family 的脚本审核不再大面积人工堵塞
2. `6030105` 有明确修复结论
3. `3040103 / 3050102` 有明确修复结论
4. 你能明确说出下周哪些 family 可以继续批量推

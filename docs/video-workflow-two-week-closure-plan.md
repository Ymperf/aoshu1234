# Video Workflow 两周收口执行计划

周期：14 天  
目标：把当前视频 workflow 从“可试运行”推进到“可控半自动批量生产”

## 两周目标

两周结束时，至少达到下面 6 个结果：

1. `logic_counting_v1` 明确完成一轮模板修复与回归
2. `travel_blackboard_v2` 明确完成 `6030105` 根因修复与回归
3. verified family 的 script review 开始默认自动放行
4. `calculation_blackboard_v1 / geometry_measure_v1 / relation_word_problem_v1` 至少各推进一批
5. `number_theory_v1` 与 `geometry_construction_v1` 各完成一轮小 canary 闭环
6. 把 QA failed 的处理方式从“逐条救火”改成“family 级回流”

## 执行原则

- 不再平均推进所有 family
- verified family 负责出量
- verifying family 负责过样本
- qa_failed 先修模板，再谈继续放量
- 每天结束都要更新一次状态，不靠记忆推进

## 第 1 周

### Day 1

目标：冻结错误放量方向，建立工作面板

任务：

1. 冻结 `logic_counting_v1` 新批次放量
2. 冻结 `travel_blackboard_v2` 新批次放量
3. 把这两个 family 单独标记为“模板修复中”
4. 读取并整理 3 个核心失败样本：
   - `6030105`
   - `3040103`
   - `3050102`
5. 建一个每日更新表，记录：
   - family 状态
   - pending item 数
   - qa_failed 数
   - 今日动作

完成标准：

- 本周不会再给上述两个 family 新增 rollout
- 3 个失败样本的 review / qa / 产物路径全部定位清楚

### Day 2

目标：分析 `6030105` 的重复失败根因

任务：

1. 对比 `6030104` 和 `6030105`
2. 逐项检查：
   - teacher script
   - spoken script
   - timing
   - qa summary
   - review snapshot
3. 判断失败更偏向：
   - scene 结构问题
   - 文案节奏问题
   - 图示表达问题
   - QA 规则误杀
4. 写出 `travel_blackboard_v2` 的修复假设 1.0

完成标准：

- 明确 `6030105` 不是单题内容问题，而是 family 规则问题还是 QA 规则问题

### Day 3

目标：分析 `logic_counting_v1` 的 family 级问题

任务：

1. 对比 `3040103` 与 `3050102`
2. 梳理两者共性：
   - scene 数
   - 讲解结构
   - 画面密度
   - 逻辑图示表达
   - QA fail 点
3. 抽出 `logic_counting_v1` 的 family 共性问题
4. 形成修复假设 1.0

完成标准：

- 能写出“为什么这两个逻辑类样本都在脚本通过后 QA fail”

### Day 4

目标：把 verified family 的 script review 改成默认自动放行策略

任务：

1. 确认 auto pass 范围：
   - `calculation_blackboard_v1`
   - `geometry_measure_v1`
   - `relation_word_problem_v1`
2. 把这些 family 当前 pending 的脚本审核项切换到自动放行策略
3. 保留例外清单：
   - `travel_blackboard_v2`
   - `logic_counting_v1`
   - `number_theory_v1`
   - `geometry_construction_v1`
   - `pattern_sequence_v1`
4. 重新检查 `ready_for_script_review` 数量变化

完成标准：

- script review 队列显著下降
- verified family 不再被人工审核卡住

### Day 5

目标：推进 verified family 第一轮放量闭环

任务：

1. 推进 `calculation_blackboard_v1` 当前批次：
   - `4010101~4010106`
2. 推进 `geometry_measure_v1` 当前样本：
   - `4020106`
   - `5020106`
   - `5020203`
   - `6020105`
3. 推进 `relation_word_problem_v1`：
   - `4030204`
4. 检查这些 item 是否顺利从：
   - script -> render -> qa

完成标准：

- 至少有一批 verified family item 进入 `ready_for_qa` 或更后状态

### Day 6

目标：落地 `travel_blackboard_v2` 模板修复

任务：

1. 修改 `travel_blackboard_v2` 对应模板规则
2. 若必要，补 scene 规则或 QA 规则白名单
3. 仅回归：
   - `6030105`
4. 观察修复后是否还会 QA fail

完成标准：

- `6030105` 至少完成一次修复后重跑

### Day 7

目标：落地 `logic_counting_v1` 模板修复

任务：

1. 修改 `logic_counting_v1` family 规则
2. 优先回归：
   - `3040103`
   - `3050102`
3. 若有余力，再补一个代表样本：
   - `4050101` 或 `5050101`
4. 记录修复前后 QA 结果差异

完成标准：

- `logic_counting_v1` 完成一轮“修 family -> 回归样本”的闭环

## 第 2 周

### Day 8

目标：复盘第 1 周结果，决定冻结是否解除

任务：

1. 复盘 `6030105` 修复结果
2. 复盘 `3040103 / 3050102` 修复结果
3. 决定：
   - `travel_blackboard_v2` 是否解除冻结
   - `logic_counting_v1` 是否继续冻结
4. 更新收口看板

完成标准：

- 两个 family 都有明确状态：
  - 继续冻结
  - 部分解冻
  - 恢复 canary

### Day 9

目标：给 `number_theory_v1` 做第一轮小 canary

任务：

1. 只选 2 到 3 个样本：
   - `5040106`
   - `6040104`
   - `6040106`
2. 完成脚本审核
3. 推进 render
4. 进入 QA

完成标准：

- `number_theory_v1` 不再只停留在 `ready_for_script_review`

### Day 10

目标：给 `geometry_construction_v1` 做第一轮小 canary

任务：

1. 推进：
   - `6020201`
   - `6020202`
   - `6020203`
2. 只看一个问题：
   - 这个 family 是否能稳定通过讲解结构和图示表达
3. 完成 render 和 QA

完成标准：

- `geometry_construction_v1` 至少有首轮 QA 结果

### Day 11

目标：把 QA failed 回流机制固化下来

任务：

1. 给 QA fail 增加归因标签：
   - `content_issue`
   - `template_issue`
   - `render_issue`
2. 规定规则：
   - 同 family 两次 `template_issue`，自动冻结
3. 在 review/qa 流程里把这个字段补上

完成标准：

- 以后看到 `qa_failed`，不再只是“失败”，而是能直接回流到 family 层

### Day 12

目标：继续推进 verified family 第二轮放量

任务：

1. 检查 verified family 的剩余 eligible item
2. 再推进一批：
   - 以 `calculation_blackboard_v1`
   - `geometry_measure_v1`
   - `relation_word_problem_v1`
   为主
3. 观察在 auto pass 后，整体 throughput 是否提升

完成标准：

- verified family 的推进明显快于第 1 周前

### Day 13

目标：做一次整体收口复盘

任务：

1. 对比 Day 1 与 Day 13 指标：
   - verified family 数
   - ready_for_script_review 数
   - qa_failed 数
   - published 数
2. 检查：
   - 哪些 family 已可放量
   - 哪些还在 verifying
   - 哪些仍应冻结

完成标准：

- 能形成一版更新后的 video workflow 收口看板 v2

### Day 14

目标：形成下一阶段的推进策略

任务：

1. 决定下阶段节奏：
   - 扩 verified family
   - 继续修冻结 family
   - 是否启动 `pattern_sequence_v1`
2. 输出下一轮 2 周计划
3. 锁定优先级：
   - 放量 family
   - 验证 family
   - 冻结 family

完成标准：

- 下一阶段不是重新混乱排队，而是接着当前收口结果往下走

## 每天固定动作

每天不管做哪一项，都要补这 4 个动作：

1. 更新 `video-batch-state` 当前统计
2. 更新 family 状态表
3. 记录当天新出现的 `qa_failed`
4. 记录第二天最优先处理的 family / item

## 两周结束后的理想结果

理想状态不是 191 个全部出片，而是达到下面这个结构：

- verified family 可以稳定自动过 script review
- `logic_counting_v1` 不再盲目铺量
- `travel_blackboard_v2` 的重复失败被消掉
- `number_theory_v1` 和 `geometry_construction_v1` 各自过第一轮有效 canary
- QA failed 已经能回流成 family 级修复
- 你对“接下来怎么批量做”不再靠感觉，而是靠状态看板推进

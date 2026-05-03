# Video Workflow 收口看板

更新日期：2026-05-01

## 总览

- family 总数：8
- 已 verified：4
- verifying：3
- unverified：1
- 已发布 item：13
- 当前待处理：
  - `ready_for_script_review`：30
  - `ready_for_render`：5
  - `ready_for_qa`：1
  - `qa_failed`：4

当前判断：

- 这条视频链路已经具备小批量出片能力
- 现在的主瓶颈不是渲染，而是 `family 验证 + script review 吞吐 + QA failed 回流`
- 后续不应该继续平均推进所有 family，而应该按“放量收益”和“失败复现价值”收口

## A. 可以直接放量的 family

这些 family 已经具备明确的发布样本，且没有当前 QA fail 堵点。策略上应该优先压缩 script review，扩大自动放行范围。

### 1. `calculation_blackboard_v1`

- 状态：`verified`
- 已发布：5
- 当前待处理：
  - `ready_for_qa`：1
  - `ready_for_render`：5
  - `ready_for_script_review`：4
- 结论：可以直接放量

建议：

- 对该 family 启用 `script auto pass` 默认策略
- 当前 pending 的 4 个脚本审核项不应继续人工逐条卡住
- 先把 `4010101~4010106` 这一批跑完，用来验证“verified family 自动审 + 渲染 + QA”闭环

代表样本：

- 已发布：`3010101, 3010102, 3010103, 3010104, 3010105`
- 当前批次：`4010101~4010106`, `5010106`, `6010103`, `6010104`, `6010105`

### 2. `relation_word_problem_v1`

- 状态：`verified`
- 已发布：4
- 当前待处理：
  - `ready_for_script_review`：1
- 结论：可以直接放量

建议：

- `4030204` 直接纳入自动脚本审批候选
- 后续同 family 的新 topic 优先走批量，不要再走重人工 review

代表样本：

- 已发布：`2030101, 2030102, 2030103, 2030104`
- 待推进：`4030204`

### 3. `geometry_measure_v1`

- 状态：`verified`
- 已发布：3
- 当前待处理：
  - `ready_for_script_review`：4
- 结论：可以直接放量

建议：

- `4020106, 5020106, 5020203, 6020105` 可进入自动脚本审批白名单
- 用 `40201` 这个 cohort 作为 verified family 直接 rollout 的标准样本

代表样本：

- 已发布：`3020101, 3020102, 3020103`
- 待推进：`4020106, 5020106, 5020203, 6020105`

## B. 暂不建议直接放量，但不应冻结的 family

这些 family 还在 verifying，问题不是停掉，而是必须先完成验证样本闭环。

### 4. `number_theory_v1`

- 状态：`verifying`
- 已发布：0
- 当前待处理：
  - `ready_for_script_review`：5
- 结论：不放量，继续 canary 验证

建议：

- 先做 3 个代表样本闭环，不要一次推完整 family
- 推荐优先样本：
  - `5040106` 余数性质与周期
  - `6040104` 余数定理
  - `6040106` 进制转换初步

达到以下条件后再升 verified：

- 至少 3 个不同 topic/知识点通过 QA
- 没有 family 级重复失败
- 不再依赖人工脚本逐条改

### 5. `geometry_construction_v1`

- 状态：`verifying`
- 已发布：0
- 当前待处理：
  - `ready_for_script_review`：3
- 结论：不放量，继续 canary 验证

建议：

- 当前只有 `60202` 这一组样本，覆盖面偏窄
- 先做一个小闭环，不要扩到其它年级几何构造题

优先样本：

- `6020201` 蝴蝶模型初步
- `6020202` 燕尾模型初步
- `6020203` 鸟头模型初步

### 6. `pattern_sequence_v1`

- 状态：`unverified`
- 已发布：0
- active canary：0
- 结论：不能放量，也不该现在优先投入

建议：

- 暂时排在最后
- 等前面 3 个 verifying family 收完，再回头做这个 family 的第一轮 canary

## C. 应冻结并转模板修复的 family

这些 family 不是“继续堆 item”，而是先停放量，修 family。

### 7. `logic_counting_v1`

- 状态：`verifying`
- 已发布：0
- 当前待处理：
  - `ready_for_script_review`：13
  - `qa_failed`：2
- 结论：应冻结新放量，先修模板

冻结原因：

- 没有任何 published 样本
- 已经出现 2 个 QA fail
- 且这两个失败都发生在脚本自动批准之后，说明问题更像 family/scene 规则，不像单条文案问题

模板修复样本：

- `3040103` 简单数独入门
- `3050102` 路线计数

处理策略：

1. 暂停给 `logic_counting_v1` 新增 rollout batch
2. 用 `3040103 + 3050102` 反查 family 级共性
3. 修 scene 组织、字幕节奏、图示表达或 QA 判定规则
4. 修完后只回归 2 到 3 个代表样本，不直接放大到 13 个 pending item

回归候选：

- `3040103` 简单数独入门
- `3050102` 路线计数
- `4050101` 复杂真假话推理

### 8. `travel_blackboard_v2`

- 状态：`verified`
- 已发布：1
- 当前待处理：
  - `qa_failed`：2
- 结论：应临时冻结放量，先修模板

冻结原因：

- `6030105` 重复 QA fail 两次
- 一次是 `policy-auto` 脚本批准后失败
- 一次是人工 `qa_lead` 脚本认可后仍失败
- 这说明不是单次脚本文案波动，而是 family 或 QA 规则存在稳定缺陷

模板修复样本：

- `6030105` 发车间隔问题

处理策略：

1. 暂停同 family 新增 batch
2. 对比 `6030104`（已发布）与 `6030105`（重复失败）
3. 查 travel 类 scene 在“间隔/追及/相遇”上的表达分歧
4. 修 family 规则后，仅回归 `6030105`

## D. 模板修复样本清单

这些 item 不是普通失败项，而是应作为 family 修复入口。

### 一级优先级

- `6030105` 发车间隔问题
  - family：`travel_blackboard_v2`
  - 特征：重复 `qa_failed`
  - 价值：最适合定位 family 稳定性问题

- `3040103` 简单数独入门
  - family：`logic_counting_v1`
  - 特征：脚本自动批准后 QA fail
  - 价值：逻辑类模板第一批失败样本

- `3050102` 路线计数
  - family：`logic_counting_v1`
  - 特征：脚本自动批准后 QA fail
  - 价值：与 `3040103` 形成 family 共性对照

### 二级优先级

- `4010101` 乘除巧算与凑整
  - family：`calculation_blackboard_v1`
  - 特征：已通过脚本审核，当前 `ready_for_qa`
  - 价值：可作为 verified family 自动化闭环样本

- `4020106` 格点面积计算
  - family：`geometry_measure_v1`
  - 特征：verified family 但仍卡在 script review
  - 价值：适合验证“verified family 脚本自动放行”

- `4030204` 三元鸡兔同笼启蒙
  - family：`relation_word_problem_v1`
  - 特征：verified family 但仍卡在 script review
  - 价值：适合验证应用题 family 自动放行

## E. 哪些 script review 可以改成 auto pass

这里的原则不是“所有 pending 都自动过”，而是“verified family 默认自动过，verifying/unverified family 继续受控放行”。

### 可以直接改成 `auto_pass` 的范围

#### `calculation_blackboard_v1`

- `5010106`
- `6010103`
- `6010104`
- `6010105`

#### `geometry_measure_v1`

- `4020106`
- `5020106`
- `5020203`
- `6020105`

#### `relation_word_problem_v1`

- `4030204`

这些项的共同点：

- family 已 verified
- 已有 published 样本
- 当前没有 family 级 QA fail
- 卡在 script review 只会拖吞吐，不会带来实质安全收益

### 不能改成 `auto_pass` 的范围

#### `logic_counting_v1`

- 当前 13 个 `ready_for_script_review` 都不应自动过
- 原因：family 未 verified，且已有 2 个 QA fail

#### `number_theory_v1`

- 当前 5 个 `ready_for_script_review` 都不应自动过
- 原因：还没有 published 样本

#### `geometry_construction_v1`

- 当前 3 个 `ready_for_script_review` 都不应自动过
- 原因：还没有 QA 闭环

#### `pattern_sequence_v1`

- 不进入自动审批
- 原因：还未开始有效验证

#### `travel_blackboard_v2`

- 暂时不建议自动过
- 原因：尽管 family 是 verified，但 `6030105` 重复 QA fail，需先完成模板修复再恢复自动放行

## F. 推荐执行顺序

### 第 1 阶段：立即执行

1. 冻结 `logic_counting_v1` 新放量
2. 冻结 `travel_blackboard_v2` 新放量
3. 对 verified family 开启脚本自动放行：
   - `calculation_blackboard_v1`
   - `geometry_measure_v1`
   - `relation_word_problem_v1`

### 第 2 阶段：修模板

1. 修 `6030105`
2. 修 `3040103`
3. 修 `3050102`

### 第 3 阶段：验证 family

1. 收 `number_theory_v1`
2. 收 `geometry_construction_v1`
3. 最后再做 `pattern_sequence_v1`

## G. 一句话结论

当前最适合放量的是：

- `calculation_blackboard_v1`
- `geometry_measure_v1`
- `relation_word_problem_v1`

当前最该冻结的是：

- `logic_counting_v1`
- `travel_blackboard_v2`

当前最值钱的模板修复入口是：

- `6030105`
- `3040103`
- `3050102`

当前最应该压缩掉的人工作业是：

- verified family 上的 `ready_for_script_review`

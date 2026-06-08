# 新的训练计划框架使用指南

## 概述

新的框架已经按照您的需求实现，包括以下核心功能：

1. **孩子信息录入** - 家长输入孩子基本信息
2. **游戏测试** - 孩子进行小游戏测试（舒尔特方格等）
3. **AI计划生成** - 根据测试结果生成个性化训练计划（一周或一个月）
4. **每日任务管理** - 每天的具体活动和家长指导
5. **每日测试** - 每天完成任务后进行测试
6. **进度追踪** - 查看改善进度和注意力集中度的变化

## 系统流程

### 1. 孩子信息录入
- 路径：`/child-registration`
- 家长输入：
  - 孩子姓名
  - 年龄
  - 性别
  - 出生日期
  - 家长姓名

### 2. 游戏测试
- 路径：`/child-test`
- 孩子完成舒尔特方格测试（注意力测试）
- 测试完成后自动计算分数和表现水平

### 3. 生成训练计划
- 测试完成后，AI根据测试结果自动生成个性化训练计划
- 计划类型：
  - 一周计划（7天）
  - 一个月计划（30天）
- 计划包含：
  - 重点改善领域（注意力、认知能力等）
  - 训练目标
  - 每日任务和活动
  - 家长指导

### 4. 查看训练计划
- 路径：`/training-plan`
- 显示：
  - 总体进度（任务完成率、测试完成率）
  - 改善趋势
  - 重点改善领域
  - 训练目标
  - 所有每日任务

### 5. 每日任务
- 路径：`/daily-task`
- 每个任务包含：
  - 家长指导（具体如何操作）
  - 2-5个活动（每个活动有名称、时长、描述）
  - 测试要求（部分天数需要测试）
- 家长完成活动后标记完成
- 孩子完成测试后记录数据

### 6. 进度追踪
- 在训练计划页面可以看到：
  - 任务完成进度
  - 测试完成进度
  - 测试分数趋势
  - 改善趋势（显著改善/稳步改善/轻微改善/需要关注）

## 后端API

### 孩子信息管理
- `POST /api/plans/children` - 创建孩子信息
- `GET /api/plans/children/{child_id}` - 获取孩子信息

### 测试结果
- `POST /api/plans/test-results` - 提交测试结果
- `GET /api/plans/children/{child_id}/test-results` - 获取测试历史

### 训练计划
- `POST /api/plans/plans` - 创建训练计划
- `GET /api/plans/plans/{plan_id}` - 获取训练计划详情
- `GET /api/plans/children/{child_id}/plans` - 获取孩子的所有计划
- `GET /api/plans/plans/{plan_id}/progress` - 获取计划进度

### 每日任务
- `PUT /api/plans/plans/{plan_id}/tasks/{day}` - 更新任务状态和测试结果

## 前端页面

### 新增页面
1. **ChildRegistration.js** - 孩子信息录入页面
2. **ChildTestPage.js** - 游戏测试页面（集成舒尔特测试）
3. **TrainingPlanPage.js** - 训练计划查看页面
4. **DailyTaskPage.js** - 每日任务页面

### 路由配置
- `/child-registration` - 孩子注册
- `/child-test` - 游戏测试
- `/training-plan` - 查看计划
- `/daily-task` - 每日任务

## AI计划生成算法

### 重点领域分析
根据测试结果分析：
- 注意力水平（舒尔特测试）
- 认知能力
- 社交能力
- 运动能力

### 每日活动生成
- 根据孩子的表现水平选择适合的活动
- 前期：基础活动
- 中期：中等难度活动
- 后期：高级活动

### 计划调整
- 根据每日测试结果动态调整后续任务难度
- 如果测试结果好，提高难度
- 如果测试结果差，保持或降低难度

## 数据模型

### ChildInfo（孩子信息）
- child_id
- name
- age
- gender
- birth_date
- parent_name

### TestResult（测试结果）
- test_id
- child_id
- test_type
- test_data
- score
- performance_level
- timestamp

### TrainingPlan（训练计划）
- plan_id
- child_id
- plan_type（'weekly'/'monthly'）
- duration_days
- start_date
- end_date
- daily_tasks
- focus_areas
- goals

### DailyTask（每日任务）
- task_id
- day
- date
- activities（活动列表）
- parent_guidance（家长指导）
- test_required（是否需要测试）
- test_type（测试类型）
- completed（是否完成）
- test_completed（测试是否完成）
- test_result（测试结果）

## 使用示例

### 开始使用
1. 访问 `/child-registration` 录入孩子信息
2. 完成测试 `/child-test`
3. 系统自动生成计划
4. 查看计划 `/training-plan`
5. 每天完成任务 `/daily-task`
6. 查看进度改善情况

## 注意事项

1. **数据存储**：当前使用内存存储，实际部署时应使用数据库
2. **模型加载**：系统会尝试加载 `backend/models/education_model.pth`
3. **计划类型**：目前默认生成一周计划，可在后续扩展让用户选择
4. **测试频率**：默认每两天或最后一天进行测试

## 下一步优化建议

1. 添加数据库持久化存储
2. 允许用户选择计划类型（一周/一个月）
3. 添加更多游戏测试类型
4. 优化AI计划生成算法
5. 添加数据可视化图表
6. 添加导出功能（PDF报告）
7. 添加推送提醒功能
8. 添加家长反馈功能

## 启动系统

后端：
```bash
cd backend
python start.py
```

前端：
```bash
cd frontend
npm start
```

然后访问 `http://localhost:3000/child-registration` 开始使用！




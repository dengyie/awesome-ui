# Mobbin Pattern 研究报告与组件路线图（2026-11）

> 素材来源：Mobbin Pro MCP（`search_screens` / `search_flows` / `search_sections`）。
> 原始参考图存于本地 `references/`（已 gitignore，勿提交公开仓库——Mobbin ToS 禁止再分发付费内容）。
> 本报告只提炼设计模式结论与实现规范，不含受版权保护的截图。

## 一、扫描概况（2026-11-14 扩充后）

| 品类 | 查询数 | 收获 | 代表产品 |
|---|---|---|---|
| ai-chat | 4 | 24 图 | ChatGPT, Claude, Gemini, Cursor, Copilot, Jasper |
| agent | 3 | 18 图 | Devin, Replit, GitLab, Cursor, AWS, Trello |
| onboarding | 3 | 12 图 + 6 flows | Pi, Sora, Typeform, Klarna, Tally |
| paywall | 2 | 12 图 | Vercel, Whop, Plausible, Hashnode |
| dashboard | 3 | 18 图 | Databricks, Asana, Plane, Skiff, Fibery |
| basics | 4 | 24 图 | v0, Supabase, Snowflake, Confluence, Mobbin |
| forms | 5 | 30 图 | Supabase, Linear, Google Drive, Semrush |
| navigation | 6 | 36 图 | Wix, Framer 类营销页、mega menu |
| overlays | 5 | 30 图 | Railway（危险确认弹窗）等 |
| lists | 5 | 30 图 | Plane（看板）、Digg、Amplitude、Homerun |
| charts | 3 | 18 图 | Amplitude 类分析图表 |
| profile | 4 | 24 图 | 团队/通知中心/账户切换 |
| commerce | 3 | 18 图 | Canva, Fiverr, Arcade, Hex, Recraft, Teachable |
| editor | 4 | 18 图 | 富文本/画布/取色器/灯箱 |
| ai-native | 6 | 0 图（Mobbin AI 用量提示拦截，待重试） | — |
| **合计** | **60** | **337 图** | |

限流实测：60 req/min + SSL 偶发抖动，脚本已内置 429/网络重试（`tools/mobbin_fetch.py`）。
另注意：Mobbin 对高频 MCP 搜索会返回"AI usage is high"文本提示而非结果（非 429），需间隔重试。

## 二、关键 Pattern 结论（对照 awesome-ui 现有组件）

### 1. AI 对话流
- **ChatGPT/Claude 输入区**：居中胶囊输入框 + 左下附件按钮 + 右侧模型/工具 chips + 发送按钮随输入非空切换实心/禁用。→ 增强 `ChatPromptInput`（chips 区、发送态渐变）
- **思考块**：折叠时显示耗时 + 摘要一行；展开后条目左侧有竖向连接线。→ 增强 `ThinkingBlock`（连接线、耗时摘要行）
- **消息操作条**：hover 才浮现（非常驻）；分支切换用 `1/2` 翻页箭头。→ 增强 `MessageActionToolbar`（hover 浮现变体、分支翻页已有✓）

### 2. Agent / 工具调用
- **Devin/Cursor 时间线**：每个步骤带状态图标 + 可展开的执行日志（终端风格深色块）。→ 新增 **`AgentRunLog`**（步骤日志终端视图）
- **代码 diff**：文件树 + 折叠 hunk + 行内评论。→ 增强 `DiffViewer`（多文件标签、hunk 折叠）

### 3. Onboarding / 空态
- **Typeform/Tally 空态**：大插图 + 单主 CTA + 次级 ghost 链接；模板库以卡片网格呈现。→ 新增 **`OnboardingChecklist`**（激活任务清单，Linear/Notion 风格进度环）
- **登录页**：SSO 按钮在上、分隔线 "or"、邮箱表单在下。→ 新增 **`AuthForm`**（SSO + 邮箱两段式）

### 4. Paywall / Pricing
- **Vercel/Whop 模式**：3 列卡片，中间列高亮描边+徽章"Most popular"，价格大字 + /mo，功能清单用 ✓ 分组。→ 新增 **`PricingTable`**
- **升级弹窗**：对比当前额度用量的进度条 + 推荐计划。→ 新增 **`UpgradePromptCard`**

### 5. Dashboard / 设置
- **Fibery/Plane 侧边栏**：分组可折叠 + 拖拽手柄 hover 显现 + 底部用户卡。→ 增强 `ChatSessionList`（分组折叠、底部用户卡）
- **设置页**：左侧锚点导航 + 右侧分节卡片，每节保存时按钮 loading。→ 新增 **`SettingsPanel`**
- **统计卡**：大数字 + 环比小箭头 + mini 趋势线。→ 新增 **`StatCard`**

### 6. 基础交互
- **v0/Base44 命令面板**：顶部搜索 + 分组结果 + 右侧快捷键列 + 底部提示条。→ 增强 `CommandPalette`（底部提示条、右列快捷键对齐）
- **数据表**：列头筛选 icon、行 hover 工具条、批量选中浮动条。→ 新增 **`DataTable`**
- **Toast**：右下堆叠 + 进度条倒计时。→ 增强 `ToastStack`（倒计时进度条变体）

### 7. 危险操作确认（Railway 模式，新增）
- 深色卡片弹窗：红色警示 icon + "Destructive Changes" 标题 + 后果一句话（高危词红色高亮）
- **输入名称确认**（type-to-confirm）：`Type todo-api to confirm`，输入匹配前 Commit 按钮禁用
- 主按钮红色实心，Cancel 灰色描边。→ 新增 **`ConfirmDialog`**（type-to-confirm 变体）

### 8. 看板（Plane 模式，新增）
- 列头：状态 icon + 列名 + 计数徽章 + 拖拽/新增两个 hover icon
- 卡片：ID 前缀（ASMOB-3）+ 标题 + 底部状态/优先级/头像 chips；拖拽中卡片半透明浮起
- 顶部固定"删除投递区"（拖起时浮现红色虚线框 Drop here to delete）。→ 新增 **`KanbanBoard`**（P2）

### 9. 营销页三件套（Wix/Framer 模式，新增）
- Hero：超大标题（两行内）+ 一句副标 + 单 CTA + 右侧/背景视觉
- Footer：品牌列 + 3-4 组链接列 + 底行版权/社交 icon
- Testimonial：引用大字 + 头像姓名职位三行卡。→ 新增 `HeroSection` / `FooterSection` / `TestimonialGrid`（P2）

## 三、执行清单（优先级排序）

**P0 新增组件（三端同步）**
1. `PricingTable` — SaaS 定价三列卡
2. `StatCard` — 仪表盘统计卡
3. `DataTable` — 筛选/分页/批量操作数据表
4. `AuthForm` — SSO + 邮箱登录表单
5. `SettingsPanel` — 锚点导航设置页
6. `AgentRunLog` — Agent 步骤执行日志终端
7. `OnboardingChecklist` — 激活任务清单
8. `UpgradePromptCard` — 额度用量升级卡

**P1 增强现有组件**
- `ChatPromptInput`：模型/工具 chips 区
- `ThinkingBlock`：步骤连接线 + 耗时摘要
- `DiffViewer`：多文件 tab + hunk 折叠
- `CommandPalette`：底部快捷键提示条
- `ToastStack`：倒计时进度条
- `ChatSessionList`：分组折叠 + 底部用户卡

**P2 配套**
- 更新 `SKILL.md` / `llms.txt` / `llms-full.txt` / `index.html` Gallery
- `tests/` 补 vanilla 冒烟测试

## 四、素材获取 SOP（可复用）

```bash
# 授权（一次）: python tools/mobbin_auth.py auth
# 刷新 token : python tools/mobbin_auth.py refresh
# 拉取品类   : python -I tools/mobbin_fetch.py [ai-chat agent onboarding paywall dashboard basics]
```
- 品类查询定义在 `tools/mobbin_fetch.py` 的 `CATEGORIES`，可自行扩展
- 限流：60 req/min（429 按 Retry-After 退避）、Deep Search 500 次/天
- 新查询建议先用单次 curl 试搜，确认 `platform` 参数（仅 `ios`/`web`）

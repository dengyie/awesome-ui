<!-- markdownlint-disable-file MD033 MD045 -->
<div align="center">

# AwesomeUI

**专为 AI 时代与大模型代码生成打造的精选前端原子组件库，支持 React、Vue 3 与 Vanilla 原生组件**

[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)
[![Frameworks](https://img.shields.io/badge/Frameworks-React_%7C_Vue_3_%7C_Vanilla-61DAFB.svg?style=flat-square)](react/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Components](https://img.shields.io/badge/Components-37+_Production_Ready-blue.svg?style=flat-square)](vanilla/)
[![Architecture](https://img.shields.io/badge/Architecture-Single--File_Copy--Paste-orange.svg?style=flat-square)](./)
[![Tests](https://img.shields.io/badge/tests-51%20passed-brightgreen.svg?style=flat-square)]()

[English](./README.md) · [简体中文](./README.zh-CN.md) · [设计初衷](#为什么需要-awesomeui) · [组件清单](#精选原子组件清单) · [架构规范](#三端对齐架构规范) · [快速上手](#快速使用指南) · [测试套件](#质量保证与自动化测试)

<br>

<p align="center">
  <b>彻底告别传统庞大后台组件库的黑盒依赖、巨额 Token 调试损耗与跨框架样式断层。</b><br>
  严格遵循单文件即拷即用原则，React (TSX)、Vue 3 (SFC) 与 Vanilla (Web Component) 三端 API 与 Tailwind 样式 100% 深度对齐。<br>
  提供 37+ 款深度打磨的 AI 原生组件，涵盖呼吸光标流式渲染、DeepSeek R1 / o1 思维链折叠面板、Agent 工具调用抽屉与 WebGL 流体触感背景。
</p>

</div>

---

## 为什么需要 AwesomeUI？

传统组件库（AntD、Element Plus、MUI）是为传统 CRUD 业务后台设计的。当 AI 编程助手（Cursor、Claude Code、Codex、v0）尝试生成现代 AI Web 应用（类似 ChatGPT、Claude、Perplexity、v0 的交互）时，往往需要耗费大量 Token 反复调试流式打字、思维链折叠、自动跟底、分屏代码预览等复杂状态，甚至引入多层黑盒 npm 包导致构建崩溃。

**AwesomeUI 确立的核心工程原则**：
- **AI 优先（AI-to-AI First）**：所有组件采用平铺扁平 Props 设计，彻底杜绝多层深嵌套对象与隐式上下文，大模型一次生成命中率趋近 100%；
- **单文件即拷即用（Zero Black-Box Dependency）**：无需私有 npm 源或安装庞杂 runtime，直接复制单个文件进入项目即可运行；
- **三端完整技术栈对齐**：React (TSX)、Vue 3 (SFC) 与原生 Vanilla (Web Components) 三套实现严格保持属性命名、事件触发与 Tailwind CSS 样式 1:1 对齐；
- **全系无障碍与触觉美学**：内置 `role="status"`、`aria-live` 播报、键盘导航、低动态模式自适应与高品质物理触感动效。

---

## 精选原子组件清单

| 组件名称 | 适用业务场景 | 核心技术亮点与交互优势 |
| :--- | :--- | :--- |
| **`ChatPromptInput`** | 多模态输入框 | 高度自适应、快捷键发送/换行、附件/图片列表、生成中停止切换 |
| **`StreamMarkdown`** | 流式渲染器 | 高性能局部渲染、打字呼吸光标、代码块一键 Copy、语法高亮 |
| **`ThinkingBlock`** | 深度思考面板 | R1/o1 推理模型思维链折叠、流光动效、耗时展示 |
| **`ToolCallBadge`** | Agent 工具调用 | 工具执行状态（Running/Success/Error）、入参/返回值一键抽屉折叠 |
| **`AutoScrollAnchor`** | 智能跟底锚点 | 流式输出时自动平滑跟滚，用户手动回滚时暂停并浮现一键触底按钮 |
| **`ArtifactCanvas`** | 分屏预览画布 | 类似 Claude Artifacts，代码与 HTML/SVG 即时沙盒渲染分屏切换 |
| **`SourcesCitation`** | RAG 引文来源 | 对标 Perplexity 搜索来源网格卡片，展示域名、序号、标题与摘要 |
| **`MessageActionToolbar`** | 消息底部操作条 | 复制回答、重新生成、赞/踩反馈、多分支历史版本翻页器 |
| **`PromptChips`** | 智能建议追问 | 气泡推荐问题标签，一键填入或发送 |
| **`RoadmapTimeline`** | 学习路径图谱 | 纸质手账/工坊地图风格阶段进度条、菱形地标、完成态与锁态 |
| **`KnowledgeDrawer`** | 知识节点抽屉 | 阶段色系侧边抽屉、前置依赖/分支徽章、核心认知与行动 CTA |
| **`ThemeToggle`** | 三态主题切换 | Auto/Light/Dark 切换，时间与系统色系自适应，防闪烁与记忆 |
| **`StatusIndicator`** | 状态指示徽章 | 节点与服务状态 (Online/Connecting/Error) 呼吸光晕与延迟指示 |
| **`AudioWaveVisualizer`** | 语音交互波形 | 实时音频/语音交互波形跳动与呼吸动效 |
| **`HomepageDashboard`** | 仪表盘/个性首页 | 分组服务卡片、折叠、即时搜索、实时时钟、状态胶囊、页脚版本 |
| **`ContextUsageBadge`** | 上下文 Token 仪表 | Context Window 百分比进度条、分级预警（70%/90%）、分布浮层 |
| **`ModelSelector`** | 模型切换选择器 | 即时搜索过滤、Provider 与 Context 长度徽章、多模型平滑切换抽屉 |
| **`CodeBlock`** | 独立代码块 | 语言徽章、文件名、一键复制反馈、行号模式、最大高度滚动 |
| **`TypingIndicator`** | AI 输入中指示 | 三点弹跳/脉冲双变体、sm/md/lg 三档尺寸、`role="status"` 无障碍 |
| **`ChatMessageRow`** | 会话消息气泡 | User/Assistant/System 三角色、头像/初始图标、名称与时间戳、气泡对齐 |
| **`CommandPalette`** | Cmd+K 命令面板 | 模糊搜索、分组标题、键盘上下导航/Enter 选中/Esc 关闭、快捷键提示 |
| **`ToastStack`** | 全局通知栈 | Success/Error/Warning/Info 四类型、自动消除、手动关闭、`aria-live` 播报 |
| **`ChatSessionList`** | 会话历史侧边栏 | 当前会话高亮、悬停删除、空态展示、会话计数徽章 |
| **`DiffViewer`** | AI 代码差异对比 | 增/删/上下文行高亮、+/- 统计、双列行号、文件名与语言徽章 |
| **`ToolApprovalCard`** | Agent 工具审批 | Approve/Reject 按钮、高/低风险分级、参数预览、状态自更新 |
| **`FileAttachmentList`** | 输入框附件列表 | 类型图标（图片/代码/文件）、大小格式化、可移除 Chip |
| **`StreamingProgressBar`**| 流式生成进度 | 确定/不确定双模式、状态三色（streaming/done/error）、`role="progressbar"` |
| **`EmptyState`** | 空态占位页 | 图标、标题、描述、CTA 按钮，适配零结果/空列表场景 |
| **`AgentStepTimeline`** | Agent 执行轨迹 | Pending/Running/Done/Error 四态图标、步骤连接线、耗时展示 |
| **`PromptTemplateGrid`** | 提示词模板库 | 卡片网格、标签徽章、悬停 Use 操作、点击载入模板 |
| **`AgentTaskChecklist`** | Agent 任务清单 | 进度计数、状态图标（含 active 旋转）、点击切换完成态 |
| **`UiIcon`** | 统一图标系统 | 零依赖 SVG 图标，React / Vue / Vanilla 同名 API，尺寸线宽可调 |
| **`FluidContourBackdrop`**| WebGL 等高线流体 | 2D/3D Simplex 噪声等高线着色器、光标引力变形、减弱动态保活 |
| **`SpotlightGlareCard`** | 3D 光标镜面高光卡片 | 触感纸质与 OKLCH 调色、实时计算相对光标坐标并呈现径向反射光晕与悬浮倾斜 |
| **`AnimatedCounter`** | 平滑缓动计数器 | IntersectionObserver 视口触发展示、easeOutCubic 曲线步进计数 |
| **`PointerRipples`** | WebGL 多彩流体涟漪 | Navier-Stokes 流体仿真、彩虹色相旋转染料拖尾、3D 漫反射着色、空闲休眠 |
| **`LiquidGlass`** | 液体玻璃材质容器 | 真实背景折射取样、迎光微镜面倒角、光标焦散高光与无障碍降级 |

---

## 三端对齐架构规范

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AwesomeUI 规范设计底座                          │
│          Tailwind CSS v4 工具类规范 · 无障碍规范 (WAI-ARIA)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   统一 Props / Events / Slots 接口协议                 │
│  ┌───────────────────────┬───────────────────────┬──────────────────┐  │
│  │ React 实现 (TSX)      │ Vue 3 实现 (SFC)      │ Vanilla 实现     │  │
│  │ • 纯函数组件          │ • <script setup lang> │ • Web Components │  │
│  │ • 标准 TS 泛型接口    │ • defineProps 强类型  │ • 自定义元素封装 │  │
│  │ • 零第三方库捆绑      │ • 零第三方库捆绑      │ • 零运行时依赖   │  │
│  └───────────────────────┴───────────────────────┴──────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   宿主工程单文件直接取用 (Copy-Paste)                  │
│       支持 Next.js, Vite, Nuxt, Astro, SvelteKit, 纯 HTML5 等场景      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 快速使用指南

### 1. 浏览与预览交互组件

直接克隆本仓库并在本地启动静态预览：

```bash
git clone https://github.com/dengyie/awesome-ui.git
cd awesome-ui
npx serve .
```

在浏览器中打开 `http://localhost:3000/index.html` 即可直观体验所有组件的交互范例与源码。

### 2. 在 React 项目中使用

直接复制 `react/<ComponentName>.tsx` 到你的项目组件目录中（例如 `src/components/ui/`）：

```tsx
import { ThinkingBlock } from './components/ui/ThinkingBlock';

export default function ChatDemo() {
  return (
    <ThinkingBlock
      thought="正在检索本地向量数据库并分析上下文..."
      duration="1.8s"
      defaultExpanded={true}
    />
  );
}
```

### 3. 在 Vue 3 项目中使用

直接复制 `vue/<ComponentName>.vue` 到你的项目组件目录：

```vue
<script setup lang="ts">
import ThinkingBlock from './components/ui/ThinkingBlock.vue';
</script>

<template>
  <ThinkingBlock
    thought="正在检索知识图谱并规划行动路径..."
    duration="2.4s"
    :default-expanded="true"
  />
</template>
```

### 4. 在原生 HTML5 / Web Components 中使用

在页面头部引入 `vanilla/<ComponentName>.js` 即可像原生 HTML 标签一样直接调用：

```html
<script src="./vanilla/ThinkingBlock.js"></script>

<thinking-block
  thought="正在合成多源回复并验证工具调用..."
  duration="1.2s"
  expanded
></thinking-block>
```

---

## 质量保证与自动化测试

本项目在 `tests/` 目录下提供全量覆盖的单元与组件渲染测试套件（基于 Node.js 原生 `node:test` 与 jsdom）：

```bash
cd tests
npm test
```

测试范围包括：
- **Vanilla Web Components**: 自定义标签生命周期、属性反射与 DOM 安全渲染；
- **React SSR**: 服务端同构渲染、HTML 实体转义、属性规范透传；
- **Vue SFC**: 单文件组件模板编译语法验证与响应式状态断言；
- **XSS 安全防范**: 恶意脚本注入拦截与 `javascript:` / `data:` 伪协议清洗；
- **状态流转与无障碍**: 键盘无障碍焦点捕获、`aria-expanded` / `aria-live` 同步与降级保护。

---

## 参与贡献与许可证

欢迎提交 Issue 与 Pull Request！新增组件请确保同时提供 React、Vue 3 与 Vanilla Web Components 三套实现，并通过全量回归测试套件。

本项目采用 [MIT License](LICENSE) 开源协议。

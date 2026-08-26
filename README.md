# awesome-ui

> **专为 AI 时代 / LLM 代码生成打造的精选前端原子组件库**  
> 支持 **React (TSX)** / **Vue 3 (SFC)** / **Vanilla (原生 JS/Web Component)** 三端，Tailwind CSS 美学，单文件即拷即用，零黑盒依赖。

---

## 🎯 为什么需要 awesome-ui？

传统组件库（AntD、Element、MUI）是为传统 CRUD 管理台设计的。当 AI（Cursor、v0、Claude Code、Codex）尝试生成现代 AI 网页（如类似 ChatGPT、Claude、Perplexity、v0 的交互）时，往往需要耗费大量 Token 反复调试流式打字、思维链折叠、自动跟底、代码分屏预览等复杂状态。

**awesome-ui 的核心价值**：
- **AI 友好（AI-to-AI First）**：组件全部为扁平 Props 设计，无深层嵌套对象，AI 生成命中率 100%。
- **单文件 Copy-Paste**：无 npm 私有黑盒，AI 直接按需取用单文件复制进用户项目。
- **全技术栈对齐**：React、Vue 3、Vanilla 三套代码的 API 与 Tailwind 样式 100% 对齐。

---

## 📦 组件列表 (精选核心场景)

| 组件 | 对应场景 | 核心特性 |
|---|---|---|
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
| **`HomepageDashboard`** | 仪表盘/个性首页 | 对标 gethomepage/homepage：分组服务卡片、折叠、即时搜索、实时时钟、状态点/胶囊、页脚版本 |

---

## 🚀 目录结构

```text
awesome-ui/
├── index.html                 # 交互式 Gallery 体验页面
├── SKILL.md                   # Agent 检索与规范文档
├── react/                     # React (TSX) 单文件组件
│   ├── ChatPromptInput.tsx
│   ├── StreamMarkdown.tsx
│   ├── ThinkingBlock.tsx
│   ├── ToolCallBadge.tsx
│   ├── AutoScrollAnchor.tsx
│   ├── ArtifactCanvas.tsx
│   ├── MessageActionToolbar.tsx
│   ├── PromptChips.tsx
│   ├── SourcesCitation.tsx
│   ├── StatusIndicator.tsx
│   ├── ThemeToggle.tsx
│   ├── AudioWaveVisualizer.tsx
│   ├── RoadmapTimeline.tsx
│   ├── KnowledgeDrawer.tsx
│   └── HomepageDashboard.tsx
├── vue/                       # Vue 3 (SFC) 单文件组件
│   ├── ChatPromptInput.vue
│   ├── StreamMarkdown.vue
│   ├── ThinkingBlock.vue
│   ├── ToolCallBadge.vue
│   ├── AutoScrollAnchor.vue
│   ├── ArtifactCanvas.vue
│   ├── MessageActionToolbar.vue
│   ├── PromptChips.vue
│   ├── SourcesCitation.vue
│   ├── StatusIndicator.vue
│   ├── ThemeToggle.vue
│   ├── AudioWaveVisualizer.vue
│   ├── RoadmapTimeline.vue
│   ├── KnowledgeDrawer.vue
│   └── HomepageDashboard.vue
└── vanilla/                   # 原生 JS / Web Components 单文件
    ├── ChatPromptInput.js
    ├── StreamMarkdown.js
    ├── ThinkingBlock.js
    ├── ToolCallBadge.js
    ├── AutoScrollAnchor.js
    ├── ArtifactCanvas.js
    ├── MessageActionToolbar.js
    ├── PromptChips.js
    ├── SourcesCitation.js
    ├── StatusIndicator.js
    ├── ThemeToggle.js
    ├── AudioWaveVisualizer.js
    ├── RoadmapTimeline.js
    ├── KnowledgeDrawer.js
    └── HomepageDashboard.js
```

---

## 🛠️ 依赖说明 (Dependencies)

- **样式**：Tailwind CSS (v3 / v4)
- **React 端建议轻量依赖**：`lucide-react`, `marked`, `prismjs`
- **Vue 3 端建议轻量依赖**：`marked`, `prismjs`
- **Vanilla 端**：可直接通过 CDN 或浏览器原生运行

---

## 🧩 HomepageDashboard（仪表盘主推组件）

`HomepageDashboard` 以经典开源项目 [gethomepage/homepage](https://github.com/gethomepage/homepage) 为设计灵感（独立原创实现，非代码搬运），为自托管/内网应用提供「首页式」仪表盘：

- **分组服务卡片**：`groups[].services[]` 扁平数据驱动，卡片含图标（URL 图片 / Emoji / 字母缩略图）、名称、描述。
- **状态指示**：`statusStyle` 支持 `pill`（右上角胶囊文字）/ `dot`（圆点）/ `none`；状态由 `online/up/down/offline/warn/error/unknown` 控制颜色。
- **交互能力**：分组头点击折叠、顶部搜索框即时过滤、页头实时时钟、页脚 GitHub 版本链接。
- **Responsive 网格**：`md:1/2 · lg:1/3 · xl:1/4` 四档断点，与 homepage 默认列布局一致。
- **三端 API 完全一致**，可从 `react/`、`vue/`、`vanilla/` 任选单文件复制使用。

```html
<!-- Vanilla 用法 -->
<script type="module" src="./vanilla/HomepageDashboard.js"></script>
<homepage-dashboard title="Homepage" subtitle="My homelab" status-style="pill" show-search></homepage-dashboard>
<script>
  const dash = document.querySelector("homepage-dashboard");
  dash.groups = [{
    name: "Media",
    services: [
      { name: "Jellyfin", description: "Movies & TV", icon: "jellyfin.png", href: "https://jellyfin.local", status: "online", pingText: "24ms" },
    ],
  }];
</script>
```

> **安全与健壮性**（三端 API 一致，含 TypeScript `id?: string` 稳定 key）：
> - `href` 仅放行 `http(s)://`、`mailto:`、协议相对 `//`、根相对 `/`、`.`/`..` 相对路径，`javascript:`/`data:`/`vbscript:`/`file:` 一律不渲染为链接。
> - 纯文本插值/实体转义，注入 `<script>`/`<img onerror>` 不产生节点。
> - 搜索无命中时隐藏整组（与 React/Vue filter 行为对齐），缺失字段（name/href/description）安全降级不崩溃。
> - 时钟随 `showClock` 动态启停；默认 `version` 不伪装上游版本号。
>
> - **测试**：`npm install && npm test` 运行 19 项回归（vanilla jsdom 行为 + React SSR + Vue SFC 编译/SSR），`npm run typecheck` 对 React 端做 strict TS 校验。

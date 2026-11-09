<!-- markdownlint-disable-file MD033 MD045 -->
<div align="center">

# AwesomeUI

**Curated Atomic UI Component Library for the AI Era, Supporting React, Vue 3, and Vanilla Web Components with Zero Black-Box Dependencies**

[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)
[![Frameworks](https://img.shields.io/badge/Frameworks-React_%7C_Vue_3_%7C_Vanilla-61DAFB.svg?style=flat-square)](react/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Components](https://img.shields.io/badge/Components-37+_Production_Ready-blue.svg?style=flat-square)](vanilla/)
[![Architecture](https://img.shields.io/badge/Architecture-Single--File_Copy--Paste-orange.svg?style=flat-square)](./)
[![Tests](https://img.shields.io/badge/tests-51%20passed-brightgreen.svg?style=flat-square)]()

[English](./README.md) · [简体中文](./README.zh-CN.md) · [Why AwesomeUI](#why-awesomeui) · [Component Catalog](#component-catalog) · [Architecture](#system-architecture--specifications) · [Quick Start](#quick-start) · [Testing](#quality-assurance--testing)

<br>

<p align="center">
  <b>Terminates token-burning UI debugging, tangled commercial design system bloat, and mismatched component APIs across AI chat applications.</b><br>
  Engineered strictly as single-file copy-paste components with 100% aligned props and Tailwind CSS aesthetics across React (TSX), Vue 3 (SFC), and Vanilla Web Components.<br>
  Provides 37+ production-grade primitives covering streaming markdown with breathing cursors, collapsible thinking chain inspectors, Agent tool approval drawers, and WebGL fluid backdrops.
</p>

</div>

---

## Why AwesomeUI?

Conventional UI component libraries (Ant Design, Element Plus, Material-UI) were architected for traditional database-driven CRUD dashboards. When modern AI assistants (Cursor, Claude Code, Codex, v0) generate conversational interfaces and AI-native applications (like ChatGPT, Claude, Perplexity, or v0), developers waste massive token quotas debugging streaming typography, collapsible reasoning chains, scroll-lock anchors, and split-screen artifact canvases. Heavy external npm dependencies frequently break builds or introduce security vulnerabilities.

**Core Architectural Tenets**:
- **AI-to-AI First**: Every component exposes a flat prop signature without deep nested objects, ensuring near-100% generation accuracy by LLM coders.
- **Single-File Copy-Paste**: Zero private npm packages or bloated runtimes. Copy a single file directly into your application directory and run immediately.
- **Complete Tri-Framework Alignment**: React (TSX), Vue 3 (SFC), and Vanilla Web Components maintain strict 1:1 parity in prop names, emitted events, and Tailwind CSS class styling.
- **Accessibility & Tactile Ergonomics**: Comprehensive WAI-ARIA compliance (`role="status"`, `aria-live`, full keyboard navigation) with automatic reduced-motion adaptations and tactile physics.

---

## Component Catalog

| Component | Target Interaction | Technical Highlights & Value |
| :--- | :--- | :--- |
| **`ChatPromptInput`** | Multimodal Input Area | Auto-expanding textarea, shortcut submission/newlines, attachment chips, abort generation toggle. |
| **`StreamMarkdown`** | Streaming Markdown | High-performance chunk rendering, breathing typing cursor, 1-click code copying, syntax highlighting. |
| **`ThinkingBlock`** | Deep Reasoning Inspector | Collapsible chain-of-thought for R1/o1 models, shimmer animations, and duration counters. |
| **`ToolCallBadge`** | Agent Tool Invocation | Real-time status indicators (Running/Success/Error) with collapsible payload and result inspection drawers. |
| **`AutoScrollAnchor`** | Smart Scroll Anchor | Smooth auto-scrolling during stream generation; pauses when user scrolls upward and displays quick-jump CTA. |
| **`ArtifactCanvas`** | Split-Screen Preview | Claude-style artifact pane with side-by-side tabs for live HTML/SVG sandbox execution and source code. |
| **`SourcesCitation`** | RAG Source References | Perplexity-grade citation grid displaying favicon domains, sequence indices, titles, and snippets. |
| **`MessageActionToolbar`**| Message Footer Actions | Copy responses, regenerate completions, thumbs up/down feedback, and multi-branch history navigators. |
| **`PromptChips`** | Suggested Questions | Bubble recommendation chips for instant 1-click query population and dispatch. |
| **`RoadmapTimeline`** | Progress Roadmap | Tactile map-style milestone tracker with diamond landmarks, lock states, and completion states. |
| **`KnowledgeDrawer`** | Knowledge Node Drawer | Color-coded slide-over drawer showing prerequisites, child branches, core insights, and call-to-actions. |
| **`ThemeToggle`** | Tri-State Theme Switcher| Auto/Light/Dark switching with system clock and OS preference synchronization, eliminating flicker. |
| **`StatusIndicator`** | Node & Service Status | Real-time service status badge (Online/Connecting/Error) with breathing halos and latency metrics. |
| **`AudioWaveVisualizer`** | Voice Interaction Wave | Dynamic voice activity visualizer with reactive frequency bars and breathing transitions. |
| **`HomepageDashboard`** | Personal Service Portal | Grouped service cards, collapsible sections, instant filtering, live clock, and status pills. |
| **`ContextUsageBadge`** | Context Window Gauge | Visual context capacity progress bar with tiered alerts (70%/90%) and token breakdown tooltips. |
| **`ModelSelector`** | Model Switching Modal | Fast search filter, provider badges, context window length markers, and smooth drawer transitions. |
| **`CodeBlock`** | Standalone Code Block | Language badge, filename header, copy feedback, line-number toggle, and max-height scrolling. |
| **`TypingIndicator`** | AI Typing State | Staggered bouncing or pulsing 3-dot animation, sm/md/lg sizing, and accessible `role="status"` tags. |
| **`ChatMessageRow`** | Chat Message Bubble | User/Assistant/System role variants, avatars/monograms, timestamps, and responsive alignments. |
| **`CommandPalette`** | Cmd+K Command Palette | Fuzzy search filtering, grouped categories, arrow-key navigation, Enter selection, and Escape dismissal. |
| **`ToastStack`** | Notification Stack | Success/Error/Warning/Info alerts with auto-dismiss timers, manual close, and `aria-live` announcements. |
| **`ChatSessionList`** | Chat History Sidebar | Active session highlighting, hover deletion, empty-state placeholder, and session counter chips. |
| **`DiffViewer`** | AI Code Diff Review | Line-by-line added/removed/context coloring, delta tallies, dual-column numbers, and file metadata. |
| **`ToolApprovalCard`** | Agent Action Approval | Explicit Approve/Reject controls, risk classification badges, parameter review, and state persistence. |
| **`FileAttachmentList`** | Input Attachment Strip | Type icons (image/code/doc), size formatting, and removable chips. |
| **`StreamingProgressBar`**| Generation Progress | Determinate/indeterminate dual modes, status colors (streaming/done/error), and `role="progressbar"`. |
| **`EmptyState`** | Empty State Placeholder | Clean illustration, title, description, and action CTA for zero-result scenarios. |
| **`AgentStepTimeline`** | Agent Execution Trace | Pending/Running/Done/Error indicators, path connectors, and step latency measurements. |
| **`PromptTemplateGrid`** | Prompt Library Grid | Card grid with category tags, hover preview, and 1-click template insertion. |
| **`AgentTaskChecklist`** | Agent Task Checklist | Step completion counter, interactive status icons, and keyboard-driven toggling. |
| **`UiIcon`** | Unified Icon System | Zero-dependency SVG icons with identical APIs across React, Vue, and Vanilla. |
| **`FluidContourBackdrop`**| WebGL Contour Backdrop | 2D/3D Simplex noise contour shader with cursor gravity distortion and reduced-motion fallbacks. |
| **`SpotlightGlareCard`** | 3D Cursor Glare Card | Tactile paper card computing cursor coordinates for realistic radial specular glare and 3D tilts. |
| **`AnimatedCounter`** | Smooth Metric Counter | IntersectionObserver-triggered easing counter with prefix/suffix formatting and custom durations. |
| **`PointerRipples`** | WebGL Fluid Ripples | Navier-Stokes fluid simulation with rainbow dye trails, 3D diffuse lighting, and idle sleep. |
| **`LiquidGlass`** | Liquid Glass Container | Native macOS-grade backdrop refraction, micro-bevel highlights, and high-contrast solid fallbacks. |

---

## System Architecture & Specifications

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AwesomeUI Design System                         │
│           Tailwind CSS v4 Utility Classes · WAI-ARIA Specifications    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Unified Props / Events / Slots Interface Protocol        │
│  ┌───────────────────────┬───────────────────────┬──────────────────┐  │
│  │ React (TSX)           │ Vue 3 (SFC)           │ Vanilla          │  │
│  │ • Functional component│ • <script setup lang> │ • Web Components │  │
│  │ • TypeScript generics │ • defineProps types   │ • Custom elements│  │
│  │ • Zero bundled deps   │ • Zero bundled deps   │ • Zero runtimes  │  │
│  └───────────────────────┴───────────────────────┴──────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Direct Project Integration (Copy-Paste)              │
│       Compatible with Next.js, Vite, Nuxt, Astro, SvelteKit, and HTML5 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Interactive Component Showcase

Clone the repository and launch the local preview server:

```bash
git clone https://github.com/dengyie/awesome-ui.git
cd awesome-ui
npx serve .
```

Open `http://localhost:3000/index.html` in your browser to explore interactive live demos and component source code.

### 2. React Integration

Copy `react/<ComponentName>.tsx` into your application (e.g., `src/components/ui/`):

```tsx
import { ThinkingBlock } from './components/ui/ThinkingBlock';

export default function ChatDemo() {
  return (
    <ThinkingBlock
      thought="Retrieving relevant context from local vector store..."
      duration="1.8s"
      defaultExpanded={true}
    />
  );
}
```

### 3. Vue 3 Integration

Copy `vue/<ComponentName>.vue` into your project:

```vue
<script setup lang="ts">
import ThinkingBlock from './components/ui/ThinkingBlock.vue';
</script>

<template>
  <ThinkingBlock
    thought="Synthesizing knowledge graph and planning next steps..."
    duration="2.4s"
    :default-expanded="true"
  />
</template>
```

### 4. Vanilla HTML5 / Web Components

Import `vanilla/<ComponentName>.js` in your HTML header and use native custom elements:

```html
<script src="./vanilla/ThinkingBlock.js"></script>

<thinking-block
  thought="Analyzing multi-turn dialogue history and validating tool parameters..."
  duration="1.2s"
  expanded
></thinking-block>
```

---

## Quality Assurance & Testing

AwesomeUI enforces strict automated testing in `tests/` utilizing native Node.js `node:test` and jsdom:

```bash
cd tests
npm test
```

### Verified Test Vectors

- **Vanilla Custom Elements**: Validates element lifecycle callbacks, attribute reflection, and safe DOM rendering.
- **React SSR**: Validates server-side rendering, HTML entity escaping, and prop forwarding without hydration errors.
- **Vue SFC**: Verifies compilation syntax and reactive state bindings across single-file components.
- **XSS Sanitization**: Enforces strict protocol whitelisting (blocking `javascript:` and `data:` URI attacks).
- **Accessibility**: Verifies keyboard focus capture, `aria-expanded` and `aria-live` state synchronization.

---

## Technology Stack

- **Styling Architecture**: Tailwind CSS v4, OKLCH Color Spaces, CSS Variables
- **Component Runtimes**: React 18/19, Vue 3.5+, Web Components (Custom Elements v1)
- **Visuals & Graphics**: WebGL Shaders (Navier-Stokes fluid dynamics, Simplex noise), SVG
- **Quality Assurance**: Native Node.js `node:test`, jsdom, ESLint

---

## Contributing & License

Contributions, component submissions, and enhancements are welcome. When submitting a new component, please ensure all three framework implementations (React, Vue 3, and Vanilla) are provided alongside regression tests.

This project is licensed under the [MIT License](LICENSE).

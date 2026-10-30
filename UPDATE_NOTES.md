# 更新说明 · v1.2（给组员）

2026-10-30 · Jiayu · 根据 6 位参与者的访谈反馈修改

线上：
- 社区站：https://vickyyan-rgb.github.io/Hypersquare/
- 工作台：https://vickyyan-rgb.github.io/Hypersquare/workspace/

看到旧版本就按 Cmd+Shift+R 强制刷新。社区站里指向工作台的链接现在带版本号（例如 `workspace/?v=1.2.2`），每次更新后从社区站点进去就是最新版。

## 同步前先看

1. 本地有改动的话，先 commit，再 `git pull origin main`。
2. **B（Interview / Review）请注意**：工作台是一个文件 `dist/workspace/index.html`，我在里面动了下面几处，合并时留意：
   - 共用的 `Code` 组件：加了可选的「Edit code」编辑模式。不传 `editable` 时和原来一样是只读。
   - Interview 页只改了一行：代码面板加了 `editable` 和 `onSave`，可以直接改代码、写一句原因、保存修改前后对比、可撤销。
   - `statusTag`：已发布的标签文字从 Verified 改成 Confirmed。
   - 文件顶部：字体链接、`--sans` / `--mono`，以及浅色主题的底色变量。
   - 新样式都加在 `<style>` 的末尾，注释是「1.1」「1.2」。
   - Interview 和 Review 的布局、逻辑都没改。

## 这次改了什么

### A · 社区站（首页 / Overview / Bank offers）
- 首页先讲用途：「Preserve what COBOL experts know. Help the next engineer.」主按钮是 Open Expert Workspace。
- 右边是会自动播放的三步小演示：Linda 回答 → 盖章确认 → Marcus 的工单变成已解决。可以点步骤，鼠标停在上面会暂停。
- 「What it takes, what you get」：时长、报酬、积分、控制权，每项一句话，金额都标了「示例」。
- 排行榜、每周测验、COBOL NOW! 移到下面，标成 Optional。
- 去掉了底部重复的个人入口；手机上导航可以横向滑动，按钮都能点。
- 滚动时各区块淡入，积分数字滚动增长；做完测验积分会 +75 并动画增长。
- Bank offers：每个银行标了 Sample；新增「贡献 → 质量审核 → 积分 → 福利」流程，写明审核由谁做。
- 排行榜、本周榜、测验那一排的左右对齐成一套网格；排名数字统一宽度。

### C · 工作台（Library / Coverage / 工程师端）
- 工程师默认进「Ask or search」：一个大搜索框，输入时就列出匹配的已确认答案；没有确认答案就不猜，直接发给专家。
- 工单里的答案顺序：下一步 → 原因 → 适用 / 不适用的情况，工单背景放在最后。
- 每条答案显示代码版本和最后确认日期；代码改过的标「Needs re-review」。
- 「Mark done」：勾选下一步完成后，工单变成 Resolved，这条答案的使用次数 +1，Linda 会收到通知。
- Library 默认显示最常用的几条，选程序后会出现数据流图（输入 → 模块 → 输出）。
- Coverage 标成 Manager view，列出具体缺哪些知识，每条可以一键加到专家下次访谈。
- 修了 Library 详情面板滑不动、代码块被压扁的问题。
- 专家首页：开头是「3 questions are waiting for you」，问题都来自真实工单并标了时长，下面一行写清三步流程。

### 侧边栏精简（v1.2 之后补充）
- 专家只留 4 个：Home → Interview → Review → My answers（只显示 Linda 自己确认过的答案，可以修改或撤回）。
- Questions 不在侧边栏了：Home 已经列出所有等待的问题，点 Answer / See all 还能进原来的页面。
- Coverage 是给经理看的，移到侧边栏底部的「Coverage · Manager view」小链接。
- 工程师：Ask or search、My tickets、Library。
- 版本标签改成 v1.2。

### 全局
- 字体换成 Atkinson Hyperlegible（Braille Institute 设计，适合年长读者），代码用 Atkinson Hyperlegible Mono。
- 宽度适配 Mac 屏幕：社区站最宽约 1640px，工作台最宽 1600px。
- 降低 AI 感：中性米白底色；去掉标题旁的小图标、胶囊标签、彩色头像、装饰光圈；少用卡片；不再用 “twin” 这类说法。
- 正文字号加大，各页说明都缩短成一句话。

## 访谈问题对照

| 问题 | 状态 |
|---|---|
| 1 首页没讲清用途 | ✅ |
| 2 奖励机制不清楚 | ✅ |
| 3 访谈前缺少引导 | 首页三步说明 + Edit code ✅；访谈页的说明卡、缩小动画由 B 负责 |
| 4 AI 内容难核对 | 版本、确认日期、需复核 ✅；原话对照、AI 追问由 B 负责 |
| 5 发布流程 / 找知识 | 搜索、具体缺口 ✅；发布后会发生什么的说明由 B 负责 |
| 6 界面和 bug | ✅（「当前问题会消失」在访谈页，由 B 负责） |

## 文件
- `dist/index.html`、`dist/app.js`、`dist/dashboard.js`、`dist/dashboard.css`：社区站
- `dist/workspace/index.html`：工作台
- `CHANGELOG.md`：英文版更新记录

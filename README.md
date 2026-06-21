# ChiefMotto

简洁的座右铭桌面应用 - 让每一次启动电脑都有灵感陪伴。

## 功能特性

- 🎯 每日座右铭展示
- 🎨 多主题支持
- 🌍 国际化支持（中英文）
- 🖥️ 系统托盘集成
- ⚡️ 轻量快速

## 快速开始

### 安装依赖

```bash
bun install
# 或
npm install
```

### 开发运行

```bash
bun run start
# 或
npm start
```

### 构建应用

```bash
bun run build
# 或
npm run build
```

构建后的应用会在 `dist/` 目录下。

## 技术栈

- Electron
- JavaScript
- CSS

## 项目结构

```
座右铭-app/
├── main.js          # Electron 主进程
├── app.js           # 应用逻辑
├── preload.js       # 预加载脚本
├── index.html       # 主界面
├── themes.css       # 主题样式
├── i18n-init.js     # 国际化配置
└── build/           # 构建资源
```

## 优化历程

- ✅ P0 优化完成 - 核心功能优化
- ✅ P1 优化完成 - 用户体验提升
- ✅ 深度打磨审计 - 细节完善

详见项目内的优化文档。

## License

MIT

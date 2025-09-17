# YAML Doctor

本项目是一个基于 **React + TailwindCSS + Tauri** 的本地工具，用于 **校验、格式化和自动修复 YAML/JSON** 文件。  
工具完全在 **本地运行**，不会上传任何数据。

## 功能

- 语法校验（基于 [yaml](https://www.npmjs.com/package/yaml) 库）  
- 自动修复常见问题：缩进、智能引号、JSON 尾逗号、冒号值加引号等  
- JSON 转 YAML  
- YAML 格式化（统一缩进、行宽）  
- 拖拽文件 / 上传文件  
- 一键复制 / 下载修复后的结果  
- 支持多语言界面（中文 / English / Français）  

## 使用方法

### Web 版
```bash
npm install
npm start
```
访问 [http://localhost:5173](http://localhost:5173) 使用。

### 桌面应用 (Tauri)
```bash
npm install
npm run tauri:dev
```

### 构建
- Web 版：
```bash
npm run build
```
- 桌面应用：
```bash
npm run tauri:build
```

## 技术栈

- React 18
- TailwindCSS
- Radix UI / lucide-react
- yaml (eemeli/yaml)
- Webpack 5 + Babel
- Tauri (桌面端打包)

## 目录结构

```
yaml-doctor/
├── src/
│   ├── App.jsx        # 应用逻辑
│   ├── index.jsx      # React 入口
│   └── index.css      # 样式
├── package.json       # 项目依赖和脚本
├── postcss.config.js  # PostCSS 配置
├── jsconfig.json      # 路径别名
└── tauri.conf.json    # Tauri 配置
```

## License

MIT

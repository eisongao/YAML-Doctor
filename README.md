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


## 截图

![Demo Screenshots]([yaml_demo.png](https://github.com/eisongao/YAML-Doctor/blob/main/yaml_demo.png?raw=true))

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

## 📂 目录结构

```
yaml-doctor/
├── dist/                  # Webpack 打包输出
├── node_modules/          # 依赖
├── public/                # 静态资源
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   └── robots.txt
├── src/                   # React 前端源码
│   ├── styles/            # 样式文件
│   ├── App.jsx            # 主应用逻辑
│   ├── index.css          # 全局样式
│   └── index.jsx          # React 入口
├── src-tauri/             # Tauri 桌面端相关 (Rust)
│   ├── capabilities/
│   ├── gen/
│   ├── icons/
│   ├── src/
│   └── target/
│       ├── build.rs
│       ├── Cargo.lock
│       ├── Cargo.toml
│       └── tauri.conf.json
├── .gitignore
├── .babelrc
├── components.json
├── jsconfig.json
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── webpack.config.js
└── README.md
```

## License

Copyright (c) 2025 Crazyus.net

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:  

The above copyright notice and this permission notice shall be included in all  
copies or substantial portions of the Software.  

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.

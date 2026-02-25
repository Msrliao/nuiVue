# TypeScript + Vue 3 开发必备 IDE 插件

## 通用推荐（适用于所有IDE）

### VS Code（最推荐）
1. **Volar** - Vue 3 官方推荐的语言支持插件，提供更好的 TypeScript 集成和 Vue 3 特性支持
2. **TypeScript Vue Plugin (Volar)** - 增强 Vue 单文件组件中的 TypeScript 支持
3. **ESLint** - 代码质量检查工具，配合 eslint-plugin-vue 使用
4. **Prettier** - 代码格式化工具，保持代码风格一致
5. **Vue 3 Snippets** - 提供 Vue 3 常用代码片段，提高开发效率
6. **Vite** - Vite 构建工具的官方插件，提供开发服务器和构建功能
7. **GitLens** - 增强 Git 功能，查看代码历史和作者信息
8. **Path Intellisense** - 自动补全文件路径
9. **Auto Import** - 自动导入模块和组件
10. **Error Lens** - 在编辑器中直接显示错误和警告信息

### WebStorm
1. **Vue.js** - WebStorm 内置的 Vue 支持，也可以安装最新版本
2. **TypeScript** - 内置支持，确保使用最新版本
3. **ESLint** - 代码质量检查
4. **Prettier** - 代码格式化
5. **EditorConfig** - 保持跨编辑器的代码风格一致

### IntelliJ IDEA
1. **Vue.js** 插件
2. **TypeScript** 插件
3. **ESLint** 插件
4. **Prettier** 插件

## 功能分类

### 语法和类型支持
- **Volar** - Vue 3 语法高亮、智能提示、类型检查
- **TypeScript Vue Plugin (Volar)** - 增强 TypeScript 在 Vue 中的支持

### 代码质量和格式化
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **EditorConfig** - 统一编辑器配置

### 开发效率
- **Vue 3 Snippets** - 代码片段
- **Auto Import** - 自动导入
- **Path Intellisense** - 文件路径补全
- **Bracket Pair Colorizer** - 括号颜色匹配

### 构建和部署
- **Vite** - 开发服务器和构建工具
- **Docker** - 容器化支持

### 版本控制
- **GitLens** - Git 增强工具
- **Git History** - 查看 Git 历史

## 配置建议

### VS Code 配置示例
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "vetur.validation.template": false, // 禁用 Vetur，使用 Volar
  "volar.tsPlugin": true,
  "volar.vueCompilerOptions": {
    "target": 3
  }
}
```

### ESLint 配置示例
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    '@vue/typescript/recommended',
    '@vue/prettier',
    '@vue/prettier/@typescript-eslint'
  ],
  rules: {
    // 自定义规则
  }
}
```

## 其他推荐工具

1. **Vue DevTools** - 浏览器扩展，用于调试 Vue 应用
2. **Pinia DevTools** - Pinia 状态管理的调试工具
3. **Chrome DevTools** - 浏览器开发工具
4. **Postman** - API 测试工具

## 总结

对于 TypeScript + Vue 3 开发，VS Code + Volar 是目前最推荐的组合。通过安装上述插件，可以获得最佳的开发体验，包括智能提示、类型检查、代码格式化等功能，从而提高开发效率和代码质量。
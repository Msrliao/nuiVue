# 车型配件查询Skill实现方案

## 1. 需求分析
- 分析用户输入，识别车型和配件名称
- 查询数据库获取库存和价格信息
- 组合结果返回给用户

## 2. 实现步骤

### 2.1 创建Skill目录结构
```
.trae/skills/vehicle-parts-query/
├── SKILL.md              # Skill定义文件
├── rules/
│   └── parts-query.md    # 查询规则定义
└── index.js              # Skill实现逻辑
```

### 2.2 后端扩展
1. **数据库表设计**
   - `vehicle_models`：车型信息表
   - `parts`：配件信息表
   - `inventory`：库存信息表

2. **API接口开发**
   - `GET /api/vehicle-models`：获取车型列表
   - `GET /api/parts`：获取配件列表
   - `GET /api/inventory`：查询库存和价格
   - `GET /api/inventory/search`：根据车型和配件名称搜索库存

### 2.3 Skill实现
1. **意图分析模块**
   - 正则匹配提取车型和配件名称
   - 支持模糊匹配

2. **数据库查询模块**
   - 调用后端API获取数据
   - 支持多条件查询

3. **结果组合模块**
   - 格式化查询结果
   - 生成友好的响应文本

### 2.4 配置和部署
- 配置API地址
- 测试Skill功能

## 3. 技术栈
- Node.js
- Express
- PostgreSQL
- Trae Skill Framework

## 4. 预期效果
- 用户输入："查询丰田凯美瑞的机油滤清器库存"
- 系统识别：车型=丰田凯美瑞，配件=机油滤清器
- 查询结果：返回库存数量、价格等信息
- 响应格式：友好的文本或结构化数据

## 5. 实现时间
预计需要1-2小时完成全部实现和测试
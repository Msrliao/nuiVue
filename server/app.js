/**
 * Express 应用入口文件
 * 服务器主入口，负责应用配置和路由注册
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const { testConnection } = require('./pgsqlDemo/db');
const { successResponse } = require('./middleware/response');

// REST API 路由
const employeeRoutes = require('./routes/employees');
const customerRoutes = require('./routes/customers');
const logisticsRoutes = require('./routes/logistics');
const areaRoutes = require('./routes/areas');
const warehouseRoutes = require('./routes/warehouses');
const positionRoutes = require('./routes/positions');
const partsRoutes = require('./routes/parts');
const menuRoutes = require('./routes/menus');
const dkRoutes = require('./routes/dk');

// 初始化 Express 应用
const app = express();
const PORT = config.server.port;

// ==================== 中间件配置 ====================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================== 基础路由 ====================
// 健康检查
app.get('/api/health', (req, res) => {
  successResponse(res, {
    status: 'ok',
    timestamp: Date.now()
  });
});

// ==================== REST API 路由 ====================
// 使用 /api/v1/ 前缀的路由，符合 REST API 设计最佳实践
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/logistics', logisticsRoutes);
app.use('/api/v1/areas', areaRoutes);
app.use('/api/v1/warehouses', warehouseRoutes);
app.use('/api/v1/positions', positionRoutes);
app.use('/api/v1/parts', partsRoutes);
app.use('/api/v1/menus', menuRoutes);
app.use('/api/v1/dk', dkRoutes);

// ==================== 服务器启动 ====================
async function startServer() {
  // 测试数据库连接
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('数据库连接失败，无法启动服务器');
    process.exit(1);
  }
  
  

  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('');
    console.log('REST API 接口:');
    console.log('- GET  /api/v1/employees     - 员工管理');
    console.log('- GET  /api/v1/customers     - 客户管理');
    console.log('- GET  /api/v1/logistics     - 物流管理');
    console.log('- GET  /api/v1/areas         - 地区管理');
    console.log('- GET  /api/v1/warehouses    - 仓库管理');
    console.log('- GET  /api/v1/positions     - 仓位管理');
    console.log('- GET  /api/v1/parts         - 配件管理');
    console.log('- GET  /api/v1/menus         - 菜单管理');
    console.log('- GET  /api/v1/dk            - 大库数据');
  });
}

// 启动服务器
startServer();

module.exports = app;

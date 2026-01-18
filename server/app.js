const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const { testConnection } = require('./pgsqlDemo/db');
const menuService = require('./pgsqlDemo/menuService');
const warehouseService = require('./pgsqlDemo/warehouseService');
const positionService = require('./pgsqlDemo/positionService');


// 初始化Express应用
const app = express();
const PORT = config.server.port;

// 中间件配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 统一响应处理
function successResponse(res, data, message = '操作成功') {
  res.status(200).json({
    code: 200,
    message,
    data,
    timestamp: Date.now()
  });
}

function errorResponse(res, code, message, error) {
  res.status(code).json({
    code,
    message,
    error,
    timestamp: Date.now()
  });
}

// API路由

// 健康检查
app.get('/api/health', (req, res) => {
  successResponse(res, {
    status: 'ok',
    timestamp: Date.now()
  });
});

// 获取菜单列表（树形结构）
app.get('/api/menus', async (req, res) => {
  try {
    const menuTree = await menuService.getAllMenus();
    successResponse(res, menuTree);
  } catch (error) {
    console.error('获取菜单列表失败:', error);
    errorResponse(res, 500, '获取菜单列表失败', error.message);
  }
});

// 获取菜单详情
app.get('/api/menus/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const menu = await menuService.getMenuByKey(key);
    
    if (!menu) {
      errorResponse(res, 404, '菜单不存在', '指定的菜单key不存在');
      return;
    }

    successResponse(res, menu);
  } catch (error) {
    console.error('获取菜单详情失败:', error);
    errorResponse(res, 500, '获取菜单详情失败', error.message);
  }
});

// 创建菜单
app.post('/api/menus', async (req, res) => {
  try {
    const { key, label, type = 'menu', icon, parent_key, order_index = 0 } = req.body;

    // 参数验证
    if (!key || !label) {
      errorResponse(res, 400, '请求参数错误', '菜单key和label不能为空');
      return;
    }

    const menu = await menuService.createMenu({ key, label, type, icon, parent_key, order_index });
    successResponse(res, menu, '菜单创建成功');
  } catch (error) {
    console.error('创建菜单失败:', error);
    errorResponse(res, 500, '创建菜单失败', error.message);
  }
});

// 更新菜单
app.put('/api/menus/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { label, type, icon, parent_key, order_index } = req.body;

    const menu = await menuService.updateMenu(key, { label, type, icon, parent_key, order_index });
    
    if (!menu) {
      errorResponse(res, 404, '菜单不存在', '指定的菜单key不存在');
      return;
    }

    successResponse(res, menu, '菜单更新成功');
  } catch (error) {
    console.error('更新菜单失败:', error);
    errorResponse(res, 500, '更新菜单失败', error.message);
  }
});

// 删除菜单
app.delete('/api/menus/:key', async (req, res) => {
  try {
    const { key } = req.params;

    // 检查菜单是否存在
    const menu = await menuService.getMenuByKey(key);
    if (!menu) {
      errorResponse(res, 404, '菜单不存在', '指定的菜单key不存在');
      return;
    }

    await menuService.deleteMenu(key);
    successResponse(res, { success: true }, '菜单删除成功');
  } catch (error) {
    console.error('删除菜单失败:', error);
    errorResponse(res, 500, '删除菜单失败', error.message);
  }
});

// 批量操作菜单
app.post('/api/menus/batch', async (req, res) => {
  try {
    const { operation, items } = req.body;

    if (!operation || !items || !Array.isArray(items)) {
      errorResponse(res, 400, '请求参数错误', 'operation和items参数不能为空');
      return;
    }

    await menuService.batchOperation(operation, items);
    successResponse(res, { success: true }, '批量操作成功');
  } catch (error) {
    console.error('批量操作菜单失败:', error);
    errorResponse(res, 500, '批量操作菜单失败', error.message);
  }
});

/** 仓库管理API*/
//获取仓库列表
app.get('/api/warehouses', async (req, res) => {
  try {
    const warehouses = await warehouseService.getAllWarehouses();
    successResponse(res, warehouses, '获取仓库列表成功');
  } catch (error) {
    errorResponse(res, 500, '获取仓库列表失败', error.message);
  }
});
// 获取仓库详情
app.get('/api/warehouses/:id', async (req, res) => {
  try {
    const warehouse = await warehouseService.getWarehouseById(req.params.id);
    if (warehouse) {
      successResponse(res, warehouse, '获取仓库详情成功');
    } else {
      errorResponse(res, 404, '仓库不存在', '未找到指定ID的仓库');
    }
  } catch (error) {
    errorResponse(res, 500, '获取仓库详情失败', error.message);
  }
});
// 创建仓库
app.post('/api/warehouses', async (req, res) => {
  try {
    const warehouse = await warehouseService.createWarehouse(req.body);
    successResponse(res, warehouse, '创建仓库成功');
  } catch (error) {
    errorResponse(res, 400, '创建仓库失败', error.message);
  }
});
// 更新仓库
app.put('/api/warehouses/:id', async (req, res) => {
  try {
    const warehouse = await warehouseService.updateWarehouse(req.params.id, req.body);
    if (warehouse) {
      successResponse(res, warehouse, '更新仓库成功');
    } else {
      errorResponse(res, 404, '仓库不存在', '未找到指定ID的仓库');
    }
  } catch (error) {
    errorResponse(res, 400, '更新仓库失败', error.message);
  }
});
// 删除仓库
app.delete('/api/warehouses/:id', async (req, res) => {
  try {
    await warehouseService.deleteWarehouse(req.params.id);
    successResponse(res, null, '删除仓库成功');
  } catch (error) {
    errorResponse(res, 500, '删除仓库失败', error.message);
  }
});

// 仓位管理API
app.get('/api/positions', async (req, res) => {
  try {
    const positions = await positionService.getAllPositions();
    successResponse(res, positions, '获取仓位列表成功');
  } catch (error) {
    errorResponse(res, 500, '获取仓位列表失败', error.message);
  }
});

app.get('/api/positions/:id', async (req, res) => {
  try {
    const position = await positionService.getPositionById(req.params.id);
    if (position) {
      successResponse(res, position, '获取仓位详情成功');
    } else {
      errorResponse(res, 404, '仓位不存在', '未找到指定ID的仓位');
    }
  } catch (error) {
    errorResponse(res, 500, '获取仓位详情失败', error.message);
  }
});

app.get('/api/positions/warehouse/:warehouseId', async (req, res) => {
  try {
    const positions = await positionService.getPositionsByWarehouseId(req.params.warehouseId);
    successResponse(res, positions, '获取仓库仓位列表成功');
  } catch (error) {
    errorResponse(res, 500, '获取仓库仓位列表失败', error.message);
  }
});

app.post('/api/positions', async (req, res) => {
  try {
    const position = await positionService.createPosition(req.body);
    successResponse(res, position, '创建仓位成功');
  } catch (error) {
    errorResponse(res, 400, '创建仓位失败', error.message);
  }
});

app.put('/api/positions/:id', async (req, res) => {
  try {
    const position = await positionService.updatePosition(req.params.id, req.body);
    if (position) {
      successResponse(res, position, '更新仓位成功');
    } else {
      errorResponse(res, 404, '仓位不存在', '未找到指定ID的仓位');
    }
  } catch (error) {
    errorResponse(res, 400, '更新仓位失败', error.message);
  }
});

app.delete('/api/positions/:id', async (req, res) => {
  try {
    await positionService.deletePosition(req.params.id);
    successResponse(res, null, '删除仓位成功');
  } catch (error) {
    errorResponse(res, 500, '删除仓位失败', error.message);
  }
});

// 启动服务器
async function startServer() {
  // 测试数据库连接
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('数据库连接失败，无法启动服务器');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('API接口文档:');
    console.log('- GET  /api/health      - 健康检查');
    console.log('- GET  /api/menus       - 获取菜单列表（树形结构）');
    console.log('- GET  /api/menus/:key  - 获取菜单详情');
    console.log('- POST /api/menus       - 创建菜单');
    console.log('- PUT  /api/menus/:key  - 更新菜单');
    console.log('- DELETE /api/menus/:key - 删除菜单');
    console.log('- POST /api/menus/batch - 批量操作菜单');
  });
}

// 启动服务器
startServer();
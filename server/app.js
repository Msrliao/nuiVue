const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const { testConnection, pool } = require('./pgsqlDemo/db');

// 初始化数据库表结构
async function initDatabase() {
  console.log('正在初始化数据库表结构...');
  const client = await pool.connect();
  try {
    // 创建员工信息表（已移除 gh 工号字段和 zt 状态字段）
    await client.query(`
      CREATE TABLE IF NOT EXISTS employee_info (
        id SERIAL PRIMARY KEY,
        xm VARCHAR(100) NOT NULL,
        xb VARCHAR(10),
        csrq DATE,
        mz VARCHAR(20),
        lxdh VARCHAR(20),
        idcard VARCHAR(18),
        yx VARCHAR(100),
        zw VARCHAR(100),
        bm VARCHAR(100),
        gzjb VARCHAR(20),
        rzrq DATE,
        syq VARCHAR(20),
        htsjzrq DATE,
        htsjzzrq DATE,
        emergencyContact VARCHAR(100),
        emergencyContactPhone VARCHAR(20),
        bz TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 删除 gh 字段的索引（如果存在）
    await client.query(`DROP INDEX IF EXISTS idx_employee_gh;`);
    
    // 创建索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_employee_xm ON employee_info(xm);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_employee_bm ON employee_info(bm);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_employee_zw ON employee_info(zw);`);

    // 删除现有的物流资料表（如果存在），以便重新创建正确的表结构
    await client.query(`DROP TABLE IF EXISTS logistics CASCADE;`);
    
    // 创建物流资料表
    await client.query(`
      CREATE TABLE IF NOT EXISTS logistics (
        id SERIAL PRIMARY KEY,
        wlmc VARCHAR(100) NOT NULL,
        wljp VARCHAR(50),
        lxr VARCHAR(50),
        lxrJp VARCHAR(50),
        lxrPhone VARCHAR(20),
        otherContact VARCHAR(100),
        contactAddress TEXT,
        lwdq VARCHAR(255),
        ffdsrq VARCHAR(255),
        dscsjl INTEGER,
        ffdsfs VARCHAR(100),
        bz TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建物流表索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_logistics_wlmc ON logistics(wlmc);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_logistics_wljp ON logistics(wljp);`);

    console.log('数据库表结构初始化完成！');
  } catch (error) {
    console.error('初始化数据库表结构时发生错误:', error);
  } finally {
    client.release();
  }
}
const menuService = require('./pgsqlDemo/menuService');
const warehouseService = require('./pgsqlDemo/warehouseService');
const positionService = require('./pgsqlDemo/positionService');
const partsService = require('./pgsqlDemo/partsService');
const customerService = require('./pgsqlDemo/customerService');
const employeeService = require('./pgsqlDemo/employeeService');
const logisticsService = require('./pgsqlDemo/logisticsService');
const DK = require('./getDKData/getData');

// 导入新的 REST API 路由（符合 API 设计最佳实践）
const employeeRoutes = require('./routes/employees');
const customerRoutes = require('./routes/customers');
const logisticsRoutes = require('./routes/logistics');
const warehouseRoutes = require('./routes/warehouses');
const positionRoutes = require('./routes/positions');
const partsRoutes = require('./routes/parts');
const menuRoutes = require('./routes/menus');


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
function successResponse(res, data, message = '操作成功', statusCode = 200) {
  res.status(statusCode).json({
    code: statusCode,
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

// 使用新的 REST API 路由（符合 API 设计最佳实践，使用 /api/v1/ 前缀）
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/logistics', logisticsRoutes);
app.use('/api/v1/warehouses', warehouseRoutes);
app.use('/api/v1/positions', positionRoutes);
app.use('/api/v1/parts', partsRoutes);
app.use('/api/v1/menus', menuRoutes);

// 保留旧版 API 路由以向后兼容（将逐步弃用）
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

/** 
 * 仓位管理API
 */
// 获取仓位列表
app.get('/api/positions', async (req, res) => {
  try {
    const positions = await positionService.getAllPositions();
    successResponse(res, positions, '获取仓位列表成功');
  } catch (error) {
    errorResponse(res, 500, '获取仓位列表失败', error.message);
  }
});
// 获取仓位详情
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
// 获取仓库仓位列表
app.get('/api/positions/warehouse/:warehouseId', async (req, res) => {
  try {
    const positions = await positionService.getPositionsByWarehouseId(req.params.warehouseId);
    successResponse(res, positions, '获取仓库仓位列表成功');
  } catch (error) {
    errorResponse(res, 500, '获取仓库仓位列表失败', error.message);
  }
});
// 创建仓位
app.post('/api/positions', async (req, res) => {
  try {
    const position = await positionService.createPosition(req.body);
    
    successResponse(res, position, '创建仓位成功');
  } catch (error) {
    errorResponse(res, 400, '创建仓位失败', error.message);
  }
});
// 更新仓位
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

/** 车型配件管理API*/
// 获取配件列表
app.get('/api/parts', async (req, res) => {
  try {
    const parts = await partsService.getAllParts();
    successResponse(res, parts, '获取配件列表成功');
  } catch (error) {
    errorResponse(res, 500, '获取配件列表失败', error.message);
  }
});

// 搜索配件
app.get('/api/parts/search', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      errorResponse(res, 400, '请求参数错误', 'keyword参数不能为空');
      return;
    }
    const parts = await partsService.searchParts(keyword);
    successResponse(res, parts, '搜索配件成功');
  } catch (error) {
    errorResponse(res, 500, '搜索配件失败', error.message);
  }
});

// 获取库存列表
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await partsService.getAllInventory();
    successResponse(res, inventory, '获取库存列表成功');
  } catch (error) {
    errorResponse(res, 500, '获取库存列表失败', error.message);
  }
});

// 根据车型和配件搜索库存
app.get('/api/inventory/search', async (req, res) => {
  try {
    const { vehicle, part } = req.query;
    if (!vehicle || !part) {
      errorResponse(res, 400, '请求参数错误', 'vehicle和part参数不能为空');
      return;
    }
    const inventory = await partsService.searchInventory(vehicle, part);
    successResponse(res, inventory, '搜索库存成功');
  } catch (error) {
    errorResponse(res, 500, '搜索库存失败', error.message);
  }
});

/** 配件基本资料API*/
// 创建配件基本资料
app.post('/api/part-info', async (req, res) => {
  try {
    const partInfo = await partsService.createPartInfo(req.body);
    
    successResponse(res, partInfo, '创建配件基本资料成功');
  } catch (error) {
    errorResponse(res, 500, '创建配件基本资料失败', error.message);
  }
});

// 获取所有配件基本资料（支持多条件搜索）
app.get('/api/part-info', async (req, res) => {
  try {
    console.log('接收到配件信息请求，参数：', req.query);
    const { bm, cx, mc, gg } = req.query;
    // 直接调用getPartInfo函数获取配件信息
    const partInfoList = await partsService.getPartInfo({ bm, cx, mc, gg });
    console.log('获取配件信息成功，结果数量：', partInfoList.length);
    // 直接返回配件信息数组，而不是包装成对象
    successResponse(res, partInfoList, '获取配件基本资料列表成功');
  } catch (error) {
    console.error('获取配件基本资料列表失败:', error);
    console.error(error.stack);
    errorResponse(res, 500, '获取配件基本资料列表失败', error.message);
  }
});

// 获取单个配件基本资料
app.get('/api/part-info/:id', async (req, res) => {
  try {
    const partInfo = await partsService.getPartInfoById(req.params.id);
    if (partInfo) {
      successResponse(res, partInfo, '获取配件基本资料成功');
    } else {
      errorResponse(res, 404, '配件基本资料不存在', '未找到指定ID的配件基本资料');
    }
  } catch (error) {
    errorResponse(res, 500, '获取配件基本资料失败', error.message);
  }
});

// 更新配件基本资料
app.put('/api/part-info/:id', async (req, res) => {
  try {
    const partInfo = await partsService.updatePartInfo(req.params.id, req.body);
    if (partInfo) {
      successResponse(res, partInfo, '更新配件基本资料成功');
    } else {
      errorResponse(res, 404, '配件基本资料不存在', '未找到指定ID的配件基本资料');
    }
  } catch (error) {
    errorResponse(res, 500, '更新配件基本资料失败', error.message);
  }
});

// 删除配件基本资料
app.delete('/api/part-info/:id', async (req, res) => {
  try {
    const partInfo = await partsService.deletePartInfo(req.params.id);
    if (partInfo) {
      successResponse(res, null, '删除配件基本资料成功');
    } else {
      errorResponse(res, 404, '配件基本资料不存在', '未找到指定ID的配件基本资料');
    }
  } catch (error) {
    errorResponse(res, 500, '删除配件基本资料失败', error.message);
  }
});
// 获取dk数据
const { getDKdata } = require('./getDKData/getData');
app.get('/api/DK-info', async (req, res) => {
  try {
    console.log('接收到DK数据请求，参数：', req.query);
    const { bm, cx, mc } = req.query;
    if (!bm && !cx && !mc) {
      
      successResponse(res, [], '无请求参数，不进行请求');
      return;
    }
    // 调用大库数据获取函数，参数映射：
    // name: mc (配件名称), bianma: bm (配件编码), models: cx (车型), brand: '' (品牌暂时为空)
    const dkData = await getDKdata(mc || '', bm || '', cx || '', '');
    
    console.log('获取DK数据成功，结果：', dkData);
    
    // 检查dkData是否为空或格式不正确
    if (!dkData) {
      console.error('获取DK数据失败，返回结果为空');
      errorResponse(res, 200, '获取dk资料失败', '返回结果为空');
      return;
    }
    
    successResponse(res, dkData.rows, '获取dk资料成功');
  } catch (error) {
    console.error('获取dk资料失败:', error);
    // 打印详细的错误堆栈信息
    console.error(error.stack);
    errorResponse(res, 500, '获取dk资料失败', error.message);
  }
});

/** 客户资料API*/
// 创建客户资料
app.post('/api/customers', async (req, res) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    successResponse(res, customer, '创建客户资料成功', 201);
  } catch (error) {
    console.error('创建客户资料失败:', error);
    errorResponse(res, 500, '创建客户资料失败', error.message);
  }
});

// 获取客户资料列表
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await customerService.getCustomersByParams(req.query);
    successResponse(res, customers, '获取客户资料列表成功');
  } catch (error) {
    console.error('获取客户资料列表失败:', error);
    errorResponse(res, 500, '获取客户资料列表失败', error.message);
  }
});

// 获取客户详情
app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    if (customer) {
      successResponse(res, customer, '获取客户详情成功');
    } else {
      errorResponse(res, 404, '客户不存在', '未找到指定ID的客户');
    }
  } catch (error) {
    console.error('获取客户详情失败:', error);
    errorResponse(res, 500, '获取客户详情失败', error.message);
  }
});

// 更新客户资料
app.put('/api/customers/:id', async (req, res) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    if (customer) {
      successResponse(res, customer, '更新客户资料成功');
    } else {
      errorResponse(res, 404, '客户不存在', '未找到指定ID的客户');
    }
  } catch (error) {
    console.error('更新客户资料失败:', error);
    errorResponse(res, 500, '更新客户资料失败', error.message);
  }
});

// 删除客户资料
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const customer = await customerService.deleteCustomer(req.params.id);
    if (customer) {
      res.status(204).send();
    } else {
      errorResponse(res, 404, '客户不存在', '未找到指定ID的客户');
    }
  } catch (error) {
    console.error('删除客户资料失败:', error);
    errorResponse(res, 500, '删除客户资料失败', error.message);
  }
});

// 搜索客户资料
app.get('/api/customers/search', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      errorResponse(res, 400, '请求参数错误', 'keyword参数不能为空');
      return;
    }
    const customers = await customerService.searchCustomers(keyword);
    successResponse(res, customers, '搜索客户资料成功');
  } catch (error) {
    console.error('搜索客户资料失败:', error);
    errorResponse(res, 500, '搜索客户资料失败', error.message);
  }
});

/** 员工资料API*/
// 创建员工资料
app.post('/api/employees', async (req, res) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    successResponse(res, employee, '创建员工资料成功', 201);
  } catch (error) {
    console.error('创建员工资料失败:', error);
    errorResponse(res, 500, '创建员工资料失败', error.message);
  }
});

// 获取员工资料列表
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await employeeService.getEmployeesByParams(req.query);
    successResponse(res, employees, '获取员工资料列表成功');
  } catch (error) {
    console.error('获取员工资料列表失败:', error);
    errorResponse(res, 500, '获取员工资料列表失败', error.message);
  }
});

// 获取员工详情
app.get('/api/employees/:id', async (req, res) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (employee) {
      successResponse(res, employee, '获取员工详情成功');
    } else {
      errorResponse(res, 404, '员工不存在', '未找到指定ID的员工');
    }
  } catch (error) {
    console.error('获取员工详情失败:', error);
    errorResponse(res, 500, '获取员工详情失败', error.message);
  }
});

// 更新员工资料
app.put('/api/employees/:id', async (req, res) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    if (employee) {
      successResponse(res, employee, '更新员工资料成功');
    } else {
      errorResponse(res, 404, '员工不存在', '未找到指定ID的员工');
    }
  } catch (error) {
    console.error('更新员工资料失败:', error);
    errorResponse(res, 500, '更新员工资料失败', error.message);
  }
});

// 删除员工资料
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const employee = await employeeService.deleteEmployee(req.params.id);
    if (employee) {
      res.status(204).send();
    } else {
      errorResponse(res, 404, '员工不存在', '未找到指定ID的员工');
    }
  } catch (error) {
    console.error('删除员工资料失败:', error);
    errorResponse(res, 500, '删除员工资料失败', error.message);
  }
});

// 搜索员工资料
app.get('/api/employees/search', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      errorResponse(res, 400, '请求参数错误', 'keyword参数不能为空');
      return;
    }
    console.log('员工资料',keyword)
    const employees = await employeeService.searchEmployees(keyword);
    successResponse(res, employees, '搜索员工资料成功');
  } catch (error) {
    console.error('搜索员工资料失败:', error);
    errorResponse(res, 500, '搜索员工资料失败', error.message);
  }
});

// 物流管理API
app.post('/api/logistics', async (req, res) => {
  try {
    const logistics = await logisticsService.createLogistics(req.body);
    successResponse(res, logistics, '创建物流资料成功', 201);
  } catch (error) {
    console.error('创建物流失败:', error);
    errorResponse(res, 400, '创建物流失败', error.message);
  }
});

app.get('/api/logistics', async (req, res) => {
  try {
    const logistics = await logisticsService.getLogisticsByParams(req.query);
    successResponse(res, logistics, '获取物流资料列表成功');
  } catch (error) {
    console.error('获取物流列表失败:', error);
    errorResponse(res, 500, '获取物流列表失败', error.message);
  }
});

app.get('/api/logistics/:id', async (req, res) => {
  try {
    const logistics = await logisticsService.getLogisticsById(req.params.id);
    if (logistics) {
      successResponse(res, logistics, '获取物流详情成功');
    } else {
      errorResponse(res, 404, '物流不存在', '未找到指定ID的物流');
    }
  } catch (error) {
    console.error('获取物流详情失败:', error);
    errorResponse(res, 500, '获取物流详情失败', error.message);
  }
});

app.put('/api/logistics/:id', async (req, res) => {
  try {
    const logistics = await logisticsService.updateLogistics(req.params.id, req.body);
    if (logistics) {
      successResponse(res, logistics, '更新物流资料成功');
    } else {
      errorResponse(res, 404, '物流不存在', '未找到指定ID的物流');
    }
  } catch (error) {
    console.error('更新物流失败:', error);
    errorResponse(res, 400, '更新物流失败', error.message);
  }
});

app.delete('/api/logistics/:id', async (req, res) => {
  try {
    const logistics = await logisticsService.deleteLogistics(req.params.id);
    if (logistics) {
      successResponse(res, logistics, '删除物流资料成功');
    } else {
      errorResponse(res, 404, '物流不存在', '未找到指定ID的物流');
    }
  } catch (error) {
    console.error('删除物流失败:', error);
    errorResponse(res, 500, '删除物流失败', error.message);
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
  
  // 初始化数据库表结构
  await initDatabase();

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
    console.log('- GET  /api/vehicle-models       - 获取车型列表');
    console.log('- GET  /api/vehicle-models/search - 搜索车型');
    console.log('- GET  /api/parts       - 获取配件列表');
    console.log('- GET  /api/parts/search - 搜索配件');
    console.log('- GET  /api/inventory       - 获取库存列表');
    console.log('- GET  /api/inventory/search - 根据车型和配件搜索库存');
    console.log('- POST /api/part-info       - 创建配件基本资料');
    console.log('- GET  /api/part-info       - 获取所有配件基本资料');
    console.log('- GET  /api/part-info/:id   - 获取单个配件基本资料');
    console.log('- PUT  /api/part-info/:id   - 更新配件基本资料');
    console.log('- DELETE /api/part-info/:id - 删除配件基本资料');
    console.log('- GET  /api/part-info/search - 搜索配件基本资料');
    console.log('- POST /api/customers       - 创建客户资料');
    console.log('- GET  /api/customers       - 获取客户资料列表');
    console.log('- GET  /api/customers/:id   - 获取客户详情');
    console.log('- PUT  /api/customers/:id   - 更新客户资料');
    console.log('- DELETE /api/customers/:id - 删除客户资料');
    console.log('- GET  /api/customers/search - 搜索客户资料');
    console.log('- POST /api/employees       - 创建员工资料');
    console.log('- GET  /api/employees       - 获取员工资料列表');
    console.log('- GET  /api/employees/:id   - 获取员工详情');
    console.log('- PUT  /api/employees/:id   - 更新员工资料');
    console.log('- DELETE /api/employees/:id - 删除员工资料');
    console.log('- GET  /api/employees/search - 搜索员工资料');
    console.log('- POST /api/logistics       - 创建物流资料');
    console.log('- GET  /api/logistics       - 获取物流资料列表');
    console.log('- GET  /api/logistics/:id   - 获取物流详情');
    console.log('- PUT  /api/logistics/:id   - 更新物流资料');
    console.log('- DELETE /api/logistics/:id - 删除物流资料');
  });
}

// 启动服务器
startServer();
/**
 * 菜单 API 路由 - 符合 REST API 设计最佳实践
 */

const express = require('express');
const router = express.Router();
const menuService = require('../pgsqlDemo/menuService');

// ========== 标准化响应格式 ==========

function successResponse(res, data, statusCode = 200) {
  res.status(statusCode).json({ data });
}

function errorResponse(res, type, title, status, detail, instance, errors = []) {
  const problem = {
    type: type || `https://api.example.com/errors/${status}`,
    title,
    status,
    detail,
    instance,
    timestamp: new Date().toISOString()
  };
  
  if (errors.length > 0) {
    problem.errors = errors;
  }
  
  res.status(status).json(problem);
}

// ========== 输入验证中间件 ==========

function validateMenuData(req, res, next) {
  const { key, label } = req.body;
  const errors = [];
  
  if (!key || key.trim() === '') {
    errors.push({ field: 'key', message: '菜单key不能为空' });
  }
  
  if (!label || label.trim() === '') {
    errors.push({ field: 'label', message: '菜单label不能为空' });
  }
  
  if (errors.length > 0) {
    return errorResponse(
      res,
      'https://api.example.com/errors/validation-error',
      'Validation Error',
      400,
      '请求参数验证失败',
      req.originalUrl,
      errors
    );
  }
  
  next();
}

// ========== API 路由 ==========

/**
 * GET /api/v1/menus
 * 
 * 获取所有菜单（树形结构）
 */
router.get('/', async (req, res) => {
  try {
    const menuTree = await menuService.getAllMenus();
    successResponse(res, menuTree);
  } catch (error) {
    console.error('获取菜单列表失败:', error);
    errorResponse(
      res,
      'https://api.example.com/errors/internal-error',
      'Internal Server Error',
      500,
      '服务器内部错误',
      req.originalUrl
    );
  }
});

/**
 * GET /api/v1/menus/:key
 * 
 * 获取单个菜单详情
 */
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const menu = await menuService.getMenuByKey(key);
    
    if (!menu) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 key 为 ${key} 的菜单`,
        req.originalUrl
      );
    }
    
    successResponse(res, menu);
  } catch (error) {
    console.error('获取菜单详情失败:', error);
    errorResponse(
      res,
      'https://api.example.com/errors/internal-error',
      'Internal Server Error',
      500,
      '服务器内部错误',
      req.originalUrl
    );
  }
});

/**
 * POST /api/v1/menus
 */
router.post('/', validateMenuData, async (req, res) => {
  try {
    const { key, label, type = 'menu', icon, parent_key, order_index = 0 } = req.body;
    
    const menu = await menuService.createMenu({ key, label, type, icon, parent_key, order_index });
    
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const location = `${baseUrl}/${menu.key}`;
    
    res.setHeader('Location', location);
    successResponse(res, menu, 201);
  } catch (error) {
    console.error('创建菜单失败:', error);
    
    if (error.code === '23505') {
      return errorResponse(
        res,
        'https://api.example.com/errors/conflict',
        'Conflict',
        409,
        '菜单key已存在',
        req.originalUrl
      );
    }
    
    errorResponse(
      res,
      'https://api.example.com/errors/internal-error',
      'Internal Server Error',
      500,
      '服务器内部错误',
      req.originalUrl
    );
  }
});

/**
 * PUT /api/v1/menus/:key
 */
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { label, type, icon, parent_key, order_index } = req.body;
    
    const existing = await menuService.getMenuByKey(key);
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 key 为 ${key} 的菜单`,
        req.originalUrl
      );
    }
    
    const menu = await menuService.updateMenu(key, { label, type, icon, parent_key, order_index });
    successResponse(res, menu);
  } catch (error) {
    console.error('更新菜单失败:', error);
    errorResponse(
      res,
      'https://api.example.com/errors/internal-error',
      'Internal Server Error',
      500,
      '服务器内部错误',
      req.originalUrl
    );
  }
});

/**
 * DELETE /api/v1/menus/:key
 */
router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const existing = await menuService.getMenuByKey(key);
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 key 为 ${key} 的菜单`,
        req.originalUrl
      );
    }
    
    await menuService.deleteMenu(key);
    res.status(204).send();
  } catch (error) {
    console.error('删除菜单失败:', error);
    errorResponse(
      res,
      'https://api.example.com/errors/internal-error',
      'Internal Server Error',
      500,
      '服务器内部错误',
      req.originalUrl
    );
  }
});

/**
 * POST /api/v1/menus/batch
 * 
 * 批量操作菜单
 */
router.post('/batch', async (req, res) => {
  try {
    const { operation, items } = req.body;
    
    if (!operation || !items || !Array.isArray(items)) {
      return errorResponse(
        res,
        'https://api.example.com/errors/validation-error',
        'Validation Error',
        400,
        'operation 和 items 参数不能为空',
        req.originalUrl
      );
    }
    
    await menuService.batchOperation(operation, items);
    successResponse(res, { success: true });
  } catch (error) {
    console.error('批量操作菜单失败:', error);
    errorResponse(
      res,
      'https://api.example.com/errors/internal-error',
      'Internal Server Error',
      500,
      '服务器内部错误',
      req.originalUrl
    );
  }
});

module.exports = router;

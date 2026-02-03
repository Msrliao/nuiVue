/**
 * 仓库 API 路由 - 符合 REST API 设计最佳实践
 */

const express = require('express');
const router = express.Router();
const warehouseService = require('../pgsqlDemo/warehouseService');

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

function validateWarehouseData(req, res, next) {
  const { ckmc, ckjp } = req.body;
  const errors = [];
  
  if (!ckmc || ckmc.trim() === '') {
    errors.push({ field: 'ckmc', message: '仓库名称不能为空' });
  }
  
  if (!ckjp || ckjp.trim() === '') {
    errors.push({ field: 'ckjp', message: '仓库简拼不能为空' });
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

function validateId(req, res, next) {
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id <= 0) {
    return errorResponse(
      res,
      'https://api.example.com/errors/invalid-id',
      'Invalid ID',
      400,
      'ID 必须是正整数',
      req.originalUrl
    );
  }
  
  req.params.id = id;
  next();
}

// ========== API 路由 ==========

/**
 * GET /api/v1/warehouses
 */
router.get('/', async (req, res) => {
  try {
    const warehouses = await warehouseService.getAllWarehouses();
    successResponse(res, warehouses);
  } catch (error) {
    console.error('获取仓库列表失败:', error);
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
 * GET /api/v1/warehouses/:id
 */
router.get('/:id', validateId, async (req, res) => {
  try {
    const warehouse = await warehouseService.getWarehouseById(req.params.id);
    
    if (!warehouse) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的仓库`,
        req.originalUrl
      );
    }
    
    successResponse(res, warehouse);
  } catch (error) {
    console.error('获取仓库详情失败:', error);
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
 * POST /api/v1/warehouses
 */
router.post('/', validateWarehouseData, async (req, res) => {
  try {
    const warehouse = await warehouseService.createWarehouse(req.body);
    
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const location = `${baseUrl}/${warehouse.id}`;
    
    res.setHeader('Location', location);
    successResponse(res, warehouse, 201);
  } catch (error) {
    console.error('创建仓库失败:', error);
    
    if (error.code === '23505') {
      return errorResponse(
        res,
        'https://api.example.com/errors/conflict',
        'Conflict',
        409,
        '仓库已存在',
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
 * PUT /api/v1/warehouses/:id
 */
router.put('/:id', validateId, validateWarehouseData, async (req, res) => {
  try {
    const existing = await warehouseService.getWarehouseById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的仓库`,
        req.originalUrl
      );
    }
    
    const warehouse = await warehouseService.updateWarehouse(req.params.id, req.body);
    successResponse(res, warehouse);
  } catch (error) {
    console.error('更新仓库失败:', error);
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
 * PATCH /api/v1/warehouses/:id
 */
router.patch('/:id', validateId, async (req, res) => {
  try {
    const existing = await warehouseService.getWarehouseById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的仓库`,
        req.originalUrl
      );
    }
    
    const updated = await warehouseService.updateWarehouse(req.params.id, {
      ...existing,
      ...req.body
    });
    
    successResponse(res, updated);
  } catch (error) {
    console.error('部分更新仓库失败:', error);
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
 * DELETE /api/v1/warehouses/:id
 */
router.delete('/:id', validateId, async (req, res) => {
  try {
    const existing = await warehouseService.getWarehouseById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的仓库`,
        req.originalUrl
      );
    }
    
    await warehouseService.deleteWarehouse(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('删除仓库失败:', error);
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

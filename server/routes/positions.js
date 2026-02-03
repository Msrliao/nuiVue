/**
 * 仓位 API 路由 - 符合 REST API 设计最佳实践
 */

const express = require('express');
const router = express.Router();
const positionService = require('../pgsqlDemo/positionService');

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

function validatePositionData(req, res, next) {
  console.log('[DEBUG] validatePositionData called');
  console.log('[DEBUG] req.body:', req.body);
  
  // 支持前端字段名 position_name 和 warehouse_id，以及旧字段名 cwmc 和 ckid
  const positionName = req.body.position_name || req.body.cwmc;
  const warehouseId = req.body.warehouse_id || req.body.ckid;
  
  console.log('[DEBUG] positionName:', positionName);
  console.log('[DEBUG] warehouseId:', warehouseId);
  
  const errors = [];
  
  if (!positionName || positionName.trim() === '') {
    errors.push({ field: 'position_name', message: '仓位名称不能为空' });
  }
  
  if (!warehouseId) {
    errors.push({ field: 'warehouse_id', message: '仓库ID不能为空' });
  }
  
  if (errors.length > 0) {
    console.log('[DEBUG] Validation errors:', errors);
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
 * GET /api/v1/positions
 */
router.get('/', async (req, res) => {
  try {
    const positions = await positionService.getAllPositions();
    successResponse(res, positions);
  } catch (error) {
    console.error('获取仓位列表失败:', error);
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
 * GET /api/v1/positions/warehouse/:id
 * 注意：这个路由必须放在 '/:id' 路由之前，否则会被误匹配
 */
router.get('/warehouse/:id', (req, res, next) => {
  console.log('[DEBUG] Warehouse route hit, params:', req.params, 'url:', req.url);
  next();
}, validateId, async (req, res) => {
  console.log('[DEBUG] Warehouse route passed validation, id:', req.params.id);
  try {
    const positions = await positionService.getPositionsByWarehouseId(req.params.id);
    console.log('[DEBUG] Positions found:', positions.length);
    successResponse(res, positions);
  } catch (error) {
    console.error('获取仓库仓位列表失败:', error);
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
 * GET /api/v1/positions/:id
 */
router.get('/:id', (req, res, next) => {
  console.log('[DEBUG] Generic ID route hit, params:', req.params, 'url:', req.url);
  next();
}, validateId, async (req, res) => {
  console.log('[DEBUG] Generic ID route passed validation, id:', req.params.id);
  try {
    const position = await positionService.getPositionById(req.params.id);
    
    if (!position) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的仓位`,
        req.originalUrl
      );
    }
    
    successResponse(res, position);
  } catch (error) {
    console.error('获取仓位详情失败:', error);
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
 * POST /api/v1/positions
 */
router.post('/', validatePositionData, async (req, res) => {
  try {
    const position = await positionService.createPosition(req.body);
    
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const location = `${baseUrl}/${position.id}`;
    
    res.setHeader('Location', location);
    successResponse(res, position, 201);
  } catch (error) {
    console.error('创建仓位失败:', error);
    
    if (error.code === '23505') {
      return errorResponse(
        res,
        'https://api.example.com/errors/conflict',
        'Conflict',
        409,
        '仓位已存在',
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
 * PUT /api/v1/positions/:id
 */
router.put('/:id', validateId, validatePositionData, async (req, res) => {
  try {
    const existing = await positionService.getPositionById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的仓位`,
        req.originalUrl
      );
    }
    
    const position = await positionService.updatePosition(req.params.id, req.body);
    successResponse(res, position);
  } catch (error) {
    console.error('更新仓位失败:', error);
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
 * PATCH /api/v1/positions/:id
 */
router.patch('/:id', validateId, async (req, res) => {
  try {
    const existing = await positionService.getPositionById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的仓位`,
        req.originalUrl
      );
    }
    
    const updated = await positionService.updatePosition(req.params.id, {
      ...existing,
      ...req.body
    });
    
    successResponse(res, updated);
  } catch (error) {
    console.error('部分更新仓位失败:', error);
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
 * DELETE /api/v1/positions/:id
 */
router.delete('/:id', validateId, async (req, res) => {
  try {
    const existing = await positionService.getPositionById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的仓位`,
        req.originalUrl
      );
    }
    
    await positionService.deletePosition(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('删除仓位失败:', error);
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

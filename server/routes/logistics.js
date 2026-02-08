/**
 * 物流 API 路由 - 符合 REST API 设计最佳实践
 */

const express = require('express');
const router = express.Router();
const logisticsService = require('../pgsqlDemo/logisticsService');

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

function validateLogisticsData(req, res, next) {
  const { wlmc, lxr, lxrPhone } = req.body;
  const errors = [];
  
  if (!wlmc || wlmc.trim() === '') {
    errors.push({ field: 'wlmc', message: '物流名称不能为空' });
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
 * GET /api/v1/logistics
 * 获取物流资料列表
 */
router.get('/', async (req, res) => {
  try {
    const logistics = await logisticsService.getLogisticsByParams(req.query);
    successResponse(res, logistics);
  } catch (error) {
    console.error('获取物流列表失败:', error);
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
 * GET /api/v1/logistics/:id
 * 
 */
router.get('/:id', validateId, async (req, res) => {
  try {
    const logistics = await logisticsService.getLogisticsById(req.params.id);
    
    if (!logistics) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的物流`,
        req.originalUrl
      );
    }
    
    successResponse(res, logistics);
  } catch (error) {
    console.error('获取物流详情失败:', error);
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
 * POST /api/v1/logistics
 */
router.post('/', validateLogisticsData, async (req, res) => {
  try {
    const logistics = await logisticsService.createLogistics(req.body);
    
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const location = `${baseUrl}/${logistics.id}`;
    
    res.setHeader('Location', location);
    successResponse(res, logistics, 201);
  } catch (error) {
    console.error('创建物流失败:', error);
    
    if (error.code === '23505') {
      return errorResponse(
        res,
        'https://api.example.com/errors/conflict',
        'Conflict',
        409,
        '物流已存在',
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
 * PUT /api/v1/logistics/:id
 */
router.put('/:id', validateId, validateLogisticsData, async (req, res) => {
  try {
    const existing = await logisticsService.getLogisticsById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的物流`,
        req.originalUrl
      );
    }
    
    const logistics = await logisticsService.updateLogistics(req.params.id, req.body);
    successResponse(res, logistics);
  } catch (error) {
    console.error('更新物流失败:', error);
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
 * PATCH /api/v1/logistics/:id
 */
router.patch('/:id', validateId, async (req, res) => {
  try {
    const existing = await logisticsService.getLogisticsById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的物流`,
        req.originalUrl
      );
    }
    
    const updated = await logisticsService.updateLogistics(req.params.id, {
      ...existing,
      ...req.body
    });
    
    successResponse(res, updated);
  } catch (error) {
    console.error('部分更新物流失败:', error);
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
 * DELETE /api/v1/logistics/:id
 */
router.delete('/:id', validateId, async (req, res) => {
  try {
    const existing = await logisticsService.getLogisticsById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的物流`,
        req.originalUrl
      );
    }
    
    await logisticsService.deleteLogistics(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('删除物流失败:', error);
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

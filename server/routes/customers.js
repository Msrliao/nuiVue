/**
 * 客户 API 路由 - 符合 REST API 设计最佳实践
 */

const express = require('express');
const router = express.Router();
const customerService = require('../pgsqlDemo/customerService');

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

function validateCustomerData(req, res, next) {
  const { khjc, lxr, lxdh } = req.body;
  const errors = [];
  
  if (!khjc || khjc.trim() === '') {
    errors.push({ field: 'khjc', message: '客户简称不能为空' });
  }
  
  if (!lxr || lxr.trim() === '') {
    errors.push({ field: 'lxr', message: '联系人不能为空' });
  }
  
  if (!lxdh || lxdh.trim() === '') {
    errors.push({ field: 'lxdh', message: '联系电话不能为空' });
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
 * GET /api/v1/customers
 * 
 * 获取所有客户列表（支持过滤参数）
 */
router.get('/', async (req, res) => {
  try {
    const customers = await customerService.getCustomersByParams(req.query);
    successResponse(res, customers);
  } catch (error) {
    console.error('获取客户列表失败:', error);
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
 * GET /api/v1/customers/:id
 */
router.get('/:id', validateId, async (req, res) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    
    if (!customer) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的客户`,
        req.originalUrl
      );
    }
    
    successResponse(res, customer);
  } catch (error) {
    console.error('获取客户详情失败:', error);
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
 * POST /api/v1/customers
 */
router.post('/', validateCustomerData, async (req, res) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const location = `${baseUrl}/${customer.id}`;
    
    res.setHeader('Location', location);
    successResponse(res, customer, 201);
  } catch (error) {
    console.error('创建客户失败:', error);
    
    if (error.code === '23505') {
      return errorResponse(
        res,
        'https://api.example.com/errors/conflict',
        'Conflict',
        409,
        '客户已存在',
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
 * PUT /api/v1/customers/:id
 */
router.put('/:id', validateId, validateCustomerData, async (req, res) => {
  try {
    const existing = await customerService.getCustomerById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的客户`,
        req.originalUrl
      );
    }
    
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    successResponse(res, customer);
  } catch (error) {
    console.error('更新客户失败:', error);
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
 * PATCH /api/v1/customers/:id
 */
router.patch('/:id', validateId, async (req, res) => {
  try {
    const existing = await customerService.getCustomerById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的客户`,
        req.originalUrl
      );
    }
    
    const updated = await customerService.updateCustomer(req.params.id, {
      ...existing,
      ...req.body
    });
    
    successResponse(res, updated);
  } catch (error) {
    console.error('部分更新客户失败:', error);
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
 * DELETE /api/v1/customers/:id
 */
router.delete('/:id', validateId, async (req, res) => {
  try {
    const existing = await customerService.getCustomerById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的客户`,
        req.originalUrl
      );
    }
    
    await customerService.deleteCustomer(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('删除客户失败:', error);
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
 * GET /api/v1/customers/search
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return errorResponse(
        res,
        'https://api.example.com/errors/validation-error',
        'Validation Error',
        400,
        '搜索关键词不能为空',
        req.originalUrl
      );
    }
    
    const results = await customerService.searchCustomers(q);
    successResponse(res, results);
  } catch (error) {
    console.error('搜索客户失败:', error);
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

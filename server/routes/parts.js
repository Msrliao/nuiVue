/**
 * 配件 API 路由 - 符合 REST API 设计最佳实践
 */

const express = require('express');
const router = express.Router();
const partsService = require('../pgsqlDemo/partsService');

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

function validatePartInfoData(req, res, next) {
  const { bm, mc } = req.body;
  const errors = [];
  
  if (!bm || bm.trim() === '') {
    errors.push({ field: 'bm', message: '配件编码不能为空' });
  }
  
  if (!mc || mc.trim() === '') {
    errors.push({ field: 'mc', message: '配件名称不能为空' });
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
 * GET /api/v1/parts
 * 
 * 获取配件列表（支持过滤参数 bm, cx, mc, gg）
 */
router.get('/', async (req, res) => {
  try {
    const { bm, cx, mc, gg } = req.query;
    const parts = await partsService.getPartInfo({ bm, cx, mc, gg });
    successResponse(res, parts);
  } catch (error) {
    console.error('获取配件列表失败:', error);
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
 * GET /api/v1/parts/:id
 */
router.get('/:id', validateId, async (req, res) => {
  try {
    const part = await partsService.getPartInfoById(req.params.id);
    
    if (!part) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的配件`,
        req.originalUrl
      );
    }
    
    successResponse(res, part);
  } catch (error) {
    console.error('获取配件详情失败:', error);
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
 * POST /api/v1/parts
 */
router.post('/', validatePartInfoData, async (req, res) => {
  try {
    const part = await partsService.createPartInfo(req.body);
    
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const location = `${baseUrl}/${part.id}`;
    
    res.setHeader('Location', location);
    successResponse(res, part, 201);
  } catch (error) {
    console.error('创建配件失败:', error);
    
    if (error.code === '23505') {
      return errorResponse(
        res,
        'https://api.example.com/errors/conflict',
        'Conflict',
        409,
        '配件已存在',
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
 * PUT /api/v1/parts/:id
 */
router.put('/:id', validateId, validatePartInfoData, async (req, res) => {
  try {
    const existing = await partsService.getPartInfoById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的配件`,
        req.originalUrl
      );
    }
    
    const part = await partsService.updatePartInfo(req.params.id, req.body);
    successResponse(res, part);
  } catch (error) {
    console.error('更新配件失败:', error);
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
 * PATCH /api/v1/parts/:id
 */
router.patch('/:id', validateId, async (req, res) => {
  try {
    const existing = await partsService.getPartInfoById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的配件`,
        req.originalUrl
      );
    }
    
    const updated = await partsService.updatePartInfo(req.params.id, {
      ...existing,
      ...req.body
    });
    
    successResponse(res, updated);
  } catch (error) {
    console.error('部分更新配件失败:', error);
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
 * DELETE /api/v1/parts/:id
 */
router.delete('/:id', validateId, async (req, res) => {
  try {
    const existing = await partsService.getPartInfoById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的配件`,
        req.originalUrl
      );
    }
    
    await partsService.deletePartInfo(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('删除配件失败:', error);
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
 * GET /api/v1/parts/search
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
    
    const results = await partsService.searchParts(q);
    successResponse(res, results);
  } catch (error) {
    console.error('搜索配件失败:', error);
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
 * GET /api/v1/inventory
 * 
 * 获取库存列表
 */
router.get('/inventory/all', async (req, res) => {
  try {
    const inventory = await partsService.getAllInventory();
    successResponse(res, inventory);
  } catch (error) {
    console.error('获取库存列表失败:', error);
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
 * GET /api/v1/inventory/search
 * 
 * 根据车型和配件搜索库存
 */
router.get('/inventory/search', async (req, res) => {
  try {
    const { vehicle, part } = req.query;
    
    if (!vehicle || !part) {
      return errorResponse(
        res,
        'https://api.example.com/errors/validation-error',
        'Validation Error',
        400,
        'vehicle 和 part 参数不能为空',
        req.originalUrl
      );
    }
    
    const inventory = await partsService.searchInventory(vehicle, part);
    successResponse(res, inventory);
  } catch (error) {
    console.error('搜索库存失败:', error);
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

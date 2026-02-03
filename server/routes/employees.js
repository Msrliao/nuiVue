/**
 * 改进的员工 API 路由 - 符合 REST API 设计最佳实践
 * 
 * 改进点：
 * 1. 统一的响应格式
 * 2. 正确的 HTTP 状态码
 * 3. 标准化错误格式 (RFC 7807 Problem Details)
 * 4. API 版本控制 (/api/v1/)
 * 5. 输入验证
 */

const express = require('express');
const router = express.Router();
const employeeService = require('../pgsqlDemo/employeeService');

// ========== 标准化响应格式 ==========

/**
 * 成功响应格式（简化版，无分页）
 * {
 *   "data": { ... }  // 实际数据
 * }
 */
function successResponse(res, data, statusCode = 200) {
  res.status(statusCode).json({ data });
}

/**
 * 错误响应格式 (遵循 RFC 7807 Problem Details)
 * {
 *   "type": "https://api.example.com/errors/validation-error",
 *   "title": "Validation Error",
 *   "status": 400,
 *   "detail": "请求参数验证失败",
 *   "instance": "/api/v1/employees",
 *   "errors": [
 *     { "field": "xm", "message": "姓名不能为空" }
 *   ]
 * }
 */
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

/**
 * 验证员工数据
 */
function validateEmployeeData(req, res, next) {
  const { xm, lxdh } = req.body;
  const errors = [];
  
  if (!xm || xm.trim() === '') {
    errors.push({ field: 'xm', message: '姓名不能为空' });
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

/**
 * 验证 ID 参数
 */
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
  
  req.params.id = id; // 转换为数字
  next();
}

// ========== API 路由 ==========

/**
 * GET /api/v1/employees
 * 
 * 获取所有员工列表（支持过滤参数）
 * 
 * 查询参数：
 * - filter[xm]: 按姓名过滤
 * - filter[bm]: 按部门过滤
 * - filter[zw]: 按职位过滤
 * 
 * 示例：
 * GET /api/v1/employees?filter[bm]=技术部&filter[zw]=工程师
 */
router.get('/', async (req, res) => {
  try {
    // 解析过滤参数 (支持 filter[xm] 和 filter.xm 两种格式)
    const filters = {};
    if (req.query.filter) {
      const { xm, lxdh, bm, zw } = req.query.filter;
      if (xm) filters.xm = xm;
      if (lxdh) filters.lxdh = lxdh;
      if (bm) filters.bm = bm;
      if (zw) filters.zw = zw;
    }
    // 也支持平铺参数格式 (xm=xxx&bm=yyy)
    if (req.query.xm && !filters.xm) filters.xm = req.query.xm;
    if (req.query.lxdh && !filters.lxdh) filters.lxdh = req.query.lxdh;
    if (req.query.bm && !filters.bm) filters.bm = req.query.bm;
    if (req.query.zw && !filters.zw) filters.zw = req.query.zw;
    
    // 获取数据
    const employees = await employeeService.getEmployeesByParams(filters);
    
    successResponse(res, employees);
  } catch (error) {
    console.error('获取员工列表失败:', error);
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
 * GET /api/v1/employees/:id
 * 
 * 获取单个员工详情
 */
router.get('/:id', validateId, async (req, res) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    
    if (!employee) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的员工`,
        req.originalUrl
      );
    }
    
    successResponse(res, employee);
  } catch (error) {
    console.error('获取员工详情失败:', error);
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
 * POST /api/v1/employees
 * 
 * 创建新员工
 * 
 * 请求体：
 * {
 *   "xm": "张三",
 *   "xb": "男",
 *   "lxdh": "13800138000",
 *   ...
 * }
 */
router.post('/', validateEmployeeData, async (req, res) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    
    // 201 Created - 资源创建成功
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const location = `${baseUrl}/${employee.id}`;
    
    res.setHeader('Location', location);
    successResponse(res, employee, 201);
  } catch (error) {
    console.error('创建员工失败:', error);
    
    // 判断是否为重复键错误
    if (error.code === '23505') { // PostgreSQL 唯一键冲突
      return errorResponse(
        res,
        'https://api.example.com/errors/conflict',
        'Conflict',
        409,
        '员工已存在（可能工号或身份证号重复）',
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
 * PUT /api/v1/employees/:id
 * 
 * 完整更新员工信息（替换整个资源）
 */
router.put('/:id', validateId, validateEmployeeData, async (req, res) => {
  try {
    // 先检查员工是否存在
    const existing = await employeeService.getEmployeeById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的员工`,
        req.originalUrl
      );
    }
    
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    
    successResponse(res, employee);
  } catch (error) {
    console.error('更新员工失败:', error);
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
 * PATCH /api/v1/employees/:id
 * 
 * 部分更新员工信息（仅更新提供的字段）
 */
router.patch('/:id', validateId, async (req, res) => {
  try {
    const existing = await employeeService.getEmployeeById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的员工`,
        req.originalUrl
      );
    }
    
    // 合并现有数据和新数据
    const updated = await employeeService.updateEmployee(req.params.id, {
      ...existing,
      ...req.body
    });
    
    successResponse(res, updated);
  } catch (error) {
    console.error('部分更新员工失败:', error);
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
 * DELETE /api/v1/employees/:id
 * 
 * 删除员工
 */
router.delete('/:id', validateId, async (req, res) => {
  try {
    const existing = await employeeService.getEmployeeById(req.params.id);
    
    if (!existing) {
      return errorResponse(
        res,
        'https://api.example.com/errors/not-found',
        'Not Found',
        404,
        `未找到 ID 为 ${req.params.id} 的员工`,
        req.originalUrl
      );
    }
    
    await employeeService.deleteEmployee(req.params.id);
    
    // 204 No Content - 删除成功，不返回正文
    res.status(204).send();
  } catch (error) {
    console.error('删除员工失败:', error);
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
 * GET /api/v1/employees/search
 * 
 * 搜索员工
 * 
 * 查询参数：
 * - q: 搜索关键词
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
    
    const results = await employeeService.searchEmployees(q);
    
    successResponse(res, results);
  } catch (error) {
    console.error('搜索员工失败:', error);
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

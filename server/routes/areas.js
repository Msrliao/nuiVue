/**
 * 地区资料 API 路由
 */

const express = require('express');
const router = express.Router();
const areaService = require('../pgsqlDemo/areaService');

// 标准化响应
function successResponse(res, data, statusCode = 200) {
  res.status(statusCode).json({ data });
}

function errorResponse(res, status, message, detail) {
  res.status(status).json({
    type: `https://api.example.com/errors/${status}`,
    title: status === 500 ? 'Internal Server Error' : 'Error',
    status,
    detail: detail || message,
    timestamp: new Date().toISOString()
  });
}

// 获取所有地区资料
router.get('/', async (req, res) => {
  try {
    const areas = await areaService.getAreasByParams(req.query);
    successResponse(res, areas);
  } catch (error) {
    console.error('获取地区资料列表失败:', error);
    errorResponse(res, 500, '获取地区资料列表失败', error.message);
  }
});

// 根据地区名称列表获取地区资料
router.post('/by-names', async (req, res) => {
  try {
    const { names } = req.body;
    if (!names || !Array.isArray(names)) {
      return errorResponse(res, 400, '请求参数错误', 'names 必须是数组');
    }
    const areas = await areaService.getAreasByNames(names);
    successResponse(res, areas);
  } catch (error) {
    console.error('根据名称获取地区资料失败:', error);
    errorResponse(res, 500, '获取地区资料失败', error.message);
  }
});

// 获取单个地区资料
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, 400, '请求参数错误', 'ID 必须是数字');
    }
    
    const area = await areaService.getAreaById(id);
    if (!area) {
      return errorResponse(res, 404, '地区资料不存在', '未找到指定ID的地区资料');
    }
    
    successResponse(res, area);
  } catch (error) {
    console.error('获取地区资料详情失败:', error);
    errorResponse(res, 500, '获取地区资料详情失败', error.message);
  }
});

// 创建地区资料
router.post('/', async (req, res) => {
  try {
    const { dq } = req.body;
    if (!dq || dq.trim() === '') {
      return errorResponse(res, 400, '请求参数错误', '地区名称不能为空');
    }
    
    // 检查是否已存在
    const existing = await areaService.getAreaByName(dq.trim());
    if (existing) {
      return errorResponse(res, 409, '地区已存在', '该地区资料已存在');
    }
    
    const area = await areaService.createArea(req.body);
    successResponse(res, area, 201);
  } catch (error) {
    console.error('创建地区资料失败:', error);
    errorResponse(res, 500, '创建地区资料失败', error.message);
  }
});

// 更新地区资料
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, 400, '请求参数错误', 'ID 必须是数字');
    }
    
    const existing = await areaService.getAreaById(id);
    if (!existing) {
      return errorResponse(res, 404, '地区资料不存在', '未找到指定ID的地区资料');
    }
    
    const area = await areaService.updateArea(id, req.body);
    successResponse(res, area);
  } catch (error) {
    console.error('更新地区资料失败:', error);
    errorResponse(res, 500, '更新地区资料失败', error.message);
  }
});

// 删除地区资料
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, 400, '请求参数错误', 'ID 必须是数字');
    }
    
    const existing = await areaService.getAreaById(id);
    if (!existing) {
      return errorResponse(res, 404, '地区资料不存在', '未找到指定ID的地区资料');
    }
    
    await areaService.deleteArea(id);
    res.status(204).send();
  } catch (error) {
    console.error('删除地区资料失败:', error);
    errorResponse(res, 500, '删除地区资料失败', error.message);
  }
});

module.exports = router;

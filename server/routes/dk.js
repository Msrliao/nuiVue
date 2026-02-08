/**
 * 大库数据 API 路由
 */

const express = require('express');
const router = express.Router();
const { getDKdata } = require('../getDKData/getData');

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

// 获取DK数据
router.get('/', async (req, res) => {
  try {
    console.log('接收到DK数据请求，参数：', req.query);
    const { bm, cx, mc } = req.query;
    
    if (!bm && !cx && !mc) {
      successResponse(res, []);
      return;
    }
    
    // 调用大库数据获取函数
    const dkData = await getDKdata(mc || '', bm || '', cx || '', '');
    
    console.log('获取DK数据成功');
    
    if (!dkData) {
      console.error('获取DK数据失败，返回结果为空');
      errorResponse(res, 500, '获取dk资料失败', '返回结果为空');
      return;
    }
    
    successResponse(res, dkData.rows || []);
  } catch (error) {
    console.error('获取dk资料失败:', error);
    errorResponse(res, 500, '获取dk资料失败', error.message);
  }
});

module.exports = router;

/**
 * 响应处理中间件
 * 提供统一的成功和错误响应格式
 */

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

module.exports = {
  successResponse,
  errorResponse
};

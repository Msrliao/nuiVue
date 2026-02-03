import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials:true
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证信息等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 处理204 No Content响应
    if (response.status === 204) {
      return null;
    }
    
    // 后端返回的数据格式是 { data: [...] } 或 { code: 200, message: '操作成功', data: [...], timestamp: 1234567890 }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      // 如果后端返回的是包装对象，返回 data 字段
      return response.data.data;
    }
    // 否则返回整个响应数据
    return response.data;
  },
  (error) => {
    // 处理错误响应
    if (error.response && error.response.data) {
      // 如果后端返回的是包装错误对象（RFC 7807 Problem Details 格式）
      const errorData = error.response.data;
      const errorMessage = errorData.detail || errorData.message || errorData.title || '请求失败';
      console.error('API Error:', errorMessage, errorData);
      return Promise.reject({
        message: errorMessage,
        error: errorData.title || errorData.error,
        code: errorData.status || errorData.code || error.response.status,
        data: errorData
      });
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;

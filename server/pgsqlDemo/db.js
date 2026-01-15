const { Pool } = require('pg');
const config = require('../config');

// 创建数据库连接池
const pool = new Pool(config.database);

// 测试数据库连接
async function testConnection() {
  try {
    console.log('正在连接数据库...');
    const client = await pool.connect();
    console.log('数据库连接成功！');
    
    // 执行简单查询
    const result = await client.query('SELECT NOW()');
    console.log('当前时间:', result.rows[0].now);
    
    // 释放连接
    client.release();
    console.log('连接已释放');
    return true;
  } catch (error) {
    console.error('连接数据库时发生错误:', error);
    return false;
  }
}

// 获取数据库连接
async function getClient() {
  const client = await pool.connect();
  return client;
}

// 关闭数据库连接池
async function closePool() {
  await pool.end();
  console.log('数据库连接池已关闭');
}

module.exports = {
  pool,
  testConnection,
  getClient,
  closePool
};
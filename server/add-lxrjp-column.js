const { getClient } = require('./pgsqlDemo/db');

// 添加lxrjp字段到customer_info表
async function addLxrjpColumn() {
  const client = await getClient();
  try {
    console.log('正在添加lxrjp字段到customer_info表...');
    
    // 执行SQL语句添加字段
    await client.query(
      `ALTER TABLE customer_info ADD COLUMN IF NOT EXISTS lxrjp VARCHAR(255);`
    );
    
    console.log('lxrjp字段添加成功！');
  } catch (error) {
    console.error('添加lxrjp字段失败:', error);
  } finally {
    client.release();
  }
}

// 运行函数
addLxrjpColumn();

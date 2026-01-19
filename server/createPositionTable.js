const { getClient } = require('./pgsqlDemo/db');

async function createPositionTable() {
  const client = await getClient();
  try {
    console.log('正在创建positions表...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS positions (
        id SERIAL PRIMARY KEY,
        position_name VARCHAR(255) NOT NULL,
        parent_id INTEGER REFERENCES positions(id) ON DELETE CASCADE,
        warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 添加索引，提高查询效率
      CREATE INDEX IF NOT EXISTS idx_positions_warehouse_id ON positions(warehouse_id);
      CREATE INDEX IF NOT EXISTS idx_positions_parent_id ON positions(parent_id);
    `;
    
    await client.query(createTableQuery);
    console.log('positions表创建成功！');
    return true;
  } catch (error) {
    console.error('创建positions表时发生错误:', error);
    return false;
  } finally {
    client.release();
  }
}

// 执行脚本
createPositionTable().then((success) => {
  process.exit(success ? 0 : 1);
});
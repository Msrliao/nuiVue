const { pool } = require('./pgsqlDemo/db');

async function dropZtColumn() {
  console.log('开始删除 zt 字段...');
  const client = await pool.connect();
  try {
    // 删除 zt 字段
    await client.query('ALTER TABLE employee_info DROP COLUMN IF EXISTS zt;');
    console.log('已删除 zt 字段');
    
    // 验证表结构
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'employee_info' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n当前表结构:');
    result.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    console.log('\n迁移完成！');
  } catch (error) {
    console.error('迁移失败:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

dropZtColumn().then(() => {
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

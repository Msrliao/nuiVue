const { getClient } = require('./pgsqlDemo/db');

async function createEmployeeTable() {
  const client = await getClient();
  try {
    // 创建员工信息表
    await client.query(`
      CREATE TABLE IF NOT EXISTS employee_info (
        id SERIAL PRIMARY KEY,
        gh VARCHAR(50) NOT NULL,
        xm VARCHAR(100) NOT NULL,
        xb VARCHAR(10),
        csrq DATE,
        mz VARCHAR(20),
        lxdh VARCHAR(20),
        idcard VARCHAR(18),
        yx VARCHAR(100),
        zw VARCHAR(100),
        bm VARCHAR(100),
        gzjb VARCHAR(20),
        rzrq DATE,
        syq VARCHAR(20),
        htsjzrq DATE,
        htsjzzrq DATE,
        emergencyContact VARCHAR(100),
        emergencyContactPhone VARCHAR(20),
        bz TEXT,
        zt VARCHAR(20) DEFAULT '在职',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_employee_gh ON employee_info(gh);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_employee_xm ON employee_info(xm);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_employee_bm ON employee_info(bm);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_employee_zw ON employee_info(zw);`);

    console.log('员工信息表创建成功！');
  } catch (error) {
    console.error('创建员工信息表时发生错误:', error);
  } finally {
    client.release();
  }
}

// 执行创建表的函数
createEmployeeTable();

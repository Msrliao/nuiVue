const { pool } = require('../pgsqlDemo/db');

/**
 * 初始化数据库表结构
 */
async function initDatabase() {
  console.log('正在初始化数据库表结构...');
  const client = await pool.connect();
  try {
    // 创建员工信息表
    await client.query(`
      CREATE TABLE IF NOT EXISTS employee_info (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 删除 gh 字段的索引（如果存在）
    await client.query(`DROP INDEX IF EXISTS idx_employee_gh;`);
    
    // 创建索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_employee_xm ON employee_info(xm);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_employee_bm ON employee_info(bm);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_employee_zw ON employee_info(zw);`);

    // 删除并重新创建物流资料表
    await client.query(`DROP TABLE IF EXISTS logistics CASCADE;`);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS logistics (
        id SERIAL PRIMARY KEY,
        wlmc VARCHAR(100),
        wljp VARCHAR(50),
        dq VARCHAR(100),
        dqjp VARCHAR(50),
        lxr VARCHAR(50),
        lxrJp VARCHAR(50),
        lxrPhone VARCHAR(20),
        lxdh VARCHAR(20),
        otherContact VARCHAR(100),
        qtlxfs VARCHAR(100),
        contactAddress TEXT,
        lxdz TEXT,
        lwdq VARCHAR(255),
        ffdsrq VARCHAR(255),
        dscsjl INTEGER,
        ffdsfs VARCHAR(100),
        bz TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建物流表索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_logistics_wlmc ON logistics(wlmc);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_logistics_wljp ON logistics(wljp);`);

    // 创建地区资料表
    await client.query(`
      CREATE TABLE IF NOT EXISTS areas (
        id SERIAL PRIMARY KEY,
        dq VARCHAR(100) NOT NULL,
        dqjp VARCHAR(50),
        lxr VARCHAR(50),
        lxdh VARCHAR(20),
        qtlxfs VARCHAR(100),
        lxdz TEXT,
        bz TEXT,
        index INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建地区表索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_areas_dq ON areas(dq);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_areas_dqjp ON areas(dqjp);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_areas_index ON areas(index);`);

    console.log('数据库表结构初始化完成！');
  } catch (error) {
    console.error('初始化数据库表结构时发生错误:', error);
  } finally {
    client.release();
  }
}

module.exports = {
  initDatabase
};

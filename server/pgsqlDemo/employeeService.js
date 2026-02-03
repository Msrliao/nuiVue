const { getClient } = require('./db');

// 辅助函数：将时间戳（毫秒）转换为 PostgreSQL 日期格式
function timestampToDate(value) {
  if (!value) return null;
  // 如果是数字（时间戳），转换为日期字符串
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const date = new Date(Number(value));
    return date.toISOString().split('T')[0]; // 返回 YYYY-MM-DD 格式
  }
  // 如果已经是字符串，直接返回
  return value;
}

// 创建员工资料（已移除 gh 和 zt 字段）
async function createEmployee(employee) {
  const client = await getClient();
  try {
    // 将前端字段名映射到数据库字段名，并转换日期格式
    const xm = employee.xm;
    const xb = employee.xb;
    const csrq = timestampToDate(employee.csrq);
    const mz = employee.mz;
    const lxdh = employee.lxdh;
    const idcard = employee.idcard;
    const yx = employee.yx;
    const zw = employee.zw;
    const bm = employee.bm;
    const gzjb = employee.gzjb;
    const rzrq = timestampToDate(employee.rzrq);
    const syq = employee.syq;
    // 前端字段名 -> 数据库字段名
    const htsjzrq = timestampToDate(employee.htqsrq);
    const htsjzzrq = timestampToDate(employee.htzzrq);
    const emergencyContact = employee.jjlxr;
    const emergencyContactPhone = employee.jjlxrdh;
    const bz = employee.bz;
    const xmjp = employee.xmjp;
    
    const result = await client.query(
      `INSERT INTO employee_info (xm, xb, csrq, mz, lxdh, idcard, yx, zw, bm, gzjb, rzrq, syq, htsjzrq, htsjzzrq, emergencyContact, emergencyContactPhone, bz, xmjp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,$18)
       RETURNING *`,
      [xm, xb, csrq, mz, lxdh, idcard, yx, zw, bm, gzjb, rzrq, syq, htsjzrq, htsjzzrq, emergencyContact, emergencyContactPhone, bz,xmjp]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// 获取所有员工资料
async function getAllEmployees() {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM employee_info ORDER BY xm LIMIT 20');
    // 将数据库字段名映射为前端字段名
    return result.rows.map(row => ({
      id: row.id,
      xm: row.xm,
      xb: row.xb,
      csrq: row.csrq,
      mz: row.mz,
      lxdh: row.lxdh,
      idcard: row.idcard,
      yx: row.yx,
      zw: row.zw,
      bm: row.bm,
      gzjb: row.gzjb,
      rzrq: row.rzrq,
      syq: row.syq,
      // 数据库字段名 -> 前端字段名
      htqsrq: row.htsjzrq,
      htzzrq: row.htsjzzrq,
      jjlxr: row.emergencycontact,
      jjlxrdh: row.emergencycontactphone,
      bz: row.bz,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  } finally {
    client.release();
  }
}

// 根据ID获取员工详情
async function getEmployeeById(id) {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM employee_info WHERE id = $1', [id]);
    const row = result.rows[0];
    if (!row) return null;
    // 将数据库字段名映射为前端字段名
    return {
      id: row.id,
      xm: row.xm,
      xb: row.xb,
      csrq: row.csrq,
      mz: row.mz,
      lxdh: row.lxdh,
      idcard: row.idcard,
      yx: row.yx,
      zw: row.zw,
      bm: row.bm,
      gzjb: row.gzjb,
      rzrq: row.rzrq,
      syq: row.syq,
      // 数据库字段名 -> 前端字段名
      htqsrq: row.htsjzrq,
      htzzrq: row.htsjzzrq,
      jjlxr: row.emergencycontact,
      jjlxrdh: row.emergencycontactphone,
      bz: row.bz,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  } finally {
    client.release();
  }
}

// 更新员工资料（已移除 gh 和 zt 字段）
async function updateEmployee(id, employee) {
  const client = await getClient();
  try {
    // 将前端字段名映射到数据库字段名，并转换日期格式
    const xm = employee.xm;
    const xmjp = employee.xmjp;
    const xb = employee.xb;
    const csrq = timestampToDate(employee.csrq);
    const mz = employee.mz;
    const lxdh = employee.lxdh;
    const idcard = employee.idcard;
    const yx = employee.yx;
    const zw = employee.zw;
    const bm = employee.bm;
    const gzjb = employee.gzjb;
    const rzrq = timestampToDate(employee.rzrq);
    const syq = employee.syq;
    // 前端字段名 -> 数据库字段名
    const htsjzrq = timestampToDate(employee.htqsrq);
    const htsjzzrq = timestampToDate(employee.htzzrq);
    const emergencyContact = employee.jjlxr;
    const emergencyContactPhone = employee.jjlxrdh;
    const bz = employee.bz;
    
    const result = await client.query(
      `UPDATE employee_info
       SET xm = $1, xb = $2, csrq = $3, mz = $4, lxdh = $5, idcard = $6, yx = $7, zw = $8, bm = $9, gzjb = $10, rzrq = $11, syq = $12, htsjzrq = $13, htsjzzrq = $14, emergencyContact = $15, emergencyContactPhone = $16, bz = $17, xmjp = $18
       WHERE id = $18
       RETURNING *`,
      [xm, xb, csrq, mz, lxdh, idcard, yx, zw, bm, gzjb, rzrq, syq, htsjzrq, htsjzzrq, emergencyContact, emergencyContactPhone, bz, id,xmjp]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 删除员工资料
async function deleteEmployee(id) {
  const client = await getClient();
  try {
    const result = await client.query('DELETE FROM employee_info WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 搜索员工资料
async function searchEmployees(keyword) {
  const client = await getClient();
  try {
    const result = await client.query(
      `SELECT * FROM employee_info 
       WHERE xm ILIKE $1 OR xmjp ILIKE $1 OR lxdh ILIKE $1 OR yx ILIKE $1 OR zw ILIKE $1 OR bm ILIKE $1 OR mz ILIKE $1 OR idcard ILIKE $1 OR gzjb ILIKE $1 OR "emergencyContact" ILIKE $1 OR "emergencyContactPhone" ILIKE $1
       ORDER BY xm LIMIT 20`,
      [`%${keyword}%`]
    );
    // 将数据库字段名映射为前端字段名
    return result.rows.map(row => ({
      id: row.id,
      xm: row.xm,
      xb: row.xb,
      csrq: row.csrq,
      mz: row.mz,
      lxdh: row.lxdh,
      idcard: row.idcard,
      yx: row.yx,
      zw: row.zw,
      bm: row.bm,
      gzjb: row.gzjb,
      rzrq: row.rzrq,
      syq: row.syq,
      htqsrq: row.htsjzrq,
      htzzrq: row.htsjzzrq,
      jjlxr: row.emergencycontact,
      jjlxrdh: row.emergencycontactphone,
      bz: row.bz,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  } finally {
    client.release();
  }
}

// 根据参数获取员工资料
async function getEmployeesByParams(params) {
  const client = await getClient();
  try {
    let sql = 'SELECT * FROM employee_info';
    const values = [];
    let conditions = [];
    let paramIndex = 1;
    
    // 检查参数并组装SQL条件
    if (params) {
      if (params.xm && params.xm.trim() !== '') {
        conditions.push(`(xm ILIKE $${paramIndex} OR xmjp ILIKE $${paramIndex})`);
        values.push(`%${params.xm.trim()}%`);
        paramIndex++;
      }
      if (params.lxdh && params.lxdh.trim() !== '') {
        conditions.push(`lxdh ILIKE $${paramIndex}`);
        values.push(`%${params.lxdh.trim()}%`);
        paramIndex++;
      }
      if (params.bm && params.bm.trim() !== '') {
        conditions.push(`bm ILIKE $${paramIndex}`);
        values.push(`%${params.bm.trim()}%`);
        paramIndex++;
      }
      if (params.zw && params.zw.trim() !== '') {
        conditions.push(`zw ILIKE $${paramIndex}`);
        values.push(`%${params.zw.trim()}%`);
        paramIndex++;
      }
    }
    
    // 如果有条件，添加WHERE子句
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    // 添加排序和限制
    sql += ' ORDER BY xm LIMIT 20';
    
    console.log('执行SQL:', sql);
    console.log('参数:', values);
    
    const result = await client.query(sql, values);
    // 将数据库字段名映射为前端字段名
    return result.rows.map(row => ({
      id: row.id,
      xm: row.xm,
      xb: row.xb,
      csrq: row.csrq,
      mz: row.mz,
      lxdh: row.lxdh,
      idcard: row.idcard,
      yx: row.yx,
      zw: row.zw,
      bm: row.bm,
      gzjb: row.gzjb,
      rzrq: row.rzrq,
      syq: row.syq,
      htqsrq: row.htsjzrq,
      htzzrq: row.htsjzzrq,
      jjlxr: row.emergencycontact,
      jjlxrdh: row.emergencycontactphone,
      bz: row.bz,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  } finally {
    client.release();
  }
}

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
  getEmployeesByParams
};

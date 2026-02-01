const { getClient } = require('./db');

// 创建员工资料
async function createEmployee(employee) {
  const client = await getClient();
  try {
    const { gh, xm, xb, csrq, mz, lxdh, idcard, yx, zw, bm, gzjb, rzrq, syq, htsjzrq, htsjzzrq, emergencyContact, emergencyContactPhone, bz, zt } = employee;
    const result = await client.query(
      `INSERT INTO employee_info (gh, xm, xb, csrq, mz, lxdh, idcard, yx, zw, bm, gzjb, rzrq, syq, htsjzrq, htsjzzrq, emergencyContact, emergencyContactPhone, bz, zt)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [gh, xm, xb, csrq, mz, lxdh, idcard, yx, zw, bm, gzjb, rzrq, syq, htsjzrq, htsjzzrq, emergencyContact, emergencyContactPhone, bz, zt]
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
    return result.rows;
  } finally {
    client.release();
  }
}

// 根据ID获取员工详情
async function getEmployeeById(id) {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM employee_info WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 更新员工资料
async function updateEmployee(id, employee) {
  const client = await getClient();
  try {
    const { gh, xm, xb, csrq, mz, lxdh, idcard, yx, zw, bm, gzjb, rzrq, syq, htsjzrq, htsjzzrq, emergencyContact, emergencyContactPhone, bz, zt } = employee;
    const result = await client.query(
      `UPDATE employee_info
       SET gh = $1, xm = $2, xb = $3, csrq = $4, mz = $5, lxdh = $6, idcard = $7, yx = $8, zw = $9, bm = $10, gzjb = $11, rzrq = $12, syq = $13, htsjzrq = $14, htsjzzrq = $15, emergencyContact = $16, emergencyContactPhone = $17, bz = $18, zt = $19
       WHERE id = $20
       RETURNING *`,
      [gh, xm, xb, csrq, mz, lxdh, idcard, yx, zw, bm, gzjb, rzrq, syq, htsjzrq, htsjzzrq, emergencyContact, emergencyContactPhone, bz, zt, id]
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
       WHERE gh ILIKE $1 OR xm ILIKE $1 OR lxdh ILIKE $1 OR yx ILIKE $1 OR zw ILIKE $1 OR bm ILIKE $1 OR mz ILIKE $1 OR idcard ILIKE $1 OR gzjb ILIKE $1 OR emergencyContact ILIKE $1 OR emergencyContactPhone ILIKE $1
       ORDER BY xm LIMIT 20`,
      [`%${keyword}%`]
    );
    return result.rows;
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
      if (params.gh && params.gh.trim() !== '') {
        conditions.push(`gh ILIKE $${paramIndex}`);
        values.push(`%${params.gh.trim()}%`);
        paramIndex++;
      }
      if (params.xm && params.xm.trim() !== '') {
        conditions.push(`xm ILIKE $${paramIndex}`);
        values.push(`%${params.xm.trim()}%`);
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
    return result.rows;
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
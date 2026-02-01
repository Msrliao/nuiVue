const { getClient } = require('./db');

// 创建客户资料
async function createCustomer(customer) {
  const client = await getClient();
  try {
    const { khjc, khjp, khqc, lxr, lxrjp, lxdh, zxdh, qtlxfs, lxdz, yhzhm, yhzh, ssyh, khlx, jyfw, ssqd, fkfs, mrwl, mryhfs, bz } = customer;
    const result = await client.query(
      `INSERT INTO customer_info (khjc, khjp, khqc, lxr, lxrjp, lxdh, zxdh, qtlxfs, lxdz, yhzhm, yhzh, ssyh, khlx, jyfw, ssqd, fkfs, mrwl, mryhfs, bz)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [khjc, khjp, khqc, lxr, lxrjp, lxdh, zxdh, qtlxfs, lxdz, yhzhm, yhzh, ssyh, khlx, jyfw, ssqd, fkfs, mrwl, mryhfs, bz]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// 获取所有客户资料
async function getAllCustomers() {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM customer_info ORDER BY khjc LIMIT 20');
    return result.rows;
  } finally {
    client.release();
  }
}

// 根据ID获取客户详情
async function getCustomerById(id) {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM customer_info WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 更新客户资料
async function updateCustomer(id, customer) {
  const client = await getClient();
  try {
    const { khjc, khjp, khqc, lxr, lxrjp, lxdh, zxdh, qtlxfs, lxdz, yhzhm, yhzh, ssyh, khlx, jyfw, ssqd, fkfs, mrwl, mryhfs, bz } = customer;
    const result = await client.query(
      `UPDATE customer_info
       SET khjc = $1, khjp = $2, khqc = $3, lxr = $4, lxrjp = $5, lxdh = $6, zxdh = $7, qtlxfs = $8, lxdz = $9, yhzhm = $10, yhzh = $11, ssyh = $12, khlx = $13, jyfw = $14, ssqd = $15, fkfs = $16, mrwl = $17, mryhfs = $18, bz = $19
       WHERE id = $20
       RETURNING *`,
      [khjc, khjp, khqc, lxr, lxrjp, lxdh, zxdh, qtlxfs, lxdz, yhzhm, yhzh, ssyh, khlx, jyfw, ssqd, fkfs, mrwl, mryhfs, bz, id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 删除客户资料
async function deleteCustomer(id) {
  const client = await getClient();
  try {
    const result = await client.query('DELETE FROM customer_info WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 搜索客户资料
async function searchCustomers(keyword) {
  const client = await getClient();
  try {
    const result = await client.query(
      `SELECT * FROM customer_info 
       WHERE khjc ILIKE $1 OR khjp ILIKE $1 OR khqc ILIKE $1 OR lxr ILIKE $1 OR lxrjp ILIKE $1 OR lxdh ILIKE $1
       ORDER BY khjc LIMIT 20`,
      [`%${keyword}%`]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// 根据参数获取客户资料
async function getCustomersByParams(params) {
  const client = await getClient();
  try {
    let sql = 'SELECT * FROM customer_info';
    const values = [];
    let conditions = [];
    let paramIndex = 1;
    
    // 检查参数并组装SQL条件
    if (params) {
      if (params.khjp && params.khjp.trim() !== '') {
        conditions.push(`khjp ILIKE $${paramIndex}`);
        values.push(`%${params.khjp.trim()}%`);
        paramIndex++;
      }
      if (params.lxdh && params.lxdh.trim() !== '') {
        conditions.push(`lxdh ILIKE $${paramIndex}`);
        values.push(`%${params.lxdh.trim()}%`);
        paramIndex++;
      }
      if (params.lxrjp && params.lxrjp.trim() !== '') {
        conditions.push(`lxrjp ILIKE $${paramIndex}`);
        values.push(`%${params.lxrjp.trim()}%`);
        paramIndex++;
      }
      if (params.khlx && params.khlx.trim() !== '') {
        // 对于数组类型字段，使用 ANY 操作符进行匹配
        conditions.push(`$${paramIndex} = ANY(khlx)`);
        values.push(params.khlx.trim());
        paramIndex++;
      }
      if (params.khdq && params.khdq.trim() !== '') {
        // 对于数组类型字段，使用 ANY 操作符进行匹配
        conditions.push(`$${paramIndex} = ANY(ssqd)`);
        values.push(params.khdq.trim());
        paramIndex++;
      }
    }
    
    // 如果有条件，添加WHERE子句
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    // 添加排序和限制
    sql += ' ORDER BY khjc LIMIT 20';
    
    console.log('执行SQL:', sql);
    console.log('参数:', values);
    
    const result = await client.query(sql, values);
    return result.rows;
  } finally {
    client.release();
  }
}

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomersByParams
};

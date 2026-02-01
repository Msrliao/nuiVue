const { getClient } = require('./db');

// 获取所有配件信息
async function getAllParts() {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM part_info ORDER BY mc');
    return result.rows;
  } finally {
    client.release();
  }
}

// 根据ID获取配件详情
async function getPartById(id) {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM part_info WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 根据名称模糊查询配件
async function searchParts(keyword) {
  const client = await getClient();
  try {
    const result = await client.query(
      `SELECT * FROM part_info 
       WHERE xm ILIKE $1 OR bm ILIKE $1 OR mc ILIKE $1 OR jc ILIKE $1 
       ORDER BY mc`,
      [`%${keyword}%`]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// 获取所有库存信息
async function getAllInventory() {
  const client = await getClient();
  try {
    const result = await client.query(`
      SELECT i.*
      FROM inventory i
      ORDER BY i.id
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

// 根据车型和配件查询库存
async function searchInventory(vehicleKeyword, partKeyword) {
  const client = await getClient();
  try {
    const result = await client.query(`
      SELECT i.*
      FROM inventory i
      ORDER BY i.id
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

// 根据ID获取库存详情
async function getInventoryById(id) {
  const client = await getClient();
  try {
    const result = await client.query(`
      SELECT i.*
      FROM inventory i
      WHERE i.id = $1
    `, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 根据车型ID和配件ID查询库存
async function getInventoryByVehicleAndPart(vehicleModelId, partId) {
  const client = await getClient();
  try {
    const result = await client.query(`
      SELECT i.*
      FROM inventory i
      WHERE i.vehicle_model_id = $1 AND i.part_id = $2
    `, [vehicleModelId, partId]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 配件基本资料相关函数

// 创建配件基本资料
async function createPartInfo(partInfo) {
  const client = await getClient();
  try {
    const { xm, bm, mc, jp, cx, cxjp, dw, pp, gg, kw, ysjj, bz } = partInfo;
    const result = await client.query(
      `INSERT INTO part_info (xm, bm, mc, jp, cx, cxjp, dw, pp, gg, kw, ysjj, bz)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [xm, bm, mc, jp, cx, cxjp, dw, pp, gg, kw, ysjj, bz]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// 获取配件基本资料（支持多条件搜索）
async function getPartInfo(params = {}) {
  const client = await getClient();
  try {
    const { bm, cx, mc, gg } = params;
    let query = `
      SELECT pi.*, 
             CASE 
               WHEN pi.kw IS NOT NULL AND pi.kw ~ '^[0-9]+$' THEN 
                 (SELECT p.position_name FROM positions p WHERE p.id = pi.kw::int) 
               ELSE pi.kw 
             END as kw_display
      FROM part_info pi
      WHERE 1=1
    `;
    const values = [];
    let valueIndex = 1;

    // 配件编码/序码搜索
    if (bm) {
      query += ` AND (pi.bm ILIKE $${valueIndex} OR pi.xm ILIKE $${valueIndex})`;
      values.push(`%${bm}%`);
      valueIndex++;
    }

    // 配件车型搜索
    if (cx) {
      query += ` AND (pi.cx::text ILIKE $${valueIndex} OR pi.cxjp ILIKE $${valueIndex})`;
      values.push(`%${cx}%`);
      valueIndex++;
    }

    // 配件名称搜索
    if (mc) {
      query += ` AND (pi.mc ILIKE $${valueIndex} OR pi.jp ILIKE $${valueIndex})`;
      values.push(`%${mc}%`);
      valueIndex++;
    }

    // 配件规格搜索
    if (gg) {
      query += ` AND pi.gg::text ILIKE $${valueIndex}`;
      values.push(`%${gg}%`);
      valueIndex++;
    }

    query += ' ORDER BY pi.mc';
    
    const result = await client.query(query, values);
    return result.rows;
  } finally {
    client.release();
  }
}

// 根据ID获取配件基本资料
async function getPartInfoById(id) {
  const client = await getClient();
  try {
    const result = await client.query(`
      SELECT pi.*, 
             CASE 
               WHEN pi.kw IS NOT NULL AND pi.kw ~ '^[0-9]+$' THEN 
                 (SELECT p.position_name FROM positions p WHERE p.id = pi.kw::int) 
               ELSE pi.kw 
             END as kw_display
      FROM part_info pi
      WHERE pi.id = $1
    `, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 更新配件基本资料
async function updatePartInfo(id, partInfo) {
  const client = await getClient();
  try {
    const { xm, bm, mc, jp, cx, cxjp, dw, pp, gg, kw, ysjj, bz } = partInfo;
    const result = await client.query(
      `UPDATE part_info
       SET xm = $1, bm = $2, mc = $3, jp = $4, cx = $5, cxjp = $6, dw = $7, pp = $8, gg = $9, kw = $10, ysjj = $11, bz = $12, updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [xm, bm, mc, jp, cx, cxjp, dw, pp, gg, kw, ysjj, bz, id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 删除配件基本资料
async function deletePartInfo(id) {
  const client = await getClient();
  try {
    const result = await client.query('DELETE FROM part_info WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

module.exports = {
  // 配件基本资料相关函数
  createPartInfo,
  getPartInfo,
  getPartInfoById,
  updatePartInfo,
  deletePartInfo
};
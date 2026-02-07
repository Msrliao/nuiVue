const { getClient } = require('./db');

// 生成简拼（首字母）
function generatePinyinFirstLetter(str) {
  if (!str) return '';
  const pinyinMap = {
    '北京': 'bj', '天津': 'tj', '河北': 'hb', '山西': 'sx', '内蒙古': 'nmg',
    '辽宁': 'ln', '吉林': 'jl', '黑龙江': 'hlj', '上海': 'sh', '江苏': 'js',
    '浙江': 'zj', '安徽': 'ah', '福建': 'fj', '江西': 'jx', '山东': 'sd',
    '河南': 'hn', '湖北': 'hb', '湖南': 'hn', '广东': 'gd', '广西': 'gx',
    '海南': 'hn', '重庆': 'cq', '四川': 'sc', '贵州': 'gz', '云南': 'yn',
    '西藏': 'xz', '陕西': 'sx', '甘肃': 'gs', '青海': 'qh', '宁夏': 'nx',
    '新疆': 'xj', '台湾': 'tw', '香港': 'xg', '澳门': 'am'
  };
  return pinyinMap[str] || str.substring(0, 2).toLowerCase();
}

// 创建地区资料
async function createArea(area) {
  const client = await getClient();
  try {
    const { dq, dqjp, lxr, lxdh, qtlxfs, lxdz, bz } = area;
    const dqjpValue = dqjp || generatePinyinFirstLetter(dq);
    
    const result = await client.query(
      `INSERT INTO areas (dq, dqjp, lxr, lxdh, qtlxfs, lxdz, bz)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [dq, dqjpValue, lxr || '', lxdh || '', qtlxfs || '', lxdz || '', bz || '']
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// 根据地区名称查找（检查是否已存在）
async function getAreaByName(dq) {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM areas WHERE dq = $1 LIMIT 1', [dq]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 获取所有地区资料
async function getAllAreas() {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM areas ORDER BY id LIMIT 100');
    return result.rows;
  } finally {
    client.release();
  }
}

// 根据地区名称列表获取地区资料
async function getAreasByNames(dqList) {
  if (!dqList || dqList.length === 0) return [];
  
  const client = await getClient();
  try {
    const result = await client.query(
      'SELECT * FROM areas WHERE dq = ANY($1) ORDER BY id',
      [dqList]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// 根据ID获取地区资料
async function getAreaById(id) {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM areas WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 更新地区资料
async function updateArea(id, area) {
  const client = await getClient();
  try {
    const { dq, dqjp, lxr, lxdh, qtlxfs, lxdz, bz } = area;
    const result = await client.query(
      `UPDATE areas
       SET dq = $1, dqjp = $2, lxr = $3, lxdh = $4, qtlxfs = $5, lxdz = $6, bz = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [dq, dqjp, lxr, lxdh, qtlxfs, lxdz, bz, id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 删除地区资料
async function deleteArea(id) {
  const client = await getClient();
  try {
    const result = await client.query('DELETE FROM areas WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 根据参数搜索地区资料
async function getAreasByParams(params) {
  const client = await getClient();
  try {
    let sql = 'SELECT * FROM areas';
    const values = [];
    let conditions = [];
    let paramIndex = 1;
    
    if (params) {
      if (params.dq && params.dq.trim() !== '') {
        conditions.push(`dq ILIKE $${paramIndex}`);
        values.push(`%${params.dq.trim()}%`);
        paramIndex++;
      }
      if (params.dqjp && params.dqjp.trim() !== '') {
        conditions.push(`dqjp ILIKE $${paramIndex}`);
        values.push(`%${params.dqjp.trim()}%`);
        paramIndex++;
      }
      if (params.lxr && params.lxr.trim() !== '') {
        conditions.push(`lxr ILIKE $${paramIndex}`);
        values.push(`%${params.lxr.trim()}%`);
        paramIndex++;
      }
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY id LIMIT 100';
    
    const result = await client.query(sql, values);
    return result.rows;
  } finally {
    client.release();
  }
}

module.exports = {
  createArea,
  getAreaByName,
  getAllAreas,
  getAreasByNames,
  getAreaById,
  updateArea,
  deleteArea,
  getAreasByParams,
  generatePinyinFirstLetter
};

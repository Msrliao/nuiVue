const { getClient } = require('./db');
const areaService = require('./areaService');

// 解析 PostgreSQL 数组格式
function parsePostgresArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    // 处理 PostgreSQL 数组格式 {a,b,c}
    if (value.startsWith('{') && value.endsWith('}')) {
      return value.slice(1, -1).split(',').filter(item => item);
    }
    // 处理逗号分隔的字符串
    return value.split(',').filter(item => item.trim());
  }
  return [];
}

// 创建物流资料
async function createLogistics(logistics) {
  const client = await getClient();
  try {
    const { wlmc, wljp, lxr, lxrJp, lxrPhone, otherContact, contactAddress, lwdq, ffdsrq, dscsjl, ffdsfs, bz } = logistics;
    // 将 dscsjl 转换为整数（如果为空字符串则设为 null）
    const dscsjlValue = dscsjl && dscsjl.toString().trim() !== '' ? parseInt(dscsjl, 10) : null;
    
    // 开始事务
    await client.query('BEGIN');
    
    try {
      // 1. 插入物流资料
      const result = await client.query(
        `INSERT INTO logistics (
          wlmc, wljp, lxr, lxrjp, lxrphone, othercontact, 
          contactaddress, lwdq, ffdsrq, dscsjl, ffdsfs, bz
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [wlmc, wljp, lxr, lxrJp, lxrPhone, otherContact, 
         contactAddress, lwdq, ffdsrq, dscsjlValue, ffdsfs, bz]
      );
      
      // 获取新创建的物流ID
      const logisticsId = result.rows[0].id;
      
      // 2. 解析来往地区数组
      const regions = parsePostgresArray(lwdq);
      
      // 3. 为每个地区插入地区资料记录（到 areas 表）
      for (const region of regions) {
        if (!region || region.trim() === '') continue;
        
        // 检查该地区是否已存在于 areas 表
        const existingArea = await areaService.getAreaByName(region.trim());
        
        if (!existingArea) {
          // 地区不存在，插入地区名称到 areas 表，并关联物流ID
          await areaService.createArea({
            dq: region.trim(),
            index: logisticsId  // 关联到物流资料的ID
          });
        }
      }
      
      // 提交事务
      await client.query('COMMIT');
      
      return result.rows[0];
    } catch (error) {
      // 回滚事务
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    client.release();
  }
}

// 获取所有物流资料
async function getAllLogistics() {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM logistics ORDER BY id LIMIT 20');
    return result.rows;
  } finally {
    client.release();
  }
}

// 根据ID获取物流详情
async function getLogisticsById(id) {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM logistics WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 更新物流资料
async function updateLogistics(id, logistics) {
  const client = await getClient();
  try {
    const { wlmc, wljp, lxr, lxrJp, lxrPhone, otherContact, contactAddress, lwdq, ffdsrq, dscsjl, ffdsfs, bz } = logistics;
    // 将 dscsjl 转换为整数（如果为空字符串则设为 null）
    const dscsjlValue = dscsjl && dscsjl.toString().trim() !== '' ? parseInt(dscsjl, 10) : null;
    const result = await client.query(
      `UPDATE logistics
       SET wlmc = $1, wljp = $2, lxr = $3, lxrjp = $4, lxrphone = $5, 
           othercontact = $6, contactaddress = $7, lwdq = $8, ffdsrq = $9, 
           dscsjl = $10, ffdsfs = $11, bz = $12
       WHERE id = $13
       RETURNING *`,
      [wlmc, wljp, lxr, lxrJp, lxrPhone, otherContact, 
       contactAddress, lwdq, ffdsrq, dscsjlValue, ffdsfs, bz, id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 删除物流资料
async function deleteLogistics(id) {
  const client = await getClient();
  try {
    const result = await client.query('DELETE FROM logistics WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 根据参数获取物流资料
async function getLogisticsByParams(params) {
  const client = await getClient();
  try {
    let sql = 'SELECT * FROM logistics';
    const values = [];
    let conditions = [];
    let paramIndex = 1;
    
    // 检查参数并组装SQL条件
    if (params) {
      if (params.wlmc && params.wlmc.trim() !== '') {
        conditions.push(`wlmc ILIKE $${paramIndex}`);
        values.push(`%${params.wlmc.trim()}%`);
        paramIndex++;
      }
      if (params.wljp && params.wljp.trim() !== '') {
        conditions.push(`wljp ILIKE $${paramIndex}`);
        values.push(`%${params.wljp.trim()}%`);
        paramIndex++;
      }
      if (params.lxr && params.lxr.trim() !== '') {
        conditions.push(`lxr ILIKE $${paramIndex}`);
        values.push(`%${params.lxr.trim()}%`);
        paramIndex++;
      }
    }
    
    // 如果有条件，添加WHERE子句
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    // 添加排序和限制
    sql += ' ORDER BY id LIMIT 20';
    
    console.log('执行SQL:', sql);
    console.log('参数:', values);
    
    const result = await client.query(sql, values);
    return result.rows;
  } finally {
    client.release();
  }
}

module.exports = {
  createLogistics,
  getAllLogistics,
  getLogisticsById,
  updateLogistics,
  deleteLogistics,
  getLogisticsByParams
};

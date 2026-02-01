const { getClient } = require('./db');

// 获取所有仓位信息
async function getAllPositions() {
  const client = await getClient();
  try {
    const result = await client.query(`
      SELECT 
        id, 
        position_name, 
        parent_id, 
        warehouse_id, 
        description, 
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at, 
        TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at 
      FROM positions 
      ORDER BY id
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

// 根据ID获取仓位详情
async function getPositionById(id) {
  const client = await getClient();
  try {
    const result = await client.query(`
      SELECT 
        id, 
        position_name, 
        parent_id, 
        warehouse_id, 
        description, 
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at, 
        TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at 
      FROM positions 
      WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 根据仓库ID获取所有仓位
async function getPositionsByWarehouseId(warehouseId) {
  const client = await getClient();
  try {
    const result = await client.query(`
      SELECT 
        id, 
        position_name, 
        parent_id, 
        warehouse_id, 
        description, 
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at, 
        TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at 
      FROM positions 
      WHERE warehouse_id = $1
      ORDER BY id
    `, [warehouseId]);
    return result.rows;
  } finally {
    client.release();
  }
}

// 创建仓位
/**
 * 创建仓位
 * @param {Object} positionData - 仓位数据
 * @param {string} positionData.position_name - 仓位名称
 * @param {string} positionData.parent_id - 父仓位ID
 * @param {string} positionData.warehouse_id - 仓库ID
 * @param {string} positionData.description - 仓位描述
 * @returns {Promise<Object>} - 创建的仓位对象
 */
async function createPosition(positionData) {
  const { position_name, parent_id, warehouse_id, description } = positionData;
  
  const client = await getClient();
  try {
    const result = await client.query(`
      INSERT INTO positions (position_name, parent_id, warehouse_id, description)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        id, 
        position_name, 
        parent_id, 
        warehouse_id, 
        description, 
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at, 
        TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at
    `, [position_name, parent_id, warehouse_id, description]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// 更新仓位
async function updatePosition(id, positionData) {
  const { position_name } = positionData;
  const client = await getClient();
  try {
    const result = await client.query(`
      UPDATE positions
      SET position_name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING 
        id, 
        position_name, 
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at, 
        TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at
    `, [position_name, id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 删除仓位
async function deletePosition(id) {
  const client = await getClient();
  try {
    await client.query('DELETE FROM positions WHERE id = $1', [id]);
    return true;
  } finally {
    client.release();
  }
}

// 检查仓库是否存在关联仓位
async function checkPositionExistsByWarehouseId(warehouseId) {
  const client = await getClient();
  try {
    const result = await client.query(
      'SELECT id FROM positions WHERE warehouse_id = $1 LIMIT 1', 
      [warehouseId]
    );
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}

module.exports = {
  getAllPositions,
  getPositionById,
  getPositionsByWarehouseId,
  createPosition,
  updatePosition,
  deletePosition,
  checkPositionExistsByWarehouseId
};
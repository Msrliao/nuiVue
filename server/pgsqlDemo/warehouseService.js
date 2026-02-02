const { getClient } = require('./db');

// 获取所有仓库信息
async function getAllWarehouses() {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM warehouses ORDER BY id');
    return result.rows;
  } finally {
    client.release();
  }
}

// 根据ID获取仓库详情
async function getWarehouseById(id) {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM warehouses WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 创建仓库
async function createWarehouse(warehouseData) {
  const { ckmc, fzr, lxdh, bz } = warehouseData;
  const client = await getClient();
  try {
    const result = await client.query(
      `INSERT INTO warehouses (ckmc, fzr, lxdh, bz)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [ckmc, fzr, lxdh, bz]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// 更新仓库
async function updateWarehouse(id, warehouseData) {
  const { ckmc, fzr, lxdh, bz } = warehouseData;
  const client = await getClient();
  try {
    const result = await client.query(
      `UPDATE warehouses
       SET ckmc = $1, fzr = $2, lxdh = $3, bz = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [ckmc, fzr, lxdh, bz, id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 删除仓库
async function deleteWarehouse(id) {
  const client = await getClient();
  try {
    // 检查是否存在关联仓位
    const positionResult = await client.query(
      'SELECT id FROM positions WHERE warehouse_id = $1 LIMIT 1', 
      [id]
    );
    
    if (positionResult.rows.length > 0) {
      throw new Error('该仓库存在关联仓位，无法删除');
    }
    await client.query('DELETE FROM warehouses WHERE id = $1', [id]);
    return true;
  } finally {
    client.release();
  }
}

module.exports = {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
};
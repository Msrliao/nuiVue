const { getClient } = require('./db');

// 构建树形菜单结构
function buildMenuTree(menuItems) {
  const menuMap = new Map();
  const rootMenus = [];

  // 首先将所有菜单项放入映射中
  menuItems.forEach(item => {
    menuMap.set(item.key, {
      ...item,
      children: []
    });
  });

  // 构建树形结构
  menuItems.forEach(item => {
    if (!item.parent_key) {
      // 顶级菜单
      rootMenus.push(menuMap.get(item.key));
    } else {
      // 子菜单
      const parent = menuMap.get(item.parent_key);
      if (parent) {
        parent.children.push(menuMap.get(item.key));
      }
    }
  });

  // 按order_index排序
  function sortByOrderIndex(menus) {
    menus.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        menu.children.sort((a, b) => a.order_index - b.order_index);
        sortByOrderIndex(menu.children);
      }
    });
  }

  rootMenus.sort((a, b) => a.order_index - b.order_index);
  sortByOrderIndex(rootMenus);

  return rootMenus;
}

// 获取所有菜单
async function getAllMenus() {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM menu_items');
    return buildMenuTree(result.rows);
  } finally {
    client.release();
  }
}

// 获取菜单详情
async function getMenuByKey(key) {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM menu_items WHERE key = $1', [key]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 创建菜单
async function createMenu(menuData) {
  const { key, label, type = 'menu', icon, parent_key, order_index = 0 } = menuData;
  const client = await getClient();
  try {
    const result = await client.query(
      `INSERT INTO menu_items (key, label, type, icon, parent_key, order_index)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [key, label, type, icon, parent_key, order_index]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// 更新菜单
async function updateMenu(key, menuData) {
  const { label, type, icon, parent_key, order_index } = menuData;
  const client = await getClient();
  try {
    const result = await client.query(
      `UPDATE menu_items
       SET label = $1, type = $2, icon = $3, parent_key = $4, order_index = $5, updated_at = CURRENT_TIMESTAMP
       WHERE key = $6
       RETURNING *`,
      [label, type, icon, parent_key, order_index, key]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// 删除菜单
async function deleteMenu(key) {
  const client = await getClient();
  try {
    await client.query('DELETE FROM menu_items WHERE key = $1', [key]);
    return true;
  } finally {
    client.release();
  }
}

// 批量操作菜单
async function batchOperation(operation, items) {
  const client = await getClient();
  try {
    switch (operation) {
      case 'create':
        for (const item of items) {
          await client.query(
            `INSERT INTO menu_items (key, label, type, icon, parent_key, order_index)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (key) DO UPDATE
             SET label = $2, type = $3, icon = $4, parent_key = $5, order_index = $6, updated_at = CURRENT_TIMESTAMP`,
            [item.key, item.label, item.type || 'menu', item.icon, item.parent_key, item.order_index || 0]
          );
        }
        break;
      
      case 'update':
        for (const item of items) {
          await client.query(
            `UPDATE menu_items
             SET label = $1, type = $2, icon = $3, parent_key = $4, order_index = $5, updated_at = CURRENT_TIMESTAMP
             WHERE key = $6`,
            [item.label, item.type, item.icon, item.parent_key, item.order_index, item.key]
          );
        }
        break;
      
      case 'delete':
        for (const item of items) {
          await client.query('DELETE FROM menu_items WHERE key = $1', [item.key]);
        }
        break;
      
      default:
        throw new Error('不支持的操作类型');
    }
    return true;
  } finally {
    client.release();
  }
}

module.exports = {
  getAllMenus,
  getMenuByKey,
  createMenu,
  updateMenu,
  deleteMenu,
  batchOperation
};
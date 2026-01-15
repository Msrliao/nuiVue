const { Pool } = require('pg');

// 连接配置
const pool = new Pool({
  user: 'neondb_owner',
  password: 'npg_fL5IWgQX6oBR',
  host: 'ep-sweet-hat-a16skty0.ap-southeast-1.aws.neon.tech',
  port: 5432,
  database: 'neondb',
  ssl: true // 启用 SSL 加密，对应 sslmode=require
});

// 菜单数据
const menuData = [
  // 顶级菜单
  {
    label: '且听风吟',
    key: 'hear-the-wind-sing',
    icon: 'BookIcon',
    parent_key: null,
    order_index: 0
  },
  {
    label: '1973年的弹珠玩具',
    key: 'pinball-1973',
    icon: 'BookIcon',
    parent_key: null,
    order_index: 1
  },
  {
    label: '寻羊冒险记',
    key: 'a-wild-sheep-chase',
    icon: 'BookIcon',
    parent_key: null,
    order_index: 2
  },
  {
    label: '舞，舞，舞',
    key: 'dance-dance-dance',
    icon: 'BookIcon',
    parent_key: null,
    order_index: 3
  },
  
  // 子菜单
  {
    label: '鼠',
    key: 'rat',
    parent_key: 'pinball-1973',
    order_index: 0
  },
  
  // 舞，舞，舞的子菜单
  {
    type: 'group',
    label: '人物',
    key: 'people',
    parent_key: 'dance-dance-dance',
    order_index: 0
  },
  {
    label: '叙事者',
    key: 'narrator',
    icon: 'PersonIcon',
    parent_key: 'people',
    order_index: 0
  },
  {
    label: '羊男',
    key: 'sheep-man',
    icon: 'PersonIcon',
    parent_key: 'people',
    order_index: 1
  },
  {
    label: '饮品',
    key: 'beverage',
    icon: 'WineIcon',
    parent_key: 'dance-dance-dance',
    order_index: 1
  },
  {
    label: '威士忌',
    key: 'whisky',
    parent_key: 'beverage',
    order_index: 0
  },
  {
    label: '食物',
    key: 'food',
    parent_key: 'dance-dance-dance',
    order_index: 2
  },
  {
    label: '三明治',
    key: 'sandwich',
    parent_key: 'food',
    order_index: 0
  },
  {
    label: '过去增多，未来减少',
    key: 'the-past-increases-the-future-recedes',
    parent_key: 'dance-dance-dance',
    order_index: 3
  }
];

// 执行操作
async function setupMenu() {
  let client;
  try {
    console.log('正在连接数据库...');
    client = await pool.connect();
    
    // 读取SQL文件并执行
    const fs = require('fs');
    const sqlContent = fs.readFileSync('./create-menu-table.sql', 'utf8');
    await client.query(sqlContent);
    console.log('菜单数据表创建成功！');
    
    // 清空现有数据（可选）
    await client.query('DELETE FROM menu_items');
    console.log('已清空现有菜单数据');
    
    // 插入菜单数据
    console.log('正在插入菜单数据...');
    for (const item of menuData) {
      await client.query(
        `INSERT INTO menu_items (key, label, type, icon, parent_key, order_index)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (key) DO UPDATE
         SET label = $2, type = $3, icon = $4, parent_key = $5, order_index = $6, updated_at = CURRENT_TIMESTAMP`,
        [item.key, item.label, item.type || 'menu', item.icon, item.parent_key, item.order_index]
      );
    }
    console.log('菜单数据插入成功！');
    
    // 验证数据
    console.log('\n验证插入的数据...');
    const result = await client.query('SELECT * FROM menu_items ORDER BY parent_key NULLS FIRST, order_index');
    console.log(`共插入 ${result.rows.length} 条菜单数据`);
    console.log('菜单数据列表:');
    result.rows.forEach(row => {
      const indent = row.parent_key ? '  ' : '';
      console.log(`${indent}${row.label} (${row.key}) - ${row.parent_key || '顶级'}`);
    });
    
  } catch (error) {
    console.error('操作失败:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    console.log('\n数据库连接已关闭');
  }
}

// 执行操作
setupMenu();

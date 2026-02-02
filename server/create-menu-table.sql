CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'menu',
  icon VARCHAR(255),
  parent_key VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_key ON menu_items(parent_key);
CREATE INDEX IF NOT EXISTS idx_menu_items_key ON menu_items(key);

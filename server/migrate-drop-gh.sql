-- 删除 employee_info 表的 gh 字段
-- 注意：这个操作会永久删除 gh 字段及其数据

-- 先删除 gh 字段的索引
DROP INDEX IF EXISTS idx_employee_gh;

-- 删除 gh 字段
-- 如果 gh 字段有 NOT NULL 约束，可能需要先处理现有数据
-- 这里我们直接删除该列
ALTER TABLE employee_info DROP COLUMN IF EXISTS gh;

-- 确认表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employee_info' 
ORDER BY ordinal_position;

-- 创建客户资料表
CREATE TABLE IF NOT EXISTS customer_info (
    id SERIAL PRIMARY KEY,
    khjc VARCHAR(255) NOT NULL,
    khjp VARCHAR(255) NOT NULL,
    khqc VARCHAR(255) NOT NULL,
    lxr VARCHAR(255),
    lxrjp VARCHAR(255),
    lxdh VARCHAR(100),
    zxdh VARCHAR(100),
   qtlxfs VARCHAR(255),
   lxdz TEXT,
   yhzhm VARCHAR(255),
   yhzh VARCHAR(255),
   ssyh VARCHAR(255),
   khlx VARCHAR[],
   jyfw VARCHAR[],
   ssqd VARCHAR[],
   fkfs VARCHAR[],
   mrwl VARCHAR[],
   mryhfs VARCHAR[],
   bz TEXT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_customer_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建更新时间触发器
CREATE TRIGGER update_customer_timestamp_trigger
BEFORE UPDATE ON customer_info
FOR EACH ROW
EXECUTE FUNCTION update_customer_timestamp();

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_customer_khjc ON customer_info(khjc);
CREATE INDEX IF NOT EXISTS idx_customer_khjp ON customer_info(khjp);
CREATE INDEX IF NOT EXISTS idx_customer_khqc ON customer_info(khqc);

-- 创建员工信息表
CREATE TABLE IF NOT EXISTS employee_info (
    id SERIAL PRIMARY KEY,
    gh VARCHAR(50) NOT NULL COMMENT '工号',
    xm VARCHAR(100) NOT NULL COMMENT '姓名',
    xb VARCHAR(10) COMMENT '性别',
    csrq DATE COMMENT '出生日期',
    mz VARCHAR(20) COMMENT '民族',
    lxdh VARCHAR(20) COMMENT '联系电话',
    idcard VARCHAR(18) COMMENT '身份证号',
    yx VARCHAR(100) COMMENT '邮箱',
    zw VARCHAR(100) COMMENT '职位',
    bm VARCHAR(100) COMMENT '部门',
    gzjb VARCHAR(20) COMMENT '工资级别',
    rzrq DATE COMMENT '入职日期',
    syq VARCHAR(20) COMMENT '试用期',
    htsjzrq DATE COMMENT '合同起始日期',
    htsjzzrq DATE COMMENT '合同终止日期',
    emergencyContact VARCHAR(100) COMMENT '紧急联系人',
    emergencyContactPhone VARCHAR(20) COMMENT '紧急联系人电话',
    bz TEXT COMMENT '备注',
    zt VARCHAR(20) DEFAULT '在职' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_employee_gh ON employee_info(gh);
CREATE INDEX IF NOT EXISTS idx_employee_xm ON employee_info(xm);
CREATE INDEX IF NOT EXISTS idx_employee_bm ON employee_info(bm);
CREATE INDEX IF NOT EXISTS idx_employee_zw ON employee_info(zw);

-- 插入示例数据
INSERT INTO employee_info (gh, xm, xb, csrq, mz, lxdh, idcard, yx, zw, bm, gzjb, rzrq, syq, htsjzrq, htsjzzrq, emergencyContact, emergencyContactPhone, bz, zt) VALUES
('EMP001', '张三', '男', '1990-01-01', '汉族', '13800138001', '110101199001011234', 'zhangsan@example.com', '工程师', '技术部', 'A1', '2020-01-01', '3个月', '2020-01-01', '2023-01-01', '张父', '13800138000', '无', '在职'),
('EMP002', '李四', '女', '1992-02-02', '汉族', '13900139002', '110101199202022345', 'lisi@example.com', '设计师', '设计部', 'A2', '2020-02-02', '3个月', '2020-02-02', '2023-02-02', '李母', '13900139000', '无', '在职'),
('EMP003', '王五', '男', '1988-03-03', '汉族', '13700137003', '110101198803033456', 'wangwu@example.com', '经理', '销售部', 'B1', '2019-03-03', '6个月', '2019-03-03', '2024-03-03', '王妻', '13700137000', '无', '在职');

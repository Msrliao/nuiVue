// types/warehouse.ts
export interface WarehouseData {
    id: number
    ckmc: string
    fzr?: string
    lxdh?: string
    bz?: string
    created_at: string
    updated_at: string
  }

// types/partInfo.ts
export interface PartInfoData {
    id: number
    xm: string // 配件名称
    bm: string // 编码
    mc: string // 名称
    jp: string // 简拼
    cx: string[] // 车型
    cxjp?: string // 车型简拼
    dw: string // 单位
    pp?: string // 品牌
    gg?: string[] // 规格
    kw?: string // 库位
    kw_display?: string // 库位显示名称
    ysjj?: number // 原始进价
    bz?: string // 备注
    created_at: string
    updated_at: string
  }

// API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp?: number;
}
export interface custData {
  id: number
  khjc: string; // 客户简称
  khjp: string; // 客户简拼
  khqc: string; // 客户全称
  lxr: string; // 联系人
  lxdh: string; // 联系电话
  zxdh: string; // 座机电话
  qtlxfs: string; // 其他联系方式
  lxdz: string; // 联系地址
  yhzhm: string; // 银行账户名
  yhzh: string; // 银行账号
  ssyh: string; // 所属银行
  khlx: string[]; // 客户类型
  jyfw: string[]; // 经营范围
  ssqd: string[]; // 所属地区
  fkfs: string[]; // 付款方式
  mrwl: string[]; // 默认物流
  mryhfs: string[]; // 默认运货方式
  bz: string; // 备注
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
  key?: number; // 行标识
}
export interface empData {
  id: number
  xm: string; // 姓名
  xmjp: string; // 姓名拼音
  xb: string; // 性别
  csrq: string; // 出生日期
  mz: string; // 民族
  lxdh: string; // 联系电话
  idcard: string; // 身份证号
  yx: string; // 邮箱
  zw: string; // 职位
  bm: string; // 部门
  gzjb: string; // 工资级别
  rzrq: string; // 入职日期
  syq: string; // 试用期
  htsjzrq: string; // 合同起始日期
  htsjzzrq: string; // 合同终止日期
  emergencyContact: string; // 紧急联系人
  emergencyContactPhone: string; // 紧急联系人电话
  bz: string; // 备注
  zt: string; // 状态
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
}
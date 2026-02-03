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
export interface RowData {
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
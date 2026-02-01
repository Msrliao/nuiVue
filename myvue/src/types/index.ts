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
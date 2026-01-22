
// 仓库资料表的接口
export interface WarehouseData {
    id: number
    ckmc: string
    fzr?: string
    lxdh?: string
    bz?: string
    created_at?: string
    updated_at?: string
  }
// 返回值的接口
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp?: number;
}

// 仓位数据类型
export interface PositionData {
  id?: number;
  position_name: string;
  parent_id?: number;
  warehouse_id?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
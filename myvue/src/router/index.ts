//import Quote from '@/views/sales/Quote.vue' //引入组件
import { defineAsyncComponent,markRaw } from 'vue'

//import Purchase from '@/views/Purchase.vue' //引入组件

const componentMap = {
    // sales 销售管理
    // '报价': markRaw(defineAsyncComponent(() => import('@/views/sales/quotation/index.vue'))),
    // '销售开单': markRaw(defineAsyncComponent(() => import('@/views/sales/sales/index.vue'))),
    
    // basicInfor 基本资料
    '配件资料': markRaw(defineAsyncComponent(() => import('@/views/base/base_part/index.vue'))),
    '客户资料': markRaw(defineAsyncComponent(() => import('@/views/base/base_cust/index.vue'))),
    '仓库管理': markRaw(defineAsyncComponent(() => import('@/views/base/base_ware/index.vue'))),
    '物流资料': markRaw(defineAsyncComponent(() => import('@/views/base/base_logistics/index.vue'))),
    '员工资料': markRaw(defineAsyncComponent(() => import('@/views/base/base_emp/index.vue'))),
    // sales 销售管理
    '报价': markRaw(defineAsyncComponent(() => import('@/views/sales/sales_quote/index.vue'))),
    '销售开单': markRaw(defineAsyncComponent(() => import('@/views/sales/sales_order/index.vue'))),
    '销售退货': markRaw(defineAsyncComponent(() => import('@/views/sales/sales_return/index.vue'))),
    '销售查询': markRaw(defineAsyncComponent(() => import('@/views/sales/sales_query/index.vue'))),
    '一键出入库': markRaw(defineAsyncComponent(() => import('@/views/sales/sales_stock_io/index.vue'))),
    // purchase 进货管理
    '采购进货': markRaw(defineAsyncComponent(() => import('@/views/purchase/purchase_in/index.vue'))),
    '采购单据查询': markRaw(defineAsyncComponent(() => import('@/views/purchase/purchase_query/purchase_order_q/index.vue'))),
    '采购明细查询': markRaw(defineAsyncComponent(() => import('@/views/purchase/purchase_query/purchase_detail_q/index.vue'))),
    '采购退货': markRaw(defineAsyncComponent(() => import('@/views/purchase/purchase_out/index.vue'))),
    '预采购': markRaw(defineAsyncComponent(() => import('@/views/purchase/purchase_pre/index.vue'))),
    '预退货': markRaw(defineAsyncComponent(() => import('@/views/purchase/purchase_pre_ret/index.vue'))),

};
export {componentMap} // 导出路由器
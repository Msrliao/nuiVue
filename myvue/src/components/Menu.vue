<template>
      <n-menu
        :icon-size = '40'
        v-model:value="activeKey"
        mode="horizontal"
        :options="menuOptions"
        responsive
        @update:value="handleUpdateValue"
      />
</template>

<script setup lang="ts" name="导航">
import type { MenuOption } from 'naive-ui'
import type { Component } from 'vue'
import {
  BookOutline as BookIcon,
  PersonOutline as PersonIcon,
  WineOutline as WineIcon,
  ChatbubblesOutline as ChatbubblesIcon,
  CubeOutline as CubeIcon,
  EnterOutline as EnterIcon,
  BarChartOutline as BarChartIcon,
  Calculator as CalculatorIcon,
  DocumentTextOutline as DocumentTextIcon,
  Cog as CogIcon

} from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import { h, ref } from 'vue'
import emitter from "@/utils/emitter"


// 处理图标显示
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}
// 菜单数据
const menuOptions: MenuOption[] = [
  {
    label: '销售管理',
    key: 'sales', // 销售管理
    icon: renderIcon(ChatbubblesIcon),
    children: [
      { key: 'sales_quote', label: '报价' },
      { key: 'sales_order', label: '销售开单' },
      { key: 'sales_query', label: '销售查询' },
      { key: 'sales_return', label: '销售退货' },
      { key: 'sales_stock_io', label: '一键出入库' },
    ],
  },
  {
    label: '采购管理',
    key: 'purchase', // 进货管理
    icon: renderIcon(EnterIcon),
    children: [
      { key: 'purchase_in', label: '采购进货' },
      { key: 'purchase_out', label: '采购退货' },
      { 
        key: 'purchase_query', 
        label: '采购查询',
        children: [
          { key: 'purchase_order_q', label: '采购单据查询' },
          { key: 'purchase_detail_q', label: '采购明细查询' },
        ]
      },
      { key: 'purchase_pre', label: '预采购' },
      { key: 'purchase_pre_ret', label: '预退货' },
    ],
  },
  {
    label: '库存管理',
    key: 'stock', // 库存管理
    icon: renderIcon(CubeIcon),
    children: [
      { key: 'stock_query', label: '库存查询' },
      { key: 'stock_check', label: '库存盘点' },
      { key: 'stock_trans', label: '库存调拨' },
      { key: 'stock_split', label: '拆分捆绑' },
      { key: 'stock_alarm', label: '库存报警' },
      {
        key: 'stock_loss',
        icon: renderIcon(BookIcon),
        label: '报损报溢',
        children: [
          { key: 'stock_loss_sub', label: '报损' },
          { key: 'stock_over_sub', label: '报溢' },
        ],
      },
    ],
  },
  {
    label: '统计报表',
    key: 'report', // 统计报表
    icon: renderIcon(BarChartIcon),
    children: [
      {
        type: 'group',
        label: '人物',
        key: 'report_people',
        children: [
          { key: 'report_sales', label: '销售统计' },
          { key: 'report_purchase', label: '进货统计' },
          { key: 'report_stock', label: '库存统计' },
          { key: 'report_finance', label: '财务统计' },
          { key: 'report_supplier', label: '供货商统计' },
          { key: 'report_customer', label: '客户统计' },
        ]
      },
      {
        label: '账务管理',
        key: 'report_fin',
        icon: renderIcon(WineIcon),
        children: [ 
          { key: 'report_fin_rec', label: '应收款管理' },
          { key: 'report_fin_pay', label: '应付款管理' },
          { key: 'report_fin_all', label: '账务综合管理' },
          { key: 'report_fin_collect', label: '代收管理' },
          { key: 'report_fin_fee', label: '其他费用管理' },
        ]
      },
      {
        label: '基本资料',
        key: 'report_base',
        children: [ 
          { key: 'report_base_part', label: '配件资料' },
          { key: 'report_base_cust', label: '客户资料' },
          { key: 'report_base_ware', label: '仓库管理' },
          { key: 'report_base_log', label: '物流资料' },
          { key: 'report_base_emp', label: '员工资料' },
        ]
      },
      {
        label: '系统设置',
        key: 'report_sys',
        children: [ 
          { key: 'report_sys_comp', label: '公司信息' },
          { key: 'report_sys_remind', label: '提醒设置' },
          { key: 'report_sys_op', label: '操作员管理' },
          { key: 'report_sys_backup', label: '系统资料备份/恢复' },
          { key: 'report_sys_pwd', label: '修改密码' },
          { key: 'report_sys_design', label: '报表设计' },
          { key: 'report_sys_def', label: '默认设置' },
        ]
      }
    ]
  },
  { 
    key: 'finance',
    icon: renderIcon(CalculatorIcon),
    label: '账务管理',
    children: [ 
      { key: 'finance_rec', label: '应收款管理' },
      { key: 'finance_pay', label: '应付款管理' },
      { key: 'finance_all', label: '账务综合管理' },
      { key: 'finance_collect', label: '代收管理' },
      { key: 'finance_fee', label: '其他费用管理' },
    ]
  },
  { 
    key: 'base',
    icon: renderIcon(DocumentTextIcon),
    label: '基本资料',
    children: [ 
      { key: 'base_part', label: '配件资料' },
      { key: 'base_cust', label: '客户资料' },
      { key: 'base_ware', label: '仓库管理' },
      { key: 'base_log', label: '物流资料' },
      { key: 'base_staff', label: '员工资料' },
    ]
  },
  { 
    key: 'sys',
    icon: renderIcon(CogIcon),
    label: '系统设置',
    children: [ 
      { key: 'sys_comp', label: '公司信息' },
      { key: 'sys_remind', label: '提醒设置' },
      { key: 'sys_op', label: '操作员管理' },
      { key: 'sys_backup', label: '系统资料备份/恢复' },
      { key: 'sys_pwd', label: '修改密码' },
      { key: 'sys_design', label: '报表设计' },
      { key: 'sys_def', label: '默认设置' },
    ]
  }
]
// 当点击菜单时，触发添加分页事件
function handleUpdateValue(key: string, item: MenuOption) {
  emitter.emit("add-tabs",item)

}
const activeKey = ref<string | null>(null)
</script>
<style scoped>

</style>
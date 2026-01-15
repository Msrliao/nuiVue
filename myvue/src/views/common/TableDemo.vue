<template>
  <n-data-table
    :columns="columns"
    :data="data"
    :summary="summary"
  />
</template>

<script setup lang="ts">
import type { DataTableColumns, DataTableCreateSummary } from 'naive-ui'
import { h } from 'vue'

interface RowData {
  key: number
  name: string
  age: number
  weight: number; // 体重
  address: string
}

function createColumns(): DataTableColumns<RowData> {
  return [
  
    {
      title: 'Name',
      key: 'name',
      sorter: 'default'
    },
    {
      title: 'Age',
      key: 'age',
      sorter: 'default'
    },
    {
      title: 'Address',
      key: 'address'
    },{
      title:"weight",
      key:"weight"
    }
  ]
}

function createData(): RowData[] {
  return [
    {
      key: 0,
      name: 'John Brown',
      age: 32,
      weight:50,
      address: 'New York No. 1 Lake Park'
    },
    {
      key: 1,
      name: 'Jim Green',
      age: 42,
      weight:50,
      address: 'London No. 1 Lake Park'
    },
    {
      key: 2,
      name: 'Joe Black',
      age: 30,
      weight:50,
      address: 'Sidney No. 1 Lake Park'
    }
  ]
}

const createSummary: DataTableCreateSummary = (pageData) => {
   // 核心修改：同时计算年龄总和 + 体重总和
   const { ageTotal, weightTotal } = (pageData as unknown as RowData[]).reduce(
     (prevValue, row) => {
       return {
         ageTotal: prevValue.ageTotal + row.age, // 累加年龄
         weightTotal: prevValue.weightTotal + row.weight // 累加体重
       };
     },
     { ageTotal: 0, weightTotal: 0 } // 初始值：两个字段都从 0 开始
   );
   return {
     name: {
       value: h(
         'span',
         { style: { color: 'red' } }, // 外层样式，子元素默认继承红色
         [
           // 数组元素1：「合计：」文本
           '合计：',
           // 数组元素2：年龄汇总值
           `年龄 ${ageTotal}cm`,
           // 数组元素3：分隔符（可选，优化排版）
           '，',
           // 数组元素4：体重汇总值（新增）
           `体重 ${weightTotal}kg`
           // 拓展：如需给体重单独设置样式，可嵌套 h 函数
           // h('span', { style: { color: 'blue', marginLeft: '8px' } }, `体重 ${weightTotal}kg`)
         ]
       ),
       colSpan: 3
     }
   };
 };

const summary = createSummary
const data = createData()
const columns = createColumns()
</script>
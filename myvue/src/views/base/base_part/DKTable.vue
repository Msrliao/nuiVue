<template>
  <n-flex>

  <n-data-table
  v-model:checked-row-keys="checkedRowKeys"
    :columns="columns"
    :data="props.data"
    :row-props="rowProps"
    :loading="props.loading"
    striped
    :row-key="(row: DKRowData) => row.key"
    :single-line="true"
  />
  <n-dropdown
    placement="bottom-start"
    trigger="manual"
    :x="x"    
    :y="y"    
    :options="options"    
    :show="showDropdown"    
    :on-clickoutside="onClickoutside"    
    @select='handleSelect'
  />
  </n-flex>

</template>

<script setup lang="ts">
import type { DataTableColumns, DropdownOption } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { h, nextTick, ref } from 'vue'

// 定义大库数据接口
interface DKRowData {
  key: number
  [key: string]: any
}
  // 定义默认选中项
const checkedRowKeys = ref<number[]>([])
// 表格选中的数据
const currentRow = ref<DKRowData | null>(null)

// 接收父组件传递的数据和加载状态
const props = defineProps<{
  data: DKRowData[]
  loading: boolean
}>()

// 创建表格列
function createColumns(): DataTableColumns<DKRowData> {
  return [
    {
      type: 'selection',
      multiple: false,
    },
    {
      title: '序号',
      key: 'xh',
      sorter: 'default',
      render: (row, index) => index + 1
    },
    {
      title: '编码',
      key: '商品编码',
      sorter: 'default'
    },
    {
      title: '名称',
      key: '商品名称'
    },{
      title:"车型",
      key:"车型"
    },{
      title:"总库存",
      key:"总库存"
    },{
      title:"品牌",
      key:"品牌"
    },{
      title:"批发价",
      key:"批发价"
    },{
      title:"零售价",
      key:"零售价"
    },{
      title:"调拨价",
      key:"调拨价"
    },{
      title:"进价",
      key:"参考进价"
    }
  ]
}

// 创建表格列
const columns = createColumns()

const options: DropdownOption[] = [
  {
    label: '编辑',
    key: 'edit'
  },
  {
    label: () => h('span', { style: { color: 'red' } }, '删除'),
    key: 'delete'
  }                        
]

const message = useMessage()
const showDropdownRef = ref(false)
const xRef = ref(0)
const yRef = ref(0)

const showDropdown = showDropdownRef
const x = xRef
const y = yRef

function handleSelect() {
  showDropdownRef.value = false
}
function onClickoutside() {
  showDropdownRef.value = false
}

function rowProps(row: DKRowData) {
  return {
    onContextmenu: (e: MouseEvent) => {
      message.info(JSON.stringify(row, null, 2))
      e.preventDefault()
      showDropdownRef.value = false
      nextTick().then(() => {
        showDropdownRef.value = true
        xRef.value = e.clientX
        yRef.value = e.clientY
      })
    },
    // 左键点击事件
    onClick: (e: MouseEvent) => {
      // 阻止事件冒泡和默认行为
      e.preventDefault()
      e.stopPropagation()
      // 保存当前左键点击的行数据
      currentRow.value = row
      checkedRowKeys.value = [row.key]
    }
  }
}
</script>
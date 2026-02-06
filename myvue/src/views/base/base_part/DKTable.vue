<template>
  <n-flex>

  <n-data-table
    v-model:checked-row-keys="checkedRowKeys"
    :columns="columns"
    :data="tableData"
    :row-props="rowProps"
    :loading="props.loading"
    striped
    :row-key="(row: DKRowData) => row.__index"
    :single-line="true"
    :max-height="maxHeight"
    :scroll-x="scrollX"
    virtual-scroll
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
import { h, nextTick, ref, computed } from 'vue'

// 定义大库数据接口
interface DKRowData {
  __index: number
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

// 定义事件
const emit = defineEmits<{
  (e: 'select', data: DKRowData | null): void
}>()

// 为数据添加唯一的 __index 字段
const tableData = computed(() => {
  return props.data.map((row, index) => ({
    ...row,
    __index: index
  }))
})

// 创建表格列
function createColumns(): DataTableColumns<DKRowData> {
  return [
    {
      type: 'selection',
      width: 50
    },
    {
      title: '序号',
      key: 'xh',
      width: 60,
      sorter: 'default',
      render: (row, index) => index + 1
    },
    {
      title: '编码',
      key: '商品编码',
      width: 120,
      sorter: 'default'
    },
    {
      title: '名称',
      key: '商品名称',
      width: 200
    },{
      title:"车型",
      key:"车型",
      width: 150
    },{
      title:"总库存",
      key:"总库存",
      width: 80
    },{
      title:"品牌",
      key:"品牌",
      width: 100
    },{
      title:"批发价",
      key:"批发价",
      width: 100
    },{
      title:"零售价",
      key:"零售价",
      width: 100
    },{
      title:"调拨价",
      key:"调拨价",
      width: 100
    },{
      title:"进价",
      key:"参考进价",
      width: 100
    }
  ]
}

// 创建表格列
const columns = createColumns()
// 表格最大高度
const maxHeight = computed(() => {
  // 视口高度减去顶部搜索区域(约60px)、分页区域(约60px)和其他边距(约20px)
  return window.innerHeight - 140
})
// 合计表格宽度
const scrollX = computed(() => {
  return columns.reduce((sum, col) => sum + ((col as any).width || 0), 0)
})
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
      // 使用 __index 作为选中行的 key
      if(checkedRowKeys.value.length){
        checkedRowKeys.value = [row.__index]
        // 通知父组件选中行变化
      emit('select', row)
      }else{
        checkedRowKeys.value=[]
        // 通知父组件选中行变化
        emit('select', null)
      }
      
      
    }
  }
}
</script>
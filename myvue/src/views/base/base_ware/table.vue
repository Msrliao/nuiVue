<template>
  <n-flex>
    <!-- 数据表格组件 -->
    <n-data-table
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="warehouseData"
      :row-props="rowProps"
      :loading="loadingRef"
      striped
      :row-key="(row: WarehouseData) => row.id"
    />
    <!-- 右键单击组件 -->
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

<script setup lang="ts" name ='仓库显示表格'>
import type { DataTableColumns, DropdownOption } from 'naive-ui'
import { useMessage, useDialog } from 'naive-ui'
import { h, nextTick, ref, onMounted, onUnmounted } from 'vue'
import apiClient from '@/utils/apiClient'
import { useSharedStore } from '@/stores/useBaseWareStore'
import type {WarehouseData, ApiResponse} from '@/types'

const emit = defineEmits<{
  (e: 'edit', data: WarehouseData): void
}>()

// 定义信息框
const message = useMessage()
// 定义对话框
const dialog = useDialog()
// 定义表格加载
const loadingRef = ref(false)
//2. 定义仓库数据
const warehouseData = ref<WarehouseData[]>([])
// 定义默认选中项
const checkedRowKeys = ref<number[]>([])
// 定位表格选择的状态管理
const SharedStore=useSharedStore()
// 监控状态管理变化
const unsubscribe = SharedStore.$subscribe((mutation, state) => {
  // console.log('状态变化了！')  
  console.log('变化详情：', mutation)  
  console.log('最新状态：', state)
})

// 3.初始化数据
async function fetchWarehouseData() {
  loadingRef.value = true
  try {
    // 获取仓库列表
    // 响应拦截器已经处理了响应，直接使用结果
    const warehouseList = await apiClient.get('/v1/warehouses') as WarehouseData[]
    
    // 直接使用响应拦截器处理后的数据
    warehouseData.value = warehouseList
    if(warehouseList.length>0 && warehouseList[0]){
      checkedRowKeys.value =[warehouseList[0].id]
      SharedStore.row = warehouseList[0]
    }

  } catch (error: any) {
    message.error(error.message || '获取仓库数据失败')
  }
  loadingRef.value = false
}

// 表格列配置
function createColumns(): DataTableColumns<WarehouseData> {
  return [  
    {
      type: 'selection',
      multiple: false,
    },
    {
      title: '仓库名称',
      key: 'ckmc',
      sorter: 'default'
    },
    {
      title: '负责人',
      key: 'fzr',
      sorter: 'default'
    },
    {
      title: '联系电话',
      key: 'lxdh'
    },
    {
      title: '备注',
      key: 'bz'
    },
    {
      title: '创建时间',
      key: 'created_at',
      sorter: 'default'
    }
  ]
}

// 赋值表头
const columns = createColumns()

// 右键单击选项表头
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
// 定义右键点击的行数据
const currentRow = ref<WarehouseData | null>(null)
// 定义右键组件显示
const showDropdownRef = ref(false)
// 定义右键组件弹出坐标
const xRef = ref(0)
const yRef = ref(0)

// 赋值右键组件显示
const showDropdown = showDropdownRef

// 赋值右键组件弹出坐标
const x = xRef
const y = yRef

// 右键菜单选中事件
function handleSelect(key: string) {
  if (key === 'edit' && currentRow.value) {
    // 触发编辑事件，传递当前行数据
    emit("edit", currentRow.value)
    
  } else if (key === 'delete' && currentRow.value) {
    // 显示删除确认对话框
    dialog.warning({
      title: '确认删除',
      content: `确定要删除仓库"${currentRow.value.ckmc}"吗？此操作不可恢复。`,
      positiveText: '删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          // 调用API删除仓库
          await apiClient.delete(`/v1/warehouses/${currentRow.value?.id}`)
          message.success('仓库删除成功')
          // 刷新表格数据
          refreshData()
        } catch (error: any) {
          message.error(error.message || '仓库删除失败')
        }
      }
    })
  }
  showDropdownRef.value = false
}

// 单击外部
function onClickoutside() {
  showDropdownRef.value = false
   currentRow.value = null // 点击外部时清空当前行
}
// 右键触发事件
function rowProps(row: WarehouseData) {
  return {
    // 右键点击事件
    onContextmenu: (e: MouseEvent) => {
      // console.log('row',row)
      // 保存当前右键点击的行数据
      currentRow.value = row
      // message.info(JSON.stringify(row, null, 2))
      e.preventDefault()
      showDropdownRef.value = false
      nextTick().then(() => {
        showDropdownRef.value = true
        xRef.value = e.clientX
        yRef.value = e.clientY
      })
    },
    // 左键点击事件 - 使用原生事件
    onClick: (e: MouseEvent) => {
      // 阻止事件冒泡，避免触发表格的点击事件
      e.stopPropagation()
      // console.log('行被点击了:', row)
      
      // 获取当前行数据到pinia
      SharedStore.row=row
      // 设置默认选中项
      checkedRowKeys.value=[row.id]
      
      // 高亮当前选中行
      currentRow.value = row
    }
  }
}

// 刷新数据
function refreshData() {
  fetchWarehouseData()
}

// 暴露方法给父组件
defineExpose({
  refreshData
})

// 组件挂载时获取数据
onMounted(() => {
  fetchWarehouseData()
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  unsubscribe()
})

</script>
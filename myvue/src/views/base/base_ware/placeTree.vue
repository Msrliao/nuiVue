<template>
<n-space vertical>
    <n-spin :show="show">
      <div class="place-tree-container">
        <n-tree
          block-line
          :data="treeData"
          :default-expanded-keys="defaultExpandedKeys"
          expand-on-click
          :node-props="nodeProps"
        />
      </div>
      <!-- 右键单击组件 -->
    <n-dropdown
      trigger="manual"
      placement="bottom-start"
      :show="showDropdownRef"
      :options="options"
      :x="xRef"
      :y="yRef"
      @select="handleSelect"
      @clickoutside="handleClickoutside"
    />
  </n-spin>
</n-space>
</template>

<script setup lang="ts">

import type { DropdownOption, TreeOption } from 'naive-ui'
import {h, ref, onMounted, onUnmounted, nextTick } from 'vue'
import apiClient from '@/utils/apiClient'
import emitter from '@/utils/emitter'

// 定义树形数据
const treeData = ref<TreeOption[]>([])
// 默认展开的节点
const defaultExpandedKeys = ref<string[]>([])
// 当前选中的仓库ID
const selectedWarehouseId = ref<arr | null>(null)
const show=ref(false)

// 将扁平数据转换为树形结构
function buildTree(nodes: any[], parentId: number | null = null): TreeOption[] {
  return nodes
    .filter(node => node.parent_id === parentId)
    .map(node => ({
      label: node.position_name,
      key: node.id.toString(),
      children: buildTree(nodes, node.id)
    }))
}

// 获取仓位数据
async function fetchPositionData(tableSelectedID:string) {
  show.value =true
  try {
    let response
    if (tableSelectedID) {
      // 获取指定仓库的仓位
      response = await apiClient.get(`/positions/warehouse/${tableSelectedID}`)
    } 
    
    if (response && response.code === 200) {
      // 构建树形结构
      treeData.value = buildTree(response.data)
      // 展开所有一级节点
      defaultExpandedKeys.value = treeData.value.map(item => item.key)
    }
  } catch (error) {
    console.error('获取仓位数据失败:', error)
  }
  show.value =false
}
const showDropdownRef = ref(false)
const optionsVal= ref([])
const xRef = ref(0)
const yRef = ref(0)
// 点击事件
function nodeProps({ option }: { option: TreeOption }) {
  return {
    onClick() {
      
    },
    onContextmenu(e: MouseEvent): void {
      optionsVal.value = option
      e.preventDefault()
      showDropdownRef.value = false
      nextTick().then(() => {
        showDropdownRef.value = true
        xRef.value = e.clientX
        yRef.value = e.clientY
      })      
      // message.info(JSON.stringify(row, null, 2))
      // e.preventDefault()
     
      
      // emitter.emit('showAddPlaceModal', option.value)
    }
  }
}
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
// 右键菜单选中事件
function handleSelect(key: string) {
  
  if (key === 'edit' && optionsVal.value) {
    console.log('optionsVal',optionsVal.value)
    // 触发编辑事件，传递当前行数据
    emitter.emit("showAddPlaceModal", optionsVal.value,selectedWarehouseId.value)
    
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
          await apiClient.delete(`/warehouses/${currentRow.value?.id}`)
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

// 监听仓库选择事件
function handleWarehouseSelect(warehouse:arr) {
  
  selectedWarehouseId.value = warehouse
  fetchPositionData()
}

// 组件挂载时获取数据
onMounted(() => {

  // 监听数据刷新事件
  emitter.on('refreshPositionData', fetchPositionData)
  // 监听仓库选择事件
  emitter.on('selectWarehouse', handleWarehouseSelect)
  // emitter.on('warehouseRowClick', handleWarehouseSelect)
  
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  emitter.off('refreshPositionData', fetchPositionData)
  emitter.off('selectWarehouse', handleWarehouseSelect)
  // emitter.off('warehouseRowClick', handleWarehouseSelect)
})
</script>

<style scoped>
.place-tree-container {
  height: 100%;
  overflow: auto;
}
</style>
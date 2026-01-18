<template>
  <div class="place-tree-container">
    <n-tree
      block-line
      :data="treeData"
      :default-expanded-keys="defaultExpandedKeys"
      expand-on-click
    />
  </div>
</template>

<script setup lang="ts">
import type { TreeOption } from 'naive-ui'
import { ref, onMounted, onUnmounted } from 'vue'
import apiClient from '@/utils/apiClient'
import emitter from '@/utils/emitter'

// 定义树形数据
const treeData = ref<TreeOption[]>([])
// 默认展开的节点
const defaultExpandedKeys = ref<string[]>([])
// 当前选中的仓库ID
const selectedWarehouseId = ref<number | null>(null)

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
async function fetchPositionData() {
  try {
    let response
    if (selectedWarehouseId.value) {
      // 获取指定仓库的仓位
      response = await apiClient.get(`/positions/warehouse/${selectedWarehouseId.value}`)
    } else {
      // 获取所有仓位
      response = await apiClient.get('/positions')
    }
    
    if (response.code === 200) {
      // 构建树形结构
      treeData.value = buildTree(response.data)
      // 展开所有一级节点
      defaultExpandedKeys.value = treeData.value.map(item => item.key)
    }
  } catch (error) {
    console.error('获取仓位数据失败:', error)
  }
}

// 监听仓库选择事件
function handleWarehouseSelect(warehouseId: number) {
  selectedWarehouseId.value = warehouseId
  fetchPositionData()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPositionData()
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
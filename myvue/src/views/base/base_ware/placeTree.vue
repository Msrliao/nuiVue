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
     
    />
  </n-spin>
</n-space>
</template>

<script setup lang="ts">

import type { DropdownOption, TreeOption } from 'naive-ui'
import { useMessage, useDialog } from 'naive-ui'

import {h, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import apiClient from '@/utils/apiClient'
import { useSharedStore } from '@/stores/useBaseWareStore'
import { storeToRefs } from 'pinia'

const emit = defineEmits<{
  (e: 'edit', data: TreeOption): void
  (e: 'add', data: TreeOption): void
}>()


// 定义树形数据
const treeData = ref<TreeOption[]>([])
// 默认展开的节点
const defaultExpandedKeys = ref<string[]>([])
// 当前选中的仓库ID
const {row: tableSelectedData} = storeToRefs(useSharedStore())
// 加载层
const show=ref(false)
const dialog = useDialog()
const message = useMessage()

// 监听仓库选择变化
watch(() => tableSelectedData.value, () => {
  fetchPositionData()
}, { deep: true })


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
  show.value =true
  try {
    let positions = []
    if (tableSelectedData.value.id) {
      // 获取指定仓库的仓位
      // 响应拦截器已经处理了响应，直接使用结果
      positions = await apiClient.get(`/v1/positions/warehouse/${tableSelectedData.value.id}`)
    }
    
    // 构建树形结构
    treeData.value = buildTree(positions)
    // 展开所有一级节点
    defaultExpandedKeys.value = treeData.value.map(item => item.key)
  } catch (error) {
    console.error('获取仓位数据失败:', error)
  }
  show.value =false
}
const showDropdownRef = ref(false)
const optionsVal= ref<TreeOption>(null)
const xRef = ref(0)
const yRef = ref(0)
// 点击事件
function nodeProps({ option }: { option: TreeOption }) {
  return {
    // 左键点击
    onClick() {
      
    },
    // 右键点击
    onContextmenu(e: MouseEvent): void {
      console.log('右键点击:', option)
      optionsVal.value = option
      e.preventDefault()
      showDropdownRef.value = false
      nextTick().then(() => {
        showDropdownRef.value = true
        xRef.value = e.clientX
        yRef.value = e.clientY
      })      
      
    }
  }
}
// 右键单击选项表头
const options: DropdownOption[] = [
  {
    label: '添加',
    key: 'add'
  },
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
  
  if (key === 'add' && optionsVal.value) {
    // 触发添加事件，传递当前节点数据
    emit("add", optionsVal.value)
    
  } else if (key === 'edit' && optionsVal.value) {
    // 触发编辑事件，传递当前节点数据
    emit("edit", optionsVal.value)
    
  } else if (key === 'delete' && optionsVal.value) {
    // 显示删除确认对话框
    dialog.warning({
      title: '确认删除',
      content: `确定要删除仓库"${optionsVal.value.label}"吗？此操作不可恢复。`,
      positiveText: '删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          // 调用API删除仓库
          await apiClient.delete(`/v1/positions/${optionsVal.value?.key}`)
          message.success('仓库删除成功')
          // 刷新表格数据
          fetchPositionData()
        } catch (error: any) {
          message.error(error.message || '仓库删除失败')
        }
      }
    })
  }
  showDropdownRef.value = false
}

// 监听仓库选择事件
function handleWarehouseSelect() {
  
  fetchPositionData()
}

// 组件挂载时获取数据
onMounted(() => {
  // 初始获取数据
  fetchPositionData()
})

// 组件卸载时清理
onUnmounted(() => {
  // 清理代码
})

// 暴露方法给父组件
defineExpose({
  fetchPositionData
})
</script>

<style scoped>
.place-tree-container {
  height: 100%;
  overflow: auto;
}
</style>
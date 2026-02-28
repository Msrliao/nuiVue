<template>
  <n-data-table
    style="width: 100%;"
    :columns="props.columns"
    :data="props.data"
    :row-props="rowProps"
    :loading="props.loading"
  />
</template>
<script setup lang="ts" name="选择表格">
import { defineProps, defineEmits } from 'vue'
import type { DataTableColumns, DropdownOption } from 'naive-ui'
import type { PartInfoData } from '@/types'

// 定义事件
const emit = defineEmits<{
  (e: 'sendSelectData', key: number): void
}>()

// 点击表格行触发事件，发送选中行的key值
function rowProps(row: RowData) {
  return {
    // 左键点击事件 - 使用原生事件
    onClick: (e: MouseEvent) => {
      // 阻止事件冒泡，避免触发表格的点击事件
      e.stopPropagation()
      emit('sendSelectData', row.id)
    }
  }
}
// const props = defineProps<{
//     columns: DataTableColumns<PartInfoData>
//     data: PartInfoData[]
//     loading: boolean
// }>()
const props = defineProps([
    'columns',
    'data',
    'loading'
])

</script>
<style scoped>
:deep( th) {
  color: rgba(255, 0, 0, 0.75) !important;
  font-size: 20px;
  font-weight: bold;
}
</style>
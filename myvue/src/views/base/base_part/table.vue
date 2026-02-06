<template>
  <n-flex>

  <n-data-table
    :columns="columns"
    :data="props.data"
    :row-props="rowProps"
    :loading="props.loading"
    striped
    :row-key="(row: PartInfoData) => row.id"
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
import { useMessage, useDialog } from 'naive-ui'
import { h, nextTick, ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'
import type { PartInfoData } from '@/types'

// 接收父组件传递的数据和加载状态
const props = defineProps<{
  data: PartInfoData[]
  loading: boolean
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'edit', data: PartInfoData): void
}>()

// 定义右键点击的行数据
const currentRow = ref<PartInfoData | null>(null)


function createColumns(): DataTableColumns<PartInfoData> {
  return [
  
    {
      title: '序号',
      key: 'xh',
      sorter: (a, b) => a.id - b.id,
      render: (row, index) => index + 1,
      width:20
    },
    {
      title: '配件序码',
      key: 'xm',
      sorter: 'default',
      width:80
    },
    {
      title: '配件编码',
      key: 'bm',
      sorter: 'default',
      width:80
    },{
      title:"配件名称",
      key:"mc",
      sorter: 'default',
      width:80
    },{
      title:"适用车型",
      key:"cx",
      render: (row) => Array.isArray(row.cx) ? row.cx.join(' | ') : row.cx,
      width:80
    },{
      title:"品牌",
      key:"pp",
      sorter: 'default',
      width:80
    },{
      title:"单位",
      key:"dw",
      width:80
    },{
      title:"预设进价",
      key:"ysjj",
      sorter: 'default',
      width:80
    },{
      title:"配件简拼",
      key:"jp",
      width:80
    },{
      title:"规格型号",
      key:"gg",
      render: (row) => Array.isArray(row.gg) ? row.gg.join(' | ') : row.gg,
      width:80
    },{
      title:"库位",
      key:"kw",
      render: (row) => row.kw_display || row.kw,
      width:80
    },{
      title:"备注",
      key:"bz",
      width:180
    }
  ]
}

const columns = createColumns()
const maxHeight = computed(() => {
  // 视口高度减去顶部搜索区域(约60px)、分页区域(约60px)和其他边距(约20px)
  return window.innerHeight - 140
})
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
const dialog = useDialog()
const showDropdownRef = ref(false)
const xRef = ref(0)
const yRef = ref(0)

const showDropdown = showDropdownRef
const x = xRef
const y = yRef

function handleSelect(key: string) {
  if (key === 'edit' && currentRow.value) {
    // 触发编辑事件，传递当前行数据
    emit('edit', currentRow.value)
  } else if (key === 'delete' && currentRow.value) {
    // 显示删除确认对话框
    dialog.warning({
      title: '确认删除',
      content: `确定要删除配件"${currentRow.value.xm}"吗？此操作不可恢复。`,
      positiveText: '删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          // 调用API删除配件
          await apiClient.delete(`/v1/parts/${currentRow.value?.id}`)
          message.success('配件删除成功')
          // 触发刷新事件
          emit('refresh')
        } catch (error: any) {
          message.error(error.message || '配件删除失败')
        }
      }
    })
  }
  showDropdownRef.value = false
}
function onClickoutside() {
  showDropdownRef.value = false
  currentRow.value = null // 点击外部时清空当前行
}

function rowProps(row: PartInfoData) {
  return {
    onContextmenu: (e: MouseEvent) => {
      // 保存当前右键点击的行数据
      currentRow.value = row
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
      // 保存当前左键点击的行数据
      currentRow.value = row
    }
  }
}
</script>
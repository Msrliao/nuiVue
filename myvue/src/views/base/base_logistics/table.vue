<template>
  <n-flex>

  <n-data-table
    :columns="columns"
    :data="props.data"
    :row-props="rowProps"
    :loading="props.loading"
    striped
    :row-key="(row: RowData) => row.id"
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
import { computed, h, nextTick, ref } from 'vue'
import type { DataTableColumns, DropdownOption } from 'naive-ui'
import { useMessage, useDialog } from 'naive-ui'
import apiClient from '@/utils/apiClient'

interface RowData {
  id: number
  logisticsNo: string; // 物流单号
  logisticsCompany: string; // 物流公司
  sender: string; // 发货人
  senderPhone: string; // 发货人电话
  receiver: string; // 收货人
  receiverPhone: string; // 收货人电话
  receiverAddress: string; // 收货地址
  sendDate: string; // 发货日期
  expectedArrivalDate: string; // 预计到达日期
  actualArrivalDate: string; // 实际到达日期
  status: string; // 状态
  trackingUrl: string; // 跟踪网址
  notes: string; // 备注
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
}

// 接收父组件传递的数据和加载状态
const props = defineProps<{
  data: RowData[]
  loading: boolean
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'edit', data: RowData): void
}>()

// 定义右键点击的行数据
const currentRow = ref<RowData | null>(null)

function createColumns(): DataTableColumns<RowData> {
  return [
    {
      title: '物流单号',
      key: 'logisticsNo',
      sorter: 'default',
      width: 140
    },
    {
      title: '物流公司',
      key: 'logisticsCompany',
      sorter: 'default',
      width: 140
    },
    {
      title: '发货人',
      key: 'sender',
      width: 100
    },
    {
      title: '发货人电话',
      key: 'senderPhone',
      width: 130
    },
    {
      title: '收货人',
      key: 'receiver',
      width: 100
    },
    {
      title: '收货人电话',
      key: 'receiverPhone',
      width: 130
    },
    {
      title: '收货地址',
      key: 'receiverAddress',
      width: 200
    },
    {
      title: '发货日期',
      key: 'sendDate',
      width: 120
    },
    {
      title: '预计到达日期',
      key: 'expectedArrivalDate',
      width: 130
    },
    {
      title: '实际到达日期',
      key: 'actualArrivalDate',
      width: 130
    },
    {
      title: '状态',
      key: 'status',
      width: 100
    },
    {
      title: '跟踪网址',
      key: 'trackingUrl',
      width: 200
    },
    {
      title: '备注',
      key: 'notes',
      width: 200
    }
  ]
}

// 定义信息框
const message = useMessage()
const dialog = useDialog()
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
      content: `确定要删除物流资料"${currentRow.value.logisticsNo}"吗？此操作不可恢复。`,
      positiveText: '删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          // 调用API删除物流资料
          await apiClient.delete(`/v1/logistics/${currentRow.value?.id}`)
          message.success('物流资料删除成功')
          // 触发刷新事件
          emit('refresh')
        } catch (error: any) {
          message.error(error.message || '物流资料删除失败')
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

function rowProps(row: RowData) {
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
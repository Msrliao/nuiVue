<template>
  <n-flex>

  <n-data-table
    v-model:checked-row-keys="checkedRowKeys"
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
import { computed, h, nextTick, ref, watch } from 'vue'
import type { DataTableColumns, DropdownOption } from 'naive-ui'
import { useMessage, useDialog } from 'naive-ui'
import apiClient from '@/utils/apiClient'

interface RowData {
  id: number
  wlmc: string; // 物流名称
  wljp: string; // 物流简拼
  lxr: string; // 联系人
  lxrjp: string; // 联系人简拼
  lxrphone: string; // 联系人电话
  othercontact: string; // 其它联系方式
  contactaddress: string; // 联系地址
  lwdq: string; // 来往地区
  ffdsrq: string; // 发放代收日期
  dscsjl: string; // 代收隔收天数
  ffdsfs: string; // 发放代收方式
  bz: string; // 备注
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
  (e: 'select-regions', regions: string[], rowData: RowData | null): void
}>()

// 定义右键点击的行数据
const currentRow = ref<RowData | null>(null)
// 定义选中行keys
const checkedRowKeys = ref<number[]>([])

// 监听选中行变化，发送选中的地区数据和行数据
watch(checkedRowKeys, (newKeys) => {
  if (newKeys.length > 0) {
    const selectedRow = props.data.find(row => row.id === newKeys[0])
    if (selectedRow) {
      const regions = Array.isArray(selectedRow.lwdq) ? selectedRow.lwdq : []
      emit('select-regions', regions, selectedRow)
    }
  } else {
    emit('select-regions', [], null)
  }
})

function createColumns(): DataTableColumns<RowData> {
  return [
    {
      type: 'selection',
      multiple: false,
      width: 50
    },
    {
      title: '物流名称',
      key: 'wlmc',
      sorter: 'default',
      width: 140
    },
    {
      title: '物流简拼',
      key: 'wljp',
      sorter: 'default',
      width: 100
    },
    {
      title: '联系人',
      key: 'lxr',
      width: 100
    },
    {
      title: '联系人简拼',
      key: 'lxrjp',
      width: 100
    },
    {
      title: '联系人电话',
      key: 'lxrphone',
      width: 130
    },
    {
      title: '其它联系方式',
      key: 'othercontact',
      width: 130
    },
    {
      title: '联系地址',
      key: 'contactaddress',
      width: 200
    },
    {
      title: '来往地区',
      key: 'lwdq',
      width: 150,     
      render: (row) => Array.isArray(row.lwdq) ? row.lwdq.join(' | ') : row.lwdq,
    },
    {
      title: '发放代收日期',
      key: 'ffdsrq',
      width: 120
    },
    {
      title: '代收隔收天数',
      key: 'dscsjl',
      width: 110
    },
    {
      title: '发放代收方式',
      key: 'ffdsfs',
      width: 120
    },
    {
      title: '备注',
      key: 'bz',
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
      content: `确定要删除物流资料"${currentRow.value.wlmc}"吗？此操作不可恢复。`,
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
      // 阻止事件冒泡，避免触发表格的点击事件
      e.stopPropagation()
      // 保存当前左键点击的行数据
      currentRow.value = row
      // 设置默认选中项
      checkedRowKeys.value = [row.id]
    }
  }
}

</script>
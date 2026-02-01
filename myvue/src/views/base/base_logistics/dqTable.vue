<template>
  <n-flex>

  <n-data-table
    :columns="columns"
    :data="props.data"
    :row-props="rowProps"
    :loading="props.loading"
    striped
    :row-key="(row: RowData) => row.id"
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
import { h, nextTick, ref } from 'vue'
import type { DataTableColumns, DropdownOption } from 'naive-ui'
import { useMessage, useDialog } from 'naive-ui'
import apiClient from '@/utils/apiClient'

interface RowData {
  id: number
  dq: string; // 地区
  dqjp: string; // 地区简拼
  lxr: string; // 联系人
  lxdh: string; // 联系人电话
  qtlxfs: string; // 其它联系方式
  lxdz: string; // 联系地址
  bz: string; // 备注
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
      title: '地区',
      key: 'dq',
      sorter: 'default'
    },
    {
      title: '联系人',
      key: 'lxr',
      sorter: 'default'
    },
    {
      title: '联系电话',
      key: 'lxdh'
    },
    {
      title: '其它联系方式',
      key: 'qtlxfs'
    },
    {
      title: '联系地址',
      key: 'lxdz'
    },
    {
      title: '备注',
      key: 'notes'
    }
  ]
}

// 定义信息框
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
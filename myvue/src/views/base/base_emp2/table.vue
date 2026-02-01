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
  gh: string; // 工号
  xm: string; // 姓名
  xb: string; // 性别
  csrq: string; // 出生日期
  mz: string; // 民族
  lxdh: string; // 联系电话
  idcard: string; // 身份证号
  yx: string; // 邮箱
  zw: string; // 职位
  bm: string; // 部门
  gzjb: string; // 工资级别
  rzrq: string; // 入职日期
  syq: string; // 试用期
  htsjzrq: string; // 合同起始日期
  htsjzzrq: string; // 合同终止日期
  emergencyContact: string; // 紧急联系人
  emergencyContactPhone: string; // 紧急联系人电话
  bz: string; // 备注
  zt: string; // 状态
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
      title: '工号',
      key: 'gh',
      sorter: 'default'
    },
    {
      title: '姓名',
      key: 'xm',
      sorter: 'default'
    },
    {
      title: '性别',
      key: 'xb'
    },
    {
      title: '出生日期',
      key: 'csrq'
    },
    {
      title: '民族',
      key: 'mz'
    },
    {
      title: '联系电话',
      key: 'lxdh'
    },
    {
      title: '身份证号',
      key: 'idcard'
    },
    {
      title: '邮箱',
      key: 'yx'
    },
    {
      title: '职位',
      key: 'zw'
    },
    {
      title: '部门',
      key: 'bm'
    },
    {
      title: '工资级别',
      key: 'gzjb'
    },
    {
      title: '入职日期',
      key: 'rzrq'
    },
    {
      title: '试用期',
      key: 'syq'
    },
    {
      title: '合同起始日期',
      key: 'htsjzrq'
    },
    {
      title: '合同终止日期',
      key: 'htsjzzrq'
    },
    {
      title: '紧急联系人',
      key: 'emergencyContact'
    },
    {
      title: '紧急联系人电话',
      key: 'emergencyContactPhone'
    },
    {
      title: '备注',
      key: 'bz'
    },
    {
      title: '状态',
      key: 'zt'
    }
  ]
}

// 定义信息框
const message = useMessage()
const dialog = useDialog()
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
    // 显示删除确认对话框
    dialog.warning({
      title: '确认删除',
      content: `确定要删除员工"${currentRow.value.xm}"吗？此操作不可恢复。`,
      positiveText: '删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          // 调用API删除员工
          await apiClient.delete(`/employees/${currentRow.value?.id}`)
          message.success('员工删除成功')
          // 触发刷新事件
          emit('refresh')
        } catch (error: any) {
          message.error(error.message || '员工删除失败')
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
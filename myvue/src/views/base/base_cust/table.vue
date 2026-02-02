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
  khjc: string; // 客户简称
  khjp: string; // 客户简拼
  khqc: string; // 客户全称
  lxr: string; // 联系人
  lxdh: string; // 联系电话
  zxdh: string; // 座机电话
  qtlxfs: string; // 其他联系方式
  lxdz: string; // 联系地址
  yhzhm: string; // 银行账户名
  yhzh: string; // 银行账号
  ssyh: string; // 所属银行
  khlx: string[]; // 客户类型
  jyfw: string[]; // 经营范围
  ssqd: string[]; // 所属地区
  fkfs: string[]; // 付款方式
  mrwl: string[]; // 默认物流
  mryhfs: string[]; // 默认运货方式
  bz: string; // 备注
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
  key?: number; // 行标识
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
      title: '客户简称',
      key: 'khjc',
      sorter: 'default'
    },
    {
      title: '客户简拼',
      key: 'khjp',
      sorter: 'default'
    },
    {
      title: '客户全称',
      key: 'khqc',
      sorter: 'default'
    },
    {
      title: '联系人',
      key: 'lxr'
    },
    {
      title: '联系电话',
      key: 'lxdh'
    },
    {
      title: '座机电话',
      key: 'zxdh'
    },
    {
      title: '其他联系方式',
      key: 'qtlxfs'
    },
    {
      title: '联系地址',
      key: 'lxdz'
    },
    {
      title: '银行账户名',
      key: 'yhzhm'
    },
    {
      title: '银行账号',
      key: 'yhzh'
    },
    {
      title: '所属银行',
      key: 'ssyh'
    },
    {
      title: '客户类型',
      key: 'khlx',
      render(row) {
        return Array.isArray(row.khlx) ? row.khlx.join(', ') : row.khlx
      }
    },
    {
      title: '经营范围',
      key: 'jyfw',
      render(row) {
        return Array.isArray(row.jyfw) ? row.jyfw.join(', ') : row.jyfw
      }
    },
    {
      title: '所属地区',
      key: 'ssqd',
      render(row) {
        return Array.isArray(row.ssqd) ? row.ssqd.join(', ') : row.ssqd
      }
    },
    {
      title: '付款方式',
      key: 'fkfs',
      render(row) {
        return Array.isArray(row.fkfs) ? row.fkfs.join(', ') : row.fkfs
      }
    },
    {
      title: '默认物流',
      key: 'mrwl',
      render(row) {
        return Array.isArray(row.mrwl) ? row.mrwl.join(', ') : row.mrwl
      }
    },
    {
      title: '默认运货方式',
      key: 'mryhfs',
      render(row) {
        return Array.isArray(row.mryhfs) ? row.mryhfs.join(', ') : row.mryhfs
      }
    },
    {
      title: '备注',
      key: 'bz'
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
      content: `确定要删除客户"${currentRow.value.khjc}"吗？此操作不可恢复。`,
      positiveText: '删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          // 调用API删除客户
          await apiClient.delete(`/customers/${currentRow.value?.id}`)
          message.success('客户删除成功')
          // 触发刷新事件
          emit('refresh')
        } catch (error: any) {
          message.error(error.message || '客户删除失败')
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
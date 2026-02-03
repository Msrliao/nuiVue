<template>
  <div class="table-wrapper">
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
      :bordered="false"
      :single-line="false"
      class="data-table"
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
  </div>
</template>

<script setup lang="ts">
import { h, nextTick, ref, computed } from 'vue'
import type { DataTableColumns, DropdownOption } from 'naive-ui'
import { useMessage, useDialog } from 'naive-ui'
import apiClient from '@/utils/apiClient'

interface RowData {
  id: number
  xm: string; // 姓名
  xmjp:string; // 姓名简拼
  xb: string; // 性别
  csrq: string; // 出生日期
  mz: string; // 联系人
  lxdh: string; // 联系电话
  sfz: string; // 座机电话
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

// 时间格式化函数
function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}
// 定义表头
function createColumns(): DataTableColumns<RowData> {
  return [
    {
      title: '序号',
      key: 'index',
      sorter: 'default',
      width:60,
      fixed: 'left',
      render: (_, index) => index + 1
    },
    {
      title: '姓名',
      key: 'xm',
      sorter: 'default',
      width:80
    },
    {
      title: '性别',
      key: 'xb',
      width:60
    },
    {
      title: '出生日期',
      key: 'csrq',
      render: (row) => formatDate(row.csrq),
      width:105
    },
    {
      title: '民族',
      key: 'mz',
      width:60
    },
    {
      title: '联系电话',
      key: 'lxdh',
      width:120
    },
    {
      title: '身份证号',
      key: 'idcard',
      width:180
    },
    {
      title: '邮箱',
      key: 'yx',
      width:180
    },
    {
      title: '职位',
      key: 'zw',
      width:100
    },
    {
      title: '部门',
      key: 'bm',
      width:100
    },
    {
      title: '工资级别',
      key: 'gzjb',
      width:100
    },
    {
      title: '入职日期',
      key: 'rzrq',
      render: (row) => formatDate(row.rzrq),
      width:105
    },
    {
      title: '试用期',
      key: 'syq',
      width:80
    },
    {
      title: '合同起始日期',
      key: 'htsjzrq',
      render: (row) => formatDate(row.htsjzrq),
      width:105
    },
    {
      title: '合同终止日期',
      key: 'htsjzzrq',
      render: (row) => formatDate(row.htsjzzrq),
      width:105
    },
    {
      title: '紧急联系人',
      key: 'emergencyContact',
      width:100
    },
    {
      title: '紧急联系人电话',
      key: 'emergencyContactPhone',
      width:100
    },
    {
      title: '备注',
      key: 'bz',
      width:200
    },
   
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

// 计算横向滚动宽度（所有列宽之和 + 序号列宽）
const scrollX = computed(() => {
  const columnWidths = [60, 80, 60, 105, 60, 120, 180, 180, 100, 100, 100, 105, 80, 105, 105, 100, 100, 200]
  return columnWidths.reduce((sum, width) => sum + width, 0)
})

// 计算表格最大高度（减去搜索区域和分页区域的高度）
const maxHeight = computed(() => {
  // 视口高度减去顶部搜索区域(约60px)、分页区域(约60px)和其他边距(约20px)
  return window.innerHeight - 140
})

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
          await apiClient.delete(`/v1/employees/${currentRow.value?.id}`)
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

<style scoped>
.table-wrapper {
  width: 100%;
  overflow: hidden;
}

.data-table {
  width: 100%;
}
</style>

<template>
  <n-flex>

  <n-data-table
    :columns="columns"
    :data="data"
    :row-props="rowProps"
    striped
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
import { useMessage } from 'naive-ui'
import { h, nextTick, ref } from 'vue'


interface RowData {
  key: number
  name: string
  age: number
  weight: number; // 体重
  address: string
}


function createColumns(): DataTableColumns<RowData> {
  return [
  
    {
      title: 'Name',
      key: 'name',
      sorter: 'default'
    },
    {
      title: 'Age',
      key: 'age',
      sorter: 'default'
    },
    {
      title: 'Address',
      key: 'address'
    },{
      title:"weight",
      key:"weight"
    }
  ]
}

function createData(): RowData[] {
  return [
    {
      key: 0,
      name: 'John Brown',
      age: 32,
      weight:50,
      address: 'New York No. 1 Lake Park'
    },
    {
      key: 1,
      name: 'Jim Green',
      age: 42,
      weight:50,
      address: 'London No. 1 Lake Park'
    },
    {
      key: 2,
      name: 'Joe Black',
      age: 30,
      weight:50,
      address: 'Sidney No. 1 Lake Park'
    }
  ]
}

const data = createData()
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

const message = useMessage()
const showDropdownRef = ref(false)
const xRef = ref(0)
const yRef = ref(0)

const showDropdown = showDropdownRef
const x = xRef
const y = yRef

function handleSelect() {
  showDropdownRef.value = false
}
function onClickoutside() {
  showDropdownRef.value = false
}

function rowProps(row: Song) {
  return {
    onContextmenu: (e: MouseEvent) => {
      message.info(JSON.stringify(row, null, 2))
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

</script>
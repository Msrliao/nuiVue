<template>
  <n-data-table
    :columns="columns"
    :data="data"
    :max-height="250"
    virtual-scroll
    virtual-scroll-x
    :scroll-x="scrollX"
    :min-row-height="48"
    :height-for-row="heightForRow"
    virtual-scroll-header
    :header-height="48"
  />
</template>

<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { InputInst } from 'naive-ui'
import { NInput } from 'naive-ui'
import { ref, nextTick, h } from 'vue'

interface RowData {
  key: number
  name: string
  age: number
  address: string
}

interface OnUpdateValue {
  (value: string): void
}

// 定义编辑组件
const ShowOrEdit = {
  props: {
    value: [String, Number],
    onUpdateValue: Function as () => OnUpdateValue
  },
  setup(props) {
    const isEdit = ref(false)
    const inputRef = ref<InputInst | null>(null)
    const inputValue = ref(props.value)
    
    function handleOnClick() {
      isEdit.value = true
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
    
    function handleChange() {
      props.onUpdateValue?.(String(inputValue.value))
      isEdit.value = false
    }
    
    return () =>
      h(
        'div',
        {
          style: 'min-height: 22px',
          onClick: handleOnClick
        },
        isEdit.value
          ? h(NInput, {
              ref: inputRef,
              value: String(inputValue.value),
              onUpdateValue: (v) => {
                inputValue.value = v
              },
              onChange: handleChange,
              onBlur: handleChange
            })
          : props.value
      )
  }
}

const data = ref<RowData[]>([])
const scrollX = 800
// 动态创建 render 函数
function createRender(key: keyof RowData) {
  return (row: RowData) => {
    return h(ShowOrEdit, {
      value: row[key],
      onUpdateValue: (value: string) => {
        // 处理不同类型的字段
        if (key === 'age') {
          row[key] = Number(value) as any
        } else {
          row[key] = value as any
        }
      }
    })
  }
}

const columns = ref<DataTableColumns<RowData>>([
  {
    title: '序号',
    key: 'key',
    width: 100,
    render: (row: RowData) => row.key + 1
  },
  {
    title: '配件序码',
    key: 'pjxm',
    width: 150,
    render: createRender('pjxm')
  },
  {
    title: '配件编码',
    key: 'pjbm',
    width: 300,
    render: createRender('pjbm')
  },
  {
    title: '配件名称',
    key: 'pjmc',
    width: 300,
    render: createRender('pjmc')
  },
  {
    title: '适用车型',
    key: 'sycx',
    width: 300,
    render: createRender('sycx')
  },
  {
    title: '品牌',
    key: 'pp',
    width: 300,
    render: createRender('pp')
  },
  {
    title: '单位',
    key: 'dw',
    width: 100,
    render: createRender('dw')
  },
  {
    title: '数量',
    key: 'sl',
    width: 100,
    render: createRender('sl')
  },
  {
    title: '单价',
    key: 'dj',
    width: 100,
    render: createRender('dj')
  },
  {
    title: '总价',
    key: 'zj',
    width: 100,
    render: createRender('zj')
  },
  {
    title: '预设批发价',
    key: 'yspfj',
    width: 100,
    render: createRender('yspfj')
  },
  {
    title: '预设销售价',
    key: 'ysxsj',
    width: 100,
    render: createRender('ysxsj')
  },
  {
    title: '规格型号',
    key: 'ggxh',
    width: 200,
    render: createRender('ggxh')
  },
  {
    title: '库位',
    key: 'kw',
    width: 100,
    render: createRender('kw')
  },
  {
    title: '备注',
    key: 'bz',
    width: 300,
    render: createRender('bz')
  }
])

const heightForRow = () => 48
</script>
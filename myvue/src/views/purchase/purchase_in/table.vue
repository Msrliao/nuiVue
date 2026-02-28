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

const data = ref<RowData[]>(Array.from({ length: 100 }).map((_, index) => ({
  key: index,
  name: `Edward King ${index}`,
  age: 32,
  address: `London, Park Lane no. ${index}`
})))

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
    title: 'Name',
    key: 'name',
    width: 200,
    render: createRender('name')
  },
  {
    title: 'Age',
    key: 'age',
    width: 150,
    render: createRender('age')
  },
  {
    title: 'Address',
    key: 'address',
    width: 300,
    render: createRender('address')
  }
])

const heightForRow = () => 48
</script>
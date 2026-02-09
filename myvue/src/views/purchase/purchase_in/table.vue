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

const columns = ref<DataTableColumns<RowData>>([
  {
    title: 'Name',
    key: 'name',
    width: 200,
    render(row) {
      return h(ShowOrEdit, {
        value: row.name,
        onUpdateValue: (value) => {
          row.name = value
        }
      })
    }
  },
  {
    title: 'Age',
    key: 'age',
    width: 150,
    render(row) {
      return h(ShowOrEdit, {
        value: row.age,
        onUpdateValue: (value) => {
          row.age = Number(value)
        }
      })
    }
  },
  {
    title: 'Address',
    key: 'address',
    width: 300,
    render(row) {
      return h(ShowOrEdit, {
        value: row.address,
        onUpdateValue: (value) => {
          row.address = value
        }
      })
    }
  }
])

const heightForRow = () => 48
</script>
<script setup lang="ts" name="采购进货">
import { ref } from 'vue'
import { format, isAfter, isToday } from 'date-fns'
import Table from './table.vue'

// 定义时间戳变量
const timestamp = ref(Date.now())
// const timeStr = ref(Date.now())
const formRef = ref(null)
const formValue = ref({
  gys: null,
  rq: timestamp,
  dh: 123456
})

const size = ref('medium')
const value = ref(null)
const options = [
  {
    label: ' My Monkey',
    value: 'song0',
    disabled: true
  },
  {
    label: 'Drive My Car',
    value: 'song1'
  },
  {
    label: 'Norwegian Wood',
    value: 'song2'
  },
  {
    label: 'You Won\'t See',
    value: 'song3',
    disabled: true
  },
  {
    label: 'Nowhere Man',
    value: 'song4'
  }
]
</script>
<template>
    <n-flex justify="center" align="center">
        <n-gradient-text type="danger" :size="36">
            采购进货
        </n-gradient-text>
    </n-flex>
    <n-flex justify="space-around">
        <n-form    
            ref="formRef"    
            :model="formValue"    
            :rules="rules"   
            label-placement="left"    
            label-width="auto"
        >
            <n-grid cols="1 s:2 m:3 l:3 xl:3 2xl:3" responsive="screen">
                <n-form-item-gi  label="供应商:" path="gys">
                    <n-select
                        v-model:value="formValue.gys"
                        placeholder="请选择供应商"
                        :options="options"
                        clearable
                    />
                </n-form-item-gi >
                <n-form-item-gi  label="进货日期:" path="rq">
                    <n-date-picker v-model:value="formValue.rq" type="datetime" clearable />
                </n-form-item-gi >
                <n-form-item-gi  label="单号:" path="dh">
                    <n-gradient-text type="danger">
                        {{formValue.dh}}
                    </n-gradient-text>
                </n-form-item-gi >
            </n-grid >
        </n-form>
    </n-flex>
    <Table />
</template>
<style scoped>
</style>
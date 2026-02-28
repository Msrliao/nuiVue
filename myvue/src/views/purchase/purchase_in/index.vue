<script setup lang="ts" name="采购进货">
import { ref } from 'vue'
import { format, isAfter, isToday } from 'date-fns'
import Table from './table.vue'
import selectTable from '@/views/common/selectTable.vue'

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
const selectColumns = ref<DataTableColumns<RowData>>( [
  {
    title: ' 客户简称',
    key: 'khjc',
    width: 120
  },
  {
    title: '客户全称',
    key: 'khqc'
  },
  {
    title: '联系人',
    key: 'lxr'
  },
  {
    title: '联系电话',
    key: 'lxdh'
  }
])
const selectData = ref([
  {
    key: 1,
    khjc: '客户简称1',
    khqc: '客户全称1',
    lxr: '联系人1',
    lxdh: '联系电话1'
  },
  {
    key: 2,
    khjc: '客户简称2',
    khqc: '客户全称2',
    lxr: '联系人2',
    lxdh: '联系电话2'
  },
])
const selectOptions = ref<DropdownOption[]>([])
const getSelectData = (selectKey: number) => {
  console.log('选择了供应商:',selectKey)
  if (!selectKey) {
    return null
  }
  selectOptions.value = [{
    label: selectData.value.find(item => item.key === selectKey).khqc,
    value: selectKey
  }]
  // 选择框的值应该是 key
  formValue.gys = selectKey.khqc
}
const loading = ref(false)
</script>
<template>
    <n-flex justify="center" align="center">
        <n-gradient-text type="danger" :size="36">
            采购进货
        </n-gradient-text>
    </n-flex>
        <n-form    
          ref="formRef"    
          :model="formValue"    
          :rules="rules"   
          label-placement="left"    
          label-width="auto"
        >
          <n-grid cols="1 s:2 m:3 l:3 xl:3 2xl:3" responsive="screen" x-gap="12" y-gap="12">
                <n-form-item-gi  label="供应商:" path="gys">
                  <n-select
                    v-model:value="formValue.gys"
                    :value="formValue.gys"
                    :options="selectOptions"
                    placeholder="请选择供应商"
                    clearable
                    filterable
                    tag
                    keyboard
                  >
                    <template #empty>
                      <selectTable :columns="selectColumns" :data="selectData" :loading="loading" :sendSelectData="getSelectData" />
                    </template>
                </n-select>
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
            <Table />
            <selectTable :columns="selectColumns" :data="selectData" :loading="loading" />
            <n-grid cols="1 s:2 m:3 l:3 xl:4 2xl:4" responsive="screen" x-gap="12" y-gap="12" >
              <n-form-item-gi  label="单据备注:" path="djbz">
                <n-input v-model:value="formValue.bz" placeholder="请输入单据备注" clearable />
              </n-form-item-gi>
              <n-form-item-gi  label="付款方式:" path="fkfs">
                <n-select
                  v-model:value="formValue.fkfs"
                  placeholder="请选择付款方式"
                  :options="options"
                  clearable
                />
              </n-form-item-gi>
              <n-form-item-gi  label="实付金额:" path="sfje">
                <n-input v-model:value="formValue.sfje" placeholder="请输入实付金额" clearable />
              </n-form-item-gi>
              <n-form-item-gi  label="物流:" path="wlfs">
                <n-select
                  v-model:value="formValue.wlfs"
                  placeholder="请选择物流方式"
                  :options="options"
                  clearable
                />
              </n-form-item-gi>
              <n-form-item-gi  label="物流运费:" path="wlje">
                <n-input v-model:value="formValue.wlje" placeholder="请输入物流运费" clearable />
              </n-form-item-gi>
              <n-form-item-gi  label="运货方式:" path="yhfs">
                <n-select
                  v-model:value="formValue.yhfs"
                  placeholder="请选择运货方式"  
                  :options="options"
                  clearable
                />
              </n-form-item-gi>
              <n-form-item-gi  label="其它费用:" path="qteje">
                <n-input v-model:value="formValue.qteje" placeholder="请输入其它费用" clearable />
              </n-form-item-gi>
              <n-form-item-gi  label="费用备注:" path="fybz">
                <n-input v-model:value="formValue.fybz" placeholder="请输入费用备注" clearable />
              </n-form-item-gi>
            </n-grid>
        </n-form>

    
</template>
<style scoped>
</style>
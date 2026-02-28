<script setup lang="ts" name="采购进货">
import { ref, watch  } from 'vue'
import { format, isAfter, isToday } from 'date-fns'
import Table from './table.vue'
import selectTable from '@/views/common/selectTable.vue'
import type { DataTableColumns } from 'naive-ui'
import { debounce } from 'lodash'
import apiClient from '@/utils/apiClient'

interface RowData {
  key: number
  khjc: string
  khqc: string
  lxr: string
  lxdh: string
}

// 定义时间戳变量
const timestamp = ref(Date.now())
const formRef = ref(null)
const selectShowModal = ref(false)
const modalStyle = ref({})
const inputRef = ref<HTMLElement | null>(null)
const loading = ref(false)
const wlfsOptions = ref([
  {
    label: '物流方式1',
    value: '物流方式1'
  },
  {
    label: '物流方式2',
    value: '物流方式2'
  }
])
const yhfsOptions = ref([
  {
    label: '运货方式1',
    value: '运货方式1'
  },
  {
    label: '运货方式2',
    value: '运货方式2'
  }
])
const fkfsOptions = ref([
  {
    label: '付款方式1',
    value: '付款方式1'
  },
  {
    label: '付款方式2',
    value: '付款方式2'
  }
])
const selectTableShow = ref(false)
const formValue = ref({
  gys: null,
  rq: timestamp,
  dh: 123456
})
// 请求参数接口
interface SearchParams {
  khjp?: string
  lxdh?: string
  lxrjp?: string
  khlx?: string | string[]
  khdq?: string | string[]
}

// 表单搜索值
const debouncedSearchParams = ref(<SearchParams>{})

// 定义选择框的表格表头
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
// 定义选择框的表格数据
const selectData = ref([])
// 定义选择框的表格数据获取函数
const getSelectData = (selectKey: number) => {
  if (!selectKey) {
    return null
  }
  console.log(selectKey)
  // 选择框的值应该是 key
  formValue.value.gys = selectData.value.find(item => item.id === selectKey)?.khqc || ''
  // 关闭选择框
  selectShowModal.value = false
}

// 打开选择框表格
async function openModal() {
  selectShowModal.value = true 
  if (inputRef.value) {
    // 对于 Naive UI 组件，使用 $el 来获取 DOM 元素
    const buttonElement = inputRef.value.$el || inputRef.value
    const rect = buttonElement.getBoundingClientRect()
    modalStyle.value = {
      width: '600px',
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.bottom + 10}px`
    }
  }
  loading.value = true
  const response = await apiClient.get('/v1/customers', { params: debouncedSearchParams.value }) as any
  selectData.value = response || []
  loading.value = false
  
}
// 处理输入框获得焦点事件
function handleFocus() {
 openModal()
}
// 处理输入框失去焦点事件
function handleBlur() {
    selectShowModal.value = false
}
// 输入
function handleInput(){
  debouncedSearchParams.value.khjp = formValue.value.gys || ''
  debouncedSearch()
}
// 防抖搜索函数，等待输入完成后1秒执行
const debouncedSearch = debounce(() => {
  openModal()
}, 1000)



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
    label-placement="left"    
    label-width="auto"
    
  >
    <n-grid cols="1 s:2 m:3 l:3 xl:3 2xl:3" responsive="screen" x-gap="12" y-gap="12">
      <n-form-item-gi  label="供应商:" path="gys">
        <n-input
          ref="inputRef"
          v-model:value="formValue.gys"
          placeholder="请选择供应商" 
          clearable 
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleInput"
        />        
          <n-modal
            v-model:show="selectShowModal"
            :style="modalStyle"        
            :show-mask="false"
          >
            <selectTable :columns="selectColumns" :data="selectData" :loading="loading" @sendSelectData="getSelectData" />
          </n-modal>
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
    
    <n-flex>
      <n-button type="primary" @click="submitForm">提交</n-button>
      <n-button type="primary" @click="submitForm">提交</n-button>
      <n-button type="primary" @click="submitForm">提交</n-button>
      
    </n-flex>
   
      <n-grid cols="1 s:2 m:3 l:3 xl:4 2xl:4" responsive="screen" x-gap="12" y-gap="12" item-responsive >
        <n-form-item-gi  label="单据备注:" path="djbz">
          <n-input v-model:value="formValue.bz" placeholder="请输入单据备注" clearable />
        </n-form-item-gi>
        <n-form-item-gi  label="付款方式:" path="fkfs">
          <n-select
            v-model:value="formValue.fkfs"
            placeholder="请选择付款方式"
            :options="fkfsOptions"
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
            :options="wlfsOptions"
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
            :options="yhfsOptions"
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

.grid {
  justify-content: center;
}

/* 让表单项目在栅格内垂直居中 */
:deep(.n-grid) {
  padding-top: 20px;
}
:deep(.n-flex) {
  padding-top: 20px;
 
}


</style>
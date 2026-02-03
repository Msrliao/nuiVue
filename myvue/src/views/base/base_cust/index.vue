<script setup lang="ts" name="客户资料">
import {ref, watch, onMounted} from 'vue'
import type { FormInst, SelectOption } from 'naive-ui'
//导入组件
import TableVue from './table.vue'
import AddInforVue from './addInfor.vue'
import { debounce } from 'lodash'
import apiClient from '@/utils/apiClient'
import { useMessage } from 'naive-ui'


const showAddModal = ref(false)

// 编辑数据
const editData = ref<any | null>(null)

// 定义信息提示
const message = useMessage()

// 下拉框选项
const khlxOptions = ref<SelectOption[]>([])
const khdqOptions = ref<SelectOption[]>([])

// 获取客户相关的下拉框数据
async function fetchCustomerOptions() {
  try {
    // 获取客户列表
    const customers = await apiClient.get('/v1/customers')
    
    // 提取唯一的客户类型和客户地区值
    const customerTypes = new Set<string>()
    const regions = new Set<string>()
    
    customers.forEach((item: any) => {
      // 处理客户类型（数组）
      if (Array.isArray(item.khlx)) {
        item.khlx.forEach((type: string) => customerTypes.add(type))
      } else if (item.khlx) {
        customerTypes.add(item.khlx)
      }
      
      // 处理所属地区（数组）
      if (Array.isArray(item.ssqd)) {
        item.ssqd.forEach((region: string) => regions.add(region))
      } else if (item.ssqd) {
        regions.add(item.ssqd)
      }
    })
    
    // 转换为下拉框选项格式
    khlxOptions.value = Array.from(customerTypes).map(type => ({ label: type, value: type }))
    khdqOptions.value = Array.from(regions).map(region => ({ label: region, value: region }))
  } catch (error) {
    message.error('获取客户选项数据失败，请重试')
    console.error('获取客户选项数据失败：', error)
  }
}

// 请求参数接口
interface SearchParams {
  khjp?: string
  lxdh?: string
  lxrjp?: string
  khlx?: string | string[]
  khdq?: string | string[]
}

// 表单搜索值
const formValue = ref(<SearchParams>{})

// 防抖后的搜索参数
const debouncedSearchParams = ref(<SearchParams>{})

// 客户数据
const customerData = ref<any[]>([])
// 加载状态
const loading = ref(false)
// 新增客户弹窗显示
function addInforShwo () {
  showAddModal.value = true
  editData.value = null
}
// 获取客户数据
async function fetchCustomerData(params?: any) {
  loading.value = true
  try {
    // 处理参数，确保数组类型的参数能够正确传递
    const processedParams = { ...params }
    // 对于数组类型的参数，转换为字符串格式
    if (processedParams.khlx && Array.isArray(processedParams.khlx)) {
      processedParams.khlx = processedParams.khlx.join(',')
    }
    if (processedParams.khdq && Array.isArray(processedParams.khdq)) {
      processedParams.khdq = processedParams.khdq.join(',')
    }
    
    // 使用统一的API接口，传递处理后的搜索参数
    const response = await apiClient.get('/v1/customers', { params: processedParams })
    // apiClient已经处理了响应格式，直接使用返回的数据
    customerData.value = response || []
  } catch (error: any) {
    console.error('获取客户数据失败:', error)
    customerData.value = []
  } finally {
    loading.value = false
  }
}

// 刷新数据
async function refreshCustomerData(params: any) {
  await fetchCustomerData(params)
}

// 防抖搜索函数，等待输入完成后1秒执行
const debouncedSearch = debounce(() => {
  // 将当前表单值赋值给防抖搜索参数
  debouncedSearchParams.value = { ...formValue.value }
  console.log('防抖搜索执行，参数：', debouncedSearchParams.value)
  // 刷新数据
  refreshCustomerData(debouncedSearchParams.value)
}, 1000)

// 监听表单值变化，触发防抖搜索
watch(() => formValue.value, () => {
  debouncedSearch()
}, { deep: true })

onMounted(() => {
  // 初始化时刷新数据
  refreshCustomerData(debouncedSearchParams.value)
  // 获取下拉框选项数据
  fetchCustomerOptions()
})

// 刷新事件处理函数
function handleRefresh() {
  refreshCustomerData(debouncedSearchParams.value)
}

// 处理编辑事件
function handleEdit(data: any) {
  editData.value = data
  showAddModal.value = true
}
</script>
<template>
    <n-flex >
        <n-form-item label="客户简拼:" >
            <n-input v-model:value="formValue.khjp" placeholder="请输入客户简拼" clearable/>
        </n-form-item>
        <n-form-item label="联系电话:">
            <n-input v-model:value="formValue.lxdh" placeholder="请输入联系电话" clearable />
        </n-form-item>
        <n-form-item label="联系人简拼:" >
            <n-input v-model:value="formValue.lxrjp" placeholder="请输入联系人简拼" clearable/>
        </n-form-item>
        <n-form-item label="客户类型:" >
             <n-select
                            v-model:value="formValue.khlx"
                            placeholder="请选择客户类型"
                            :options="khlxOptions"
                            filterable 
                            tag
                            clearable
                        />
        </n-form-item>
        <n-form-item label="客户地区:" >
             <n-select
                            v-model:value="formValue.khdq"
                            placeholder="请选择客户地区"
                            :options="khdqOptions"
                            filterable 
                            tag
                            clearable
                        />
        </n-form-item>
    </n-flex>
    <n-flex>
        <n-button @click="addInforShwo()">
            新增资料
        </n-button>
    </n-flex>
    <!-- 通过props传递数据和加载状态 -->
    <TableVue :data="customerData" :loading="loading" @edit="handleEdit" @refresh="handleRefresh" />

    <n-flex>
        <AddInforVue :show="showAddModal" :editData="editData" @close="showAddModal = false" @refresh="handleRefresh" />
    </n-flex>
</template>
<style scoped>
.n-flex{
    padding: 5px;
}

</style>

<script setup lang="ts" name="员工资料">
import TableVue from './table.vue'
import AddInforVue from './addInfor.vue'
import {ref, watch, onMounted} from 'vue'
import type { SelectOption } from 'naive-ui'
import type { ApiResponse } from '@/types'
import { debounce } from 'lodash'
import apiClient from '@/utils/apiClient'

// 表单搜索值
const formValue = ref({
  xm: '',
  lxdh: '',
  bm: '',
  zw: ''
})

// 新增员工弹窗显示
const showAddModal = ref(false)
// 编辑数据
const editData = ref<any | null>(null)

// 新增员工弹窗显示
function addInforShwo () {
  showAddModal.value = true
  editData.value = null
}
// 加载状态
const loading = ref(false)
// 员工数据
const employeeData = ref<any[]>([])
// 获取员工数据
async function fetchEmployeeData(params?: any) {
  loading.value = true
  try {
    // 使用统一的API接口，直接传递搜索参数
    const response: ApiResponse<any[]> = await apiClient.get('/employees', { params })
    console.log('获取员工数据成功:', response)
    if(response.code === 200){
      // apiClient已经处理了响应格式，直接使用返回的数据
      employeeData.value = response.data || []
    }
    
  } catch (error: any) {
    console.error('获取员工数据失败:', error)
    employeeData.value = []
  } finally {
    loading.value = false
  }
}
// 部门选项
const bmOptions = ref<SelectOption[]>([])
// 职位选项
const zwOptions = ref<SelectOption[]>([])
// 刷新数据
async function refreshEmployeeData(params: any) {
  await fetchEmployeeData(params)
}

// 防抖搜索函数，等待输入完成后1秒执行
const debouncedSearch = debounce(() => {
  // 将当前表单值赋值给防抖搜索参数
  console.log('防抖搜索执行，参数：', formValue.value)
  // 刷新数据
  refreshEmployeeData(formValue.value)
}, 1000)

// 监听表单值变化，触发防抖搜索
watch(() => formValue.value, () => {
  debouncedSearch()
}, { deep: true })

onMounted(() => {
  // 初始化时刷新数据
  refreshEmployeeData(formValue.value)
})

// 刷新事件处理函数
function handleRefresh() {
  refreshEmployeeData(formValue.value)
}

// 处理编辑事件
function handleEdit(data: any) {
  editData.value = data
  showAddModal.value = true
}
</script>
<template>
    <n-flex >
        <n-form-item label="姓名:">
            <n-input v-model:value="formValue.xm" placeholder="请输入姓名" />
        </n-form-item>
        <n-form-item label="联系电话:" >
            <n-input v-model:value="formValue.lxdh" placeholder="请输入联系电话"/>
        </n-form-item>
        <n-form-item label="部门:" >
            <n-select
                        v-model:value="formValue.bm"
                        placeholder="请选择部门"
                        :options="bmOptions"
                        filterable
                        tag
                        clearable
                    />
        </n-form-item>
        <n-form-item label="职位:" >
            <n-select
                        v-model:value="formValue.zw"
                        placeholder="请选择职位"
                        :options="zwOptions"
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
    <TableVue :data="employeeData" :loading="loading" @edit="handleEdit" @refresh="handleRefresh" />

    <n-flex>
        <AddInforVue :show="showAddModal" :editData="editData" @refresh="handleRefresh" @close="showAddModal = false" />
    </n-flex>
</template>
<style scoped>
.n-flex{
    padding: 5px;
}

</style>
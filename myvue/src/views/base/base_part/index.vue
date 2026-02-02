<script setup lang="ts" name="配件资料">
import TableVue from './table.vue'
import DKTableVue from './DKTable.vue'

import {ref,watch, onMounted} from 'vue'
import AddInforVue from './addInfor.vue'
import { debounce } from 'lodash'
import apiClient from '@/utils/apiClient'
import type { PartInfoData } from '@/types'

const formValue = ref({
  mc: '',
  cx: '',
  gg: '',
  bm: ''
})

// 防抖后的搜索参数
const debouncedSearchParams = ref({
  mc: '',
  cx: '',
  gg: '',
  bm: ''
})

// 表格数据
const partInfoData = ref<PartInfoData[]>([])
const dkData = ref<any[]>([])

// 加载状态
const partLoading = ref(false)
const dkLoading = ref(false)

// 新增资料模态框显示状态
const showAddModal = ref(false)

// 编辑数据
const editData = ref<PartInfoData | null>(null)

function addInforShwo () {
  showAddModal.value = true
  editData.value = null
}

// 获取配件信息数据
async function fetchPartInfoData(params: any) {
  partLoading.value = true
  try {
    const response = await apiClient.get('/part-info', { params }) as any
    partInfoData.value = response || []
  } catch (error: any) {
    console.error('获取配件数据失败:', error)
    partInfoData.value = []
  } finally {
    partLoading.value = false
  }
}

// 获取大库数据
async function fetchDKData(params: any) {
  dkLoading.value = true
  try {
    const response = await apiClient.get('/DK-info', { params }) as any
    if (response && Array.isArray(response)) {
      dkData.value = response
    } else {
      dkData.value = []
    }
  } catch (error: any) {
    console.error('获取大库数据失败:', error)
    dkData.value = []
  } finally {
    dkLoading.value = false
  }
}

// 刷新所有数据
async function refreshAllData(params: any) {
  await Promise.all([
    fetchPartInfoData(params),
    fetchDKData(params)
  ])
}

// 防抖搜索函数，等待输入完成后1秒执行
const debouncedSearch = debounce(() => {
  // 将当前表单值赋值给防抖搜索参数
  debouncedSearchParams.value = { ...formValue.value }
  console.log('防抖搜索执行，参数：', debouncedSearchParams.value)
  // 刷新所有数据
  refreshAllData(debouncedSearchParams.value)
}, 1000)

// 监听表单值变化，触发防抖搜索
watch(() => formValue.value, () => {
  debouncedSearch()
}, { deep: true })
onMounted(() => {
  console.log('配件资料页面挂载')
  refreshAllData(debouncedSearchParams.value)
})

// 刷新事件处理函数
function handleRefresh() {
  refreshAllData(debouncedSearchParams.value)
}

// 处理编辑事件
function handleEdit(data: PartInfoData) {
  editData.value = data
  showAddModal.value = true
}
</script>
<template>
    
    <n-flex >
        <n-form-item label="配件编码:" >
            <n-input v-model:value="formValue.bm" placeholder="请输入配件编码"/>
        </n-form-item>
        <n-form-item label="配件车型:">
            <n-input v-model:value="formValue.cx" placeholder="请输入配件车型" />
        </n-form-item>
        <n-form-item label="配件名称:" >
            <n-input v-model:value="formValue.mc" placeholder="请输入配件名称"/>
        </n-form-item>
        <n-form-item label="配件规格:" >
            <n-input v-model:value="formValue.gg" placeholder="请输入配件规格"/>
        </n-form-item>
           
    </n-flex>
    <n-flex>
        <n-button @click="addInforShwo()">
            新增资料
        </n-button>
    </n-flex>
    <!-- 通过props传递数据和加载状态 -->
    <TableVue :data="partInfoData" :loading="partLoading" @edit="handleEdit" @refresh="handleRefresh" />
    <DKTableVue :data="dkData" :loading="dkLoading" />
    <n-flex>
        <AddInforVue :show="showAddModal" :editData="editData" @close="showAddModal = false" @refresh="handleRefresh" />
    </n-flex>
</template>
<style scoped>
.n-flex{
    padding: 5px;
}

</style>

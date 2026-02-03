<script setup lang="ts" name="物流资料">
import TableVue from './table.vue'
import AddInforVue from './addInfor.vue'
import DqTableVue from './dqTable.vue'
import {ref, watch, onMounted} from 'vue'
import { debounce } from 'lodash'
import apiClient from '@/utils/apiClient'

// 表单搜索值
const formValue = ref({
    wljp: '',
    lxr: '',
    lxdh: '',
    lxdz: '',
})

// 防抖后的搜索参数
const debouncedSearchParams = ref({
    wljp: '',
    lxr: '',
    lxdh: '',
    lxdz: '',
})

// 物流数据
const logisticsData = ref<any[]>([])
// 加载状态
const loading = ref(false)
// 新增物流资料弹窗显示
const showAddModal = ref(false)
// 来往地区下拉框选项
const dqOptions = ref<any[]>([])
// 编辑数据
const editData = ref<any | null>(null)

// 新增物流资料弹窗显示
function addInforShwo () {
  showAddModal.value = true
  editData.value = null
}

// 获取物流数据
async function fetchLogisticsData(params?: any) {
  loading.value = true
  try {
    // 使用统一的API接口，直接传递搜索参数
    const response = await apiClient.get('/v1/logistics', { params })
    // apiClient已经处理了响应格式，直接使用返回的数据
    logisticsData.value = response || []
  } catch (error: any) {
    console.error('获取物流数据失败:', error)
    logisticsData.value = []
  } finally {
    loading.value = false
  }
}

// 刷新数据
async function refreshLogisticsData(params: any) {
  await fetchLogisticsData(params)
}

// 防抖搜索函数，等待输入完成后1秒执行
const debouncedSearch = debounce(() => {
  // 将当前表单值赋值给防抖搜索参数
  debouncedSearchParams.value = { ...formValue.value }
  // 刷新数据
  refreshLogisticsData(debouncedSearchParams.value)
}, 1000)

// 监听表单值变化，触发防抖搜索
watch(() => formValue.value, () => {
  debouncedSearch()
}, { deep: true })

onMounted(() => {
  // 初始化时刷新数据
  refreshLogisticsData(debouncedSearchParams.value)
})

// 刷新事件处理函数
function handleRefresh() {
  refreshLogisticsData(debouncedSearchParams.value)
}

// 处理编辑事件
function handleEdit(data: any) {
  editData.value = data
  showAddModal.value = true
}
</script>
<template>
    <n-flex >
        <n-form-item label="物流简拼:" >
            <n-input v-model:value="formValue.wljp" placeholder="请输入物流简拼" clearable/>
        </n-form-item>
        <n-form-item label="联系人:" >
            <n-input v-model:value="formValue.lxr" placeholder="请输入联系人" clearable />
        </n-form-item>
        <n-form-item label="联系电话:" >
            <n-input v-model:value="formValue.lxdh" placeholder="请输入联系电话" clearable />
        </n-form-item>
        <n-form-item label="来往地区:" >
           <n-select
                        v-model:value="formValue.lwdq"
                        placeholder="请选择来往地区"
                        :options="dqOptions"
                        filterable
                        tag
                    />
        </n-form-item>
    </n-flex>
    <n-flex>
        <n-button @click="addInforShwo()">
            新增物流资料
        </n-button>
    </n-flex>
    <!-- 通过props传递数据和加载状态 -->
    <TableVue :data="logisticsData" :loading="loading" @edit="handleEdit" @refresh="handleRefresh" />
    <DqTableVue :data="logisticsData" :loading="loading" @edit="handleEdit" @refresh="handleRefresh" />
    <n-flex>
        <AddInforVue v-model:show="showAddModal" :editData="editData" @refresh="handleRefresh" />
    </n-flex>

</template>
<style scoped>
.n-flex{
    padding: 5px;
}

</style>
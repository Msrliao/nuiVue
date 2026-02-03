<template>
    <n-modal v-model:show="showModal" >
        <n-card
            style="max-width: 600px"
            title="新建仓位"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
        >
            <n-form    
                ref="formRef"    
                :model="formValue"    
                :rules="rules"   
                label-placement="left"    
                label-width="auto"
            >
                <n-grid cols="1 s:1 m:1 l:1 xl:1 2xl:1" responsive="screen">
                    <n-form-item-gi  label="仓库名称:" path="position_name">
                        <n-input v-model:value="formValue.position_name" placeholder="请输入仓库名称" clearable />
                    </n-form-item-gi >
                    
                </n-grid >
                <n-flex justify="end">
                        <n-button attr-type="button" :loading="butLoading" type="success" @click="handleValidateClick">
                            保存
                        </n-button>
                        <n-button attr-type="button" type="warning" @click="handleCancel">
                            取消
                        </n-button>
                </n-flex>
            </n-form>
        </n-card>
    </n-modal>
</template>
<script setup lang="ts">

import { ref, onUnmounted, onMounted, watch } from 'vue'
import type { FormInst } from 'naive-ui'
import { useMessage } from 'naive-ui'
import apiClient from '@/utils/apiClient'
import { useSharedStore } from '@/stores/useBaseWareStore'
import { storeToRefs } from 'pinia'
import type { ApiResponse } from '@/types'

// 定义仓位表单数据类型
type PositionFormData = {
  id?: number
  warehouse_id: number
  position_name: string
  parent_id?: number
  description?: string
}

const props = defineProps<{
  show: boolean
  editData?: any
  addData?: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
}>()

// 获取表格选中数据
const {row: tableSele}=storeToRefs(useSharedStore())
// 定义formRef
const formRef = ref<FormInst | null>(null)
// 定义遮罩层
const showModal = ref(props.show)
// 按钮加载
const butLoading= ref(false)
// 定义提交数据
const formValue = ref<PositionFormData>({
    id: null,
    warehouse_id: null,
    position_name: '',
    parent_id: null,
    description: ''
})
// 定义提示框
const message = useMessage()
// 定义验证
const rules = {
    position_name: {
        required: true,
        message: '请输入名称',
        trigger: 'blur',
        
    },
}

//清空表单函数（完善交互）
function handleClearForm() {
  if (!formRef.value) return
  // 重置表单数据
  formValue.value = {
    warehouse_id: null,
    position_name: '',
    parent_id: null,
    description: ''
  }
  // 清除表单校验状态
  formRef.value.restoreValidation()
}
// 监听 show 属性变化
watch(() => props.show, (newVal) => {
  showModal.value = newVal
})

// 监听 editData 属性变化
watch(() => props.editData, (newVal) => {
  if (newVal) {
    formValue.value = {
      id: newVal.key,
      warehouse_id: tableSele.value.id || null,
      position_name: newVal.label || '',
      description: ''
    }
  }
}, { immediate: true })

// 监听 addData 属性变化
watch(() => props.addData, (newVal) => {
  if (newVal) {
    formValue.value = {
      warehouse_id: tableSele.value.id,
      position_name: '',
      parent_id: newVal.key,
      description: ''
    }
  }
  
}, { immediate: true })

// 新增：取消按钮函数（完善交互）
function handleCancel() {
  showModal.value = false
  emit('close')
  handleClearForm() // 取消时同时清空表单
}

// 表单提交函数
async function handleValidateClick() {
    if (!formRef.value) return
    butLoading.value = true
    try {
        
        // 校验数据
        await formRef.value.validate()
        console.log('校验通过:', formValue.value)
        if(formValue.value.id){ // 更新仓位
            // 响应拦截器已经处理了响应，直接使用结果
            const response: ApiResponse<PositionFormData> = await apiClient.put(`/v1/positions/${formValue.value.id}`, formValue.value)
            if(response && response.code === 200){
                message.success('仓位更新成功')
            }
            // 关闭弹窗并清空表单
            handleCancel()
            // 通知表格组件刷新数据
            emit('refresh')
        }else{
            // 调用API提交数据
            // 响应拦截器已经处理了响应，直接使用结果
            console.log('创建仓位', formValue.value)
            const response: ApiResponse<PositionFormData> = await apiClient.post('/v1/positions', formValue.value)
            if(response && response.code === 200){
                message.success('仓位创建成功')
            }
            // 关闭弹窗并清空表单
            handleCancel()
            // 通知表格组件刷新数据
            emit('refresh')
        }
        
    } catch (error: any) {
        console.error('操作失败:', error)
        message.error(error.message || '操作失败')
    }
    butLoading.value = false
}
// 组件挂载时获取数据
onMounted(() => {
    // 组件挂载时的初始化代码
})
//  重要：组件卸载时清理
onUnmounted(() => {
  // 清理代码
})
</script>
<style scoped>
.n-button{
    padding: 5px;
    width:80px
}

</style>

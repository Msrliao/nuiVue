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
                    {{ckmc}}
                    <n-form-item-gi  label="仓库名称:" path="cwmc">
                        <n-input v-model:value="formValue.cwmc" placeholder="请输入仓库名称" />
                    </n-form-item-gi >
                    
                </n-grid >
                <n-flex justify="end">
                        <n-button attr-type="button" type="success" @click="handleValidateClick">
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

import { ref, onUnmounted, onMounted } from 'vue'
import emitter from "@/utils/emitter"
import type { TreeSelectOption, FormInst } from 'naive-ui'
import { useMessage } from 'naive-ui'
import apiClient from '@/utils/apiClient'

// 定义formRef
const formRef = ref<FormInst | null>(null)
// 定义遮罩层
const showModal = ref(false)
// 定义提交数据
const formValue = ref({
    warehouse_id: '',
    ckmc: '',
    cwmc: '',
})
// 定义提示框
const message = useMessage()
// 定义验证
const rules = {
    ckmc: {
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
    warehouse_id: '',
    ckmc: '',
    cwmc: '',
  }
  // 清除表单校验状态
  formRef.value.restoreValidation()
}
// 新增：取消按钮函数（完善交互）
function handleCancel() {
  showModal.value = false
  handleClearForm() // 取消时同时清空表单
}

// 表单提交函数
async function handleValidateClick() {
  if (!formRef.value) return
  try {
    // 校验数据
    await formRef.value.validate()
    // 调用API提交数据
    const response = await apiClient.post('/?', formValue.value)
  
    message.success('仓位创建成功')
    // 关闭弹窗并清空表单
    handleCancel()
    // 通知表格组件刷新数据
    emitter.emit('placeAddInforShwo')
  } catch (error: any) {
    message.error(error.message || '仓位创建失败')
  }
}
// 组件挂载时获取数据
onMounted(() => {
    
    //  绑定显示事件
    emitter.on("placeAddInforShwo",(value?:FormInst)=>{
        if (value) {
            formValue.value = {
                warehouse_id: value.warehouse_id || '',
                ckmc: value.ckmc || '',
                cwmc: value.cwmc || '',
               
            }
        }
        showModal.value = true
    }) 
    
    emitter.on("showAddPlaceModal",(value?: arr)=>{
        if (value) {
            formValue.value = {
                warehouse_id: value.warehouse_id || '',
                ckmc: value.ckmc || '',
                cwmc: value.cwmc || '',
               
            }
        }
        showModal.value = true
    })
})
//  重要：组件卸载时移除事件监听，防止内存泄漏
onUnmounted(() => {
    emitter.off("showAddPlaceModal")
    emitter.off("placeAddInforShwo")
})
</script>
<style scoped>
.n-button{
    padding: 5px;
    width:80px
}

</style>

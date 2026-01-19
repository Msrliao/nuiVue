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
                        <n-input v-model:value="formValue.position_name" placeholder="请输入仓库名称" />
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
const tableSlatData = ref(null)
// 定义提交数据
const formValue = ref({
    warehouse_id: '',
    position_name: '',
    parent_id:''
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
    position_name: '',
    parent_id:''
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
        console.log("formValue--",formValue.value,tableSlatData.value)
        if(formValue.value.id){
            const response = await apiClient.put(`/positions/${formValue.value.id}`, formValue.value)
            console.log('response',response)
            if(response.code === 200){
                message.success('仓位更新成功')
                // 关闭弹窗并清空表单
                handleCancel()
                // 通知表格组件刷新数据
                emitter.emit('selectWarehouse',tableSlatData.value)
            }else{
                message.success('操作失败')
            }
             

        }else{
            // 调用API提交数据
            const response = await apiClient.post('/positions', formValue.value)
            
            if(response.code === 200){
                message.success('仓位创建成功')
                // 关闭弹窗并清空表单
                handleCancel()
                // 通知表格组件刷新数据
                emitter.emit('selectWarehouse',tableSlatData.value)
            }else{
                message.success('操作失败')
            }
        }
        
    } catch (error: any) {
        message.error(error.message || '操作失败')
    }
}
// 组件挂载时获取数据
onMounted(() => {
    
    //  绑定显示事件
       
    emitter.on("showAddPlaceModal",(value?: FormInst,v2:FormInst)=>{
        console.log('value?:',value)
        if (value) {
            
            if(value.id){
                    tableSlatData.value = value
                    formValue.value = {
                    warehouse_id: value.id || '', 
                    position_name:''         
                }
            }else if (value.key){
                tableSlatData.value =v2
                formValue.value = {
                    id:value.key,
                    position_name: value.label || '',
                }
            }
            
        }
        showModal.value = true
    })
})
//  重要：组件卸载时移除事件监听，防止内存泄漏
onUnmounted(() => {
    emitter.off("showAddPlaceModal")
    
})
</script>
<style scoped>
.n-button{
    padding: 5px;
    width:80px
}

</style>

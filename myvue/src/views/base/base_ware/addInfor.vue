<template>
    <n-modal v-model:show="showModal" >
        <n-card
            style="max-width: 600px"
            title="新建仓库"
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
                    <n-form-item-gi  label="仓库名称:" path="ckmc">
                        <n-input v-model:value="formValue.ckmc" placeholder="请输入仓库名称" />
                    </n-form-item-gi >
                    <n-form-item-gi  label="负责人:" path="fzr">
                        <n-input v-model:value="formValue.fzr" placeholder="请输入负责人" />
                    </n-form-item-gi >
                    <n-form-item-gi  label="联系电话:" path="lxdh">
                        <n-input v-model:value="formValue.lxdh" placeholder="请输入联系电话" />
                    </n-form-item-gi >
                    <n-form-item-gi  :span="24" label="备注:"  path="bz" style="width:100%">
                        <n-input
                            v-model:value="formValue.bz"
                            placeholder="请输入备注"
                            type="textarea"
                            :autosize="{
                                minRows: 2,
                                maxRows: 3,
                            }"
                        />
                    </n-form-item-gi >
                </n-grid >
                <n-flex justify="end">
                        <n-button attr-type="button" :loading="butLoading" type="error" @click="handleClearForm">
                            清空
                        </n-button>
                        <n-button attr-type="button" :loading="butLoading" type="success" @click="handleValidateClick">
                            保存
                        </n-button>
                        <n-button attr-type="button" :loading="butLoading" type="warning" @click="handleCancel">
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
// 按钮加载
const butLoading=ref(false)

// 定义提交数据
const formValue = ref({
    ckmc: '',
    fzr: '',
    lxdh: '',
    bz: ''
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
    id:'',
    ckmc: '',
    fzr: '',
    lxdh: '',
    bz: ''
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
    butLoading.value = true

    try {
        // 校验数据
        await formRef.value.validate()
        // console.log("formValue.value",formValue.value)
        // 调用API提交数据
        
        const forData=formValue.value
        const response = forData.id
            ?await apiClient.put(`/warehouses/${forData.id}`, forData)
            :await apiClient.post('/warehouses',forData);
            
        response.code === 200
            ?message.success('操作成功!')
            :message.error('操作失败！')
        
        // 关闭弹窗并清空表单
        handleCancel()
        // 通知表格组件刷新数据
        emitter.emit('refreshWarehouseData')
    } catch (error: any) {
        message.error(error.message || '操作失败！')
    }
    butLoading.value = false
}
// 组件挂载时获取数据
onMounted(() => {
    //  绑定显示事件
    emitter.on("wareAddInforShwo",(value?:FormInst)=>{
        if (value) {
            formValue.value = {
                id: value.id || '',
                ckmc: value.ckmc || '',
                fzr: value.fzr || '',
                lxdh: value.lxdh || '',
                bz: value.bz || ''
            }
        }
        showModal.value = true
    }) 
})
//  重要：组件卸载时移除事件监听，防止内存泄漏
onUnmounted(() => {
  emitter.off("wareAddInforShwo")
})
</script>
<style scoped>
.n-button{
    padding: 5px;
    width:80px
}

</style>

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
                        <n-input v-model:value="formValue.ckmc" placeholder="请输入仓库名称" clearable />
                    </n-form-item-gi >
                    <n-form-item-gi  label="负责人:" path="fzr">
                        <n-input v-model:value="formValue.fzr" placeholder="请输入负责人" clearable />
                    </n-form-item-gi >
                    <n-form-item-gi  label="联系电话:" path="lxdh">
                        <n-input v-model:value="formValue.lxdh" placeholder="请输入联系电话" clearable />
                    </n-form-item-gi >
                    <n-form-item-gi  :span="24" label="备注:"  path="bz" style="width:100%">
                        <n-input
                            v-model:value="formValue.bz"
                            placeholder="请输入备注"
                            type="textarea"
                            clearable
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

import { ref, onUnmounted, onMounted, watch } from 'vue'
import type { TreeSelectOption, FormInst } from 'naive-ui'
import { useMessage } from 'naive-ui'
import apiClient from '@/utils/apiClient'

const props = defineProps<{
  show: boolean
  editData?: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
}>()

// 定义formRef
const formRef = ref<FormInst | null>(null)
// 定义遮罩层
const showModal = ref(props.show)
// 按钮加载
const butLoading=ref(false)

// 定义提交数据
const formValue = ref({
    id:'',
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
// 监听 show 属性变化
watch(() => props.show, (newVal) => {
  showModal.value = newVal
})

// 监听 editData 属性变化
watch(() => props.editData, (newVal) => {
  if (newVal) {
    formValue.value = {
      id: newVal.id || '',
      ckmc: newVal.ckmc || '',
      fzr: newVal.fzr || '',
      lxdh: newVal.lxdh || '',
      bz: newVal.bz || ''
    }
  }
}, { immediate: true })

// 取消按钮函数（完善交互）
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
        // console.log("formValue.value",formValue.value)
        // 调用API提交数据
        
        const forData=formValue.value
        const response = forData.id
            ?await apiClient.put(`/v1/warehouses/${forData.id}`, forData)
            :await apiClient.post('/v1/warehouses',forData);
    
        //response.code === 200
            // ?message.success('操作成功!')
           // :message.error('操作失败！')
           
           response
             ?message.success('操作成功!')
             :message.error('操作失败！')
        
        // 关闭弹窗并清空表单
        handleCancel()
        // 通知表格组件刷新数据
        emit('refresh')
    } catch (error: any) {
        message.error(error.message || '操作失败！')
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

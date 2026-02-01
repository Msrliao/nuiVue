<template>
    <n-modal v-model:show="showModal" preset="card" title="新建物流资料" style="width: 800px;">
        <n-form    
            ref="formRef"    
            :model="formValue"    
            :rules="rules"   
            label-placement="left"    
            label-width="auto"
        >
            <n-grid cols="1 s:1 m:2 l:2 xl:2 2xl:2" responsive="screen">
                <n-form-item-gi  label="地区名称:" path="dq">
                    <n-input v-model:value="formValue.dq" placeholder="请输入地区名称" />
                </n-form-item-gi >
                <n-form-item-gi  label="地区简拼:" path="dqJp">
                    <n-input v-model:value="formValue.dqJp" placeholder="请输入地区简拼" />
                </n-form-item-gi >
                <n-form-item-gi  label="联系人:" path="lxr">
                    <n-input v-model:value="formValue.lxr" placeholder="请输入联系人" />
                </n-form-item-gi >
                <n-form-item-gi  label="联系人电话:" path="lxdh">
                    <n-input v-model:value="formValue.lxdh" placeholder="请输入联系人电话" />
                </n-form-item-gi >
                <n-form-item-gi  label="其它联系方式:" path="qtlxfs">
                    <n-input v-model:value="formValue.qtlxfs" placeholder="请输入其它联系方式" /> 
                </n-form-item-gi >
                <n-form-item-gi  label="联系地址:" path="contactAddress">
                    <n-input v-model:value="formValue.lxdz" placeholder="请输入联系地址" type="textarea" /> 
                </n-form-item-gi >
                
                <n-form-item-gi  label="备注:" path="bz">
                    <n-input v-model:value="formValue.bz" placeholder="请输入备注" type="textarea" />
                </n-form-item-gi >
            </n-grid >
            <n-flex justify="end">
                
                    <n-button attr-type="button" type="error" @click="handleClearForm">
                        清空
                    </n-button>
                    <n-button attr-type="button" type="success" @click="handleValidateClick">
                        保存
                    </n-button>
                    <n-button attr-type="button" type="warning" @click="handleCancel">
                        取消
                    </n-button>
                
            </n-flex>
            
        </n-form>
    </n-modal>
</template>
<script setup lang="ts">

import { ref, onUnmounted, watch, onMounted } from 'vue'
import type { FormInst, SelectOption } from 'naive-ui'
import { useMessage } from 'naive-ui'
import apiClient from '@/utils/apiClient'

const props = defineProps<{
  show: boolean
  editData: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
  (e: 'update:show', value: boolean): void
}>()

const formRef = ref<FormInst | null>(null)
const showModal = ref(props.show)
const message=useMessage()
const formValue = ref({
    dq:'',
    dqJp:'',
    lxr:'',
    lxdh:'',
    qtlxfs:'',
    lxdz:'',
    bz:'',
    id: undefined
})

const rules = {

    dq: {
        required: true,
        message: '请输入地区名称',
        trigger: 'blur'
    }
}
//保存数据
async function handleValidateClick() {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    // 准备提交数据
    const submitData = {
      ...formValue.value
    }
    
    // 调用后端API
    if (formValue.value.id) {
      // 有id字段，执行修改操作
      await apiClient.put('/logistics/' + formValue.value.id, submitData)
      message.success('数据修改成功')
    } else {
      // 无id字段，执行新增操作
      await apiClient.post('/logistics', submitData)
      message.success('数据保存成功')
    }
    
    // 关闭模态框
    showModal.value = false
    emit('close')
    emit('refresh')
    
    // 清空表单
    handleClearForm()
  } catch (error: any) {
    // 处理验证失败或API错误
    if (error.name === 'ValidateError') {
      message.error('请检查表单填写是否正确')
    } else {
      message.error(error.message || '操作失败，请重试')
    }
  }
}
//清空表单函数（完善交互）
function handleClearForm() {
  if (!formRef.value) return
  // 重置表单数据
  formValue.value = {
    dq:'',
    dqJp:'',
    lxr:'',
    lxdh:'',
    qtlxfs:'',
    lxdz:'',
    bz:'',
    id: undefined
  }
  // 清除表单校验状态
  formRef.value.restoreValidation()
}
// 监听 show 属性变化
watch(() => props.show, (newVal) => {
  showModal.value = newVal
})

// 监听 showModal 变化，触发 update:show 事件
watch(() => showModal.value, (newVal) => {
  emit('update:show', newVal)
})

// 监听编辑数据变化
watch(() => props.editData, (newData) => {
  if (newData) {
    // 填充表单数据
    formValue.value = {
      dq: newData.dq || '',
      dqJp: newData.dqJp || '',
      lxr: newData.lxr || '',
      lxdh: newData.lxdh || '',
      qtlxfs: newData.qtlxfs || '',
      lxdz: newData.lxdz || '',
      bz: newData.bz || '',
      id: newData.id
    }
  } else {
    // 清空表单
    handleClearForm()
  }
}, { immediate: true })

// 新增：取消按钮函数（完善交互）
function handleCancel() {
  console.log('点击取消按钮')
  showModal.value = false
  handleClearForm() // 取消时同时清空表单
}

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
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
                <n-form-item-gi  label="物流名称:" path="wlmc">
                    <n-input v-model:value="formValue.wlmc" placeholder="请输入物流名称" />
                </n-form-item-gi >
                <n-form-item-gi  label="物流简拼:" path="wljp">
                    <n-input v-model:value="formValue.wljp" placeholder="请输入物流简拼" />
                </n-form-item-gi >
                <n-form-item-gi  label="联系人:" path="lxr">
                    <n-input v-model:value="formValue.lxr" placeholder="请输入联系人" />
                </n-form-item-gi >
                <n-form-item-gi  label="联系人简拼:" path="lxrJp">
                    <n-input v-model:value="formValue.lxrJp" placeholder="请输入联系人简拼" />
                </n-form-item-gi >
                <n-form-item-gi  label="联系人电话:" path="lxrPhone">
                    <n-input v-model:value="formValue.lxrPhone" placeholder="请输入联系人电话" />
                </n-form-item-gi >
                <n-form-item-gi  label="其它联系方式:" path="otherContact">
                    <n-input v-model:value="formValue.otherContact" placeholder="请输入其它联系方式" /> 
                </n-form-item-gi >
                <n-form-item-gi  label="联系地址:" path="contactAddress">
                    <n-input v-model:value="formValue.contactAddress" placeholder="请输入联系地址" type="textarea" /> 
                </n-form-item-gi >
                <n-form-item-gi  label="来往地区:" path="lwdq">
                    <n-select
                        v-model:value="formValue.lwdq"
                        placeholder="请选择来往地区"
                        :options="lwdqOptions"
                        filterable
                        tag
                    />
                </n-form-item-gi >
                <n-form-item-gi  label="发放代收日期:" path="ffdsrq">
                    <n-select
                        v-model:value="formValue.ffdsrq"
                        placeholder="请选择发放代收日期"
                        :options="ffdsrqOptions"
                        filterable
                        tag
                    />
                </n-form-item-gi >
                
                <n-form-item-gi  label="代收隔收天数:" path="dscsjl">
                    <n-input v-model:value="formValue.dscsjl" placeholder="请输入代收隔收天数" />
                </n-form-item-gi >
                <n-form-item-gi  label="发放代收方式:" path="ffdsfs">
                    <n-input v-model:value="formValue.ffdsfs" placeholder="请输入发放代收方式" />
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
    logisticsNo:'',
    logisticsCompany:'',
    sender:'',
    senderPhone:'',
    receiver:'',
    receiverPhone:'',
    receiverAddress:'',
    sendDate:'',
    expectedArrivalDate:'',
    actualArrivalDate:'',
    status:'',
    trackingUrl:'',
    notes:'',
    id: undefined
})

// 下拉框选项
const statusOptions = ref<SelectOption[]>([
    { label: '待发货', value: '待发货' },
    { label: '已发货', value: '已发货' },
    { label: '运输中', value: '运输中' },
    { label: '已到达', value: '已到达' },
    { label: '已签收', value: '已签收' },
    { label: '异常', value: '异常' }
])

const rules = {
    logisticsNo: {
        required: true,
        message: '请输入物流单号',
        trigger: 'blur'
    },
    logisticsCompany: {
        required: true,
        message: '请输入物流公司',
        trigger: 'blur'
    },
    status: {
        required: true,
        message: '请选择状态',
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
    logisticsNo:'',
    logisticsCompany:'',
    sender:'',
    senderPhone:'',
    receiver:'',
    receiverPhone:'',
    receiverAddress:'',
    sendDate:'',
    expectedArrivalDate:'',
    actualArrivalDate:'',
    status:'',
    trackingUrl:'',
    notes:'',
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
      logisticsNo: newData.logisticsNo || '',
      logisticsCompany: newData.logisticsCompany || '',
      sender: newData.sender || '',
      senderPhone: newData.senderPhone || '',
      receiver: newData.receiver || '',
      receiverPhone: newData.receiverPhone || '',
      receiverAddress: newData.receiverAddress || '',
      sendDate: newData.sendDate || '',
      expectedArrivalDate: newData.expectedArrivalDate || '',
      actualArrivalDate: newData.actualArrivalDate || '',
      status: newData.status || '',
      trackingUrl: newData.trackingUrl || '',
      notes: newData.notes || '',
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
<template>
    <n-modal v-model:show="showModal" :title="props.editData ? '编辑员工资料' : '新建员工资料'">
      <n-card
            style="max-width: 600px"
            title="新建配件资料"
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
            <n-grid cols="1 s:1 m:2 l:2 xl:2 2xl:2" responsive="screen">
                <n-form-item-gi  label="姓名:" path="xm">
                    <n-input v-model:value="formValue.xm" placeholder="请输入姓名" clearable />  
                </n-form-item-gi >
                <n-form-item-gi  label="性别:" path="xb">
                    <n-select
                        v-model:value="formValue.xb"
                        placeholder="请选择性别"
                        :options="sexOptions"
                    />
                </n-form-item-gi >
                <n-form-item-gi  label="出生日期:" path="csrq">
                    <n-date-picker
                        v-model:value="formValue.csrq"
                        type="date"
                        placeholder="请选择出生日期"
                    />
                </n-form-item-gi >
                <n-form-item-gi  label="民族:" path="mz">
                    <n-input v-model:value="formValue.mz" placeholder="请输入民族" clearable />   
                </n-form-item-gi >
                <n-form-item-gi  label="联系电话:" path="lxdh">
                    <n-input v-model:value="formValue.lxdh" placeholder="请输入联系电话" clearable />  
                </n-form-item-gi >
                <n-form-item-gi  label="身份证号:" path="idcard">
                    <n-input v-model:value="formValue.idcard" placeholder="请输入身份证号" clearable />  
                </n-form-item-gi >
                <n-form-item-gi  label="邮箱:" path="yx">
                    <n-input v-model:value="formValue.yx" placeholder="请输入邮箱" clearable />  
                </n-form-item-gi >
                <n-form-item-gi  label="职位:" path="zw">
                    <n-select
                        v-model:value="formValue.zw"
                        placeholder="请选择职位"
                        :options="zwOptions"
                        filterable
                        tag
                    />
                </n-form-item-gi >
                <n-form-item-gi  label="部门:" path="bm">
                    <n-select
                        v-model:value="formValue.bm"
                        placeholder="请选择部门"
                        :options="bmOptions"
                        filterable
                        tag
                    />
                </n-form-item-gi >
                <n-form-item-gi  label="工资级别:" path="gzjb">
                    <n-input v-model:value="formValue.gzjb" placeholder="工资级别" clearable />  
                </n-form-item-gi >
                <n-form-item-gi  label="入职日期:" path="rzrq">
                    <n-date-picker
                        v-model:value="formValue.rzrq"
                        type="date"
                        placeholder="请选择入职日期"
                    />
                </n-form-item-gi >
                <n-form-item-gi  label="试用期:" path="syq">
                    <n-input v-model:value="formValue.syq" placeholder="请输入试用期" clearable />  
                </n-form-item-gi >
                <n-form-item-gi  label="合同起始日期:" path="htqsrq">
                    <n-date-picker
                        v-model:value="formValue.htqsrq"
                        type="date"
                        placeholder="请选择合同起始日期"
                    />
                </n-form-item-gi >
                <n-form-item-gi  label="合同终止日期:" path="htzzrq">
                    <n-date-picker
                        v-model:value="formValue.htzzrq"
                        type="date"
                        placeholder="请选择合同终止日期"  
                    />
                </n-form-item-gi >
                <n-form-item-gi  label="紧急联系人:" path="jjlxr">
                    <n-input v-model:value="formValue.jjlxr" placeholder="请输入紧急联系人" clearable />  
                </n-form-item-gi >
                <n-form-item-gi  label="紧急联系人电话:" path="jjlxrdh">
                    <n-input v-model:value="formValue.jjlxrdh" placeholder="请输入紧急联系人电话" clearable />    
                </n-form-item-gi >
                <n-form-item-gi  :span="24" label="备注:"  path="bz" style="width:100%">
                        <n-input
                            v-model:value="formValue.bz"
                            placeholder="请输入配件备注"
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
        </n-card>
    </n-modal>
</template>
<script setup lang="ts">

import { ref, onUnmounted, watch, onMounted } from 'vue'
import type { FormInst, SelectOption } from 'naive-ui'
import { useMessage } from 'naive-ui'
import apiClient from '@/utils/apiClient'
import {generatePinyinFirstLetter } from '@/utils/dataPorc'

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
    xm:'',
    xmjp:'',
    xb:'',
    csrq: null,
    mz:'',
    lxdh:'',
    idcard:'',
    yx:'',
    zw:'',
    bm:'',
    gzjb:'',
    rzrq: null,
    syq:'',
    htqsrq: null,
    htzzrq: null,
    jjlxr:'',
    jjlxrdh:'',
    bz:'',

    id: undefined
})

// 下拉框选项
const sexOptions = ref<SelectOption[]>([
    { label: '男', value: '男' },
    { label: '女', value: '女' }
])

const zwOptions = ref<SelectOption[]>([])
const bmOptions = ref<SelectOption[]>([])

// 获取员工相关的下拉框数据
async function fetchEmployeeOptions() {
  try {
    // 获取员工列表
    const employees = await apiClient.get('/v1/employees')
    
    // 提取唯一的职位和部门值
    const positions = new Set<string>()
    const departments = new Set<string>()
    
    employees.forEach((item: any) => {
      // 处理职位
      if (item.zw) positions.add(item.zw)
      
      // 处理部门
      if (item.bm) departments.add(item.bm)
    })
    
    // 转换为下拉框选项格式
    zwOptions.value = Array.from(positions).map(pos => ({ label: pos, value: pos }))
    bmOptions.value = Array.from(departments).map(dept => ({ label: dept, value: dept }))
  } catch (error) {
    message.error('获取员工选项数据失败，请重试')
    console.error('获取员工选项数据失败：', error)
  }
}

const rules = {
    xm: {
        required: true,
        message: '请输入姓名',
        trigger: 'blur'
    },
    lxdh: {
        required: true,
        message: '请输入联系电话',
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
      await apiClient.put('/v1/employees/' + formValue.value.id, submitData)
      message.success('数据修改成功')
    } else {
      // 无id字段，执行新增操作
      await apiClient.post('/v1/employees', submitData)
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
    xm:'',
    xmjp:'',
    xb:'',
    csrq: null,
    mz:'',
    lxdh:'',
    idcard:'',
    yx:'',
    zw:'',
    bm:'',
    gzjb:'',
    rzrq: null,
    syq:'',
    htqsrq: null,
    htzzrq: null,
    jjlxr:'',
    jjlxrdh:'',
    bz:'',

    id: undefined
  }
  // 清除表单校验状态
  formRef.value.restoreValidation()
}
// 监听 show 属性变化
watch(() => props.show, (newVal) => {

  showModal.value = newVal
}, { deep: true })

// 监听编辑数据变化
    watch(() => props.editData, (newData) => {
  if (newData) {
    // 填充表单数据
    formValue.value = {
      xm: newData.xm || '',
      xmjp:newData.xmjp || '',
      xb: newData.xb || '',
      csrq: newData.csrq || null,
      mz: newData.mz || '',
      lxdh: newData.lxdh || '',
      idcard: newData.idcard || '',
      yx: newData.yx || '',
      zw: newData.zw || '',
      bm: newData.bm || '',
      gzjb: newData.gzjb || '',
      rzrq: newData.rzrq || null,
      syq: newData.syq || '',
      htqsrq: newData.htqsrq || null,
      htzzrq: newData.htzzrq || null,
      jjlxr: newData.jjlxr || '',
      jjlxrdh: newData.jjlxrdh || '',
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
  showModal.value = false
  emit('close') // 通知父组件关闭模态框
  handleClearForm() // 取消时同时清空表单
}
//获取姓名简拼
watch(()=>formValue.value.xm, () => {
  const jp =generatePinyinFirstLetter(formValue.value.xm);//获取简拼
  formValue.value.xmjp=jp
})

// 组件挂载时获取下拉框数据
onMounted(() => {
  fetchEmployeeOptions()
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
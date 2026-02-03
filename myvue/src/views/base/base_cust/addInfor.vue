<template>
    <n-modal v-model:show="showModal" >
        <n-card
            style="max-width: 600px"
            title="新建客户资料"
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
                    <n-form-item-gi  label="客户简称:" path="khjc">
                        <n-input v-model:value="formValue.khjc" placeholder="请输入客户简称" clearable />
                    </n-form-item-gi >
                    <n-form-item-gi  label="客户简拼:" path="khjp">
                        <n-input v-model:value="formValue.khjp" placeholder="请输入客户简拼"  disabled="false" clearable />
                    </n-form-item-gi >
                    <n-form-item-gi  label="客户全称:" path="khqc">
                        <n-input v-model:value="formValue.khqc" placeholder="请输入客户全称" clearable />
                    </n-form-item-gi >
                    <n-form-item-gi  label="联系人:" path="lxr">
                        <n-input v-model:value="formValue.lxr" placeholder="请输入联系人" clearable />
                    </n-form-item-gi >
                     <n-form-item-gi  label="联系电话:" path="lxdh">
                        <n-input v-model:value="formValue.lxdh" placeholder="请输入联系电话" clearable />
                    </n-form-item-gi >
                     <n-form-item-gi  label="座机电话:" path="zxdh">
                        <n-input v-model:value="formValue.zxdh" placeholder="请输入座机电话" clearable />
                    </n-form-item-gi >
                     <n-form-item-gi  label="其他联系方式:" path="qtlxfs">
                        <n-input v-model:value="formValue.qtlxfs" placeholder="请输入其他联系方式" clearable />
                    </n-form-item-gi >
                     <n-form-item-gi  label="联系地址:" path="lxdz">
                        <n-input v-model:value="formValue.lxdz" placeholder="请输入联系地址" clearable />
                    </n-form-item-gi >
                    <n-form-item-gi  label="银行账户名:" path="yhzhm">
                        <n-input v-model:value="formValue.yhzhm" placeholder="请输入银行账户名" clearable />
                    </n-form-item-gi >
                     <n-form-item-gi  label="银行账号:" path="yhzh">
                        <n-input v-model:value="formValue.yhzh" placeholder="请输入银行账号" clearable />
                    </n-form-item-gi >
                
                    <n-form-item-gi  label="所属银行:"  path="ssyh">
                        <n-select
                            v-model:value="formValue.ssyh"
                            placeholder="请选择所属银行"
                            :options="bankOptions"
                            filterable 
                            tag
                        />
                    </n-form-item-gi >
                    <n-form-item-gi  label="客户类型:"  path="khlx">
                        <n-select
                            v-model:value="formValue.khlx"
                            placeholder="请选择客户类型"
                            :options="khlxOptions"
                            multiple
                            filterable 
                            tag
                        />
                    </n-form-item-gi >
                    <n-form-item-gi  label="经营范围:"  path="jyfw">
                        <n-select
                            v-model:value="formValue.jyfw"
                            placeholder="请选择经营范围"
                            :options="jyfwOptions"
                            multiple
                            filterable 
                            tag
                        />
                    </n-form-item-gi >
                    <n-form-item-gi  label="所属地区:"  path="ssqd">
                        <n-select
                            v-model:value="formValue.ssqd"
                            placeholder="请选择或输入所属地区"  
                            :options="ssqdOptions"
                            multiple
                            filterable 
                            tag
                        />
                    </n-form-item-gi >
                    <n-form-item-gi  label="付款方式:"  path="fkfs">
                        <n-select
                            v-model:value="formValue.fkfs"
                            placeholder="请选择付款方式"  
                            :options="fkfsOptions"
                            multiple
                            filterable 
                            tag
                        />

                    </n-form-item-gi >
                    <n-form-item-gi  label="默认物流:"  path="mrwl">
                        <n-select
                            v-model:value="formValue.mrwl"
                            placeholder="请选择默认物流"  
                            :options="mrwlOptions"
                            multiple
                            filterable 
                            tag
                        />
                    </n-form-item-gi >
                    <n-form-item-gi  label="默认运货方式:"  path="mryhfs">
                        <n-select
                            v-model:value="formValue.mryhfs"
                            placeholder="请选择默认运货方式"  
                            :options="mryhfsOptions"
                            multiple
                            filterable 
                            tag
                        />
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
import type { TreeSelectOption, FormInst, SelectOption } from 'naive-ui'
import { useMessage } from 'naive-ui'
import apiClient from '@/utils/apiClient'
import { generatePinyinFirstLetter } from "@/utils/dataPorc"

const props = defineProps<{
  show: boolean
  editData: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
}>()

const formRef = ref<FormInst | null>(null)
const showModal = ref(props.show)
const message=useMessage()
const formValue = ref({
    khjc:'',
    khjp:'',
    khqc:'',
    lxr:'',
    lxrjp:'',
    lxdh:'',
    zxdh:'',
    qtlxfs:'',
    lxdz:'',
    yhzhm:'',
    yhzh:'',
    ssyh:'',
    khlx:[],
    jyfw:[],
    ssqd:[],
    fkfs:[],
    mrwl:[],
    mryhfs:[],
    bz:'',
    id: undefined
})

// 下拉框选项
const bankOptions = ref<SelectOption[]>([])
const khlxOptions = ref<SelectOption[]>([])
const jyfwOptions = ref<SelectOption[]>([])
const ssqdOptions = ref<SelectOption[]>([])
const fkfsOptions = ref<SelectOption[]>([])
const mrwlOptions = ref<SelectOption[]>([])
const mryhfsOptions = ref<SelectOption[]>([])

// 获取客户相关的下拉框数据
async function fetchCustomerOptions() {
  try {
    // 获取客户列表
    const customers = await apiClient.get('/v1/customers')
    
    // 提取唯一的选项值
    const banks = new Set<string>()
    const customerTypes = new Set<string>()
    const businessScopes = new Set<string>()
    const regions = new Set<string>()
    const paymentMethods = new Set<string>()
    const logistics = new Set<string>()
    const shippingMethods = new Set<string>()
    
    customers.forEach((item: any) => {
      // 处理所属银行
      if (item.ssyh) banks.add(item.ssyh)
      
      // 处理客户类型（数组）
      if (Array.isArray(item.khlx)) {
        item.khlx.forEach((type: string) => customerTypes.add(type))
      } else if (item.khlx) {
        customerTypes.add(item.khlx)
      }
      
      // 处理经营范围（数组）
      if (Array.isArray(item.jyfw)) {
        item.jyfw.forEach((scope: string) => businessScopes.add(scope))
      } else if (item.jyfw) {
        businessScopes.add(item.jyfw)
      }
      
      // 处理所属地区（数组）
      if (Array.isArray(item.ssqd)) {
        item.ssqd.forEach((region: string) => regions.add(region))
      } else if (item.ssqd) {
        regions.add(item.ssqd)
      }
      
      // 处理付款方式（数组）
      if (Array.isArray(item.fkfs)) {
        item.fkfs.forEach((method: string) => paymentMethods.add(method))
      } else if (item.fkfs) {
        paymentMethods.add(item.fkfs)
      }
      
      // 处理默认物流（数组）
      if (Array.isArray(item.mrwl)) {
        item.mrwl.forEach((logistic: string) => logistics.add(logistic))
      } else if (item.mrwl) {
        logistics.add(item.mrwl)
      }
      
      // 处理默认运货方式（数组）
      if (Array.isArray(item.mryhfs)) {
        item.mryhfs.forEach((method: string) => shippingMethods.add(method))
      } else if (item.mryhfs) {
        shippingMethods.add(item.mryhfs)
      }
    })
    
    // 转换为下拉框选项格式
    bankOptions.value = Array.from(banks).map(bank => ({ label: bank, value: bank }))
    khlxOptions.value = Array.from(customerTypes).map(type => ({ label: type, value: type }))
    jyfwOptions.value = Array.from(businessScopes).map(scope => ({ label: scope, value: scope }))
    ssqdOptions.value = Array.from(regions).map(region => ({ label: region, value: region }))
    fkfsOptions.value = Array.from(paymentMethods).map(method => ({ label: method, value: method }))
    mrwlOptions.value = Array.from(logistics).map(logistic => ({ label: logistic, value: logistic }))
    mryhfsOptions.value = Array.from(shippingMethods).map(method => ({ label: method, value: method }))
  } catch (error) {
    message.error('获取客户选项数据失败，请重试')
    console.error('获取客户选项数据失败：', error)
  }
}
const rules = {
    khjc: {
        required: true,
        message: '请输入客户简称',
        trigger: 'blur',
        
    },
    khjp: {
        required: true,
        message: '请输入客户简拼',
        trigger: ['input', 'blur']
    },
    khqc: {
        required: true,
        message: '请输入客户全称',
        trigger: ['input']
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
      ...formValue.value,
      // 确保数组字段正确处理
      khlx: Array.isArray(formValue.value.khlx) ? formValue.value.khlx : [],
      jyfw: Array.isArray(formValue.value.jyfw) ? formValue.value.jyfw : [],
      ssqd: Array.isArray(formValue.value.ssqd) ? formValue.value.ssqd : [],
      fkfs: Array.isArray(formValue.value.fkfs) ? formValue.value.fkfs : [],
      mrwl: Array.isArray(formValue.value.mrwl) ? formValue.value.mrwl : [],
      mryhfs: Array.isArray(formValue.value.mryhfs) ? formValue.value.mryhfs : []
    }
    
    // 调用后端API
    if (formValue.value.id) {
      // 有id字段，执行修改操作
      await apiClient.put('/v1/customers/' + formValue.value.id, submitData)
      message.success('数据修改成功')
    } else {
      // 无id字段，执行新增操作
      await apiClient.post('/v1/customers', submitData)
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
    khjc:'',
    khjp:'',
    khqc:'',
    lxr:'',
    lxrjp:'',
    lxdh:'',
    zxdh:'',
    qtlxfs:'',
    lxdz:'',
    yhzhm:'',
    yhzh:'',
    ssyh:'',
    khlx:[],
    jyfw:[],
    ssqd:[],
    fkfs:[],
    mrwl:[],
    mryhfs:[],
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

// 监听编辑数据变化
watch(() => props.editData, (newData) => {
  if (newData) {
    // 填充表单数据
    formValue.value = {
      khjc: newData.khjc || '',
      khjp: newData.khjp || '',
      khqc: newData.khqc || '',
      lxr: newData.lxr || '',
      lxrjp: newData.lxrjp || '',
      lxdh: newData.lxdh || '',
      zxdh: newData.zxdh || '',
      qtlxfs: newData.qtlxfs || '',
      lxdz: newData.lxdz || '',
      yhzhm: newData.yhzhm || '',
      yhzh: newData.yhzh || '',
      ssyh: newData.ssyh || '',
      khlx: Array.isArray(newData.khlx) ? newData.khlx : [],
      jyfw: Array.isArray(newData.jyfw) ? newData.jyfw : [],
      ssqd: Array.isArray(newData.ssqd) ? newData.ssqd : [],
      fkfs: Array.isArray(newData.fkfs) ? newData.fkfs : [],
      mrwl: Array.isArray(newData.mrwl) ? newData.mrwl : [],
      mryhfs: Array.isArray(newData.mryhfs) ? newData.mryhfs : [],
      bz: newData.bz || '',
      id: newData.id
    }
  } else {
    // 清空表单
    handleClearForm()
  }
}, { immediate: true })

// 监控客户简称变化，提取首字母到客户简拼输入框
watch(()=>formValue.value.khjc, () => {
  const jp =generatePinyinFirstLetter(formValue.value.khjc);//获取简拼
  formValue.value.khjp=jp
})

// 新增：取消按钮函数（完善交互）
function handleCancel() {
  showModal.value = false
  emit('close')
  handleClearForm() // 取消时同时清空表单
}

// 组件挂载时获取下拉框数据
onMounted(() => {
  fetchCustomerOptions()
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

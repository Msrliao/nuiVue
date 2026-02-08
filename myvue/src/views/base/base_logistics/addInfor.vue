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
                    <n-input v-model:value="formValue.wlmc" placeholder="请输入物流名称" clearable />
                </n-form-item-gi >
                <n-form-item-gi  label="物流简拼:" path="wljp">
                    <n-input v-model:value="formValue.wljp" placeholder="请输入物流简拼"  :disabled="!active"  />
                </n-form-item-gi >
                <n-form-item-gi  label="联系人:" path="lxr">
                    <n-input v-model:value="formValue.lxr" placeholder="请输入联系人" clearable />
                </n-form-item-gi >
                <n-form-item-gi  label="联系人简拼:" path="lxrJp">
                    <n-input v-model:value="formValue.lxrJp" placeholder="请输入联系人简拼" :disabled="!active"  />
                </n-form-item-gi >
                <n-form-item-gi  label="联系人电话:" path="lxrPhone">
                    <n-input v-model:value="formValue.lxrPhone" placeholder="请输入联系人电话" clearable />
                </n-form-item-gi >
                <n-form-item-gi  label="其它联系方式:" path="otherContact">
                    <n-input v-model:value="formValue.otherContact" placeholder="请输入其它联系方式" clearable /> 
                </n-form-item-gi >
                <n-form-item-gi  label="联系地址:" path="contactAddress">
                    <n-input v-model:value="formValue.contactAddress" placeholder="请输入联系地址" type="textarea" clearable /> 
                </n-form-item-gi >
                <n-form-item-gi  label="来往地区:" path="lwdq">
                    <n-select
                        v-model:value="formValue.lwdq"
                        placeholder="请选择来往地区"
                        :options="lwdqOptions"
                        filterable
                        multiple
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
                    <n-input v-model:value="formValue.dscsjl" placeholder="请输入代收隔收天数" clearable />
                </n-form-item-gi >
                <n-form-item-gi  label="发放代收方式:" path="ffdsfs">
                    <n-select
                        v-model:value="formValue.ffdsfs"
                        placeholder="请选择发放代收方式"
                        :options="ffdsfsOptions"
                        filterable
                        tag
                    />
                </n-form-item-gi >
                <n-form-item-gi  label="备注:" path="bz">
                    <n-input v-model:value="formValue.bz" placeholder="请输入备注" type="textarea" clearable />
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
import { generatePinyinFirstLetter } from "@/utils/dataPorc"

// 解析 PostgreSQL 数组字符串格式
function parsePostgresArray(value: any): string[] {
  if (!value) return []
  
  // 如果已经是数组，直接返回
  if (Array.isArray(value)) {
    return value.map(String)
  }
  
  // 如果是字符串，按逗号分割（处理 PostgreSQL 数组字符串格式）
  if (typeof value === 'string') {
    // 去除花括号并按逗号分割，同时去除双引号
    return value
      .replace(/^\{|\}$/g, '')  // 去除首尾的 { 和 }
      .split(',')
      .map((item: string) => item.trim().replace(/^"|"$/g, ''))  // 去除每个值的双引号
      .filter((item: string) => item.length > 0)
  }
  
  return []
}


const props = defineProps<{
  show: boolean
  editData: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
  (e: 'update:show', value: boolean): void
}>()

// 禁用简拼
const active =ref(false)
const formRef = ref<FormInst | null>(null)
const showModal = ref(props.show)
const message=useMessage()
const formValue = ref({
    wlmc: '',        // 物流名称
    wljp: '',        // 物流简拼
    lxr: '',         // 联系人
    lxrJp: '',       // 联系人简拼
    lxrPhone: '',    // 联系人电话
    otherContact: '', // 其它联系方式
    contactAddress: '', // 联系地址
    lwdq: null,      // 来往地区
    ffdsrq: null,    // 发放代收日期
    dscsjl: '',      // 代收隔收天数
    ffdsfs: null,    // 发放代收方式
    bz: '',          // 备注
    id: undefined    // ID（编辑时使用）
})

// 下拉框选项 - 从数据库动态加载
const lwdqOptions = ref<SelectOption[]>([])
const ffdsrqOptions = ref<SelectOption[]>([])
const ffdsfsOptions = ref<SelectOption[]>([])

// 获取物流相关的下拉框数据
async function fetchLogisticsOptions() {
  try {
    // 并行获取数据
    const [areasData, logisticsData] = await Promise.all([
      apiClient.get('/v1/areas'),
      apiClient.get('/v1/logistics')
    ])

    // 处理来往地区选项（从地区表获取）
    const regions = new Set<string>()
    if (Array.isArray(areasData)) {
      areasData.forEach((item: any) => {
        if (item.dq) regions.add(item.dq)
      })
    }
    
    // 同时从物流记录中提取地区作为补充
    if (Array.isArray(logisticsData)) {
      logisticsData.forEach((item: any) => {
        const regionArray = parsePostgresArray(item.lwdq)
        regionArray.forEach((region: string) => {
          if (region) regions.add(region)
        })
      })
    }

    // 转换为下拉框选项格式
    lwdqOptions.value = Array.from(regions).map(region => ({ label: region, value: region }))
    
    // 使用预定义选项 + 从现有数据中提取的选项
    const existingDates = new Set<string>()
    const existingMethods = new Set<string>()
    
    if (Array.isArray(logisticsData)) {
      logisticsData.forEach((item: any) => {
        if (item.ffdsrq) existingDates.add(item.ffdsrq)
        if (item.ffdsfs) existingMethods.add(item.ffdsfs)
      })
    }
    
    // 使用从现有数据中提取的选项
    ffdsrqOptions.value = Array.from(existingDates)
      .map(date => ({ label: date, value: date }))
    
    ffdsfsOptions.value = Array.from(existingMethods)
      .map(method => ({ label: method, value: method }))
  } catch (error) {
    message.error('获取物流选项数据失败，请重试')
    console.error('获取物流选项数据失败：', error)
  }
}

const rules = {
    wlmc: {
        required: true,
        message: '请输入物流名称',
        trigger: 'blur'
    },
    lxr: {
        required: true,
        message: '请输入联系人',
        trigger: 'blur'
    },
    lxrPhone: {
        required: true,
        message: '请输入联系人电话',
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
    
    let logisticsId: number | null = null
    
    // 调用后端API
    if (formValue.value.id) {
      // 有id字段，执行修改操作
      await apiClient.put('/v1/logistics/' + formValue.value.id, submitData)
      logisticsId = formValue.value.id
      message.success('数据修改成功')
    } else {
      // 无id字段，执行新增操作
      const response = await apiClient.post('/v1/logistics', submitData)
      // 获取返回的物流ID
      logisticsId = response?.id || response?.data?.id || null
      message.success('数据保存成功')
    }
    
    // 如果有地区数据且是新增操作，同时保存地区资料
    if (logisticsId && formValue.value.lwdq && Array.isArray(formValue.value.lwdq) && formValue.value.lwdq.length > 0 && !formValue.value.id) {
      try {
        // 为每个地区创建areas记录
        for (const regionName of formValue.value.lwdq) {
          if (regionName && regionName.trim()) {
            // 检查地区是否已存在
            const existingAreas = await apiClient.get('/v1/areas', { params: { dq: regionName.trim() } })
            const exists = Array.isArray(existingAreas) && existingAreas.some((area: any) => area.dq === regionName.trim())
            
            if (!exists) {
              // 地区不存在，创建新记录
              await apiClient.post('/v1/areas', {
                dq: regionName.trim(),
                dqjp: generatePinyinFirstLetter(regionName.trim()),
                lxr: '',
                lxdh: '',
                qtlxfs: '',
                lxdz: '',
                bz: '',
                index: logisticsId
              })
            }
          }
        }
      } catch (areaError) {
        console.error('保存地区资料失败:', areaError)
        // 地区保存失败不影响物流保存的成功提示
      }
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
    wlmc: '',
    wljp: '',
    lxr: '',
    lxrJp: '',
    lxrPhone: '',
    otherContact: '',
    contactAddress: '',
    lwdq: null,
    ffdsrq: null,
    dscsjl: '',
    ffdsfs: null,
    bz: '',
    id: undefined
  }
  // 清除表单校验状态
  formRef.value.restoreValidation()
}
// 监听 show 属性变化
watch(() => props.show, (newVal) => {
  showModal.value = newVal
})
// 监控物流名称变化，提取首字母到物流简拼输入框
watch(()=>formValue.value.wlmc, (newVal) => {
  if (newVal) {
    const jp = generatePinyinFirstLetter(newVal);//获取简拼
    formValue.value.wljp = jp
  }
})
watch(()=>formValue.value.lxr, (newVal) => {
  if (newVal) {
    const jp = generatePinyinFirstLetter(newVal);//获取简拼
    formValue.value.lxrJp = jp
  }
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
      wlmc: newData.wlmc || '',
      wljp: newData.wljp || '',
      lxr: newData.lxr || '',
      lxrJp: newData.lxrjp || '',
      lxrPhone: newData.lxrphone || '',
      otherContact: newData.othercontact || '',
      contactAddress: newData.contactaddress || '',
      // 解析 lwdq 为数组（支持多选）
      lwdq: parsePostgresArray(newData.lwdq),
      ffdsrq: newData.ffdsrq || null,
      dscsjl: newData.dscsjl || '',
      ffdsfs: newData.ffdsfs || null,
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

// 组件挂载时获取下拉框数据
onMounted(() => {
  fetchLogisticsOptions()
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
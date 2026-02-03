<template>
    <n-modal v-model:show="showModal" >
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
                    <n-form-item-gi  label="序码:" path="xm">
                        <n-input v-model:value="formValue.xm" placeholder="请输入配件序码" clearable />
                    </n-form-item-gi >
                    <n-form-item-gi  label="编码:" path="bm">
                        <n-input v-model:value="formValue.bm" placeholder="请输入配件编码" clearable />
                    </n-form-item-gi >
                    <n-form-item-gi  label="名称:" path="mc">
                        <n-input v-model:value="formValue.mc" placeholder="请输入配件名称" clearable />
                    </n-form-item-gi >
                    <n-form-item-gi  label="简拼:" path="jp">
                        <n-input v-model:value="formValue.jp" placeholder="请输入配件简拼" disabled="false" clearable />
                    </n-form-item-gi >
                    <n-form-item-gi  label="车型:"  path="cx">
                        <n-select
                            v-model:value="formValue.cx"
                            placeholder="请选择车型"
                            :options="vehicleOptions"
                            multiple
                            filterable 
                            tag
                        />
                    </n-form-item-gi >
                    <n-form-item-gi  label="单位:"  path="dw">
                        <n-select
                            v-model:value="formValue.dw"
                            placeholder="请选择单位"
                            :options="unitOptions"
                            filterable 
                            tag
                        />
                    </n-form-item-gi >
                    <n-form-item-gi  label="品牌:"  path="pp">
                        <n-select
                            v-model:value="formValue.pp"
                            placeholder="请选择品牌"
                            :options="brandOptions"
                            filterable 
                            tag
                        />
                    </n-form-item-gi >
                    <n-form-item-gi  label="规格:"  path="gg">
                        <n-select
                            v-model:value="formValue.gg"
                            placeholder="请选择规格"
                            :options="specOptions"
                            multiple
                            filterable 
                            tag
                        />
                    </n-form-item-gi >
                    <n-form-item-gi  label="库位:"  path="kw">
                        <n-tree-select
                            v-model:value="formValue.kw"
                            :options="options"
                            placeholder="请选择库位"
                            @update:value="handleUpdateValue"
                            :loading="loading"
                        />
                    </n-form-item-gi >
                <n-form-item-gi  label="预设进价:"  path="ysjj">
                    <n-input v-model:value="formValue.ysjj" placeholder="请输入预设进价" clearable />
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

import { ref, onUnmounted, onMounted, watch, computed} from 'vue'
import type { TreeSelectOption, FormInst, SelectOption } from 'naive-ui'
import { useMessage } from 'naive-ui'
import apiClient from "@/utils/apiClient"
import type { ApiResponse } from "@/types/index"
import type { PartInfoData } from "@/types"
import { generatePinyinFirstLetter } from "@/utils/dataPorc"

// 定义信息提示
const message = useMessage()
// 定义表单实例
const formRef = ref<FormInst | null>(null)
// 接收父组件传递的显示状态
const props = defineProps<{
  show: boolean
  editData: PartInfoData | null
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
}>()

// 定义本弹窗显示状态
const showModal = ref(props.show)
// 定义表单数据
const formValue = ref({
    xm: '',
    bm: '',
    mc: '',
    jp: '',
    cx: [] as string[],
    cxjp: '',
    dw: '',
    pp: '',
    gg: [] as string[],
    kw: '',
    ysjj: '',
    bz: '',
    id: undefined
})

// 仓库和库位树形数据
const options = ref<TreeSelectOption[]>([])
// 定义库位树形框加载状态
const loading = ref(false)

// 下拉框数据
// 定义车型下拉框数据
const vehicleOptions = ref<SelectOption[]>([])
// 定义单位下拉框数据
const unitOptions = ref<SelectOption[]>([])
// 定义品牌下拉框数据
const brandOptions = ref<SelectOption[]>([])
// 定义规格下拉框数据
const specOptions = ref<SelectOption[]>([])
// 定义表单验证规则
const rules = {
    mc: {
        required: true,
        message: '请输入名称',
        trigger: 'blur',
        
    },
    cx: {
        required: true,
        message: '请至少选择一个车型',
        trigger: ['input', 'blur'],
        validator: (rule: any, value: string[], callback: any) => {
            if (value && value.length > 0) {
                callback()
            } else {
                callback(new Error('请至少选择一个车型'))
            }
        }
    }
}
// 将扁平数据转换为树形结构
function buildTree(nodes: any[], parentId: number | null = null): TreeSelectOption[] {
  return nodes
    .filter(node => node.parent_id === parentId)
    .map(node => ({
      label: node.name || node.position_name,
      key: node.id.toString(),
      children: buildTree(nodes, node.id)
    }))
}

// 获取仓库和库位数据
async function fetchWarehouseAndPositionData() {
  loading.value = true
  try {
    // 获取仓库列表
    // 响应拦截器已经处理了响应，直接使用结果
    const warehouses = await apiClient.get('/v1/warehouses')
    
    // 获取库位列表
    // 响应拦截器已经处理了响应，直接使用结果
    const positions = await apiClient.get('/v1/positions')
    
    // 为每个仓库创建一个根节点，使用负数ID确保不与仓库和库位ID冲突
    const treeData: TreeSelectOption[] = warehouses.map((warehouse: any, index: number) => {
      // 找到该仓库下的所有库位
      const warehousePositions = positions.filter((p: any) => p.warehouse_id === warehouse.id)
      // 构建库位的树形结构
      const positionTree = buildTree(warehousePositions)
      return {
        // 使用仓库名称作为根节点标签
        label: warehouse.ckmc,
        // 使用负数ID作为根节点key，确保不与仓库和库位ID冲突
        key: `root-${warehouse.id}`,
        // 库位作为根节点的子节点
        children: positionTree
      }
    })
    // 合并仓库和库位树形数据
    options.value = treeData
  } catch (error) {
    message.error('获取仓库和库位数据失败，请重试')
    console.error('获取仓库和库位数据失败：', error)
  } finally {
    loading.value = false
  }
}

// 获取配件信息数据
async function fetchPartInfoData() {
  // 定义获取配件信息数据加载状态
  loading.value = true
  try {
    // 响应拦截器已经处理了响应，直接使用结果
    const partInfoList = await apiClient.get('/v1/parts')
    
    // 提取唯一的车型、单位、品牌、规格
    const vehicles = new Set<string>()
    const units = new Set<string>()
    const brands = new Set<string>()
    const specs = new Set<string>()
    
    partInfoList.forEach((item: any) => {
      // 处理车型（数组）
      if (Array.isArray(item.cx)) {
        item.cx.forEach((cx: string) => vehicles.add(cx))
      } else if (item.cx) {
        vehicles.add(item.cx)
      }
      
      // 处理单位
      if (item.dw) units.add(item.dw)
      
      // 处理品牌
      if (item.pp) brands.add(item.pp)
      
      // 处理规格（数组）
      if (Array.isArray(item.gg)) {
        item.gg.forEach((gg: string) => specs.add(gg))
      } else if (item.gg) {
        specs.add(item.gg)
      }
    })
    
    // 转换为下拉框选项格式
    vehicleOptions.value = Array.from(vehicles).map(v => ({ label: v, value: v }))
    unitOptions.value = Array.from(units).map(u => ({ label: u, value: u }))
    brandOptions.value = Array.from(brands).map(b => ({ label: b, value: b }))
    specOptions.value = Array.from(specs).map(s => ({ label: s, value: s }))
    
  } catch (error) {
    message.error('获取配件信息数据失败，请重试')
    console.error('获取配件信息数据失败：', error)
  } finally {
    loading.value = false
  }
}

// 树形选择框选中
function handleUpdateValue(
  value: string | number | Array<string | number> | null,
  option: TreeSelectOption | null | Array<TreeSelectOption | null>
) {
  console.log('Selected value:', value)
  console.log('Selected option:', option)
  if (value) {
    // 直接使用原始value，不进行解析
    formValue.value.kw = Array.isArray(value) ? value[0] as string : value as string
  }
}

//保存数据
async function handleValidateClick() {
  if (!formRef.value) return // 避免 formRef 为 null 时调用方法
  formRef.value.validate(async (errors) => {
    if (!errors) {
      try {
        // 响应拦截器已经处理了响应，直接使用结果
        if (formValue.value.id) {
          // 有id字段，执行修改操作
          await apiClient.put('/v1/parts/' + formValue.value.id, formValue.value)
          message.success('数据修改成功')
        } else {
          // 无id字段，执行新增操作
          await apiClient.post('/v1/parts', formValue.value)
          message.success('数据保存成功')
        }
        // 清空表单
        handleClearForm()
        // 通知父组件刷新数据
        emit('refresh')
        // 通知父组件关闭模态框
        emit('close')
      } catch (error) {
        message.error('数据操作失败，请重试')
        console.error('保存失败：', error)
      }
    } else {
      console.log('表单校验失败：', errors)
      message.error('表单校验失败，请完善必填项')
    }
  })
}
//清空表单函数（完善交互）
function handleClearForm() {
  if (!formRef.value) return
  // 重置表单数据
  formValue.value = {
    xm: '',
    bm: '',
    mc: '',
    jp: '',
    cx: [] as string[],
    cxjp: '',
    dw: '',
    pp: '',
    gg: [] as string[],
    kw: '',
    ysjj: '',
    bz: '',
    id: undefined
  }
  // 清除表单校验状态
  formRef.value. restoreValidation()
}
// 新增：取消按钮函数（完善交互）
function handleCancel() {
  handleClearForm() // 取消时同时清空表单
  // 通知父组件关闭模态框
  emit('close')
}


// 监控配件名称变化，提取首字母到简拼输入框
watch(()=>formValue.value.mc, () => {
  const jp =generatePinyinFirstLetter(formValue.value.mc);//获取简拼
  formValue.value.jp=jp
})

// 监控车型变化，提取首字母到车型简拼
watch(()=>formValue.value.cx, () => {
  if (formValue.value.cx && Array.isArray(formValue.value.cx)) {
    // 遍历所有选中的车型，生成每个车型的简拼，然后合并为一个字符串
    const cxjp = formValue.value.cx
      .map(cx => generatePinyinFirstLetter(cx))
      .join('');
    formValue.value.cxjp = cxjp;
  } else {
    formValue.value.cxjp = '';
  }
})

// 监听编辑数据变化
watch(() => props.editData, (newData) => {
  if (newData) {
    // 填充表单数据
    formValue.value = {
      xm: newData.xm || '',
      bm: newData.bm || '',
      mc: newData.mc || '',
      jp: newData.jp || '',
      cx: Array.isArray(newData.cx) ? newData.cx : [],
      cxjp: newData.cxjp || '',
      dw: newData.dw || '',
      pp: newData.pp || '',
      gg: Array.isArray(newData.gg) ? newData.gg : [],
      kw: newData.kw || '',
      ysjj: newData.ysjj || '',
      bz: newData.bz || '',
      id: newData.id
    };
  } else {
    // 清空表单
    handleClearForm();
  }
}, { immediate: true })
// 监听 show 属性变化
watch(() => props.show, (newVal) => {
  showModal.value = newVal
}, { immediate: true })

// 组件挂载时获取数据
onMounted(() => {
  fetchWarehouseAndPositionData()
  fetchPartInfoData()
})

//  重要：组件卸载时移除事件监听，防止内存泄漏
onUnmounted(() => {
  // 无需移除事件监听，因为不再使用事件总线
})
</script>
<style scoped>
.n-button{
    padding: 5px;
    width:80px
}

</style>

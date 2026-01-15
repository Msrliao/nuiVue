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
                        <n-input v-model:value="formValue.xm" placeholder="请输入配件序码" />
                    </n-form-item-gi >
                    <n-form-item-gi  label="编码:" path="bm">
                        <n-input v-model:value="formValue.bm" placeholder="请输入配件编码" />
                    </n-form-item-gi >
                    <n-form-item-gi  label="名称:" path="mc">
                        <n-input v-model:value="formValue.mc" placeholder="请输入配件名称" />
                    </n-form-item-gi >
                    <n-form-item-gi  label="简拼:" path="jc">
                        <n-input v-model:value="formValue.jc" placeholder="请输入配件简拼" />
                    </n-form-item-gi >
                    <n-form-item-gi  label="车型:"  path="cx">
                        <n-select
                           
                            v-model:value="formValue.cx"
                            placeholder="请选择或输入配件简拼"
                            :options="generalOptions"
                            multiple
                            filterable 
                            tag
                        />
                    </n-form-item-gi >
                    <n-form-item-gi  label="单位:"  path="dw">
                        <n-select
                       
                            v-model:value="formValue.dw"
                            placeholder="请输入配件简拼"
                            :options="generalOptions"
                            filterable 
                            tag
                        />
                    </n-form-item-gi >
                    <n-form-item-gi  label="品牌:"  path="pp">
                        <n-select
                      
                            v-model:value="formValue.pp"
                            placeholder="请输入配件简拼"
                            :options="generalOptions"
                            filterable 
                            tag
                        />
                    </n-form-item-gi >
                    <n-form-item-gi  label="规格:"  path="gg">
                        <n-select
                         
                            v-model:value="formValue.gg"
                            placeholder="请输入配件简拼"
                            :options="generalOptions"
                            multiple
                            filterable 
                            tag
                        />
                    </n-form-item-gi >
                    <n-form-item-gi  label="库位:"  path="kw">
                        <n-tree-select
                            :options="options"
                            
                            @update:value="handleUpdateValue"
                        />

                    </n-form-item-gi >
                    <n-form-item-gi  label="预设进价:"  path="ysjj">
                        <n-input v-model:value="formValue.ysjj" placeholder="请输入预设进价" />
                    </n-form-item-gi >
                
                    <n-form-item-gi  :span="24" label="备注:"  path="bz" style="width:100%">
                        <n-input
                            v-model:value="formValue.bz"
                            placeholder="请输入配件备注"
                            type="textarea"
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

import { ref, onUnmounted } from 'vue'
import emitter from "@/utils/emitter"
import type { TreeSelectOption, FormInst } from 'naive-ui'

const formRef = ref<FormInst | null>(null)
const showModal = ref(false)
const formValue = ref({
    xm: '',
    bm: '',
    mc: '',
    jc: '',
    cx: '',
    dw: '',
    pp: '',
    gg: '',
    kw: '',
    ysjj: '',
    bz: ''
})
const rules = {
    mc: {
        required: true,
        message: '请输入名称',
        trigger: 'blur',
        
    },
    cx: {
        required: true,
        message: '请输入车型',
        trigger: ['input', 'blur']
    },
    gg: {
        required: true,
        message: '请输入规格',
        trigger: ['input']
    },
    bm: {
        required: true,
        message: '请输入编码',
        trigger: ['input']
    }
}
// 树形选择框选中
function handleUpdateValue(
  value: string | number | Array<string | number> | null,
  option: TreeSelectOption | null | Array<TreeSelectOption | null>
) {
  console.log(value, option)
}
//保存数据
function handleValidateClick() {
  if (!formRef.value) return // 避免 formRef 为 null 时调用方法
  formRef.value.validate((errors) => {
    if (!errors) {
      message.success('表单校验通过，数据已保存')
      console.log('提交的表单数据：', formValue.value)
      // 校验通过后可关闭弹窗（按需）
      showModal.value = false
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
    jc: '',
    cx: '',
    dw: '',
    pp: '',
    gg: '',
    kw: '',
    ysjj: '',
    bz: ''
  }
  // 清除表单校验状态
  formRef.value.clearValidate()
}
// 新增：取消按钮函数（完善交互）
function handleCancel() {
  showModal.value = false
  handleClearForm() // 取消时同时清空表单
}

//  绑定显示事件
emitter.on("addInforShwo",()=>{
    showModal.value = true
}) 
//  重要：组件卸载时移除事件监听，防止内存泄漏
onUnmounted(() => {
  emitter.off("addInforShwo", eventHandler)
})
</script>
<style scoped>
.n-button{
    padding: 5px;
    width:80px
}

</style>

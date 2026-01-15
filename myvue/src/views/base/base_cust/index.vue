<script setup lang="ts">
import {ref} from 'vue'
import type { FormInst } from 'naive-ui'
// 导入事件工具
import emitter from "@/utils/emitter"
//导入组件
import TableVue from './table.vue'
import AddInforVue from './addInfor.vue'


const formRef = ref<FormInst | null>(null)
const rules = {
    khjp: {
      required: true,
      message: '请输入名称',
      trigger: 'blur'
    },
    lxdh: {
      required: true,
      message: '请输入车型',
      trigger: ['input', 'blur']
    },
    lxrjp: {
        required: true,
        message: '请输入规格',
        trigger: ['input']
    },
    khlx: {
        required: true,
        message: '请选择',
        trigger: ['input']
    }
    khdq: {
        required: true,
        message: '请选择',
        trigger: ['input']
    }
}

const formValue = ref({
  khjp: '',
  lxdh: '',
  lxrjp: '',
  khlx: '',
    khdq:''
})
function addInforShwo () {
  emitter.emit("addInforShwo")
}
</script>
<template>
    <n-form    
        ref="formRef"    
        :model="formValue"    
        :rules="rules"    
        label-placement="left"    
        label-width="auto"
    >
        <n-flex >
             <n-form-item label="客户简拼:" >
                <n-input v-model:value="formValue.khjp" placeholder="请输入配件编码"/>
            </n-form-item>
            <n-form-item label="联系电话:">
                <n-input v-model:value="formValue.lxdh" placeholder="请输入配件车型" />
            </n-form-item>
            <n-form-item label="联系人简拼:" >
                <n-input v-model:value="formValue.lxrjp" placeholder="请输入配件名称"/>
            </n-form-item>
            <n-form-item label="客户类型:" >
                <n-input v-model:value="formValue.khlx" placeholder="请输入配件规格"/>
            </n-form-item>
             <n-form-item label="客户地区:" >
                <n-input v-model:value="formValue.khdq" placeholder="请输入配件规格"/>
            </n-form-item>
           
        </n-flex>
    </n-form>
    <n-flex>
        <n-button @click="addInforShwo()">
            新增资料
        </n-button>
    </n-flex>
    <TableVue />

   
    <n-flex>
        <AddInforVue  />
    </n-flex>
</template>
<style scoped>
.n-flex{
    padding: 5px;
}

</style>

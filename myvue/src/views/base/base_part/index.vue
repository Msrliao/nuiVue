<script setup lang="ts">
import TableVue from './table.vue'
import DKTableVue from './DKTable.vue'

import {ref} from 'vue'
import emitter from "@/utils/emitter"
import AddInforVue from './addInfor.vue'
import type { FormInst } from 'naive-ui'


const formRef = ref<FormInst | null>(null)
const rules = {
    mc: {
      required: true,
      message: '请输入名称',
      trigger: 'blur'
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

const formValue = ref({
  mc: '',
  cx: '',
  gg: '',
  bm: ''

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
             <n-form-item label="配件编码:" >
                <n-input v-model:value="formValue.bm" placeholder="请输入配件编码"/>
            </n-form-item>
            <n-form-item label="配件车型:">
                <n-input v-model:value="formValue.cx" placeholder="请输入配件车型" />
            </n-form-item>
            <n-form-item label="配件名称:" >
                <n-input v-model:value="formValue.mc" placeholder="请输入配件名称"/>
            </n-form-item>
            <n-form-item label="配件规格:" >
                <n-input v-model:value="formValue.gg" placeholder="请输入配件规格"/>
            </n-form-item>
           
        </n-flex>
    </n-form>
    <n-flex>
        <n-button @click="addInforShwo()">
            新增资料
        </n-button>
    </n-flex>
    <TableVue />
    <DKTableVue />

   
    <n-flex>
        <AddInforVue  />
    </n-flex>
</template>
<style scoped>
.n-flex{
    padding: 5px;
}

</style>

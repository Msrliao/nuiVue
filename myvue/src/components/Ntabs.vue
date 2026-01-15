<template>
  <n-tabs
    v-model:value="value"
    type="card"
    size='large'
    :closable="closable"
    tab-style="min-width: 80px;"
    @close="handleClose"
    @add="handleAdd"
  >
  
    <n-tab-pane v-for="panel,key in panels" :name="key" :tab="panel.name">
      <component :is="panel.component" />
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts" name="分页">
import { computed, ref, defineComponent, h, markRaw} from 'vue'
import emitter from "@/utils/emitter"
import TableDemoVue from '@/views/common/TableDemo.vue'
import { useMessage } from 'naive-ui'
import { componentMap } from '@/router'

const message = useMessage()
const valueRef = ref(0)
// 首页模板
const showHome = markRaw(defineComponent({
  render() {
    return h(TableDemoVue)
  }
}))
// 加入首页数据
const panelsRef = ref([{name:"首页",component:showHome}])
const closableRef = computed(() => {
  return panelsRef.value.length > 1
})
// 赋值
const value = valueRef
const panels = panelsRef
const closable = closableRef
// 添加分页
function handleAdd(name: string,component:ReturnType<typeof defineComponent>) {
  const newValue = {name:name,component:component}
  panelsRef.value.push(newValue)
  valueRef.value = panelsRef.value.length-1
}
// 删除分页
function handleClose(nameIndex: number) {
  if (nameIndex===0){
    message.error('首页无法关闭！！')
    return
  }
  const { value: panels } = panelsRef
  if (!~nameIndex)
   return
  panels.splice(nameIndex, 1)
  valueRef.value = nameIndex-1
  
}
// 绑定触发事件，添加分页
emitter.on("add-tabs",(key:any)=>{
  handleAdd(key.label,componentMap[key.label])
  // console.log(value)
})
</script>
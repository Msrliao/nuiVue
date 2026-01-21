<script setup lang="ts" name='仓库资料'>
// 导入事件工具
import emitter from "@/utils/emitter"
//导入组件
import TableVue from './table.vue'
import AddInforVue from './addInfor.vue'
import PlaceTree from './placeTree.vue'
import AddPlaceVue from './addPlace.vue'
import { useMessage } from 'naive-ui'
import { useSharedStore } from '@/stores/useBaseWareStore'
import { storeToRefs } from 'pinia'

// 定义提示信息
const message = useMessage()
// 获取选中的仓库名
const {row:selectName} = storeToRefs(useSharedStore())

// 触发添加库位弹窗事件
function addPlaceShwo () {
  if (selectName.value) {
    // 触发显示添加窗口事件
    emitter.emit('indexToAddPlaceShwo')
  } else {
    message.error('请先选择要添加到哪个库房')
  }
}
// 触发添加仓房弹窗事件
function addInforShwo () {
  emitter.emit("wareAddInforShwo")
}

</script>
<template>
    <n-flex >
        <n-button @click="addInforShwo()">
                添加仓库
        </n-button>
    </n-flex>
    <TableVue />
    <n-flex >
        <n-button @click="addPlaceShwo()">
                添加库位
        </n-button>
    </n-flex>
    <n-card :title="selectName.ckmc? `仓库：${selectName.ckmc}` : '未选择仓库'">
        <PlaceTree />
    </n-card>
    <n-flex>
        <!-- 添加仓库组件 -->
        <AddInforVue  />
    </n-flex>
    <n-flex>
        <!-- 添加仓位组件 -->
        <AddPlaceVue  />
    </n-flex>

</template>
<style scoped>
.n-flex{
    padding: 5px;
}
</style>

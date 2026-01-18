<script setup lang="ts" name='仓库资料'>
import {ref,onMounted,onUnmounted} from 'vue'
// 导入事件工具
import emitter from "@/utils/emitter"
//导入组件
import TableVue from './table.vue'
import AddInforVue from './addInfor.vue'
import PlaceTree from './placeTree.vue'
import AddPlaceVue from './addPlace.vue'
import { useMessage } from 'naive-ui'


const message = useMessage()
// 1. 定义仓库数据接口
interface WarehouseData {
  id: number
  ckmc: string
  fzr?: string
  lxdh?: string
  bz?: string
  created_at: string
  updated_at: string
}

// 保存选中的仓库ID
const selectedWarehouseId = ref<WarehouseData | null>(null)

// 监听仓库行点击事件
function handleWarehouseRowClick(row: any) {
  selectedWarehouseId.value = row
}

// 触发添加库位弹窗事件
function addPlaceShwo () {
  if (selectedWarehouseId.value) {
    // 如果有选中的仓库，将仓库ID传递给添加库位组件
    emitter.emit('showAddPlaceModal', selectedWarehouseId.value)
  } else {
    message.error('请先选择库房')
  }
}
// 触发添加仓库弹窗事件
function addInforShwo () {
  emitter.emit("wareAddInforShwo")
}

// 组件挂载时监听事件
onMounted(() => {
  emitter.on('warehouseRowClick', handleWarehouseRowClick)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  emitter.off('warehouseRowClick', handleWarehouseRowClick)
})
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
    <n-card title="库位选择">
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

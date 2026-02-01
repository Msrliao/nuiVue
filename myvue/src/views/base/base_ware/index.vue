<script setup lang="ts" name='仓库资料'>
//导入组件
import TableVue from './table.vue'
import AddInforVue from './addInfor.vue'
import PlaceTree from './placeTree.vue'
import AddPlaceVue from './addPlace.vue'
import { useMessage } from 'naive-ui'
import { useSharedStore } from '@/stores/useBaseWareStore'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

// 定义提示信息
const message = useMessage()
// 获取选中的仓库名
const {row:selectName} = storeToRefs(useSharedStore())

// 新增资料模态框显示状态
const showAddModal = ref(false)
const showAddPlaceModal = ref(false)
// 编辑仓库数据
const editData = ref<any>(null)
// 编辑和添加库位数据
const editPlaceData = ref<any>(null)
const addPlaceData = ref<any>(null)

// 表格组件引用
const tableRef = ref<any>(null)
// 树形框组件引用
const placeTreeRef = ref<any>(null)

// 触发添加库位弹窗事件
function addPlaceShwo () {
  if (selectName.value) {
    // 显示添加窗口
    showAddPlaceModal.value = true
  } else {
    message.error('请先选择要添加到哪个库房')
  }
}
// 触发添加仓房弹窗事件
function addInforShwo () {
  showAddModal.value = true
}

// 刷新仓库列表事件处理函数
function handleRefresh() {
  // 刷新仓库数据的逻辑
  console.log('刷新仓库数据')
  if (tableRef.value) {
    tableRef.value.refreshData()
  }
}

// 刷新仓位树形框事件处理函数
function handleRefreshPlace() {
  // 刷新仓位树形框数据的逻辑
  console.log('刷新仓位树形框数据')
  if (placeTreeRef.value) {
    placeTreeRef.value.fetchPositionData()
  }
}

// 编辑事件处理函数
function handleEdit(data: any) {
  editData.value = data
  showAddModal.value = true
}

// 编辑库位事件处理函数
function handleEditPlace(data: any) {
  editPlaceData.value = data
  showAddPlaceModal.value = true
}

// 添加库位事件处理函数
function handleAddPlace(data: any) {
  addPlaceData.value = data
  showAddPlaceModal.value = true
}
</script>
<template>
    <n-flex >
        <n-button @click="addInforShwo()">
                添加仓库
        </n-button>
        <n-button @click="addPlaceShwo()">
                添加库位
        </n-button>
    </n-flex>
    <TableVue ref="tableRef" @edit="handleEdit" />
   
    <n-card :title="selectName.ckmc? `仓库：${selectName.ckmc}` : '未选择仓库'">
        <PlaceTree ref="placeTreeRef" @edit="handleEditPlace" @add="handleAddPlace" />
    </n-card>
    <n-flex>
        <!-- 添加仓库组件 -->
        <AddInforVue :show="showAddModal" :edit-data="editData" @close="showAddModal = false" @refresh="handleRefresh" />
    </n-flex>
    <n-flex>
        <!-- 添加仓位组件 -->
        <AddPlaceVue :show="showAddPlaceModal" :edit-data="editPlaceData" :add-data="addPlaceData" @close="showAddPlaceModal = false" @refresh="handleRefreshPlace" />
    </n-flex>

</template>
<style scoped>
.n-flex{
    padding: 5px;
}
</style>

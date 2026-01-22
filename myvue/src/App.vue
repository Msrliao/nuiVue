<template>
  <!-- 绑定massg弹出前置层 -->
  <NConfigProvider>
      <n-dialog-provider>
      <n-space vertical size="large">
          <n-layout>
              <n-layout-header >
                  <Menudemo />
              </n-layout-header>
              <n-layout-content>
                  <n-message-provider>
                    <Ntabs /> 
                 </n-message-provider>
              </n-layout-content>
          </n-layout>
      </n-space>
      </n-dialog-provider>
  </NConfigProvider>
  </template>
  
  <script setup>
  import Menudemo from "./components/Menu.vue";
  import Ntabs from "./components/Ntabs.vue";
  </script>
  <style scoped>
  .n-layout-header,
  .n-layout-content{
      padding: 15px;
  
  }
  
  </style>
import { createApp } from "vue";
import naive from "naive-ui";
import { createPinia } from 'pinia'
import App from "./App.vue";
// 创建 Pinia 实例
const pinia = createPinia()
const app = createApp(App);
app.use(naive);
app.use(pinia);
app.mount("#app");
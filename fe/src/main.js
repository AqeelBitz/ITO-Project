import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from './router'; 
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import {VueCsvImportPlugin} from "vue-csv-import";

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component); 
}

app.use(ElementPlus); 
app.use(router); 
app.use(VueCsvImportPlugin)

app.mount('#app'); 

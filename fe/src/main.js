import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from './router'; 
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import {VueCsvImportPlugin} from "vue-csv-import";

const app = createApp(App); // Create the Vue application instance first

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component); // Register icons on the app instance
}

app.use(ElementPlus); // Use Element Plus on the app instance
app.use(router); 
app.use(VueCsvImportPlugin)

app.mount('#app'); // Mount the application to the DOM

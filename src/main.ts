import { createApp } from 'vue'
import Antd from 'antdv-next'
import 'antdv-next/dist/reset.css'
import './style.css'
import App from './App.vue'
import RegressionApp from './RegressionApp.vue'
import ReviewFixesApp from './ReviewFixesApp.vue'

const query = new URLSearchParams(location.search)
createApp(query.has('review-fixes') ? ReviewFixesApp : query.has('regression') ? RegressionApp : App)
  .use(Antd).mount('#app')

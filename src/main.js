// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/styles/main.scss'
import axios from 'axios'
import myPlugin from './my-plugin.js'
import publicPlugin from '~/plugin'
import * as custom from '~/filter'
import VueI18n from 'vue-i18n'
// 引入vue-resource
import VueResource from 'vue-resource'

Object.keys(custom).forEach((key) => {
  Vue.filter(key, custom[key])
})

// 使用vue-resource
Vue.use(VueResource)

axios.defaults.baseURL = window.g.filer
axios.defaults.headers.Accept = 'application/json'
Vue.prototype.$axios = axios
Vue.config.productionTip = false
Vue.use(VueI18n) // 通过插件的形式挂载
Vue.use(ElementUI, { size: 'small' })

const i18n = new VueI18n({
  locale: window.g.locale, // 语言标识
  messages: {
    'zh-CN': require('./common/lang/zh'), // 中文语言包
    'en-US': require('./common/lang/en') // 英文语言包
  }
})
window.addEventListener('storage', function(e) {
  if (e.key === 'token' && !window.location.href.includes('login')) {
    window.location.reload()
  }
})
// 全局混入
Vue.mixin({
  data() {
    return {
      api_header: {}
    }
  },
  computed: {
  },
  mounted() {
    this.$nextTick(() => {
      this.api_header = JSON.parse(localStorage.getItem('api_header')) ? JSON.parse(localStorage.getItem('api_header')) : {}
    })
  },
  methods: {
    messageBox(type, data, duration = 3000) {
      this.$message[type]({
        showClose: true,
        message: data,
        duration: duration
      })
    },
    open_dialog(name, data) { // 打开弹框
      this.$nextTick(() => {
        this.$refs[name].open_dialog(data)
      })
    },
    // 表单重置
    resetForm(formN) {
      if (formN) {
        formN.resetFields()
      }
    }
  }
})
Vue.use(myPlugin)
Vue.use(publicPlugin)
new Vue({
  el: '#app',
  i18n,
  router,
  components: { App },
  template: '<App/>'
})

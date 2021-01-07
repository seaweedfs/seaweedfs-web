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
// introduce vue-resource
import VueResource from 'vue-resource'

Object.keys(custom).forEach((key) => {
  Vue.filter(key, custom[key])
})

// use vue-resource
Vue.use(VueResource)

axios.defaults.baseURL = window.g.filer
axios.defaults.headers.Accept = 'application/json'
Vue.prototype.$axios = axios
Vue.config.productionTip = false
Vue.use(VueI18n) // mount via plugin
Vue.use(ElementUI, { size: 'small' })

const i18n = new VueI18n({
  locale: window.g.locale, // language
  messages: {
    'zh-CN': require('./common/lang/zh'), // Chinese language pack
    'en-US': require('./common/lang/en') // English language pack
  }
})
window.addEventListener('storage', function(e) {
  if (e.key === 'token' && !window.location.href.includes('login')) {
    window.location.reload()
  }
})
// global mixin
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
    open_dialog(name, data) { // open the bullet box
      this.$nextTick(() => {
        this.$refs[name].open_dialog(data)
      })
    },
    // form reset
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

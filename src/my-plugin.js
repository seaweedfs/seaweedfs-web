import DeleteDialog from './components/delete-dialog.vue'
import SelectBlock from './components/select-block.vue'
export default {
  install: function(Vue, options) { //
    // 公用组件
    Vue.component('DeleteDialog', DeleteDialog)
    Vue.component('SelectBlock', SelectBlock)
    // 指令
  }
}

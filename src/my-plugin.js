import DeleteDialog from './components/delete-dialog.vue'
import SelectBlock from './components/select-block.vue'
export default {
  install: function(Vue, options) {
    // common components
    Vue.component('DeleteDialog', DeleteDialog)
    Vue.component('SelectBlock', SelectBlock)
  }
}

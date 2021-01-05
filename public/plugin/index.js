
export default {
  install: function(Vue, options) { //
    Vue.prototype.$table_select_repeat = function(serverSelected, tableList, dom, type, idKey) { // 列表勾选项复现
      var select_table = JSON.stringify(serverSelected)
      select_table = JSON.parse(select_table)
      var key = 'id'
      if (idKey) {
        key = idKey
      }
      setTimeout(() => {
        for (var item of select_table) {
          for (var ite of tableList) {
            var old = get_val(ite, key)
            var _new = get_val(item, key)
            if (old == _new) {
              this.$refs[dom].toggleRowSelection(ite, true)
            } else {
              if (type != 'list') {
                this.$refs[dom].toggleRowSelection(ite, false)
              }
            }
          }
        }
      })
      function get_val(data, key) {
        var keys = key.split('.')
        var val = JSON.stringify(data),
          val = JSON.parse(val)
        var res = ''
        for (var k of keys) {
          val = val[k]
        }
        if (JSON.stringify(val) !== JSON.stringify(data)) {
          res = val
        }
        return val
      }
    }
    Vue.prototype.$handle_http_back = (res, isOk, isErr, msg) => { // 返回结果处理函数,res数据，isok = true不显示成功提示fasle显示，isErr = true,不显示错误提示false显示，elm暂时不用
      return new Promise((resolve, reject) => {
        if (res.status == 200 || res.status == 201) {
          if (!isOk) {
            setTimeout(() => {
              Vue.prototype.$message({
                customClass: 'customClass',
                type: 'success',
                duration: 3000,
                message: msg || res.status_mes
              })
            })
          }
          resolve(res)
        } else {
          if (!isErr) {
            setTimeout(() => {
              Vue.prototype.$message({
                type: 'error',
                duration: 3000,
                message: res.status_mes
              })
            })
          }
          reject(res)
        }
      })
    }
  }
}

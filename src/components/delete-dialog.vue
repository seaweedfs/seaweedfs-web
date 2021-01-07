<template>
  <div class="dialog" v-if="isShow">
    <div style="position:relative;">
      <div class="dialog-box" :style="{ width: box_width }">
        <div class="dialog-header" :style="header_style">
          {{ title }}
          <i
            class="el-icon-close icon-cancle"
            style="cursor:pointer"
            @click="cancel"
          ></i>
        </div>
        <div class="dialog-content">
          <div
            style="padding:25px 25px 30px;font-size:14px"
            v-if="select_list.length == 1"
          >
            <p
              style="display:flex;align-items: center;justify-content:center;"
              v-if="
                type != 'freed' &&
                  type != 'shutoff' &&
                  type != 'open' &&
                  type != 'shutDown'
              "
            >
              <i class="fa fa-trash-o" style="color: red;font-size: 16px;"></i>
              <span style="margin-left:10px"
                >{{$t('button.confirmDelete')}}<span style="font-weight: bold;">{{
                  select_list[0].name
                }}</span
                >？</span
              >
            </p>
            <p class="tooltip" v-if="tooltip">{{ tooltip }}</p>
          </div>
          <div
            style="padding:25px 25px 30px;font-size:14px"
            v-else-if="select_list.length > 1"
          >
            <p
              style="margin-bottom:10px;text-align: center;"
              v-if="
                type != 'freed' &&
                  type != 'shutoff' &&
                  type != 'open' &&
                  type != 'shutDown'
              "
            >
              <i class="fa fa-trash-o" style="color: red;font-size: 16px;"></i>
              <span style="margin-left:10px">{{$t('deletePage.message1')}}</span>
            </p>
            <select-block
              :list="select_list"
              nameKey="name"
              idKey="id"
              @change="block_change"
            ></select-block>
            <p class="tooltip" v-if="tooltip">{{ tooltip }}</p>
          </div>
        </div>
        <div>
          <el-form :model="delForm" ref="form" style="margin:10px" label-width="380px" v-if="tree">
            <el-form-item :label="$t('deletePage.whetherToDeleteRecursively')+':'">
              <el-checkbox v-model="delForm.recursive"></el-checkbox>
            </el-form-item>
            <el-form-item :label="$t('deletePage.WhetherToKeepTheFileBlock')+':'">
              <el-checkbox v-model="delForm.skip_chunk_deletion"></el-checkbox>
            </el-form-item>
            <el-form-item :label="$t('deletePage.WhetherToIgnoreErrorsWhenDeletingRecursively')+':'">
              <el-checkbox v-model="delForm.ignore_recursive_error"></el-checkbox>
            </el-form-item>
          </el-form>
        </div>
        <div class="dialog-footer" :style="footer_style">
          <div></div>
          <div style="margin-right: 14px;">
            <el-button
              type="danger"
              :loading="confirm_loading"
              @click="confirm"
              :disabled="isDisabled"
              v-if="
                type != 'freed' &&
                  type != 'shutoff' &&
                  type != 'open' &&
                  type != 'shutDown'
              "
            >
              <span v-if="!confirm_loading">{{$t('button.determine')}}</span>
              <span v-else>{{$t('button.deleting')}}...</span>
            </el-button>
            <el-button @click="cancel" class="reset">{{$t('button.cancel')}}</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/** description
 * delete the bullet box, support multiple selection
 *
  // head configurable items
  headerConfig={
    background:'',
    padding:'12px 16px 16px 16px',
    fontSize:'18px',
    color:'#333',
    fontWeight:'400',
  }
  tail configurable items
  footerConfig={
    background:'',
    padding:'12px 16px 16px 16px',
    textAlign: 'center'
  }

 incoming form object form

  eg:
  <dialog :isShow.sync="test" @confirm="dialogTest" ref="testDialog" title="我是头部" :form="testObj">
    I want a little test
  </dialog>

  data processing function, each parameter is required.
  parameter 1, the return value is passed in, parameter 2, whether the correct information prompt is required, whether the parameter 3 requires an error information prompt, and the parameter 4 is the object of the pop-up box.
  then the processing state is correct, and the catch processing state is wrong.
  this.$handle_http_back(data,false,true,this.$refs['testDialog']).then((res)=>{
    this.test = false;
    console.log(res);
    console.log(this.testObj);
  }).catch((err)=>{
    console.log(err)
  })
  noLoading no button loading required, true not required, required by default
  isDisabled oK button disabled
  list incoming data array
  nameKey delete the name field corresponding to the object
  idKey delete the ID field corresponding to the object
  tooltip prompt statement string
  type only applicable to release public network ip freed
**/
export default {
  props: [
    'width',
    'headerConfig',
    'footerConfig',
    'isShow',
    'title',
    'noLoading',
    'isDisabled',
    'list',
    'nameKey',
    'idKey',
    'tooltip',
    'type',
    'tree'
  ],
  data() {
    return {
      confirm_loading: false,
      select_list: [],
      result_list: [],
      protocolItems: [
        {
          label: 'HDFS',
          value: 'HDFS'
        },
        {
          label: 'S3',
          value: 'S3'
        },
        {
          label: 'HTTP',
          value: 'HTTP'
        }
      ],
      delForm: {
        recursive: true,
        skip_chunk_deletion: false,
        ignore_recursive_error: false
      }
    }
  },
  watch: {
    isShow: function(_new, _old) {
      if (_new) {
        this.confirm_loading = false
        this.init()
        if (this.form) {
          this.$clearObj(this.form)
        }
      }
    },
    list: {
      handler: function() {}
    }
  },
  created() {
    this.init()
  },
  computed: {
    box_width() {
      var res = 0
      if (this.width) {
        res = this.width
      } else {
        res = 600
      }
      return res + 'px'
    },
    header_style() {
      var config = {
        background: '#EBEEF5',
        padding: '12px 16px 12px 16px',
        fontSize: '18px',
        color: '#333',
        textAlign: 'center'
      }
      if (this.headerConfig) {
        for (var key in this.headerConfig) {
          this.config[key] = this.headerConfig[key]
        }
      }
      return config
    },
    footer_style() {
      var config = {
        background: '',
        padding: '12px 16px 16px 16px'
      }
      if (this.footerConfig) {
        for (var key in this.footerConfig) {
          this.config[key] = this.footerConfig[key]
        }
      }
      return config
    }
  },
  methods: {
    init() {
      this.result_list = []
      var data = JSON.stringify(this.list)
      data = JSON.parse(data)
      var arr = []
      data.forEach((item, index) => {
        var id = get_val(item, this.idKey)
        var name = get_val(item, this.nameKey)
        var obj = {
          name: name,
          id: id,
          msg: item,
          index: index
        }
        arr.push(obj)
      })
      function get_val(data, key) {
        var keys = key.split('.')
        var val = JSON.stringify(data)
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

      this.select_list = arr
    },
    block_change(data) {
      this.result_list = data
    },
    confirm() {
      var _this = this
      if (_this.tree) {
        this.$refs.form.validate((valid) => {
          if (valid) {
            var back = ''
            if (this.result_list[0]) {
              back = this.result_list
            } else {
              back = this.select_list
            }
            _this.confirm_loading = true
            this.$emit('confirm', {
              status: true,
              data: back,
              delForm: _this.delForm,
              close: function() {
                _this.confirm_loading = false
              }
            })
          } else {
            return false
          }
        })
      } else {
        var back = ''
        if (this.result_list[0]) {
          back = this.result_list
        } else {
          back = this.select_list
        }
        _this.confirm_loading = true
        this.$emit('confirm', {
          status: true,
          data: back,
          close: function() {
            _this.confirm_loading = false
          }
        })
      }
    },
    cancel() {
      this.$emit('update:isShow', false)
    }
  }
}
</script>

<style scoped>
.dialog {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  margin: 0;
  background: rgba(1, 1, 1, 0.7);
  z-index: 2000;
}
.dialog-box {
  background: white;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 120px;
  display: inline-block;
}
.dialog-header {
  overflow: hidden;
}
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e8eaec;
}
.icon-cancle {
  float: right;
}
.el-button--primary:hover {
  background: #3f8bee;
  color: #ffffff;
  opacity: 1;
}
.el-button--small {
  border-radius: 2px;
}
.el-button + .el-button {
  margin-left: 4px;
}
.tooltip {
  border: 1px solid gainsboro;
  padding: 4px 8px;
  color: gray;
  background: #eceef1;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 10px;
}
</style>

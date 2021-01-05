<template>
  <el-dialog :title="$t('detailsPage.details')" :visible.sync="dialogFormVisible"  :before-close="handleClose" :close-on-click-modal="false" :close-on-press-escape="false" :append-to-body="true">
    <div class="details" v-loading.sync="dialogFormLoading">
      <dl>
        <dt>{{$t('detailsPage.name')}}：</dt>
        <dd>
          <span>{{ fileDetails.FullPath | interceptString }}</span>
        </dd>
      </dl>
      <dl>
        <dt>{{$t('detailsPage.md5')}}：</dt>
        <dd>
          <span>{{ fileDetails.Md5 }}</span>
        </dd>
      </dl>
        <dl>
        <dt>{{$t('detailsPage.fileType')}}：</dt>
        <dd>
          <span>{{ fileDetails.Mime }}</span>
        </dd>
      </dl>
      <dl>
        <dt>{{$t('detailsPage.fileSize')}}：</dt>
        <dd>
          <span>{{ fileDetails.FileSize | conver }}</span>
        </dd>
      </dl>
      <dl>
        <dt>{{$t('detailsPage.filePath')}}：</dt>
        <dd>
          <span>{{ fileDetails.FullPath }}</span>
        </dd>
      </dl>        
      <dl>
        <dt>{{$t('detailsPage.mkdirTime')}}：</dt>
        <dd>
          <span>{{fileDetails.Mtime | dateformat() }}</span>
        </dd>
      </dl>
      <dl>
        <dt>{{$t('detailsPage.creationTime')}}：</dt>
        <dd>
          <span>{{fileDetails.Crtime | dateformat() }}</span>
        </dd>
      </dl>
      <dl>
        <dt>{{$t('detailsPage.fileLabel')}}：</dt>
        <dd>
          <span v-for="(item,index) in taggingArr" :key="index" style="margin-right:5px">
            <el-tag>seaweed-{{item.key}} ：{{item.value}}</el-tag>
          </span>
          <span><el-tag @click="innerVisible = true,form.taggingData = JSON.parse(JSON.stringify(taggingArr))" style="cursor: pointer;">{{taggingArr.length > 0 ? $t('detailsPage.editLabel'):'+' + $t('detailsPage.addLabel')}}</el-tag></span>
          <span><el-tag @click="delTagging" v-if="taggingArr.length > 0" style="cursor: pointer;" type="danger">{{$t('detailsPage.removeLabel')}}</el-tag></span>
        </dd>
      </dl>
    </div>
    <el-dialog
      width="40%"
      :title="$t('detailsPage.addLabel')"
      :visible.sync="innerVisible" :close-on-click-modal="false" :close-on-press-escape="false" :append-to-body="true">
      <el-form :model="form" :rules="rules" ref="form" style="margin:10px" label-width="60px">
        <div class="row-layout" v-for="(data,index) of form.taggingData" :key="index">
          <el-form-item label="key" style="flex:1" :prop="'taggingData.'+index+'.key'" :rules="{ required: true, message: $t('detailsPage.message1'), trigger: 'blur' }">
            <el-col :span="24" style="display: flex">
              seaweed-
              <el-input v-model="data.key" style="flex:1" />
            </el-col>
          </el-form-item>
          <el-form-item label="value" style="margin-left:10px;flex:1;" :prop="'taggingData.'+index+'.value'" :rules="[{ required: true, message: $t('detailsPage.message2'), trigger: 'blur' }]">
            <el-input v-model="data.value"></el-input>
          </el-form-item>
          <el-form-item label-width="10px" style="margin-left:20px">
            <i class="el-icon-delete delete-icon" style="color:red" @click="delete_form(index)"></i>
          </el-form-item> 
        </div>
        <p style="text-align:center;cursor:pointer" class="border-style" @click="add_form()">
          {{$t('detailsPage.message3')}}
        </p>
      </el-form>
      <el-alert
        :title="$t('detailsPage.message4')"
        type="warning"
        show-icon :closable="false">
      </el-alert>
      <span slot="footer" class="dialog-footer">
        <el-button @click="innerVisible = false">{{$t('button.cancel')}}</el-button>
        <el-button type="primary" @click="submit" :loading="loading">
          <span v-if="!loading">{{$t('button.addTo')}}</span>
          <span v-else>{{$t('button.adding')}}...</span>
        </el-button>
      </span>
    </el-dialog>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('button.cancel')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import moment from 'moment'
import * as file_http from '@/http/file-http/file-http'

export default {
  name: 'DetailsDialog',
  data() {
    return {
      recordData: [],
      innerVisible: false,
      form: {
        taggingData: []
      },
      dialogFormLoading: false,
      dialogFormVisible: false,
      loading: false,
      api_id: '',
      fileDetails: {
        FullPath: ''
      },
      path: '',
      taggingArr: [],
      rules: {
        Path: {
          required: true,
          message: 'Please enter a name',
          trigger: 'blur'
        }
      }
    }
  },
  filters: {
    interceptString(str) {
      return str.substring(str.lastIndexOf('\/') + 1, str.length)
    }
  },
  computed: {
    username() {
      return JSON.parse(localStorage.user_info).username
    }
  },
  methods: {
    open_dialog(row_data, path) {
      this.path = path
      this.fileDetails = row_data
      this.loading = false
      this.dialogFormLoading = true
      this.dialogFormVisible = true
      this.getFileTagging()
    },
    getFileTagging() {
      this.dialogFormLoading = true
      this.$http.head(`${window.g.filer}${this.fileDetails.FullPath}`).then(res => {
        this.taggingArr = []
        this.recordData = []
        console.log(res, 'res.headers', Object.keys(res.headers.map))
        if (res.status == 200) {
          Object.keys(res.headers.map).forEach(item => {
            if (item.search('seaweed-') !== -1) {
              this.taggingArr.push({ 'key': item.substring(item.lastIndexOf('-') + 1, item.length), 'value': res.headers.map[item][0] })
            }
          })
          this.recordData = this.taggingArr
          this.dialogFormLoading = false
        } else {
          // this.messageBox('error', 'error')
          this.taggingArr = []
          this.recordData = []
        }
        this.dialogFormLoading = false
      }).catch(err => {
        this.taggingArr = []
        this.recordData = []
        this.messageBox('error', err.error)
        this.dialogFormLoading = false
      })
    },
    // 删除标签
    delete_form(index) {
      this.form.taggingData.splice(index, 1)
    },
    // 添加标签
    add_form() {
      this.form.taggingData.push({ key: '', value: '' })
    },
    // 删除标签
    delTagging() {
      this.dialogFormLoading = true
      file_http.del_filer(this.fileDetails.FullPath + '?tagging').then((res) => {
        if (res.status === 202) {
          this.messageBox('success', this.$t('detailsPage.successfullyDeletedPrompt'))
          this.getFileTagging()
        } else {
          this.messageBox('error', this.$t('detailsPage.deleteFailurePrompt'))
        }
      }).catch(err => {
        this.messageBox('error', err.error)
      })
    },
    submit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          var data = {}
          this.form.taggingData.forEach(item => {
            data['seaweed-' + item.key] = item.value
          })
          if (this.recordData.length === 0) {
            this.$axios.put(this.fileDetails.FullPath + '?tagging', '', { headers: data }).then((res) => {
              if (res.status === 202) {
                this.messageBox('success', this.$t('detailsPage.addedSuccessfully'))
                this.getFileTagging()
                this.innerVisible = false
              } else {
                this.messageBox('error', this.$t('detailsPage.addFailed'))
              }
              this.loading = false
            }).catch(err => {
              this.messageBox('error', err.error)
              this.loading = false
            })
          } else {
            file_http.del_filer(this.fileDetails.FullPath + '?tagging').then(res => {
              console.log(res, 'res')
              if (res.status === 202 || res.status === 304) {
                this.$axios.put(this.fileDetails.FullPath + '?tagging', '', { headers: data }).then((res) => {
                  if (res.status === 202) {
                    this.messageBox('success', this.$t('detailsPage.addedSuccessfully'))
                    this.getFileTagging()
                    this.innerVisible = false
                  } else {
                    this.messageBox('error', this.$t('detailsPage.addFailed'))
                    this.messageBox('error', 'error')
                  }
                  this.loading = false
                }).catch(err => {
                  this.messageBox('error', err.error)
                  this.loading = false
                })
              } else {
                this.messageBox('error', this.$t('detailsPage.deleteFailurePrompt'))
                this.loading = false
              }
            }).catch(err => {
              console.log(err)
              this.messageBox('error', err)
            })
          }
        } else {
          return false
        }
      })
    },
    handleClose() {
      this.$nextTick(() => {
        this.taggingArr = []
      })
      this.dialogFormVisible = false
    }
  }
}
</script>

<style scoped>
.details dl {
    margin: 0;
    font-size: 12px;
    border-top: 1px solid #f8f9fa;
    min-height: 30px;
    padding: 6px 0;
    line-height: 35px;
  }
  .details dl:first-child {
    border: none;
  }
  dl dt {
    float: left;
    color: #999;
  }
  .details dl dd {
    margin-left: 90px;
  }
  .row-layout{
    display: flex;
    align-items: center;
    font-size: 14px;
    justify-content: space-between;
  }
</style>

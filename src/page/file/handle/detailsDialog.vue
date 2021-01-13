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
      <dl v-if="fileDetails.FileSize>0">
        <dt>{{$t('detailsPage.fileLabel')}}：</dt>
        <dd>
          <span v-for="(item,index) in taggingArr" :key="index" style="margin-right:5px">
            <el-tag closable :disable-transitions="false" @close="removeItem(item)">seaweed-{{item.key}} ：{{item.value}}</el-tag>
          </span>
          <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          >
          </el-input>
          <span v-else><el-tag @click="showInput" style="cursor: pointer;">{{'+' + $t('detailsPage.addLabel')}}</el-tag></span>
          <span><el-tag @click="delTagging" v-if="taggingArr.length > 0" style="cursor: pointer;" type="danger">{{$t('detailsPage.removeLabel')}}</el-tag></span>
        </dd>
      </dl>
      <el-alert v-else
        :title=" $t('detailsPage.message1')"
        type="warning"
        show-icon :closable="false">
      </el-alert>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('button.cancel')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
  import * as file_http from '@/http/file-http/file-http'
  import Bus from '@/bus.js'

  export default {
    name: 'DetailsDialog',
    data() {
      return {
        inputVisible: false,
        inputValue: '',
        form: {
          taggingData: []
        },
        dialogFormLoading: false,
        dialogFormVisible: false,
        fileDetails: {
          FullPath: ''
        },
        path: '',
        taggingArr: []
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
        this.dialogFormLoading = true
        this.dialogFormVisible = true
        this.getFileTagging()
      },
      // show input
      showInput() {
        this.inputVisible = true
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      // handle input confirm
      handleInputConfirm() {
        var data = {}
        data['seaweed-' + this.inputValue] = this.inputValue
        if (this.inputValue) {
          this.$axios.put(this.fileDetails.FullPath + '?tagging', '', { headers: data }).then((res) => {
            if (res.status === 202) {
              this.inputVisible = false
              this.inputValue = ''
              this.getFileTagging()
            } else {
              this.messageBox('error', this.$t('detailsPage.addFailed'))
            }
            this.inputVisible = false
            this.inputValue = ''
          }).catch(error => {
            if (error && error.response) {
              Bus.$emit('errorStatus', error.response.status)
            } else {
              Bus.$emit('errorStatus', 'error')
            }
            this.dialogFormVisible = false
            this.$emit('ok')
          })
        } else {
          this.inputVisible = false
          this.inputValue = ''
        }
      },
      // delete a single label
      removeItem(item) {
        var data = {}
        this.taggingArr.forEach(ele => {
          if (ele.key !== item.key && ele.value !== item.value) {
            data['seaweed-' + ele.key] = ele.value
          }
        })
        file_http.del_filer(this.fileDetails.FullPath + '?tagging').then(res => {
          if (res.status === 202 || res.status === 304) {
            this.$axios.put(this.fileDetails.FullPath + '?tagging', '', { headers: data }).then((res) => {
              if (res.status === 202) {
                this.getFileTagging()
              } else {
                this.messageBox('error', this.$t('deletePage.deleteFailurePrompt'))
              }
            }).catch(error => {
              if (error && error.response) {
                Bus.$emit('errorStatus', error.response.status)
              } else {
                Bus.$emit('errorStatus', 'error')
              }
              this.dialogFormVisible = false
              this.$emit('ok')
            })
          } else {
            this.messageBox('error', this.$t('deletePage.deleteFailurePrompt'))
          }
        })
      },
      // get label
      getFileTagging() {
        if (this.fileDetails.FileSize <= 0) {
          this.dialogFormLoading = false
        } else {
          this.dialogFormLoading = true
          this.$http.head(`${window.g.filer}${this.fileDetails.FullPath}`).then(res => {
            this.taggingArr = []
            if (res.status === 200) {
              Object.keys(res.headers.map).forEach(item => {
                if (item.search('seaweed-') !== -1) {
                  this.taggingArr.push({ 'key': item.substring(item.lastIndexOf('-') + 1, item.length), 'value': res.headers.map[item][0] })
                }
              })
              this.dialogFormLoading = false
            } else {
              this.dialogFormLoading = false
              this.$emit('ok')
            }
            this.dialogFormLoading = false
          }).catch(error => {
            if (error && error.response) {
              Bus.$emit('errorStatus', error.response.status)
            } else {
              Bus.$emit('errorStatus', 'error')
            }
            this.dialogFormLoading = false
            this.$emit('ok')
          })
        }
      },
      // delete all tags
      delTagging() {
        this.dialogFormLoading = true
        file_http.del_filer(this.fileDetails.FullPath + '?tagging').then((res) => {
          if (res.status === 202) {
            this.messageBox('success', this.$t('detailsPage.successfullyDeletedPrompt'))
            this.getFileTagging()
          } else {
            this.dialogFormLoading = false
            this.messageBox('error', this.$t('deletePage.deleteFailurePrompt'))
          }
        }).catch(_ => {
          this.dialogFormLoading = false
        })
      },
      // close details box
      handleClose() {
        this.$nextTick(() => {
          this.taggingArr = []
          this.inputVisible = false
          this.inputValue = ''
        })
        this.$emit('ok')
        this.dialogFormVisible = false
      }
    }
  }
</script>

<style scoped>
</style>

<template>
    <el-dialog :title="$t('uploadFilesPage.title')" :visible.sync="dialogFormVisible"  :before-close="handleClose" :close-on-click-modal="false" :close-on-press-escape="false" :append-to-body="true" width="80%">
      <el-row>
      <div class="table-style">
        <div class="action-bar">
          <el-upload class="upload-demo" ref="upload" :show-file-list="false" :before-remove="beforeRemove" :http-request="httpRequest" :with-credentials="true" :action="uploadUrl" :on-change="handleOnchange" :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">{{$t('uploadFilesPage.upload')}}</el-button>
          </el-upload>
        </div>
        <div class="pd-row">
          <el-table :data="List" stripe v-loading="loading" ref="table_dom" style="width: 100%" :default-sort = "{prop: 'date', order: 'ascending'}">
            <el-table-column prop="date" :label="$t('uploadFilesPage.fileName')" width="200">
              <template slot-scope="scope">
                <el-input v-model="scope.row.name" />
              </template>
            </el-table-column>
           <el-table-column prop="date" :label="$t('uploadFilesPage.fileType')">
              <template slot-scope="scope">{{ processingClassName(scope.row.name) }}</template>
            </el-table-column>
            <el-table-column prop="date" :label="$t('uploadFilesPage.fileSize')">
              <template slot-scope="scope">{{ scope.row.size | conver }}</template>
            </el-table-column>
            <el-table-column prop="date" :label="$t('uploadFilesPage.uploadSpeed')">
              <template slot-scope="scope">
                <div class="progress" :style="{backgroundImage:'linear-gradient(to right,#3a8ee6 0%,#3a8ee6 '+scope.row.progress+',#E1E6E9 '+scope.row.progress+',#E1E6E9 100%)'}"></div>
              </template>
            </el-table-column>
            <el-table-column prop="date" :label="$t('uploadFilesPage.startAll')" align="center">
              <template slot="header" slot-scope="{ column }">
                <el-button type="primary" size="mini" @click="uploadAll(column)">{{$t('uploadFilesPage.startAll')}}</el-button>
              </template>
              <template slot-scope="scope">
                <el-button type="success" v-if="scope.row.progress === '100%' && scope.row.size >0" size="mini" disabled>{{$t('uploadFilesPage.uploadSuccessfully')}}</el-button>
                <el-button type="warning" v-if="scope.row.progress !== '100%' && scope.row.size ===0" size="mini" disabled>{{$t('uploadFilesPage.button')}}</el-button>
                <el-button type="primary" :loading="scope.row.loading" v-if="scope.row.progress !== '100%' && scope.row.size !==0" size="mini" @click="upload(scope.row)">{{$t('uploadFilesPage.startUpload')}}</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="data" width="50">
              <template slot-scope="scope">
                <span style="color:#ff1111;cursor: pointer;" @click="delFile(scope.row)">X</span>
              </template>
            </el-table-column>
            <div slot="empty">
              <span>
                <i class="fa fa-info-circle"></i>
                {{$t('uploadFilesPage.empty')}}
              </span>
            </div>
          </el-table>
        </div>
      </div>
    </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{$t('button.cancel')}}</el-button>
      </span>
    </el-dialog>
</template>
<script>
  export default {
    name: 'UploadFilesDialog',
    components: {},
    data() {
      return {
        uploadUrl: '/sugon-gdb/v1/backups',
        List: [],
        dialogDelete: false,

        dialogFormVisible: false,
        loading: false,
        path: '',
  
        progress: '0'
      }
    },
    computed: {},
    watch: {},
    methods: {
      open_dialog(path) {
        this.List = []
        this.path = path + (path === '/' ? '' : '/')
        this.loading = false
        this.dialogFormVisible = true
      },
      upload(file) {
        file.loading = true
        this.List[this.List.indexOf(file)] = file
        var fileName = ''
        if (file.name !== file.raw.name) {
          fileName = file.name
        }
        const data = new FormData()
        data.append('multiFile', file.raw)
        var config = {
          onUploadProgress: progressEvent => {
            var complete = (progressEvent.loaded / progressEvent.total * 100 | 0) - 10 + '%'
            file.progress = complete
            this.List[this.List.indexOf(file)] = file
            this.List.splice(this.List.indexOf(file), 1, file)
          }
        }
        this.$axios.post(this.path + fileName + file.name, data, config).then((res) => {
          if (res.status === 201) {
            this.$message({
              message: this.$t('uploadFilesPage.uploadSuccessfully'),
              type: 'success'
            })
            file.loading = false
            file.progress = '100%'
            this.List[this.List.indexOf(file)] = file
            this.List.splice(this.List.indexOf(file), 1, file)
          } else {
            file.loading = false
            file.progress = '0'
            this.List[this.List.indexOf(file)] = file
            this.List.splice(this.List.indexOf(file), 1, file)
            this.$message({
              message: res.data.status_mes,
              type: 'error'
            })
          }
        }).catch(err => {
          this.messageBox('error', err.error)
          file.loading = false
          file.progress = '0'
          this.List[this.List.indexOf(file)] = file
          this.List.splice(this.List.indexOf(file), 1, file)
        })
      },
      uploadAll(data) {
        var arrs = this.List.map((item, index) => {
          if (item.progress === '100%' || item.size === 0) return
          item.loading = true
          this.List[this.List.indexOf(item)] = item
          var fileName = ''
          if (item.name !== item.raw.name) {
            fileName = item.name
          }
          const data = new FormData()
          data.append('File', item.raw)
          var config = {
            onUploadProgress: progressEvent => {
              var complete = (progressEvent.loaded / progressEvent.total * 100 | 0) - 10 + '%'
              item.progress = complete
              this.List[this.List.indexOf(item)] = item
              this.List.splice(this.List.indexOf(item), 1, item)
            }
          }
          return this.$axios.post(this.path + fileName + item.name, data, config)
        })
        Promise.all(arrs).then((data) => {
          for (var item of data) {
            console.log(item, 'item')
            if (item) {
              if (item.status === 201) {
                this.$message({
                  message: this.$t('uploadFilesPage.uploadSuccessfully'),
                  type: 'success'
                })
                this.List.forEach(ele => {
                  if (ele.name === item.data.name) {
                    ele.loading = false
                    ele.progress = '100%'
                    this.List[this.List.indexOf(ele)] = ele
                    this.List.splice(this.List.indexOf(ele), 1, ele)
                  }
                })
              } else {
                this.List.forEach(ele => {
                  if (ele.progress !== '100%') {
                    ele.loading = false
                    ele.progress = '0%'
                    this.List[this.List.indexOf(ele)] = ele
                    this.List.splice(this.List.indexOf(ele), 1, ele)
                  }
                })
                this.$message({
                  message: item.data.status_mes,
                  type: 'error'
                })
              }
            }
          }
        })
      },
      delFile(item) {
        this.List.splice(this.List.indexOf(item), 1)
      },
      beforeRemove(file, fileList) {},
      handleOnchange(file, fileList) {
        file.progress = '0%'
        file.loading = false
        this.List.push(file)
      },
      httpRequest(params) {}, // 覆盖默认上传行为，但上传不要写在这里，如果设置在里面会导致多个文件分开传到后台
      processingClassName(str) {
        if (str.lastIndexOf('\.') !== -1) {
          return str.substring(str.lastIndexOf('\.') + 1, str.length)
        } else {
          return ''
        }
      },
      handleClose() {
        this.$nextTick(_ => {
          this.List = []
          this.$emit('ok')
        })
        this.dialogFormVisible = false
      }
    }
  }
</script>

<style scoped>
.el-upload-list {
  display: none;
}
.progress {
  width: 100%;
  height: 10px;
}

</style>

<template>
  <div class="table-style">
    <el-row style="height:100%">
      <div class="table-tool">
        <div class="action-bar">
          <el-row>
            <el-col :span="14">
              <el-button type="primary"  @click="path = currentPath,getList()" icon="el-icon-refresh-right"></el-button>
              <el-button type="primary"  @click="$refs.addDirectoryDialog.open_dialog(path)" icon="el-icon-plus">{{$t('homePage.mkdir')}}</el-button>
              <el-upload style="display: inline;margin: 0 10px;" ref="upload" :show-file-list="false" :http-request="httpRequest" :action="uploadUrl">
                <el-button slot="trigger" size="small" type="primary" icon="el-icon-upload2">{{$t('uploadFilesPage.upload')}}</el-button>
              </el-upload>
              <el-button :disabled="selected.length == 0" type="danger" @click="operate(null, 'delBatchDialog')" icon="el-icon-delete">{{$t('homePage.delete')}}</el-button>
            </el-col>
            <el-col :span="10">
              <el-row>
                <el-col :span="22">
                  <el-input type="text" @keyup.enter.native="getList" v-model="path" style="width:50%;margin-left:48%;margin-right:2%;"></el-input>
                </el-col>
                <el-col :span="2">
                  <el-button type="primary"  @click="getList()" icon="el-icon-right"></el-button>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </div>
        <div class="span-folder">
          <span style="cursor: pointer;color:#1BB0FF;" v-if="rootDirectory !== '/'" @click="showUp">{{$t('homePage.showUp')}}</span>
          <span v-else>{{$t('homePage.showUp')}}</span>
          <span class="delimiter">|</span>
          <ul class="each">
            <li v-for="(item,index) in pathItmes" :key="index" @click="path=item.path,getList()">{{item.name}}</li>
          </ul>
        </div>
        <div class="pd-row infinite-list" @scroll="loadMore($event)" id="pd-row">
          <el-table :data="assetsTreeList" stripe v-loading="loading" @selection-change="handleSelectionChange" ref="table_dom" style="width: 100%" :default-sort = "{prop: 'date', order: 'ascending'}">
            <el-table-column type="selection" width="45"></el-table-column>
            <el-table-column prop="" :label="$t('homePage.fileType')" width="80" align="center">
              <template slot-scope="scope">
                 <svg class="icon" aria-hidden="true">
                  <use :xlink:href="processingClassName(scope.row.Mode,scope.row.FullPath)"></use>
                </svg>
              </template>
            </el-table-column>
            <el-table-column prop="FullPath" :label="$t('homePage.fileName')" show-overflow-tooltip>
              <template slot-scope="scope">
                <span @click="clickLabel(scope.row)" class="nameStyle">
                  {{scope.row.FullPath | interceptString}}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="FileSize" :label="$t('homePage.fileSize')">
              <template slot-scope="scope">
                {{scope.row.FileSize | conver }}
              </template>
            </el-table-column>
            <el-table-column prop="operate" :label="$t('homePage.fileTime')">
              <template slot-scope="scope">
                {{scope.row.Crtime | dateformat() }}
              </template>
            </el-table-column>
            <el-table-column prop="operate" :label="$t('homePage.operating')">
              <template slot-scope="scope">
                <el-button size="mini" type="button" circle @click="$refs.deleteDirectoryDialog.open_dialog(path,scope.row)" icon="el-icon-delete"></el-button>
                <el-button size="mini" type="button" circle :disabled="detailDisabled(scope.row.Mode)" @click="$refs.detailsDialog.open_dialog(scope.row, path)">
                  <svg class="icon" aria-hidden="true" style=" width: 14px;height: 14px;">
                    <use xlink:href="#icon-icon_huabanfuben"></use>
                  </svg>
                </el-button>
              </template>
            </el-table-column>
            <div slot="empty">
              <span>
                <i class="fa fa-info-circle"></i>
                {{$t('homePage.empty')}}
              </span>
            </div>
          </el-table>
        </div>
      </div>
        <DeleteDialog :list="selected" :isShow.sync="dialogDelete" :tree="true" @confirm="delFile" :title="`${selected.length > 1 ? $t('button.batchDeletion') : $t('button.delete')}`" nameKey="FullPath" idKey="Uid"></DeleteDialog>
    </el-row>
    <add-directory-dialog ref="addDirectoryDialog" @ok="getList" />
    <delete-directory-dialog ref="deleteDirectoryDialog" @ok="getList" />
    <details-dialog ref="detailsDialog" @ok="getList" />
  </div>
</template>

<script>
import * as file_http from '@/http/file-http/file-http'
import AddDirectoryDialog from './handle/addDirectoryDialog'
import DeleteDirectoryDialog from './handle/deleteDirectoryDialog'
import DetailsDialog from './handle/detailsDialog'
import Bus from '@/bus.js'

export default {
  name: 'File',
  components: {
    AddDirectoryDialog,
    DeleteDirectoryDialog,
    DetailsDialog
  },
  data() {
    return {
      uploadUrl: '/sugon-gdb/v1/backups',

      path: '/',
      currentPath: '',
      rootDirectory: '',

      loading: false,
      selected: [],
      List: [],
      dialogDelete: false,
      assetsTreeList: [],
      loadedArr:[],
      loadeTime:null,
      loadeState:true
    }
  },
  computed: {
    busy() {
      return this.loading || this.assetsTreeList.length === 0
    },
    pathItmes() {
      var arr = [
        {
          name: this.$t('homePage.allFiles'),
          path: '/'
        }
      ]
      this.path.split('/').forEach((item, index) => {
        if (item) {
          const obj = {
            name: item,
            path: this.path.substring(0, this.path.indexOf(item) + item.length)
          }
          arr.push(obj)
        }
      })
      return arr
    }
  },
  watch: {
    path(newValue, oldValue) {
      Bus.$emit('pathChange', newValue)
      this.$router.push({ path: '/file', query: { path: newValue }})
    },
    '$route.query.path'(newValue, oldValue) {
      this.path = newValue
    }
  },
  created() {
    this.$route.query.path ? this.path = this.$route.query.path : this.path = '/'
    this.getList()
  },
  filters: {
    interceptString(str) {
      return str ? str.substring(str.lastIndexOf('\/') + 1, str.length) : ''
    }
  },
  methods: {
    detailDisabled(mode){
      var val = mode & 1 << (32 - 1 - 0)
      if (val < 0) {
        return true
      }else{
        return false
      }
    },
    //
    loadMore(e) {
      let scrollHeight = this.$refs.table_dom.$el.offsetHeight - document.getElementById('pd-row').clientHeight
      if(e.target.scrollTop >= scrollHeight - 40){
        this.limit = 50
        let str = this.assetsTreeList[this.assetsTreeList.length - 1] ? this.assetsTreeList[this.assetsTreeList.length - 1].FullPath : ''
        let lastFileName = str ? str.substring(str.lastIndexOf('\/') + 1, str.length) : ''
        if(this.loadedArr.indexOf(lastFileName) === -1 && this.loadeState){
          this.loadeState = false
          setTimeout(()=>{
            this.loadeState = true
          },1000)
          file_http.get_filer_folder(this.path, this.limit, lastFileName)
          .then(res => {
            if (res.status === 200) {
              e.target.scrollTop = scrollHeight - 40
              this.loadedArr.push(lastFileName)
              this.currentPath = this.path
              this.assetsTreeList = res.data.Entries ? this.assetsTreeList.concat(res.data.Entries) : this.assetsTreeList
            } else {
              this.assetsTreeList = []
            }
          }).catch(err => {
            this.messageBox('error', err.error)
          })
        }
      }
    },
    // upload files
    httpRequest(params) {
      if (params.file.size <= 0) {
        this.$message({
          message: this.$t('uploadFilesPage.button'),
          type: 'error'
        })
        return
      }
      const data = new FormData()
      data.append('multiFile', params.file)
      this.$axios.post((this.path === '/' ? '' : this.path + '/') + params.file.name, data).then((res) => {
        if (res.status === 201) {
          this.$message({
            message: this.$t('uploadFilesPage.uploadSuccessfully'),
            type: 'success'
          })
          this.getList()
        } else {
          this.$message({
            message: res.data.status_mes,
            type: 'error'
          })
        }
      }).catch(err => {
        this.messageBox('error', err.error)
      })
    },
    // delete folder
    delFile(response) {
      var arrs = response.data.map((item, index) => {
        return file_http.del_filer_folder(response.delForm.recursive, response.delForm.ignore_recursive_error, response.delForm.skip_chunk_deletion, item.name + (item.msg.Md5 ? '' : '/'))
      })
      Promise.all(arrs).then((data) => {
        response.close()
        this.dialogDelete = false
        for (var item of data) {
          if (item.status === 204) {
            this.messageBox('success', this.$t('homePage.successfullyDeletedPrompt'))
          } else {
            this.messageBox('error', this.$t('homePage.deleteFailurePrompt'))
          }
        }
        this.getList()
      })
    },
    // get 50 default files
    getList() {
      this.rootDirectory = this.path
      this.loading = true
      this.limit = 50
      file_http.get_filer_folder(this.path, this.limit)
        .then(res => {
          if (res.status === 200) {
            this.currentPath = this.path
            this.assetsTreeList = res.data.Entries ? res.data.Entries : []
          } else {
            this.assetsTreeList = []
          }
          this.loading = false
        }).catch(_ => {
          this.assetsTreeList = []
          this.loading = false
        })
    },
    // processing class name
    processingClassName(mode, str) {
      var val = mode & 1 << (32 - 1 - 0)
      if (val < 0) {
        return '#icon-wenjianjia'
      } else {
        const str1 = str.substring(str.lastIndexOf('\/') + 1, str.length)
        if (str1.lastIndexOf('\.') !== -1) {
          return '#icon-' + str1.substring(str1.lastIndexOf('\.') + 1, str1.length).toLowerCase()
        } else {
          return '#icon-weizhiwenjian'
        }
      }
    },
    // back to previous
    showUp() {
      if (this.path.lastIndexOf('\/') === 0) {
        this.path = '/'
      } else {
        this.path = this.path.substring(0, this.path.lastIndexOf('\/'))
      }
      this.getList()
    },
    // click the label to do
    clickLabel(data) {
      var val = data.Mode & 1 << (32 - 1 - 0)
      if (val < 0) {
        this.path = (this.path === '/' ? '' : this.path) + data.FullPath.substring(data.FullPath.lastIndexOf('\/'), data.FullPath.length)
        this.getList()
      } else {
        this.downFile(data)
      }
    },
    // download file
    downFile(data) {
      var str
      if (data.Md5) {
        const str1 = data.FullPath.substring(data.FullPath.lastIndexOf('\/'), data.FullPath.length)
        str = (this.path === '/' ? '' : this.path) + str1
      }
      window.location.href = window.g.filer + str
    },
    handleSelectionChange(currentRow) {
      var flagActive = false
      currentRow.forEach(element => {
        if (element.used === '1') {
          flagActive = true
        }
      })
      this.isDisabledActive = flagActive
      this.selected = currentRow
    },
    operate(item, data) {
      switch (data) {
        case 'deleteDialog':
          this.loading = false
          this.selected = []
          this.selected.push(item)
          this.$table_select_repeat(this.selected, this.List, 'table_dom')
          this.dialogDelete = true
          break
        case 'delBatchDialog':
          this.dialogDelete = true
          this.loading = false
          break
        default:
          break
      }
    }
  }
}
</script>

<style scoped>
.nameStyle {
  cursor: pointer;
  font-size:12px;
}
.nameStyle:hover {
  color: #2d8cf0;
}
</style>
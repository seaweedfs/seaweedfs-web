<template>
  <div class="table-style">
    <el-row>
      <div class="table-tool">
        <div class="action-bar">
          <el-row>
            <el-col :span="14">
              <el-button type="primary"  @click="path = currentPath,getList()" icon="el-icon-refresh-right"></el-button>
              <el-button type="primary"  @click="$refs.addDirectoryDialog.open_dialog(path)" icon="el-icon-plus">{{$t('homePage.mkdir')}}</el-button>
              <el-button type="primary" @click="$refs.uploadFilesDialog.open_dialog(path)" icon="el-icon-upload2">{{$t('homePage.upload')}}</el-button>
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
        <div class="pd-row" v-infinite-scroll="loadMore" :infinite-scroll-disabled="busy" infinite-scroll-distance="10">
          <el-table :data="assetsTreeList" stripe v-loading="loading" @selection-change="handleSelectionChange" ref="table_dom" style="width: 100%" :default-sort = "{prop: 'date', order: 'ascending'}">
            <el-table-column type="selection" width="45"></el-table-column>
            <el-table-column prop="" :label="$t('homePage.fileType')" width="80" align="center">
              <template slot-scope="scope">
                 <svg class="icon" aria-hidden="true">
                  <use :xlink:href="processingClassName(scope.row.Md5,scope.row.FullPath)"></use>
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
                <el-button size="mini" type="button" circle :disabled="!scope.row.Md5" @click="$refs.detailsDialog.open_dialog(scope.row, path)">
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
    <upload-files-dialog ref="uploadFilesDialog" @ok="getList" />
  </div>
</template>

<script>
import * as file_http from '@/http/file-http/file-http'
import AddDirectoryDialog from './handle/addDirectoryDialog'
import DeleteDirectoryDialog from './handle/deleteDirectoryDialog'
import DetailsDialog from './handle/detailsDialog'
import UploadFilesDialog from './handle/uploadFilesDialog'
import Bus from '@/bus.js'

export default {
  name: 'File',
  components: {
    AddDirectoryDialog,
    DeleteDirectoryDialog,
    DetailsDialog,
    UploadFilesDialog
  },
  data() {
    return {
      path: '/',
      currentPath: '',
      rootDirectory: '',

      loading: false,
      selected: [],
      List: [],
      dialogDelete: false,
      assetsTreeList: []
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
      console.log(this.$route.query.path, 'this.router.query.path')
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
    loadMore() {
      this.limit += 50
      file_http.get_filer_folder(this.path)
        .then(res => {
          if (res.status === 200) {
            this.currentPath = this.path
            this.assetsTreeList = res.data.Entries ? res.data.Entries : []
          } else {
            this.assetsTreeList = []
          }
        }).catch(err => {
          this.messageBox('error', err.error)
        })
    },
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
    getList() {
      this.rootDirectory = this.path
      this.loading = true
      this.limit = 50
      file_http.get_filer_folder(this.path)
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
    processingClassName(isshow, str) {
      if (isshow) {
        const str1 = str.substring(str.lastIndexOf('\/') + 1, str.length)
        if (str1.lastIndexOf('\.') !== -1) {
          return '#icon-' + str1.substring(str1.lastIndexOf('\.') + 1, str1.length).toLowerCase()
        } else {
          return '#icon-weizhiwenjian'
        }
      } else {
        return '#icon-wenjianjia'
      }
    },
    // 返回上一级
    showUp() {
      if (this.path.lastIndexOf('\/') === 0) {
        this.path = '/'
      } else {
        this.path = this.path.substring(0, this.path.lastIndexOf('\/'))
      }
      this.getList()
    },
    // 点击lable
    clickLabel(data) {
      if (!data.Md5) {
        this.path = (this.path === '/' ? '' : this.path) + data.FullPath.substring(data.FullPath.lastIndexOf('\/'), data.FullPath.length)
        this.getList()
      } else {
        this.downFile(data)
      }
    },
    // 下载
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
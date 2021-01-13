<template>
  <el-dialog :title="$t('deletePage.delete')" :visible.sync="dialogFormVisible"  :before-close="handleClose" :close-on-click-modal="false" :close-on-press-escape="false" :append-to-body="true">
    <el-form :model="form" :rules="rules" ref="form" style="margin:10px" label-width="380px">
      <el-form-item prop="Path" :label="$t('deletePage.name')+':'">
        <el-input v-model="form.Path" disabled style="width:100%" />
      </el-form-item>
      <el-form-item :label="$t('deletePage.whetherToDeleteRecursively')+':'">
        <el-checkbox v-model="form.recursive"></el-checkbox>
      </el-form-item>
      <el-form-item :label="$t('deletePage.WhetherToKeepTheFileBlock')+':'">
        <el-checkbox v-model="form.skip_chunk_deletion"></el-checkbox>
      </el-form-item>
      <el-form-item :label="$t('deletePage.WhetherToIgnoreErrorsWhenDeletingRecursively')+':'">
        <el-checkbox v-model="form.ignore_recursive_error"></el-checkbox>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('button.cancel')}}</el-button>
      <el-button type="danger" @click="submit" :loading="loading">
        <span v-if="!loading">{{$t('button.determine')}}</span>
        <span v-else>{{$t('button.deleting')}}...</span>
      </el-button>
    </span>
  </el-dialog>
</template>
<script>
  import * as file_http from '@/http/file-http/file-http'
  import Bus from '@/bus.js'

  export default {
    name: 'DeleteDirectoryDialog',
    data() {
      return {
        dialogFormVisible: false,
        loading: false,
        form: {
          Path: '',
          recursive: true,
          skip_chunk_deletion: false,
          ignore_recursive_error: false
        },
        rules: {
          Path: {
            required: true,
            message: this.$t('deletePage.message'),
            trigger: 'blur'
          }
        }
      }
    },
    methods: {
      open_dialog(path, row_data) {
        this.form.Path = (path === '/' ? '' : path) + row_data.FullPath.substring(row_data.FullPath.lastIndexOf('\/'), row_data.FullPath.length) + ((row_data.Mode & 1 << (32 - 1 - 0)) < 0 ? '/' : '')
        this.loading = false
        this.dialogFormVisible = true
      },
      submit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.loading = true
            file_http.del_filer_folder(this.form.recursive, this.form.ignore_recursive_error, this.form.skip_chunk_deletion, this.form.Path).then(res => {
              if (res.status == 204) {
                this.messageBox('success', this.$t('deletePage.successfullyDeletedPrompt'))
                this.handleClose()
                this.$emit('ok')
              } else {
                Bus.$emit('errorStatus', res.status)
              }
              this.loading = false
            }).catch(_ => {
              this.loading = false
            })
          } else {
            return false
          }
        })
      },
      handleClose() {
        this.form = {
          Path: '',
          recursive: true,
          skip_chunk_deletion: false,
          ignore_recursive_error: false
        }
        this.$nextTick(_ => {
          this.$refs.form.clearValidate()
        })
        this.$emit('ok')
        this.dialogFormVisible = false
      }
    }
  }
</script>

<style scoped>

</style>

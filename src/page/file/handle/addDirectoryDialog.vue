<template>
  <div class="del-style">
    <el-dialog :title="$t('addPage.mkdir')" :visible.sync="dialogFormVisible"  :before-close="handleClose" :close-on-click-modal="false" :close-on-press-escape="false" :append-to-body="true">
      <el-form :model="form" :rules="rules" ref="form" style="margin:10px" label-width="80px">
        <el-form-item prop="Path" :label="$t('addPage.name')+':'">
          <el-input v-model="form.Path" style="flex:1" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{$t('button.cancel')}}</el-button>
        <el-button type="primary" @click="submit" :loading="loading">
          <span v-if="!loading">{{$t('button.mkdir')}}</span>
          <span v-else>{{$t('button.mkdiring')}}</span>
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import * as file_http from '@/http/file-http/file-http'

export default {
    name: 'AddDirectoryDialog',
    data() {
      return {
        dialogFormVisible: false,
        loading: false,
        rootPath: '',
        form: {
          Path: ''
        },
        rules: {
          Path: {
            required: true,
            message: this.$t('addPage.message'),
            trigger: 'blur'
          }
        }
      }
    },
    methods: {
      open_dialog(row_data, incoming) {
        this.rootPath = row_data === '/' ? row_data : row_data + '/'
        this.loading = false
        this.dialogFormVisible = true
      },
      submit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.loading = true
            file_http.post_filer_folder(this.rootPath + this.form.Path + '/').then(res => {
              if (res.status == 201) {
                this.messageBox('success', this.$t('addPage.createSuccessfulPrompt'))
                this.handleClose()
                this.$emit('ok')
              } else {
                this.messageBox('error', this.$t('addPage.creationFailurePrompt'))
              }
              this.loading = false
            }).catch(err => {
              this.messageBox('error', err.error)
              this.loading = false
            })
          } else {
            return false
          }
        })
      },
      handleClose() {
        this.form = {
          Path: ''
        }
        this.$nextTick(_ => {
          this.$refs.form.clearValidate()
        })
        this.dialogFormVisible = false
      }
    }
  }
</script>

<style scoped>

</style>

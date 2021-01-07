<!--用户界面-->
<template>
  <div class="header">
    <div class="navbar">
      <div class="navbar-header">
        <a class="navbar-brand">
          <img src="@/assets/image/seaweed.png" style="height: 40px" alt=""/>
          <span style="font-weight: bold;font-size:23px;color:white;margin-left: 10px;">SeaweedFS Filer</span>
        </a>
      </div>
      <div class="navbar-collapse">
        <ul class="navbar-right">
          <li>
            <el-popover
              placement="bottom-end"
              width="130"
              v-model="visible">
              <div style="width: 100px;color:#ccc;" v-loading="this.exit_loading">
                <div class="codeUrl" ref="codeUrl"></div>
              </div>
              <dl slot="reference" class="user-menu">
                <dd>
                  <div class="qrcode" ref="qrCodeUrl"></div>
                  <i :class="this.visible?'el-icon-arrow-up':'el-icon-arrow-down'"></i>
                </dd>
              </dl>
            </el-popover>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2'
import Bus from '@/bus.js'

export default {
  name: 'Topbar',
  data() {
    return {
      visible: false,
      exit_loading: false,
      qrcode: '',
      codeUrl: ''
    }
  },
  created() {
  },
  mounted() {
    Bus.$on('pathChange', this.getAData)
    this.qrcode = new QRCode(this.$refs.qrCodeUrl, {
      text: window.location.href, // 需要转换为二维码的内容
      width: 33,
      height: 33,
      colorDark: '#000000',
      colorLight: '#ffffff'
      // correctLevel: QRCode.CorrectLevel.H
    })
    this.codeUrl = new QRCode(this.$refs.codeUrl, {
      text: window.location.href, // 需要转换为二维码的内容
      width: 100,
      height: 100,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    })
  },
  beforeDestroy() {

  },
  methods: {
    go_to(path) {
      this.$router.push(path)
    },
    getAData(val) {
      // this.qrcode.clera()
      this.qrcode.makeCode(window.location.href.split('=')[0] + '=' + val)
      console.log(window.location.href.split('=')[0] + '=' + val, 'window.location.href', val)
      // this.codeUrl.clera()
      this.codeUrl.makeCode(window.location.href.split('=')[0] + '=' + val)
    }
  },
  components: {
  },
  computed: {
  },
  watch: {
  }
}
</script>
<style scoped>
.codeUrl{
  display: inline-block;
}
.codeUrl img {
  width: 100px;
  height: 100px;
  background-color: #fff; 
  padding: 6px; 
  box-sizing: border-box;
}
.qrcode {
  background:#fff;
  padding: 2px;
  border: 1px solid #fff;
  border-radius: 5%;
}
</style>



<template>
  <div class="app-wrapper">
    <top-bar></top-bar>
    <div class="container">
      <div class="app-main">
        <div class="container-box">
          <div class="container-box-content">
            <router-view :key="$route.fullpath" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TopBar from '@/layout/Topbar'
import Bus from '@/bus.js'

export default {
  components: {
    TopBar
  },
  data() {
    return {}
  },
  watch: {},
  mounted() {
    Bus.$on('errorStatus', this.getAData)
  },
  methods: {
    getAData(val) {
      this.messageBox('error', this.$t(`message.${val}`))
    }
  }
}
</script>

<style scoped>
</style>

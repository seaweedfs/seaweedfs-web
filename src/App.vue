<template>
  <div id="app">
    <router-view v-if="isRouterAlive"/>
  </div>
</template>

<script>
export default {
  name: 'App',
  provide() {
    return {
      reload: this.reload
    }
  },
  data() {
    return {
      isRouterAlive: true
    }
  },
  created() {
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    reload() {
      this.isRouterAlive = false
      this.$nextTick(() => {
        this.isRouterAlive = true
      })
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-size: 12px;
  width: 100%;
  height: 100%;
}
// ::-webkit-scrollbar  
// {   
//   width: 9px;
//   height: 11px;
//     // width: 8px;  
//     // height: 8px;
//     // display: none
// }  

// /*定义滚动条轨道 内阴影+圆角*/  
// ::-webkit-scrollbar-track  
// {  
//     -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);  
//     border-radius: 3px;
// }  
  
// /*定义滑块 内阴影+圆角*/  
// ::-webkit-scrollbar-thumb  
// {  
//     border-radius: 3px;  
//     -webkit-box-shadow: inset 0 0 6px #176477;  
//     background-color: #176477;
// }
// ::-webkit-scrollbar-corner{
//   background: #000;
// }




::-webkit-scrollbar-thumb{
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    background-color: #f5f7fa !important;
}
::-webkit-scrollbar-track {
    border-radius: 0;
    background: #f1f1f1;
}
::-webkit-scrollbar
{
    width: 8px;
    height: 10px;
}
</style>

<template>
  <div class="select-block">
      <div class="block" v-for="(item,index) of select_list" :key="index">
        <span class="block-msg">{{item.name}}</span>
        <i class="el-icon-error" @click="delete_item(index)" v-if="select_list.length > 1"></i>
      </div>
  </div>
</template>

<script>
export default {
  props: ['list', 'nameKey', 'idKey'],
  data() {
    return {
      select_list: []
    }
  },
  created() {
    var data = JSON.stringify(this.list)
    data = JSON.parse(data)
    var arr = []
    data.forEach((item, index) => {
      var obj = {
        name: item[this.nameKey],
        id: item[this.idKey],
        msg: item.msg ? item.msg : '',
        index: index
      }
      arr.push(obj)
    })
    this.select_list = arr
  },
  mounted() {
    this.$emit('change', this.select_list)
  },
  methods: {
    delete_item(index) {
      this.select_list.splice(index, 1)
      this.$emit('change', this.select_list)
    }
  }

}
</script>

<style scoped>
.select-block{
    display: flex;
    flex-wrap: wrap;
}
.select-block .block{
    background: gainsboro;
    border-radius: 4px;
    padding: 4px 10px;
    display: flex;
    align-items: center;
    margin-right:6px;
    margin-bottom:6px;
}
.block-msg{
    display: inline-block;
    margin-right: 4px;
}
.block i{
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
}
.block i:hover{
    color: #3674FB
}
</style>

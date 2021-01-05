import Vue from 'vue'
import Router from 'vue-router'

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/file'
    },
    {
      path: '/index',
      name: 'index',
      component: resolve => require(['@/page/index'], resolve),
      children: [
        {
          path: '/file',
          name: 'File',
          component: resolve => require(['@/page/file/index'], resolve)
        }
      ]
    }
  ]
})
export default router

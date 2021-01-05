import axios from 'axios'
import Bus from '@/bus.js'
// 创建axios实例
const service = axios.create({
  baseURL: window.g.filer,
  timeout: 30000 // 请求超时时间
})

service.interceptors.request.use(config => {
  config.headers['Accept'] = 'application/json'
  return config
}, (error) => {
  return Promise.reject(error)
})

service.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (error && error.response) {
    Bus.$emit('errorStatus', error.response.status)
    // switch (error.response.status) {
    //   case 400:
    //     Message({
    //       showClose: true,
    //       message: this.$t('message.400'),
    //       type: 'error'
    //     })
    //     break
    //   case 401:
    //     Message({
    //       showClose: true,
    //       message: 'The token in the request message header has not been authenticated or the authentication failed',
    //       type: 'error'
    //     })
    //     break
    //   case 403:
    //     Message({
    //       showClose: true,
    //       message: 'The cloud platform has accepted the request, but refused to execute it',
    //       type: 'error'
    //     })
    //     break
    //   case 404:
    //     Message({
    //       showClose: true,
    //       message: 'The request failed, the cloud platform did not find the requested resource',
    //       type: 'error'
    //     })
    //     break
    //   case 405:
    //     Message({
    //       showClose: true,
    //       message: 'The cloud platform does not support the HTTP method included in the request',
    //       type: 'error'
    //     })
    //     break
    //   case 413:
    //     Message({
    //       showClose: true,
    //       message: 'The data size of the request message exceeds the range that the cloud platform is willing or able to handle',
    //       type: 'error'
    //     })
    //     break
    //   case 503:
    //     Message({
    //       showClose: true,
    //       message: 'The cloud platform is overloaded and the request cannot be processed currently',
    //       type: 'error'
    //     })
    //     break
    // }
  }
  return Promise.reject(error.response.data)
})

export default service

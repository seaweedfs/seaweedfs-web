import axios from 'axios'
import Bus from '@/bus.js'
// create axios instance
const service = axios.create({
  baseURL: window.g.filer,
  timeout: 30000 // request timeout
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
  }
  return Promise.reject(error.response.data)
})

export default service

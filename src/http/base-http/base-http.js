// import service from 'axios'
import service from '@/http/base-http/interceptor'

// 请求拦截器

export function get(url, params) {
  return new Promise((resolve, reject) => {
    service.get(url, { params: params }).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}

export function post(url, params) {
  return new Promise((resolve, reject) => {
    service.post(url, params).then(res => {
      resolve(res)
    }).catch(err => {
      console.log(err, 'err111111')
      reject(err)
    })
  })
}

export function put(url, params) {
  return new Promise((resolve, reject) => {
    service.put(url, params).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}

export function del(url, params) {
  return new Promise((resolve, reject) => {
    service.delete(url, { params: params }).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}


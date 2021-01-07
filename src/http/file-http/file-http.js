import { get, post, put, del } from '@/http/base-http/base-http'
import axios from 'axios'

export const get_filer_folder = // 获取文件列表
(path, limit, lastFileName, pretty) => get(`${path}?limit=${limit}`)

export const post_filer_folder = // 创建目录
(path) => post(`${path}`)

export const post_file_upload = // 上传文件
(path, p) => post(`${path}`, p)

export const del_filer_folder = // 删除目录
(recursive, ignore_recursive_error, skip_chunk_deletion, path) => del(`${path}?recursive=${recursive}&ignore_recursive_error=${ignore_recursive_error}&skip_chunk_deletion=${skip_chunk_deletion}`)

// 文件导出
export function download(path) { // 下载
  return new Promise((resolve, reject) => {
    // axios.defaults.headers['content-type'] = 'application/json;charset=UTF-8'
    axios({
      method: 'get',
      url: `${path}`, // 请求地址、
      headers: { 'Accept': 'application/json' },
      responseType: 'blob' // 表明返回服务器返回的数据类型
    }).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}

export const del_filer = // 删除
(path) => del(`${path}`)

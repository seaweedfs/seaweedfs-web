import { get, post, put, del } from '@/http/base-http/base-http'

export const get_filer_folder = // get file list
(path, limit, lastFileName, pretty) => get(`${path}?limit=${limit}`)

export const post_filer_folder = // create a directory
(path) => post(`${path}`)

export const post_file_upload = // upload files
(path, p) => post(`${path}`, p)

export const del_filer_folder = // delete directory
(recursive, ignore_recursive_error, skip_chunk_deletion, path) => del(`${path}?recursive=${recursive}&ignore_recursive_error=${ignore_recursive_error}&skip_chunk_deletion=${skip_chunk_deletion}`)

export const del_filer = // delete
(path) => del(`${path}`)

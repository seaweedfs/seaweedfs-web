import moment from 'moment'

export const dateformat =
	(dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') => moment(dataStr).format(pattern)

export const conver = (limit) => {
  limit = Number(limit)
  var size = ''
  if (limit === 0) {
    size = '-'
  } else if (limit < 0.1 * 1024) { // if less than 0.1KB, convert to B
    size = limit.toFixed(2) + 'B'
  } else if (limit < 0.1 * 1024 * 1024) { // convert to KB if less than 0.1MB
    size = (limit / 1024).toFixed(2) + 'KB'
  } else if (limit < 0.1 * 1024 * 1024 * 1024) { // convert to MB if less than 0.1GB
    size = (limit / (1024 * 1024)).toFixed(2) + 'MB'
  } else { // convert other into GB
    size = (limit / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
  }

  var sizestr = size + ''
  var len = sizestr.indexOf('\.')
  var dec = sizestr.substr(len + 1, 2)
  if (dec == '00') { // when the decimal point is 00, remove the decimal part
    return sizestr.substring(0, len) + sizestr.substr(len + 3, 2)
  }
  return sizestr
}

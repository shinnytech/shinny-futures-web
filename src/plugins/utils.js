export function RandomStr(len = 8) {
    let charts = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
    let s = ''
    for (let i = 0; i < len; i++) s += charts[(Math.random() * 0x3e) | 0];
    return s;
}

export function FormatPrice(price, priceTick = 2) {
  if (typeof price === 'number') return price.toFixed(priceTick)
  else return price
}

export function FormatDatetime(datetime) {
  let dt = null
  if (typeof datetime === 'number') {
    if (datetime > 1000000000000 && datetime < 3000000000000) {
      // 说明dt是介于 2001 - 2065 年之间的毫秒数
      dt = new Date(datetime)
    } else {
      dt = new Date(datetime / 1000000)
    }
    let YYYY = dt.getFullYear() + ''
    let MM = (dt.getMonth() + 1 + '').padStart(2, '0')
    let DD = (dt.getDate() + '').padStart(2, '0')
    let hh = (dt.getHours() + '').padStart(2, '0')
    let mm = (dt.getMinutes() + '').padStart(2, '0')
    let ss = (dt.getSeconds() + '').padStart(2, '0')
    let SSS = (dt.getMilliseconds() + '').padStart(3, '0')
    return YYYY + '/' + MM + '/' + DD + '-' + hh + ':' + mm + ':' + ss + '.' + SSS
  } else return dt
}

export function FormatDirection (value) {
  switch (value) {
    case 'BUY': return '买'
    case 'SELL': return '卖'
    default: return value
  }
}

export function FormatOffset (value) {
  switch (value) {
    case 'OPEN': return '开'
    case 'CLOSE': return '平昨'
    case 'CLOSETODAY': return '平今'
    default: return value
  }
}

export function FormatStatus (value) {
  switch (value) {
    case 'ALIVE': return '未完成'
    case 'FINISHED': return '已完成'
    default: return value
  }
}

export function ObjectToArray(obj, arr, key, fn) {
  //
  //
  // key [string | function] return string
  // fn [function] return bool
  if (typeof obj !== 'object' || !Array.isArray(arr)) return
  let recordedItems = []
  for (let i=0; i < arr.length; i++) {
    let v = arr[i]
    let key_field_name = typeof key === 'string' ? key : key(v)
    let k = arr[i][key_field_name]
    if (obj.hasOwnProperty(k) && fn(v)) {
      arr[i] = obj[k]
      recordedItems.push(k)
    } else {
      arr.splice(i--, 1);
    }
  }
  for (let k in obj) {
    if (!recordedItems.includes(k)) {
      let v = obj[k]
      if (fn(v)) {
        arr.push(v)
      }
    }
  }
}

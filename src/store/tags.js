const Tags = [{
  id: '主连',
  func: (item) => item.class === 'FUTURE_CONT'
}, {
  id: '指数',
  func: (item) => item.class === 'FUTURE_INDEX'
}, {
  id: '金融',
  func: (item) => ['IH', 'IF', 'IC', 'T', 'TF'].includes(item.product_id) || ['CFFEX.IH', 'CFFEX.IF', 'CFFEX.IC', 'CFFEX.T', 'CFFEX.TF'].includes(item.underlying_product)
}, {
  id: '金银',
  func: (item) => ['au', 'ag'].includes(item.product_id) || ['SHFE.au', 'SHFE.ag'].includes(item.underlying_product)
}, {
  id: '铜铝铅锌',
  func: (item) => ['al', 'cu', 'ni', 'pb', 'sn', 'zn'].includes(item.product_id) || ['SHFE.al', 'SHFE.cu', 'SHFE.ni', 'SHFE.pb', 'SHFE.sn', 'SHFE.zn'].includes(item.underlying_product)
}, {
  id: '双焦',
  func: (item) => ['j', 'jm'].includes(item.product_id) || ['DCE.j', 'DCE.jm'].includes(item.underlying_product)
}, {
  id: '钢铁',
  func: (item) => ['SF', 'SM', 'hc', 'i', 'rb'].includes(item.product_id) || ['CZCE.SF', 'CZCE.SM', 'SHFE.hc', 'DCE.i', 'SHFE.rb'].includes(item.underlying_product)
}, {
  id: '煤炭',
  func: (item) => ['ZC', 'j', 'jm'].includes(item.product_id) || ['CZCE.ZC', 'DCE.j', 'DCE.jm'].includes(item.underlying_product)
}, {
  id: '化工',
  func: (item) => ['MA', 'TA', 'bu', 'l', 'pp', 'ru', 'v'].includes(item.product_id) || ['CZCE.MA', 'CZCE.TA', 'SHFE.bu', 'DCE.l', 'DCE.pp', 'SHFE.ru', 'DCE.v'].includes(item.underlying_product)
}, {
  id: '油脂',
  func: (item) => ['OI', 'p', 'y'].includes(item.product_id) || ['CZCE.OI', 'DCE.p', 'DCE.y'].includes(item.underlying_product)
}, {
  id: '软商品',
  func: (item) => ['CF', 'CY', 'SR'].includes(item.product_id) || ['CZCE.CF', 'CZCE.CY', 'CZCE.SR'].includes(item.underlying_product)
}, {
  id: '谷物',
  func: (item) => ['JR', 'LR', 'RI', 'WH', 'a', 'c'].includes(item.product_id) || ['CZCE.JR', 'CZCE.LR', 'CZCE.RI', 'CZCE.WH', 'DCE.a', 'DCE.c'].includes(item.underlying_product)
}, {
  id: '农副',
  func: (item) => ['cs', 'jd'].includes(item.product_id) || ['DCE.cs', 'DCE.jd'].includes(item.underlying_product)
}, {
  id: '饲料',
  func: (item) => ['RM', 'c', 'm'].includes(item.product_id) || ['CZCE.RM', 'DCE.c', 'DCE.m'].includes(item.underlying_product)
}, {
  id: '建材',
  func: (item) => ['FG', 'rb'].includes(item.product_id) || ['CZCE.FG', 'SHFE.rb'].includes(item.underlying_product)
}
]

let InitTagsQuotesMap = {}
for (let i in Tags) {
  InitTagsQuotesMap[Tags[i].id] = []
}

export default Tags
export {InitTagsQuotesMap}

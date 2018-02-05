const imgsLst = [
  require('./imgs/purchaseList.png'),
  require('./imgs/tradeRecord.png'),
  require('./imgs/collectShop.png'),
  require('./imgs/orderInfo.png'),
];
import {
  NAV_TO_PURCHASE_LIST,
  NAV_TO_USERMANGEMENT_MY_MEAL,
  NAV_TO_BILLS_INFO_PAGE,
  NAV_TO_TRANS_RECORD_PAGE
} from '../../../../redux/actions/nav.action';
export default iconListData = [
  {
    imgurl: imgsLst[0],
    title: "采购清单",
    id: '11aa',
    type: 'purchaseList',
    nav: {type: NAV_TO_PURCHASE_LIST}
  },
  {
    imgurl:imgsLst[1],
    title: "交易记录",
    id: '11ad',
    nav: {type: NAV_TO_TRANS_RECORD_PAGE}
  },
  {
    imgurl: imgsLst[2],
    title: "收藏店铺",
    id: '112aa',
    nav:{type: NAV_TO_USERMANGEMENT_MY_MEAL}
  },
  {
    imgurl:imgsLst[3],
    title: "订单信息",
    id: '11a3d',
    nav: {type: NAV_TO_BILLS_INFO_PAGE}
  }
]

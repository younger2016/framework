
import {
  NAV_TO_SHOPMANEGEMENT_MAINPAGE,
  NAV_TO_USERMANGEMENT_MY_MEAL,
  NAV_TO_EMPLOYEE_MANAGEEMENT,
  NAV_TO_PURCHASE_LIST,
  NAV_TO_TRANS_RECORD_PAGE,
} from '../../redux/actions/nav.action'
// 订单状态图片和状态名称
export const orderData = Object.freeze([
  {
    id: 1,
    img: require('./img/waitOrder.png'),
    title: 'haveNotGetOrder', // '待接单',
    nav: '',
    height: 20,
    width: 20,
  },
  {
    id: 2,
    img: require('./img/waitSend.png'),
    title: 'waitSendProduct', // '待发货',
    nav: '',
    height: 20,
    width: 20,
  },
  {
    id: 3,
    img: require('./img/waitGive.png'),
    title: 'waitGiveProduct', // '待收货',
    nav: '',
    height: 20,
    width: 25,
  },
  {
    id: 4,
    img: require('./img/hasGive.png'),
    title: 'hasedGive', // '已签收',
    nav: '',
    height: 20,
    width: 20,
  },
  {
    id: 5,
    img: require('./img/hasCanceled.png'),
    title: 'hasCanceled', // '已取消',
    nav: '',
    height: 20,
    width: 18.5,
  },
]);

// 常用工具
export const normalList = Object.freeze([
  [
    {
      id: 1,
      img: require('./img/shop.png'),
      title: 'shopManagement', // '门店管理',
      nav: { type: NAV_TO_SHOPMANEGEMENT_MAINPAGE },
      height: 22.5,
      width: 22.5,
    },
    {
      id: 2,
      img: require('./img/persons.png'),
      title: 'personsManagement', // '员工管理',
      nav: { type: NAV_TO_EMPLOYEE_MANAGEEMENT },
      height: 22.5,
      width: 22.5,
    },
    {
      id: 3,
      img: require('./img/selectedList.png'),
      title: 'shoppingList', // '采购清单',
      nav: {type: NAV_TO_PURCHASE_LIST},
      height: 22.5,
      width: 19.5,
    },
    {
      id: 4,
      img: require('./img/settlement.png'),
      title: 'transactionRecord', // '结算单',
      nav: { type: NAV_TO_TRANS_RECORD_PAGE },
      height: 22.5,
      width: 22.5,
    },
  ],
  [
    {
      id: 5,
      img: require('./img/myMeal.png'),
      title: 'myMeal', // '收藏店铺',
      nav: { type: NAV_TO_USERMANGEMENT_MY_MEAL },
      height: 22.5,
      width: 22.5,
    },
  ],
]);

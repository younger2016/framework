// 消息跳转到指定页面的页面对照表
// 需要注意，所有传过来的info中，如果是通过通知栏启动的app将会多一个字段叫做openStartApp，因为可能你的某个页面需要特殊处理，这个通知栏的来源
import {
  SET_NOFICTION_TO_ORDERLIST
} from '../redux/actions/orderCenter.action';

export const pageCodeList = {
  'orderList': {
    pageName: 'BillsInfoPage', // 页面名称，一级页面均是root
    zIndex: 2, // 几级页面，1是一级页面，将特殊处理返回键
    // index: 1, // 若zIndex===1，即是一级页面，那么index将有效，指定是第几个一级页面
    // limit:(info) => { // 这是一个限制函数，可能针对某些特殊的页面需要特殊的验证，比如需要传入id才能渲染，
    //   // 此函数若不存在，默认不开启验证，直接携带信息跳转到指定页面，若开启验证，这个函数需要提供返回值，若返回值为真就可以跳转到指定页面
    //   // 不反回和返回值为假就不会继续执行
    //   // 此函数会为你提供整条通知信息
    // },
    // pageData: { // 可能通知传递参数不够，或者有些自己的参数需要通过跳转路由传递，请定义到这里，且请保证不要通知的字段冲突
    //   // 离开之前需要去更新订单数量
    //
    // },
    // 是否开启token验证, 若没有登陆将跳转到登陆页面
    initToken: true,
    beforeGoto: (info, pageData, navigation, staticDispatch) => {
      // 在跳转之前需要做什么事情
      // 会为你提供整条通知的信息，导航navigation， redux的dispath触发器staticDispatch
      // 一般用于提前为将要跳转到的页面准备一些数据
      if(pageData.status){
        let status = 0;
        switch(pageData.status - 0) {
          case 1:
            status = 1
            break;
          case 2:
            status = 2
            break;
          case 3:
          case 4:
            status = 3
            break;
          case 5:
          case 6:
            status = 4
            break;
          case 7:
            status = 5
            break;
          default:
            status = 0
            break;
        }
        staticDispatch({
          type: SET_NOFICTION_TO_ORDERLIST,
          payload: {
            status,
            opened: info.openStartApp,
          }
        })
      }

    },
    goToed: (info, pageData, navigation, staticDispatch) => { // 在跳转之后需要做什么
      // 会为你提供整条通知的信息，导航navigation， redux的dispath触发器
      // 一般用于销毁一些临时的数据
    },
    atThisPage: function (info, pageData, navigation, staticDispatch){
      // 如果用户正在的页面和跳转的页面是一致的，那么将不会跳转，但是你需要改变某些数据，让页面发生变化，就在这里做，
      // 比如去订单详情页面，用户这时正在订单详情页面，那么你可能需要更新redux中用于请求订单详情的数据，让订单详情重新获取最新的，
      // 这个时候你最好是取出数据用完了就销毁或者标志已经用完了，否则下一次进入，你还会响应这个数据
      this.beforeGoto(info, pageData, navigation, staticDispatch)
    }
  },
}

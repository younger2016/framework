/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-07-24T13:39:57+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: AppRouteConfigs.js
 * @Last modified by:   xf
 * @Last modified time: 2017-09-21T16:55:37+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

import LoginScreen from './containers/Login'
import RegScreen from './containers/Register'
import InputInfo from './containers/Register/InputInfo'
import ServiceTerm from './containers/Register/ServiceTerm'         // 注册服务条款
import MallScreenNavigator from './containers/MallScreenNavigator'
import Search from './containers/Search'
import CartScreen from './containers/Cart'                          // 购物车
import CommitBill from './containers/CommitBill'                    // 提交订单页
import BillsInfoPage from './containers/BillsInfoPage'              // 订单
import BillDetail from './containers/BillDetail'                    // 订单详情页
import ShopBill from './containers/CommitBill/containers/ShopBill'  // 门店订单
import WriteTip from './containers/CommitBill/containers/WriteTip'  // 备注
import CommitBillSuccess from './containers/CommitBill/containers/CommitBillSuccess'  // 提交订单成功
import PurchaseList from './containers/PurchaseList';               // 采购清单
import ProductDetailInfo from './containers/ProductDetailInfo';     // 商品详情
import ProductList from './containers/ProductList';                 // 商品列表
import CheckProduct from './containers/CheckProduct';               // 验货单
import TradeRecord from './containers/TradeRecord';                 // 交易记录
import RequestPermission from './containers/RequestPermission';     //缺少权限


// 门店管理系列开始
import ShopManagement from './containers/User/ShopManagement'
import MyMeal from './containers/User/MyMeal'
import AddShop from './containers/User/ShopManagement/containers/AddShop'
import ShopCenter from './containers/ShopCenter'                      // 店铺首页
import ShopInfo from './containers/ShopCenter/containers/ShopInfo'    // 店铺详情
import SearchShop from './containers/ShopCenter/containers/SearchShop'// 搜索店铺
// 门店管理系列结束
import GroupInfo from './containers/User/GroupInfo'                   // 个人信息主页
import InputInfoPerson from './containers/User/GroupInfo/InputInfoPerson'
import PersonInfo from './containers/User/GroupInfo/PersonInfo'       // 员工信息

// 员工管理
import EmployeeManagment from './containers/User/EmployeeManagement';
// 添加员工信息
import AddEmployee from './containers/User/EmployeeManagement/containers/AddEmployee';
// 选择负责门店
import SelectManageShop from './containers/User/EmployeeManagement/containers/SelectMangeShop';
//  设置
import Setting from './containers/User/Setting';
// 搜索商品
import ResultSearchPro from './containers/ResultSearchPro'
// 进货单
import Cart from './containers/Cart'
// 切换环境
import ChangeEnv from './containers/ChangeEnv';
// 启动页
import GuidePage from './containers/GuidePage';
// 选择员工
import SelectEmployee from './containers/User/ShopManagement/containers/SelectEmployee';


// import FilterPurchaseList from './containers/PurchaseList/FilterPurchaseList';

const AppRouteConfigs = {
  Login: {
    // Optional: When deep linking or using react-navigation in a web app, this path is used
    path: '',
    screen: LoginScreen,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  RegScreen: {
    path:'',
    screen: RegScreen,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  Root: {
    screen: MallScreenNavigator,
    navigationOptions: ({navigation}) =>({
        header: null,
    }),
  },
  Search: {
    screen: Search,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  CartScreen: {
    screen: CartScreen,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  CommitBill: {
    screen: CommitBill,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  PurchaseListScreen: {
    screen: PurchaseList,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  ShopManagementScreens: {
    screen: ShopManagement,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  MyMealScreens: {
    screen: MyMeal,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  AddShopScreens: {
    screen: AddShop,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  InputInfo: {
    screen: InputInfo,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  ProductDetailInfoScreens: {
    screen: ProductDetailInfo,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  ProductListScreens: {
    screen: ProductList,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  ShopCenterScreens: {
    screen: ShopCenter,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  ShopInfoScreens: {
    screen: ShopInfo,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  SearchShopScreens: {
    screen: SearchShop,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  GroupInfoScreens: {
    screen: GroupInfo,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  EmployeeManagementSrceens: {
    screen: EmployeeManagment,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  WriteTip: {
    screen: WriteTip,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  AddEmployeeScreens: {
    screen: AddEmployee,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  SelectManageShopScreens: {
    screen: SelectManageShop,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  CommitBillSuccess: {
    screen: CommitBillSuccess,
    navigationOptions: ({navigation}) =>({
      header: null,
      gesturesEnabled: false
    }),
  },
  BillsInfoPage: {
    screen: BillsInfoPage,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  BillDetail: {
    screen: BillDetail,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  CheckProduct: {
    screen: CheckProduct,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },

  InputInfoPersonScreens: {
    screen: InputInfoPerson,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },

  SettingScreens: {
    screen: Setting,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },

  TradeRecord: {
    screen: TradeRecord,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },

  ShopBill: {
    screen: ShopBill,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  ResultSearchProScreens: {
    screen: ResultSearchPro,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  CartNewPathScreen: {
    screen: Cart,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  PersonInfoScreen: {
    screen: PersonInfo,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  ChangeEnvScreen: {
    screen: ChangeEnv,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  GuidePage: {
    screen: GuidePage,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  ServiceTerm: {
    screen: ServiceTerm,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  SelectEmployeeScreen: {
    screen: SelectEmployee,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  RequestPermission: {
    screen: RequestPermission,
    navigationOptions: ({navigation}) =>({
      header: null,
    }),
  },
  // FilterPurchaseList: {
  //   screen: FilterPurchaseList,
  //   navigationOptions: ({navigation}) =>({
  //     header: null,
  //   }),
  // }
}

export default AppRouteConfigs

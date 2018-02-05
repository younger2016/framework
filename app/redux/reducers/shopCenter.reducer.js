
// 店铺中心
import Immutable from 'immutable';
import {
  //设置某个店铺主要信息
  SET_MAININFO_TO_GET_SHOP_INFO,
  // 搜索店铺
  SERARCH_SHOP_LIST_START,
  SERARCH_SHOP_LIST_SUCCESS,
  SERARCH_SHOP_LIST_FAIL,
  SERARCH_SHOP_LIST_CANCEL,
  // 获取店铺详情--不包括商品列表
  GET_SHOPINFO_START,
  GET_SHOPINFO_SUCCESS,
  GET_SHOPINFO_FAIL,
  GET_SHOPINFO_CANCEL,
  // 获取店铺详情--商品列表
  GET_PRODUCTLIST_FROM_SHOPINFO_START,
  GET_PRODUCTLIST_FROM_SHOPINFO_SUCCESS,
  GET_PRODUCTLIST_FROM_SHOPINFO_FAIL,
  GET_PRODUCTLIST_FROM_SHOPINFO_CANCEL,
  // 获取收藏的店铺
  GET_COLLECT_SHOP_START,
  GET_COLLECT_SHOP_SUCCESS,
  GET_COLLECT_SHOP_FAIL,
  GET_COLLECT_SHOP_CANCEL,
  // 改变店铺收藏状态 -- 加入收藏
  CHANGE_COLLECTSHOP_STATUS_START,
  CHANGE_COLLECTSHOP_STATUS_SUCCESS,
  CHANGE_COLLECTSHOP_STATUS_FAIL,
  CHANGE_COLLECTSHOP_STATUS_CANCEL,
  // 改变店铺收藏状态 -- 取消收藏
  CANCEL_COLLECTSHOP_STATUS_START,
  CANCEL_COLLECTSHOP_STATUS_SUCCESS,
  CANCEL_COLLECTSHOP_STATUS_FAIL,
  CANCEL_COLLECTSHOP_STATUS_CANCEL,
  // 某个店铺下二级分类
  FETCH_SHOP_CATEGORY_START,
  FETCH_SHOP_CATEGORY_SUCCESS,
  FETCH_SHOP_CATEGORY_FAIL,
  // 店铺下某个分类下商品列表
  FETCH_SHOP_PRODUCT_LIST_START,
  FETCH_SHOP_PRODUCT_LIST_SUCCESS,
  FETCH_SHOP_PRODUCT_LIST_FAIL,

} from '../actions/shopCenter.action';

const $initialState = Immutable.fromJS({
  collectShop: {      // 收藏的店铺
    status: 'start',
    list: [],
  },
  searchData: {       // 搜索出来的店铺
    status: 'start',
    list: [],
  },
  someOneInfo: { // 某个店铺的详细信息
    status: 'start',
    main: {}, // 主要信息，也就是说想要进入店铺主页，您需要把这个数据项填上，依靠这个向后台发出详情的请求
    info: {}, // 店铺详细信息
    productList: { // 请求商品列表
      status: 'start',
      list: [],
    },
    collectStatus: 'start', // 加入收藏状态
    cancelCollStatus: 'start', // 取消收藏
  },
  shopCategory: {     // 某个店铺下二级分类
    status: 'start',
    category: {},
  },
  categoryProduct: { // 店铺下某个分类下商品列表
    // categorySubID: {
    //   list: [],
    //   type: categorySubID,
    //   status: 'start',
    // },
  },
});
export const shopCenter = ($$state = $initialState, action) => {
  switch (action.type) {
    case SET_MAININFO_TO_GET_SHOP_INFO:
      $$state=$$state.setIn(['someOneInfo', 'main'], Immutable.fromJS(action.payload))
      break;
    // 搜索店铺
    case SERARCH_SHOP_LIST_START:
      $$state=$$state.setIn(['searchData', 'status'], 'pending')
      break;
    case SERARCH_SHOP_LIST_SUCCESS:
      $$state=$$state.setIn(['searchData', 'status'], 'success')
      if(1 === action.payload.reqPayload.data.pageNo){
        $$state=$$state.setIn(['searchData', 'list'], Immutable.fromJS(action.payload.data instanceof Array ? action.payload.data : []))
      }
      else{ // 分页拼接
        $$state=$$state.updateIn(['searchData', 'list'], (old) => {
          return old.concat(action.payload.data instanceof Array ? action.payload.data : [])
        })
      }
      break;
    case SERARCH_SHOP_LIST_FAIL:
      $$state=$$state.setIn(['searchData', 'status'], 'fail')
      break;
    case SERARCH_SHOP_LIST_CANCEL:
      $$state=$$state.setIn(['searchData'], Immutable.fromJS({status: 'start', list: []}))
      break;

    // 获取店铺详情-基本信息
    case GET_SHOPINFO_START:
      $$state=$$state.setIn(['someOneInfo', 'status'], 'pending')
      break;
    case GET_SHOPINFO_SUCCESS:
      $$state=$$state.setIn(['someOneInfo', 'status'], 'success')
      $$state=$$state.setIn(['someOneInfo', 'info'], Immutable.fromJS(action.payload.data))
      break;
    case GET_SHOPINFO_FAIL:
      $$state=$$state.setIn(['someOneInfo', 'status'], 'fail')
      break;
    case GET_SHOPINFO_CANCEL:
      $$state=$$state.setIn(['someOneInfo', 'status'], 'cancel')
      break;

    // 获取店铺详情-商品列表
    case GET_PRODUCTLIST_FROM_SHOPINFO_START:
      $$state=$$state.setIn(['someOneInfo', 'productList', 'status'], 'pending')
      break;
    case GET_PRODUCTLIST_FROM_SHOPINFO_SUCCESS:
      $$state=$$state.setIn(['someOneInfo', 'productList', 'status'], 'success');
      if(1 === action.payload.reqPayload.data.pageNo){
        $$state=$$state.setIn(['someOneInfo', 'productList', 'list'], Immutable.fromJS(action.payload.data instanceof Array ? action.payload.data : []))
      }
      else{ // 分页拼接
        $$state=$$state.updateIn(['someOneInfo', 'productList', 'list'], (old) => {
          return old.concat(action.payload.data instanceof Array ? action.payload.data : [])
        })
      }
      break;
    case GET_PRODUCTLIST_FROM_SHOPINFO_FAIL:
      $$state=$$state.setIn(['someOneInfo', 'productList', 'status'], 'fail')
      break;
    case GET_PRODUCTLIST_FROM_SHOPINFO_CANCEL:
      $$state=$$state.setIn(['someOneInfo', 'productList', 'status'], 'cancel')
      $$state=$$state.setIn(['someOneInfo'], Immutable.fromJS({ // 某个店铺的详细信息
        status: 'start',
        main: {}, // 主要信息，也就是说想要进入店铺主页，您需要把这个数据项填上，依靠这个向后台发出详情的请求
        info: {},
        productList: { // 请求商品列表
          status: 'start',
          list: [],
        },
        collectStatus: 'start', // 加入收藏状态
        cancelCollStatus: 'start', // 取消收藏
      }));
      break;

    // 获取收藏的店铺
    case GET_COLLECT_SHOP_START:
      $$state=$$state.setIn(['collectShop', 'status'], 'pending');
      break;
    case GET_COLLECT_SHOP_SUCCESS:
      $$state=$$state.setIn(['collectShop', 'status'], 'success');

      if(action.payload.reqPayload.data.pageNo > 1) {
        $$state = $$state.updateIn(['collectShop','list'], (old) => {
          return old.concat(action.payload.data || []);
        })
      } else {
        $$state = $$state.setIn(['collectShop', 'list'], Immutable.fromJS(action.payload.data instanceof Array ? action.payload.data : []));
      }
      break;
    case GET_COLLECT_SHOP_FAIL:
      $$state=$$state.setIn(['collectShop', 'status'], 'fail');
      break;
    case GET_COLLECT_SHOP_CANCEL:
      $$state=$$state.setIn(['collectShop'], Immutable.fromJS({ // 收藏的店铺
        status: 'start',
        list: [],
      }));
      break;

    //改变店铺收藏状态 -- 加入收藏
    case CHANGE_COLLECTSHOP_STATUS_START:
      $$state=$$state.setIn(['someOneInfo', 'collectStatus'], 'pending');
      break;
    case CHANGE_COLLECTSHOP_STATUS_SUCCESS:
      // 修改本地数据状态
      // 传入ID， 删除本地收藏列表，改变详情状态
      $$state=$$state.setIn(['someOneInfo', 'collectStatus'], 'success');
      break;
    case CHANGE_COLLECTSHOP_STATUS_FAIL:
      $$state=$$state.setIn(['someOneInfo', 'collectStatus'], 'fail');
      break;
    case CHANGE_COLLECTSHOP_STATUS_CANCEL:
      $$state=$$state.setIn(['someOneInfo', 'collectStatus'], 'cancel');
      break;

    //改变店铺收藏状态 -- 取消收藏
    case CANCEL_COLLECTSHOP_STATUS_START:
      $$state=$$state.setIn(['someOneInfo', 'cancelCollStatus'], 'pending');
      break;
    case CANCEL_COLLECTSHOP_STATUS_SUCCESS:
      // 修改本地数据状态
      // 传入ID， 删除本地收藏列表，改变详情状态supplyShopID
      $$state=$$state.setIn(['someOneInfo', 'cancelCollStatus'], 'success');
      if(action.payload.reqPayload.deletIndex || action.payload.reqPayload.deletIndex  === 0){
        $$state = $$state.deleteIn(['collectShop', 'list', action.payload.reqPayload.deletIndex])
      }
      break;
    case CANCEL_COLLECTSHOP_STATUS_FAIL:
      $$state=$$state.setIn(['someOneInfo', 'cancelCollStatus'], 'fail');
      break;
    case CANCEL_COLLECTSHOP_STATUS_CANCEL:
      $$state=$$state.setIn(['someOneInfo', 'cancelCollStatus'], 'cancel');
      break;

    // 某个店铺下二级分类
    case FETCH_SHOP_CATEGORY_START:
      $$state = $$state.setIn(['shopCategory', 'status'], 'pending');
      break;
    case FETCH_SHOP_CATEGORY_SUCCESS:
      if ($$state.getIn(['shopCategory', 'status']) === 'pending') {
        $$state = $$state.setIn(['shopCategory', 'status'], 'success')
          .setIn(['shopCategory', 'category'], Immutable.fromJS(action.payload.data));

        // 所有的分类
        const category = $$state.getIn(['shopCategory', 'category']).toJS();
        // 二级分类
        const categorySub = category[2] && category[2].length !== 0 ? category[2] : [];
        const categoryProduct = $$state.get('categoryProduct').toJS();

        categorySub.forEach((item) => {
          const id = item.extCategoryID;
          // 为categoryProduct添加一个key为id的对象
          categoryProduct[id] = {};
          // 为categoryProduct每个对象添加list、type、status字段
          categoryProduct[id].list = [];
          categoryProduct[id].type = id;
          categoryProduct[id].status = 'start';
        })
        $$state = $$state.set('categoryProduct',Immutable.fromJS(categoryProduct))
      }
      break;
    case FETCH_SHOP_CATEGORY_FAIL:
      $$state = $$state.setIn(['shopCategory', 'status'], 'fail');
      break;


    // 店铺下某个分类下商品列表
    case FETCH_SHOP_PRODUCT_LIST_START:
      $$state = $$state.setIn(['categoryProduct', action.payload.type , 'status'], 'pending');
      break;
    case FETCH_SHOP_PRODUCT_LIST_SUCCESS:
      $$state = $$state.setIn(['categoryProduct', action.payload.reqPayload.type, 'status'], 'success');
      if(action.payload.reqPayload.data.pageNum > 1){
        $$state = $$state.updateIn(['categoryProduct',action.payload.reqPayload.type,'list'], (old) => {
          return old.concat(action.payload.data);
        })
      } else {
        $$state = $$state.setIn(['categoryProduct',action.payload.reqPayload.type,'list'],Immutable.fromJS(action.payload.data));
      }
      break;
    case FETCH_SHOP_PRODUCT_LIST_FAIL:
      $$state = $$state.setIn(['categoryProduct', action.payload.type, 'status'], 'fail');
      break;

    default:
      break;
  }

  return $$state;
};

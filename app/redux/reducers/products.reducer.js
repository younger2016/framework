
import Immutable from 'immutable';
import {
  // 商品分类
  FETCH_CATEGORYS_START,
  FETCH_CATEGORYS_SUCCESS,

  // 分类中商品列表
  FETCH_CATEGORY_PRODUCT_LIST_START,
  FETCH_CATEGORY_PRODUCT_LIST_SUCCESS,
  FETCH_CATEGORY_PRODUCT_LIST_FAIL,

  // 保存商品ID
  SAVE_PRODUCT_ID,

  // 商品详情
  FETCH_PRODUCT_DETAIL_INFO_START,
  FETCH_PRODUCT_DETAIL_INFO_SUCCESS,

  // 商品搜索列表
  FETCH_BYNAME_PRODUCT_LIST_START,
  FETCH_BYNAME_PRODUCT_LIST_SUCCESS,
  FETCH_BYNAME_PRODUCT_LIST_FAIL,
  FETCH_BYNAME_PRODUCT_LIST_CANCEL,

  // 采购清单
  FETCH_PURCHASE_LIST_START,
  FETCH_PURCHASE_LIST_SUCCESS,
  FETCH_PURCHASE_LIST_FAIL,

  // 批量删除采购清单
  DELETE_MORE_PURCHAS_START,
  DELETE_MORE_PURCHAS_SUCCESS,

  // 加采购清单
  ADD_PURCHASE_START,
  ADD_PURCHASE_SUCCESS,

  // 删除采购清单
  DELETE_PURCHASE_START,
  DELETE_PURCHASE_SUCCESS,

  // 商品搜索结果页
  FETCH_PRODUCT_LIST_BT_KEYBORD_START,
  FETCH_PRODUCT_LIST_BT_KEYBORD_SUCCESS,
  FETCH_PRODUCT_LIST_BT_KEYBORD_FAIL,

  // 获取采购清单分类
  FETCH_PURCHASE_LIST_CATEGORY_START,
  FETCH_PURCHASE_LIST_CATEGORY_SUCCESS,
  FETCH_PURCHASE_LIST_CATEGORY_FAIL,

} from '../actions/products.action';


const $initialState = Immutable.fromJS({
  categorysData: {              // 商品分类
    status: 'start',
    data: {}
  },
  productList: {                // 商品列表
    status: 'start',
    list: [],
  },

  productID: '',

  productDetailInfo: {          // 商品详情
    status: 'start',
    detailInfo: {},
  },
  purchaseList: {               // 采购清单
    status: 'start',
    list: [],
  },
  deletePurchaseList: {         // 批量删除采购清单
    status: 'start',
  },

  addPurcahseStatus: 'start',   // 采购清单
  deletePurchaseStatus: 'start',// 删除采购清单

  sreachProductList: {          // 商品搜索结果页
    status: 'start',
    list: [],
  },

  purchaseListCategory: {      // 采购清单分类
    status: 'start',
    list: [],
  }
});

export const products = ($$state = $initialState, action) => {
  switch (action.type) {
    // 商品分类
    case FETCH_CATEGORYS_START:
      return $$state.setIn(['categorysData','status'],'pending');

    case FETCH_CATEGORYS_SUCCESS:
      if($$state.getIn(['categorysData','status']) === 'pending'){
        return $$state.setIn(['categorysData','status'],'success')
          .setIn(['categorysData', 'data'], Immutable.fromJS(action.payload.data));
      }
      return $$state;


    // 分类中商品列表
    case FETCH_CATEGORY_PRODUCT_LIST_START:
      return $$state.setIn(['productList','status'],'pending');

    case FETCH_CATEGORY_PRODUCT_LIST_SUCCESS:
      if($$state.getIn(['productList','status']) === 'pending'){
        $$state = $$state.setIn(['productList','status'],'success');

        if(action.payload.reqPayload.data.pageNum > 1){
          return $$state.updateIn(['productList','list'], (old) => {
            return old.concat(action.payload.data || []);
          })
        } else {
          return $$state.setIn(['productList','list'],Immutable.fromJS(action.payload.data || []));
        }
      }
      return $$state;

    case FETCH_CATEGORY_PRODUCT_LIST_FAIL:
      return $$state.setIn(['productList','status'],'fail');


    // 保存商品ID
    case SAVE_PRODUCT_ID:
      return $$state.setIn(['productID'],Immutable.fromJS(action.payload));


    // 商品详情
    case FETCH_PRODUCT_DETAIL_INFO_START:
      return $$state.setIn(['productDetailInfo','status'],'pending');

    case FETCH_PRODUCT_DETAIL_INFO_SUCCESS:
      if($$state.getIn(['productDetailInfo','status']) === 'pending') {
        return $$state.setIn(['productDetailInfo','status'],'success')
          .setIn(['productDetailInfo','detailInfo'],Immutable.fromJS(action.payload.data));
      }
      return $$state;


    // 采购清单
    case FETCH_PURCHASE_LIST_START:
      return $$state.setIn(['purchaseList','status'],'pending');

    case FETCH_PURCHASE_LIST_SUCCESS:
      if($$state.getIn(['purchaseList','status']) === 'pending'){
        return $$state.setIn(['purchaseList','status'],'success')
          .setIn(['purchaseList', 'list'], Immutable.fromJS(action.payload.data instanceof Array ? action.payload.data : []));
      }
      return $$state;

    case FETCH_PURCHASE_LIST_FAIL:
      return $$state.setIn(['purchaseList','status'],'fail');


    // 批量删除采购清单
    case DELETE_MORE_PURCHAS_START:
      return $$state.setIn(['deletePurchaseList','status'],'pending');

    case DELETE_MORE_PURCHAS_SUCCESS:
      if($$state.getIn(['deletePurchaseList','status']) === 'pending') {
        $$state = $$state.setIn(['deletePurchaseList','status'],'success');
        // 要删除的所有商品的ID
        let deleteProduct = action.payload.reqPayload.deleteProduct;
        Array.from(deleteProduct).map( deleteItem => {
          let purchaseList = $$state.getIn(['purchaseList','list']);  // 采购清单中所有商品列表
          purchaseList.map( (purchaseItem,pruchaseIndex) => {         // 根据商品ID在purchaseList中找到要删除的该商品下标，然后删除
            if(deleteItem == purchaseItem.get('productID')){
              $$state = $$state.updateIn(['purchaseList','list'], old => {
                return old.delete(pruchaseIndex);
              });
            }
          });
        });
        return $$state;
      }
      return $$state;


    // 加采购清单
    case ADD_PURCHASE_START:
      return $$state.set('addPurcahseStatus','pending');

    case ADD_PURCHASE_SUCCESS:
      if($$state.get('addPurcahseStatus') === 'pending') {
        $$state = $$state.set('addPurcahseStatus','success');

        // 当前商品的ID
        let productID = $$state.get('productID');
        // 当前商品在采购清单列表中的下标
        let purchaseIndex = $$state.getIn(['purchaseList', 'list']).findIndex( (purchaseItem) => {
          return purchaseItem.get('productID') === productID;
        });
        // 采购清单列表中有该商品的话，需要将添加的商品规格加到该商品下；否则的话不用做处理
        if(purchaseIndex !== -1) {
          $$state = $$state.updateIn(['purchaseList', 'list',purchaseIndex,'list'],(old) => {
            return old.push(action.payload.reqPayload.specItem);
          });
        }
        return $$state;
      }
      return $$state;


    // 删除采购清单
    case DELETE_PURCHASE_START:
      return $$state.set('deletePurchaseStatus','pending');

    case DELETE_PURCHASE_SUCCESS:
      if($$state.get('deletePurchaseStatus') === 'pending') {
        $$state = $$state.set('deletePurchaseStatus','success');

        // 当前商品的ID
        let productID = $$state.get('productID');
        // 当前商品在采购清单列表中的下标
        let purchaseIndex = $$state.getIn(['purchaseList', 'list']).findIndex( (purchaseItem) => {
          return purchaseItem.get('productID') === productID;
        });
        if(purchaseIndex !== -1) {
          // 当前商品下的所有商品规格
          let productSpecList = $$state.getIn(['purchaseList', 'list',purchaseIndex,'list']);
          // 如果该商品的商品规格只有一个，删除该规格就要删除该商品，否则的话删除该商品指定下标的商品规格
          if(productSpecList.size === 1) {
            return $$state.updateIn(['purchaseList','list'],(old) => {
              return old.delete(purchaseIndex);
            });
          } else {
            // 找到要删除的商品规格在该商品中的下标
            let specIndex = productSpecList.findIndex( (specItem) => {
              return specItem.get('productSpecID') === action.payload.reqPayload.data.productSpecID;
            });
            // 删除当前商品下的商品规格
            return $$state.updateIn(['purchaseList', 'list',purchaseIndex,'list'],(old) => {
              return old.delete(specIndex);
            });
          }
        }

      }
      return $$state;

    // 商品搜索结果页
    case FETCH_PRODUCT_LIST_BT_KEYBORD_START:
      return $$state.setIn(['sreachProductList','status'],'pending');

    case FETCH_PRODUCT_LIST_BT_KEYBORD_SUCCESS:
      if($$state.getIn(['sreachProductList','status']) === 'pending') {
        $$state = $$state.setIn(['sreachProductList','status'],'success');

        if(action.payload.reqPayload.data.pageNum > 1){
          return $$state.updateIn(['sreachProductList','list'], (old) => {
            return old.concat(action.payload.data || []);
          })
        } else {
          return $$state.setIn(['sreachProductList','list'],Immutable.fromJS(action.payload.data || []));
        }
      }
      return $$state;
    case FETCH_PRODUCT_LIST_BT_KEYBORD_FAIL:
      return $$state.setIn(['sreachProductList','status'],'fail');

      // 获取采购清单分类
    case FETCH_PURCHASE_LIST_CATEGORY_START:
      return $$state.setIn(['purchaseListCategory', 'status'], 'pending')
    case FETCH_PURCHASE_LIST_CATEGORY_SUCCESS:
      if ($$state.getIn(['purchaseListCategory', 'status']) === 'pending') {
        return $$state.setIn(['purchaseListCategory', 'status'], 'success')
          .setIn(['purchaseListCategory', 'list'], Immutable.fromJS(action.payload.data || []))
      }
      return $$state
    case FETCH_PURCHASE_LIST_CATEGORY_FAIL:
      return $$state.setIn(['purchaseListCategory', 'status'], 'fail')

    default:
      return $$state;
      break;
  }

};

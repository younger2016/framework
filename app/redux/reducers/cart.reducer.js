/**
 * Created by chenshuang on 2017/9/19.
 */
import Immutable from 'immutable';

import {
  FETCH_CART_LIST_SUCCESS,
  CHANGE_CART_INFO_SUCCESS,
  DELETE_CART_PRODUCT_SUCCESS,
  CHANGE_CART_INFO_FOR_CART_PAGE_SUCCESS,
  GO_TO_SETTLEMENT_SUCCESS,
  SETTLEMENT_PRODUCT_LIST_SUCCESS,
  CLEAR_INVALID_PRODUCT_SUCCESS,
  DELETE_CART_SPEC_SUCCESS,
  FETCH_CART_LIST_CANCEL,
  // 购物车数量
  FETCH_CART_PRODUCT_SPECS_NUM_START,
  FETCH_CART_PRODUCT_SPECS_NUM_SUCCESS,
  FETCH_CART_PRODUCT_SPECS_NUM_FAIL,
} from '../actions/cart.action';

import {
  USER_LOGOUT_SUCCESS
} from '../actions/user.action'
// 初始化用户登录数据
const $initialState = Immutable.fromJS({
  cartList: {
    invalidProduct: [],
    normalProduct: [],
    sync: false,
  },
  settlementList: [], //去结算
  shopCartKey: '',
  settlementProducts: {}, //去结算商品清单
  cartSpecsNum: {   // 购物车数量
    status: 'start',
    shopcarts: [],
  },
});

export const cart = ($$state = $initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case FETCH_CART_LIST_SUCCESS:
      return $$state.setIn(['cartList', 'invalidProduct'], Immutable.fromJS(Array.isArray(payload.data.invalidProduct)? payload.data.invalidProduct : []))
        .setIn(['cartList', 'normalProduct'], Immutable.fromJS(Array.isArray(payload.data.normalProduct)? payload.data.normalProduct : []))
        .setIn(['cartList', 'sync'], true);
      break;

    case CHANGE_CART_INFO_FOR_CART_PAGE_SUCCESS:
      return changeNum($$state, payload.reqPayload).setIn(['cartList', 'sync'], false);
      break;

    case CHANGE_CART_INFO_SUCCESS:
      return $$state.setIn(['cartList', 'sync'], false);
      break;

    case DELETE_CART_PRODUCT_SUCCESS:
      return deleteCart($$state, payload.reqPayload.deleteProducts).setIn(['cartList', 'sync'], false);
      break;

    case DELETE_CART_SPEC_SUCCESS:
      if(payload.reqPayload.productInfo.flag){
        return $$state.setIn(['cartList', 'sync'], false);
      }
      return deleteSpec($$state, payload.reqPayload.data.list[0].shopcarts[0].productSpecID,payload.reqPayload.productInfo).setIn(['cartList', 'sync'], false);
      break;

    case GO_TO_SETTLEMENT_SUCCESS:
      return $$state.set('settlementList', Immutable.fromJS(payload.data))
        .set('shopCartKey', Immutable.fromJS(payload.data.shopCartKey));
      break;

    case SETTLEMENT_PRODUCT_LIST_SUCCESS:
      return $$state.set('settlementProducts', Immutable.fromJS(payload.data));
      break;

    case USER_LOGOUT_SUCCESS:
      return $$state.set('cartList', $initialState.get('cartList'));

    case CLEAR_INVALID_PRODUCT_SUCCESS:
      return $$state.setIn(['cartList', 'invalidProduct'], Immutable.fromJS([]));

    case FETCH_CART_LIST_CANCEL:
      return $$state;
      break;

      // 购物车数量
    case FETCH_CART_PRODUCT_SPECS_NUM_START:
      return $$state.setIn(['cartSpecsNum', 'status'], 'pending')
    case FETCH_CART_PRODUCT_SPECS_NUM_SUCCESS:
      return $$state.setIn(['cartSpecsNum', 'status'], 'success')
        .setIn(['cartSpecsNum', 'shopcarts'], Immutable.fromJS(action.payload.data))
    case FETCH_CART_PRODUCT_SPECS_NUM_FAIL:
      return $$state.setIn(['cartSpecsNum', 'status'], 'fail')

    default:
      return $$state
  }
};

const changeNum = ($$state, reqPayload) => {
  //更新
  return $$state.updateIn(['cartList', 'normalProduct'], normalData => {
    return normalData.map(item => {
      if (item.get('supplierShopID') !== reqPayload.supplierShopID) {
        return item
      }
      return item.update('shopcartProductList', data => {
        return data.map(subItem => {
          if(subItem.get('productID') !==  reqPayload.data.list[0].shopcarts[0].productID) {
            return subItem
          }
          return subItem.update('specs', specs => {
            return specs.map(spec => {
              if(spec.get('specID') !== reqPayload.data.list[0].shopcarts[0].productSpecID) {
                return spec
              }
              return spec.set('shopcartNum', reqPayload.data.list[0].shopcarts[0].shopcartNum)
            })
          })
        })
      })
    })
  });
};
//删除(按规格)
const deleteSpec = ($$state, specID, productInfo) => {
  let shopInfo = $$state.getIn(['cartList', 'normalProduct']).find(shop => shop.get('supplierShopID') ==productInfo.supplierShopID);
  if(shopInfo.get('shopcartProductList').size == 1 && productInfo.product.specs.length == 1){
    return $$state.updateIn(['cartList', 'normalProduct'], shops => {
      return shops.filter(shop => shop.get('supplierShopID') != productInfo.supplierShopID)
    })
  }else{
    if(productInfo.product.specs.length == 1){
      return update($$state,productInfo.supplierShopID, new Set([`${productInfo.product.productID}`]));
    }else{
      return $$state.updateIn(['cartList', 'normalProduct'], shops => {
        return shops.map(products => {
          return products.update('shopcartProductList', product => {
            return product.map((pro) => {
              return pro.update('specs', (specs) => {
                return  specs.filter((spec)=>{
                  return spec.get('specID') !== specID
                })
              })
            })
          })
        })
      });
    }

  }

};
//删除(按商品)
const deleteCart = ($$state, reqPayload) => {
  let shopIDs = Object.keys(reqPayload); //店铺ID array
  let productIDs = shopIDs.map((shop) => {  //商品ID array
    return reqPayload[shop];
  });

  let newState = $$state;
  for(let i = 0;i <shopIDs.length; i++){
    let shopInfo = newState.getIn(['cartList', 'normalProduct']).find(shop => shop.get('supplierShopID') == shopIDs[i]);
    if(shopInfo.get('shopcartProductList').size == productIDs[i].size){
      //直接删除店铺
      newState =  newState.updateIn(['cartList', 'normalProduct'], shops => {
        return shops.filter(shop => shop.get('supplierShopID') != shopIDs[i])
      })
    }else{
      //按商品删除
      newState = update(newState, shopIDs[i], productIDs[i])
    }
  }
  return newState;
};

const deleteIt = ($$state, shopIDs, productIDs) => {
  return shopIDs.map((supplierShopID, index) => {
    let shopInfo = $$state.getIn(['cartList', 'normalProduct']).find(shop => shop.get('supplierShopID') == supplierShopID);
    if(shopInfo.get('shopcartProductList').size == productIDs[index].size){
      return $$state.updateIn(['cartList', 'normalProduct'], shops => {
        return shops.filter(shop => shop.get('supplierShopID') != supplierShopID)
      })
    }else{
      return update($$state, supplierShopID, productIDs[index])
    }
  })
}
// 按店铺ID,商品列表删除
const update = ($$state, supplierShopID, productID) => {
  return $$state.updateIn(['cartList', 'normalProduct'], normalData => {
    return normalData.map(item => {
      if (item.get('supplierShopID') != supplierShopID) {
        return item
      }
      return item.update('shopcartProductList', data => {
        return data.filter(product => {
            return !productID.has(`${product.get('productID')}`)
          }
        )
      })
    })
  });
}

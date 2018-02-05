
import { combineEpics } from 'redux-observable';
import {
  fetchCategorysEpic,             // 商品分类
  fetchCategoryProductListEpic,   // 分类中商品列表
  fetchProductDetailInfoEpic,     // 商品详情
  fetchPurchaseListEpic,          // 采购清单
  addPurchaseEpic,                // 加采购清单
  deletePurchaseEpic,             // 删除采购清单
  deleteMorePurchaseEpic,         // 批量删除采购清单
  fetchProductListByKeybordEpic,  // 商品搜索结果页
  fetchPurcahseListCategoryEpic,  // 采购清单分类
} from '../actions/products.action'
import {
  searchShopListEpic,
  getShopInfoEpic,
  getProductListFromShopInfoEpic,
  getCollectShopEpic,
  changeCollectShopStatusEpic,
  cancelCollectShopStatusEpic,
  fetchShopCategoryEpic,           // 某个店铺下二级分类
  fetchShopProductListEpic,        // 店铺下某个分类下商品列表
} from '../actions/shopCenter.action'
import {
  getSotresListEpic,
  getSomeOneStoresInfoEpic,
  deleteSomeOneStoresEpic,
  addStoresCenterEpic,
  editStoresCenterEpic
} from '../actions/storesCenter.action'
import {
  sendCheckCodeEpic,
  userRegisterEpic,
  userInputMoreInfoEpic,
  userLoginEpic,
  userLogoutEpic,
  fetchRecommendShopEpic,
  userGetGroupInfoAllEpic,
  userSaveGroupInfoAllEpic,
  getGlobalInfoEpic,
  tradeGetMealsEpic,
  tradeGetInfoListEpic,
  userForgetPwdEpic,
  fetchBannerEpic,
} from '../actions/user.action'
import {
  fetchCartListEpic,
  changeCartInfoEpic,
  deleteCartProductEpic,
  changeCartInfoForCartPageEpic,
  goToSettlementEpic,
  settlementProductListEpic,
  clearInvalidProductEpic,
  deleteCartSpecEpic,
  fetchCartSpecsNumEpic,    // 购物车数量
} from '../actions/cart.action'
import {
  fetchEmployeeEpic,
  fetchRoleListEpic,
  saveAddEmployeeEpic,
  deleteEmployeeEpic,
  fetchEditEmployeeInfoEpic,
  saveEditEmployeeEpic,
} from '../actions/employeeManagement.action';
import {
  fetchOrderSomeNumEpic,
  commitBillEpic,
  showTheCommitBillEpic,
  fetchBillListEpic,
  fetchBillInfoEpic,
  checkProductEpic,
  changeBillStatusEpic
} from '../actions/orderCenter.action'

export const rootEpic = combineEpics(
  fetchPurchaseListEpic,                        // 采购清单
  fetchCategorysEpic,                           // 分类
  searchShopListEpic,                           // 搜索店铺--lxz
  getShopInfoEpic,                              // 获取店铺基本信息 ---lxz
  getProductListFromShopInfoEpic,               // 获取店铺商品列表 ---lxz
  getCollectShopEpic,                           // 获取收藏的店铺列表---lxz
  changeCollectShopStatusEpic,                  // 加入收藏--lxz
  getSotresListEpic,                            // 获取门店列表 --- lxz
  getSomeOneStoresInfoEpic,                     // 获取门店详情 --- lxz
  deleteSomeOneStoresEpic,                      // 删除门店 --- lxz
  addStoresCenterEpic,                          // 新增编辑门店 --- lxz
  editStoresCenterEpic,                         // 新增编辑门店 --- lxz
  cancelCollectShopStatusEpic,                  // 取消收藏 --- lxz
  sendCheckCodeEpic,                            // 发送验证码
  userRegisterEpic,                             // 注册
  userInputMoreInfoEpic,                        // 完善资料
  fetchCategoryProductListEpic,                 // 分类中商品列表
  fetchProductDetailInfoEpic,                   // 商品详情
  userLoginEpic,                                // 登录
  fetchEmployeeEpic,                            // 员工列表
  fetchRoleListEpic,                            // 员工职位列表
  saveAddEmployeeEpic,                          // 添加员工
  deleteEmployeeEpic,                           // 删除员工
  fetchEditEmployeeInfoEpic,                    // 获取需要编辑的员工信息
  saveEditEmployeeEpic,                         // 保存编辑的员工信息
  fetchCartListEpic,                            // 获取购物车列表
  changeCartInfoEpic,                           // 修改购物车
  changeCartInfoForCartPageEpic,                // 修改购物车
  userLogoutEpic,                               // 退出登录
  fetchRecommendShopEpic,                       // 推荐店铺
  userGetGroupInfoAllEpic,                      // 获取集团信息 -- lxz
  userSaveGroupInfoAllEpic,                     // 修改集团信息 -- lxz
  deleteCartProductEpic,                        // 删除购物车商品
  goToSettlementEpic,                           // 去结算
  settlementProductListEpic,                    // 去结算列表
  fetchOrderSomeNumEpic,                        // 获取订单数量---lxz
  commitBillEpic,                               // 提交订单
  showTheCommitBillEpic,                        // 提交订单查看信息
  fetchBillListEpic,                            // 查询订单列表
  fetchBillInfoEpic,                            // 查询订单详情
  checkProductEpic,                             // 验货
  addPurchaseEpic,                              // 加采购清单
  deletePurchaseEpic,                           // 删除采购清单
  deleteMorePurchaseEpic,                       // 批量删除采购清单
  fetchProductListByKeybordEpic,                // 商品搜索结果页
  getGlobalInfoEpic,                            // 获取缓存信息---lxz
  tradeGetMealsEpic,                            // 获取合作的店铺---lxz
  tradeGetInfoListEpic,                         // 获取交易记录---lxz
  changeBillStatusEpic,                         // 修改订单状态
  clearInvalidProductEpic,                      // 清空失效商品
  deleteCartSpecEpic,                           // 按规格删除购物车
  userForgetPwdEpic,                            // 找回密码
  fetchBannerEpic,                              // 首页banner图片
  fetchPurcahseListCategoryEpic,                // 采购清单分类
  fetchShopCategoryEpic,                        // 某个店铺下二级分类
  fetchShopProductListEpic,                     // 店铺下某个分类下商品列表
  fetchCartSpecsNumEpic,                        // 购物车数量
);

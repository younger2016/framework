/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-08-08T15:29:14+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: serviceMappingTable.js
 * @Last modified by:   xf
 * @Last modified time: 2017-09-21T17:00:06+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

// 基础服务映射表
  const  serviceMappingTable = {
  // 登录服务
  login: {
    pv: 101014,
    method: 'POST',
  },
  sendCheckCode: {
    pv: 101004,
    method: 'POST',
  },
  register: {
    pv: 101001,
    method: 'POST',
  },
  inputInfo: {
    pv: 101005,
    method: 'POST',
  },
  getProductByID :{
    pv: 100005,
    method: 'POST',
  },
  productsList :{
    pv: 100006,
    method: 'POST',
  },
  fetchPurchaseList: {    // 采购清单
    pv: 100015,
    method: 'POST',
  },
  addPurchase: {          // 加采购清单
    pv: 100013,
    method: 'POST',
  },
  deletePurchase: {       // 删除采购清单
    pv: 100014,
    method: 'POST',
  },
  deleteMorePurchase: {   // 批量删除采购清单
    pv: 100016,
    method: 'POST',
  },
  fetchCategorys: {       // 分类
    pv: 100010,
    method: 'POST',
  },
  fetchProductList: {     // 商品列表
    pv: 100201,
    method: 'POST',
  },
  fetchProductDetailInfo: { // 商品详情
    pv: 100005,
    method: 'POST',
  },
  searchShopList: { // 搜索店铺
    pv: 102013,
    method: 'POST',
  },
  getShopInfo: { // 获取店铺主页
    pv: 102014,
    method: 'POST',
  },
  getProductListFromShopInfo: { // 获取店铺商品列表
    pv: 102015,
    method: 'POST',
  },
  getCollectShop: { // 获取收藏的店铺列表
    pv: 102012,
    method: 'POST',
  },
  changeCollectShopStatus: { // 切换收藏状态 -- 加入收藏
    pv: 102010,
    method: 'POST',
  },
  cancelCollectShopStatus: { // 切换收藏状态 -- 取消收藏
    pv: 102011,
    method: 'POST',
  },
  getSotresList: {        // 获取门店列表
    pv: 102017,
    method: 'POST',
  },
  getSomeOneStoresInfo: { // 获取门店详情
    pv: 102018,
    method: 'POST',
  },
  deleteSomeOneStores: { // 删除门店
    pv: 102020,
    method: 'POST',
  },
  addStoresInfo: { // 新增门店
    pv: 102016,
    method: 'POST',
  },
  fetchEmployeeList: {    // 员工列表
    pv: 101019,
    method: 'POST',
  },
  fetchRoleList: {        // 员工职位列表
    pv: 101021,
    method: 'POST',
  },
  saveAddEmployee: {      // 添加员工
    pv: 101016,
    method: 'POST',
  },
  deleteEmployee: {       // 删除员工
    pv: 101018,
    method: 'POST',
  },
  fetchEditEmployeeInfo: {// 员工信息
    pv: 101020,
    method: 'POST',
  },
  saveEditEmployee: {     // 编辑员工
    pv: 101017,
    method: 'POST',
  },
  getCartList: { // 进货单列表
    pv: 103024,
    method: 'POST',
  },
  changeCartInfo: { // 修改进货单(添加购物车)
    pv: 103022,
    method: 'POST',
  },
  logout: { // 退出登录
    pv: 101015,
    method: 'POST',
  },
  recommendShop: { // 推荐店铺
    pv: 102021,
    method: 'POST',
  },
  getGroupInfo: {
    pv: 101009,
    method: 'POST', // 获取集团信息
  },
  saveGroupInfo: {
    pv: 101010,
    method: 'POST', // 修改集团信息
  },
  deleteCartProduct: {
    pv: 103023,
    method: 'POST', // 删除购物车数据
  },
  editStoresInfo: {  // 修改门店1
    pv: 102019,
    method: 'POST', // 修改集团信息
  },
  goToSettlement: { //去结算
    pv: 103028,
    method: 'POST'
  },
  fetchOrderSomeNum: {
    pv: 103032,
    method: 'POST', // 获取订单数量
  },
  commitBill: {
    pv: 103031,
    method: 'POST', // 提交订单
  },
  settlementProductList: {
    pv: 103029,
    method: 'POST', // 去结算商品清单
  },
  afterCommitBill: {
    pv: 103025,
    method: 'POST', // 提交订单之后查看订单信息
  },
  getGlobalInfo: { // 获取缓存
    pv: 101022,
    method: 'POST',
  },
  fetchBillList: {
    pv: 103018,
    method: 'POST', // 查询订单列表
  },
  fetchBillInfo: {
    pv: 103020,
    method: 'POST', // 查询订单详情
  },
  checkProduct: {
    pv: 103021,
    method: 'POST', // 验货
  },

  tradeGetMeals: {
    pv: 103026,
    method: 'POST', // 合作店铺
  },
  tradeGetInfoList: {
    pv: 103027,
    method: 'POST', // 交易记录
  },
  changeBillStatus: {
    pv: 103004,
    method: 'POST', // 修改订单状态
  },
  clearInvalidProduct: {
    pv: 103030,
    method: 'POST', // 清空失效商品
  },
  forgetPwd: {
    pv: 101023,
    method: 'POST', // 找回密码
  },
  mainBanner: {
    pv: 102027,
    method: 'POST', // 首页banner
  },
  // purcahseListCategory: {
  //   pv:100018,
  //   method: 'POST', // 采购清单分类
  // },
  fetchShopCategory: {
    pv: 100018,
    method: 'POST', // 某个店铺下二级分类
  },
  fetchCartSpecsNum: { // 购物车数量
    pv: 103019,
    method: 'POST'
  }
};

export default  serviceMappingTable;

export default shopInfo = {
  authInfo: {
    businessEntity: '',	// 企业法人	string
    businessNo: '',	// 注册号	string
    businessScope: '', // 经营范围	string
    endTime: '',	// 营业结束时间	number
    groupAddress: '',		// 注册地址	string
    groupName: '',		// 公司名称	string
    groupType: '',		// 集团类型（0-餐企集团，1-供应商集团，2-餐企和供应商集团）	number
    isOnline: '',		// 是否上线 1 已上线 2 审核通过未上线	number
    startTime: '',		// 营业开始时间
  },
  baseInfo: {
    businessModel: '',	//	经营模式 1：单店 2：多店 3:连锁	number
    groupName: '',	//	公司名称	string
    mainProduct: '',	//	主营产品	string
    shopAddress: '',	//	联系地址	string
    shopAdmin: '',	//	联系人	string
    shopCity: '',	//	所在地区	string
    shopPhone: '',	//	联系电话
  },
  homeInfo: {
    categoryID: '',	//		经营品类(商品一级分类ID)	string
    collection: '',	//		收藏数	number
    isCollected: '',	//		是否被收藏，0未收藏,1已收藏	number
    logoUrl: '',	//		店铺logo地址	string
    supplyGroupID: '',	//		供应商集团ID	number
    supplyShopID: '',	//		供应商店铺ID	number
    supplyShopName: '',	//		供应商店铺名称
  },
}

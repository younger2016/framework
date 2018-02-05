
/**
 * 上部分输入框名称
 */
export const topTitleList = [
  'shopName',       // 门店名称
  'shopTelphone',   // 门店电话
  'shopOfPerson',   // 负责人
  'businessHours',  // 营业时间
  'inTheArea',      // 所在地区
  'detailedAddress',// 详细地址
];

/**
 * 下部分输入框名称
 */
export const bottomTitleList = [
  'shopTypes',        // 门店属性
  'selectEmployee',   // 选择员工
  'shopStatus',       // 营业状态
];

/**
 * 下部分输入框操作
 */
export const bottomInputConfig = [
  {
    placeholder: 'plaseSelectShopTypes',
    editable: false,
    key: 'shopTypes',
    id: '001',
  },
  {
    placeholder: 'placeSelectEmployee',
    editable: false,
    key: 'selectEmployee',
    id: '002',
  },
  {
    placeholder: 'placeBusinessStatus',
    editable: false,
    key: 'shopStatus',
    id: '003',
  },
];

/**
 * 门店属性
 */
export const shopTYpes = ['', 'shop', 'shopCenter'];


/**
 * 选择员工时tab列表
 */
export const employeeTitleList = [
  {
    id: '001',
    title: 'buy',
    key: 'buy',
    list: [],
    selectEmployee: new Set(),
  },
  {
    id: '002',
    title: 'finance',
    key: 'finance',
    list: [],
    selectEmployee: new Set(),
  },
];

/**
 * 营业状态
 */
export const shopStatusArr = [
  {
    title: '正常营业',
    status: 1,
  },
  {
    title: '暂停营业',
    status: 0,
  },
];
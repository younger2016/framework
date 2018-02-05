// 门店中心
import Immutable from 'immutable';
import {
  SET_MAININFO_TO_STORES, // 设置门店主信息
  // 获取门店列表
  GET_STORESLIST_START,
  GET_STORESLIST_SUCCESS,
  GET_STORESLIST_FAIL,
  GET_STORESLIST_CANCEL,
  // 获取门店详情
  GET_SOMEONE_STORESINFO_START,
  GET_SOMEONE_STORESINFO_SUCCESS,
  GET_SOMEONE_STORESINFO_FAIL,
  GET_SOMEONE_STORESINFO_CANCEL,
  // 删除门店
  DELETE_SOMEONE_STORES_START,
  DELETE_SOMEONE_STORES_SUCCESS,
  DELETE_SOMEONE_STORES_FAIL,
  DELETE_SOMEONE_STORES_CANCEL,
  // 新增门店
  ADD_STORES_START,
  ADD_STORES_SUCCESS,
  ADD_STORES_FAIL,
  ADD_STORES_CANCEL,
  // 编辑门店
  EDIT_STORES_START,
  EDIT_STORES_SUCCESS,
  EDIT_STORES_FAIL,
  EDIT_STORES_CANCEL,
  DELETE_STORES_CENTER_SYNC,
  // 切换门店后保存选中的门店shopID和shopName
  SAVE_SELECTED_SHOP_ID_AND_NAME,

} from '../actions/storesCenter.action';

const $initialState = Immutable.fromJS({
  storesList: {       // 门店列表
    list: [],
    status: 'start',
    initialized: false,
  },
  sync: false,        // 是否操作过
  someOneInfo: {      // 某个门店的主要信息，编辑请求详细数据
    main: {
      info: {},       // 主信息--主要用于编辑和查看的时候请求数据
      index: -1,      // 编辑第几个
      mode: 'add',    // 模式 -- 编辑模式（edit），新增模式(add)， 默认是新增模式
    },
    info: {},         // 具体信息
    status: 'start',  // 请求具体信息状态
    deleteStatus: 'start',
    addStatus: 'start',
    editStatus: 'start',
  },
  selectedShop: {},     // 切换门店后保存选中的门店shopID和shopName
});
export const storesCenter = ($$state = $initialState, action) => {
  switch (action.type) {
    case SET_MAININFO_TO_STORES:
      if(!action.payload ){
        $$state =  $$state.setIn(['someOneInfo'], Immutable.fromJS({main: {
          info: {},
          index: -1,
          mode: 'add',
        },
        info: {},
        status: 'start',
        deleteStatus: 'start',
        addStatus: 'start',
        editStatus: 'start'}))
      }
      else{
        $$state =  $$state.setIn(['someOneInfo', 'main'], Immutable.fromJS(action.payload))
      }
      break;

    // 门店列表
    case GET_STORESLIST_START:
      $$state = $$state.setIn(['storesList', 'status'], 'pending')
      break;
    case GET_STORESLIST_SUCCESS:
      $$state = $$state.setIn(['storesList', 'status'], 'success');
      if(action.payload.reqPayload.data.pageNum === 1){
        $$state = $$state.setIn(['storesList', 'list'],Immutable.fromJS(action.payload.data && action.payload.data instanceof Array ? action.payload.data : []))
      }
      else {
        $$state = $$state.updateIn(['storesList', 'list'],(old) => {
          return old.concat(action.payload.data && action.payload.data instanceof Array ? action.payload.data : [])
        })
      }
      $$state = $$state.setIn(['storesList', 'initialized'], true)
      break;
    case GET_STORESLIST_FAIL:
      $$state = $$state.setIn(['storesList', 'status'], 'fail')
      break;
    case GET_STORESLIST_CANCEL:
      $$state = $$state.setIn(['storesList'], Immutable.fromJS({
        list: [],
        status: 'start',
        initialized: false}))
      break;

    // 门店详情
    case GET_SOMEONE_STORESINFO_START:
      $$state = $$state.setIn(['someOneInfo', 'status'], 'pending')
      break;
    case GET_SOMEONE_STORESINFO_SUCCESS:
      $$state = $$state.setIn(['someOneInfo', 'status'], 'success')
      $$state = $$state.setIn(['someOneInfo', 'info'], Immutable.fromJS(action.payload.data))
      break;
    case GET_SOMEONE_STORESINFO_FAIL:
      $$state = $$state.setIn(['someOneInfo', 'status'], 'fail')
      break;
    case GET_SOMEONE_STORESINFO_CANCEL:
      $$state = $$state.setIn(['someOneInfo', 'status'], 'cancel')
      break;

    // 删除门店
    case DELETE_SOMEONE_STORES_START:
      $$state = $$state.setIn(['someOneInfo', 'deleteStatus'], 'pending')
      break;
    case DELETE_SOMEONE_STORES_SUCCESS:
      // 删除本地数据
      $$state = $$state.setIn(['someOneInfo', 'deleteStatus'], 'success')
        .setIn(['sync'],true);

      if(action.payload.reqPayload.deletIndex || 0 === action.payload.reqPayload.deletIndex){
        $$state = $$state.deleteIn(['storesList', 'list', action.payload.reqPayload.deletIndex])
      }
      break;
    case DELETE_SOMEONE_STORES_FAIL:
      $$state = $$state.setIn(['someOneInfo', 'deleteStatus'], 'fail')
      break;
    case DELETE_SOMEONE_STORES_CANCEL:
      $$state = $$state.setIn(['someOneInfo', 'deleteStatus'], 'cancel')
      break;

    // 新增门店
    case ADD_STORES_START:
      $$state = $$state.setIn(['someOneInfo', 'addStatus'], 'pending')
      break;
    case ADD_STORES_SUCCESS:
      // 新增就添加，编辑就修改本地数据
      $$state = $$state.setIn(['someOneInfo', 'addStatus'], 'success').setIn(['sync'],true);
      let editData = action.payload.reqPayload.editData;
      editData['shopID'] = action.payload.data.shopID;
      $$state = $$state.updateIn(['storesList', 'list'], (old) => {
        return old.push(editData);
      });
      break;
    case ADD_STORES_FAIL:
      $$state = $$state.setIn(['someOneInfo', 'addStatus'], 'fail')
      break;
    case ADD_STORES_CANCEL:
      $$state = $$state.setIn(['someOneInfo', 'addStatus'], 'cancel')
      break;

    // 编辑门店
    case EDIT_STORES_START:
      $$state = $$state.setIn(['someOneInfo', 'editStatus'], 'pending')
      break;
    case EDIT_STORES_SUCCESS:
      // 新增就添加，编辑就修改本地数据
      $$state = $$state.setIn(['someOneInfo', 'editStatus'], 'success').setIn(['sync'],true);
      let editIndex = $$state.getIn(['someOneInfo','main', 'index']);
      $$state = $$state.updateIn(['storesList', 'list', editIndex], (old) => {

        return old.merge(action.payload.reqPayload.editData)
      });
      break;
    case EDIT_STORES_FAIL:
      $$state = $$state.setIn(['someOneInfo', 'editStatus'], 'fail')
      break;
    case EDIT_STORES_CANCEL:
      $$state = $$state.setIn(['someOneInfo', 'editStatus'], 'cancel')
      break;
    case DELETE_STORES_CENTER_SYNC: // 删除非同步标志
      $$state = $$state.setIn(['sync'],false);
      break;

    // 切换门店后保存选中的门店shopID和shopName
    case SAVE_SELECTED_SHOP_ID_AND_NAME:
      return $$state.set('selectedShop', Immutable.fromJS(action.payload))

    default:
      break;
  }
  return $$state;

};

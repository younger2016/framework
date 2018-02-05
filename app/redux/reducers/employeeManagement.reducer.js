/**
 * 员工管理
 */

import Immutable from 'immutable';

import {
  // 获取员工列表
  FETCH_EMPLOYEE_LIST_START,
  FETCH_EMPLOYEE_LIST_SUCCESS,
  FETCH_EMPLOYEE_LIST_FAIL,

  // 获取员工职位列表
  FETCH_EMPLOYEE_ROLE_LIST_START,
  FETCH_EMPLOYEE_ROLE_LIST_SUCCESS,

  // 添加员工
  SAVE_ADD_EMPLOYEE_INFO_SUCCESS,

  // 删除员工
  DELETE_EMPLOYEE_SUCCESS,

  // 获取需要编辑的员工信息
  FETCH_EDIT_EMPLOYEE_INFO_START,
  FETCH_EDIT_EMPLOYEE_INFO_SUCCESS,

  // 保存编辑的员工信息
  SAVE_EDIT_EMPLOYEE_INFO_SUCCESS,

} from '../actions/employeeManagement.action';

const $initidalState = Immutable.fromJS({
  employeeList: {
    status: 'start',
    list: [],
    selectEmployeeInitialize: false,    // 表示员工管理中列表是否请求过
    employeeListInitialize: false,      // 表示选择员工时列表是否请求过
  },
  roleInfo: {
    status: 'start',
    info: {},
    initialize: false,
  },
  editEmployeeInfo: {
    status: 'start',
    info: {},
  },
});
export const employeeInfo = ($$state = $initidalState, action) => {
  switch (action.type) {
    // 获取员工列表
    case FETCH_EMPLOYEE_LIST_START:
      return $$state.setIn(['employeeList','status'],'pending');

    case FETCH_EMPLOYEE_LIST_SUCCESS:
      if($$state.getIn(['employeeList','status']) === 'pending') {
        $$state = $$state.setIn(['employeeList','status'],'success');

        // 如果是从员工管理进来的，设置employeeListInitialize；如果是从选择员工进来的，设置selectEmployeeInitialize
        if(action.payload.reqPayload.type === 'employeeList') {
          $$state = $$state.setIn(['employeeList','employeeListInitialize'],true);
        } else {
          $$state = $$state.setIn(['employeeList','selectEmployeeInitialize'],true);
        }

        if(action.payload.reqPayload.data.pageNum > 1) {
          return $$state.updateIn(['employeeList','list'], (old) => {
            return old.concat(action.payload.data || []);
          })
        } else {
          return $$state.setIn(['employeeList','list'],Immutable.fromJS(action.payload.data instanceof Array ? action.payload.data : []))
        }
      }
      return $$state;
    case FETCH_EMPLOYEE_LIST_FAIL:
      return $$state.setIn(['employeeList','status'],'fail');


    // 获取员工职位列表
    case FETCH_EMPLOYEE_ROLE_LIST_START:
      return $$state.setIn(['roleInfo','status'],'pending');

    case FETCH_EMPLOYEE_ROLE_LIST_SUCCESS:
      if($$state.getIn(['roleInfo','status']) === 'pending') {
        return $$state.setIn(['roleInfo','status'],'success')
          .setIn(['roleInfo','initialize'],true)
          .setIn(['roleInfo','info'],Immutable.fromJS(action.payload.data));
      }
      return $$state;


    // 添加员工
    case SAVE_ADD_EMPLOYEE_INFO_SUCCESS:
      // 添加的员工基本信息
      let employee = action.payload.reqPayload.employee;
      // 将添加员工成功后返回该员工的employeeID,添加到该员工的基本信息中
      employee.employeeID = action.payload.data.employeeID;
      // 将员工添加到员工列表
      return $$state.updateIn(['employeeList','list'], (old) => {
        return old.push(employee);
      });


    // 删除员工
    case DELETE_EMPLOYEE_SUCCESS:
      return $$state.updateIn(['employeeList','list'], (old) => {
        return old.delete(action.payload.reqPayload.index);
      });


    // 获取需要编辑的员工信息
    case FETCH_EDIT_EMPLOYEE_INFO_START:
      return $$state.setIn(['editEmployeeInfo','status'],'pending');
    case FETCH_EDIT_EMPLOYEE_INFO_SUCCESS:
      if($$state.getIn(['editEmployeeInfo','status']) === 'pending') {
        return $$state.setIn(['editEmployeeInfo','status'],'success')
          .setIn(['editEmployeeInfo','info'],Immutable.fromJS(action.payload.data));
      }
      return $$state;


    // 保存编辑的员工信息
    case SAVE_EDIT_EMPLOYEE_INFO_SUCCESS:
      // 编辑员工的基本信息
      $$state = $$state.setIn(['employeeList','list',action.payload.reqPayload.index],Immutable.fromJS(action.payload.reqPayload.employee));
      return $$state;


    default:
      return $$state;
  }
};
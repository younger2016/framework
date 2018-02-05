/**
 * 员工管理
 */
import { hllFetch } from '../../utils/fetchUtils';

// 获取员工列表
export const FETCH_EMPLOYEE_LIST_START = 'fetch employee list start';
export const FETCH_EMPLOYEE_LIST_SUCCESS = 'fetch employee list success';
export const FETCH_EMPLOYEE_LIST_FAIL = 'fetch employee list fail';
export const FETCH_EMPLOYEE_LIST_CANCEL = 'fetch employee list cancel';

// 获取员工职位列表
export const FETCH_EMPLOYEE_ROLE_LIST_START = 'fetch employee role list start';
export const FETCH_EMPLOYEE_ROLE_LIST_SUCCESS = 'fetch employee role list success';
export const FETCH_EMPLOYEE_ROLE_LIST_FAIL = 'fetch employee role list fail';
export const FETCH_EMPLOYEE_ROLE_LIST_CANCEL = 'fetch employee role list cancel';

// 添加员工
export const SAVE_ADD_EMPLOYEE_INFO_START = 'save add employee info start';
export const SAVE_ADD_EMPLOYEE_INFO_SUCCESS = 'save add employee info success';
export const SAVE_ADD_EMPLOYEE_INFO_FAIL = 'save add employee info fail';
export const SAVE_ADD_EMPLOYEE_INFO_CANCEL = 'save add employee info cancel';

// 删除员工
export const DELETE_EMPLOYEE_START = 'delete employee start';
export const DELETE_EMPLOYEE_SUCCESS = 'delete employee success';
export const DELETE_EMPLOYEE_FAIL = 'delete employee fail';
export const DELETE_EMPLOYEE_CANCEL = 'delete employee cancel';

// 获取编辑员工的信息
export const FETCH_EDIT_EMPLOYEE_INFO_START = 'fetch edit employee info start';
export const FETCH_EDIT_EMPLOYEE_INFO_SUCCESS = 'fetch edit employee info success';
export const FETCH_EDIT_EMPLOYEE_INFO_FAIL = 'fetch edit employee info fail';
export const FETCH_EDIT_EMPLOYEE_INFO_CANCEL = 'fetch edit employee info cancel';

// 保存编辑的员工信息
export const SAVE_EDIT_EMPLOYEE_INFO_START = 'save edit employee info start';
export const SAVE_EDIT_EMPLOYEE_INFO_SUCCESS = 'save edit employee info success';
export const SAVE_EDIT_EMPLOYEE_INFO_FAIL = 'save edit employee info fail';
export const SAVE_EDIT_EMPLOYEE_INFO_CANCEL = 'save edit employee info cancel';



// 获取员工列表
export const fetchEmployeeListAC = opts => ({type: FETCH_EMPLOYEE_LIST_START, payload: opts});
export const fetchEmployeeListCancel = () => ({type: FETCH_EMPLOYEE_LIST_CANCEL});
export const fetchEmployeeEpic = action$ => action$.ofType(FETCH_EMPLOYEE_LIST_START)
  .mergeMap(
    hllFetch({
      service: 'fetchEmployeeList',
      successAC: payload => ({type: FETCH_EMPLOYEE_LIST_SUCCESS, payload}),
      failAC: () => ({type: FETCH_EMPLOYEE_LIST_FAIL}),
      cancelAC: fetchEmployeeListCancel,
      action$
    })
  );

// 获取员工职位列表
export const fetchRoleListAC = opts => ({type: FETCH_EMPLOYEE_ROLE_LIST_START, payload: opts});
export const fetchRoleListCancel = () => ({type: FETCH_EMPLOYEE_ROLE_LIST_CANCEL});
export const fetchRoleListEpic = action$ => action$.ofType(FETCH_EMPLOYEE_ROLE_LIST_START)
  .mergeMap(
    hllFetch({
      service: 'fetchRoleList',
      successAC: payload => ({type: FETCH_EMPLOYEE_ROLE_LIST_SUCCESS, payload}),
      failAC: () => ({type: FETCH_EMPLOYEE_ROLE_LIST_FAIL}),
      cancelAC: fetchRoleListCancel,
      action$
    })
  );

// 添加员工
export const saveAddEmployeeAC = opts => ({type: SAVE_ADD_EMPLOYEE_INFO_START,payload: opts});
export const saveAddEmployeeCancel = () => ({type: SAVE_ADD_EMPLOYEE_INFO_CANCEL});
export const saveAddEmployeeEpic = action$ => action$.ofType(SAVE_ADD_EMPLOYEE_INFO_START)
  .mergeMap(
    hllFetch({
      service: 'saveAddEmployee',
      successAC: payload => ({type: SAVE_ADD_EMPLOYEE_INFO_SUCCESS, payload}),
      failAC: () => ({type: SAVE_ADD_EMPLOYEE_INFO_FAIL}),
      cancelAC: saveAddEmployeeCancel,
      action$
    })
  );

// 删除员工
export const deleteEmployeeAC = opts => ({type: DELETE_EMPLOYEE_START,payload: opts});
export const deleteEmployeeCancel = () => ({type: DELETE_EMPLOYEE_CANCEL});
export const deleteEmployeeEpic = action$ => action$.ofType(DELETE_EMPLOYEE_START)
  .mergeMap(
    hllFetch({
      service: 'deleteEmployee',
      successAC: payload => ({type: DELETE_EMPLOYEE_SUCCESS, payload}),
      failAC: () => ({type: DELETE_EMPLOYEE_FAIL}),
      cancelAC: deleteEmployeeCancel,
      action$
    })
  );

// 获取编辑员工的信息
export const feditEmployeeInfoAC = opts => ({type: FETCH_EDIT_EMPLOYEE_INFO_START, payload: opts});
export const fetchEditEmployeeInfoCancel = () => ({type: FETCH_EDIT_EMPLOYEE_INFO_CANCEL});
export const fetchEditEmployeeInfoEpic = action$ => action$.ofType(FETCH_EDIT_EMPLOYEE_INFO_START)
  .mergeMap(
    hllFetch({
      service: 'fetchEditEmployeeInfo',
      successAC: payload => ({type: FETCH_EDIT_EMPLOYEE_INFO_SUCCESS, payload}),
      failAC: () => ({type: FETCH_EDIT_EMPLOYEE_INFO_FAIL}),
      cancelAC: fetchEditEmployeeInfoCancel,
      action$,
    })
  );

// 保存编辑的员工信息
export const saveEditEmployeeAC = opts => ({type: SAVE_EDIT_EMPLOYEE_INFO_START,payload: opts});
export const saveEditEmployeeCancel = () => ({type: SAVE_EDIT_EMPLOYEE_INFO_CANCEL});
export const saveEditEmployeeEpic = action$ => action$.ofType(SAVE_EDIT_EMPLOYEE_INFO_START)
  .mergeMap(
    hllFetch({
      service: 'saveEditEmployee',
      successAC: payload => ({type: SAVE_EDIT_EMPLOYEE_INFO_SUCCESS, payload}),
      failAC: () => ({type: SAVE_EDIT_EMPLOYEE_INFO_FAIL}),
      cancelAC: saveEditEmployeeCancel,
      action$,
    })
  );

/**
 * 添加员工需要的信息
 */
export const employeeInfo = [
  {
    label: '员工姓名',
    placeholder: '请输入员工姓名',
    title: 'employeeName',
    editable: true,
    keyboardType: 'default',
    max: 40,
    id:'001',
  },
  {
    label: '手机号码',
    placeholder: '请输入员工手机号码',
    title: 'loginPhone',
    editable: true,
    keyboardType: 'numeric',
    max: 11,
    id:'002',
  },
  {
    label: '登录密码',
    placeholder: '请设置员工登录密码',
    title: 'loginPWD',
    editable: true,
    keyboardType: 'name-phone-pad',
    max: 20,
    id:'003',
  },
];


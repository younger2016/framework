// 注册前台任务，主要用于安卓系统返回
import returnStore from './returnStore'
let deskTask = {
  key: null,
  goBack: null
};
let goBackGuide = {
  pageName: '',
  data: {}, // 去往页面携带的参数
}; // navigation 返回依据，没有，就是默认返回
export const getTask = () => {
  return deskTask;
}
export const setTask = (newDesk) => {
  if(newDesk instanceof Function){
    let nav = returnStore().nav.routes;
    let key = nav[nav.length - 1].key;
    deskTask = {
      key,
      goBack: newDesk,
    };
  }
  else{
    deskTask = {
      key: null,
      goBack: null
    };
  }

}

export const setBackGuide = (obj: Object) =>{
  goBackGuide = obj;
}
export const getBackGuide = () =>{
  return goBackGuide
}
export const celarBackGuide = () => {
  goBackGuide = {
    pageName: '',
    data: {},
  }
}

/**
 * Created by chenshuang on 2017/9/19.
 */

let store

export const settingStore = (_store) =>{
  store = _store;
};

export default returnStore = () => {
  return store ? store.getState() : {} 
}

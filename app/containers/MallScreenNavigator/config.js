/**
*加载底部导航图片
*/
const tabImgs = {
  home: require('./tabIcon/main.png'),
  category: require('./tabIcon/category.png'),
  cart: require('./tabIcon/cart.png'),
  user: require('./tabIcon/user.png'),
  home_active: require('./tabIcon/main_active.png'),
  category_active: require('./tabIcon/category_active.png'),
  cart_active: require('./tabIcon/cart_active.png'),
  user_active: require('./tabIcon/user_active.png')
}
export default tabDataIcon = {
  home: {
    title: 'home',
    url: tabImgs.home,
    url_active: tabImgs.home_active,
    width:20,
    height:20,
  },
  category: {
    title: 'category',
    url: tabImgs.category,
    url_active: tabImgs.category_active,
    width:20,
    height:20,
  },
  cart: {
    title: 'cart',
    url: tabImgs.cart,
    url_active: tabImgs.cart_active,
    width:17,
    height:20,
  },
  user: {
    title: 'my',
    url: tabImgs.user,
    url_active: tabImgs.user_active,
    width:16.5,
    height:20,
  }
}

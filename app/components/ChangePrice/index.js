// 生成ui价格样式，传入大号字体，小号字体，文本
// 需要获取系统状态，返回¥还是$, 默认返回¥
import { Text, View } from 'react-native';
import React, { Component } from 'react';
import { styleConsts } from '../../utils/styleSheet/styles';
class ChangePrice extends Component{
  constructor(props) {
    super(props);
    this.state = {}
  }
  render() {
    const {
      price = 0,
      big = styleConsts.H3,
      samll = styleConsts.H5,
      color = styleConsts.mainColor,
      textAlign = 'left',
      width = 80,
      suffix,
    } = this.props
    let newprice = (price - 0).toFixed(2); // 得到可转换的价格
    let priceArr = newprice.split('.');

    // 价格超过5位数字就格式化
    let formatPrice = [],count = 0;
    if(priceArr[0].length >= 5) {
      for (let index = priceArr[0].length - 1; index >= 0; index--) {
        count++;
        formatPrice.unshift(priceArr[0][index]);
        if (!(count % 3) && index != 0) {
          formatPrice.unshift(',');
        }
      }
      formatPrice = formatPrice.join('');
    } else {
      formatPrice = priceArr[0];
    }

    return (
      <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
        <Text style={{
          fontSize: samll,
          color: color,
          width: width,
          textAlign: textAlign,
          letterSpacing: 1,
          fontWeight: this.props.fontWeight ? this.props.fontWeight : 'normal',
        }}>
          ¥
          <Text style={{fontSize: big}}>{formatPrice}</Text>
          <Text>.{priceArr[1]}</Text>
          {
            suffix&& <Text>/{suffix}</Text>
          }
        </Text>
      </View>
    )

  }
}

export default ChangePrice

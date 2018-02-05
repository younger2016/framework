// 选择省市区

import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, TouchableWithoutFeedback, Animated, ScrollView,Text, Keyboard } from 'react-native'
import {cityeCodes} from '../../utils/ChinaCityCode';// 城市列表
import Dimensions from 'Dimensions';
import I18n from 'react-native-i18n';
import {styleConsts} from '../../utils/styleSheet/styles'
import {TouchableWithoutFeedbackD} from '../touchBtn'

const AnimatedList = Animated.createAnimatedComponent(View);

const { height, width } = Dimensions.get('window');

class SelectArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nowHeight: new Animated.Value(0),
      height: 0,
      opticty: new Animated.Value(0),
      province:'',
      city:'',
      area:'',
      showIndex: 0,// 0 -- 省 1---市 2---区
      provinceCode: '',
    };
  }
  componentDidMount() {
    this.setNewState(this.props)
    // const {province, city, area} = this.props;
    // let findCode = this.findArea(province, city, area)
    // this.setState({
    //   province: province ||  province === 0 ? findCode[0] :'',
    //   city: city ||  city === 0 ? findCode[1] :'',
    //   area: area ||  area === 0 ? findCode[2] :'',
    //   provinceCode: province,
    //   showIndex: (area ||  area === 0) && '' !== area ? 2 :(
    //     (city ||  city === 0) && '' !== city ? 1 : 0
    //   )
    // });
  }
  componentWillReceiveProps(nextProps) {
    if((this.state.provinceCode+ '') !== (nextProps.province+ '')){
    this.setNewState(nextProps)
  }


  }
  findArea = (province, city, area) => {
    let Nprovince ='';
    let Ncity ='';
    let Narea ='';
    cityeCodes.find(({code, child}, index) => {
      if((code - 0) === (province - 0)){
        Nprovince = index
        child instanceof Array && child.find(({code, child}, index) => {
          if((code - 0) === (city - 0)){
            Ncity = index;
          child instanceof Array &&  child.find(({code, child}, index) => {
                if((code - 0) === (area - 0)){
                  return Narea = index
                }
              })
          }
        })
      }
    })
    return [Nprovince, Ncity, Narea]
  }
  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
    this.timerS && clearTimeout(this.timerS)
  }
  render() {
    let list = [];
    let colorIndex = this.state.province;
    if(0 === this.state.showIndex){
      list = cityeCodes;
    }
    else if(1 === this.state.showIndex &&'' !== this.state.province){
      list = cityeCodes[this.state.province].child || [];
      colorIndex = this.state.city;
    }
    else if(2 === this.state.showIndex &&'' !== this.state.city){
      list = cityeCodes[this.state.province].child[this.state.city].child || [];
      colorIndex = this.state.area;
    }

    return (
      <View style={[styles.popSelect, { height: this.state.height }]} >
        <TouchableWithoutFeedbackD onPress={() => this.hide(true)}>
          <AnimatedList style={[styles.optictyBg,{opacity: this.state.opticty}]}></AnimatedList>
        </TouchableWithoutFeedbackD>
        <AnimatedList style={[styles.selectCenter, { height: this.state.nowHeight }]}>
          <View style={styles.headerBox}>
            <View style={styles.titleBox}>
              <Text style={styles.title}>
                {I18n.t('inTheArea')}
              </Text>
              <TouchableWithoutFeedbackD onPress={() => this.hide(true)}>
                <View style={styles.cancel}>
                  <Text style={styles.cancelBtn}>
                    {I18n.t('cancel')}
                  </Text>
                </View>
              </TouchableWithoutFeedbackD>
            </View>
            <View style={styles.selectedBox}>
              <TouchableWithoutFeedbackD onPress={() => this.changeType(0)}>
              <View style={[styles.selected, 0 === this.state.showIndex && {borderColor: styleConsts.mainColor}]}>
                <Text numberOfLines={1} style={[styles.selectedTxt,'' === this.state.province && {color: styleConsts.mainColor} ]}>
                  {'' !== this.state.province ? cityeCodes[this.state.province].name : I18n.t('province')}
                </Text>
              </View>
              </TouchableWithoutFeedbackD>
              {
                (this.state.province !== '' && cityeCodes[this.state.province].child instanceof Array && cityeCodes[this.state.province].child.length > 0) &&
                <TouchableWithoutFeedbackD onPress={() => this.changeType(1)}>
                <View style={[styles.selected, 1 === this.state.showIndex && {borderColor: styleConsts.mainColor}]}>
                  <Text numberOfLines={1} style={[styles.selectedTxt,'' === this.state.city && {color: styleConsts.mainColor} ]}>
                    {'' !== this.state.city ? cityeCodes[this.state.province].child[this.state.city].name : I18n.t('city')}
                  </Text>
                </View>
                </TouchableWithoutFeedbackD>
              }
              {
                (this.state.city !== '' && cityeCodes[this.state.province].child[this.state.city].child instanceof Array && cityeCodes[this.state.province].child[this.state.city].child.length > 0) &&
                <TouchableWithoutFeedbackD onPress={() => this.changeType(2)}>
                <View style={[styles.selected, 2 === this.state.showIndex && {borderColor: styleConsts.mainColor}]}>
                  <Text numberOfLines={1} style={[styles.selectedTxt,'' === this.state.area && {color: styleConsts.mainColor} ]}>
                    {'' !== this.state.area ? cityeCodes[this.state.province].child[this.state.city].child[this.state.area].name : I18n.t('area')}
                  </Text>
                </View>
                </TouchableWithoutFeedbackD>
              }
            </View>
          </View>
          <View>
            <ScrollView style={{ width: '100%', height: 270}} ref='scrollView' >
              {
                list.map((item, index) => {
                  return (
                    <TouchableWithoutFeedbackD delayTime={200} key={item.code} onPress={() => this.selectThis(index)}>
                      <View style={styles.areaList}>
                        <Text numberOfLines={1} style={[styles.name, index === colorIndex && {color: styleConsts.mainColor}]}>
                          {item.name}
                        </Text>
                      </View>
                    </TouchableWithoutFeedbackD>
                  )
                })
              }
            </ScrollView>
          </View>
        </AnimatedList>
      </View>

    )
  }
  setNewState = (props) => {
    const {province, city, area} = props;
    let findCode = this.findArea(province, city, area)
    this.setState({
      province: province ||  province === 0 ? findCode[0] :'',
      city: city ||  city === 0 ? findCode[1] :'',
      area: area ||  area === 0 ? findCode[2] :'',
      provinceCode: province,
      showIndex: (area ||  area === 0) && '' !== area ? 2 :(
        (city ||  city === 0) && '' !== city ? 1 : 0
      )
    }, () => this.animateScrollTo());
  }

  show = (hideBack) => {
    Keyboard.dismiss();
    this.hideBack = hideBack;
    this.setState({
      height,
    })
    Animated.parallel([
      Animated.timing(
        this.state.opticty,
        {
          toValue: 0.4,
          duration: 150,
        }
      ).start(),
      Animated.timing(
        this.state.nowHeight,
        {
          toValue: 360,
          duration: 200,
        }
      ).start()
    ])


  }
  hide = (flag) => {
    this.hideBack instanceof Function && this.hideBack();
    Animated.parallel([
      Animated.timing(
        this.state.opticty,
        {
          toValue: 0,
          duration: 150,
        }
      ).start(),
      Animated.timing(
        this.state.nowHeight,
        {
          toValue: 0,
          duration: 200,
        }
      ).start()
    ]);
    if (typeof this.props.hidePress === 'function') {
      this.props.hidePress();
    }
    this.timer = setTimeout(() => {
      this.setState({height: 0})
      if(flag){
        this.setNewState(this.props)
      }
    }, 200)


  }
  selectThis = (index) => {
    let province ='';
    let city ='';
    let area ='';
    if(0 === this.state.showIndex && index !== this.state.province){
      province = index;

      this.setState({
        province,
        city,
        area,
        provinceCode: cityeCodes[index].code,
        showIndex: cityeCodes[index].child instanceof Array &&  cityeCodes[index].child.length > 0 ? 1 : 0,

      },() => {
        if(!(cityeCodes[index].child instanceof Array) ||  cityeCodes[index].child.length === 0){
          this.props.confirm({
              shopProvince: cityeCodes[this.state.province].name,
              shopProvinceCode: cityeCodes[this.state.province].code,
              shopCity: '',
              shopCityCode: '',
              shopDistrict: '',
              shopDistrictCode: '',
          })
          this.hide();
        }
        else{
          this.animateScrollTo()
        }
      })
    }
    else if(1 === this.state.showIndex && index !== this.state.city){
      city = index;
      this.setState({
        city,
        area,
        showIndex: cityeCodes[this.state.province].child[index].child instanceof Array && cityeCodes[this.state.province].child[index].child.length > 0 ?  2 : 1,
      }, () => {
        if(!(cityeCodes[this.state.province].child[index].child instanceof Array) ||  cityeCodes[this.state.province].child[index].child.length === 0){
          this.props.confirm({
              shopProvince: cityeCodes[this.state.province].name,
              shopProvinceCode: cityeCodes[this.state.province].code,
              shopCityCode: cityeCodes[this.state.province].child[this.state.city].code,
              shopDistrict: cityeCodes[this.state.province].child[this.state.city].child[index].name,
              shopDistrict: '',
              shopDistrictCode: '',
          })
          this.hide();
        }
        else{
          this.animateScrollTo()
        }
      })
    }
    else if(2 === this.state.showIndex && index !== this.state.area){
      area = index;
      this.setState({
        area,
      });
      this.props.confirm({
          shopProvince: cityeCodes[this.state.province].name,
          shopProvinceCode: cityeCodes[this.state.province].code,
          shopCity: cityeCodes[this.state.province].child[this.state.city].name,
          shopCityCode: cityeCodes[this.state.province].child[this.state.city].code,
          shopDistrict: cityeCodes[this.state.province].child[this.state.city].child[index].name,
          shopDistrictCode: cityeCodes[this.state.province].child[this.state.city].child[index].code,
      })
      this.hide();

    }

  }
  changeType = (index) => {
    this.setState({
      showIndex: index,
    },() => {
      this.animateScrollTo()
    })
  }
  animateScrollTo = () => {
    let index = this.state.showIndex;
    let list = cityeCodes;
    if(index === 1 && ''!== this.state.city && cityeCodes[this.state.province] && cityeCodes[this.state.province].child){
      list = cityeCodes[this.state.province].child || []
    }
    if(index === 2 && ''!== this.state.city && cityeCodes[this.state.province] && cityeCodes[this.state.province].child && cityeCodes[this.state.province].child[this.state.city] ){
      list = cityeCodes[this.state.province].child[this.state.city].child || []
    }
    let scIndex = index === 0 ? this.state.province : (index === 1 ? this.state.city : this.state.area);
    this.timerS && clearTimeout(this.timerS)
    if(scIndex !== '' && list.length > 6 &&  scIndex < list.length - 6){
      this.timerS = setTimeout(() => this.refs.scrollView.scrollTo({x: 0, y: scIndex *45, animated: true}))
    }
    else if(scIndex === ''){
      this.timerS = setTimeout(() => this.refs.scrollView.scrollTo({x: 0, y: 0, animated: true}))
    }
    else if(list.length > 6 &&  scIndex >= list.length - 6){
      this.timerS = setTimeout(() => this.refs.scrollView.scrollTo({x: 0, y: (list.length - 6) * 45, animated: true}))
    }
  }
}


SelectArea.defaultProps = {
  confirm: () => {},
  province: '',
  city: '',
  area: '',
};

SelectArea.PropTypes = {
  confirm: PropTypes.func,
  province: PropTypes.number,
  city: PropTypes.number,
  area: PropTypes.number,

};

const styles = StyleSheet.create({
  popSelect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    bottom: 0,
    alignItems: 'center',
    overflow: 'hidden',
  },
  optictyBg: {
    height: '100%',
    width: '100%',
    backgroundColor: '#000',
  },
  selectCenter: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 360,
    overflow: 'hidden',
    backgroundColor: styleConsts.white,
  },
  areaList: {
    height: 45,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  name: {
    color: styleConsts.deepGrey,
    fontSize: styleConsts.H4,
  },
  selectedBox: {
    flexDirection: 'row',
    borderColor: styleConsts.lightGrey,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingLeft: 10,
  },
  selected: {
    height: 44,
    borderBottomWidth: 1,
    borderColor: styleConsts.white,
    justifyContent: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    marginRight: 10,
    minWidth: 65,
    alignItems: 'center',
    maxWidth: (width - 20)/ 3,
  },
  selectedTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  title: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  titleBox: {
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cancel: {
    position: 'absolute',
    right: 0,
    paddingLeft: 10,
    paddingRight: 10,
    height: 45,
    justifyContent: 'center',
  },
  cancelBtn: {
    color: styleConsts.darkGrey,
    fontSize: styleConsts.H3,
  },
})

export default SelectArea;

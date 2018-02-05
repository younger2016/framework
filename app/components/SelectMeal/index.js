// 选择合作供应商

import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, TouchableWithoutFeedback, Animated, ScrollView, Text, Keyboard, Image } from 'react-native'
import Dimensions from 'Dimensions';
import I18n from 'react-native-i18n';
import {styleConsts} from '../../utils/styleSheet/styles'
import {TouchableWithoutFeedbackD} from '../touchBtn'

const AnimatedList = Animated.createAnimatedComponent(View);

const { height, width } = Dimensions.get('window');

class SelectMeals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nowHeight: new Animated.Value(0),
      height: 0,
      opticty: new Animated.Value(0),
      selected: {},
      meals: [],
    };
  }
  componentDidMount() {
    this.setState({
      meals: this.props.dataList
    })
  }
  componentWillReceiveProps(nextProps) {
    if(this.props.dataList !== nextProps.dataList){
      this.setState({
        meals: nextProps.dataList
      })
    }
  }
  componentWillUnmount() {
    this.timer && clearTimeout(this.timer)
  }
  render() {
    return (
      <View style={[styles.popSelect, { height: this.state.height }]} >
        <TouchableWithoutFeedback onPress={this.hide}>
            <AnimatedList style={[styles.optictyBg,{opacity: this.state.opticty}]} />
        </TouchableWithoutFeedback>
        <AnimatedList style={[styles.selectCenter, { maxHeight: this.state.nowHeight }]}>
          <View style={styles.titleBox}>
            <Text style={styles.title} numberOfLines={1}>
              {I18n.t('selectMyMeals')}
            </Text>
            <TouchableWithoutFeedbackD onPress={this.hide}>
              <View style={styles.cancel}>
                <Text style={styles.cancelBtn}>
                  {I18n.t('cancel')}
                </Text>
              </View>
            </TouchableWithoutFeedbackD>
          </View>
          <ScrollView>
            <TouchableWithoutFeedbackD delayTime={300} onPress={() => this.selectThis({})}>
              <View style={[styles.listOne]}>
                <Text
                  style={[
                    styles.listTxt,
                    !this.state.selected.groupID && { color: styleConsts.mainColor }
                  ]}
                >
                  {I18n.t('all')}
                  </Text>
                {
                  !this.state.selected.groupID &&
                  <View style={styles.imgWrapper}>
                    <Image style={styles.img} source={require('../../imgs/selectedIcon.png')}/>
                  </View>
                }
              </View>
            </TouchableWithoutFeedbackD>
            {
              this.state.meals.map((item,index) => {
                return (
                  <TouchableWithoutFeedbackD delayTime={300} key={item.groupID} onPress={() => this.selectThis(item)}>
                    <View style={{width: width,}}>
                      <View style={[styles.listOne]}>
                        <Text
                          style={[
                            styles.listTxt,
                            this.state.selected.groupID === item.groupID  && { color: styleConsts.mainColor }
                          ]}
                        >
                          {item.groupName}
                        </Text>
                        {
                          this.state.selected.groupID === item.groupID  &&
                          <View style={styles.imgWrapper}>
                            <Image style={styles.img} source={require('../../imgs/selectedIcon.png')}/>
                          </View>
                        }
                      </View>
                    </View>
                  </TouchableWithoutFeedbackD>
                )
              })
            }
          </ScrollView>
        </AnimatedList>
      </View>
    )
  }

   show = (hideBack) => {
     this.hideBack = hideBack;
     Keyboard.dismiss();
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

  hide = () => {
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
    ])
    this.timer = setTimeout(() => {
      this.setState({height: 0})
    }, 200)
  }

  selectThis = (item) => {
    this.setState({
      selected: item
    })
    this.props.confirm(item);
    this.hide()
  }
}

SelectMeals.defaultProps = {
  confirm: () => {},
  selected: {},
  dataList: [],
};

SelectMeals.PropTypes = {
  confirm: PropTypes.func,
  selected: PropTypes.obj,
  dataList: PropTypes.array,
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
    backgroundColor: styleConsts.white,
    overflow: 'hidden',
  },
  title: {
    fontSize: styleConsts.H4,
    color: styleConsts.deepGrey,
  },
  titleBox: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
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
    fontSize: styleConsts.H4,
  },
  listOne: {
    height: 45,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    marginLeft: 10,
    marginRight: 10,
  },
  listTxt: {
    fontSize: styleConsts.H4,
    color: styleConsts.deepGrey,
  },
  yes: {
    fontSize: styleConsts.H2,
    color: styleConsts.deepGrey,
  },
  imgWrapper: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: 11,
    height: 7.5,
    tintColor: styleConsts.mainColor,
  },
})
export default SelectMeals

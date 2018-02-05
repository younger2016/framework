// 选择品类


import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, Animated, Text, FlatList } from 'react-native'
import ChinaCityCode from '../../utils/ChinaCityCode';// 城市列表
import Dimensions from 'Dimensions';
import I18n from 'react-native-i18n';
import {styleConsts} from '../../utils/styleSheet/styles'
import {TouchableWithoutFeedbackD} from '../touchBtn'
import Immutable from 'immutable'

const AnimatedList = Animated.createAnimatedComponent(View);

const { height, width } = Dimensions.get('window');

class SelecCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nowHeight: new Animated.Value(0),
      height: 0,
      opticty: new Animated.Value(0),
      list: [],
      selected: [],
    };
  }
  componentDidMount() {
    const {list, selected} = this.props;
    this.setState({
      list,
      selected,
    });
  }
  componentWillUnmount() {
    this.timer && clearTimeout(this.timer)
  }
  render() {
    const {keyName, mapName} = this.props;
    return (
      <View style={[styles.popSelect, { height: this.state.height }]} >
        <TouchableWithoutFeedback onPress={this.hide}>
            <AnimatedList style={[styles.optictyBg,{opacity: this.state.opticty}]}></AnimatedList>
        </TouchableWithoutFeedback>
        <AnimatedList style={[styles.selectCenter, { height: this.state.nowHeight }]}>
          <View style={styles.headerBox}>
            <View style={styles.titleBox}>
              <Text style={styles.title}>
                {I18n.t('inTheArea')}
              </Text>
              <TouchableWithoutFeedbackD onPress={this.confirm}>
                <View style={styles.cancel}>
                  <Text style={styles.cancelBtn}>
                    {I18n.t('confirm')}
                  </Text>
                </View>
              </TouchableWithoutFeedbackD>
            </View>
          </View>
          <View style={styles.listBox}>
            <FlatList
             legacyImplementation={false}
             data={this.state.list}
             renderItem={({ item, index }) => this.renderList(item, index, mapName, keyName)}
             horizontal={false}
             numColumns={4}
             keyExtractor={(item) => item[keyName]}
           />
          </View>
        </AnimatedList>
      </View>

    )
  }
  renderList = (item, index, mapName, keyName) => {
    return (
      <TouchableWithoutFeedbackD onPress={() => this.selectThis(item)}>
        <View style={[styles.cartList , this.ifHavethis(item[keyName]) > -1 && {backgroundColor: styleConsts.white, borderColor: styleConsts.mainColor}]}>
          <Text style={[styles.cartTxt, this.ifHavethis(item[keyName]) > -1 && {color: styleConsts.mainColor}]}>{item[mapName]}</Text>
          {
            this.ifHavethis(item[keyName]) > -1 &&
            <View style={styles.selectPos}>
              <Text style={styles.Dui}>✓</Text>
            </View>
        }
        </View>
      </TouchableWithoutFeedbackD>
    )
  }
  show = () => {
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
          toValue: 280,
          duration: 200,
        }
      ).start()
    ])


  }
  hide = () => {
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
  confirm = () => {
    this.props.confirm(this.state.selected)
    this.hide()
  }
  selectThis = (item) => {
    let selected = this.state.selected;
    let find = this.ifHavethis(item[this.props.keyName])
    let list = Immutable.fromJS(this.state.list).toJS()
    if(find > -1){
      selected.splice(find,1)
    }
    else{
      selected.push(item)
    }
    this.setState({
      selected,
      list,
    })
  }
  ifHavethis = (id) => {
    const {keyName} = this.props;

    return this.state.selected.findIndex((item) => {
      return item[keyName] === id
    })
  }

}


SelecCategory.defaultProps = {
  confirm: () => {},
  list: [], // 数据
  selected: [], // 选中的数据
  keyName: 'categoryID', // 指定key
  mapName: 'categoryName', // 显示的数据项
};

SelecCategory.PropTypes = {
  confirm: PropTypes.func,
  list: PropTypes.array,
  selected: PropTypes.array,
  keyName: PropTypes.string,
  mapName: PropTypes.string,

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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  selectCenter: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 280,
    backgroundColor: styleConsts.white,
  },
  title: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  titleBox: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cancel: {
    position: 'absolute',
    right: 0,
    paddingLeft: 10,
    paddingRight: 10,
    height: 50,
    justifyContent: 'center',
  },
  cancelBtn: {
    color: styleConsts.darkGrey,
    fontSize: styleConsts.H4,
  },
  listBox: {
    paddingRight: 15,
  },
  cartList: {
    width: (width - 75) / 4,
    paddingRight: 4,
    paddingLeft: 4,
    marginLeft: 15,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    borderColor:styleConsts.bgGrey,
    borderWidth: 0.5,
    borderRadius: 5,
    position: 'relative',
    backgroundColor: styleConsts.bgGrey
  },
  cartTxt: {
    fontSize: styleConsts.H4,
    color: styleConsts.darkGrey,
  },
  headerBox: {
    borderBottomWidth: 1,
    borderColor: styleConsts.lightGrey,
  },
  Dui: {
    fontSize: styleConsts.H3,
    color: styleConsts.mainColor,
  },
  selectPos: {
    position: 'absolute',
    right: 2,
    bottom: 1,
  },
})

export default SelecCategory;

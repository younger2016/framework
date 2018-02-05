/**
 * Created by chenshuang on 2017/9/12.
 */
import React, { Component } from 'react'
import {  View, StyleSheet, Text, TouchableWithoutFeedback, Image, Modal
} from 'react-native'
import { styleConsts } from '../../utils/styleSheet/styles'
const manList = {
  good: require('./imgs/good.png'),
  yeah: require('./imgs/yeah.png'),
  what: require('./imgs/what.png')
};

const iconList = {
  correct: require('./imgs/correct.png'),
  warning: require('./imgs/warning.png')
};

export default class ModalBox extends Component {
  constructor(props){
    super(props);
    this.state = {
      visible: false
    }
  }

  componentDidMount(){
    this.setState({
      visible: this.props.visible
    })
  }

  componentWillReceiveProps(nextProps){
    if(this.props.visible !== nextProps.visible){
      this.setState({
        visible: nextProps.visible
      })
    }
  }

  render(){
    return (
      <Modal
        visible={this.state.visible}
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Image style={styles.manImg} source={manList[[this.props.imgName]]}/>
            <View style={styles.title}>
              <Image style={styles.correctImg} source={iconList[this.props.iconName]}/>
              <Text style={styles.titleTxt}>{this.props.title}</Text>
            </View>
            <View style={styles.tipBox}>
              <Text style={styles.tipTxt}>{this.props.tipTxt}</Text>
            </View>

            <View style={[styles.buttonBox, this.props.rightBtnTxt && {marginTop: 14.5}]}>
              {
                this.props.leftBtnTxt ?
                  <TouchableWithoutFeedback onPress={this.props.leftCallback}>
                    <View style={[styles.button, styles.buttonLeft, this.props.rightBtnTxt && {width: 100}]}>
                      <Text style={styles.buttonLeftTxt}>{this.props.leftBtnTxt}</Text>
                    </View>
                  </TouchableWithoutFeedback>: null
              }
              {
                this.props.rightBtnTxt?
                  <TouchableWithoutFeedback onPress={this.props.rightCallback}>
                    <View style={[styles.button, styles.buttonRight, this.props.leftBtnTxt && {width: 100}]}>
                      <Text style={styles.buttonRightTxt}>{this.props.rightBtnTxt}</Text>
                    </View>
                  </TouchableWithoutFeedback>:null
              }

            </View>

            {
              this.props.laterBtnTxt ?
                <TouchableWithoutFeedback onPress={this.props.laterCallback}>
                  <View style={{paddingTop: 15, alignItems: 'center', width: '100%'}}>
                    <Text style={{color: styleConsts.mainColor, fontSize: styleConsts.H5}}>{this.props.laterBtnTxt}</Text>
                  </View>
                </TouchableWithoutFeedback>:null
            }
          </View>
        </View>
      </Modal>
    )
  }

}
ModalBox.defaultProps = {
  title: '恭喜您注册成功',
  tipTxt: '审核结果会在6个工作日内短信告知请耐心等待',//'完善资料, 即可享受更优质的服务!',
  leftBtnTxt: null,
  rightBtnTxt: null,
  laterBtnTxt: null,
  imgName: 'good',
  iconName: 'correct',
  leftCallback: () => {
  },
  laterCallback: () => {
  },
  rightCallback: () => {
  }
};
ModalBox.PropTypes = {
  imgName: React.PropTypes.string, //大图名称,参照上面引入的数组
  iconName: React.PropTypes.string, //提示图标名称
  title: React.PropTypes.string,  //红色提示标题
  tipTxt: React.PropTypes.string, //灰色提示文字
  leftBtnTxt: React.PropTypes.string, //左侧按钮文字
  rightBtnTxt: React.PropTypes.string, //右侧按钮文字
  laterBtnTxt: React.PropTypes.string, //下方按钮文字
  leftCallback: React.PropTypes.func, //左侧按钮回调
  rightCallback: React.PropTypes.func, //右侧按钮回调
  laterCallback: React.PropTypes.func, //下方按钮回调
};
const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  modalBox: {
    marginTop: 150,
    backgroundColor: styleConsts.white,
    borderRadius: 5,
    width: 275,
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 24,
    paddingBottom: 20
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18
  },
  manImg: {
    width: 166,
    height: 80
  },
  correctImg: {
    marginRight: 10,
    width: 22,
    height: 22
  },
  titleTxt: {
    fontSize: styleConsts.H1,
    color: styleConsts.mainColor
  },
  tipBox: {
    marginTop: 16,
    paddingHorizontal: 20
  },
  tipTxt: {
    color: styleConsts.grey,
    fontSize: styleConsts.H4,
    textAlign: 'center',
    lineHeight: 15
  },
  buttonBox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  button: {
    width: 225,
    height: 35,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: styleConsts.mainColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLeft: {
    backgroundColor: styleConsts.white,
  },
  buttonRight: {
    backgroundColor: styleConsts.mainColor
  },
  buttonLeftTxt: {
    color: styleConsts.mainColor,
    fontSize: styleConsts.H3
  },
  buttonRightTxt: {
    color: styleConsts.white,
    fontSize: styleConsts.H3
  }
});

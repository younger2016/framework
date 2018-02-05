// 模态框输入

import React, { Component, PropTypes } from 'react'
import { StyleSheet, View, Text, TextInput, Image, TouchableWithoutFeedback, TouchableHighlight, FlatList, Keyboard } from 'react-native'
import I18n from 'react-native-i18n'
import Dimensions from 'Dimensions';
import {styleConsts} from '../../utils/styleSheet/styles'; // 引进公用样式

const { width, height } = Dimensions.get('window');

class InputModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      modalTop: 0,
    }
  }
  componentWillUnmount() {
    //this.keyboardDidShowListener.remove();
  }
  render() {
    return (
      <View style={styles.mask}>
        <View style={[styles.inputModalBox]}>
          <TextInput
            underlineColorAndroid="transparent"
            multiline={true}
            textAlignVertical="top"
            placeholder={I18n.t('cancelinput')}
            placeholderTextColor={styleConsts.middleGrey}
            style={styles.inputModal}
            ref="inputModal"
            autoFocus={true}
            value={this.state.text}
            onChangeText={text => this.setState({ text })}
          />
          <View style={styles.modalBtn}>
            <TouchableHighlight
              activeOpacity={1}
              underlayColor={styleConsts.bgGrey}
              onPress={() => this.hideModal(true)}
              delayTime={300}
            >
              <View style={styles.modalBtnInfo}>
                <Text style={styles.modalBtntxt}>
                  {I18n.t('thinkAgain')}
                </Text>
              </View>
            </TouchableHighlight>
            <View style={styles.modalLine} />
            <TouchableHighlight
              activeOpacity={1}
              onPress={() => this.hideModal(false)}
              underlayColor={styleConsts.bgGrey}
              delayTime={500}
            >
              <View style={styles.modalBtnInfo}>
                <Text style={[styles.modalBtntxt, { color: styleConsts.mainColor }]}>
                  {I18n.t('confirmGiveUp')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>

      </View>
    )
  }
  hideModal = (flag) => {
    this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
    flag && this.setState({
      text: '',
    })
    flag && this.props.cancel();
    !flag && this.props.confirm(this.state.text)
  }
  againSetLoaction = () => {
    if (this.state.modalTop === 0) {
      this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
        const keyboarHeight = event.startCoordinates.height;
        this.setState({
          modalTop: (height - keyboarHeight - 250) / 2 + 20,
        })
      });
    }
  }
}
InputModal.defaultProps = {
  cancel: () => {},
  comfirm: () => {},
};

InputModal.PropTypes = {
  cancel: React.PropTypes.func,
  comfirm: React.PropTypes.func,
};

const styles = StyleSheet.create({
  mask: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    height,
    width,
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    zIndex: 99999999,
  },
  inputModalBox: {
    backgroundColor: styleConsts.white,
    width: 300,
    borderRadius: 8,
    alignItems: 'center',
    paddingTop: 20,
    position: 'relative',
    marginTop: 100,
  },
  inputModal: {
    padding: 8,
    width: 260,
    height: 164.5,
    borderColor: styleConsts.lightGrey,
    borderWidth: 1,
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
  },
  modalBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginTop: 20,
    borderTopColor: styleConsts.lightGrey,
    borderTopWidth: 1,
  },
  modalBtnInfo: {
    width: 150,
    justifyContent: 'center',
    height: 45,
    alignItems: 'center',
  },
  modalLine: {
    height: 45,
    width: 1,
    backgroundColor: styleConsts.lightGrey,
  },
  modalBtntxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
  },
})
export default InputModal;

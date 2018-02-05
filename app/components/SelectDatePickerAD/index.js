/**
 * 安卓版不能选择当前日期以前的日期
 */
import React, { Component } from 'react';
import { StyleSheet, View, Text, Modal, TouchableWithoutFeedback } from 'react-native';
import Picker from '../react-native-roll-picker';
import Dimensions from 'Dimensions';
const { height,width } = Dimensions.get('window');
import Moment from 'moment';
import { styleConsts } from '../../utils/styleSheet/styles';

let currentTime=Moment().format('YYYY年-MM月-DD日');
let currentTimeArry=currentTime.split('-');
let startTimeArr = (Moment().subtract(1, 'month').format('YYYY年-MM月-DD日')).split('-');

export default class SelectDatePickerAD extends Component{
  constructor(props){
    super(props);
    this.state={
      modalVisible:false,
      startTime:startTimeArr, //比当前月提前一个月
      endTime:currentTimeArry,//当前月
    };
    this.yearArr=this.createYears();
    this.monthArr=this.createMonthOrDate('月');
    this.dateArr=this.createMonthOrDate('日');

    this.changeTime=this.changeTime.bind(this)
  }
  componentDidMount() {
    this.setState({
      startTime: this.props.date.split('-'),
      cacheStartTime: this.props.date.split('-'),   // 备份开始日期
    },() => {
      // this.changeTime(this.state.startTime);
    })
  }
  render() {
    let { modalVisible } = this.state;
    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => this.setModalVisible(false)}
      >
        <View style={styles.mainBg}>
          <TouchableWithoutFeedback onPress={() => this.setModalVisible(false)}>
            <View style={styles.opacityBg}/>
          </TouchableWithoutFeedback>

          <View style={styles.wrapper}>
            <View style={styles.topWrapper}>
              <TouchableWithoutFeedback onPress={() => this.setModalVisible(false)}>
                <View style={styles.btnTxtWrapper}>
                  <Text style={styles.btnTxt}>{this.props.cancelTxt}</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => this.comfirm()}>
                <View style={styles.btnTxtWrapper}>
                  <Text style={styles.btnTxt}>{this.props.comfirmTxt}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>

            <View style={styles.pickerContent}>
              <View style={styles.picker}>
                <Picker
                  data={this.yearArr}
                  ref="yearPicker"
                  onDataChange={ () => {
                    this.ensureChangedDate();
                  }}
                />
              </View>
              <View style={styles.picker}>
                <Picker
                  data={this.monthArr}
                  ref="monthPicker"
                  onDataChange={ () => {
                    this.ensureChangedDate();
                  }}
                />
              </View>
              <View style={styles.picker}>
                <Picker
                  data={this.dateArr}
                  ref="datePicker"
                  onDataChange={ () => {
                    this.ensureChangedDate();
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  // Modal是否显示
  setModalVisible = (visibleFlag) => {
    this.setState({
      modalVisible: visibleFlag,
    })
  };

  // Modal显示时定位到对应日期
  onPressMask = () => {
    this.setState({
      modalVisible: true,
    },() => {
      //初始显示，需要将时间调准到起始时间(需要延迟，否则不生效)
      setTimeout(()=>this.changeTime(this.coverToSingle(this.state.startTime)),500)
    })
  };

  // 当前年的前50年后50年
  createYears = () => {
    let yearsArr = []
    let currentYear = Moment().format('YYYY');
    let startYear = currentYear - 50;
    let endYear = currentYear - 0 + 50;
    while(startYear <= endYear){
      yearsArr.push(startYear+'年')
      startYear++;
    }
    return yearsArr;
  };

  // 产生月或日期
  createMonthOrDate = (type) => {
    let rtnArr = [], times = 0;
    type == '月' ? times = 12 : times = 31;
    while(times){
      rtnArr.push(times+type);
      times--
    }
    return rtnArr.reverse();
  };

  // 将带有年月日的双字数组转为带有年月日的单字数组(用于转盘)
  coverToSingle = (arr) => {
    if(arr.length!=3){
      return []
    } else{
      return [arr[0],parseInt(arr[1])+'月',parseInt(arr[2])+'日']
    }
  };

  // 调用滚盘picker的函数
  changeTime = (dataArr) => {
    this.refs.yearPicker.selectData(dataArr[0])
    this.refs.monthPicker.selectData(dataArr[1])
    this.refs.datePicker.selectData(dataArr[2])
  };

  // 将小于10的数值前面添加0
  addHeadZero = (num) => {
    if(!isNaN(num) && num<10){
      return '0' + num;
    }else {
      return num
    }
  };

  /* 用于将年月日的双字转换为不带年月日的双字，用于返回值和本控件中的时间显示
   * parseInt是为了去掉年月日，但他会将02 => 2
   * addHeadZero是为了将2 => 02
   * [2017年,09月,11日] => 2017-09-11
   * */
  getDataStr = (dataArr) => {
    if(dataArr.length!=3)
      return [];

    let str= parseInt(dataArr[0])+'-'+this.addHeadZero(parseInt(dataArr[1]))+'-'+this.addHeadZero(parseInt(dataArr[2]));
    return str;
  };

  // 滚盘转动后，需要校验时间的合法性以及逻辑符合性
  ensureChangedDate = () => {
    let currentTimeArr = [this.refs.yearPicker.currentData,this.refs.monthPicker.currentData,this.refs.datePicker.currentData]

    // 先验证该日期是否存在
    let dateStr = this.getDataStr(currentTimeArr);
    if(!Moment(dateStr).isValid()){
      //不存在则获取该月的最后一天
      let endDate = Moment(dateStr.substr(0,dateStr.length-3),'YYYY-MM').endOf('month').format('DD日');
      currentTimeArr[2] = endDate;
      this.changeTime(currentTimeArr);
    }

    // 如果选择日期小于当前日期就直接滚动到当前日期
    if(Moment(this.getDataStr(currentTimeArr),'YYYYMMDD').format('YYYYMMDD') < Moment(this.state.cacheStartTime.join(''),'YYYYMMDD').format('YYYYMMDD')) {
      this.changeTime(this.coverToSingle(this.state.cacheStartTime));
      return;
    }

    this.setState({
      startTime:currentTimeArr
    });
  };

  // 确认按钮
  comfirm = () => {
    this.setModalVisible(false);
    if(this.props.updateDate instanceof Function) {
      this.props.updateDate(this.getDataStr(this.state.startTime));
    }
  }

}

SelectDatePickerAD.defaultProps = {
  cancelTxt: '取消',
  comfirmTxt: '确认',
};

const styles = StyleSheet.create({
  mainBg: {
    height,
    width,
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  opacityBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0)',
    zIndex: -1,
  },
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  topWrapper: {
    width: width,
    height: 40,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  btnTxtWrapper: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
  },
  pickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  picker: {
    width: width/3,
  }
});
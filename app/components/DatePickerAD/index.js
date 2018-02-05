

import React,{Component} from 'react';
import Picker from '../react-native-roll-picker'
import {StyleSheet,View,TouchableWithoutFeedback,TouchableHighlight,Text,Modal,AppState} from 'react-native';
import Moment from 'moment'
import Dimensions from 'Dimensions';

const { height,width } = Dimensions.get('window');
import {styleConsts} from '../../utils/styleSheet/styles';// 引进公用样式配置文件
const hideType=['nosearch','search'];
export default class DatePickerAD extends Component{

    constructor(props){
        let currentTime=Moment().format('YYYY年-MM月-DD日');
        let currentTimeArry=currentTime.split('-');
        let startTimeArr = (Moment().subtract(1, 'month').format('YYYY年-MM月-DD日')).split('-');
        super(props)
        this.state={
            modalVisible:false,
            startTime:startTimeArr,//比当前月提前一个月
            endTime:currentTimeArry,//当前月
            showIndex:0,//起始时间，截止时间的判断，用于渲染下划线以及区分当前时间滚盘用做哪个时间
        }
        this.yearArr=this.createYears();
        this.monthArr=this.createMonthOrDate('月');
        this.dateArr=this.createMonthOrDate('日');

        this.changeTime=this.changeTime.bind(this)
    }



    createYears(){//当前年的前50年后50年
        let yearsArr=[]
        let currentYear=Moment().format('YYYY');
        let startYear=currentYear-50;
        let endYear=currentYear-0+50;
        while(startYear<=endYear){
            yearsArr.push(startYear+'年')
            startYear++;
        }
        return yearsArr;
    }
    createMonthOrDate(type){//产生月或日期
        let rtnArr=[],times=0;
        type=='月'?times=12:times=31;
        while(times){
            rtnArr.push(times+type)
            times--
        }
        return rtnArr.reverse();
    }

    /*产生时间段内的日期数组*/
    createDateData(starY,endY) {
        let date = [];
        for(let i=1950;i<2050;i++){
            let month = [];
            for(let j = 1;j<13;j++){
                let day = [];
                if(j === 2){
                    for(let k=1;k<29;k++){
                        day.push(k+'日');
                    }
                    //Leap day for years that are divisible by 4, such as 2000, 2004
                    if(i%4 === 0){
                        day.push(29+'日');
                    }
                }
                else if(j in {1:1, 3:1, 5:1, 7:1, 8:1, 10:1, 12:1}){
                    for(let k=1;k<32;k++){
                        day.push(k+'日');
                    }
                }
                else{
                    for(let k=1;k<31;k++){
                        day.push(k+'日');
                    }
                }
                let _month = {};
                _month[j+'月'] = day;
                month.push(_month);
            }
            let _date = {};
            _date[i+'年'] = month;
            date.push(_date);
        }
        return date;
    }

    /*创建日期，为当前时间的前50年和后50年*/
    createDate(){
        let currentYear=Moment().format('YYYY');
        let startYear=currentYear-50;
        let endYear=currentYear-0+50;
        return this.createDateData(startYear,endYear)
    }


    /*判断时间的合法性*/
    judgeTimeLegal=(timeArr)=>{
        let time_str=this.getDataStr(timeArr);
        if(this.state.showIndex===0){//起始时间
            let time_end=this.getDataStr(this.state.endTime)
            //如果起始时间超过截止时间
            if(Moment(time_str).isAfter(time_end)){
               this.changeTime(this.coverToSingle(this.state.startTime))
                return false;
            }
        }else{//截止时间
            let time_start=this.getDataStr(this.state.startTime)
            //如果截止时间选择的比起始时间小，或者截止日期超过当前日期
            if(this.props.maxDate && (Moment(time_start).isAfter(time_str)||Moment(time_str).isAfter(Moment().format('YYYY-MM-DD')))){
                this.changeTime(this.coverToSingle(this.state.endTime))
                return false;
            }
        }
        return true;
    }


    setModalVisible(showhide){
        this.setState({
            modalVisible:showhide
        }, () => {
            if (typeof this.props.hidePress === 'function') {
                this.props.hidePress();
            }
        })
    }

    /*外部调用该组件的接口，显示时间滚盘*/
    onPressDate=()=>{
        this.setModalVisible(true)
        //初始显示，需要将时间调准到起始时间
       setTimeout(()=>this.switchTime(0),500)//需要延迟，否则不生效
    }

    /*将带有年月日的双字数组转为带有年月日的单字数组
    * 用于转盘*/
    coverToSingle=(arr)=>{
        if(arr.length!=3){
            return []
        } else{
            return [arr[0],parseInt(arr[1])+'月',parseInt(arr[2])+'日']
        }
    }

    /*调用滚盘picker的函数*/
    changeTime(dataArr){
        this.refs.yearPicker.selectData(dataArr[0])
        this.refs.monthPicker.selectData(dataArr[1])
        this.refs.datePicker.selectData(dataArr[2])
    }

    /*切换时间段：起始时间和截止时间*/
    switchTime(index){
        this.setState({
            showIndex:index
        },()=>{
            this.state.showIndex===0?
                this.changeTime(this.coverToSingle(this.state.startTime)):
                this.changeTime(this.coverToSingle(this.state.endTime))
        })
    }
    /*取消*/
    cancelD=()=>{
        this.setModalVisible(false);
    }

    /*确定*/
    confirmD=()=>{
        this.setModalVisible(false);
        if (typeof this.props.updateDate === 'function') {
            this.props.updateDate(this.getDataStr(this.state.startTime),this.getDataStr(this.state.endTime));
        }
    }

    /*将小于10的数值前面添加0？？这块我记得es6/7有一个方法，忘了*/
    addHeadZero=(num)=>{
        if(!isNaN(num)&&num<10){
            return '0'+num;
        }else return num;
    }

    /*用于将年月日的双字转换为不带年月日的双字，用于返回值和本控件中的时间显示
    * parseInt是为了去掉年月日，但他会将02=》2
    * addHeadZero是为了将2=》02
    * [2017年,09月,11日]-》2017-09-11*/
    getDataStr=(dataArr)=>{
        if(dataArr.length!=3) return []
        let str= parseInt(dataArr[0])+'-'+this.addHeadZero(parseInt(dataArr[1]))+'-'+this.addHeadZero(parseInt(dataArr[2]));
        return str;
    }

    /*滚盘转动后，需要校验时间的合法性以及逻辑符合性*/
    ensureChangedDate(){
        let currentTimeArr=[this.refs.yearPicker.currentData,this.refs.monthPicker.currentData,this.refs.datePicker.currentData]

        /*先验证该日期是否存在*/
        let dateStr=this.getDataStr(currentTimeArr);
        if(!Moment(dateStr).isValid()){
            //不存在则获取该月的最后一天
            let endDate=Moment(dateStr.substr(0,dateStr.length-3),'YYYY-MM').endOf('month').format('DD日');
            currentTimeArr[2]=endDate
            this.changeTime(currentTimeArr);
        }
        /*逻辑合法性*/
        this.judgeTimeLegal(currentTimeArr)&&(this.state.showIndex==0?this.setState({
                startTime:currentTimeArr
            }):this.setState({
                endTime:currentTimeArr
            })
        )
    }

    render(){
        let startData_str=this.getDataStr(this.state.startTime);
        let endData_str=this.getDataStr(this.state.endTime);
        return (
            <Modal
                transparent={true}
                animationType="fade"
                visible={this.state.modalVisible}
                onRequestClose={() => {this.setModalVisible(false)}}
            >
                <View style={styles.mask}>
                    <TouchableWithoutFeedback
                        onPress={() => {this.setModalVisible(false)}}>
                        <View style={styles.maskInner}></View>
                    </TouchableWithoutFeedback>

                    <View style={styles.timePickerCenter}>
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                            <TouchableHighlight underlayColor='transparent' onPress={()=>this.cancelD()}>
                                <View >
                                    <Text style={styles.buttonText}>{this.props.cancelText}</Text>
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight underlayColor='transparent' onPress={()=>this.confirmD()}>
                                <View>
                                    <Text style={styles.buttonText}>{this.props.confirmText}</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                        <View style={{height: 0.5, backgroundColor: styleConsts.lightGrey}}/>
                        <View style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
                            <TouchableHighlight underlayColor='transparent' onPress={()=>this.switchTime(0)}>
                                <View style={{height:45,justifyContent:'center',alignItems:'center'}}>
                                    <Text style={0 === this.state.showIndex ? {color: styleConsts.mainColor} : {color:'#222'}}>{startData_str}</Text>
                                    {0 === this.state.showIndex && <View  style={{ height: 2, position: 'absolute', bottom: -1, width: 160, backgroundColor:styleConsts.mainColor, zIndex: 2,}}/>}
                                </View>
                            </TouchableHighlight>
                            <View style={{height: 1, backgroundColor:'#222',width: 10}}/>
                            <TouchableHighlight underlayColor='transparent'  onPress={()=>this.switchTime(1)}>
                                <View style={{height:45,justifyContent:'center',alignItems:'center'}}>
                                    <Text style={1 === this.state.showIndex ? {color: styleConsts.mainColor} : {color:'#222'}}>{endData_str}</Text>
                                    {1 === this.state.showIndex && <View  style={{ height: 2, position: 'absolute', bottom: -1, width: 160, backgroundColor:styleConsts.mainColor, zIndex: 2,}}/>}
                                </View>
                            </TouchableHighlight>
                        </View>
                        <View style={{height: 0.5, backgroundColor: styleConsts.lightGrey}}/>
                        <View style={styles.selectAction}>
                            <View>
                                <Picker
                                    data={this.yearArr}
                                    ref="yearPicker"
                                    onDataChange={() => {
                                       this.ensureChangedDate()
                                    }}
                                />
                            </View>
                            <View>
                                <Picker
                                    data={this.monthArr}
                                    ref="monthPicker"
                                    onDataChange={() => {
                                        this.ensureChangedDate()
                                    }}
                                />
                            </View>
                            <View>
                                <Picker
                                    data={this.dateArr}
                                    ref="datePicker"
                                    onDataChange={() => {
                                        this.ensureChangedDate()
                                    }}
                                />
                            </View>
                        </View>

                    </View>
                </View>
            </Modal>
        )
    }
}



DatePickerAD.defaultProps = {
    cancelText:'取消',
    confirmText:'确认'
}
const styles = StyleSheet.create({
    mask:{
        backgroundColor: 'rgba(0,0,0,0.2)',
        height,
        width,
        position: 'absolute',
        top: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999999,
    },
    maskInner:{
        position:'absolute',
        width:'100%',
        height:'100%',
        backgroundColor:'rgba(0,0,0,0)',
        zIndex:-1
    },
    timePickerCenter:{
        flex:1,
        position:'absolute',
        bottom:0,
        left:0,
        width:'100%',
        backgroundColor:'#fff',
        zIndex:1},

    buttonText:{
        fontSize:13,
        color:'#666',
        padding:20},

    selectAction: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    selectBox: {
        width: '33%',
    },
})
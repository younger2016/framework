/**
 * Created by chenshuang on 2017/8/17.
 */
import React, { Component } from 'react'
import CheckBox from 'react-native-check-box';
import { StyleSheet, Text, View} from 'react-native'
import { styleConsts } from '../../utils/styleSheet/styles';

export default class CheckBoxGroup extends Component {
  constructor(props){
    super(props);
    this.state = {
      checkedAll: false,
      dataSource: [],
      value: new Set()
    };
    this.checkAll = this.checkAll.bind(this);
    this.checkItem = this.checkItem.bind(this);
    this.renderCheckAll = this.renderCheckAll.bind(this);
    this.renderCheckItems = this.renderCheckItems.bind(this);
  }

  componentDidMount(){
    this.setState({
      dataSource: this.props.dataSource,
      value:new Set(this.props.value),
    })
  }

  componentWillReceiveProps(nextProps){
    if(this.props.value !== nextProps.value){
      this.setState({
        value: new Set(nextProps.value),
      })
    }
  }

  render(){
    return (
        <View style={this.props.style}>
          {this.renderCheckAll()}
          {this.renderCheckItems()}
        </View>
    )
  }

  renderCheckAll(){
    return(
      this.props.hasCheckAll ?
          <View style={[ styles.checkBox, this.props.CheckAllStyle ]}>
            <CheckBox
                style = {styles.check}
                onClick={this.checkAll}
                isChecked={this.state.checkedAll}
                rightText={''}
                rightTextStyle={{fontSize: styleConsts.H4}}
                checkedImage={this.props.checkedImage}
                unCheckedImage={this.props.unCheckedImage}
            />
            {this.props.checkAllComponent()}
          </View>
          :null
    )
  }

  renderCheckItems(){

    return(
        this.state.dataSource.map((checkItem)=>{
          let isCheck = this.state.value.has(checkItem[this.props.keyName]);
          return (
              <View key={checkItem[this.props.keyName]} style={[styles.checkBox, this.props.ItemStyle]}>
                <CheckBox
                    style = {styles.check}
                    onClick={() => this.checkItem(checkItem[this.props.keyName])}
                    isChecked={this.state.checkedAll || !!isCheck}
                    rightText={checkItem[this.props.labelName]}
                    rightTextStyle={{fontSize: styleConsts.H4}}
                    checkedImage={this.props.checkedImage}
                    unCheckedImage={this.props.unCheckedImage}
                />
                {this.props.itemComponent(checkItem)}
              </View>

          )
        })
    )
  }

  checkAll(){
    let {checkedAll, value, dataSource} =this.state;
    checkedAll = !checkedAll;
    if(!checkedAll){
      value.clear();
    }else{
      value = new Set(dataSource.map((data)=> data[this.props.keyName]))
    }
    this.setState({
      checkedAll,
      value
    },()=>{
      this.props.onChange(Array.from(value));
    })
  }

  checkItem(val){
    let {value, checkedAll, dataSource} = this.state;
    if(value.has(val)){
      value.delete(val);
    }else{
      value.add(val);
    }
    checkedAll = value.size == dataSource.length;
    this.setState({
      value,
      checkedAll
    },()=>{
      this.props.onChange(Array.from(value));
    })
  }

}
CheckBoxGroup.defaultProps = {
  style: StyleSheet.create({}), //最外层样式
  CheckAllStyle: StyleSheet.create({}), //全选样式
  ItemStyle: StyleSheet.create({}), //每一项样式
  value: [],  //已选数据
  dataSource: [], //展示源数据
  hasCheckAll: true, //是否显示全选按钮
  labelName: 'Item', //可选项显示的字段
  keyName: 'key', //可选项的key
  onChange: ()=>{},
  checkAllComponent: null, //全选后的组件
  itemComponent: null,  //可选项后的组件
  checkedImage: null,   //选中时的图标
  unCheckedImage: null  //未选中时的图标
};

CheckBoxGroup.PropTypes = {
  style: View.propTypes.style,
  CheckAllStyle: View.propTypes.style,
  ItemStyle: View.propTypes.style,
  value: React.PropTypes.array,
  dataSource: React.PropTypes.array,
  hasCheckAll: React.PropTypes.bool,
  labelName:React.PropTypes.string,
  keyName:React.PropTypes.string,
  onChange: React.PropTypes.func,
  checkAllComponent: React.PropTypes.element,
  itemComponent: React.PropTypes.element,
  checkedImage: React.PropTypes.element,
  unCheckedImage: React.PropTypes.element,
};

const styles = StyleSheet.create({
  checkBox: {
    // borderTopColor: styleConsts.lightGrey,
    // borderTopWidth: styleConsts.sepLine,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: styleConsts.white
  },
  check:{
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: styleConsts.white
  },
  H4: {
    fontSize: styleConsts.H4
  }
})
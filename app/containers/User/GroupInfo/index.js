/**
 * 集团信息
 */
import React,{ PropTypes } from 'react'
import { ScrollView, View, Text, StyleSheet, AsyncStorage, Image, } from 'react-native';
import { connect } from 'react-redux'
import { styleConsts } from '../../../utils/styleSheet/styles'
import I18n from 'react-native-i18n';
import HeaderBar from '../../../components/HeaderBar'
import Dimensions from 'Dimensions';
import {TouchableWithoutFeedbackD} from '../../../components/touchBtn'
import {
  NAV_TO_INPUT_PERSONINFO
} from '../../../redux/actions/nav.action'
import * as Progress from 'react-native-progress';
import { is } from 'immutable'
import Toast from 'react-native-root-toast';
import { toastShort } from '../../../components/toastShort'
import SelectArea from '../../../components/SelectArea'
import {CachedImage, ImageCache} from "react-native-img-cache";
import {checkAndUpload, getImgUrl} from '../../../utils/adapter';
import {userGetGroupInfoAll, userSaveGroupInfoAll, SET_NEW_LOGO_FROM_GROUP} from '../../../redux/actions/user.action'
import BlankPage from '../../../components/BlankPage'
const {width, height} = Dimensions.get('window');
const businessModelTypes = ['', 'onlyMeal', 'moreMeals', 'chain'];

import { createImageProgress } from 'react-native-image-progress';

// 设置集团在安卓上圆形显示
const ImageComponent = (props) => {
  const style = [props.style, { borderRadius: 30 }];
  const newProps = {...props,  style };
  return <Image {...newProps} />;
};
const ImageProgress = createImageProgress(ImageComponent);


class GroupInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      personInfo: {
        groupLogoUrl: '',
        groupName: '',
        linkman: '',
        groupPhone: '',
        businessModel: 0,
        fax: '',
        groupMail: '',
        groupArea: '',
        groupAddress: '',
        groupProvince: '',
        groupProvinceCode: '',
        groupCity: "",
        groupCityCode: '',
        groupDistrict : "",
        groupDistrictCode : ''
      },
      showSpinner: true,
      loadSuccess: false,
    }
  }
  componentDidMount() {
    if(this.props.$groupInfo.getIn(['info', 'groupID'])){
      this.setState({
          personInfo: this.props.$groupInfo.get('info').toJS()
      })
    }
    this.getAllInfo()
  };
  componentWillReceiveProps(nextProps) {
    if(!(is(nextProps.$groupInfo.get('info'),this.props.$groupInfo.get('info')))){
      this.setState({
        personInfo: nextProps.$groupInfo.get('info').toJS()
      })
    }
  }
  componentWillUnmount() {
    this.toast && Toast.hide(this.toast);
    if(this.upload){ // 更新本地头像
      //改缓存
      AsyncStorage.getItem("userInfo").then(user => {
        if(user !== null && user !== undefined){
            let newUser = JSON.parse(user);
            newUser.purchaserUserVo.groupLogoUrl = this.state.personInfo.groupLogoUrl;
            AsyncStorage.setItem('userInfo', JSON.stringify(newUser));
        }
      })
    }
  }
  render() {
    const {groupLogoUrl, groupProvinceCode = '', groupCityCode = '', groupDistrictCode = ''} = this.state.personInfo
    return (
      <View style={styles.container}>
        <HeaderBar
          title={I18n.t('groupInfo')}
          cancelHide={true}
          navigation={this.props.navigation}
        />
        {
          !this.state.showSpinner ?
            (
              this.state.loadSuccess ?
                <ScrollView>
                  <View style={styles.moudelBox}>
                    <View style={[styles.listBox, styles.topIMgBox]}>
                      {/*集团标志*/}
                      <Text style={styles.title} >{I18n.t('groupInLogo')}</Text>
                      <TouchableWithoutFeedbackD delayTime={400} onPress={() => this.setUploadImg()}>
                        <View style={styles.userImg}>
                            <Image source={require('../../../imgs/camera.png')} style={styles.bgImg}/>
                            {
                              (groupLogoUrl && '' !== groupLogoUrl) ?
                                <ImageProgress
                                  source={{ uri: getImgUrl(groupLogoUrl) }}
                                  indicator={Progress.Bar}
                                  indicatorProps={{
                                    height: 10,
                                    width: 60,
                                    borderWidth: 0,
                                    borderRadius: 5,
                                    color: 'rgba(150, 150, 150, 1)',
                                    unfilledColor: 'rgba(200, 200, 200, 0.2)'
                                  }}
                                  style={{width: 60, height: 60, borderRadius: 30,}}
                                /> : null
                            }
                            {
                              (groupLogoUrl && '' !== groupLogoUrl) ?
                                <CachedImage source={{uri: getImgUrl(groupLogoUrl)}} style={{height: 0, width: 0, position: 'absolute'}} />
                                : null
                            }
                        </View>
                      </TouchableWithoutFeedbackD>
                    </View>
                  </View>
                  {this.renderCenterList()}
                  {this.renderBottomList()}
                </ScrollView> :
                <BlankPage visable={true} type='error' loadAgain={() => this.getAllInfo()}/>
            ) : null
        }
        <SelectArea
          ref='selectArea'
          province={groupProvinceCode}
          city={groupCityCode}
          area={groupDistrictCode}
          confirm={(res) => this.selectAreaRes(res)}
        />
        <View style={{
          flex: 1,
          width: this.state.showSpinner ? '100%': 0,
          height: this.state.showSpinner? height: 0,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          paddingTop: 60
        }}>
          <BlankPage
            visable={this.state.showSpinner}
            type={'loading'}
          />
        </View>
      </View>
    )
  }
  renderCenterList = () => {
    return (
     <View style={styles.moudelBox}>
      <View style={[styles.listBox,]}>
        <Text style={styles.title}>
          {
            //集团名称
            I18n.t('groupName')
          }
        </Text>
        <View style={styles.inputList}>
          <Text style={styles.inputTxt} numberOfLines={1}>
            {this.state.personInfo.groupName}
          </Text>
        </View>
      </View>
      <View style={{height: 0.5, backgroundColor: styleConsts.lightGrey}}/>
      <View style={[styles.listBox,]}>
        <Text style={styles.title}>
          {
            //经营模式
            I18n.t('businessModel')
          }
        </Text>
        <View style={styles.inputList}>
          <Text style={styles.inputTxt} numberOfLines={1}>
            {this.state.personInfo.businessModel  && I18n.t(businessModelTypes[this.state.personInfo.businessModel])}
          </Text>
        </View>
      </View>

    </View>
    )
  }

  renderBottomList = () => {
    return (
      <View style={styles.moudelBox}>
       <TouchableWithoutFeedbackD onPress={() => {this.goToInputThis(I18n.t('shopOfPerson'), this.state.personInfo.linkman, false, 'linkman')}}>
         <View style={[styles.listBox]}>
           <Text style={styles.title}>
             {
               //负责人
               I18n.t('shopOfPerson')
             }
           </Text>
           <View style={styles.inputList}>
             <Text style={styles.inputTxt} numberOfLines={1}>
               {this.state.personInfo.linkman}
             </Text>
             <Image
               source={require('../../../imgs/leftBar.png')}
               style={styles.leftBar}
             />
           </View>
         </View>
       </TouchableWithoutFeedbackD>
       <View style={{height: 0.5, backgroundColor: styleConsts.lightGrey}}/>
       <TouchableWithoutFeedbackD onPress={() => {this.goToInputThis(I18n.t('contactNumber'), this.state.personInfo.groupPhone, false, 'groupPhone')}}>
         <View style={[styles.listBox]}>
           <Text style={styles.title}>
             {
               //联系电话
               I18n.t('contactNumber')
             }
           </Text>
           <View style={styles.inputList}>
             <Text style={styles.inputTxt} numberOfLines={1}>
               {this.state.personInfo.groupPhone}
             </Text>
             <Image
               source={require('../../../imgs/leftBar.png')}
               style={styles.leftBar}
             />
           </View>
         </View>
       </TouchableWithoutFeedbackD>
       <View style={{height: 0.5, backgroundColor: styleConsts.lightGrey}}/>
       <TouchableWithoutFeedbackD onPress={() => {this.goToInputThis(I18n.t('faxed'), this.state.personInfo.fax, false, 'fax')}}>
         <View style={[styles.listBox]}>
           <Text style={styles.title}>
             {
               //传真
               I18n.t('faxed')
             }
           </Text>
           <View style={styles.inputList}>
             <Text style={styles.inputTxt} numberOfLines={1}>
               {this.state.personInfo.fax}
             </Text>
             <Image
               source={require('../../../imgs/leftBar.png')}
               style={styles.leftBar}
             />
           </View>
         </View>
       </TouchableWithoutFeedbackD>
       <View style={{height: 0.5, backgroundColor: styleConsts.lightGrey}}/>
       <TouchableWithoutFeedbackD onPress={() => {this.goToInputThis(I18n.t('email'), this.state.personInfo.groupMail, false, 'groupMail')}}>
         <View style={[styles.listBox]}>
           <Text style={styles.title}>
             {
               //邮箱
               I18n.t('email')
             }
           </Text>
           <View style={styles.inputList}>
             <Text style={styles.inputTxt} numberOfLines={1}>
               {this.state.personInfo.groupMail}
             </Text>
             <Image
               source={require('../../../imgs/leftBar.png')}
               style={styles.leftBar}
             />
           </View>
         </View>
       </TouchableWithoutFeedbackD>
       <View style={{height: 0.5, backgroundColor: styleConsts.lightGrey}}/>
       <TouchableWithoutFeedbackD delayTime={300} onPress={() => this.refs.selectArea.show()}>
         <View style={[styles.listBox]}>
           <Text style={styles.title}>
             {
               //所在地区
               I18n.t('inTheArea')
             }
           </Text>
           <View style={styles.inputList}>
             <Text style={styles.inputTxt} numberOfLines={1}>
               {this.state.personInfo.groupArea}
             </Text>
             <Image
               source={require('../../../imgs/leftBar.png')}
               style={styles.leftBar}
             />
           </View>
         </View>
       </TouchableWithoutFeedbackD>
       <View style={{height: 0.5, backgroundColor: styleConsts.lightGrey}}/>
       <TouchableWithoutFeedbackD onPress={() => {this.goToInputThis(I18n.t('detailedAddress'), this.state.personInfo.groupAddress, true, 'groupAddress')}}>
         <View style={[styles.listBox]}>
           <Text style={styles.title}>
             {
               //详细地址
               I18n.t('detailedAddress')
             }
           </Text>
           <View style={styles.inputList}>
             <Text style={styles.inputTxt} numberOfLines={1}>
               {this.state.personInfo.groupAddress}
             </Text>
             <Image
               source={require('../../../imgs/leftBar.png')}
               style={styles.leftBar}
             />
           </View>
         </View>
       </TouchableWithoutFeedbackD>

     </View>
    )
  }
  goToInputThis = (title, value, flag, key) => {
    this.props.goToInputThis({
      title,
      value,
      flag,
      key
    })
  }
  selectAreaRes = (res) => {
    let personInfo = this.state.personInfo;
    let groupArea = res.shopProvince;
    if(res.shopCity && '' !== res.shopCity){
      groupArea +='-'+res.shopCity
    }
    if(res.shopDistrict && '' !== res.shopDistrict){
      groupArea +='-'+res.shopDistrict
    }
    personInfo.shopAreaDto = res;
    personInfo.groupArea = groupArea;
    personInfo.groupProvince = res.shopProvince;
    personInfo.groupProvinceCode = res.shopProvinceCode;
    personInfo.groupCity = res.shopCity;
    personInfo.groupCityCode = res.shopCityCode;
    personInfo.groupDistrict = res.shopDistrict;
    personInfo.groupDistrictCode = res.shopDistrictCode;
    this.setState({
      personInfo,
    },() => this.saveOneInfo({
      groupArea: this.state.personInfo.groupArea,
      groupProvince: res.shopProvince,
      groupProvinceCode: res.shopProvinceCode,
      groupCity: res.shopCity,
      groupCityCode: res.shopCityCode,
      groupDistrict: res.shopDistrict,
      groupDistrictCode: res.shopDistrictCode,

    }))
  }
  setUploadImg = () => {
    let self = this;
    checkAndUpload(self,
      (res) => {
        let personInfo = this.state.personInfo;
        personInfo.groupLogoUrl = res
        this.upload = true;
        this.setState({
          personInfo,
        });
        // 保存头像
        this.saveOneInfo({groupLogoUrl: res})
      }
    );
  };
  // 获取数据
  getAllInfo = () => {
    this.setState({
      showSpinner: true,
    })
    if('pending' !== this.props.$groupInfo.get('status')){
      this.props.fetchInfo({
        data: {
          groupID: this.props.purchaserID,
        },
        success: (res) => {
          this.setState({
            showSpinner: false,
            loadSuccess: true,
          })
        },
        fail: () => {
          this.setState({
            showSpinner: false,
          })
        },
        timeout: () => {
          this.setState({
            showSpinner: false
          })
        },
      })
    }
  }
  saveOneInfo = (obj) => { // 保存头像
    if('pending' !== this.props.$groupInfo.get('saveStatus')){
      let data = Object.assign({groupID: this.props.purchaserID,}, obj)
      this.props.saveOneInfo({
        data,
        success: (res) => {
          this.props.setNewLogo(this.state.personInfo.groupLogoUrl);
        },
        fail: (res) => {
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res.response.message || I18n.t('fetchErrorMessage'));
        }
      })
    }
  }

}

GroupInfo.defaultProps = {};
GroupInfo.PropTypes = {};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  moudelBox: {
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    backgroundColor: styleConsts.white,
  },
  listBox: {
    height: 45,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  topIMgBox: {
    height: 80,
    borderBottomWidth: 0,
  },
  title: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  inputTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
  },
  inputList: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: width - 175,
    justifyContent: 'flex-end',
  },
  leftBar: {
    width: 5,
    height: 8,
    marginLeft: 10,
  },
  userImg: {
    width: 60,
    height: 60,
    backgroundColor: styleConsts.bgGrey,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  bgImg: {
    width: 30,
    height: 26.5,
    position: 'absolute',
  },
});

const mapStateToProps = (state) => {
  return {
    purchaserID: state.user.getIn(['userInfo', 'purchaserID']),
    $groupInfo: state.user.get('groupInfo'),
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    goToInputThis: (opts) => {
      dispatch({type: NAV_TO_INPUT_PERSONINFO, payload: opts})
    },
    fetchInfo: (opts) => {
      dispatch(userGetGroupInfoAll(opts))
    },
    saveOneInfo: (opts) => {
      dispatch(userSaveGroupInfoAll(opts))
    },
    setNewLogo: (opts) => {
      dispatch({type: SET_NEW_LOGO_FROM_GROUP, payload: opts})
    }
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(GroupInfo)

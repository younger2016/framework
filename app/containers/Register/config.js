/**
 * Created by chenshuang on 2017/9/2.
 */
import I18n from 'react-native-i18n'
import {NAV_TO_FORGET_PASSWORD_SCENE, NAV_TO_REGISTER_SCENE} from '../../redux/actions/nav.action'

export const register = Object.freeze([
  [{
    icon: require('../Login/imgs/mobile1.png'),
    title: 'loginPhone',
    placeholder: 'phonePlease',
    hasButton: false,
    touchable: false,
    keyboardType: 'number-pad',
    max: 11,
    type: NAV_TO_REGISTER_SCENE

  },
    {
      icon: require('../Login/imgs/verification1.png'),
      title: 'checkCode',
      placeholder: 'codePlease',
      hasButton: true,
      buttonText: 'sendCheckCode',
      touchable: false,
      keyboardType: 'number-pad',
      max: 4,
      type: NAV_TO_REGISTER_SCENE

    }
  ],
  [
    {
      icon: require('../Login/imgs/password1.png'),
      title: 'loginPWD',
      placeholder: 'pwdPlease',
      hasButton: false,
      touchable: false,
      keyboardType: 'ascii-capable',
      max: 20,
      type: NAV_TO_REGISTER_SCENE

    },
    {
      icon: require('../Login/imgs/password1.png'),
      title: 'checkLoginPWD',
      placeholder: 'pwdAgain',
      hasButton: false,
      touchable: false,
      keyboardType: 'ascii-capable',
      max: 20,
      type: NAV_TO_REGISTER_SCENE

    },
    {
      icon: require('../Login/imgs/company1.png'),
      title: 'groupName',
      placeholder: 'groupNamePlease',
      hasButton: false,
      touchable: false,
      keyboardType: 'default',
      max: 20,
      type: NAV_TO_REGISTER_SCENE
    }
  ]
]);

export const inputInfo = Object.freeze([
  [
    {
      placeholder: 'companyPlease',
      label: 'company',
      title: 'groupName',
      select: false,
      keyboardType: 'default',
      max: 20
    },
    {
      placeholder: 'licensePlease',
      label: 'license',
      title: 'businessNo',
      select: false,
      keyboardType: 'number-pad',
      max: 18
    },
    {
      placeholder: 'locationAreaPlease',
      label: 'locationArea',
      title: 'groupArea',
      select: true,
      keyboardType: 'default',
      max: 20
    },
    {
      placeholder: 'detailedAddressPlease',
      label: 'detailedAddress',
      title: 'groupAddress',
      select: false,
      multiLine: true,
      keyboardType: 'default',
      max: 50
    }
  ],[
    {
      placeholder: 'legalPersonPlease',
      label: 'legalPerson',
      title: 'businessEntity',
      select: false,
      keyboardType: 'default',
      max: 20
    },
    {
      placeholder: 'entityIDNoPlease',
      label: 'entityIDNo',
      title: 'entityIDNo',
      select: false,
      keyboardType: 'name-phone-pad',
      max: 20
    },
    {
      placeholder: 'linkManPlease',
      label: 'linkMan',
      title: 'linkman',
      select: false,
      keyboardType: 'default',
      max: 20
    },
    {
      placeholder: 'contactNumberPlease',
      label: 'contactNumber',
      title: 'groupPhone',
      select: false,
      keyboardType: 'default',
      max: 13
    },
    {
      placeholder: 'businessScopePlease',
      label: 'businessScope',
      title: 'businessScope',
      select: false,
      keyboardType: 'default',
      max: 20
    }
  ]
]);

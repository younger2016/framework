/**
 * 切换环境
 */
import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { connect } from 'react-redux'
import { toastShort } from '../../components/toastShort';
import Toast from 'react-native-root-toast';
import I18n from 'react-native-i18n'
import { TouchableWithoutFeedbackD } from '../../components/touchBtn'
import { styleConsts } from '../../utils/styleSheet/styles';
import HeaderBar from '../../components/HeaderBar'
import {setValue, getValue} from '../../config/config.staging';

let allUrl = getValue('all');

class ChangeEnv extends React.Component {
  static navigationOptions = {
    tabBarLabel: () => I18n.t('setting'),
  };

  constructor(props) {
    super(props);
    this.state = {
      list: allUrl.all,
      now: allUrl.now || 0,
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    return (
      <View style={styles.container}>
        <HeaderBar
          cancelHide={true}
          navigation={this.props.navigation}
          title={'修改当前环境'}
        />
        {
          this.state.list.map(({title, getUrl}, index) => {
            return (
              <TouchableWithoutFeedbackD onPress={() => this.change(index)} key={getUrl}>
                <View style={[styles.list, index === 0 && {marginTop: 150}]}>
                  <Text>{title}</Text>
                  <Text style={{fontSize: 20,}}>{index == this.state.now ? '✓' : ''}</Text>
                </View>
              </TouchableWithoutFeedbackD>
            )
          })
        }
      </View>
    )
  }

  // 切换环境
  change = (index) => {
    this.toast && Toast.hide(this.toast);
    this.setState({
      now: index,
    });
    if(index !== this.state.now){
      setValue(index);
      this.toast = toastShort(`环境改变成功`);
      this.props.navigation.goBack();
    }
  }
}

const mapStateToProps = (state) => {
  return {

  }
};
const mapDispatchToProps = (dispatch) => {
  return {

  }
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
    alignItems: 'center',
  },
  list: {
    height: 40,
    width: 260,
    borderColor:'#ddd',
    borderWidth: 1,
    borderRadius: 6,
    margin: 15,
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(ChangeEnv)

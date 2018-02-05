
/*import React, {
  Component,
} from 'react';
import {
  SectionList, Platform, RefreshControl
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default class PullSectionList extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };

  }

  render() {
    return  <SectionList
            renderScrollComponent= {(props)=>{
              return <KeyboardAwareScrollView
                enableOnAndroid = {true}
                extraScrollHeight = {Platform.OS == 'ios' ? 0 : 64}
                refreshControl={
                  <RefreshControl
                    refreshing={this.props.refreshing}
                    onRefresh={this.props.onRefresh}
                  />
                }
                {...props}
              />
            }}
            {...this.props}
          />

  }
}*/


import React, {
  Component,
} from 'react';
import {
  SectionList, Platform, RefreshControl
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import PullCenter from './Pull'
import DefoultHeader from './DefoultHeader'
import DefoultFooter from './DefoultFooter'

export default class PullSectionList extends PullCenter {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  getRNCenter = () => { // 返回可操作的底层列表组件， 非底层组件必须要有，像底层的ScrollView不需要，直接定义可操作的this._faltList
    return this._foutS.getScrollResponder()
  }
  renderCenter = () =>{
    const { onRefresh, onEndReached, ListHeaderComponent, ListFooterComponent,onScroll,  ...other} = this.props;
    return  <SectionList
      renderScrollComponent= {(props)=>{
        return <KeyboardAwareScrollView
          {...props}
        />
      }}
      {...other}
      scrollEventThrottle={4}
      ListHeaderComponent={
        () => <DefoultHeader
          ref={(ref) => this._defoultHeader= ref}
          height={this.loadingFetchHeight}
          show={this.showHeader}
          style={[
            {
              justifyContent: 'center',
              width: '100%',
              alignItems: 'center',
              height: this.loadingFetchHeight,
              paddingBottom: 10,
            },typeof this.showHeader === 'string' && this.showHeader.indexOf('oading') > -1 ? {} : {
              position: 'absolute',
              top: -this.loadingFetchHeight,
              left: 0
            }
          ]}/>
      }
      ListFooterComponent={
        () => <DefoultFooter
          ref={(ref) => this._defoultFooter= ref}
          height={this.loadingFetchHeight}
          show={this.showFooter}
          style={{
            justifyContent: 'center',
            width: '100%',
            alignItems: 'center',
            position: 'absolute',
            height: this.FetchMoreHeight,
            bottom: this.bottom,
            left: 0
          }}/>
      }
      ref={(ref) => { this._foutS = ref }}
      onScroll={this.onScroll}
      onContentSizeChange={(w, h) => this.contentHeight = h}
    />

  }
}


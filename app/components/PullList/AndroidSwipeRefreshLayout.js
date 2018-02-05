
import React, {
    PropTypes,
    Component,
} from 'react'
import {
    View,
    requireNativeComponent,
    Platform,
} from 'react-native'
const NativeSwipeRefreshLayout = requireNativeComponent('RCTSwipeRefreshLayout', AndroidSwipeRefreshLayout)
export default class AndroidSwipeRefreshLayout extends Component {

    static propTypes = {
        ...View.propTypes,
        refreshing: PropTypes.bool,
        enabledPullUp: PropTypes.bool,
        enabledPullDown: PropTypes.bool,
        onSwipe: PropTypes.func,
        onRefresh: PropTypes.func,
    }

    setNativeProps(props) {
        this._nativeSwipeRefreshLayout.setNativeProps(props)
    }

    render() {
      const {onSwipe, onSwipeRefresh, ...other} = this.props
        return (
            <NativeSwipeRefreshLayout
                {...other}
                ref={ (component) => this._nativeSwipeRefreshLayout = component }
                onSwipe={this._onSwipe}
                onSwipeRefresh={this._onRefresh}
            />
        );
    }

    _onSwipe = (e) => {
        this.props.onSwipe(e.nativeEvent.movement)
    }

    _onRefresh = () => {
        this.props.onRefresh()
    }

}


import { StackNavigator } from 'react-navigation'
import AppRouteConfigs from './AppRouteConfigs'

const AppNavigator = StackNavigator(AppRouteConfigs, {
  initialRouteName: 'Home',
})

export default AppNavigator

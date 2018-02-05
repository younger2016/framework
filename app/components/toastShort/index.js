/**
 * 提示信息弹窗
 */
import Toast from 'react-native-root-toast';

export const toastShort = (content, onHidden = () => {}, pos) => {
  return Toast.show(content.toString(), {
    duration: Toast.durations.SHORT,
    position: typeof pos === 'number' ? pos : Toast.positions.CENTER,
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 0,
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    textColor: '#fff',
    textStyle: {
      fontSize: 13,
      color: '#fff',
    },
    onHidden: () => { onHidden() },
  });
};

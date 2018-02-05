
// 图片选择器参数设置
export const options = {
  title: '请选择图片来源',
  cancelButtonTitle: '取消',
  takePhotoButtonTitle: '拍照',
  chooseFromLibraryButtonTitle: '相册图片',
  quality: 0.75,
  noData: true,
  allowsEditing: true,
  storageOptions: {
    skipBackup: true,
    cameraRoll: true, // 保存到手机相册,此时response中才有fileName
    waitUntilSaved: true,
    path: 'images',
  },
};

package com.hll_mall_app;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.beefe.picker.PickerViewPackage;
import org.wonday.aliyun.push.AliyunPushPackage;
import cn.reactnative.httpcache.HttpCachePackage;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import im.shimo.react.keyboard.KeyboardPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.imagepicker.ImagePickerPackage;
import com.microsoft.codepush.react.CodePush;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnativenavigation.bridge.NavigationReactPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.reactnativecomponent.swiperefreshlayout.RCTSwipeRefreshLayoutPackage;

// 阿里推送引用
import com.alibaba.sdk.android.push.CloudPushService;
import com.alibaba.sdk.android.push.CommonCallback;
import com.alibaba.sdk.android.push.noonesdk.PushServiceFactory;
import com.alibaba.sdk.android.push.register.HuaWeiRegister;
import com.alibaba.sdk.android.push.register.MiPushRegister;
import android.content.Intent;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    @Override
    protected String getJSBundleFile() {
      return CodePush.getJSBundleFile();
    }

    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new PickerViewPackage(),
            new AliyunPushPackage(),
            new HttpCachePackage(),
            new RNExitAppPackage(),
            new KeyboardPackage(),
            new SplashScreenReactPackage(),
            new RNFetchBlobPackage(),
            new ImagePickerPackage(),
            new CodePush(BuildConfig.CODEPUSH_KEY, MainApplication.this, BuildConfig.DEBUG),
            new VectorIconsPackage(),
            new NavigationReactPackage(),
            new RNI18nPackage(),
            new RCTSwipeRefreshLayoutPackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    this.getApplicationContext();
    SoLoader.init(this, /* native exopackage */ false);

    //下面是添加的代码
    this.initCloudChannel();
    //添加结束
  }

  // 下面是添加的代码
  /**
   * 初始化阿里云推送通道
   * @param applicationContext
   *  // 测试：24764797，fe4187794e01ad6e90937de506ec38f2， 正式环境：24751894，e1d429881f2242e71eb695f3e2bf8e6d
   */
  private void initCloudChannel() {
    PushServiceFactory.init(this.getApplicationContext());
    CloudPushService pushService = PushServiceFactory.getCloudPushService();
    pushService.setNotificationSmallIcon(R.mipmap.ic_launcher);//设置通知栏小图标， 需要自行添加
    pushService.register(this.getApplicationContext(), "24764797", "fe4187794e01ad6e90937de506ec38f2", new CommonCallback() {
      @Override
      public void onSuccess(String responnse) {
        // success
      }
      @Override
      public void onFailed(String code, String message) {
        // failed
      }
    });

    // 注册方法会自动判断是否支持小米系统推送，如不支持会跳过注册。
    // MiPushRegister.register(this.getApplicationContext(), "小米AppID", "小米AppKey");
    // 注册方法会自动判断是否支持华为系统推送，如不支持会跳过注册。
    //HuaWeiRegister.register(this.getApplicationContext());
  }
  // 添加结束

}

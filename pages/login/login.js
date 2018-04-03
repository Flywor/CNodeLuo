//获取应用实例
const app = getApp();

import cnodeAPI from '../../net/cnode-api.js';

Page({
  data: {
    token: '',
    errorMsg: '',
  },
  //事件处理函数
  bindTokenInput: function(e){
    this.setData({
      token: e.detail.value,
      errorMsg: ''
    })
  },
  bindScanCodeTap: function(){
    wx.scanCode({
      success: (res) => {
        this.checkToken(res.result);
        this.setData({ errorMsg: '扫描成功，正在登录中...' });
      }
    });
  },
  bindSureTap: function(){
    const token = this.data.token;
    this.checkToken(token);
  },
  // 自定义方法
  checkToken: function(token){
    cnodeAPI.checkToken(token, res => {
      if (res.success) {
        app.globalData.cnodeInfo = {
          avatar_url: res.avatar_url,
          id: res.id,
          loginname: res.loginname,
          accessToken: token
        };
        wx.setStorageSync('cnodeInfo', app.globalData.cnodeInfo);
        wx.navigateBack();
      } else {
        this.setData({ errorMsg: res });
      }
    });
  }
})

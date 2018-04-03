//获取应用实例
const app = getApp();

import cnodeAPI from '../../net/cnode-api.js';

Page({
  data: {
    isLoading: true,
    read: [],
    unRead: [],
  },
  onShow: function(){
    cnodeAPI.getMessage(res => {
      this.setData({
        isLoading: false,
        read: res.data.has_read_messages,
        unRead: res.data.hasnot_read_messages,
      });
    });
  },
  //事件处理函数
  bindListTap: function (e) {
    cnodeAPI.makeMsgRead(e.currentTarget.dataset.msgid);
    wx.navigateTo({
      url: '../detail/detail?id=' + e.currentTarget.dataset.topicid
    });
  },
  bindSignAllTap: function(){
    cnodeAPI.makeAllMsgRead(()=>{
      wx.navigateBack();
    });
  },
})

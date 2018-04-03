//获取应用实例
const app = getApp();

import cnodeAPI from '../net/cnode-api.js';

Page({
  data: {
    tabList: {
        all: '全部',
        ask: '问答',
        share: '分享',
        job: '招聘',
        good: '精华'
    },
    tab: 'all',
    scrollHeight: 0,
    scrollTop: 0,
    page: 1,
    list: [],
    isloading: false,
    headUrl: '',
    unRead: 0,
  },
  // 生命周期
  onLoad: function () {
    this.getTopics(this.data.tab);
    wx.getSystemInfo({
      success: res => {
        app.globalData.device = res;
        this.setData({
          scrollHeight: app.globalData.device.windowHeight - 50,
        });
      }
    });
  },
  onShow: function () {
    const that = this;
    if (wx.getStorageSync('cnodeInfo') != "") {
      app.globalData.cnodeInfo = wx.getStorageSync('cnodeInfo');
    }
    that.setData({
      headUrl: app.globalData.cnodeInfo.avatar_url || ''
    });
    this.getMessage();
  },
  onHide: function () { 
    if (!!this.timer) clearTimeout(this.timer);
  },
  onUnload: function(){
    if (!!this.timer) clearTimeout(this.timer);
  },
  //事件处理函数
  bindTabTap: function(e) {
    this.setData({ page: 1, tab: e.target.dataset.type, list: [], isloading: true, scrollTop: 0 });
    this.getTopics(e.target.dataset.type);
  },
  bindLoginTap: function(){
    wx.navigateTo({
      url: 'login/login'
    })
  },
  bindListTap: function (e) {
    wx.navigateTo({
      url: 'detail/detail?id=' + e.currentTarget.dataset.topicid
    });
  },
  bindMsgTap: function(){
    wx.navigateTo({
      url: 'msg/msg'
    });
  },
  bindMyCollectTap: function(){
    this.setData({ list: [], isloading: true, tab: 'collect' });
    cnodeAPI.getMyCollect(res=>{
      this.setData({ list: res.data, isloading: false });
    });
  },
  // 自定义方法
  getTopics: function(tab, isNext){
    cnodeAPI.getTopics({
        page: this.data.page, 
        tab: tab == 'all' ?'': tab,
    }, res => {
      if (isNext){
        this.setData({ list: [...this.data.list, ...res.data], isloading: false, isLoadingMore: false });
      }else{
        this.setData({ list: res.data, isloading: false, isLoadingMore: false });
      }
    });
  },
  loadMore: function () {
    if (this.data.isloading) return;
    this.setData({ page: this.data.page + 1, isloading: true, isLoadingMore: true });
    this.getTopics(this.data.tab, true);
  },
  getMessage: function(){
    if (!!this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.getMessage, 30000);
    cnodeAPI.getMessageCount(res => {
      this.setData({ unRead: res.data > 99 ? '99+' : res.data });
    });
  }
})

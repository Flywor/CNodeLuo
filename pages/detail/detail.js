//获取应用实例
const app = getApp();

import cnodeAPI from '../../net/cnode-api.js';
import util from '../../utils/util.js';
import WxParse from '../../utils/wxParse/wxParse.js';

Page({
  data: {
    isSubmit: false,
    commentFocus: false,
    comment: '',
    replyId: 0,
    replyAuthor: null,
  },
  // 生命周期
  onLoad: function(options){
    var that = this;
    cnodeAPI.getTopic(options.id, res => {
      const {
        id,
        title,
        create_at,
        author,
        is_collect,
        replies,
        content,
      } = res.data;
      this.setData({ 
        id,
        title,
        create_at: util.formatTime(create_at),
        author,
        is_collect,
        replies,
      });
      try{
        WxParse.wxParse('contentMd', 'html', content, that, 5);
      }catch(e){
        wx.showModal({
          content: '文章内容解析失败，将采用原生渲染',
          showCancel: false,
          confirmText: '只好如此',
          complete: () => {
            this.setData({
              contentBak: res.data.content
            });
          }
        });
      }
    });
  },
  onShow: function () {
    this.setData({ isSubmit:false });
  },
  //事件处理函数
  bindInputComment: function(e){
    const { replyId, replyAuthor } = this.data;
    this.setData({
      comment: e.detail.value,
      replyId: e.detail.value.indexOf('@' + replyAuthor) > -1 ? replyId: 0
    });
  },
  bindSubmitComment: function(){
    const { isSubmit, comment, replyId, id } = this.data;
    if (isSubmit || comment.length == 0) return;
    this.setData({ isSubmit: true });
    cnodeAPI.submitComment({
      comment, replyId, topicId: id
    }, res => {
      if(res.success){
        cnodeAPI.getTopic(this.data.id, res => {
          this.setData({
            isSubmit: false,
            commentFocus: false,
            replies: res.data.replies,
            comment: '',
            replyId: 0,
            replyAuthor: null,
          });
          wx.pageScrollTo({
            scrollTop: 999999
          });
        });
      }else{
        wx.showModal({
          content: res,
          showCancel: false,
          confirmText: '好的'
        });
        this.setData({ isSubmit: false });
      }
    });
  },
  bindUpTap: function (e) {
    if (this.data.isSubmit) return;
    this.setData({ isSubmit: true });
    cnodeAPI.submitUp(e.currentTarget.dataset.replyid, res => {
      if(res.success){
        cnodeAPI.getTopic(this.data.id, res => {
          this.setData({
            isSubmit: false,
            replies: res.data.replies,
          });
        });
      }else{
        wx.showModal({
          content: res,
          showCancel: false,
          confirmText: '好的'
        });
        this.setData({ isSubmit: false });
      }
    });
  },
  bindReplyTap: function(e){
    const { replyid, author } = e.currentTarget.dataset;
    this.setData({
      commentFocus: true,
      replyId: replyid,
      replyAuthor: author,
      comment: '@' + author + ' ' 
    });
  },
  bindCollectTap: function(e){
    this.collectTopic(false);
  },
  bindCollectedTap: function (e) {
    this.collectTopic(true);
  },
  // 自定义方法
  collectTopic: function (isCollected) {
    if (this.data.isSubmit) return;
    this.setData({ isSubmit: true });
    cnodeAPI.collect(this.data.id, isCollected, res => {
      this.setData({
        isSubmit: false,
        is_collect: !this.data.is_collect
      });
    });
  }
})

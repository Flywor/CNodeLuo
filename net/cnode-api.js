const app = getApp();

const request = function (api, data = {}, callback = () => { }, method = "GET"){
  wx.request({
    url: 'https://cnodejs.org/api/v1/' + api,
    method: method,
    data: {
      accesstoken: wx.getStorageSync('cnodeInfo').accessToken || '',
      ...data
    },
    header: { 'Content-Type': 'application/json' },
    success: function (res) {
      if (res.statusCode == 200){
        if (res.data.success){
          callback(res.data);
        }else{
          // 服务器返回错误处理
          callback(res.data.error_msg);
        }
      }else{
        // 网络请求错误处理
        callback(res.data.error_msg);
      }
    }
  })
}

const needLogin = function() {
  if (wx.getStorageSync('cnodeInfo').accessToken) {
    return false;
  }
  wx.navigateTo({
    url: '../login/login'
  });
  return true;
}

export default {
  getTopics: function (data, callback){
    request('topics', {
      page: data.page,
      tab: data.tab || '',
      limit: 20,
    }, callback);
  },
  checkToken: function (token, callback){
    request('accesstoken', {
      accesstoken: token,
    }, callback, 'POST');
  },
  getTopic: function(id, callback){
    request('topic/' + id, {
      mdrender: true,
    }, callback);
  },
  submitComment: function(data, callback){
    if (needLogin()) return;
    const { topicId, comment, replyId } = data;
    request('topic/' + topicId + '/replies', {
      content: comment + '\r\r\n\r\n > 来自小程序 [CNode罗](https://github.com/Flywor)',
      reply_id: replyId,
    }, callback, 'POST');
  },
  submitUp: function (replyId, callback){
    if (needLogin()) return;
    request('reply/' + replyId + '/ups', {}, callback, 'POST');
  },
  collect: function(topicId, colected, callback){
    if (needLogin()) return;
    let url = 'topic_collect/' + (colected ? 'de_collect' : 'collect');
    request(url, { topic_id: topicId }, callback, 'POST');
  },
  getMessageCount: function (callback) {
    request('message/count', {}, callback);
  },
  getMessage: function(callback){
    request('messages', {}, callback);
  },
  makeMsgRead: function(msgId){
    request('message/mark_one/' + msgId, {}, ()=>{}, 'POST');
  },
  makeAllMsgRead: function (callback){
    request('message/mark_all', {}, callback, 'POST');
  },
  getMyCollect: function(callback){
    request('topic_collect/alsotang', {}, callback)
  }
}
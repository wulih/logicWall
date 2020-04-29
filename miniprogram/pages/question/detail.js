// miniprogram/pages/question/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    question: null,
    error:'',
    result:'',
    type:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    options.openId = getApp().globalData.openId
    wx.cloud.callFunction({
      name: 'detail',
      data: options,
    })
      .then(res => {
        if (res.result.list.length < 1) {
          wx.showToast({
            title: '系统异常，请稍后重试',
            duration: 3
          })
        } else {
          this.setData({
            question: res.result.list[0],
            type: options.type
          })
        }
      })
      .catch(res => {
        wx.showToast({
          title: '系统异常，请稍后重试',
          duration: 3
        })
      })

  },

  radioChange: function(e) {
    var index = 0;
    var radioItems = this.data.question.option;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      if (radioItems[i].key == e.detail.value) {
        radioItems[i].checked = true;
        index  =  i;
      }else{
        radioItems[i].checked = false;
      }
    }
    
    wx.cloud.callFunction({
      name: 'answer',
      data: {
        userValue: e.detail.value,
        id: this.data.question._id,
        type: this.data.type,
        openId: getApp().globalData.openId
      },
    })
      .then(res => {
        if (res.result == null) {
          radioItems[index]['result'] = true;
          this.setData({
            question: this.data.question,
            error: '已全部完成',
            result: 'checkright'
          })
          return;
        }
        
        if ('errCode' in res.result && res.result.errCode === 1) {
          radioItems[index]['result'] = false;
          this.setData({
            question: this.data.question,
            error: res.result.errMsg,
            result: 'error'
          })
         
          return;
        }

        if ('errCode' in res.result &&  res.result.errCode === 20001) {
          radioItems[index]['result'] = false;
          this.setData({
            question: this.data.question,
            error: res.result.data.analysis,
            result: 'error'
          })

          return;
        }

        if (res.result == null || res.result.list.length <= 0) {
          radioItems[index]['result'] = true;
          this.setData({
            question: this.data.question,
            error: '已全部完成',
            result: 'checkright'
          })
          return;
        }
      
        if (res.result.list && res.result.list.length > 0) {
          radioItems[index]['result'] = true;
          this.setData({
            question: this.data.question,
            error: '',
            result: 'checkright'
          })
          wx.redirectTo({
            url: './detail?id=' + res.result.list[0]._id + '&type=' + this.data.type
            })
          return;
        }
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  onShareAppMessage: function (res) {
    return {
      title: '公务员逻辑题',
      path: '/pages/question/detail?id=' + this.data.question._id + '&type=' + this.data.type
    }
  }
})
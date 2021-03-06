// miniprogram/pages/question/detail.js
var openId = getApp().globalData.openId
Page({
  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'), 
    question: null,
    error:'',
    result:'',
    type:'',
    coverView: false,
    auth: getApp().globalData.login ? true : false,
    selectOption: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.checkAuth()
    options.openId = openId
    wx.cloud.callFunction({
      name: 'detail',
      data: options,
    })
      .then(res => {
        if (res.result.list.length < 1) {
          wx.showToast({
            title: '系统异常，请稍后重试',
            icon: 'none',
            duration: 2000
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
          icon: 'none',
          duration: 2000
        })
      })

  },

  radioChange: function(e) {
    this.setData({
      selectOption: e 
    })
    if (this.data.auth) {
      this.answerQuestion()
    } else {
      this.popAuth()
    }
    
  },
  answerQuestion: function() {
    var e = this.data.selectOption
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
        openId: openId
      },
    })
      .then(res => {
        if (res.result == null) {
          radioItems[index]['result'] = true;
          this.setData({
            question: this.data.question,
            error: '已到最后一题',
            result: 'checkright'
          })
          return;
        }
        if ('errCode' in res.result && res.result.errCode === 401) {
            this.popAuth()
            return 
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
            error: '已到最后一题',
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
  delError: function(e) {
    wx.cloud.callFunction({
      name: 'delError',
      data: {
        id: this.data.question._id,
        openId: openId
      },
    })
      .then(res => {
        if (res.result == null || ('list' in res.result && res.result.list.length <= 0)) {
          wx.showToast({
            title: '已到最后一题',
            icon: 'none',
            duration: 3000
          })
          return;
        }
        if ('errCode' in res.result && res.result.errCode === 401) {
            this.popAuth()
            return 
        }
        
        if ('errCode' in res.result && res.result.errCode === 1) {
          wx.showToast({
            title: 'res.result.errMsg',
            icon: 'none',
            duration: 3000
          })
          return;
        }

        if (res.result.list && res.result.list.length > 0) {
          this.setData({
            question: this.data.question
          })
          wx.redirectTo({
            url: './detail?id=' + res.result.list[0]._id + '&type=' + this.data.type
            })
          return;
        }
      })
  },
  analysis: function(e) {
    wx.cloud.callFunction({
      name: 'detail',
      data: {
        id: this.data.question._id,
        analysis: 1
      },
    })
      .then(res => {
        if (res.result==null || res.result.list.length < 1) {
          wx.showToast({
            title: '系统异常，请稍后重试',
            icon: 'none',
            duration: 3000
          })
        } else {
          this.setData({
            error: res.result.list[0].analysis
          })
        }
      })
      .catch(res => {
        wx.showToast({
          title: '系统异常，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      })
  },

  bindGetUserInfo: function (e) {
    wx.cloud.callFunction({
        name: 'addUser',
        data: {
            username: e.detail.userInfo.nickName,
            openId: getApp().globalData.openId
          },
    })
    .then(res => {
      getApp().setGlobalData(res.result)
      if (res.result.isRegist) {
        getApp().globalData.login = true
        this.setData({ coverView: false, auth: true })
        this.answerQuestion()
      } else {
        wx.showToast({
          title: '授权失败！',
          icon: 'none',
          duration: 2000
        })
      }
    })
    .catch(res => {
      wx.showToast({
        title: '系统异常，请稍后重试',
        icon: 'none',
        duration: 2000
      })
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
      title: '逻辑闯关',
      path: '/pages/question/detail?id=' + this.data.question._id + '&type=' + this.data.type
    }
  },
  openAuth: function (e) {
    this.setData({
      coverView: true
    })
  },
  cancelAuth: function(e) {
    this.setData({
      coverView: false
    })
  }, 
  popAuth: function() {
    this.setData({
      coverView: true
     })
  },
  checkAuth: function (e) {
    this.setData({
      auth: getApp().globalData.login
     })
    if (this.data.auth) {
      return;
    }
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
           this.setData({
            auth: false
           })
        }
      },
      fail(res) {
        this.setData({
          auth: false
         })
        wx.showToast({
          title: '系统异常，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
})
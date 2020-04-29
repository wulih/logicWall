const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    coverView: false,
    questionList: null,
    lastId: 0,
    loading: false,
    noMore: false,
    auth: true
  },
  onLoad: function () {
    this.checkAuth()
  },
  onShow: function () {
    this.setData({ 
      questionList: null,
      lastId: 0,
      loading: false,
      noMore: false
     });
    this.getList()
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
        this.setData({ coverView: false, auth: true })
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
  onReachBottom: function (e) {
    if (this.data.noMore) {
      return;
    }
    this.getList()
  },
  getList: function () {
    wx.cloud.callFunction({
      name: 'list',
      data: {
        startId: this.data.lastId,
        openId: getApp().globalData.openId
      },
    })
      .then(res => {
        if(res.result && 'login' in res.result) {
          this.setData({
            auth: res.result.login
          })
        }
        getApp().setGlobalData(res.result)
        if (res.result == null || res.result.subject.length <= 0) {
          this.setData({ noMore: true })
          return;
        }

        let list = res.result.subject
        this.setData({lastId: list[list.length - 1].position}) 
        if (this.data.questionList !== null) {
          this.setData({
            questionList: this.data.questionList.concat(list)
          })
        } else {
          this.setData({ questionList: list });
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
  checkAuth: function (e) {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
           this.setData({
             auth: false
           })
        }
      },
      fail(res) {
        wx.showToast({
          title: '系统异常，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  onShareAppMessage: function (res) {
    return {
      title: '公务员逻辑题',
      path: '/pages/index/index'
    }
  }
})

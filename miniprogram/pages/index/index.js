const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    coverView: false,
    questionList: null,
    lastId: 0,
    loading: false,
    noMore: false
  },
  onLoad: function () {
    this.getList()
    this.checkAuth()
  },
  bindGetUserInfo: function (e) {
    wx.cloud.callFunction({
        name: 'addUser',
        data: {
            username: e.detail.userInfo.nickName
          },
    })
    .then(res => {
      this.setData({ coverView: false })
    })
    .catch(res => {
      wx.showToast({
        title: '系统异常，请稍后重试',
        duration: 3
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
        startId: this.data.lastId
      },
    })
      .then(res => {
        let list = res.result.data
        if (list.length <= 0) {
          this.setData({ noMore: true })
          return;
        }
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
          duration: 3
        })
      })
  },
  checkAuth: function (e) {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          this.setData({
            coverView: true
          })
        }
      },
      fail(res) {
        wx.showToast({
          title: '系统异常，请稍后重试',
          duration: 3
        })
      }
    })
  }
})

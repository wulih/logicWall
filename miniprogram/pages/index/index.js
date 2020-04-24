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
    this.checkAuth()
    this.setUser()
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
            username: e.detail.userInfo.nickName
          },
    })
    .then(res => {
      this.setData({ coverView: false })
    })
    .catch(res => {
      console.log(res)
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
        startId: this.data.lastId,
        openId: getApp().globalData.openId
      },
    })
      .then(res => {
        let list = res.result.list
        if (!list || list.length <= 0) {
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
        console.log(res)
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
        console.log(res)
        wx.showToast({
          title: '系统异常，请稍后重试',
          duration: 3
        })
      }
    })
  },

  setUser: function(e) {
    if (getApp().globalData.openId) {
        return;
    }
    wx.cloud.callFunction({
      name: 'user'
    })
      .then(res => {
        if (res.result.data && res.result.data.length > 0){
          getApp().globalData.openId = res.result.data[0].openid
          
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

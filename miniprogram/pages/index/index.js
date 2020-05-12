const app = getApp()

Page({
  data: {
    questionList: null,
    lastId: 0,
    noMore: false
  },
  onLoad: function () {
    
  },
  onShow: function () {
    this.setData({ 
      questionList: null,
      lastId: 0,
      noMore: false
     });
    this.getList()
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
          getApp().globalData.login = res.result.login
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
  onShareAppMessage: function (res) {
    return {
      title: '逻辑闯关逻辑题',
      path: '/pages/index/index'
    }
  }
})

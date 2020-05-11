//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'wulihua-develop-il4dj',
        traceUser: true
      })
    }
    var openId = wx.getStorageSync('user_openid')
    this.globalData = {
      openId:  openId ? openId : '',
      login: false
    }
  },
  setGlobalData: function (data) {
    if (this.globalData.openId) {
      return;
    }

    if ('openid' in data && data.openid) {
      this.globalData.openId = data.openid
      wx.setStorageSync('user_openid', data.openid)
      return;
    }

    var openId = wx.getStorageSync('user_openid')
    if (openId) {
      this.globalData.openId = openId
    }
  }
})

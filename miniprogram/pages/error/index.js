// miniprogram/pages/error/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questionList: null,
    lastId: 0,
    loading: false,
    noMore: false,
    error: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.setData({
      questionList: null,
      lastId: 0,
      loading: false,
      noMore: false
    });
    this.getList()
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
  onReachBottom: function (e) {
    if (this.data.noMore) {
      return;
    }
    this.getList()
  },
  getList: function () {
    wx.cloud.callFunction({
      name: 'error',
      data: {
        startId: this.data.lastId,
        openId: getApp().globalData.openId
      },
    })
      .then(res => {
        if (res.result == null) { 
          this.setData({ noMore: true })
          return;
        }
        if ('errCode' in res.result && res.result.errCode != 200) {
          this.setData({
            error: res.result.errMsg
          })

          return;
        }
        
        let list = res.result.list
        
        this.setData({ lastId: res.result.list[res.result.list.length - 1]._id })
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
  onShareAppMessage: function (res) {
    return {
      title: '逻辑闯关错题集',
      path: '/pages/error/index'
    }
  }
})
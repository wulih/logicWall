// 云函数入口文件
cloud = require('wx-server-sdk')

cloud.init()

var userModel = require('../modelFunc/index.js')

// 云函数入口函数
exports.main = async (event, context) => {
  return new Promise(function (resolve, reject) {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID || OPENID == undefined) {
      return resolve(null)
    }
    return resolve(userModel.user(OPENID))
  })
}
// 云函数入口文件
cloud = require('wx-server-sdk')
cloud.init()

var model = require('../modelFunc/index.js')
var response = require('../common/index.js')

// 云函数入口函数
exports.main = async (event, context) => {
  return new Promise(function (resolve, reject) {
    var startId = event.startId
    var { OPENID } = event.openId ? { OPENID: event.openId } : cloud.getWXContext()
    if (!OPENID || OPENID == undefined) {
      return resolve(response.responseFail("用户尚未登录"))
    }
    const user = model.user(OPENID)
    const record = model.userSuccessRecord(user, startId)
    const subject = model.subjectListBySuccessRecord(record)
    resolve(subject)
  })
}
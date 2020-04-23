// 云函数入口文件
cloud = require('wx-server-sdk')
cloud.init()

var userModel = require('../models/user.js')
var recordModel = require('../models/record.js')
var subjectModel = require('../models/subject.js')
var date = require('../common/date.js')
var response = require('../common/response.js')

// 云函数入口函数
exports.main = async (event, context) => {
  return new Promise(function (resolve, reject) {
    var startId = parseInt(event.startId)
    var { OPENID } = event.openId ? { OPENID: event.openId } : cloud.getWXContext()
    if (!OPENID || OPENID == undefined) {
      return resolve(response.responseFail("用户尚未登录"))
    }
    const user = userModel.user(OPENID)
    const record = recordModel.userRecord(user)
    const subject = subjectModel.subjectList(startId, record)
    return resolve(subject)
    })
}
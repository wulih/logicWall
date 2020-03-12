// 云函数入口文件
cloud = require('wx-server-sdk')
cloud.init()

var userModel = require('../models/user.js')
var recordModel = require('../models/record.js')
var subjectModel = require('../models/subject.js')
var date = require('../common/date.js')

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(date.curTime())
  return new Promise(function (resolve, reject) {
    var startId = parseInt(event.startId)
    const { OPENID } = cloud.getWXContext()
    const user = userModel.user(OPENID)
    const record = recordModel.userRecord(user)
    const subject = subjectModel.subjectList(startId, record)
    return resolve(subject)
    })
}
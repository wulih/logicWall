// 云函数入口文件
cloud = require('wx-server-sdk')
cloud.init()

var userModel = require('../models/user.js')
var recordModel = require('../models/record.js')
var subjectModel = require('../models/subject.js')
var response = require('../common/response.js')

// 云函数入口函数
exports.main = async (event, context) => {
  return new Promise(function (resolve, reject) {
    var { OPENID } = event.openId ? { OPENID: event.openId} : cloud.getWXContext()

    if (!OPENID || OPENID == undefined) {
      return resolve(response.responseFail("用户尚未登录"))
    }
    const user = userModel.user(OPENID)
    if (!event.id || !event.type) {
      return resolve(response.responseFail("参数错误"))
    }
    const subject = subjectModel.getModelById(event.id, {answer: 1, analysis: 1})
    subject.then(res => {
      if (res.list.length <= 0) {
        return resolve(response.responseFail('题目不存在'))
      }

      if (res.list[0].answer !== event.userValue) {
        recordModel.updateRecord(user, '', res.list[0]._id)
        return resolve(response.responseFail('回答错误', 20001, { analysis: res.list[0].analysis}))
      }
      
      result = recordModel.updateRecord(user, res.list[0]._id, '')
      result.then(res => {
        var subject
        if (event.type == 'error') {
          subject = errorNextSubject(user, event.id)
        } else if (event.type=='success') {
          subject = successNextSubject(user, event.id)
        } else {
          subject = nextSubject(user, event.id)
        }
        
        return resolve(subject) 
      })
    })
  })
}

function nextSubject(user, id)
{
  var record = recordModel.userRecord(user)
  return subjectModel.subjectList(event.id, record, 1, { question: 1, option: 1 })
}

function errorNextSubject(user, id)
{
    var record = recordModel.errorLast(user, id);
    return subjectModel.subjectListByRecordNext(record)
}

function successNextSubject(user, id) {
  var record = recordModel.successLast(user, id);
  return subjectModel.subjectListByRecordNext(record)
}
// 云函数入口文件
cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    var { OPENID } = 'openId' in event && event.openId ? { OPENID: event.openId } : cloud.getWXContext()
    if (!OPENID || OPENID == undefined) {
      return responseFail("系统异常")
    }

    if (!event.id || !event.type) {
      return responseFail("参数错误")
    }

    const subject = await callFunctionUrl({
      url:'getModelById',
      id: event.id,
      select:{answer: 1, analysis: 1}
    })
   
    if (subject.result.list.length <= 0) {
      return responseFail('题目不存在')
    }

    const user = await callFunctionUrl({
      url: 'user',
      openId: OPENID
    })

    if (user.result.data.length <= 0) {
      return responseFail('请先授权', 401)
    }

    var curTimeResult = await getCurTime()
    const userId = user.result.data[0]._id
    const subjectId = subject.result.list[0]._id
    if (subject.result.list[0].answer !== event.userValue) {
        await callFunctionUrl({
          url:'updateRecord',
          userId: userId,
          successId: '',
          failId: subjectId,
          curTime: curTimeResult.result
        })
        return responseFail('回答错误', 20001, { analysis: subject.result.list[0].analysis})
    }
      
     await callFunctionUrl({
        url:'updateRecord',
        userId: userId,
        successId: subjectId,
        failId: '',
        curTime: curTimeResult.result
      })
     
      var result
      if (event.type == 'error') {
          result = await errorNextSubject(userId, event.id)
      } else if (event.type=='success') {
          result = await successNextSubject(userId, event.id)
      } else {
          result = await nextSubject(userId, event.id)
      }
      
      return result.result
}

async function nextSubject(userId, id)
{
  var record = await callFunctionUrl({
    url:'userRecord',
    userId: userId
  })
  
  return callFunctionUrl({
    url:'subjectList',
    startId: id,
    exceptRecord: record.result.data.length > 0 ? record.result.data[0] : null,
    size:1,
    field:{ question: 1, option: 1 }
  })
}

async function errorNextSubject(userId, id)
{
  var record = await callFunctionUrl({
    url:'errorLast',
    userId: userId,
    id: id
  })
  return callFunctionUrl({
    url:'subjectListByRecordNext',
    record: record.result.list.length > 0 ? record.result.list[0] : null
  })
}

async function successNextSubject(userId, id) {
  var record = await callFunctionUrl({
    url:'successLast',
    userId: userId,
    id:id
  })

  return callFunctionUrl({
    url:'subjectListByRecordNext',
    record: record.result.list.length > 0 ? record.result.list[0] : null
  })
}

function responseFail(message, code = 1, data = null) {
  var result = {
    errCode: code,
    errMsg: message
  }

  if (data) {
    result.data = data
  }

  return result
}

function callFunctionUrl(data)
{
  return cloud.callFunction({
    // 要调用的云函数名称
    name: 'modelFunc',
    // 传递给云函数的参数
    data: data
  })
}

function getCurTime()
{
  return cloud.callFunction({
    // 要调用的云函数名称
    name: 'common',
    // 传递给云函数的参数
    data: {
        'url': 'curTime'
    }
  })
}
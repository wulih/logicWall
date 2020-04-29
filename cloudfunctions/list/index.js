// 云函数入口文件
cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    var startId = parseInt(event.startId)
    var { OPENID } = 'openId' in event && event.openId ? { OPENID: event.openId } : cloud.getWXContext()
    
    if (!OPENID || OPENID == undefined) {
      return responseFail("服务器异常")
    }

    const user = await callFunctionUrl({
      url: 'user',
      openId: OPENID
    })
    
    var record = null
    if (user.result.data.length > 0) {
      record = await callFunctionUrl({
        url: 'userRecord',
        userId: user.result.data[0]._id
      })
    }
    
    const subject = await callFunctionUrl({
      url: 'subjectList',
      startId: startId,
      exceptRecord: record != null && record.result.data.length > 0 ? record.result.data[0] : null
    })
    return {openid:OPENID, subject:subject.result.list, login: user.result.data.length > 0}
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
// 云函数入口文件
cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    var startId = event.startId
    var { OPENID } = 'openId' in event && event.openId ? { OPENID: event.openId } : cloud.getWXContext()
    if (!OPENID || OPENID == undefined) {
      return responseFail("系统异常")
    }
    const user = await callFunctionUrl({
      url:'user',
      openId: OPENID
    })

    if (user.result.data.length <= 0) {
      return responseFail('请先登录')
    }

    const record = await callFunctionUrl({
      url:'userErrorRecord',
      userId: user.result.data[0]._id,
      startId:startId
    })
    
    const subject = await callFunctionUrl({
      url:'subjectListByFailRecord',
      record: record.result.list.length > 0 ? record.result.list[0].answer_fail : null
    })
    return subject.result
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
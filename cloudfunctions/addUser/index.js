// 云函数入口文件
const cloud  = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var { OPENID } = 'openId' in event && event.openId ? { OPENID: event.openId } : cloud.getWXContext()
    
  if (!OPENID || OPENID == undefined) {
    return responseFail("服务器异常")
  }
  const username   = event.username  
  const curTimeResult = await cloud.callFunction({
    // 要调用的云函数名称
    name: 'common',
    // 传递给云函数的参数
    data: {
        url: 'curTime'
    }
  })

  const curTime = curTimeResult.result
  const user = await callFunctionUrl({
    url: 'user',
    openId: OPENID
  })

  var isRegist = user.result.data.length > 0 
  if (isRegist && user.result.data[0].username != username) {
      await callFunctionUrl({
        url: 'updateUser',
        userId: user.result.data[0]._id,
        username: username
      })
  }

  if (!isRegist) {
     var result = await callFunctionUrl({
       url: 'addUser',
       openId: OPENID, 
       username: username, 
       curTime: curTime
     })
    
     isRegist = result.result && '_id ' in result.result ? true : false
  }
  return {openid:OPENID, isRegist: isRegist}
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
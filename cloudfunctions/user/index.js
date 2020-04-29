// 云函数入口文件
cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var { OPENID } = 'openId' in event && event.openId ? { OPENID: event.openId } : cloud.getWXContext()
  if (!OPENID || OPENID == undefined) {
    return responseFail("用户尚未登录")
  }
  const user = await callFunctionUrl({
    url: 'user',
    openId: OPENID
  })

  return user.result
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
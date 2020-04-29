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
  db.collection('user').where({
    openid: OPENID
  }).limit(1).get().then(res => {
     if (res.data.length == 0) {
       db.collection('user').add({
         data: {
           openid: OPENID,
           username: username,
           create_at: curTime,
           update_at: curTime
         }
       })
       return {openid:OPENID}
     }

    const user = res.data[0]
    if (user.username != username) {
      db.collection('user').doc(user._id).update({
        data: {
          username: username
        }
      })
    }
  })
 
  return {openid:OPENID}
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
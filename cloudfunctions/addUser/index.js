// 云函数入口文件
var date = require('../common/date.js')

const cloud  = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const username   = event.username  
  
  db.collection('user').where({
    openid: OPENID
  }).limit(1).get().then(res => {
    const curTime = date.curTime()
     if (res.data.length == 0) {
       db.collection('user').add({
         data: {
           openid: OPENID,
           username: username,
           create_at: curTime,
           update_at: curTime
         }
       })
       return {}
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
 
  return {}
}
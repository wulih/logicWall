const db = cloud.database()

function user(openId) 
{
  return new Promise(function (resolve, reject) {
    return resolve(db.collection('user').where({
      openid: openId
    }).limit(1).get())
  })
      
}

exports.user = user
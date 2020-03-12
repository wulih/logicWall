const db = cloud.database()

function userRecord(user) {
  return new Promise(function(resolve, reject){
    user.then(res => {
      if (res.data.length > 0) {
        return resolve(db.collection('record').where({
          user_id: res.data[0]._id
        }).limit(1).get())
      } else {
        return resolve(null)
      }
    })
  })
}

exports.userRecord = userRecord
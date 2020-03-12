const db = cloud.database()
const _ = db.command

function subjectList(startId, exceptRecord = null, size = 10) {
  return new Promise(function(resolve, reject){
    if (exceptRecord === null) {
      return resolve(this.getListByStartId(startId, size))
    }
    exceptRecord.then(res => {
      if (res.data.length > 0) {
        return resolve(getListByExceptIds(res.data[0].answer_success, startId, size))
      }
      return resolve(getListByStartId(startId, size))
    })
  })
}

function getListByStartId(startId, size)
{
  if (startId > 0) {
    return db.collection('subject').where({
    position: _.lt(startId)
  })
    .orderBy('position', 'desc')
    .limit(size)
    .get()
  }

  return db.collection('subject')
    .orderBy('position', 'desc')
    .limit(size)
    .get()
}

function getListByExceptIds(exceptIds, startId, size) {
  if (startId > 0) {
    return db.collection('subject').where({
      _id: _.nin(exceptIds),
      position: _.lt(startId)
    })
      .orderBy('position', 'desc')
      .limit(size)
      .get()
  }
  return db.collection('subject').where({
    _id: _.nin(exceptIds)
  })
    .orderBy('position', 'desc')
    .limit(size)
    .get()
}

exports.subjectList = subjectList
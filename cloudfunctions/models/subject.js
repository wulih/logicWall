const db = cloud.database()
const _ = db.command

function subjectList(startId, exceptRecord = null, size = 15, field = {question: 1}) {
  return new Promise(function(resolve, reject){
    if (exceptRecord === null) {
      return resolve(this.getListByStartId(startId, size, field))
    }
    exceptRecord.then(res => {
      if (res.data.length > 0) {
        return resolve(getListByExceptIds(res.data[0].answer_success, startId, size, field))
      }
      return resolve(getListByStartId(startId, size, field))
    })
  })
}

function getListByStartId(startId, size, field)
{
  if (startId > 0) {
    return db.collection('subject').aggregate()
    .match({
    position: _.lt(startId)
  })
    .sort({position: -1})
    .limit(size)
    .project(field).end()
  }

  return db.collection('subject').aggregate()
    .sort({ position: -1 })
    .limit(size)
    .project(field).end()
}

function getListByExceptIds(exceptIds, startId, size, field) {
  if (startId > 0) {
    return db.collection('subject').aggregate()
    .match({
      _id: _.nin(exceptIds),
      position: _.lt(startId)
    })
      .sort({ position: -1 })
      .limit(size)
      .project(field).end()
  }
  return db.collection('subject').aggregate()
  .match({
    _id: _.nin(exceptIds)
  })
    .sort({ position: -1 })
    .limit(size)
    .project(field).end()
}

function getModelById(id, select) {
  return db.collection('subject').aggregate()
  .match({
    _id: id
  })
  .project(select)
  .limit(1)
  .end()
}

function subjectListByFailRecord(record, field = { question: 1 }) {
  return new Promise(function (resolve, reject) {
    if (record === null) {
      return resolve(null)
    }
    record.then(res => {
      if (res.list.length > 0 && res.list[0].answer_fail.length > 0) {
        var answerFail = res.list[0].answer_fail
        return resolve(getListByIds(answerFail, field))
      }

      return resolve(null)
    })
  })
}

function subjectListBySuccessRecord(record, field = { question: 1 }) {
  return new Promise(function (resolve, reject) {
    if (record === null) {
      return resolve(null)
    }
    record.then(res => {
      if (res.list.length > 0 && res.list[0].answer_success.length > 0) {
        var answerSuccess = res.list[0].answer_success
        return resolve(getListByIds(answerSuccess, field))
      }

      return resolve(null)
    })
  })
}

function findValue(id, listObject) {
  for (var i = 0; i < listObject.length; i++) {
    if (listObject[i]._id == id) {
      return listObject[i]
    }
  }
}

function getListByIds(ids, field)
{
  return new Promise(function (resolve, reject) {
        db.collection('subject').aggregate()
    .match({
      _id: _.in(ids)
    })
    .project(field).end().then(
      res => {
        if (res.list.length <= 0) {
          return resolve(null)
        }
        var data = [];
        for (var i = 0; i < ids.length; i++) {
          data.push(findValue(ids[i], res.list))
        }
        return resolve({'list':data})
      })
  })
}

function subjectListByRecordNext(record, field = { question: 1, option: 1 }) {
  return new Promise(function (resolve, reject) {
    if (record === null) {
      return resolve(null)
    }
    record.then(res => {
      if (res.list.length > 0 && res.list[0].nextId) {
        return resolve(db.collection('subject').aggregate()
          .match({
            _id: res.list[0].nextId
          })
          .project(field).end())
      }
      return resolve(null)
    })
  })
}

exports.subjectList = subjectList
exports.getModelById = getModelById
exports.subjectListByFailRecord = subjectListByFailRecord
exports.subjectListBySuccessRecord = subjectListBySuccessRecord
exports.subjectListByRecordNext = subjectListByRecordNext
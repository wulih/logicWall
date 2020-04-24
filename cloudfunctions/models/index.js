cloud = require('wx-server-sdk')

cloud.init()

var date = require('../common/index.js')
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

function userRecord(user) {
  return new Promise(function (resolve, reject) {
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

function updateRecord(user, successId = '', failId = '') {
  return new Promise(function (resolve, reject) {
    user.then(res => {
      const userId = res.data[0]._id
      var record = userRecord(user)
      if (record === null) {
        return resolve(addRecord(userId, successId, failId));
      }

      if (successId) {
        return resolve(updateSuccessRecord(userId, record, successId))
      }

      if (failId) {
        return resolve(updateFailRecord(userId, record, failId))
      }
    })
  })
}

function updateSuccessRecord(userId, record, successId) {
  return new Promise(function (resolve, reject) {
    record.then(res => {
      if (res.data.length <= 0) {
        return resolve(addRecord(userId, successId, ''));
      }

      if (res.data[0].answer_success.indexOf(successId) < 0) {
        return resolve(db.collection('record').doc(res.data[0]._id).update({
          data: {
            answer_success: _.push([successId]),
            update_at: date.curTime()
          }
        }))
      }
      return resolve(null)
    })
  })
}

function updateFailRecord(userId, record, failId) {
  return new Promise(function (resolve, reject) {
    record.then(res => {
      if (res.data.length <= 0) {
        return resolve(addRecord(userId, '', failId));
      }
      if (res.data[0].answer_fail.indexOf(failId) < 0) {
        return resolve(db.collection('record').doc(res.data[0]._id).update({
          data: {
            answer_fail: _.push([failId]),
            update_at: date.curTime()
          }
        }))
      }
      return resolve(null)
    })
  })
}

function addRecord(userId, successId = '', failId = '') {
  const curTime = date.curTime()
  return new Promise(function (resolve, reject) {
    resolve(db.collection('record').add({
      data: {
        user_id: userId,
        answer_success: successId ? [successId] : [],
        answer_fail: failId ? [failId] : [],
        create_at: curTime,
        update_at: curTime
      }
    }))
  })
}

function userErrorRecord(user, startId = '', limit = 15) {
  return new Promise(function (resolve, reject) {
    user.then(res => {
      if (res.data.length > 0) {
        return resolve(getModelByUserId(res.data[0]._id, startId, limit))
      } else {
        return resolve(null)
      }
    })
  })
}

function getModelByUserId(userId, startId = '', limit = 15) {
  if (!startId) {
    return db.collection('record').aggregate()
      .match({
        user_id: userId
      })
      .project({
        answer_fail: $.slice(['$answer_fail', 0, limit])
      })
      .end()
  }

  return db.collection('record').aggregate()
    .match({
      user_id: userId
    })
    .project({
      answer_fail: $.slice(['$answer_fail', $.add([$.indexOfArray(['$answer_fail', startId]), 1]), limit])
    })
    .end()
}

function errorLast(user, id) {
  return new Promise(function (resolve, reject) {
    user.then(res => {
      if (res.data.length > 0) {
        return resolve(findErrorLast(res.data[0]._id, id))
      } else {
        return resolve(null)
      }
    })
  })
}

function findErrorLast(userId, startId) {
  return db.collection('record').aggregate()
    .match({
      user_id: userId
    })
    .project({
      nextId: $.arrayElemAt(['$answer_fail', $.add([$.indexOfArray(['$answer_fail', startId]), 1])])
    })
    .end()
}

function getLastId(record) {
  return new Promise(function (resolve, reject) {
    if (record === null) {
      return resolve(null)
    }
    record.then(res => {
      if (res.list.length > 0 && res.list[0].answer_fail.length > 0) {
        return resolve({ lastId: res.list[0].answer_fail[res.list[0].answer_fail.length - 1] })
      }
      return resolve(null)
    })
  })
}

function userSuccessRecord(user, startId = '', limit = 15) {
  return new Promise(function (resolve, reject) {
    user.then(res => {
      if (res.data.length > 0) {
        return resolve(getSuccessByUserId(res.data[0]._id, startId, limit))
      } else {
        return resolve(null)
      }
    })
  })
}

function getSuccessByUserId(userId, startId = '', limit = 15) {
  if (!startId) {
    return db.collection('record').aggregate()
      .match({
        user_id: userId
      })
      .project({
        answer_success: $.slice(['$answer_success', 0, limit])
      })
      .end()
  }

  return db.collection('record').aggregate()
    .match({
      user_id: userId
    })
    .project({
      answer_success: $.slice(['$answer_success', $.add([$.indexOfArray(['$answer_success', startId]), 1]), limit])
    })
    .end()
}

function successLast(user, id) {
  return new Promise(function (resolve, reject) {
    user.then(res => {
      if (res.data.length > 0) {
        return resolve(findSuccessLast(res.data[0]._id, id))
      } else {
        return resolve(null)
      }
    })
  })
}

function findSuccessLast(userId, startId) {
  return db.collection('record').aggregate()
    .match({
      user_id: userId
    })
    .project({
      nextId: $.arrayElemAt(['$answer_success', $.add([$.indexOfArray(['$answer_success', startId]), 1])])
    })
    .end()
}

function getRank() {
  return db.collection('record').aggregate()
    .project({
      totalCnt: $.size('$answer_success')
    })
    .sort({
      totalCnt: -1
    })
    .limit(10)
    .end()
}


function subjectList(startId, exceptRecord = null, size = 15, field = { question: 1 }) {
  return new Promise(function (resolve, reject) {
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

function getListByStartId(startId, size, field) {
  if (startId > 0) {
    return db.collection('subject').aggregate()
      .match({
        position: _.lt(startId)
      })
      .sort({ position: -1 })
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

function getListByIds(ids, field) {
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
          return resolve({ 'list': data })
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

function user(openId) {
  return new Promise(function (resolve, reject) {
    return resolve(db.collection('user').where({
      openid: openId
    }).limit(1).get())
  })

}

exports.user = user

exports.subjectList = subjectList
exports.getModelById = getModelById
exports.subjectListByFailRecord = subjectListByFailRecord
exports.subjectListBySuccessRecord = subjectListBySuccessRecord
exports.subjectListByRecordNext = subjectListByRecordNext

exports.userRecord = userRecord
exports.updateRecord = updateRecord
exports.userErrorRecord = userErrorRecord
exports.errorLast = errorLast
exports.getLastId = getLastId
exports.userSuccessRecord = userSuccessRecord
exports.successLast = successLast
exports.getRank = getRank

// 云函数入口函数
exports.main = async (event, context) => {
}
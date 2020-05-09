// 云函数入口文件
cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  var data
  switch(event.url) {
    case 'user':
      data = user(event.openId)
      break;
    case 'updateUser':
      data = updateUser(event.userId, event.username)
      break;
    case 'addUser':
      data = addUser(event.openId, event.username, event.curTime)
      break;
    case 'subjectList':
      data = subjectList(event.startId, 'exceptRecord' in event ? event.exceptRecord : null, 'size' in event ? event.size : 15, 'field' in event ? event.field : {question:1, position: 1})
      break;
    case 'getModelById':
      data = getModelById(event.id, event.select)
      break;
    case 'subjectListByFailRecord':
      data = subjectListByFailRecord(event.record, 'field' in event ? event.field : {question:1})
      break;
    case 'subjectListBySuccessRecord':
      data = subjectListBySuccessRecord(event.record, 'field' in event ? event.field : {question:1})
      break;
    case 'subjectListByRecordNext':
      data = subjectListByRecordNext(event.record, 'field' in event ? event.field : field = { question: 1, option: 1 })
      break;
    case 'userRecord':
      data= userRecord(event.userId)
      break;
    case 'updateRecord':
      data=updateRecord(event.userId, 'successId' in event ? event.successId : '', 'failId' in event ? event.failId : '', 'curTime' in event ? event.curTime : '')
      break;
    case 'userErrorRecord':
      data = getModelByUserId(event.userId, 'startId' in event ? event.startId : '', 'limit' in event ? event.limit : 15)
      break;
    case 'errorLast':
      data = findErrorLast(event.userId, event.id)
      break;
    case 'userSuccessRecord':
      data = getSuccessByUserId(event.userId, 'startId' in event ? event.startId : '', 'limit' in event ? event.limit : 15)
      break;
    case 'successLast':
      data=findSuccessLast(event.userId, event.id)
      break;
    case 'getRank':
      data = getRank()
      break;
  }
  return data
}

function addUser(openId, username, curTime)
{
  return db.collection('user').add({
    data: {
      openid: openId,
      username: username,
      create_at: curTime,
      update_at: curTime
    }
  })
}

function userRecord(userId) {
   return db.collection('record').where({
          user_id: userId
        }).limit(1).get()
}

function updateRecord(userId, successId = '', failId = '', curTime = '') {
      var record = userRecord(userId)
      if (record === null) {
        return addRecord(userId, successId, failId, curTime);
      }

      if (successId) {
        return updateSuccessRecord(userId, record, successId, curTime)
      }

      if (failId) {
        return updateFailRecord(userId, record, failId, curTime)
      }
}

function updateUser(userId, username) {
  return db.collection('user').doc(userId).update({
    data: {
      username: username
    }
  })
}

function updateSuccessRecord(userId, record, successId, curTime) {
  return new Promise(function (resolve, reject) {
    record.then(res => {
      if (res.data.length <= 0) {
        return resolve(addRecord(userId, successId, ''));
      }

      if (res.data[0].answer_success.indexOf(successId) < 0) {
        return resolve(db.collection('record').doc(res.data[0]._id).update({
          data: {
            answer_success: _.push([successId]),
            update_at: curTime
          }
        }))
      }
      return resolve(null)
    })
  })
}

function updateFailRecord(userId, record, failId, curTime) {
  return new Promise(function (resolve, reject) {
    record.then(res => {
      if (res.data.length <= 0) {
        return resolve(addRecord(userId, '', failId, curTime));
      }
      if (res.data[0].answer_fail.indexOf(failId) < 0) {
        
        return resolve(db.collection('record').doc(res.data[0]._id).update({
          data: {
            answer_fail: _.push([failId]),
            update_at: curTime
          }
        }))
      }
      return resolve(null)
    })
  })
}

function addRecord(userId, successId = '', failId = '', curTime = '') {
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


function subjectList(startId, exceptRecord = null, size = 15, field = { question: 1, position: 1 }) {
    if (exceptRecord === null) {
      return getListByStartId(startId, size, field)
    }

    return getListByExceptIds(exceptRecord.answer_success, startId, size, field)
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
   if (record === null) {
      return null
    }
   
    return getListByIds(record, field)
}

function subjectListBySuccessRecord(record, field = { question: 1 }) {
    if (record === null) {
      return null
    }
    
    return getListByIds(record, field)
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
    if (record === null || !record.hasOwnProperty('nextId')) {
      return null
    }
 
    return db.collection('subject').aggregate()
      .match({
            _id: record['nextId']
          })
    .project(field).end()
      
}

function user(openId) {
    return db.collection('user').where({
      openid: openId
    }).limit(1).get()
}
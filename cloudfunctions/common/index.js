// 云函数入口文件
cloud = require('wx-server-sdk')

cloud.init()

exports.curTime = curTime
exports.main = async (event, context) => {
  var data
  switch(event.url) {
    case 'responseSuccess':
      data = responseSuccess(event.data)
      break;
    case 'curTime':
      data = curTime()
      break;
  }

  return data
}

function curTime() {
  var dateObj = new Date();
  var diff = dateObj.getTimezoneOffset();
  var bjTime = dateObj.getTime() + diff * 60 * 1000 - (-28800000)
  dateObj.setTime(bjTime)
  var year = dateObj.getFullYear();
  var month = dateObj.getMonth() + 1;
  var date = dateObj.getDate();
 // var day = dateObj.getDay();
  var hour = dateObj.getHours();
  var minute = dateObj.getMinutes();
  var second = dateObj.getSeconds();
  //如果月、日、小时、分、秒的值小于10，在前面补0
  if (month < 10) {
    month = "0" + month;
  }
  if (date < 10) {
    date = "0" + date;
  }
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  if (second < 10) {
    second = "0" + second;
  }
  return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}

function responseSuccess(data) {
  return {
    errCode: 200,
    errMsg: 'success',
    data: data
  }
}
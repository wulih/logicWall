// 云函数入口文件
cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {
}

function curTime() {
  var dateObj = new Date();
  var year = dateObj.getFullYear();
  var month = dateObj.getMonth() + 1;
  var date = dateObj.getDate();
  var day = dateObj.getDay();
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


exports.responseFail = responseFail
exports.responseSuccess = responseSuccess

exports.curTime = curTime
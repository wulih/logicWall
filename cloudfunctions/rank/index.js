// 云函数入口文件
cloud = require('wx-server-sdk')
cloud.init()

var recordModel = require('../models/index.js')

// 云函数入口函数
exports.main = async (event, context) => {
  return new Promise(function (resolve, reject) {
    const record = recordModel.getRank()
    return resolve(record)
  })
}
// 云函数入口文件
cloud = require('wx-server-sdk')

cloud.init()

var subjectModel = require('../modelFunc/index.js')

// 云函数入口函数
exports.main = async (event, context) => {
  const id = event.id;
  if (!id) {
    throw "参数错误"
  }

  return subjectModel.getModelById(id, {question: 1, option: 1})
}
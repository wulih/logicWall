// 云函数入口文件
cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const id = event.id;
  if (!id) {
    throw "参数错误"
  }

  const result = await callFunctionUrl({
    url:'getModelById', 
    id: id, 
    select:'analysis' in event ? {question: 1, option: 1, analysis: 1} : {question: 1, option: 1}
  })

  return result.result
}

function callFunctionUrl(data)
{
  return cloud.callFunction({
    // 要调用的云函数名称
    name: 'modelFunc',
    // 传递给云函数的参数
    data: data
  })
}
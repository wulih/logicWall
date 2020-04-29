// 云函数入口文件
cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  
    const record = await callFunctionUrl({
      url: 'getRank'
    })
    return record.result
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
function responseSuccess(data)
{
  return {
    errCode: 200,
    errMsg: 'success',
    data: data
  }
}

function responseFail(message, code = 1, data = null)
{
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
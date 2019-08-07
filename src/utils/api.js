import wepy from 'wepy'

// 服务器接口地址
// const host = __BASE_URL__
const host = __BASE_URL__

// 普通请求
const request = async (options, showLoading = true) => {
  let finalOptions = JSON.parse(JSON.stringify(options)) // 深复制

    // 简化开发，如果传入字符串则转换成 对象
  if (typeof finalOptions === 'string') {
    finalOptions = {
      url: finalOptions
    }
  }
    // 显示加载中
  if (showLoading) {
    wepy.showLoading({title: '加载中', mask: true})
  }
    // 拼接请求地址
  finalOptions.url = host + '/' + finalOptions.url
    // 调用小程序的 request 方法
  let response = await wepy.request(finalOptions)

  if (showLoading) {
        // 隐藏加载中
    wepy.hideLoading()
  }

    // 服务器异常后给与提示
  if (response.statusCode === 500) {
    wepy.showModal({
      title: '提示',
      content: '服务器错误，请联系管理员或重试'
    })
  }
  return response
}

// 登录
const login = async (params = {}) => {
  wepy.showLoading({title: '加载中'})
  // code 只能使用一次，所以每次单独调用
  let loginData = await wepy.login()

  // 参数中增加code
  params.code = loginData.code

  let settingData = await wepy.getSetting()

  wepy.hideLoading()

  console.log('setting data')
  console.log(settingData)
  if (!settingData.authSetting['scope.userInfo']) {
    console.log('用户没有授权')
    console.log(settingData.authSetting['scope.userInfo'])
    wepy.navigateTo({
      url: '/pages/auth/login'
    })
    return false
  } else {
    console.log('用户已授权')
    console.log(settingData.authSetting['scope.userInfo'])

    let userInfoData = await wepy.getUserInfo()
    console.log(userInfoData)
    let userInfo = userInfoData.userInfo
    params.name = userInfo.nickName
    params.avatar_url = userInfo.avatarUrl
    params.gender = userInfo.gender
    params.country = userInfo.country
    params.city = userInfo.city
    params.province = userInfo.province
  }

    // 接口请求 weapp/authorizations
  let authResponse = await request({
    url: 'weapp/authorizations',
    data: params,
    method: 'POST'
  })

    // 登录成功，记录 token 信息
  if (authResponse.statusCode === 201) {
    wepy.setStorageSync('access_token', authResponse.data.access_token)
    wepy.setStorageSync('access_token_expired_at', new Date().getTime() + authResponse.data.expires_in * 1000)

    let response = await authRequest({
      url: 'user'
    })
    if (response.statusCode === 200) {
      wepy.setStorageSync('user', response.data)
    }
  }
  return authResponse
}

// 刷新 Token
const refreshToken = async (accessToken) => {
    // 请求刷新接口
  let refreshResponse = await wepy.request({
    url: host + '/' + 'authorizations/current',
    method: 'PUT',
    header: {
      'Authorization': 'Bearer ' + accessToken
    }
  })

    // 刷新成功状态码为 200
  if (refreshResponse.statusCode === 200) {
        // 将 Token 及过期时间保存在 storage 中
    wepy.setStorageSync('access_token', refreshResponse.data.access_token)
    wepy.setStorageSync('access_token_expired_at', new Date().getTime() + refreshResponse.data.expires_in * 1000)
  }

  return refreshResponse
}

// 获取 Token
const getToken = async (options) => {
    // 从缓存中取出 Token
  let accessToken = wepy.getStorageSync('access_token')
  let expiredAt = wepy.getStorageSync('access_token_expired_at')

    // 如果 token 过期了，则调用刷新方法
  if (accessToken && new Date().getTime() > expiredAt) {
    let refreshResponse = await refreshToken(accessToken)

        // 刷新成功
    if (refreshResponse.statusCode === 200) {
      accessToken = refreshResponse.data.access_token
    } else {
            // 刷新失败了，重新调用登录方法，设置 Token
      let authResponse = await login()
      if (authResponse.statusCode === 201) {
        accessToken = authResponse.data.access_token
      }
    }
  }

  return accessToken
}

// 带身份认证的请求
const authRequest = async (options, showLoading = true) => {
  if (typeof options === 'string') {
    options = {
      url: options
    }
  }
    // 获取Token
  let accessToken = await getToken()

    // 将 Token 设置在 header 中
  let header = options.header || {}
  header.Authorization = 'Bearer ' + accessToken
  options.header = header

  let response = await request(options, showLoading)
  console.log(response)
  if (response.statusCode === 401) {
    wepy.clearStorage()
    let loginResponse = await login()
    console.log(loginResponse)
    if (loginResponse.statusCode === 201) {
      response = await authRequest(options, showLoading)
    }
  }
  return response
}

//  退出登录
const logout = async (params = {}) => {
  let accessToken = wepy.getStorageSync('access_token')
    // 调用删除 Token 接口，让 Token 失效
  let logoutResponse = await wepy.request({
    url: host + '/' + 'authorizations/current',
    method: 'DELETE',
    header: {
      'Authorization': 'Bearer ' + accessToken
    }
  })

    // 调用接口成功则清空缓存
  if (logoutResponse.statusCode === 204 || logoutResponse.statusCode === 500) {
    wepy.clearStorage()
  }

  return logoutResponse
}

const uploadFile = async (options = {}) => {
    // 显示loading
  wepy.showLoading({title: '上传中'})

    // 获取 token
  let accessToken = await getToken()

    // 拼接url
  options.url = host + '/' + options.url
  let header = options.header || {}
    // 将 token 设置在 header 中
  header.Authorization = 'Bearer ' + accessToken
  options.header = header

    // 上传文件
  let response = await wepy.uploadFile(options)

    // 隐藏 loading
  wepy.hideLoading()

  return response
}

export default {
  host,
  request,
  authRequest,
  getToken,
  refreshToken,
  login,
  logout,
  uploadFile
}

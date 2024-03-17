/* WxRequest实例化 */

import WxRequest from './request'
import { getStorage, clearStorage } from './storage'
import { toast, modal } from './extendApi'
import { env } from './env'

const instance = new WxRequest({
  baseURL: env.baseURL,
  timeout: 5000
})

instance.interceptors.request = (config) => {
  // 本地是否有token
  const token = getStorage('token')

  if (token) {
    config.header['token'] = token
  }

  return config
}

instance.interceptors.response = async (response) => {
  const { isSuccess, data } = response

  if (!isSuccess) {
    toast({
      title: '网络异常请重试',
      icon: 'error'
    })

    return Promise.reject(response)
  }

  // statusCode === 200，接口调用成功，服务器成功返回了数据
  // statusCode === 208，没有 token 或者 token 失效
  // statusCode is not 200, 208，其他异常
  switch (data.code) {
    case 200:
      return data

    case 208:
      const res = await modal({
        content: '鉴权失败，请重新登录',
        showCancel: false
      })

      if (res) {
        // clear 过期token 以及其他info
        clearStorage()

        wx.navigateTo({
          url: '/pages/login/login'
        })
      }

      return Promise.reject(response)

    default:
      toast({
        title: '程序出现异常，请联系客服或稍后重试！'
      })
      return Promise.reject(response)
  }
}

export default instance

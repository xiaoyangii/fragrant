import { observable, action } from 'mobx-miniprogram'
import { getStorage } from '../utils/storage'

export const userStore = observable({
  // token 身份令牌
  token: getStorage('token') || '',

  // 用户信息
  userInfo: getStorage('userInfo') || {},

  /**
   * @description 用于修改、更新 token
   */
  setToken: action(function (token) {
    this.token = token
  }),

  /**
   * @description 用于修改、更新 userinfo
   */
  setUserInfo: action(function (userInfo) {
    this.userInfo = userInfo
  }),

  /**
   * @description for test
   */
  get satoken() {
    return 'satoken' + this.token
  }
})

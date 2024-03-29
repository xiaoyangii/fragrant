// pages/login/login.js

import { toast } from '@/utils/extendApi'
import { setStorage } from '@/utils/storage'
import { reqLogin, reqUserInfo } from '@/api/user'

import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { userStore } from '@/stores/userstore'

// 导入防抖函数
import { debounce } from 'miniprogram-licia'

ComponentWithStore({
  // 让页面和 Store 对象建立关联
  storeBindings: {
    store: userStore,
    fields: ['token', 'userInfo'],
    actions: ['setToken', 'setUserInfo']
  },

  methods: {
    // 授权登录
    login: debounce(function () {
      // wx.login 获取用户的临时登录凭证 code
      wx.login({
        success: async ({ code }) => {
          if (code) {
            const { data } = await reqLogin(code)

            setStorage('token', data.token)
            this.setToken(data.token)

            this.getUserInfo()

            wx.navigateBack()
          } else {
            toast({ title: '授权失败，请重新授权' })
          }
        }
      })
    }, 500),

    // 获取用户信息
    async getUserInfo() {
      const { data } = await reqUserInfo()

      setStorage('userInfo', data)

      this.setUserInfo(data)
    }
  }
})

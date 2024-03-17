// pages/profile/profile.js

import { userBehavior } from './behavior'
import { getStorage, setStorage } from '../../../../utils/storage'
import { toast } from '../../../../utils/extendApi'
import { reqUploadFile, reqUpdateUserInfo } from '../../../../api/user'

Page({
  behaviors: [userBehavior],

  data: {
    isShowPopup: false // 控制更新用户昵称的弹框显示与否
  },

  // 显示修改昵称弹框
  onUpdateNickName() {
    this.setData({
      isShowPopup: true
    })
  },

  // 弹框取消按钮
  cancelForm() {
    this.setData({
      isShowPopup: false
    })
  }
})

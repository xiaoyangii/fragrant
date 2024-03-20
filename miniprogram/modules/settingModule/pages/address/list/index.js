// pages/address/list/index.js
import { reqAddressList, reqDelAddress } from '../../../api/address'
import { swipeCellBehavior } from '@/behaviors/swipeCell'

Page({
  data: {
    addressList: []
  },
  
  behaviors: [swipeCellBehavior],

  toEdit(event) {
    // 获取要更新的收货地址 id
    const { id } = event.currentTarget.dataset
    wx.navigateTo({
      url: `/modules/settingModule/pages/address/add/index?id=${id}`
    })
  },

  // 删除收货地址
  async delAddress(event) {
    const { id } = event.currentTarget.dataset

    const modalRes = await wx.modal({
      content: '您确认删除该收货地址吗 ?'
    })

    if (modalRes) {
      await reqDelAddress(id)
      wx.toast({ title: '收货地址删除成功' })
      this.getAddressList()
    }
  },

  // 获取收货地址列表数据
  async getAddressList() {
    const { data: addressList } = await reqAddressList()

    this.setData({ addressList })
  },

  onShow() {
    this.getAddressList()
  }
})

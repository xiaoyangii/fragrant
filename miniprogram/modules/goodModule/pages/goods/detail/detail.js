// pages/goods/detail/index.js
import { reqGoodsInfo } from '../../../api/goods'
import { reqAddCart, reqCartList } from '@/api/cart'
import { userBehavior } from '../../../behaviors/userBehavior'

Page({
  behaviors: [userBehavior],

  data: {
    goodsInfo: {}, // 商品详情
    show: false, // 控制加入购物车和立即购买弹框的显示
    count: 1, // 商品购买数量，默认是 1
    blessing: '', // 祝福语
    buyNow: 0, // 控制是加入购物车还是立即购买，0 加入购物车，1 立即购买
    allCount: '' // 购物车数量
  },

  // 加入购物车
  handleAddcart() {
    this.setData({
      show: true,
      buyNow: 0
    })
  },

  // 立即购买
  handeGotoBuy() {
    this.setData({
      show: true,
      buyNow: 1
    })
  },

  // 点击关闭弹框时触发的回调
  onClose() {
    this.setData({ show: false })
  },

  // 监听是否更改了购买数量
  onChangeGoodsCount(event) {
    this.setData({
      count: Number(event.detail)
    })
  },

  // 弹框的确定按钮触发的事件处理函数
  async handlerSubmit() {
    // 解构相关的数据
    const { token, count, blessing, buyNow } = this.data
    // 获取商品的 id
    const goodsId = this.goodsId

    if (!token) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    // 区分处理加入购物车已经立即购买
    if (buyNow === 0) {
      const res = await reqAddCart({ goodsId, count, blessing })

      if (res.code === 200) {
        wx.toast({ title: '加入购物车成功' })

        this.getCartCount()

        this.setData({
          show: false
        })
      }
    } else {
      wx.navigateTo({
        // url: `/modules/orderPayModule/pages/order/detail/detail?goodsId=${goodsId}&blessing=${blessing}`
        url: `/pages/order/detail/detail?goodsId=${goodsId}&blessing=${blessing}`
      })
    }
  },

  // 计算购物车商品的数量
  async getCartCount() {
    if (!this.data.token) return

    const res = await reqCartList()

    if (res.data.length !== 0) {
      let allCount = 0

      res.data.forEach((item) => {
        allCount += item.count
      })

      this.setData({
        allCount: (allCount > 99 ? '99+' : allCount) + ''
      })
    }
  },

  previewImage() {
    wx.previewImage({
      urls: this.data.goodsInfo.detailList
    })
  },

  // 获取商品详情的数据
  async getGoodsInfo() {
    const { data: goodsInfo } = await reqGoodsInfo(this.goodsId)

    this.setData({
      goodsInfo
    })
  },

  onLoad(options) {
    this.goodsId = options.goodsId

    this.getGoodsInfo()

    this.getCartCount()
  }
})

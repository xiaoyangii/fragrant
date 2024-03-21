// pages/order/list/index.js
import { reqOrderList } from '../../../api/orderpay'

Page({
  // 页面的初始数据
  data: {
    orderList: [], // 订单列表
    page: 1, // 页码
    limit: 10, // 每页展示的条数
    total: 0, // 订单列表总条数
    isLoading: false // 判断数据是否记载完毕
  },

  // 获取订单列表
  async getOrderList() {
    const { page, limit } = this.data

    this.data.isLoading = true

    const res = await reqOrderList(page, limit)

    this.data.isLoading = false

    if (res.code === 200) {
      this.setData({
        orderList: [...this.data.orderList, ...res.data.records],
        total: res.data.total
      })
    }
  },

  // 页面上拉触底事件的处理函数
  onReachBottom() {
    // 解构数据
    const { page, total, orderList, isLoading } = this.data

    if (isLoading) return

    if (total === orderList.length) {
      wx.toast({ title: '数据加载完毕' })
      return
    }

    this.setData({
      page: page + 1
    })
    this.getOrderList()
  },

  onLoad() {
    this.getOrderList()
  }
})

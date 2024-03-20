// pages/goods/list/index.js
import { reqGoodsList } from '../../../api/goods'

Page({
  data: {
    goodsList: [], // 商品列表数据
    isFinish: false, // 判断数据是否加载完毕
    total: '',
    isLoading: false,

    // 商品列表请求参数
    requestData: {
      page: 1, // 页码
      limit: 10, // 每页请求的条数
      category1Id: '', // 一级分类 id
      category2Id: '' // 二级分类 id
    }
  },

  // 获取商品列表数据
  async getGoodsList() {
    // 节流
    this.data.isLoading = true

    // 发送请求
    const { data } = await reqGoodsList(this.data.requestData)

    this.data.isLoading = false

    this.setData({
      goodsList: [...this.data.goodsList, ...data.records],
      total: data.total
    })
  },

  // 监听到页面的上拉操作
  onReachBottom() {
    // 解构数据
    const { goodsList, total, requestData, isLoading } = this.data
    const { page } = requestData

    // 判断 isLoading 状态
    if (isLoading) return

    // 让 goodsList 长度 和 total 进行对比
    if (goodsList.length === total) {
      this.setData({
        isFinish: true
      })
      return
    }

    this.setData({
      requestData: { ...this.data.requestData, page: page + 1 }
    })

    // 重新获取商品列表
    this.getGoodsList()
  },

  // 监听页面的下拉刷新操作
  onPullDownRefresh() {
    // 数据重置
    this.setData({
      goodsList: [],
      total: 0,
      isFinish: false,
      requestData: { ...this.data.requestData, page: 1 }
    })

    this.getGoodsList()

    wx.stopPullDownRefresh()
  },

  onLoad(options) {
    Object.assign(this.data.requestData, options)

    this.getGoodsList()
  },

  gotoBack() {
    wx.navigateBack({
      delta: 1
    })
  }
})

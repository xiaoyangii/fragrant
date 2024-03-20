import { reqCategoryData } from '@/api/category'

Page({
  data: {
    categoryList: [], // 分类数据列表
    activeIndex: 0 // actived一级分类的索引，默认 0
  },

  onLoad(options) {
    // 获取页面中使用的
    this.getCategoryData()
  },

  // 实现一级分类的切换效果
  updateActive(event) {
    const { index } = event.currentTarget.dataset

    this.setData({
      activeIndex: index
    })
  },

  // 获取页面初始化数据
  async getCategoryData() {
    const res = await reqCategoryData()

    this.setData({
      categoryList: res.data
    })
  }
})

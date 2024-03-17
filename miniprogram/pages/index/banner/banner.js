// pages/index/banner/banner.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 轮播图数据
    bannerList: {
      type: Array,
      value: []
    }
  },

  data: {
    activeIndex: 0 // actived轮播图索引，默认 0
  },

  methods: {
    // 获取actived的轮播图索引
    getSwiperIndex(event) {
      const { current } = event.detail

      this.setData({
        activeIndex: current
      })
    }
  }
})

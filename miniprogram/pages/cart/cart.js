import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { userStore } from '@/stores/userstore'
import {
  reqCartList,
  reqUpdateChecked,
  reqCheckAllStatus,
  reqAddCart,
  reqDelCartGoods
} from '@/api/cart'
import { swipeCellBehavior } from '@/behaviors/swipeCell'
import { debounce } from 'miniprogram-licia'
const computedBehavior = require('miniprogram-computed').behavior

ComponentWithStore({
  behaviors: [swipeCellBehavior, computedBehavior],

  storeBindings: {
    store: userStore,
    fields: ['token']
  },

  properties: {},

  data: {
    cartList: [],
    emptyDes: '还没有添加商品，快去添加吧～'
  },

  computed: {
    // 判断是否是全选
    selectAllStatus(data) {
      return (
        data.cartList.length !== 0 && data.cartList.every((item) => item.isChecked === 1)
      )
    },

    // 计算订单总金额
    totalPrice(data) {
      let totalPrice = 0

      data.cartList.forEach((item) => {
        if (item.isChecked === 1) {
          totalPrice += item.price * item.count
        }
      })
      return totalPrice
    }
  },

  methods: {
    // 展示文案同时获取购物车列表数据
    async showTipGetList() {
      const { token } = this.data

      // 判断用户是否进行了登录
      if (!token) {
        this.setData({
          emptyDes: '您尚未登录，点击登录获取更多权益',
          cartList: []
        })
        return
      }

      const { code, data: cartList } = await reqCartList()

      if (code === 200) {
        this.setData({
          cartList,
          emptyDes: cartList.length === 0 && '还没有添加商品，快去添加吧～'
        })
      }
    },

    // 跳转到订单结算页面
    toOrder() {
      if (this.data.totalPrice === 0) {
        wx.toast({
          title: '请选择需要购买的商品'
        })
        return
      }

      wx.navigateTo({
        url: '/modules/orderPayModule/pages/order/detail/detail'
      })
    },

    // 更新商品的购买状态
    async updateChecked(event) {
      // detail 包含是否勾选的信息
      const { detail } = event
      const { id, index } = event.target.dataset
      const isChecked = detail ? 1 : 0

      const res = await reqUpdateChecked(id, isChecked)

      if (res.code === 200) {
        this.setData({
          [`cartList[${index}].isChecked`]: isChecked
        })
      }
    },

    // 删除购物车中的商品
    async delCartGoods(event) {
      const { id } = event.currentTarget.dataset

      const modalRes = await wx.modal({
        content: '您确认删除该商品吗 ?'
      })

      if (modalRes) {
        await reqDelCartGoods(id)

        this.showTipGetList()
      }
    },

    // 更新购买的数量
    changeBuyNum: debounce(async function (event) {
      const newBuyNum = event.detail > 200 ? 200 : event.detail
      // 获取商品的 id、索引、之前的购买数量
      const { id, index, oldbuynum } = event.target.dataset

      const reg = /^([1-9]|[1-9]\d|1\d{2}|200)$/
      const regRes = reg.test(newBuyNum)

      if (!regRes) {
        this.setData({
          [`cartList[${index}].count`]: oldbuynum
        })
        return
      }

      const disCount = newBuyNum - oldbuynum

      if (disCount === 0) return

      const res = await reqAddCart({ goodsId: id, count: disCount })

      if (res.code === 200) {
        this.setData({
          [`cartList[${index}].count`]: newBuyNum,
          [`cartList[${index}].isChecked`]: 1
        })
      }
    }, 500),

    // 实现全选和全不选效果
    async selectAllStatus(event) {
      // 获取全选按钮的选中状态
      const { detail } = event

      const isChecked = detail ? 1 : 0

      const res = await reqCheckAllStatus(isChecked)

      if (res.code === 200) {
        // 对购物车列表数据进行深拷贝
        const newCartList = JSON.parse(JSON.stringify(this.data.cartList))
        newCartList.forEach((item) => (item.isChecked = isChecked))

        this.setData({
          cartList: newCartList
        })
      }
    },

    onShow() {
      this.showTipGetList()
    },

    onHide() {
      this.onSwipeCellCommonClick()
    }
  }
})

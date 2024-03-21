import {
  reqOrderAddress,
  reqOrderInfo,
  reqBuyNowGoods,
  reqSubmitOrder,
  reqPrePayInfo,
  reqPayStatus
} from '../../../api/orderpay'
import { formatTime } from '../../../utils/formatTime'
import Schema from 'async-validator'
import { debounce } from 'miniprogram-licia'

const app = getApp()

Page({
  data: {
    buyName: '', // 订购人姓名
    buyPhone: '', // 订购人手机号
    deliveryDate: '', // 期望送达日期
    blessing: '', // 祝福语
    show: false, // 期望送达日期弹框
    orderAddress: {}, // 收货地址
    orderInfo: {}, // 订单商品详情
    minDate: new Date().getTime()
  },

  // 选择期望送达日期
  onShowDateTimerPopUp() {
    this.setData({
      show: true
    })
  },

  // 期望送达日期确定按钮
  onConfirmTimerPicker(event) {
    const timeRes = formatTime(new Date(event.detail))

    this.setData({
      show: false,
      deliveryDate: timeRes
    })
  },

  // 期望送达日期取消按钮 以及 关闭弹框时触发
  onCancelTimePicker() {
    this.setData({
      show: false,
      minDate: new Date().getTime()
    })
  },

  // 跳转到收货地址
  toAddress() {
    wx.navigateTo({
      url: '/modules/settingModule/pages/address/list/index'
    })
  },

  // 处理提交订单
  submitOrder: debounce(async function () {
    const {
      buyName,
      buyPhone,
      deliveryDate,
      blessing,
      orderAddress,
      orderInfo
    } = this.data

    // 需要根据接口要求组织请求参数
    const params = {
      buyName,
      buyPhone,
      cartList: orderInfo.cartVoList,
      deliveryDate,
      remarks: blessing,
      userAddressId: orderAddress.id
    }

    const { valid } = await this.validatorPerson(params)

    if (!valid) return

    const res = await reqSubmitOrder(params)

    if (res.code === 200) {
      // 将订单编号挂载到页面实例上
      this.orderNo = res.data

      this.advancePay()
    }
  }, 500),

  // 获取预付单信息、支付参数
  async advancePay() {
    try {
      //  获取预付单信息、支付参数
      const payParams = await reqPrePayInfo(this.orderNo)

      if (payParams.code === 200) {
        const payInfo = await wx.requestPayment(payParams.data)

        // 获取支付的结果
        if (payInfo.errMsg === 'requestPayment:ok') {
          // 查询支付的状态
          const payStatus = await reqPayStatus(this.orderNo)

          if (payStatus.code === 200) {
            wx.redirectTo({
              url: '/modules/orderPayModule/pages/order/list/list',
              success: () => {
                wx.toast({
                  title: '支付成功',
                  icon: 'success'
                })
              }
            })
          }
        }
      }
    } catch (error) {
      wx.toast({
        title: '支付失败',
        icon: 'error'
      })
    }
  },

  // 对收货地址、订购人信息进行验证
  validatorPerson(params) {
    const nameRegExp = '^[a-zA-Z\\d\\u4e00-\\u9fa5]+$'

    const phoneReg = '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$'

    const rules = {
      userAddressId: {
        required: true,
        message: '请选择收货地址'
      },
      buyName: [
        { required: true, message: '请输入订购人姓名' },
        { pattern: nameRegExp, message: '订购人姓名不合法' }
      ],
      buyPhone: [
        { required: true, message: '请输入订购人手机号' },
        { pattern: phoneReg, message: '订购人手机号不合法' }
      ],
      deliveryDate: { required: true, message: '请选择送达日期' }
    }

    const validator = new Schema(rules)

    return new Promise((resolve) => {
      validator.validate(params, (errors) => {
        if (errors) {
          wx.toast({ title: errors[0].message })
          resolve({ valid: false })
        } else {
          resolve({ valid: true })
        }
      })
    })
  },

  // 获取订单页面的收货地址
  async getAddress() {
    const addressId = app.globalData.address.id

    if (addressId) {
      this.setData({
        orderAddress: app.globalData.address
      })
      return
    }

    const { data: orderAddress } = await reqOrderAddress()

    this.setData({
      orderAddress
    })
  },

  // 获取订单详情数据
  async getOrderInfo() {
    const { goodsId, blessing } = this.data

    const { data: orderInfo } = goodsId
      ? await reqBuyNowGoods({ goodsId, blessing })
      : await reqOrderInfo()

    const orderGoods = orderInfo.cartVoList.find((item) => item.blessing !== '')

    this.setData({
      orderInfo,
      blessing: !orderGoods ? '' : orderGoods.blessing
    })
  },

  onLoad(options) {
    // 获取从商品详情页面，点击立即购买跳转到此页面获取的参数，goodsId, blessing
    this.setData({
      ...options
    })
  },

  onShow() {
    // 获取收货地址
    this.getAddress()

    // 获取需要下单商品的详细信息
    this.getOrderInfo()
  },

  onUnload() {
    app.globalData.address = {}
  }
})

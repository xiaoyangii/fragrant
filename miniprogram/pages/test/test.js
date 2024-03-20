// pages/test/test.js
import instance from '../../utils/http'
import { reqSwiperData } from '../../api/index'
import Schema from 'async-validator'

Page({
  data: {
    avatarUrl: '../../assets/images/avatar.png',
    name: ''
  },

  // 获取首页数据
  // async getHomeList() {
  //   // 获取轮播图数据
  //   const res = await reqSwiperData()

  //   console.log(res)
  // },

  // 获取微信头像
  async chooseavatar(event) {
    const { avatarUrl } = event.detail

    const { data: avatar } = await instance.upload('/fileUpload', avatarUrl, 'file')

    this.setData({
      avatarUrl: avatar
    })

    // wx.uploadFile({
    //   url: 'https://gmall-prod.atguigu.cn/mall-api/fileUpload',
    //   // 上传的文件路径
    //   filePath: avatarUrl,
    //   // 文件对应的 key，服务器需要根据 key 来获取文件的二进制信息
    //   name: 'file',

    //   success: (res) => {
    //     // 服务器返回的数据是 JSON 字符串，JSON.parse 进行转换
    //     res.data = JSON.parse(res.data)

    //     this.setData({
    //       avatarUrl: res.data.data
    //     })
    //   }
    // })

    // this.setData({
    //   avatarUrl
    // })
  },

  // 测试并发请求
  async allHandler() {
    // 通过 async 和 await 方式同时发起多个请求
    // async 和 await 能够控制异步任务以同步的流程来执行
    // 当第一个请求结束以后，才能够发起第二个请求
    // 会造成请求的阻塞，从而影响页面的渲染速度
    // await instance.get('/index/findBanner')
    // await instance.get('/index/findCategory1')
    // await instance.get('/index/findBanner')
    // await instance.get('/index/findCategory1')
    // Promise.all 能够将多个请求同时进行发送
    // 并不会造成请求的阻塞，从而不会影响页面的渲染速度
    // await Promise.all([
    //   instance.get('/index/findBanner'),
    //   instance.get('/index/findCategory1'),
    //   instance.get('/index/findBanner'),
    //   instance.get('/index/findCategory1')
    // ])
    const res = await instance.all(
      instance.get('/index/findBanner'),
      instance.get('/index/findCategory1'),
      instance.get('/index/findBanner'),
      instance.get('/index/findCategory1'),
      instance.get('/index/findBanner'),
      instance.get('/index/findCategory1'),
      instance.get('/index/findBanner'),
      instance.get('/index/findBanner'),
      instance.get('/index/findCategory1'),
      instance.get('/index/findBanner'),
      instance.get('/index/findCategory1'),
      instance.get('/index/findBanner'),
      instance.get('/index/findCategory1'),
      instance.get('/index/findBanner')
    )
    console.log(res)
  },

  async loadHandler() {
    // /cart/getCartList
    const res = await instance.get('/index/findBanner', null, {
      isLoading: false
    })
    console.log(res)
  },

  // 拒绝授权后的处理方案
  async onLocation1() {
    try {
      // 获取用户地理位置信息
      // 在用户拒绝授权以后，如果再次调用 getLocation，不会在弹出授权弹窗
      const res = await wx.getLocation()
      console.log(res)
    } catch (error) {
      wx.toast({ title: '您拒绝授权获取地理位置' })
    }
  },

  // 拒绝授权后的处理方案-获取授权状态
  async onLocation2() {
    // 调用 wx.getSetting 获取用户所有的授权信息，查询到用户是否授权了位置信息
    // authSetting 只包含了小程序向用户请求的所有的权限，同时包含了授权的结果(true、false)
    const { authSetting } = await wx.getSetting()

    // scope.userLocation 用户是否授权获取了地理位置信息
    // 如果小程序没有向用户发起过授权请求，authSetting 中没有 scope.userLocation 属性
    // 如果用户点击了允许授权，返回值就是 true
    // 如果用户点击了拒绝授权，返回值就是 false
    console.log(authSetting['scope.userLocation'])
  },

  // 拒绝授权后的处理方案-整体的逻辑
  async onLocation() {
    // authSetting 获取小程序已经向用户申请的权限，并且会返回授权的结果
    const { authSetting } = await wx.getSetting()
    // scope.userLocation 用户是否授权小程序获取位置信息
    console.log(authSetting['scope.userLocation'])

    // 判断用户是否拒绝了授权
    if (authSetting['scope.userLocation'] === false) {
      // 用户之前拒绝授权获取位置信息，用户再次发起了授权
      // 这时候需要使用一个弹框询问用户是否进行授权
      const modalRes = await wx.modal({
        title: '授权提示',
        content: '需要获取地理位置信息，请确认授权',
        success: async function (res) {
          if (res.confirm) {
            // 如果用户点击了确定，说明用户同意授权，需要打开微信客户端小程序授权页面
            const { authSetting } = await wx.openSetting()
            // 如果用户没有更新授权信息，需要给用户提示授权失败
            if (!authSetting['scope.userLocation']) return wx.toast({ title: '授权失败' })
          }
        }
      })

      // 如果用户点击了取消，说明用户拒绝了授权，需要给用户进行提示
      if (!modalRes) return wx.toast({ title: '您拒绝了授权' })

      //如果用户更新了授权信息，说明用户同意授权获取位置信息
      try {
        const locationRes = await wx.getLocation()
        console.log(locationRes)
      } catch (error) {
        wx.toast({ title: '您拒绝授权获取位置信息' })
      }
    } else {
      try {
        const locationRes = await wx.getLocation()
        console.log(locationRes)
      } catch (error) {
        wx.toast({ title: '您拒绝授权获取位置信息' })
      }
    }
  },

  // 对数据进行验证
  onValidator() {
    // 定义验证规则
    const rules = {
      // key 验证规则的名字，名字需要和验证的数据保持一致
      name: [
        { required: true, message: 'name 不能为空' },
        { type: 'string', message: 'name 不是字符串' },
        { min: 2, max: 5, message: '名字最少 2 个字，最多是 3 个字' }
        // pattern 使用正则对数据进行验证
        // { pattern: '', message: '' }

        // validator 自定义验证规则
        // { validator: () => {} }
      ]
    }

    // 对构造函数进行实例化，同时传入验证规则
    const validator = new Schema(rules)

    // 需要调用 validate 实例方法，对数据进行验证
    // 第一个参数：需要验证的数据，要求对象
    // validate 只会验证和验证规则同名的字段
    // 第二个参数：回调函数
    validator.validate(this.data, (errors, fields) => {
      // 验证成功，errors 是 null
      // 验证失败，errors 是数组，数组每一项是错误信息
      // fields 是需要验证的属性，属性值是一个数组，数组中也包含着错误信息

      if (errors) {
        console.log('验证失败')
        console.log(errors)
        console.log(fields)
      } else {
        console.log('验证成功')
        console.log(errors)
      }
    })
  }
})

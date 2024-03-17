// pages/test/test.js
import instance from '../../utils/http'
import { reqSwiperData } from '../../api/index'

Page({
  data: {
    avatarUrl: '../../assets/images/avatar.png'
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
  }
})

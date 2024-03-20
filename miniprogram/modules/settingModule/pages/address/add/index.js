import { reqAddAddress, reqAddressInfo, reqUpdateAddress } from '../../../api/address'
import QQMapWX from '@/libs/qqmap-wx-jssdk.min'
import Schema from 'async-validator'

Page({
  data: {
    name: '', // 收货人
    phone: '', // 手机号码
    provinceName: '', // 省
    provinceCode: '', // 省编码
    cityName: '', // 市
    cityCode: '', // 市编码
    districtName: '', // 区
    districtCode: '', // 区编码
    address: '', // 详细地址
    fullAddress: '', // 完整地址
    isDefault: false // 是否设置为默认地址，0 不设置为默认地址，1 设置为默认地址
  },

  // 保存收货地址
  async saveAddrssForm(event) {
    // 组织参数 (完整地址、是否设置为默认地址)
    const { provinceName, cityName, districtName, address, isDefault } = this.data

    // 请求参数
    const params = {
      ...this.data,
      fullAddress: provinceName + cityName + districtName + address,
      isDefault: isDefault ? 1 : 0
    }

    const { valid } = await this.validatorAddress(params)

    if (!valid) return

    const res = this.addressId
      ? await reqUpdateAddress(params)
      : await reqAddAddress(params)

    if (res.code === 200) {
      wx.navigateBack({
        success: () => {
          wx.toast({
            title: this.addressId ? '更新收货地址成功！' : '新增收货地址成功！'
          })
        }
      })
    }
  },

  // 对新增收货地址请求参数进行验证
  validatorAddress(params) {
    // 验证收货人 只包含大小写字母、数字和中文字符
    const nameRegExp = '^[a-zA-Z\\d\\u4e00-\\u9fa5]+$'
    // 验证手机号
    const phoneReg = '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$'

    const rules = {
      name: [
        { required: true, message: '请输入收货人姓名' },
        { pattern: nameRegExp, message: '收货人姓名不合法' }
      ],
      phone: [
        { required: true, message: '请输入收货人手机号' },
        { pattern: phoneReg, message: '收货人手机号不合法' }
      ],
      provinceName: { required: true, message: '请选择收货人所在地区' },
      address: { required: true, message: '请输入详细地址' }
    }

    const validator = new Schema(rules)

    //  Promise 的形式返回
    return new Promise((resolve) => {
      validator.validate(params, (errors) => {
        if (errors) {
          // 验证失败
          wx.toast({ title: errors[0].message })
          resolve({ valid: false })
        } else {
          // 如果属性值是 true，说明验证成功
          resolve({ valid: true })
        }
      })
    })
  },

  // 省市区选择
  onAddressChange(event) {
    // 解构省市区以及编码
    const [provinceName, cityName, districtName] = event.detail.value
    const [provinceCode, cityCode, districtCode] = event.detail.code

    this.setData({
      provinceName,
      cityName,
      districtName,
      provinceCode,
      cityCode,
      districtCode
    })
  },

  // 获取用户地理位置信息
  async onLocation() {
    // 打开地图让用户选择地理位置
    // latitude 纬度、longitude 经度、name 搜索的地点
    const { latitude, longitude, name } = await wx.chooseLocation()

    // reverseGeocoder 进行逆地址解析
    this.qqmapwx.reverseGeocoder({
      location: {
        longitude,
        latitude
      },
      success: (res) => {
        // 获取省市区、省市区编码
        const { adcode, province, city, district } = res.result.ad_info

        // 获取街道、门牌 (街道、门牌 可能为空)
        const { street, street_number } = res.result.address_component

        // 获取标准地址
        const { standard_address } = res.result.formatted_addresses

        // 对获取的数据进行格式化、组织，然后赋值给 data 中的字段
        this.setData({
          // 省
          provinceName: province,
          provinceCode: adcode.replace(adcode.substring(2, 6), '0000'),

          // 市
          cityName: city,
          cityCode: adcode.replace(adcode.substring(4, 6), '00'),

          // 区 若无区县级，则为空
          districtName: district,
          districtCode: district && adcode,

          // 组织详细地址
          address: street + street_number + name,
          // 组织完整地址
          fullAddress: standard_address + name
        })
      }
    })
  },

  // 用来处理更新相关的逻辑
  async showAddressInfo(id) {
    if (!id) return

    // 将 id 挂载到当前页面的实例(this)上
    this.addressId = id

    // 设置当前页面的标题
    wx.setNavigationBarTitle({
      title: '更新收货地址'
    })

    const { data } = await reqAddressInfo(id)

    this.setData(data)
  },

  onLoad(options) {
    // 核心类 QQMapWX 进行实例化
    this.qqmapwx = new QQMapWX({
      key: 'IHYBZ-C7KKJ-DS4FD-DCDBH-EDUIH-DEBS2'
    })

    this.showAddressInfo(options.id)
  }
})

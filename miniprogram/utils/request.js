// 创建 WxRequest 类

class WxRequest {
  // 定义实例属性，用来设置默认请求参数
  defaults = {
    baseURL: '', // 请求基准地址
    url: '', // 接口的请求路径
    data: null, // 请求参数
    method: 'GET', // 默认的请求方法
    // 请求头
    header: {
      'Content-type': 'application/json' // 设置数据的交互格式
    },
    timeout: 60000, // 默认的超时时长，小程序默认的超时时长是 1 分钟
    isLoading: true // 控制是否使用默认的 loading
  }

  // 定义拦截器对象
  interceptors = {
    // 请求拦截器
    request: (config) => config,

    // 响应拦截器
    response: (response) => response
  }

  // 定义数组队列
  // 初始值空数组，用来存储请求队列、存储请求标识
  queue = []

  // 创建和初始化类的属性以及方法
  constructor(params = {}) {
    // 通过 Object.assign 方法合并请求参数
    // 注意：需要传入的参数，覆盖默认的参数，因此传入的参数需要放到最后
    this.defaults = Object.assign({}, this.defaults, params)
  }

  // request 实例方法接收一个对象类型的参数
  request(options) {
    // 如果有新的请求，就清除上一次的定时器
    this.timerId && clearTimeout(this.timerId)

    // 合并url
    options.url = this.defaults.baseURL + options.url

    // 合并请求参数
    options = { ...this.defaults, ...options }

    // upload api 本身就有loading，需排除
    if (options.isLoading && options.method !== 'UPLOAD') {
      // 判断 queue empty or not，empty for loading
      this.queue.length === 0 && wx.showLoading()

      // 向 queue 添加请求标识, 每个标识代表是一个请求
      this.queue.push('request')
    }

    // 请求发送之前，调用请求拦截器，新增和修改请求参数
    options = this.interceptors.request(options)

    // 需要使用 Promise 封装 wx.request，处理异步请求
    return new Promise((resolve, reject) => {
      if (options.method === 'UPLOAD') {
        wx.uploadFile({
          ...options,

          success: (res) => {
            res.data = JSON.parse(res.data)

            const mergeRes = Object.assign({}, res, {
              config: options,
              isSuccess: true
            })

            resolve(this.interceptors.response(mergeRes))
          },

          fail: (err) => {
            const mergeErr = Object.assign({}, err, {
              config: options,
              isSuccess: false
            })

            reject(this.interceptors.response(mergeErr))
          }
        })
      } else {
        wx.request({
          ...options,

          // 接口调用成功
          success: (res) => {
            const mergeRes = Object.assign({}, res, {
              config: options,
              isSuccess: true
            })
            resolve(this.interceptors.response(mergeRes))
          },

          // 接口调用失败
          fail: (err) => {
            const mergeErr = Object.assign({}, err, {
              config: options,
              isSuccess: false
            })
            reject(this.interceptors.response(mergeErr))
          },

          // 接口调用结束的回调函数
          complete: () => {
            if (options.isLoading) {
              // 接口调用结束，每次从 queue 队列中删除一个标识
              this.queue.pop()

              // 与定时器配合，解决loading闪烁问题
              this.queue.length === 0 && this.queue.push('request')

              this.timerId = setTimeout(() => {
                this.queue.pop()

                // 删除标识以后，判断目前 queue 是否empty
                // 如果是empty，并发请求完成
                // 隐藏 loading，调用 wx.hideLoading()
                this.queue.length === 0 && wx.hideLoading()

                clearTimeout(this.timerId)
              }, 1)
            }
          }
        })
      }
    })
  }

  // 封装 GET 实例方法
  get(url, data = {}, config = {}) {
    return this.request(Object.assign({ url, data, method: 'GET' }, config))
  }

  // 封装 DELETE 实例方法
  delete(url, data = {}, config = {}) {
    return this.request(Object.assign({ url, data, method: 'DELETE' }, config))
  }

  // 封装 POST 实例方法
  post(url, data = {}, config = {}) {
    return this.request(Object.assign({ url, data, method: 'POST' }, config))
  }

  // 封装 PUT 实例方法
  put(url, data = {}, config = {}) {
    return this.request(Object.assign({ url, data, method: 'PUT' }, config))
  }

  // 处理并发请求
  all(...promise) {
    // 通过展开运算符接收传递的参数,将传入的参数转成数组
    return Promise.all(promise)
  }

  /**
   * @description upload 实例方法，对 wx.uploadFile 进行封装
   * @param {*} url 文件的上传地址、接口地址
   * @param {*} filePath 要上传的文件资源路径
   * @param {*} name 文件对应的 key, 默认file
   * @param {*} config 其他配置项
   */
  upload(url, filePath, name = 'file', config = {}) {
    return this.request(Object.assign({ url, filePath, name, method: 'UPLOAD' }, config))
  }
}

export default WxRequest

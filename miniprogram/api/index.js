/**
 *@description api for page index
 */
import http from '../utils/http'

/**
 * @description 并发请求获取首页的数据
 * @returns Promise
 */

export const reqIndexData = () => {
  return http.all(
    http.get('/index/findBanner'),
    http.get('/index/findCategory1'),
    http.get('/index/advertisement'),
    http.get('/index/findListGoods'),
    http.get('/index/findRecommendGoods')
  )
}

/**
 * 接入文档：https://doc.yunxin.163.com/signaling/docs/TQ4OTU4NzU?platform=web
 * 状态码： https://doc.yunxin.163.com/signaling/docs/DI5MDUwODY?platform=web
 */
import NIM from '@yxim/nim-web-sdk/dist/SDK/NIM_Web_NIM'

export default class Signal {
  nim = null
  timer = null
  STATUS = {
    ROOM_NOT_EXISTS: 10404
  }

  constructor() {
    //参数说明：https://doc.yunxin.163.com/TM5MzM5Njk/docs/zE0NDY4Njc?platform=web#%E5%8F%82%E6%95%B0%E8%A7%A3%E9%87%8A
    this.options = {
      onerror: () => console.log(`Error:`, e)
    }
  }

  /**
   * 连接
   */
  connect(options) {
    this.nim = NIM.getInstance({ ...this.options, ...options })
    return this.nim
  }

  /**
   * 创建频道
   */
  async createChannel({ channelName }) {
    const params = {
      type: 1, // 必填字段 通话类型,1:音频;2:视频;3:其他
      channelName // 频道别名
    }
    let data = await this.execute(
      this.nim.signalingGetChannelInfo({ channelName: params.channelName })
    )
    //如果频道不存在则创建，存在则直接取信息
    if (data.error?.code === this.STATUS.ROOM_NOT_EXISTS) {
      data = await this.execute(this.nim.signalingCreate(params))
    }
    console.log(`channel info::`, data)
    this.channel = data.data
    return data
  }

  /**
   * 自己加入频道
   */
  async joinChannel({ channelId }) {
    const params = {
      channelId
    }
    const { data, error } = await this.execute(this.nim.signalingJoin(params))
    if (error) {
      console.warn('加入频道失败, error:', error)
    } else {
      console.log('加入频道成功, data:', data)
    }
    // 定时 5s 设置一次加入的房间需要续期。
    if (!this.timer) {
      this.timer = setInterval(this.aotoDelay.bind(this), 5000)
    }
    return { data, error }
  }

  /**
   * 自动延长频道的有效期，防止频道过期退出会话。根据实际需要调用。
   */
  async aotoDelay() {
    if (!this.channel) {
      clearInterval(this.timer)
      return
    }
    console.log('signling:autoDelay start', this.channel)
    // 找出即将过期的 channel，以最近一分钟为临界点
    if (this.channel.channelExpireTime < new Date().getTime() - 60 * 1000) {
      console.log('signling:autoDelay send cmd', this.channel.channelId)
      const sendParams = `{"SID":15,"CID":2,"SER":20000,"Q":[{"t":"Property","v":{"3":"${this.channel.channelId}"}}]}`
      this.nim.protocol.socket.send(sendParams)
      this.nim.protocol.socket.on('message', (result) => {
        if (result) {
          result = JSON.parse(result)
          if (result.sid === 15 && result.cid === 2) {
            const deserializeData = {
              1: 'type',
              2: 'name',
              3: 'channelId',
              4: 'createTime',
              5: 'channelExpireTime',
              6: 'creatorAccid',
              7: 'ext'
            }
            const channel = {}
            const serializeData = result?.r?.[0]
            Object.keys(serializeData).map((key) => {
              if (deserializeData[key]) {
                channel[deserializeData[key]] = serializeData[key]
              }
            })
            this.channel = channel
          }
        }
      })
    }
  }

  /**
   * 邀请别人加入频道
   */
  async inviteJoinChannel({ channelId, account, requestId = '123456' }) {
    const params = {
      channelId,
      account,
      requestId,
      attachExt: '邀请加入'
    }
    const { data, error } = await this.execute(this.nim.signalingInvite(params))
    if (error) {
      console.warn('邀请别人加入频道失败, error:', error)
    } else {
      console.log('邀请别人加入频道成功, data:', data)
    }
    return { data, error }
  }

  /**
   * 接受邀请
   */
  async acceptAndJoinInvite({ channelId, account, requestId = '123456' }) {
    const params = {
      channelId,
      account,
      requestId,
      attachExt: '加入频道并接受邀请'
    }
    const { data, error } = await this.execute(this.nim.signalingJoinAndAccept(params))
    if (error) {
      console.warn('接受别人的邀请失败, error:', error)
    } else {
      console.log('接受别人的邀请成功, data:', data)
    }
    return { data, error }
  }

  /**
   * 离开频道
   */
  async leaveChannel({ channelId }) {
    const params = {
      channelId
    }
    const { data, error } = await this.execute(this.nim.signalingLeave(params))
    if (error) {
      console.warn('离开频道失败, error:', error)
    } else {
      console.log('离开频道成功, data:', data)
    }
    return { data, error }
  }

  /**
   * 发送自定义信令
   */
  async sendCustomSignal({ channelId, account, content }) {
    const params = {
      channelId,
      account,
      attachExt: content
    }

    const { data, error } = await this.execute(this.nim.signalingControl(params))
    if (error) {
      console.warn('控制信令发送失败, error:', error)
    } else {
      console.warn('控制信令发送成功, data:', data)
    }
    return { data, error }
  }

  /**
   * 销毁
   */
  async destory(fn) {
    this.nim.destroy({
      done: () => {
        console.log('实例已被销毁')
        this.nim = null
        this.channel = null
        this.timer = null
        fn?.()
      }
    })
  }
  /**
   * 包装函数
   */
  execute(fn) {
    return new Promise(async (resove) => {
      const result = { data: null, error: null }
      try {
        result.data = await fn
      } catch (error) {
        result.error = error
      }
      resove(result)
    })
  }
}

import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Button, Input, Form, Divider, Radio, Modal } from 'antd'
import 'antd/dist/antd.css'
import Signal from './'

const signal = new Signal()
signal.instance = null

const App = () => {
  const [connectForm] = Form.useForm()
  const [createForm] = Form.useForm()
  const [joinForm] = Form.useForm()
  const [inviteForm] = Form.useForm()
  const [sendForm] = Form.useForm()
  const [leaveForm] = Form.useForm()

  const [state, setNewState] = useState({
    channelInfo: null,
    connectInfo: {},
    joinInfo: null,
    inviteInfo: null,
    sendInfo: null,
    leaveInfo: null,
    accounts: ['cs01', 'cs02'],
    account: null
  })

  const setState = (newState) => setNewState({ ...state, ...newState })

  //连接
  const onConnect = async () => {
    const values = await connectForm.validateFields()
    const { account } = values
    signal.instance = signal.connect({
      account,
      onconnect: () => setState({ connectInfo: { data: '连接成功' }, account }),
      ondisconnect: (error) => console.log(error)
    })
    // 在线用户接收到的通知事件
    signal.instance.on('signalingNotify', (result) => {
      console.log('监听到通知信息: ', result)
      const { channelId, channelName, from, eventType, attachExt } = result
      switch (eventType) {
        case 'ROOM_CLOSE':
          console.log('频道关闭事件')
          Modal.info({ content: `频道${channelName}关闭了` })
          break
        case 'ROOM_JOIN':
          console.log('加入频道事件')
          break
        case 'INVITE':
          Modal.confirm({
            content: `是否接受邀请加入频道${channelName}`,
            onOk: async () => {
              signal.acceptAndJoinInvite({ channelId, account: from })
            }
          })
          break
        case 'CANCEL_INVITE':
          console.log('取消邀请事件')
          break
        case 'REJECT':
          console.log('拒绝邀请事件')
          Modal.info({ content: `${from}拒绝加入频道${channelName}` })
          break
        case 'ACCEPT':
          console.log('接受邀请事件')
          Modal.info({ content: `${from}已接受邀请加入频道${channelName}` })
          break
        case 'LEAVE':
          console.log('离开频道事件')
          Modal.info({ content: `${from}已离开频道${channelName}` })
          break
        case 'CONTROL':
          console.log('自定义控制事件')
          Modal.info({ content: `收到${from}发送的自定义信息${attachExt}` })
          break
      }
    })
  }

  //创建频道
  const onCreateChannel = async () => {
    const values = await createForm.validateFields()
    const { channelName } = values
    const data = await signal.createChannel({ channelName })
    setState({ channelInfo: data })

    const { channelId } = data?.data || {}
    const [account] = state.accounts.filter((account) => account !== state.account)
    joinForm.setFieldsValue({ channelId })
    inviteForm.setFieldsValue({ channelId, account })
    sendForm.setFieldsValue({ channelId, account })
  }

  //自己加入频道
  const onJoin = async () => {
    const values = await joinForm.validateFields()
    const { channelId } = values
    const data = await signal.joinChannel({ channelId })
    setState({ joinInfo: data })
  }

  //邀请加入频道
  const onInvite = async () => {
    const values = await inviteForm.validateFields()
    const { channelId, account } = values
    const data = await signal.inviteJoinChannel({ channelId, account })
    setState({ inviteInfo: data })
  }

  //离开频道
  const onLeave = async () => {
    const values = await leaveForm.validateFields()
    const { channelId, account } = values
    const data = await signal.leaveChannel({ channelId, account })
    setState({ leaveInfo: data })
  }

  //发送自定义指令
  const onSendCustomSignal = async () => {
    const values = await sendForm.validateFields()
    const { channelId, account, content } = values
    const data = await signal.sendCustomSignal({ channelId, account, content })
    setState({ sendInfo: data })
  }

  //销毁
  const onDestory = () => {
    signal.destory(() =>
      setState({
        channelInfo: null,
        connectInfo: null,
        joinInfo: null,
        inviteInfo: null,
        sendInfo: null,
        leaveInfo: null,
        account: null
      })
    )
  }

  const renderInfo = (result) => {
    const { data, error } = result || {}
    return (
      <>
        {data && <p style={{ wordBreak: 'break-all' }}>操作成功：{JSON.stringify(data)}</p>}
        {error && (
          <p style={{ wordBreak: 'break-all', color: 'red' }}>操作失败：{JSON.stringify(error)}</p>
        )}
      </>
    )
  }

  return (
    <div style={{ margin: '20px auto', width: 800 }}>
      <h3>初始化</h3>
      <Form form={connectForm}>
        <Form.Item name="account" label="账号">
          <Radio.Group>
            {state.accounts.map((account) => (
              <Radio key={account} value={account}>
                {account}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Button type="primary" onClick={onConnect}>
          连接
        </Button>
      </Form>

      {renderInfo(state.connectInfo)}
      <Divider />

      <h3>创建频道</h3>
      <Form form={createForm} initialValues={{ channelName: 'demo1' }}>
        <Form.Item name="channelName" label="频道名称">
          <Input />
        </Form.Item>
        <Button type="primary" onClick={onCreateChannel}>
          确定
        </Button>
      </Form>
      {renderInfo(state.channelInfo)}
      <Divider />

      <h3>加入频道</h3>
      <Form form={joinForm}>
        <Form.Item name="channelId" label="频道 ID">
          <Input />
        </Form.Item>
        <Button type="primary" onClick={onJoin}>
          确定
        </Button>
      </Form>
      {renderInfo(state.joinInfo)}
      <Divider />

      <h3>邀请加入</h3>
      <Form form={inviteForm}>
        <Form.Item name="channelId" label="频道 ID">
          <Input />
        </Form.Item>
        <Form.Item name="account" label="邀请账号">
          <Input />
        </Form.Item>
        <Button type="primary" onClick={onInvite}>
          确定
        </Button>
      </Form>
      {renderInfo(state.inviteInfo)}
      <Divider />

      <h3>离开频道</h3>
      <Form form={leaveForm}>
        <Form.Item name="channelId" label="频道 ID">
          <Input />
        </Form.Item>
        <Button type="primary" onClick={onLeave}>
          确定
        </Button>
      </Form>
      {renderInfo(state.leaveInfo)}
      <Divider />

      <h3>发送自定义信令</h3>
      <Form form={sendForm}>
        <Form.Item name="channelId" label="频道 ID">
          <Input />
        </Form.Item>

        <Form.Item name="account" label="对方账号">
          <Input />
        </Form.Item>
        <Form.Item name="content" label="发送内容">
          <Input.TextArea />
        </Form.Item>
        <Button type="primary" onClick={onSendCustomSignal}>
          发送
        </Button>
      </Form>
      {renderInfo(state.sendInfo)}
      <Divider />

      <h3>销毁</h3>
      <Button type="primary" onClick={onDestory}>
        销毁
      </Button>
      <Divider />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

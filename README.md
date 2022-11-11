# 信令 Demo

## 配置

1、配置初始化入参

- `appKey`: 云信管理后台查看应用的 appKey
- `token`: 帐号的 token, 用于建立连接

更多参数参考：[IM 初始化入参说明](https://doc.yunxin.163.com/TM5MzM5Njk/docs/zE0NDY4Njc?platform=web#%E5%8F%82%E6%95%B0%E8%A7%A3%E9%87%8A)

2、修改示例页面 `App.jsx`中 `accounts`字段值，此账号为云信后台提供。

## 调试

```bash
$ npm install
$ npm run dev
```

调试步骤：

1、打开标签页连接账号如 cs01 执行连接、创建频道、加入频道等一系列动作，

2、打开新标签页连接账号 cs02 ，等待接收信令。

3、使用账号 cs01 发送邀请加入频道信令。

由于连接是单例模式，所以如果断开重连失败，则刷新即可。

## 问题

##### 1、邀请加入时提示 `ROOM_MEMBER_HAS_EXISTS`

被邀请账户需要根据频道 ID 退出，然后再操作邀请加入。

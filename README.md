# 信令 Demo

## 配置

`.env` 文件传入云信 IM 相关配置：

- `YUNXIN_APP_KEY`: 云信管理后台创建的应用 appKey
- `YUNXIN_ACCOUNT_TOKEN`: 帐号的 token, 用于建立连接
- `YUNXIN_ACCOUNTS`: 示例页面中模拟账号`accounts`字段值，此账号为云信后台新增的用户。

更多参数参考：[IM 初始化入参说明](https://doc.yunxin.163.com/TM5MzM5Njk/docs/zE0NDY4Njc?platform=web#%E5%8F%82%E6%95%B0%E8%A7%A3%E9%87%8A)

## 调试

```bash
$ npm install
$ npm run dev
```

调试步骤：

1、打开标签页连接账号如 account_1 执行连接、创建频道、加入频道等一系列动作，

2、打开新标签页连接账号 account_2 ，等待接收信令。

3、使用账号 account_1 发送信令邀请 account_2 加入频道。

## 问题

##### 1、邀请加入时提示 `ROOM_MEMBER_HAS_EXISTS`

被邀请账户需要根据频道 ID 退出，然后再操作邀请加入。

##### 2、调试模式代码更新后重连失败

由于连接是单例模式，热刷新导致连接失败，刷新页面即可。

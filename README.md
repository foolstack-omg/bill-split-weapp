## 同游分账 - 微信小程序客户端
基于微信官方框架 wepy 实现的分账小程序

- [小程序服务器端项目链接](https://github.com/654943305/laravel-bill-split)

## 功能点
- 微信登录及服务器端Token验证
- 微信小程序分享
- Debounce防抖计算分账结果
- 下拉刷新
- 服务器端Api工具类封装
- 全局Components公用页面封装
- Css3 Flex布局

## 项目部署

1. `npm install`
2. 进入 wepy.config.js, 搜索 `__BASE_URL__` 更改生产环境和测试环境对应的api接口地址
3. 进入 wepy.config.js, 搜索 `____HTTP____` 更改生产环境和测试环境对应的http服务器地址
4. 进入 project.config.json, 替换 appid 为你的小程序appid
5. 执行 npm run dev 编译文件并监听文件动态变化
6. 打开微信开发者工具，导入此项目，编译即可。

## 小程序码

<html>
<img width='200' src='https://bill-split.ergou.live/images/weapp_qrcode.jpg'/>
</html>

## 支持一下

您的支持是我前进最大的动力

<html>
<img width='200'  src='https://bill-split.ergou.live/images/receive_money.jpeg'/>
</html>

## 项目成员

- 技术 （刘晓峰 Stefan）
- UI设计 （优雅de兔子君）[设计师作品集](https://mrbunny.zcool.com.cn)

## 联系我们

<html>
<img width='200'  src='https://bill-split.ergou.live/images/contact.jpeg'/>
</html>

# 第二页图片说明

## 2a Firebase配置（推荐使用裁切版）
英文：Figure 2a. Redacted client configuration connecting the project to Firebase.
中文：图2a：连接项目与Firebase的客户端配置，项目标识信息已脱敏。
来源：项目真实firebase-config.js，在临时副本中遮蔽字段值后进行浏览器截图。不是Firebase控制台截图，未修改原项目配置。
推荐文件：01-firebase-config-crop.png。01-firebase-source.png额外显示真实匿名认证与玩家规则摘录，可用作较大的技术证据图。

## 2b 系统结构
英文：Figure 2b. Client browsers use anonymous authentication to access room-specific data in Firebase Realtime Database.
中文：图2b：浏览器客户端通过匿名认证访问Firebase实时数据库中的房间数据。
来源：根据multiplayer.js与database.rules.json绘制的技术结构图。不是现场运行数据；箭头说明调用与返回关系。
文件：02-system-structure.png；另有SVG矢量版本。

## 2c 加入入口
英文：Figure 2c. The phone joining interface and QR entry for the shared campus room.
中文：图2c：共享校园房间的手机加入界面与二维码入口。
来源：现有项目界面的受控浏览器截图＋按正式固定链接生成的二维码。不是参与者研究照片。
文件：03-real-join-entry.png。join-qr.png是单独二维码，可在版面空间有限时搭配此前的登录截图使用。

二维码内容：
https://itsangelia.github.io/public-map-project/campus-f3cd85c8e3d0eaa9.html?room=campus

第二页不建议将全部组合图缩成一排，避免代码太小。可以选配置裁切图、结构图及单独二维码；加入界面大图可留到手机流程页。

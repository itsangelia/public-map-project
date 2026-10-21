# Shared Campus — 逐页演讲稿

目标6:40，包含75秒视频和60秒现场演示。中文仅供理解，不要两种语言各读一遍。

## 1. Shared Campus | 0:00–0:20

Hello, today I’m presenting Shared Campus: a multiplayer campus map designed to make a first connection feel less awkward. People join on their own phones, see one another on a public screen, and choose a small activity to share.

**中文理解：** 大家好，今天展示的是 Shared Campus：一个希望降低初次交流压力的多人校园地图。参与者用自己的手机加入，在公共大屏上看见彼此，并选择一个简短的共同活动。

**操作提示：** 介绍项目，不要逐个列举功能。填上你的名字。

## 2. A small invitation to connect | 0:20–0:55

My social focus is connection, especially the first interaction between international students who may not already know each other. Instead of asking strangers to begin a conversation, I offer something they can do together. The map also supports joy through playful outcomes, and reflection through shared wishes. These are design intentions, rather than measured social outcomes.

**中文理解：** 核心社会目标是连接，特别是不熟悉彼此的国际学生之间的第一次互动。我没有要求陌生人先开口聊天，而是提供可以共同完成的小事。趣味结果带来快乐，许愿树提供表达与反思的空间。这些是设计目标，不代表已经测量并证明能改善孤独感或归属感。

**操作提示：** 清楚说出 Connection 是主要焦点；不要把设计动机说成调研结论。

## 3. One shared place. Your own way in. | 0:55–1:20

The entry flow is simple: scan the code, choose a nickname and character, and explore. The public display makes other participants visible, while each phone follows its own character. A first encounter is designed to fit within about two minutes. People can collaborate, leave a wish, listen, or observe before joining.

**中文理解：** 入口流程很简单：扫码、选择昵称和角色、进入地图。公共大屏让参与者看见彼此，手机则跟随自己的角色。第一次简短互动以约两分钟内为目标。参与者可以合作、留言许愿、听琴，也可以先观察。

**操作提示：** 指出“两分钟”指一次简短参与，不是要求在两分钟内体验完全部地图。

## 4. See the experience in use | 1:20–2:35

This short film shows how people enter the shared space and move from noticing each other to participating together.

**中文理解：** 这段短片展示参与者如何进入共享空间，并从注意到彼此，走向共同参与。

**操作提示：** 播放你实拍的75秒展示视频。当前文件没有嵌入真实参与者视频，必须替换此页占位。不要朗读拍摄分镜。

## 5. A live moment of cooperation | 2:35–3:35

Now I’ll demonstrate the drink activity with two phones. Each person makes alternating choices, and both receive the drink they created together.

**中文理解：** 现在用两台手机现场演示饮品制作。两人轮流选择，最后共同得到制作完成的饮品。

**操作提示：** 提前让两台手机加入 showcase 房间并到饮品店附近。进入匹配→A选基底→B选风味→A选配料→B选装饰→同时展示同一饮品结果→返回地图。控制在60秒内。

## 6. Social UX: connect theory to decisions | 3:35–4:15

Visible avatars help people notice others. QR entry makes joining easy. Alternating drink choices give both players influence, while fishing needs cooperation. Wishes support quieter expression; the piano includes listeners. Clear exits and automatic release help people share access. I will connect these decisions to the six principles using our course’s exact terminology.

**中文理解：** 这个设计提供了多种参与方式。可见的角色让人注意到他人；简短入口降低参与门槛；共同配方让两人都能影响结果，分工钓鱼则需要协作。许愿支持较安静的表达，钢琴让聆听也成为参与。清晰退出与钢琴8秒无操作让位，也帮助大家共享使用机会。正式版需用课堂六原则的准确术语解释这些决定。

**操作提示：** 待补：请提供课堂六原则名称和课件来源。当前六张卡片是项目设计证据，不是擅自命名的课堂理论。最终演讲替换最后一句，并为每项原则指出一个具体案例。

## 7. A campus that feels inviting | 4:15–4:45

Rather than a linear story, the experience uses a familiar campus setting as its narrative frame. Warm colours, illustrated characters and consistent activity icons create a welcoming atmosphere. Nearby objects glow to invite interaction. Shared drinks, unexpected fish and music provide small sensory rewards, while the public screen makes these individual actions part of a collective scene.

**中文理解：** 体验没有使用线性剧情，而是把熟悉的校园作为叙事框架。暖色、插画角色和统一活动图标营造友好的氛围。靠近时发光的入口引导探索；饮品、意外的鱼和音乐带来小小的感官回报，公共大屏则把个人行动呈现在同一个场景里。

**操作提示：** 结合截图说明视觉和声音怎样服务体验，不只说“好看”。

## 8. Refinement came from specific problems | 4:45–5:25

Development was iterative. Early multi-device checks exposed missing players and unreliable message visibility, so presence and shared state needed refinement. Phone feedback led to a larger local view, less empty space and slower movement. Fishing feedback led to smoother display and more forgiving timing. The piano changed from a separate-looking screen to controls over the live map, with clearer spacing and automatic release after eight seconds without a note. The unused streetlight placeholder was removed.

**中文理解：** 开发是逐步迭代的。早期多设备检查发现玩家缺失、消息显示不稳定，因此改进了在线状态和共享数据。手机反馈促使我放大局部视角、减少留白并减慢移动；钓鱼反馈带来了更平滑的显示与更宽松的时机；钢琴则从类似独立页面改为地图上的操作面板，并增加按键间距和8秒无音符自动让位。未完成的路灯占位功能最终被删除。

**操作提示：** 这些是本项目对话和开发记录可支持的迭代，不要称为正式访谈或大样本用户测试。A1原提案未提供；如有不同，应补上一句最重要的变化。

## 9. Technology supports the social experience | 5:25–6:00

The original p5.js project remains the foundation. Firebase shares positions and activity state; GitHub Pages hosts the site. Phones provide personal control, and the screen provides a common view. I checked simulated clients, browsers and actual devices, including iPhone sound. Exhibition still needs stable internet, charged devices and a recorded backup.

**中文理解：** 原有p5.js项目仍然是基础。Firebase同步玩家位置和活动状态，GitHub Pages托管页面。手机负责个人操作，大屏提供共同视角。开发检查包括独立模拟客户端与浏览器测试；实际手机测试也在修复后确认了iPhone出声。展览时仍需准备稳定网络、充足电量和录像备份。

**操作提示：** 不要把26项自动测试说成26位用户；不要声称在所有设备、所有网络环境下都稳定。

## 10. A complete prototype — with honest limits | 6:00–6:35

People can watch, listen, leave a wish or cooperate. The value is in these small invitations. I used generative AI for parts of the code, debugging, artwork and presentation, then selected, tested and refined its outputs. Next, I would observe whether unfamiliar participants can begin an interaction independently, rather than adding more activities.

**中文理解：** 最终体验提供不同程度的社交投入：观看、聆听、留下愿望，或共同合作。价值不在功能数量，而在这些功能创造的小邀请。我在部分代码、调试、活动素材及演示准备中使用了生成式AI，再进行选择、测试与调整。下一步更值得观察不熟悉的参与者是否能独立开始有意义的互动，而不是继续堆加功能。

**操作提示：** 务必核实并补齐AI来源、导师批准和单元允许范围。不要把AI辅助内容宣称为完全独立编写或手绘。

## 11. Thank you | 6:35–6:40

Thank you. I’d like to invite you to try the map together.

**中文理解：** 谢谢，欢迎大家一起体验这个地图。

**操作提示：** 参考资料页保留在屏幕上；不逐条朗读参考文献。


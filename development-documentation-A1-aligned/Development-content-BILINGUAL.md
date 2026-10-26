# Shared Campus Map — Development Documentation

## 01. From the A1 Prototype to a Shared Experience｜从A1原型到共享体验

The final A1 proposal established Shared Campus Map as a low-pressure opportunity for interaction among international and culturally diverse university students. Its research synthesis identified limited opportunities to engage beyond familiar social circles, rather than assuming that international students lacked friendships. Shared play was proposed as a reason for unfamiliar participants to notice and respond to one another.

正式A1提案将Shared Campus Map定位为一个低压力的互动机会，面向国际学生及来自不同文化背景的大学生。研究综合指出的问题是，学生跨越熟悉社交圈、与他人互动的机会有限，而不是假设国际学生缺少朋友。提案因此通过共同玩乐，为不熟悉的参与者提供注意彼此并作出回应的理由。

A1 had already developed the concept from prompt-based participation into an explorable map with avatars and shared activities. It also included a single-user p5.js prototype testing nickname entry, three avatar choices, confirmation and keyboard movement. However, QR connection, phone control, real-time multiplayer and shared activities remained unimplemented.

A1阶段已经完成了从提示问答到可探索地图、角色和共享活动的概念发展，也制作了单人p5.js原型，测试昵称输入、三种角色选择、确认进入和键盘移动。不过，二维码连接、手机控制、实时多人联机及共享活动尚未实现。

A2 therefore concentrated on realising this proposed experience across separate devices. The existing prototype developed into a connected map with chat, shared wishes, collaborative drink-making, cooperative fishing and a shared piano. The principal progression was from a locally playable prototype to a shared system in which participants could see, respond to and influence one another.

A2因此着重在独立设备之间实现这一共享体验。原有原型发展为一个联机地图，加入聊天、共享愿望、合作制作饮品、双人钓鱼和共享钢琴。主要进展是从本地可玩的原型，发展为参与者能够看见彼此、作出回应并相互影响的共享系统。

## 02. Extending the A1 Technical Prototype｜扩展A1的技术原型

A1’s technical exploration tested a single-user interaction flow: entering a nickname, selecting one of three avatars, confirming entry and moving through the map with arrow keys. This established the local interaction before the multiplayer system was developed. A2 retained the p5.js foundation while extending input and shared data across devices.

A1的技术探索测试了单人互动流程：输入昵称、从三种角色中选择、确认进入，以及使用方向键在地图中移动。这为多人系统开发前的本地交互奠定了基础。A2保留p5.js框架，将输入与共享数据扩展到多个设备。

The phone now follows its own character, while the public display provides an overview of the campus. Firebase Realtime Database synchronises player positions and activity data, and GitHub Pages provides the web entry point used by the QR code. This implements the public-screen and personal-phone arrangement proposed in A1, informed by its analysis of MMM Ball’s browser-based participation. The join page accepts a nickname and one of three avatars: male, female or shopping bag. Players enter the same room without creating a permanent account.

手机视角现在跟随各自的角色，公共大屏则提供校园全景。Firebase Realtime Database同步玩家位置和活动数据，GitHub Pages提供二维码指向的网页入口。这实现了A1提出的公共屏幕与个人手机分工；A1对MMM Ball浏览器参与方式的分析也为这一安排提供了参考。加入页面支持填写昵称，并从男性角色、女性角色或购物袋三种形象中选择。参与者无需创建永久账号，即可进入同一房间。

Activities introduced further synchronisation requirements. Drink-making needs a common turn sequence and recipe; fishing combines separate directional inputs; the piano requires a single performer state. Messages and wishes must also reach other participants. The technical development therefore extended beyond map navigation to maintaining agreement between individual controls and shared outcomes.

活动的加入带来了进一步的同步需求。饮品制作需要共同的轮次顺序和配方；钓鱼结合两人的方向输入；钢琴需要保持同一时间只有一位演奏者的状态。消息和愿望也需要传递给其他参与者。因此，技术开发不仅涉及地图导航，也需要确保个人操作与共享结果之间保持一致。

## 03. Resolving Multi-Device Visibility Problems｜解决多设备玩家可见性问题

Multi-device checks revealed a recurring problem: a second phone could enter the map without seeing the first player, and the public display sometimes showed only one participant. A connection status alone was therefore insufficient evidence that the shared experience was functioning.

多设备检查发现了一个反复出现的问题：第二台手机能够进入地图，却看不到第一位玩家，公共大屏有时也只显示一名参与者。因此，仅凭连接状态不能证明共享体验已经正常运行。

These failures affected the distinction established in A1 between occupying the same space and responding to other participants. Participants needed to recognise one another before they could communicate or cooperate. Development consequently returned to the joining process, room state and independent player connections. The resulting implementation maintains distinct player identities and connection records so that separate phones can control separate characters.

这些故障影响了A1所强调的区别：共同存在于一个空间，并不等于参与者能够回应彼此。参与者需要先识别其他人，才能交流或合作。因此，开发重新关注加入流程、房间状态及独立的玩家连接。当前实现采用不同的玩家身份与连接记录，使不同手机能够分别控制各自的角色。

Checks compared movement and player visibility across two phones and the public display. Later feedback confirmed successful shared presence, although similar problems had reappeared after earlier checks. This made repeated verification necessary when reviewing subsequent versions. The criterion for a working map became more specific: each player needed to join, retain independent control and remain visible on another device. This was more meaningful than relying on a successful page load or connection label. Connection and player-count information assist these checks. Reconnection logic republishes the player’s latest known position rather than treating a network return as a new shared character.

检查通过两台手机和公共大屏对比角色移动与可见性。后续反馈确认了共同在场能够正常显示，但类似问题也曾在早期检查成功后再次出现。因此，后续版本需要反复验证。判断地图是否正常运行的标准也更加具体：每位玩家都需要能够加入、保持独立控制，并在另一台设备上持续可见。这比仅确认页面打开或出现连接标签更有意义。连接状态与玩家数量信息用于辅助检查。重新连接时，系统重新发布玩家最近的位置，而不是将网络恢复当作另一个共享角色。

## 04. Mobile Viewport and Movement Refinement｜手机视角与移动操作的完善

Moving beyond A1’s keyboard-based prototype required a usable portrait phone view. Early mobile layouts allocated insufficient space to the map. A substantial blank area remained below the scene, the character appeared small, and the map did not extend behind the virtual controls. This reduced the usable presentation area on a portrait screen.

从A1的键盘操作原型发展到手机控制，需要适合竖屏的可用视角。早期手机布局为地图分配的空间不足：场景下方保留了较大的空白，角色显得偏小，地图也没有延伸到虚拟控制器后方。这减少了竖屏中用于呈现地图的有效面积。

The layout was revised so that the map fills the available view and the joystick overlays the scene. The phone view was enlarged by 35%, followed by a 20% reduction in movement speed. These adjustments responded to the small character scale and the perceived speed of movement within the closer view. The public display retained its overview, allowing the two screen types to serve different purposes. A virtual joystick supports touch movement, the camera follows the local character and overhead nicknames identify players. Chat remains accessible from a separate phone control.

修改后的地图填满可用视区，摇杆叠加在场景之上。手机视角放大了35%，随后将移动速度降低20%。这些调整回应了角色比例偏小，以及近距离视角中移动显得过快的问题。公共大屏继续保留全景，使两类屏幕承担不同作用。虚拟摇杆支持触控移动，镜头跟随本地角色，角色头顶的昵称用于识别玩家。手机上还保留独立的聊天入口。

The revision involved a trade-off between local detail and surrounding context. A closer view improves character visibility but displays less of the campus at once. The selected scale reflects development trials and feedback rather than a measured optimum. This stage demonstrated the importance of checking the complete phone layout, including controls and unused space, rather than evaluating the map image independently.

这项修改需要在局部细节与周边环境之间取舍。更近的视角提高了角色可见性，但同时减少了屏幕中可见的校园范围。最终比例来自开发试用与反馈，并非经过测量得出的最优值。这一阶段体现了检查完整手机布局的重要性：控制区与空白区域同样影响体验，不能只单独评估地图图像。

## 05. Developing the A1 Visual Direction｜发展A1提出的视觉方向

A1 established a soft fantasy-game direction through pastel colours, chibi characters and illustrated 2D environments. The existing campus and character artwork provided the starting point for A2. New activity entrances needed to remain recognisable while fitting this established setting.

A1通过粉彩配色、Q版角色和插画式二维环境，确立了柔和的奇幻游戏风格。已有校园和角色素材成为A2的起点。新增活动入口既需要容易辨认，也需要融入原有场景。

Several early generated options appeared overly saturated or detailed, leading to revisions towards softer colours, simpler forms and clearer outlines. Evaluation also considered each image within the map. The drink shop was enlarged, widened and repositioned; the fishing entrance used two rods and a lighter water surface without visible fish; the piano entrance was developed without a wooden sign.

部分早期生成方案显得过于饱和或细节过多，因此后续修改采用更柔和的颜色、更简洁的形态与更清晰的描边。评估也考虑图像在地图中的实际表现：饮品店被放大、加宽并调整位置；钓鱼入口采用两根鱼竿和较浅的水面，不显示鱼；钢琴入口则不使用木牌。

These decisions developed the proposed visual direction through actual assets and placement. The campus functions as a setting for exploration rather than a fixed storyline. Familiar locations give activities context, while consistent proximity effects indicate opportunities to interact. The environment, responsive entrances and piano sound connect separate activities within one shared place, helping participants recognise both the setting and the actions available within it. The wishing tree, drink shop, fishing pond and piano each use approach cues, clickable entrances and a route back to the map.

这些决定通过实际素材与位置安排，进一步发展了原有视觉方向。校园提供探索的场景，而非固定剧情。熟悉的地点为活动提供背景，统一的靠近效果提示可以互动的位置。环境、会回应玩家的入口及钢琴声音将不同活动连接在同一个共享空间中，帮助参与者理解场景与可执行的操作。许愿树、饮品店、钓鱼池和钢琴均配有靠近提示、可点击入口以及返回地图的方式。

## 06. Communication Through Chat and Shared Wishes｜通过聊天与共享愿望进行交流

Chat supports immediate communication in the shared map. Players open the phone chat control and type a message, which is received by other players and appears above the sender’s character. The bubble disappears after five seconds, preventing old messages from remaining over the scene.

聊天支持共享地图中的即时交流。玩家通过手机聊天入口输入文字，其他玩家能够收到消息，文字显示在发送者角色头顶。气泡在五秒后消失，避免旧消息持续覆盖场景。

The central wishing tree offers a persistent contribution. Its proximity cue invites players to open the tree interface, write a wish and select “Hang wish”. The composer retains the player’s nickname. The shared tree displays hanging notes, the total number of wishes and page navigation for browsing additional notes.

中央许愿树支持保留贡献。靠近提示引导玩家打开树的界面，写下愿望并选择“Hang wish”。编辑界面保留玩家昵称。共享树显示悬挂的纸条、愿望总数，并提供翻页功能以浏览更多纸条。

Opening a note reveals the full wish, nickname and date within the framed-paper layout. Short previews and gentle movement encourage discovery. Earlier previews exposed too much text, so they were shortened to a brief opening of up to approximately five English words, leaving the complete message inside the note.

打开纸条后，可在带边框的纸张布局中查看完整愿望、昵称和日期。简短预览与轻微摆动鼓励发现。早期预览显示了过多文字，因此缩短为最多约五个英文词的开头，将完整内容保留在纸条内。

The “May it come true” button adds a blessing and updates the shared count. Each player can bless a particular wish once. This provides acknowledgement without requiring another written message. Closing the note or leaving the tree returns participants to browsing or the map.

“May it come true”按钮用于送上祝福，并更新共享数量。每位玩家对同一愿望只能祝福一次。这让参与者无需另写留言，也能作出回应。关闭纸条或离开许愿树后，可以继续浏览或返回地图。

## 07. Collaborative Drink-Making and Visible Choices｜合作制作饮品与可见的选择结果

The drink activity develops A1’s proposal for short shared play through a two-player matching interface with nicknames and avatar portraits. The pair alternate across four stages: base, flavour, topping and decoration. Each stage has three options, producing 81 possible recipe combinations.

饮品活动通过显示昵称和角色头像的双人匹配界面，发展了A1关于简短共享玩乐的构想。两人依次在基底、风味、配料和装饰四个阶段轮流选择，每个阶段有三个选项，共可形成81种配方组合。

The bases are sparkling water, milk tea and slush; flavours are strawberry, matcha and mango; toppings are pearls, coconut jelly and red bean; decorations are milk foam, ice cream and a lemon slice. Each selection changes the drink, and a “Your turn” notification identifies who can act next.

基底包括气泡水、奶茶和冰沙；风味包括草莓、抹茶和芒果；配料包括珍珠、椰果和红豆；装饰包括奶盖、冰激凌和柠檬片。每次选择都会改变饮品，“Your turn”提示标明接下来可以操作的玩家。

Early feedback indicated that ingredient changes were not visually distinct enough. Revisions strengthened these differences while retaining the selected colour palette and upright cards. Cup logos, straws and the bottom shadow were removed from the visual treatment.

早期反馈指出，原料变化的视觉区别不够明显。修改增强了这些差异，同时保留已选配色和端正的选择卡片。视觉呈现中移除了杯身标志、吸管及底部阴影。

Both players receive the same completed drink. The result screen enlarges it, displays its name and provides “Back to map”, without repeating the full selection list. The shared outcome records contributions from both participants and creates a reason to cooperate without competition.

两位玩家收到同一杯完成的饮品。结果界面将其放大、显示名称并提供“Back to map”，不再重复列出全部选择。共同结果体现双方贡献，为合作提供理由，而不需要竞争。

## 08. Cooperative Fishing: Responsiveness and Difficulty｜双人钓鱼：操作响应与难度

Fishing begins with two-player matching, nickname and avatar identification, followed by a countdown. One participant controls vertical movement and the other horizontal movement. Both influence one float, which must align with moving ripples to increase shared progress. Neither controls both axes independently.

钓鱼从双人匹配开始，通过昵称与头像识别双方，之后进入倒计时。一人控制上下，另一人控制左右。双方共同影响一个浮标，使其对准会换位的涟漪来增加共享进度，任何一人都不能独立控制两个轴向。

Development feedback identified jerky movement and excessive difficulty as separate issues. Movement was refined for visual continuity. The target range was increased by 10%, target changes extended to 3.5-second intervals and progress loss reduced to 4% per second. Progress starts at 20%, increases by 10% per second when aligned and ends in failure at zero; reaching 100% completes the catch.

开发反馈将移动卡顿和难度过高识别为不同问题。移动表现经过调整，以提高视觉连续性。判定范围扩大10%，目标换位间隔延长至3.5秒，进度下降降低至每秒4%。进度从20%开始，对准时每秒增加10%，降至零则失败；达到100%完成捕获。

Ripples replaced the visible fish, and the float appears partly submerged. Successful completion gives both players the same randomly revealed catch, with its image and name: Lotus Fish, Goofy Toothy, Bigmouth or Purrmaid. Failure shows Smug Finn with “The fish got away!”, without an additional escape animation. Retry and return controls support another attempt or a return to the map.

涟漪取代可见的鱼，浮标呈现为部分浸入水中的状态。成功后，双方获得相同的随机捕获结果，显示鱼的图像与名称：Lotus Fish、Goofy Toothy、Bigmouth或Purrmaid。失败时显示Smug Finn和“The fish got away!”，不增加额外逃走动画。重试与返回控件支持再次尝试或回到地图。

These revisions retain continuous cooperation while making the task more forgiving. Difficulty adjustment remains distinct from synchronisation work: easier settings cannot resolve network or rendering problems by themselves.

这些修改在保留持续合作的同时提高容错。难度调整仍与同步处理分开：更容易的参数无法单独解决网络或渲染问题。

## 09. Shared Piano: Audio, Occupancy and Access｜共享钢琴：音频、占用与使用机会

The piano is opened as an on-map panel with 21 numbered keys arranged in three rows. “Start playing” claims the instrument for one performer. Other players can listen across the map after enabling sound, with volume responding to distance from the piano. A sound control enables playback or mutes it.

钢琴以地图内面板打开，包含三排共21个数字音键。“Start playing”让一名演奏者占用乐器。其他玩家开启声音后可以在地图中聆听，音量随与钢琴的距离变化。声音控件用于开启播放或静音。

Selecting an occupied piano shows the performer’s nickname rather than a duplicate keyboard. Listeners do not receive synchronised key highlights. The map entrance responds during performance with movement and musical-note effects, making the activity visible to others.

点击被占用的钢琴时，显示演奏者昵称，而不是另一套键盘。听众不会接收同步的按键高亮。地图入口在演奏时产生动作和音符效果，让其他人注意到正在进行的活动。

An eight-second period without a note releases the seat; further notes refresh that period. Players can also finish playing or close the panel. The controls remain separated from the exit to reduce accidental selection. These mechanisms clarify occupancy and prevent an idle session from retaining the shared instrument.

八秒内没有按下音符会释放座位，继续弹奏则重新计算这一时段。玩家也可以主动结束弹奏或关闭面板。键盘与退出控件保持间距，以减少误触。这些机制明确占用状态，并避免闲置会话持续占据共享乐器。

Technical checks exposed a separate audio problem: on an iPhone, keys changed colour without producing sound. Database permissions and browser audio activation required separate attention. Following these changes, device feedback confirmed audible playback. The issue demonstrated why a visible response could not establish that the full interaction was functioning.

技术检查还发现了独立的音频问题：iPhone上的按键会变色，却没有声音。数据库权限与浏览器音频激活需要分别处理。调整后，设备反馈确认能够听到声音。这说明，可见回应不能证明整个交互已正常运行。

## 10. Testing Evidence and Responses to Feedback｜测试证据与反馈回应

A1 tested the local joining and navigation flow. A2 extended these checks to separate devices and shared activities, using repeated device checks and feedback recorded during production. Checks examined whether separate phones controlled distinct characters, whether messages reached another player, whether activity states agreed and whether piano audio was audible on an iPhone.

A1测试了本地加入与导航流程。A2将检查扩展到独立设备和共享活动，并使用开发期间反复进行的设备检查与反馈。检查内容包括：不同手机能否控制不同角色，消息能否传递给另一位玩家，活动状态是否一致，以及iPhone上能否听到钢琴声音。

The findings required different responses. Missing players directed attention to shared presence; silent keys required audio checks; unclear ingredient changes required stronger visual feedback. These examples show why functionality and interaction clarity needed to be reviewed separately. A system could accept an input without communicating its effect adequately.

不同发现需要不同回应。玩家缺失使开发重新关注共享在场；按键无声需要音频检查；原料变化不明显则需要更清楚的视觉反馈。这些例子说明，功能运行与交互表达需要分别评估。系统可能接受了输入，却没有充分传达其结果。

Some problems reappeared after earlier checks, making repeated verification important as new activities were introduced. The accompanying table records observed issues, revisions and reported outcomes. These records document development testing rather than an independent audience study. They support specific claims about the versions checked, but do not establish universal reliability or social impact. Further evaluation should use the exhibition environment and unfamiliar participants, including the time required to join, match and complete an activity.

部分问题在早期检查后再次出现，因此，加入新活动时反复验证十分重要。配套表格记录观察到的问题、修改与反馈结果。这些记录属于开发测试，而非独立的观众研究。它们能够支持对所检查版本的具体判断，但不能证明普遍稳定性或社会效果。进一步评估应在展览环境中与不熟悉项目的参与者进行，并计入加入、匹配和完成活动所需的时间。

## 11. Developing the Six Social UX Principles｜发展六项Social UX原则

A1 identified Social Dynamics and Proactivity & Clarity as particularly important. A2 developed these intentions through implemented interactions and device feedback.

A1将社会动态及主动引导与清晰性视为尤其重要的原则。A2通过实际交互和设备反馈进一步发展了这些设计意图。

Sensory Feedback. Piano sound extends A1’s visual selection and movement feedback. The iPhone audio issue demonstrated the need to check the audible response independently.

感官反馈（Sensory Feedback）。钢琴声音扩展了A1已有的角色选择与移动视觉反馈。iPhone的音频问题说明，需要单独检查声音回应。

Embodied Interaction. Phone-based movement and activity controls realise the proposed personal-controller role, although embodiment remains mediated through a touchscreen.

具身互动（Embodied Interaction）。手机移动与活动控制实现了个人控制器的角色，不过，这种具身互动仍通过触屏进行。

Social Dynamics. Alternating drink choices and divided fishing controls give both participants influence over one outcome. This develops A1’s distinction between co-presence and meaningful shared play, relating to the course’s discussion of computer-supported cooperative work.

社会动态（Social Dynamics）。轮流选择饮品原料与分配钓鱼方向，让双方都能影响同一结果。这发展了A1对共同在场与有意义的共享玩乐的区分，也对应课堂中计算机支持协同工作的讨论。

Resilience & Motivation. Revised fishing settings and retry make the task more forgiving while retaining coordination.

韧性与动机（Resilience & Motivation）。修改后的钓鱼参数与重试功能在保留配合要求的同时，增加了容错。

Proactivity & Clarity. QR entry, proximity effects and turn notifications communicate where and how to participate, acting as signifiers.

主动引导与清晰性（Proactivity & Clarity）。二维码入口、靠近效果与轮次通知作为signifiers，传达何处可以参与，以及怎样参与。

Ethics & Inclusion. The non-human avatar option identified in A1 was retained. Sound control, exits and piano release further support choice and access. Phone ownership, connectivity, language, visual controls and public messages remain inclusion and privacy concerns.

伦理与包容（Ethics & Inclusion）。A1提出的非人类角色选项得到保留。声音控制、退出和钢琴让位进一步支持选择与使用机会。不过，手机拥有情况、网络、语言、视觉操作和公开留言仍涉及包容性与隐私问题。

## 12. Evaluation Against the A1 Design Criteria｜依据A1设计准则进行评估

A1 defined the experience as low-pressure, spontaneous, shared, playful and socially meaningful. The final prototype addresses these criteria through browser entry, optional activities and several ways to participate. Visitors can exchange messages, contribute a wish, coordinate a task or listen to another player. Each activity gives participants a potential reason to notice or respond to someone else.

A1将体验定义为低压力、可随时加入、共享、富有趣味且具有社会意义。最终原型通过浏览器入口、可自由选择的活动，以及多种参与方式回应这些准则。访客可以交流消息、留下愿望、协调任务或聆听他人演奏。每种活动都为参与者注意或回应其他人提供了潜在理由。

The central evaluation question remains whether shared play leads to meaningful interaction between unfamiliar participants. Successful synchronisation or task completion cannot establish this alone. Observation would be needed to examine how players encounter one another, understand their roles and communicate during or after an activity. This follows A1’s social intention of creating an opportunity for connection without guaranteeing friendship.

核心评估问题仍是：共享玩乐能否促成陌生参与者之间有意义的互动。仅凭同步成功或任务完成无法证明这一点。需要观察玩家怎样遇见彼此、理解各自角色，以及是否在活动中或活动后交流。这延续了A1的社会意图：为连接创造机会，而不保证形成友谊。

A1 also proposed a public display with a nearby standing area and personal-phone control. Exhibition preparation must test this arrangement with the actual network and devices. The intended route of joining and completing one activity aims for approximately two minutes, including matching, but requires timed rehearsal. Phone activity screens must also be visible during demonstration, with a recorded fallback for connection failures.

A1也提出了公共大屏、附近站立区域与个人手机控制的空间安排。展览准备需要使用实际网络和设备测试这一布局。加入并完成一个活动的预期路径，以包括匹配在内的约两分钟为目标，但仍需计时排练。演示中还需要让观众看清手机活动界面，并准备录像以应对连接故障。

## 13. AI Use and Design Authorship｜AI使用与设计作者贡献

Generative AI assisted code development, debugging, iteration planning and written drafting. Image-generation tools also supported selected activity images and refinements. The existing map and character assets were retained as separately supplied artwork.

生成式AI辅助了代码开发、调试、迭代规划和文字初稿。图像生成工具也支持了部分活动图像与修改。原有地图和角色被保留为单独提供的素材。

My contribution involved establishing the social direction, defining activity rules, evaluating visual options and specifying revisions in response to device feedback. Recorded decisions include rejecting overly saturated images, clarifying ingredient changes, adjusting fishing difficulty and retaining the piano within the map. These examples identify how assisted outputs were selected and adapted to the project’s requirements.

我的贡献包括确立社会目标、定义活动规则、评估视觉方案，以及根据设备反馈提出修改。记录中的决定包括拒绝过于饱和的图像、增强原料变化、调整钓鱼难度，以及让钢琴保留在地图内。这些例子说明，辅助输出如何根据项目要求被选择和调整。

This document was also prepared with AI assistance. Its descriptions must be checked against the implemented prototype and supported by appropriate evidence. Asset records need to distinguish supplied, generated and refined material, with original sources and permissions identified separately. Tutor approval for AI use and the required declaration remain to be verified before submission. Clear attribution is necessary to distinguish the tools used from the design decisions and refinement undertaken during development.

本文档也使用AI辅助准备，其描述需要与实际原型核对，并由适当证据支持。素材记录需要区分提供、生成与修改的内容，分别明确原始来源和许可。AI使用的导师批准与所需声明仍需在提交前核实。清楚的归属说明有助于区分工具用途，以及开发过程中作出的设计决定与完善工作。


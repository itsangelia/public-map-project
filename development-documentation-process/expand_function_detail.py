from pathlib import Path
import json
O=Path('/workspace/development-documentation-process');D=json.loads((O/'process-content.json').read_text())
def add(n,idx,en,zh):
 p=D[n-1];a=p['en'].split('\n\n');b=p['zh'].split('\n\n');a[idx]+=' '+en;b[idx]+=zh;p['en']='\n\n'.join(a);p['zh']='\n\n'.join(b)
add(2,1,'The joining page combines nickname entry, avatar selection and confirmation before the character appears on the shared map.','加入页将昵称输入、角色选择及确认结合，之后角色才出现在共享地图。')
add(4,0,'The joystick supports directional dragging at a controlled speed, and the camera stops at map boundaries rather than exposing space outside the artwork.','摇杆支持以受控速度按方向拖动，镜头在地图边界停止，避免显示画面之外的区域。')
add(5,0,'Text input is limited to 80 characters; quick reactions use the same sending path as typed messages.','文字输入限制为80个字符，快捷反应与输入消息使用同一发送路径。')
add(7,0,'A 160-character limit and counter bound the contribution.','160字符限制及计数器限定贡献长度。')
add(7,2,'Players can close an individual note, continue browsing or return to the map through the tree’s back control.','玩家可以关闭单张纸条、继续浏览，或通过许愿树返回控件回到地图。')
add(8,1,'The selected note displays the shared count and the current identity’s blessing state, with duplicate submissions blocked.','所选纸条显示共享数量和当前身份的祝福状态，并阻止重复提交。')
add(9,0,'The first player waits for a partner; only the participant whose turn is active can confirm the next choice.','首位玩家等待搭档，只有当前轮到的参与者能够确认下一次选择。')
add(9,2,'The completion also identifies the two makers, and both phones show the same named drink.','完成页还标明两位制作者，两台手机显示同一杯有名字的饮品。')
add(10,0,'Both players see matching nicknames and portraits, but receive only their assigned directional controls beside the same pond and progress state. One pair occupies the pond; an additional visitor receives a busy message and retry option.','双方看到匹配昵称和头像，但在相同池塘与进度状态旁，只获得各自分配的方向控制。一个池塘由一组双人占用，额外访客看到忙碌提示及重试入口。')
add(12,0,'The key rows represent low, middle and high registers. The public display starts muted, so presentation sound requires an explicit enable action.','音键三排分别代表低、中、高音区。公共大屏默认静音，演示声音需要明确开启。')
(O/'process-content.json').write_text(json.dumps(D,ensure_ascii=False,indent=2))
# Preserve the reviewed patch file to keep regeneration repeatable.
print('Expanded player flow,waiting/occupied states,controls,reading/blessing states and result details.')

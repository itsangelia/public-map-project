# Shared Campus — Development Documentation

English body copy for 13 planned content pages. Cover and references are separate. Layout and evidence must be added before PDF submission.

## 01. From Initial Concept to Working Experience

Shared Campus is a browser-based social experience that connects personal phones to a shared illustrated campus on a public display. My initial concept focused on international students and the awkwardness of approaching someone unfamiliar. QR entry, avatars, free exploration and cooperative activities were already part of that concept; they were not new ideas introduced during final development.

The initial proposal also described everyday cultural prompts, shared visual outcomes and a possible token system. The final version retains the connection goal, but develops it through chat, a wishing tree, collaborative drink-making, cooperative fishing and a shared piano. Tokens were not implemented. Participation can be immediate, such as chatting or playing together, or asynchronous, such as reading and blessing a wish.

The main development challenge was turning a proposed shared space into a usable experience across separate devices. This document records the implementation, problems, revisions and remaining limitations. It does not treat a completed prototype as evidence that social belonging has improved.

*Source basis: Initial concept: Social Interactive.pptx, slides 2, 5, 7–8; project development record.*

## 02. Development Stages and Technical Structure

Development progressed from the existing p5.js map to shared player presence, communication and individual activity systems. The illustrated map and supplied characters remained the visual foundation. I added activities incrementally and returned to the shared-map experience when new problems appeared.

The system separates the shared world from each device’s view. Phones provide individual input and follow their own characters; the public display presents the common map. Firebase Realtime Database distributes player and activity data, while GitHub Pages provides a reachable web entry point. This makes it possible for separate phones to participate without installing an application.

The architecture needed to support more than movement. Messages, wishes, drink turns, fishing controls and piano occupancy each required shared state. A coherent room is therefore central to the experience: participants need to join the same room and receive compatible state. Successful local rendering alone cannot establish that multiplayer interaction works.

*Source basis: Project source: sketch.js and multiplayer/activity modules; p5.js, Firebase and GitHub Pages documentation.*

## 03. Making Other Players Reliably Visible

A recurring problem was that a second device could enter the map without seeing the other player, or the display appeared to contain only one participant. This was especially disruptive because seeing another person is the starting condition for the social experience. A connection label did not, by itself, demonstrate that all players had been received and rendered.

The multiplayer implementation uses distinct player identities and connection records rather than treating every phone as one shared character. Reviewing the join flow, room state and player updates became a priority. The useful check was an independent display and two phones, each controlling a separate character, rather than several views of one session.

Subsequent device feedback confirmed occasions when both players became visible and could interact. Earlier failures also returned during development, so these confirmations should not be presented as proof of reliability under every network condition. The important lesson was to verify shared presence again when introducing a new feature, rather than assuming that a working local screen guaranteed a working shared experience.

*Source basis: Development conversation and multiplayer.js. Reported device checks are not a formal participant study.*

## 04. Refining the Phone View and Movement

The early phone layout left a large empty area below the map. The character appeared small, and the map did not extend far enough behind the virtual controls. Although the world was visible, the screen did not give enough space to the part of the experience the player was actively using.

The revised layout fills the available map area and places the joystick over the scene. The phone view was enlarged by 35%, and movement speed was reduced by 20% after visual trials. These changes made the local view more readable while reducing the feeling of moving too quickly through the enlarged scene. The public display retained its overview role.

This iteration showed that the same world needs different presentations on a phone and a large screen. It also exposed a trade-off: increasing local scale improves character visibility but reduces how much surrounding space can be seen. The final values reflect development feedback and visual preference; they are not the result of a measured accessibility or navigation study.

*Source basis: Development feedback and phone-interface screenshots; sketch.js and styles.*

## 05. Developing a Consistent Visual Language

The existing illustrated campus and characters established the visual direction. New activity entrances needed to belong to that world while remaining recognisable as interactive objects. I reviewed multiple versions rather than accepting the first generated image as a finished asset.

Feedback repeatedly identified excessive saturation, unnecessary detail and a strong “AI-generated” appearance. Revisions moved towards softer colours, simpler forms and clear outlines. Individual decisions also mattered: the drink shop was widened and repositioned, the fishing entrance used two rods and a lighter water surface without visible fish, and the piano entrance avoided a wooden sign.

Scale and placement were refined within the map, rather than judging the icons only as isolated illustrations. Proximity effects provided a consistent invitation to interact. This process combined asset selection, visual adjustment and contextual checking. The original map and avatar artwork were retained; their authorship should remain separate from the AI-assisted activity assets.

*Source basis: Development asset iterations. Attribute supplied artwork and AI-assisted media individually in the media register.*

## 06. Chat and Wishes: Two Speeds of Participation

Chat and the wishing tree support different forms of contribution. Typed chat appears above a character and disappears after five seconds, providing an immediate way to address other players without keeping a permanent speech bubble over the map.

The wishing tree retains a contribution for later discovery. Players open the tree interface, write a wish and hang a note. Other visitors can view a short preview, open the full message with its nickname and date, and add a blessing. The preview and gentle movement developed from a specific concern: visitors needed a reason to click someone else’s wish. Showing the entire message on the tree removed that reason, so the preview was shortened to roughly four or five English words.

The blessing button adds a small response that does not require composing another message. These features create opportunities for expression and acknowledgement, but their availability does not demonstrate that strangers feel connected. Publicly readable text also creates privacy and moderation responsibilities.

*Source basis: chat.js, wishing-tree modules and development feedback on previews and blessings.*

## 07. Drink-Making: Sharing Decisions

The drink shop turns collaboration into a sequence of small decisions. Two players match with visible nicknames and character portraits. They alternate across four stages: base, flavour, topping and decoration. Each stage has three options, allowing 81 recipe combinations. The final named drink reflects choices made by both participants.

Early visual feedback identified that changing an option did not produce a sufficiently noticeable change in the drink. The development priority was therefore to make ingredient changes distinguishable while keeping the approved visual style. A “Your turn” notification clarifies who can act. The selection cards were kept upright, while unnecessary cup logos, straws and base shadows were removed.

The result screen enlarges the completed drink and provides a clear return to the map. There is no individual winner: each player influences the same outcome. This is a concrete mechanism for shared participation, although conversation between the players remains optional rather than guaranteed.

*Source basis: Drink-maker implementation and recorded interface feedback.*

## 08. Fishing: Balancing Cooperation and Forgiveness

Fishing requires two players to coordinate one float. One controls up and down, while the other controls left and right. Neither controls both axes alone. After a countdown, they aim the float at moving ripples to build shared progress. The target is represented by water movement rather than a visible fish, allowing the catch to remain a surprise.

Development feedback identified jerky movement and an overly difficult challenge. Revisions included smoother visual movement and more forgiving settings: the alignment range increased by 10%, target changes were spaced at 3.5 seconds, and progress loss when misaligned was reduced to 4% per second. Progress begins at 20% and increases by 10% per second while aligned; reaching zero fails the attempt.

Success reveals one of four named fish, while failure shows a static escape result and offers another attempt. These changes support continued play without removing the need for cooperation. Reducing difficulty addresses challenge, but it should not be used as a substitute for fixing network or rendering problems.

*Source basis: Fishing modules and requested difficulty adjustments; Session 2, pp. 8, 10, for cooperation and forgiving interaction.*

## 09. Piano: Performance, Listening and Fair Access

The shared piano introduces participation through both performance and listening. One person occupies the instrument and plays a three-row, 21-key interface. Other players can listen after enabling sound, while an occupied notice identifies the performer. The activity icon responds visually during use.

Technical development included database permission setup and an iPhone audio issue: keys changed colour, but no sound was heard. This distinguished a working visual response from successful audio output. After changes to audio activation and recovery, device feedback confirmed that sound could be heard. This confirmation applies to those checks, not every possible browser or device.

The interaction was also changed from a separate page to a panel within the map, keeping the shared setting visible. Controls were moved away from the exit to reduce accidental taps. Eight seconds without a note releases the seat, preventing an idle session from indefinitely holding the instrument. Sound control, clear exits and automatic release support participant choice and shared access.

*Source basis: Shared-piano modules and iPhone device feedback; MDN Web Audio API documentation.*

## 10. Testing, Feedback and Responsive Changes

Testing used independent browser/device views and repeated development feedback. Checks included whether two phones could control different characters, whether another player could receive messages, whether activity outcomes agreed, and whether iPhone piano audio worked. These checks address functionality and interaction clarity; they are not a formal study of social impact.

The most useful feedback identified a concrete mismatch between the intended and actual experience. Examples included absent players, excessive mobile whitespace, weak ingredient differences, jerky fishing and silent piano keys. Each issue led to a specific revision that could be checked again. Features were not assumed to remain reliable simply because an earlier version had worked.

The evidence should show the sequence of issue, change and re-check. User confirmations in the development conversation support reported improvements, but do not establish audience numbers, universal compatibility or long-term reliability. A final exhibition rehearsal still needs the actual network, display, two phones and a visible demonstration setup. Waiting for a partner must also be included when checking the intended short encounter.

*Source basis: Development conversation, repository test records where available, and actual device screenshots.*

## 11. Reflecting on the Six Principles for Social UX

The course framework provides a way to evaluate both the strengths and limits of the final experience.

Sensory Feedback: piano sound responds to input, supported by visible key responses. Embodied Interaction: touch controls connect physical input to movement, although embodiment is limited to a phone rather than whole-body interaction. Social Dynamics: alternating drink choices and split fishing controls give participants influence over a shared outcome. This connects to the course’s discussion of computer-supported cooperative work.

Resilience and Motivation: easier fishing, clear results and retry support continued participation. Proactivity and Clarity: proximity glow and turn prompts act as signifiers, communicating available actions and current responsibility. Ethics and Inclusion: sound control, exits and piano release support choice and fair access. However, dependence on phones, internet, language and visual controls creates barriers, and public messages require care.

These examples do not mean all six principles are fully resolved. In particular, touchscreen input is a limited form of embodiment, and the prototype has not established comprehensive accessibility.

*Source basis: GRDE2053 Session 2, pp. 6, 8, 10; Session 3, p. 8; Session 5, slides 6–11. Theory discussed through the supplied lectures.*

## 12. Final Evaluation and Exhibition Readiness

The final prototype provides several levels of social involvement: noticing other avatars, exchanging a short message, leaving a wish, coordinating a task or listening to music. Participants can choose an activity instead of following one compulsory sequence. A single short encounter, rather than completion of the whole map, is the intended exhibition unit.

There is also a significant limitation in the concept’s evolution. The initial prompts explicitly invited everyday cultural sharing. The final activities offer a reason for first contact but address cultural exchange less directly. It would therefore be premature to claim that the project improves cross-cultural belonging. A useful next evaluation would observe whether unfamiliar participants begin together, understand their roles and choose to communicate beyond the task.

Exhibition preparation requires a reachable QR link, stable network, charged phones, a suitable public display and a visible way to demonstrate phone activity screens. The approximately two-minute participation target still needs timed rehearsal, including joining and matching. A recorded fallback should be available without being presented as live interaction.

*Source basis: Initial concept and development record; A2 brief, pp. 2–4.*

## 13. AI Use and My Design Contribution

Generative AI assisted parts of the prototype code, debugging, iteration planning, selected activity artwork and preparation of written material. These uses need to be documented as part of the project’s authorship rather than described as entirely independent coding or hand-drawn production.

My contribution included setting the social direction, defining activity rules, selecting and rejecting visual options, specifying revisions and reviewing the experience through device feedback. Examples include rejecting overly saturated icons, requesting more visible ingredient changes, refining fishing difficulty and keeping the piano interaction within the map. AI outputs were adapted within the existing project rather than treated as finished decisions.

The supplied map and character artwork must be credited separately from generated or refined activity assets. Individual media records should identify the source, tool, use and subsequent changes. The original creators and licences of supplied assets still require confirmation. This draft does not assert that tutor approval has been obtained: the submission must follow the unit’s permitted-use rules and include the required AI declaration.

*Source basis: A2 brief, pp. 3, 5; project development and asset records.*


# Shared Campus Map — Development Documentation

## 01. Development Starting Point and Priorities

The project began with a single-user p5.js prototype containing the campus map, nickname entry, three avatar options and keyboard movement. The initial proposal established a low-pressure shared experience for international and culturally diverse students. Development focused on turning that intention into a working interaction between phones and a public display.

The work progressed through linked stages: establishing online access and shared presence; adapting movement to phones; adding communication; developing the wishing tree, drink shop, fishing and piano; and checking the combined experience before release. Each activity introduced requirements that the original map did not address, including persistent contributions, alternating turns, divided controls and exclusive use of a shared instrument.

Development did not follow a simple sequence of completed features. Multiplayer visibility problems returned as the project grew, and interface changes required further device checks. The process therefore involved repeated movement between new interactions and the foundations they depended on. The following pages document those decisions, revisions and checks.

## 02. Establishing Online Access and Player Identity

The first technical stage connected the existing map to Firebase. A web application was registered, Anonymous Authentication was enabled, and a Realtime Database was created. The client configuration included the database URL so the browser could connect to the intended shared data. Database rules defined which player and activity records could be read or changed.

Anonymous authentication provided a temporary identity without a visible account-registration process. Connection-specific records separated each browser connection, while nicknames and the male, female or shopping-bag avatar identified players visually. A public HTTPS entry hosted through GitHub Pages allowed phones to join from the display’s QR code. The room parameter needed to remain consistent across the display and phones. The joining page combines nickname entry, avatar selection and confirmation before the character appears on the shared map.

This setup established the distinction between a local preview and the deployed shared experience. Loading artwork in one browser was insufficient: a successful entry also required authentication, database access and receipt of the shared room. These became explicit conditions for reviewing the joining flow.

## 03. Investigating Missing Players and First-Join Failures

Repeated device checks showed that a phone could display the map while another player remained absent. At times, the public display reported only one player even though two phones had entered. Connection labels and player counts helped identify the discrepancy, but could not establish that shared presence was working.

One documented failure was reproduced with the real Firebase SDK under a stalled browser-storage condition resembling an iOS webview. Authentication could remain pending while the old interface still opened a local map. The revised implementation uses in-memory authentication and waits for both an acknowledged player write and a shared room read containing that player before completing entry. A failed first join remains visible on the joining screen.

This addressed a specific failure rather than proving a single cause for every historical disappearance. Independent connection records, room consistency and reconnection handling were also reviewed. Verification required two phones to move distinct characters while both phones and the public display received them. Reconnection republishes the latest known position; removal after network loss is not assumed to be immediate.

## 04. Adapting Navigation to the Phone Screen

The phone required its own view of the shared world. The camera follows the local character while the public display retains the map overview. Movement updates shared world coordinates, rather than moving an independent copy of the scene. A virtual joystick provides touch input, and overhead nicknames identify nearby players. The joystick supports directional dragging at a controlled speed, and the camera stops at map boundaries rather than exposing space outside the artwork.

Early screenshots revealed a small character and excessive empty space below the map. The scene ended above much of the joystick, making the active area feel unnecessarily restricted. The layout was revised to fill the available phone viewport, placing the controls over the map. After visual trials, the view was enlarged by 35% and movement speed reduced by 20%.

Further adjustments brought nicknames and chat bubbles closer to the character’s head. These changes refined spatial relationships without requiring a new shared-data model. Joystick release, lost focus and opening an activity stop held movement, while closing the activity restores normal map control. Navigation was therefore checked as a complete sequence of moving, entering, interacting and returning.

## 05. Implementing and Verifying Room Chat

Chat was added after shared movement to allow players to address one another directly. The phone’s chat control opens a panel with text input, recent messages and four quick reactions: wave, smile, thumbs-up and heart. Opening the panel stops held movement so typing does not leave the character travelling through the map. Text input is limited to 80 characters; quick reactions use the same sending path as typed messages.

Messages use the same room and player identity as movement. Other clients receive the sender’s speech state, and the corresponding character displays a bubble for five seconds. The public display presents bubbles without a chat input panel. The phone keeps up to 30 recent messages in the current page session; the database holds each connection’s latest speech state, not a permanent chat archive.

Early feedback included missing text and renewed player-visibility problems. The acceptance check therefore covered the whole path: two players join, both remain visible, a message reaches the other phone, and the bubble disappears after five seconds. Input length, send feedback and a brief cooldown support controlled use. Rendering messages as text avoids interpreting participant input as HTML.

## 06. Developing Activity Entrances Within the Map

The existing map and characters established the visual context for each new activity. Several initial image options appeared too detailed, saturated or stylistically distant from the scene. Revisions used simpler shapes, softer colours and clear outlines, with each image reviewed in place rather than only as a standalone illustration.

The wishing-tree entrance was placed over the central plaza tree and labelled in English. The hand prompt was removed while the proximity effect remained. The drink shop was enlarged, widened and moved slightly left. Fishing developed into a lighter pond with two rods and no visible fish. The sign-free piano was positioned on the existing stage and enlarged by 15%.

Consistent approach cues make the entrances recognisable as interactive objects. Their placement also gives the activities a context within the campus. Clicking opens the relevant interaction, while close and return controls lead back to the shared map. The environment provides continuity between activities without requiring a fixed storyline.

## 07. Building the Wishing-Tree Contribution Flow

The wishing tree developed from a visible map entrance into a shared contribution system. Approaching the central tree activates its cue; selecting it opens a phone-sized interface. The composer retains the joined player’s nickname, accepts a wish and provides a “Hang wish” action. This links the contribution to the identity already used in the map. A 160-character limit and counter bound the contribution.

Submitted wishes appear as hanging notes that other players can open. The opened note uses a framed-paper layout based on the supplied game message-board reference, showing the full text, author nickname and date. A total count and page controls support browsing when there are more notes than the current tree view can display. Wishes remain available after their author leaves, separating contribution storage from temporary player presence.

Development moved through a visual preview before integrating shared data. The tree’s position, artwork and mobile layout were reviewed separately from whether another client could read the same wish. Entry, writing, hanging, reading and returning were checked as one flow. This separated the appearance of a completed interface from the operation of a shared contribution. Players can close an individual note, continue browsing or return to the map through the tree’s back control.

## 08. Encouraging Wish Discovery and Adding Blessings

Once shared wishes were working, the next concern was whether visitors had a reason to open someone else’s note. Short previews and gentle swaying were added. The first previews exposed too much of the sentence, leading to several reductions before settling on a brief opening of up to approximately five English words. The complete message remains inside the opened note.

The blessing interaction then provided a response without requiring another message. “May it come true” records a blessing and updates the shared count. The implementation limits each anonymous identity to one blessing per wish; it is not a permanent real-person identity system. The selected note displays the shared count and the current identity’s blessing state, with duplicate submissions blocked.

The button initially reported that blessings were unavailable because the corresponding database rules needed publication. This showed that deploying an interface did not automatically make a new shared operation available. Rules, client code and the published version needed to agree. Later review confirmed the response worked. Wish reading, blessing feedback and return to the map were then checked alongside existing player visibility and chat.

## 09. Developing the Cooperative Drink Activity

The drink activity was developed around four alternating decisions. Two players match through square avatar portraits with names above them, then choose Base, Flavour, Topping and Finish in A/B/A/B order. Each stage has three options: sparkling water, milk tea or slush; strawberry, matcha or mango; pearls, coconut jelly or red bean; and milk foam, ice cream or a lemon slice. This produces 81 recipe combinations. The first player waits for a partner; only the participant whose turn is active can confirm the next choice.

The counter interface was reviewed visually before online turns were integrated. Feedback identified changes between ingredients that were too subtle. Revisions made selections more distinguishable while retaining the selected muted style and upright cards. A brief “Your turn” notification clarifies control. Shared turns use committed recipe changes so both phones receive the same result. The counter supports one pair per room; a further visitor receives a busy message, and partner loss blocks further choices.

The result was enlarged, named and simplified to “Back to map”, with no repeated ingredient list, cup logo, straw or ground shadow. A later alignment issue was traced to the drink graphic’s inherited maximum width, which shifted its visual centre; filling the stage corrected it. These revisions addressed cooperation, visible feedback and presentation rather than only adding recipe options. The completion also identifies the two makers, and both phones show the same named drink.

## 10. Fishing Synchronisation and Challenge Tuning

Fishing introduced continuous cooperation rather than discrete turns. Matching identifies two players, followed by a central countdown. One controls vertical movement and the other horizontal movement of a shared float. Both must coordinate its position over a moving target to build progress. Both players see matching nicknames and portraits, but receive only their assigned directional controls beside the same pond and progress state. One pair occupies the pond; an additional visitor receives a busy message and retry option.

The initial online version felt jerky, and the countdown was not sufficiently visible. A central countdown restored the preparation cue. Movement development separated ongoing simulation from periodic network checkpoints, while the presentation layer responds to local input and smooths received positions. Shared state still determines progress and outcomes; visual prediction does not independently decide success. Controls pause when partner readiness or fresh shared state is missing, rather than presenting a solo local round as continuing online play.

Difficulty was addressed separately. Progress starts at 20%, gains 10% per aligned second and fails at zero. The target tolerance increased by 10%, its movement interval extended to 3.5 seconds, and misalignment loss reduced from 5% to 4% per second. Reaching 100% completes the catch. These adjustments made coordination more forgiving without presenting lower difficulty as a solution to network responsiveness.

## 11. Fishing Presentation, Assets and Shared Results

The pond presentation changed after the control system was established. A visible fish was replaced by ripples, leaving the catch to be revealed after success. The float was revised to appear partly submerged, keeping the interaction visually connected to the water.

The result images were selected through several design and upload attempts. Supplied artwork and generated options were reviewed together, then cut-outs and remaining image borders were refined. The four successful results were named Lotus Fish, Goofy Toothy, Bigmouth and Purrmaid. Failure uses Smug Finn and “The fish got away!”, without a separate escape animation.

Both phones use the same round identity to select the reveal, so a visually random catch remains consistent for the pair. The result displays the fish image and name, with retry or return controls. This stage connected a shared game outcome to a readable and stylistically consistent presentation. The additional artwork served the end of the interaction rather than increasing the complexity of the controls.

## 12. Piano Audio, In-Map Controls and Fair Use

The piano was designed for one performer and an audience. Its three rows of seven numbered keys provide 21 notes. Other joined players can listen across the map after enabling sound; distance changes volume, and a mute control remains available. “Start playing” claims the instrument, while finish and close actions release it. Web Audio synthesises the tones rather than playing an uploaded piano recording. The key rows represent low, middle and high registers. The public display starts muted, so presentation sound requires an explicit enable action.

Initial checks exposed permission and audio problems. Keys changed colour on an iPhone without producing sound. Database rules needed publication, while audio activation and recovery needed separate handling for mobile browsers. Device feedback later confirmed sound. The sound control was then revised to match the interface visually.

The keyboard changed from a separate activity view to a compact panel over the live map. Its position was raised to reduce accidental exit taps. Selecting an occupied piano shows only the performer’s name, not a listener keyboard or synchronised key highlights. A restrained piano movement and rising notes on the map indicate use.

An eight-second interval without a note automatically releases the seat. Only actual notes renew it, preventing an idle player from retaining access. This combined technical ownership with a practical rule for a shared exhibition resource.

## 13. Integration, Deployment and Version Control

As activities accumulated, the shared map needed regression checks rather than separate demonstrations of each feature. Checks returned to two-phone visibility, message reception, five-second bubbles, activity entry and exit, matching and shared outcomes. Automated and controlled-browser checks supported this work, while the development conversation recorded phone observations and subsequent revisions.

Publishing introduced another distinction. The tree or blessing button sometimes appeared missing after an update, and one fixed-version entry returned a 404. The Pages publishing source and build status were checked. A successful push was not treated as proof that the new site was available; client files, activity panels, database rules and the QR destination also needed to correspond. These observations do not establish caching as the cause of every failure.

Content-versioned releases and matching QR links supported consistent entry and preserved older files for already-open clients. Approved versions were retained as backups before later promotion. The unused streetlight interaction was removed, while decorative map lamps remained. Release management therefore became part of maintaining the complete experience, not simply uploading the latest interface.

## 14. Reflection Through the Six Social UX Principles

Sensory Feedback. Visual selection and movement feedback developed into timed chat, recipe changes, progress states and piano sound. The silent iPhone keys showed why the intended output needed direct checking.

Embodied Interaction. The phone became a physical controller for movement, divided fishing input and note selection. This remains touchscreen-mediated interaction rather than full-body tracking.

Social Dynamics. Independent avatars establish co-presence; alternating choices and split controls require participants to influence one outcome. These mechanisms relate to the course’s computer-supported cooperative work discussion.

Resilience & Motivation. Gentler fishing, retry and short activities support experimentation. Shared named drinks and fish provide visible completion without requiring competitive ranking.

Proactivity & Clarity. QR entry, approach cues, previews, turn messages and occupancy notices act as signifiers. They communicate how to enter, discover a contribution or recognise who can act.

Ethics & Inclusion. Nicknames and a non-human avatar offer identity choices; mute, exits and inactivity release support control and fair access. Phone ownership, connectivity, language, visual controls and public text remain barriers and responsibilities.

## 15. Final Evaluation and Design Authorship

The final version provides a shared setting in which participants can communicate, contribute, cooperate or listen. Development resolved practical conditions for those interactions: entry, independent presence, readable controls, shared decisions and coherent release files. The remaining social question is whether unfamiliar participants respond to one another beyond completing an activity. Device checks cannot establish an improvement in cross-cultural belonging.

The intended exhibition encounter is joining and completing one activity, rather than finishing the whole map. Its approximately two-minute target still requires timed rehearsal, including matching. The actual network, two phones, public display and a visible phone-screen demonstration should be checked together, with a recorded fallback for connection failure.

AI assisted code, debugging, artwork refinement and written drafting. My contribution included defining rules, rejecting unsuitable visual options, requesting changes and reviewing their effects through devices. Specific tools, outputs, adaptations and supplied-image sources require attribution, alongside the unit’s required AI declaration and approval. This separates the use of assistance from the design decisions documented throughout the process.


# Shared Campus Map — Development Documentation

## 01. From the A1 Prototype to a Shared Experience

The final A1 proposal established Shared Campus Map as a low-pressure opportunity for interaction among international and culturally diverse university students. Its research synthesis identified limited opportunities to engage beyond familiar social circles, rather than assuming that international students lacked friendships. Shared play was proposed as a reason for unfamiliar participants to notice and respond to one another.

A1 had already developed the concept from prompt-based participation into an explorable map with avatars and shared activities. It also included a single-user p5.js prototype testing nickname entry, three avatar choices, confirmation and keyboard movement. However, QR connection, phone control, real-time multiplayer and shared activities remained unimplemented.

A2 therefore concentrated on realising this proposed experience across separate devices. The existing prototype developed into a connected map with chat, shared wishes, collaborative drink-making, cooperative fishing and a shared piano. The principal progression was from a locally playable prototype to a shared system in which participants could see, respond to and influence one another.

## 02. Extending the A1 Technical Prototype

A1’s technical exploration tested a single-user interaction flow: entering a nickname, selecting one of three avatars, confirming entry and moving through the map with arrow keys. This established the local interaction before the multiplayer system was developed. A2 retained the p5.js foundation while extending input and shared data across devices.

The phone now follows its own character, while the public display provides an overview of the campus. Firebase Realtime Database synchronises player positions and activity data, and GitHub Pages provides the web entry point used by the QR code. This implements the public-screen and personal-phone arrangement proposed in A1, informed by its analysis of MMM Ball’s browser-based participation.

Activities introduced further synchronisation requirements. Drink-making needs a common turn sequence and recipe; fishing combines separate directional inputs; the piano requires a single performer state. Messages and wishes must also reach other participants. The technical development therefore extended beyond map navigation to maintaining agreement between individual controls and shared outcomes.

## 03. Resolving Multi-Device Visibility Problems

Multi-device checks revealed a recurring problem: a second phone could enter the map without seeing the first player, and the public display sometimes showed only one participant. A connection status alone was therefore insufficient evidence that the shared experience was functioning.

These failures affected the distinction established in A1 between occupying the same space and responding to other participants. Participants needed to recognise one another before they could communicate or cooperate. Development consequently returned to the joining process, room state and independent player connections. The resulting implementation maintains distinct player identities and connection records so that separate phones can control separate characters.

Checks compared movement and player visibility across two phones and the public display. Later feedback confirmed successful shared presence, although similar problems had reappeared after earlier checks. This made repeated verification necessary when reviewing subsequent versions. The criterion for a working map became more specific: each player needed to join, retain independent control and remain visible on another device. This was more meaningful than relying on a successful page load or connection label.

## 04. Mobile Viewport and Movement Refinement

Moving beyond A1’s keyboard-based prototype required a usable portrait phone view. Early mobile layouts allocated insufficient space to the map. A substantial blank area remained below the scene, the character appeared small, and the map did not extend behind the virtual controls. This reduced the usable presentation area on a portrait screen.

The layout was revised so that the map fills the available view and the joystick overlays the scene. The phone view was enlarged by 35%, followed by a 20% reduction in movement speed. These adjustments responded to the small character scale and the perceived speed of movement within the closer view. The public display retained its overview, allowing the two screen types to serve different purposes.

The revision involved a trade-off between local detail and surrounding context. A closer view improves character visibility but displays less of the campus at once. The selected scale reflects development trials and feedback rather than a measured optimum. This stage demonstrated the importance of checking the complete phone layout, including controls and unused space, rather than evaluating the map image independently.

## 05. Developing the A1 Visual Direction

A1 established a soft fantasy-game direction through pastel colours, chibi characters and illustrated 2D environments. The existing campus and character artwork provided the starting point for A2. New activity entrances needed to remain recognisable while fitting this established setting.

Several early generated options appeared overly saturated or detailed, leading to revisions towards softer colours, simpler forms and clearer outlines. Evaluation also considered each image within the map. The drink shop was enlarged, widened and repositioned; the fishing entrance used two rods and a lighter water surface without visible fish; the piano entrance was developed without a wooden sign.

These decisions developed the proposed visual direction through actual assets and placement. The campus functions as a setting for exploration rather than a fixed storyline. Familiar locations give activities context, while consistent proximity effects indicate opportunities to interact. The environment, responsive entrances and piano sound connect separate activities within one shared place, helping participants recognise both the setting and the actions available within it.

## 06. Communication Through Chat and Shared Wishes

Chat and the wishing tree provide different forms of expression within the map. Typed messages appear above characters and disappear after five seconds, supporting immediate communication without leaving persistent speech bubbles over the scene.

The wishing tree retains a message for later discovery. Participants can write and hang a wish, then open notes contributed by others. The full note displays the message, nickname and date within a framed-paper layout developed from a game message-board reference. A blessing button provides a response without requiring another written message.

A further revision addressed the visibility of other people’s wishes. Gentle movement and a short text preview were added to encourage exploration. The initial preview revealed too much of the message, so it was shortened to approximately four or five English words. The resulting interaction separates discovery from reading: the tree offers a hint, while opening the note reveals the full contribution. This creates a clearer reason to select a note and respond to its author.

## 07. Collaborative Drink-Making and Visible Choices

The drink activity develops A1’s proposal for short shared play by distributing four decisions between two participants. After matching, players alternate through the base, flavour, topping and decoration stages. Each stage offers three options, producing 81 possible recipe combinations. Both players contribute to the same named result rather than completing separate recipes.

The interface was refined to make this contribution visible. Early feedback indicated that ingredient selections did not produce sufficiently distinct changes in the drink. Revisions therefore focused on clearer visual differences while retaining the selected colour palette and upright choice cards. A “Your turn” notification identifies the active participant and supports the handover between decisions.

The completion screen was simplified by enlarging the finished drink, retaining its name and providing a direct return to the map. Cup logos, straws and the bottom shadow were removed from the visual treatment. The shared result gives both participants a visible record of their combined decisions. The activity creates a reason for cooperation without requiring competition or a predefined conversation.

## 08. Cooperative Fishing: Responsiveness and Difficulty

Fishing requires continuous coordination through divided controls. One participant controls vertical movement and the other horizontal movement. Both influence one float, which must align with moving ripples to increase shared progress. Neither participant controls both axes independently.

Development feedback identified two separate issues: jerky movement and excessive difficulty. Movement was refined to improve visual continuity. The challenge settings were then adjusted by increasing the target range by 10%, extending target changes to 3.5-second intervals and reducing progress loss to 4% per second. Progress begins at 20%, increases by 10% per second when aligned and ends in failure if it reaches zero.

The visual presentation was also revised. Ripples replaced the visible fish, and the float was shown partly submerged. Successful completion reveals one of four named fish, while failure presents a static escape result. These choices preserve the catch as a shared reveal. Separating responsiveness from difficulty was important: a more forgiving challenge could reduce frustration, but could not resolve synchronisation or rendering problems by itself.

## 09. Shared Piano: Audio, Occupancy and Access

The piano extends participation to both performance and listening. One player occupies the instrument and uses a 21-key interface arranged in three rows. Other players can listen after enabling sound. An occupancy notice identifies the performer, while the activity icon responds visually during use.

Technical checks exposed a difference between visual and auditory feedback. On an iPhone, keys changed colour without producing sound. Database permissions and browser audio activation required separate attention. Following these changes, device feedback confirmed audible playback. The issue demonstrated why a visible response could not establish that the complete interaction was working.

The piano was subsequently presented as a panel within the map, retaining the surrounding shared environment. The keyboard was moved further from the exit control to reduce accidental selection. Other players receive an occupied notice rather than a duplicate keyboard. An eight-second inactivity release also prevents an idle session from holding the instrument indefinitely. Together, these revisions clarify the performer’s role and improve access to a shared resource.

## 10. Testing Evidence and Responses to Feedback

A1 tested the local joining and navigation flow. A2 extended these checks to separate devices and shared activities, using repeated device checks and feedback recorded during production. Checks examined whether separate phones controlled distinct characters, whether messages reached another player, whether activity states agreed and whether piano audio was audible on an iPhone.

The findings required different responses. Missing players directed attention to shared presence; silent keys required audio checks; unclear ingredient changes required stronger visual feedback. These examples show why functionality and interaction clarity needed to be reviewed separately. A system could accept an input without communicating its effect adequately.

Some problems reappeared after earlier checks, making repeated verification important as new activities were introduced. The accompanying table records observed issues, revisions and reported outcomes. These records document development testing rather than an independent audience study. They support specific claims about the versions checked, but do not establish universal reliability or social impact. Further evaluation should use the exhibition environment and unfamiliar participants, including the time required to join, match and complete an activity.

## 11. Developing the Six Social UX Principles

A1 identified Social Dynamics and Proactivity & Clarity as particularly important. A2 developed these intentions through implemented interactions and device feedback.

Sensory Feedback. Piano sound extends A1’s visual selection and movement feedback. The iPhone audio issue demonstrated the need to check the audible response independently.

Embodied Interaction. Phone-based movement and activity controls realise the proposed personal-controller role, although embodiment remains mediated through a touchscreen.

Social Dynamics. Alternating drink choices and divided fishing controls give both participants influence over one outcome. This develops A1’s distinction between co-presence and meaningful shared play, relating to the course’s discussion of computer-supported cooperative work.

Resilience & Motivation. Revised fishing settings and retry make the task more forgiving while retaining coordination.

Proactivity & Clarity. QR entry, proximity effects and turn notifications communicate where and how to participate, acting as signifiers.

Ethics & Inclusion. The non-human avatar option identified in A1 was retained. Sound control, exits and piano release further support choice and access. Phone ownership, connectivity, language, visual controls and public messages remain inclusion and privacy concerns.

## 12. Evaluation Against the A1 Design Criteria

A1 defined the experience as low-pressure, spontaneous, shared, playful and socially meaningful. The final prototype addresses these criteria through browser entry, optional activities and several ways to participate. Visitors can exchange messages, contribute a wish, coordinate a task or listen to another player. Each activity gives participants a potential reason to notice or respond to someone else.

The central evaluation question remains whether shared play leads to meaningful interaction between unfamiliar participants. Successful synchronisation or task completion cannot establish this alone. Observation would be needed to examine how players encounter one another, understand their roles and communicate during or after an activity. This follows A1’s social intention of creating an opportunity for connection without guaranteeing friendship.

A1 also proposed a public display with a nearby standing area and personal-phone control. Exhibition preparation must test this arrangement with the actual network and devices. The intended route of joining and completing one activity aims for approximately two minutes, including matching, but requires timed rehearsal. Phone activity screens must also be visible during demonstration, with a recorded fallback for connection failures.

## 13. AI Use and Design Authorship

Generative AI assisted code development, debugging, iteration planning and written drafting. Image-generation tools also supported selected activity images and refinements. The existing map and character assets were retained as separately supplied artwork.

My contribution involved establishing the social direction, defining activity rules, evaluating visual options and specifying revisions in response to device feedback. Recorded decisions include rejecting overly saturated images, clarifying ingredient changes, adjusting fishing difficulty and retaining the piano within the map. These examples identify how assisted outputs were selected and adapted to the project’s requirements.

This document was also prepared with AI assistance. Its descriptions must be checked against the implemented prototype and supported by appropriate evidence. Asset records need to distinguish supplied, generated and refined material, with original sources and permissions identified separately. Tutor approval for AI use and the required declaration remain to be verified before submission. Clear attribution is necessary to distinguish the tools used from the design decisions and refinement undertaken during development.


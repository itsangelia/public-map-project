# Shared Campus — Development Documentation

## 01. Concept Development and Project Direction

Shared Campus developed from a proposal addressing barriers to initial interaction among international students. The proposed experience combined a public display, phone-based entry, personal avatars, free exploration and cooperative activities. These elements established the direction for the final prototype.

The development phase translated this structure into a functioning shared map with chat, a wishing tree, collaborative drink-making, cooperative fishing and a shared piano. Each activity offers a different form of participation, from leaving a message to coordinating an action with another player. Connection remains the primary social focus, supported by playful outcomes and opportunities for personal expression.

A significant change concerned the original cultural prompts and proposed token system. Tokens were not implemented, and direct questions about everyday cultural experiences became less prominent. The final design places greater emphasis on initiating contact through shared activities. This preserves the intention to encourage connection, while changing how explicitly the experience invites cultural exchange.

## 02. Technical Development and Shared System Structure

Development began with the existing p5.js map and character assets. The main technical task was to connect individual devices to a common world while maintaining a suitable view for each screen. The phone follows its own character, whereas the public display provides an overview of the shared campus.

Firebase Realtime Database synchronises player positions and activity data. GitHub Pages provides the web entry point used by the QR code. This browser-based arrangement allows participants to join without downloading an application. World coordinates remain shared even when the phone and display use different camera views.

The introduction of activities extended the synchronisation requirements. Drink-making requires a shared turn sequence and recipe; fishing combines separate directional inputs; the piano requires a single performer state. Wishes and messages also need to reach other participants. The technical structure therefore supports both individual control and shared outcomes. Its effectiveness depends on agreement between devices, rather than on the appearance of an isolated screen.

## 03. Resolving Multi-Device Visibility Problems

Multi-device checks revealed a recurring problem: a second phone could enter the map without seeing the first player, and the public display sometimes showed only one participant. A connection status alone was therefore insufficient evidence that the shared experience was functioning.

These failures affected the project’s central social condition. Participants needed to recognise one another before they could communicate or cooperate. Development consequently returned to the joining process, room state and independent player connections. The resulting implementation maintains distinct player identities and connection records so that separate phones can control separate characters.

Checks compared movement and player visibility across two phones and the public display. Later feedback confirmed successful shared presence, although similar problems had reappeared after earlier checks. This made repeated verification necessary when reviewing subsequent versions. The criterion for a working map became more specific: each player needed to join, retain independent control and remain visible on another device. This was more meaningful than relying on a successful page load or connection label.

## 04. Mobile Viewport and Movement Refinement

The early phone layout allocated insufficient space to the map. A substantial blank area remained below the scene, the character appeared small, and the map did not extend behind the virtual controls. This reduced the usable presentation area on a portrait screen.

The layout was revised so that the map fills the available view and the joystick overlays the scene. The phone view was enlarged by 35%, followed by a 20% reduction in movement speed. These adjustments responded to the small character scale and the perceived speed of movement within the closer view. The public display retained its overview, allowing the two screen types to serve different purposes.

The revision involved a trade-off between local detail and surrounding context. A closer view improves character visibility but displays less of the campus at once. The selected scale reflects development trials and feedback rather than a measured optimum. This stage demonstrated the importance of checking the complete phone layout, including controls and unused space, rather than evaluating the map image independently.

## 05. Visual Refinement and Experiential Setting

The existing illustrated campus established the visual context for the activities. New entrances needed to remain recognisable while fitting the map and characters. Several early image options appeared overly saturated or detailed, leading to revisions towards softer colours, simpler forms and clearer outlines.

Evaluation also considered each image within the map. The drink shop was enlarged, widened and repositioned; the fishing entrance used two rods and a lighter water surface without visible fish; the piano entrance was developed without a wooden sign. These changes addressed both stylistic consistency and the scale of the objects within their surroundings.

The campus functions as a setting for exploration rather than a fixed storyline. Familiar locations give the activities context, while consistent proximity effects indicate opportunities to interact. The illustrated environment, responsive entrances and piano sound connect separate activities within one place. Their role is experiential as well as decorative: they help participants notice where an activity belongs and how it relates to the shared map.

## 06. Communication Through Chat and Shared Wishes

Chat and the wishing tree provide different forms of expression within the map. Typed messages appear above characters and disappear after five seconds, supporting immediate communication without leaving persistent speech bubbles over the scene.

The wishing tree retains a message for later discovery. Participants can write and hang a wish, then open notes contributed by others. The full note displays the message, nickname and date within a framed-paper layout developed from a game message-board reference. A blessing button provides a response without requiring another written message.

A further revision addressed the visibility of other people’s wishes. Gentle movement and a short text preview were added to encourage exploration. The initial preview revealed too much of the message, so it was shortened to approximately four or five English words. The resulting interaction separates discovery from reading: the tree offers a hint, while opening the note reveals the full contribution. This creates a clearer reason to select a note and respond to its author.

## 07. Collaborative Drink-Making and Visible Choices

The drink activity distributes four decisions between two participants. After matching, players alternate through the base, flavour, topping and decoration stages. Each stage offers three options, producing 81 possible recipe combinations. Both players contribute to the same named result rather than completing separate recipes.

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

Development was informed by repeated device checks and feedback recorded during production. Checks examined whether separate phones controlled distinct characters, whether messages reached another player, whether activity states agreed and whether piano audio was audible on an iPhone.

The findings required different responses. Missing players directed attention to shared presence; silent keys required audio checks; unclear ingredient changes required stronger visual feedback. These examples show why functionality and interaction clarity needed to be reviewed separately. A system could accept an input without communicating its effect adequately.

Some problems reappeared after earlier checks, making repeated verification important as new activities were introduced. The accompanying table records observed issues, revisions and reported outcomes. These records document development testing rather than an independent audience study. They support specific claims about the versions checked, but do not establish universal reliability or social impact. Further evaluation should use the exhibition environment and unfamiliar participants, including the time required to join, match and complete an activity.

## 11. Reflection Through the Six Principles for Social UX

Sensory Feedback. Piano sound provides an audible response alongside visible key changes. The iPhone audio issue demonstrated the need to check both forms of feedback.

Embodied Interaction. Touch controls connect physical input to character and activity movement. This remains a limited form of embodiment mediated through a phone screen.

Social Dynamics. Alternating drink decisions and divided fishing controls allow both participants to influence a shared outcome. Fishing makes coordination necessary, relating to the course’s discussion of computer-supported cooperative work.

Resilience & Motivation. More forgiving fishing settings and retry support experimentation without requiring immediate success.

Proactivity & Clarity. Proximity effects and turn notifications act as signifiers, indicating available actions and the participant currently responsible for acting.

Ethics & Inclusion. Sound control, clear exits and piano release support choice and fair access. However, phone ownership, connectivity, language and visual controls remain participation barriers. Public messages also raise privacy and moderation concerns. These limitations prevent the prototype from being described as fully accessible.

## 12. Critical Evaluation and Exhibition Preparation

The final prototype supports several levels of involvement: recognising other players, exchanging messages, contributing a wish, coordinating a task or listening to a performance. Activities remain optional, allowing participants to select a short encounter rather than complete a fixed sequence.

The relationship to cultural exchange requires further consideration. The initial proposal directly invited participants to share everyday experiences. The final activities provide opportunities for first contact, but do not necessarily lead to discussion of cultural backgrounds. The project’s technical completion therefore does not establish an improvement in belonging. Participant observation would be needed to examine whether interaction continues beyond the task and whether unfamiliar players choose to communicate.

Exhibition preparation must address both access and presentation. The intended route of joining and completing one activity aims for approximately two minutes, including matching, but still requires timed rehearsal. A reachable QR link, suitable network, charged devices and a clear public display are essential. Phone activity screens also need to be visible during demonstration, with a recorded fallback available for connection failures.

## 13. AI Use and Design Authorship

Generative AI assisted code development, debugging, iteration planning and written drafting. Image-generation tools also supported selected activity images and refinements. The existing map and character assets were retained as separately supplied artwork.

My contribution involved establishing the social direction, defining activity rules, evaluating visual options and specifying revisions in response to device feedback. Recorded decisions include rejecting overly saturated images, clarifying ingredient changes, adjusting fishing difficulty and retaining the piano within the map. These examples identify how assisted outputs were selected and adapted to the project’s requirements.

This document was also prepared with AI assistance. Its descriptions must be checked against the implemented prototype and supported by appropriate evidence. Asset records need to distinguish supplied, generated and refined material, with original sources and permissions identified separately. Tutor approval for AI use and the required declaration remain to be verified before submission. Clear attribution is necessary to distinguish the tools used from the design decisions and refinement undertaken during development.


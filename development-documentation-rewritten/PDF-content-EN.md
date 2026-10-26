# Shared Campus — Development Documentation

## 01. From the Proposal to Shared Campus

In my initial proposal, I wanted to give international students a reason to approach someone outside their usual social circle. The idea was to join a shared campus map through a phone, choose a character and take part in something together. QR entry, free exploration and cooperative activities were already part of this proposal.

During development, these ideas became specific places on the map: a wishing tree, a drink shop, a fishing pond and a piano. Players can also see and message each other while exploring. The public screen shows the shared campus, while each phone follows its own player.

Some parts of the proposal changed. I did not develop the token system, and the original cultural prompts became less central. The finished activities give people a shared task or something to respond to, rather than directly asking them to describe their culture. The aim is still to make first contact easier, although the way I approach it has changed.

## 02. Building on the Existing Map

I started with the existing p5.js project and kept its illustrated map and three characters. My task was to turn this setting into a space that people could enter and use together. This meant adding shared player data, adapting the phone view and connecting activities to the map.

Each device has a different role. A phone controls one player and shows the area around that character. The public display shows the wider map. Both need to use the same player positions, even though their views look different. Firebase Realtime Database synchronises this information, and GitHub Pages hosts the site so that visitors can open it from a QR code.

As the project grew, the shared data included more than position. Drink-making needed a common turn sequence; fishing needed two inputs for one float; the piano needed to identify its current performer. These interactions depended on devices agreeing on the same state. Getting one screen to look right was only the beginning.

## 03. When Players Could Not See Each Other

One of the most persistent problems was that a second phone could enter the map without seeing the first player. Sometimes the public display also showed only one player. The screen could say “Connected” while the shared experience was still missing.

This became a priority because every activity depended on players being present together. I wanted to add chat and games, but those additions had little value if someone appeared to be alone. Work returned to the joining process, room data and separate player connections. The implementation keeps distinct player identities so that each phone controls its own character.

I checked the result with two phones and the display, moving the characters separately and looking for both on the other screens. Some problems returned after earlier checks had seemed successful. That changed what I looked for when reviewing a version: opening the map was not enough. Players also needed to remain independent and visible to one another.

## 04. Making the Phone View Easier to Use

The early phone layout showed too much empty space below the map. My character looked small, and the map ended before it could properly sit behind the joystick. On a phone, this made the part I was using feel smaller than the available screen.

I asked for the map to fill the view and for the character to appear larger. After trying the scale, I settled on a 35% increase in the phone view. Movement was then reduced by 20%, because a larger view also made quick movement feel more noticeable. The joystick sits over the map, with the chat control beside it.

These adjustments were small compared with adding a game, but they changed how the whole map felt on a phone. The display could keep its overview, while the phone gave the player a closer view. Enlarging it also meant seeing less of the surroundings at once, so I treated the scale as a balance rather than simply making everything as large as possible.

## 05. Choosing Artwork That Belonged on the Map

The map and characters already had an illustrated style, so I used them to judge the new activity images. Several early options looked too detailed or too saturated beside the existing artwork. I asked for simpler shapes, softer colours and clearer outlines.

I also changed individual details rather than treating each image as finished. The drink shop needed to be larger, slightly wider and further left. For fishing, I chose two rods and a lighter pond surface, then removed the fish from the water. For the piano, I did not want a wooden sign. These choices helped each entrance read clearly without giving every activity the same decoration.

An image that looked good on its own could still be the wrong size on the map. I reviewed the entrances in place and adjusted their scale and position. I also kept a similar proximity effect across them, so players could recognise that approaching these objects offered something to do.

## 06. Giving Players Something to Say and Read

Chat was the first way for players to speak to each other inside the map. A typed message appears above the character and disappears after five seconds. This keeps the conversation close to the player without leaving old bubbles over the scene.

The wishing tree gives messages a different place. Players can write a wish, hang it on the tree and open other people’s notes. I wanted each opened note to show the nickname and date, with a framed-paper appearance inspired by the game reference I supplied.

Once the notes worked, I wondered why someone would choose to open another person’s wish. I added a short preview and gentle movement. At first, too much of the sentence was visible, so I shortened it to around four or five English words. The preview gives a hint, while the full message remains inside the note. The blessing button then offers a way to respond without having to write a reply.

## 07. Making a Drink Together

For the drink shop, I wanted both players to contribute to the same result. They match with nicknames and character portraits, then take turns across four stages: base, flavour, topping and decoration. Each stage has three options. One person chooses the base, the other chooses the flavour, and they continue alternating until the drink is complete.

A problem appeared in the visual feedback. I liked the general style, but changing an ingredient did not make enough difference to the drink. I asked for those changes to be more noticeable while keeping the softer colours and upright selection cards. A “Your turn” message helps make the handover clear.

I also simplified the result. The finished drink becomes larger, keeps its name and has a “Back to map” button. I removed the cup logo, straws and bottom shadow. The page gives both players one finished drink to look at, rather than presenting another list of everything they selected.

## 08. Adjusting the Fishing Game

Fishing asks the pair to coordinate continuously. One player controls up and down, and the other controls left and right. They move one float towards ripples on the pond. Neither player controls both directions alone.

The first versions felt jerky and difficult. I treated these as two problems: movement needed to feel smoother, and the challenge needed more room for error. After movement refinements, I asked for the target range to increase by 10%, the target to move every 3.5 seconds and missed alignment to reduce progress by 4% per second. Progress starts at 20% and rises by 10% per second while aligned. Reaching zero ends the attempt.

I also changed what players see in the pond. Ripples replaced the visible fish, and the float was made to look partly submerged. A successful catch reveals one of four named fish. Failure shows the escaped fish without an extra animation. This keeps the identity of the catch for the result screen and gives both players a shared surprise.

## 09. Keeping the Piano in the Shared Space

The piano began with a simple rule: one person plays and the others listen. The keyboard has 21 numbered keys in three rows. Other players can hear it after enabling sound, and a notice identifies who is using the instrument.

Getting the sound to work took more than making the keys respond. On my iPhone, the buttons changed colour but produced no sound. Database permissions also needed attention. After changes to the permissions and audio activation, I could hear the notes during the device check.

I then changed how the activity opened. I wanted the keyboard to sit over the map instead of feeling like a separate destination. I moved it further from the exit button to reduce accidental taps. If someone else selects an occupied piano, they see the performer’s name rather than another keyboard. The map icon also responds during use. Finally, eight seconds without a note releases the seat, so an idle player does not keep it occupied.

## 10. What I Checked Between Versions

Most of my feedback came from using the project on phones and reporting what happened during development. I checked whether both players appeared, whether a message reached another device and whether the activity responded as expected. These checks often revealed things that were not obvious from one screenshot.

For example, the piano keys could change colour without sound. A player could enter the map without appearing on the display. A drink could change internally while still looking almost the same. Each needed a different response: checking audio, checking shared presence or making the visual change clearer.

I also found that a feature working once did not mean it would keep working after later changes. I returned to the basic checks as the activities developed. The table on this page connects reported problems with the changes made and the evidence available. These are development checks; I have not carried out a separate study with recruited participants. The next check should use the exhibition setup, including the network, two phones and public display.

## 11. Looking Back Through the Six Social UX Principles

Sensory Feedback — The piano gives an audible response as well as a changing key. The iPhone issue showed why both needed checking.

Embodied Interaction — Touch controls connect hand movements to the avatar and activity controls. This is a limited form of embodiment through a screen, rather than a full-body installation.

Social Dynamics — The drink choices and split fishing controls let both players affect one outcome. Fishing makes the need for coordination especially clear. This relates to the course’s discussion of computer-supported cooperative work.

Resilience & Motivation — I made fishing more forgiving and kept another attempt available. Players can learn the coordination without having to succeed immediately.

Proactivity & Clarity — Glowing entrances and “Your turn” messages act as signifiers. They indicate where an action is available and who should act next.

Ethics & Inclusion — Mute, exits and piano release give players control over participation and access. There are still barriers: the experience needs a phone, a network connection and readable visual controls. Public messages also need consideration of privacy and moderation.

## 12. Reviewing the Finished Map

The finished map gives people several ways to join in. They can write, respond to a wish, make something with a partner or listen to music. I kept these as choices, so everyone does not have to complete the same sequence.

Looking back at the proposal, the biggest change is the place of cultural sharing. The original prompts asked directly about everyday experiences. The final activities give people a reason to interact, but do not necessarily lead them to discuss their backgrounds. I would need to observe unfamiliar participants to find out whether the interaction continues beyond completing a task. Device checks cannot answer that question.

For the exhibition, the intended short route is to join and take part in one activity. The approximately two-minute target still needs timing, including matching. I also need a reliable QR link, suitable network and a way for viewers to see the phone screens during the demonstration. A backup recording will help if the live connection fails.

## 13. How I Used AI

I used ChatGPT/Codex to help with code, debugging, development planning and written drafts. Image-generation tools also helped produce or refine selected activity images. The existing map and character assets were kept as separate supplied artwork.

My decisions were most visible in the revisions. I rejected images that looked too saturated or did not fit the map. I specified how the drink choices should alternate, asked for clearer changes between ingredients, adjusted the fishing difficulty and changed the piano into an on-map interaction. I used the phone checks to decide what needed further work.

This document was also drafted with AI assistance. I am responsible for checking its descriptions against the project and choosing the evidence that supports them. The final submission needs an accurate record of the tools and assets used, the changes I made and the original sources of supplied artwork. Tutor approval and the unit’s required declaration also need to be confirmed before submission.


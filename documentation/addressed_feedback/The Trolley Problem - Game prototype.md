## The Trolley Problem \- Game prototype

	Not long ago, I was approached with a game proposal that was based on the philosophical ‘Trolley Problem’, a thought experiment that presents an ethical dilemma forcing the individual to act to choose to affect a situation or do nothing. The goal was to take this idea and gamify it without being overly dark, and ultimately make it a mobile-ready game. I knew that I’d ultimately want to build the game in Unreal if publishing for mobile, as it’s my tool of choice and the one I’m the most comfortable with, but before I could get very far I wanted to really work out the core loop and key concepts, and then build out a rapid prototype to prove that the idea could be fun. 

	The best place to start for me is text, in this case a basic flow chart of how I imagined the game could go. There are a ton of great platforms, like miro or lucid chart, that can be used for this, but since I know I wanted to use Unreal I started by laying out a series of comment blocks in an empty blueprint \-

![][image1]

![][image2]

We workshopped this a bit in this state until we felt like it was a pretty good foundation, and then I had more or less everything I needed to start working on a prototype. In order to get something quick and dirty put together to get a feel for it, I opted to leverage chatGPT to help whip up some basic images and html code that I could run by just opening the file, eliminating the need for any lengthy hosting or packaging and deployment cycles. This made the process of slapping together the prototype a single-day / single-sitting activity. 

By the end of that day, I had the following as a fully playable prototype: 

![][image3]

	To keep things simple for this pass, I did not get into the user account / sign in, shop, social or overworld map layers, and focused primarily on the core loop and leaderboard. Hitting ‘Start Game’ launches you directly into a 3-choice round (also simplified down from the 5-choice round in the initial design layout above):

![][image4]

	Each choice comes with a balance between more or less points, and more or less impact to hp from the immediate decision itself, as well as an unforeseen consequence that is only revealed after making the choice.   
![][image5]

	If the player is lucky, they may make a choice to get more points at greater risk to their hp, and not lose more than they bargained for. Or they may take a bit of extra damage, but still have enough hp to survive to the next choice junction. 

![][image6]

However, if they are unlucky, they may take a big risk and be punished with even more hp loss, and if their hp was too low already this could cost them their run and force them to restart from the beginning.   
![][image7]

	If they run out of hp, they are presented with a game over screen that shows their score and offers them a chance to submit their score to the leaderboard. In this prototype, this is just saved locally per user and not hosted publicly. In addition to this, they are also presented with a ‘Try Again?’ option that can launch them directly back into a new round. 

![][image8]

	The leaderboard can also be optionally accessed for review from the main menu at any time, minus the fiery wreckage background.  
![][image9]

	For me, this was well worth the small amount of effort it required to get a hands-on first look and feel of the gameplay. It lets me know what does or doesn’t work and how to approach the next phase of the process, which will take me back into Unreal where I can begin to lay out some of the core systems in blueprints. 

	There will be a few new big hurdles in that context though. Particularly laying out the UI elements will be more difficult and involved when working with UMG, and transitioning the look into 3D space will come with its own challenges as well. Additionally, I will want to start to introduce some outlines of the login and world map layers, as well as changing the appearance of the background as the player completes a zone and progresses to a new one, and increasing the difficulty accordingly. For the shop, I want to have cosmetic items that the player can use to change the look of their Trolley and also items that allow them to restore hp or augment their point gain, life gain / loss, etc. 

All that said, there is still quite a bit more to come on this, so stay tuned for the first look at the UE version 0.1 
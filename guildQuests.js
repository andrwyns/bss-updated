//The notice board of the Badge Bearer's Guild: a chain of jobs that leads through memory matches, badges, aphids,
//the commando chick and the cave monsters. It's a sign rather than a bear, so its "dialogue" is what's written on the notices.
window.dialogue_guildBoard=function(player,items,NPCs){

    let addCommas=(s)=>{for(let i=s.length-3;i>0;i-=3){s=s.substring(0,i)+','+s.substr(i,s.length)}return s},
        doGrammar=(s)=>{let _s='';for(let i in s){_s+=s[i].toLowerCase()!==s[i]?' '+s[i]:s[i]}return _s[0].toUpperCase()+_s.substring(1)},

        //pays out a finished job. beequip is optional
        addReward=(arr,beequip)=>{

            for(let i=player.quests.length;i--;){

                if(player.quests[i].NPC==='guildBoard') player.quests.splice(i,1)
            }

            for(let i in arr){

                if(arr[i][0]==='honey'){

                    player.honey+=arr[i][1]

                } else {

                    items[arr[i][0]].amount+=arr[i][1]
                }

                player.addMessage('+'+addCommas(arr[i][1]+'')+' '+doGrammar(arr[i][0])+' (from the Guild)')
            }

            if(beequip) player.awardBeequip(beequip,'the Guild')

            player.updateInventory()
        }

    return [

        "A wooden board covered in notices. The brass plaque on top reads: BADGE BEARER'S GUILD.",
        "\"BEEKEEPERS WANTED! The guild pays well for a job well done. Tear off a notice to get started.\"",
        "The first notice: \"MEMORY LANE. A sharp mind is a beekeeper's best tool. Try your luck at the Memory Match in front of the Pro Shop.\"",
        function(){player.addQuest('Memory Lane',[['memoryMatches',1]],'guildBoard')},

        "Your notice has been stamped COMPLETE, and an envelope is pinned underneath it.",
        function(){addReward([['honey',50000],['ticket',5],['royalJelly',2]])},
        "The next notice: \"BADGE OF HONOR. The guild is named after its badges! Open the badge page (the medal button), and claim two badges of any kind.\"",
        function(){player.addQuest('Badge Of Honor',[['badges',2]],'guildBoard')},

        "Stamped COMPLETE! Something small and shiny is taped to the notice...",
        function(){addReward([['honey',100000],['magicBean',1],['fieldDice',2]],'thimble')},
        "The next notice: \"PEST CONTROL. Aphids are hiding under the leaves that fall into the fields. Keep gathering until some crawl out, then defeat them. You have 30 seconds each!\"",
        function(){player.addQuest('Pest Control',[['aphid',2]],'guildBoard')},

        "Stamped COMPLETE! \"The flowers thank you.\"",
        function(){addReward([['honey',250000],['softWax',2],['microConverter',2],['gumdrops',10]])},
        "The next notice: \"CLIPPED WINGS. A chick with a bad attitude has dug in behind the vines next to Brown Bear. Bring Clippers, Scissors or a Scythe to cut your way in, and capture it. Twice. Mind the grenades!\"",
        function(){player.addQuest('Clipped Wings',[['commandoChick',2]],'guildBoard')},

        "Stamped COMPLETE! \"It'll be back in half an hour, a little stronger every time. So will its loot.\"",
        function(){addReward([['honey',1000000],['stinger',5],['nightBell',1]])},
        "The next notice: \"BATTLE HARDENED. Every bug your bees defeat is worth Battle Points. A ladybug is worth 1, a spider 10, a werewolf 25, and the big ones a lot more. Earn 250.\"",
        function(){player.addQuest('Battle Hardened',[['battlePoints',250]],'guildBoard')},

        "Stamped COMPLETE! \"Your bees are getting scary.\"",
        function(){addReward([['honey',2500000],['hardWax',2],['oil',2],['enzymes',2]])},
        "The next notice is written in shaky letters: \"INTO THE DARK. Something lives deep in the werewolf's cave, and it's guarding a golden egg. One touch and you're done for. Defeat one of the monsters. Or just be very, very fast.\"",
        function(){player.addQuest('Into The Dark',[['caveMonster',1]],'guildBoard')},

        "Stamped COMPLETE! \"You're braver than whoever wrote this notice.\"",
        function(){addReward([['honey',5000000],['boxOFrogs',2],['starJelly',1],['moonCharm',15]])},
        "The last notice is framed in gold: \"GUILD MASTER. Prove you're one of us for good. Claim 10 more badges, play 5 memory matches, and earn 1,000 Battle Points.\"",
        function(){player.addQuest('Guild Master',[['badges',10],['memoryMatches',5],['battlePoints',1000]],'guildBoard')},

        "Every notice on the board is stamped COMPLETE. A heavy parcel hangs where the last one was.",
        function(){addReward([['honey',25000000],['marshmallowBee',2],['glitter',2],['ticket',25]],'sweatband')},
        "\"Welcome to the guild, Guild Master. The Mega Memory Match behind you is for members only. Keep earning those badges!\""
    ]
}

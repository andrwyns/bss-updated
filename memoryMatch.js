//Memory Match: a card matching minigame played at machines around the map.
//Costs, cooldowns, chances, bonus-chance badges and prize weights follow the Bee Swarm Simulator wiki (sticker prizes are left out).
(function(){

    let HOUR=60*60

    //prize pools are lists of [item, amount, weight, pairs on the board (default 1)]
    let machines={

        basic:{

            name:'Memory Match',cost:25000,cooldown:2*HOUR,cols:4,rows:4,chances:3,color:'rgb(30,90,255)',
            bonusBadges:[['clover',2],['sunflower',2],['pumpkin',2]],
            pool:[['royalJelly',1,100,2],['ticket',1,10],['sunflowerSeed',15,2.5],['pineapple',15,2.5],['blueberry',15,1.5],['strawberry',15,1.5],['treat',15,1],['jellyBeans',1,1],['gumdrops',5,1],['moonCharm',5,1],['honeysuckle',3,1],['magicBean',1,1],['microConverter',1,0.5],['fieldDice',1,0.5],['ticket',5,0.2],['oil',1,0.2],['enzymes',1,0.2],['glitter',1,0.1]]
        },

        mega:{

            name:'Mega Memory Match',cost:500000,cooldown:4*HOUR,cols:4,rows:4,chances:3,color:'rgb(215,60,60)',
            bonusBadges:[['spider',3],['cactus',3],['sunflower',3]],
            pool:[['royalJelly',3,100,2],['ticket',3,5],['microConverter',2,3],['fieldDice',2,3],['gumdrops',10,2],['jellyBeans',1,2],['magicBean',1,2],['sunflowerSeed',25,1.5],['pineapple',25,1.5],['moonCharm',10,1],['honeysuckle',5,1],['treat',50,1],['blueberry',25,1],['strawberry',25,1],['oil',1,1],['enzymes',1,1],['glitter',1,1],['glue',1,1],['coconut',3,1],['starJelly',1,0.25],['ticket',10,0.1],['magicBean',5,0.05]]
        },

        night:{

            name:'Night Memory Match',cost:5000000,cooldown:8*HOUR,cols:4,rows:4,chances:3,color:'rgb(60,45,120)',nightOnly:true,
            bonusBadges:[['pineapple',4],['dandelion',4],['clover',4]],
            pool:[['moonCharm',25,100,2],['magicBean',1,25],['glitter',1,10],['oil',1,2],['enzymes',1,2],['microConverter',3,2],['starJelly',1,1],['stinger',5,1],['ticket',5,1],['treat',500,1],['honeysuckle',5,1],['fieldDice',3,1],['nightBell',1,0.05],['starTreat',1,0.0001]]
        },

        extreme:{

            name:'Extreme Memory Match',cost:25000000,cooldown:8*HOUR,cols:5,rows:4,chances:5,color:'rgb(20,20,20)',
            bonusBadges:[['spider',5],['sunflower',5],['pumpkin',5]],
            pool:[['starJelly',1,100],['royalJelly',25,100,2],['ticket',5,50],['magicBean',1,50],['oil',3,25],['enzymes',3,25],['redExtract',3,5],['blueExtract',3,5],['tropicalDrink',1,5],['glitter',1,2],['gumdrops',25,1],['microConverter',3,1],['jellyBeans',3,1],['sunflowerSeed',200,1],['blueberry',200,1],['strawberry',200,1],['pineapple',200,1],['honeysuckle',10,1],['cloudVial',1,1],['coconut',5,1],['stinger',5,1],['treat',2500,1],['ticket',15,0.1],['glitter',5,0.05],['goldEgg',1,0.05],['starJelly',3,0.02],['diamondEgg',1,0.01],['starTreat',1,0.0001]]
        }
    }

    //picks the pairs of a board. A picked prize leaves the pool, so every pair on a board is a different prize
    function pickPairs(machine){

        let pool=machine.pool.slice(),slots=machine.cols*machine.rows/2,pairs=[]

        while(pairs.length<slots&&pool.length){

            let total=0

            for(let i in pool) total+=pool[i][2]

            let roll=Math.random()*total,index=0

            while(index<pool.length-1&&roll>=pool[index][2]){

                roll-=pool[index][2]
                index++
            }

            let prize=pool.splice(index,1)[0]

            for(let i=prize[3]||1;i--&&pairs.length<slots;)
                pairs.push({item:prize[0],amount:prize[1]})
        }

        return pairs
    }

    function shuffle(arr){

        for(let i=arr.length;i-->1;){

            let j=(Math.random()*(i+1))|0,t=arr[i]

            arr[i]=arr[j]
            arr[j]=t
        }

        return arr
    }

    //api: {player, BADGES, itemSVGCode, doGrammar(str), award(item,amount,machine), finished(machine,pairsFound)}
    function create(api){

        let style=document.createElement('style')

        style.textContent=`
            #memoryMatchMenu{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;display:none;background-color:rgb(255,220,90);border:4px solid rgb(120,80,0);border-radius:10px;padding:0 12px 10px 12px;text-align:center;font-family:'Comic Sans MS',trebuchet ms;box-shadow:0 6px 0 rgb(0,0,0,0.25);user-select:none}
            #memoryMatchTitle{margin:0 -12px 8px -12px;padding:5px 34px 7px 34px;font-size:22px;color:white;border-radius:5px 5px 0 0;border-bottom:3px solid rgb(0,0,0,0.3)}
            #memoryMatchClose{position:absolute;right:6px;top:6px;width:24px;height:24px;line-height:22px;border-radius:5px;background-color:rgb(255,40,40);color:white;font-size:17px;cursor:pointer}
            #memoryMatchClose:hover{background-color:rgb(200,0,0)}
            #memoryMatchInfo{font-size:15px;color:rgb(70,45,0);margin-bottom:6px}
            #memoryMatchBoard{display:grid;gap:6px;justify-content:center}
            .mmCard{width:64px;height:64px;perspective:300px;cursor:pointer}
            .mmInner{position:relative;width:100%;height:100%;transition:transform 0.3s;transform-style:preserve-3d}
            .mmCard.mmShown .mmInner{transform:rotateY(180deg)}
            .mmFace{position:absolute;left:0;top:0;width:100%;height:100%;border-radius:8px;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;box-sizing:border-box}
            .mmBack{background-color:rgb(255,170,20);border:3px solid rgb(180,100,0);color:rgb(255,240,190);font-size:38px;line-height:54px}
            .mmCard:hover .mmBack{background-color:rgb(255,190,60)}
            .mmFront{background-color:rgb(250,250,250);border:3px solid rgb(150,150,150);transform:rotateY(180deg)}
            .mmCard.mmMatched .mmFront{border-color:rgb(20,190,60);background-color:rgb(215,255,220)}
            .mmCard.mmMissed .mmFront{filter:grayscale(0.8);opacity:0.75}
            .mmAmount{position:absolute;right:3px;bottom:0px;font-size:13px;color:black;text-shadow:0 0 3px white,0 0 3px white}
            #memoryMatchResult{font-size:15px;color:rgb(70,45,0);margin-top:8px;min-height:21px}
            #memoryMatchDone{display:none;margin:6px auto 0 auto;width:120px;height:30px;line-height:28px;border-radius:6px;background-color:rgb(20,170,60);color:white;font-size:17px;cursor:pointer}
            #memoryMatchDone:hover{background-color:rgb(10,130,40)}
        `

        document.head.appendChild(style)

        let menu=document.createElement('div')

        menu.id='memoryMatchMenu'
        menu.innerHTML="<div id='memoryMatchTitle'></div><div id='memoryMatchClose'>X</div><div id='memoryMatchInfo'></div><div id='memoryMatchBoard'></div><div id='memoryMatchResult'></div><div id='memoryMatchDone'>Collect</div>"

        document.body.appendChild(menu)

        let title=menu.querySelector('#memoryMatchTitle'),
            info=menu.querySelector('#memoryMatchInfo'),
            board=menu.querySelector('#memoryMatchBoard'),
            result=menu.querySelector('#memoryMatchResult'),
            done=menu.querySelector('#memoryMatchDone'),
            game=null

        function chancesFor(id){

            let m=machines[id],chances=m.chances

            for(let i in m.bonusBadges)
                if(api.BADGES.rank(api.player,m.bonusBadges[i][0])>=m.bonusBadges[i][1]) chances++

            return chances
        }

        function showChances(){

            info.innerHTML='Chances left: <b>'+game.chances+'</b>'
        }

        function finish(){

            if(game.over) return

            game.over=true
            game.locked=true

            //show the player what they missed
            for(let i in game.cards){

                let c=game.cards[i]

                if(!c.matched) c.element.classList.add('mmShown','mmMissed')
            }

            let found=game.found.length

            result.innerHTML=found?'Winner! You matched '+found+' pair'+(found>1?'s':'')+'.':'Better luck next time!'
            info.innerHTML='Come back in '+(game.machine.cooldown/HOUR)+' hours to play again.'
            done.style.display='block'
            done.textContent=found?'Collect':'Close'

            api.finished(game.machine,found)
        }

        function flip(card){

            if(!game||game.locked||card.shown||game.over) return

            card.shown=true
            card.element.classList.add('mmShown')

            if(!game.first){

                game.first=card
                return
            }

            let first=game.first

            game.first=null
            game.chances--
            showChances()

            if(first.pair===card.pair){

                first.matched=card.matched=true
                first.element.classList.add('mmMatched')
                card.element.classList.add('mmMatched')
                game.found.push(card.prize)
                result.innerHTML='Matched '+card.prize.amount+' '+api.doGrammar(card.prize.item)+'!'
                api.award(card.prize.item,card.prize.amount,game.machine)

                if(game.chances<=0||game.found.length>=game.cards.length/2)
                    window.setTimeout(finish,700)

                return
            }

            game.locked=true
            result.innerHTML='No match...'

            let thisGame=game

            window.setTimeout(function(){

                if(game!==thisGame||game.over) return

                first.shown=card.shown=false
                first.element.classList.remove('mmShown')
                card.element.classList.remove('mmShown')
                game.locked=false

                if(game.chances<=0) finish()

            },900)
        }

        function close(){

            if(game&&!game.over){

                //leaving early gives up the remaining chances
                finish()
                return
            }

            menu.style.display='none'
            game=null
        }

        menu.querySelector('#memoryMatchClose').onclick=close
        done.onclick=close

        function open(id){

            let m=machines[id],pairs=pickPairs(m),cards=[]

            for(let i in pairs){

                cards.push({pair:i,prize:pairs[i]},{pair:i,prize:pairs[i]})
            }

            shuffle(cards)

            game={machine:m,chances:chancesFor(id),cards:cards,found:[],first:null,locked:false,over:false}

            title.textContent=m.name
            title.style.backgroundColor=m.color
            board.style.gridTemplateColumns='repeat('+m.cols+',64px)'
            board.innerHTML=''
            result.innerHTML='Flip two cards to find a matching pair!'
            done.style.display='none'
            showChances()

            for(let i in cards){

                let c=cards[i],el=document.createElement('div')

                el.className='mmCard'
                el.innerHTML="<div class='mmInner'><div class='mmFace mmBack'>?</div><div class='mmFace mmFront'>"+api.itemSVGCode[c.prize.item].replace('SCALE','scale(0.8,0.8);margin:-6px')+"<div class='mmAmount'>x"+c.prize.amount+"</div></div></div>"
                el.onmousedown=function(){flip(c)}
                el.addEventListener('touchstart',function(e){flip(c);e.preventDefault()})

                c.element=el
                c.shown=false
                c.matched=false

                board.appendChild(el)
            }

            menu.style.display='block'
        }

        return {open:open,close:close,chancesFor:chancesFor,isOpen:()=>!!game}
    }

    window.BSS_MEMORY_MATCH={machines:machines,pickPairs:pickPairs,create:create}

})()

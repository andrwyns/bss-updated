//Badges: lifetime achievements that grant tickets and a permanent boost.
//Requirements and rewards follow the Bee Swarm Simulator wiki. Boosts of one badge don't stack: a higher rank replaces the lower one.
//Sticker Stack and Hive Hub badges are left out since this game has neither of those systems.
(function(){

    let TIERS=[

        {name:'Cadet',tickets:5,color:'rgb(196,132,84)',dark:'rgb(140,88,50)'},
        {name:'Hotshot',tickets:10,color:'rgb(196,204,214)',dark:'rgb(130,138,150)'},
        {name:'Ace',tickets:15,color:'rgb(255,205,50)',dark:'rgb(200,140,0)'},
        {name:'Master',tickets:25,color:'rgb(90,225,240)',dark:'rgb(20,140,170)'},
        {name:'Grandmaster',tickets:40,color:'rgb(205,110,245)',dark:'rgb(130,40,170)'}
    ]

    let FIELD_REQ=[250e3,2.5e6,25e6,250e6,5e9],
        LATE_FIELD_REQ=[50e6,500e6,5e9,50e9,1e12],
        PERCENTS_5=[0.05,0.1,0.15,0.2,0.25],
        PERCENTS_3=[0.03,0.06,0.09,0.12,0.15],
        HOUR=60*60

    let percent=(v)=>Math.round(v*100)+'%',
        applyConversion=(x,m)=>(x-1)*(1-m)+1

    //icon: [petal/shape color, center color] for fields, or the name of a special glyph
    let list=[

        {id:'honey',name:'Honey',stat:'honeyMade',task:'Make # Honey',req:[1e6,1e7,1e8,1e9,2e10],values:[1.3,1.6,1.9,2.2,2.5],icon:'honey',
            describe:(v)=>'x'+v+' Convert Rate',apply:(s,v)=>{s.convertRate*=v}},

        {id:'quest',name:'Quest',stat:'questsCompleted',task:'Complete # Quests',req:[10,50,250,1000,5000],values:[1.25,1.5,1.75,2,2.25],icon:'quest',
            describe:(v)=>'x'+v+' Capacity',apply:(s,v)=>{s.capacityMultiplier*=v}},

        {id:'battle',name:'Battle',stat:'battlePoints',task:'Obtain # Battle Points',req:[100,1000,10000,50000,500000],values:[0.1,0.2,0.4,0.7,1],icon:'battle',
            describe:(v)=>'+'+percent(v)+' Critical Power',apply:(s,v)=>{s.criticalPower+=v}},

        {id:'ability',name:'Ability',stat:'abilityTokens',task:'Collect # Ability Tokens',req:[2500,25000,100000,1e6,5e6],values:[25000,50000,100000,150000,250000],icon:'ability',
            describe:(v)=>'+'+(v/1000)+'k Capacity',apply:(s,v)=>{s.capacity+=v}},

        {id:'goo',name:'Goo',stat:'goo',task:'Collect # Goo',req:[500e3,5e6,50e6,500e6,10e9],values:[0.02,0.04,0.06,0.08,0.1],icon:'goo',
            describe:(v)=>'+'+percent(v)+' Honey Per Pollen',apply:(s,v)=>{s.honeyPerPollen*=1+v}},

        {id:'playtime',name:'Playtime',stat:'playtime',task:'Play for # Hours',divide:HOUR,req:[8*HOUR,24*HOUR,168*HOUR,720*HOUR,2400*HOUR],values:[0.01,0.02,0.03,0.04,0.05],icon:'playtime',
            describe:(v)=>'+'+percent(v)+' Bee Movespeed',apply:(s,v)=>{s.beeSpeed*=1+v}},

        {id:'sunflower',name:'Sunflower',stat:'pollenFromSunflowerField',req:FIELD_REQ,values:[0.1,0.2,0.3,0.4,0.5],icon:['rgb(255,215,40)','rgb(120,70,20)'],
            describe:(v)=>'+'+percent(v)+' Capacity',apply:(s,v)=>{s.capacityMultiplier*=1+v}},

        {id:'dandelion',name:'Dandelion',stat:'pollenFromDandelionField',req:FIELD_REQ,values:PERCENTS_3,icon:['rgb(250,250,250)','rgb(255,220,60)'],
            describe:(v)=>'+'+percent(v)+' Honey At Hive',apply:(s,v)=>{s.honeyAtHive*=1+v}},

        {id:'mushroom',name:'Mushroom',stat:'pollenFromMushroomField',req:FIELD_REQ,values:PERCENTS_3,icon:['rgb(235,50,50)','rgb(250,250,250)'],
            describe:(v)=>'+'+percent(v)+' Instant Red Conversion',apply:(s,v)=>{s.instantRedConversion=applyConversion(s.instantRedConversion,v)}},

        {id:'blueFlower',name:'Blue Flower',stat:'pollenFromBlueFlowerField',req:FIELD_REQ,values:PERCENTS_3,icon:['rgb(60,120,255)','rgb(255,230,90)'],
            describe:(v)=>'+'+percent(v)+' Instant Blue Conversion',apply:(s,v)=>{s.instantBlueConversion=applyConversion(s.instantBlueConversion,v)}},

        {id:'clover',name:'Clover',stat:'pollenFromCloverField',req:FIELD_REQ,values:[0.1,0.2,0.3,0.4,0.5],icon:['rgb(60,190,70)','rgb(30,120,40)'],
            describe:(v)=>'+'+percent(v)+' Loot Luck',apply:(s,v)=>{s.lootLuck*=1+v}},

        {id:'spider',name:'Spider',stat:'pollenFromSpiderField',req:FIELD_REQ,values:[0.1,0.15,0.2,0.25,0.3],icon:['rgb(235,235,240)','rgb(50,50,60)'],
            describe:(v)=>'+'+percent(v)+' White Pollen',apply:(s,v)=>{s.whitePollen*=1+v}},

        {id:'strawberry',name:'Strawberry',stat:'pollenFromStrawberryField',req:FIELD_REQ,values:PERCENTS_5,icon:['rgb(240,60,80)','rgb(255,235,140)'],
            describe:(v)=>'+'+percent(v)+' Red Pollen',apply:(s,v)=>{s.redPollen*=1+v}},

        {id:'bamboo',name:'Bamboo',stat:'pollenFromBambooField',req:FIELD_REQ,values:PERCENTS_5,icon:['rgb(90,150,255)','rgb(60,170,80)'],
            describe:(v)=>'+'+percent(v)+' Blue Pollen',apply:(s,v)=>{s.bluePollen*=1+v}},

        {id:'pineapple',name:'Pineapple',stat:'pollenFromPineapplePatch',req:FIELD_REQ,values:PERCENTS_3,icon:['rgb(255,200,60)','rgb(70,160,60)'],
            describe:(v)=>'+'+percent(v)+' Instant White Conversion',apply:(s,v)=>{s.instantWhiteConversion=applyConversion(s.instantWhiteConversion,v)}},

        {id:'pumpkin',name:'Pumpkin',stat:'pollenFromPumpkinPatch',req:FIELD_REQ,values:[1.2,1.4,1.6,1.8,2],icon:['rgb(255,140,30)','rgb(70,140,50)'],
            describe:(v)=>'x'+v+' Convert Rate At Hive',apply:(s,v)=>{s.convertRateAtHive*=v}},

        {id:'cactus',name:'Cactus',stat:'pollenFromCactusField',req:FIELD_REQ,values:[0.01,0.02,0.03,0.04,0.05],icon:['rgb(70,170,90)','rgb(255,120,170)'],
            describe:(v)=>'+'+percent(v)+' Instant Conversion',apply:(s,v)=>{

                s.instantRedConversion=applyConversion(s.instantRedConversion,v)
                s.instantBlueConversion=applyConversion(s.instantBlueConversion,v)
                s.instantWhiteConversion=applyConversion(s.instantWhiteConversion,v)
            }},

        {id:'rose',name:'Rose',stat:'pollenFromRoseField',req:FIELD_REQ,values:PERCENTS_5,icon:['rgb(215,25,60)','rgb(120,10,30)'],
            describe:(v)=>'+'+percent(v)+' Red Field Capacity',apply:(s,v)=>{s.redFieldCapacity*=1+v}},

        {id:'pineTree',name:'Pine Tree',stat:'pollenFromPineTreeForest',req:FIELD_REQ,values:PERCENTS_5,icon:['rgb(40,110,200)','rgb(30,110,60)'],
            describe:(v)=>'+'+percent(v)+' Blue Field Capacity',apply:(s,v)=>{s.blueFieldCapacity*=1+v}},

        {id:'stump',name:'Stump',stat:'pollenFromStumpField',req:FIELD_REQ,values:PERCENTS_5,icon:['rgb(150,105,65)','rgb(95,60,30)'],
            describe:(v)=>'+'+percent(v)+' Tool Pollen',apply:(s,v)=>{s.pollenFromTools*=1+v}},

        {id:'coconut',name:'Coconut',stat:'pollenFromCoconutField',req:LATE_FIELD_REQ,values:[1.04,1.08,1.12,1.16,1.2],icon:['rgb(245,240,225)','rgb(110,75,45)'],
            describe:(v)=>'x'+v.toFixed(2)+' White Pollen',apply:(s,v)=>{s.whitePollen*=v}},

        {id:'pepper',name:'Pepper',stat:'pollenFromPepperPatch',req:LATE_FIELD_REQ,values:PERCENTS_5,icon:['rgb(230,40,20)','rgb(255,170,30)'],
            describe:(v)=>'+'+percent(v)+' Flame Pollen',apply:(s,v)=>{s.flamePollen*=1+v}},

        //the original boosts gifted bees only. Here it's a (small) boost to all bee gathering
        {id:'mountainTop',name:'Mountain Top',stat:'pollenFromMountainTopField',req:[100e6,10e9,1e12,100e12,1e15],values:[0.01,0.02,0.03,0.04,0.05],icon:['rgb(200,225,255)','rgb(120,150,200)'],
            describe:(v)=>'+'+percent(v)+' Pollen From Bees',apply:(s,v)=>{s.pollenFromBees*=1+v}}
    ]

    let byId={}

    for(let i in list) byId[list[i].id]=list[i]

    //how many ranks of a badge the player has claimed (0 to 5)
    function rank(player,id){

        return (player.extraInfo.badges&&player.extraInfo.badges[id])|0
    }

    //how many ranks of a badge the player's stats qualify for
    function reached(player,badge){

        let v=player.stats[badge.stat]||0,r=0

        while(r<badge.req.length&&v>=badge.req[r]) r++

        return r
    }

    function claimableCount(player){

        let n=0

        for(let i in list)
            if(reached(player,list[i])>rank(player,list[i].id)) n++

        return n
    }

    function totalEarned(player){

        let n=0

        for(let i in list) n+=rank(player,list[i].id)

        return n
    }

    //claims the next rank of a badge. Returns the tier that was claimed, or undefined if the requirement isn't met
    function claim(player,id){

        let badge=byId[id]

        if(!badge) return

        let r=rank(player,id)

        if(reached(player,badge)<=r) return

        player.extraInfo.badges[id]=r+1
        player.stats.badges=totalEarned(player)

        return TIERS[r]
    }

    function applyStats(stats,player){

        for(let i in list){

            let r=rank(player,list[i].id)

            if(r) list[i].apply(stats,list[i].values[r-1])
        }
    }

    function abbreviate(n,badge){

        if(badge.divide) n/=badge.divide

        if(n<1000) return (Math.floor(n*10)/10)+''

        let units=['K','M','B','T','Qd'],u=-1

        while(n>=1000&&u<units.length-1){n/=1000;u++}

        return (n>=100?Math.floor(n):Math.floor(n*10)/10)+units[u]
    }

    function medal(badge,r){

        let t=r?TIERS[r-1]:{color:'rgb(150,150,150)',dark:'rgb(105,105,105)'},glyph=''

        if(typeof badge.icon==='object'){

            let c=r?badge.icon:['rgb(185,185,185)','rgb(120,120,120)']

            for(let a=0;a<5;a++)
                glyph+="<ellipse cx='0' cy='-5.2' rx='3.3' ry='4.6' fill='"+c[0]+"' stroke='rgb(0,0,0,0.35)' stroke-width='0.6' transform='rotate("+(a*72)+")'></ellipse>"

            glyph+="<circle r='2.9' fill='"+c[1]+"'></circle>"

        } else {

            let ink=r?'rgb(60,40,10)':'rgb(95,95,95)'

            glyph={

                honey:"<path d='M0 -9C5 -2 7 1 7 4A7 7 0 0 1 -7 4C-7 1 -5 -2 0 -9' fill='"+(r?'rgb(255,190,20)':'rgb(185,185,185)')+"' stroke='rgb(0,0,0,0.4)' stroke-width='0.8'></path><path d='M-3.5 4A3.5 3.5 0 0 0 0 7.5' fill='none' stroke='rgb(255,255,255,0.8)' stroke-width='1.3'></path>",
                quest:"<rect x='-6.5' y='-8' width='13' height='16' rx='1.5' fill='rgb(250,245,225)' stroke='"+ink+"' stroke-width='0.9'></rect><path d='M-4 -4H4M-4 0H4M-4 4H1' stroke='"+ink+"' stroke-width='1.3'></path>",
                battle:"<path d='M-7 7L5 -5M7 7L-5 -5' stroke='"+ink+"' stroke-width='2.4' stroke-linecap='round'></path><path d='M3 -9L8 -8L7 -3M-3 -9L-8 -8L-7 -3' fill='rgb(235,235,240)' stroke='"+ink+"' stroke-width='0.8'></path>",
                ability:"<circle r='7.5' fill='"+(r?'rgb(255,255,255)':'rgb(190,190,190)')+"' stroke='"+ink+"' stroke-width='1'></circle><path d='M1 -6L-3.5 1H0L-1 6L3.5 -1H0Z' fill='"+(r?'rgb(255,170,0)':'rgb(120,120,120)')+"'></path>",
                goo:"<path d='M-7 -3C-7 -9 7 -9 7 -3C7 1 5 1 5 5C5 8 2 8 2 5C2 3 -1 3 -1 6C-1 9 -4 9 -4 6C-4 2 -7 1 -7 -3' fill='"+(r?'rgb(255,90,190)':'rgb(185,185,185)')+"' stroke='rgb(0,0,0,0.4)' stroke-width='0.8'></path>",
                playtime:"<circle r='7.5' fill='rgb(250,250,250)' stroke='"+ink+"' stroke-width='1.2'></circle><path d='M0 -5V0L3.5 2.5' fill='none' stroke='"+ink+"' stroke-width='1.5' stroke-linecap='round'></path>"

            }[badge.icon]
        }

        return "<svg style='width:40px;height:44px;flex-shrink:0;pointer-events:none'>"+
            "<path d='M11 2L18 20L11 24L6 6ZM29 2L22 20L29 24L34 6Z' fill='"+(r?'rgb(60,110,235)':'rgb(125,125,125)')+"'></path>"+
            "<circle cx='20' cy='27' r='15' fill='"+t.dark+"'></circle>"+
            "<circle cx='20' cy='26' r='14' fill='"+t.color+"'></circle>"+
            "<circle cx='20' cy='26' r='11' fill='rgb(255,255,255,0.28)'></circle>"+
            "<g transform='translate(20,26)'>"+glyph+"</g></svg>"
    }

    function renderPage(player){

        let earned=totalEarned(player),order=[],html=''

        for(let i in list) order.push(list[i])

        //badges waiting to be claimed go on top
        order.sort((a,b)=>(reached(player,b)>rank(player,b.id))-(reached(player,a)>rank(player,a.id)))

        html+="<div style='text-align:center;font-size:19px;margin-top:2px'>Badges</div>"
        html+="<div style='text-align:center;font-size:11.5px;color:rgb(0,0,0,0.6);margin-bottom:6px'>"+earned+" / "+(list.length*TIERS.length)+" earned. Each badge grants tickets and a permanent boost.</div>"

        for(let i in order){

            let b=order[i],r=rank(player,b.id),canClaim=reached(player,b)>r,maxed=r>=TIERS.length,
                value=player.stats[b.stat]||0,
                goal=maxed?b.req[TIERS.length-1]:b.req[r],
                p=Math.max(0,Math.min(value/goal,1)),
                task=(b.task||'Collect # Pollen').replace('#',abbreviate(goal,b))

            html+="<div style='display:flex;gap:4px;background-color:"+(canClaim?'rgb(255,240,150)':'rgb(238,238,238)')+";border-radius:5px;padding:4px;margin-bottom:5px;"+(canClaim?'outline:2px solid rgb(240,180,0);':'')+"'>"
            html+=medal(b,r)
            html+="<div style='flex-grow:1;min-width:0'>"
            html+="<div style='font-size:13.5px;line-height:15px'>"+b.name+" <span style='font-size:11px;color:"+(r?TIERS[r-1].dark:'rgb(120,120,120)')+"'>"+(r?TIERS[r-1].name:'No rank')+"</span></div>"

            if(r)
                html+="<div style='font-family:calibri;font-size:12px;color:rgb(0,110,30);line-height:13px'>"+b.describe(b.values[r-1])+"</div>"

            if(maxed){

                html+="<div style='font-family:calibri;font-size:11.5px;color:rgb(0,0,0,0.55);line-height:13px'>All ranks earned!</div>"

            } else {

                html+="<div style='font-family:calibri;font-size:11.5px;color:rgb(0,0,0,0.6);line-height:13px'>"+TIERS[r].name+": "+task+"</div>"
                html+="<div style='position:relative;height:13px;border-radius:3px;background-color:rgb(150,150,150);margin-top:2px;overflow:hidden'><div style='position:absolute;left:0;top:0;bottom:0;width:"+(p*100).toFixed(1)+"%;background-color:"+(canClaim?'rgb(255,190,0)':'rgb(40,200,70)')+"'></div><div style='position:absolute;left:0;right:0;top:-1px;text-align:center;font-family:calibri;font-size:11px;color:white;text-shadow:0 0 2px black'>"+abbreviate(Math.min(value,goal),b)+" / "+abbreviate(goal,b)+"</div></div>"

                if(canClaim)
                    html+="<div onmousedown='window.claimBadge(\""+b.id+"\")' style='cursor:pointer;margin-top:4px;text-align:center;font-size:13px;color:white;background-color:rgb(20,170,60);border-radius:4px;padding-bottom:2px'>Claim: "+b.describe(b.values[r])+" +"+TIERS[r].tickets+" Tickets</div>"
                else
                    html+="<div style='font-family:calibri;font-size:11px;color:rgb(0,0,0,0.5);line-height:12px;margin-top:1px'>Reward: "+b.describe(b.values[r])+", "+TIERS[r].tickets+" tickets</div>"
            }

            html+="</div></div>"
        }

        return html
    }

    window.BSS_BADGES={TIERS:TIERS,list:list,byId:byId,rank:rank,reached:reached,claimableCount:claimableCount,totalEarned:totalEarned,claim:claim,applyStats:applyStats,renderPage:renderPage}

})()

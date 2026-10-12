//Beequips that were added after the original (shop) set. These come from the original game, where they're earned rather than bought:
//each one here drops from a challenge, a mob or a planter (see where index.js calls player.awardBeequip).
//The original's exact stat tables aren't public, so the stats below follow what each beequip is known for rather than exact numbers.
(function(){

    //icons are drawn around (0,0), about 50 units wide. cell: where the decal that's shown on the hive sits in the 8x8 grid of the decals texture
    let art={

        thimble:{

            name:'Thimble',cell:[4,7],description:['Protects tiny bee toes.','Bees wearing it hit','a little harder.'],
            icon:"<path d='M-11 12L-8 -12C-8 -20 8 -20 8 -12L11 12Z' fill='rgb(203,208,218)' stroke='black' stroke-width='1.5'></path>"+
                "<rect x='-14' y='10' width='28' height='6.5' rx='3' fill='rgb(168,174,188)' stroke='black' stroke-width='1.5'></rect>"+
                "<circle cx='-4' cy='-9' r='1.4' fill='rgb(135,140,155)'></circle><circle cx='3' cy='-10' r='1.4' fill='rgb(135,140,155)'></circle><circle cx='-1' cy='-4' r='1.4' fill='rgb(135,140,155)'></circle>"+
                "<circle cx='5' cy='-3' r='1.4' fill='rgb(135,140,155)'></circle><circle cx='-5' cy='1' r='1.4' fill='rgb(135,140,155)'></circle><circle cx='2' cy='3' r='1.4' fill='rgb(135,140,155)'></circle>"+
                "<path d='M-6 -14C-4 -17 0 -17.5 2 -17' stroke='rgba(255,255,255,0.8)' stroke-width='2' fill='none'></path>"
        },

        bandage:{

            name:'Bandage',cell:[5,7],description:['Patches a bee right up,','so it stays awake longer','and makes more honey.'],
            icon:"<g transform='rotate(-35)'><rect x='-23' y='-8.5' width='46' height='17' rx='8.5' fill='rgb(236,196,146)' stroke='black' stroke-width='1.5'></rect>"+
                "<rect x='-8' y='-8.5' width='16' height='17' fill='rgb(250,228,196)' stroke='black' stroke-width='1'></rect>"+
                "<circle cx='-15' cy='-3' r='1.2' fill='rgb(190,150,105)'></circle><circle cx='-15' cy='3' r='1.2' fill='rgb(190,150,105)'></circle><circle cx='-19' cy='0' r='1.2' fill='rgb(190,150,105)'></circle>"+
                "<circle cx='15' cy='-3' r='1.2' fill='rgb(190,150,105)'></circle><circle cx='15' cy='3' r='1.2' fill='rgb(190,150,105)'></circle><circle cx='19' cy='0' r='1.2' fill='rgb(190,150,105)'></circle></g>"
        },

        sweatband:{

            name:'Sweatband',cell:[6,7],description:['For bees that never','skip wing day. Faster','and full of energy.'],
            icon:"<ellipse cx='0' cy='0' rx='21' ry='14' fill='rgb(232,62,62)' stroke='black' stroke-width='1.5'></ellipse>"+
                "<ellipse cx='0' cy='-3.5' rx='14.5' ry='6.5' fill='rgb(120,22,22)' stroke='black' stroke-width='1.2'></ellipse>"+
                "<path d='M-20 4C-12 13.5 12 13.5 20 4' stroke='rgb(255,255,255)' stroke-width='3.2' fill='none'></path>"
        },

        camoBandana:{

            name:'Camo Bandana',cell:[7,7],description:['Standard issue for bees','with a Bomb ability.','Bigger booms.'],
            icon:"<path d='M-23 -11L23 -11L0 21Z' fill='rgb(98,128,62)' stroke='black' stroke-width='1.5'></path>"+
                "<ellipse cx='-9' cy='-4' rx='6.5' ry='3.2' fill='rgb(58,84,40)'></ellipse><ellipse cx='8' cy='-5.5' rx='5.5' ry='3' fill='rgb(112,88,52)'></ellipse>"+
                "<ellipse cx='0' cy='6' rx='5' ry='4' fill='rgb(58,84,40)'></ellipse><ellipse cx='-1' cy='-8' rx='3' ry='1.6' fill='rgb(152,172,104)'></ellipse><ellipse cx='5' cy='2' rx='2.6' ry='1.8' fill='rgb(152,172,104)'></ellipse>"+
                "<rect x='-27' y='-14' width='8' height='6' rx='2' fill='rgb(98,128,62)' stroke='black' stroke-width='1.3'></rect><rect x='19' y='-14' width='8' height='6' rx='2' fill='rgb(98,128,62)' stroke='black' stroke-width='1.3'></rect>"
        }
    }

    //the markup of a beequip in the beequip page. index.js cuts the icon out of it: it's whatever follows the last text element
    function svgCode(id){

        let a=art[id],lines=''

        for(let i in a.description)
            lines+="<text x='132' y='"+(33+i*13)+"' style='font-family:trebuchet ms;font-size:11px;' fill='rgb(0,0,0)' text-anchor='middle'>"+a.description[i]+"</text>"

        return "<svg onmousedown='window.functionToRunOnBeequipClick(#ID)' style='width:200px;height:70px;cursor:pointer;border-radius:8px'><rect width='200' height='70' fill='rgb(255,255,255)'></rect><rect width='70' height='70' fill='rgb(225,225,225)'></rect>"+
            "<text x='132' y='15' style='font-family:trebuchet ms;font-size:16.5px;' fill='rgb(0,0,0)' text-anchor='middle'>"+a.name+"</text>"+lines+
            "<g transform='translate(35,36)'>"+a.icon+"</g></svg>"
    }

    //builds the stat strings of a beequip out of lists of stats that were already rolled
    let join=(arr)=>arr.join(',')

    //the beequip definitions, in the format of the beequips object of index.js
    window.BSS_BEEQUIPS=function(MATH,beeInfo){

        let noReq="<br><br><br><br>"

        return {

            thimble:{

                svgCode:svgCode('thimble'),potentials:[1,2,2,3,3,4],level:3,color:'any',reqStr:noReq,
                canUseOnSlot:(slot)=>slot.type,

                generateStats:function(potential){

                    let np=potential/5,b=['+1 attack(+0)','*'+MATH.random(1.04,1.08+np*0.08).toFixed(2)+' maxEnergy(+0)'],p=[]

                    if(Math.random()<0.3+np*0.5) b.push('+'+(MATH.random(2,5+potential)|0)+' convertAmount(+0)')
                    if(Math.random()<np*0.6) p.push('+'+MATH.random(0.01,0.02+np*0.02).toFixed(2)+' defense(+0)')

                    return {bee:join(b),player:join(p)}
                }
            },

            bandage:{

                svgCode:svgCode('bandage'),potentials:[1,2,2,3,3,4],level:3,color:'any',reqStr:noReq,
                canUseOnSlot:(slot)=>slot.type,

                generateStats:function(potential){

                    let np=potential/5,b=['*'+MATH.random(1.08,1.14+np*0.12).toFixed(2)+' maxEnergy(+0)','+'+(MATH.random(3,7+potential)|0)+' convertAmount(+0)'],p=[]

                    if(Math.random()<np*0.5) b.push('+1 attack(+0)')
                    if(Math.random()<0.2+np*0.5) p.push('*'+MATH.random(1.01,1.02+np*0.02).toFixed(2)+' convertRate(+0)')

                    return {bee:join(b),player:join(p)}
                }
            },

            sweatband:{

                svgCode:svgCode('sweatband'),potentials:[1,2,2,3,3,3,4,5],level:5,color:'any',reqStr:noReq,
                canUseOnSlot:(slot)=>slot.type,

                generateStats:function(potential){

                    let np=potential/5,b=['*'+MATH.random(1.04,1.07+np*0.07).toFixed(2)+' speed(+0)','*'+MATH.random(1.1,1.16+np*0.14).toFixed(2)+' maxEnergy(+0)'],p=[]

                    if(Math.random()<0.3+np*0.5) b.push('+'+(MATH.random(2,4+potential)|0)+' gatherAmount(+0)')
                    if(Math.random()<np*0.6) p.push('*'+MATH.random(1.01,1.02+np*0.02).toFixed(2)+' beeSpeed(+0)')

                    return {bee:join(b),player:join(p)}
                }
            },

            camoBandana:{

                svgCode:svgCode('camoBandana'),potentials:[1,2,2,3,3,3,4,4,5],level:8,color:'any',
                reqStr:"<br><br><p style='font-size:13px;font-family:comic sans ms;'>Bee must know a Bomb ability.</p><br>",
                canUseOnSlot:(slot)=>slot.type&&(beeInfo[slot.type].tokens||[]).join('').toLowerCase().indexOf('bomb')>-1,

                generateStats:function(potential){

                    let np=potential/5,b=['+'+(1+(Math.random()<np*0.6?1:0))+' attack(+0)','*'+MATH.random(1.03,1.06+np*0.06).toFixed(2)+' abilityRate(+0)'],
                        p=['*'+MATH.random(1.02,1.04+np*0.04).toFixed(2)+' '+['redBombPollen','blueBombPollen','whiteBombPollen'][(Math.random()*3)|0]+'(+0)']

                    if(Math.random()<np*0.5) p.push('*'+MATH.random(1.01,1.02+np*0.02).toFixed(2)+' beeAttack(+0)')

                    return {bee:join(b),player:join(p)}
                }
            }
        }
    }

    //where each decal sits in the decals texture, in the format of textRenderer.decalUV
    window.BSS_BEEQUIP_DECALS={}

    for(let id in art) window.BSS_BEEQUIP_DECALS[id]=[128*art[id].cell[0]/1024,128*art[id].cell[1]/1024]

    //draws the hive decals of these beequips. Called at the end of window.textures_decals
    window.BSS_drawBeequipDecals=function(tex_ctx){

        for(let id in art){

            tex_ctx.setTransform(1,0,0,1,0,0)
            tex_ctx.translate(128*art[id].cell[0],128*art[id].cell[1])
            canvg(tex_ctx.canvas,"<svg><g transform='translate(64,64) scale(2.1,2.1)'>"+art[id].icon+"</g></svg>")
        }

        tex_ctx.setTransform(1,0,0,1,0,0)
    }

})()

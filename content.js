//Art for items and buffs that were added after the original set.
//Each icon is drawn once, as SVG centered on (0,0) and about 50 units wide. Use rgba() colors for transparency: the bundled canvg
//can't render the fill-opacity and stroke-opacity attributes. It's reused for the inventory entry, the hotbar and
//the token texture, so the three can't drift apart. This script has to run before index.js, which reads the inventory markup.
(function(){

    //cell: where the item's token sits in the 8x16 grid of the effects texture (128px cells)
    let items={

        nightBell:{

            name:'Night Bell',cell:[0,15],after:'cloudVial',
            description:['Summons nighttime.','A Moon Sprout and a','Vicious Bee will appear.'],
            icon:"<rect x='-3.5' y='-26' width='7' height='6' rx='2' fill='rgb(40,35,100)' stroke='black' stroke-width='1.2'></rect>"+
                "<path d='M0 -22C-12 -22 -15 -8 -15 2C-15 9 -20 12 -20 15L20 15C20 12 15 9 15 2C15 -8 12 -22 0 -22Z' fill='rgb(78,66,165)' stroke='black' stroke-width='1.5'></path>"+
                "<circle cx='0' cy='18.5' r='4' fill='rgb(255,225,90)' stroke='black' stroke-width='1.2'></circle>"+
                "<path d='M3 -13A10 10 0 1 0 9 5A8 8 0 1 1 3 -13Z' fill='rgb(255,235,130)'></path>"+
                "<path d='M-11 -6C-11 -13 -7 -17 -3 -18' stroke='rgba(255,255,255,0.4)' fill='none' stroke-width='2'></path>"
        },

        boxOFrogs:{

            name:'Box-O-Frogs',cell:[1,15],after:'nightBell',
            description:['Summons 3 gifted Frogs','on the field you\'re in,','lasting for 3 mins.'],
            icon:"<ellipse cx='0' cy='-7' rx='13' ry='10' fill='rgb(70,190,80)' stroke='black' stroke-width='1.5'></ellipse>"+
                "<circle cx='-8' cy='-16' r='5.5' fill='rgb(70,190,80)' stroke='black' stroke-width='1.5'></circle>"+
                "<circle cx='8' cy='-16' r='5.5' fill='rgb(70,190,80)' stroke='black' stroke-width='1.5'></circle>"+
                "<circle cx='-8' cy='-16' r='3' fill='white'></circle><circle cx='8' cy='-16' r='3' fill='white'></circle>"+
                "<circle cx='-7.5' cy='-16' r='1.5' fill='black'></circle><circle cx='8.5' cy='-16' r='1.5' fill='black'></circle>"+
                "<path d='M-6 -6C-3 -3 3 -3 6 -6' stroke='black' stroke-width='1.3' fill='none'></path>"+
                "<rect x='-18' y='-1' width='36' height='23' rx='2' fill='rgb(196,140,80)' stroke='black' stroke-width='1.5'></rect>"+
                "<path d='M-18 -1L-25 -8L-8 -8L-1 -1ZM18 -1L25 -8L8 -8L1 -1Z' fill='rgb(222,172,108)' stroke='black' stroke-width='1.5'></path>"+
                "<rect x='-5' y='6' width='10' height='8' rx='1' fill='rgb(245,235,210)' stroke='black' stroke-width='1'></rect>"
        },

        marshmallowBee:{

            name:'Marshmallow Bee',cell:[2,15],after:'boxOFrogs',
            description:['+50% white pollen and','capacity, +250% convert','rate for 30 mins.'],
            icon:"<ellipse cx='-12' cy='-15' rx='9' ry='5.5' fill='rgba(255,255,255,0.85)' stroke='rgb(90,90,90)' stroke-width='1' transform='rotate(-28 -12 -15)'></ellipse>"+
                "<ellipse cx='12' cy='-15' rx='9' ry='5.5' fill='rgba(255,255,255,0.85)' stroke='rgb(90,90,90)' stroke-width='1' transform='rotate(28 12 -15)'></ellipse>"+
                "<rect x='-16' y='-13' width='32' height='32' rx='10' fill='rgb(255,250,245)' stroke='black' stroke-width='1.5'></rect>"+
                "<rect x='-15.2' y='3' width='30.4' height='4.5' fill='rgb(255,185,200)'></rect>"+
                "<rect x='-14.6' y='11' width='29.2' height='4.5' fill='rgb(255,185,200)'></rect>"+
                "<circle cx='-6' cy='-5' r='2.2' fill='black'></circle><circle cx='6' cy='-5' r='2.2' fill='black'></circle>"+
                "<path d='M-3 -1C-1 1.5 1 1.5 3 -1' stroke='black' stroke-width='1.2' fill='none'></path>"
        }
    }

    //buff icons shown in the row of active effects (30x30, drawn around the top left corner)
    let effects={

        wealthClock:{

            after:'polarPower',background:'rgb(255,200,40)',
            icon:"<circle cx='15' cy='15' r='10' fill='rgb(255,255,255)' stroke='rgb(120,80,0)' stroke-width='2'></circle>"+
                "<path d='M15 8.5V15L19.5 17.5' stroke='rgb(120,80,0)' stroke-width='2' fill='none' stroke-linecap='round'></path>"
        },

        marshmallowBeeBuff:{

            after:'wealthClock',background:'rgb(255,170,190)',
            icon:"<g transform='translate(15,16) scale(0.46,0.46)'>"+items.marshmallowBee.icon+"</g>"
        }
    }

    function inventoryMarkup(id){

        let item=items[id],lines=''

        for(let i in item.description)
            lines+="<text x='133' y='"+(39+i*14)+"' style='font-family:trebuchet ms;font-size:12px;' fill='rgb(0,0,0)' text-anchor='middle'>"+item.description[i]+"</text>"

        //index.js cuts the icon out of this markup: it has to be whatever follows the (empty) amount text
        return "<svg id='"+id+"' style='width:200px;height:70px;cursor:pointer;border-radius:5px;display:none'>"+
            "<rect width='200' height='70' fill='rgb(255,255,255)'></rect><rect width='70' height='70' fill='rgb(225,225,225)'></rect>"+
            "<text x='132' y='18' style='font-family:trebuchet ms;font-size:"+(item.name.length>14?14.5:16.5)+"px;' fill='rgb(0,0,0)' text-anchor='middle'>"+item.name+"</text>"+lines+
            "<text id='"+id+"_amount' x='67' y='67' style='font-family:calibri;font-size:14px;' fill='rgb(0,0,0)' text-anchor='end'></text>"+
            "<g transform='translate(35,34)'>"+item.icon+"</g></svg>"
    }

    function effectMarkup(id){

        return "<svg id='"+id+"' style='width:30px;height:30px;display:none'><rect width='30' height='30' fill='"+effects[id].background+"'></rect>"+effects[id].icon+
            "<rect id='"+id+"_cooldown' width='30' height='0' style='fill:rgb(0,0,0);' opacity='0.45'></rect>"+
            "<text id='"+id+"_amount' x='28' y='28' style='font-family:calibri;font-size:11px;' text-anchor='end'></text></svg>"
    }

    for(let id in items){

        let anchor=document.getElementById(items[id].after)

        if(anchor&&!document.getElementById(id)) anchor.insertAdjacentHTML('afterend',inventoryMarkup(id))
    }

    for(let id in effects){

        let anchor=document.getElementById(effects[id].after)

        if(anchor&&!document.getElementById(id)) anchor.insertAdjacentHTML('afterend',effectMarkup(id))
    }

    //draws the item tokens into the effects texture. Called at the end of window.textures_effects
    function drawTokens(tex_ctx){

        for(let id in items){

            let cell=items[id].cell

            tex_ctx.setTransform(1,0,0,1,0,0)
            tex_ctx.translate(128*cell[0],128*cell[1])
            tex_ctx.fillStyle='rgb(100,200,255)'
            tex_ctx.fillRect(0,0,128,128)
            canvg(tex_ctx.canvas,"<svg><rect fill='rgb(100,200,255)' x='0' y='0' width='128' height='128'></rect><g transform='translate(64,64) scale(1.85,1.85)'>"+items[id].icon+"</g></svg>")
        }

        tex_ctx.setTransform(1,0,0,1,0,0)
    }

    window.BSS_CONTENT={items:items,effects:effects,drawTokens:drawTokens}

})()

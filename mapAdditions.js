//World geometry for structures that were added after the original map was made.
//Positions live in window.BSS_WORLD so the map mesh and the gameplay triggers in index.js always agree on where things are.
(function(){

    let DEG=Math.PI/180

    window.BSS_WORLD={

        //pos is the point on the ground the structure stands on. facing is the yaw (in degrees) of the side the player uses.
        //zone overrides bounds of the area it's used from (the werewolf's territory ends at z=88.5, and nobody plays cards while being mauled)
        memoryMatch:{

            basic:{pos:[-39,12.5,73.5],facing:180,sign:[0.12,0.35,1]},
            mega:{pos:[27,12.5,90],facing:180,sign:[0.85,0.2,0.2],zone:{minZ:88.7}},
            night:{pos:[-21,47.75,128],facing:180,sign:[0.25,0.18,0.5]},
            extreme:{pos:[54,18,-45.5],facing:0,sign:[0.08,0.08,0.08]}
        },

        wealthClock:{pos:[-66.5,6.5,14.5]},

        //the guild's notice board stands next to the mega memory match, which only guild members can play
        guildBoard:{pos:[22.5,12.5,90.8]},

        //the hideout is a walled yard outside of the map's west wall. It's entered through the vines on the rocks next to Brown Bear
        commandoHideout:{

            entrance:[-73.2,6.5,15.5],
            inside:[-87.5,6.5,15.5],
            nest:[-101,6.5,10],
            arena:{minX:-108,maxX:-93,minZ:1.5,maxZ:18.5}
        },

        //the cave is far below the map, where no light reaches. It's entered through the dark opening of the werewolf's cave
        cave:{

            entrance:[4,12.5,75],
            outside:[7.5,12.5,75],
            inside:[2.5,-40,75],
            treasure:[33.5,-40,75],
            monsters:[[15,-39,72.5],[25,-39,77.5]],
            bounds:{minX:7.5,maxX:36,minY:-41,maxY:-34,minZ:70,maxZ:80}
        }
    }

    //the bounds of the area a player has to stand in to use something at pos
    window.BSS_WORLD.zone=function(pos,radius,height){

        return {minX:pos[0]-radius,maxX:pos[0]+radius,minY:pos[1]-1,maxY:pos[1]+(height||5),minZ:pos[2]-radius,maxZ:pos[2]+radius}
    }

    window.mapMeshAdditions=function(box,cylinder,sphere,star,INFO){

        //a standing board of face down cards under a colored sign
        function memoryMatchBooth(m){

            let x=m.pos[0],y=m.pos[1],z=m.pos[2],rot=[0,m.facing,0],
                s=Math.sin(m.facing*DEG),c=Math.cos(m.facing*DEG),
                //moves a point from the booth's local space (right, up, front) into the world
                at=(right,up,front)=>[x+right*c+front*s,y+up,z-right*s+front*c]

            box(x,y+0.15,z,3.6,0.3,1.6,rot,[0.4,0.4,0.44],true,false)
            box(x,y+1.75,z,3.2,2.9,0.5,rot,[0.16,0.17,0.22],true,false)
            box(...at(0,3.45,0),3.6,0.55,0.7,rot,m.sign,false,false)
            box(...at(-1.5,0.9,0),0.25,1.8,0.6,rot,[0.3,0.3,0.34],false,false)
            box(...at(1.5,0.9,0),0.25,1.8,0.6,rot,[0.3,0.3,0.34],false,false)

            for(let i=0;i<4;i++){

                for(let j=0;j<4;j++){

                    let faceUp=(i+j*3)%7===0

                    box(...at((i-1.5)*0.68,0.65+j*0.62,0.27),0.56,0.5,0.06,rot,faceUp?[1.1,1.1,1.1]:[1.15,0.72,0.12],false,false)

                    if(faceUp)
                        box(...at((i-1.5)*0.68,0.65+j*0.62,0.31),0.26,0.24,0.03,rot,m.sign,false,false)
                }
            }
        }

        for(let i in window.BSS_WORLD.memoryMatch)
            memoryMatchBooth(window.BSS_WORLD.memoryMatch[i])

        //commando chick's hideout: the vines covering its entrance stay until the player cuts them
        let h=window.BSS_WORLD.commandoHideout,e=h.entrance,grass=[0.22,0.52,0.2],wood=[0.42,0.27,0.12],stone=[0.42,0.42,0.45]

        box(e[0]-1.28,e[1]+2.3,e[2],0.12,4.4,3.2,false,[0.02,0.02,0.03],false,false)

        if(!INFO.commandoVinesCut){

            for(let i=0;i<7;i++){

                box(e[0]-1.18,e[1]+2.5-(i%3)*0.25,e[2]-1.5+i*0.5,0.14,4.6-(i%3)*0.5,0.34,false,i%2?[0.1,0.45,0.12]:[0.14,0.55,0.16],false,false)
            }

            box(e[0]-1.15,e[1]+4.7,e[2],0.2,0.5,3.6,false,[0.1,0.4,0.1],false,false)
        }

        box(-97,6,10,26,1,23,false,grass,true,true)
        box(-110.5,9,10,1,7,25,false,wood,true,true)
        box(-97,9,-2,28,7,1,false,wood,true,true)
        box(-97,9,22,28,7,1,false,wood,true,true)
        box(-84.55,8.8,h.inside[2],0.15,4.4,3.2,false,[0.02,0.02,0.03],false,false)
        box(-86.5,6.6,h.inside[2],4,0.2,5,false,stone,true,true)

        //the nest, and some cover to hide from grenades behind
        cylinder(h.nest[0],h.nest[1]+0.15,h.nest[2],2.6,0.3,12,0.55,0.4,0.2,1,-90,0,0)
        cylinder(h.nest[0],h.nest[1]+0.3,h.nest[2],1.9,0.2,12,0.75,0.62,0.3,1,-90,0,0)
        box(-93.5,7.3,4.5,2,1.6,2,[0,20,0],wood,true,true)
        box(-93,7.1,17,1.6,1.2,1.6,[0,-15,0],wood,true,true)
        box(-106.5,7.3,16.5,2,1.6,2,[0,35,0],wood,true,true)
        box(-105.5,7,3.5,3.2,1,1,[0,-25,0],[0.6,0.55,0.4],true,true)
        box(-90.5,7,10,1,1,3.2,false,[0.6,0.55,0.4],true,true)

        //the cave of the cave monsters
        let c=window.BSS_WORLD.cave,rock=[0.13,0.12,0.15],darkRock=[0.09,0.08,0.11]

        box(18,-40.5,75,38,1,12,false,rock,true,true)
        box(18,-34.5,75,38,1,12,false,darkRock,true,true)
        box(18,-37.5,69.5,38,5,1,false,rock,true,true)
        box(18,-37.5,80.5,38,5,1,false,rock,true,true)
        box(-0.5,-37.5,75,1,5,12,false,rock,true,true)
        box(36.5,-37.5,75,1,5,12,false,rock,true,true)

        //a faint light where the way back up is
        box(0.05,-37.8,75,0.1,4,3.4,false,[1.2,1.3,1.6],false,false)

        for(let i=0;i<9;i++){

            let x=6+i*3.4,side=i%2?1:-1,size=0.7+(i*37%5)*0.2

            box(x,-40+size,75+side*(4.2-size*0.4),size,size*2,size,[0,i*29,0],darkRock,true,true)
            box(x+1.6,-35-size*0.6,75-side*(3.6-size*0.4),size*0.7,size*1.2,size*0.7,[0,i*17,0],darkRock,false,true)
        }

        box(c.treasure[0],c.treasure[1]+0.2,c.treasure[2],2.2,0.4,2.2,false,[0.3,0.28,0.2],true,true)

        //the notice board of the badge bearer's guild, covered in notices
        let g=window.BSS_WORLD.guildBoard.pos,notes=[[-1.05,2.75,[1.1,1.05,0.8]],[-0.2,2.85,[1.1,1.1,1.1]],[0.75,2.7,[0.75,1,1.15]],[-0.75,1.85,[1.15,0.85,0.8]],[0.2,1.9,[1.1,1.05,0.8]],[1.05,1.8,[1.1,1.1,1.1]]]

        box(g[0]-1.7,g[1]+1.7,g[2],0.28,3.4,0.28,false,wood,true,true)
        box(g[0]+1.7,g[1]+1.7,g[2],0.28,3.4,0.28,false,wood,true,true)
        box(g[0],g[1]+2.3,g[2],3.4,2.2,0.2,false,[0.62,0.44,0.24],true,true)
        box(g[0],g[1]+3.75,g[2],4.1,0.3,0.9,[12,0,0],[0.5,0.14,0.1],false,true)
        box(g[0],g[1]+3.45,g[2]-0.14,2.2,0.34,0.08,false,[1,0.78,0.15],false,false)
        star(g[0],g[1]+4.25,g[2]-0.1,0.2,0.45,0.12,0.12,1.3,1.05,0.2)

        for(let i in notes)
            box(g[0]+notes[i][0],g[1]+notes[i][1],g[2]-0.12,0.72,0.72,0.04,[0,0,i*7-15],notes[i][2],false,false)

        //wealth clock: a golden grandfather clock with a face on both sides
        let w=window.BSS_WORLD.wealthClock.pos

        box(w[0],w[1]+0.2,w[2],2.6,0.4,2,false,[0.35,0.22,0.1],true,false)
        box(w[0],w[1]+1.3,w[2],1.5,1.8,1.1,false,[0.5,0.32,0.14],true,false)
        box(w[0],w[1]+1.3,w[2],1.1,1.3,1.14,false,[0.95,0.75,0.15],false,false)
        box(w[0],w[1]+3.5,w[2],2.7,2.7,1,false,[1,0.78,0.12],true,false)
        box(w[0],w[1]+5,w[2],3.1,0.35,1.3,false,[0.5,0.32,0.14],false,false)
        star(w[0],w[1]+5.9,w[2],0.35,0.75,0.2,0.2,1.3,1.1,0.2)

        for(let side=-1;side<=1;side+=2){

            cylinder(w[0],w[1]+3.5,w[2]+side*0.5,1.1,0.08,20,1.3,1.3,1.22,1,0,0,0)
            box(w[0],w[1]+3.92,w[2]+side*0.56,0.11,0.85,0.04,false,[0.1,0.07,0.02],false,false)
            box(w[0]+side*0.27,w[1]+3.5,w[2]+side*0.56,0.55,0.11,0.04,false,[0.1,0.07,0.02],false,false)
            cylinder(w[0],w[1]+3.5,w[2]+side*0.57,0.11,0.04,8,0.1,0.07,0.02,1,0,0,0)
        }
    }

})()

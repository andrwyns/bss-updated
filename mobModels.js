//Detailed models for the mobs. Each one replaces the mesh of the same name in index.js, keeping roughly the old size so
//hit boxes, health bars and spawn heights still line up. Mobs face -z. anim says how the shader swings their legs:
//vertices below legTop and further than minX from the middle are legs, amount is how far they swing, speed how fast,
//and zPhase how much the legs further along the body lag behind (0 for animals that walk on two legs).
(function(){

    const DEG=180/Math.PI

    function kit(b,c,e){

        let k={b,c,e}

        //a limb from p0 to p1: a tapered cylinder (r0 at p0, r1 at p1), or a box if square is set
        k.seg=(p0,p1,r0,col,r1=r0,square=false,sides=7)=>{

            let dx=p1[0]-p0[0],dy=p1[1]-p0[1],dz=p1[2]-p0[2],len=Math.hypot(dx,dy,dz),
                rx=Math.asin(-dy/len)*DEG||0.0001,ry=Math.atan2(dx,dz)*DEG,mx=(p0[0]+p1[0])*0.5,my=(p0[1]+p1[1])*0.5,mz=(p0[2]+p1[2])*0.5

            if(square) b(mx,my,mz,r0*2,r0*2,len,...col,rx,ry,0)
            else c(mx,my,mz,r1,len,sides,...col,rx,ry,0,r0)
        }

        //a jointed leg: hip to knee to foot, with a ball at the knee
        k.leg=(hip,knee,foot,r,col,footR=r*0.8)=>{

            k.seg(hip,knee,r,col,r*0.85)
            k.seg(knee,foot,r*0.85,col,footR)
            e(...knee,r*1.05,r*1.05,r*1.05,...col,0)
        }

        //runs f for the right (-1) and left (1) side
        k.both=f=>{f(-1);f(1)}

        k.eye=(x,y,z,r,white=[1.4,1.4,1.4],pupil=[0.02,0.02,0.02],fz=-1)=>{

            e(x,y,z,r,r,r*0.8,...white,1)
            e(x+(x>0?-r*0.15:r*0.15),y+r*0.1,z+fz*r*0.62,r*0.55,r*0.6,r*0.3,...pupil,1)
            e(x+(x>0?-r*0.32:r*0.32),y+r*0.38,z+fz*r*0.82,r*0.16,r*0.16,r*0.1,1.6,1.6,1.6,0)
        }

        //a spot or patch lying on the surface of an ellipsoid at angles a (around) and t (from the top)
        k.onShell=(cx,cy,cz,sx,sy,sz,a,t,r,col,lift=0.97)=>{

            let x=Math.sin(t)*Math.sin(a),y=Math.cos(t),z=Math.sin(t)*Math.cos(a)

            e(cx+x*sx*lift,cy+y*sy*lift,cz+z*sz*lift,r,r*0.55+Math.abs(y)*r*0.45,r,...col,1,-Math.cos(a)*t*DEG*0.9,0,Math.sin(a)*t*DEG*0.9)
        }

        return k
    }

    //the six legs every insect here uses: three per side, each a hip, a raised knee and a foot on the ground
    function insectLegs(k,col,r,body,ground,spread=1){

        k.both(s=>{

            for(let i=0;i<3;i++){

                let z=body[i],out=[0.35,0.4,0.35][i]*spread,fwd=[-0.35,0,0.3][i]

                k.leg([s*0.3*spread,body[3],z],[s*(0.35+out),body[3]+0.18,z+fwd*0.5],[s*(0.45+out*1.55),ground,z+fwd],r,col)
            }
        })
    }

    window.mobModels={

        ladybug:{

            anim:{legTop:-0.28,minX:0.5,amount:0.55,speed:13,zPhase:3},

            build:function(b,c,e){

                let k=kit(b,c,e),RED=[0.95,0.06,0.05],BLACK=[0.06,0.05,0.06],WHITE=[1.4,1.4,1.4]

                //belly and the glossy red dome of the wing cases
                e(0,-0.2,0.1,0.55,0.26,0.66,...BLACK,1)
                e(0,0,0.12,0.64,0.52,0.74,...RED,2)

                //the seam between the wing cases, and the black spots
                for(let i=0;i<9;i++){

                    let t=-0.9+i*0.24,y=Math.cos(t)*0.515,z=0.12+Math.sin(t)*0.74

                    b(0,y,z,0.05,0.04,0.2,...BLACK,-t*DEG||0.0001,0,0)
                }

                let spots=[[0.6,0.75,0.17],[-0.6,0.75,0.17],[1.25,1.05,0.14],[-1.25,1.05,0.14],[2.2,0.95,0.15],[-2.2,0.95,0.15],[1.7,0.45,0.12],[-1.7,0.45,0.12],[2.9,0.5,0.13]]

                for(let i in spots) k.onShell(0,0,0.12,0.64,0.52,0.74,spots[i][0],spots[i][1],spots[i][2],BLACK)

                //the head with its white cheek marks, big friendly eyes and antennae
                e(0,-0.05,-0.6,0.42,0.3,0.26,...BLACK,1)
                e(0,-0.1,-0.78,0.3,0.24,0.2,...BLACK,1)
                k.both(s=>{

                    e(s*0.27,0.05,-0.7,0.1,0.08,0.06,...WHITE,1)
                    k.eye(s*0.14,0.02,-0.92,0.11)
                    k.seg([s*0.1,0.12,-0.88],[s*0.22,0.42,-1.08],0.02,BLACK,0.018)
                    e(s*0.22,0.44,-1.1,0.05,0.05,0.05,...BLACK,1)
                })

                insectLegs(k,BLACK,0.045,[-0.4,0.05,0.45,-0.22],-0.7)
            }
        },

        rhinoBeetle:{

            anim:{legTop:-0.28,minX:0.5,amount:0.5,speed:12,zPhase:3},

            build:function(b,c,e){

                let k=kit(b,c,e),SHELL=[0.07,0.09,0.42],DARK=[0.03,0.03,0.12],SHINE=[0.25,0.32,0.9]

                e(0,-0.2,0.1,0.52,0.24,0.7,...DARK,1)

                //wing cases split down the middle with a shiny highlight on each
                k.both(s=>{

                    e(s*0.27,0.02,0.3,0.3,0.42,0.62,...SHELL,2)
                    e(s*0.27,0.28,0.32,0.12,0.06,0.35,...SHINE,1)
                })

                b(0,0.02,0.3,0.03,0.82,1.22,...DARK)

                //the thorax with a small horn, the head, and the big curved horn
                e(0,0.04,-0.45,0.48,0.36,0.32,...SHELL,2)
                k.seg([0,0.32,-0.45],[0,0.48,-0.62],0.07,SHELL,0.02)
                e(0,-0.1,-0.78,0.26,0.2,0.22,...DARK,1)

                let horn=[[0,-0.05,-0.88],[0,0.05,-1.05],[0,0.22,-1.17],[0,0.42,-1.22],[0,0.6,-1.18]]

                for(let i=0;i<horn.length-1;i++) k.seg(horn[i],horn[i+1],0.12-i*0.025,i>2?[0.2,0.2,0.5]:SHELL,0.1-i*0.025)

                k.both(s=>{

                    k.eye(s*0.17,-0.02,-0.9,0.07,[1.4,1.3,0.6])
                    k.seg([s*0.15,-0.15,-0.92],[s*0.22,-0.25,-1.02],0.025,DARK,0.015)
                })

                insectLegs(k,DARK,0.065,[-0.45,0.05,0.5,-0.22],-0.7,0.85)
            }
        },

        kingBeetle:{

            anim:{legTop:-0.28,minX:0.5,amount:0.45,speed:9,zPhase:3},

            build:function(b,c,e){

                let k=kit(b,c,e),SHELL=[1.15,0.08,0.06],DARK=[0.35,0.02,0.02],GOLD=[1.6,1.25,0.2],LEG=[0.15,1.0,0.2]

                e(0,-0.2,0.1,0.52,0.24,0.7,...DARK,1)

                k.both(s=>{

                    e(s*0.27,0.02,0.3,0.3,0.44,0.64,...SHELL,2)
                    e(s*0.27,0.3,0.32,0.12,0.06,0.36,1.6,0.6,0.5,1)
                })

                b(0,0.02,0.3,0.03,0.86,1.26,...GOLD)

                //a crowned thorax and a pair of huge golden mandibles
                e(0,0.04,-0.45,0.5,0.38,0.33,...SHELL,2)

                for(let i=0;i<5;i++) k.seg([(i-2)*0.15,0.36,-0.45],[(i-2)*0.18,0.56-Math.abs(i-2)*0.05,-0.5],0.04,GOLD,0.01)

                e(0,-0.08,-0.78,0.3,0.2,0.22,...DARK,1)

                k.both(s=>{

                    k.seg([s*0.18,-0.02,-0.9],[s*0.32,0.12,-1.2],0.07,GOLD,0.06)
                    k.seg([s*0.32,0.12,-1.2],[s*0.15,0.2,-1.5],0.06,GOLD,0.02)
                    k.seg([s*0.3,0.1,-1.22],[s*0.4,0.2,-1.3],0.03,GOLD,0.01)
                    k.eye(s*0.18,0,-0.92,0.08,[1.6,1.1,0.2],[0.4,0,0])
                })

                insectLegs(k,LEG,0.065,[-0.45,0.05,0.5,-0.22],-0.7,0.85)
            }
        },

        spider:{

            anim:{legTop:0.9,minX:0.95,amount:0.18,speed:10,zPhase:2.5},

            build:function(b,c,e){

                let k=kit(b,c,e),BLACK=[0.07,0.07,0.08],FUR=[0.13,0.12,0.13],RED=[1.3,0.05,0.05]

                //a big abdomen with a red hourglass, and a hairy cephalothorax
                e(0,0.25,1.05,0.85,0.72,1.0,...BLACK,2)
                e(0,0.92,1.0,0.16,0.04,0.2,...RED,1)
                e(0,0.92,1.32,0.12,0.04,0.14,...RED,1)
                e(0,0.92,0.72,0.12,0.04,0.14,...RED,1)
                e(0,0.05,-0.35,0.62,0.45,0.62,...FUR,2)
                e(0,0.12,-0.85,0.42,0.34,0.3,...BLACK,1)

                for(let i=0;i<10;i++) k.seg([Math.sin(i*1.7)*0.4,0.35+Math.cos(i*2.3)*0.1,-0.4+Math.cos(i*1.3)*0.3],[Math.sin(i*1.7)*0.5,0.52,-0.45+Math.cos(i*1.3)*0.35],0.025,FUR,0.005,true)

                //eight glowing red eyes and two fangs
                k.both(s=>{

                    e(s*0.15,0.25,-1.1,0.1,0.1,0.07,...RED,1)
                    e(s*0.32,0.32,-1.0,0.07,0.07,0.05,...RED,1)
                    e(s*0.1,0.42,-1.05,0.05,0.05,0.04,...RED,1)
                    e(s*0.25,0.45,-0.98,0.05,0.05,0.04,...RED,1)
                    k.seg([s*0.13,-0.05,-1.08],[s*0.1,-0.3,-1.2],0.06,BLACK,0.035)
                    k.seg([s*0.1,-0.3,-1.2],[s*0.06,-0.42,-1.12],0.035,[0.6,0.1,0.1],0.008)
                })

                //eight long legs arching high over the body
                k.both(s=>{

                    for(let i=0;i<4;i++){

                        let z=-0.75+i*0.32,spread=[-0.5,-0.15,0.2,0.55][i],hip=[s*0.5,0.05,z],knee=[s*1.35,1.0-Math.abs(i-1.5)*0.08,z+spread*0.7],foot=[s*2.0,-0.5,z+spread*1.6]

                        k.leg(hip,knee,foot,0.08,BLACK,0.035)

                        for(let j=1;j<4;j++){

                            let t=j/4,p=[hip[0]+(knee[0]-hip[0])*t,hip[1]+(knee[1]-hip[1])*t,hip[2]+(knee[2]-hip[2])*t]

                            k.seg(p,[p[0]+s*0.02,p[1]+0.12,p[2]],0.015,FUR,0.004,true)
                        }
                    }
                })
            }
        },

        mantis:{

            anim:{legTop:0.1,minX:0.3,amount:0.3,speed:9,zPhase:2},

            build:function(b,c,e){

                let k=kit(b,c,e),GREEN=[0.12,0.75,0.2],LIGHT=[0.35,1.05,0.35],DARK=[0.05,0.45,0.1],EYE=[0.95,1.2,0.35]

                //a long banded abdomen under folded wings
                e(0,0.25,0.75,0.34,0.28,0.85,...GREEN,2,-8,0,0)

                for(let i=0;i<4;i++) e(0,0.25-i*0.01,0.35+i*0.25,0.355,0.06,0.07,...DARK,1)

                k.both(s=>e(s*0.16,0.52,0.8,0.22,0.05,0.85,...LIGHT,1,-6,s*-4,0))

                //the upright thorax and the triangular head
                k.seg([0,0.35,0.0],[0,1.65,-0.45],0.17,GREEN,0.13)
                e(0,1.72,-0.5,0.16,0.14,0.16,...GREEN,1)
                e(0,1.95,-0.72,0.36,0.24,0.2,...GREEN,1)
                e(0,1.76,-0.85,0.12,0.14,0.1,...DARK,1)

                k.both(s=>{

                    e(s*0.33,2.0,-0.76,0.15,0.16,0.14,...EYE,1)
                    e(s*0.36,2.02,-0.86,0.06,0.07,0.05,0.05,0.2,0.05,1)
                    k.seg([s*0.08,2.15,-0.85],[s*0.25,2.6,-1.25],0.018,DARK,0.01)

                    //the raptorial forelegs: a long spiked femur pointing up and forward, the blade folded back down
                    let shoulder=[s*0.15,1.45,-0.45],elbow=[s*0.3,1.65,-1.25],wrist=[s*0.28,0.95,-1.05]

                    k.seg(shoulder,[s*0.25,1.1,-0.8],0.08,GREEN,0.07)
                    k.seg([s*0.25,1.1,-0.8],elbow,0.1,GREEN,0.08)
                    k.seg(elbow,wrist,0.07,LIGHT,0.03,true)

                    for(let i=0;i<4;i++){

                        let t=(i+0.5)/4,p=[s*(0.25+0.05*t),1.1+0.55*t,-0.8-0.45*t]

                        k.seg(p,[p[0],p[1]-0.14,p[2]+0.04],0.025,DARK,0.005,true)
                    }

                    //four walking legs
                    k.leg([s*0.15,0.4,-0.1],[s*0.6,0.65,-0.35],[s*0.95,-0.45,-0.7],0.045,GREEN)
                    k.leg([s*0.15,0.35,0.2],[s*0.7,0.65,0.35],[s*1.0,-0.45,0.85],0.045,GREEN)
                })
            }
        },

        scorpion:{

            anim:{legTop:-0.05,minX:0.6,amount:0.45,speed:13,zPhase:3},

            build:function(b,c,e){

                let k=kit(b,c,e),RED=[0.85,0.12,0.08],DARK=[0.45,0.05,0.04],CLAW=[0.95,0.2,0.1],STING=[0.15,0.05,0.05]

                //armored carapace and segmented back
                e(0,0.05,-0.35,0.52,0.28,0.48,...RED,2)

                for(let i=0;i<4;i++) e(0,0.05-i*0.02,0.15+i*0.24,0.48-i*0.06,0.24-i*0.02,0.17,...(i%2?DARK:RED),1)

                k.both(s=>{

                    k.eye(s*0.12,0.3,-0.72,0.06,[0.15,0.15,0.15],[0.02,0.02,0.02])

                    //big pincers: arm, hand and two fingers
                    k.seg([s*0.35,-0.05,-0.65],[s*0.65,-0.05,-1.1],0.11,RED,0.09)
                    k.seg([s*0.65,-0.05,-1.1],[s*0.7,-0.08,-1.5],0.09,RED,0.12)
                    e(s*0.72,-0.08,-1.72,0.24,0.17,0.3,...CLAW,1)
                    k.seg([s*0.62,-0.06,-1.95],[s*0.48,-0.06,-2.35],0.08,CLAW,0.015)
                    k.seg([s*0.82,-0.1,-1.95],[s*0.62,-0.1,-2.32],0.065,DARK,0.015)

                    //four legs per side
                    for(let i=0;i<4;i++){

                        let z=-0.4+i*0.25

                        k.leg([s*0.4,-0.05,z],[s*0.85,0.18,z+(i-1.5)*0.15],[s*1.15,-0.42,z+(i-1.5)*0.35],0.045,DARK)
                    }
                })

                //the tail arching over the back to a hooked stinger
                let tail=[[0,0.05,0.95],[0,0.45,1.25],[0,0.95,1.38],[0,1.45,1.3],[0,1.85,1.05],[0,2.0,0.7]]

                for(let i=0;i<tail.length-1;i++){

                    k.seg(tail[i],tail[i+1],0.2-i*0.02,i%2?DARK:RED,0.18-i*0.02)
                    e(...tail[i+1],0.19-i*0.02,0.19-i*0.02,0.19-i*0.02,...RED,1)
                }

                e(0,1.95,0.48,0.15,0.13,0.2,...RED,1)
                k.seg([0,1.92,0.32],[0,1.65,0.15],0.07,STING,0.01)
            }
        },

        werewolf:{

            anim:{legTop:0.15,minX:0.15,amount:0.4,speed:8,zPhase:0},

            build:function(b,c,e){

                let k=kit(b,c,e),FUR=[0.4,0.37,0.35],DARK=[0.22,0.2,0.2],LIGHT=[0.58,0.55,0.5],CLAW=[1.3,1.25,1.1],EYE=[1.6,1.4,0.1]

                //a hunched barrel chest and lean belly
                e(0,1.15,0.25,0.85,0.8,0.62,...FUR,2,-20,0,0)
                e(0,0.45,0.4,0.6,0.5,0.45,...FUR,1)
                e(0,1.05,-0.25,0.55,0.5,0.25,...LIGHT,1,-20,0,0)

                //shaggy tufts on the shoulders and back
                for(let i=0;i<9;i++){

                    let a=-1+i*0.25,x=Math.sin(a)*0.75,z=0.55+Math.cos(a)*0.2

                    k.seg([x,1.6,z],[x*1.25,1.95,z+0.25],0.1,DARK,0.01,true)
                }

                //digitigrade legs with clawed feet
                k.both(s=>{

                    k.seg([s*0.4,0.35,0.45],[s*0.5,-0.2,0.05],0.22,FUR,0.16)
                    k.seg([s*0.5,-0.2,0.05],[s*0.48,-0.75,0.5],0.15,FUR,0.11)
                    k.seg([s*0.48,-0.75,0.5],[s*0.5,-1.05,0.25],0.11,DARK,0.1)
                    e(s*0.5,-1.08,0.0,0.18,0.08,0.3,...DARK,1)

                    for(let j=-1;j<=1;j++) k.seg([s*0.5+j*0.08,-1.08,-0.25],[s*0.5+j*0.09,-1.12,-0.4],0.03,CLAW,0.005)

                    //long arms reaching forward, ending in big claws
                    k.seg([s*0.75,1.55,0.15],[s*1.1,0.95,-0.15],0.2,FUR,0.16)
                    k.seg([s*1.1,0.95,-0.15],[s*1.05,0.55,-0.75],0.16,FUR,0.13)
                    e(s*1.05,0.48,-0.85,0.17,0.15,0.2,...DARK,1)

                    for(let j=-1;j<=1;j++) k.seg([s*1.05+j*0.08,0.45,-1.0],[s*1.05+j*0.12,0.25,-1.25],0.035,CLAW,0.005)
                })

                //the wolf's head: skull, long muzzle, black nose, fangs, burning eyes and pointed ears
                e(0,1.95,-0.15,0.45,0.42,0.45,...FUR,2)
                e(0,1.78,-0.7,0.24,0.2,0.4,...LIGHT,1)
                e(0,1.88,-1.05,0.1,0.08,0.08,0.05,0.05,0.05,1)
                b(0,1.6,-0.68,0.36,0.08,0.45,...DARK)

                k.both(s=>{

                    k.seg([s*0.1,1.66,-0.95],[s*0.1,1.5,-0.98],0.035,CLAW,0.005)
                    e(s*0.2,2.08,-0.52,0.09,0.06,0.04,...EYE,1)
                    k.seg([s*0.25,2.2,-0.5],[s*0.08,2.15,-0.55],0.03,DARK,0.03,true)
                    c(s*0.28,2.5,-0.05,0.17,0.45,4,...FUR,-75,s*-15,s*20,0.01)
                    c(s*0.28,2.48,-0.1,0.09,0.36,4,0.8,0.55,0.55,-75,s*-15,s*20,0.01)
                })

                //a bushy tail
                k.seg([0,0.55,0.75],[0,0.35,1.35],0.18,FUR,0.12)
                k.seg([0,0.35,1.35],[0,0.0,1.6],0.12,LIGHT,0.02)
            }
        },

        tunnelBear:{

            anim:{legTop:-0.85,minX:0.1,amount:0.35,speed:7,zPhase:0},

            build:function(b,c,e){

                let k=kit(b,c,e),FUR=[0.08,0.07,0.07],MUZZLE=[0.45,0.35,0.28],CLAW=[1.2,1.15,1.0]

                e(0,0.05,0.05,0.85,1.05,0.6,...FUR,2)
                e(0,-0.05,-0.38,0.55,0.75,0.22,0.14,0.12,0.11,1)

                k.both(s=>{

                    //stumpy legs and big paws
                    k.seg([s*0.4,-0.6,0],[s*0.45,-1.7,0],0.32,FUR,0.28)
                    e(s*0.45,-1.82,-0.15,0.3,0.14,0.42,...FUR,1)

                    for(let j=-1;j<=1;j++) k.seg([s*0.45+j*0.11,-1.85,-0.5],[s*0.45+j*0.12,-1.9,-0.62],0.035,CLAW,0.005)

                    //arms raised to swipe
                    k.seg([s*0.75,0.65,0],[s*1.2,0.2,-0.3],0.28,FUR,0.24)
                    k.seg([s*1.2,0.2,-0.3],[s*1.15,0.85,-0.75],0.24,FUR,0.22)
                    e(s*1.15,0.95,-0.85,0.26,0.24,0.2,...FUR,1)

                    for(let j=-1;j<=1;j++) k.seg([s*1.15+j*0.12,1.15,-0.95],[s*1.15+j*0.15,1.35,-1.1],0.04,CLAW,0.005)

                    //round ears
                    e(s*0.55,2.05,0,0.25,0.25,0.12,...FUR,1)
                    e(s*0.55,2.05,-0.08,0.13,0.13,0.06,0.3,0.22,0.2,1)

                    k.eye(s*0.25,1.6,-0.6,0.1,[1.5,1.2,0.3],[0.02,0.02,0.02])
                })

                //the head and snout
                e(0,1.45,-0.1,0.75,0.68,0.6,...FUR,2)
                e(0,1.2,-0.62,0.35,0.26,0.28,...MUZZLE,1)
                e(0,1.32,-0.88,0.14,0.1,0.08,0.03,0.03,0.03,1)
                b(0,1.05,-0.78,0.2,0.04,0.1,0.05,0.02,0.02)
            }
        }
    }

})()

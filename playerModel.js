//The player's character: a classic R6 Roblox avatar made of six jointed parts, plus the animations that move them.
//Everything here works in the player's body space: the physics body's center is the origin, the feet are at y=-0.5,
//the character faces +z, and its right hand is on the -x side. Gear meshes in playerGear.js were made for the old
//single-block character, so attachments says how each gear slot is moved and scaled onto the new body.
(function(){

    //1 stud of the Roblox avatar in world units. That makes the character a little over 1 unit tall and about as wide
    //as a flower, close to how the avatar compares to a field in the real game
    let S=0.21

    let LEG=2*S,TORSO=2*S,HIP_Y=-0.5+LEG,NECK_Y=HIP_Y+TORSO,ARM_X=1.5*S,LEG_X=0.5*S,SHOULDER_Y=NECK_Y-0.2*S

    //the classic default colors: bright yellow skin, bright blue torso and yellowish green legs
    let SKIN=[1.18,0.98,0.26],SHIRT=[0.1,0.5,0.95],PANTS=[0.74,0.88,0.36],FACE=[0.06,0.05,0.05]

    let parts={

        torso:{pivot:[0,HIP_Y,0]},
        head:{pivot:[0,NECK_Y,0]},
        rightArm:{pivot:[-ARM_X,SHOULDER_Y,0]},
        leftArm:{pivot:[ARM_X,SHOULDER_Y,0]},
        rightLeg:{pivot:[-LEG_X,HIP_Y,0]},
        leftLeg:{pivot:[LEG_X,HIP_Y,0]}
    }

    //a block with its edges slightly beveled, the way Roblox's body parts read in game
    function block(box,x,y,z,w,h,l,col){

        let b=0.012,dark=[col[0]*0.86,col[1]*0.86,col[2]*0.86]

        box(x,y,z,w-b*2,h,l-b*2,false,col)
        box(x,y,z,w,h-b*2,l-b*2,false,dark)
        box(x,y,z,w-b*2,h-b*2,l,false,dark)
    }

    //each part is built around its own pivot, so the animator can turn it at the joint
    let build={

        torso:function(box,cylinder){

            block(box,0,TORSO*0.5,0,2*S,TORSO,1*S,SHIRT)

            //a hint of the default shirt's collar
            box(0,TORSO-0.012,0.03,0.6*S,0.03,0.6*S,false,[SHIRT[0]*0.7,SHIRT[1]*0.7,SHIRT[2]*0.75])
        },

        head:function(box,cylinder){

            let r=0.6*S,h=1.2*S

            //the rounded "Head" mesh: a short cylinder with softened rims
            cylinder(0,h*0.5,0,r,h*0.72,18,...SKIN,90,0,0)
            cylinder(0,h*0.5+h*0.36+h*0.07,0,r,h*0.14,18,...SKIN,90,0,0,r*0.82)
            cylinder(0,h*0.5-h*0.36-h*0.07,0,r*0.82,h*0.14,18,...SKIN,90,0,0,r)

            //the neck peg that joins the head to the torso
            cylinder(0,0.01,0,r*0.5,0.04,10,...SKIN,90,0,0)

            //the classic smile: two tall oval eyes and a curved mouth on the front of the cylinder
            let front=x=>Math.sqrt(Math.max(r*r-x*x,0))+0.002

            for(let side=-1;side<=1;side+=2){

                let ex=side*0.17*S
                box(ex,h*0.58,front(ex),0.07*S,0.2*S,0.01,false,FACE)
                box(ex,h*0.58+0.08*S,front(ex),0.05*S,0.06*S,0.012,false,FACE)
                box(ex,h*0.58-0.08*S,front(ex),0.05*S,0.06*S,0.012,false,FACE)
            }

            for(let i=0;i<=8;i++){

                let t=i/8,a=(t-0.5)*2.2,mx=Math.sin(a)*0.26*S,my=h*0.36-Math.cos(a)*0.09*S+0.09*S

                box(mx,my,front(mx),0.075*S,0.045*S,0.01,[0,0,-a*57.3*0.9],FACE)
            }
        },

        arm:function(box,cylinder,side){

            block(box,0,-0.8*S,0,1*S,2*S,1*S,SKIN)
        },

        leg:function(box,cylinder,side){

            block(box,0,-LEG*0.5,0,1*S,LEG,1*S,PANTS)
        }
    }

    //how a gear slot designed for the old block character lands on the new one.
    //from is the point on the old character, to is where it goes in body space, scale stretches around that point,
    //and part (or sides, which splits the gear left/right by which side of the body each triangle is on) is what it moves with
    let attachments={

        mask:{part:'head',from:[0,0.5,0],to:[0,NECK_Y+1.2*S,0],scale:[0.62,0.62,0.62]},
        leftGuard:{part:'leftArm',from:[0.35,0.05,0.1],to:[ARM_X+0.02,SHOULDER_Y+0.02,0],scale:[0.85,0.85,0.85]},
        rightGuard:{part:'rightArm',from:[-0.35,0.05,0.1],to:[-ARM_X-0.02,SHOULDER_Y+0.02,0],scale:[0.85,0.85,0.85]},
        boots:{sides:['leftLeg','rightLeg'],from:[0.2,-0.5,0],to:[LEG_X,-0.5,0.02],scale:[0.78,0.78,0.78]},
        belt:{part:'torso',from:[0,-0.2,0],to:[0,HIP_Y+0.02,0],scale:[0.95,0.75,0.62]},
        backpack:{part:'torso',from:[0,0,-0.25],to:[0,HIP_Y+TORSO*0.55,-0.5*S],scale:[0.8,0.8,0.8]},
        glider:{part:'torso',from:[0,0,0],to:[0,HIP_Y+TORSO*0.5,0],scale:[1,1,1]},
        parachute:{part:'torso',from:[0,0,0],to:[0,HIP_Y+TORSO*0.5,0],scale:[1,1,1]},
        amulet:{part:'torso',from:[0,0,0],to:[0,0.05,0],scale:[1,1,1]}
    }

    //the face and hair blocks every old mask drew on the block character. The new head has its own face
    function isOldFaceBox(x,y,z,w,h,l){

        let near=(a,b)=>Math.abs(a-b)<0.0001

        return near(Math.abs(x),0.1)&&near(y,0.3)&&near(z,0.225)&&near(w,0.05)&&near(h,0.1)&&near(l,0.1)||
               near(x,0)&&near(y,0.15)&&near(z,0.225)&&near(w,0.2)&&near(h,0.05)&&near(l,0.1)||
               near(x,0)&&near(y,0.5)&&near(z,0)&&near(w,0.55)&&near(h,0.1)&&near(l,0.55)
    }

    //joint angles for this frame. Angles are radians about each joint's x axis (forward/back) and z axis (out to the side)
    function createAnimator(){

        let cur={rightArm:[0,0],leftArm:[0,0],rightLeg:[0,0],leftLeg:[0,0],head:[0,0],torso:[0,0]},phase=0,idle=0

        return function animate(st,dt){

            let speed=Math.min(st.speed,30),walking=st.grounded&&speed>0.6,t={rightArm:[0,0],leftArm:[0,0],rightLeg:[0,0],leftLeg:[0,0],head:[0,0],torso:[0,0]}

            idle+=dt

            if(st.gliding){

                //arms spread wide holding the glider, legs trailing
                t.rightArm=[-0.25,-1.45]
                t.leftArm=[-0.25,1.45]
                t.rightLeg=[0.35,-0.08]
                t.leftLeg=[0.35,0.08]

            } else if(!st.grounded&&st.vy>0.5){

                //jumping: arms thrown straight up
                t.rightArm=[-2.9,-0.08]
                t.leftArm=[-2.9,0.08]
                t.rightLeg=[-0.15,0]
                t.leftLeg=[0.25,0]

            } else if(!st.grounded&&st.vy<-2){

                //falling: arms up and out
                t.rightArm=[-2.3,-0.35]
                t.leftArm=[-2.3,0.35]
                t.rightLeg=[0.3,0]
                t.leftLeg=[-0.3,0]

            } else if(walking){

                phase+=dt*Math.min(5+speed*0.55,13)

                let a=Math.min(speed/5,1)*0.95,s=Math.sin(phase)

                t.rightArm=[s*a,0]
                t.leftArm=[-s*a,0]
                t.rightLeg=[-s*a,0]
                t.leftLeg=[s*a,0]

            } else {

                //idle: a slow breathing sway
                let s=Math.sin(idle*1.6)

                t.rightArm=[s*0.05,-0.03-s*0.02]
                t.leftArm=[-s*0.05,0.03+s*0.02]
                t.head=[Math.sin(idle*0.7)*0.04,0]
            }

            //holding the tool overrides the right arm: raised forward, then the swing sweeps it down and back up
            if(st.holdingTool&&!st.gliding){

                t.rightArm=[-Math.PI*0.5-0.15+st.swing+(walking?Math.sin(phase)*0.08:0),-0.04]
            }

            let k=Math.min(dt*14,1)

            for(let j in cur){

                //the tool swing has to follow exactly or it lags behind the pollen collection
                let kk=j==='rightArm'&&st.holdingTool?Math.max(k,0.6):k

                cur[j][0]+=(t[j][0]-cur[j][0])*kk
                cur[j][1]+=(t[j][1]-cur[j][1])*kk
            }

            return cur
        }
    }

    //where the tool's own mesh space sits in the right hand. Tools were modelled sticking out along +z from about
    //(-0.3,0,0.35), so that point goes into the fist and +z follows the arm
    let toolGrip={hand:[0,-1.65*S,0],handleStart:[-0.3,0,0.35]}

    window.playerModel={S,parts,build,attachments,isOldFaceBox,createAnimator,toolGrip,colors:{SKIN,SHIRT,PANTS}}

})()

//Detailed models for the tools. Each one replaces the mesh of the tool with the same name in index.js (stats and abilities stay there).
//Tool space: the fist grips the point (-0.3,0,0.35). Tools held out in front (shovel, rake...) run along +z from there,
//tools held up like staffs run along +y from just below it. See playerModel.js for how that point is put in the hand.
(function(){

    const TAU=Math.PI*2,DEG=180/Math.PI

    const WOOD=[0.66,0.38,0.15],WOOD_D=[0.46,0.25,0.09],METAL=[0.78,0.8,0.86],METAL_D=[0.45,0.46,0.52],GOLD=[1.4,1.08,0.3],GOLD_D=[1.05,0.72,0.15],RUBBER=[0.13,0.13,0.15],WHITE=[1.35,1.35,1.35]

    //shorthands over the dynamic mesh primitives. Cylinders: v is upright (r at the bottom, r2 at the top), z runs along z (r at +z, r2 at -z)
    function kit(box,cylinder,sphere,star){

        let k={box,cylinder,sphere,star}

        k.b=(x,y,z,w,h,l,c,rot)=>box(x,y,z,w,h,l,rot||false,c)
        k.v=(x,y,z,r,h,c,s=12,r2=r)=>cylinder(x,y,z,r,h,s,c[0],c[1],c[2],90,0,0,r2)
        k.z=(x,y,z,r,h,c,s=12,r2=r)=>cylinder(x,y,z,r,h,s,c[0],c[1],c[2],0.0001,0,0,r2)
        k.x=(x,y,z,r,h,c,s=12,r2=r)=>cylinder(x,y,z,r,h,s,c[0],c[1],c[2],0.0001,90,0,r2)

        //a cylinder pointing along an arbitrary direction (pitch about x, then yaw about y, then roll about z, in degrees)
        k.cyl=(x,y,z,r,h,c,rx,ry,rz,s=10,r2=r)=>cylinder(x,y,z,r,h,s,c[0],c[1],c[2],rx||0.0001,ry,rz,r2)
        k.s=(x,y,z,r,c,d=1)=>sphere(x,y,z,r,d,c[0],c[1],c[2])

        //a ring of n square segments. plane is the plane it lies in: xy faces z, yz faces x, xz lies flat.
        //a0 and a1 limit it to an arc (radians, measured from the plane's first axis toward its second)
        k.ring=(cx,cy,cz,R,t,c,plane='xy',n=16,a0=0,a1=TAU)=>{

            let seg=(a1-a0)/n,len=R*seg*1.08

            for(let i=0;i<n;i++){

                let a=a0+(i+0.5)*seg,cs=Math.cos(a),sn=Math.sin(a)

                if(plane==='xy') box(cx+cs*R,cy+sn*R,cz,t,len,t,[0,0,a*DEG],c)
                else if(plane==='yz') box(cx,cy+cs*R,cz+sn*R,t,t,len,[a*DEG,0,0],c)
                else box(cx+cs*R,cy,cz+sn*R,t,t,len,[0,-a*DEG,0],c)
            }
        }

        //a wrapped grip: a darker sleeve with raised bands
        k.gripV=(x,y,z,r,h,c,bands=4)=>{

            k.v(x,y,z,r,h,c,12)

            for(let i=0;i<bands;i++) k.v(x,y-h*0.5+h*(i+0.5)/bands,z,r*1.12,h*0.08,[c[0]*0.7,c[1]*0.7,c[2]*0.7],12)
        }

        k.gripZ=(x,y,z,r,h,c,bands=4)=>{

            k.z(x,y,z,r,h,c,12)

            for(let i=0;i<bands;i++) k.z(x,y,z-h*0.5+h*(i+0.5)/bands,r*1.12,h*0.08,[c[0]*0.7,c[1]*0.7,c[2]*0.7],12)
        }

        //a curved blade swept along a spine. spine(t) gives [y,z] for t from 0 to 1 at x, width(t) how far the blade hangs below it.
        //each segment is turned to follow the curve so the pieces join into one edge
        k.blade=(x,spine,width,thick,col,edge,n=12)=>{

            for(let i=0;i<n;i++){

                let t0=i/n,t1=(i+1)/n,p0=spine(t0),p1=spine(t1),dy=p1[0]-p0[0],dz=p1[1]-p0[1],len=Math.hypot(dy,dz),
                    ny=dz/len,nz=-dy/len,w=width((t0+t1)*0.5),cy=(p0[0]+p1[0])*0.5,cz=(p0[1]+p1[1])*0.5,rot=[Math.atan2(-dy,dz)*DEG,0,0]

                //the blade hangs on the side the normal points away from
                box(x,cy-ny*w*0.5,cz-nz*w*0.5,thick,w,len*1.04,rot,col)
                if(edge) box(x,cy-ny*w,cz-nz*w,thick*0.6,0.03,len*1.04,rot,edge)
            }
        }

        return k
    }

    window.toolModels={

        shovel:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star)

            //D-handle
            k.ring(-0.3,0,0.2,0.085,0.028,WOOD_D,'xz',12)
            k.z(-0.3,0,0.3,0.035,0.05,WOOD_D)

            k.z(-0.3,0,0.64,0.038,0.66,WOOD,10)
            k.z(-0.3,0,0.99,0.05,0.09,METAL_D,10,0.042)

            //a cupped spade blade with a step on top and a rounded tip
            k.b(-0.3,0,1.2,0.3,0.025,0.34,METAL)
            k.v(-0.3,-0.0005,1.37,0.15,0.024,METAL,16)
            k.b(-0.3-0.15,0.025,1.2,0.025,0.05,0.36,METAL_D)
            k.b(-0.3+0.15,0.025,1.2,0.025,0.05,0.36,METAL_D)
            k.b(-0.3,0.022,1.05,0.32,0.045,0.04,METAL_D)
            k.b(-0.3,0.016,1.15,0.04,0.02,0.18,METAL_D)
        },

        rake:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star)

            k.s(-0.3,0,0.22,0.05,[0.2,0.85,0.3])
            k.gripZ(-0.3,0,0.33,0.045,0.2,[0.25,0.95,0.35],3)
            k.z(-0.3,0,0.68,0.034,0.5,[0.92,0.92,0.92],10)
            k.z(-0.3,0,0.95,0.045,0.06,METAL_D,10)

            //a fan of springy tines held by a curved brace
            for(let i=0;i<7;i++){

                let a=(i/6-0.5)*80,r=a/DEG,len=0.5,bx=-0.3+Math.sin(r)*len*0.5,bz=0.98+Math.cos(r)*len*0.5

                k.b(bx,0,bz,0.022,0.022,len,[0,a,0],METAL)
                k.b(-0.3+Math.sin(r)*len,-0.04,0.98+Math.cos(r)*len,0.022,0.09,0.03,[0,a,0],METAL_D)
            }

            k.ring(-0.3,0,0.98,0.27,0.025,METAL_D,'xz',8,Math.PI*0.5-0.72,Math.PI*0.5+0.72)
        },

        clippers:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),y=0.12,YEL=[1.4,1.25,0.1]

            //two handles opening downward from the pivot, with rubber grips
            for(let s=-1;s<=1;s+=2){

                let a=s*16
                k.cyl(-0.3+Math.sin(a/DEG)*0.17,y-0.17,0.4,0.035,0.34,YEL,90,0,a)
                k.cyl(-0.3+Math.sin(a/DEG)*0.29,y-0.29,0.4,0.045,0.12,RUBBER,90,0,a)

                //blades crossing above it
                k.b(-0.3-s*0.03,y+0.2,0.4+s*0.012,0.06,0.38,0.018,METAL,[0,0,s*7])
                k.b(-0.3-s*0.055,y+0.2,0.4+s*0.012,0.012,0.36,0.02,METAL_D,[0,0,s*7])
            }

            k.z(-0.3,y,0.4,0.04,0.07,METAL_D,10)
            k.s(-0.3,y,0.44,0.025,GOLD)

            //the spring
            for(let i=0;i<4;i++) k.b(-0.3+(i%2?0.02:-0.02),y-0.07-i*0.025,0.4,0.05,0.012,0.012,[0,0,i%2?25:-25],METAL)
        },

        magnet:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),RED=[1.45,0.12,0.1]

            k.gripV(-0.3,-0.12,0.45,0.06,0.32,[0.8,0.8,0.84],3)
            k.v(-0.3,0.1,0.45,0.08,0.06,METAL_D,12)

            //a chunky horseshoe with silver poles
            k.ring(-0.3,0.42,0.45,0.25,0.17,RED,'xy',12,Math.PI,TAU)
            k.b(-0.3-0.25,0.52,0.45,0.17,0.2,0.17,RED)
            k.b(-0.3+0.25,0.52,0.45,0.17,0.2,0.17,RED)
            k.b(-0.3-0.25,0.7,0.45,0.172,0.16,0.172,WHITE)
            k.b(-0.3+0.25,0.7,0.45,0.172,0.16,0.172,WHITE)
            k.b(-0.3-0.25,0.79,0.45,0.15,0.02,0.15,METAL_D)
            k.b(-0.3+0.25,0.79,0.45,0.15,0.02,0.15,METAL_D)
            k.b(-0.3,0.2,0.45+0.088,0.12,0.06,0.01,[1.4,1.4,1.4])
        },

        vacuum:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),BODY=[1.1,0.72,0.4],DARK=[0.2,0.2,0.22]

            //handle and wand
            k.ring(-0.3,0.43,0.5,0.07,0.03,DARK,'yz',10)
            k.cyl(-0.3,0.16,0.56,0.03,0.5,[0.85,0.85,0.88],90,0,0)

            //the motor body: a rounded canister with a dust window and air vents
            k.v(-0.3,-0.1,0.6,0.16,0.42,BODY,16)
            k.v(-0.3,0.13,0.6,0.16,0.05,BODY,16,0.12)
            k.v(-0.3,-0.33,0.6,0.12,0.05,BODY,16,0.16)
            k.b(-0.3,-0.08,0.6+0.15,0.14,0.24,0.03,[0.55,0.75,0.95])
            for(let i=0;i<3;i++) k.b(-0.3,0.02-i*0.05,0.6-0.16,0.16,0.015,0.02,DARK)
            k.v(-0.3,0.06,0.6,0.165,0.03,[1.4,1.25,0],16)

            //nozzle on its swivel
            k.cyl(-0.3,-0.38,0.75,0.035,0.25,DARK,-35,0,0)
            k.b(-0.3,-0.45,0.86,0.42,0.09,0.2,DARK)
            k.b(-0.3,-0.41,0.86,0.4,0.02,0.18,BODY)
            k.b(-0.3-0.1,-0.45,0.965,0.08,0.06,0.02,[1.4,1.25,0])
            k.b(-0.3+0.1,-0.45,0.965,0.08,0.06,0.02,[1.4,1.25,0])
            k.x(-0.3-0.22,-0.47,0.82,0.04,0.03,RUBBER,10)
            k.x(-0.3+0.22,-0.47,0.82,0.04,0.03,RUBBER,10)
        },

        superScooper:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),YEL=[1.5,1.35,0.1],BLU=[0.15,0.35,1.5]

            k.s(-0.3,0,0.24,0.06,YEL)

            //a striped handle, alternating like the original
            for(let i=0;i<5;i++) k.z(-0.3,0,0.32+i*0.16,0.06-i*0.004,0.16,i%2?BLU:YEL,12)

            k.z(-0.3,0,1.15,0.07,0.06,METAL_D,12)

            //a deep two-tone scoop with a rolled lip
            k.b(-0.3+0.11,-0.02,1.47,0.22,0.03,0.58,YEL)
            k.b(-0.3-0.11,-0.02,1.47,0.22,0.03,0.58,BLU)
            k.b(-0.3+0.23,0.04,1.47,0.03,0.14,0.58,YEL)
            k.b(-0.3-0.23,0.04,1.47,0.03,0.14,0.58,BLU)
            k.b(-0.3,0.04,1.19,0.46,0.14,0.03,METAL_D)
            k.z(-0.3+0.235,0.11,1.47,0.025,0.58,[1.6,1.5,0.4],8)
            k.z(-0.3-0.235,0.11,1.47,0.025,0.58,[0.4,0.6,1.6],8)
            k.v(-0.3,-0.02,1.76,0.23,0.03,METAL,16)
        },

        pulsar:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),YEL=[1.45,1.3,0.15],top=0.2+0.55+0.25

            k.gripV(-0.3,-0.2,0.4,0.075,0.3,[0.15,1.3,0.2],3)
            k.v(-0.3,0.25,0.4,0.05,1.0,YEL,10)
            k.v(-0.3,0.72,0.4,0.08,0.06,GOLD_D,10)

            //a glowing core inside three tilted orbit rings
            k.s(-0.3,top,0.4,0.14,[1.6,1.6,1.1],2)
            k.s(-0.3,top,0.4,0.09,[1.9,1.9,1.9],1)
            k.ring(-0.3,top,0.4,0.27,0.03,[0.12,0.12,0.16],'xy',18)
            k.ring(-0.3,top,0.4,0.27,0.03,[0.12,0.12,0.16],'yz',18)
            k.ring(-0.3,top,0.4,0.27,0.03,[0.12,0.12,0.16],'xz',18)
            k.v(-0.3,0.82,0.4,0.03,0.12,GOLD_D,8)
        },

        electroMagnet:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),YEL=[1.45,1.4,0.1]

            k.gripV(-0.3,-0.15,0.5,0.065,0.42,[0.8,0.8,0.84],4)
            k.v(-0.3,0.12,0.5,0.09,0.08,METAL_D,12)

            //two horseshoes crossed at right angles, with crackling white tips
            k.ring(-0.3,0.5,0.5,0.24,0.15,YEL,'xy',12,Math.PI,TAU)
            k.ring(-0.3,0.5,0.5,0.24,0.15,YEL,'yz',12,Math.PI,TAU)

            for(let i=0;i<4;i++){

                let dx=[-0.24,0.24,0,0][i],dz=[0,0,-0.24,0.24][i]

                k.b(-0.3+dx,0.6,0.5+dz,0.15,0.2,0.15,YEL)
                k.b(-0.3+dx,0.78,0.5+dz,0.152,0.16,0.152,WHITE)
                k.s(-0.3+dx,0.88,0.5+dz,0.05,[1.6,1.6,1.9])
            }

            k.s(-0.3,0.3,0.5,0.08,GOLD)
        },

        scissors:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),y=0.14

            //finger loops in red and blue
            k.ring(-0.3-0.1,y-0.24,0.4,0.085,0.035,[1.3,0.1,0.1],'xy',14)
            k.ring(-0.3+0.1,y-0.24,0.4,0.085,0.035,[0.1,0.25,1.4],'xy',14)
            k.b(-0.3-0.05,y-0.1,0.4,0.035,0.16,0.03,[1.3,0.1,0.1],[0,0,-20])
            k.b(-0.3+0.05,y-0.1,0.4,0.035,0.16,0.03,[0.1,0.25,1.4],[0,0,20])

            //long tapered blades crossing at the screw
            for(let s=-1;s<=1;s+=2){

                k.b(-0.3+s*0.02,y+0.22,0.4+s*0.012,0.055,0.44,0.016,METAL,[0,0,s*4])
                k.b(-0.3+s*0.04,y+0.47,0.4+s*0.012,0.03,0.08,0.016,METAL,[0,0,s*4-s*12])
            }

            k.z(-0.3,y,0.4,0.03,0.06,GOLD,10)
        },

        honeyDipper:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),HONEY=[1.45,1.0,0.25],LIGHT=[1.2,0.85,0.5],top=0.25+0.6+0.5

            k.gripV(-0.3,-0.1,0.4,0.085,0.42,[0.7,0.5,0.2],4)
            k.v(-0.3,0.48,0.4,0.055,0.78,LIGHT,10)
            k.v(-0.3,0.9,0.4,0.07,0.06,[0.6,0.4,0.15],10)

            //the grooved dipper head, dripping
            k.v(-0.3,top,0.4,0.18,0.5,[1.1,0.75,0.35],16,0.18)
            for(let i=0;i<6;i++) k.v(-0.3,top-0.22+i*0.088,0.4,i%2?0.21:0.24,0.04,HONEY,16)
            k.v(-0.3,top+0.28,0.4,0.18,0.06,[1.1,0.75,0.35],16,0.11)
            k.s(-0.3,top+0.33,0.4,0.11,[1.1,0.75,0.35])
            k.s(-0.3+0.12,top-0.3,0.4+0.05,0.06,HONEY)
            k.s(-0.3+0.12,top-0.38,0.4+0.05,0.04,HONEY)
        },

        bubbleWand:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),BLUE=[0.1,0.45,1.45],top=0.45+0.6+0.5

            k.gripV(-0.3,-0.1,0.4,0.085,0.42,[1.3,1.25,0.1],4)
            k.v(-0.3,0.55,0.4,0.055,0.95,BLUE,10)
            k.v(-0.3,1.04,0.4,0.075,0.08,[1.3,1.25,0.1],10)

            //a thick ring holding a shimmering soap film, with a few bubbles stuck to it
            k.ring(-0.3,top,0.4,0.42,0.075,BLUE,'xy',22)
            k.ring(-0.3,top,0.4,0.42,0.04,[0.5,0.95,1.5],'xy',22)
            k.z(-0.3,top,0.4,0.4,0.01,[0.55,1.0,1.35],22)
            k.s(-0.3+0.36,top+0.36,0.42,0.09,[0.8,1.2,1.6])
            k.s(-0.3-0.42,top-0.24,0.38,0.06,[0.8,1.2,1.6])
            k.s(-0.3+0.05,top+0.5,0.4,0.05,[0.8,1.2,1.6])
        },

        scythe:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),YEL=[1.4,1.35,0.1],RED=[1.35,0.08,0.08]

            k.gripV(-0.3,-0.1,0.4,0.085,0.42,RED,4)
            k.v(-0.3,0.55,0.4,0.055,1.3,YEL,10)
            k.v(-0.3,1.2,0.4,0.075,0.12,METAL_D,10)

            //a sweeping curved blade: a red spine, a steel body and a bright edge
            let spine=t=>[1.26-0.62*t*t,0.42+1.3*t]

            k.blade(-0.3,spine,t=>0.3*(1-t*0.8)+0.03,0.05,WHITE,[1.6,1.6,1.7])
            k.blade(-0.3,t=>{let p=spine(t);return [p[0]+0.04,p[1]]},t=>0.07,0.075,RED,null,10)
        },

        goldenRake:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star)

            k.s(-0.3,0,0.22,0.055,GOLD)
            k.gripZ(-0.3,0,0.33,0.045,0.2,[0.9,0.25,0.1],3)
            k.z(-0.3,0,0.68,0.036,0.5,GOLD,10)
            k.z(-0.3,0,0.95,0.055,0.07,GOLD_D,10)
            star(-0.3,0.06,0.95,0.03,0.07,0.015,0.03,0.4,1.4,1.6)

            for(let i=0;i<7;i++){

                let a=(i/6-0.5)*80,r=a/DEG,len=0.5

                k.b(-0.3+Math.sin(r)*len*0.5,0,0.98+Math.cos(r)*len*0.5,0.026,0.026,len,GOLD,[0,a,0])
                k.b(-0.3+Math.sin(r)*len,-0.04,0.98+Math.cos(r)*len,0.026,0.1,0.034,GOLD_D,[0,a,0])
            }

            k.ring(-0.3,0,0.98,0.27,0.03,GOLD_D,'xz',8,Math.PI*0.5-0.72,Math.PI*0.5+0.72)
        },

        sparkStaff:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),PURPLE=[1.1,0.1,1.2],top=0.25+0.625

            k.gripV(-0.3,-0.12,0.4,0.07,0.32,[0.5,0.05,0.55],3)
            k.v(-0.3,0.35,0.4,0.045,1.05,PURPLE,10)
            k.v(-0.3,0.8,0.4,0.07,0.06,GOLD,10)

            //four golden prongs cradling a charged crystal
            for(let i=0;i<4;i++){

                let a=i*TAU/4+Math.PI/4,dx=Math.cos(a),dz=Math.sin(a)

                k.b(-0.3+dx*0.1,top,0.4+dz*0.1,0.04,0.2,0.04,GOLD,[dz*-25,0,dx*25])
                k.s(-0.3+dx*0.14,top+0.11,0.4+dz*0.14,0.035,GOLD)
            }

            k.b(-0.3,top+0.15,0.4,0.13,0.13,0.13,[1.6,1.5,0.5],[45,0,45])
            k.s(-0.3,top+0.15,0.4,0.06,[1.9,1.9,1.6])
            star(-0.3,top+0.36,0.4,0.03,0.07,0.012,0.02,1.6,1.5,0.3)
        },

        porcelainDipper:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),POR=[1.45,1.45,1.5],BLUE=[0.15,0.3,1.4],top=0.45+0.6+0.5

            k.gripV(-0.3,-0.1,0.4,0.085,0.42,[1.3,1.2,0.1],4)
            k.v(-0.3,0.55,0.4,0.055,0.95,POR,10)
            k.v(-0.3,1.05,0.4,0.07,0.06,BLUE,10)

            //a fine porcelain dipper with blue banding
            k.v(-0.3,top,0.4,0.18,0.5,POR,16,0.18)
            for(let i=0;i<6;i++) k.v(-0.3,top-0.22+i*0.088,0.4,i%2?0.21:0.235,0.04,i%3===1?BLUE:POR,16)
            k.v(-0.3,top+0.28,0.4,0.18,0.06,POR,16,0.11)
            k.s(-0.3,top+0.33,0.4,0.11,POR)

            //the wings: a blue pair and a red pair
            k.b(-0.5,1.0,0.4,0.175,0.5,0.06,BLUE,[0,0,70])
            k.b(-0.5,0.83,0.4,0.175,0.4,0.06,BLUE,[0,0,-70])
            k.b(-0.1,1.0,0.4,0.175,0.5,0.06,[1.4,0.1,0.1],[0,0,-70])
            k.b(-0.1,0.83,0.4,0.175,0.4,0.06,[1.4,0.1,0.1],[0,0,70])
        },

        petalWand:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),x=-0.4,z=0.4,top=1.35,STEM=[0.1,0.8,0.15]

            k.gripV(x,-0.1,z,0.075,0.32,[0.05,0.5,0.1],3)
            k.v(x,0.6,z,0.05,1.2,STEM,10)

            //two leaves on the stem
            k.b(x+0.12,0.55,z,0.22,0.04,0.12,[0.2,1.0,0.25],[0,0,25])
            k.b(x-0.12,0.75,z,0.22,0.04,0.12,[0.2,1.0,0.25],[0,0,-25])

            //a daisy: two rings of round petals around a domed center
            for(let i=0;i<8;i++){

                let a=i*TAU/8,cs=Math.cos(a),sn=Math.sin(a)

                k.cyl(x+cs*0.3,top+0.02,z+sn*0.3,0.17,0.04,[1.4,1.4,1.4],90-12*sn,0,12*cs,14)
            }

            for(let i=0;i<8;i++){

                let a=(i+0.5)*TAU/8,cs=Math.cos(a),sn=Math.sin(a)

                k.cyl(x+cs*0.22,top+0.06,z+sn*0.22,0.13,0.04,[1.5,1.45,1.3],90-20*sn,0,20*cs,14)
            }

            k.s(x,top+0.1,z,0.16,[1.5,1.2,0.05],2)
        },

        darkScythe:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),BLACK=[0.12,0.02,0.03],RED=[1.3,0.02,0.4]

            k.gripV(-0.3,-0.1,0.4,0.085,0.42,[0.5,0.02,0.1],4)
            k.v(-0.3,0.75,0.4,0.06,1.8,BLACK,10)
            k.v(-0.3,1.62,0.4,0.085,0.12,RED,10)
            k.s(-0.3,1.72,0.4,0.08,RED)

            //a huge hooked blade with a glowing edge and a spike on the back
            let spine=t=>[1.72-0.95*t*t,0.42+1.85*t]

            k.blade(-0.3,spine,t=>0.46*(1-t*0.85)+0.04,0.06,BLACK,RED,14)
            k.blade(-0.3,t=>{let p=spine(t);return [p[0]+0.05,p[1]]},t=>0.09,0.08,[0.3,0.02,0.08],null,12)

            k.b(-0.3,1.85,0.25,0.07,0.1,0.5,BLACK,[20,0,0])
            k.b(-0.3,1.85,0.02,0.05,0.07,0.12,RED,[20,0,0])
            k.b(-0.3,1.3,0.3,0.07,0.08,0.4,BLACK,[-20,0,0])
        },

        tidePopper:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),x=-0.4,z=0.4,SEA=[0.1,0.8,1.8],DEEP=[0.05,0.3,1.2],FOAM=[1.5,1.6,1.7]

            k.gripV(x,-0.1,z,0.08,0.38,[0.95,0.85,0.55],4)
            k.v(x,0.6,z,0.06,1.0,SEA,10)

            //a curling wave: stacked swirls rising into a crest, ringed with foam
            k.v(x,1.15,z,0.42,0.12,DEEP,18,0.36)
            k.v(x,1.32,z,0.36,0.22,SEA,18,0.26)
            k.v(x,1.55,z,0.26,0.24,[0.3,1.0,1.8],18,0.14)
            k.v(x,1.75,z,0.14,0.18,FOAM,14,0.02)

            for(let i=0;i<8;i++){

                let a=i*TAU/8

                k.s(x+Math.cos(a)*0.42,1.2,z+Math.sin(a)*0.42,0.07+(i%2)*0.03,FOAM)
            }

            k.s(x-0.8,0.85,z,0.22,FOAM)
            k.s(x+0.8,0.85,z,0.22,FOAM)
            k.s(x,0.85,z-0.8,0.22,FOAM)
            k.s(x,0.85,z+0.8,0.22,FOAM)
        },

        gummyBaller:function(box,cylinder,sphere,star){

            let k=kit(box,cylinder,sphere,star),x=-0.4,z=0.4,GREEN=[0.26,2.4,1.0],PINK=[1.5,0.15,1.5]

            k.v(x,-0.1,z,0.15,0.35,GREEN,15,0.13)
            k.v(x,-0.27,z,0.1,0.05,GREEN,12,0.15)
            k.v(x,0.8,z,0.09,1.75,PINK,12,0.08)

            //a goo-dripping gumball cup
            for(let i=0;i<5;i++) k.v(x,0.2+i*0.32,z,0.11,0.04,[1.7,0.6,1.7],12)

            k.s(x,1.6,z,0.5,GREEN,2)
            k.v(x,1.75,z,0.45,0.25,PINK,16,0.6)
            k.s(x-0.3,1.85,z,0.25,GREEN)
            k.s(x+0.3,1.85,z,0.25,GREEN)
            k.s(x,1.85,z-0.3,0.25,[2.6,1.1,2.6])
            k.s(x,1.85,z+0.3,0.25,[2.6,1.1,2.6])
            k.s(x+0.25,1.25,z+0.3,0.1,GREEN)
            k.s(x-0.2,1.18,z-0.28,0.08,GREEN)
        }
    }

})()

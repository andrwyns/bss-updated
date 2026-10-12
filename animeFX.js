//Anime-style ability effects: layered flashes, shockwaves, ground cracks, speed lines, sparks, debris, smoke, beams and
//magic circles, like the skill effects in Roblox anime games. Everything is drawn from one procedurally painted texture
//atlas as instanced quads. A quad can face the camera (billboard), lie in a plane (ground decals, vertical shock rings),
//or stretch along a direction (speed lines and flying sparks), which is what gives the effects their depth.
//index.js creates it once with the WebGL context, calls update() and render() every frame, and fires effects with the
//helpers at the bottom (ability(), slash()...).
(function(){

    const TAU=Math.PI*2,CELLS=4,CELL=256

    //atlas cells
    const GLOW=0,FLARE=1,RING=2,THICK_RING=3,BURST=4,CRACK=5,SLASH=6,STREAK=7,SMOKE=8,SPARK=9,BOLT=10,SHARD=11,SWIRL=12,RUNE=13,FLAME=14,HALO=15

    //a small seeded random so the atlas comes out the same every time
    let seed=7
    const rand=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646}

    //paints the 16 white-on-black effect shapes into a 1024x1024 canvas
    function paintAtlas(){

        let cv=document.createElement('canvas')

        cv.width=cv.height=CELLS*CELL

        let c=cv.getContext('2d')

        c.fillStyle='#000'
        c.fillRect(0,0,cv.width,cv.height)

        let cell=(i,f)=>{

            c.save()
            c.translate((i%CELLS)*CELL+CELL/2,((i/CELLS)|0)*CELL+CELL/2)
            c.beginPath()
            c.rect(-CELL/2,-CELL/2,CELL,CELL)
            c.clip()
            f()
            c.restore()
        }

        let radial=(r,stops)=>{

            let g=c.createRadialGradient(0,0,0,0,0,r)

            for(let s of stops) g.addColorStop(s[0],'rgba(255,255,255,'+s[1]+')')

            c.fillStyle=g
            c.fillRect(-CELL/2,-CELL/2,CELL,CELL)
        }

        //a spike: a long thin soft diamond along angle a
        let spike=(a,len,w,alpha=1)=>{

            c.save()
            c.rotate(a)

            let g=c.createLinearGradient(0,0,len,0)

            g.addColorStop(0,'rgba(255,255,255,'+alpha+')')
            g.addColorStop(1,'rgba(255,255,255,0)')

            c.fillStyle=g
            c.beginPath()
            c.moveTo(0,-w)
            c.lineTo(len,0)
            c.lineTo(0,w)
            c.closePath()
            c.fill()
            c.restore()
        }

        c.globalCompositeOperation='lighter'

        cell(GLOW,()=>radial(124,[[0,1],[0.2,0.75],[0.5,0.25],[1,0]]))

        cell(FLARE,()=>{

            radial(60,[[0,1],[0.3,0.6],[1,0]])

            for(let i=0;i<4;i++) spike(i*TAU/4,126,9)
            for(let i=0;i<4;i++) spike(i*TAU/4+TAU/8,60,5,0.6)
        })

        cell(RING,()=>{

            c.shadowColor='#fff'
            c.shadowBlur=14
            c.strokeStyle='#fff'
            c.lineWidth=7
            c.beginPath()
            c.arc(0,0,108,0,TAU)
            c.stroke()
        })

        cell(THICK_RING,()=>radial(124,[[0,0],[0.5,0],[0.78,0.5],[0.9,1],[0.96,0.6],[1,0]]))

        cell(BURST,()=>{

            radial(70,[[0,1],[0.5,0.5],[1,0]])

            //jagged impact spikes of uneven length
            for(let i=0;i<26;i++){

                let a=i/26*TAU+rand()*0.15,len=60+rand()*66,w=6+rand()*10

                c.fillStyle='#fff'
                c.save()
                c.rotate(a)
                c.beginPath()
                c.moveTo(18,-w)
                c.lineTo(len,0)
                c.lineTo(18,w)
                c.closePath()
                c.fill()
                c.restore()
            }
        })

        cell(CRACK,()=>{

            c.shadowColor='#fff'
            c.shadowBlur=8
            c.strokeStyle='#fff'
            c.lineCap='round'

            //branching fractures spreading out from the impact
            let branch=(x,y,a,len,w,depth)=>{

                if(depth>4||len<6) return

                let segs=3+((rand()*3)|0)

                c.lineWidth=w
                c.beginPath()
                c.moveTo(x,y)

                for(let i=0;i<segs;i++){

                    a+=(rand()-0.5)*0.7
                    x+=Math.cos(a)*len/segs
                    y+=Math.sin(a)*len/segs
                    c.lineTo(x,y)

                    if(rand()<0.45) branch(x,y,a+(rand()<0.5?-1:1)*(0.5+rand()*0.6),len*0.5,w*0.6,depth+1)
                }

                c.stroke()
            }

            for(let i=0;i<9;i++) branch(0,0,i/9*TAU+rand()*0.3,100+rand()*20,7,0)

            radial(40,[[0,1],[1,0]])
        })

        cell(SLASH,()=>{

            //a crescent: the outer arc minus an inner arc pushed off center, brightest along its spine
            c.fillStyle='#fff'
            c.shadowColor='#fff'
            c.shadowBlur=10
            c.beginPath()
            c.arc(0,0,112,-1.25,1.25)
            c.arc(-30,0,96,1.15,-1.15,true)
            c.closePath()
            c.fill()
        })

        cell(STREAK,()=>{

            //a vertical speed line: a bright head at the top fading into a long tail
            let g=c.createLinearGradient(0,-124,0,124)

            g.addColorStop(0,'rgba(255,255,255,0)')
            g.addColorStop(0.08,'rgba(255,255,255,1)')
            g.addColorStop(0.35,'rgba(255,255,255,0.7)')
            g.addColorStop(1,'rgba(255,255,255,0)')

            c.fillStyle=g
            c.beginPath()
            c.ellipse(0,0,14,124,0,0,TAU)
            c.fill()

            c.fillStyle='rgba(255,255,255,0.8)'
            c.beginPath()
            c.ellipse(0,-50,5,70,0,0,TAU)
            c.fill()
        })

        cell(SMOKE,()=>{

            //a lumpy puff made of overlapping soft blobs
            for(let i=0;i<14;i++){

                let a=rand()*TAU,d=rand()*55,r=35+rand()*45,g=c.createRadialGradient(Math.cos(a)*d,Math.sin(a)*d,0,Math.cos(a)*d,Math.sin(a)*d,r)

                g.addColorStop(0,'rgba(255,255,255,0.32)')
                g.addColorStop(1,'rgba(255,255,255,0)')

                c.fillStyle=g
                c.fillRect(-CELL/2,-CELL/2,CELL,CELL)
            }
        })

        cell(SPARK,()=>{

            radial(70,[[0,1],[0.15,1],[0.3,0.4],[1,0]])

            for(let i=0;i<4;i++) spike(i*TAU/4,40,3)
        })

        cell(BOLT,()=>{

            //a jagged lightning bolt from top to bottom with a forked branch
            c.shadowColor='#fff'
            c.shadowBlur=22
            c.strokeStyle='#fff'
            c.lineJoin='round'

            let bolt=(x,y,ey,w,jag)=>{

                c.lineWidth=w
                c.beginPath()
                c.moveTo(x,y)

                let pts=[]

                for(let t=1;t<=10;t++){

                    let yy=y+(ey-y)*t/10,xx=x+(rand()-0.5)*jag*(t<10?1:0.2)

                    pts.push([xx,yy])
                    c.lineTo(xx,yy)
                }

                c.stroke()

                return pts
            }

            let pts=bolt(0,-124,124,13,70)

            bolt(pts[3][0],pts[3][1],60,6,50)
            bolt(pts[6][0],pts[6][1],124,4,40)
            bolt(0,-124,124,4,70)
        })

        cell(SHARD,()=>{

            //a chunk of rock or crystal
            c.fillStyle='#fff'
            c.beginPath()

            for(let i=0;i<7;i++){

                let a=i/7*TAU,r=70+rand()*45

                i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r)
            }

            c.closePath()
            c.fill()
        })

        cell(SWIRL,()=>{

            //three spiral arms winding into the middle
            c.strokeStyle='#fff'
            c.lineCap='round'
            c.shadowColor='#fff'
            c.shadowBlur=8

            for(let arm=0;arm<3;arm++){

                for(let t=0;t<1;t+=0.02){

                    let a=arm*TAU/3+t*TAU*1.1,r=12+t*108,a2=a+0.14,r2=12+(t+0.02)*108

                    c.lineWidth=2+t*12
                    c.globalAlpha=t
                    c.beginPath()
                    c.moveTo(Math.cos(a)*r,Math.sin(a)*r)
                    c.lineTo(Math.cos(a2)*r2,Math.sin(a2)*r2)
                    c.stroke()
                }
            }

            c.globalAlpha=1
        })

        cell(RUNE,()=>{

            //a magic circle: double ring, a band of runes and a hexagram
            c.strokeStyle='#fff'
            c.fillStyle='#fff'
            c.shadowColor='#fff'
            c.shadowBlur=6
            c.lineWidth=5

            c.beginPath();c.arc(0,0,118,0,TAU);c.stroke()
            c.lineWidth=3
            c.beginPath();c.arc(0,0,98,0,TAU);c.stroke()
            c.beginPath();c.arc(0,0,58,0,TAU);c.stroke()

            for(let i=0;i<24;i++){

                c.save()
                c.rotate(i/24*TAU)
                c.translate(0,-108)

                let k=(rand()*4)|0

                c.lineWidth=2.5
                c.beginPath()

                if(k===0){c.moveTo(-5,-5);c.lineTo(5,5);c.moveTo(5,-5);c.lineTo(-5,5)}
                else if(k===1){c.moveTo(0,-6);c.lineTo(5,5);c.lineTo(-5,5);c.closePath()}
                else if(k===2){c.moveTo(-5,0);c.lineTo(5,0);c.moveTo(0,-6);c.lineTo(0,6)}
                else c.arc(0,0,4,0,TAU)

                c.stroke()
                c.restore()
            }

            c.lineWidth=3

            for(let s=0;s<2;s++){

                c.beginPath()

                for(let i=0;i<=3;i++){

                    let a=s*Math.PI/3+i*TAU/3-Math.PI/2

                    i?c.lineTo(Math.cos(a)*96,Math.sin(a)*96):c.moveTo(Math.cos(a)*96,Math.sin(a)*96)
                }

                c.stroke()
            }

            radial(40,[[0,0.8],[1,0]])
        })

        cell(FLAME,()=>{

            //a tongue of fire: a teardrop, hot at the bottom, with flickering wisps
            let g=c.createRadialGradient(0,60,5,0,20,130)

            g.addColorStop(0,'rgba(255,255,255,1)')
            g.addColorStop(0.5,'rgba(255,255,255,0.6)')
            g.addColorStop(1,'rgba(255,255,255,0)')

            c.fillStyle=g
            c.beginPath()
            c.moveTo(0,-124)
            c.bezierCurveTo(30,-60,70,0,62,50)
            c.bezierCurveTo(56,100,-56,100,-62,50)
            c.bezierCurveTo(-70,0,-30,-60,0,-124)
            c.fill()

            for(let i=0;i<5;i++){

                c.beginPath()

                let x=(rand()-0.5)*80

                c.moveTo(x-12,20)
                c.quadraticCurveTo(x+(rand()-0.5)*40,-50,x+(rand()-0.5)*30,-100-rand()*20)
                c.quadraticCurveTo(x+10,-40,x+12,20)
                c.fill()
            }
        })

        cell(HALO,()=>radial(124,[[0,0],[0.62,0],[0.66,1],[0.75,0.45],[1,0]]))

        return cv
    }

    function create(gl){

        let vsh=`#version 300 es
            precision highp float;

            in vec2 corner;
            in vec3 iPos;
            in vec4 iShape;
            in vec4 iCol;
            in vec4 iUV;
            in vec4 iAxis;

            uniform mat4 viewMatrix;
            uniform vec3 camPos;

            out vec2 uv;
            out vec4 col;
            out float hot;

            void main(){

                //iShape: width, height, rotation, mode (0 faces the camera, 1 lies in the plane facing iAxis, 2 stretches along iAxis)
                float r=iShape.z,m=iShape.w;
                vec2 c=corner,rc=vec2(c.x*cos(r)-c.y*sin(r),c.x*sin(r)+c.y*cos(r));
                vec3 toCam=normalize(camPos-iPos),X,Y;

                if(m<0.5){

                    X=normalize(cross(vec3(0,1,0),toCam)+vec3(0.0001,0,0));
                    Y=cross(toCam,X);

                } else if(m<1.5){

                    vec3 n=normalize(iAxis.xyz),a=abs(n.y)<0.99?vec3(0,1,0):vec3(1,0,0);

                    X=normalize(cross(a,n));
                    Y=cross(n,X);

                } else {

                    Y=normalize(iAxis.xyz);
                    X=normalize(cross(Y,toCam)+vec3(0,0.0001,0));
                    rc=c;
                }

                vec3 world=iPos+X*rc.x*iShape.x+Y*rc.y*iShape.y;

                uv=mix(iUV.xy,iUV.zw,vec2(c.x+0.5,0.5-c.y));
                col=iCol;
                hot=iAxis.w;
                gl_Position=viewMatrix*vec4(world,1);
            }`

        let fsh=`#version 300 es
            precision highp float;

            in vec2 uv;
            in vec4 col;
            in float hot;

            uniform sampler2D tex;
            uniform float additive;
            uniform float night;

            out vec4 fragColor;

            void main(){

                float t=texture(tex,uv).r;

                if(additive>0.5){

                    //the brightest parts of the shape burn white, like the hot cores of anime effects
                    vec3 c=mix(col.rgb,vec3(1.0),clamp((t-0.55)*2.2,0.0,1.0)*hot);

                    fragColor=vec4(c*t*col.a*night,0.0);

                } else {

                    fragColor=vec4(col.rgb*night,t*col.a);
                }
            }`

        let compile=(type,src)=>{

            let s=gl.createShader(type)

            gl.shaderSource(s,src)
            gl.compileShader(s)

            if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s))

            return s
        }

        let prog=gl.createProgram()

        gl.attachShader(prog,compile(gl.VERTEX_SHADER,vsh))
        gl.attachShader(prog,compile(gl.FRAGMENT_SHADER,fsh))
        gl.linkProgram(prog)

        let loc={}

        for(let a of ['corner','iPos','iShape','iCol','iUV','iAxis']) loc[a]=gl.getAttribLocation(prog,a)
        for(let u of ['viewMatrix','camPos','tex','additive','night']) loc[u]=gl.getUniformLocation(prog,u)

        let vao=gl.createVertexArray(),quad=gl.createBuffer(),inst=gl.createBuffer()

        gl.bindVertexArray(vao)
        gl.bindBuffer(gl.ARRAY_BUFFER,quad)
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-0.5,-0.5,0.5,-0.5,-0.5,0.5,0.5,0.5]),gl.STATIC_DRAW)
        gl.enableVertexAttribArray(loc.corner)
        gl.vertexAttribPointer(loc.corner,2,gl.FLOAT,false,8,0)

        gl.bindBuffer(gl.ARRAY_BUFFER,inst)

        //per instance: pos 3, shape 4, color 4, uv 4, axis 4 = 19 floats
        let STRIDE=19*4,offs=[['iPos',3,0],['iShape',4,3],['iCol',4,7],['iUV',4,11],['iAxis',4,15]]

        for(let o of offs){

            gl.enableVertexAttribArray(loc[o[0]])
            gl.vertexAttribPointer(loc[o[0]],o[1],gl.FLOAT,false,STRIDE,o[2]*4)
            gl.vertexAttribDivisor(loc[o[0]],1)
        }

        gl.bindVertexArray(null)

        let texture=gl.createTexture()

        gl.bindTexture(gl.TEXTURE_2D,texture)
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,paintAtlas())
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR)
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
        gl.generateMipmap(gl.TEXTURE_2D)

        let uvOf=i=>{let x=i%CELLS,y=(i/CELLS)|0,p=1/(CELLS*CELL);return [x/CELLS+p,y/CELLS+p,(x+1)/CELLS-p,(y+1)/CELLS-p]}

        let UV=[]

        for(let i=0;i<16;i++) UV.push(uvOf(i))

        let particles=[],data=new Float32Array(0),MAX=4000

        let fx={particles,shake:0}

        //adds one particle. Everything is optional apart from pos and cell:
        //vel, grav, drag, life, size [w,h] (or a number) and size1 to grow/shrink to, rot and spin, col [r,g,b,a] and col1 to fade to,
        //mode 0/1/2 with axis (plane normal or stretch direction), stretch to lengthen streaks with speed, hot, alpha (normal blending),
        //delay, floor (a height to stop falling at), follow (an object with pos to move with)
        fx.add=function(p){

            if(particles.length>=MAX) return

            let s=typeof p.size==='number'?[p.size,p.size]:(p.size||[1,1]),s1=p.size1===undefined?s:typeof p.size1==='number'?[p.size1,p.size1]:p.size1

            particles.push({

                pos:p.pos.slice(),vel:p.vel?p.vel.slice():[0,0,0],grav:p.grav||0,drag:p.drag||0,life:p.life||0.5,age:0,delay:p.delay||0,
                s0:s,s1:s1,rot:p.rot===undefined?Math.random()*TAU:p.rot,spin:p.spin||0,
                c0:p.col||[1,1,1,1],c1:p.col1||[...(p.col||[1,1,1]).slice(0,3),0],ease:p.ease===undefined?3:p.ease,
                cell:p.cell,mode:p.mode||0,axis:p.axis||[0,1,0],stretch:p.stretch||0,hot:p.hot===undefined?1:p.hot,
                alpha:!!p.alpha,floor:p.floor,follow:p.follow,fadeIn:p.fadeIn||0.06
            })
        }

        fx.update=function(dt){

            for(let i=particles.length;i--;){

                let p=particles[i]

                if(p.delay>0){p.delay-=dt;continue}

                p.age+=dt

                if(p.age>=p.life){particles.splice(i,1);continue}

                p.vel[1]+=p.grav*dt

                if(p.drag){let k=Math.max(1-p.drag*dt,0);p.vel[0]*=k;p.vel[1]*=k;p.vel[2]*=k}

                p.pos[0]+=p.vel[0]*dt
                p.pos[1]+=p.vel[1]*dt
                p.pos[2]+=p.vel[2]*dt

                if(p.floor!==undefined&&p.pos[1]<p.floor){

                    p.pos[1]=p.floor
                    p.vel[1]*=-0.3
                    p.vel[0]*=0.6
                    p.vel[2]*=0.6
                }

                p.rot+=p.spin*dt
            }

            fx.shake=Math.max(fx.shake-dt*2.5,0)
        }

        let build=function(alphaPass){

            let n=0

            for(let p of particles) if(p.delay<=0&&p.alpha===alphaPass) n++

            if(data.length<n*19) data=new Float32Array(Math.max(n*19,data.length*2))

            let k=0

            for(let p of particles){

                if(p.delay>0||p.alpha!==alphaPass) continue

                let t=p.age/p.life,e=1-Math.pow(1-t,p.ease),fade=Math.min(p.age/p.fadeIn,1),
                    w=p.s0[0]+(p.s1[0]-p.s0[0])*e,h=p.s0[1]+(p.s1[1]-p.s0[1])*e,uv=UV[p.cell],ax=p.axis,
                    x=p.pos[0],y=p.pos[1],z=p.pos[2]

                if(p.follow){x+=p.follow.x;y+=p.follow.y;z+=p.follow.z}

                //streaks point along their velocity and get longer the faster they go
                if(p.mode===2&&p.stretch){

                    let sp=Math.hypot(p.vel[0],p.vel[1],p.vel[2])

                    if(sp>0.001) ax=[p.vel[0]/sp,p.vel[1]/sp,p.vel[2]/sp]

                    h+=sp*p.stretch
                }

                data[k++]=x;data[k++]=y;data[k++]=z
                data[k++]=w;data[k++]=h;data[k++]=p.rot;data[k++]=p.mode
                data[k++]=p.c0[0]+(p.c1[0]-p.c0[0])*t;data[k++]=p.c0[1]+(p.c1[1]-p.c0[1])*t;data[k++]=p.c0[2]+(p.c1[2]-p.c0[2])*t
                data[k++]=((p.c0[3]===undefined?1:p.c0[3])+((p.c1[3]===undefined?0:p.c1[3])-(p.c0[3]===undefined?1:p.c0[3]))*t)*fade
                data[k++]=uv[0];data[k++]=uv[1];data[k++]=uv[2];data[k++]=uv[3]
                data[k++]=ax[0];data[k++]=ax[1];data[k++]=ax[2];data[k++]=p.hot
            }

            return n
        }

        fx.render=function(viewMatrix,camPos,night){

            if(!particles.length) return

            gl.useProgram(prog)
            gl.bindVertexArray(vao)
            gl.uniformMatrix4fv(loc.viewMatrix,false,viewMatrix)
            gl.uniform3fv(loc.camPos,camPos)
            gl.uniform1f(loc.night,0.55+night*0.45)
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D,texture)
            gl.uniform1i(loc.tex,0)
            gl.depthMask(false)
            gl.disable(gl.CULL_FACE)

            //smoke and debris first, with ordinary blending, then everything that glows on top
            for(let pass of [true,false]){

                let n=build(pass)

                if(!n) continue

                gl.bindBuffer(gl.ARRAY_BUFFER,inst)
                gl.bufferData(gl.ARRAY_BUFFER,data.subarray(0,n*19),gl.DYNAMIC_DRAW)
                gl.uniform1f(loc.additive,pass?0:1)

                if(pass) gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)
                else gl.blendFunc(gl.ONE,gl.ONE)

                gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,n)
            }

            gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)
            gl.depthMask(true)
            gl.enable(gl.CULL_FACE)
            gl.bindVertexArray(null)
        }

        //---------------------------------------------------------------- effect compositions

        let R=(a,b)=>a+Math.random()*(b-a),UP=[0,1,0]

        //a point on a random direction, tilted toward the sky by up (0 flat, 1 straight up)
        let dir=(up=0.3)=>{let a=Math.random()*TAU,y=R(0,up);let l=Math.sqrt(1-y*y);return [Math.cos(a)*l,y,Math.sin(a)*l]}

        //a big explosive impact on the ground: the anime "bomb" hit
        fx.impact=function(pos,col,s=1,ground){

            let g=ground===undefined?pos[1]:ground,c=col,cl=[c[0],c[1],c[2],1],P=[pos[0],g+0.6*s,pos[2]]

            //a dark spiky silhouette behind the flash: the contrast that makes anime impacts pop
            fx.add({pos:P,cell:BURST,size:3*s,size1:10*s,life:0.4,col:[c[0]*0.18,c[1]*0.1,c[2]*0.1,0.9],alpha:true,spin:R(-1,1),fadeIn:0.01})
            fx.add({pos:P,cell:GLOW,size:4*s,size1:8*s,life:0.5,col:[c[0]*0.1,c[1]*0.06,c[2]*0.06,0.55],alpha:true,fadeIn:0.01})

            fx.add({pos:P,cell:FLARE,size:3*s,size1:7*s,life:0.28,col:cl,ease:2,hot:1.1,fadeIn:0.01})
            fx.add({pos:P,cell:GLOW,size:5*s,size1:9*s,life:0.45,col:[c[0],c[1],c[2],1],hot:0,fadeIn:0.01})
            fx.add({pos:P,cell:GLOW,size:2*s,size1:3*s,life:0.2,col:[1,1,1,1],hot:1,fadeIn:0.01})
            fx.add({pos:P,cell:BURST,size:2*s,size1:8*s,life:0.32,col:cl,hot:1.2,fadeIn:0.01,spin:R(-2,2)})

            //shockwaves: two on the ground and one standing upright, which is what makes it read in 3D
            fx.add({pos:[pos[0],g+0.08,pos[2]],cell:THICK_RING,mode:1,axis:UP,size:1,size1:11*s,life:0.55,col:cl,hot:0.8,fadeIn:0.01})
            fx.add({pos:[pos[0],g+0.1,pos[2]],cell:RING,mode:1,axis:UP,size:1,size1:15*s,life:0.4,col:cl,hot:0.5,ease:2,fadeIn:0.01})

            let a=Math.random()*TAU

            fx.add({pos:P,cell:HALO,mode:1,axis:[Math.cos(a),0,Math.sin(a)],size:1,size1:8*s,life:0.35,col:cl,fadeIn:0.01})

            //a glowing crack decal and a scorch mark that linger
            fx.add({pos:[pos[0],g+0.05,pos[2]],cell:CRACK,mode:1,axis:UP,size:6*s,size1:6.5*s,life:1.8,col:cl,col1:[c[0]*0.5,c[1]*0.3,c[2]*0.3,0],hot:0.6,ease:1,fadeIn:0.02})
            fx.add({pos:[pos[0],g+0.04,pos[2]],cell:GLOW,mode:1,axis:UP,size:5*s,size1:5.5*s,life:2,col:[0.05,0.03,0.02,0.75],col1:[0.05,0.03,0.02,0],alpha:true,ease:1})

            //a pillar of light punching up out of the impact
            fx.add({pos:[pos[0],g+3*s,pos[2]],cell:STREAK,mode:2,axis:UP,size:[1.4*s,7*s],size1:[0.2*s,9*s],life:0.3,col:cl,hot:1.5,fadeIn:0.01})

            //sparks thrown out as speed lines, bouncing debris, embers and smoke
            for(let i=0;i<18;i++){

                let d=dir(0.8),sp=R(7,15)*s

                fx.add({pos:P,vel:[d[0]*sp,d[1]*sp+2,d[2]*sp],grav:-18,drag:2.5,cell:STREAK,mode:2,stretch:0.06,size:[0.18*s,0.4*s],life:R(0.3,0.55),col:cl,hot:1.3})
            }

            for(let i=0;i<12;i++){

                let d=dir(0.9),sp=R(4,9)*s

                fx.add({pos:[pos[0],g+0.3,pos[2]],vel:[d[0]*sp,R(4,9)*s,d[2]*sp],grav:-22,cell:SHARD,size:R(0.15,0.35)*s,life:R(0.9,1.4),spin:R(-12,12),col:[0.12,0.09,0.06,1],col1:[0.12,0.09,0.06,0],alpha:true,floor:g+0.05,ease:1})
            }

            for(let i=0;i<10;i++){

                let d=dir(0.2)

                fx.add({pos:[pos[0]+d[0]*R(0,2)*s,g+0.4,pos[2]+d[2]*R(0,2)*s],vel:[d[0]*R(0.5,2),R(1.5,3.5),d[2]*R(0.5,2)],drag:0.8,cell:SPARK,size:R(0.15,0.3)*s,size1:0.02,life:R(0.8,1.6),col:cl,hot:1,ease:1,delay:R(0,0.2)})
            }

            for(let i=0;i<7;i++){

                let d=dir(0)

                fx.add({pos:[pos[0]+d[0]*s,g+0.5*s,pos[2]+d[2]*s],vel:[d[0]*R(2,4)*s,R(0.6,1.8),d[2]*R(2,4)*s],drag:2,cell:SMOKE,size:1.5*s,size1:4*s,life:R(0.9,1.4),spin:R(-1,1),col:[0.35,0.32,0.3,0.55],col1:[0.4,0.38,0.36,0],alpha:true,ease:2,delay:0.05})
            }

            fx.shake=Math.max(fx.shake,0.35*s)
        }

        //a power-up: a spinning magic circle under the player, rising light, and a burst above
        fx.boost=function(follow,col,s=1){

            let c=col,cl=[c[0],c[1],c[2],1],f=follow,g=-0.48

            fx.add({pos:[0,g+0.06,0],follow:f,cell:RUNE,mode:1,axis:UP,size:0.5,size1:3.6*s,life:1.4,spin:2.5,col:cl,col1:[c[0],c[1],c[2],0],ease:4,hot:0.9,fadeIn:0.02})
            fx.add({pos:[0,g+0.08,0],follow:f,cell:HALO,mode:1,axis:UP,size:0.5,size1:5*s,life:0.6,col:cl,fadeIn:0.01})
            fx.add({pos:[0,0.3,0],follow:f,cell:GLOW,size:2.5*s,size1:4*s,life:0.5,col:[c[0],c[1],c[2],0.8]})
            fx.add({pos:[0,1.1,0],follow:f,cell:STREAK,mode:2,axis:UP,size:[1.6*s,2*s],size1:[0.2*s,6*s],life:0.45,col:cl,hot:1.4,fadeIn:0.01})
            fx.add({pos:[0,1.8,0],follow:f,cell:FLARE,size:1*s,size1:2.6*s,life:0.4,col:cl,hot:1.5,delay:0.12})

            //aura lines streaming upward around the body
            for(let i=0;i<16;i++){

                let a=i/16*TAU+R(0,0.4),r=R(0.4,0.9)*s

                fx.add({pos:[Math.cos(a)*r,g+R(0,0.5),Math.sin(a)*r],follow:f,vel:[0,R(4,7),0],cell:STREAK,mode:2,stretch:0.12,size:[0.12,0.3],life:R(0.35,0.6),col:cl,hot:1.2,delay:R(0,0.5)})
            }

            //sparkles spiralling up
            for(let i=0;i<10;i++){

                let a=i/10*TAU

                fx.add({pos:[Math.cos(a)*0.7*s,g+0.3,Math.sin(a)*0.7*s],follow:f,vel:[-Math.sin(a)*1.5,R(1.5,3),Math.cos(a)*1.5],cell:SPARK,size:0.25,size1:0.05,life:R(0.6,1),col:cl,ease:1,delay:R(0,0.4)})
            }
        }

        //fire: a burst of flame tongues licking upward, embers and a heat ring
        fx.fire=function(pos,s=1,col=[1,0.45,0.05]){

            let cl=[col[0],col[1],col[2],1]

            fx.add({pos:[pos[0],pos[1]+0.06,pos[2]],cell:THICK_RING,mode:1,axis:UP,size:1,size1:8*s,life:0.5,col:cl,fadeIn:0.01})
            fx.add({pos:[pos[0],pos[1]+0.8*s,pos[2]],cell:GLOW,size:4*s,size1:6*s,life:0.6,col:[col[0],col[1]*0.8,col[2],0.8]})

            fx.add({pos:[pos[0],pos[1]+1.6*s,pos[2]],cell:FLAME,size:[1.8*s,3.4*s],size1:[0.6*s,4.6*s],rot:0,life:0.7,col:[1,0.9,0.5,1],col1:[col[0],col[1]*0.3,0.02,0],hot:1.2,ease:1})
            fx.add({pos:[pos[0],pos[1]+0.9*s,pos[2]],cell:BURST,size:2*s,size1:6*s,life:0.35,col:[0.25,0.06,0.02,0.8],alpha:true,fadeIn:0.01})

            for(let i=0;i<6;i++) fx.add({pos:[pos[0]+R(-0.8,0.8)*s,pos[1]+1.5*s,pos[2]+R(-0.8,0.8)*s],vel:[R(-0.4,0.4),R(1.5,2.5),R(-0.4,0.4)],drag:0.6,cell:SMOKE,size:1.2*s,size1:3.2*s,spin:R(-1,1),life:R(1,1.6),col:[0.18,0.14,0.12,0.5],col1:[0.3,0.28,0.26,0],alpha:true,ease:2,delay:R(0.15,0.4)})

            for(let i=0;i<22;i++){

                let d=dir(0),r=R(0,1.6)*s

                fx.add({pos:[pos[0]+d[0]*r,pos[1]+0.6*s,pos[2]+d[2]*r],vel:[d[0]*0.6,R(2,4.5)*s,d[2]*0.6],cell:FLAME,size:[R(1.1,1.8)*s,R(1.6,2.8)*s],size1:[0.25*s,R(2,3.4)*s],rot:R(-0.25,0.25),life:R(0.4,0.75),col:[1,0.85,0.35,1],col1:[col[0],col[1]*0.4,0.02,0],hot:1.1,ease:1,delay:R(0,0.25)})
            }

            for(let i=0;i<16;i++){

                let d=dir(0.9)

                fx.add({pos:[pos[0],pos[1]+0.4,pos[2]],vel:[d[0]*R(2,5),R(3,8),d[2]*R(2,5)],grav:-4,drag:1.2,cell:STREAK,mode:2,stretch:0.08,size:[0.1,0.2],life:R(0.6,1.2),col:[1,0.7,0.2,1],col1:[1,0.2,0,0],hot:1.2})
            }

            fx.shake=Math.max(fx.shake,0.15*s)
        }

        //electric: lightning bolts striking down, a crackling dome and a burn mark
        fx.lightning=function(pos,col,s=1,ground){

            let g=ground===undefined?pos[1]:ground,cl=[col[0],col[1],col[2],1]

            fx.add({pos:[pos[0],g+0.8*s,pos[2]],cell:BURST,size:3*s,size1:8*s,life:0.35,col:[col[0]*0.12,col[1]*0.12,col[2]*0.2,0.85],alpha:true,fadeIn:0.01})

            for(let i=0;i<4;i++){

                let ox=R(-0.5,0.5),oz=R(-0.5,0.5)

                fx.add({pos:[pos[0]+ox,g+4.5*s,pos[2]+oz],cell:BOLT,mode:2,axis:UP,size:[3.2*s,9.5*s],life:0.22,col:cl,hot:1.4,fadeIn:0.005,delay:i*0.07,rot:0})
            }

            fx.add({pos:[pos[0],g+0.8*s,pos[2]],cell:FLARE,size:2.5*s,size1:5*s,life:0.3,col:cl,hot:1.6,fadeIn:0.01})
            fx.add({pos:[pos[0],g+0.6*s,pos[2]],cell:HALO,size:1,size1:4.5*s,life:0.4,col:cl,fadeIn:0.01})
            fx.add({pos:[pos[0],g+0.07,pos[2]],cell:CRACK,mode:1,axis:UP,size:4.5*s,life:1.2,col:cl,hot:0.8,ease:1,fadeIn:0.01})
            fx.add({pos:[pos[0],g+0.09,pos[2]],cell:RING,mode:1,axis:UP,size:1,size1:9*s,life:0.4,col:cl,fadeIn:0.01})

            for(let i=0;i<12;i++){

                let d=dir(0.7),sp=R(5,10)*s

                fx.add({pos:[pos[0],g+0.5,pos[2]],vel:[d[0]*sp,d[1]*sp+1,d[2]*sp],grav:-10,drag:3,cell:STREAK,mode:2,stretch:0.07,size:[0.12,0.3],life:R(0.25,0.45),col:cl,hot:1.4})
            }

            fx.shake=Math.max(fx.shake,0.25*s)
        }

        //wind: swirling gusts and speed lines circling the spot
        fx.wind=function(pos,col,s=1){

            let cl=[col[0],col[1],col[2],0.9]

            for(let i=0;i<3;i++) fx.add({pos:[pos[0],pos[1]+0.15+i*0.7*s,pos[2]],cell:SWIRL,mode:1,axis:UP,size:2*s+i*0.6,size1:5*s+i,life:0.9,spin:-5-i*2,col:cl,hot:0.6,delay:i*0.1})

            for(let i=0;i<20;i++){

                let a=R(0,TAU),r=R(1,2.5)*s,y=R(0.2,3)*s,sp=R(6,10)

                fx.add({pos:[pos[0]+Math.cos(a)*r,pos[1]+y,pos[2]+Math.sin(a)*r],vel:[-Math.sin(a)*sp,1.5,Math.cos(a)*sp],drag:1.5,cell:STREAK,mode:2,stretch:0.1,size:[0.08,0.3],life:R(0.3,0.6),col:[1,1,1,0.8],hot:0.5,delay:R(0,0.4)})
            }
        }

        //a ring of rune light marking a spot on the field
        fx.mark=function(pos,col,s=1){

            let cl=[col[0],col[1],col[2],1]

            fx.add({pos:[pos[0],pos[1]+0.06,pos[2]],cell:RUNE,mode:1,axis:UP,size:5*s,size1:4*s,life:1.6,spin:1.2,col:cl,col1:[col[0],col[1],col[2],0],ease:1,hot:0.8})
            fx.add({pos:[pos[0],pos[1]+2*s,pos[2]],cell:STREAK,mode:2,axis:UP,size:[0.8*s,5*s],size1:[0.1,6*s],life:0.5,col:cl,hot:1.4,fadeIn:0.01})
            fx.add({pos:[pos[0],pos[1]+0.5,pos[2]],cell:FLARE,size:1.5*s,size1:3*s,life:0.35,col:cl,hot:1.5,fadeIn:0.01})
        }

        //a splash of liquid: droplets, a flat ripple and foam
        fx.splash=function(pos,col,s=1){

            let cl=[col[0],col[1],col[2],1]

            fx.add({pos:[pos[0],pos[1]+0.06,pos[2]],cell:THICK_RING,mode:1,axis:UP,size:1,size1:7*s,life:0.6,col:cl,fadeIn:0.01})
            fx.add({pos:[pos[0],pos[1]+0.08,pos[2]],cell:RING,mode:1,axis:UP,size:0.5,size1:4*s,life:0.8,col:[1,1,1,0.8],delay:0.1})
            fx.add({pos:[pos[0],pos[1]+0.6,pos[2]],cell:BURST,size:1.5*s,size1:4*s,life:0.25,col:cl,fadeIn:0.01})

            for(let i=0;i<16;i++){

                let d=dir(0.9),sp=R(3,7)*s

                fx.add({pos:[pos[0],pos[1]+0.3,pos[2]],vel:[d[0]*sp*0.6,R(4,8)*s,d[2]*sp*0.6],grav:-20,cell:SPARK,size:R(0.2,0.4)*s,life:R(0.5,0.9),col:cl,hot:0.9,floor:pos[1]})
            }
        }

        //a quick crescent slash across a target, for stinger hits
        fx.slash=function(pos,col,s=1){

            let cl=[col[0],col[1],col[2],1],rot=R(0,TAU)

            fx.add({pos,cell:SLASH,size:1.6*s,size1:2.2*s,rot,life:0.18,col:cl,hot:1.4,fadeIn:0.005,ease:2})
            fx.add({pos,cell:SPARK,size:0.9*s,size1:0.3,life:0.15,col:cl,hot:1.5,fadeIn:0.005})

            for(let i=0;i<5;i++){

                let d=dir(0.6),sp=R(4,8)

                fx.add({pos,vel:[d[0]*sp,d[1]*sp,d[2]*sp],drag:6,cell:STREAK,mode:2,stretch:0.05,size:[0.07,0.15],life:R(0.15,0.3),col:cl,hot:1.3})
            }
        }

        //a short generic sparkle, for abilities without their own effect
        fx.sparkle=function(pos,col,s=1){

            let cl=[col[0],col[1],col[2],1]

            fx.add({pos,cell:FLARE,size:1.2*s,size1:2.4*s,life:0.3,col:cl,hot:1.5,fadeIn:0.01})
            fx.add({pos,cell:HALO,size:0.5,size1:3*s,life:0.35,col:cl,fadeIn:0.01})

            for(let i=0;i<8;i++){

                let d=dir(1),sp=R(2,5)*s

                fx.add({pos,vel:[d[0]*sp,d[1]*sp,d[2]*sp],drag:3,cell:SPARK,size:0.25*s,size1:0.05,life:R(0.4,0.7),col:cl,hot:1.2})
            }
        }

        //converging speed lines toward a moving target, for token link
        fx.converge=function(follow,col){

            let cl=[col[0],col[1],col[2],1]

            for(let i=0;i<24;i++){

                let d=dir(0.6),r=R(4,7)

                fx.add({pos:[d[0]*r,d[1]*r,d[2]*r],follow,vel:[-d[0]*r*3,-d[1]*r*3,-d[2]*r*3],cell:STREAK,mode:2,stretch:0.04,size:[0.1,0.3],life:0.32,col:cl,hot:1,delay:R(0,0.25)})
            }

            fx.add({pos:[0,0.4,0],follow,cell:FLARE,size:1,size1:3,life:0.35,col:cl,hot:1.5,delay:0.3})
        }

        return fx
    }

    //which effect each ability token gets, and its colors
    const RED=[1,0.18,0.1],BLUE=[0.2,0.5,1],WHITE=[1,0.95,0.75],GOLD=[1,0.8,0.15],PINK=[1,0.35,0.75],PURPLE=[0.7,0.3,1],GREEN=[0.3,1,0.35],CYAN=[0.3,0.95,1]

    const abilities={

        whiteBomb:['impact',WHITE,1],whiteBomb_:['impact',WHITE,1.3],redBomb:['impact',RED,1],redBomb_:['impact',RED,1.3],
        blueBomb:['impact',BLUE,1],blueBomb_:['impact',BLUE,1.3],fuzzBomb:['impact',[0.95,0.95,0.85],0.9],
        redBombSync:['impact',RED,1.2],blueBombSync:['impact',BLUE,1.2],gummyBarrage:['splash',PINK,1.2],gummyBlob:['splash',GREEN,1],

        haste:['boost',[1,1,1],1],haste_:['boost',[1,1,1],1.2],focus:['boost',[0.3,1,0.35],1],melody:['boost',[0.8,0.6,1],1],
        redBoost:['boost',RED,1],blueBoost:['boost',BLUE,1],whiteBoost:['boost',WHITE,1],rage:['boost',[1,0.1,0.05],1.1],
        inspire:['boost',GOLD,1.1],babyLove:['boost',PINK,1],precision:['boost',CYAN,1],conversionBoost:['boost',GOLD,1],
        tabbyLove:['boost',[1,0.6,0.3],1],puppyLove:['boost',PINK,1],

        inferno:['fire',[1,0.45,0.05],1.2],flameFuel:['fire',[1,0.3,0.02],0.8],flameHeat:['fire',[1,0.4,0.05],0.7],darkHeat:['fire',[0.7,0.1,1],0.9],

        beamStorm:['lightning',[1,0.95,0.4],1.2],impale:['lightning',[0.6,1,0.3],1],mindHack:['lightning',[0.3,1,0.5],1],glitch:['lightning',[0.3,1,0.6],0.9],
        corruption:['lightning',PURPLE,1],mapCorruption:['lightning',PURPLE,1],

        pollenHaze:['wind',[1,1,0.85],1],tornado:['wind',[0.9,0.95,1],1.3],rainCloud:['wind',CYAN,1.2],cloudBoost:['wind',[0.8,0.9,1],1],

        pollenMarkToken:['mark',[1,0.9,0.3],1],honeyMarkToken:['mark',GOLD,1],preciseMarkToken:['mark',CYAN,1],markSurge:['mark',GOLD,1.4],triangulate:['mark',[0.4,1,0.5],1.1],

        link:['converge',[0.4,1,0.6]],

        summonFrog:['splash',GREEN,1],inflateBalloons:['splash',BLUE,1],surpriseParty:['splash',PINK,1],bubbleBloat:['splash',CYAN,1],
        tidalSurge:['splash',CYAN,1.3],scratch:['impact',[1,0.85,0.4],0.7],festiveGifts:['sparkle',RED,1.3],smiley:['sparkle',GOLD,1.3]
    }

    window.AnimeFX={create,abilities}

})()

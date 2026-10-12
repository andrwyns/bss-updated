(function(){
    window.glsl_shadow_map_vsh = `#version 300 es

    precision highp float;
    
    in vec3 vertPos;
    in vec4 vertColor;
    in vec3 vertUV;
    in vec3 vertNormal;
    
    uniform mat4 viewMatrix;
    
    void main(){
        
        float useless=vertColor.x+vertUV.x+vertNormal.x;

        gl_Position=viewMatrix*vec4(vertPos+useless*0.0000001,1);
    }
`
window.glsl_shadow_map_fsh = `#version 300 es
    
    void main(){}
`
window.glsl_visual_vsh = `#version 300 es

    precision highp float;
    
    in vec2 vertPos;

    out vec2 uv;
    
    void main(){
        uv=vertPos*0.5+0.5;
        gl_Position=vec4(vertPos,0,1);
    }
`
window.glsl_visual_fsh = `#version 300 es
    
    precision highp float;

    in vec2 uv;
    uniform sampler2D tex;
    out vec4 fragColor;

    void main(){

        float d=texture(tex,uv).r;

        d=pow(d,40.);

        fragColor=vec4(d,d,d,1);
    }
`
window.glsl_sky_vsh = `#version 300 es

    precision highp float;

    layout(location=0) in vec2 vertPos;

    out vec2 screenPos;

    void main(){

        screenPos=vertPos;
        gl_Position=vec4(vertPos,0,1);
    }
`
window.glsl_sky_fsh = `#version 300 es

    precision highp float;

    in vec2 screenPos;

    out vec4 fragColor;

    //turns a spot on the screen into the direction the camera looks in there
    uniform mat3 screenToWorld;
    uniform vec3 skyColor;
    uniform vec3 fogColor;
    uniform float isNight;
    uniform float time;

    float hash(vec2 p){

        return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);
    }

    float noise(vec2 p){

        vec2 i=floor(p),f=fract(p);

        f=f*f*(3.0-2.0*f);

        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
    }

    void main(){

        vec3 dir=normalize(screenToWorld*vec3(screenPos,1));

        //0 during the day, 1 in the middle of the night
        float night=clamp((1.0-isNight)/0.45,0.0,1.0);
        float up=max(dir.y,0.0);

        //deeper color overhead, fading into the haze that far away things fade into. That way the horizon has no seam
        vec3 zenith=mix(skyColor*vec3(0.62,0.8,1.0),vec3(0.015,0.02,0.07),night);
        vec3 haze=mix(fogColor*isNight,vec3(0.11,0.14,0.24),night);
        vec3 c=mix(haze,mix(skyColor,zenith,smoothstep(0.0,0.7,up)),smoothstep(0.0,mix(0.3,0.16,night),dir.y));

        //clouds drift across a flat layer high above
        vec2 cloudPos=dir.xz/(up+0.12)*1.3+time*vec2(0.012,0.005);
        float cloud=noise(cloudPos)*0.55+noise(cloudPos*2.3+4.0)*0.3+noise(cloudPos*5.1+9.0)*0.15;

        cloud=smoothstep(0.5,0.78,cloud)*smoothstep(0.03,0.3,dir.y);
        c=mix(c,mix(vec3(1.0),skyColor*0.25+0.03,night),cloud*mix(0.8,0.5,night));

        //the sun, where the light comes from
        float sun=max(dot(dir,normalize(LIGHT_DIR)),0.0);

        c+=vec3(1.0,0.95,0.75)*(smoothstep(0.9985,0.9993,sun)+pow(sun,48.0)*0.3)*(1.0-night)*(1.0-cloud*0.7);

        //stars that twinkle, and a crescent moon
        vec2 starPos=dir.xz/(up+0.25)*38.0;
        vec2 cell=floor(starPos);
        float seed=hash(cell);
        float star=step(0.93,seed)*smoothstep(0.32,0.0,distance(fract(starPos),vec2(0.3)+0.4*vec2(hash(cell+7.0),hash(cell+13.0))));

        c+=star*(0.55+0.45*sin(time*(1.5+seed*3.0)+seed*60.0))*night*smoothstep(0.02,0.2,dir.y)*(1.0-cloud);

        vec3 moonDir=normalize(vec3(-0.45,0.62,-0.6));
        float moon=smoothstep(0.9976,0.9982,dot(dir,moonDir))*(1.0-smoothstep(0.9978,0.9984,dot(dir,normalize(moonDir+vec3(0.035,0.012,0.0)))));

        c+=(vec3(0.95,0.97,1.0)*moon+vec3(0.5,0.6,0.9)*pow(max(dot(dir,moonDir),0.0),200.0)*0.35)*night*(1.0-cloud*0.6);

        fragColor=vec4(c,1);
    }
`
window.glsl_static_geometry_vsh = `#version 300 es

    precision highp float;
    
    in vec3 vertPos;
    in vec4 vertColor;
    in vec3 vertUV;
    in vec3 vertNormal;
    
    out float pixFog;
    out vec4 pixColor;
    out vec3 pixUV;
    out vec3 pixNormal;
    out vec3 pixPos;
    
    uniform mat4 viewMatrix;
    
    void main(){
        
        vec4 pos=viewMatrix*vec4(vertPos,1);
        pixColor=vertColor;
        pixUV=vertUV;
        pixNormal=vertNormal;
        pixPos=vertPos;
        pixFog=pos.z;
        gl_Position=pos;
    }
`
window.glsl_static_geometry_fsh = `#version 300 es
    
    precision highp float;
    
    in float pixFog;
    in vec4 pixColor;
    in vec3 pixUV;
    in vec3 pixNormal;
    in vec3 pixPos;
    
    out vec4 fragColor;
    
    uniform sampler2D tex;
    uniform sampler2D shadowMap;
    uniform float isNight;
    uniform vec3 camPos;

    mat4 shadowMatrix=mat4(SHADOW_MATRIX);

    float hash(vec2 p){
        return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453)-0.5; 
    }

    void main(){

        vec4 proj=shadowMatrix*vec4(pixPos,1);
        proj.xyz/=proj.w;
        proj.xyz=proj.xyz*0.5+0.5;
        float currentDepth=proj.z-dot(normalize(vec3(SHADOW_POS)-pixPos),pixNormal)*0.0004;
        float shadow=1.0;
        float shadowDarkness=0.025*isNight*isNight;
        
        // for(float i=0.0;i<9.0;i++){
        //     float projDepth=texture(shadowMap,proj.xy+vec2(hash(proj.xy-i*120.421),hash(proj.yx+i*140.179))*0.002).r;
            
        //     if(projDepth<=currentDepth)
        //         shadow-=shadowDarkness;
        // }

        for(int x=-1;x<=1;x++){
            for(int y=-1;y<=1;y++){
                float projDepth=texture(shadowMap,proj.xy+vec2(x,y)*0.0005).r;
                
                if(projDepth<=currentDepth)
                    shadow-=shadowDarkness;
            }
        }
        
        if(proj.w<1.0||proj.x<0.0||proj.x>1.0||proj.y<0.0||proj.y>1.0||proj.z<0.0||proj.z>1.0) shadow=1.0;

        vec4 t=texture(tex,pixUV.xy);

        vec3 toCam=normalize(camPos-pixPos);
        vec3 toLight=normalize(vec3(50,100,-50)-pixPos);
        vec3 halfVec=normalize(toCam+toLight);
        
        float specular=max(dot(halfVec,pixNormal),0.);
        specular*=specular;
        specular*=specular;
        specular*=specular;
        specular*=specular;
        specular*=specular;
        specular*=specular;
        
        float specInst=0.4*isNight;

        BEESMAS{
        fragColor=vec4(mix((mix(mix(pixColor.rgb,t.rgb,t.a),pixColor.rgb,pixUV.z)+specular*specInst)*shadow,FOGCOLB,smoothstep(-30.0,130.0,EXTRAFOGpixFog))*isNight,pixColor.w);
        }ELSE{
        fragColor=vec4(mix((mix(mix(pixColor.rgb,t.rgb,t.a),pixColor.rgb,pixUV.z)+specular*specInst)*shadow,FOGCOL,smoothstep(20.0,120.0,EXTRAFOGpixFog))*isNight,pixColor.w);
        }
    }
`
window.glsl_static_geometry_fsh_LOW = `#version 300 es
    
    precision highp float;
    
    in float pixFog;
    in vec4 pixColor;
    in vec3 pixUV;
    in vec3 pixNormal;
    in vec3 pixPos;
    
    out vec4 fragColor;
    
    uniform sampler2D tex;
    uniform float isNight;

    void main(){

        vec4 t=texture(tex,pixUV.xy);
        fragColor=vec4(mix(mix(pixColor.rgb,t.rgb,t.a),pixColor.rgb,pixUV.z)*isNight,pixColor.w);
    }
`
window.glsl_dynamic_geometry_vsh = `#version 300 es

    precision highp float;
    
    in vec3 vertPos;
    in vec3 vertColor;
    in vec3 vertNormal;
    
    out vec3 pixColor;
    out vec3 pixNormal;
    out vec3 pixPos;
    
    uniform mat4 viewMatrix;
    uniform mat4 modelMatrix;
    
    void main(){
        
        vec4 world=modelMatrix*vec4(vertPos,1);
        pixColor=vertColor;
        pixNormal=mat3(modelMatrix)*vertNormal;
        pixPos=world.xyz;
        gl_Position=viewMatrix*world;
    }
`
window.glsl_dynamic_geometry_fsh = `#version 300 es
    
    precision highp float;
    
    in vec3 pixColor;
    in vec3 pixNormal;
    in vec3 pixPos;
    
    out vec4 fragColor;
    
    uniform float isNight;
    uniform vec3 camPos;
    
    void main(){
        
        vec3 normal=normalize(pixNormal);
        vec3 light=normalize(LIGHT_DIR);
        vec3 toCam=normalize(camPos-pixPos);
        float shade=dot(normal,LIGHT_DIR)*0.5+0.55;

        //a soft highlight where the light bounces toward the camera, and a faint glow along the silhouette
        float specular=pow(max(dot(normal,normalize(light+toCam)),0.0),24.0)*0.18;
        float rim=pow(1.0-max(dot(normal,toCam),0.0),3.0)*0.12;

        fragColor=vec4((pixColor*(shade+max(dot(normal,light),0.0)*0.12)+specular+rim)*isNight,1.0);
    }
`
window.glsl_dynamic_geometry_fsh_LOW = `#version 300 es
    
    precision highp float;
    
    in vec3 pixColor;
    
    out vec4 fragColor;
    
    uniform float isNight;
    
    void main(){
        
        fragColor=vec4(pixColor*isNight,1.0);
    }
`
window.glsl_token_geometry_vsh = `#version 300 es

    precision highp float;
    
    in vec3 vertPos;
    in vec2 vertUV;
    
    in vec4 instance_pos;
    in vec4 instance_uv;
    
    out vec3 pixUV;
    out vec2 localUV;
    out float phase;
    
    uniform mat4 viewMatrix;
    uniform float time;
    
    void main(){
        
        pixUV=vec3(vertUV,0)+instance_uv.xyz;

        //where on the face of the token this is, from 0 to 1 (a token's texture is 1/8 by 1/16 of the atlas)
        localUV=vertUV*vec2(8.0,16.0);

        //tokens next to each other shouldn't move in sync
        phase=instance_pos.x*0.37+instance_pos.z*0.53;
        
        vec3 vp=vertPos*instance_uv.w;
        float s=sin(instance_pos.w);
        float c=cos(instance_pos.w);
        
        vp=vec3(vp.x*s-vp.z*c,vp.y,vp.x*c+vp.z*s);

        //a gentle bob
        vec3 origin=instance_pos.xyz+vec3(0,sin(time*2.2+phase*4.0)*0.07,0);
        
        gl_Position=viewMatrix*vec4(vp+origin,1);
    }
`

window.glsl_token_geometry_fsh = `#version 300 es
    
    precision highp float;
    
    in vec3 pixUV;
    in vec2 localUV;
    in float phase;
    
    out vec4 fragColor;
    
    uniform sampler2D tex;
    uniform float isNight;
    uniform float time;
    
    void main(){
        
        vec3 c=texture(tex,pixUV.xy).rgb;

        //a raised, lighter rim with a dark edge, like a coin
        float r=distance(localUV,vec2(0.5));
        c=mix(c,c*1.15+0.07,smoothstep(0.405,0.43,r)*(1.0-smoothstep(0.455,0.475,r)));
        c*=1.0-smoothstep(0.468,0.5,r)*0.3;

        //a glint that sweeps across the face every few seconds
        float sweep=fract(time*0.3+phase)*3.0-1.0;
        c+=smoothstep(0.07,0.0,abs((localUV.x+localUV.y)*0.5-sweep))*0.38;

        //tokens stay easy to spot at night
        fragColor=vec4(c*mix(isNight,1.0,0.5),pixUV.z);
    }
`
window.glsl_flower_geometry_vsh = `#version 300 es

    precision highp float;
    
    in vec3 vertPos;
    in vec4 vertUV;
    in float vertGoo;
    
    out vec4 pixUV;
    out float pixFog;
    out float goo;
    
    uniform mat4 viewMatrix;
    
    void main(){
        
        vec4 pos=viewMatrix*vec4(vertPos,1);
        pixUV=vertUV;
        goo=vertGoo;
        BEESMAS{
            pixFog=smoothstep(-30.0,130.0,EXTRAFOGpos.z);
        }ELSE{
            pixFog=smoothstep(20.0,120.0,EXTRAFOGpos.z);
        }
        gl_Position=pos;
    }
`
window.glsl_flower_geometry_vsh_LOW = `#version 300 es

    precision highp float;
    
    in vec3 vertPos;
    in vec4 vertUV;
    in float vertGoo;
    
    out vec4 pixUV;
    out float goo;
    
    uniform mat4 viewMatrix;
    
    void main(){
        
        vec4 pos=viewMatrix*vec4(vertPos,1);
        pixUV=vertUV;
        goo=vertGoo;
        gl_Position=pos;
    }
`

window.glsl_flower_geometry_fsh = `#version 300 es
    
    precision highp float;
    
    in vec4 pixUV;
    in float pixFog;
    in float goo;
    
    out vec4 fragColor;
    
    uniform sampler2D tex;
    uniform float isNight;
    
    void main(){
        
        vec3 c=mix(vec3(0,0.6,0),texture(tex,pixUV.xy).rgb*min(pixUV.w,1.0),pixUV.z);
        
        c=c.g<=0.1?vec3(0,0.35,0):c;
        BEESMAS{
            fragColor=vec4(mix(goo<0.0?mix(c,vec3(0.1,1,0.5),-goo):mix(c,vec3(1,0.2,1),goo),FOGCOLB,pixFog)*isNight,1.0);
        }ELSE{
            fragColor=vec4(mix(goo<0.0?mix(c,vec3(0.1,1,0.5),-goo):mix(c,vec3(1,0.2,1),goo),FOGCOL,pixFog)*isNight,1.0);
        }
    }
`
window.glsl_flower_geometry_fsh_LOW = `#version 300 es
    
    precision highp float;
    
    in vec4 pixUV;
    in float goo;
    
    out vec4 fragColor;
    
    uniform sampler2D tex;
    uniform float isNight;
    
    void main(){
        
        vec3 c=mix(vec3(0,0.6,0),texture(tex,pixUV.xy).rgb*min(pixUV.w,1.0),pixUV.z);
        c=c.g<=0.1?vec3(0,0.35,0):c;
        fragColor=vec4((goo<0.0?mix(c,vec3(0.1,1,0.5),-goo):mix(c,vec3(1,0.2,1),goo))*isNight,1);
    }
`
window.glsl_bee_geometry_vsh = `#version 300 es

    precision highp float;
    
    in vec3 vertPos;
    in vec4 vertUV;
    
    in vec4 instance_pos;
    in vec4 instance_rotation;
    in vec3 instance_uv;
    
    out vec3 pixUV;
    out float pixFog;
    out vec3 pixWorld;
    out vec2 wingUV;
    out float gifted;
    
    uniform mat4 viewMatrix;
    uniform float time;

    vec4 computePos(){

        vec3 vp=vertPos;

        vec3 del=normalize(instance_rotation.xyz);

        //wings are the only vertices with a shade of 0. They flap around the point where they join the body.
        //Bees that point straight up are asleep or dancing, and the giant bee statues don't fly either, so their wings rest
        if(vertUV.z==0.0){

            float flying=(del.y>0.999||instance_pos.w>2.5)?0.0:1.0;
            float side=sign(vp.x);
            float a=(0.2+0.62*sin(time*48.0+float(gl_InstanceID)*2.4)*flying)*side;
            vec2 root=vec2(side*0.1,0.21);
            vec2 r=vp.xy-root;

            vp.xy=root+vec2(r.x*cos(a)-r.y*sin(a),r.x*sin(a)+r.y*cos(a));
        }

        vp*=instance_pos.w;
        
        float pitch=asin(-del.y)*0.5;
        float yaw=atan(del.x,del.z)*0.5;
        float roll=instance_rotation.w*0.5;
        
        vec3 s=vec3(sin(pitch),sin(yaw),sin(roll));
        vec3 c=vec3(cos(pitch),cos(yaw),cos(roll));
        
        vec4 quaternion=vec4(s.x*c.y,c.x*s.y,-s.x*s.y,c.x*c.y);
        
        quaternion=vec4(quaternion.x*c.z+quaternion.y*s.z,quaternion.y*c.z-quaternion.x*s.z,quaternion.z*c.z+quaternion.w*s.z,(quaternion.w*c.z-quaternion.z*s.z)*2.0);
        
        vec3 u=vec3(quaternion.y*vp.z-quaternion.z*vp.y,quaternion.z*vp.x-quaternion.x*vp.z,quaternion.x*vp.y-quaternion.y*vp.x);
        
        vec3 uu=vec3(quaternion.y*u.z-quaternion.z*u.y,quaternion.z*u.x-quaternion.x*u.z,quaternion.x*u.y-quaternion.y*u.x);

        pixWorld=vp+u*quaternion.w+uu*2.0+instance_pos.xyz;
        
        vec4 pos=viewMatrix*vec4(pixWorld,1);

        BEESMAS{
            pixFog=smoothstep(-30.0,130.0,EXTRAFOGpos.z);
        }ELSE{
            pixFog=smoothstep(20.0,120.0,EXTRAFOGpos.z);
        }

        return pos;
    }
    
    void main(){

        pixUV=vertUV.xyz+vec3(instance_uv.xy,0);

        //for wings, the uv is the spot on the wing: x runs from the root to the tip, y across it
        wingUV=vertUV.xy;

        //gifted bees use the lower half of the texture
        gifted=instance_uv.y>0.36?1.0:0.0;

        gl_Position=instance_uv.z!=vertUV.w&&vertUV.w!=0.0?vec4(9999999,9999999,9999999,1):computePos();
    }
`

window.glsl_bee_geometry_vsh_LOW = `#version 300 es

    precision highp float;
    
    in vec3 vertPos;
    in vec4 vertUV;
    
    in vec4 instance_pos;
    in vec4 instance_rotation;
    in vec3 instance_uv;
    
    out vec3 pixUV;
    
    uniform mat4 viewMatrix;

    vec4 computePos(){

        vec3 vp=vertPos*instance_pos.w;

        vec3 del=normalize(instance_rotation.xyz);
        
        float pitch=asin(-del.y)*0.5;
        float yaw=atan(del.x,del.z)*0.5;
        float roll=instance_rotation.w*0.5;
        
        vec3 s=vec3(sin(pitch),sin(yaw),sin(roll));
        vec3 c=vec3(cos(pitch),cos(yaw),cos(roll));
        
        vec4 quaternion=vec4(s.x*c.y,c.x*s.y,-s.x*s.y,c.x*c.y);
        
        quaternion=vec4(quaternion.x*c.z+quaternion.y*s.z,quaternion.y*c.z-quaternion.x*s.z,quaternion.z*c.z+quaternion.w*s.z,(quaternion.w*c.z-quaternion.z*s.z)*2.0);
        
        vec3 u=vec3(quaternion.y*vp.z-quaternion.z*vp.y,quaternion.z*vp.x-quaternion.x*vp.z,quaternion.x*vp.y-quaternion.y*vp.x);
        
        vec3 uu=vec3(quaternion.y*u.z-quaternion.z*u.y,quaternion.z*u.x-quaternion.x*u.z,quaternion.x*u.y-quaternion.y*u.x);
        
        vec4 pos=viewMatrix*vec4(vp+u*quaternion.w+uu*2.0+instance_pos.xyz,1);

        return pos;
    }
    
    void main(){

        pixUV=vertUV.xyz+vec3(instance_uv.xy,0);

        gl_Position=instance_uv.z!=vertUV.w&&vertUV.w!=0.0?vec4(9999999,9999999,9999999,1):computePos();
    }
`
window.glsl_bee_geometry_fsh = `#version 300 es
    
    precision highp float;
    
    in vec3 pixUV;
    in float pixFog;
    in vec3 pixWorld;
    in vec2 wingUV;
    in float gifted;
    
    out vec4 fragColor;
    
    uniform sampler2D tex;
    uniform float isNight;
    uniform float time;
    uniform vec3 camPos;
    
    void main(){

        BEESMAS{
            vec3 fog=FOGCOLB;
        }ELSE{
            vec3 fog=FOGCOL;
        }

        if(pixUV.z>0.1){

            vec3 c=texture(tex,pixUV.xy).rgb*pixUV.z;

            //parts with a shade above 1 glow on their own. Everything else is lit
            if(pixUV.z<1.5){

                //the mesh has no normals, so each face's normal comes from how its position changes across the screen
                vec3 n=cross(dFdx(pixWorld),dFdy(pixWorld));
                float len=length(n);
                vec3 toCam=normalize(camPos-pixWorld);

                n=len>0.0?n/len:toCam;

                if(dot(n,toCam)<0.0) n=-n;

                vec3 light=normalize(LIGHT_DIR);
                float diffuse=max(dot(n,light),0.0);
                float specular=pow(max(dot(n,normalize(light+toCam)),0.0),20.0);
                float rim=pow(1.0-max(dot(n,toCam),0.0),3.0);

                c=c*(0.8+0.32*diffuse)+specular*0.2+rim*vec3(0.2,0.18,0.12);

                //bands of golden light run down gifted bees
                c+=gifted*vec3(1.0,0.8,0.25)*0.22*pow(0.5+0.5*sin(time*4.0-pixWorld.y*9.0-pixWorld.x*5.0),6.0);
            }

            fragColor=vec4(mix(c,fog,pixFog)*isNight,1);

        } else {

            //wings: see-through, with veins and a sheen that travels from root to tip. Gifted bees have golden wings
            float vein=1.0-smoothstep(0.0,0.09,abs(fract(wingUV.y*1.6+wingUV.x*1.3)-0.5));
            vec3 c=mix(vec3(0.82,0.93,1.0),vec3(1.0,0.86,0.42),gifted*0.65);

            //the front and back edges are thicker, which outlines the wing
            float edge=smoothstep(0.72,1.0,abs(wingUV.y));

            c=mix(c,c*0.5,max(vein*0.55,edge*0.7));
            c+=0.28*pow(0.5+0.5*sin(wingUV.x*9.0-time*3.0),4.0);

            fragColor=vec4(mix(c,fog,pixFog*0.4)*isNight,mix(0.66,0.36,wingUV.x)+vein*0.18+edge*0.25);
        }
    }
`
window.glsl_bee_geometry_fsh_LOW = `#version 300 es
    
    precision highp float;
    
    in vec3 pixUV;
    in float pixFog;
    
    out vec4 fragColor;
    
    uniform sampler2D tex;
    uniform float isNight;
    
    void main(){
        fragColor=pixUV.z>0.1?vec4(texture(tex,pixUV.xy).rgb*pixUV.z*isNight,1):vec4(vec3(0.1,0.4,1)*isNight,0.4);
    }
`

window.glsl_particle_renderer_vsh = `#version 300 es
    
    precision highp float;
    
    uniform mat4 viewMatrix;
    
    in vec3 vertPos;
    in vec4 vertColor;
    in float vertSize;
    in float vertRot;
    
    out float particleSize;
    out vec2 particlePos;
    out vec4 pixColor;
    out vec2 particleRot;
    
    void main(){
        
        vec4 pos=viewMatrix*vec4(vertPos,1);
        pixColor=vertColor;
        particlePos=pos.xy/pos.w;
        gl_Position=pos;
        float projSize=(vertSize/pos.z)*SCREEN_CHANGE;
        gl_PointSize=projSize;
        particleSize=projSize*0.5;
        particleRot=vec2(sin(vertRot),cos(vertRot));
        
    }
`

window.glsl_particle_renderer_fsh = `#version 300 es
    
    precision highp float;
    
    in float particleSize;
    in vec2 particlePos;
    in vec4 pixColor;
    in vec2 particleRot;
    
    out vec4 fragColor;
    
    void main(){
        
        vec2 ssPos=(gl_FragCoord.xy-vec2(HALF_WIDTH,HALF_HEIGHT))*vec2(INV_HALF_WIDTH,INV_HALF_HEIGHT);
        
        vec2 del=particlePos-ssPos;
        
        del.x*=ASPECT;
        
        del=vec2(
            
            del.x*particleRot.x-del.y*particleRot.y,
            del.x*particleRot.y+del.y*particleRot.x
            
        );
        
        //0 at the middle of the particle, 1 at its edge
        float d=(abs(del.x)+abs(del.y))/(particleSize*INV_AVG_HALF_WIDTH_HEIGHT);

        if(d>1.0)
            discard;

        //a bright core that fades out toward a soft edge
        float core=1.0-d;

        fragColor=vec4(pixColor.rgb*(1.0+core*core*0.6),pixColor.a*smoothstep(1.0,0.62,d));
    }
`

window.glsl_explosion_renderer_vsh = `#version 300 es

    precision highp float;
    
    in vec3 vertPos;
    
    in vec3 instance_pos;
    in vec4 instance_color;
    in vec2 instance_scale;
    
    out vec4 pixColor;
    out vec3 pixNormal;
    out vec3 pixWorld;
    
    uniform mat4 viewMatrix;
    
    void main(){
        
        pixColor=instance_color;

        //the sphere mesh is centered on the origin, so a vertex's position is also its normal
        pixNormal=vertPos;
        pixWorld=vertPos*instance_scale.x*vec3(1,instance_scale.y,1)+instance_pos;

        gl_Position=viewMatrix*vec4(pixWorld,1);
    }
`
window.glsl_explosion_renderer_fsh = `#version 300 es
    
    precision highp float;
    
    in vec4 pixColor;
    in vec3 pixNormal;
    in vec3 pixWorld;
    
    out vec4 fragColor;

    uniform vec3 camPos;

    //1 while spheres are drawn, 0 for the flat discs and columns that share this shader (those stay unlit)
    uniform float isSphere;
    
    void main(){

        if(isSphere<0.5){

            fragColor=pixColor;
            return;
        }

        vec3 n=normalize(pixNormal);
        vec3 toCam=normalize(camPos-pixWorld);
        float facing=abs(dot(n,toCam));

        if(pixColor.a>=0.99){

            //solid spheres (eggs, balloons, clouds) are lit from above and get a highlight
            vec3 light=normalize(LIGHT_DIR);
            float specular=pow(max(dot(n,normalize(light+toCam)),0.0),30.0)*max(pixColor.r,max(pixColor.g,pixColor.b));

            fragColor=vec4(pixColor.rgb*(0.8+0.28*max(dot(n,light),0.0))+specular*0.2,pixColor.a);

        } else {

            //see-through spheres (bubbles, auras, blasts) are thin in the middle and bright along their outline, like a soap bubble
            float edge=1.0-facing;

            fragColor=vec4(pixColor.rgb+edge*edge*edge*0.4,clamp(pixColor.a*(0.5+1.2*edge*edge),0.0,1.0));
        }
    }
`
window.glsl_text_renderer_vsh = `#version 300 es
    
    precision highp float;
    
    uniform mat4 viewMatrix;
    
    in vec2 vertPos;
    in vec2 vertUV;
    
    in vec3 instance_origin;
    in vec2 instance_offset;
    in vec2 instance_uv;
    in vec3 instance_color;
    in vec3 instance_info;
    
    out vec3 pixColor;
    out vec2 pixUV;
    out float fogAmount;
    
    void main(){
        
        pixUV=vertUV+instance_uv;
        
        vec4 originPos=viewMatrix*vec4(instance_origin,1);
        
        float s=sin(instance_info.z);
        float c=cos(instance_info.z);
        
        vec2 vp=(vertPos+instance_offset)*instance_info.xy;
        
        vp=vec2((vp.x*c-vp.y*s)*INV_ASPECT,vp.x*s+vp.y*c);
        
        vec4 pos=originPos+vec4(vp,0,0);
        
        gl_Position=pos.w<1.0&&pos.w>0.0?vec4(pos.xyz,1.0):pos;

        pixColor=instance_color;
        BEESMAS{
            fogAmount=smoothstep(-30.0,130.0,EXTRAFOGoriginPos.z);
        }ELSE{
            fogAmount=smoothstep(20.0,120.0,EXTRAFOGoriginPos.z);
        }
    }
`
window.glsl_text_renderer_fsh = `#version 300 es
    
    precision highp float;
    
    uniform sampler2D tex;
    
    in vec2 pixUV;
    in vec3 pixColor;
    in float fogAmount;
    
    out vec4 fragColor;
    
    void main(){

        vec4 c=texture(tex,pixUV);
        BEESMAS{
            vec3 col=mix(c.xyz,FOGCOLB,fogAmount)*pixColor;
        }ELSE{
            vec3 col=mix(c.xyz,FOGCOL,fogAmount)*pixColor;
        }

        if(c.a<0.01)
            discard;

        fragColor=vec4(col,c.a);
    }
`

window.glsl_text_renderer_fsh_LOW = `#version 300 es
    
    precision highp float;
    
    uniform sampler2D tex;
    
    in vec2 pixUV;
    in vec3 pixColor;
    
    out vec4 fragColor;
    
    void main(){

        vec4 c=texture(tex,pixUV);
        if(c.a<0.01)
            discard;

        fragColor=vec4(c.xyz*pixColor,c.a);
    }
`
window.glsl_mob_renderer_vsh = `#version 300 es

    precision highp float;
    
    in vec3 vertPos;
    in vec3 vertColor;
    
    out vec4 pixColor;
    out vec3 pixWorld;
    
    uniform mat4 viewMatrix;
    uniform vec4 instance_info1;
    uniform vec2 instance_info2;
    uniform float isNight;

    //walk cycle: x is the phase, y how far the legs swing (0 leaves the mesh alone), z the height below which a vertex is
    //part of a leg, and w how far from the middle (sideways) a vertex has to be to count as a leg
    uniform vec4 mobAnim;
    uniform float mobAnimZ;
    
    void main(){
        
        pixColor=vec4(vertColor*isNight,instance_info2.y);
        
        float s=sin(instance_info1.w);
        float c=cos(instance_info1.w);

        vec3 p=vertPos;

        if(mobAnim.y>0.0&&p.y<mobAnim.z&&abs(p.x)>mobAnim.w){

            //legs on opposite sides step out of phase, and mobAnimZ staggers the legs along one side like a tripod gait
            float k=mobAnim.z-p.y,ph=mobAnim.x+(p.x>0.0?0.0:3.14159)+p.z*mobAnimZ;

            p.z+=sin(ph)*k*mobAnim.y;
            p.y+=max(cos(ph),0.0)*k*mobAnim.y*0.3;
        }

        pixWorld=vec3(p.x*c-p.z*s,p.y,p.x*s+p.z*c)*instance_info2.x+instance_info1.xyz;
        
        gl_Position=viewMatrix*vec4(pixWorld,1);
    }
`
window.glsl_mob_renderer_fsh = `#version 300 es
    
    precision highp float;
    
    in vec4 pixColor;
    in vec3 pixWorld;
    
    out vec4 fragColor;

    uniform vec3 camPos;
    
    void main(){

        //mob meshes have no normals, so each face's normal comes from how its position changes across the screen
        vec3 n=cross(dFdx(pixWorld),dFdy(pixWorld));
        float len=length(n);
        vec3 toCam=normalize(camPos-pixWorld);

        n=len>0.0?n/len:toCam;

        if(dot(n,toCam)<0.0) n=-n;

        vec3 light=normalize(LIGHT_DIR);
        float rim=pow(1.0-max(dot(n,toCam),0.0),3.0);

        fragColor=vec4(pixColor.rgb*(0.84+0.3*max(dot(n,light),0.0))+rim*0.1*max(pixColor.r,max(pixColor.g,pixColor.b)),pixColor.a);
    }
`
window.glsl_trail_renderer_vsh = `#version 300 es

    precision highp float;
    
    in vec3 vertPos;
    in vec4 vertCol;
    
    out vec4 pixColor;
    
    uniform mat4 viewMatrix;
    uniform float isNight;
    
    void main(){
        
        pixColor=vec4(vertCol.xyz*isNight,vertCol.w);
        gl_Position=viewMatrix*vec4(vertPos,1);
    }
`
window.glsl_trail_renderer_fsh = `#version 300 es
    
    precision highp float;
    
    in vec4 pixColor;
    
    out vec4 fragColor;
    
    void main(){
        
        fragColor=pixColor;
    }
`
})()
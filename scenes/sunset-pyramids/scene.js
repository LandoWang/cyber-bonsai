(()=>{
'use strict';
const T=THREE,$=id=>document.getElementById(id),TAU=Math.PI*2;
let seed=8413;const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;},pick=a=>a[Math.floor(rnd()*a.length)],mix=T.MathUtils.lerp;
const scene=new T.Scene();
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.outputColorSpace=T.SRGBColorSpace;
$('world').appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','夕阳下的金字塔与湖泊，可拖动旋转');
const camera=new T.PerspectiveCamera(46,innerWidth/innerHeight,.15,850);
const hemi=new T.HemisphereLight(0xf9c5a3,0x453952,1.55);scene.add(hemi);
const sunLight=new T.DirectionalLight(0xffb561,4.5);sunLight.position.set(-42,25,-28);sunLight.castShadow=true;sunLight.shadow.mapSize.set(2048,2048);Object.assign(sunLight.shadow.camera,{left:-50,right:50,top:45,bottom:-35,near:.2,far:170});sunLight.shadow.normalBias=.08;sunLight.shadow.bias=-.0003;scene.add(sunLight);
const fill=new T.DirectionalLight(0xc8b0be,1.15);fill.position.set(25,10,35);scene.add(fill);
const skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,toneMapped:false,uniforms:{uDusk:{value:.45}},vertexShader:'varying vec3 vWorld;void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 vWorld;uniform float uDusk;void main(){vec3 ray=normalize(vWorld-cameraPosition);float h=ray.y;vec3 horizon=mix(vec3(1.,.52,.25),vec3(.79,.32,.33),uDusk);vec3 middle=mix(vec3(.80,.34,.32),vec3(.35,.24,.39),uDusk);vec3 top=mix(vec3(.20,.23,.37),vec3(.055,.10,.20),uDusk);vec3 col=mix(horizon,middle,smoothstep(-.04,.15,h));col=mix(col,top,smoothstep(.06,.36,h));col+=vec3(.12,.05,.025)*exp(-abs(h-.018)*17.);gl_FragColor=vec4(pow(col,vec3(2.2)),1.);\n#include <colorspace_fragment>\n}`});
const sky=new T.Mesh(new T.SphereGeometry(600,40,24),skyMat);scene.add(sky);
// A low pixel-edged sun, with colored horizontal bands inside a luminous disk.
const sun=new T.Group();sun.position.set(-44,13,-86);scene.add(sun);
const sunMat=new T.MeshBasicMaterial({toneMapped:false});
const box=new T.BoxGeometry(1,1,1),dummy=new T.Object3D();let voxelCount=0;
const stone=new T.MeshStandardMaterial({roughness:.95,metalness:.025}),gold=new T.MeshStandardMaterial({roughness:.5,metalness:.45}),foliage=new T.MeshStandardMaterial({roughness:.95}),dark=new T.MeshStandardMaterial({roughness:.88}),lamp=new T.MeshStandardMaterial({emissive:0xff9d3d,emissiveIntensity:2.7,roughness:.5});
class Batch{constructor(parent=scene){this.parent=parent;this.items=new Map();}box(x,y,z,w,h,d,c,mat=stone,rot=null){if(!this.items.has(mat))this.items.set(mat,[]);this.items.get(mat).push({x,y,z,w,h,d,c,rot});}finish(){for(const [mat,items]of this.items){const m=new T.InstancedMesh(box,mat,items.length);m.castShadow=mat!==sunMat;m.receiveShadow=mat!==sunMat;items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.w,v.h,v.d);dummy.quaternion.identity();if(v.rot instanceof T.Quaternion)dummy.quaternion.copy(v.rot);else if(v.rot)dummy.rotation.set(...v.rot);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);m.setColorAt(i,new T.Color(v.c));});m.computeBoundingSphere();this.parent.add(m);voxelCount+=items.length;}this.items.clear();}}
const sunB=new Batch(sun);for(let y=-15;y<=15;y+=.34){let half=Math.sqrt(Math.max(0,225-y*y));const c=new T.Color().lerpColors(new T.Color('#ff6941'),new T.Color('#ffe6a0'),(y+15)/30);sunB.box(0,y,0,half*2,.342,.2,c,sunMat);}sunB.finish();
// Soft glow around the disk is mathematical, with no downloaded textures.
const halo=new T.Mesh(new T.PlaneGeometry(63,63),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{strength:{value:.36}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float strength;void main(){float r=length(vUv-.5)*2.;float a=exp(-r*r*5.)*smoothstep(.48,.60,r);gl_FragColor=vec4(1.,.24,.04,a*strength);}'}));sun.add(halo);halo.position.z=-.2;
function coast(x){return 9.8+Math.cos(x*.1)*3.8+Math.sin(x*.37)*1.1;}
const land=new Batch(),details=new Batch();
const sands=[0xc59d68,0xc79f69,0xc7a06b,0xc7a068,0xc8a06a,0xc59d68];
for(let x=-57;x<=53;x+=1.05)for(let z=-62;z<=17;z+=1.05){const shore=coast(x);if(z>shore)continue;const far=Math.max(0,(-z-22)/35),h=.62+far*(1.6+Math.sin(x*.12+z*.08)*1.5+Math.sin(z*.22)*.7);land.box(x,(h-1.4)/2,z,1.065,h+1.4,1.065,pick(z>shore-2?[0xb79266,0xad8f67,0xc9a56f]:sands));}
// Submerged sand shelves soften the transition into the lake.
const shelfMat=new T.MeshStandardMaterial({color:0x77978c,transparent:true,opacity:.68,roughness:.65});
for(let x=-56;x<54;x+=1.05){const z=coast(x);land.box(x,-.12,z+1.1,1.075,.16,2.4,0xc3b887,shelfMat);}
// Far dunes are broad terraced voxel masses, with deliberate silhouettes.
for(const [cx,cz,rx,rz,h]of[[-38,-45,18,10,8],[20,-48,22,12,9],[43,-30,14,13,6],[-55,-21,13,9,5]]){
 for(let x=-rx;x<rx;x+=1.45)for(let z=-rz;z<rz;z+=1.45){let q=(x/rx)**2+(z/rz)**2;if(q>1)continue;let y=.8+h*Math.pow(1-q,1.4);land.box(cx+x,(y+.6)/2,cz+z,1.47,y-.6,1.47,pick(sands));}}
land.finish();
function beam(b,a,c,w,d,col,mat=stone){const va=new T.Vector3(...a),vc=new T.Vector3(...c),v=vc.clone().sub(va),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()),p=va.add(vc).multiplyScalar(.5);b.box(p.x,p.y,p.z,w,v.length(),d,col,mat,q);}
function line(b,a,c,s,col,mat=stone){const av=new T.Vector3(...a),cv=new T.Vector3(...c),n=Math.ceil(av.distanceTo(cv)/(s*.85));for(let i=0;i<=n;i++){const p=av.clone().lerp(cv,i/n);b.box(p.x,p.y,p.z,s,s,s,col,mat);}}
// Every visible stone is a separate small rectangular voxel with staggered joints.
const pyramids=[];
function pyramid(cx,cz,half,height,levels){const b=new Batch(),base=.64,dy=height/levels;
 for(let j=0;j<levels;j++){const r=half*(1-j/levels),y=base+(j+.5)*dy,step=.58;const count=Math.max(1,Math.ceil(2*r/step)),unit=2*r/count;
  b.box(cx,y,cz,Math.max(.04,2*r-.25),dy+.01,Math.max(.04,2*r-.25),0xc7a16c);
  for(let k=0;k<count;k++){const p=-r+(k+.5)*unit,c=pick([0xc49c62,0xc7a066,0xd2ab72,0xbf965f,0xd0a970,0xcaa36b]);
   for(const s of [-1,1]){b.box(cx+p,y,cz+s*(r-.13),unit-.015,dy-.027,.28,c,j>levels-4?gold:stone);b.box(cx+s*(r-.13),y,cz+p,.28,dy-.027,unit-.015,c,j>levels-4?gold:stone);}
  }
 }
 // Thin gold joints articulate the pyramidion without changing the silhouette.
 b.box(cx,base+height+.055,cz,.22,.18,.22,0xf0c06e,gold);
 if(height>10){const front=cz+half;for(let i=0;i<8;i++){b.box(cx,base+.09+i*.11,front+3-i*.29,1.5+i*.035,.18,.42,0xcda773);}
  b.box(cx,base+1.83,front-.90,1.37,2.5,.12,0x3c3035,dark);b.box(cx,base+3.05,front-1.35,1.4,.29,.44,0xd6b17c);
  for(const s of [-1,1])for(let j=0;j<6;j++)b.box(cx+s*.87,base+.21+j*.44,front-.48-j*.115,.3,.42,.48,0xd2ac77);
  for(let j=0;j<5;j++){b.box(cx+(j-2)*.18,base+3.12+(.45-Math.abs(j-2)*.19),front-1.3,.2,.27,.3,0xe2bd83);}
 }
 b.finish();pyramids.push({x:cx,z:cz,h:height});}
pyramid(-4,-3,10.1,15.4,38);pyramid(-21,-20,7.5,10.7,28);pyramid(13,-23,5.4,7.8,23);
// A ruined lakeside colonnade makes the space feel inhabited by history.
function column(x,z,broken=false){const base=.65;details.box(x,base+.13,z,1.24,.27,1.24,0xbca179);details.box(x,base+.37,z,1.0,.22,1.0,0xe0bd85);
 const n=broken?6:13;for(let i=0;i<n;i++){const y=base+.62+i*.22;details.box(x,y,z,.64,.2,.64,pick([0xc5a271,0xd8b580,0xcdaa76]));for(const s of [-1,1])details.box(x+s*.335,y,z,.06,.19,.19,0xa98a63);}
 if(!broken){details.box(x,base+3.48,z,.93,.29,.93,0xc7a372);details.box(x,base+3.72,z,1.17,.18,1.17,0xe2bd87);details.box(x,base+3.91,z,1.36,.18,1.28,0xcfa974);}}
for(const x of [12,15.2,18.4])for(const z of [2.5,5.7])column(x,z,x===18.4&&z===5.7);
details.box(15.2,4.72,2.5,7.8,.36,1.42,0xcaa16b);details.box(12,4.72,4.1,1.42,.36,4.62,0xd7b27e);
for(let k=0;k<5;k++)details.box(20+(rnd()-.5)*2,.83,5+(rnd()-.5)*3,.7+rnd()*.5,.34,.64,pick(sands),stone,[0,rnd()*2,0]);
// An obelisk on a low platform, with miniature incised bands.
const ox=-16,oz=3;details.box(ox,.91,oz,1.6,.52,1.6,0xc7a779);for(let j=0;j<21;j++){const t=j/20,w=.67-.24*t;details.box(ox,1.26+j*.22,oz,w,.235,w,0xcaa671);if(j%3===0)details.box(ox,1.29+j*.22,oz+w/2+.008,w*.37,.052,.025,0x8b714f);}for(let j=0;j<6;j++)details.box(ox,5.93+j*.12,oz,.43-j*.063,.14,.43-j*.063,0xe3bd75,gold);
// Stone landing, mooring poles and a warm lantern near the lake.
for(let i=0;i<12;i++){const z=12+i*.36;details.box(-.7,.2,z,2.15,.19,.33,0x95745b);for(const x of [-1.55,.15])if(i%5===0)details.box(x,.13,z,.12,1.08,.12,0x665548);}
for(const x of [-1.7,.3]){details.box(x,.61,12.1,.15,.68,.15,0x786044);details.box(x,.99,12.1,.28,.2,.28,0xffbc67,lamp);}
for(let j=0;j<13;j++){const z=9.0+j*.25;details.box(-4+Math.sin(j*.21)*.8,.68,z,.36,.055,.18,0x9d815d,stone,[0,.3,0]);details.box(-3.5+Math.sin(j*.21)*.8,.68,z+.1,.36,.055,.18,0x9d815d,stone,[0,.3,0]);}
const palmCrowns=[];
function palm(cx,cz,h,tilt=.6){const b=new Batch(),base=.65;
 for(let i=0;i<25;i++){const t=i/24,x=cx+tilt*t*t,z=cz+.15*Math.sin(t*2);b.box(x,base+t*h,z,.22-.06*t,.24,.22-.06*t,pick([0x886447,0x9f7750,0xab8258]));if(i%3===0)b.box(x,base+t*h+.09,z,.25,.055,.25,0xb19161);}
 const top=new T.Vector3(cx+tilt,base+h,cz+.15*Math.sin(2));palmCrowns.push(top);
 for(let k=0;k<10;k++){const a=k/10*TAU+.2,L=2.4+rnd()*.6;for(let i=0;i<16;i++){const t=i/15,r=t*L,p=top.clone().add(new T.Vector3(Math.cos(a)*r,.52*Math.sin(t*Math.PI)-t*t*.85,Math.sin(a)*r));
  b.box(p.x,p.y,p.z,.13,.10,.13,0x8b9856,foliage);
  const width=Math.sin(t*Math.PI)*.42;for(const s of [-1,1]){const e=p.clone().add(new T.Vector3(Math.cos(a+.9*s)*width,-.055,Math.sin(a+.9*s)*width));line(b,p.toArray(),e.toArray(),.095,pick([0x49684b,0x5e7b50,0x718b52,0x7c935b]),foliage);}}
 }
 for(let i=0;i<5;i++)b.box(top.x+(rnd()-.5)*.38,top.y-.12,top.z+(rnd()-.5)*.38,.18,.2,.18,0x786343);b.finish();}
palm(21,8,5.2,.7);palm(24,7.3,6.1,-.5);palm(26,6,4.3,.5);palm(-22,7,5.9,.8);palm(-25,6,4.7,-.7);palm(7,9.9,3.7,.25);
// Reed clusters grow at the waterline, mixed with stones and small desert shrubs.
for(const [x,z]of[[-11,12],[-13,11.6],[5,13],[28,10.5],[23,11],[-29,7]]){
 for(let i=0;i<12;i++){const xx=x+(rnd()-.5)*1.3,zz=z+(rnd()-.5)*.7,h=.35+rnd()*.7;details.box(xx,.4+h/2,zz,.047,h,.047,0x626e45);details.box(xx,.4+h,zz,.085,.23,.075,0xa58852);}}
for(let i=0;i<125;i++){const x=-36+rnd()*78,z=coast(x)-.5-rnd()*3;details.box(x,.68,z,.15+rnd()*.42,.13+rnd()*.18,.15+rnd()*.42,pick([0xa28b69,0xbaa17a,0xceaf7d]),stone,[0,rnd()*3,0]);}
for(const [x,z]of[[-27,3],[28,4],[10,7],[-11,8],[31,8]])for(let i=0;i<24;i++)details.box(x+(rnd()-.5)*1.3,.7+rnd()*.38,z+(rnd()-.5)*.85,.16,.18,.16,pick([0x6c7950,0x7b8757,0x8c9460]),foliage);
details.finish();
// A real planar reflection responds to both the camera and the animated scene.
const waterShader={uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null},uTime:{value:0},uWind:{value:.55}},vertexShader:`uniform mat4 textureMatrix;varying vec4 vUv;varying vec3 vWorld;void main(){vUv=textureMatrix*vec4(position,1.);vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D tDiffuse;uniform float uTime;uniform float uWind;varying vec4 vUv;varying vec3 vWorld;void main(){vec2 uv=vUv.xy/vUv.w;float wave=sin(vWorld.z*2.4+uTime*.8)+sin(vWorld.z*4.7+vWorld.x*.33-uTime*.6)*.45;uv.x+=wave*.00085*uWind;uv.y+=sin(vWorld.x*.6+vWorld.z*3.1+uTime*.45)*.00045*uWind;vec3 reflected=texture2D(tDiffuse,uv).rgb;float f=pow(1.-clamp(dot(normalize(cameraPosition-vWorld),vec3(0.,1.,0.)),0.,1.),2.);vec3 deep=vec3(.012,.045,.065);vec3 col=mix(deep,reflected,.43+f*.30);float ripple=pow(max(0.,sin(vWorld.z*3.7+vWorld.x*.25+uTime*.65)),16.);col+=vec3(.018,.023,.025)*ripple*uWind;gl_FragColor=vec4(col,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`.replace(';#include',';\n#include')};
const lake=new Reflector(new T.PlaneGeometry(480,480),{textureWidth:1024,textureHeight:1024,clipBias:.002,multisample:0,shader:waterShader});lake.rotation.x=-Math.PI/2;lake.position.y=.015;scene.add(lake);
// Fine broken lines catch the moving light along the shoreline.
const rippleMat=new T.MeshBasicMaterial({color:0xd5b179,transparent:true,opacity:.17,depthWrite:false,toneMapped:false});const ripples=new T.Group();scene.add(ripples);const rb=new Batch(ripples);
for(let i=0;i<210;i++){const x=-47+rnd()*94,z=coast(x)+1+rnd()*21;rb.box(x,.043,z,.18+rnd()*1.5,.01,.025,0xffffff,rippleMat);}rb.finish();
// A single lateen sailboat crosses the reflected sky.
const boat=new T.Group();boat.position.set(10,.18,22);boat.rotation.y=-.3;scene.add(boat);const bb=new Batch(boat);
for(let j=0;j<5;j++){const y=j*.09,w=1.17-j*.11;bb.box(0,y,0,w,.10,3.1-j*.2,pick([0x715345,0x87614a,0x9c7452]));}
bb.box(0,.43,0,.84,.1,2.65,0xc5a479);bb.box(0,2.04,0,.095,3.3,.095,0x735747);beam(bb,[0,3.42,-1.44],[0,2.52,1.45],.07,.07,0x997959);
for(let j=0;j<20;j++){const t=j/20,top=3.4-t*.9,bottom=.78+t*1.0;const count=Math.ceil((top-bottom)/.125);for(let k=0;k<count;k++)bb.box(.04,bottom+k*.125,-1.38+t*2.76,.04,.125,.15,j===1||j===2?0xb6674c:pick([0xe8d5ad,0xe3cca5,0xf1dcb2]));}
line(bb,[0,3.42,-1.44],[0,.59,1.27],.025,0xbdaa83);line(bb,[0,3.45,0],[0,.51,-1.38],.022,0xbdaa83);bb.finish();
// Tiny birds glide across the open sky in a loose formation.
const birds=[];for(let i=0;i<9;i++){const g=new T.Group(),b=new Batch(g);for(const side of [-1,1])for(let k=0;k<6;k++)b.box(side*k*.055,-Math.sin(k/5*Math.PI)*.09,0,.08,.03,.04,0x503e45,dark);b.finish();scene.add(g);birds.push({g,x:-12+i*.8,y:18+Math.sin(i*.6)*.6,z:-8+i*.5,p:rnd()*TAU});}
let time=0,paused=false,auto=false,wind=.55,lightValue=.46,transition=null,viewName='all';
const target=new T.Vector3(0,4.8,-3);let radius=63,theta=.47,phi=1.34;
const presets={all:{r:63,t:.47,p:1.34,target:new T.Vector3(0,4.8,-3)},lake:{r:45,t:.23,p:1.46,target:new T.Vector3(-2,5,-2)},stone:{r:28,t:.56,p:1.20,target:new T.Vector3(-4,6,-2)}};
function setView(name){const p=presets[name];viewName=name;transition={start:performance.now(),from:{r:radius,t:theta,p:phi,target:target.clone()},to:p};document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===name);b.setAttribute('aria-pressed',String(b.dataset.view===name));});$('view-label').textContent={all:'落日全景',lake:'湖畔凝望',stone:'石阶之间'}[name];}
function setLight(value){lightValue=value;skyMat.uniforms.uDusk.value=value;sun.position.y=mix(25,-1,value);sunLight.position.y=mix(35,9,value);sunLight.intensity=mix(5.2,1.1,value);sunLight.color.setHSL(mix(.115,.035,value),.72,.68);hemi.intensity=mix(1.7,.85,value);hemi.color.lerpColors(new T.Color(0xffd0ad),new T.Color(0x969bd0),value);fill.color.set(0xffb982);fill.intensity=mix(2.4,1.1,value);$('clock').textContent='17:'+String(Math.round(20+value*39)).padStart(2,'0');$('light-state').textContent=value<.28?'金色时分':value>.78?'暮色初临':'落日余晖';}
$('time').oninput=e=>setLight(Number(e.target.value));setLight(lightValue);
function updateCamera(){const factor=Math.max(1,.98/camera.aspect);const r=radius*factor;camera.position.set(target.x+r*Math.sin(phi)*Math.sin(theta),target.y+r*Math.cos(phi),target.z+r*Math.sin(phi)*Math.cos(theta));camera.lookAt(target);sun.quaternion.copy(camera.quaternion);}
const points=new Map();let lastX=0,lastY=0,pinch=0,interaction=0;
const canvas=renderer.domElement;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY});lastX=e.clientX;lastY=e.clientY;transition=null;interaction=performance.now();});
canvas.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size===2){const a=[...points.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch)radius=T.MathUtils.clamp(radius*pinch/d,18,120);pinch=d;}else{const dx=e.clientX-lastX,dy=e.clientY-lastY;if(e.shiftKey||e.buttons===2){target.addScaledVector(new T.Vector3().setFromMatrixColumn(camera.matrix,0),-dx*radius*.001);target.y+=dy*radius*.001;}else{theta-=dx*.005;phi=T.MathUtils.clamp(phi+dy*.003,.3,1.53);}}lastX=e.clientX;lastY=e.clientY;interaction=performance.now();});
for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,e=>{points.delete(e.pointerId);pinch=0;});canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('wheel',e=>{e.preventDefault();transition=null;radius=T.MathUtils.clamp(radius*Math.exp(e.deltaY*.001),18,120);interaction=performance.now();},{passive:false});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('pause').onclick=()=>{paused=!paused;$('pause').classList.toggle('active',paused);$('pause').setAttribute('aria-pressed',String(paused));$('pause').innerHTML=paused?icons.play:icons.pause;};
$('orbit').onclick=()=>{auto=!auto;$('orbit').classList.toggle('active',auto);$('orbit').setAttribute('aria-pressed',String(auto));};
$('wind').onclick=()=>{wind=wind>.1?0:.55;$('wind').classList.toggle('active',wind<.1);$('wind').setAttribute('aria-pressed',String(wind<.1));$('water-state').textContent=wind<.1?'湖平如镜':'微风过湖';};
$('help').onclick=()=>{$('guide').hidden=!$('guide').hidden;};$('close-guide').onclick=()=>{$('guide').hidden=true;};
$('capture').onclick=()=>{renderer.render(scene,camera);const data=canvas.toDataURL('image/png');$('snapshot-image').src=data;$('snapshot-save').href=data;$('snapshot-save').download='赤沙镜湖.png';$('snapshot-panel').showModal();};$('snapshot-close').onclick=()=>$('snapshot-panel').close();
addEventListener('keydown',e=>{if(e.key==='Escape'){$('guide').hidden=true;document.body.classList.remove('clean');}if(e.key.toLowerCase()==='h')document.body.classList.toggle('clean');if(e.key.toLowerCase()==='r')setView('all');if(e.code==='Space'&&e.target===document.body){e.preventDefault();$('pause').click();}});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
$('voxel-count').textContent=(voxelCount/1000).toFixed(1)+'k';
let last=performance.now(),frames=0,start=last;
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.06,(now-last)/1000);last=now;if(!paused)time+=dt;
 if(transition){const raw=Math.min(1,(now-transition.start)/1500),t=raw*raw*(3-2*raw),a=transition.from,b=transition.to;radius=mix(a.r,b.r,t);theta=mix(a.t,b.t,t);phi=mix(a.p,b.p,t);target.lerpVectors(a.target,b.target,t);if(raw===1)transition=null;}else if(auto&&!paused&&!points.size&&now-interaction>1400)theta+=dt*.035;
 lake.material.uniforms.uTime.value=time;lake.material.uniforms.uWind.value=wind;boat.position.y=.18+Math.sin(time*.7)*.045*wind;boat.rotation.z=Math.sin(time*.5)*.017*wind;boat.position.x=10+Math.sin(time*.04)*2;
 for(const b of birds){b.g.position.set(b.x+Math.sin(time*.055+b.p)*3,b.y+Math.sin(time*.7+b.p)*.12,b.z);b.g.rotation.z=Math.sin(time*2+b.p)*.14;}
 rippleMat.opacity=.10+wind*.12;updateCamera();renderer.render(scene,camera);
 frames++;if(now-start>2000){canvas.dataset.renderStats=JSON.stringify({voxels:voxelCount,fps:Math.round(frames*1000/(now-start)),drawCalls:renderer.info.render.calls,view:viewName,paused,light:lightValue,camera:[theta,phi,radius]});frames=0;start=now;}}
$('loading').classList.add('done');setTimeout(()=>$('loading').remove(),700);requestAnimationFrame(animate);
})();

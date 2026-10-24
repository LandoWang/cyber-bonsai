(()=>{
'use strict';
const T=THREE,$=id=>document.getElementById(id),TAU=Math.PI*2,mix=T.MathUtils.lerp;
let seed=77471;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;},pick=a=>a[Math.floor(rnd()*a.length)];
const scene=new T.Scene();
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;$('world').appendChild(renderer.domElement);const canvas=renderer.domElement;canvas.setAttribute('aria-label','大雪覆盖的江南水乡，粉墙黛瓦、石桥、水巷与灯火');
const camera=new T.PerspectiveCamera(42,innerWidth/innerHeight,.1,400);
const hemi=new T.HemisphereLight(0xb6d8f4,0x374455,2.1);scene.add(hemi);const sun=new T.DirectionalLight(0xe0eafa,2.2);sun.position.set(-16,28,11);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:.2,far:90});sun.shadow.normalBias=.07;sun.shadow.bias=-.00025;scene.add(sun);const rim=new T.DirectionalLight(0x91c6ec,1.5);rim.position.set(17,15,-22);scene.add(rim);
const skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,toneMapped:false,uniforms:{night:{value:.5}},vertexShader:'varying vec3 vP;void main(){vP=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 vP;uniform float night;void main(){float h=normalize(vP-cameraPosition).y;vec3 low=mix(vec3(.35,.47,.54),vec3(.12,.22,.31),night);vec3 high=mix(vec3(.16,.26,.35),vec3(.035,.085,.16),night);vec3 c=mix(low,high,smoothstep(-.30,.8,h));gl_FragColor=vec4(pow(c,vec3(2.2)),1.);\n#include <colorspace_fragment>\n}`});scene.add(new T.Mesh(new T.SphereGeometry(220,32,20),skyMat));
const stone=new T.MeshStandardMaterial({roughness:.94,metalness:.02}),wood=new T.MeshStandardMaterial({roughness:.94}),snowMat=new T.MeshStandardMaterial({roughness:1}),roofMat=new T.MeshStandardMaterial({roughness:.9}),warmMat=new T.MeshStandardMaterial({emissive:0xffa83c,emissiveIntensity:1.8,roughness:.65}),lanternMat=new T.MeshStandardMaterial({emissive:0xff5c18,emissiveIntensity:.58,roughness:.7}),metal=new T.MeshStandardMaterial({roughness:.55,metalness:.25});
const snowColors=[0xe5edf0,0xeff3f2,0xe1eaf0,0xf2f4f0,0xeaf0f1];
const box=new T.BoxGeometry(1,1,1),dummy=new T.Object3D();let voxelCount=0;
class Batch{constructor(parent=scene){this.parent=parent;this.layers=new Map();}box(x,y,z,w,h,d,c,m=stone,rot=null){if(!this.layers.has(m))this.layers.set(m,[]);this.layers.get(m).push({x,y,z,w,h,d,c,rot});}finish(){for(const [mat,items]of this.layers){const mesh=new T.InstancedMesh(box,mat,items.length);mesh.castShadow=true;mesh.receiveShadow=true;items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.w,v.h,v.d);dummy.quaternion.identity();if(v.rot instanceof T.Quaternion)dummy.quaternion.copy(v.rot);else if(v.rot)dummy.rotation.set(...v.rot);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color(v.c));});mesh.computeBoundingSphere();this.parent.add(mesh);voxelCount+=items.length;}this.layers.clear();}}
function line(b,a,c,size,col,mat=wood){const p=new T.Vector3(...a),q=new T.Vector3(...c),n=Math.ceil(p.distanceTo(q)/(size*.8));for(let i=0;i<=n;i++){const v=p.clone().lerp(q,i/n);b.box(v.x,v.y,v.z,size,size,size,col,mat);}}
function beam(b,a,c,w,d,col,mat=wood){const p=new T.Vector3(...a),q=new T.Vector3(...c),v=q.clone().sub(p),rot=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()),mid=p.add(q).multiplyScalar(.5);b.box(mid.x,mid.y,mid.z,w,v.length(),d,col,mat,rot);}
const ground=new Batch(),detail=new Batch();
// A cutaway miniature: a continuous stone foundation carries both streets and canal.
ground.box(0,-1.35,0,39.5,.6,35.5,0x344b54);ground.box(0,-.97,0,39.25,.18,35.25,0x56696c);
function channel(z){return .65*Math.sin(z*.12);}
for(let x=-19.25;x<=19.25;x+=.5)for(let z=-17.25;z<=17.25;z+=.5){if(Math.abs(x-channel(z))<3.45)continue;ground.box(x,.0,z,.505,1.72,.505,pick([0x65787c,0x708285,0x5a7076,0x829094]));ground.box(x,.935,z,.514,.19,.514,pick(snowColors),snowMat);}
// Individually laid canal retaining stones, with a soft snowy coping.
for(const s of [-1,1])for(let z=-17.3;z<17.5;z+=.39){const x=channel(z)+s*3.5;for(let j=0;j<4;j++)ground.box(x,-.38+j*.34,z,.32,.31,.375,pick([0x819197,0x6e838b,0x95a1a4]));ground.box(x,.99,z,.5,.22,.405,0xeaf0f2,snowMat);}
// Sheltered blue-grey paving leaves a plausible route through the snow.
for(const s of [-1,1])for(let z=-16.7;z<17;z+=.56){const x=channel(z)+s*5.18;for(let j=0;j<2;j++){ground.box(x+s*j*.44,1.039,z,.40,.035,.47,pick([0xa8b5bb,0xb5c0c4,0xc2cbd0]));if(rnd()>.64)ground.box(x+s*j*.44,1.063,z+.09,.24,.027,.2,0xe9f0f3,snowMat);}}
ground.finish();
const lamps=[],houseRoofs=[];
function lantern(b,x,y,z,scale=1){b.box(x,y+.46*scale,z,.026,.37*scale,.026,0x574134,wood);for(let i=-2;i<=2;i++){const w=(.30-.037*Math.abs(i))*scale;b.box(x,y+i*.075*scale,z,w,.082*scale,w,pick([0xad4837,0xb8513d,0xc15c43]),lanternMat);}for(const dy of [-.215,.215])b.box(x,y+dy*scale,z,.20*scale,.046*scale,.20*scale,0xd8ac60,metal);b.box(x,y-.34*scale,z,.035,.20*scale,.035,0xb55f43,wood);}
function plaque(parent,text,x,y,z,w,h){const c=document.createElement('canvas');c.width=512;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#342f2d';ctx.fillRect(0,0,512,160);ctx.strokeStyle='#ad9062';ctx.lineWidth=7;ctx.strokeRect(10,10,492,140);ctx.font='62px "Songti SC", "STSong", serif';ctx.fillStyle='#decaa0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,83);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,roughness:.9}));m.position.set(x,y,z);parent.add(m);}
function house(cx,cz,w,d,h,angle,title,stories=1){const group=new T.Group();group.position.set(cx,1.03,cz);group.rotation.y=angle;scene.add(group);const b=new Batch(group),rise=w>.0?1.55:1.4;
 const plaster=[0xd9ddd6,0xd8dcd4,0xe1e1d9,0xd4d9d2];
 // Solid walls, cut by dark wooden window assemblies and a deep entrance.
 b.box(0,h/2,0,w,h,d,pick(plaster));b.box(0,.24,0,w+.12,.45,d+.12,0x5c6c70);b.box(0,h-.09,d/2+.04,w+.08,.14,.12,0x4b4741,wood);
 for(const side of [-1,1])b.box(side*(w/2-.12),h/2,d/2+.08,.18,h,.16,0x57514a,wood);
 b.box(0,1.2,d/2+.052,1.0,2.15,.09,0x3e4341,wood);b.box(0,.08,d/2+.32,1.42,.16,.58,0x899699);b.box(0,.2,d/2+.14,1.25,.14,.36,0xb8c3c4);
 // Two leaves of a plank door with tiny brass handles.
 for(let i=0;i<6;i++)b.box(-.42+i*.168,1.12,d/2+.12,.147,1.92,.11,0x65574a,wood);for(const x of [-.1,.1])b.box(x,1.12,d/2+.19,.035,.075,.027,0xc49d58,metal);
 function windowAt(x,y,z,width=1.32,height=1.36){b.box(x,y,z,width+.18,height+.18,.13,0x4b4c43,wood);b.box(x,y,z+.076,width,height,.035,0xffdb96,warmMat);for(let k=-2;k<=2;k++)b.box(x+k*width/5,y,z+.105,.034,height,.04,0x63533f,wood);for(let k=-2;k<=2;k++)b.box(x,y+k*height/5,z+.108,width,.034,.04,0x63533f,wood);b.box(x,y-height/2-.12,z+.13,width+.24,.09,.34,0xd9e5e9,snowMat);}
 for(const x of [-w*.29,w*.29])windowAt(x,1.65,d/2+.09);
 if(stories===2){b.box(0,h*.53,d/2+.085,w,.2,.21,0x555149,wood);for(const x of [-w*.30,0,w*.30])windowAt(x,h*.74,d/2+.08,w*.21,1.12);}
 for(let z=-d/2+.5;z<d/2;z+=1.5){b.box(w/2+.055,1.7,z,.07,1.05,.78,0x6d736b,wood);for(let i=0;i<4;i++)b.box(w/2+.1,1.7,z-.3+i*.2,.02,.92,.029,0xbbbfae,wood);}
 // Roof: rows of charcoal tiles remain visible below thick, irregular snow.
 const half=d/2+.42,step=.22;
 for(let x=-w/2-.4;x<=w/2+.4;x+=step)for(let z=-half;z<=half;z+=step){const u=Math.abs(z)/half,y=h+rise*(1-u)+.10*Math.pow(u,5),edge=Math.abs(x)>(w/2+.13);
  b.box(x,y,z,step+.012,.14,step+.012,pick([0x39494e,0x46565b,0x2f414a,0x586569]),roofMat);
  if(rnd()>.07||u<.8)b.box(x,y+.17+(edge?.015:0),z,step+.027,.21+rnd()*.08,step+.025,pick(snowColors),snowMat);
  if(u>.94)b.box(x,y-.065,z,step*.83,.11,.065,0x2d414a,roofMat);
 }
 // A raised ridge capped in fresh snow.
 for(let x=-w/2-.5;x<=w/2+.5;x+=.24){b.box(x,h+rise+.12,0,.23,.20,.27,0x4a5b62,roofMat);b.box(x,h+rise+.29,0,.24,.18,.34,0xf0f3f0,snowMat);}
 // Horse-head firewalls rise in three stepped sections beside the tiled slopes.
 for(const s of [-1,1])for(let j=-3;j<=3;j++){const z=j*(d/7),yy=h+rise*(1-Math.abs(j)/4)+.45;b.box(s*w/2,yy/2,z,.22,yy,d/7+.02,0xdce0d9);b.box(s*w/2,yy+.04,z,.36,.16,d/7+.065,0x56666a,roofMat);b.box(s*w/2,yy+.18,z,.39,.16,d/7+.08,0xf1f4f2,snowMat);}
 // Icy drips hang from the exposed eaves.
 for(let i=0;i<18;i++){const x=(rnd()-.5)*(w+.5),hh=.09+rnd()*.28;b.box(x,h-hh/2-.08,half,.025,hh,.032,0xb7d6e2,snowMat);}
 for(const x of [-w*.39,w*.39])lantern(b,x,2.8,d/2+.40,1.25);
 if(title)plaque(group,title,0,stories===2?2.78:2.83,d/2+.21,1.68,.48);
 const light=new T.PointLight(0xffb365,4.3,8,2);const lp=new T.Vector3(0,2.1,d/2+1).applyAxisAngle(new T.Vector3(0,1,0),angle).add(group.position);light.position.copy(lp);scene.add(light);lamps.push(light);
 b.finish();houseRoofs.push({cx,cz,w,d,h:h+1.03,rise,angle});return group;}
house(-10.0,-9.2,7.1,6,5.55,Math.PI/2,'听雪茶舍',2);
house(-11.3,.9,6.0,5.3,3.7,Math.PI/2,'枕河人家');
house(-12.0,10.0,5.3,5.0,3.45,Math.PI/2,'雪庐');
house(9.1,-10.2,6.3,5.4,5.1,-Math.PI/2,'晚渡',2);
house(10.5,-1.2,5.6,5.1,3.7,-Math.PI/2,'');
house(13.3,8.4,5.5,5,3.45,-Math.PI/2,'');
// A true open stone arch: separate voussoirs surround a navigable canal opening.
const bridge=new Batch();const bz=3.0,span=10.5;
function bridgeY(x){const t=(x+span/2)/span;return 1.13+2.0*Math.sin(Math.PI*T.MathUtils.clamp(t,0,1));}
for(let i=0;i<44;i++){const x=-span/2+(i+.5)*span/44,y=bridgeY(x);bridge.box(x,y,bz,span/44+.008,.25,2.32,pick([0x7f9198,0x90a0a5,0x758b94]));bridge.box(x,y+.23,bz,span/44+.014,.22,2.39,pick(snowColors),snowMat);
 for(const s of [-1,1]){bridge.box(x,y-.24,bz+s*1.02,span/44+.02,.36,.28,0x7b929d);bridge.box(x,y+.79,bz+s*1.02,span/44+.04,.16,.23,0x9aaab0);bridge.box(x,y+.93,bz+s*1.02,span/44+.047,.16,.29,0xf1f4f2,snowMat);
  if(i%4===0){bridge.box(x,y+.52,bz+s*1.02,.11,.65,.12,0x8b9da4);bridge.box(x,y+.87,bz+s*1.02,.2,.22,.21,0xa0aeb4);bridge.box(x,y+1.04,bz+s*1.02,.24,.13,.25,0xeaf1f3,snowMat);}
 }
}
// Stepped landings join the raised arch to both riverside paths.
for(const s of [-1,1])for(let k=0;k<4;k++){bridge.box(s*(5.34+k*.3),1.02-k*.015,bz,.34,.25,2.36,0xa3afb2);bridge.box(s*(5.34+k*.3),1.16-k*.015,bz,.35,.06,2.4,0xeaf0ef,snowMat);}
for(const s of [-1,1]){bridge.box(s*4.73,.55,bz,.83,1.12,2.15,0x697f88);bridge.box(s*3.87,.46,bz,.75,.9,2.05,0x718993);}
bridge.finish();
// Small riverside stairs descend below the snowy coping to the boats.
for(const [s,z]of[[-1,10],[1,-5]])for(let j=0;j<5;j++){const x=s*(3.9-j*.29);detail.box(x,.78-j*.16,z,.38,.24,1.7,0x81959c);detail.box(x,.92-j*.16,z,.39,.05,1.71,0xdce8ec,snowMat);}
// Bare winter branches carry fine ridges of snow and a few red plum blossoms.
function tree(cx,cz,h,plum=false){const b=new Batch(),base=1.04,woodColor=plum?0x62534f:0x5d6260;line(b,[cx,base,cz],[cx+.24,base+h*.73,cz-.1],.23,woodColor);
 for(let k=0;k<7;k++){const a=k/7*TAU,r=1.15+rnd()*.8,start=[cx+.15,base+h*(.42+rnd()*.22),cz],end=[cx+Math.cos(a)*r,base+h*(.7+rnd()*.3),cz+Math.sin(a)*r];line(b,start,end,.11,woodColor);
  for(let j=0;j<3;j++){const t=.48+j*.18,p=new T.Vector3(...start).lerp(new T.Vector3(...end),t),e=p.clone().add(new T.Vector3(Math.cos(a+.8)*.65,.4+rnd()*.3,Math.sin(a+.8)*.65));line(b,p.toArray(),e.toArray(),.066,woodColor);
   for(let n=0;n<5;n++){const v=p.clone().lerp(e,n/4);b.box(v.x,v.y+.07,v.z,.12,.065,.11,0xf0f4f3,snowMat);if(plum&&rnd()>.45)b.box(v.x+.08,v.y+.1,v.z,.07,.075,.08,pick([0xb54859,0xcb6073,0xdf8490]),wood);}}
  const mid=new T.Vector3(...start).lerp(new T.Vector3(...end),.7);line(b,[mid.x,mid.y+.09,mid.z],[end[0],end[1]+.09,end[2]],.09,0xe6eff1,snowMat);
 }b.finish();}
tree(8.2,11.6,4.4,true);tree(-7.5,14.3,3.8,true);tree(15.7,-9,4.7);tree(-16.4,-4,4.9);
function bamboo(x,z){for(let i=0;i<7;i++){const bx=x+(rnd()-.5)*1.3,bz=z+(rnd()-.5),h=1.5+rnd()*1.8;for(let j=0;j<h/.24;j++){detail.box(bx,1.14+j*.24,bz,.055,.22,.055,j%3?0x607868:0x91a28a);if(j%4===0)for(const s of [-1,1]){detail.box(bx+s*.18,1.2+j*.24,bz,.35,.04,.06,0x577465,wood,[0,s*.5,s*.35]);detail.box(bx+s*.17,1.245+j*.24,bz,.26,.06,.07,0xe0eaeb,snowMat);}}}}
bamboo(-17.2,9.1);bamboo(17,1.3);
// One quiet traveler crosses the bridge beneath a red paper umbrella.
const traveler=new T.Group();traveler.position.set(-.4,bridgeY(-.4)+.36,bz);scene.add(traveler);const tb=new Batch(traveler);
for(const x of [-.09,.09])tb.box(x,.22,0,.13,.44,.17,0x3d515e,wood);tb.box(0,.6,0,.43,.53,.28,0x8e493f,wood);tb.box(0,.96,0,.21,.23,.22,0xd8b39a,wood);tb.box(.24,1.05,.08,.025,1.22,.025,0x684934,wood);
for(let x=-.63;x<=.63;x+=.085)for(let z=-.63;z<=.63;z+=.085){const r=Math.hypot(x,z);if(r>.64)continue;const y=1.44+.22*(1-r/.64);tb.box(x+.24,y,z+.08,.089,.04,.089,pick([0xa8423c,0xbb5248,0xc16352]),wood);if(rnd()>.76)tb.box(x+.24,y+.038,z+.08,.08,.04,.08,0xf0eee7,snowMat);}tb.finish();
// A small covered black boat, complete with curved canopy and a bow lantern.
const boats=[];
function boat(x,z,angle=0,scale=1){const g=new T.Group();g.position.set(x,.12,z);g.rotation.y=angle;g.scale.setScalar(scale);scene.add(g);const b=new Batch(g);
 for(let i=0;i<6;i++){const t=i/5,w=1.27-.10*i;b.box(0,.08+i*.075,0,w,.085,4.5-i*.25,pick([0x4a4b42,0x615a49,0x706550]),wood);}
 for(let zz=-1.9;zz<=1.9;zz+=.18)b.box(0,.47,zz,1.06,.085,.16,0x9b8b6a,wood);
 for(let zz=-.94;zz<=.95;zz+=.115)for(let j=0;j<17;j++){const a=j/16*Math.PI,x=Math.cos(a)*.64,y=.52+Math.sin(a)*.68;b.box(x,y,zz,.10,.10,.12,pick([0x344b51,0x42565a,0x2b434c]),roofMat);if(j>3&&j<13&&rnd()>.16)b.box(x,y+.086,zz,.108,.09,.13,pick(snowColors),snowMat);}
 for(const zz of [-1.01,1.01])for(let j=0;j<17;j++){const a=j/16*Math.PI;b.box(Math.cos(a)*.66,.52+Math.sin(a)*.68,zz,.07,.07,.09,0x8a7b61,wood);}
 b.box(0,.75,1.75,.045,.65,.045,0x5b5145,wood);lantern(b,0,1.15,1.75,.83);beam(b,[.5,.48,-1.65],[1.5,.16,-2.4],.05,.085,0x938063);b.finish();boats.push({g,x,z});return g;}
boat(-.7,11.3,.11,1.06);boat(.65,-10.7,-.12,.86);
// Footprints remain near doorways and the bridge, never across the canal.
for(const [cx,cz,n,dir]of[[-6.1,9,15,-1],[6.2,-8,14,1],[-6.0,-2,10,1]])for(let i=0;i<n;i++){const x=cx+Math.sin(i*.17)*.2+(i%2?-.1:.1),z=cz+dir*i*.23;detail.box(x,1.048,z,.09,.009,.17,0x9cafbb,snowMat,[0,.13,0]);}
// Snowy jars, wood stacks and a bench add scale to the lanes.
for(const [x,z]of[[-7.7,6.6],[7.8,-4.5],[-16,9.1]]){detail.box(x,1.32,z,.45,.5,.45,0x6d7d7c);detail.box(x,1.62,z,.44,.15,.43,0xf0f3f1,snowMat);}
for(let j=0;j<4;j++)for(let i=0;i<5-j;i++){detail.box(-16.2+i*.22+j*.1,1.16+j*.17,10.7,.19,.16,.65,0x766b56,wood);if(j===3)detail.box(-16.2+i*.22+j*.1,1.29+j*.17,10.7,.20,.1,.66,0xeaf1f1,snowMat);}
detail.box(6.5,1.58,13.8,2.0,.16,.6,0x7b7060,wood);detail.box(6.5,1.72,13.8,2.03,.16,.63,0xe8f0f1,snowMat);for(const x of [5.8,7.2])detail.box(x,1.27,13.8,.14,.5,.48,0x64645b,wood);
detail.finish();
// Real reflected buildings and lanterns shimmer inside the bounded canal.
const shader={uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null},time:{value:0}},vertexShader:'uniform mat4 textureMatrix;varying vec4 vUv;varying vec3 vWorld;void main(){vUv=textureMatrix*vec4(position,1.);vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform sampler2D tDiffuse;uniform float time;varying vec4 vUv;varying vec3 vWorld;void main(){vec2 uv=vUv.xy/vUv.w;uv.x+=sin(vWorld.z*3.3+time*.65)*.00065+sin(vWorld.x*4.1-time*.4)*.0003;vec3 reflected=texture2D(tDiffuse,uv).rgb;float f=pow(1.-clamp(dot(normalize(cameraPosition-vWorld),vec3(0.,1.,0.)),0.,1.),2.);vec3 col=mix(vec3(.018,.061,.073),reflected,.58+f*.27);gl_FragColor=vec4(col,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`};
const water=new Reflector(new T.PlaneGeometry(39.35,35.35),{textureWidth:1024,textureHeight:1024,multisample:0,clipBias:.004,shader});water.rotation.x=-Math.PI/2;water.position.y=.01;scene.add(water);
// Small drifting flakes land at roof or street height instead of passing through houses.
function surfaceAt(x,z){if(Math.abs(x)>19.7||Math.abs(z)>17.7)return -2;let h=Math.abs(x-channel(z))<3.48?.03:1.05;
 for(const r of houseRoofs){const dx=x-r.cx,dz=z-r.cz,c=Math.cos(r.angle),s=Math.sin(r.angle),lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)<r.w/2+.5&&Math.abs(lz)<r.d/2+.48)h=Math.max(h,r.h+r.rise*(1-Math.abs(lz)/(r.d/2+.42))+.36);}
 if(Math.abs(z-bz)<1.3&&Math.abs(x)<5.3)h=Math.max(h,bridgeY(x)+.35);return h;}
const snowMax=4200,snowMesh=new T.InstancedMesh(box,new T.MeshBasicMaterial({color:0xe5edf4,toneMapped:false,transparent:true,opacity:.87}),snowMax);snowMesh.frustumCulled=false;scene.add(snowMesh);const flakes=[];
for(let i=0;i<snowMax;i++)flakes.push({x:(rnd()-.5)*47,z:(rnd()-.5)*43,y:rnd(),v:.065+rnd()*.047,p:rnd()*TAU,s:.025+rnd()*.047});
let snowAmount=.78,paused=false,night=false,auto=false,time=0,transition=null,viewName='all';
function setSnow(v){snowAmount=v;snowMesh.count=Math.floor(420+v*(snowMax-420));$('snow-label').textContent=v<.23?'小雪':v>.85?'鹅毛大雪':'大雪';$('weather-desc').textContent=v<.23?'疏雪轻落':v>.85?'雪落无声':'满城飞雪';}
$('snow').oninput=e=>setSnow(Number(e.target.value));setSnow(snowAmount);
function setNight(){night=!night;skyMat.uniforms.night.value=night?.95:.5;hemi.intensity=night?.95:2.1;sun.intensity=night?.85:2.2;rim.intensity=night?1.2:1.5;warmMat.emissiveIntensity=night?2.8:1.8;lamps.forEach(l=>l.intensity=night?8:4.3);$('light').classList.toggle('active',night);$('light').setAttribute('aria-pressed',String(night));$('dusk-label').textContent=night?'雪夜 · 灯火未眠':'薄暮 · 雪落人家';$('light').innerHTML=night?icons.sun:icons.moon;}
const target=new T.Vector3(0,.8,0);let radius=65,theta=.62,phi=1.075;
const presets={all:{r:65,t:.62,p:1.075,target:new T.Vector3(0,.8,0)},bridge:{r:25,t:.37,p:1.14,target:new T.Vector3(0,2.6,3)},lantern:{r:25,t:-.25,p:1.29,target:new T.Vector3(-7,3,-6)}};
function setView(name){viewName=name;transition={start:performance.now(),from:{r:radius,t:theta,p:phi,target:target.clone()},to:presets[name]};document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===name);b.setAttribute('aria-pressed',String(b.dataset.view===name));});$('view-label').textContent={all:'水巷全景',bridge:'桥上听雪',lantern:'灯火人家'}[name];}
function updateCamera(){const r=radius*Math.max(1,1.04/camera.aspect);camera.position.set(target.x+r*Math.sin(phi)*Math.sin(theta),target.y+r*Math.cos(phi),target.z+r*Math.sin(phi)*Math.cos(theta));camera.lookAt(target);}
const pointers=new Map();let lastX=0,lastY=0,pinch=0,interaction=0;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastX=e.clientX;lastY=e.clientY;transition=null;interaction=performance.now();});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch)radius=T.MathUtils.clamp(radius*pinch/d,12,115);pinch=d;}else{const dx=e.clientX-lastX,dy=e.clientY-lastY;if(e.shiftKey||e.buttons===2){target.addScaledVector(new T.Vector3().setFromMatrixColumn(camera.matrix,0),-dx*radius*.001);target.addScaledVector(new T.Vector3().setFromMatrixColumn(camera.matrix,1),dy*radius*.001);}else{theta-=dx*.005;phi=T.MathUtils.clamp(phi+dy*.004,.18,1.51);}}lastX=e.clientX;lastY=e.clientY;interaction=performance.now();});
for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,e=>{pointers.delete(e.pointerId);pinch=0;});canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('wheel',e=>{e.preventDefault();transition=null;radius=T.MathUtils.clamp(radius*Math.exp(e.deltaY*.001),12,115);interaction=performance.now();},{passive:false});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));$('pause').onclick=()=>{paused=!paused;$('pause').classList.toggle('active',paused);$('pause').setAttribute('aria-pressed',String(paused));$('pause').innerHTML=paused?icons.play:icons.pause;};$('orbit').onclick=()=>{auto=!auto;$('orbit').classList.toggle('active',auto);$('orbit').setAttribute('aria-pressed',String(auto));};$('light').onclick=setNight;
$('help').onclick=()=>{$('guide').hidden=!$('guide').hidden;};$('close-guide').onclick=()=>{$('guide').hidden=true;};$('capture').onclick=()=>{renderer.render(scene,camera);const data=canvas.toDataURL('image/png');$('snapshot-image').src=data;$('snapshot-save').href=data;$('snapshot-save').download='雪满江南.png';$('snapshot-panel').showModal();};$('snapshot-close').onclick=()=>$('snapshot-panel').close();
addEventListener('keydown',e=>{if(e.key==='Escape'){$('guide').hidden=true;document.body.classList.remove('clean');}if(e.key.toLowerCase()==='h')document.body.classList.toggle('clean');if(e.key.toLowerCase()==='r')setView('all');if(e.code==='Space'&&e.target===document.body){e.preventDefault();$('pause').click();}});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
$('voxel-count').textContent=(voxelCount/1000).toFixed(1)+'k';
let last=performance.now(),frames=0,fpsStart=last;
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.06,(now-last)/1000);last=now;if(!paused)time+=dt;
 if(transition){const raw=Math.min(1,(now-transition.start)/1350),t=raw*raw*(3-2*raw),a=transition.from,b=transition.to;radius=mix(a.r,b.r,t);theta=mix(a.t,b.t,t);phi=mix(a.p,b.p,t);target.lerpVectors(a.target,b.target,t);if(raw===1)transition=null;}else if(auto&&!paused&&!pointers.size&&now-interaction>1500)theta+=dt*.045;
 for(let i=0;i<snowMesh.count;i++){const f=flakes[i],x=f.x+Math.sin(time*.18+f.p)*.72,z=f.z+Math.cos(time*.14+f.p)*.55,base=surfaceAt(x,z),travel=(f.y+time*f.v*(.68+snowAmount*.4))%1,y=base+(1-travel)*(23-base);dummy.position.set(x,y,z);dummy.scale.set(f.s,f.s*.75,f.s);dummy.rotation.set(time*.21+f.p,time*.16,0);dummy.updateMatrix();snowMesh.setMatrixAt(i,dummy.matrix);}snowMesh.instanceMatrix.needsUpdate=true;
 for(let i=0;i<boats.length;i++){boats[i].g.position.y=.12+Math.sin(time*.62+i)*.026;boats[i].g.rotation.z=Math.sin(time*.47+i)*.008;}
 water.material.uniforms.time.value=time;updateCamera();renderer.render(scene,camera);frames++;if(now-fpsStart>2000){canvas.dataset.renderStats=JSON.stringify({voxels:voxelCount,snowflakes:snowMesh.count,fps:Math.round(frames*1000/(now-fpsStart)),view:viewName,night,paused});frames=0;fpsStart=now;}}
$('loading').classList.add('done');setTimeout(()=>$('loading').remove(),700);requestAnimationFrame(animate);
})();

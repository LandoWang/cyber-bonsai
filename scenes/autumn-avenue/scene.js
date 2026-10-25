(()=>{
'use strict';
const T=THREE,$=id=>document.getElementById(id),TAU=Math.PI*2,mix=T.MathUtils.lerp;
let seed=421024;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;},pick=a=>a[Math.floor(rnd()*a.length)];
const scene=new T.Scene();scene.background=new T.Color(0xadb6b1);scene.fog=new T.Fog(0xadb6b1,95,230);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;$('world').appendChild(renderer.domElement);
const canvas=renderer.domElement;canvas.setAttribute('aria-label','微缩秋日街景：红枫覆盖弯曲人行道，落叶、草坪、常绿树与缓行车辆');
const camera=new T.PerspectiveCamera(43,innerWidth/innerHeight,.08,1000);
const hemi=new T.HemisphereLight(0xdce5e3,0x77715b,2.9);scene.add(hemi);
const sun=new T.DirectionalLight(0xffedcc,2.05);sun.position.set(-22,36,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-33,right:33,top:33,bottom:-33,near:.1,far:100});sun.shadow.normalBias=.045;sun.shadow.bias=-.0002;scene.add(sun);
const rim=new T.DirectionalLight(0xd2e3e5,1.5);rim.position.set(24,17,-22);scene.add(rim);
const stone=new T.MeshStandardMaterial({roughness:.94}),wood=new T.MeshStandardMaterial({roughness:1}),metal=new T.MeshStandardMaterial({roughness:.55,metalness:.4}),glass=new T.MeshStandardMaterial({roughness:.24,metalness:.15}),leafMat=new T.MeshStandardMaterial({roughness:1,side:T.DoubleSide}),warmMat=new T.MeshStandardMaterial({emissive:0xffb355,emissiveIntensity:.5,roughness:.5}),roadMat=new T.MeshStandardMaterial({roughness:.85});
const box=new T.BoxGeometry(1,1,1),dummy=new T.Object3D();let voxelCount=0;
class Batch{constructor(parent=scene){this.parent=parent;this.layers=new Map();}box(x,y,z,w,h,d,c,m=stone,rot=null){if(!this.layers.has(m))this.layers.set(m,[]);this.layers.get(m).push({x,y,z,w,h,d,c,rot});}finish(){for(const [mat,items]of this.layers){const mesh=new T.InstancedMesh(box,mat,items.length);mesh.castShadow=true;mesh.receiveShadow=true;items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.w,v.h,v.d);dummy.quaternion.identity();if(v.rot instanceof T.Quaternion)dummy.quaternion.copy(v.rot);else if(v.rot)dummy.rotation.set(...v.rot);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color(v.c));});mesh.computeBoundingSphere();this.parent.add(mesh);voxelCount+=items.length;}this.layers.clear();}}
function beam(b,a,c,w,d,col,mat=wood){const p=new T.Vector3(...a),q=new T.Vector3(...c),v=q.clone().sub(p),rot=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()),mid=p.add(q).multiplyScalar(.5);b.box(mid.x,mid.y,mid.z,w,v.length(),d,col,mat,rot);}
// The gently curved street uses the same centerline for paving, markings and cars.
function roadX(z){return 5.55+1.65*Math.sin((z+5)*.058);}
function roadHeading(z){return Math.atan(1.65*.058*Math.cos((z+5)*.058));}
const ground=new Batch(),detail=new Batch();
ground.box(0,-.97,0,40,.58,46,0x434c43);ground.box(0,-.58,0,39.7,.23,45.7,0x74684f);ground.box(0,-.29,0,39.5,.38,45.5,0x595b45);
const green=[0x728641,0x778b45,0x7a8d47,0x7c9049,0x738842,0x7e914b];
for(let z=-22.3;z<22.4;z+=.45){const x=roadX(z),left=x-5.65,right=x+5.65;
 ground.box(x,.12,z,11.3,.28,.456,pick([0x656e6c,0x68716f,0x636c6a]),roadMat);
 // Individual pale concrete slabs and the narrow dark gutter follow the bend.
 ground.box(left-1.4,.26,z,2.45,.25,.448,pick([0x9d9f93,0xa5a79a,0xadb0a2]));
 ground.box(left-.1,.26,z,.22,.25,.44,0xc1bfb0);ground.box(right+.13,.25,z,.23,.23,.445,0xb3b6a8);
 ground.box(left+.18,.265,z,.22,.012,.45,0x535e5b,roadMat);
 ground.box(right+.94,.22,z,1.34,.21,.447,0x979e91);
 for(let xx=-19.45;xx<left-2.6;xx+=.5)ground.box(xx,.1,z,.51,.47,.456,pick(green));
 for(let xx=right+1.8;xx<19.55;xx+=.5)ground.box(xx,.08,z,.51,.43,.456,pick([0x586c3f,0x637844,0x6e804a]));
 const rot=[0,roadHeading(z),0];
 ground.box(left+.63,.27,z,.10,.017,.46,0xdadcd0,stone,rot);ground.box(right-.55,.27,z,.10,.017,.46,0xdadcd0,stone,rot);
 for(const dx of [-.13,.13])ground.box(x+dx,.272,z,.072,.016,.46,0xd3b16a,stone,rot);
 if(Math.floor((z+23)*.7)%3===0)for(const dx of [-2.66,2.66])ground.box(x+dx,.27,z,.08,.017,.43,0xd6d8cc,stone,rot);
}
// Soil layers make the side of the miniature feel like a slice taken from a walk.
for(let z=-22;z<22;z+=.7)for(const s of [-1,1]){ground.box(s*19.79,-.35,z,.12,.18,.45,pick([0x8b8060,0x837455,0x706750]));if(rnd()>.55)ground.box(s*19.82,-.07,z,.13,.09,.29,0x82914b);}
for(let x=-19.3;x<19.5;x+=.7)for(const s of [-1,1])ground.box(x,-.43,s*22.8,.47,.15,.08,pick([0x897754,0x73644d,0x9a8864]));
ground.finish();
// Soft contact shadows below the cutaway keep the small world grounded.
const floor=new T.Mesh(new T.PlaneGeometry(3000,3000),new T.MeshStandardMaterial({color:0xaab3ab,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.29;floor.receiveShadow=true;scene.add(floor);
// Pixel-stepped, five-lobed maple leaves are a single shared extruded geometry.
const outline=[[-.05,-.52],[.04,-.52],[.055,-.23],[.29,-.28],[.27,-.10],[.54,.04],[.38,.13],[.45,.33],[.25,.28],[.25,.49],[.12,.42],[0,.72],[-.12,.42],[-.25,.49],[-.25,.28],[-.45,.33],[-.38,.13],[-.54,.04],[-.27,-.1],[-.29,-.28],[-.055,-.23]];
const leafShape=new T.Shape();outline.forEach(([x,y],i)=>i?leafShape.lineTo(x,y):leafShape.moveTo(x,y));leafShape.closePath();
const leafGeo=new T.ExtrudeGeometry(leafShape,{depth:.045,bevelEnabled:false,steps:1});
const crimson=[0x962f34,0xab3b3a,0xc34b43,0xce6050,0xb7463e,0xd77559,0x963a3c];
const amber=[0xd6a332,0xe0b440,0xc48d24,0xe6c359,0xbd7d26,0xd49a2c];
const orange=[0xc27135,0xd18b3b,0xc94f30,0xdd9c42,0xb85733];
const leafGroups=[];
function leaves(items,parent=scene){const mesh=new T.InstancedMesh(leafGeo,leafMat,items.length);mesh.castShadow=true;mesh.receiveShadow=true;items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,v.ry,v.rz);dummy.scale.setScalar(v.s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color(v.c));});mesh.computeBoundingSphere();parent.add(mesh);return mesh;}
function maple(x,z,h,spread,palette,hero=false){const group=new T.Group();group.position.set(x,.35,z);scene.add(group);const b=new Batch(group),foliage=[],bark=[0x625e50,0x736c5a,0x827966,0x524f44];
 // A broad flared root and several grey trunks reproduce the photo's forked silhouette.
 for(let j=0;j<17;j++){const y=j*.25,w=(hero?.86:.59)*(1-j*.019);b.box(Math.sin(j*.08)*.16,y+.13,0,w,.27,w*.86,pick(bark));}
 for(let k=0;k<7;k++){const a=k*TAU/7+.2;beam(b,[0,.25,0],[Math.cos(a)*(hero?1.75:1.1),.03,Math.sin(a)*(hero?1.75:1.1)],.2,.26,0x6c6751);}
 for(let j=0;j<40;j++){const a=rnd()*TAU,y=rnd()*3.8,r=(hero?.43:.29)*(.98-y*.03);b.box(Math.sin(a)*r,y,Math.cos(a)*r,.055,.25+rnd()*.7,.055,pick([0x42483d,0x97917b,0x777564]),wood);}
 for(let k=0;k<8;k++){const a=k*TAU/8+.27+rnd()*.2,start=[.02,2.2+k*.16,0],end=[Math.cos(a)*spread*.57,h*(.62+rnd()*.15),Math.sin(a)*spread*.57];
  const middle=[end[0]*.30,4.5+k*.08,end[2]*.3];beam(b,start,middle,hero?.43:.3,hero?.4:.28,pick(bark));beam(b,middle,end,.24,.24,pick(bark));
  for(let j=0;j<4;j++){const aa=a+(j-1.5)*.38,rad=spread*(.64+rnd()*.37),tip=[Math.cos(aa)*rad,h*(.76+rnd()*.22)-Math.max(0,rad/spread-.8)*1.5,Math.sin(aa)*rad];
   const join=new T.Vector3(...middle).lerp(new T.Vector3(...end),.60+j*.1);beam(b,join.toArray(),tip,.10,.11,pick(bark));
   const small=[tip[0]+Math.cos(aa+.4)*.75,tip[1]+.65,tip[2]+Math.sin(aa+.4)*.75];beam(b,tip,small,.047,.054,0x544f42);
   for(let n=0;n<(hero?150:112);n++){const az=rnd()*TAU,rr=Math.sqrt(rnd()),el=(rnd()-.5)*2,rx=1.3+rnd()*.5;const px=tip[0]+Math.cos(az)*rr*rx,py=tip[1]+el*(1.0-rr*.28),pz=tip[2]+Math.sin(az)*rr*rx;
    foliage.push({x:px,y:py,z:pz,s:.24+rnd()*.23,rx:-Math.PI/2+(rnd()-.5)*1.15,ry:rnd()*TAU,rz:(rnd()-.5)*1.4,c:pick(palette)});
   }
  }
 }
 b.finish();const crown=new T.Group();group.add(crown);leaves(foliage,crown);leafGroups.push({g:crown,phase:rnd()*TAU,x,z,h,palette});return group;
}
maple(-5.6,12.6,13.8,5.8,crimson,true);
maple(-4.15,.2,11.5,4.55,orange);
maple(-5.35,-12.4,12.2,4.9,amber);
maple(-15.1,-19.0,10,3.7,amber);
// The right-hand evergreen wall balances the brilliant deciduous canopies.
function evergreen(x,z,h){const b=new Batch();beam(b,[x,.3,z],[x,h*.9,z],.27,.27,0x615d47);for(let k=0;k<12;k++){const y=2.2+k*h*.058,r=(1-k/12)*(h*.19)+.13;for(let j=0;j<70;j++){const a=rnd()*TAU,rr=Math.sqrt(rnd())*r;const q=.16+rnd()*.31;b.box(x+Math.cos(a)*rr,y+rnd()*.65,z+Math.sin(a)*rr,q,.18+rnd()*.20,q,pick([0x294c3c,0x365a43,0x496344,0x405b3f,0x36553b]),wood);}for(let j=0;j<7;j++){const a=j*TAU/7;beam(b,[x,y+.2,z],[x+Math.cos(a)*r,y-.2,z+Math.sin(a)*r],.065,.065,0x535942);}}b.finish();}
for(const [x,z,h]of[[16.9,-18,16.5],[18.1,-10.3,13.8],[16.3,-3.5,15.4],[18.1,4.9,11.8],[14.6,-21.0,13.0]])evergreen(x,z,h);
// Low timber houses remain behind the trees instead of competing with them.
function house(x,z,w,d,h,color){const b=new Batch();b.box(x,.54,z,w+.4,.35,d+.4,0x797b67);b.box(x,.55+h/2,z,w,h,d,color,wood);
 for(let yy=.8;yy<h+.5;yy+=.22)b.box(x,yy,z+d/2+.02,w,.025,.04,0x9b9c7c,wood);
 for(const side of [-1,1]){b.box(x+side*w*.30,1.88,z+d/2+.045,1.43,1.60,.09,0xe2dfc5);b.box(x+side*w*.30,1.88,z+d/2+.11,1.20,1.38,.04,0x556c62,glass);b.box(x+side*w*.30,1.88,z+d/2+.14,.06,1.4,.05,0xcccbb5);b.box(x+side*w*.30,1.88,z+d/2+.14,1.21,.06,.05,0xcccbb5);}
 b.box(x,1.65,z+d/2+.06,.90,2.15,.09,0x655e4b,wood);b.box(x+.28,1.6,z+d/2+.13,.06,.06,.05,0xd3b777,metal);
 b.box(x,.61,z+d/2+.45,1.65,.22,.84,0xada993);
 for(let zz=-d/2-.4;zz<d/2+.45;zz+=.21){const y=h+.55+1.75*(1-Math.abs(zz)/(d/2+.4));for(let xx=-w/2-.38;xx<w/2+.4;xx+=.24)b.box(x+xx,y,z+zz,.25,.13,.23,pick([0x525a52,0x676957,0x77715c,0x5c6255]),wood);}
 b.box(x+w*.28,h+1.95,z-.5,.55,1.0,.60,0x8c795e);b.box(x+w*.28,h+2.48,z-.5,.67,.13,.71,0x4b5148);
 b.finish();}
house(-14,-9,7.1,5.6,3.3,0x7f8e6d);house(-14.1,4.5,7.2,5.8,3.1,0x899486);
// Garden hedges, fence slats and fallen leaves make the front lawns feel lived in.
for(let z=-18;z<17;z+=.25){if(Math.abs(z-7.9)<1||Math.abs(z+5.9)<.8)continue;detail.box(-9.45,.97,z,.12,1.17,.12,0xc5c2a8,wood);if(Math.floor((z+18)*4)%8===0)detail.box(-9.45,1.57,z,.2,.13,.2,0xd9d1b3);}
for(const y of [.75,1.26])detail.box(-9.5,y,-.5,.12,.10,35,0xbabda6,wood);
for(let z=-19;z<18;z+=.45){if(Math.abs(z-8)<1.1||Math.abs(z+6)<.9)continue;for(let j=0;j<4;j++)detail.box(-10.5+(rnd()-.5)*.6,.65+rnd()*.63,z,.5,.48,.5,pick([0x4c693e,0x617847,0x6b7748]),wood);}
for(const zz of [8,-6])for(let i=0;i<12;i++)detail.box(-13+i*.30,.37,zz,.29,.065,1.15,0xaaa994);
// Roadside details are placed safely outside the moving traffic lanes.
for(const z of [-15,-2,13]){const x=roadX(z)-5.2;detail.box(x,.285,z,.48,.019,.77,0x3b4946,metal);for(let i=0;i<5;i++)detail.box(x-.16+i*.08,.3,z,.027,.019,.67,0x889082,metal);}
function streetlamp(z){const x=roadX(z)+6.7,b=new Batch();b.box(x,.45,z,.50,.30,.50,0x6f7970);beam(b,[x,.5,z],[x,8.4,z],.11,.11,0x828b7e,metal);beam(b,[x,8.4,z],[x-1.3,9.0,z],.10,.10,0x8d9385,metal);beam(b,[x-1.3,9,z],[x-3.2,9,z],.09,.09,0x8d9385,metal);b.box(x-3.2,8.94,z,.68,.16,.31,0x515d57,metal);b.box(x-3.2,8.84,z,.51,.02,.21,0xf3e3b6,warmMat);b.finish();}
streetlamp(-10);streetlamp(16.5);
function sign(text,x,z,w=1.1){const b=new Batch();b.box(x,1.8,z,.07,2.9,.07,0x9d9f8e,metal);b.box(x,3.13,z,w,.56,.07,0xd6d5ba);b.finish();const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#d4d6bb';ctx.fillRect(0,0,256,128);ctx.fillStyle='#294637';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText(text,128,74);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w-.06,.48),new T.MeshStandardMaterial({map:tex,roughness:1}));m.position.set(x,3.13,z+.042);scene.add(m);}
sign('BUS',roadX(-5)-7.95,-5,.72);
// Timber bench and a tiny walker provide a human scale beneath the crown.
const benchX=-6.6,benchZ=6.6;
for(let k=0;k<5;k++){detail.box(benchX,1.02,benchZ-.4+k*.19,2.2,.09,.15,0x896c45,wood);detail.box(benchX,1.35+k*.12,benchZ-.52,2.2,.085,.075,0x92774e,wood);}
for(const x of [benchX-.8,benchX+.8]){detail.box(x,.69,benchZ,.09,.65,.73,0x45564a,metal);detail.box(x,1.20,benchZ-.54,.08,1.05,.08,0x45564a,metal);}
function person(x,z,coat,angle=0){const g=new T.Group();g.position.set(x,.4,z);g.rotation.y=angle;scene.add(g);const b=new Batch(g);for(const s of [-1,1]){b.box(s*.10,.25,s*.10,.13,.49,.15,0x394640,wood);b.box(s*.1,.06,s*.1+.04,.15,.12,.26,0x373a32);b.box(s*.24,.79,-s*.10,.13,.46,.14,coat,wood);}b.box(0,.78,0,.38,.56,.26,coat,wood);b.box(0,1.2,0,.24,.27,.23,0xc4a483,wood);b.box(0,1.36,-.01,.27,.12,.26,0x5c4b39,wood);b.box(0,1.04,.08,.42,.08,.28,0xc89d55,wood);b.finish();return g;}
person(roadX(2)-7.2,2,0x466765,-.12);person(-6.95,6.6,0xb76a44,Math.PI/2);
// Crisp little cars travel in both directions, with headlights at their leading ends.
const cars=[];
function car(lane,z,color,speed,suv=false){const g=new T.Group();scene.add(g);const b=new Batch(g),len=suv?3.25:3.1;
 b.box(0,.42,0,1.52,.38,len,0x343e3b,metal);b.box(0,.65,0,1.62,.45,len,color,metal);b.box(0,.97,-.18,1.39,.43,1.81,color,metal);b.box(0,1.2,-.21,1.22,.12,1.40,color,metal);
 b.box(0,1.0,.76,1.26,.36,.06,0x56777c,glass,[.24,0,0]);b.box(0,1.01,-1.11,1.22,.32,.05,0x567077,glass,[-.18,0,0]);
 for(const s of [-1,1]){b.box(s*.708,1.0,-.20,.04,.30,1.48,0x526f71,glass);b.box(s*.736,1,-.15,.044,.35,.085,color,metal);b.box(s*.83,.89,.63,.16,.12,.24,color,metal);for(const zz of [-1.03,.99]){b.box(s*.75,.35,zz,.21,.53,.54,0x29312e);b.box(s*.869,.36,zz,.025,.28,.29,0xa0aaa2,metal);b.box(s*.45,.67,len/2+.018,.36,.12,.035,0xe7e2c4,warmMat);b.box(s*.5,.66,-len/2-.016,.28,.11,.032,0xb44a3d);}}
 b.box(0,.48,len/2+.03,.61,.13,.025,0x36443e);b.box(0,.47,len/2+.051,.25,.10,.01,0xd4d8c9);b.finish();cars.push({g,lane,z,speed});}
car(-1.43,13,0x404d4e,-2.2,true);car(-4.0,-5,0xaebabc,-2.8);car(1.44,-12,0xd4d6c8,2.25,true);car(4.02,8,0x828e92,2.8);car(1.44,18,0x9d5948,2.25);
// Fallen leaves follow the photographed tree line and collect along the curb.
const carpet=[];
for(let i=0;i<2550;i++){const z=(rnd()-.5)*44,x=roadX(z)-6.6+(rnd()-.5)*12;if(x<-19||x>roadX(z)-4.5)continue;const onPath=x>roadX(z)-8.28;carpet.push({x,y:onPath?.40:.35,z,s:.13+rnd()*.18,rx:-Math.PI/2,ry:0,rz:rnd()*TAU,c:pick(i%3?amber:crimson)});}
leaves(carpet);
// Low blades, seed heads and occasional pebbles break up the grass surface.
for(let i=0;i<1100;i++){const z=(rnd()-.5)*44,x=-19+rnd()*(roadX(z)-8.6+19);if(x>-9.7&&x<-8.8)continue;detail.box(x,.37,z,.035,.09+rnd()*.10,.025,pick([0x8d9f56,0x779349,0x9caa62]),wood,[0,rnd()*TAU,(rnd()-.5)*.7]);}
detail.finish();
const fallingMax=380,falling=new T.InstancedMesh(leafGeo,leafMat,fallingMax);falling.frustumCulled=false;scene.add(falling);const drift=[];
for(let i=0;i<fallingMax;i++){const tree=leafGroups[i%3];drift.push({x:tree.x+(rnd()-.5)*8,z:tree.z+(rnd()-.5)*8,h:tree.h,phase:rnd(),spin:rnd()*TAU,s:.15+rnd()*.17,v:.045+rnd()*.05});falling.setColorAt(i,new T.Color(pick(tree.palette)));}
let wind=.35,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,golden=false,auto=false,time=0,transition=null,viewName='all';
function setWind(v){wind=v;falling.count=v===0?0:Math.round(15+v*(fallingMax-15));$('wind-label').textContent=v<.1?'无风':v<.55?'轻风':'秋风起';$('weather-desc').textContent=v<.1?'叶静枝闲':v<.55?'红叶缓落':'满街飞叶';}
$('wind').oninput=e=>setWind(Number(e.target.value));setWind(wind);
function setLight(){golden=!golden;hemi.intensity=golden?2.1:2.9;sun.intensity=golden?3.4:2.05;sun.color.set(golden?0xffc47e:0xffedcc);sun.position.set(golden?-30:-22,golden?17:36,12);rim.intensity=golden?.9:1.5;scene.background.set(golden?0xa99c82:0xadb6b1);scene.fog.color.copy(scene.background);floor.material.color.set(golden?0x999981:0xaab3ab);$('light').classList.toggle('active',golden);$('light').setAttribute('aria-pressed',String(golden));$('light').innerHTML=golden?icons.moon:icons.sun;$('dusk-label').textContent=golden?'雨后 · 夕照入林':'阴天 · 红叶正好';}
const target=new T.Vector3(0,3.5,0);let radius=76,theta=.50,phi=1.03;
const presets={all:{fov:43,r:76,t:.50,p:1.03,target:new T.Vector3(0,3.5,0)},canopy:{fov:65,r:24,t:.05,p:1.80,target:new T.Vector3(-2.8,7.0,-1.8)},street:{fov:54,r:29,t:.10,p:1.50,target:new T.Vector3(-1.2,2.7,-7)}};
function setView(name){viewName=name;transition={start:performance.now(),from:{fov:camera.fov,r:radius,t:theta,p:phi,target:target.clone()},to:presets[name]};document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===name);b.setAttribute('aria-pressed',String(b.dataset.view===name));});$('view-label').textContent={all:'枫街全景',canopy:'树下抬头',street:'沿街漫步'}[name];}
function updateCamera(){const r=radius*(viewName==='all'?Math.max(1,1.12/camera.aspect):Math.max(1,.60/camera.aspect));scene.fog.near=r+65;scene.fog.far=r+200;camera.position.set(target.x+r*Math.sin(phi)*Math.sin(theta),Math.max(.7,target.y+r*Math.cos(phi)),target.z+r*Math.sin(phi)*Math.cos(theta));camera.lookAt(target);}
const pointers=new Map();let lastX=0,lastY=0,pinch=0,interaction=0;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastX=e.clientX;lastY=e.clientY;transition=null;interaction=performance.now();});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch)radius=T.MathUtils.clamp(radius*pinch/d,5,115);pinch=d;}else{const dx=e.clientX-lastX,dy=e.clientY-lastY;if(e.shiftKey||e.buttons===2){target.addScaledVector(new T.Vector3().setFromMatrixColumn(camera.matrix,0),-dx*radius*.001);target.addScaledVector(new T.Vector3().setFromMatrixColumn(camera.matrix,1),dy*radius*.001);}else{theta-=dx*.005;phi=T.MathUtils.clamp(phi+dy*.004,.20,1.95);}}lastX=e.clientX;lastY=e.clientY;interaction=performance.now();});
for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,e=>{pointers.delete(e.pointerId);pinch=0;});canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('wheel',e=>{e.preventDefault();transition=null;radius=T.MathUtils.clamp(radius*Math.exp(e.deltaY*.001),5,115);interaction=performance.now();},{passive:false});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
function syncPause(){$('pause').classList.toggle('active',paused);$('pause').setAttribute('aria-pressed',String(paused));$('pause').innerHTML=paused?icons.play:icons.pause;}syncPause();
$('pause').onclick=()=>{paused=!paused;syncPause();};$('orbit').onclick=()=>{auto=!auto;$('orbit').classList.toggle('active',auto);$('orbit').setAttribute('aria-pressed',String(auto));};$('light').onclick=setLight;
$('help').onclick=()=>{$('guide').hidden=!$('guide').hidden;};$('close-guide').onclick=()=>{$('guide').hidden=true;};$('capture').onclick=()=>{renderer.render(scene,camera);const data=canvas.toDataURL('image/png');$('snapshot-image').src=data;$('snapshot-save').href=data;$('snapshot-save').download='枫街秋声.png';$('snapshot-panel').showModal();};$('snapshot-close').onclick=()=>$('snapshot-panel').close();
addEventListener('keydown',e=>{if(e.key==='Escape'){$('guide').hidden=true;document.body.classList.remove('clean');}if(e.target.matches('input,textarea,select')||e.target.isContentEditable)return;if(e.key.toLowerCase()==='h')document.body.classList.toggle('clean');if(e.key.toLowerCase()==='r')setView('all');if(e.code==='Space'&&e.target===document.body){e.preventDefault();$('pause').click();}});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
$('voxel-count').textContent='秋日小景';
let last=performance.now(),frames=0,fpsStart=last;
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.06,(now-last)/1000);last=now;if(!paused)time+=dt;
 if(transition){const raw=Math.min(1,(now-transition.start)/1500),t=raw*raw*(3-2*raw),a=transition.from,b=transition.to;camera.fov=mix(a.fov,b.fov,t);camera.updateProjectionMatrix();radius=mix(a.r,b.r,t);theta=mix(a.t,b.t,t);phi=mix(a.p,b.p,t);target.lerpVectors(a.target,b.target,t);if(raw===1)transition=null;}else if(auto&&!paused&&!pointers.size&&now-interaction>1500)theta+=dt*.045;
 for(const tree of leafGroups){tree.g.rotation.z=Math.sin(time*.65+tree.phase)*wind*.009;tree.g.rotation.x=Math.cos(time*.43+tree.phase)*wind*.006;}
 for(let i=0;i<falling.count;i++){const f=drift[i],progress=(f.phase+time*f.v*(wind*.9+.025))%1;const x=f.x+Math.sin(progress*TAU+f.spin)*(.4+wind)+progress*wind*2,z=f.z+Math.sin(progress*4+f.spin)*.7,y=.43+(1-progress)*(f.h-1);dummy.position.set(x,y,z);dummy.scale.setScalar(f.s);dummy.rotation.set(-Math.PI/2+Math.sin(progress*9+f.spin),f.spin+progress*7,progress*9+f.spin);dummy.updateMatrix();falling.setMatrixAt(i,dummy.matrix);}falling.instanceMatrix.needsUpdate=true;
 for(const c of cars){const z=((c.z+time*c.speed+24)%48+48)%48-24;c.g.position.set(roadX(z)+c.lane,.27,z);c.g.rotation.y=roadHeading(z)+(c.speed<0?Math.PI:0);c.g.visible=Math.abs(z)<20.65;}
 updateCamera();renderer.render(scene,camera);frames++;if(now-fpsStart>2000){canvas.dataset.renderStats=JSON.stringify({voxels:voxelCount,mapleTrees:leafGroups.length,fallingLeaves:falling.count,fps:Math.round(frames*1000/(now-fpsStart)),view:viewName,golden,paused,wind});frames=0;fpsStart=now;}}
$('loading').classList.add('done');setTimeout(()=>$('loading').remove(),700);requestAnimationFrame(animate);
})();

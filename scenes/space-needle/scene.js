(()=>{
'use strict';
const T=THREE,$=id=>document.getElementById(id),TAU=Math.PI*2,mix=T.MathUtils.lerp;
let seed=621962;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;},pick=a=>a[Math.floor(rnd()*a.length)];
const scene=new T.Scene();scene.background=new T.Color(0xadb8c1);scene.fog=new T.Fog(0xadb8c1,130,330);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;$('world').appendChild(renderer.domElement);
const canvas=renderer.domElement;canvas.setAttribute('aria-label','阴云下的西雅图太空针塔，环形观景台、象牙白支架、金褐秋树与金属风雕塑');
const camera=new T.PerspectiveCamera(42,innerWidth/innerHeight,.08,1000);
const hemi=new T.HemisphereLight(0xd9e4ef,0x686c61,2.3);scene.add(hemi);
const sun=new T.DirectionalLight(0xecf1ee,1.6);sun.position.set(-35,65,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-42,right:42,top:70,bottom:-35,near:.1,far:180});sun.shadow.normalBias=.045;sun.shadow.bias=-.0002;scene.add(sun);
const rim=new T.DirectionalLight(0xc5d9e5,1.2);rim.position.set(20,45,-30);scene.add(rim);
const stone=new T.MeshStandardMaterial({roughness:.94}),wood=new T.MeshStandardMaterial({roughness:1}),metal=new T.MeshStandardMaterial({roughness:.55,metalness:.4}),glass=new T.MeshStandardMaterial({roughness:.24,metalness:.15}),leafMat=new T.MeshStandardMaterial({roughness:1,side:T.DoubleSide}),warmMat=new T.MeshStandardMaterial({emissive:0xffb355,emissiveIntensity:.5,roughness:.5}),roadMat=new T.MeshStandardMaterial({roughness:.85});
const box=new T.BoxGeometry(1,1,1),dummy=new T.Object3D();let voxelCount=0;
class Batch{constructor(parent=scene){this.parent=parent;this.layers=new Map();}box(x,y,z,w,h,d,c,m=stone,rot=null){if(!this.layers.has(m))this.layers.set(m,[]);this.layers.get(m).push({x,y,z,w,h,d,c,rot});}finish(){for(const [mat,items]of this.layers){const mesh=new T.InstancedMesh(box,mat,items.length);mesh.castShadow=true;mesh.receiveShadow=true;items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.w,v.h,v.d);dummy.quaternion.identity();if(v.rot instanceof T.Quaternion)dummy.quaternion.copy(v.rot);else if(v.rot)dummy.rotation.set(...v.rot);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color(v.c));});mesh.computeBoundingSphere();this.parent.add(mesh);voxelCount+=items.length;}this.layers.clear();}}
function beam(b,a,c,w,d,col,mat=wood){const p=new T.Vector3(...a),q=new T.Vector3(...c),v=q.clone().sub(p),rot=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()),mid=p.add(q).multiplyScalar(.5);b.box(mid.x,mid.y,mid.z,w,v.length(),d,col,mat,rot);}

// The park is an artistic cutaway, with the reference tower as its focal point.
const park=new Batch(),ivory=new T.MeshStandardMaterial({color:0xd4d3bd,roughness:.72,metalness:.25}),steel=new T.MeshStandardMaterial({color:0x546168,roughness:.66,metalness:.62}),blueGlass=new T.MeshStandardMaterial({color:0x344c5b,roughness:.22,metalness:.55}),roofMat=new T.MeshStandardMaterial({color:0xa5aeaa,roughness:.7,metalness:.38});
park.box(0,-.64,0,38,1.2,35,0x61686a);park.box(0,-1.28,0,37.4,.14,34.4,0x43535b);park.box(0,.02,0,37.8,.14,34.8,0x8b938a);
const floor=new T.Mesh(new T.PlaneGeometry(3000,3000),new T.MeshStandardMaterial({color:0xaab5bd,roughness:.92}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.36;floor.receiveShadow=true;scene.add(floor);
const paving=new T.MeshStandardMaterial({roughness:.54,metalness:.13});
for(let x=-18.45;x<19;x+=.9)for(let z=-16.9;z<17.5;z+=.9){const lawn=(x<-8&&z<12)||(x>8&&z>-4)||(z<-10&&x>-7);park.box(x,.13,z,.885,.13,.885,lawn?pick([0x677450,0x707b57,0x75815b,0x7b815d]):pick([0x8e9797,0x939d9d,0x8b9596,0x98a09f,0x929a9a]),lawn?stone:paving);}
// The entrance pavilion is low enough for the tower legs to stay visible.
park.box(0,.37,0,10,.5,9,0x9ea6a2);park.box(0,1.24,0,6.9,1.4,5.9,0x32444d,glass);park.box(0,2.03,0,8.3,.25,7.0,0xb4b8b0);
for(let x=-3.3;x<=3.4;x+=.55){park.box(x,1.22,3.02,.045,1.4,.08,0xb5b9ae,metal);park.box(x,1.22,-3.02,.045,1.4,.08,0xb5b9ae,metal);}
for(let k=0;k<4;k++)park.box(0,.18+k*.055,5.35-k*.36,4.2,.10,.5,0xaab0aa);
// Concrete and glass frontage at the edge recalls the low building in the photo.
park.box(-15.6,2.4,-6,4.8,4.6,13,0x65727a);park.box(-12.99,2.3,-6,.10,3.6,12.1,0x374c58,glass);park.box(-15.6,4.88,-6,5.2,.3,13.4,0xb9bdb6);
for(let z=-11.9;z<.5;z+=.75)park.box(-12.88,2.35,z,.14,3.8,.045,0xa0a9a6,metal);
for(let y=.8;y<4.2;y+=.4)park.box(-12.91,y,-6,.13,.035,12.2,0x8b9595,metal);
for(const z of[-12,-7,-2]){park.box(-12.4,2.85,z,.42,5.3,.42,0xc2c4b9);beam(park,[-12.4,4.8,z],[-10.3,4.8,z],.08,.10,0x83908f,metal);}
// Small benches, lights and bollards set the scale without a busy street.
const lamps=[];
for(const [x,z,angle]of[[-7,9,0],[7,8,0],[-8,-7,1.57],[8,-8,1.57]]){const g=new T.Group();g.position.set(x,.2,z);g.rotation.y=angle;scene.add(g);const b=new Batch(g);for(let j=0;j<4;j++)b.box(0,.64,j*.15-.225,1.65,.08,.13,0x8d7658,wood);for(const xx of[-.58,.58]){b.box(xx,.36,0,.10,.6,.54,0x485358,metal);b.box(xx,1.06,-.3,.08,.65,.08,0x485358,metal);}for(let j=0;j<2;j++)b.box(0,1.14+j*.15,-.32,1.65,.12,.08,0x9a8060,wood);b.finish();}
for(const [x,z]of[[-6,13],[6,13],[-9,-6],[10,0]]){park.box(x,1.58,z,.10,2.8,.10,0x546168,metal);park.box(x,3.03,z,.54,.10,.40,0x4e5c63,metal);park.box(x,2.96,z,.35,.05,.29,0xf2dcaa,warmMat);const l=new T.PointLight(0xffd8a0,0,8,2);l.position.set(x,2.8,z);scene.add(l);lamps.push(l);}
for(const x of[-2.2,2.2])for(const z of[7.3,10.8,14.3])park.box(x,.65,z,.16,.96,.16,0x58676b,metal);
park.finish();

function mesh(geometry,mat,x=0,y=0,z=0,parent=scene){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(rt,rb,h,y,mat,segments=64){return mesh(new T.CylinderGeometry(rt,rb,h,segments),mat,0,y,0);}
function ring(r,t,y,mat){const m=mesh(new T.TorusGeometry(r,t,6,96),mat,0,y,0);m.rotation.x=Math.PI/2;return m;}
// Six curved plates form three paired legs. The narrow waist reveals the elevator core.
const profile=new T.CatmullRomCurve3([[3.9,.8],[3.1,5],[1.6,13],[.92,23],[1.27,31],[2.3,39],[3.45,45]].map(([r,y])=>new T.Vector3(r,y,0)));
const legShape=new T.Shape(),samples=profile.getPoints(110);samples.forEach((p,i)=>{const w=.29+.12*Math.sin(p.y/45*Math.PI);if(i===0)legShape.moveTo(p.x-w,p.y);else legShape.lineTo(p.x-w,p.y);});for(let i=samples.length-1;i>=0;i--){const p=samples[i],w=.29+.12*Math.sin(p.y/45*Math.PI);legShape.lineTo(p.x+w,p.y);}legShape.closePath();
const legGeo=new T.ExtrudeGeometry(legShape,{depth:.30,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.035,bevelThickness:.025});legGeo.translate(0,0,-.15);
const frame=new Batch(),orientation=.20;
for(let k=0;k<3;k++)for(const sign of[-1,1]){const a=k*TAU/3+orientation+sign*.13;const m=mesh(legGeo,ivory);m.rotation.y=-a;const r=3.9;frame.box(Math.cos(a)*r,.56,Math.sin(a)*r,1.0,.70,.85,0xb0b5ac);}
// Central lift shaft: slim dark posts, ladders, cross braces and exposed cables.
cylinder(.48,.56,43.8,22.0,steel,12);
for(let k=0;k<3;k++){const a=k*TAU/3+orientation+Math.PI/3,rx=Math.cos(a),rz=Math.sin(a),tx=-rz,tz=rx;
 for(const s of[-1,1])beam(frame,[rx*.81+tx*s*.28,1.5,rz*.81+tz*s*.28],[rx*.81+tx*s*.28,44.6,rz*.81+tz*s*.28],.11,.11,0x8e9899,metal);
 for(let y=2;y<44;y+=.72){beam(frame,[rx*.83+tx*.28,y,rz*.83+tz*.28],[rx*.83-tx*.28,y,rz*.83-tz*.28],.045,.045,0x7a878b,metal);if(Math.floor(y/.72)%3===0)beam(frame,[rx*.77+tx*.28,y,rz*.77+tz*.28],[rx*.77-tx*.28,y+1.35,rz*.77-tz*.28],.046,.046,0x7a878b,metal);}
 for(const s of[-1,1])beam(frame,[rx*.92+tx*s*.18,1.3,rz*.92+tz*s*.18],[rx*.92+tx*s*.18,44.7,rz*.92+tz*s*.18],.026,.026,0x313f48,metal);
}
// White collars tie the legs together at the waist; recesses show subtle panel joints.
for(const y of[18,24,30])ring(y===30?1.22:.96,.09,y,ivory);
for(let k=0;k<3;k++){const a=k*TAU/3+orientation;for(let y=15;y<33;y+=1.25){const p=samples.reduce((best,p)=>Math.abs(p.y-y)<Math.abs(best.y-y)?p:best,samples[0]);frame.box(Math.cos(a)*(p.x+.31),y,Math.sin(a)*(p.x+.31),.045,.028,.40,0xafb5aa,metal,[0,-a,0]);}}
// Saucer underside: a dark recessed dish under a fan of ivory radial ribs.
cylinder(6.85,3.25,1.76,45.62,steel,72);cylinder(7.0,6.8,.38,46.66,ivory,72);
const ribShape=new T.Shape();ribShape.moveTo(3.2,44.64);ribShape.lineTo(3.35,45.3);ribShape.lineTo(7.06,47.18);ribShape.lineTo(7.35,46.93);ribShape.lineTo(6.90,46.34);ribShape.lineTo(3.65,44.55);ribShape.closePath();
const ribGeo=new T.ExtrudeGeometry(ribShape,{depth:.12,bevelEnabled:false});ribGeo.translate(0,0,-.06);
for(let k=0;k<48;k++){const rib=mesh(ribGeo,ivory);rib.rotation.y=-k*TAU/48;}
ring(3.25,.15,44.60,ivory);ring(6.90,.12,46.72,steel);
// Dark panoramic windows, narrow metal mullions and a wider outdoor glass ring.
cylinder(6.77,6.77,1.35,47.51,blueGlass,96);cylinder(7.12,7.12,.16,48.23,steel,96);
const windowGlow=new T.MeshStandardMaterial({roughness:.35,metalness:.18,emissive:0xf1c887,emissiveIntensity:.04});
for(let k=0;k<64;k++){const a=k*TAU/64,r=6.80;frame.box(Math.sin(a)*r,47.51,Math.cos(a)*r,.048,1.38,.085,0x7c8c8f,metal,[0,a,0]);if(k%3!==0)frame.box(Math.sin(a+.022)*6.79,47.5,Math.cos(a+.022)*6.79,.42,1.14,.025,pick([0x617785,0x4d6471,0x566e7b,0x78919b]),windowGlow,[0,a+.022,0]);}
const terrace=cylinder(8.05,7.15,.30,48.45,roofMat,96);ring(8.02,.10,48.6,steel);
const guardGlass=new T.MeshStandardMaterial({color:0xa9c1c8,transparent:true,opacity:.20,roughness:.15,metalness:.15,side:T.DoubleSide,depthWrite:false});
for(let k=0;k<64;k++){const a=k*TAU/64,aa=a+TAU/128;beam(frame,[Math.sin(a)*7.95,48.64,Math.cos(a)*7.95],[Math.sin(a)*8.28,49.8,Math.cos(a)*8.28],.035,.045,0x687a81,metal);const pane=mesh(new T.PlaneGeometry(.785,1.2),guardGlass,Math.sin(aa)*8.12,49.22,Math.cos(aa)*8.12);pane.rotation.set(-.277,aa,0);pane.castShadow=false;}
ring(8.28,.04,49.8,steel);ring(8.08,.035,48.85,steel);
// Shallow radial roof panels converge toward the small central cap.
cylinder(2.3,7.54,1.28,49.35,roofMat,96);cylinder(1.25,2.45,.64,50.30,roofMat,64);ring(7.56,.07,48.73,steel);
for(let k=0;k<48;k++){const a=k*TAU/48;beam(frame,[Math.sin(a)*2.36,50.02,Math.cos(a)*2.36],[Math.sin(a)*7.55,48.79,Math.cos(a)*7.55],.032,.032,0x667c83,metal);}
cylinder(.82,1.30,.28,50.76,steel,32);cylinder(.21,.30,.65,51.11,ivory,12);
// Needle and antenna: small triangular bracing, with an unblinking red tip at dusk.
for(let k=0;k<3;k++){const a=k*TAU/3;beam(frame,[Math.cos(a)*.24,51.2,Math.sin(a)*.24],[Math.cos(a)*.035,58.55,Math.sin(a)*.035],.034,.034,0x7e8e94,metal);for(let y=51.5;y<58.3;y+=.55){const t=(y-51.2)/7.35,r=mix(.24,.035,t),b=a+TAU/3;beam(frame,[Math.cos(a)*r,y,Math.sin(a)*r],[Math.cos(b)*r,y+.35,Math.sin(b)*r],.019,.019,0x64767e,metal);}}
beam(frame,[0,58.4,0],[0,59.5,0],.027,.027,0x64757e,metal);
const beaconMat=new T.MeshStandardMaterial({color:0x986f58,emissive:0xf35c39,emissiveIntensity:.1});mesh(new T.SphereGeometry(.09,8,6),beaconMat,0,58.56,0);frame.finish();
// Gold exterior lifts take unhurried trips between the entrance and the saucer.
const lifts=[];for(let k=0;k<3;k++){const g=new T.Group(),a=k*TAU/3+orientation+Math.PI/3;g.position.set(Math.cos(a)*.94,5,Math.sin(a)*.94);g.rotation.y=Math.PI/2-a;scene.add(g);const b=new Batch(g);b.box(0,0,.04,.65,1.34,.53,0xc7a249,metal);b.box(0,.27,.32,.51,.52,.04,0x263d4b,glass);b.box(0,-.38,.32,.50,.34,.04,0xe1bb62,metal);b.box(0,.76,0,.77,.14,.61,0x59666a,metal);b.finish();lifts.push(g);}

// Pixel-stepped, five-lobed maple leaves are a single shared extruded geometry.
const outline=[[-.05,-.52],[.04,-.52],[.055,-.23],[.29,-.28],[.27,-.10],[.54,.04],[.38,.13],[.45,.33],[.25,.28],[.25,.49],[.12,.42],[0,.72],[-.12,.42],[-.25,.49],[-.25,.28],[-.45,.33],[-.38,.13],[-.54,.04],[-.27,-.1],[-.29,-.28],[-.055,-.23]];
const leafShape=new T.Shape();outline.forEach(([x,y],i)=>i?leafShape.lineTo(x,y):leafShape.moveTo(x,y));leafShape.closePath();
const leafGeo=new T.ExtrudeGeometry(leafShape,{depth:.045,bevelEnabled:false,steps:1});
const crownGeo=new T.ShapeGeometry(leafShape);
const crimson=[0x9f3640,0xb7484b,0xc65551,0xcd6a5b,0xb44745,0xc77b60,0xa9454b];
const amber=[0xd6a332,0xe0b440,0xc48d24,0xe6c359,0xbd7d26,0xd49a2c];
const orange=[0xc27135,0xd18b3b,0xc94f30,0xdd9c42,0xb85733];
const leafGroups=[];
function leaves(items,parent=scene,geometry=leafGeo){const mesh=new T.InstancedMesh(geometry,leafMat,items.length);mesh.castShadow=true;mesh.receiveShadow=true;items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,v.ry,v.rz);dummy.scale.setScalar(v.s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color(v.c));});mesh.computeBoundingSphere();parent.add(mesh);return mesh;}
// Generated bark stays offline and adds the grey, fissured surface in the reference.
const barkCanvas=document.createElement('canvas');barkCanvas.width=128;barkCanvas.height=512;
const barkCtx=barkCanvas.getContext('2d');barkCtx.fillStyle='#b4b2a4';barkCtx.fillRect(0,0,128,512);
let barkSeed=81357;const barkRandom=()=>{barkSeed=(barkSeed*1664525+1013904223)>>>0;return barkSeed/4294967296;};
for(let i=0;i<260;i++){const x=Math.floor(barkRandom()*128),y=Math.floor(barkRandom()*512),w=1+Math.floor(barkRandom()*4),h=12+barkRandom()*100;barkCtx.fillStyle=pick(['#85877b','#999b8d','#c2c1b1','#a7a99a']);barkCtx.fillRect(x,y,w,h);}
for(let i=0;i<35;i++){let x=barkRandom()*128,y=barkRandom()*512;barkCtx.strokeStyle=i%3?'#777e72':'#626b62';barkCtx.lineWidth=i%4===0?2:1;barkCtx.beginPath();barkCtx.moveTo(x,y);for(let k=0;k<6;k++){x+=(barkRandom()-.5)*5;y+=6+barkRandom()*12;barkCtx.lineTo(x,y);}barkCtx.stroke();}
const barkTexture=new T.CanvasTexture(barkCanvas);barkTexture.colorSpace=T.SRGBColorSpace;barkTexture.magFilter=T.NearestFilter;barkTexture.wrapS=barkTexture.wrapT=T.RepeatWrapping;
const barkMat=new T.MeshStandardMaterial({map:barkTexture,roughness:1,vertexColors:true});
class Limbs{
 constructor(parent){this.parent=parent;this.items=[];}
 segment(a,b,r,endR,c){this.items.push({a:a.clone(),b:b.clone(),r,endR,c});}
 curve(a,b,c,startRadius,endRadius,color){
  const path=new T.QuadraticBezierCurve3(new T.Vector3(...a),new T.Vector3(...b),new T.Vector3(...c));
  const n=Math.max(4,Math.ceil(path.getLength()/.44));
  for(let i=0;i<n;i++){const t=i/n,u=(i+1)/n;this.segment(path.getPoint(t),path.getPoint(u),mix(startRadius,endRadius,t),mix(startRadius,endRadius,u),color);}
 }
 finish(){
  const positions=[],normals=[],uvs=[],colors=[];
  for(const v of this.items){
   const axis=v.b.clone().sub(v.a),length=axis.length(),color=new T.Color(v.c);
   dummy.position.copy(v.a).add(v.b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),axis.clone().normalize());dummy.scale.set(1,1,1);dummy.updateMatrix();
   const geometry=new T.CylinderGeometry(v.endR,v.r,length,7,1,true).toNonIndexed();
   const uv=geometry.attributes.uv;
   for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*TAU*v.r/1.3,(uv.getY(i)*length+v.a.y)/3);
   geometry.applyMatrix4(dummy.matrix);
   positions.push(...geometry.attributes.position.array);normals.push(...geometry.attributes.normal.array);uvs.push(...uv.array);
   for(let i=0;i<geometry.attributes.position.count;i++)colors.push(color.r,color.g,color.b);
   geometry.dispose();
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeBoundingSphere();
  const mesh=new T.Mesh(geometry,barkMat);mesh.castShadow=true;mesh.receiveShadow=true;this.parent.add(mesh);
 }
}
function maple(x,z,h,spread,palette,hero=false){
 const group=new T.Group();group.position.set(x,.35,z);scene.add(group);
 const limbs=new Limbs(group),foliage=[],baseR=hero?.67:.36;
 const bark=[0xb0aea1,0xc1bcb0,0xaaa99c,0xcac4b7];
 limbs.curve([0,0,0],[.18,1.8,-.08],[.16,4.2,-.10],baseR,baseR*.56,0xb8b5a8);
 for(let k=0;k<8;k++){const a=k*TAU/8+.2,length=hero?1.45:1.0;
  limbs.curve([Math.cos(a)*length,.025,Math.sin(a)*length],[Math.cos(a)*.6,.16,Math.sin(a)*.6],[0,.9,0],.035,baseR*.56,0x9eaa8d);
 }
 // Stems diverge at different heights and taper through bent, asymmetric limbs.
 for(let k=0;k<7;k++){
  const a=k*TAU/7+.18+rnd()*.26,start=[.08,1.5+k*.32,-.03];
  const extension=hero&&Math.cos(a)>0?1.32:1;
  const end=[Math.cos(a)*spread*.66*extension,h*(.68+rnd()*.19),Math.sin(a)*spread*.62];
  const bend=[Math.cos(a)*spread*.15,h*(.37+rnd()*.06),Math.sin(a)*spread*.16];
  limbs.curve(start,bend,end,baseR*(.53+rnd()*.13),.06+rnd()*.025,pick(bark));
  for(let j=0;j<5;j++){
   const aa=a+(j-2)*.32,rad=spread*(.60+rnd()*.44),ex=hero&&Math.cos(aa)>0?1.32:1;
   const tip=[Math.cos(aa)*rad*ex,h*(.67+rnd()*.32)-Math.max(0,rad/spread-.8)*1.8,Math.sin(aa)*rad];
   const join=new T.Vector3(...bend).lerp(new T.Vector3(...end),.42+j*.10);
   const mid=join.clone().lerp(new T.Vector3(...tip),.53);mid.y+=.22+rnd()*.6;
   limbs.curve(join.toArray(),mid.toArray(),tip,.058+rnd()*.025,.016,pick(bark));
   for(let q=0;q<3;q++){
    const twig=new T.Vector3(...tip).add(new T.Vector3(Math.cos(aa+q-.9)*(.55+rnd()*.55),.12+rnd()*.52,Math.sin(aa+q-.9)*(.55+rnd()*.55)));
    const twigStart=mid.clone().lerp(new T.Vector3(...tip),.64+q*.12);
    limbs.curve(twigStart.toArray(),new T.Vector3(...tip).toArray(),twig.toArray(),.025,.008,0x919688);
   }
   // Layers of small clusters leave slivers of sky while joining the crown overhead.
   for(let n=0;n<(hero?150:120);n++){
    const az=rnd()*TAU,rr=Math.sqrt(rnd()),vertical=(rnd()-.5)*2,rx=hero?1.7:1.85;
    const px=tip[0]+Math.cos(az)*rr*rx,py=tip[1]+vertical*(1.1-rr*.35),pz=tip[2]+Math.sin(az)*rr*rx;
    foliage.push({x:px,y:py,z:pz,s:.23+rnd()*.23,rx:-Math.PI/2+(rnd()-.5)*1.45,ry:rnd()*TAU,rz:(rnd()-.5)*1.5,c:pick(palette)});
   }
  }
 }
 // Inner clusters connect the outer branches without turning the crown into a shell.
 for(let i=0;i<(hero?460:180);i++){const a=rnd()*TAU,r=Math.sqrt(rnd())*(hero?2.1:1.4);foliage.push({x:Math.cos(a)*r+(hero?.6:0),y:h*.86+(rnd()-.5)*2.0,z:Math.sin(a)*r,s:.2+rnd()*.16,rx:-Math.PI/2+(rnd()-.5)*1.4,ry:rnd()*TAU,rz:rnd()*TAU,c:pick(palette)});}
 // Small lichen flecks follow the trunk surface instead of forming horizontal bands.
 const lichen=new Batch(group);
 for(let i=0;i<(hero?115:35);i++){const a=rnd()*TAU,y=rnd()*2.7,r=mix(baseR,baseR*.64,y/4.2);lichen.box(Math.sin(a)*r,y,Math.cos(a)*r,.018+rnd()*.065,.045+rnd()*.14,.025,pick([0x778278,0x909782,0xa8ad9a]),wood,[0,a,0]);}lichen.finish();
 limbs.finish();const crown=new T.Group();group.add(crown);leaves(foliage,crown,crownGeo);leafGroups.push({g:crown,phase:rnd()*TAU,x,z,h,palette});return group;
}
const autumnBrown=[0x776a40,0x937b43,0xa28a51,0x866e42,0xb0985e,0x8a804c],copper=[0x9a603b,0xaa7044,0x876441,0xb28852,0x8a743e];
for(const [x,z,h,w,p]of[[-12,10,13,4.4,autumnBrown],[-6,14,8.5,3.4,autumnBrown],[10,13,15,4.8,copper],[15,5,15.8,4.8,autumnBrown],[13,-8,10.5,3.8,copper],[-7,-12,9,3.2,autumnBrown],[4,-13,8.5,3.4,copper]])maple(x,z,h,w,p);
// Small planted beds are deliberately irregular, leaving the central tower clear.
const detail=new Batch();for(let i=0;i<1700;i++){const x=(rnd()-.5)*36,z=(rnd()-.5)*33;if(!((x<-8&&z<12)||(x>8&&z>-4)||(z<-10&&x>-7)))continue;detail.box(x,.24,z,.05+rnd()*.15,.04,.07+rnd()*.13,pick([0x7d8258,0x6d774e,0x919169,0x788157]));}
for(const [x,z]of[[-11,9],[11,9],[13,-9],[-6,-13]]){for(let i=0;i<140;i++){const a=rnd()*TAU,r=Math.sqrt(rnd())*1.6;detail.box(x+Math.cos(a)*r,.3+rnd()*.55,z+Math.sin(a)*r,.18+rnd()*.3,.16+rnd()*.17,.17+rnd()*.25,pick([0x536449,0x5e6f4f,0x717b50,0x455c46]),wood);}}
// Four metal paddles spin above their tripod, as in the photograph's foreground.
const sculpture=new T.Group();sculpture.position.set(9.2,.2,15.1);scene.add(sculpture);const sb=new Batch(sculpture);
beam(sb,[0,0,0],[0,5.8,0],.13,.13,0x65767b,metal);for(let k=0;k<3;k++){const a=k*TAU/3;beam(sb,[Math.cos(a)*1.1,0,Math.sin(a)*1.1],[0,3.4,0],.075,.075,0x627378,metal);}sb.finish();
const spinner=new T.Group();spinner.position.y=5.7;spinner.rotation.y=-.2;sculpture.add(spinner);const spokes=new Batch(spinner),paddleMat=new T.MeshStandardMaterial({color:0x7a8279,metalness:.72,roughness:.45});
mesh(new T.SphereGeometry(.20,12,8),steel,0,0,0,spinner);
for(let k=0;k<4;k++){const a=k*TAU/4+.35,c=Math.cos(a),s=Math.sin(a);beam(spokes,[0,0,0],[c*1.75,s*1.75,0],.045,.06,0x65747a,metal);const p=mesh(new T.SphereGeometry(1,16,8),paddleMat,c*1.95,s*1.95,0,spinner);p.scale.set(.39,1.4,.07);p.rotation.set(.20,0,a-Math.PI/2+.20);beam(spokes,[c*.6,s*.6,.15],[c*2.55,s*2.55,.02],.023,.026,0xa1a798,metal);}spokes.finish();detail.finish();
const fallen=[];for(let i=0;i<800;i++){const x=(rnd()-.5)*36,z=(rnd()-.5)*33;if(Math.abs(x)<5&&Math.abs(z)<5)continue;fallen.push({x,y:.23,z,s:.09+rnd()*.17,rx:-Math.PI/2,ry:0,rz:rnd()*TAU,c:pick([...autumnBrown,...copper,0xb9a675])});}leaves(fallen);
// Low-contrast procedural clouds fill the sky without external textures.
const skyUniforms={horizon:{value:scene.fog.color.clone().convertLinearToSRGB()},zenith:{value:new T.Color(0x8293a2).convertLinearToSRGB()},time:{value:0}};
const sky=new T.Mesh(new T.SphereGeometry(480,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,toneMapped:false,uniforms:skyUniforms,vertexShader:'varying vec3 direction; void main(){direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 direction; uniform vec3 horizon; uniform vec3 zenith; uniform float time;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
void main(){vec3 d=normalize(direction);float h=clamp(d.y,0.,1.);vec2 p=d.xz/(.3+abs(d.y))*.95+vec2(time*.0012,0.);float n=noise(p*2.)*.54+noise(p*5.)*.27+noise(p*11.)*.13+noise(p*23.)*.06;vec3 c=mix(horizon,zenith,sqrt(h));c+=(n-.5)*.10*smoothstep(.01,.18,h);gl_FragColor=vec4(c,1.);
}` }));sky.renderOrder=-1;scene.add(sky);
const fallingMax=150,falling=new T.InstancedMesh(leafGeo,leafMat,fallingMax);falling.frustumCulled=false;scene.add(falling);const drift=[];
for(let i=0;i<fallingMax;i++){const tree=leafGroups[i%leafGroups.length];drift.push({x:tree.x+(rnd()-.5)*5,z:tree.z+(rnd()-.5)*5,h:tree.h,phase:rnd(),spin:rnd()*TAU,s:.13+rnd()*.11,v:.035+rnd()*.025});falling.setColorAt(i,new T.Color(pick(tree.palette)));}
let wind=.3,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,golden=false,auto=false,time=0,transition=null,viewName='all';
function setWind(v){wind=v;falling.count=v===0?0:Math.round(10+v*(fallingMax-10));$('wind-label').textContent=v<.05?'风停':v<.65?'秋风':'风起';$('weather-desc').textContent=v<.05?'树梢静候':v<.65?'叶落云低':'翻动秋色';}
$('wind').oninput=e=>setWind(Number(e.target.value));setWind(wind);
function setLight(){golden=!golden;hemi.intensity=golden?.9:2.3;sun.intensity=golden?.75:1.6;sun.color.set(golden?0xbdcde1:0xecf1ee);rim.intensity=golden?.85:1.2;scene.background.set(golden?0x4f677b:0xadb8c1);scene.fog.color.copy(scene.background);floor.material.color.set(golden?0x566977:0xaab5bd);skyUniforms.horizon.value.copy(scene.fog.color).convertLinearToSRGB();skyUniforms.zenith.value.set(golden?0x283f5c:0x8293a2).convertLinearToSRGB();ivory.color.set(golden?0xd3d0b8:0xd4d3bd);ivory.emissive.set(0xc1cbbb);ivory.emissiveIntensity=golden?.14:0;windowGlow.emissiveIntensity=golden?1.9:.04;warmMat.emissiveIntensity=golden?2.5:.12;beaconMat.emissiveIntensity=golden?3:.1;lamps.forEach(l=>l.intensity=golden?10:0);$('light').classList.toggle('active',golden);$('light').setAttribute('aria-pressed',String(golden));$('light').innerHTML=golden?icons.moon:icons.sun;$('dusk-label').textContent=golden?'蓝调 · 云端灯火':'阴天 · 银灰天光';}
warmMat.emissiveIntensity=.12;
const target=new T.Vector3(0,24,0);let radius=108,theta=.42,phi=1.22;
const presets={all:{fov:42,r:108,t:.42,p:1.22,target:new T.Vector3(0,24,0)},photo:{fov:48,r:71,t:.24,p:1.999,target:new T.Vector3(0,32,0)},deck:{fov:43,r:29,t:.62,p:1.21,target:new T.Vector3(0,47.2,0)}};
function framing(name){return name==='all'?Math.max(1,.64/camera.aspect):name==='deck'?Math.max(1,.85/camera.aspect):1;}
let cameraScale=framing('all');
function setView(name){const startScale=cameraScale;viewName=name;transition={start:performance.now(),from:{fov:camera.fov,r:radius,t:theta,p:phi,target:target.clone(),scale:startScale},to:presets[name]};document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===name);b.setAttribute('aria-pressed',String(b.dataset.view===name));});$('view-label').textContent={all:'城市全景',photo:'树下仰望',deck:'云端近看'}[name];}
function updateCamera(){const r=radius*cameraScale;scene.fog.near=r+90;scene.fog.far=r+280;camera.position.set(target.x+r*Math.sin(phi)*Math.sin(theta),Math.max(1.6,target.y+r*Math.cos(phi)),target.z+r*Math.sin(phi)*Math.cos(theta));camera.lookAt(target);sky.position.copy(camera.position);}
const pointers=new Map();let lastX=0,lastY=0,pinch=0,interaction=0;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastX=e.clientX;lastY=e.clientY;transition=null;interaction=performance.now();});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch)radius=T.MathUtils.clamp(radius*pinch/d,6,180);pinch=d;}else{const dx=e.clientX-lastX,dy=e.clientY-lastY;if(e.shiftKey||e.buttons===2){target.addScaledVector(new T.Vector3().setFromMatrixColumn(camera.matrix,0),-dx*radius*.001);target.addScaledVector(new T.Vector3().setFromMatrixColumn(camera.matrix,1),dy*radius*.001);}else{theta-=dx*.005;phi=T.MathUtils.clamp(phi+dy*.004,.20,2.85);}}lastX=e.clientX;lastY=e.clientY;interaction=performance.now();});
for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,e=>{pointers.delete(e.pointerId);pinch=0;});canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('wheel',e=>{e.preventDefault();transition=null;radius=T.MathUtils.clamp(radius*Math.exp(e.deltaY*.001),6,180);interaction=performance.now();},{passive:false});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
function syncPause(){$('pause').classList.toggle('active',paused);$('pause').setAttribute('aria-pressed',String(paused));$('pause').innerHTML=paused?icons.play:icons.pause;}syncPause();
$('pause').onclick=()=>{paused=!paused;syncPause();};$('orbit').onclick=()=>{auto=!auto;$('orbit').classList.toggle('active',auto);$('orbit').setAttribute('aria-pressed',String(auto));};$('light').onclick=setLight;
$('help').onclick=()=>{$('guide').hidden=!$('guide').hidden;};$('close-guide').onclick=()=>{$('guide').hidden=true;};$('capture').onclick=()=>{renderer.render(scene,camera);const data=canvas.toDataURL('image/png');$('snapshot-image').src=data;$('snapshot-save').href=data;$('snapshot-save').download='云下太空针.png';$('snapshot-panel').showModal();};$('snapshot-close').onclick=()=>$('snapshot-panel').close();
addEventListener('keydown',e=>{if(e.key==='Escape'){$('guide').hidden=true;document.body.classList.remove('clean');}if(e.target.matches('input,textarea,select')||e.target.isContentEditable)return;if(e.key.toLowerCase()==='h')document.body.classList.toggle('clean');if(e.key.toLowerCase()==='r')setView('all');if(e.code==='Space'&&e.target===document.body){e.preventDefault();$('pause').click();}});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;if(!transition)cameraScale=framing(viewName);camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
$('voxel-count').textContent='太空针塔';
let last=performance.now(),frames=0,fpsStart=last;
const smooth=t=>t*t*(3-2*t);
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.06,(now-last)/1000);last=now;if(!paused)time+=dt;
 if(transition){const raw=Math.min(1,(now-transition.start)/1700),t=smooth(raw),a=transition.from,b=transition.to;camera.fov=mix(a.fov,b.fov,t);camera.updateProjectionMatrix();radius=mix(a.r,b.r,t);theta=mix(a.t,b.t,t);phi=mix(a.p,b.p,t);target.lerpVectors(a.target,b.target,t);cameraScale=mix(a.scale,framing(viewName),t);if(raw===1)transition=null;}else if(auto&&!paused&&!pointers.size&&now-interaction>1500)theta+=dt*.027;
 for(const tree of leafGroups){tree.g.rotation.z=Math.sin(time*.48+tree.phase)*wind*.007;tree.g.rotation.x=Math.cos(time*.37+tree.phase)*wind*.004;}
 for(let i=0;i<falling.count;i++){const f=drift[i],p=(f.phase+time*f.v*(wind*.55+.25))%1,x=f.x+Math.sin(p*TAU+f.spin)*(.2+wind)+p*wind*1.7,z=f.z+Math.sin(p*4+f.spin)*.55;dummy.position.set(x,.27+(1-p)*(f.h-.27),z);dummy.scale.setScalar(f.s*Math.min(1,(1-p)*18));dummy.rotation.set(-Math.PI/2+Math.sin(p*7+f.spin)*.7,f.spin+p*5,p*5+f.spin);dummy.updateMatrix();falling.setMatrixAt(i,dummy.matrix);}falling.instanceMatrix.needsUpdate=true;
 if(!paused)spinner.rotation.z+=dt*wind*.16;skyUniforms.time.value=time;
 lifts.forEach((lift,i)=>{const p=(time/54+i*.31)%1,progress=p<.42?smooth(p/.42):p<.5?1:p<.92?1-smooth((p-.5)/.42):0;lift.position.y=mix(2.9,43.1,progress);});
 updateCamera();canvas.dataset.cameraView=transition?'moving':viewName;renderer.render(scene,camera);frames++;if(now-fpsStart>2000){canvas.dataset.renderStats=JSON.stringify({voxels:voxelCount,trees:leafGroups.length,fallingLeaves:falling.count,fps:Math.round(frames*1000/(now-fpsStart)),view:viewName,night:golden,paused,wind});frames=0;fpsStart=now;}}
$('loading').classList.add('done');setTimeout(()=>$('loading').remove(),700);requestAnimationFrame(animate);
})();

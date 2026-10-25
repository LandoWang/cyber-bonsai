(()=>{
'use strict';
const T=THREE,$=id=>document.getElementById(id),TAU=Math.PI*2,mix=T.MathUtils.lerp;
let seed=90817;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;},pick=a=>a[Math.floor(rnd()*a.length)];
const scene=new T.Scene();scene.background=new T.Color(0xaeb9ad);scene.fog=new T.Fog(0xaeb9ad,95,230);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;$('world').appendChild(renderer.domElement);
const canvas=renderer.domElement;canvas.setAttribute('aria-label','安静庭院中的灰瓦木亭，曲檐、木柱、石板、绿篱和缓缓飘落的叶子');
const camera=new T.PerspectiveCamera(43,innerWidth/innerHeight,.08,1000);
const hemi=new T.HemisphereLight(0xe5eadb,0x69745b,2.5);scene.add(hemi);
const sun=new T.DirectionalLight(0xfff1d4,2.0);sun.position.set(-16,27,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-33,right:33,top:33,bottom:-33,near:.1,far:100});sun.shadow.normalBias=.045;sun.shadow.bias=-.0002;scene.add(sun);
const rim=new T.DirectionalLight(0xd2e3e5,1.5);rim.position.set(24,17,-22);scene.add(rim);
const stone=new T.MeshStandardMaterial({roughness:.94}),wood=new T.MeshStandardMaterial({roughness:1}),metal=new T.MeshStandardMaterial({roughness:.55,metalness:.4}),glass=new T.MeshStandardMaterial({roughness:.24,metalness:.15}),leafMat=new T.MeshStandardMaterial({roughness:1,side:T.DoubleSide}),warmMat=new T.MeshStandardMaterial({emissive:0xffb355,emissiveIntensity:.5,roughness:.5}),roadMat=new T.MeshStandardMaterial({roughness:.85});
const box=new T.BoxGeometry(1,1,1),dummy=new T.Object3D();let voxelCount=0;
class Batch{constructor(parent=scene){this.parent=parent;this.layers=new Map();}box(x,y,z,w,h,d,c,m=stone,rot=null){if(!this.layers.has(m))this.layers.set(m,[]);this.layers.get(m).push({x,y,z,w,h,d,c,rot});}finish(){for(const [mat,items]of this.layers){const mesh=new T.InstancedMesh(box,mat,items.length);mesh.castShadow=true;mesh.receiveShadow=true;items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.w,v.h,v.d);dummy.quaternion.identity();if(v.rot instanceof T.Quaternion)dummy.quaternion.copy(v.rot);else if(v.rot)dummy.rotation.set(...v.rot);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color(v.c));});mesh.computeBoundingSphere();this.parent.add(mesh);voxelCount+=items.length;}this.layers.clear();}}
function beam(b,a,c,w,d,col,mat=wood){const p=new T.Vector3(...a),q=new T.Vector3(...c),v=q.clone().sub(p),rot=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()),mid=p.add(q).multiplyScalar(.5);b.box(mid.x,mid.y,mid.z,w,v.length(),d,col,mat,rot);}

// A shallow cutaway garden keeps the pavilion readable from every side.
const garden=new Batch();
garden.box(0,-.48,0,31,1.1,28,0x626456);
garden.box(0,.10,0,30.8,.20,27.8,0x6f8054);
garden.box(0,-.99,0,30.5,.12,27.5,0x394b3c);
const floor=new T.Mesh(new T.PlaneGeometry(3000,3000),new T.MeshStandardMaterial({color:0xaeb9ad,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.07;floor.receiveShadow=true;scene.add(floor);
// Grass has small variations rather than a uniform carpet.
for(let i=0;i<3400;i++){const x=(rnd()-.5)*30.5,z=(rnd()-.5)*27.5;if(Math.abs(x)<5.9&&Math.abs(z)<5.5||Math.abs(x)<2.0&&z>5)continue;const s=.07+rnd()*.19;garden.box(x,.22+rnd()*.018,z,s,.026,s*1.7,pick([0x788658,0x829164,0x637948,0x8b9462,0x6e814f]));}
// Broad weathered stone landing and three low steps.
garden.box(0,.38,0,11.6,.38,10.6,0x7d8279);
for(let x=-5.15;x<5.6;x+=1.15)for(let z=-4.7;z<5.1;z+=1.05)garden.box(x,.60,z,1.125,.08,1.025,pick([0x999d91,0x95998e,0xa1a498,0x8c9389,0xa5a698]));
for(let k=0;k<3;k++)garden.box(0,.28+k*.12,6.15-k*.47,3.9,.18,.62,0x9da093);
for(let z=6.5;z<13;z+=1.04)for(let x=-1.3;x<=1.31;x+=1.3)garden.box(x,.24,z,1.27,.10,1.00,pick([0xaaa999,0x969b8b,0xb1afa0,0x9e9f90]));
// Ivory courtyard wall; its dark coping is largely hidden behind green hedges.
garden.box(0,1.65,-12.8,30,.3+2.6,.38,0xc1bfa7);garden.box(0,3.16,-12.8,30.3,.18,.64,0x667260);
for(let x=-14;x<=14;x+=4.65){garden.box(x,1.75,-12.72,.38,3.1,.58,0xccc7af);garden.box(x,3.32,-12.72,.52,.10,.73,0x7d8670);}
for(let j=0;j<5;j++)for(let x=-14.4;x<14.5;x+=1.0)garden.box(x+(j%2)*.5,.53+j*.52,-12.59,.006,.46,.013,0xaaa994);
garden.finish();

// Warm wood grain is generated locally so the saved HTML remains self-contained.
const timberCanvas=document.createElement('canvas');timberCanvas.width=128;timberCanvas.height=512;const timberCtx=timberCanvas.getContext('2d');
timberCtx.fillStyle='#d2ae76';timberCtx.fillRect(0,0,128,512);
for(let i=0;i<160;i++){const x=rnd()*128;timberCtx.strokeStyle=pick(['#b99360','#bd995f','#dfbb81','#d9b579']);timberCtx.lineWidth=.4+rnd()*1.3;timberCtx.beginPath();timberCtx.moveTo(x,0);timberCtx.bezierCurveTo(x-5,150,x+5,330,x,512);timberCtx.stroke();}
const timberTexture=new T.CanvasTexture(timberCanvas);timberTexture.colorSpace=T.SRGBColorSpace;const timber=new T.MeshStandardMaterial({map:timberTexture,roughness:.87});
const structure=new Batch(),oak=0xd6a66b,darkOak=0x815432,cream=0xe4dfc8,black=0x343c38;
structure.box(0,.79,0,8.45,.26,7.4,black);
for(let x=-3.88;x<4.1;x+=.43)structure.box(x,.94,0,.412,.10,6.80,pick([0xaba793,0x9f9e8d,0xb4af99,0xa29e8b]));
for(const x of[-4,4])structure.box(x,1.06,0,.23,.30,7.3,black);
for(const z of[-3.55,3.55]){structure.box(z<0?0:-2.9,1.06,z,z<0?8.2:2.35,.30,.23,black);if(z>0)structure.box(2.9,1.06,z,2.35,.30,.23,black);}
// The paired corner posts and white bearing ends echo the reference timberwork.
for(const sx of[-1,1])for(const sz of[-1,1])for(let k=0;k<2;k++){
 const x=sx*(3.65-k*.64),z=sz*3.05;
 structure.box(x,.99,z,.52,.20,.52,0x41463e);structure.box(x,3.27,z,.40,4.38,.43,oak,timber);
 structure.box(x,5.20,z,.64,.23,.67,0xbd935c,timber);structure.box(x,5.43,z,.83,.20,.58,oak,timber);
 structure.box(x,2.72,z,.47,.23,.51,0xb98b51,timber);
}
for(const z of[-3.05,3.05]){structure.box(0,4.85,z,8.05,.42,.40,oak,timber);structure.box(0,5.46,z,9.0,.36,.53,0xbc8a53,timber);}
for(const x of[-3.65,3.65]){structure.box(x,4.98,0,.40,.40,7.6,oak,timber);structure.box(x,5.53,0,.50,.30,8.4,0xbc8a53,timber);}
for(const sx of[-1,1])for(const sz of[-1,1]){
 beam(structure,[sx*3.6,4.0,sz*3.05],[sx*2.65,4.73,sz*3.05],.22,.23,0xcda064,timber);
 beam(structure,[sx*3.65,4.2,sz*3.00],[sx*3.65,4.91,sz*2.15],.22,.23,0xcda064,timber);
 structure.box(sx*4.49,5.46,sz*3.05,.04,.31,.46,cream);structure.box(sx*3.65,5.53,sz*4.21,.45,.26,.04,cream);
}
// Low rails on the sides leave an open, inviting entrance; a bench sits at the back.
for(const x of[-3.65,3.65]){structure.box(x,2.21,0,.22,.25,6.0,oak,timber);for(const z of[-1.5,0,1.5])structure.box(x,1.67,z,.15,1.0,.15,0xb78953,timber);}
for(const z of[-2.65,-2.34,-2.03])structure.box(0,1.59,z,5.5,.15,.27,0xc69660,timber);
for(const x of[-2.05,2.05])structure.box(x,1.24,-2.34,.25,.65,.92,0x89613c,timber);
structure.box(0,2.12,-3.07,6.6,.18,.20,oak,timber);

// Hip-and-gable roof: a curved main slope intersects a lower hipped skirt.
// The discontinuity at z=±2 is the timber gable, not a missing roof face.
const W=6.5,D=6,G=2,eave=5.95;
function sideRoof(x){return eave+4.7*Math.pow(Math.max(0,1-Math.abs(x)/W),1.6);}
function roofHeight(x,z){const cap=Math.abs(z)<=G?Infinity:eave+1.52*Math.pow(Math.max(0,1-(Math.abs(z)-G)/(D-G)),1.4);return Math.min(sideRoof(x),cap)+.34*Math.pow(Math.max(Math.abs(x)/W,Math.abs(z)/D),10);}
const roof=new Batch(),slate=new T.MeshStandardMaterial({roughness:1});
const slateColors=[0x626b67,0x656e6a,0x67706c,0x646d69,0x616a66,0x666f6a,0x646d68];
for(let ix=0;ix<52;ix++)for(let iz=0;iz<48;iz++){
 const x=-W+.125+ix*.25,z=-D+.125+iz*.25,h=roofHeight(x,z),dx=(roofHeight(x+.025,z)-roofHeight(x-.025,z))/.05,dz=(roofHeight(x,z+.025)-roofHeight(x,z-.025))/.05;
 const rotation=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(-dx,1,-dz).normalize());
 roof.box(x,h,z,.259*Math.sqrt(1+dx*dx),.075,.257*Math.sqrt(1+dz*dz),pick(slateColors),slate,rotation);
 // Fine staggered shingle joints follow the direction of each roof slope.
 const alongX=Math.abs(dx)>Math.abs(dz),edge=alongX?new T.Vector3(.123,.044,0):new T.Vector3(0,.044,.123);edge.applyQuaternion(rotation);
 roof.box(x+edge.x,h+edge.y,z+edge.z,alongX?.012:.255,.009,alongX?.255:.012,0x4b5651,slate,rotation);
 if((alongX?iz:ix)%2===(alongX?ix:iz)%2){const seam=alongX?new T.Vector3(0,.044,.123):new T.Vector3(.123,.044,0);seam.applyQuaternion(rotation);roof.box(x+seam.x,h+seam.y,z+seam.z,alongX?.255:.009,.008,alongX?.009:.255,0x515d57,slate,rotation);}
 // Continuous wood decking, visible between the rafters from the seated view.
 roof.box(x,h-.14,z,.262*Math.sqrt(1+dx*dx),.12,.262*Math.sqrt(1+dz*dz),0x9a7044,timber,rotation);
}
// Double fascia and small rafter tails, each capped in ivory.
for(const s of[-1,1]){
 for(let x=-W;x<W;x+=.25){const a=[x,roofHeight(x,s*D)-.15,s*D],b=[x+.25,roofHeight(x+.25,s*D)-.15,s*D];beam(roof,a,b,.30,.15,0x505d57,slate);beam(structure,[x,a[1]-.31,s*D],[x+.25,b[1]-.31,s*D],.18,.22,0x85592f,timber);}
 for(let z=-D;z<D;z+=.25){beam(roof,[s*W,roofHeight(s*W,z)-.15,z],[s*W,roofHeight(s*W,z+.25)-.15,z+.25],.15,.30,0x505d57,slate);}
 for(let x=-6.1;x<=6.2;x+=.47){const y=roofHeight(x,s*5.85)-.49;beam(structure,[x,y,s*5.85],[x,roofHeight(x,s*3.6)-.42,s*3.6],.13,.17,0xc3975b,timber);structure.box(x,y,s*5.92,.14,.17,.08,cream);}
 for(let z=-5.55;z<=5.6;z+=.47){const y=roofHeight(s*6.35,z)-.47;beam(structure,[s*6.33,y,z],[s*3.7,roofHeight(s*3.7,z)-.45,z],.14,.15,0xc3975b,timber);structure.box(s*6.40,y,z,.08,.17,.15,cream);}
}
for(const s of[-1,1]){
 // Vertical gable boards terminate at the main curved roof.
 for(let x=-3.5;x<=3.5;x+=.18){const top=sideRoof(x)-.16,bottom=7.34;if(top>bottom)structure.box(x,(top+bottom)/2,s*2.01,.171,top-bottom,.17,pick([0x91663e,0x9c7043,0x845936]),timber);}
 for(let x=-3.65;x<3.65;x+=.16){beam(structure,[x,sideRoof(x)-.12,s*2.16],[x+.16,sideRoof(x+.16)-.12,s*2.16],.22,.26,0x533e2c,timber);beam(roof,[x,sideRoof(x)+.04,s*2.22],[x+.16,sideRoof(x+.16)+.04,s*2.22],.18,.12,0x798078,slate);}
 for(const x of[-2.7,0,2.7])beam(structure,[x,5.53,s*1.8],[0,10.24,s*1.8],.20,.24,0xab7c45,timber);
 const crest=new T.Mesh(new T.TorusGeometry(.21,.055,6,18),new T.MeshStandardMaterial({color:0xb9a16a,metalness:.5,roughness:.6}));crest.position.set(0,9.16,s*2.20);scene.add(crest);
 for(let k=0;k<3;k++){const a=k*TAU/3;structure.box(Math.sin(a)*.23,9.16+Math.cos(a)*.23,s*2.22,.13,.22,.045,0xc2aa73,metal,[0,0,-a]);}
}
// Weathered copper ridge, with curled, raised ends.
structure.box(0,10.78,0,.38,.40,4.8,0x596f65,metal);structure.box(0,11.02,0,.54,.13,4.95,0x809184,metal);
for(const s of[-1,1]){structure.box(0,10.84,s*2.49,.52,.53,.26,0x4f695e,metal);const curl=new T.Mesh(new T.TorusGeometry(.28,.11,6,14,Math.PI*1.45),new T.MeshStandardMaterial({color:0x70867a,roughness:.6,metalness:.5}));curl.rotation.y=Math.PI/2;curl.rotation.z=s<0?Math.PI:0;curl.position.set(0,11.03,s*2.50);scene.add(curl);curl.castShadow=true;}
structure.finish();roof.finish();
// A still bronze bell in the dim interior; no movement or chime competes with the quiet.
const bellMat=new T.MeshStandardMaterial({color:0x4a5447,metalness:.65,roughness:.65});
const bellPoints=[[.10,.95],[.31,.91],[.40,.70],[.43,.18],[.57,0],[.58,-.10],[.51,-.14],[.36,.14],[.34,.64],[.26,.79]].map(p=>new T.Vector2(...p));
const bell=new T.Mesh(new T.LatheGeometry(bellPoints,24),bellMat);bell.position.set(0,3.35,-1.1);bell.castShadow=true;bell.receiveShadow=true;scene.add(bell);
const fittings=new Batch();fittings.box(0,4.85,-1.1,.08,1.18,.08,0x514f3d,metal);
for(let i=0;i<3;i++){const ring=new T.Mesh(new T.TorusGeometry(.42+i*.025,.026,5,24),bellMat);ring.rotation.x=Math.PI/2;ring.position.set(0,3.60-i*.13,-1.1);scene.add(ring);}
const lamps=[];for(const x of[-2.9,2.9]){fittings.box(x,4.62,-2.75,.38,.51,.38,0xead3a1,warmMat);fittings.box(x,4.94,-2.75,.54,.11,.54,0x475044,metal);for(const sx of[-1,1])for(const sz of[-1,1])fittings.box(x+sx*.2,4.62,-2.75+sz*.2,.04,.56,.04,0x4b5042,metal);const light=new T.PointLight(0xffc47e,0,10,1.6);light.position.set(x,4.4,-2.75);scene.add(light);lamps.push(light);}fittings.finish();

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
   for(let n=0;n<(hero?210:130);n++){
    const az=rnd()*TAU,rr=Math.sqrt(rnd()),vertical=(rnd()-.5)*2,rx=hero?1.7:1.5;
    const px=tip[0]+Math.cos(az)*rr*rx,py=tip[1]+vertical*(1.1-rr*.35),pz=tip[2]+Math.sin(az)*rr*rx;
    foliage.push({x:px,y:py,z:pz,s:.19+rnd()*.20,rx:-Math.PI/2+(rnd()-.5)*1.45,ry:rnd()*TAU,rz:(rnd()-.5)*1.5,c:pick(palette)});
   }
  }
 }
 // Inner clusters connect the outer branches without turning the crown into a shell.
 for(let i=0;i<(hero?680:260);i++){const a=rnd()*TAU,r=Math.sqrt(rnd())*(hero?2.1:1.4);foliage.push({x:Math.cos(a)*r+(hero?.6:0),y:h*.86+(rnd()-.5)*2.0,z:Math.sin(a)*r,s:.2+rnd()*.16,rx:-Math.PI/2+(rnd()-.5)*1.4,ry:rnd()*TAU,rz:rnd()*TAU,c:pick(palette)});}
 // Small lichen flecks follow the trunk surface instead of forming horizontal bands.
 const lichen=new Batch(group);
 for(let i=0;i<(hero?115:35);i++){const a=rnd()*TAU,y=rnd()*2.7,r=mix(baseR,baseR*.64,y/4.2);lichen.box(Math.sin(a)*r,y,Math.cos(a)*r,.018+rnd()*.065,.045+rnd()*.14,.025,pick([0x778278,0x909782,0xa8ad9a]),wood,[0,a,0]);}lichen.finish();
 limbs.finish();const crown=new T.Group();group.add(crown);leaves(foliage,crown,crownGeo);leafGroups.push({g:crown,phase:rnd()*TAU,x,z,h,palette});return group;
}
const greens=[0x54734b,0x678352,0x78935b,0x4c704c,0x849666,0x5d7d47];
maple(-10,-5.8,11.8,4.5,greens);
maple(9.2,-7.1,9.3,3.9,[0x953b37,0xac4940,0xb45b43,0x8f4138,0xc47047]);
maple(-11.3,7.4,8.6,3.1,[0x778349,0x919354,0x9c9c5d,0x607d4d]);
maple(-5.5,10.4,6.6,2.7,[0x9f883f,0xa3974e,0xb3a257,0x77864a]);
// Clipped evergreen hedges have layered little leaves along soft, irregular outlines.
const shrubs=new Batch();
function hedge(x,z,w,d,h){shrubs.box(x,h*.46+.2,z,w*.96,h*.72,d*.94,0x3f5e40);for(let i=0;i<w*d*100;i++){const px=x+(rnd()-.5)*w,pz=z+(rnd()-.5)*d,y=.2+h*(.58+rnd()*.47);const a=rnd()*TAU,s=.10+rnd()*.18;shrubs.box(px,y,pz,s,.06,s*1.5,pick([0x44633f,0x5f7950,0x587345,0x6e8452,0x4b6b48]),wood,[(rnd()-.5),a,(rnd()-.5)*.5]);}}
hedge(-8.2,-10.6,10.5,2,1.75);hedge(6.7,-10.7,12,2,1.5);hedge(-13.9,0,1.5,15,1.3);hedge(13.1,-1,2,16,1.25);hedge(8.6,9.8,9,2.0,.80);hedge(-9.2,11.2,7.6,1.6,.66);
// Tufts, rocks and a small stone lantern make the approaches feel tended.
for(const [x,z]of[[-7,4.8],[7.1,3.6],[-10,7.6],[10.5,-2.7],[8.2,7.8]]){for(let j=0;j<30;j++){const a=rnd()*TAU,r=rnd()*.65;beam(shrubs,[x,.24,z],[x+Math.sin(a)*r,.37+rnd()*.50,z+Math.cos(a)*r],.04,.08,pick([0x657b49,0x8a945a,0x537344]),wood);}const rock=new T.Mesh(new T.DodecahedronGeometry(.42+rnd()*.30,0),new T.MeshStandardMaterial({color:0x858f80,roughness:1}));rock.position.set(x+.6,.35,z+.3);rock.scale.set(1.3,.66,1);rock.rotation.set(.1,rnd()*TAU,.2);rock.castShadow=true;scene.add(rock);}
const lx=7.4,lz=5.9;shrubs.box(lx,.35,lz,1.05,.22,1.05,0x838e7c);shrubs.box(lx,.83,lz,.34,.86,.34,0x98a08d);shrubs.box(lx,1.30,lz,.80,.18,.8,0x929c86);shrubs.box(lx,1.68,lz,.48,.57,.48,0x3f4b3d);shrubs.box(lx,1.68,lz+.251,.25,.30,.012,0xc1b586,warmMat);shrubs.box(lx,2.03,lz,1.03,.17,1.03,0x7e8b76);shrubs.box(lx,2.17,lz,.66,.15,.66,0x909c87);shrubs.box(lx,2.33,lz,.20,.21,.20,0x7f8c78);shrubs.finish();
const fallen=[];for(let i=0;i<520;i++){const x=(rnd()-.5)*29,z=(rnd()-.5)*26;let y=.25;if(Math.abs(x)<5.8&&Math.abs(z)<5.3)y=.66;if(Math.abs(x)<4.2&&Math.abs(z)<3.6)y=1.01;fallen.push({x,y,z,s:.10+rnd()*.14,rx:-Math.PI/2,ry:0,rz:rnd()*TAU,c:pick([0xae8c4c,0xc5a566,0xb98244,0x8d7443,0xc0ae71])});}
for(let i=0;i<45;i++){const x=(rnd()-.5)*12,z=(rnd()-.5)*11;fallen.push({x,y:roofHeight(x,z)+.12,z,s:.10+rnd()*.13,rx:-Math.PI/2,ry:0,rz:rnd()*TAU,c:pick([0xc4a56a,0xa69459,0x9e8b52])});}leaves(fallen);
const fallingMax=90,falling=new T.InstancedMesh(leafGeo,leafMat,fallingMax);falling.frustumCulled=false;scene.add(falling);const drift=[];
for(let i=0;i<fallingMax;i++){const tree=leafGroups[i%leafGroups.length];drift.push({x:tree.x+(rnd()-.5)*5,z:tree.z+(rnd()-.5)*5,h:tree.h,phase:rnd(),spin:rnd()*TAU,s:.12+rnd()*.10,v:.023+rnd()*.018});falling.setColorAt(i,new T.Color(pick(tree.palette)));}
let wind=.2,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,golden=false,auto=false,time=0,transition=null,viewName='all';
function setWind(v){wind=v;falling.count=v===0?0:Math.round(7+v*(fallingMax-7));$('wind-label').textContent=v<.05?'无风':v<.55?'微风':'风过树梢';$('weather-desc').textContent=v<.05?'叶静庭闲':v<.55?'偶有叶落':'一庭轻响';}
$('wind').oninput=e=>setWind(Number(e.target.value));setWind(wind);
function setLight(){golden=!golden;hemi.intensity=golden?.95:2.5;sun.intensity=golden?1.6:2.0;sun.color.set(golden?0xffb970:0xfff1d4);sun.position.set(-16,golden?9:27,15);rim.intensity=golden?.65:1.5;scene.background.set(golden?0x687772:0xaeb9ad);scene.fog.color.copy(scene.background);floor.material.color.copy(scene.background);lamps.forEach(l=>l.intensity=golden?15:0);warmMat.emissiveIntensity=golden?2.3:.15;renderer.toneMappingExposure=golden?1.0:1.1;$('light').classList.toggle('active',golden);$('light').setAttribute('aria-pressed',String(golden));$('light').innerHTML=golden?icons.moon:icons.sun;$('dusk-label').textContent=golden?'暮色 · 一亭暖灯':'午后 · 木色温润';}
warmMat.emissiveIntensity=.15;
const target=new T.Vector3(0,2.6,0);let radius=51,theta=.53,phi=1.10;
const presets={all:{fov:43,r:51,t:.53,p:1.10,target:new T.Vector3(0,2.6,0)},eaves:{fov:47,r:24,t:.52,p:1.42,target:new T.Vector3(0,4.4,0)},inside:{fov:68,r:12,t:2.76,p:1.58,target:new T.Vector3(-4.5,2.4,9.8)}};
function setView(name){viewName=name;transition={start:performance.now(),from:{fov:camera.fov,r:radius,t:theta,p:phi,target:target.clone()},to:presets[name]};document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===name);b.setAttribute('aria-pressed',String(b.dataset.view===name));});$('view-label').textContent={all:'庭院全景',eaves:'檐下看木',inside:'亭中小坐'}[name];}
function updateCamera(){const r=radius*(viewName==='all'?Math.max(1,1.12/camera.aspect):viewName==='eaves'?Math.max(1,.75/camera.aspect):1);scene.fog.near=r+65;scene.fog.far=r+200;camera.position.set(target.x+r*Math.sin(phi)*Math.sin(theta),Math.max(1.6,target.y+(viewName==='inside'?radius:r)*Math.cos(phi)),target.z+r*Math.sin(phi)*Math.cos(theta));camera.lookAt(target);}
const pointers=new Map();let lastX=0,lastY=0,pinch=0,interaction=0;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastX=e.clientX;lastY=e.clientY;transition=null;interaction=performance.now();});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch)radius=T.MathUtils.clamp(radius*pinch/d,2,90);pinch=d;}else{const dx=e.clientX-lastX,dy=e.clientY-lastY;if(e.shiftKey||e.buttons===2){target.addScaledVector(new T.Vector3().setFromMatrixColumn(camera.matrix,0),-dx*radius*.001);target.addScaledVector(new T.Vector3().setFromMatrixColumn(camera.matrix,1),dy*radius*.001);}else{theta-=dx*.005;phi=T.MathUtils.clamp(phi+dy*.004,.20,1.95);}}lastX=e.clientX;lastY=e.clientY;interaction=performance.now();});
for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,e=>{pointers.delete(e.pointerId);pinch=0;});canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('wheel',e=>{e.preventDefault();transition=null;radius=T.MathUtils.clamp(radius*Math.exp(e.deltaY*.001),2,90);interaction=performance.now();},{passive:false});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
function syncPause(){$('pause').classList.toggle('active',paused);$('pause').setAttribute('aria-pressed',String(paused));$('pause').innerHTML=paused?icons.play:icons.pause;}syncPause();
$('pause').onclick=()=>{paused=!paused;syncPause();};$('orbit').onclick=()=>{auto=!auto;$('orbit').classList.toggle('active',auto);$('orbit').setAttribute('aria-pressed',String(auto));};$('light').onclick=setLight;
$('help').onclick=()=>{$('guide').hidden=!$('guide').hidden;};$('close-guide').onclick=()=>{$('guide').hidden=true;};$('capture').onclick=()=>{renderer.render(scene,camera);const data=canvas.toDataURL('image/png');$('snapshot-image').src=data;$('snapshot-save').href=data;$('snapshot-save').download='静庭听叶.png';$('snapshot-panel').showModal();};$('snapshot-close').onclick=()=>$('snapshot-panel').close();
addEventListener('keydown',e=>{if(e.key==='Escape'){$('guide').hidden=true;document.body.classList.remove('clean');}if(e.target.matches('input,textarea,select')||e.target.isContentEditable)return;if(e.key.toLowerCase()==='h')document.body.classList.toggle('clean');if(e.key.toLowerCase()==='r')setView('all');if(e.code==='Space'&&e.target===document.body){e.preventDefault();$('pause').click();}});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
$('voxel-count').textContent='一方静庭';
let last=performance.now(),frames=0,fpsStart=last;
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.06,(now-last)/1000);last=now;if(!paused)time+=dt;
 if(transition){const raw=Math.min(1,(now-transition.start)/1500),t=raw*raw*(3-2*raw),a=transition.from,b=transition.to;camera.fov=mix(a.fov,b.fov,t);camera.updateProjectionMatrix();radius=mix(a.r,b.r,t);theta=mix(a.t,b.t,t);phi=mix(a.p,b.p,t);target.lerpVectors(a.target,b.target,t);if(raw===1)transition=null;}else if(auto&&!paused&&!pointers.size&&now-interaction>1500)theta+=dt*.028;
 for(const tree of leafGroups){tree.g.rotation.z=Math.sin(time*.40+tree.phase)*wind*.005;tree.g.rotation.x=Math.cos(time*.31+tree.phase)*wind*.004;}
 for(let i=0;i<falling.count;i++){const f=drift[i],p=(f.phase+time*f.v*(wind*.6+.25))%1,x=f.x+Math.sin(p*TAU+f.spin)*(.2+wind)+p*wind,z=f.z+Math.sin(p*4+f.spin)*.45;const landing=Math.abs(x)<W&&Math.abs(z)<D?roofHeight(x,z)+.12:.29;const y=landing+(1-p)*Math.max(.1,f.h-landing);dummy.position.set(x,y,z);dummy.scale.setScalar(f.s*Math.min(1,(1-p)*20));dummy.rotation.set(-Math.PI/2+Math.sin(p*6+f.spin)*.6,f.spin+p*5,p*5+f.spin);dummy.updateMatrix();falling.setMatrixAt(i,dummy.matrix);}falling.instanceMatrix.needsUpdate=true;
 updateCamera();canvas.dataset.cameraView=transition?'moving':viewName;renderer.render(scene,camera);frames++;if(now-fpsStart>2000){canvas.dataset.renderStats=JSON.stringify({voxels:voxelCount,trees:leafGroups.length,fallingLeaves:falling.count,fps:Math.round(frames*1000/(now-fpsStart)),view:viewName,golden,paused,wind});frames=0;fpsStart=now;}}
$('loading').classList.add('done');setTimeout(()=>$('loading').remove(),700);requestAnimationFrame(animate);
})();

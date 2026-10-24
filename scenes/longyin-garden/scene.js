(() => {
'use strict';
const $=id=>document.getElementById(id), T=THREE;
let seed=47612; const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const pick=a=>a[Math.floor(rand()*a.length)], lerp=T.MathUtils.lerp, TAU=Math.PI*2;
const scene=new T.Scene();
const renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7)); renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.outputColorSpace=T.SRGBColorSpace; renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.08;
$('world').appendChild(renderer.domElement); renderer.domElement.setAttribute('aria-label','可拖拽旋转的龙吟浮樱三维体素花园');
const camera=new T.PerspectiveCamera(43,innerWidth/innerHeight,.1,220);
const hemi=new T.HemisphereLight(0xbbe8ed,0x59756a,2.1);scene.add(hemi);
const sun=new T.DirectionalLight(0xffdec0,3.3);sun.position.set(-13,26,19);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-23,right:23,top:24,bottom:-20,near:.5,far:85});
sun.shadow.bias=-.00025;sun.shadow.normalBias=.055;scene.add(sun);
const rim=new T.DirectionalLight(0x7edbdf,1.9);rim.position.set(12,12,-16);scene.add(rim);
const fill=new T.DirectionalLight(0xfbb0a5,1.1);fill.position.set(12,4,16);scene.add(fill);
const solid=new T.MeshStandardMaterial({roughness:.85,metalness:.035});
const gold=new T.MeshStandardMaterial({roughness:.38,metalness:.5});
const glow=new T.MeshStandardMaterial({roughness:.45,emissive:0xffb950,emissiveIntensity:2.3});
const leafMat=new T.MeshStandardMaterial({roughness:.93,metalness:0});
const waterMat=new T.MeshPhysicalMaterial({color:0x76e0f0,roughness:.17,metalness:.12,transparent:true,opacity:.61,depthWrite:false,clearcoat:1});
const foamMat=new T.MeshStandardMaterial({color:0xc6f8ff,transparent:true,opacity:.72,roughness:.4,depthWrite:false});
const world=new T.Group();scene.add(world);
const boxGeo=new T.BoxGeometry(1,1,1), dummy=new T.Object3D();
let voxelCount=0;
class Batch{
 constructor(parent=world){this.parent=parent;this.layers=new Map();}
 box(x,y,z,w,h,d,color,mat=solid,rot=null){if(!this.layers.has(mat))this.layers.set(mat,[]);this.layers.get(mat).push({x,y,z,w,h,d,color,rot});}
 finish(){for(const [mat,items] of this.layers){const mesh=new T.InstancedMesh(boxGeo,mat,items.length);mesh.castShadow=mat!==waterMat&&mat!==foamMat;mesh.receiveShadow=true;items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.w,v.h,v.d);dummy.quaternion.identity();if(v.rot instanceof T.Quaternion)dummy.quaternion.copy(v.rot);else if(v.rot)dummy.rotation.set(...v.rot);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color(v.color));});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();this.parent.add(mesh);voxelCount+=items.length;}this.layers.clear();}
}
const land=new Batch(), decor=new Batch();
const rockColors=[0x3b5259,0x48636a,0x587378,0x6d8284,0x435b60,0x80938e];
const grassColors=[0x79a675,0x85ae7d,0x95b584,0x749c70,0x84aa76,0xa3be85];
const pink=[0xec93b2,0xf8b5c7,0xdb769e,0xffcbd6,0xe991b0,0xcc6c93,0xf3a8c2];
function noise(x,z){return Math.sin(x*.91+z*.77)*.39+Math.sin(x*2.1-z*1.6)*.15;}
function pond(x,z){return ((x-2.25)/3.45)**2+((z-2.3)/2.65)**2<1;}
function river(x,z){return z>3.3&&z<10.3&&Math.abs(x-(1.3+Math.sin(z*.7)*.58))<.63;}
function island(cx,cz,rx,rz,top,deep,water=false){const step=.48;
 for(let ix=-Math.ceil(rx/step)-1;ix<=Math.ceil(rx/step)+1;ix++)for(let iz=-Math.ceil(rz/step)-1;iz<=Math.ceil(rz/step)+1;iz++){
  const x=ix*step,z=iz*step,edge=(x/rx)**2+(z/rz)**2;
  if(edge>1+noise(x,z)*.08)continue;
  const dep=deep*(.38+.62*Math.sqrt(Math.max(0,1-edge)))+rand()*.55;
  const wet=water&&(pond(x,z)||river(x,z));
  const surface=top-(wet?1.03:0);
  const n=Math.max(1,Math.ceil((dep-(wet?1.03:0))/.7));
  for(let j=0;j<n;j++){const yy=surface-.62-j*.7;
   const f=j/n; if(f>.6&&edge>.91-f*.18)continue;
   land.box(cx+x,yy,cz+z,step+.014,.72,step+.014,pick(rockColors));
  }
  land.box(cx+x,surface-.14,cz+z,step+.018,.29,step+.018,wet?pick([0x78989a,0x658c8e,0x91afb0]):pick(grassColors));
  if(!wet&&edge>.94)land.box(cx+x,top-.45,cz+z,.49,.34,.49,pick([0x527b63,0x62896b,0x779872]));
 }
 // Deep roots of the floating stone, all joined to the island.
 for(let i=0;i<Math.floor(rx*2.2);i++){const x=(rand()-.5)*rx*1.2,z=(rand()-.5)*rz*1.2;const h=1+rand()*2;
  land.box(cx+x,top-deep+.3,cz+z,.6+rand(),h,.6+rand(),pick(rockColors));}
}
island(0,0,12,9.35,0,6.2,true);
island(-16,-5,2.5,2.05,1.1,3.4);island(14,-7,2.55,2.0,2,3.6);island(-13,10,1.7,1.3,-1.1,2.5);island(12.8,9,1.45,1.4,-.2,2.2);
// The entire pond and river sit below the level island surface.
for(let x=-1.3;x<5.9;x+=.24)for(let z=-.6;z<9.35;z+=.24){if(pond(x,z)||river(x,z))land.box(x,-.34,z,.246,.09,.246,0xffffff,waterMat);}
for(let i=0;i<62;i++){const a=i/62*TAU,x=2.25+3.49*Math.cos(a),z=2.3+2.69*Math.sin(a);if(river(x,z))continue;decor.box(x,.055,z,.28+rand()*.3,.21+rand()*.23,.25+rand()*.26,pick([0x9baaa2,0xb7b8a6,0x849b96]),solid,[0,rand(),0]);}
// A pale, carefully spaced garden path bends from the landing to the pavilion.
function pathStone(x,z,w=.57,d=.45){decor.box(x,.035,z,w,.075,d,pick([0xd9cdb0,0xc9c5a9,0xb3b8a4]),solid,[0,(rand()-.5)*.2,0]);}
for(let i=0;i<32;i++){const a=i/31,x=lerp(-6.8,7.5,a),z=-.65+Math.sin(a*Math.PI)*.34;pathStone(x,z,.39,.65);if(i%3===0)pathStone(x,z+.65,.38,.32);}
for(let i=0;i<20;i++){const f=i/19;pathStone(-5.4+Math.sin(f*3)*.6,lerp(6,-2.8,f),.7,.36);}
for(let i=0;i<8;i++)pathStone(lerp(-5,0,i/7),4.8,.53,.49);
for(let i=0;i<11;i++)pathStone(lerp(3.3,7.7,i/10),5.1,.33,.61);
function line(b,a,c,size,color,mat=solid,step=size*.75){const av=new T.Vector3(...a),cv=new T.Vector3(...c);const n=Math.max(1,Math.ceil(av.distanceTo(cv)/step));for(let i=0;i<=n;i++){const p=av.clone().lerp(cv,i/n);b.box(p.x,p.y,p.z,size,size,size,color,mat);}}
function beam(b,a,c,w,d,color,mat=solid){const av=new T.Vector3(...a),cv=new T.Vector3(...c),v=cv.clone().sub(av);const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize());const p=av.add(cv).multiplyScalar(.5);b.box(p.x,p.y,p.z,w,v.length(),d,color,mat,q);}
// A double-eaved pavilion: individually laid roof tiles, exposed brackets and gold finials.
const px=-3.45,pz=-2.55;
function pbox(x,y,z,w,h,d,c,mat=solid,rot=null){decor.box(px+x,y,pz+z,w,h,d,c,mat,rot);}
pbox(0,.15,0,4.7,.3,4.4,0xb9bba6);pbox(0,.34,0,4.32,.16,4.03,0xe2d5b5);pbox(0,.47,0,4.08,.11,3.79,0x9c6a48);
for(let z=-1.75;z<1.8;z+=.23)pbox(0,.54,z,3.92,.045,.205,pick([0xbd8d59,0xa9794e,0xcd9c64]));
for(let i=0;i<3;i++)pbox(0,.07+i*.12,2.65-i*.22,1.8,.12,.55,0xcbc5ab);
const post=0x793e32, red=0xa3543e, tile=[0x227a7d,0x2f9090,0x176468,0x398d89];
for(const x of [-1.68,1.68])for(const z of [-1.5,1.5]){
 pbox(x,.72,z,.45,.3,.45,0xc1bba0);pbox(x,1.86,z,.24,2.05,.24,post);pbox(x,2.77,z,.38,.13,.38,red);
 for(let k=0;k<3;k++){pbox(x,2.86+k*.11,z,.44+k*.18,.1,.21,0xc17a49);pbox(x,2.91+k*.11,z,.2,.1,.43+k*.18,0xd2985c);}
}
for(const z of [-1.5,1.5])pbox(0,2.91,z,3.73,.24,.23,red);
for(const x of [-1.68,1.68])pbox(x,2.91,0,.23,.24,3.3,red);
// Open railings with cross lattice and a welcoming central entrance.
for(const z of [-1.55,1.55])for(let i=0;i<12;i++){const x=-1.52+i*.275;if(z>0&&Math.abs(x)<.7)continue;pbox(x,1.01,z,.065,.8,.065,red);}
for(const z of [-1.55,1.55]){if(z<0)pbox(0,1.36,z,3.3,.11,.11,0xb27e51);else for(const x of [-1.2,1.2])pbox(x,1.36,z,.91,.11,.11,0xb27e51);}
for(const x of [-1.72,1.72]){pbox(x,1.36,0,.11,.11,3.1,0xb27e51);for(let z=-1.3;z<1.5;z+=.26)pbox(x,1,z,.065,.76,.065,red);}
function roof(base,half,rise){const s=.18;
 for(let x=-half;x<=half+.01;x+=s)for(let z=-half;z<=half+.01;z+=s){const u=Math.max(Math.abs(x),Math.abs(z))/half;
  const corner=Math.pow(Math.abs(x*z)/(half*half),4);const h=base+rise*(1-u)+.5*corner;
  pbox(x,h,z,s+.016,.115,s+.016,pick(tile));
  if(u>.94)pbox(x,h-.08,z,s+.016,.065,s+.016,0xe1bd69,gold);
 }
 for(const sx of [-1,1])for(const sz of [-1,1]){
  for(let i=0;i<18;i++){const t=i/17,k=t*half,y=base+rise*(1-t)+.52*Math.pow(t,8);pbox(sx*k,y+.12,sz*k,.16,.12,.16,0xcba254,gold);}
  for(let i=0;i<5;i++)pbox(sx*(half+i*.09),base+.55+i*.11,sz*(half+i*.09),.16,.15,.16,0xf2d080,gold);
 }
}
roof(3.02,2.4,1.14);
pbox(0,4.08,0,1.5,.54,1.5,0x733c31);
for(const x of [-.78,.78])for(let z=-.56;z<.7;z+=.22)pbox(x,4.14,z,.06,.28,.095,0xe5b364);
for(const z of [-.78,.78])for(let x=-.56;x<.7;x+=.22)pbox(x,4.14,z,.095,.28,.06,0xe5b364);
roof(4.39,1.58,.84);
for(let i=0;i<6;i++)pbox(0,5.24+i*.15,0,.38-i*.048,.17,.38-i*.048,0xf2cb6d,gold);
pbox(0,.96,0,.8,.16,.8,0xe1cead);pbox(0,.74,0,.3,.39,.3,0xa6ab9e);
for(const x of [-.77,.77])pbox(x,.78,0,.38,.4,.38,0xb3b5a2);
// Suspended warm lanterns underneath the open eaves.
for(const x of [-1.72,1.72])for(const z of [-1.58,1.58]){pbox(x,2.68,z,.025,.46,.025,0x49372d);pbox(x,2.34,z,.27,.39,.27,0xffd587,glow);for(const y of [2.1,2.56])pbox(x,y,z,.34,.075,.34,0x884832);for(const dx of [-.15,.15])pbox(x+dx,2.34,z,.025,.43,.3,0x96523d);}
const warm=new T.PointLight(0xffc66c,6,8,2);warm.position.set(px,2.3,pz);scene.add(warm);
// Arched bridge with individual planks, mortise posts and fine balusters.
function bridge(){const x0=1.0,z0=5.2,len=3.8;
 for(let i=0;i<=24;i++){const t=i/24,x=x0+(t-.5)*len,y=.12+Math.sin(t*Math.PI)*.78;
  decor.box(x,y,z0,.145,.12,1.5,pick([0xb66e41,0xc48851,0xd4a56b]));
  for(const side of [-1,1]){decor.box(x,y+.37,z0+side*.68,.043,.68,.043,0x944d33);
   decor.box(x,y+.75,z0+side*.68,.19,.075,.085,0xd29a59);decor.box(x,y+.32,z0+side*.68,.18,.048,.054,0xbb7e46);
   if(i%6===0){decor.box(x,y+.51,z0+side*.68,.13,1.01,.13,0x955332);decor.box(x,y+1.04,z0+side*.68,.2,.105,.2,0xe2bb73);}
  }
 }
 for(const x of [x0-len/2,x0+len/2])for(const z of [z0-.61,z0+.61])decor.box(x,-.32,z,.3,.76,.3,0x879a94);
}bridge();
const blossomCenters=[];
function cherry(cx,cz,s=1,base=0){const b=new Batch();
 const trunk=pick([0x70514e,0x604944,0x79564f]);
 const tx=cx+.21*s,tz=cz-.13*s;
 for(let i=0;i<20;i++){const t=i/19;b.box(cx+Math.sin(t*2)*.2*s,base+.1+t*3.15*s,cz-Math.sin(t)*.23*s,(.42-.16*t)*s,.23*s,(.39-.15*t)*s,trunk);}
 for(let k=0;k<7;k++){const a=k/7*TAU+.15,ex=cx+Math.cos(a)*(.65+rand()*.6)*s,ez=cz+Math.sin(a)*(.65+rand()*.6)*s,ey=base+(2.9+rand()*1.2)*s;
  line(b,[tx,base+1.9*s,tz],[ex,ey,ez],.18*s,trunk);
  const bx=ex+Math.cos(a)*.64*s,bz=ez+Math.sin(a)*.64*s;
  line(b,[ex,ey,ez],[bx,ey+.49*s,bz],.105*s,trunk);
  blossomCenters.push({x:bx,y:ey+.6*s,z:bz,r:1.17*s});
  // Finely divided, softly layered crowns; no oversize spheres.
  const unit=.19*s,rx=1.1*s,ry=.64*s,rz=.96*s;
  for(let x=-rx;x<=rx;x+=unit)for(let y=-ry;y<=ry;y+=unit)for(let z=-rz;z<=rz;z+=unit){const q=(x/rx)**2+(y/ry)**2+(z/rz)**2;
   if(q<1+rand()*.25&&q>.42&&rand()>.12)b.box(bx+x,ey+.42*s+y,bz+z,unit*.98,unit*.9,unit*.98,pick(pink),leafMat);}
 }
 // A dense inner crown connects the flowering boughs into one lush canopy.
 const u=.19*s;
 for(let x=-1.25*s;x<=1.25*s;x+=u)for(let y=-.73*s;y<=.73*s;y+=u)for(let z=-1.2*s;z<=1.2*s;z+=u){
  if((x/(1.25*s))**2+(y/(.73*s))**2+(z/(1.2*s))**2<1.05)b.box(cx+x,base+3.52*s+y,cz+z,u*.99,u*.92,u*.99,pick(pink),leafMat);
 }
 // Surface roots visibly connect the tree to flat terrain.
 for(let k=0;k<6;k++){const a=k/6*TAU;line(b,[cx,.14+base,cz],[cx+Math.cos(a)*.91*s,.07+base,cz+Math.sin(a)*.91*s],.14*s,trunk);}
 b.finish();
}
cherry(-7.6,-4.8,1.04);cherry(5.6,-4.2,1.12);cherry(-8,2.6,.84);cherry(7.6,2.3,.85);cherry(-16,-5,.6,1.1);cherry(14,-7,.63,2);
// Fallen petals and tufts follow dry land only, leaving paths usable.
for(let i=0;i<520;i++){const x=(rand()-.5)*22,z=(rand()-.5)*16;if((x/11.3)**2+(z/8.5)**2>1||pond(x,z)||river(x,z))continue;
 if(rand()<.52)decor.box(x,.038,z,.055+rand()*.06,.018,.06+rand()*.06,pick(pink),leafMat,[0,rand()*TAU,0]);
 else if(Math.abs(z+.4)>.6&&Math.abs(x+5)>.9){const c=pick([0x3b755d,0x5d9267,0x82a778]);for(let j=0;j<3;j++)decor.box(x+(j-1)*.063,.12,z+rand()*.1,.035,.14+rand()*.15,.035,c);}
}
function bamboo(x,z,base=0,scale=1){for(let i=0;i<8;i++){const bx=x+(rand()-.5)*1.1*scale,bz=z+(rand()-.5)*.9*scale,h=(1.65+rand()*1.55)*scale;
 for(let j=0;j<h/.22;j++){const y=base+.11+j*.22;decor.box(bx,y,bz,.082*scale,.21,.082*scale,j%3===0?0xaab674:pick([0x427658,0x568863,0x648e60]));
 if(j%4===2){const s=rand()>.5?1:-1;for(let k=0;k<5;k++)decor.box(bx+s*k*.06*scale,y+.05+k*.028,bz+(k%2)*.06,.15*scale,.035,.052*scale,0x608c58,leafMat,[0,s*.6,.3*s]);}}
}}
bamboo(8.2,-2.3);bamboo(-.25,-6.7);bamboo(-8.7,-.6,.0,.85);bamboo(-13,10,-1.1,.45);
function shrub(x,z,r=.5){for(let i=0;i<90;i++){const dx=(rand()-.5)*r*2,dy=rand()*r,dz=(rand()-.5)*r*2;if((dx/r)**2+(dy/r)**2+(dz/r)**2<1)decor.box(x+dx,dy+.04,z+dz,.13,.14,.13,pick([0x316d61,0x3e7f64,0x559975,0x81ac84]),leafMat);}}
for(const [x,z]of[[-6.8,5.2],[-1,-5.7],[8.4,4.9],[5.1,6.2],[-8,-2],[-3.9,5.8],[8,-5.4]])shrub(x,z,.4+rand()*.35);
for(const [x,z]of[[-7.2,5.9],[6.1,5.8],[8.7,-4.6],[-1.1,-6.2]]){for(let i=0;i<9;i++){const xx=x+(rand()-.5)*.8,zz=z+(rand()-.5)*.7;decor.box(xx,.12,zz,.034,.23,.034,0x4e8864);decor.box(xx,.26,zz,.12,.095,.12,pick([0xffd497,0xf4a6b9,0xf8e5c4,0xce9bc9]));}}
function rock(x,z,s=.7,base=0){decor.box(x,base+s*.25,z,s,s*.5,s*.7,0x8b9d96,solid,[0,rand(),0]);decor.box(x+.05,base+s*.56,z-.04,s*.61,s*.22,s*.54,0xa6b1a1);}
for(const [x,z,s]of[[-9,4.4,.85],[6.7,-6.1,1.1],[8.8,0,.8],[-5.9,-6.7,.7],[5.5,3.6,.55],[-1.4,1.3,.6]])rock(x,z,s);
function lantern(x,z){decor.box(x,.10,z,.6,.2,.6,0xadb2a0);decor.box(x,.45,z,.27,.62,.27,0x94a69a);decor.box(x,.79,z,.48,.13,.48,0xbbc0a9);
 decor.box(x,1.02,z,.31,.34,.31,0xffdb8e,glow);for(const dx of [-.21,.21])for(const dz of [-.21,.21])decor.box(x+dx,1.02,z+dz,.055,.4,.055,0x83968a);
 decor.box(x,1.25,z,.69,.13,.69,0x789184);decor.box(x,1.37,z,.43,.13,.43,0x95a798);decor.box(x,1.48,z,.17,.12,.17,0xb2b8a1);
 const light=new T.PointLight(0xffc77a,1.4,3.5,2);light.position.set(x,1.04,z);scene.add(light);}
for(const [x,z]of[[-5.9,4.3],[-5.9,-.5],[6.2,-.8],[4.1,5.6]])lantern(x,z);
// Flat voxel lotus petals and floating leaves remain close to the water surface.
for(const [x,z]of[[3.4,2.3],[.1,1.8],[4,3.1],[2.4,.4]]){for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)if(i*i+j*j<6)decor.box(x+i*.13,-.258,z+j*.13,.13,.026,.13,pick([0x428d76,0x62a782,0x75b88b]));
 for(let k=0;k<8;k++){const a=k/8*TAU;decor.box(x+Math.cos(a)*.16,-.15,z+Math.sin(a)*.16,.11,.1,.18,pick([0xffbacb,0xf5d5da,0xe78aa8]),leafMat,[0,-a,0]);}decor.box(x,-.087,z,.105,.12,.105,0xf0ce75);}
land.finish();decor.finish();
// A coherent, tapering Chinese dragon assembled from many small surface voxels.
const dragon=new T.Group();world.add(dragon);const db=new Batch(dragon),dorsal=new Batch(dragon);
function bodyPoint(t){const a=2.3+t*4.65,r=7.55*(1-.08*t)+Math.sin(t*Math.PI*2)*.55;return new T.Vector3(Math.cos(a)*r,9.25+Math.sin(t*Math.PI)*2.05+Math.sin(t*Math.PI*3)*.86+.7*t,Math.sin(a)*r*.77);}
const centers=[],radii=[];
for(let i=0;i<=280;i++){const t=i/280,p=bodyPoint(t),next=bodyPoint(Math.min(1,t+.003)),prev=bodyPoint(Math.max(0,t-.003));const tangent=next.sub(prev).normalize(),side=new T.Vector3().crossVectors(tangent,new T.Vector3(0,1,0)).normalize(),up=new T.Vector3().crossVectors(side,tangent).normalize();
 const radius=(.62+.13*Math.sin(t*Math.PI))*Math.pow(1-t, .32)+.04;
 centers.push(p);radii.push(radius);
 for(let j=0;j<22;j++){const a=j/22*TAU,v=p.clone().addScaledVector(side,Math.cos(a)*radius).addScaledVector(up,Math.sin(a)*radius),belly=Math.sin(a)<-.42;
  const c=belly?pick([0xe7c778,0xf0d99d,0xcfa967]):pick([0x218d83,0x37a49b,0x55b9a6,0x18796f,0x60bca9]);
  db.box(v.x,v.y,v.z,.17,.17,.17,c,belly?gold:solid);
 }
 // A fully filled central spine guarantees continuous volume between surface rings.
 db.box(p.x,p.y,p.z,radius*1.35,radius*1.35,radius*1.35,0x3a9f8d);
 if(i%6===0&&t<.95){for(let k=0;k<4;k++){const v=p.clone().addScaledVector(up,radius+k*.105).addScaledVector(tangent,k*.025);dorsal.box(v.x,v.y,v.z,.16-k*.022,.15,.19-k*.015,k<2?0xc7874c:0xf2d089,gold);}}
 // Small gold scallops articulate the sides of the scale coat.
 if(i%5===0&&t<.94)for(const s of [-1,1]){const v=p.clone().addScaledVector(side,radius*s).addScaledVector(up,.07);db.box(v.x,v.y,v.z,.16,.11,.16,0xdeb969,gold);}
}
const hp=bodyPoint(0),ht=bodyPoint(.02).sub(hp).normalize().negate();
const head=new T.Group();head.position.copy(hp);head.rotation.y=Math.atan2(ht.x,ht.z);head.scale.setScalar(1.12);dragon.add(head);const hb=new Batch(head);
function hbox(x,y,z,w,h,d,c,m=solid){hb.box(x,y,z,w,h,d,c,m);}
function mass(b,cx,cy,cz,rx,ry,rz,step,palette,mat=solid){for(let x=-rx;x<=rx;x+=step)for(let y=-ry;y<=ry;y+=step)for(let z=-rz;z<=rz;z+=step){const q=(x/rx)**2+(y/ry)**2+(z/rz)**2;if(q<=1.07)b.box(cx+x,cy+y,cz+z,step*1.025,step*1.025,step*1.025,pick(palette),mat);}}
mass(hb,0,.12,.3,.87,.75,1.08,.16,[0x37988c,0x4ead98,0x63baa4,0x268579]);
mass(hb,0,-.14,1.2,.66,.37,.78,.13,[0x8fc5a4,0x72b69b,0xaed4ae]);
// Separate dark mouth, articulated jaw and two nostrils.
hbox(0,-.44,1.26,1.06,.12,1.13,0x482f35);mass(hb,0,-.56,1.22,.63,.18,.72,.12,[0xdcb977,0xf0d193,0xc9ab70],gold);
for(const s of [-1,1]){
 hbox(s*.37,.06,1.81,.17,.1,.12,0x214846);hbox(s*.4,.15,1.7,.25,.12,.2,0xa8c9a2);
 // Fierce inset eyes, bright irises and black pupils, visible from either side.
 hbox(s*.79,.37,.65,.11,.34,.4,0x183f3c);hbox(s*.855,.38,.7,.085,.22,.29,0xffd36e,glow);hbox(s*.9,.4,.77,.04,.17,.085,0x172a2b);hbox(s*.923,.45,.81,.025,.048,.051,0xfff3cb);
 for(let i=0;i<5;i++)hbox(s*(.69+i*.043),.61+i*.02,.81-i*.145,.17,.16,.21,0xe5bb68,gold);
 hbox(s*.47,-.37,1.52,.11,.21,.11,0xffe8b3);hbox(s*.47,-.4,.95,.1,.18,.1,0xffe8b3);
 // Branching deer-like horns: small ivory voxels form all points.
 const horn=[[s*.47,.67,-.18],[s*.56,1.06,-.38],[s*.68,1.51,-.62],[s*.91,1.96,-.73],[s*1.1,2.12,-.86]];
 for(let i=0;i<horn.length-1;i++)line(hb,horn[i],horn[i+1],.145-i*.022,0xf3d7a1,gold,.08);
 line(hb,[s*.65,1.38,-.54],[s*.27,1.75,-.82],.085,0xf7dfb4,gold,.06);
 line(hb,[s*.84,1.83,-.7],[s*.88,2.18,-.41],.077,0xf7dfb4,gold,.055);
 // Ears and a layered golden mane frame the jaw, without wings.
 for(let i=0;i<6;i++)hbox(s*(.72+i*.08),.32+i*.035,-.39-i*.1,.15,.18,.17,i<3?0x60ac92:0xeac782,gold);
 for(let j=0;j<7;j++)for(let k=0;k<6;k++)hbox(s*(.62+k*.08),.55-j*.17-k*.04,-.56-k*.10,.15,.17,.17,pick([0xe6bb6f,0xf4d699,0xbe8650]),gold);
 // Long flowing whiskers made of tiny crisp voxels.
 const pts=[];for(let i=0;i<44;i++){const t=i/43;pts.push([s*(.47+1.72*t),-.24+.36*Math.sin(t*4.5),1.69+.32*Math.sin(t*4)-.95*t]);}
 for(let i=0;i<pts.length-1;i++)line(hb,pts[i],pts[i+1],.052,0xf8dcaa,gold,.04);
}
for(let j=0;j<10;j++){const t=j/9;hbox(0,-.58-t*.69,.76-t*.5,.33*(1-t)+.07,.16,.16,pick([0xe9c786,0xf3d89d]),gold);}
hbox(0,.87,.53,.18,.17,.22,0xfbdc92,gold);
hb.finish();db.finish();dorsal.finish();
// Exactly four articulated legs and talons, each anchored to the dragon's body.
const claws=new Batch(dragon);
for(const t of [.12,.61])for(const sign of [-1,1]){const p=bodyPoint(t),tangent=bodyPoint(t+.01).sub(p).normalize(),side=new T.Vector3().crossVectors(tangent,new T.Vector3(0,1,0)).normalize().multiplyScalar(sign);
 const shoulder=p.clone().addScaledVector(side,.47),elbow=p.clone().addScaledVector(side,1.14).add(new T.Vector3(0,-.65,0)),wrist=p.clone().addScaledVector(side,1.30).addScaledVector(tangent,.42).add(new T.Vector3(0,-1.36,0));
 line(claws,shoulder.toArray(),elbow.toArray(),.27,0x479f89);line(claws,elbow.toArray(),wrist.toArray(),.22,0x7fba96);
 mass(claws,wrist.x,wrist.y,wrist.z,.29,.18,.34,.11,[0xa1c49a,0xd8c58b]);
 for(let j=-1;j<=1;j++){const root=wrist.clone().addScaledVector(tangent,j*.2),tip=root.clone().addScaledVector(side,.42).add(new T.Vector3(0,-.15,0));line(claws,root.toArray(),tip.toArray(),.1,0xf5dca5,gold,.065);line(claws,tip.toArray(),tip.clone().add(new T.Vector3(0,-.17,0)).toArray(),.075,0xffe9ba,gold,.05);}
}
claws.finish();
// Crane pairs have thin red legs, long necks and separately animated wings.
const cranes=[];
function crane(x,y,z,scale=1,flying=false){const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(scale);world.add(g);const b=new Batch(g);
 mass(b,0,.72,0,.22,.23,.4,.075,[0xf7eee0,0xe7e9d9,0xcddbd2]);
 line(b,[0,.73,.26],[0,1.28,.27],.092,0xf0eadb,solid);mass(b,0,1.38,.31,.12,.13,.17,.06,[0xfaf1dd]);
 b.box(0,1.49,.31,.13,.045,.13,0xca5a48);b.box(0,1.36,.59,.055,.055,.28,0xc69960);b.box(.117,1.4,.37,.018,.033,.035,0x213b38);
 for(const s of [-1,1]){line(b,[s*.08,.63,-.06],[s*.1,.06,flying?-.45:0],.033,0x9e6450);if(!flying)line(b,[s*.1,.04,0],[s*.1,.04,.17],.027,0xb38760);}
 b.box(0,.73,-.39,.19,.12,.23,0x253f3f);b.finish();
 const wings=[];for(const s of [-1,1]){const w=new T.Group();w.position.set(s*.15,.78,-.01);g.add(w);const wb=new Batch(w);
  for(let i=0;i<8;i++){wb.box(s*(.07+i*.065),0,-i*.035,.12,.058,.4-i*.018,i>4?0x2b4140:0xf6f1df);}
  wb.finish();w.rotation.z=s*(flying?.15:.9);wings.push(w);}
 cranes.push({g,wings,flying,origin:g.position.clone(),phase:rand()*TAU});return g;}
crane(5.7,.1,1.5,.82).rotation.y=-1.5;crane(6.25,.1,.7,.7).rotation.y=-1;
crane(-10.5,6,2.8,.85,true).rotation.y=.8;crane(10.6,7,-2,.72,true).rotation.y=-.8;
// Koi swim under the transparent pond surface.
const fish=[];
for(let i=0;i<7;i++){const g=new T.Group();world.add(g);const b=new Batch(g);mass(b,0,0,0,.085,.075,.27,.065,i%2?[0xffcb78,0xf5a44f]:[0xf7ede0,0xf08355]);b.box(0,0,-.33,.2,.035,.15,0xf4b16a);b.box(0,.028,.2,.13,.055,.07,0xe97345);b.finish();fish.push({g,a:rand()*TAU,r:1.1+rand()*1.2,s:.11+rand()*.08});}
// Waterfall strands and falling foam emerge only from the main island's stream mouth.
const falls=new T.Group();world.add(falls);const fb=new Batch(falls);
for(let i=0;i<10;i++){const x=1.3+Math.sin(9.2*.7)*.58+(i-4.5)*.12;const h=5.1+rand()*.75;fb.box(x,-.4-h/2,9.11,.115,h,.19,0xffffff,waterMat);}
fb.finish();
const drops=[];const dropMesh=new T.InstancedMesh(boxGeo,foamMat,110);world.add(dropMesh);
for(let i=0;i<110;i++)drops.push({x:.9+rand()*1.2,z:9.06+rand()*.3,y:rand()*6,s:.025+rand()*.06});
// Small square petals tumble; no particles are used as cloud or fog substitutes.
const petalCount=220,petalMesh=new T.InstancedMesh(boxGeo,new T.MeshStandardMaterial({roughness:.9,side:T.DoubleSide}),petalCount);world.add(petalMesh);
const petals=[];for(let i=0;i<petalCount;i++){const c=pick(blossomCenters);petals.push({x:c.x+(rand()-.5)*2,y:rand()*(c.y+.5),z:c.z+(rand()-.5)*2,top:c.y,baseX:c.x,baseZ:c.z,s:.035+rand()*.055,v:.25+rand()*.4,p:rand()*TAU});petalMesh.setColorAt(i,new T.Color(pick(pink)));}
const butterflies=[];
for(let i=0;i<12;i++){const g=new T.Group();world.add(g);const wings=[];for(const s of [-1,1]){const w=new T.Group();g.add(w);const b=new Batch(w);b.box(s*.08,0,0,.14,.016,.12,i%2?0xf4bd68:0x9cddec);b.box(s*.055,0,-.08,.1,.014,.09,i%2?0xe48d65:0x70b6d8);b.box(s*.12,0,.013,.029,.018,.079,0x654f53);b.finish();wings.push(w);}const b=new Batch(g);b.box(0,0,0,.02,.026,.17,0x435750);b.finish();butterflies.push({g,wings,x:(rand()-.5)*16,z:(rand()-.5)*11,p:rand()*TAU});}
// Camera controls are embedded so the single file also works offline.
const target=new T.Vector3(0,.1,0);let radius=46,theta=.69,phi=1.095;
let current={radius,theta,phi,target:target.clone()},transition=null,auto=false,paused=false,night=false,clean=false;
function frameCamera(){const aspectFactor=Math.max(1,1.19/camera.aspect),r=radius*aspectFactor;camera.position.set(target.x+r*Math.sin(phi)*Math.sin(theta),target.y+r*Math.cos(phi),target.z+r*Math.sin(phi)*Math.cos(theta));camera.lookAt(target);}
const presets={all:{radius:46,theta:.69,phi:1.095,target:new T.Vector3(0,.1,0)},dragon:{radius:20.5,theta:1.03,phi:1.38,target:new T.Vector3(-1,9.9,1)},garden:{radius:21,theta:.72,phi:.79,target:new T.Vector3(-1,1.0,1)},water:{radius:12.5,theta:.50,phi:.81,target:new T.Vector3(2,0.1,3.8)}};
let activeView='all';
function view(name){activeView=name;const v=presets[name];transition={from:{radius,theta,phi,target:target.clone()},to:v,start:performance.now()};document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===name);b.setAttribute('aria-pressed',b.dataset.view===name?'true':'false');});$('view-name').textContent={all:'全景 · 浮岛仙境',dragon:'近观 · 苍龙游天',garden:'漫游 · 樱下庭园',water:'听水 · 曲桥流觞'}[name];}
const pointers=new Map();let lastPinch=0,down=false,lastX=0,lastY=0,lastInteraction=0;
renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});down=true;lastX=e.clientX;lastY=e.clientY;transition=null;lastInteraction=performance.now();});
renderer.domElement.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const a=[...pointers.values()],dist=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(lastPinch)radius=T.MathUtils.clamp(radius*lastPinch/dist,7,95);lastPinch=dist;}else{
 const dx=e.clientX-lastX,dy=e.clientY-lastY;if(e.shiftKey||e.buttons===2){const right=new T.Vector3().setFromMatrixColumn(camera.matrix,0),up=new T.Vector3().setFromMatrixColumn(camera.matrix,1);target.addScaledVector(right,-dx*radius*.001).addScaledVector(up,dy*radius*.001);}else{theta-=dx*.006;phi=T.MathUtils.clamp(phi+dy*.004,.16,1.52);}
 }lastX=e.clientX;lastY=e.clientY;lastInteraction=performance.now();});
function release(e){pointers.delete(e.pointerId);down=pointers.size>0;lastPinch=0;}
renderer.domElement.addEventListener('pointerup',release);renderer.domElement.addEventListener('pointercancel',release);renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();transition=null;radius=T.MathUtils.clamp(radius*Math.exp(e.deltaY*.001),7,95);lastInteraction=performance.now();},{passive:false});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2000);}
$('pause').onclick=()=>{paused=!paused;$('pause').classList.toggle('active',paused);$('pause').setAttribute('aria-pressed',String(paused));$('pause').title=paused?'继续动画':'暂停动画';$('pause').innerHTML=paused?icons.play:icons.pause;toast(paused?'时光已暂停':'风起，花落，龙游');};
$('orbit').onclick=()=>{auto=!auto;$('orbit').classList.toggle('active',auto);$('orbit').setAttribute('aria-pressed',String(auto));toast(auto?'自动环游已开启':'自由观景');};
$('light').onclick=()=>{night=!night;document.body.classList.toggle('night',night);$('light').classList.toggle('active',night);$('light').setAttribute('aria-pressed',String(night));$('light').title=night?'切换晨光':'切换月夜';$('time-label').textContent=night?'月夜 · 灯火初上':'晨光 · 樱花正盛';$('light').innerHTML=night?icons.sun:icons.moon;hemi.intensity=night?1.2:2.1;sun.intensity=night?1.15:3.3;sun.color.set(night?0xa0c4f1:0xffdec0);rim.intensity=night?2.1:1.9;fill.intensity=night?.5:1.1;warm.intensity=night?14:6;renderer.toneMappingExposure=night?1.08:1.08;};
$('capture').onclick=()=>{frameCamera();renderer.render(scene,camera);const a=document.createElement('a');a.download='龙吟浮樱-'+(night?'月夜':'晨光')+'.png';const shot=document.createElement('canvas');shot.width=renderer.domElement.width;shot.height=renderer.domElement.height;const ctx=shot.getContext('2d'),bg=ctx.createRadialGradient(shot.width*.48,shot.height*.37,0,shot.width*.48,shot.height*.37,Math.max(shot.width,shot.height)*.68);const colors=night?['#324b65','#1d344d','#071625']:['#6b9293','#466c76','#162d39'];bg.addColorStop(0,colors[0]);bg.addColorStop(.4,colors[1]);bg.addColorStop(1,colors[2]);ctx.fillStyle=bg;ctx.fillRect(0,0,shot.width,shot.height);ctx.drawImage(renderer.domElement,0,0);const data=shot.toDataURL('image/png');$('snapshot-image').src=data;$('snapshot-save').href=data;$('snapshot-save').download=a.download;$('snapshot-panel').showModal();};
$('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('当前预览不支持全屏；可用浏览器打开 HTML');}};
$('snapshot-close').onclick=()=>$('snapshot-panel').close();
$('help').onclick=()=>{$('guide').hidden=!$('guide').hidden;};$('close-guide').onclick=()=>{$('guide').hidden=true;};
addEventListener('keydown',e=>{if(e.code==='Space'&&e.target===document.body){e.preventDefault();$('pause').click();}if(e.key.toLowerCase()==='r')view('all');if(e.key.toLowerCase()==='h'){clean=!clean;document.body.classList.toggle('clean',clean);}if(e.key==='Escape'){$('guide').hidden=true;clean=false;document.body.classList.remove('clean');}});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
let last=performance.now(),time=0,frames=0,fpsStart=performance.now();
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.06);last=now;if(!paused)time+=dt;
 if(transition){const raw=Math.min(1,(now-transition.start)/1400),t=raw*raw*(3-2*raw),a=transition.from,b=transition.to;radius=lerp(a.radius,b.radius,t);theta=lerp(a.theta,b.theta,t);phi=lerp(a.phi,b.phi,t);target.lerpVectors(a.target,b.target,t);if(raw===1)transition=null;}
 else if(auto&&!down&&now-lastInteraction>1400&&!paused)theta+=dt*.065;
 dragon.position.y=Math.sin(time*.35)*.19;dragon.rotation.y=Math.sin(time*.16)*.035;
 for(const f of fish){const a=f.a+time*f.s;f.g.position.set(2.15+Math.cos(a)*f.r,-.58+Math.sin(a*2)*.04,2.1+Math.sin(a)*f.r*.65);f.g.rotation.y=Math.atan2(-Math.sin(a),Math.cos(a)*.65);}
 for(const c of cranes){if(c.flying){c.g.position.x=c.origin.x+Math.sin(time*.18+c.phase)*.6;c.g.position.y=c.origin.y+Math.sin(time*.8+c.phase)*.15;c.wings.forEach((w,i)=>w.rotation.z=(i?1:-1)*Math.sin(time*2+c.phase)*.65);}else c.wings.forEach((w,i)=>w.rotation.z=(i?1:-1)*(.85+Math.sin(time*.5+c.phase)*.09));}
 petals.forEach((p,i)=>{const y=(p.y-time*p.v)%(p.top+.3),yy=y<0?y+p.top+.3:y;dummy.position.set(p.x+Math.sin(time*.55+p.p)*.5,Math.max(.09,yy),p.z+Math.sin(time*.25+p.p)*.35);dummy.scale.set(p.s,.008,p.s*.85);dummy.rotation.set(time*.8+p.p,time*.4+p.p,Math.sin(time+p.p));dummy.updateMatrix();petalMesh.setMatrixAt(i,dummy.matrix);});petalMesh.instanceMatrix.needsUpdate=true;
 drops.forEach((d,i)=>{dummy.position.set(d.x+Math.sin(time*2+i)*.04,-.35-(d.y+time*2.2)%6.3,d.z);dummy.scale.set(d.s,d.s*2.3,d.s);dummy.rotation.set(0,0,0);dummy.updateMatrix();dropMesh.setMatrixAt(i,dummy.matrix);});dropMesh.instanceMatrix.needsUpdate=true;
 for(const b of butterflies){b.g.position.set(b.x+Math.sin(time*.4+b.p)*.8,1.3+Math.sin(time*.85+b.p)*.4,b.z+Math.cos(time*.38+b.p)*.65);b.g.rotation.y=time*.2+b.p;b.wings.forEach((w,i)=>w.rotation.z=(i?1:-1)*Math.sin(time*11+b.p)*.9);}
 frameCamera();renderer.render(scene,camera);frames++;if(now-fpsStart>2000){window.sceneStats={voxels:voxelCount,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,fps:Math.round(frames*1000/(now-fpsStart)),view:activeView,paused,night};renderer.domElement.dataset.renderStats=JSON.stringify(window.sceneStats);frames=0;fpsStart=now;}
}
$('voxel-count').textContent=(voxelCount/1000).toFixed(1)+'k';
window.sceneReady=true;window.sceneStats={voxels:voxelCount};$('loading').classList.add('done');setTimeout(()=>$('loading').remove(),650);
requestAnimationFrame(animate);
})();

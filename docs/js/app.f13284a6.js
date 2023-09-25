(function(){"use strict";var e={9302:function(e,t,o){var n=o(9242),r=o(3396);const i={id:"app"};function a(e,t,o,n,a,c){const s=(0,r.up)("PisaTowerComponent");return(0,r.wg)(),(0,r.iD)("div",i,[(0,r.Wm)(s)])}const c=e=>((0,r.dD)("data-v-117878ee"),e=e(),(0,r.Cn)(),e),s={ref:"rendererDom",style:{width:"100vw",height:"100vh"}},l={class:"toolbar"},d={class:"form-check form-switch"},u=c((()=>(0,r._)("label",{class:"form-check-label",for:"wireframeSwitch"},"ワイヤフレーム表示",-1))),w={class:"form-check form-switch"},h=c((()=>(0,r._)("label",{class:"form-check-label",for:"cameraHelperSwitch"},"CameraHelper 表示",-1))),f={class:"form-check form-switch"},m=c((()=>(0,r._)("label",{class:"form-check-label",for:"rotateXSwitch"},"X軸で回転",-1))),p={class:"form-check form-switch"},b=c((()=>(0,r._)("label",{class:"form-check-label",for:"rotateYSwitch"},"Y軸で回転",-1))),v={class:"form-check form-switch"},g=c((()=>(0,r._)("label",{class:"form-check-label",for:"rotateZSwitch"},"Z軸で回転",-1))),y={class:"form-check"};function k(e,t,o,i,a,c){return(0,r.wg)(),(0,r.iD)("div",null,[(0,r._)("div",s,null,512),(0,r._)("div",l,[(0,r._)("div",d,[(0,r.wy)((0,r._)("input",{class:"form-check-input",type:"checkbox",id:"wireframeSwitch","onUpdate:modelValue":t[0]||(t[0]=e=>i.isWireframe=e),onChange:t[1]||(t[1]=(...e)=>i.updateWireframeVisibility&&i.updateWireframeVisibility(...e))},null,544),[[n.e8,i.isWireframe]]),u]),(0,r._)("div",w,[(0,r.wy)((0,r._)("input",{class:"form-check-input",type:"checkbox",id:"cameraHelperSwitch","onUpdate:modelValue":t[2]||(t[2]=e=>i.showCameraHelper=e),onChange:t[3]||(t[3]=(...e)=>i.updateCameraHelperVisibility&&i.updateCameraHelperVisibility(...e))},null,544),[[n.e8,i.showCameraHelper]]),h]),(0,r._)("div",f,[(0,r.wy)((0,r._)("input",{class:"form-check-input",type:"checkbox",id:"rotateXSwitch","onUpdate:modelValue":t[4]||(t[4]=e=>i.rotateX=e)},null,512),[[n.e8,i.rotateX]]),m]),(0,r._)("div",p,[(0,r.wy)((0,r._)("input",{class:"form-check-input",type:"checkbox",id:"rotateYSwitch","onUpdate:modelValue":t[5]||(t[5]=e=>i.rotateY=e)},null,512),[[n.e8,i.rotateY]]),b]),(0,r._)("div",v,[(0,r.wy)((0,r._)("input",{class:"form-check-input",type:"checkbox",id:"rotateZSwitch","onUpdate:modelValue":t[6]||(t[6]=e=>i.rotateZ=e)},null,512),[[n.e8,i.rotateZ]]),g]),(0,r._)("div",y,[(0,r._)("button",{onClick:t[7]||(t[7]=(...e)=>i.resetRotation&&i.resetRotation(...e)),class:"btn btn-primary"},"ローテーションリセット")])])])}var _=o(4870),x=o(1114),C=o(4543),S=o(9469),H=o(8635),O={name:"PisaTowerComponent",setup(){const e=(0,_.iH)(null),t=(0,_.iH)(!0),o=(0,_.iH)(!1),n=(0,_.iH)(!1),i=(0,_.iH)(!1),a=(0,_.iH)(!1),c=new H.T;let s,l,d,u,w,h,f=null;const m=()=>{const e=new x.Ox3(16777215,1);return e.position.set(20,20,20),e.castShadow=!0,e.shadow.mapSize.width=4096,e.shadow.mapSize.height=4096,e.shadow.camera.left=-15,e.shadow.camera.right=15,e.shadow.camera.top=15,e.shadow.camera.bottom=-15,e.shadow.camera.far=100,e},p=()=>(d=new x.cPb(75,window.innerWidth/window.innerHeight,.1,1e3),d.position.set(15,15,-15),d),b=()=>{const t=new x.CP7;return t.setSize(window.innerWidth,window.innerHeight),e.value.appendChild(t.domElement),t.shadowMap.enabled=!0,t.setClearColor("lightsteelblue"),t},v=()=>{const e=new x.Kj0(new x._12(40,40),new x.YBo({color:"tan",side:x.ehD}));return e.position.y=-.1,e.rotateX(Math.PI/2),e.receiveShadow=!0,e},g=()=>{const e=new x.xsS;return e.add(new x.Mig(16777215,.1)),e.add(new x.VLJ(50,20)),e.add(v()),e},y=(e,t,o)=>{const n=new x.xo$(.15,32,32),r=new x.xoR({color:"blue"}),i=new x.Kj0(n,r);return i.position.set(e,t,o),i.castShadow=!0,i},k=()=>new Promise(((e,t)=>{const o=new S.E;o.load("ennchuBaoundingBox.glb",(t=>{const o=(new x.ZzF).setFromObject(t.scene);t.scene.scale.set(5,5,5);const n=new x.Pa4,r=new x.Pa4;o.getSize(n),o.getCenter(r);const i=new x.DvJ(n.x,n.y,n.z),a=new x.xoR({color:"green",wireframe:!0}),c=new x.Tme,s=new x.Kj0(i,a);s.receiveShadow=!0,s.castShadow=!0,c.add(s),c.position.copy(r),t.scene.add(c);const l=t.scene;e([l,s])}),void 0,(e=>{console.error("An error occurred while loading the GLB model:",e),t(e)}))})),O=()=>{s=requestAnimationFrame(O),f&&(n.value&&f.rotateX(.005),i.value&&f.rotateY(.005),a.value&&f.rotateZ(.005));const e=c.clone().applyMatrix4(h.matrixWorld);l.children.forEach((t=>{t instanceof x.Kj0&&t.geometry instanceof x.xo$&&t.material.color.set(e.containsPoint(t.position)?"red":"blue")})),u.render(l,d)};window.onresize=()=>{d.aspect=window.innerWidth/window.innerHeight,d.updateProjectionMatrix(),u.setSize(window.innerWidth,window.innerHeight)},(0,r.bv)((async()=>{d=p(),u=b(),l=g();const e=m();l.add(e),w=new x.Rki(e.shadow.camera),l.add(w),w.visible=o.value;const t=10;[f,h]=await k(),l.add(f),h.geometry.computeBoundingBox(),c.fromBox3(h.geometry.boundingBox);const n=1.2;for(let o=0;o<10;o++)for(let e=0;e<10;e++)for(let r=0;r<10;r++)l.add(y(o*n-5,e*n-5+t/2,r*n-5));new C.z(d,u.domElement),O()})),(0,r.Jd)((()=>{cancelAnimationFrame(s)}));const P=()=>h.material.wireframe=t.value,j=()=>w.visible=o.value,V=()=>f.rotation.set(0,0,0);return{rendererDom:e,isWireframe:t,updateWireframeVisibility:P,showCameraHelper:o,updateCameraHelperVisibility:j,rotateX:n,rotateY:i,rotateZ:a,resetRotation:V}}},P=o(89);const j=(0,P.Z)(O,[["render",k],["__scopeId","data-v-117878ee"]]);var V=j,W={name:"App",components:{PisaTowerComponent:V}};const Z=(0,P.Z)(W,[["render",a]]);var z=Z;(0,n.ri)(z).mount("#app")}},t={};function o(n){var r=t[n];if(void 0!==r)return r.exports;var i=t[n]={exports:{}};return e[n].call(i.exports,i,i.exports,o),i.exports}o.m=e,function(){var e=[];o.O=function(t,n,r,i){if(!n){var a=1/0;for(d=0;d<e.length;d++){n=e[d][0],r=e[d][1],i=e[d][2];for(var c=!0,s=0;s<n.length;s++)(!1&i||a>=i)&&Object.keys(o.O).every((function(e){return o.O[e](n[s])}))?n.splice(s--,1):(c=!1,i<a&&(a=i));if(c){e.splice(d--,1);var l=r();void 0!==l&&(t=l)}}return t}i=i||0;for(var d=e.length;d>0&&e[d-1][2]>i;d--)e[d]=e[d-1];e[d]=[n,r,i]}}(),function(){o.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return o.d(t,{a:t}),t}}(),function(){o.d=function(e,t){for(var n in t)o.o(t,n)&&!o.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}}(),function(){o.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={143:0};o.O.j=function(t){return 0===e[t]};var t=function(t,n){var r,i,a=n[0],c=n[1],s=n[2],l=0;if(a.some((function(t){return 0!==e[t]}))){for(r in c)o.o(c,r)&&(o.m[r]=c[r]);if(s)var d=s(o)}for(t&&t(n);l<a.length;l++)i=a[l],o.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return o.O(d)},n=self["webpackChunkcube_toggler_3d"]=self["webpackChunkcube_toggler_3d"]||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))}();var n=o.O(void 0,[998],(function(){return o(9302)}));n=o.O(n)})();
//# sourceMappingURL=app.f13284a6.js.map
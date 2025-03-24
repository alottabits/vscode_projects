"use strict";var Ei=Object.create;var Ae=Object.defineProperty;var ji=Object.getOwnPropertyDescriptor;var Pi=Object.getOwnPropertyNames;var _i=Object.getPrototypeOf,Ti=Object.prototype.hasOwnProperty;var h=(e,r)=>()=>(r||e((r={exports:{}}).exports,r),r.exports),ki=(e,r)=>{for(var t in r)Ae(e,t,{get:r[t],enumerable:!0})},kr=(e,r,t,i)=>{if(r&&typeof r=="object"||typeof r=="function")for(let n of Pi(r))!Ti.call(e,n)&&n!==t&&Ae(e,n,{get:()=>r[n],enumerable:!(i=ji(r,n))||i.enumerable});return e};var I=(e,r,t)=>(t=e!=null?Ei(_i(e)):{},kr(r||!e||!e.__esModule?Ae(t,"default",{value:e,enumerable:!0}):t,e)),Di=e=>kr(Ae({},"__esModule",{value:!0}),e);var lr=h(cr=>{"use strict";Object.defineProperty(cr,"__esModule",{value:!0});cr.default=Mi;var Ii=Oi(require("crypto"));function Oi(e){return e&&e.__esModule?e:{default:e}}var Pe=new Uint8Array(256),je=Pe.length;function Mi(){return je>Pe.length-16&&(Ii.default.randomFillSync(Pe),je=0),Pe.slice(je,je+=16)}});var Ir=h(_e=>{"use strict";Object.defineProperty(_e,"__esModule",{value:!0});_e.default=void 0;var Li=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;_e.default=Li});var pe=h(Te=>{"use strict";Object.defineProperty(Te,"__esModule",{value:!0});Te.default=void 0;var Bi=qi(Ir());function qi(e){return e&&e.__esModule?e:{default:e}}function Ni(e){return typeof e=="string"&&Bi.default.test(e)}var $i=Ni;Te.default=$i});var he=h(ke=>{"use strict";Object.defineProperty(ke,"__esModule",{value:!0});ke.default=void 0;var Ri=Ui(pe());function Ui(e){return e&&e.__esModule?e:{default:e}}var j=[];for(let e=0;e<256;++e)j.push((e+256).toString(16).substr(1));function Hi(e,r=0){let t=(j[e[r+0]]+j[e[r+1]]+j[e[r+2]]+j[e[r+3]]+"-"+j[e[r+4]]+j[e[r+5]]+"-"+j[e[r+6]]+j[e[r+7]]+"-"+j[e[r+8]]+j[e[r+9]]+"-"+j[e[r+10]]+j[e[r+11]]+j[e[r+12]]+j[e[r+13]]+j[e[r+14]]+j[e[r+15]]).toLowerCase();if(!(0,Ri.default)(t))throw TypeError("Stringified UUID is invalid");return t}var Yi=Hi;ke.default=Yi});var Lr=h(De=>{"use strict";Object.defineProperty(De,"__esModule",{value:!0});De.default=void 0;var Vi=Mr(lr()),Wi=Mr(he());function Mr(e){return e&&e.__esModule?e:{default:e}}var Or,ur,dr=0,fr=0;function Gi(e,r,t){let i=r&&t||0,n=r||new Array(16);e=e||{};let a=e.node||Or,o=e.clockseq!==void 0?e.clockseq:ur;if(a==null||o==null){let f=e.random||(e.rng||Vi.default)();a==null&&(a=Or=[f[0]|1,f[1],f[2],f[3],f[4],f[5]]),o==null&&(o=ur=(f[6]<<8|f[7])&16383)}let s=e.msecs!==void 0?e.msecs:Date.now(),c=e.nsecs!==void 0?e.nsecs:fr+1,l=s-dr+(c-fr)/1e4;if(l<0&&e.clockseq===void 0&&(o=o+1&16383),(l<0||s>dr)&&e.nsecs===void 0&&(c=0),c>=1e4)throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");dr=s,fr=c,ur=o,s+=122192928e5;let u=((s&268435455)*1e4+c)%4294967296;n[i++]=u>>>24&255,n[i++]=u>>>16&255,n[i++]=u>>>8&255,n[i++]=u&255;let d=s/4294967296*1e4&268435455;n[i++]=d>>>8&255,n[i++]=d&255,n[i++]=d>>>24&15|16,n[i++]=d>>>16&255,n[i++]=o>>>8|128,n[i++]=o&255;for(let f=0;f<6;++f)n[i+f]=a[f];return r||(0,Wi.default)(n)}var Ki=Gi;De.default=Ki});var pr=h(Ie=>{"use strict";Object.defineProperty(Ie,"__esModule",{value:!0});Ie.default=void 0;var Qi=Ji(pe());function Ji(e){return e&&e.__esModule?e:{default:e}}function zi(e){if(!(0,Qi.default)(e))throw TypeError("Invalid UUID");let r,t=new Uint8Array(16);return t[0]=(r=parseInt(e.slice(0,8),16))>>>24,t[1]=r>>>16&255,t[2]=r>>>8&255,t[3]=r&255,t[4]=(r=parseInt(e.slice(9,13),16))>>>8,t[5]=r&255,t[6]=(r=parseInt(e.slice(14,18),16))>>>8,t[7]=r&255,t[8]=(r=parseInt(e.slice(19,23),16))>>>8,t[9]=r&255,t[10]=(r=parseInt(e.slice(24,36),16))/1099511627776&255,t[11]=r/4294967296&255,t[12]=r>>>24&255,t[13]=r>>>16&255,t[14]=r>>>8&255,t[15]=r&255,t}var Xi=zi;Ie.default=Xi});var hr=h(G=>{"use strict";Object.defineProperty(G,"__esModule",{value:!0});G.default=to;G.URL=G.DNS=void 0;var Zi=Br(he()),eo=Br(pr());function Br(e){return e&&e.__esModule?e:{default:e}}function ro(e){e=unescape(encodeURIComponent(e));let r=[];for(let t=0;t<e.length;++t)r.push(e.charCodeAt(t));return r}var qr="6ba7b810-9dad-11d1-80b4-00c04fd430c8";G.DNS=qr;var Nr="6ba7b811-9dad-11d1-80b4-00c04fd430c8";G.URL=Nr;function to(e,r,t){function i(n,a,o,s){if(typeof n=="string"&&(n=ro(n)),typeof a=="string"&&(a=(0,eo.default)(a)),a.length!==16)throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");let c=new Uint8Array(16+n.length);if(c.set(a),c.set(n,a.length),c=t(c),c[6]=c[6]&15|r,c[8]=c[8]&63|128,o){s=s||0;for(let l=0;l<16;++l)o[s+l]=c[l];return o}return(0,Zi.default)(c)}try{i.name=e}catch{}return i.DNS=qr,i.URL=Nr,i}});var $r=h(Oe=>{"use strict";Object.defineProperty(Oe,"__esModule",{value:!0});Oe.default=void 0;var no=io(require("crypto"));function io(e){return e&&e.__esModule?e:{default:e}}function oo(e){return Array.isArray(e)?e=Buffer.from(e):typeof e=="string"&&(e=Buffer.from(e,"utf8")),no.default.createHash("md5").update(e).digest()}var ao=oo;Oe.default=ao});var Ur=h(Me=>{"use strict";Object.defineProperty(Me,"__esModule",{value:!0});Me.default=void 0;var so=Rr(hr()),co=Rr($r());function Rr(e){return e&&e.__esModule?e:{default:e}}var lo=(0,so.default)("v3",48,co.default),uo=lo;Me.default=uo});var Yr=h(Le=>{"use strict";Object.defineProperty(Le,"__esModule",{value:!0});Le.default=void 0;var fo=Hr(lr()),po=Hr(he());function Hr(e){return e&&e.__esModule?e:{default:e}}function ho(e,r,t){e=e||{};let i=e.random||(e.rng||fo.default)();if(i[6]=i[6]&15|64,i[8]=i[8]&63|128,r){t=t||0;for(let n=0;n<16;++n)r[t+n]=i[n];return r}return(0,po.default)(i)}var go=ho;Le.default=go});var Vr=h(Be=>{"use strict";Object.defineProperty(Be,"__esModule",{value:!0});Be.default=void 0;var mo=vo(require("crypto"));function vo(e){return e&&e.__esModule?e:{default:e}}function yo(e){return Array.isArray(e)?e=Buffer.from(e):typeof e=="string"&&(e=Buffer.from(e,"utf8")),mo.default.createHash("sha1").update(e).digest()}var wo=yo;Be.default=wo});var Gr=h(qe=>{"use strict";Object.defineProperty(qe,"__esModule",{value:!0});qe.default=void 0;var xo=Wr(hr()),bo=Wr(Vr());function Wr(e){return e&&e.__esModule?e:{default:e}}var Fo=(0,xo.default)("v5",80,bo.default),So=Fo;qe.default=So});var Kr=h(Ne=>{"use strict";Object.defineProperty(Ne,"__esModule",{value:!0});Ne.default=void 0;var Co="00000000-0000-0000-0000-000000000000";Ne.default=Co});var Qr=h($e=>{"use strict";Object.defineProperty($e,"__esModule",{value:!0});$e.default=void 0;var Ao=Eo(pe());function Eo(e){return e&&e.__esModule?e:{default:e}}function jo(e){if(!(0,Ao.default)(e))throw TypeError("Invalid UUID");return parseInt(e.substr(14,1),16)}var Po=jo;$e.default=Po});var Jr=h(L=>{"use strict";Object.defineProperty(L,"__esModule",{value:!0});Object.defineProperty(L,"v1",{enumerable:!0,get:function(){return _o.default}});Object.defineProperty(L,"v3",{enumerable:!0,get:function(){return To.default}});Object.defineProperty(L,"v4",{enumerable:!0,get:function(){return ko.default}});Object.defineProperty(L,"v5",{enumerable:!0,get:function(){return Do.default}});Object.defineProperty(L,"NIL",{enumerable:!0,get:function(){return Io.default}});Object.defineProperty(L,"version",{enumerable:!0,get:function(){return Oo.default}});Object.defineProperty(L,"validate",{enumerable:!0,get:function(){return Mo.default}});Object.defineProperty(L,"stringify",{enumerable:!0,get:function(){return Lo.default}});Object.defineProperty(L,"parse",{enumerable:!0,get:function(){return Bo.default}});var _o=N(Lr()),To=N(Ur()),ko=N(Yr()),Do=N(Gr()),Io=N(Kr()),Oo=N(Qr()),Mo=N(pe()),Lo=N(he()),Bo=N(pr());function N(e){return e&&e.__esModule?e:{default:e}}});var me=h((Il,rt)=>{var qo=Object.prototype.toString;rt.exports=function(r){if(r===void 0)return"undefined";if(r===null)return"null";var t=typeof r;if(t==="boolean")return"boolean";if(t==="string")return"string";if(t==="number")return"number";if(t==="symbol")return"symbol";if(t==="function")return Ho(r)?"generatorfunction":"function";if(No(r))return"array";if(Wo(r))return"buffer";if(Vo(r))return"arguments";if(Ro(r))return"date";if($o(r))return"error";if(Uo(r))return"regexp";switch(et(r)){case"Symbol":return"symbol";case"Promise":return"promise";case"WeakMap":return"weakmap";case"WeakSet":return"weakset";case"Map":return"map";case"Set":return"set";case"Int8Array":return"int8array";case"Uint8Array":return"uint8array";case"Uint8ClampedArray":return"uint8clampedarray";case"Int16Array":return"int16array";case"Uint16Array":return"uint16array";case"Int32Array":return"int32array";case"Uint32Array":return"uint32array";case"Float32Array":return"float32array";case"Float64Array":return"float64array"}if(Yo(r))return"generator";switch(t=qo.call(r),t){case"[object Object]":return"object";case"[object Map Iterator]":return"mapiterator";case"[object Set Iterator]":return"setiterator";case"[object String Iterator]":return"stringiterator";case"[object Array Iterator]":return"arrayiterator"}return t.slice(8,-1).toLowerCase().replace(/\s/g,"")};function et(e){return typeof e.constructor=="function"?e.constructor.name:null}function No(e){return Array.isArray?Array.isArray(e):e instanceof Array}function $o(e){return e instanceof Error||typeof e.message=="string"&&e.constructor&&typeof e.constructor.stackTraceLimit=="number"}function Ro(e){return e instanceof Date?!0:typeof e.toDateString=="function"&&typeof e.getDate=="function"&&typeof e.setDate=="function"}function Uo(e){return e instanceof RegExp?!0:typeof e.flags=="string"&&typeof e.ignoreCase=="boolean"&&typeof e.multiline=="boolean"&&typeof e.global=="boolean"}function Ho(e,r){return et(e)==="GeneratorFunction"}function Yo(e){return typeof e.throw=="function"&&typeof e.return=="function"&&typeof e.next=="function"}function Vo(e){try{if(typeof e.length=="number"&&typeof e.callee=="function")return!0}catch(r){if(r.message.indexOf("callee")!==-1)return!0}return!1}function Wo(e){return e.constructor&&typeof e.constructor.isBuffer=="function"?e.constructor.isBuffer(e):!1}});var nt=h((Ol,tt)=>{"use strict";tt.exports=function(r){return typeof r<"u"&&r!==null&&(typeof r=="object"||typeof r=="function")}});var at=h((Ml,ot)=>{"use strict";var it=nt();ot.exports=function(r){it(r)||(r={});for(var t=arguments.length,i=1;i<t;i++){var n=arguments[i];it(n)&&Go(r,n)}return r};function Go(e,r){for(var t in r)Ko(r,t)&&(e[t]=r[t])}function Ko(e,r){return Object.prototype.hasOwnProperty.call(e,r)}});var lt=h((Ll,ct)=>{"use strict";var Qo=me(),Jo=at();ct.exports=function(e,r){typeof r=="function"&&(r={parse:r});var t=Xo(e),i={section_delimiter:"---",parse:ea},n=Jo({},i,r),a=n.section_delimiter,o=t.content.split(/\r?\n/),s=null,c=st(),l=[],u=[];function d(D){t.content=D,s=[],l=[]}function f(D){u.length&&(c.key=Zo(u[0],a),c.content=D,n.parse(c,s),s.push(c),c=st(),l=[],u=[])}for(var p=0;p<o.length;p++){var m=o[p],y=u.length,v=m.trim();if(zo(v,a)){if(v.length===3&&p!==0){if(y===0||y===2){l.push(m);continue}u.push(v),c.data=l.join(`
`),l=[];continue}s===null&&d(l.join(`
`)),y===2&&f(l.join(`
`)),u.push(v);continue}l.push(m)}return s===null?d(l.join(`
`)):f(l.join(`
`)),t.sections=s,t};function zo(e,r){return!(e.slice(0,r.length)!==r||e.charAt(r.length+1)===r.slice(-1))}function Xo(e){if(Qo(e)!=="object"&&(e={content:e}),typeof e.content!="string"&&!ra(e.content))throw new TypeError("expected a buffer or string");return e.content=e.content.toString(),e.sections=[],e}function Zo(e,r){return e?e.slice(r.length).trim():""}function st(){return{key:"",data:"",content:""}}function ea(e){return e}function ra(e){return e&&e.constructor&&typeof e.constructor.isBuffer=="function"?e.constructor.isBuffer(e):!1}});var Q=h((Bl,K)=>{"use strict";function ut(e){return typeof e>"u"||e===null}function ta(e){return typeof e=="object"&&e!==null}function na(e){return Array.isArray(e)?e:ut(e)?[]:[e]}function ia(e,r){var t,i,n,a;if(r)for(a=Object.keys(r),t=0,i=a.length;t<i;t+=1)n=a[t],e[n]=r[n];return e}function oa(e,r){var t="",i;for(i=0;i<r;i+=1)t+=e;return t}function aa(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}K.exports.isNothing=ut;K.exports.isObject=ta;K.exports.toArray=na;K.exports.repeat=oa;K.exports.isNegativeZero=aa;K.exports.extend=ia});var ne=h((ql,dt)=>{"use strict";function ve(e,r){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=r,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}ve.prototype=Object.create(Error.prototype);ve.prototype.constructor=ve;ve.prototype.toString=function(r){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!r&&this.mark&&(t+=" "+this.mark.toString()),t};dt.exports=ve});var ht=h((Nl,pt)=>{"use strict";var ft=Q();function gr(e,r,t,i,n){this.name=e,this.buffer=r,this.position=t,this.line=i,this.column=n}gr.prototype.getSnippet=function(r,t){var i,n,a,o,s;if(!this.buffer)return null;for(r=r||4,t=t||75,i="",n=this.position;n>0&&`\0\r
\x85\u2028\u2029`.indexOf(this.buffer.charAt(n-1))===-1;)if(n-=1,this.position-n>t/2-1){i=" ... ",n+=5;break}for(a="",o=this.position;o<this.buffer.length&&`\0\r
\x85\u2028\u2029`.indexOf(this.buffer.charAt(o))===-1;)if(o+=1,o-this.position>t/2-1){a=" ... ",o-=5;break}return s=this.buffer.slice(n,o),ft.repeat(" ",r)+i+s+a+`
`+ft.repeat(" ",r+this.position-n+i.length)+"^"};gr.prototype.toString=function(r){var t,i="";return this.name&&(i+='in "'+this.name+'" '),i+="at line "+(this.line+1)+", column "+(this.column+1),r||(t=this.getSnippet(),t&&(i+=`:
`+t)),i};pt.exports=gr});var C=h(($l,mt)=>{"use strict";var gt=ne(),sa=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],ca=["scalar","sequence","mapping"];function la(e){var r={};return e!==null&&Object.keys(e).forEach(function(t){e[t].forEach(function(i){r[String(i)]=t})}),r}function ua(e,r){if(r=r||{},Object.keys(r).forEach(function(t){if(sa.indexOf(t)===-1)throw new gt('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=r.kind||null,this.resolve=r.resolve||function(){return!0},this.construct=r.construct||function(t){return t},this.instanceOf=r.instanceOf||null,this.predicate=r.predicate||null,this.represent=r.represent||null,this.defaultStyle=r.defaultStyle||null,this.styleAliases=la(r.styleAliases||null),ca.indexOf(this.kind)===-1)throw new gt('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}mt.exports=ua});var J=h((Rl,yt)=>{"use strict";var vt=Q(),Ye=ne(),da=C();function mr(e,r,t){var i=[];return e.include.forEach(function(n){t=mr(n,r,t)}),e[r].forEach(function(n){t.forEach(function(a,o){a.tag===n.tag&&a.kind===n.kind&&i.push(o)}),t.push(n)}),t.filter(function(n,a){return i.indexOf(a)===-1})}function fa(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},r,t;function i(n){e[n.kind][n.tag]=e.fallback[n.tag]=n}for(r=0,t=arguments.length;r<t;r+=1)arguments[r].forEach(i);return e}function ie(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(r){if(r.loadKind&&r.loadKind!=="scalar")throw new Ye("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=mr(this,"implicit",[]),this.compiledExplicit=mr(this,"explicit",[]),this.compiledTypeMap=fa(this.compiledImplicit,this.compiledExplicit)}ie.DEFAULT=null;ie.create=function(){var r,t;switch(arguments.length){case 1:r=ie.DEFAULT,t=arguments[0];break;case 2:r=arguments[0],t=arguments[1];break;default:throw new Ye("Wrong number of arguments for Schema.create function")}if(r=vt.toArray(r),t=vt.toArray(t),!r.every(function(i){return i instanceof ie}))throw new Ye("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(i){return i instanceof da}))throw new Ye("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new ie({include:r,explicit:t})};yt.exports=ie});var xt=h((Ul,wt)=>{"use strict";var pa=C();wt.exports=new pa("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}})});var Ft=h((Hl,bt)=>{"use strict";var ha=C();bt.exports=new ha("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}})});var Ct=h((Yl,St)=>{"use strict";var ga=C();St.exports=new ga("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}})});var Ve=h((Vl,At)=>{"use strict";var ma=J();At.exports=new ma({explicit:[xt(),Ft(),Ct()]})});var jt=h((Wl,Et)=>{"use strict";var va=C();function ya(e){if(e===null)return!0;var r=e.length;return r===1&&e==="~"||r===4&&(e==="null"||e==="Null"||e==="NULL")}function wa(){return null}function xa(e){return e===null}Et.exports=new va("tag:yaml.org,2002:null",{kind:"scalar",resolve:ya,construct:wa,predicate:xa,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"})});var _t=h((Gl,Pt)=>{"use strict";var ba=C();function Fa(e){if(e===null)return!1;var r=e.length;return r===4&&(e==="true"||e==="True"||e==="TRUE")||r===5&&(e==="false"||e==="False"||e==="FALSE")}function Sa(e){return e==="true"||e==="True"||e==="TRUE"}function Ca(e){return Object.prototype.toString.call(e)==="[object Boolean]"}Pt.exports=new ba("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Fa,construct:Sa,predicate:Ca,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"})});var kt=h((Kl,Tt)=>{"use strict";var Aa=Q(),Ea=C();function ja(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function Pa(e){return 48<=e&&e<=55}function _a(e){return 48<=e&&e<=57}function Ta(e){if(e===null)return!1;var r=e.length,t=0,i=!1,n;if(!r)return!1;if(n=e[t],(n==="-"||n==="+")&&(n=e[++t]),n==="0"){if(t+1===r)return!0;if(n=e[++t],n==="b"){for(t++;t<r;t++)if(n=e[t],n!=="_"){if(n!=="0"&&n!=="1")return!1;i=!0}return i&&n!=="_"}if(n==="x"){for(t++;t<r;t++)if(n=e[t],n!=="_"){if(!ja(e.charCodeAt(t)))return!1;i=!0}return i&&n!=="_"}for(;t<r;t++)if(n=e[t],n!=="_"){if(!Pa(e.charCodeAt(t)))return!1;i=!0}return i&&n!=="_"}if(n==="_")return!1;for(;t<r;t++)if(n=e[t],n!=="_"){if(n===":")break;if(!_a(e.charCodeAt(t)))return!1;i=!0}return!i||n==="_"?!1:n!==":"?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(t))}function ka(e){var r=e,t=1,i,n,a=[];return r.indexOf("_")!==-1&&(r=r.replace(/_/g,"")),i=r[0],(i==="-"||i==="+")&&(i==="-"&&(t=-1),r=r.slice(1),i=r[0]),r==="0"?0:i==="0"?r[1]==="b"?t*parseInt(r.slice(2),2):r[1]==="x"?t*parseInt(r,16):t*parseInt(r,8):r.indexOf(":")!==-1?(r.split(":").forEach(function(o){a.unshift(parseInt(o,10))}),r=0,n=1,a.forEach(function(o){r+=o*n,n*=60}),t*r):t*parseInt(r,10)}function Da(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!Aa.isNegativeZero(e)}Tt.exports=new Ea("tag:yaml.org,2002:int",{kind:"scalar",resolve:Ta,construct:ka,predicate:Da,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0"+e.toString(8):"-0"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}})});var Ot=h((Ql,It)=>{"use strict";var Dt=Q(),Ia=C(),Oa=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function Ma(e){return!(e===null||!Oa.test(e)||e[e.length-1]==="_")}function La(e){var r,t,i,n;return r=e.replace(/_/g,"").toLowerCase(),t=r[0]==="-"?-1:1,n=[],"+-".indexOf(r[0])>=0&&(r=r.slice(1)),r===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:r===".nan"?NaN:r.indexOf(":")>=0?(r.split(":").forEach(function(a){n.unshift(parseFloat(a,10))}),r=0,i=1,n.forEach(function(a){r+=a*i,i*=60}),t*r):t*parseFloat(r,10)}var Ba=/^[-+]?[0-9]+e/;function qa(e,r){var t;if(isNaN(e))switch(r){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(r){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(r){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(Dt.isNegativeZero(e))return"-0.0";return t=e.toString(10),Ba.test(t)?t.replace("e",".e"):t}function Na(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||Dt.isNegativeZero(e))}It.exports=new Ia("tag:yaml.org,2002:float",{kind:"scalar",resolve:Ma,construct:La,predicate:Na,represent:qa,defaultStyle:"lowercase"})});var vr=h((Jl,Mt)=>{"use strict";var $a=J();Mt.exports=new $a({include:[Ve()],implicit:[jt(),_t(),kt(),Ot()]})});var yr=h((zl,Lt)=>{"use strict";var Ra=J();Lt.exports=new Ra({include:[vr()]})});var $t=h((Xl,Nt)=>{"use strict";var Ua=C(),Bt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),qt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function Ha(e){return e===null?!1:Bt.exec(e)!==null||qt.exec(e)!==null}function Ya(e){var r,t,i,n,a,o,s,c=0,l=null,u,d,f;if(r=Bt.exec(e),r===null&&(r=qt.exec(e)),r===null)throw new Error("Date resolve error");if(t=+r[1],i=+r[2]-1,n=+r[3],!r[4])return new Date(Date.UTC(t,i,n));if(a=+r[4],o=+r[5],s=+r[6],r[7]){for(c=r[7].slice(0,3);c.length<3;)c+="0";c=+c}return r[9]&&(u=+r[10],d=+(r[11]||0),l=(u*60+d)*6e4,r[9]==="-"&&(l=-l)),f=new Date(Date.UTC(t,i,n,a,o,s,c)),l&&f.setTime(f.getTime()-l),f}function Va(e){return e.toISOString()}Nt.exports=new Ua("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:Ha,construct:Ya,instanceOf:Date,represent:Va})});var Ut=h((Zl,Rt)=>{"use strict";var Wa=C();function Ga(e){return e==="<<"||e===null}Rt.exports=new Wa("tag:yaml.org,2002:merge",{kind:"scalar",resolve:Ga})});var Vt=h((eu,Yt)=>{"use strict";var z;try{Ht=require,z=Ht("buffer").Buffer}catch{}var Ht,Ka=C(),wr=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function Qa(e){if(e===null)return!1;var r,t,i=0,n=e.length,a=wr;for(t=0;t<n;t++)if(r=a.indexOf(e.charAt(t)),!(r>64)){if(r<0)return!1;i+=6}return i%8===0}function Ja(e){var r,t,i=e.replace(/[\r\n=]/g,""),n=i.length,a=wr,o=0,s=[];for(r=0;r<n;r++)r%4===0&&r&&(s.push(o>>16&255),s.push(o>>8&255),s.push(o&255)),o=o<<6|a.indexOf(i.charAt(r));return t=n%4*6,t===0?(s.push(o>>16&255),s.push(o>>8&255),s.push(o&255)):t===18?(s.push(o>>10&255),s.push(o>>2&255)):t===12&&s.push(o>>4&255),z?z.from?z.from(s):new z(s):s}function za(e){var r="",t=0,i,n,a=e.length,o=wr;for(i=0;i<a;i++)i%3===0&&i&&(r+=o[t>>18&63],r+=o[t>>12&63],r+=o[t>>6&63],r+=o[t&63]),t=(t<<8)+e[i];return n=a%3,n===0?(r+=o[t>>18&63],r+=o[t>>12&63],r+=o[t>>6&63],r+=o[t&63]):n===2?(r+=o[t>>10&63],r+=o[t>>4&63],r+=o[t<<2&63],r+=o[64]):n===1&&(r+=o[t>>2&63],r+=o[t<<4&63],r+=o[64],r+=o[64]),r}function Xa(e){return z&&z.isBuffer(e)}Yt.exports=new Ka("tag:yaml.org,2002:binary",{kind:"scalar",resolve:Qa,construct:Ja,predicate:Xa,represent:za})});var Gt=h((ru,Wt)=>{"use strict";var Za=C(),es=Object.prototype.hasOwnProperty,rs=Object.prototype.toString;function ts(e){if(e===null)return!0;var r=[],t,i,n,a,o,s=e;for(t=0,i=s.length;t<i;t+=1){if(n=s[t],o=!1,rs.call(n)!=="[object Object]")return!1;for(a in n)if(es.call(n,a))if(!o)o=!0;else return!1;if(!o)return!1;if(r.indexOf(a)===-1)r.push(a);else return!1}return!0}function ns(e){return e!==null?e:[]}Wt.exports=new Za("tag:yaml.org,2002:omap",{kind:"sequence",resolve:ts,construct:ns})});var Qt=h((tu,Kt)=>{"use strict";var is=C(),os=Object.prototype.toString;function as(e){if(e===null)return!0;var r,t,i,n,a,o=e;for(a=new Array(o.length),r=0,t=o.length;r<t;r+=1){if(i=o[r],os.call(i)!=="[object Object]"||(n=Object.keys(i),n.length!==1))return!1;a[r]=[n[0],i[n[0]]]}return!0}function ss(e){if(e===null)return[];var r,t,i,n,a,o=e;for(a=new Array(o.length),r=0,t=o.length;r<t;r+=1)i=o[r],n=Object.keys(i),a[r]=[n[0],i[n[0]]];return a}Kt.exports=new is("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:as,construct:ss})});var zt=h((nu,Jt)=>{"use strict";var cs=C(),ls=Object.prototype.hasOwnProperty;function us(e){if(e===null)return!0;var r,t=e;for(r in t)if(ls.call(t,r)&&t[r]!==null)return!1;return!0}function ds(e){return e!==null?e:{}}Jt.exports=new cs("tag:yaml.org,2002:set",{kind:"mapping",resolve:us,construct:ds})});var oe=h((iu,Xt)=>{"use strict";var fs=J();Xt.exports=new fs({include:[yr()],implicit:[$t(),Ut()],explicit:[Vt(),Gt(),Qt(),zt()]})});var en=h((ou,Zt)=>{"use strict";var ps=C();function hs(){return!0}function gs(){}function ms(){return""}function vs(e){return typeof e>"u"}Zt.exports=new ps("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:hs,construct:gs,predicate:vs,represent:ms})});var tn=h((au,rn)=>{"use strict";var ys=C();function ws(e){if(e===null||e.length===0)return!1;var r=e,t=/\/([gim]*)$/.exec(e),i="";return!(r[0]==="/"&&(t&&(i=t[1]),i.length>3||r[r.length-i.length-1]!=="/"))}function xs(e){var r=e,t=/\/([gim]*)$/.exec(e),i="";return r[0]==="/"&&(t&&(i=t[1]),r=r.slice(1,r.length-i.length-1)),new RegExp(r,i)}function bs(e){var r="/"+e.source+"/";return e.global&&(r+="g"),e.multiline&&(r+="m"),e.ignoreCase&&(r+="i"),r}function Fs(e){return Object.prototype.toString.call(e)==="[object RegExp]"}rn.exports=new ys("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:ws,construct:xs,predicate:Fs,represent:bs})});var an=h((su,on)=>{"use strict";var We;try{nn=require,We=nn("esprima")}catch{typeof window<"u"&&(We=window.esprima)}var nn,Ss=C();function Cs(e){if(e===null)return!1;try{var r="("+e+")",t=We.parse(r,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function As(e){var r="("+e+")",t=We.parse(r,{range:!0}),i=[],n;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(a){i.push(a.name)}),n=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(i,r.slice(n[0]+1,n[1]-1)):new Function(i,"return "+r.slice(n[0],n[1]))}function Es(e){return e.toString()}function js(e){return Object.prototype.toString.call(e)==="[object Function]"}on.exports=new Ss("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:Cs,construct:As,predicate:js,represent:Es})});var ye=h((cu,cn)=>{"use strict";var sn=J();cn.exports=sn.DEFAULT=new sn({include:[oe()],explicit:[en(),tn(),an()]})});var jn=h((lu,we)=>{"use strict";var $=Q(),gn=ne(),Ps=ht(),mn=oe(),_s=ye(),Y=Object.prototype.hasOwnProperty,Ge=1,vn=2,yn=3,Ke=4,xr=1,Ts=2,ln=3,ks=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Ds=/[\x85\u2028\u2029]/,Is=/[,\[\]\{\}]/,wn=/^(?:!|!!|![a-z\-]+!)$/i,xn=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function un(e){return Object.prototype.toString.call(e)}function q(e){return e===10||e===13}function Z(e){return e===9||e===32}function T(e){return e===9||e===32||e===10||e===13}function ae(e){return e===44||e===91||e===93||e===123||e===125}function Os(e){var r;return 48<=e&&e<=57?e-48:(r=e|32,97<=r&&r<=102?r-97+10:-1)}function Ms(e){return e===120?2:e===117?4:e===85?8:0}function Ls(e){return 48<=e&&e<=57?e-48:-1}function dn(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"\x85":e===95?"\xA0":e===76?"\u2028":e===80?"\u2029":""}function Bs(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}var bn=new Array(256),Fn=new Array(256);for(X=0;X<256;X++)bn[X]=dn(X)?1:0,Fn[X]=dn(X);var X;function qs(e,r){this.input=e,this.filename=r.filename||null,this.schema=r.schema||_s,this.onWarning=r.onWarning||null,this.legacy=r.legacy||!1,this.json=r.json||!1,this.listener=r.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function Sn(e,r){return new gn(r,new Ps(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function g(e,r){throw Sn(e,r)}function Qe(e,r){e.onWarning&&e.onWarning.call(null,Sn(e,r))}var fn={YAML:function(r,t,i){var n,a,o;r.version!==null&&g(r,"duplication of %YAML directive"),i.length!==1&&g(r,"YAML directive accepts exactly one argument"),n=/^([0-9]+)\.([0-9]+)$/.exec(i[0]),n===null&&g(r,"ill-formed argument of the YAML directive"),a=parseInt(n[1],10),o=parseInt(n[2],10),a!==1&&g(r,"unacceptable YAML version of the document"),r.version=i[0],r.checkLineBreaks=o<2,o!==1&&o!==2&&Qe(r,"unsupported YAML version of the document")},TAG:function(r,t,i){var n,a;i.length!==2&&g(r,"TAG directive accepts exactly two arguments"),n=i[0],a=i[1],wn.test(n)||g(r,"ill-formed tag handle (first argument) of the TAG directive"),Y.call(r.tagMap,n)&&g(r,'there is a previously declared suffix for "'+n+'" tag handle'),xn.test(a)||g(r,"ill-formed tag prefix (second argument) of the TAG directive"),r.tagMap[n]=a}};function H(e,r,t,i){var n,a,o,s;if(r<t){if(s=e.input.slice(r,t),i)for(n=0,a=s.length;n<a;n+=1)o=s.charCodeAt(n),o===9||32<=o&&o<=1114111||g(e,"expected valid JSON character");else ks.test(s)&&g(e,"the stream contains non-printable characters");e.result+=s}}function pn(e,r,t,i){var n,a,o,s;for($.isObject(t)||g(e,"cannot merge mappings; the provided source object is unacceptable"),n=Object.keys(t),o=0,s=n.length;o<s;o+=1)a=n[o],Y.call(r,a)||(r[a]=t[a],i[a]=!0)}function se(e,r,t,i,n,a,o,s){var c,l;if(Array.isArray(n))for(n=Array.prototype.slice.call(n),c=0,l=n.length;c<l;c+=1)Array.isArray(n[c])&&g(e,"nested arrays are not supported inside keys"),typeof n=="object"&&un(n[c])==="[object Object]"&&(n[c]="[object Object]");if(typeof n=="object"&&un(n)==="[object Object]"&&(n="[object Object]"),n=String(n),r===null&&(r={}),i==="tag:yaml.org,2002:merge")if(Array.isArray(a))for(c=0,l=a.length;c<l;c+=1)pn(e,r,a[c],t);else pn(e,r,a,t);else!e.json&&!Y.call(t,n)&&Y.call(r,n)&&(e.line=o||e.line,e.position=s||e.position,g(e,"duplicated mapping key")),r[n]=a,delete t[n];return r}function br(e){var r;r=e.input.charCodeAt(e.position),r===10?e.position++:r===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):g(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function F(e,r,t){for(var i=0,n=e.input.charCodeAt(e.position);n!==0;){for(;Z(n);)n=e.input.charCodeAt(++e.position);if(r&&n===35)do n=e.input.charCodeAt(++e.position);while(n!==10&&n!==13&&n!==0);if(q(n))for(br(e),n=e.input.charCodeAt(e.position),i++,e.lineIndent=0;n===32;)e.lineIndent++,n=e.input.charCodeAt(++e.position);else break}return t!==-1&&i!==0&&e.lineIndent<t&&Qe(e,"deficient indentation"),i}function Je(e){var r=e.position,t;return t=e.input.charCodeAt(r),!!((t===45||t===46)&&t===e.input.charCodeAt(r+1)&&t===e.input.charCodeAt(r+2)&&(r+=3,t=e.input.charCodeAt(r),t===0||T(t)))}function Fr(e,r){r===1?e.result+=" ":r>1&&(e.result+=$.repeat(`
`,r-1))}function Ns(e,r,t){var i,n,a,o,s,c,l,u,d=e.kind,f=e.result,p;if(p=e.input.charCodeAt(e.position),T(p)||ae(p)||p===35||p===38||p===42||p===33||p===124||p===62||p===39||p===34||p===37||p===64||p===96||(p===63||p===45)&&(n=e.input.charCodeAt(e.position+1),T(n)||t&&ae(n)))return!1;for(e.kind="scalar",e.result="",a=o=e.position,s=!1;p!==0;){if(p===58){if(n=e.input.charCodeAt(e.position+1),T(n)||t&&ae(n))break}else if(p===35){if(i=e.input.charCodeAt(e.position-1),T(i))break}else{if(e.position===e.lineStart&&Je(e)||t&&ae(p))break;if(q(p))if(c=e.line,l=e.lineStart,u=e.lineIndent,F(e,!1,-1),e.lineIndent>=r){s=!0,p=e.input.charCodeAt(e.position);continue}else{e.position=o,e.line=c,e.lineStart=l,e.lineIndent=u;break}}s&&(H(e,a,o,!1),Fr(e,e.line-c),a=o=e.position,s=!1),Z(p)||(o=e.position+1),p=e.input.charCodeAt(++e.position)}return H(e,a,o,!1),e.result?!0:(e.kind=d,e.result=f,!1)}function $s(e,r){var t,i,n;if(t=e.input.charCodeAt(e.position),t!==39)return!1;for(e.kind="scalar",e.result="",e.position++,i=n=e.position;(t=e.input.charCodeAt(e.position))!==0;)if(t===39)if(H(e,i,e.position,!0),t=e.input.charCodeAt(++e.position),t===39)i=e.position,e.position++,n=e.position;else return!0;else q(t)?(H(e,i,n,!0),Fr(e,F(e,!1,r)),i=n=e.position):e.position===e.lineStart&&Je(e)?g(e,"unexpected end of the document within a single quoted scalar"):(e.position++,n=e.position);g(e,"unexpected end of the stream within a single quoted scalar")}function Rs(e,r){var t,i,n,a,o,s;if(s=e.input.charCodeAt(e.position),s!==34)return!1;for(e.kind="scalar",e.result="",e.position++,t=i=e.position;(s=e.input.charCodeAt(e.position))!==0;){if(s===34)return H(e,t,e.position,!0),e.position++,!0;if(s===92){if(H(e,t,e.position,!0),s=e.input.charCodeAt(++e.position),q(s))F(e,!1,r);else if(s<256&&bn[s])e.result+=Fn[s],e.position++;else if((o=Ms(s))>0){for(n=o,a=0;n>0;n--)s=e.input.charCodeAt(++e.position),(o=Os(s))>=0?a=(a<<4)+o:g(e,"expected hexadecimal character");e.result+=Bs(a),e.position++}else g(e,"unknown escape sequence");t=i=e.position}else q(s)?(H(e,t,i,!0),Fr(e,F(e,!1,r)),t=i=e.position):e.position===e.lineStart&&Je(e)?g(e,"unexpected end of the document within a double quoted scalar"):(e.position++,i=e.position)}g(e,"unexpected end of the stream within a double quoted scalar")}function Us(e,r){var t=!0,i,n=e.tag,a,o=e.anchor,s,c,l,u,d,f={},p,m,y,v;if(v=e.input.charCodeAt(e.position),v===91)c=93,d=!1,a=[];else if(v===123)c=125,d=!0,a={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=a),v=e.input.charCodeAt(++e.position);v!==0;){if(F(e,!0,r),v=e.input.charCodeAt(e.position),v===c)return e.position++,e.tag=n,e.anchor=o,e.kind=d?"mapping":"sequence",e.result=a,!0;t||g(e,"missed comma between flow collection entries"),m=p=y=null,l=u=!1,v===63&&(s=e.input.charCodeAt(e.position+1),T(s)&&(l=u=!0,e.position++,F(e,!0,r))),i=e.line,ce(e,r,Ge,!1,!0),m=e.tag,p=e.result,F(e,!0,r),v=e.input.charCodeAt(e.position),(u||e.line===i)&&v===58&&(l=!0,v=e.input.charCodeAt(++e.position),F(e,!0,r),ce(e,r,Ge,!1,!0),y=e.result),d?se(e,a,f,m,p,y):l?a.push(se(e,null,f,m,p,y)):a.push(p),F(e,!0,r),v=e.input.charCodeAt(e.position),v===44?(t=!0,v=e.input.charCodeAt(++e.position)):t=!1}g(e,"unexpected end of the stream within a flow collection")}function Hs(e,r){var t,i,n=xr,a=!1,o=!1,s=r,c=0,l=!1,u,d;if(d=e.input.charCodeAt(e.position),d===124)i=!1;else if(d===62)i=!0;else return!1;for(e.kind="scalar",e.result="";d!==0;)if(d=e.input.charCodeAt(++e.position),d===43||d===45)xr===n?n=d===43?ln:Ts:g(e,"repeat of a chomping mode identifier");else if((u=Ls(d))>=0)u===0?g(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):o?g(e,"repeat of an indentation width identifier"):(s=r+u-1,o=!0);else break;if(Z(d)){do d=e.input.charCodeAt(++e.position);while(Z(d));if(d===35)do d=e.input.charCodeAt(++e.position);while(!q(d)&&d!==0)}for(;d!==0;){for(br(e),e.lineIndent=0,d=e.input.charCodeAt(e.position);(!o||e.lineIndent<s)&&d===32;)e.lineIndent++,d=e.input.charCodeAt(++e.position);if(!o&&e.lineIndent>s&&(s=e.lineIndent),q(d)){c++;continue}if(e.lineIndent<s){n===ln?e.result+=$.repeat(`
`,a?1+c:c):n===xr&&a&&(e.result+=`
`);break}for(i?Z(d)?(l=!0,e.result+=$.repeat(`
`,a?1+c:c)):l?(l=!1,e.result+=$.repeat(`
`,c+1)):c===0?a&&(e.result+=" "):e.result+=$.repeat(`
`,c):e.result+=$.repeat(`
`,a?1+c:c),a=!0,o=!0,c=0,t=e.position;!q(d)&&d!==0;)d=e.input.charCodeAt(++e.position);H(e,t,e.position,!1)}return!0}function hn(e,r){var t,i=e.tag,n=e.anchor,a=[],o,s=!1,c;for(e.anchor!==null&&(e.anchorMap[e.anchor]=a),c=e.input.charCodeAt(e.position);c!==0&&!(c!==45||(o=e.input.charCodeAt(e.position+1),!T(o)));){if(s=!0,e.position++,F(e,!0,-1)&&e.lineIndent<=r){a.push(null),c=e.input.charCodeAt(e.position);continue}if(t=e.line,ce(e,r,yn,!1,!0),a.push(e.result),F(e,!0,-1),c=e.input.charCodeAt(e.position),(e.line===t||e.lineIndent>r)&&c!==0)g(e,"bad indentation of a sequence entry");else if(e.lineIndent<r)break}return s?(e.tag=i,e.anchor=n,e.kind="sequence",e.result=a,!0):!1}function Ys(e,r,t){var i,n,a,o,s=e.tag,c=e.anchor,l={},u={},d=null,f=null,p=null,m=!1,y=!1,v;for(e.anchor!==null&&(e.anchorMap[e.anchor]=l),v=e.input.charCodeAt(e.position);v!==0;){if(i=e.input.charCodeAt(e.position+1),a=e.line,o=e.position,(v===63||v===58)&&T(i))v===63?(m&&(se(e,l,u,d,f,null),d=f=p=null),y=!0,m=!0,n=!0):m?(m=!1,n=!0):g(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,v=i;else if(ce(e,t,vn,!1,!0))if(e.line===a){for(v=e.input.charCodeAt(e.position);Z(v);)v=e.input.charCodeAt(++e.position);if(v===58)v=e.input.charCodeAt(++e.position),T(v)||g(e,"a whitespace character is expected after the key-value separator within a block mapping"),m&&(se(e,l,u,d,f,null),d=f=p=null),y=!0,m=!1,n=!1,d=e.tag,f=e.result;else if(y)g(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=s,e.anchor=c,!0}else if(y)g(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=s,e.anchor=c,!0;else break;if((e.line===a||e.lineIndent>r)&&(ce(e,r,Ke,!0,n)&&(m?f=e.result:p=e.result),m||(se(e,l,u,d,f,p,a,o),d=f=p=null),F(e,!0,-1),v=e.input.charCodeAt(e.position)),e.lineIndent>r&&v!==0)g(e,"bad indentation of a mapping entry");else if(e.lineIndent<r)break}return m&&se(e,l,u,d,f,null),y&&(e.tag=s,e.anchor=c,e.kind="mapping",e.result=l),y}function Vs(e){var r,t=!1,i=!1,n,a,o;if(o=e.input.charCodeAt(e.position),o!==33)return!1;if(e.tag!==null&&g(e,"duplication of a tag property"),o=e.input.charCodeAt(++e.position),o===60?(t=!0,o=e.input.charCodeAt(++e.position)):o===33?(i=!0,n="!!",o=e.input.charCodeAt(++e.position)):n="!",r=e.position,t){do o=e.input.charCodeAt(++e.position);while(o!==0&&o!==62);e.position<e.length?(a=e.input.slice(r,e.position),o=e.input.charCodeAt(++e.position)):g(e,"unexpected end of the stream within a verbatim tag")}else{for(;o!==0&&!T(o);)o===33&&(i?g(e,"tag suffix cannot contain exclamation marks"):(n=e.input.slice(r-1,e.position+1),wn.test(n)||g(e,"named tag handle cannot contain such characters"),i=!0,r=e.position+1)),o=e.input.charCodeAt(++e.position);a=e.input.slice(r,e.position),Is.test(a)&&g(e,"tag suffix cannot contain flow indicator characters")}return a&&!xn.test(a)&&g(e,"tag name cannot contain such characters: "+a),t?e.tag=a:Y.call(e.tagMap,n)?e.tag=e.tagMap[n]+a:n==="!"?e.tag="!"+a:n==="!!"?e.tag="tag:yaml.org,2002:"+a:g(e,'undeclared tag handle "'+n+'"'),!0}function Ws(e){var r,t;if(t=e.input.charCodeAt(e.position),t!==38)return!1;for(e.anchor!==null&&g(e,"duplication of an anchor property"),t=e.input.charCodeAt(++e.position),r=e.position;t!==0&&!T(t)&&!ae(t);)t=e.input.charCodeAt(++e.position);return e.position===r&&g(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(r,e.position),!0}function Gs(e){var r,t,i;if(i=e.input.charCodeAt(e.position),i!==42)return!1;for(i=e.input.charCodeAt(++e.position),r=e.position;i!==0&&!T(i)&&!ae(i);)i=e.input.charCodeAt(++e.position);return e.position===r&&g(e,"name of an alias node must contain at least one character"),t=e.input.slice(r,e.position),Y.call(e.anchorMap,t)||g(e,'unidentified alias "'+t+'"'),e.result=e.anchorMap[t],F(e,!0,-1),!0}function ce(e,r,t,i,n){var a,o,s,c=1,l=!1,u=!1,d,f,p,m,y;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,a=o=s=Ke===t||yn===t,i&&F(e,!0,-1)&&(l=!0,e.lineIndent>r?c=1:e.lineIndent===r?c=0:e.lineIndent<r&&(c=-1)),c===1)for(;Vs(e)||Ws(e);)F(e,!0,-1)?(l=!0,s=a,e.lineIndent>r?c=1:e.lineIndent===r?c=0:e.lineIndent<r&&(c=-1)):s=!1;if(s&&(s=l||n),(c===1||Ke===t)&&(Ge===t||vn===t?m=r:m=r+1,y=e.position-e.lineStart,c===1?s&&(hn(e,y)||Ys(e,y,m))||Us(e,m)?u=!0:(o&&Hs(e,m)||$s(e,m)||Rs(e,m)?u=!0:Gs(e)?(u=!0,(e.tag!==null||e.anchor!==null)&&g(e,"alias node should not have any properties")):Ns(e,m,Ge===t)&&(u=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):c===0&&(u=s&&hn(e,y))),e.tag!==null&&e.tag!=="!")if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&g(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),d=0,f=e.implicitTypes.length;d<f;d+=1)if(p=e.implicitTypes[d],p.resolve(e.result)){e.result=p.construct(e.result),e.tag=p.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else Y.call(e.typeMap[e.kind||"fallback"],e.tag)?(p=e.typeMap[e.kind||"fallback"][e.tag],e.result!==null&&p.kind!==e.kind&&g(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+p.kind+'", not "'+e.kind+'"'),p.resolve(e.result)?(e.result=p.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):g(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):g(e,"unknown tag !<"+e.tag+">");return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||u}function Ks(e){var r=e.position,t,i,n,a=!1,o;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(o=e.input.charCodeAt(e.position))!==0&&(F(e,!0,-1),o=e.input.charCodeAt(e.position),!(e.lineIndent>0||o!==37));){for(a=!0,o=e.input.charCodeAt(++e.position),t=e.position;o!==0&&!T(o);)o=e.input.charCodeAt(++e.position);for(i=e.input.slice(t,e.position),n=[],i.length<1&&g(e,"directive name must not be less than one character in length");o!==0;){for(;Z(o);)o=e.input.charCodeAt(++e.position);if(o===35){do o=e.input.charCodeAt(++e.position);while(o!==0&&!q(o));break}if(q(o))break;for(t=e.position;o!==0&&!T(o);)o=e.input.charCodeAt(++e.position);n.push(e.input.slice(t,e.position))}o!==0&&br(e),Y.call(fn,i)?fn[i](e,i,n):Qe(e,'unknown document directive "'+i+'"')}if(F(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,F(e,!0,-1)):a&&g(e,"directives end mark is expected"),ce(e,e.lineIndent-1,Ke,!1,!0),F(e,!0,-1),e.checkLineBreaks&&Ds.test(e.input.slice(r,e.position))&&Qe(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&Je(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,F(e,!0,-1));return}if(e.position<e.length-1)g(e,"end of the stream or a document separator is expected");else return}function Cn(e,r){e=String(e),r=r||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var t=new qs(e,r),i=e.indexOf("\0");for(i!==-1&&(t.position=i,g(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)Ks(t);return t.documents}function An(e,r,t){r!==null&&typeof r=="object"&&typeof t>"u"&&(t=r,r=null);var i=Cn(e,t);if(typeof r!="function")return i;for(var n=0,a=i.length;n<a;n+=1)r(i[n])}function En(e,r){var t=Cn(e,r);if(t.length!==0){if(t.length===1)return t[0];throw new gn("expected a single document in the stream, but found more")}}function Qs(e,r,t){return typeof r=="object"&&r!==null&&typeof t>"u"&&(t=r,r=null),An(e,r,$.extend({schema:mn},t))}function Js(e,r){return En(e,$.extend({schema:mn},r))}we.exports.loadAll=An;we.exports.load=En;we.exports.safeLoadAll=Qs;we.exports.safeLoad=Js});var Jn=h((uu,Er)=>{"use strict";var be=Q(),Fe=ne(),zs=ye(),Xs=oe(),Mn=Object.prototype.toString,Ln=Object.prototype.hasOwnProperty,Zs=9,xe=10,ec=13,rc=32,tc=33,nc=34,Bn=35,ic=37,oc=38,ac=39,sc=42,qn=44,cc=45,Nn=58,lc=61,uc=62,dc=63,fc=64,$n=91,Rn=93,pc=96,Un=123,hc=124,Hn=125,P={};P[0]="\\0";P[7]="\\a";P[8]="\\b";P[9]="\\t";P[10]="\\n";P[11]="\\v";P[12]="\\f";P[13]="\\r";P[27]="\\e";P[34]='\\"';P[92]="\\\\";P[133]="\\N";P[160]="\\_";P[8232]="\\L";P[8233]="\\P";var gc=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function mc(e,r){var t,i,n,a,o,s,c;if(r===null)return{};for(t={},i=Object.keys(r),n=0,a=i.length;n<a;n+=1)o=i[n],s=String(r[o]),o.slice(0,2)==="!!"&&(o="tag:yaml.org,2002:"+o.slice(2)),c=e.compiledTypeMap.fallback[o],c&&Ln.call(c.styleAliases,s)&&(s=c.styleAliases[s]),t[o]=s;return t}function Pn(e){var r,t,i;if(r=e.toString(16).toUpperCase(),e<=255)t="x",i=2;else if(e<=65535)t="u",i=4;else if(e<=4294967295)t="U",i=8;else throw new Fe("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+be.repeat("0",i-r.length)+r}function vc(e){this.schema=e.schema||zs,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=be.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=mc(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function _n(e,r){for(var t=be.repeat(" ",r),i=0,n=-1,a="",o,s=e.length;i<s;)n=e.indexOf(`
`,i),n===-1?(o=e.slice(i),i=s):(o=e.slice(i,n+1),i=n+1),o.length&&o!==`
`&&(a+=t),a+=o;return a}function Sr(e,r){return`
`+be.repeat(" ",e.indent*r)}function yc(e,r){var t,i,n;for(t=0,i=e.implicitTypes.length;t<i;t+=1)if(n=e.implicitTypes[t],n.resolve(r))return!0;return!1}function Ar(e){return e===rc||e===Zs}function le(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function wc(e){return le(e)&&!Ar(e)&&e!==65279&&e!==ec&&e!==xe}function Tn(e,r){return le(e)&&e!==65279&&e!==qn&&e!==$n&&e!==Rn&&e!==Un&&e!==Hn&&e!==Nn&&(e!==Bn||r&&wc(r))}function xc(e){return le(e)&&e!==65279&&!Ar(e)&&e!==cc&&e!==dc&&e!==Nn&&e!==qn&&e!==$n&&e!==Rn&&e!==Un&&e!==Hn&&e!==Bn&&e!==oc&&e!==sc&&e!==tc&&e!==hc&&e!==lc&&e!==uc&&e!==ac&&e!==nc&&e!==ic&&e!==fc&&e!==pc}function Yn(e){var r=/^\n* /;return r.test(e)}var Vn=1,Wn=2,Gn=3,Kn=4,ze=5;function bc(e,r,t,i,n){var a,o,s,c=!1,l=!1,u=i!==-1,d=-1,f=xc(e.charCodeAt(0))&&!Ar(e.charCodeAt(e.length-1));if(r)for(a=0;a<e.length;a++){if(o=e.charCodeAt(a),!le(o))return ze;s=a>0?e.charCodeAt(a-1):null,f=f&&Tn(o,s)}else{for(a=0;a<e.length;a++){if(o=e.charCodeAt(a),o===xe)c=!0,u&&(l=l||a-d-1>i&&e[d+1]!==" ",d=a);else if(!le(o))return ze;s=a>0?e.charCodeAt(a-1):null,f=f&&Tn(o,s)}l=l||u&&a-d-1>i&&e[d+1]!==" "}return!c&&!l?f&&!n(e)?Vn:Wn:t>9&&Yn(e)?ze:l?Kn:Gn}function Fc(e,r,t,i){e.dump=function(){if(r.length===0)return"''";if(!e.noCompatMode&&gc.indexOf(r)!==-1)return"'"+r+"'";var n=e.indent*Math.max(1,t),a=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-n),o=i||e.flowLevel>-1&&t>=e.flowLevel;function s(c){return yc(e,c)}switch(bc(r,o,e.indent,a,s)){case Vn:return r;case Wn:return"'"+r.replace(/'/g,"''")+"'";case Gn:return"|"+kn(r,e.indent)+Dn(_n(r,n));case Kn:return">"+kn(r,e.indent)+Dn(_n(Sc(r,a),n));case ze:return'"'+Cc(r,a)+'"';default:throw new Fe("impossible error: invalid scalar style")}}()}function kn(e,r){var t=Yn(e)?String(r):"",i=e[e.length-1]===`
`,n=i&&(e[e.length-2]===`
`||e===`
`),a=n?"+":i?"":"-";return t+a+`
`}function Dn(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function Sc(e,r){for(var t=/(\n+)([^\n]*)/g,i=function(){var l=e.indexOf(`
`);return l=l!==-1?l:e.length,t.lastIndex=l,In(e.slice(0,l),r)}(),n=e[0]===`
`||e[0]===" ",a,o;o=t.exec(e);){var s=o[1],c=o[2];a=c[0]===" ",i+=s+(!n&&!a&&c!==""?`
`:"")+In(c,r),n=a}return i}function In(e,r){if(e===""||e[0]===" ")return e;for(var t=/ [^ ]/g,i,n=0,a,o=0,s=0,c="";i=t.exec(e);)s=i.index,s-n>r&&(a=o>n?o:s,c+=`
`+e.slice(n,a),n=a+1),o=s;return c+=`
`,e.length-n>r&&o>n?c+=e.slice(n,o)+`
`+e.slice(o+1):c+=e.slice(n),c.slice(1)}function Cc(e){for(var r="",t,i,n,a=0;a<e.length;a++){if(t=e.charCodeAt(a),t>=55296&&t<=56319&&(i=e.charCodeAt(a+1),i>=56320&&i<=57343)){r+=Pn((t-55296)*1024+i-56320+65536),a++;continue}n=P[t],r+=!n&&le(t)?e[a]:n||Pn(t)}return r}function Ac(e,r,t){var i="",n=e.tag,a,o;for(a=0,o=t.length;a<o;a+=1)ee(e,r,t[a],!1,!1)&&(a!==0&&(i+=","+(e.condenseFlow?"":" ")),i+=e.dump);e.tag=n,e.dump="["+i+"]"}function Ec(e,r,t,i){var n="",a=e.tag,o,s;for(o=0,s=t.length;o<s;o+=1)ee(e,r+1,t[o],!0,!0)&&((!i||o!==0)&&(n+=Sr(e,r)),e.dump&&xe===e.dump.charCodeAt(0)?n+="-":n+="- ",n+=e.dump);e.tag=a,e.dump=n||"[]"}function jc(e,r,t){var i="",n=e.tag,a=Object.keys(t),o,s,c,l,u;for(o=0,s=a.length;o<s;o+=1)u="",o!==0&&(u+=", "),e.condenseFlow&&(u+='"'),c=a[o],l=t[c],ee(e,r,c,!1,!1)&&(e.dump.length>1024&&(u+="? "),u+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),ee(e,r,l,!1,!1)&&(u+=e.dump,i+=u));e.tag=n,e.dump="{"+i+"}"}function Pc(e,r,t,i){var n="",a=e.tag,o=Object.keys(t),s,c,l,u,d,f;if(e.sortKeys===!0)o.sort();else if(typeof e.sortKeys=="function")o.sort(e.sortKeys);else if(e.sortKeys)throw new Fe("sortKeys must be a boolean or a function");for(s=0,c=o.length;s<c;s+=1)f="",(!i||s!==0)&&(f+=Sr(e,r)),l=o[s],u=t[l],ee(e,r+1,l,!0,!0,!0)&&(d=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,d&&(e.dump&&xe===e.dump.charCodeAt(0)?f+="?":f+="? "),f+=e.dump,d&&(f+=Sr(e,r)),ee(e,r+1,u,!0,d)&&(e.dump&&xe===e.dump.charCodeAt(0)?f+=":":f+=": ",f+=e.dump,n+=f));e.tag=a,e.dump=n||"{}"}function On(e,r,t){var i,n,a,o,s,c;for(n=t?e.explicitTypes:e.implicitTypes,a=0,o=n.length;a<o;a+=1)if(s=n[a],(s.instanceOf||s.predicate)&&(!s.instanceOf||typeof r=="object"&&r instanceof s.instanceOf)&&(!s.predicate||s.predicate(r))){if(e.tag=t?s.tag:"?",s.represent){if(c=e.styleMap[s.tag]||s.defaultStyle,Mn.call(s.represent)==="[object Function]")i=s.represent(r,c);else if(Ln.call(s.represent,c))i=s.represent[c](r,c);else throw new Fe("!<"+s.tag+'> tag resolver accepts not "'+c+'" style');e.dump=i}return!0}return!1}function ee(e,r,t,i,n,a){e.tag=null,e.dump=t,On(e,t,!1)||On(e,t,!0);var o=Mn.call(e.dump);i&&(i=e.flowLevel<0||e.flowLevel>r);var s=o==="[object Object]"||o==="[object Array]",c,l;if(s&&(c=e.duplicates.indexOf(t),l=c!==-1),(e.tag!==null&&e.tag!=="?"||l||e.indent!==2&&r>0)&&(n=!1),l&&e.usedDuplicates[c])e.dump="*ref_"+c;else{if(s&&l&&!e.usedDuplicates[c]&&(e.usedDuplicates[c]=!0),o==="[object Object]")i&&Object.keys(e.dump).length!==0?(Pc(e,r,e.dump,n),l&&(e.dump="&ref_"+c+e.dump)):(jc(e,r,e.dump),l&&(e.dump="&ref_"+c+" "+e.dump));else if(o==="[object Array]"){var u=e.noArrayIndent&&r>0?r-1:r;i&&e.dump.length!==0?(Ec(e,u,e.dump,n),l&&(e.dump="&ref_"+c+e.dump)):(Ac(e,u,e.dump),l&&(e.dump="&ref_"+c+" "+e.dump))}else if(o==="[object String]")e.tag!=="?"&&Fc(e,e.dump,r,a);else{if(e.skipInvalid)return!1;throw new Fe("unacceptable kind of an object to dump "+o)}e.tag!==null&&e.tag!=="?"&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function _c(e,r){var t=[],i=[],n,a;for(Cr(e,t,i),n=0,a=i.length;n<a;n+=1)r.duplicates.push(t[i[n]]);r.usedDuplicates=new Array(a)}function Cr(e,r,t){var i,n,a;if(e!==null&&typeof e=="object")if(n=r.indexOf(e),n!==-1)t.indexOf(n)===-1&&t.push(n);else if(r.push(e),Array.isArray(e))for(n=0,a=e.length;n<a;n+=1)Cr(e[n],r,t);else for(i=Object.keys(e),n=0,a=i.length;n<a;n+=1)Cr(e[i[n]],r,t)}function Qn(e,r){r=r||{};var t=new vc(r);return t.noRefs||_c(e,t),ee(t,0,e,!0,!0)?t.dump+`
`:""}function Tc(e,r){return Qn(e,be.extend({schema:Xs},r))}Er.exports.dump=Qn;Er.exports.safeDump=Tc});var Xn=h((du,b)=>{"use strict";var Xe=jn(),zn=Jn();function Ze(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}b.exports.Type=C();b.exports.Schema=J();b.exports.FAILSAFE_SCHEMA=Ve();b.exports.JSON_SCHEMA=vr();b.exports.CORE_SCHEMA=yr();b.exports.DEFAULT_SAFE_SCHEMA=oe();b.exports.DEFAULT_FULL_SCHEMA=ye();b.exports.load=Xe.load;b.exports.loadAll=Xe.loadAll;b.exports.safeLoad=Xe.safeLoad;b.exports.safeLoadAll=Xe.safeLoadAll;b.exports.dump=zn.dump;b.exports.safeDump=zn.safeDump;b.exports.YAMLException=ne();b.exports.MINIMAL_SCHEMA=Ve();b.exports.SAFE_SCHEMA=oe();b.exports.DEFAULT_SCHEMA=ye();b.exports.scan=Ze("scan");b.exports.parse=Ze("parse");b.exports.compose=Ze("compose");b.exports.addConstructor=Ze("addConstructor")});var ei=h((fu,Zn)=>{"use strict";var kc=Xn();Zn.exports=kc});var jr=h((exports,module)=>{"use strict";var yaml=ei(),engines=exports=module.exports;engines.yaml={parse:yaml.safeLoad.bind(yaml),stringify:yaml.safeDump.bind(yaml)};engines.json={parse:JSON.parse.bind(JSON),stringify:function(e,r){let t=Object.assign({replacer:null,space:2},r);return JSON.stringify(e,t.replacer,t.space)}};engines.javascript={parse:function parse(str,options,wrap){try{return wrap!==!1&&(str=`(function() {
return `+str.trim()+`;
}());`),eval(str)||{}}catch(e){if(wrap!==!1&&/(unexpected|identifier)/i.test(e.message))return parse(str,options,!1);throw new SyntaxError(e)}},stringify:function(){throw new Error("stringifying JavaScript is not supported")}}});var ti=h((pu,ri)=>{"use strict";ri.exports=function(e){return typeof e=="string"&&e.charAt(0)==="\uFEFF"?e.slice(1):e}});var er=h(R=>{"use strict";var ni=ti(),ii=me();R.define=function(e,r,t){Reflect.defineProperty(e,r,{enumerable:!1,configurable:!0,writable:!0,value:t})};R.isBuffer=function(e){return ii(e)==="buffer"};R.isObject=function(e){return ii(e)==="object"};R.toBuffer=function(e){return typeof e=="string"?Buffer.from(e):e};R.toString=function(e){if(R.isBuffer(e))return ni(String(e));if(typeof e!="string")throw new TypeError("expected input to be a string or buffer");return ni(e)};R.arrayify=function(e){return e?Array.isArray(e)?e:[e]:[]};R.startsWith=function(e,r,t){return typeof t!="number"&&(t=r.length),e.slice(0,t)===r}});var Se=h((gu,oi)=>{"use strict";var Dc=jr(),Ic=er();oi.exports=function(e){let r=Object.assign({},e);return r.delimiters=Ic.arrayify(r.delims||r.delimiters||"---"),r.delimiters.length===1&&r.delimiters.push(r.delimiters[0]),r.language=(r.language||r.lang||"yaml").toLowerCase(),r.engines=Object.assign({},Dc,r.parsers,r.engines),r}});var Pr=h((mu,ai)=>{"use strict";ai.exports=function(e,r){let t=r.engines[e]||r.engines[Oc(e)];if(typeof t>"u")throw new Error('gray-matter engine "'+e+'" is not registered');return typeof t=="function"&&(t={parse:t}),t};function Oc(e){switch(e.toLowerCase()){case"js":case"javascript":return"javascript";case"coffee":case"coffeescript":case"cson":return"coffee";case"yaml":case"yml":return"yaml";default:return e}}});var _r=h((vu,si)=>{"use strict";var Mc=me(),Lc=Pr(),Bc=Se();si.exports=function(e,r,t){if(r==null&&t==null)switch(Mc(e)){case"object":r=e.data,t={};break;case"string":return e;default:throw new TypeError("expected file to be a string or object")}let i=e.content,n=Bc(t);if(r==null){if(!n.data)return e;r=n.data}let a=e.language||n.language,o=Lc(a,n);if(typeof o.stringify!="function")throw new TypeError('expected "'+a+'.stringify" to be a function');r=Object.assign({},e.data,r);let s=n.delimiters[0],c=n.delimiters[1],l=o.stringify(r,t).trim(),u="";return l!=="{}"&&(u=ue(s)+ue(l)+ue(c)),typeof e.excerpt=="string"&&e.excerpt!==""&&i.indexOf(e.excerpt.trim())===-1&&(u+=ue(e.excerpt)+ue(c)),u+ue(i)};function ue(e){return e.slice(-1)!==`
`?e+`
`:e}});var li=h((yu,ci)=>{"use strict";var qc=Se();ci.exports=function(e,r){let t=qc(r);if(e.data==null&&(e.data={}),typeof t.excerpt=="function")return t.excerpt(e,t);let i=e.data.excerpt_separator||t.excerpt_separator;if(i==null&&(t.excerpt===!1||t.excerpt==null))return e;let n=typeof t.excerpt=="string"?t.excerpt:i||t.delimiters[0],a=e.content.indexOf(n);return a!==-1&&(e.excerpt=e.content.slice(0,a)),e}});var fi=h((wu,di)=>{"use strict";var ui=me(),Nc=_r(),de=er();di.exports=function(e){return ui(e)!=="object"&&(e={content:e}),ui(e.data)!=="object"&&(e.data={}),e.contents&&e.content==null&&(e.content=e.contents),de.define(e,"orig",de.toBuffer(e.content)),de.define(e,"language",e.language||""),de.define(e,"matter",e.matter||""),de.define(e,"stringify",function(r,t){return t&&t.language&&(e.language=t.language),Nc(e,r,t)}),e.content=de.toString(e.content),e.isEmpty=!1,e.excerpt="",e}});var hi=h((xu,pi)=>{"use strict";var $c=Pr(),Rc=Se();pi.exports=function(e,r,t){let i=Rc(t),n=$c(e,i);if(typeof n.parse!="function")throw new TypeError('expected "'+e+'.parse" to be a function');return n.parse(r,i)}});var yi=h((bu,vi)=>{"use strict";var Uc=require("fs"),Hc=lt(),Tr=Se(),Yc=_r(),gi=li(),Vc=jr(),Wc=fi(),Gc=hi(),mi=er();function _(e,r){if(e==="")return{data:{},content:e,excerpt:"",orig:e};let t=Wc(e),i=_.cache[t.content];if(!r){if(i)return t=Object.assign({},i),t.orig=i.orig,t;_.cache[t.content]=t}return Kc(t,r)}function Kc(e,r){let t=Tr(r),i=t.delimiters[0],n=`
`+t.delimiters[1],a=e.content;t.language&&(e.language=t.language);let o=i.length;if(!mi.startsWith(a,i,o))return gi(e,t),e;if(a.charAt(o)===i.slice(-1))return e;a=a.slice(o);let s=a.length,c=_.language(a,t);c.name&&(e.language=c.name,a=a.slice(c.raw.length));let l=a.indexOf(n);return l===-1&&(l=s),e.matter=a.slice(0,l),e.matter.replace(/^\s*#[^\n]+/gm,"").trim()===""?(e.isEmpty=!0,e.empty=e.content,e.data={}):e.data=Gc(e.language,e.matter,t),l===s?e.content="":(e.content=a.slice(l+n.length),e.content[0]==="\r"&&(e.content=e.content.slice(1)),e.content[0]===`
`&&(e.content=e.content.slice(1))),gi(e,t),(t.sections===!0||typeof t.section=="function")&&Hc(e,t.section),e}_.engines=Vc;_.stringify=function(e,r,t){return typeof e=="string"&&(e=_(e,t)),Yc(e,r,t)};_.read=function(e,r){let t=Uc.readFileSync(e,"utf8"),i=_(t,r);return i.path=e,i};_.test=function(e,r){return mi.startsWith(e,Tr(r).delimiters[0])};_.language=function(e,r){let i=Tr(r).delimiters[0];_.test(e)&&(e=e.slice(i.length));let n=e.slice(0,e.search(/\r?\n/));return{raw:n,name:n?n.trim():""}};_.cache={};_.clearCache=function(){_.cache={}};vi.exports=_});var il={};ki(il,{activate:()=>tl,deactivate:()=>nl});module.exports=Di(il);var E=I(require("vscode"));var A=I(require("vscode")),Dr=I(require("path"));var W=class extends A.TreeItem{constructor(t,i,n,a,o,s,c){super(t,n);this.label=t;this.type=i;this.collapsibleState=n;this.id=a;this.projectId=o;this.project=s;this.view=c;switch(this.contextValue=i===0?"project":i===1?"view":"archive",this.tooltip=i===0?`Project: ${t} (ID: ${a})`:i===1?`View: ${t} (Type: ${c?.type})`:"Archives",i){case 0:this.iconPath=new A.ThemeIcon("project");break;case 1:c?.type==="table"?this.iconPath=new A.ThemeIcon("list-tree"):c?.type==="board"?this.iconPath=new A.ThemeIcon("layout"):c?.type==="calendar"?this.iconPath=new A.ThemeIcon("calendar"):c?.type==="gallery"?this.iconPath=new A.ThemeIcon("multiple-windows"):this.iconPath=new A.ThemeIcon("preview");break;case 2:this.iconPath=new A.ThemeIcon("archive");break}i===0&&s?.dataSource&&(s.dataSource.kind==="folder"?this.description=`Folder: ${Dr.basename(s.dataSource.config.path)}`:s.dataSource.kind==="tag"?this.description=`Tag: ${s.dataSource.config.tag}`:s.dataSource.kind==="query"&&(this.description="Query")),i===1&&o&&a?this.command={command:"vscode-projects.openView",title:"Open View",arguments:[o,a]}:i===0&&a&&(this.command={command:"vscode-projects.openProject",title:"Open Project",arguments:[a]})}},Ee=class{constructor(r){this.projectManager=r;this._onDidChangeTreeData=new A.EventEmitter;this.onDidChangeTreeData=this._onDidChangeTreeData.event;this.showArchives=!1;console.log("ProjectsProvider constructor called")}refresh(){this._onDidChangeTreeData.fire()}toggleArchives(){this.showArchives=!this.showArchives,this.refresh()}getTreeItem(r){return console.log(`getTreeItem called for: ${r.label}`),r}getChildren(r){console.log(`getChildren called with element: ${r?r.label:"root"}`);try{if(r){if(r.type===0&&r.projectId){let t=this.projectManager.getProject(r.projectId);return t?Promise.resolve(t.views.map(i=>new W(i.name,1,A.TreeItemCollapsibleState.None,i.id,t.id,t,i))):Promise.resolve([])}else if(r.type===2){let t=this.projectManager.getArchives();return Promise.resolve(t.map(i=>new W(i.name,0,A.TreeItemCollapsibleState.Collapsed,i.id,i.id,i)))}}else{let t=[],i=this.projectManager.getProjects();if(console.log(`Found ${i.length} projects`),i.length===0?t.push(new W("No projects found. Click the + button to create one.",0,A.TreeItemCollapsibleState.None)):i.forEach(n=>{t.push(new W(n.name,0,A.TreeItemCollapsibleState.Collapsed,n.id,n.id,n))}),this.showArchives){let n=this.projectManager.getArchives();console.log(`Found ${n.length} archived projects`),n.length>0&&t.push(new W("Archives",2,A.TreeItemCollapsibleState.Collapsed))}return Promise.resolve(t)}return Promise.resolve([])}catch(t){return console.error("Error getting children:",t),Promise.resolve([])}}};var B=I(require("vscode")),Re=I(Jr());var zr={id:"",name:"Table",type:"table",filter:{conjunction:"and",conditions:[]},colors:{conditions:[]},sort:{criteria:[]}},Xr={id:"",name:"",views:[],dataSource:{kind:"folder",config:{path:"",recursive:!1}},excludedFiles:[]},Zr={projects:[],archives:[],preferences:{}};var ge=class extends Error{constructor(t,i){super(`Error processing record ${t}: ${i.message}`);this.id=t;this.error=i;this.name="RecordError"}};var He=I(require("path")),Ue=class{constructor(r,t){this.context=r;this.fileSystem=t;this.settings=this.loadSettings()}getProjects(){return this.settings.projects}getArchives(){return this.settings.archives}getProject(r){return this.settings.projects.find(t=>t.id===r)}async createProject(r,t){let i=(0,Re.v4)(),n={...Xr,id:i,name:r,views:[{...zr,id:(0,Re.v4)(),name:"Table",type:"table"}]};t&&(n={...n,dataSource:{kind:"folder",config:{path:t.fsPath,recursive:!1}}});let a=[...this.settings.projects,n];return this.settings={...this.settings,projects:a},await this.saveSettings(),n}async addViewToProject(r,t,i,n={}){let a=this.getProject(r);if(!a)throw new Error(`Project with ID ${r} not found`);let o={id:(0,Re.v4)(),name:t,type:i,config:n,filter:{conjunction:"and",conditions:[]},colors:{conditions:[]},sort:{criteria:[]}},s={...a,views:[...a.views,o]};await this.updateProject(s)}async updateProject(r){let t=this.settings.projects.map(i=>i.id===r.id?r:i);this.settings={...this.settings,projects:t},await this.saveSettings()}async deleteProject(r){let t=this.settings.projects.filter(i=>i.id!==r);this.settings={...this.settings,projects:t},await this.saveSettings()}async archiveProject(r){let t=this.settings.projects.find(i=>i.id===r);if(t){let i=this.settings.projects.filter(a=>a.id!==r),n=[...this.settings.archives,t];this.settings={...this.settings,projects:i,archives:n},await this.saveSettings()}}async createNote(r,t,i){let n="";if(r.newFilesFolder)n=r.newFilesFolder;else if(r.dataSource.kind==="folder")n=r.dataSource.config.path;else{let s=B.workspace.workspaceFolders;if(s&&s.length>0)n=s[0]?.uri.fsPath||"";else{let c=await B.window.showOpenDialog({canSelectFiles:!1,canSelectFolders:!0,canSelectMany:!1,title:"Select a folder to save the new note"});if(c&&c.length>0)n=c[0]?.fsPath||"";else throw new Error("No folder selected")}}let a=He.join(n,`${t}.md`),o="";if(i)try{o=await this.fileSystem.readFile(i)}catch(s){console.error("Error reading template file:",s)}return await this.fileSystem.writeFile(a,o),a}async queryProject(r){let t=[],i=[];try{if(r.dataSource.kind==="folder"){let a=await this.fileSystem.getFilesInFolder(r.dataSource.config.path,r.dataSource.config.recursive);for(let o of a)try{if(o.endsWith(".md")){let s=o,c=await this.fileSystem.readFile(o),l=this.fileSystem.parseFrontMatter(c),u={id:s,values:{...l,path:o,name:He.basename(o,".md")}};r.excludedFiles.includes(o)||t.push(u)}}catch(s){i.push(new ge(o,s instanceof Error?s:new Error(`${s}`)))}}else r.dataSource.kind==="tag"||r.dataSource.kind}catch(a){i.push(new ge("project",a instanceof Error?a:new Error(`Error querying project: ${a}`)))}let n=this.detectFields(t);return{records:t,fields:n,errors:i}}loadSettings(){let r=B.workspace.getConfiguration("vscode-projects"),t=r.get("projects",[]),i=r.get("archives",[]),n=r.get("preferences",Zr.preferences);return{projects:t,archives:i,preferences:n}}async saveSettings(){let r=B.workspace.getConfiguration("vscode-projects");await r.update("projects",this.settings.projects,B.ConfigurationTarget.Global),await r.update("archives",this.settings.archives,B.ConfigurationTarget.Global),await r.update("preferences",this.settings.preferences,B.ConfigurationTarget.Global)}detectFields(r){let t=new Map;for(let i of r)for(let[n,a]of Object.entries(i.values))if(!t.has(n)){let o=this.determineType(a),s=Array.isArray(a);t.set(n,{type:o,repeated:s})}return Array.from(t.entries()).map(([i,{type:n,repeated:a}])=>({name:i,type:n,repeated:a,identifier:i==="id",derived:i==="path"||i==="name"}))}determineType(r){return r==null?"unknown":Array.isArray(r)?r.length>0?this.determineType(r[0]):"string":r instanceof Date?"date":typeof r}};var O=I(require("vscode")),k=I(require("fs")),nr=I(require("path")),V=require("util"),rr=I(yi()),Qc=(0,V.promisify)(k.readFile),Jc=(0,V.promisify)(k.writeFile),zc=(0,V.promisify)(k.unlink),Xc=(0,V.promisify)(k.exists),Zc=(0,V.promisify)(k.readdir),el=(0,V.promisify)(k.stat),tr=class{async readFile(r){try{try{let t=O.Uri.file(r),i=await O.workspace.fs.readFile(t);return Buffer.from(i).toString("utf8")}catch{return await Qc(r,"utf8")}}catch(t){throw new Error(`Failed to read file ${r}: ${t}`)}}async writeFile(r,t){try{await this.ensureDirectory(nr.dirname(r));try{let i=O.Uri.file(r),n=Buffer.from(t,"utf8");await O.workspace.fs.writeFile(i,n)}catch{await Jc(r,t,"utf8")}}catch(i){throw new Error(`Failed to write to file ${r}: ${i}`)}}async deleteFile(r){try{try{let t=O.Uri.file(r);await O.workspace.fs.delete(t)}catch{await zc(r)}}catch(t){throw new Error(`Failed to delete file ${r}: ${t}`)}}async fileExists(r){try{try{let t=O.Uri.file(r);return await O.workspace.fs.stat(t),!0}catch{return Xc(r)}}catch{return!1}}async getFilesInFolder(r,t){let i=[];try{let n=await Zc(r);for(let a of n){let o=nr.join(r,a),s=await el(o);if(s.isFile())i.push(o);else if(s.isDirectory()&&t){let c=await this.getFilesInFolder(o,t);i.push(...c)}}}catch(n){console.error(`Error reading directory ${r}:`,n)}return i}parseFrontMatter(r){try{let{data:t}=(0,rr.default)(r);return t}catch(t){return console.error("Error parsing frontmatter:",t),{}}}addFrontMatter(r,t){try{let{content:i,data:n}=(0,rr.default)(r),a={...n,...t};return rr.default.stringify(i,a)}catch(i){return console.error("Error adding frontmatter:",i),r}}async ensureDirectory(r){try{await O.workspace.fs.createDirectory(O.Uri.file(r))}catch{try{await(0,V.promisify)(k.mkdir)(r,{recursive:!0})}catch(i){if(i.code!=="EEXIST")throw i}}}};var w=I(require("vscode"));async function wi(e,r){let t=await w.window.showInputBox({prompt:"Enter a name for the new project",placeHolder:"My Project"});if(!t)return;let i=[{label:"Folder-based project",description:"Create a project based on a specific folder"},{label:"Tag-based project",description:"Create a project based on file tags"},{label:"Query-based project",description:"Create a project based on a search query"}],n=await w.window.showQuickPick(i,{placeHolder:"Select the type of project"});if(n)try{let a;if(n.label==="Folder-based project"){let o=await w.window.showOpenDialog({canSelectFiles:!1,canSelectFolders:!0,canSelectMany:!1,title:"Select a folder for the project"});if(o&&o.length>0)a=o[0];else return}await e.createProject(t,a),r.refresh(),w.window.showInformationMessage(`Project "${t}" created successfully.`)}catch(a){w.window.showErrorMessage(`Failed to create project: ${a}`)}}async function xi(e){let r=e.getProjects();if(r.length===0){w.window.showErrorMessage("No projects exist. Create a project first.");return}let t=r.map(a=>({label:a.name,description:ir(a),project:a})),i=await w.window.showQuickPick(t,{placeHolder:"Select a project to create a note in"});if(!i)return;let n=await w.window.showInputBox({prompt:"Enter a name for the new note",placeHolder:"My Note"});if(n)try{let a;if(i.project.templates&&i.project.templates.length>0){let c=i.project.templates.map(u=>({label:u.replace(/^.*[\\\/]/,""),description:u,template:u}));c.unshift({label:"No template",description:"Create a blank note",template:""});let l=await w.window.showQuickPick(c,{placeHolder:"Select a template (optional)"});l&&l.template&&(a=l.template)}let o=await e.createNote(i.project,n,a),s=w.Uri.file(o);await w.window.showTextDocument(s),w.window.showInformationMessage(`Note "${n}" created successfully.`)}catch(a){w.window.showErrorMessage(`Failed to create note: ${a}`)}}async function bi(e){let r=e.getProjects();if(r.length===0){w.window.showErrorMessage("No projects exist. Create a project first.");return}let t=r.map(s=>({label:s.name,description:ir(s),project:s})),i=await w.window.showQuickPick(t,{placeHolder:"Select a project to add a view to"});if(!i)return;let n=await w.window.showInputBox({prompt:"Enter a name for the new view",placeHolder:"New View"});if(!n)return;let a=[{label:"Table",description:"Display items in a table layout"},{label:"Board",description:"Display items in a kanban board layout"},{label:"Calendar",description:"Display items in a calendar"},{label:"Gallery",description:"Display items in a gallery grid"}],o=await w.window.showQuickPick(a,{placeHolder:"Select the type of view"});if(o)try{let s=o.label.toLowerCase(),c;if(s==="board"){let l=await e.queryProject(i.project);if(l.fields.length>0){let u=l.fields.map(f=>({label:f.name,description:`Type: ${f.type}`})),d=await w.window.showQuickPick(u,{placeHolder:"Select a field to group by in the board view"});d&&(c=d.label)}}await e.addViewToProject(i.project.id,n,s,c?{groupByField:c}:{}),w.window.showInformationMessage(`View "${n}" created successfully.`)}catch(s){w.window.showErrorMessage(`Failed to create view: ${s}`)}}async function Fi(e,r){let t=e.getProjects();if(t.length===0){w.window.showErrorMessage("No projects exist to delete.");return}let i=t.map(o=>({label:o.name,description:ir(o),id:o.id})),n=await w.window.showQuickPick(i,{placeHolder:"Select a project to delete"});if(!(!n||await w.window.showWarningMessage(`Are you sure you want to delete the project "${n.label}"? This action cannot be undone.`,{modal:!0},"Delete")!=="Delete"))try{await e.deleteProject(n.id),r.refresh(),w.window.showInformationMessage(`Project "${n.label}" deleted successfully.`)}catch(o){w.window.showErrorMessage(`Failed to delete project: ${o}`)}}async function Si(e,r){let t=e.getProjects();if(t.length===0){w.window.showErrorMessage("No projects exist.");return}let i=t.map(l=>({label:l.name,description:ir(l),project:l})),n=await w.window.showQuickPick(i,{placeHolder:"Select a project"});if(!n)return;let a=n.project.views;if(a.length===0){w.window.showErrorMessage(`Project "${n.label}" has no views.`);return}if(a.length===1){w.window.showErrorMessage("Cannot delete the only view in a project. A project must have at least one view.");return}let o=a.map(l=>({label:l.name,description:`Type: ${l.type}`,id:l.id})),s=await w.window.showQuickPick(o,{placeHolder:"Select a view to delete"});if(!(!s||await w.window.showWarningMessage(`Are you sure you want to delete the view "${s.label}" from project "${n.label}"? This action cannot be undone.`,{modal:!0},"Delete")!=="Delete"))try{let l={...n.project,views:n.project.views.filter(u=>u.id!==s.id)};await e.updateProject(l),r.refresh(),w.window.showInformationMessage(`View "${s.label}" deleted successfully.`)}catch(l){w.window.showErrorMessage(`Failed to delete view: ${l}`)}}function ir(e){let r=e.dataSource;return r.kind==="folder"?`Folder: ${r.config.path}`:r.kind==="tag"?`Tag: ${r.config.tag}`:r.kind==="query"?`Query: ${r.config.query}`:""}var S=I(require("vscode")),fe=I(require("path"));var or=class{applyFilters(r,t){if(!t||!t.conditions||t.conditions.length===0)return r;let i=r.records.filter(n=>this.evaluateRecord(n,t.conjunction,t.conditions));return{...r,records:i}}evaluateRecord(r,t,i){if(i.length===0)return!0;let n=this.evaluateCondition(r,i[0]);for(let a=1;a<i.length;a++){let o=this.evaluateCondition(r,i[a]);t==="and"?n=n&&o:n=n||o}return n}evaluateCondition(r,t){let{field:i,operator:n,value:a}=t,o=r.values[i];return o==null?n==="isEmpty"?!0:n==="isNotEmpty"?!1:this.evaluateStringCondition("",n,a):Array.isArray(o)?this.evaluateArrayCondition(o,n,a):typeof o=="boolean"?this.evaluateBooleanCondition(o,n,a):o instanceof Date?this.evaluateDateCondition(o,n,a):typeof o=="number"?this.evaluateNumberCondition(o,n,a):this.evaluateStringCondition(String(o),n,a)}evaluateStringCondition(r,t,i){switch(t){case"isNotEmpty":return r!=="";case"isEmpty":return r==="";case"is":return r.toLowerCase()===String(i).toLowerCase();case"isNot":return r.toLowerCase()!==String(i).toLowerCase();case"contains":return r.toLowerCase().includes(String(i).toLowerCase());case"doesNotContain":return!r.toLowerCase().includes(String(i).toLowerCase());case"startsWith":return r.toLowerCase().startsWith(String(i).toLowerCase());case"endsWith":return r.toLowerCase().endsWith(String(i).toLowerCase());default:return!0}}evaluateNumberCondition(r,t,i){let n=parseFloat(i);if(isNaN(n)&&t!=="isNotEmpty"&&t!=="isEmpty")return!1;switch(t){case"isNotEmpty":return!0;case"isEmpty":return!1;case"is":return r===n;case"isNot":return r!==n;case"greaterThan":return r>n;case"lessThan":return r<n;case"greaterThanOrEqual":return r>=n;case"lessThanOrEqual":return r<=n;default:return this.evaluateStringCondition(String(r),t,i)}}evaluateDateCondition(r,t,i){let n=new Date(i);if(isNaN(n.getTime())&&t!=="isNotEmpty"&&t!=="isEmpty")return!1;switch(t){case"isNotEmpty":return!0;case"isEmpty":return!1;case"is":return r.getTime()===n.getTime();case"isNot":return r.getTime()!==n.getTime();case"after":case"greaterThan":return r.getTime()>n.getTime();case"before":case"lessThan":return r.getTime()<n.getTime();case"onOrAfter":case"greaterThanOrEqual":return r.getTime()>=n.getTime();case"onOrBefore":case"lessThanOrEqual":return r.getTime()<=n.getTime();default:return this.evaluateStringCondition(r.toISOString(),t,i)}}evaluateBooleanCondition(r,t,i){let n=typeof i=="string"?i.toLowerCase()==="true":!!i;switch(t){case"isNotEmpty":return!0;case"isEmpty":return!1;case"is":return r===n;case"isNot":return r!==n;default:return this.evaluateStringCondition(String(r),t,i)}}evaluateArrayCondition(r,t,i){switch(t){case"isNotEmpty":return r.length>0;case"isEmpty":return r.length===0;case"contains":return r.some(n=>String(n).toLowerCase().includes(String(i).toLowerCase()));case"doesNotContain":return!r.some(n=>String(n).toLowerCase().includes(String(i).toLowerCase()));case"is":return r.some(n=>String(n).toLowerCase()===String(i).toLowerCase());case"isNot":return!r.some(n=>String(n).toLowerCase()===String(i).toLowerCase());default:return r.some(n=>typeof n=="string"?this.evaluateStringCondition(n,t,i):typeof n=="number"?this.evaluateNumberCondition(n,t,i):n instanceof Date?this.evaluateDateCondition(n,t,i):typeof n=="boolean"?this.evaluateBooleanCondition(n,t,i):this.evaluateStringCondition(String(n),t,i))}}};var Ce=class{constructor(r,t){this.context=r;this.projectManager=t;this.webviewPanels=new Map}async openView(r,t){try{let i=this.projectManager.getProject(r);if(!i)throw new Error(`Project with ID ${r} not found`);let n=i.views.find(a=>a.id===t);if(!n)throw new Error(`View with ID ${t} not found in project ${i.name}`);await this.showView(i,n)}catch(i){S.window.showErrorMessage(`Failed to open view: ${i}`)}}async openProject(r){try{let t=this.projectManager.getProject(r);if(!t)throw new Error(`Project with ID ${r} not found`);if(t.views.length>0)await this.showView(t,t.views[0]);else throw new Error(`Project ${t.name} has no views`)}catch(t){S.window.showErrorMessage(`Failed to open project: ${t}`)}}async showView(r,t){let i=`${r.id}:${t.id}`,n=this.webviewPanels.get(i);if(n){n.reveal();return}let a=S.window.createWebviewPanel("projectsView",`${r.name} - ${t.name}`,S.ViewColumn.One,{enableScripts:!0,retainContextWhenHidden:!0,localResourceRoots:[S.Uri.file(fe.join(this.context.extensionPath,"media"))]});this.webviewPanels.set(i,a),a.onDidDispose(()=>{this.webviewPanels.delete(i)});let o=new or,s=await this.projectManager.queryProject(r),c=s;t.filter&&t.filter.conditions&&t.filter.conditions.length>0&&(c=o.applyFilters(s,t.filter));let l=await this.getFilterBuilderScript(),u=await this.getFilterHandlerScript();a.webview.html=this.getWebviewContent(a.webview,r,t,c,l,u);let d=(f,p)=>{console.log(`[ViewProvider] ${f}`,p)};a.webview.onDidReceiveMessage(async f=>{switch(d(`Received message: ${f.command}`,f),f.command){case"openFile":if(f.path){let p=await S.workspace.openTextDocument(f.path);await S.window.showTextDocument(p)}break;case"editItem":if(f.recordId&&f.recordData)try{let p=c.records.findIndex(y=>y.id===f.recordId);if(p===-1)throw new Error(`Record with ID ${f.recordId} not found`);let m={...c.records[p],values:f.recordData};c.records[p]=m,a.webview.html=this.getWebviewContent(a.webview,r,t,c,l,u),a.webview.postMessage({command:"itemUpdated",recordId:f.recordId,success:!0})}catch(p){console.error("Failed to update item:",p),a.webview.postMessage({command:"itemUpdated",recordId:f.recordId,success:!1,error:String(p)})}break;case"saveFilter":try{f.filterConditions&&(t.filter={conjunction:f.conjunction||"and",conditions:f.filterConditions},await this.projectManager.updateProject({...r,views:r.views.map(p=>p.id===t.id?t:p)}),a.webview.postMessage({command:"filterSaved",success:!0}),d("Filter configuration saved",t.filter))}catch(p){console.error("Failed to save filter:",p),a.webview.postMessage({command:"filterSaved",success:!1,error:String(p)})}break;case"refreshData":try{d("Refreshing data with filters",{conditions:f.filterConditions,conjunction:f.conjunction});let p=await this.projectManager.queryProject(r),m=p;f.filterConditions?(t.filter={conjunction:f.conjunction||"and",conditions:f.filterConditions},await this.projectManager.updateProject({...r,views:r.views.map(y=>y.id===t.id?t:y)}),m=o.applyFilters(p,t.filter),d("Applied filters",{recordsBefore:p.records.length,recordsAfter:m.records.length})):t.filter&&t.filter.conditions&&t.filter.conditions.length>0&&(m=o.applyFilters(p,t.filter)),c=m,a.webview.html=this.getWebviewContent(a.webview,r,t,c,l,u),a.webview.postMessage({command:"dataRefreshed",recordCount:c.records.length})}catch(p){console.error("Failed to refresh data:",p),S.window.showErrorMessage(`Failed to refresh data: ${p}`)}break;case"updateCalendarConfig":try{if(t.type==="calendar"&&f.config){let p={...t};p.config={...p.config,...f.config};let m={...r,views:r.views.map(D=>D.id===t.id?p:D)};await this.projectManager.updateProject(m),t=p;let y=await this.projectManager.queryProject(r),v=y;t.filter&&t.filter.conditions&&t.filter.conditions.length>0&&(v=o.applyFilters(y,t.filter)),c=v,a.webview.html=this.getWebviewContent(a.webview,r,t,c,l,u),a.webview.postMessage({command:"configUpdated",config:p.config})}}catch(p){console.error("Failed to update calendar config:",p),S.window.showErrorMessage(`Failed to update calendar configuration: ${p}`)}break}})}findSuitableDateField(r){let t=r.find(i=>i.name.toLowerCase().includes("date")||i.name.toLowerCase().includes("time")||i.name.toLowerCase().includes("deadline")||i.name.toLowerCase().includes("due"));return t?t.name:"date"}findDateFields(r){return r.filter(t=>t.name.toLowerCase().includes("date")||t.name.toLowerCase().includes("time")||t.name.toLowerCase().includes("deadline")||t.name.toLowerCase().includes("due")||t.name.toLowerCase().includes("created")||t.name.toLowerCase().includes("modified"))}async getFilterBuilderScript(){try{let r=S.Uri.file(fe.join(this.context.extensionPath,"media","js","common-filter-builder.js")),t=await S.workspace.fs.readFile(r);return Buffer.from(t).toString()}catch(r){return console.error("Failed to load filter builder script:",r),""}}async getFilterHandlerScript(){try{let r=S.Uri.file(fe.join(this.context.extensionPath,"media","js","filter-handler.js")),t=await S.workspace.fs.readFile(r);return Buffer.from(t).toString()}catch(r){return console.error("Failed to load filter handler script:",r),""}}renderTableView(r){if(r.records.length===0)return`<div class="container">
        <div class="card">
          <h2>No data</h2>
          <p>This project has no data records.</p>
        </div>
      </div>`;let t=r.fields;return`
    <div class="container">
      <div class="filter-bar">
        <div class="filter-controls">
          <input type="text" id="searchInput" placeholder="Search..." class="search-box">
          <button id="clearFilterBtn" class="filter-button">Clear Filters</button>
          <button id="showFiltersBtn" class="filter-button">Show Filters</button>
        </div>
        <div id="filterPanel" class="filter-panel" style="display: none;">
          <h3>Filters</h3>
          
          <div id="filterBuilder" class="filter-builder">
            <!-- Dynamic filter conditions will be added here -->
          </div>
          
          <button id="addFilterBtn" class="filter-add">+ Add Condition</button>
          
          <div class="filter-actions">
            <div>
              <button id="saveFilterBtn" class="filter-button">Save Filter</button>
            </div>
            <div>
              <button id="applyFiltersBtn" class="filter-button">Apply Filters</button>
            </div>
          </div>
          
          <div id="savedFilters" class="filter-saved" style="display: none;">
            <h3>Saved Filters</h3>
            <div id="savedFiltersList">
              <!-- Saved filters will be displayed here -->
            </div>
          </div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            ${t.map(n=>`
              <th>
                <div class="th-content">
                  <span>${n.name}</span>
                  <div class="sort-controls">
                    <span class="sort-control sort-asc" data-field="${n.name}" title="Sort ascending">\u2191</span>
                    <span class="sort-control sort-desc" data-field="${n.name}" title="Sort descending">\u2193</span>
                  </div>
                </div>
              </th>
            `).join("")}
          </tr>
        </thead>
        <tbody>
        ${r.records.map(n=>`
          <tr>
            ${t.map(a=>{let o=n.values[a.name];if(a.name==="path"&&typeof o=="string")return`<td>
                  <span class="file-link" data-path="${o}">${fe.basename(o)}</span>
                </td>`;{let s="";return o==null?s="":o instanceof Date?s=o.toLocaleDateString():Array.isArray(o)?s=o.filter(c=>c!=null).join(", "):s=String(o),`<td>${s}</td>`}}).join("")}
          </tr>
        `).join("")}
        </tbody>
      </table>
    </div>`}renderBoardView(r,t){if(r.records.length===0)return`<div class="container">
        <div class="card">
          <h2>No data</h2>
          <p>This project has no data records.</p>
        </div>
      </div>`;let i=t.config?.groupByField||"status",n=new Map;n.set("No Status",[]),r.records.forEach(o=>{let s=o.values[i],c="No Status";s!=null&&(c=String(s)),n.has(c)||n.set(c,[]);let l=n.get(c);l&&l.push(o)});let a=`
    <div class="container">
      <div class="filter-bar">
        <div class="filter-controls">
          <button id="clearFilterBtn" class="filter-button">Clear Filters</button>
          <button id="showFiltersBtn" class="filter-button">Show Filters</button>
        </div>
        <div id="filterPanel" class="filter-panel" style="display: none;">
          <h3>Filters</h3>
          
          <div id="filterBuilder" class="filter-builder">
            <!-- Dynamic filter conditions will be added here -->
          </div>
          
          <button id="addFilterBtn" class="filter-add">+ Add Condition</button>
          
          <div class="filter-actions">
            <div>
              <button id="saveFilterBtn" class="filter-button">Save Filter</button>
            </div>
            <div>
              <button id="applyFiltersBtn" class="filter-button">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="board-container">`;return n.forEach((o,s)=>{a+=`
        <div class="board-column">
          <div class="column-header">${String(s)} (${o.length})</div>`,o.forEach(c=>{let l="";c.values.name!==void 0?l=String(c.values.name):c.values.title!==void 0?l=String(c.values.title):l=c.id;let u=c.values.description!==void 0?String(c.values.description):"",d=c.values.path!==void 0?String(c.values.path):"";a+=`
          <div class="board-card">
            <div class="file-link" data-path="${d}">${l}</div>
            <div>${u}</div>
          </div>`}),a+="</div>"}),a+="</div></div>",a}renderCalendarView(r,t){if(r.records.length===0)return`<div class="container">
        <div class="card">
          <h2>No data</h2>
          <p>This project has no data records.</p>
        </div>
      </div>`;let i=new Date,n=t.config?.dateField||this.findSuitableDateField(r.fields),a=t.config?.year||i.getFullYear(),o=t.config?.month!==void 0?t.config.month:i.getMonth(),s=new Date(a,o,1),c=new Date(a,o+1,0),l=s.getDay(),u=`
    <div class="container">
      <div class="calendar-container">
        <div class="calendar-toolbar">
          <button id="prevMonth">\u2190</button>
          <h2 id="currentMonthDisplay">${s.toLocaleDateString("en-US",{month:"long",year:"numeric"})}</h2>
          <button id="nextMonth">\u2192</button>
          <button id="todayBtn">Today</button>
        </div>
        
        <div class="calendar-filter">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div>
              <label>Date field: 
                <select id="dateFieldSelect">
                  ${this.findDateFields(r.fields).map(m=>`<option value="${m.name}" ${m.name===n?"selected":""}>${m.name}</option>`).join("")}
                </select>
              </label>
            </div>
            <div>
              <button id="calendarShowFiltersBtn" class="filter-button">Show Filters</button>
            </div>
          </div>
          
          <div id="calendarFilterPanel" class="filter-panel" style="display: none;">
            <h3>Filters</h3>
            
            <div id="calendarFilterBuilder" class="filter-builder">
              <!-- Dynamic filter conditions will be added here -->
            </div>
            
            <button id="calendarAddFilterBtn" class="filter-add">+ Add Condition</button>
            
            <div class="filter-actions">
              <div>
                <button id="calendarSaveFilterBtn" class="filter-button">Save Filter</button>
              </div>
              <div>
                <button id="calendarApplyFiltersBtn" class="filter-button">Apply Filters</button>
                <button id="calendarClearFilterBtn" class="filter-button">Clear</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="calendar-grid">
          <div class="calendar-header">
            <div class="calendar-cell">Sun</div>
            <div class="calendar-cell">Mon</div>
            <div class="calendar-cell">Tue</div>
            <div class="calendar-cell">Wed</div>
            <div class="calendar-cell">Thu</div>
            <div class="calendar-cell">Fri</div>
            <div class="calendar-cell">Sat</div>
          </div>
          
          <div class="calendar-body">`,d=new Map;r.records.forEach(m=>{let y=m.values[n];if(y==null)return;let v;if(y instanceof Date)v=y;else if(typeof y=="string"){if(v=new Date(y),isNaN(v.getTime()))return}else if(typeof y=="number")v=new Date(y);else return;let D=v.toISOString().split("T")[0];d.has(D)||d.set(D,[]);let U=d.get(D);U&&U.push(m)});let f=1,p=c.getDate();for(let m=0;m<6;m++){u+='<div class="calendar-row">';for(let y=0;y<7;y++)if(m===0&&y<l||f>p)u+='<div class="calendar-cell empty"></div>';else{let D=new Date(a,o,f).toISOString().split("T")[0],U=d.get(D)||[],Ci=f===i.getDate()&&o===i.getMonth()&&a===i.getFullYear();if(u+=`
            <div class="calendar-cell ${Ci?"today":""}" data-date="${D}">
              <div class="calendar-date">${f}</div>
              <div class="calendar-events">`,U.length>0){U.sort((M,te)=>{let sr=M.values.name||M.values.title||M.id,Ai=te.values.name||te.values.title||te.id;return String(sr).localeCompare(String(Ai))});let ar=3;if(U.slice(0,ar).forEach(M=>{let te=M.values.name||M.values.title||M.id,sr=M.values.path||"";u+=`
                <div class="calendar-event" data-record-id="${M.id}" data-path="${sr}">
                  <span title="${te}">${te}</span>
                </div>`}),U.length>ar){let M=U.length-ar;u+=`<div class="more-events">+${M} more</div>`}}u+="</div></div>",f++}if(u+="</div>",f>p)break}return u+=`
          </div>
        </div>
        
        <div class="event-details" id="eventDetails" style="display: none;">
          <div class="event-details-header">
            <h3>Events for <span id="selectedDate"></span></h3>
            <button id="closeEventDetails">\u2715</button>
          </div>
          <div id="eventDetailsList"></div>
        </div>
      </div>
    </div>`,u}renderGalleryView(r){if(r.records.length===0)return`<div class="container">
        <div class="card">
          <h2>No data</h2>
          <p>This project has no data records.</p>
        </div>
      </div>`;let t=`
    <div class="container">
      <div class="filter-bar">
        <div class="filter-controls">
          <button id="clearFilterBtn" class="filter-button">Clear Filters</button>
          <button id="showFiltersBtn" class="filter-button">Show Filters</button>
        </div>
        <div id="filterPanel" class="filter-panel" style="display: none;">
          <h3>Filters</h3>
          
          <div id="filterBuilder" class="filter-builder">
            <!-- Dynamic filter conditions will be added here -->
          </div>
          
          <button id="addFilterBtn" class="filter-add">+ Add Condition</button>
          
          <div class="filter-actions">
            <div>
              <button id="saveFilterBtn" class="filter-button">Save Filter</button>
            </div>
            <div>
              <button id="applyFiltersBtn" class="filter-button">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="gallery-grid">`;return r.records.forEach(i=>{let n="";i.values.name!==void 0?n=String(i.values.name):i.values.title!==void 0?n=String(i.values.title):n=i.id;let a=i.values.description!==void 0?String(i.values.description):"",o=i.values.path!==void 0?String(i.values.path):"";t+=`
        <div class="gallery-card">
          <div class="card-header">
            <div class="file-link" data-path="${o}">${n}</div>
          </div>
          <div class="card-body">
            <p>${a}</p>
          </div>
        </div>`}),t+="</div></div>",t}getWebviewContent(r,t,i,n,a="",o=""){let s=S.window.activeColorTheme.kind===S.ColorThemeKind.Dark,c=`
      :root {
        --container-background: ${s?"#252526":"#f3f3f3"};
        --item-background: ${s?"#2d2d2d":"#ffffff"};
        --text-color: ${s?"#e7e7e7":"#333333"};
        --border-color: ${s?"#3c3c3c":"#dddddd"};
        --highlight-color: ${s?"#264f78":"#ddddff"};
        --header-background: ${s?"#333333":"#eeeeee"};
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        color: var(--text-color);
        background-color: var(--container-background);
        padding: 0;
        margin: 0;
      }
      
      .container {
        padding: 16px;
        max-width: 100%;
      }
      
      /* Filter Styles */
      .filter-bar {
        margin-bottom: 16px;
      }
      
      .filter-controls {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }
      
      .filter-button {
        background-color: var(--item-background);
        border: 1px solid var(--border-color);
        color: var(--text-color);
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 4px;
      }
      
      .filter-panel {
        background-color: var(--item-background);
        border: 1px solid var(--border-color);
        padding: 16px;
        margin-bottom: 16px;
        border-radius: 4px;
      }
      
      .filter-builder {
        margin-bottom: 16px;
      }
      
      .filter-condition {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      
      .filter-property, .filter-operator, .filter-value, .filter-join {
        padding: 4px;
        background-color: var(--container-background);
        border: 1px solid var(--border-color);
        color: var(--text-color);
        border-radius: 4px;
      }
      
      .filter-remove {
        background: none;
        border: none;
        color: var(--text-color);
        cursor: pointer;
        font-size: 16px;
      }
      
      .filter-add {
        background: none;
        border: none;
        color: var(--text-color);
        cursor: pointer;
        text-decoration: underline;
        padding: 0;
        margin-bottom: 16px;
      }
      
      .filter-actions {
        display: flex;
        justify-content: space-between;
      }
      
      /* Table View Styles */
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 16px;
      }
      
      th, td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
      }
      
      th {
        position: sticky;
        top: 0;
        background-color: var(--header-background);
        z-index: 10;
      }
      
      .th-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .sort-controls {
        display: flex;
        gap: 4px;
      }
      
      .sort-control {
        cursor: pointer;
        opacity: 0.5;
      }
      
      .sort-control:hover {
        opacity: 1;
      }
      
      /* Board View Styles */
      .board-container {
        display: flex;
        gap: 16px;
        overflow-x: auto;
        padding-bottom: 16px;
      }
      
      .board-column {
        min-width: 250px;
        background-color: var(--item-background);
        border-radius: 4px;
        padding: 8px;
      }
      
      .column-header {
        font-weight: bold;
        padding: 8px;
        background-color: var(--header-background);
        margin-bottom: 8px;
        border-radius: 4px;
      }
      
      .board-card {
        background-color: var(--container-background);
        padding: 8px;
        margin-bottom: 8px;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }
      
      /* Calendar View Styles */
      .calendar-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      
      .calendar-toolbar {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        align-items: center;
      }
      
      .calendar-grid {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      
      .calendar-header {
        display: flex;
        background-color: var(--header-background);
      }
      
      .calendar-body {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      
      .calendar-row {
        display: flex;
        flex: 1;
      }
      
      .calendar-cell {
        flex: 1;
        min-height: 100px;
        border: 1px solid var(--border-color);
        padding: 4px;
        position: relative;
      }
      
      .calendar-cell.empty {
        background-color: var(--container-background);
      }
      
      .calendar-cell.today {
        background-color: var(--highlight-color);
      }
      
      .calendar-date {
        position: absolute;
        top: 4px;
        right: 4px;
        font-size: 12px;
      }
      
      .calendar-events {
        margin-top: 20px;
      }
      
      .calendar-event {
        background-color: var(--item-background);
        margin-bottom: 4px;
        padding: 2px 4px;
        border-radius: 2px;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
      }
      
      .more-events {
        text-align: center;
        font-size: 10px;
        color: var(--text-color);
        opacity: 0.7;
      }
      
      /* Gallery View Styles */
      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
      }
      
      .gallery-card {
        background-color: var(--item-background);
        border-radius: 4px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }
      
      .card-header {
        background-color: var(--header-background);
        padding: 8px;
        font-weight: bold;
      }
      
      .card-body {
        padding: 8px;
      }
      
      /* Common components */
      .file-link {
        color: var(--text-color);
        text-decoration: underline;
        cursor: pointer;
      }
      
      .search-box {
        padding: 4px 8px;
        border: 1px solid var(--border-color);
        background-color: var(--item-background);
        color: var(--text-color);
        border-radius: 4px;
      }
    `,l=n.fields.map(f=>({name:f.name,type:f.type})),u=JSON.stringify(l),d="";switch(i.type){case"table":d=this.renderTableView(n);break;case"board":d=this.renderBoardView(n,i);break;case"calendar":d=this.renderCalendarView(n,i);break;case"gallery":d=this.renderGalleryView(n);break;default:d=this.renderTableView(n)}return`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t.name} - ${i.name}</title>
        <style>${c}</style>
      </head>
      <body>
        <header>
          <h1>${t.name} - ${i.name}</h1>
        </header>
        
        ${d}
        
        <script>
          // Client-side code for interactivity
          (function() {
            // Acquire the VS Code API once and make it globally available
            window.vscode = window.vscode || acquireVsCodeApi();
            
            // Global state for filter components
            window.filterState = {
              activeBuilder: null
            };
            
            // Initialize event listeners
            document.addEventListener('DOMContentLoaded', () => {
              // Handle file links
              document.querySelectorAll('.file-link').forEach(link => {
                link.addEventListener('click', (e) => {
                  const path = link.getAttribute('data-path');
                  if (path) {
                    window.vscode.postMessage({
                      command: 'openFile',
                      path: path
                    });
                  }
                });
              });
              
              // Handle filter panel toggle
              const showFiltersBtn = document.getElementById('showFiltersBtn');
              const filterPanel = document.getElementById('filterPanel');
              
              if (showFiltersBtn && filterPanel) {
                showFiltersBtn.addEventListener('click', () => {
                  filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none';
                });
              }
              
              // For calendar view
              const calendarShowFiltersBtn = document.getElementById('calendarShowFiltersBtn');
              const calendarFilterPanel = document.getElementById('calendarFilterPanel');
              
              if (calendarShowFiltersBtn && calendarFilterPanel) {
                calendarShowFiltersBtn.addEventListener('click', () => {
                  calendarFilterPanel.style.display = calendarFilterPanel.style.display === 'none' ? 'block' : 'none';
                });
              }
              
              // Calendar date field selection
              const dateFieldSelect = document.getElementById('dateFieldSelect');
              if (dateFieldSelect) {
                dateFieldSelect.addEventListener('change', () => {
                  window.vscode.postMessage({
                    command: 'updateCalendarConfig',
                    config: {
                      dateField: dateFieldSelect.value
                    }
                  });
                });
              }
              
              // Calendar navigation
              const prevMonthBtn = document.getElementById('prevMonth');
              const nextMonthBtn = document.getElementById('nextMonth');
              const todayBtn = document.getElementById('todayBtn');
              
              if (prevMonthBtn) {
                prevMonthBtn.addEventListener('click', () => {
                  window.vscode.postMessage({
                    command: 'updateCalendarConfig',
                    config: { month: 'prev' }
                  });
                });
              }
              
              if (nextMonthBtn) {
                nextMonthBtn.addEventListener('click', () => {
                  window.vscode.postMessage({
                    command: 'updateCalendarConfig',
                    config: { month: 'next' }
                  });
                });
              }
              
              if (todayBtn) {
                todayBtn.addEventListener('click', () => {
                  window.vscode.postMessage({
                    command: 'updateCalendarConfig',
                    config: { month: 'today' }
                  });
                });
              }
            });
            
            // Initialize filter builder if script is loaded
            if (typeof createFilterBuilder === 'function') {
              // Pass the available fields to the filter builder
              const fields = ${u};
              
              // Create the main filter builder instance
              const filterBuilder = document.getElementById('filterBuilder');
              if (filterBuilder) {
                window.filterBuilderComponent = createFilterBuilder({
                  container: filterBuilder,
                  fields: fields,
                  addButton: document.getElementById('addFilterBtn'),
                  conjunction: ${i.filter?.conjunction?`"${i.filter.conjunction}"`:'"and"'},
                  conditions: ${i.filter?.conditions?JSON.stringify(i.filter.conditions):"[]"}
                });
                
                // Store reference in global state
                window.filterState.activeBuilder = window.filterBuilderComponent;
              }
              
              // Create a separate filter builder for calendar view if needed
              const calendarFilterBuilder = document.getElementById('calendarFilterBuilder');
              if (calendarFilterBuilder) {
                window.calendarFilterBuilderComponent = createFilterBuilder({
                  container: calendarFilterBuilder,
                  fields: fields,
                  addButton: document.getElementById('calendarAddFilterBtn'),
                  conjunction: ${i.filter?.conjunction?`"${i.filter.conjunction}"`:'"and"'},
                  conditions: ${i.filter?.conditions?JSON.stringify(i.filter.conditions):"[]"}
                });
                
                // Store reference for the calendar filter builder
                window.filterState.calendarBuilder = window.calendarFilterBuilderComponent;
              }
            }
            
            // Handle messages from extension
            window.addEventListener('message', event => {
              const message = event.data;
              console.log('Received message from extension:', message);
              
              switch(message.command) {
                case 'filterSaved':
                  if (message.success) {
                    console.log('Filter saved successfully');
                    // Optional notification to the user
                  }
                  break;
                
                case 'dataRefreshed':
                  console.log('Data refreshed:', message.recordCount, 'records');
                  break;
                
                case 'itemUpdated':
                  console.log('Item updated:', message.recordId, message.success);
                  break;
                
                case 'configUpdated':
                  console.log('Configuration updated:', message.config);
                  break;
              }
            });
          })();
        </script>
        
        <!-- Filter Builder Script -->
        <script>${a}</script>
        
        <!-- Filter Handler Script -->
        <script>${o}</script>
      </body>
    </html>`}};var re;function x(e,r="info"){if(!re)return;let i=`[${new Date().toISOString().replace("T"," ").substr(0,19)}] ${e}`;switch(r){case"error":console.error(i),re.appendLine(`ERROR: ${e}`);break;case"warn":console.warn(i),re.appendLine(`WARNING: ${e}`);break;default:console.log(i),re.appendLine(`INFO: ${e}`)}}function rl(e,r,t,i,n){x("Registering commands...");let a={"vscode-projects.showProjects":()=>{x("Show projects command executed"),n.reveal(null,{focus:!0,select:!1})},"vscode-projects.createProject":async()=>{x("Create project command executed");try{await wi(r,t)}catch(o){x(`Error creating project: ${o}`,"error"),E.window.showErrorMessage(`Failed to create project: ${o}`)}},"vscode-projects.createNote":async()=>{x("Create note command executed");try{await xi(r)}catch(o){x(`Error creating note: ${o}`,"error"),E.window.showErrorMessage(`Failed to create note: ${o}`)}},"vscode-projects.openProject":async o=>{x(`Open project command executed with projectId: ${o}`);try{if(!o){let s=r.getProjects();if(s.length===0)throw new Error("No projects exist. Create a project first.");let c=s.map(u=>({label:u.name,id:u.id})),l=await E.window.showQuickPick(c,{placeHolder:"Select a project to open"});if(!l)return;o=l.id,x(`User selected project: ${l.label} (${o})`)}await i.openProject(o)}catch(s){x(`Error opening project: ${s}`,"error"),E.window.showErrorMessage(`Failed to open project: ${s}`)}},"vscode-projects.openView":async(o,s)=>{x(`Open view command executed with projectId: ${o}, viewId: ${s}`);try{if(!o){let c=r.getProjects();if(c.length===0)throw new Error("No projects exist. Create a project first.");let l=c.map(d=>({label:d.name,id:d.id})),u=await E.window.showQuickPick(l,{placeHolder:"Select a project"});if(!u)return;o=u.id,x(`User selected project: ${u.label} (${o})`)}if(!s){let c=r.getProject(o);if(!c)throw new Error(`Project with ID ${o} not found`);if(c.views.length===0)throw new Error(`Project ${c.name} has no views`);let l=c.views.map(d=>({label:d.name,description:`Type: ${d.type}`,id:d.id})),u=await E.window.showQuickPick(l,{placeHolder:"Select a view"});if(!u)return;s=u.id,x(`User selected view: ${u.label} (${s})`)}await i.openView(o,s)}catch(c){x(`Error opening view: ${c}`,"error"),E.window.showErrorMessage(`Failed to open view: ${c}`)}},"vscode-projects.refreshView":()=>{x("Refresh view command executed"),t.refresh()},"vscode-projects.toggleArchives":()=>{x("Toggle archives command executed"),t.toggleArchives()},"vscode-projects.createView":async()=>{x("Create view command executed");try{await bi(r),t.refresh()}catch(o){x(`Error creating view: ${o}`,"error"),E.window.showErrorMessage(`Failed to create view: ${o}`)}},"vscode-projects.deleteProject":async()=>{x("Delete project command executed");try{await Fi(r,t)}catch(o){x(`Error deleting project: ${o}`,"error"),E.window.showErrorMessage(`Failed to delete project: ${o}`)}},"vscode-projects.deleteView":async()=>{x("Delete view command executed");try{await Si(r,t)}catch(o){x(`Error deleting view: ${o}`,"error"),E.window.showErrorMessage(`Failed to delete view: ${o}`)}}};Object.keys(a).forEach(o=>{try{x(`Registering command: ${o}`);let s=E.commands.registerCommand(o,a[o]);e.subscriptions.push(s),x(`Command registered successfully: ${o}`)}catch(s){x(`Error registering command ${o}: ${s}`,"error"),E.window.showErrorMessage(`Failed to register command ${o}: ${s}`)}}),x("All commands registered successfully")}function tl(e){re=E.window.createOutputChannel("VSCode Projects"),e.subscriptions.push(re),x("Activating VSCode Projects extension"),x(`Extension path: ${e.extensionPath}`);try{let r=new tr;x("File system adapter initialized");let t=new Ue(e,r);x("Project manager initialized");let i=new Ce(e,t);x("View provider initialized");let n=new Ee(t);x("Projects tree data provider initialized");let a=E.window.createTreeView("vscode-projects-sidebar",{treeDataProvider:n,showCollapseAll:!0});x("Tree view registered with ID: vscode-projects-sidebar"),rl(e,t,n,i,a),e.subscriptions.push(re,a),x("VSCode Projects extension activated successfully"),E.window.showInformationMessage("VSCode Projects extension activated!")}catch(r){x(`Error during extension activation: ${r}`,"error"),E.window.showErrorMessage(`Failed to activate VSCode Projects extension: ${r}`)}}function nl(){x("Deactivating VSCode Projects extension")}0&&(module.exports={activate,deactivate});
/*! Bundled license information:

is-extendable/index.js:
  (*!
   * is-extendable <https://github.com/jonschlinkert/is-extendable>
   *
   * Copyright (c) 2015, Jon Schlinkert.
   * Licensed under the MIT License.
   *)

strip-bom-string/index.js:
  (*!
   * strip-bom-string <https://github.com/jonschlinkert/strip-bom-string>
   *
   * Copyright (c) 2015, 2017, Jon Schlinkert.
   * Released under the MIT License.
   *)
*/
//# sourceMappingURL=extension.js.map

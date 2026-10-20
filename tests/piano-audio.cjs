const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('Safari interrupted audio resumes; performer enable clears saved mute and preserves echo deduplication',async()=>{
 const handlers={},buttons=[],contexts=[];let oscillatorCount=0,resumes=0,session='ambient',stored='true';
 const param=()=>({value:0,setTargetAtTime(){},setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
 const node=()=>({gain:param(),threshold:param(),ratio:param(),frequency:param(),connect(){},disconnect(){},start(){},stop(){}});
 class Audio{constructor(){this.state='interrupted';this.currentTime=0;this.destination={};contexts.push(this);}createGain(){return node();}createDynamicsCompressor(){return node();}createOscillator(){oscillatorCount++;return node();}resume(){resumes++;this.state='running';return Promise.resolve();}}
 const document={hidden:false,createElement(){const b={style:{},setAttribute(){}};buttons.push(b);return b;},body:{append(){}},addEventListener(){},dispatchEvent(){}};
 const window={AudioContext:Audio,addEventListener(n,fn){handlers[n]=fn;}};
 const scope={window,document,location:{search:''},URLSearchParams,navigator:{audioSession:{get type(){return session},set type(v){session=v}}},localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},setInterval(){},setTimeout(){},performance:{now:()=>1000},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}};
 vm.runInNewContext(fs.readFileSync('piano-audio.js','utf8'),scope);
 assert.equal(window.mapPianoAudio.isMuted(),true);await window.mapPianoAudio.enable();assert.equal(window.mapPianoAudio.isMuted(),false);assert.equal(stored,'false');assert.equal(session,'playback');assert.equal(resumes,1);
 contexts[0].state='interrupted';handlers['piano-note']({detail:{id:'one',key:7}});await new Promise(r=>setImmediate(r));assert.equal(resumes,2);assert.equal(oscillatorCount,3,'current note sounds after interrupted context recovers');handlers['piano-note']({detail:{id:'one',key:7}});assert.equal(oscillatorCount,3,'echo remains silent');
 buttons[0].onclick();handlers['piano-note']({detail:{id:'two',key:8}});assert.equal(oscillatorCount,3,'explicit mute still works');
});

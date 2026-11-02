const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../dist/workspace/index.html'),'utf8');
assert(source.includes('className="page ask-page"'),'Ask Ada needs a chat page');
let cursor=0,hooks=[],pending=[];
const sandbox={html(strings,...values){return {strings,values};},Icon(){},Stream(){},REDUCE:true,
 useState(initial){const i=cursor++;if(!(i in hooks))hooks[i]=typeof initial==='function'?initial():initial;return [hooks[i],v=>hooks[i]=typeof v==='function'?v(hooks[i]):v];},
 useRef(initial){const i=cursor++;if(!(i in hooks))hooks[i]={current:initial};return hooks[i];},useEffect(){},
 setTimeout(fn){pending.push(fn);return pending.length;}
};
vm.createContext(sandbox);
vm.runInContext(source.slice(source.indexOf('var C04 ='),source.indexOf('var Store =')),sandbox);
let state=structuredClone(sandbox.initState);state.role='engineer';state.route='ask';
sandbox.useStore=()=>({s:state,dispatch:a=>{state=sandbox.reducer(state,a);}});
vm.runInContext(source.slice(source.indexOf('function Ask(){'),source.indexOf('/* ---------------- account ---------------- */')),sandbox);
function render(){cursor=0;return sandbox.Ask();}
function templates(t){return t?.strings?[t,...t.values.flatMap(v=>Array.isArray(v)?v.flatMap(templates):templates(v))]:[];}
function elements(tree){return templates(tree).flatMap(t=>{
 const raw=t.strings.map((s,i)=>s+(i<t.values.length?`§${i}§`:'')).join('');
 return [...raw.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)].map(m=>{const attrs={};
 for(const a of m[2].matchAll(/([\w-]+)=§(\d+)§/g))attrs[a[1]]=t.values[+a[2]];
 for(const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g))attrs[a[1]]=a[2];
 return {tag:m[1],attrs,after:raw.slice(m.index+m[0].length)};
 });
});}
const box=t=>elements(t).find(e=>e.attrs.id==='ada-message');
const type=(t,value)=>box(t).attrs.onInput({target:{value,style:{},scrollHeight:54}});
const button=(t,label)=>elements(t).find(e=>e.tag==='button'&&e.attrs['aria-label']===label);
const submit=t=>elements(t).find(e=>e.tag==='form').attrs.onSubmit({preventDefault(){}});
const flush=()=>{while(pending.length)pending.shift()();};
let tree=render();submit(tree);assert(!state.threads['ask-ada'],'Blank messages must not create a thread');
type(tree,'Is RC=4 from POSTTRAN a failure?');tree=render();submit(tree);
assert.equal(state.threads['ask-ada'][0].status,'thinking');
submit(tree);assert.equal(state.threads['ask-ada'].length,1,'Repeated sends must not duplicate a pending message');
assert.equal(box(render()).attrs.value,'');flush();tree=render();
assert.equal(state.threads['ask-ada'][0].known,true);
assert.deepEqual(Array.from(state.threads['ask-ada'][0].sources),['KI-081','KI-084']);
button(tree,'Show reference KI-084').attrs.onClick();tree=render();
assert.equal(button(tree,'Select reference KI-084').attrs['aria-pressed'],true);
button(tree,'Open full reference').attrs.onClick();assert.equal(state.drawer,'KI-084');
type(tree,'What is the production database password?');tree=render();submit(tree);flush();tree=render();
assert.equal(state.threads['ask-ada'][1].known,false);
assert.equal(elements(tree).filter(e=>e.attrs['aria-label']?.startsWith('Select reference ')).length,0,'Unknown answers must not cite unrelated references');
const before=state.questions.length;
button(tree,'Send question to Linda').attrs.onClick();assert.equal(state.questions.length,before+1);tree=render();
assert(!button(tree,'Send question to Linda'),'Do not send the same question twice');
type(tree,'What does reason 103 mean?');tree=render();
box(tree).attrs.onKeyDown({key:'Enter',shiftKey:true,preventDefault(){throw new Error('Shift+Enter must allow a newline');}});
assert.equal(state.threads['ask-ada'].length,2);
box(tree).attrs.onKeyDown({key:'Enter',isComposing:true,preventDefault(){throw new Error('IME Enter must not submit');}});
assert.equal(state.threads['ask-ada'].length,2);
box(tree).attrs.onKeyDown({key:'Enter',preventDefault(){}});assert.equal(state.threads['ask-ada'].length,3);
state.threads['INC-2041']=[{id:'ticket-answer',q:'Existing ticket question',status:'done'}];
tree=render();button(tree,'New chat').attrs.onClick();flush();tree=render();
assert.equal(state.threads['ask-ada'].length,0,'Late replies must not restore a cleared chat');
assert.equal(state.threads['INC-2041'].length,1,'New chat must preserve ticket conversations');
assert.equal(box(tree).attrs.value,'');
type(tree,'Which field holds the expiration date?');tree=render();submit(tree);flush();tree=render();
assert.equal(state.threads['ask-ada'][0].known,true,'Ada can use knowledge from another expert');
assert.equal(state.threads['ask-ada'][0].sources[0],'KI-066');
state.items=state.items.map(item=>item.id==='KI-066'?{...item,status:'draft'}:item);tree=render();
assert(!button(tree,'Show reference KI-066'),'Unconfirmed items must not remain clickable references');
assert.equal(elements(tree).filter(e=>e.attrs['aria-label']?.startsWith('Select reference ')).length,0);
console.log('Passed: chat submission, confirmed sources, reference selection, source details, unknown answers, review handoff, keyboard input, and clearing pending chats.');

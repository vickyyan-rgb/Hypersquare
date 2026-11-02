const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../dist/workspace/index.html'),'utf8');
function harness(){
  const state={session:{q:0,phase:'ask',st:['todo','todo','todo','todo','todo']}};
  let cursor=0,hooks=[];
  const ctx={s:state,dispatch(a){if(a.type==='session')Object.assign(state.session,a.patch);}};
  const sandbox={html(strings,...values){return {strings,values};},useStore:()=>ctx,
    useState(initial){const i=cursor++;if(!(i in hooks))hooks[i]=initial;return [hooks[i],v=>hooks[i]=typeof v==='function'?v(hooks[i]):v];},
    useRef(initial){const i=cursor++;if(!(i in hooks))hooks[i]={current:initial};return hooks[i];},useEffect(){},
    document:{querySelector:()=>null},setTimeout(fn){fn();return 1;},clearTimeout(){},setInterval(){return 1;},clearInterval(){},
    SESSION_CODE:[],REDUCE:true,Icon(){},Orb(){},Code(){},IvIntro(){},IvLogic(){},React:{},ST_LABEL:{done:['t-ok','Confirmed']}
  };
  vm.createContext(sandbox);
  const qsStart=source.indexOf('var QS = [');vm.runInContext(source.slice(qsStart,source.indexOf('\n];',qsStart)+3),sandbox);
  vm.runInContext(source.slice(source.indexOf('function Interview()'),source.indexOf('\nfunction Review()')),sandbox);
  return {state,sandbox,render(){cursor=0;return sandbox.Interview();}};
}
function templates(tree){return tree?.strings?[tree,...tree.values.flatMap(v=>Array.isArray(v)?v.flatMap(templates):templates(v))]:[];}
function element(tree,tag,contains){
  for(const t of templates(tree)){
    const raw=t.strings.map((s,i)=>s+(i<t.values.length?`§${i}§`:'')).join('');
    const pattern=new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}>`,'g');
    for(const m of raw.matchAll(pattern))if((m[1]+m[2]).includes(contains)){
      const attrs={};for(const a of m[1].matchAll(/([\w-]+)=§(\d+)§/g))attrs[a[1]]=t.values[+a[2]];
      for(const a of m[1].matchAll(/([\w-]+)="([^"]*)"/g))attrs[a[1]]=a[2];
      return {attrs,raw:m[0]};
    }
  }
  return null;
}
const typed=harness();let tree=typed.render(),box=element(tree,'textarea','id="ans"');
assert(box,'An answer text box must be visible before clicking Type');
assert.equal(box.attrs.placeholder,'Write your answer here…');assert.equal(box.attrs.value,'');
let send=element(tree,'button','Send answer');assert.equal(send.attrs.disabled,true);
send.attrs.onClick();assert.equal(typed.state.session.phase,'ask','Blank answers must not submit sample text');
box.attrs.onInput({target:{value:'Preserve billing continuity.'}});tree=typed.render();
assert.equal(element(tree,'textarea','id="ans"').attrs.value,'Preserve billing continuity.');
send=element(tree,'button','Send answer');assert.equal(send.attrs.disabled,false);send.attrs.onClick();
assert.equal(typed.state.session.phase,'reflect');
assert(templates(typed.render()).some(t=>t.values.includes('Preserve billing continuity.')));
const voice=harness();tree=voice.render();
element(tree,'textarea','id="ans"').attrs.onInput({target:{value:'My existing note.'}});tree=voice.render();
element(tree,'button','aria-label="Hold to talk"').attrs.onKeyDown({key:'Enter',preventDefault(){}});
assert.equal(voice.state.session.phase,'rec');tree=voice.render();
assert.equal(element(tree,'textarea','id="ans"').attrs.readOnly,true);
assert.equal(element(tree,'button','Send answer').attrs.disabled,true);
element(tree,'button','aria-label="Hold to talk"').attrs.onKeyDown({key:'Enter',preventDefault(){}});
assert.equal(voice.state.session.phase,'type','Voice completion should leave a draft, not submit automatically');
tree=voice.render();box=element(tree,'textarea','id="ans"');
assert(box.attrs.value.startsWith('My existing note.'));assert(box.attrs.value.includes(voice.sandbox.QS[0].said));
assert.equal(box.attrs.readOnly,false);
tree=voice.render();element(tree,'button','Skip').attrs.onClick();
assert.equal(voice.state.session.q,1);assert.equal(element(voice.render(),'textarea','id="ans"').attrs.value,'');
const editor=harness();editor.state.session.phase='type';tree=editor.render();
const code=templates(tree).find(t=>t.values.includes(editor.sandbox.Code));
const callback=code.values[code.strings.findIndex(s=>s.endsWith('onSave='))];callback({count:1,reason:'Use the fallback rate.'});
assert.equal(editor.state.session.phase,'reflect','Code edits must still work from typing mode');
console.log('Passed: visible answer box, typed submission, empty-answer protection, staged demo transcript, draft preservation, skip reset, and code-edit submission.');

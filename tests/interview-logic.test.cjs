const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../dist/workspace/index.html'),'utf8');
let cursor=0,hooks=[];
const sandbox={html(strings,...values){return {strings,values};},Icon(){},Orb(){},Code(){},IvIntro(){},React:{},REDUCE:true,ST_LABEL:{done:['t-ok','Confirmed'],edited:['t-ok','Edited']},
  useState(initial){const i=cursor++;if(!(i in hooks))hooks[i]=typeof initial==='function'?initial():initial;return [hooks[i],v=>hooks[i]=typeof v==='function'?v(hooks[i]):v];},
  useRef(initial){const i=cursor++;if(!(i in hooks))hooks[i]={current:initial};return hooks[i];},useEffect(){},
  setTimeout(fn){fn();return 1;},clearTimeout(){},document:{querySelector(){return null;}}
};
vm.createContext(sandbox);
vm.runInContext(source.slice(source.indexOf('var C04 ='),source.indexOf('var Store =')),sandbox);
vm.runInContext(source.slice(source.indexOf('function IvLogic('),source.indexOf('\nfunction Review()')),sandbox);
function templates(t){return t?.strings?[t,...t.values.flatMap(v=>Array.isArray(v)?v.flatMap(templates):templates(v))]:[];}
function elements(tree){return templates(tree).flatMap(t=>{
  const raw=t.strings.map((s,i)=>s+(i<t.values.length?`§${i}§`:'')).join('');
  return [...raw.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)].map(m=>{const attrs={};
    for(const a of m[2].matchAll(/([\w-]+)=§(\d+)§/g))attrs[a[1]]=t.values[+a[2]];
    for(const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g))attrs[a[1]]=a[2];
    return {tag:m[1],attrs,after:raw.slice(m.index+m[0].length).split('</button>')[0]};
  });
});}
const field=(tree,key)=>elements(tree).find(e=>e.attrs['data-logic-field']===key);
let edits={};
function diagram(index=0){return sandbox.IvLogic({question:sandbox.QS[index],index,edits,onChange(key,value){edits={...edits,[key]:value};}});}
let tree=diagram();
assert(field(tree,'step0'),'The first chart box must be editable directly');
for(const key of ['step0','decision','step1','step2','step3','branch0','branch1','branch2','tag2','tag3']){
  const input=field(tree,key);assert.equal(input.tag,'textarea');assert(input.attrs['aria-label']);
  input.attrs.onInput({currentTarget:{value:'Updated '+key,style:{},scrollHeight:48}});
  assert.equal(field(diagram(),key).attrs.value,'Updated '+key,'Typing should update '+key);
}
assert.equal(sandbox.QS[0].steps[0][0],'Look up the account group’s interest rate','Editing must preserve the source diagram');
const multiline={value:'Check the rate.\nThen check the effective date.',style:{},scrollHeight:72};
field(diagram(),'step0').attrs.onInput({currentTarget:multiline});assert.equal(multiline.style.height,'72px','Boxes should grow to fit longer text');
assert.equal(field(diagram(),'step0').attrs.value,multiline.value);
const node=elements(diagram()).find(e=>e.attrs.className?.startsWith('logic-node '));let focused=false;
const surface={querySelector(){return {focus(){focused=true;}};}};node.attrs.onClick({target:surface,currentTarget:surface});assert(focused,'Clicking box padding should focus its text');
for(let index=1;index<5;index++){
  edits={};tree=diagram(index);
  for(let step=0;step<4;step++)assert(field(tree,'step'+step),'Every question’s chart must support editing');
}
const preview=sandbox.IvLogic({question:sandbox.QS[0],index:0,edits:{step0:'Saved box'}});
assert(!elements(preview).some(e=>e.tag==='textarea'),'Read-only diagrams remain read-only');
assert(templates(preview).some(t=>t.values.includes('Saved box')));
let state=structuredClone(sandbox.initState);state.session.phase='reflect';
sandbox.useStore=()=>({s:state,dispatch:a=>{state=sandbox.reducer(state,a);}});
function interview(){cursor=0;return sandbox.Interview();}
function logicProps(view){const t=templates(view).find(t=>t.values.includes(sandbox.IvLogic));const props={};for(let i=0;i<t.values.length;i++){const m=t.strings[i].match(/(\w+)=$/);if(m)props[m[1]]=t.values[i];}return props;}
tree=interview();let props=logicProps(tree);assert.equal(typeof props.onChange,'function');
props.onChange('step0','Check the approved disclosure rate.');
props=logicProps(interview());assert.equal(props.edits.step0,'Check the approved disclosure rate.');
props.onChange('step1','Temporary change');props=logicProps(interview());props.onChange('step1','Use the group’s rate');
assert(!state.session.logicEdits[0].step1,'Returning to original text removes the edit');
// Simulate leaving and reopening Interview: edits must be kept in the session, not component state.
hooks=[];props=logicProps(interview());assert.equal(props.edits.step0,'Check the approved disclosure rate.');
const confirm=elements(interview()).find(e=>e.tag==='button'&&e.after.includes('That’s right'));confirm.attrs.onClick();
assert.equal(state.session.q,1);assert.equal(state.session.logicEdits[0].step0,'Check the approved disclosure rate.');
assert(!state.session.logicEdits[1],'Edits must not leak into the next question');
state.session.phase='reflect';props=logicProps(interview());props.onChange('step1','Write an alert for the operations team.');
state.session.q=2;props=logicProps(interview());props.onChange('step0','Use the agreed promotional interest calculation.');
state.session.q=3;props=logicProps(interview());props.onChange('step2','Fees are charged by BILLFEES.');
state.session.q=4;props=logicProps(interview());props.onChange('step0','Restore the missing DEFAULT row.');
state=sandbox.reducer(state,{type:'sessionDone'});
assert(state.items.find(i=>i.id==='KI-101').body.includes('Check the approved disclosure rate.'));
assert(state.items.find(i=>i.id==='KI-102').body.includes('Write an alert for the operations team.'));
assert(state.items.find(i=>i.id==='KI-103').body.includes('Restore the missing DEFAULT row.'));
assert(state.items.some(i=>i.body.includes('Use the agreed promotional interest calculation.')),'An edited third question must reach Review');
assert(state.items.some(i=>i.body.includes('Fees are charged by BILLFEES.')),'An edited fourth question must reach Review');
const saved=state.items.length;state=sandbox.reducer(state,{type:'sessionDone'});assert.equal(state.items.length,saved,'Do not duplicate session drafts');
const untouched=sandbox.reducer(structuredClone(sandbox.initState),{type:'sessionDone'});
assert.equal(untouched.items.length,sandbox.initState.items.length+3,'Unedited sessions keep the existing three drafts');
assert.equal(untouched.items.find(i=>i.id==='KI-101').body,sandbox.SESSION_DRAFTS[0].body);
console.log('Passed: direct editing of every chart box, decision and labels, all five questions, source preservation, session persistence, confirmation, and corrected Review drafts.');

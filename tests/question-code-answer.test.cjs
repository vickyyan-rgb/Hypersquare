const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../dist/workspace/index.html'),'utf8');
let cursor=0,hooks=[];
const sandbox={html(strings,...values){return {strings,values};},Icon(){},
  useState(initial){const i=cursor++;if(!(i in hooks))hooks[i]=typeof initial==='function'?initial():initial;return [hooks[i],v=>hooks[i]=typeof v==='function'?v(hooks[i]):v];},
  useRef(initial){const i=cursor++;if(!(i in hooks))hooks[i]={current:initial};return hooks[i];}
};
vm.createContext(sandbox);
vm.runInContext(source.slice(source.indexOf('var C04 ='),source.indexOf('var Store =')),sandbox);
vm.runInContext(source.slice(source.indexOf('/* ---------------- question code answers'),source.indexOf('function FlowMap(')),sandbox);
assert.equal(typeof sandbox.QuestionCodeAnswer,'function','Answer now must open a direct code answer editor');
let state=structuredClone(sandbox.initState),closed=0;
sandbox.useStore=()=>({s:state,dispatch:a=>{state=sandbox.reducer(state,a);}});
function templates(t){return t?.strings?[t,...t.values.flatMap(v=>Array.isArray(v)?v.flatMap(templates):templates(v))]:[];}
function elements(tree){return templates(tree).flatMap(t=>{
  const raw=t.strings.map((s,i)=>s+(i<t.values.length?`§${i}§`:'')).join('');
  return [...raw.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)].map(m=>{const attrs={};
    for(const a of m[2].matchAll(/([\w-]+)=§(\d+)§/g))attrs[a[1]]=t.values[+a[2]];
    for(const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g))attrs[a[1]]=a[2];
    return {tag:m[1],attrs,after:raw.slice(m.index+m[0].length).split('</button>')[0]};
  });
});}
const button=(tree,label)=>elements(tree).find(e=>e.tag==='button'&&e.after.includes(label));
const editor=tree=>elements(tree).find(e=>e.tag==='textarea'&&e.attrs['aria-label']==='Code answer');
const note=tree=>elements(tree).find(e=>e.tag==='textarea'&&e.attrs['aria-label']==='Answer note (optional)');
function render(q){cursor=0;return sandbox.QuestionCodeAnswer({q,onClose(){closed++;}});}
const questions=state.questions;
const reject=sandbox.questionCodeSource(questions[0],state.items);
const expiry=sandbox.questionCodeSource(questions[1],state.items);
assert(reject.text.includes('WS-REJECT-COUNT'),'Reject questions need the posting code');
assert(expiry.text.includes('ACCT-EXPIRAION-DATE'),'Reissue questions need the expiration check');
assert(!expiry.text.includes('WS-REJECT-COUNT'),'Do not reuse the first question’s snippet for every question');
assert.equal(sandbox.questionCodeSource({program:'NO-SOURCE',text:'An unknown question'},state.items).text,'','Missing source should open a blank editor');
let diff=sandbox.codeAnswerDiff('READ FILE\nEND-READ','READ FILE\n    DISPLAY OK\nEND-READ');
assert.deepEqual(Array.from(diff.lines,r=>r.changed),[false,true,false],'Insertions should not recolour unchanged lines below them');
diff=sandbox.codeAnswerDiff('READ FILE\nDISPLAY OK\nEND-READ','READ FILE\nEND-READ');
assert.equal(diff.removed,1);assert(diff.lines.every(r=>!r.changed));
diff=sandbox.codeAnswerDiff('READ FILE','READ OTHER');assert.equal(diff.lines[0].changed,true);
assert(sandbox.codeAnswerDiff('READ FILE','READ FILE').lines.every(r=>!r.changed));
let tree=render(questions[0]);
assert.equal(editor(tree).attrs.value,reject.text);
assert.equal(editor(tree).attrs.readOnly,undefined);
assert(button(tree,'Publish answer').attrs.disabled,'Untouched code is not an answer');
assert(!elements(tree).some(e=>e.tag==='input'),'Do not bring back Short title');
note(tree).attrs.onInput({target:{value:'   '}});tree=render(questions[0]);assert(button(tree,'Publish answer').attrs.disabled);
const before=state.items.length;button(tree,'Publish answer').attrs.onClick();assert.equal(state.items.length,before);
const edited=reject.text+'\n      *> Re-post only the corrected rejected records.';
editor(tree).attrs.onInput({target:{value:edited}});tree=render(questions[0]);
assert.equal(button(tree,'Publish answer').attrs.disabled,false,'Code alone must be publishable');
assert(elements(tree).some(e=>e.attrs.className==='qca-line changed'),'Edited code must have the distinct colour class');
button(tree,'Publish answer').attrs.onClick();
assert.equal(state.questions[0].status,'answered');assert.equal(closed,1);
let saved=state.items.at(-1);assert.equal(saved.title,questions[0].text);assert.equal(saved.file,'CBTRN02C.cbl');
assert.equal(saved.code.map(r=>r[1]).join('\n'),edited);assert.equal(saved.originalCode,reject.text);
assert.equal(saved.sourceLines,reject.sourceLines);assert.equal(saved.codeChanged,true);
assert.equal(state.items.find(i=>i.id==='KI-081').code.at(-1)[1],'    END-IF','Publishing must not mutate source code');
hooks=[];tree=render(questions[1]);assert.equal(editor(tree).attrs.value,expiry.text,'Each question opens its own code');
note(tree).attrs.onInput({target:{value:'Check the account date before re-posting.'}});tree=render(questions[1]);
button(tree,'Publish answer').attrs.onClick();saved=state.items.at(-1);
assert.equal(saved.body,'Check the account date before re-posting.');assert.equal(saved.codeChanged,false);
hooks=[];tree=render({id:'unpublished',program:'NO-SOURCE',text:'Show a code sample'});
const textarea=editor(tree);let caret=null,prevented=false;
textarea.attrs.onKeyDown({key:'Tab',shiftKey:false,ctrlKey:false,metaKey:false,altKey:false,isComposing:false,preventDefault(){prevented=true;},currentTarget:{value:'',selectionStart:0,selectionEnd:0,setSelectionRange(a,b){caret=[a,b];},focus(){}}});
assert(prevented,'Tab should indent inside code');tree=render({id:'unpublished',program:'NO-SOURCE',text:'Show a code sample'});assert.equal(editor(tree).attrs.value,'    ');
// Cancel closes the editor without publishing the draft.
const unchanged=state.items.length;button(tree,'Cancel').attrs.onClick();assert.equal(state.items.length,unchanged);
// Inbox routes Answer now into the code component, not the old text-only form.
state=structuredClone(sandbox.initState);hooks=[];cursor=0;tree=sandbox.Inbox();
button(tree,'Answer now').attrs.onClick();cursor=0;tree=sandbox.Inbox();
assert(templates(tree).some(t=>t.values.includes(sandbox.QuestionCodeAnswer)));
console.log('Passed: question-specific code, multiline edits, changed-line colouring, insertions/deletions, code-only publication, original source retention, text notes, indentation, cancellation, and Answer now entry.');

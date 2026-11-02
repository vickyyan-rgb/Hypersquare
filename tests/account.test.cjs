const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../dist/workspace/index.html'),'utf8');
assert(source.includes('function Account(){'),'The profile should open an Account information page');
const sandbox={html(strings,...values){return {strings,values};},Icon(){},REWARDS_URL:'../index.html',uid:()=> 'test-toast'};
vm.createContext(sandbox);
vm.runInContext(source.slice(source.indexOf('var ACCOUNT_OFFERS ='),source.indexOf('var initState =')),sandbox);
vm.runInContext(source.slice(source.indexOf('function reducer('),source.indexOf('var Store =')),sandbox);
let state={role:'expert',accounts:structuredClone(sandbox.DEFAULT_ACCOUNTS),toasts:[]},cursor=0,hooks=[];
sandbox.useStore=()=>({s:state,dispatch:a=>{state=sandbox.reducer(state,a);}});
sandbox.useState=initial=>{const i=cursor++;if(!(i in hooks))hooks[i]=typeof initial==='function'?initial():initial;return [hooks[i],value=>{hooks[i]=typeof value==='function'?value(hooks[i]):value;}];};
vm.runInContext(source.slice(source.indexOf('function Account(){'),source.indexOf('/* ---------------- app ---------------- */')),sandbox);
function render(){cursor=0;return sandbox.Account();}
function templates(tree){return tree?.strings?[tree,...tree.values.flatMap(v=>Array.isArray(v)?v.flatMap(templates):templates(v))]:[];}
function elements(tree){return templates(tree).flatMap(t=>{
 const raw=t.strings.map((s,i)=>s+(i<t.values.length?`§${i}§`:'')).join('');
 return [...raw.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)].map(m=>{const attrs={};
 for(const a of m[2].matchAll(/([\w-]+)=§(\d+)§/g))attrs[a[1]]=t.values[+a[2]];
 for(const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g))attrs[a[1]]=a[2];
 return {tag:m[1],attrs,after:raw.slice(m.index+m[0].length)};
 });
});}
const field=(tree,id)=>elements(tree).find(e=>e.attrs.id===id);
const submit=tree=>elements(tree).find(e=>e.tag==='form').attrs.onSubmit({preventDefault(){}});
const text=tree=>templates(tree).map(t=>t.strings.join('')).join('');
let tree=render();
assert(text(tree).includes('Account information'));
assert(text(tree).includes('Sign-in details'));
assert.equal(field(tree,'account-email').attrs.value,'linda.c@example.com');
assert.equal(field(tree,'account-offer').attrs.value,'');
field(tree,'account-name').attrs.onInput({target:{value:'Linda Chen'}});tree=render();
field(tree,'account-offer').attrs.onChange({target:{value:'chase'}});tree=render();
field(tree,'account-reminders').attrs.onChange({target:{checked:false}});tree=render();
submit(tree);
assert.equal(state.accounts.expert.name,'Linda Chen');
assert.equal(state.accounts.expert.offer,'chase');
assert.equal(state.accounts.expert.reminders,false);
assert.equal(state.accounts.engineer.name,'Marcus R.','Expert changes must not overwrite the engineer account');
assert.equal(state.accounts.engineer.offer,'');
tree=render();field(tree,'account-email').attrs.onInput({target:{value:'not-an-email'}});tree=render();submit(tree);
assert.equal(state.accounts.expert.email,'linda.c@example.com','Invalid sign-in emails must not save');
tree=render();elements(tree).find(e=>e.tag==='button'&&e.after.startsWith('Cancel')).attrs.onClick();tree=render();
assert.equal(field(tree,'account-email').attrs.value,'linda.c@example.com','Cancel should restore saved details');
hooks=[];tree=render();assert.equal(field(tree,'account-offer').attrs.value,'chase','The selection survives reopening the account page');
assert(source.includes("go('account')"));
assert(source.includes('account:Account'));
console.log('Passed: account page, profile editing, offer selection, preferences, role separation, validation, cancel, and reopening.');

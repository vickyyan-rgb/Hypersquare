const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../dist/workspace/index.html'),'utf8');
const begin=source.indexOf('function workspaceEntryState(');
assert(begin>=0,'Workspace links must open the requested role and page');
const context={window:{location:{hash:''}}};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('var NAV ='),source.indexOf('function Sidebar(')),context);
vm.runInContext(source.slice(begin,source.indexOf('function App()',begin)),context);
const base={role:'expert',route:'home',items:[{id:'keep'}],session:{phase:'idle'}};
for(const [role,routes] of Object.entries({expert:['home','session','review','library','coverage','leaderboard','inbox','account'],engineer:['ask','tickets','library','account']})){
  for(const route of routes){
    context.window.location.hash=`#/${role}/${route}`;
    const state=context.workspaceEntryState(base);
    assert.equal(state.role,role);assert.equal(state.route,route);
    assert.equal(state.items,base.items);assert.equal(state.session,base.session);
    assert.equal(base.route,'home','Entry links must not modify the base state');
  }
}
for(const hash of ['', '#/expert/missing', '#/engineer/review', '#/engineer/leaderboard', '#/expert/tickets', '#/unknown/home']){
  context.window.location.hash=hash;assert.equal(context.workspaceEntryState(base),base,'Invalid links fall back to the normal home state');
}
assert(source.includes('useReducer(reducer, initState, workspaceEntryState)'),'The app must initialize from the requested destination');
console.log('Passed: expert and engineer entry links, role-specific destinations, invalid-link fallback, and preservation of initial data.');

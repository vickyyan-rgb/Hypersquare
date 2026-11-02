const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '../dist');
let pending = new Map(), nextTimer = 0, visibilityChange, keydown;
const sceneNodes=Object.fromEntries(['[data-code-lines]','[data-editor-feedback]','[data-editor-status]','[data-round-points]','[data-demo-chip]','[data-cobol-scene]'].map(s=>[s,{innerHTML:'',textContent:'',className:'',dataset:{}}]));
const pointer={style:{},className:''};
const stage={clientWidth:1200,clientHeight:700,getBoundingClientRect:()=>({left:0,top:0,right:1200,bottom:700})};
const anchor={getBoundingClientRect:()=>({left:240,top:220,bottom:248})};
Object.assign(sceneNodes,{'[data-demo-mouse]':pointer,'[data-editor-stage]':stage,'[data-edit-anchor]':anchor});
const context = {
  app:{innerHTML:''}, state:{}, location:{hash:'#/cobol-now'},
  document:{hidden:false, querySelectorAll:()=>[], querySelector:s=>sceneNodes[s]||null, addEventListener(name,fn){if(name==='visibilitychange')visibilityChange=fn;if(name==='keydown')keydown=fn;}},
  window:{matchMedia:()=>({matches:true})}, matchMedia:()=>({matches:true}),
  setTimeout(fn){const id=++nextTimer;pending.set(id,fn);return id;},
  clearTimeout(id){pending.delete(id);},
  mark:'', icon:()=>'', icons:{}, escapeHtml:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'leaderboard-data.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'dashboard.js'),'utf8'),context);
const demoPath=path.join(root,'cobol-demo.js');
if(fs.existsSync(demoPath)) vm.runInContext(fs.readFileSync(demoPath,'utf8'),context);
assert.equal(typeof context.startCobolDemo,'function','COBOL NOW needs a six-question demo');
const read=expression=>vm.runInContext(expression,context);
vm.runInContext('shownPoints=285',context);
function tick(){assert(pending.size,'Expected an automatic playback step');const [id,fn]=pending.entries().next().value;pending.delete(id);fn();}
function finishEditing(expected='ready'){let limit=1000;while(read('cobolPlayback.phase')!==expected&&limit-->0)tick();assert.equal(read('cobolPlayback.phase'),expected);}
function finishRound(){let limit=2000;while(read('cobolPlayback.phase')!=='complete'&&limit-->0){if(read('cobolPlayback.phase')==='ready')context.enterCobolAnswer();else tick();}assert.equal(read('cobolPlayback.phase'),'complete');}
// Regression: finishing the typing animation must not reveal a result or award points.
context.startCobolDemo();
for(let limit=1000;context.cobolEditorSnapshot().text!==read('cobolChallenges[0].fix')&&limit>0;limit--)tick();
assert.equal(context.cobolEditorFeedback(),'','Wait for Enter before displaying correctness');
assert.equal(context.cobolRoundPoints(),0,'Typing alone must not earn points');
assert.equal(pending.size,0,'Wait indefinitely for submission');
context.showCobolResults();
assert.equal(read('community.points'),285,'Final score cannot bypass answer submission');
assert.notEqual(read('cobolPlayback.phase'),'complete');
context.startCobolDemo();
assert(context.app.innerHTML.includes('Question 1 of 6'));
assert(!/<(?:input|textarea)\b/.test(context.app.innerHTML),'Demo must not require answer entry');
assert(!context.app.innerHTML.includes('cd-choices'),'Coding prompts must replace multiple-choice answers');
assert(context.app.innerHTML.includes('<h1>COBOL Now!</h1>'));
assert(context.app.innerHTML.includes('cd-editor-screen'),'The demo must fill the page with one code editor');
assert(context.app.innerHTML.includes('cd-workspace-sidebar'),'Keep expert navigation beside the editor');
assert(context.app.innerHTML.includes('href="workspace/index.html#/expert/home" class="cd-editor-back" aria-label="Back to Expert Home"'));
for(const route of ['home','session','review','library','coverage','leaderboard','account'])assert(context.app.innerHTML.includes(`href="workspace/index.html#/expert/${route}"`));
assert(!context.app.innerHTML.includes('cd-challenge'));
assert(context.app.innerHTML.includes('data-demo-mouse'),'Show a simulated mouse in the code editor');
assert.equal(read('community.points'),285);
for(let i=0;i<6;i++){
  assert(context.app.innerHTML.includes(`Question ${i+1} of 6`));
  const original=read('cobolChallenges[cobolPlayback.index].code');
  assert.equal(context.cobolEditorSnapshot().text,original,'Begin with the faulty code in place');
  const idlePosition=pointer.style.transform;
  tick(); // move the mouse to the faulty code
  assert.equal(read('cobolPlayback.phase'),'point');
  assert.notEqual(pointer.style.transform,idlePosition,'Move the mouse to the editing location');
  tick(); // select the code to replace
  assert.equal(read('cobolPlayback.phase'),'select');
  assert(sceneNodes['[data-code-lines]'].innerHTML.includes('cd-code-selection'));
  tick(); // remove the selection
  assert.equal(read('cobolPlayback.phase'),'deleting');
  const beforeTyping=context.cobolEditorSnapshot().text;
  tick();tick();
  const answer=read('cobolChallenges[cobolPlayback.index].draft || cobolChallenges[cobolPlayback.index].fix');
  if(i===0){assert.notEqual(context.cobolEditorSnapshot().text,beforeTyping);assert.notEqual(context.cobolEditorSnapshot().text,answer,'Show edits progressively');}
  if(i===0){
    const progress=read('cobolPlayback.typed');
    context.toggleCobolDemo();assert.equal(pending.size,0);
    assert(context.cobolDemoView().includes('Paused'));
    context.toggleCobolDemo();assert.equal(read('cobolPlayback.typed'),progress,'Resume preserves typed code');
    assert.equal(pending.size,1);
  }
  finishEditing();
  assert.equal(context.cobolEditorSnapshot().text,answer);
  assert.equal(context.cobolEditorFeedback(),'','Every answer waits for submission');
  assert.equal(pending.size,0);
  assert.equal(context.cobolRoundPoints(),[0,25,50,75,75,100][i]);
  context.enterCobolAnswer();
  assert.equal(read('cobolPlayback.phase'),'answer');
  assert.equal(context.cobolRoundPoints(),[25,50,75,75,100,125][i]);
  assert.equal(pending.size,1,'Submission schedules one result display');
  context.enterCobolAnswer();
  assert.equal(read('cobolPlayback.phase'),'answer','Double submission must not skip feedback');
  if(i===3){
    assert(context.cobolDemoView().includes('Not correct'));
    tick();assert.equal(read('cobolPlayback.phase'),'point');
    finishEditing();
    assert.equal(context.cobolEditorSnapshot().text,read('cobolChallenges[3].fix'));
    assert(context.cobolEditorSnapshot().text.includes('WS-FEE ROUNDED'));
    assert.equal(context.cobolEditorFeedback(),'','Check the correction only after Enter');
    context.enterCobolAnswer();
    assert.equal(read('cobolPlayback.phase'),'corrected');
    assert(context.cobolEditorFeedback().includes('Correct'));
  } else {
    assert(context.cobolEditorFeedback().includes('Correct'));
  }
  tick(); // next question, or the final score
}
assert(context.app.innerHTML.includes('5 / 6'));
assert(context.app.innerHTML.includes('cd-workspace-sidebar'),'Keep the sidebar on the results screen');
assert(context.app.innerHTML.includes('Back to Expert Home'));
assert(context.app.innerHTML.includes('125'));
assert(context.app.innerHTML.includes('410'));
assert.equal(read('community.points'),410);
assert.equal(read('community.weekly'),210);
assert.equal(pending.size,0);
const overviewPoints={textContent:'410'};
context.document.getElementById=id=>id==='points-big'?overviewPoints:null;
context.dialog={addEventListener(){}};
context.storyStart=()=>{};context.revealStart=()=>{};
context.bindDashboard();
assert.equal(overviewPoints.textContent,'410','Returning to Overview must display the newly earned total');
context.startCobolDemo();
finishRound();
assert.equal(read('community.points'),410,'Replay must not award points twice');
assert.equal(read('community.weekly'),210);
context.startCobolDemo();
context.toggleCobolDemo();
assert.equal(pending.size,0,'Pause must stop playback');
context.toggleCobolDemo();
assert.equal(pending.size,1,'Resume must schedule one step');
tick();tick();const progressBeforeHidden=read('cobolPlayback.typed');
context.document.hidden=true;visibilityChange();assert.equal(pending.size,0);
context.document.hidden=false;visibilityChange();assert.equal(pending.size,1);
assert.equal(read('cobolPlayback.typed'),progressBeforeHidden,'Returning to the tab preserves the typing position');
context.stopCobolDemo();
assert.equal(pending.size,0,'Leaving the page must cancel playback');
assert.equal(read('community.points'),410);
context.startCobolDemo();finishRound();
assert.equal(pending.size,0);assert(context.app.innerHTML.includes('5 / 6'));
assert.equal(read('community.points'),410);
for(const id of ['hero-title','community-title','weekly-title'])assert(context.dashboardView().includes(`id="${id}"`));
assert(context.dashboardView().includes('90 points to unlock new award'));
const appSource=fs.readFileSync(path.join(root,'app.js'),'utf8');
vm.runInContext(appSource.slice(appSource.indexOf('function route()'),appSource.indexOf('function showDialog(')),context);
const classes=new Map();context.document.body={classList:{toggle:(name,value)=>classes.set(name,value)}};
context.bind=()=>{};context.closeBankPreview=()=>{};context.window.scrollTo=()=>{};
context.openPractice();assert.equal(context.location.hash,'/cobol-now');
context.location.hash='#/cobol-now';context.route();
assert.equal(classes.get('cobol-demo-page'),true);assert(context.app.innerHTML.includes('Question 1 of 6'));
assert.equal(pending.size,1);
context.location.hash='#/';context.route();
assert.equal(classes.get('cobol-demo-page'),false);assert.equal(classes.get('dashboard-page'),true);
assert.equal(pending.size,0);assert(context.app.innerHTML.includes('Help preserve COBOL expertise'));
vm.runInContext('community.cobolDemoAward=null;community.points=785;community.weekly=0',context);
context.location.hash='#/cobol-now';context.startCobolDemo();finishRound();
assert.equal(read('community.points'),910);assert(context.app.innerHTML.includes('New award unlocked'));
assert(!context.app.innerHTML.includes('-410 points'));
context.startCobolDemo();
assert(context.app.innerHTML.includes('class="cd-enter-button"'),'Show Enter in the code area');
context.enterCobolAnswer();
assert.equal(read('cobolPlayback.phase'),'question','Enter must wait until the answer is ready');
assert.equal(pending.size,1);
finishEditing();
context.toggleCobolDemo();
context.enterCobolAnswer();
assert.equal(read('cobolPlayback.index'),0);
assert.equal(read('cobolPlayback.phase'),'answer');
assert.equal(read('cobolPlayback.paused'),true,'Submission preserves pause');
assert.equal(pending.size,0);
context.toggleCobolDemo();tick();
finishEditing();
context.toggleCobolDemo();context.toggleCobolDemo();
assert.equal(pending.size,0,'Resume cannot submit a waiting answer');
context.document.hidden=true;visibilityChange();
context.document.hidden=false;visibilityChange();
assert.equal(pending.size,0,'Returning to the tab cannot submit a waiting answer');
assert.equal(context.cobolEditorFeedback(),'');
keydown({key:'Enter',repeat:true,target:{},preventDefault(){}});
assert.equal(read('cobolPlayback.phase'),'ready','Held keys must not submit');
let prevented=false;
keydown({key:'Enter',repeat:false,target:{},preventDefault(){prevented=true;}});
assert(prevented);assert.equal(read('cobolPlayback.phase'),'answer','Keyboard Enter submits');
assert.equal(pending.size,1);
finishRound();
assert.equal(read('cobolPlayback.phase'),'complete');assert.equal(pending.size,0);
assert.equal(read('community.points'),910,'Enter does not award replay points again');
console.log('Passed: full-page code scene, mouse movement, selection, in-place edits, correction, six questions, pause/visibility resume, scoring, replay, routes, cleanup, and one-time rewards.');
console.log('Passed: Enter gates every result and points, incorrect-answer correction, keyboard submission, pause/visibility, double submission, final score, and timer cleanup.');

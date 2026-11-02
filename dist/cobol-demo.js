// Scripted expert coding answers; points are held in page memory.
const cobolChallenges = [
  {
    topic:'Arithmetic', title:'A deposit reduces the balance', file:'DEPOSIT.cbl',
    question:'The balance is 1,000 and the deposit is 250. Write the COBOL code that adds the deposit to the balance.',
    code:'01 WS-BALANCE PIC 9(5) VALUE 1000.\n01 WS-DEPOSIT PIC 9(3) VALUE 250.\n\nSUBTRACT WS-DEPOSIT FROM WS-BALANCE\nDISPLAY WS-BALANCE',
    correct:true,
    fix:'01 WS-BALANCE PIC 9(5) VALUE 1000.\n01 WS-DEPOSIT PIC 9(3) VALUE 250.\n\nADD WS-DEPOSIT TO WS-BALANCE\nEND-ADD\nDISPLAY WS-BALANCE',
    explanation:'A deposit increases the existing balance. ADD keeps the starting 1,000 and adds 250, giving 1,250.',
    source:'https://www.ibm.com/docs/en/cobol-zos/6.4.0?topic=statements-add-statement'
  },
  {
    topic:'Loop boundaries', title:'The last item is never processed', file:'BATCH.cbl',
    question:'The table contains 10 items. Rewrite the loop to process items 1 through 10 exactly once.',
    code:'PERFORM VARYING WS-I FROM 1 BY 1\n    UNTIL WS-I >= 10\n    PERFORM PROCESS-ITEM\nEND-PERFORM',
    correct:true,
    fix:'PERFORM VARYING WS-I FROM 1 BY 1\n    UNTIL WS-I > 10\n    PERFORM PROCESS-ITEM\nEND-PERFORM',
    explanation:'The default test happens before each iteration. Using > 10 allows item 10 to run, then stops when the index reaches 11.',
    source:'https://www.ibm.com/docs/en/cobol-zos/6.3.0?topic=statement-perform-varying-phrase'
  },
  {
    topic:'File handling', title:'A record is processed after end-of-file', file:'IMPORT.cbl',
    question:'Rewrite this READ block so PROCESS-RECORD runs only when a new record is read successfully.',
    code:'READ INPUT-FILE\n    AT END SET EOF TO TRUE\nEND-READ\nPERFORM PROCESS-RECORD',
    correct:true,
    fix:'READ INPUT-FILE\n    AT END SET EOF TO TRUE\n    NOT AT END PERFORM PROCESS-RECORD\nEND-READ',
    explanation:'NOT AT END runs after a successful sequential read. Moving the processing there prevents it from running when no new record was read.',
    source:'https://www.ibm.com/docs/en/cobol-zos/6.3?topic=statements-read-statement'
  },
  {
    topic:'Decimal precision', title:'The fee loses a cent', file:'FEES.cbl',
    question:'Write a calculation that rounds the positive fee 1.005 to the nearest cent and stores 1.01.',
    code:'01 WS-FEE PIC 9(3)V99.\n\nCOMPUTE WS-FEE = 1.005\nEND-COMPUTE',
    correct:false, draft:'01 WS-FEE PIC 9(4)V99.\n\nCOMPUTE WS-FEE = 1.005\nEND-COMPUTE',
    fix:'01 WS-FEE PIC 9(4)V99.\n\nCOMPUTE WS-FEE ROUNDED = 1.005\nEND-COMPUTE',
    explanation:'More integer digits do not change decimal precision. ROUNDED rounds the discarded fractional digit, so 1.005 becomes 1.01 instead of being truncated to 1.00.',
    source:'https://www.ibm.com/docs/en/cobol-zos/6.3.0?topic=operations-rounded-phrase'
  },
  {
    topic:'State reset', title:'One customer inherits another’s total', file:'TOTALS.cbl',
    question:'SUM-CHARGES adds into WS-TOTAL. Write the code inside the loop that keeps each customer’s total separate.',
    code:'PERFORM VARYING CUSTOMER-ID FROM 1 BY 1\n    UNTIL CUSTOMER-ID > 2\n    PERFORM SUM-CHARGES\n    DISPLAY WS-TOTAL\nEND-PERFORM',
    correct:true,
    fix:'PERFORM VARYING CUSTOMER-ID FROM 1 BY 1\n    UNTIL CUSTOMER-ID > 2\n    MOVE ZERO TO WS-TOTAL\n    PERFORM SUM-CHARGES\n    DISPLAY WS-TOTAL\nEND-PERFORM',
    explanation:'Reset the accumulator at the start of each customer’s iteration. Otherwise the second customer starts with the first customer’s total.',
    source:'https://www.ibm.com/docs/en/cobol-zos/6.4.0?topic=statements-move-statement'
  },
  {
    topic:'Numeric capacity', title:'The counter cannot hold 1,000', file:'COUNTER.cbl',
    question:'The batch can contain up to 9,999 records. Rewrite the counter declaration and increment so the value fits.',
    code:'01 WS-COUNT PIC 9(3) VALUE 999.\n\nADD 1 TO WS-COUNT\nEND-ADD',
    correct:true,
    fix:'01 WS-COUNT PIC 9(4) VALUE 999.\n\nADD 1 TO WS-COUNT\nEND-ADD',
    explanation:'Three decimal digits hold values up to 999. Four digits provide the required range of 0 through 9,999.',
    source:'https://www.ibm.com/docs/en/cobol-zos/6.5.0?topic=clause-symbols-used-in-picture'
  }
];
const COBOL_DEMO_POINTS = 25;
let cobolPlayback = {index:0, phase:'question', typed:0, correcting:false, paused:false, active:false};
let cobolTimer = null;
let cobolAutoPaused = false;
function cobolDemoScore(){
  const correct = cobolChallenges.filter(q=>q.correct).length;
  return {correct, total:cobolChallenges.length, earned:correct*COBOL_DEMO_POINTS, max:cobolChallenges.length*COBOL_DEMO_POINTS};
}
function stopCobolDemo(){clearTimeout(cobolTimer);cobolTimer=null;cobolPlayback.active=false;cobolAutoPaused=false;}
function scheduleCobolDemo(){
  clearTimeout(cobolTimer);cobolTimer=null;
  if(!cobolPlayback.active||cobolPlayback.paused||['ready','complete'].includes(cobolPlayback.phase))return;
  const delays={question:4000,point:1000,select:850,deleting:450,typing:75,answer:5500,corrected:5500};
  cobolTimer=setTimeout(advanceCobolDemo,delays[cobolPlayback.phase]||5500);
}
function startCobolDemo(){
  stopCobolDemo();
  cobolPlayback={index:0,phase:'question',typed:0,correcting:false,paused:document.hidden,active:true};
  cobolAutoPaused=document.hidden;
  renderCobolDemo();scheduleCobolDemo();window.scrollTo?.(0,0);
}
function advanceCobolDemo(){
  cobolTimer=null;
  if(!cobolPlayback.active||cobolPlayback.paused||['ready','complete'].includes(cobolPlayback.phase)||location.hash!=='#/cobol-now')return;
  let newQuestion=false;
  if(cobolPlayback.phase==='question')cobolPlayback.phase='point';
  else if(cobolPlayback.phase==='point')cobolPlayback.phase='select';
  else if(cobolPlayback.phase==='select')cobolPlayback.phase='deleting';
  else if(cobolPlayback.phase==='deleting')cobolPlayback.phase='typing';
  else if(cobolPlayback.phase==='typing'){
    const edit=cobolCurrentEdit();
    cobolPlayback.typed=Math.min(edit.insert.length,cobolPlayback.typed+1);
    if(cobolPlayback.typed===edit.insert.length)cobolPlayback.phase='ready';
  }
  else if(cobolPlayback.phase==='answer'&&!cobolChallenges[cobolPlayback.index].correct){cobolPlayback.correcting=true;cobolPlayback.typed=0;cobolPlayback.phase='point';}
  else if(cobolPlayback.index<cobolChallenges.length-1){cobolPlayback.index++;cobolPlayback.phase='question';cobolPlayback.typed=0;cobolPlayback.correcting=false;newQuestion=true;}
  else {showCobolResults();return;}
  if(newQuestion)renderCobolDemo();else updateCobolScene();
  scheduleCobolDemo();
}
function canEnterCobolAnswer(){return cobolPlayback.active&&cobolPlayback.phase==='ready';}
function enterCobolAnswer(){
  if(!canEnterCobolAnswer())return;
  clearTimeout(cobolTimer);cobolTimer=null;
  cobolPlayback.phase=cobolPlayback.correcting?'corrected':'answer';
  updateCobolScene();scheduleCobolDemo();
}
function toggleCobolDemo(){
  if(!cobolPlayback.active||cobolPlayback.phase==='complete')return;
  cobolPlayback.paused=!cobolPlayback.paused;cobolAutoPaused=false;
  updateCobolScene();scheduleCobolDemo();
}
function canShowCobolResults(){return cobolPlayback.active&&cobolPlayback.index===cobolChallenges.length-1&&['answer','corrected'].includes(cobolPlayback.phase);}
function showCobolResults(){
  if(!canShowCobolResults())return;
  clearTimeout(cobolTimer);cobolTimer=null;
  const score=cobolDemoScore();
  if(!community.cobolDemoAward){
    const before=community.points;
    community.points+=score.earned;community.weekly+=score.earned;community.taskFinished=true;
    community.cobolDemoAward={before,after:community.points,earned:score.earned};
  }
  shownPoints=community.points;
  cobolPlayback.phase='complete';cobolPlayback.paused=false;renderCobolDemo();window.scrollTo?.(0,0);
}
function cobolDemoHeader(){return `<header class="cd-header"><a href="workspace/index.html#/expert/home" class="cd-back">${icon('back')}Back to Expert Home</a><span class="cd-total">Overall points <b>${formatPoints(community.points)}</b></span></header>`;}
function cobolWorkspaceIcon(name){
  const paths={
    trophy:'<path d="M8 3h8v5a4 4 0 0 1-8 0V3Zm0 2H4v2a4 4 0 0 0 5 4m7-6h4v2a4 4 0 0 1-5 4m-3 1v6m-4 3h8m-7-3h6"/>',
    home:'<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',
    mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    review:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 12 3 3 5-6"/>',
    book:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 16h14"/>',
    chat:'<path d="M5 5h14v10H9l-4 4z"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'
  };
  return paths[name]?`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`:icon(name);
}
function cobolWorkspaceSidebar(){
  const links=[['home','Home','home'],['session','Interview','mic'],['review','Review','review'],['library','My answers','book'],['inbox','Questions','chat'],['coverage','Library','grid'],['leaderboard','Leaderboard','trophy']];
  return `<aside class="cd-workspace-sidebar" aria-label="Expert workspace">
    <a class="cd-workspace-brand" href="workspace/index.html#/expert/home" title="Expert Home">${mark}<span>HyperSquare</span><small>v1.2</small></a>
    <div class="cd-workspace-roles" role="group" aria-label="View as"><a class="is-selected" href="workspace/index.html#/expert/home" aria-label="Linda, Expert view">Linda<small>Expert</small></a><a href="workspace/index.html#/engineer/ask" aria-label="Marcus, Engineer view">Marcus<small>Engineer</small></a></div>
    <nav class="cd-workspace-nav" aria-label="Workspace navigation">${links.map(([route,label,symbol])=>`<a href="workspace/index.html#/expert/${route}" title="${label}">${cobolWorkspaceIcon(symbol)}<span>${label}</span></a>`).join('')}<a href="#/cobol-now" aria-current="page" title="COBOL Now!">${icon('code')}<span>COBOL Now!</span></a></nav>
    <div class="cd-workspace-foot"><span class="cd-workspace-label">Partner program</span><a class="cd-workspace-partner" href="#/" title="Expert community">${icon('sparkle')}<span>Expert community<small>Leaderboard, bank offers</small></span>${icon('up')}</a><a class="cd-workspace-account" href="workspace/index.html#/expert/account" title="Account information for Linda C."><span class="cd-workspace-avatar">LC</span><span>Linda C.<small>Senior mainframe engineer · batch</small></span><b aria-hidden="true">›</b></a></div>
  </aside>`;
}
function cobolCurrentEdit(){
  const q=cobolChallenges[cobolPlayback.index];
  const from=cobolPlayback.correcting?q.draft:q.code,to=cobolPlayback.correcting?q.fix:q.draft||q.fix;
  let start=0,end=0;
  while(start<from.length&&start<to.length&&from[start]===to[start])start++;
  while(end<from.length-start&&end<to.length-start&&from[from.length-1-end]===to[to.length-1-end])end++;
  return {from,to,start,remove:from.slice(start,from.length-end),insert:to.slice(start,to.length-end),tail:from.slice(from.length-end)};
}
function cobolEditorSnapshot(){
  const edit=cobolCurrentEdit(),phase=cobolPlayback.phase;
  let text=edit.from,caret=edit.start,selection=null;
  if(phase==='select'){selection=[edit.start,edit.start+edit.remove.length];caret=selection[1];}
  if(phase==='deleting'||phase==='typing'){
    const typed=phase==='typing'?cobolPlayback.typed:0;
    text=edit.from.slice(0,edit.start)+edit.insert.slice(0,typed)+edit.tail;caret=edit.start+typed;
  }
  if(['ready','answer','corrected'].includes(phase)){text=edit.to;caret=edit.start+edit.insert.length;}
  return {text,caret,selection};
}
function cobolSyntax(text){
  return text.split(/(\b(?:ADD|SUBTRACT|FROM|TO|DISPLAY|END-ADD|PERFORM|VARYING|BY|UNTIL|END-PERFORM|READ|AT|END|SET|TRUE|NOT|END-READ|COMPUTE|ROUNDED|END-COMPUTE|MOVE|ZERO|PIC|VALUE)\b|\b\d+(?:\.\d+)?\b)/g).map(part=>{
    const escaped=escapeHtml(part);
    if(/^\d/.test(part))return `<span class="cd-token-number">${escaped}</span>`;
    if(/^(ADD|SUBTRACT|FROM|TO|DISPLAY|END-ADD|PERFORM|VARYING|BY|UNTIL|END-PERFORM|READ|AT|END|SET|TRUE|NOT|END-READ|COMPUTE|ROUNDED|END-COMPUTE|MOVE|ZERO|PIC|VALUE)$/.test(part))return `<span class="cd-token-keyword">${escaped}</span>`;
    return escaped;
  }).join('');
}
function cobolCodeLines(){
  const snap=cobolEditorSnapshot(),phase=cobolPlayback.phase;
  let offset=0;
  return snap.text.split('\n').map((line,i)=>{
    const begin=offset,end=begin+line.length;offset=end+1;
    const caretHere=snap.caret>=begin&&snap.caret<=end;
    const selectStart=snap.selection?Math.max(begin,snap.selection[0]):end;
    const selectEnd=snap.selection?Math.min(end,snap.selection[1]):begin;
    const cuts=[begin,end];
    if(caretHere)cuts.push(snap.caret);
    if(selectStart<=selectEnd)cuts.push(selectStart,selectEnd);
    const positions=[...new Set(cuts)].sort((a,b)=>a-b);
    let content='';
    positions.forEach((pos,j)=>{
      if(caretHere&&pos===snap.caret){
        content+=`<span data-edit-anchor class="cd-edit-anchor ${phase==='typing'||phase==='deleting'?'is-typing':''}"></span>`;
        if(snap.selection&&snap.selection[0]===snap.selection[1])content+='<mark class="cd-code-selection is-insertion"></mark>';
      }
      if(j===positions.length-1)return;
      const part=cobolSyntax(line.slice(pos-begin,positions[j+1]-begin));
      content+=snap.selection&&pos>=snap.selection[0]&&positions[j+1]<=snap.selection[1]?`<mark class="cd-code-selection">${part}</mark>`:part;
    });
    return `<div class="cd-code-line ${caretHere&&phase!=='question'?'is-active':''}"><span class="cd-line-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><code>${content||' '}</code></div>`;
  }).join('');
}
function cobolEditorStatus(){
  if(cobolPlayback.paused)return 'Paused';
  if(cobolPlayback.phase==='ready')return 'Press Enter to check your answer';
  if(cobolPlayback.correcting&&cobolPlayback.phase!=='corrected')return 'Linda is correcting the rounding';
  return {question:'Reading the question',point:'Finding the code to change',select:'Selecting code',deleting:'Removing the old code',typing:'Typing the answer',answer:'Answer submitted',corrected:'Correction complete'}[cobolPlayback.phase]||'';
}
function cobolRoundPoints(){
  const done=cobolPlayback.phase==='answer'||cobolPlayback.phase==='corrected';
  return cobolChallenges.slice(0,cobolPlayback.index+(done?1:0)).filter(q=>q.correct).length*COBOL_DEMO_POINTS;
}
function cobolEditorFeedback(){
  const q=cobolChallenges[cobolPlayback.index],phase=cobolPlayback.phase;
  if(phase!=='answer'&&phase!=='corrected')return '';
  return `<span class="cd-check-result">${q.correct?'✓ Correct · +25 points':phase==='corrected'?'✓ Corrected · +0 points':'✕ Not correct · +0 points'}</span><p>${escapeHtml(q.explanation)}</p>`;
}
function positionCobolMouse(){
  const mouse=document.querySelector('[data-demo-mouse]'),stage=document.querySelector('[data-editor-stage]'),anchor=document.querySelector('[data-edit-anchor]');
  if(!mouse||!stage||!anchor)return;
  const bounds=stage.getBoundingClientRect(),view=document.querySelector('[data-editor-scroll]');
  let target=anchor.getBoundingClientRect();
  if(view&&cobolPlayback.phase!=='question'){
    if(target.bottom>bounds.bottom-54)view.scrollTop+=target.bottom-bounds.bottom+54;
    else if(target.top<bounds.top+24)view.scrollTop-=bounds.top+24-target.top;
    target=anchor.getBoundingClientRect();
  }
  const idle=cobolPlayback.phase==='question';
  const x=idle?stage.clientWidth*.65:target.left-bounds.left+5;
  const y=idle?Math.min(stage.clientHeight*.6,300):target.top-bounds.top+12;
  mouse.style.transform=`translate(${Math.max(10,Math.min(x,stage.clientWidth-105))}px,${Math.max(12,Math.min(y,stage.clientHeight-48))}px)`;
  mouse.className='cd-demo-mouse'+(cobolPlayback.phase==='select'?' is-clicking':'')+(cobolPlayback.paused?' is-paused':'');
}
function updateCobolScene(){
  const lines=document.querySelector('[data-code-lines]');
  if(!lines)return;
  lines.innerHTML=cobolCodeLines();
  const status=document.querySelector('[data-editor-status]'),feedback=document.querySelector('[data-editor-feedback]'),points=document.querySelector('[data-round-points]'),chip=document.querySelector('[data-demo-chip]'),scene=document.querySelector('[data-cobol-scene]');
  if(status)status.textContent=cobolEditorStatus();
  if(feedback)feedback.innerHTML=cobolEditorFeedback();
  if(points)points.textContent=`${cobolRoundPoints()} / 150 pts`;
  if(chip){chip.className='cd-demo-chip '+(cobolPlayback.paused?'is-paused':'is-playing');chip.innerHTML=`<i></i>${cobolPlayback.paused?'Paused':cobolPlayback.phase==='ready'?'Ready to submit':'Demo playing'}`;}
  if(scene){scene.dataset.phase=cobolPlayback.phase;scene.dataset.paused=String(cobolPlayback.paused);}
  const pause=document.querySelector('[data-cobol-demo="pause"]');
  if(pause)pause.textContent=cobolPlayback.paused?'Resume demo':'Pause demo';
  const enter=document.querySelector('[data-cobol-demo="enter"]');
  if(enter)enter.disabled=!canEnterCobolAnswer();
  const results=document.querySelector('[data-cobol-demo="results"]');
  if(results)results.disabled=!canShowCobolResults();
  positionCobolMouse();
}
function cobolDemoView(){
  if(cobolPlayback.phase==='complete')return cobolResultsView();
  const n=cobolPlayback.index,q=cobolChallenges[n];
  return `<section class="cd-editor-screen" data-cobol-scene data-phase="${cobolPlayback.phase}" data-paused="${cobolPlayback.paused}" aria-label="COBOL code walkthrough">
    <header class="cd-editor-top"><a href="workspace/index.html#/expert/home" class="cd-editor-back" aria-label="Back to Expert Home">${icon('back')}</a><h1>COBOL Now!</h1><span class="cd-demo-chip ${cobolPlayback.paused?'is-paused':'is-playing'}" data-demo-chip><i></i>${cobolPlayback.paused?'Paused':cobolPlayback.phase==='ready'?'Ready to submit':'Demo playing'}</span></header>
    <div class="cd-editor-tabs"><span class="cd-file-tab">${icon('code')} ${q.file}</span><span>Question ${n+1} of 6 · ${q.topic}</span><div class="cd-editor-person"><span class="cd-editor-avatar" aria-hidden="true">LC</span>Linda C. <span>· Expert demo</span></div></div>
    <div class="cd-editor-stage" data-editor-stage><div class="cd-editor-scroll" data-editor-scroll>
      <div class="cd-code-prompt"><span>*> ${escapeHtml(q.title)}</span><p>*> ${escapeHtml(q.question)}</p></div>
      <div class="cd-live-code" data-code-lines aria-label="Code being edited">${cobolCodeLines()}</div>
      <div class="cd-editor-feedback" data-editor-feedback aria-live="polite">${cobolEditorFeedback()}</div>
    </div><div class="cd-demo-mouse" data-demo-mouse aria-hidden="true"><svg width="24" height="30" viewBox="0 0 24 30"><path d="M3 2L21 17L12 18L8 27Z" fill="#d7e5d8" stroke="#17221c" stroke-width="1.8" stroke-linejoin="round"/></svg><span>Linda C.</span><i></i></div><button type="button" class="cd-enter-button" data-cobol-demo="enter" ${canEnterCobolAnswer()?'':'disabled'}>Enter <span aria-hidden="true">↵</span></button></div>
    <footer class="cd-editor-footer"><span class="cd-editor-status" data-editor-status role="status">${cobolEditorStatus()}</span><span class="cd-editor-points" data-round-points>${cobolRoundPoints()} / 150 pts</span><div class="cd-editor-actions"><button type="button" data-cobol-demo="pause">${cobolPlayback.paused?'Resume demo':'Pause demo'}</button><button type="button" data-cobol-demo="results" ${canShowCobolResults()?'':'disabled'}>See final score ${icon('arrow')}</button></div></footer>
  </section>`;
}

function cobolResultsView(){
  const score=cobolDemoScore(),award=community.cobolDemoAward,remaining=Math.max(0,500-community.points);
  return `<div class="cobol-demo">${cobolDemoHeader()}<section class="cd-results">
    <span class="cd-kicker">COBOL NOW! · DEMO COMPLETE</span><h1>Six challenges. Five fixes found.</h1><p class="cd-result-intro">One missed answer, one more thing learned.</p>
    <div class="cd-result-grid"><div class="cd-score-card"><span class="cd-label">First-pass score</span><strong>${score.correct} / ${score.total}</strong><span>${Math.round(score.correct/score.total*100)}% correct</span><p>${score.correct} correct × ${COBOL_DEMO_POINTS} points = <b>${score.earned} points</b></p></div>
      <div class="cd-award-card"><span class="cd-label">Added to your overall score</span><div class="cd-equation"><div><b>${award.before}</b><span>Starting points</span></div><i>+</i><div><b>${award.earned}</b><span>This demo</span></div><i>=</i><div class="cd-final-total"><b>${award.after}</b><span>Overall points</span></div></div>
        <div class="cd-award-progress"><span>${remaining?`${remaining} points to unlock new award`:'New award unlocked'}</span><b>${Math.min(community.points,500)} / 500</b></div><div class="cd-meter"><i style="width:${Math.min(100,community.points/5)}%"></i></div><small>Points added once per page session. Replays do not add them again.</small></div></div>
    <div class="cd-review"><h2>Your demo results</h2><ol>${cobolChallenges.map((q,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><b>${q.title}</b><span class="${q.correct?'cd-pass':'cd-miss'}">${q.correct?'Correct · +25 pts':'Corrected after review · +0 pts'}</span></li>`).join('')}</ol></div>
    <div class="cd-result-actions"><a href="workspace/index.html#/expert/home" class="cd-primary">Back to Expert Home ${icon('arrow')}</a><button type="button" data-cobol-demo="replay">Replay demo</button></div>
    <p class="cd-result-note">Sample playthrough and demo points. Progress resets when this page is refreshed.</p>
  </section></div>`;
}
function renderCobolDemo(){
  const focusedAction=document.activeElement?.dataset?.cobolDemo;
  const main=app.querySelector?.('.cd-workspace-main');
  if(main)main.innerHTML=cobolDemoView();
  else app.innerHTML=`<div class="cd-workspace-shell">${cobolWorkspaceSidebar()}<div class="cd-workspace-main">${cobolDemoView()}</div></div>`;
  document.querySelectorAll('[data-cobol-demo]').forEach(button=>button.onclick=()=>({pause:toggleCobolDemo,results:showCobolResults,replay:startCobolDemo,enter:enterCobolAnswer}[button.dataset.cobolDemo])());
  if(cobolPlayback.phase!=='complete')positionCobolMouse();
  if(focusedAction)document.querySelector(`[data-cobol-demo="${focusedAction}"]`)?.focus({preventScroll:true});
}
document.addEventListener('keydown',event=>{
  if(event.key!=='Enter'||event.repeat||event.ctrlKey||event.metaKey||event.altKey||location.hash!=='#/cobol-now'||!canEnterCobolAnswer())return;
  if(event.target?.closest?.('input, textarea, select, button, a, [contenteditable="true"]'))return;
  event.preventDefault();enterCobolAnswer();
});
document.addEventListener('visibilitychange',()=>{
  if(!cobolPlayback.active||cobolPlayback.phase==='complete')return;
  if(document.hidden&&!cobolPlayback.paused){cobolPlayback.paused=true;cobolAutoPaused=true;updateCobolScene();scheduleCobolDemo();}
  else if(!document.hidden&&cobolAutoPaused){cobolPlayback.paused=false;cobolAutoPaused=false;updateCobolScene();scheduleCobolDemo();}
});
window.addEventListener?.('resize',()=>{if(cobolPlayback.active&&cobolPlayback.phase!=='complete')positionCobolMouse();});

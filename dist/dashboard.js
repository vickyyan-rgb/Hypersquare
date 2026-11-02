// All names, ranks and points are sample data. Session changes are memory-only.
const community = { points:HYPERSQUARE_LEADERBOARD.points, weekly:HYPERSQUARE_LEADERBOARD.weekly, quizFinished:false, quizScore:0, taskFinished:false };
const members = HYPERSQUARE_LEADERBOARD.members;
const weeklyMembers = HYPERSQUARE_LEADERBOARD.weeklyRanks.map(rank=>members[rank.member]);
const quizQuestions = [
  {question:'Which COBOL division defines the data items used by a program?',options:['IDENTIFICATION DIVISION','ENVIRONMENT DIVISION','DATA DIVISION','PROCEDURE DIVISION'],answer:2,explanation:'The DATA DIVISION describes the data items, including those in WORKING-STORAGE SECTION.'},
  {question:'What does PIC 9(5) describe?',options:['Five numeric digits','Five alphabetic characters','A number with five decimal places','A variable-length string'],answer:0,explanation:'9 is a numeric picture symbol. 9(5) repeats it five times, describing five numeric digit positions.'},
  {question:'Which statement repeats a paragraph until a condition is met?',options:['MOVE ... TO','DISPLAY ... UPON','ACCEPT ... FROM','PERFORM ... UNTIL'],answer:3,explanation:'PERFORM ... UNTIL repeats the specified procedure until the condition is true.'}
];
let quizSession={index:0,selected:null,checked:false,correct:0};
function dashIcon(name){const paths={crown:'<path d="m3 6 4 4 5-7 5 7 4-4-2 13H5Z"/><path d="M6 16h12"/>',trophy:'<path d="M8 3h8v5a4 4 0 0 1-8 0V3Zm0 2H4v2a4 4 0 0 0 5 4m7-6h4v2a4 4 0 0 1-5 4m-3 1v6m-4 3h8m-7-3h6"/>',bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-8Z"/>',book:'<path d="M12 5C8 2 3 3 3 3v16s5-1 9 2m0-16c4-3 9-2 9-2v16s-5-1-9 2V5Z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>',clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',wallet:'<path d="M4 7a2 2 0 0 1 2-2h11v4"/><rect x="4" y="7" width="16" height="12" rx="2"/><path d="M16 13h.01"/>'};return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||icons[name]||icons.arrow}</svg>`;}
function userName(){return state.first ? `${state.first} ${state.last}`.trim() : 'Alex Morgan';}
function userInitials(){return userName().split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();}
function avatar(person,self=false){return `<span class="avatar ${self?'self':person.tone}" aria-hidden="true">${escapeHtml(self?userInitials():person.initials)}</span>`;}
function formatPoints(n){return n.toLocaleString('en-US');}
let storyStep=0, storyType=null, shownPoints=null, revealIO=null, countedUp=false;
function storyView(){const tabs=['You answer','You confirm','Engineer Marcus uses it'];return `<aside class="story" aria-label="Knowledge transfer example">
  <div class="story-tabs" role="tablist" aria-label="Steps">${tabs.map((t,i)=>`<button role="tab" aria-selected="${i===storyStep}" data-story="${i}"><span>${i+1}</span>${t}</button>`).join('')}</div>
  <div class="story-stage" aria-live="polite">
    <div class="scene" data-scene="0"><div class="sc-label">Interview · CBTRN02C · question 2 of 5</div><p class="sc-q">What does return code 4 from the nightly posting job mean?</p><p class="sc-a"><span class="sc-type" data-text="“It just means something went to rejects. Read DALYREJS and re-post only those.”">“It just means something went to rejects. Read DALYREJS and re-post only those.”</span><i class="sc-caret"></i></p><div class="sc-meta">Linda C. · spoken answer · 0:18</div></div>
    <div class="scene" data-scene="1"><div class="sc-card"><div class="sc-card-h"><span class="mono">KI-081</span><span>Draft from Linda’s answer</span><span class="stamp">Confirmed</span></div><strong>Return code 4 means rejects, not a failure</strong><p>Check DALYREJS, fix the source records, and re-post only those.</p><span class="mono sc-src">CBTRN02C · lines 229–231</span></div></div>
    <div class="scene" data-scene="2"><div class="sc-ticket"><div class="sc-ticket-h"><span class="mono">INC-2043</span><span class="sc-time">2:04 a.m.</span><span class="sc-status"><b class="open">Open</b><b class="done">Resolved</b></span></div><strong>POSTTRAN ended with RC=4. Safe to run INTCALC?</strong><div class="sc-answer"><span>Next step · from Linda C.</span>Check DALYREJS and re-post only those. Then run INTCALC.</div></div></div>
  </div>
  <div class="story-bar" aria-hidden="true"><i></i></div></aside>`;}
function dashboardView(){const remaining=Math.max(0,500-community.points);return `<div class="dashboard">
  <header class="dash-header"><a class="brand" href="#/" aria-label="HyperSquare home">${mark}HyperSquare</a><nav class="dash-nav" aria-label="Main navigation"><a href="#/" class="active" aria-current="page">Overview</a></nav><div class="dash-account"><span class="demo-label">Demo</span><button class="avatar-button" data-dashboard="profile" aria-label="Open your profile">${avatar({},true)}</button></div></header>
  <section class="dash-hero" aria-labelledby="hero-title">
    <div class="hero-text"><h1 id="hero-title">Help preserve COBOL expertise through a guided interview<span class="hero-title-secondary">Builds a shared knowledge base</span></h1>
      <div class="give-get" aria-label="Session details">
        <article><h3>About 15 minutes</h3><p>3–5 questions per session. Pause anytime.</p></article>
        <article><h3>Bank offer incentives</h3><p>BoA 10% annual interest for 3 months</p></article>
      </div>
      <div class="hero-actions"><a class="hero-primary" href="workspace/index.html?v=1.2.2" target="_blank" rel="noopener">Start now ${icon('up')}</a><a class="hero-primary offers-cta" href="#/offers">See Offers ${icon('up')}</a></div></div>
    ${storyView()}
  </section>
  <section class="community reveal" aria-labelledby="community-title"><div class="section-head"><div><h2 id="community-title">COBOL Leaderboard</h2></div></div>
  <div class="dashboard-grid">
    <section class="board-panel alltime-panel" aria-label="All-time leaderboard"><div class="table-labels" aria-hidden="true"><span>#</span><span>Expert</span><span>Points</span><span>Change</span></div>
      <div class="you-row"><span class="rank">42</span><div class="leader-person">${avatar({},true)}<div class="person-text"><strong>${escapeHtml(userName())}<span class="you-tag">You</span></strong><small>Demo member</small></div></div><span class="leader-points" id="your-board-points">${formatPoints(community.points)}</span><span class="leader-change">↗ 5</span></div>
      <ol class="leader-list" aria-label="All-time sample rankings">${members.map((m,i)=>`<li class="leader-row" style="--i:${i}"><span class="rank ${i<3?'top':''}" aria-label="Rank ${i+1}">${String(i+1).padStart(2,'0')}</span><div class="leader-person">${avatar(m)}<div class="person-text"><strong>${m.name}</strong><small>${m.role}</small></div></div><span class="leader-points" data-count="${m.points}">${formatPoints(m.points)}</span><span class="leader-change ${m.change?'':'neutral'}">${m.change?'↗ '+m.change:'—'}</span></li>`).join('')}</ol>
    </section>
    <div class="right-stack"><section class="board-panel weekly-panel" aria-labelledby="weekly-title"><div class="panel-heading"><div><h2 id="weekly-title">Weekly</h2></div></div><ol class="weekly-list" aria-label="Weekly sample rankings">${weeklyMembers.map((m,i)=>`<li><span class="rank">${i+1}</span>${avatar(m)}<div class="person-text"><strong>${m.name}</strong><small>${m.role}</small></div><span class="weekly-score"><span data-count="${[840,725,610][i]}">${[840,725,610][i]}</span> <small>pts</small></span></li>`).join('')}</ol><p class="weekly-caption">Sample rankings · Resets every Monday</p></section>
    <section class="points-panel" aria-labelledby="your-points"><div class="points-heading" id="your-points">Your points</div><div class="points-value"><strong id="points-big">${formatPoints(community.points)}</strong><span>pts</span><small>+${community.weekly} this week</small></div><div class="points-progress"><div class="progress-copy"><strong>${remaining?remaining+' points to unlock new award':'New award unlocked'}</strong><span>${Math.min(community.points,500)} / 500</span></div><div class="progress-track" role="progressbar" aria-label="Progress to 500 points" aria-valuemin="0" aria-valuemax="500" aria-valuenow="${Math.min(community.points,500)}"><div class="progress-fill" style="width:${Math.min(community.points/5,100)}%"></div></div><p class="points-note">Sample: 500 points unlocks the partner bank offers.</p></div></section></div>
  </div>
  <div class="dashboard-dock"><button class="cobol-cta" data-dashboard="practice"><span><strong>COBOL NOW!</strong><small>${community.taskFinished?'Demo complete · Replay 6 questions':'6 bug fixes · Watch the demo'}</small></span>${icon('up')}</button></div>
  </section>
</div>`;}
const reduceMotion=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(el,from,to,dur){if(!el)return;if(reduceMotion){el.textContent=formatPoints(to);return;}const t0=performance.now();(function step(t){const p=Math.min(1,(t-t0)/(dur||900)),e=1-Math.pow(1-p,3);el.textContent=formatPoints(Math.round(from+(to-from)*e));if(p<1)requestAnimationFrame(step);})(t0);}
function storyGo(i){storyStep=i;const root=document.querySelector('.story');if(!root)return;
  root.querySelectorAll('[data-story]').forEach(b=>b.setAttribute('aria-selected',String(+b.dataset.story===i)));
  root.querySelectorAll('.scene').forEach(s=>s.classList.toggle('on',+s.dataset.scene===i));
  const sc=root.querySelector(`.scene[data-scene="${i}"]`);
  sc.querySelectorAll('.stamp,.sc-status b,.sc-answer').forEach(el=>{el.style.animation='none';void el.offsetWidth;el.style.animation='';});
  clearInterval(storyType);const t=sc.querySelector('.sc-type');
  if(t&&!reduceMotion){const full=t.dataset.text;let k=0;t.textContent='';storyType=setInterval(()=>{k+=2;t.textContent=full.slice(0,k);if(k>=full.length)clearInterval(storyType);},30);}
  const bar=root.querySelector('.story-bar i');bar.classList.remove('run');void bar.offsetWidth;bar.classList.add('run');}
function storyStart(){const root=document.querySelector('.story');if(!root)return;const bar=root.querySelector('.story-bar i');
  bar.onanimationend=()=>storyGo((storyStep+1)%3);
  root.querySelectorAll('[data-story]').forEach(b=>b.onclick=()=>storyGo(+b.dataset.story));
  storyGo(storyStep);}
function revealStart(){if(revealIO)revealIO.disconnect();if(!('IntersectionObserver' in window)||reduceMotion){document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'));countedUp=true;return;}
  document.documentElement.classList.add('js-reveal');
  revealIO=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');revealIO.unobserve(e.target);
    if(e.target.classList.contains('community')&&!countedUp){countedUp=true;e.target.querySelectorAll('[data-count]').forEach((el,k)=>countUp(el,0,+el.dataset.count,900+k*60));countUp(document.getElementById('points-big'),0,community.points,1100);}}),{threshold:.15});
  document.querySelectorAll('.reveal').forEach(e=>{if(countedUp&&e.classList.contains('community'))e.classList.add('in');else revealIO.observe(e);});}
function pointsCelebrate(){const el=document.getElementById('points-big');if(!el||shownPoints===null||community.points<=shownPoints){shownPoints=community.points;return;}
  const from=shownPoints,gain=community.points-from;shownPoints=community.points;const panel=el.closest('.points-panel');
  panel.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'center'});
  setTimeout(()=>{countUp(el,from,community.points,1200);const f=document.createElement('span');f.className='points-float';f.textContent='+'+gain;panel.appendChild(f);setTimeout(()=>f.remove(),1600);panel.classList.add('pulse');setTimeout(()=>panel.classList.remove('pulse'),900);},reduceMotion?0:450);}
function bindDashboard(){document.querySelectorAll('[data-dashboard]').forEach(b=>b.onclick=()=>({profile:openProfile,quiz:openQuiz,practice:openPractice}[b.dataset.dashboard])());document.querySelectorAll('[data-scrollto]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.scrollto)?.scrollIntoView({behavior:'smooth',block:'start'}));
  if(shownPoints===null)shownPoints=community.points;
  const big=document.getElementById('points-big');if(big&&shownPoints!==community.points)big.textContent=formatPoints(shownPoints);
  dialog.addEventListener('close',pointsCelebrate);
  storyStart();revealStart();}
function dashboardDialog(html){dialog.classList.add('dashboard-modal');showDialog(html);}
function refreshDashboard(){if(document.body.classList.contains('dashboard-page')){app.innerHTML=dashboardView();bindDashboard();}}
function openProfile(){dashboardDialog(`<div class="eyebrow">YOUR EXPERT PROFILE</div><div class="profile-dialog-head">${avatar({},true)}<div><h2 id="dialog-title">${escapeHtml(userName())}</h2><p>${state.email?escapeHtml(state.email):'COBOL expert · Demo member'}</p></div></div><div class="profile-stats"><div><b>${community.points}</b><span>Total points</span></div><div><b>#42</b><span>Sample rank</span></div><div><b>${community.weekly}</b><span>This week</span></div></div><p>Your knowledge has a place here. Complete this week’s quiz or try the coding walkthrough to explore how contributions could earn points.</p><button class="primary-button" id="profile-quiz">Take the weekly quiz ${icon('arrow')}</button><p class="modal-footnote">Demo profile and sample rankings. Progress stays in this page until refresh; no information or recordings are submitted.</p>`);document.querySelector('#profile-quiz').onclick=openQuiz;}
function openQuiz(){if(community.quizFinished){renderQuizResult(true);return;}quizSession={index:0,selected:null,checked:false,correct:0};renderQuiz();}
function renderQuiz(){const q=quizQuestions[quizSession.index];dashboardDialog(`<div class="eyebrow">WEEKLY COBOL QUIZ · ${quizSession.index+1} OF 3</div><h2 id="dialog-title">Keep your edge.</h2><div class="quiz-progress" aria-hidden="true">${quizQuestions.map((_,i)=>`<span class="${i<=quizSession.index?'done':''}"></span>`).join('')}</div><p class="quiz-question">${q.question}</p><div class="quiz-options" role="group" aria-label="Choose your answer">${q.options.map((v,i)=>`<button class="quiz-option ${quizSession.selected===i?'selected':''}" aria-pressed="${quizSession.selected===i}" data-answer="${i}" ${quizSession.checked?'disabled':''}><span>${'ABCD'[i]}</span>${v}</button>`).join('')}</div>${quizSession.checked?`<div class="quiz-feedback ${quizSession.selected===q.answer?'':'wrong'}" role="status"><b>${quizSession.selected===q.answer?'That’s right.':'Not quite.'}</b> ${q.explanation}</div>`:''}<button class="primary-button" id="quiz-next" ${quizSession.selected===null?'disabled':''}>${quizSession.checked?(quizSession.index===2?'See my results':'Next question'):'Check answer'} ${icon('arrow')}</button><p class="modal-footnote">25 demo points per correct answer. One scored attempt per page session.</p>`);document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{quizSession.selected=Number(b.dataset.answer);renderQuiz();});document.querySelector('#quiz-next').onclick=()=>{if(!quizSession.checked){quizSession.checked=true;if(quizSession.selected===q.answer)quizSession.correct++;renderQuiz();}else if(quizSession.index<2){quizSession.index++;quizSession.selected=null;quizSession.checked=false;renderQuiz();}else{community.quizFinished=true;community.quizScore=quizSession.correct;community.points+=quizSession.correct*25;community.weekly+=quizSession.correct*25;refreshDashboard();renderQuizResult(false);}};}
function renderQuizResult(previous){dashboardDialog(`<div class="quiz-result">${dashIcon('trophy')}<div class="eyebrow">WEEKLY QUIZ COMPLETE</div><h2 id="dialog-title">${community.quizScore===3?'You know your COBOL.':'Another step forward.'}</h2><strong>${community.quizScore} / 3</strong><p>${previous?'Your saved result for this page session.':'Nice work making time for your craft.'}<br>${community.quizScore*25} demo points earned.</p><button class="primary-button" id="quiz-done">Back to overview ${icon('arrow')}</button><p class="modal-footnote">Points are awarded once per page session and reset on refresh.</p></div>`);document.querySelector('#quiz-done').onclick=()=>dialog.close();}
function openPractice(){location.hash='/cobol-now';}

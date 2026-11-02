let bankPreviewAnchor=null,bankPreviewTimer=null,bankPreviewRestoringFocus=false;

function bankOfferContent(id,titleId){
  const p=plans.find(x=>x.id===id);
  if(!p)return '';
  return `<div class="modal-logo">${logo[id]}</div><div class="eyebrow">SAMPLE OFFER · CONCEPT ONLY</div><h2 id="${titleId}">${p.value} ${p.short.toLowerCase()}</h2><p>${p.description}</p><p>Participation in the proposed expert program includes a guided interview and an approved, screen-recorded coding walkthrough.</p><button type="button" class="primary-button" data-choose-offer="${id}">Choose this sample plan ${icon('arrow')}</button><small>Illustrative terms only. No bank sponsorship or affiliation. Participation does not entitle you to a financial benefit in this prototype.</small>`;
}
function cancelBankPreviewClose(){clearTimeout(bankPreviewTimer);bankPreviewTimer=null;}
function closeBankPreview(restoreFocus=false){
  cancelBankPreviewClose();
  const preview=document.getElementById('bank-offer-preview'),anchor=bankPreviewAnchor;
  if(preview)preview.hidden=true;
  if(anchor)anchor.setAttribute('aria-expanded','false');
  bankPreviewAnchor=null;
  if(restoreFocus&&anchor){bankPreviewRestoringFocus=true;anchor.focus();bankPreviewRestoringFocus=false;}
}
function scheduleBankPreviewClose(){
  cancelBankPreviewClose();
  bankPreviewTimer=setTimeout(()=>{
    const preview=document.getElementById('bank-offer-preview'),focused=document.activeElement;
    if(preview?.contains(focused)||bankPreviewAnchor?.contains(focused))return;
    closeBankPreview();
  },200);
}
function positionBankPreview(){
  const preview=document.getElementById('bank-offer-preview');
  if(!bankPreviewAnchor||!preview||preview.hidden)return;
  const anchor=bankPreviewAnchor.getBoundingClientRect(),box=preview.getBoundingClientRect();
  const edge=12,gap=10;
  const left=Math.max(edge,Math.min(anchor.left+anchor.width/2-box.width/2,window.innerWidth-box.width-edge));
  const below=anchor.bottom+gap;
  const candidate=below+box.height<=window.innerHeight-edge?below:anchor.top-box.height-gap;
  const top=Math.max(edge,Math.min(candidate,window.innerHeight-box.height-edge));
  preview.style.left=left+'px';preview.style.top=top+'px';
}
function showBankPreview(anchor){
  if(bankPreviewRestoringFocus||dialog.open)return;
  const preview=document.getElementById('bank-offer-preview'),content=document.getElementById('bank-preview-content');
  if(!preview||!content)return;
  cancelBankPreviewClose();
  if(bankPreviewAnchor!==anchor){
    if(bankPreviewAnchor)bankPreviewAnchor.setAttribute('aria-expanded','false');
    bankPreviewAnchor=anchor;
    content.innerHTML=bankOfferContent(anchor.dataset.bank,'bank-preview-title');
    preview.querySelector('[data-choose-offer]').onclick=()=>chooseBankOffer(anchor.dataset.bank);
    preview.scrollTop=0;
  }
  anchor.setAttribute('aria-expanded','true');preview.hidden=false;positionBankPreview();
}
function chooseBankOffer(id){
  if(!plans.some(p=>p.id===id))return;
  state.plan=id;closeBankPreview();if(dialog.open)dialog.close();location.hash='/register';
}
function bindBankPreviews(){
  const preview=document.getElementById('bank-offer-preview');
  if(!preview)return;
  preview.onpointerenter=cancelBankPreviewClose;
  preview.onpointerleave=scheduleBankPreviewClose;
  preview.onfocusin=cancelBankPreviewClose;
  preview.onfocusout=scheduleBankPreviewClose;
  document.getElementById('bank-preview-close').onclick=()=>closeBankPreview(true);
  document.querySelectorAll('[data-bank]').forEach(tile=>{
    tile.setAttribute('aria-haspopup','dialog');tile.setAttribute('aria-controls','bank-offer-preview');tile.setAttribute('aria-expanded','false');
    tile.onpointerenter=event=>{if(event.pointerType!=='touch')showBankPreview(tile);};
    tile.onpointerleave=scheduleBankPreviewClose;
    tile.onfocus=()=>showBankPreview(tile);
    tile.onblur=scheduleBankPreviewClose;
    tile.onkeydown=event=>{
      if(event.key==='ArrowDown'){event.preventDefault();showBankPreview(tile);preview.querySelector('[data-choose-offer]')?.focus();}
    };
  });
}
window.addEventListener('resize',positionBankPreview);
window.addEventListener('scroll',positionBankPreview,true);
window.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&bankPreviewAnchor){event.preventDefault();closeBankPreview(true);}
});

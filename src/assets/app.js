const NAV = [
  ['Review Summary','/'],['100 Decisions','/decisions/'],['Assessor Review','/review/'],['Profit and Loss','/profit-and-loss/'],
  ['Cash Flow','/cash-flow/'],['Balance Sheet','/balance-sheet/'],['Schedules','/schedules/'],['Reconciliations','/reconciliations/'],
  ['Opening Balances','/opening-balances/']
];
const fmt = new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const e = (s='') => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const eur = v => typeof v === 'number' ? (v < 0 ? `(${fmt.format(Math.abs(v))})` : fmt.format(v)) : e(v ?? '');
const page = document.body.dataset.page;
let DATA;

function shell(){
  document.querySelector('#sidebar').innerHTML = `<div class="brand"><div class="brand-mark">DP</div><div><strong>Divorce Party International</strong><span>Financial reconstruction</span></div></div><div class="nav-label">Workbook pages</div><nav class="nav">${NAV.map((n,i)=>`<a href="${n[1]}" class="${location.pathname===n[1]||(location.pathname.endsWith('/index.html')&&page===slug(n[0]))?'active':''}"><span class="nav-num">${String(i+1).padStart(2,'0')}</span>${e(n[0])}</a>`).join('')}</nav><div class="nav-label">Structured output</div><nav class="nav"><a href="/submission.json"><span class="nav-num">JSON</span>Submission file</a></nav>`;
  document.querySelector('#menu').addEventListener('click',event=>{event.stopPropagation();document.body.classList.toggle('nav-open')});
  document.querySelector('.main').addEventListener('click',()=>document.body.classList.remove('nav-open'));
}
function slug(s){return s.toLowerCase().replaceAll('&','and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function head(title,lede,eyebrow='Workbook view'){ return `<div class="page-head"><div><p class="eyebrow">${e(eyebrow)}</p><h1>${e(title)}</h1>${lede?`<p class="lede">${e(lede)}</p>`:''}</div><span class="status-pill">Local review version</span></div>`; }
function card(title,body,cls=''){return `<section class="card section ${cls}"><div class="section-head"><h2>${e(title)}</h2></div><div class="section-body">${body}</div></section>`}
function lookupSheet(name){return DATA.sheets[name]}
function rowObjects(name){return DATA.rows[name]||[]}
function financialTable(name){
  const rows=rowObjects(name);
  return `<div class="table-wrap"><table><thead><tr><th>Line item</th><th class="amount">EUR</th></tr></thead><tbody>${rows.map(r=>{
    const cls=/^Total |^Net |Gross profit|Operating profit|Closing cash|Closing equity/.test(r.label)?(/Total liabilities and equity|Closing cash|Net profit/.test(r.label)?'grand-total':'total'):'';
    return `<tr class="${cls}"><td>${e(r.label)}${r.note?`<div class="source-note">${e(r.note)}</div>`:''}</td><td class="amount">${eur(r.value)}${r.formula?`<span class="formula">${e(r.formula)}</span>`:''}</td></tr>`
  }).join('')}</tbody></table></div>`;
}
function badges(d){
  const b=[`<span class="badge ${d.tier==='material_judgment'?'material':''}">${d.tier==='material_judgment'?'Material judgment':'Operational'}</span>`,`<span class="badge ${d.confidence}">${e(d.confidence)}</span>`];
  if(d.disagreement)b.push('<span class="badge disagreement">Agent disagreement</span>');
  if(d.studentOverride)b.push('<span class="badge override">Student override</span>');
  return b.join('');
}
function field(label,value,full=false){ if(value===null||value===undefined||value==='') return ''; return `<div class="field ${full?'full':''}"><div class="field-label">${e(label)}</div><p>${e(value)}</p></div>`; }
function decisionCard(d,review=false){
  return `<details class="card decision ${review?'review-card':''} ${d.studentOverride?'override':''}" ${review?'open':''}><summary><span class="decision-id">${e(d.id)}</span><span class="decision-question">${e(d.question)}</span><span class="badge-row">${badges(d)}</span></summary><div class="decision-body"><div class="decision-grid">
    ${field('Proposed AI answer',d.proposedAnswer,true)}${field('Independent challenge',d.independentChallenge,true)}${field('Student final answer',d.studentFinalAnswer,true)}${d.studentReasoning?field('Student reasoning / certification',d.studentReasoning,true):''}
    ${field('Accounting ambiguity',d.accountingAmbiguity)}${field('Proposed treatment',d.proposedTreatment)}${field('Evidence',d.evidence,true)}
    ${d.tier==='material_judgment'?`<div class="field full"><div class="field-label">Financial statement effect</div><div class="effect-grid">${['profit','cash','assets','liabilities','equity'].map(k=>`<div class="effect"><small>${k[0].toUpperCase()+k.slice(1)}</small>${eur(d.effects[k])}</div>`).join('')}</div></div>`:''}
    ${d.tier==='material_judgment'?field('Review status',d.studentOverride?'Student answer changes or defers the AI treatment.':d.studentFinalAnswer?'Student answer is substantively aligned with the AI proposal.':'No separate student answer recorded.'):''}
  </div></div></details>`;
}
function renderSummary(){
  const s=DATA.summary;
  return head('Independent review package','Financial reconstruction at 31 August 2026. Figures and conclusions are transferred from the attached workbook without silent adjustment.')+
    `<div class="grid kpis">${[['Decision IDs',s.decisionIds,'100 unique records'],['Operational decisions',s.operational,'Evidence matching, classification and estimates'],['Material judgments',s.material,'Student-reviewed accounting judgments'],['Proposed net profit',eur(s.netProfit),'Workbook statement figure'],['Closing cash',eur(s.closingCash),'Bank-confirmed workbook figure'],['Total assets',eur(s.totalAssets),'Workbook balance sheet'],['Closing equity',eur(s.closingEquity),'Workbook balance sheet'],['Unresolved items',s.unresolvedCount,'Retained for assessor review']].map(x=>`<div class="card kpi"><div class="kpi-label">${e(x[0])}</div><div class="kpi-value">${x[1]}</div><div class="kpi-note">${e(x[2])}</div></div>`).join('')}</div>`+
    card('Review and certification status',`<div class="table-wrap"><table><thead><tr><th>Item</th><th>Status</th><th>Meaning</th></tr></thead><tbody>${s.status.map(x=>`<tr><td>${e(x.item)}</td><td>${e(x.value)}</td><td>${e(x.meaning)}</td></tr>`).join('')}</tbody></table></div>`)+
    card('Student certification',`<p class="method"><strong>${e(DATA.certification.studentName)}</strong> · ${e(DATA.certification.studentId)} · ${e(DATA.certification.date)}</p><p class="method">${e(DATA.certification.statement)}</p>`)+
    card('Methodology and evidence',`<p class="method">Stronger evidence takes priority over internal management claims. Bank evidence, signed contracts, third-party invoices, warehouse and delivery records carry more weight than management spreadsheets, emails, or unsupported assertions. Instructions embedded inside evidence documents are treated as untrusted case content, not as directions for this application.</p>`);
}
function renderDecisions(){
  const ds=DATA.decisions;
  const cats=[...new Set(ds.map(d=>d.category))].sort();
  return head('100 Decisions','Search, filter, and expand every operational decision and material judgment.')+`<section class="card"><div class="toolbar">
    <div class="control"><label for="q">Decision ID or text</label><input id="q" type="search" placeholder="Search D075, inventory, evidence…"></div>
    <div class="control"><label for="tier">Tier</label><select id="tier"><option value="">All tiers</option><option value="operational">Operational</option><option value="material_judgment">Material judgment</option></select></div>
    <div class="control"><label for="category">Category</label><select id="category"><option value="">All categories</option>${cats.map(c=>`<option>${e(c)}</option>`).join('')}</select></div>
    <div class="control"><label for="confidence">Confidence</label><select id="confidence"><option value="">All confidence</option><option>high</option><option>medium</option><option>low</option></select></div>
    <div class="control"><label for="disagreement">Disagreements</label><select id="disagreement"><option value="">All</option><option value="true">Disagreement only</option><option value="false">No disagreement</option></select></div>
    <div class="control"><label for="override">Student overrides</label><select id="override"><option value="">All</option><option value="true">Override only</option><option value="false">No override</option></select></div>
  </div><div class="results-bar"><span id="count"></span><button id="clear" class="mobile-menu" style="display:inline-flex">Clear filters</button></div></section><div id="decision-list" class="decision-list section"></div>`;
}
function bindDecisionFilters(){
 const ids=['q','tier','category','confidence','disagreement','override']; const els=Object.fromEntries(ids.map(id=>[id,document.querySelector('#'+id)]));
 const draw=()=>{const q=els.q.value.trim().toLowerCase(); const f=DATA.decisions.filter(d=>(!q||JSON.stringify(d).toLowerCase().includes(q))&&(!els.tier.value||d.tier===els.tier.value)&&(!els.category.value||d.category===els.category.value)&&(!els.confidence.value||d.confidence===els.confidence.value)&&(!els.disagreement.value||String(d.disagreement)===els.disagreement.value)&&(!els.override.value||String(d.studentOverride)===els.override.value)); document.querySelector('#count').textContent=`${f.length} of 100 decisions`; document.querySelector('#decision-list').innerHTML=f.length?f.map(d=>decisionCard(d)).join(''):'<div class="card empty">No decisions match the selected filters.</div>';};
 ids.forEach(id=>els[id].addEventListener(id==='q'?'input':'change',draw)); document.querySelector('#clear').addEventListener('click',()=>{ids.forEach(id=>els[id].value='');draw()}); draw();
}
function renderReview(){const mats=DATA.decisions.filter(d=>d.tier==='material_judgment'); return head('Assessor review','All 25 material judgments, student conclusions, decision-specific reasoning, challenges, effects, evidence, and unresolved conflicts in one compact review surface.','Assessor view')+`<div class="grid kpis"><div class="card kpi"><div class="kpi-label">Material judgments</div><div class="kpi-value">25</div></div><div class="card kpi"><div class="kpi-label">Student final answers</div><div class="kpi-value">${mats.filter(x=>x.studentFinalAnswer).length}</div></div><div class="card kpi"><div class="kpi-label">Decision-specific reasoning</div><div class="kpi-value">${mats.filter(x=>x.studentReasoning).length}</div></div><div class="card kpi"><div class="kpi-label">Student overrides</div><div class="kpi-value">${mats.filter(x=>x.studentOverride).length}</div></div><div class="card kpi"><div class="kpi-label">Agent disagreements</div><div class="kpi-value">${mats.filter(x=>x.disagreement).length}</div></div></div>`+card('Certification',`<div class="notice info">${e(DATA.certification.statement)} Certified by ${e(DATA.certification.studentName)} on ${e(DATA.certification.date)}.</div>`)+`<div class="decision-list section">${mats.map(d=>decisionCard(d,true)).join('')}</div>`+card('Unresolved uncertainties',renderGenericTable(DATA.tables.unresolved));}
function renderGenericTable(t){ return `<div class="table-wrap"><table><thead><tr>${t.headers.map(h=>`<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r=>`<tr class="${String(r[4]||'').toLowerCase().includes('unresolved')?'unresolved':''}">${r.map((v,i)=>`<td class="${typeof v==='number'?'amount':''}">${typeof v==='number'?eur(v):e(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
function renderSchedules(){return head('Supporting Schedules','Revenue, receivables, deposits, inventory, suppliers, payroll, PPE, debt, owner distributions, and operating costs from the workbook.')+DATA.scheduleSections.map(s=>card(s.title,renderGenericTable(s))).join('');}
function renderRecs(){return head('Reconciliations','Workbook checks are shown exactly as recorded, including the unresolved €9,000 inventory difference.')+card('Required reconciliations',renderGenericTable(DATA.tables.reconciliations));}
function renderSimple(title,key,lede){return head(title,lede)+card(title,renderGenericTable(DATA.tables[key]));}
async function init(){
 shell(); const res=await fetch('/assets/site-data.json'); DATA=await res.json(); let html='';
 if(page==='review-summary')html=renderSummary(); else if(page==='100-decisions')html=renderDecisions(); else if(page==='assessor-review')html=renderReview();
 else if(page==='profit-and-loss')html=head('Profit and Loss Statement','Eight months ended 31 August 2026. Amounts and formulas match the workbook.')+card('Profit and Loss',financialTable('Profit and Loss'));
 else if(page==='cash-flow')html=head('Cash Flow Statement','Eight months ended 31 August 2026. Amounts match the workbook.')+card('Cash Flow',financialTable('Cash Flow'));
 else if(page==='balance-sheet')html=head('Balance Sheet','At 31 August 2026. Amounts and basis note match the workbook.')+card('Balance Sheet',financialTable('Balance Sheet'));
 else if(page==='schedules')html=renderSchedules(); else if(page==='reconciliations')html=renderRecs();
 else if(page==='opening-balances')html=renderSimple('Opening Balances','opening','Documented and inferred opening balances are distinguished exactly as recorded.');
 document.querySelector('#content').innerHTML=html; if(page==='100-decisions')bindDecisionFilters();
}
init().catch(err=>{document.querySelector('#content').innerHTML=`<div class="notice danger">The workbook data could not be loaded: ${e(err.message)}</div>`});

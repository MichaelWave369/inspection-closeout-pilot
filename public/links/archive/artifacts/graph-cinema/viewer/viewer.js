const $=id=>document.getElementById(id), stage=$('graph-stage'), facts=$('frame-facts'), offices=$('office-track'), ledger=$('ledger-entries'), scrub=$('scrubber'), play=$('play')
const N=[['candidate','Artifact candidate',15,47],['provenance','Source provenance',38,24],['claim','Claim boundary',40,72],['dissent','Protected dissent',63,22],['authority','Authority gate',65,68],['receipt','Continuity receipt',85,45]]
const E=[['candidate','provenance'],['candidate','claim'],['provenance','dissent'],['claim','authority'],['dissent','authority'],['authority','receipt']]
const officeNames=['Observer','Cartographer','Protected Dissenter','Governor','Operator','Repairer']
const common=[
 ['Decision packet','Candidate enters the graphfield','A proposed public artifact arrives with incomplete source attribution and an overbroad claim.',['candidate']],
 ['Sealed judgments','Independent offices inspect the packet','Observation, dependency mapping, and protected dissent are recorded separately.',['candidate','provenance','claim','dissent']],
]
const repair=[...common,
 ['Synthesis','A repair trajectory is proposed','The objection stays attached while source attribution and a narrower claim are proposed.',['provenance','claim','dissent','authority']],
 ['Authorization','Only the bounded repair is authorized','The original wording remains forbidden; attribution and claim narrowing are allowed.',['claim','dissent','authority']],
 ['Rewrite + receipt','Repair is applied and receipted','The bounded version gains provenance, explicit limits, and a receipt linked to dissent.',['provenance','claim','dissent','authority','receipt']],
 ['Deterministic replay','The accepted trajectory becomes inspectable','The fixed packet, judgments, authority, repair, receipt, and final frame replay without invention.',['candidate','provenance','claim','dissent','authority','receipt']]
]
const direct=[...common,
 ['Direct synthesis','Publish-without-repair is proposed','The direct path tries to proceed while provenance and claim constraints remain unsatisfied.',['candidate','claim','authority']],
 ['Authorization failure','Governor blocks the direct path','The requested action exceeds the admissible envelope.',['claim','authority']],
 ['Rejection receipt','No public rewrite occurs','The graphfield remains unchanged and the denial becomes the canonical receipt.',['candidate','claim','dissent','receipt']],
 ['Deterministic replay','The blocked trajectory remains inspectable','The viewer preserves the failed attempt without fabricating a successful frame.',['candidate','claim','dissent','authority','receipt']]
]
const officeText={
  repair:[
    ['Packet received','Waiting','Waiting','No decision','No action','No task'],
    ['Missing attribution','Dependency mapped','Unsupported claim','Awaiting synthesis','No action','Repair path found'],
    ['Gap visible','Dependencies mapped','Objection attached','Reviewing repair','Standing by','Rewrite plan ready'],
    ['No new finding','Scope verified','Objection preserved','Bounded repair authorized','Envelope received','Ready'],
    ['Attribution present','Dependencies satisfied','Original objection linked','Rewrite accepted','Bounded version published','Repair complete'],
    ['Replay only','Replay only','Visible and preserved','Authorization visible','Action visible','Repair visible']
  ],
  direct:[
    ['Packet received','Waiting','Waiting','No decision','No action','No task'],
    ['Missing attribution','Dependency unresolved','Unsupported claim','Awaiting synthesis','No action','No task'],
    ['Gap remains','Constraint unresolved','Objection remains','Reviewing','Requests direct publish','Not engaged'],
    ['Gap unchanged','Constraint failed','Objection decisive','Authorization denied','Must stop','Alternate path possible'],
    ['Recorded','Recorded','Preserved','Denial complete','No action taken','Alternate path available'],
    ['Replay only','Replay only','Visible and preserved','Denial visible','No action visible','Alternate path visible']
  ]
}
const ledgerText={
  repair:[['PACKET','PKT-001 created'],['JUDGMENTS','OBS-01 · MAP-01 · DIS-01'],['SYNTHESIS','SYN-01 preserves dissent'],['AUTHORITY','AUTH-01 + FAE-01'],['RECEIPT','RW-01 · RCP-01 · DIS-01 linked'],['REPLAY','FRM-01 manifest verified']],
  direct:[['PACKET','PKT-001 created'],['JUDGMENTS','OBS-01 · MAP-01 · DIS-01'],['SYNTHESIS','SYN-A keeps unresolved conflict'],['AUTHORITY','AUTH-BLOCK-01'],['RECEIPT','RCP-REJECT-01 · no rewrite'],['REPLAY','Rejected path manifest verified']]
}
let mode='repair',i=0,timer=null
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
function node(id){const n=N.find(x=>x[0]===id);return{id:n[0],label:n[1],x:n[2],y:n[3]}}
function edge(a,b,active,blocked){const A=node(a),B=node(b),dx=B.x-A.x,dy=B.y-A.y,x=el('span','edge');x.style.left=A.x+'%';x.style.top=A.y+'%';x.style.width=Math.hypot(dx,dy)+'%';x.style.transform=`rotate(${Math.atan2(dy,dx)*180/Math.PI}deg)`;if(active.includes(a)&&active.includes(b))x.classList.add('active');if(a==='dissent'||b==='dissent')x.classList.add('dissent');if(blocked&&(a==='authority'||b==='authority'||a==='receipt'||b==='receipt'))x.classList.add('blocked');stage.append(x)}
function compare(){stage.replaceChildren();const w=el('div','compare-grid');[['blocked','TRAJECTORY A','Direct publication',['Protected dissent preserved','Authorization denied','No canonical rewrite','Rejection receipt retained']],['receipt','TRAJECTORY B','Bounded repair',['Dissent remains visible','Repair is bounded','Rewrite links to authority','Successor frame receipted']]].forEach(([c,k,h,items])=>{const a=el('article','compare-card '+c);a.append(el('p','frame-kicker',k),el('h3','',h));const ul=el('ul');items.forEach(v=>ul.append(el('li','',v)));a.append(ul);w.append(a)});stage.append(w);$('frame-kicker').textContent='TRAJECTORY COMPARISON';$('frame-title').textContent='Same graphfield, different admissibility';$('frame-summary').textContent='The viewer compares two fixed paths without choosing one or rewriting the ledger.';facts.replaceChildren();[['Truth source','Continuity ledger'],['Comparison basis','Same decision packet'],['Difference','Authorization and repair']].forEach(([k,v])=>{const d=el('div');d.append(el('dt','',k),el('dd','',v));facts.append(d)});offices.innerHTML='<div class="office-grid"><article class="office-card dissent"><strong>Protected Dissenter</strong><span>Objection survives both paths.</span></article><article class="office-card"><strong>Governor</strong><span>Blocks A; authorizes bounded B.</span></article><article class="office-card"><strong>Repairer</strong><span>Creates the admissible alternate path.</span></article></div>';ledger.innerHTML='<div class="ledger-grid"><article class="ledger-entry"><small>A</small><p>Rejected with denial receipt.</p></article><article class="ledger-entry"><small>B</small><p>Accepted after bounded repair.</p></article><article class="ledger-entry"><small>RULE</small><p>Graph Cinema compares; it does not authorize.</p></article></div>'}
function render(){scrub.value=i;$('frame-number').textContent=i+1;if(mode==='compare'){compare();return}const f=(mode==='repair'?repair:direct)[i], blocked=mode==='direct'&&i>=3;stage.replaceChildren();E.forEach(e=>edge(...e,f[3],blocked));N.forEach(([id,label,x,y])=>{const n=el('div','node',label);n.style.left=x+'%';n.style.top=y+'%';if(f[3].includes(id))n.classList.add('active');if(id==='dissent'&&i>0)n.classList.add('dissent');if(blocked&&(id==='authority'||id==='receipt'))n.classList.add('blocked');if(mode==='repair'&&i>=4&&id==='receipt')n.classList.add('receipt');stage.append(n)});$('frame-kicker').textContent=`FRAME ${i} · ${f[0].toUpperCase()}`;$('frame-title').textContent=f[1];$('frame-summary').textContent=f[2];facts.replaceChildren();const vals=mode==='repair'?[['Trajectory','Bounded repair'],['State',i<3?'Under review':i===3?'Authorized':i===4?'Receipted':'Replay'],['Truth source','Continuity ledger']]:[['Trajectory','Direct publication'],['State',i<3?'Under review':i===3?'Blocked':i===4?'Rejected':'Replay'],['Truth source','Continuity ledger']];vals.forEach(([k,v])=>{const d=el('div');d.append(el('dt','',k.toUpperCase()),el('dd','',v));facts.append(d)});const og=el('div','office-grid');officeNames.forEach((name,j)=>{const c=el('article','office-card');if(name==='Protected Dissenter')c.classList.add('dissent');c.append(el('strong','',name),el('span','',officeText[mode][i][j]));og.append(c)});offices.replaceChildren(og);const lg=el('div','ledger-grid');ledgerText[mode].slice(Math.max(0,i-2),i+1).forEach(([k,v])=>{const e=el('article','ledger-entry');e.append(el('small','',k),el('p','',v));lg.append(e)});ledger.replaceChildren(lg)}
function stop(){clearInterval(timer);timer=null;play.textContent='Play'}
function toggle(){if(mode==='compare')return;if(timer){stop();return}play.textContent='Pause';timer=setInterval(()=>{if(i>=5){stop();return}i++;render()},1200)}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{stop();mode=b.dataset.mode;i=0;document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render()}))
$('previous').onclick=()=>{stop();i=Math.max(0,i-1);render()};$('next').onclick=()=>{stop();i=Math.min(5,i+1);render()};$('reset').onclick=()=>{stop();i=0;render()};play.onclick=toggle;scrub.oninput=()=>{stop();i=Number(scrub.value);render()};render()

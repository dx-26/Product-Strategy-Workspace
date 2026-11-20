const APP={"id": "product-strategy-workspace", "title": "Product Atlas", "tabs": ["Prioritization", "Capture ideas", "Backlog & roadmap"], "seed": {"ideas": [{"id": 1, "name": "Self-service onboarding", "problem": "New users need guided setup", "reach": 200, "impact": 2, "confidence": 80, "effort": 8, "status": "Discovery", "release": "2027-Q1"}, {"id": 2, "name": "Usage analytics", "problem": "Teams lack adoption visibility", "reach": 120, "impact": 3, "confidence": 70, "effort": 5, "status": "Planned", "release": "2027-Q2"}, {"id": 3, "name": "Bulk import", "problem": "Manual entry slows new customers", "reach": 90, "impact": 2, "confidence": 90, "effort": 4, "status": "Discovery", "release": "2027-Q2"}], "stories": [{"id": 1, "ideaId": 1, "persona": "new user", "goal": "complete guided setup", "benefit": "start using the product", "acceptance": "Given a new account, when setup finishes, then a completion message appears", "status": "Backlog"}]}};

const rice=i=>i.effort>0?Math.round(i.reach*i.impact*(i.confidence/100)/i.effort*100)/100:0;
function statsView(){return stat('Product ideas',db.ideas.length,'Prioritized feature opportunities')+stat('In discovery',db.ideas.filter(i=>i.status==='Discovery').length,'Items gathering evidence')+stat('User stories',db.stories.length,'Backlog requirements captured')}
function exportRows(){return db.ideas.map(i=>({...i,RICE:rice(i)}))}
function tabView(t){if(t===0)return `<div class="grid">${panel('Prioritized roadmap','Ranked with reach, impact, confidence and effort',table(['Feature','RICE score','Status','Release'],[...db.ideas].sort((a,b)=>rice(b)-rice(a)).map(i=>`<tr><td><b>${safe(i.name)}</b><div class="hint">${safe(i.problem)}</div></td><td>${fmt(rice(i))}</td><td>${tag(i.status)}</td><td>${safe(i.release||'TBD')}</td></tr>`)))}${panel('Priority score comparison','Higher scores are prioritized for discussion',bars([...db.ideas].sort((a,b)=>rice(b)-rice(a)).map(i=>[i.name,rice(i),Math.max(...db.ideas.map(rice),1)])))}</div><p class="hint">RICE = reach × impact × confidence as a proportion ÷ effort. Use it as a decision aid, not a guaranteed outcome.</p>`;
if(t===1)return `<div class="grid">${panel('Capture a product idea','Start with the customer problem and quantify opportunity',`<form id="ideaForm"><div class="formgrid">${field('name','Idea / feature name')}${field('problem','Customer problem / evidence')}${field('reach','Reach (people per period)','number','100','min="0" step="any"')}${field('impact','Impact multiplier','number','2','min="0" step="0.5"')}${field('confidence','Confidence (0–100%)','number','70','min="0" max="100" step="1"')}${field('effort','Effort (person-months)','number','2','min="0.1" step="any"')}${select('status','Status',['Discovery','Planned','In progress','Released'])}${optionalField('release','Target release','text','2027-Q2')}</div><button class="button primary">Save idea</button></form>`)}${panel('Decision framework','Keep each scoring assumption visible',`<p class="hint"><b>Reach</b> estimates users affected in a defined period.<br><br><b>Impact</b> represents relative benefit.<br><br><b>Confidence</b> estimates how certain the assumptions are.<br><br><b>Effort</b> estimates person-months to deliver.<br><br>Scores are illustrative and should be validated through discovery.</p>`)}</div>`;
return `<div class="grid">${panel('Write a user story','Turn a product opportunity into testable requirements',`<form id="storyForm">${select('ideaId','Related feature',db.ideas.map(i=>({value:i.id,label:i.name})))}${field('persona','As a (persona)')}${field('goal','I want to (goal)')}${field('benefit','So that (benefit)')}${area('acceptance','Acceptance criteria — Given / When / Then')}<button class="button primary">Add user story</button></form>`)}${panel('Product backlog','Stories linked to discovery opportunities',table(['Feature','Story','Status'],db.stories.map(s=>`<tr><td>${safe(db.ideas.find(i=>i.id===s.ideaId)?.name||'Unknown')}</td><td>As a ${safe(s.persona)}, I want to ${safe(s.goal)} so that ${safe(s.benefit)}.<p class="hint">${safe(s.acceptance)}</p></td><td>${tag(s.status)}</td></tr>`)))}</div>`}
function wireTab(t){if(t===1)submit($('ideaForm'),form=>{const name=f(form,'name'),problem=f(form,'problem'),reach=Number(f(form,'reach')),impact=Number(f(form,'impact')),confidence=Number(f(form,'confidence')),effort=Number(f(form,'effort'));if(!name||!problem||reach<0||impact<0||confidence<0||confidence>100||effort<=0||[reach,impact,confidence,effort].some(v=>!Number.isFinite(v)))throw Error('Valid name, problem, and RICE estimates required');db.ideas.push({id:nextId(db.ideas),name,problem,reach,impact,confidence,effort,status:f(form,'status'),release:f(form,'release')})});if(t===2&&db.ideas.length)submit($('storyForm'),form=>{if(['persona','goal','benefit','acceptance'].some(k=>!f(form,k)))throw Error('Complete all story fields');db.stories.push({id:nextId(db.stories),ideaId:Number(f(form,'ideaId')),persona:f(form,'persona'),goal:f(form,'goal'),benefit:f(form,'benefit'),acceptance:f(form,'acceptance'),status:'Backlog'})})}


const KEY='portfolio-demo-v2:'+APP.id;
const clone=x=>JSON.parse(JSON.stringify(x));
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString(undefined,{maximumFractionDigits:1});
const nextId=a=>Math.max(0,...a.map(x=>Number(x.id)||0))+1;
const $=id=>document.getElementById(id);
let db;try{db=JSON.parse(localStorage.getItem(KEY))||clone(APP.seed)}catch{db=clone(APP.seed)}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(db))}catch{notify('Browser storage unavailable; changes may not persist')}render()};
const field=(name,label,type='text',value='',extra='')=>`<div class="field"><label for="${name}">${safe(label)}</label><input id="${name}" name="${name}" type="${type}" value="${safe(value)}" ${extra} required></div>`;
const optionalField=(name,label,type='text',value='')=>`<div class="field"><label for="${name}">${safe(label)}</label><input id="${name}" name="${name}" type="${type}" value="${safe(value)}"></div>`;
const area=(name,label)=>`<div class="field wide"><label for="${name}">${safe(label)}</label><textarea id="${name}" name="${name}" required></textarea></div>`;
const select=(name,label,options)=>`<div class="field"><label for="${name}">${safe(label)}</label><select id="${name}" name="${name}">${options.map(o=>`<option value="${safe(o.value??o)}">${safe(o.label??o)}</option>`).join('')}</select></div>`;
const panel=(title,description,html)=>`<section class="panel"><h2>${safe(title)}</h2><p class="desc">${safe(description)}</p>${html}</section>`;
const stat=(label,value,note)=>`<div class="stat"><span>${safe(label)}</span><strong>${safe(value)}</strong><small>${safe(note)}</small></div>`;
const tag=x=>`<span class="tag ${safe(x)}">${safe(x)}</span>`;
const table=(headers,rows)=>rows.length?`<div class="tablewrap"><table><thead><tr>${headers.map(h=>`<th>${safe(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`:'<p class="empty">No records yet. Add your first item to get started.</p>';
const bars=rows=>rows.length?`<div class="bars">${rows.map(([label,value,max=100])=>`<div><div class="barline"><span>${safe(label)}</span><b>${safe(fmt(value))}</b></div><div class="track"><div class="fill" style="width:${Math.max(0,Math.min(100,(Number(value)||0)/(Number(max)||1)*100))}%"></div></div></div>`).join('')}</div>`:'<p class="empty">Add data to see the chart.</p>';
const f=(form,name)=>form.elements.namedItem(name).value.trim();
function notify(message){const t=$('toast');t.textContent=message;t.classList.remove('hidden');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.add('hidden'),2700)}
function csv(name,rows){if(!rows.length){notify('Nothing to export');return}const columns=[...new Set(rows.flatMap(r=>Object.keys(r)))];const esc=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const data=[columns.join(','),...rows.map(r=>columns.map(k=>esc(r[k])).join(','))].join('\r\n');const blob=new Blob([data],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
let currentTab=0;
function changeTab(n){currentTab=n;render()}
function resetDemo(){if(!confirm('Reset all local demo changes?'))return;db=clone(APP.seed);save();notify('Demo reset')}
function submit(form,fn){form.addEventListener('submit',e=>{e.preventDefault();try{fn(form);save();notify('Saved successfully')}catch(err){notify(err.message||'Check your fields')}})}
function render(){
 $('stats').innerHTML=statsView();$('content').innerHTML=tabView(currentTab);
 document.querySelectorAll('.tab').forEach((b,i)=>b.setAttribute('aria-selected',String(i===currentTab)));
 wireTab(currentTab);
}
$('tabs').innerHTML=APP.tabs.map((t,i)=>`<button class="tab" type="button" role="tab" aria-selected="${i===currentTab}" onclick="changeTab(${i})">${safe(t)}</button>`).join('');
$('reset').addEventListener('click',resetDemo);
$('export').addEventListener('click',()=>csv(APP.id+'-export.csv',exportRows()));

// Visitor workspaces: browser-local only. Never put privileged access tokens in static files.
function downloadWorkspace(){
  const data=JSON.stringify({application:APP.id,version:1,savedAt:new Date().toISOString(),workspace:db},null,2);
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');anchor.href=url;anchor.download=APP.id+'-workspace.json';anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  notify('Workspace backup downloaded');
}
async function restoreWorkspace(file){
  if(!file)return;
  if(file.size>1024*1024){notify('Backup must be under 1 MB');return}
  try{
    const payload=JSON.parse(await file.text());
    if(payload.application!==APP.id||payload.version!==1||!payload.workspace||typeof payload.workspace!=='object'||Array.isArray(payload.workspace))throw Error('This backup belongs to a different app or is not supported');
    for(const [key,seed] of Object.entries(APP.seed)){
      if(!Array.isArray(payload.workspace[key])||payload.workspace[key].length>2500)throw Error('Backup data is missing or too large');
      for(const record of payload.workspace[key]){
        if(!record||typeof record!=='object'||Array.isArray(record)||!Number.isSafeInteger(Number(record.id)))throw Error('Backup contains invalid records');
        for(const [field,value] of Object.entries(record)){
          if(typeof value==='string'&&value.length>2000)throw Error('A backup field exceeds the limit');
          if(value!==null&&!['string','number','boolean'].includes(typeof value))throw Error('Unsupported backup data');
        }
      }
    }
    if(!confirm('Replace your current browser workspace with this backup? This will not change the original project or other visitors’ data.'))return;
    const clean={};for(const key of Object.keys(APP.seed))clean[key]=payload.workspace[key];
    db=clean;save();notify('Your workspace was restored');
  }catch(e){notify(e.message||'Could not read this backup')}
  finally{const input=$('restore');if(input)input.value=''}
}
$('backup').addEventListener('click',downloadWorkspace);
$('restore').addEventListener('change',event=>restoreWorkspace(event.target.files?.[0]));
window.addEventListener('storage',event=>{
  if(event.key===KEY){try{db=event.newValue?JSON.parse(event.newValue):clone(APP.seed);render();notify('Workspace updated in another tab')}catch{}}
});
render();

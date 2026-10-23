import {useEffect,useRef,useState} from 'react';
import {KEY,checks,courseStates,taskStates,appStates,initial,plan,progress,safeUrl,validate} from './planner';
import TranscriptPanel from './TranscriptPanel';
import { defaultPhd, phdFor, fundingOptions, verificationOptions, eligibilityOptions, priorityOptions, fitOptions, applicationReadiness, confirmedFunding, selectPhdApplications } from './phd.js';
import './planner.css';
const tabs=['Overview','Degree','Assignments','Thesis','PhD applications'];
function Field({label,value,onChange,type='text',options,required=false,name,placeholder,maxLength}){return <label className="field"><span>{label}</span>{options?<select name={name} value={value} onChange={onChange}>{options.map(o=><option key={o}>{o}</option>)}</select>:type==='textarea'?<textarea name={name} value={value} onChange={onChange} maxLength={maxLength??5000} rows="3"/>:<input name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} min={type==='number'?0:undefined} max={type==='number'?10000:undefined} step={type==='number'?'0.5':undefined} maxLength={maxLength??(type==='url'?2000:200)}/>}</label>;}
function download(value,name,type='application/json'){const url=URL.createObjectURL(new Blob([value],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export default function DegreePlanner(){
 const [boot]=useState(()=>{try{const raw=localStorage.getItem(KEY);return {data:raw?validate(JSON.parse(raw)):initial(),error:''};}catch{return {data:initial(),error:'Saved records could not be loaded. Saving is paused to protect the original. Export the saved copy or import a valid backup.'};}});
 const [s,setS]=useState(boot.data),[tab,setTab]=useState('Overview'),[notice,setNotice]=useState(boot.error),[saving,setSaving]=useState(!boot.error),[pending,setPending]=useState(null);
 const [phdSort,setPhdSort]=useState('Deadline'),[phdFunding,setPhdFunding]=useState('All'),[phdStatus,setPhdStatus]=useState('All'),[phdEligibility,setPhdEligibility]=useState('All');
 const file=useRef();
 useEffect(()=>{if(saving)try{localStorage.setItem(KEY,JSON.stringify(s));}catch{setNotice('Browser storage could not save your changes. Export a backup before closing.');}},[s,saving]);
 const set=(key,value)=>setS(old=>({...old,[key]:value}));
 const edit=(key,id,patch)=>setS(old=>({...old,[key]:old[key].map(r=>r.id===id?{...r,...patch}:r)}));
 const editPhd=(id,field,value)=>setS(old=>({...old,apps:old.apps.map(a=>a.id===id?{...a,phd:{...defaultPhd(),...a.phd,[field]:value}}:a)}));
 const del=(key,id)=>{if(window.confirm('Delete this record? Export a backup first if you need to keep it.'))setS(old=>({...old,[key]:old[key].filter(r=>r.id!==id)}));};
 const bind=(key,row,field)=>({value:row[field],onChange:e=>edit(key,row.id,{[field]:['credits','hours'].includes(field)&&e.target.value!==''?String(Math.max(0,Math.min(10000,Number(e.target.value)))):e.target.value})});
 const p=plan(s),d=progress(s);
 const visibleApps=selectPhdApplications(s.apps,{sort:phdSort,status:phdStatus,funding:phdFunding,eligibility:phdEligibility});
 const exportPlan=()=>download(['LearnTwin weekly plan',...p.actions.map((t,i)=>`${i+1}. ${t.course}: ${t.title} | Due: ${t.due||'unknown'} | Hours: ${t.hours===''?'not estimated':t.hours}`),`ACSC489 milestone: ${s.thesis.milestone||'Not recorded'}`,`Overdue: ${p.overdue}. Missing due dates: ${p.missingDates}. Estimated work due within 7 days: ${p.hours}h.`,...p.apps.map(a=>`Application: ${a.university}, ${a.program} | ${a.deadline}`)].join('\n'),'learntwin-weekly-plan.txt','text/plain');
 const importData=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{if(f.size>3000000)throw Error('Backup must be smaller than 3 MB.');setPending(validate(JSON.parse(await f.text())));}catch(err){setNotice(err.message);}};
 return <div className="planner"><aside className="planner-sidebar"><a className="brand" href="#/planner"><span className="brand-icon">L</span>LearnTwin</a><p className="sidebar-caption">YOUR NEXT CHAPTER</p><nav aria-label="Planner sections">{tabs.map((t,i)=><button key={t} className={tab===t?'active':''} aria-current={tab===t?'page':undefined} onClick={()=>setTab(t)}><span>0{i+1}</span>{t}</button>)}</nav><div className="sidebar-bottom"><strong>BSc → PhD</strong><p>One clear next step.</p><a href="#/classroom">Classroom workspace ↗</a></div></aside><main className="planner-main"><header><div><p className="eyebrow">LEARNING, WITH DIRECTION</p><h1>{tab==='Overview'?'Your path to a PhD':tab}</h1><p className="subheading">Build the degree. Prepare the research. Keep moving.</p></div><button className="secondary" onClick={()=>download(JSON.stringify(s,null,2),'learntwin-backup.json')}>Export backup ↓</button></header><p className="storage-note">Saved on this browser only. Export backups to move devices or protect your records. No university portal is connected.</p>
 {notice&&<div className="notice" role="alert">{notice}<button className="text-button" onClick={()=>setNotice('')}>Dismiss</button></div>}
 {!saving&&<button onClick={()=>{try{download(localStorage.getItem(KEY)||'','learntwin-recovery.json');}catch{setNotice('Browser storage is inaccessible.');}}}>Export saved copy</button>}
 {pending&&<section className="notice"><p>Replace this browser's records with {pending.courses.length} courses, {pending.tasks.length} assignments and {pending.apps.length} applications?</p><button onClick={()=>{setS(pending);setSaving(true);setPending(null);setNotice('Backup restored.');}}>Replace records</button><button className="secondary" onClick={()=>setPending(null)}>Cancel</button></section>}
 {tab==='Overview'&&<><section className="stats"><article><span>Remaining credits · estimate</span><strong>{d.remaining}<small> ECTS</small></strong><p>From a {s.baseline}-ECTS baseline</p></article><article><span>Work due within 7 days</span><strong>{p.hours}<small> hours</small></strong><p>{s.capacity} hours available this week</p></article><article><span>Applications in progress</span><strong>{s.apps.filter(a=>!['Closed','Offer'].includes(a.status)).length}</strong><p>Only records you have added</p></article></section><div className="overview-grid"><section className="panel"><div className="panel-heading"><div><p className="eyebrow">FOCUS THIS WEEK</p><h2>The next important actions</h2></div><button className="text-button" onClick={exportPlan}>Export plan ↗</button></div>{p.actions.length?p.actions.map((t,i)=><article className="action" key={t.id}><span className="action-number">0{i+1}</span><div><strong>{t.title}</strong><p>{t.course} · {t.due?`Due ${t.due}`:'Due date needed'} · {t.hours===''?'Effort needed':`${t.hours}h`}</p></div><button className="secondary" onClick={()=>edit('tasks',t.id,{status:'Done'})}>Done</button></article>):<div className="empty"><h3>Start with one real deadline.</h3><p>Add your assignment briefs and due dates. Your plan will prioritise unfinished work without inventing commitments.</p><button onClick={()=>setTab('Assignments')}>Add an assignment</button></div>}<div className="milestone"><span>ACSC489 → ACSC490</span><h3>{s.thesis.milestone||'Define your next project milestone'}</h3><button className="text-button" onClick={()=>setTab('Thesis')}>Open thesis workspace →</button></div></section><section className="panel"><p className="eyebrow">LOOK AHEAD</p><h2>Bottlenecks & preparation</h2><ul className="insights">{p.overdue>0&&<li>{p.overdue} unfinished assignment(s) are overdue.</li>}{p.hours>s.capacity&&<li>Due work exceeds your weekly capacity by {p.hours-s.capacity} hours.</li>}{p.unknownHours>0&&<li>{p.unknownHours} near-term assignment(s) need effort estimates.</li>}{p.missingDates>0&&<li>{p.missingDates} assignment(s) need verified due dates.</li>}{p.thesisMissing&&<li>Add an ACSC489 action to keep project preparation progressing.</li>}<li>Verify each programme's entry requirements and funding before preparing a tailored application.</li></ul><h3>Application deadlines</h3>{p.apps.length?p.apps.map(a=><div className="deadline" key={a.id}><strong>{a.university}</strong><p>{a.program} · {a.deadline}</p><small>{checks.filter(k=>!a.checks[k]).length} preparation items remaining</small></div>):<p className="muted">No upcoming application deadlines recorded.</p>}</section></div></>}
 {tab==='Degree'&&<><TranscriptPanel plannerCourses={s.courses}/><section className="panel"><h2>Degree progress</h2><p>Starting plan: 60 ECTS remaining, reported September 2026. Enter verified credits and mark courses passed after results are confirmed. This is a planning estimate, not an official graduation audit.</p><div className="form-grid"><Field label="Remaining ECTS at baseline" type="number" value={s.baseline} onChange={e=>set('baseline',Math.max(0,Math.min(10000,Number(e.target.value))))}/><Field label="Available study hours this week" type="number" value={s.capacity} onChange={e=>set('capacity',Math.max(0,Math.min(168,Number(e.target.value))))}/></div><p>{d.earned} credits completed since baseline · {d.remaining} remaining.{d.uncredited>0&&` ${d.uncredited} passed course(s) have no credits entered and are not counted.`}</p></section><div className="cards">{s.courses.map(c=><section className="panel" key={c.id}><p className="eyebrow">{c.id}</p><h2>{c.title}</h2><div className="form-grid"><Field label="Verified ECTS" type="number" placeholder="Not confirmed" {...bind('courses',c,'credits')}/><Field label="Status" options={courseStates} {...bind('courses',c,'status')}/></div><Field label="Notes / evidence" type="textarea" {...bind('courses',c,'notes')}/></section>)}</div><section className="panel"><h2>Add another course</h2><form className="form-grid" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget),id=f.get('code').trim().toUpperCase().slice(0,100),title=f.get('title').trim();if(!id||!title){setNotice('Enter a course code and title.');return;}if(s.courses.some(c=>c.id===id)){setNotice('That course code already exists.');return;}set('courses',[...s.courses,{id,title,credits:'',status:'Planned',notes:''}]);e.currentTarget.reset();}}><Field label="Course code" name="code" required/><Field label="Course title" name="title" required/><button>Add course</button></form></section></>}
 {tab==='Assignments'&&<><section className="panel"><h2>Add an assignment or study action</h2><form className="form-grid" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget),title=f.get('title').trim();if(!title){setNotice('Enter a deliverable.');return;}set('tasks',[...s.tasks,{id:crypto.randomUUID(),title,course:f.get('course'),due:f.get('due'),hours:f.get('hours'),notes:f.get('notes'),status:'To do'}]);e.currentTarget.reset();}}><Field label="Deliverable" name="title" required placeholder="e.g. Complete problem set 2"/><Field label="Course" name="course" options={s.courses.map(c=>c.id)}/><Field label="Verified due date (optional)" name="due" type="date"/><Field label="Hours remaining (optional)" name="hours" type="number"/><Field label="Brief, source link and notes" name="notes" type="textarea"/><button disabled={!s.courses.length}>Add assignment</button></form></section>{!s.tasks.length&&<p className="empty">No assignments entered. Completion must reflect your actual work.</p>}{s.tasks.map(t=><section className="panel" key={t.id}><div className="panel-heading"><h2>{t.course}</h2><button className="text-button" onClick={()=>del('tasks',t.id)}>Delete</button></div><div className="form-grid"><Field label="Deliverable" {...bind('tasks',t,'title')}/><Field label="Status" options={taskStates} {...bind('tasks',t,'status')}/><Field label="Due date" type="date" {...bind('tasks',t,'due')}/><Field label="Hours remaining" type="number" {...bind('tasks',t,'hours')}/></div><Field label="Brief and notes" type="textarea" {...bind('tasks',t,'notes')}/></section>)}</>}
 {tab==='Thesis'&&<section className="panel thesis-panel"><p className="eyebrow">ACSC489 → ACSC490</p><h2>Make the next milestone concrete.</h2><p>Define the question, method and evaluation you can carry into your senior project.</p>{[['topic','Working research question'],['supervisor','Confirmed supervisor'],['milestone','Next deliverable / milestone'],['notes','Decisions, meeting notes and evidence']].map(([key,label])=><Field key={key} label={label} type="textarea" value={s.thesis[key]} onChange={e=>set('thesis',{...s.thesis,[key]:e.target.value})}/>)}<div className="milestone"><h3>Suggested preparation sequence</h3><p>Agree scope → review literature → choose a baseline → define measurable evaluation → prepare the ACSC490 handover.</p><p>These are planning prompts, not confirmed university requirements or completed milestones.</p></div></section>}

 {tab==='PhD applications'&&<>
  <section className="stats" aria-label="PhD application overview">
    <article><span>Programmes tracked</span><strong>{s.apps.length}</strong><p>User-entered records only</p></article>
    <article><span>Fully funded with recorded verification</span><strong>{s.apps.filter(confirmedFunding).length}</strong><p>Requires a source link and explicit verification</p></article>
    <article><span>Applications with next action</span><strong>{s.apps.filter(a=>phdFor(a).nextAction.trim()).length}</strong><p>Keep progress actionable</p></article>
  </section>
  <section className="panel">
    <h2>Add a PhD programme or funded research position</h2>
    <p>Record the official source first. Deadlines, funding, eligibility and research fit remain unverified until you check them. Research-fit ratings are subjective, not admission probabilities.</p>
    <form className="form-grid" onSubmit={e=>{
      e.preventDefault();
      const f=new FormData(e.currentTarget),url=f.get('url').trim(),university=f.get('university').trim(),program=f.get('program').trim();
      if(!university||!program){setNotice('Enter an institution and programme.');return;}
      if(url&&!safeUrl(url)){setNotice('Use an http or https programme URL.');return;}
      set('apps',[...s.apps,{id:crypto.randomUUID(),university,program,url,deadline:f.get('deadline'),status:'Researching',notes:'',checks:Object.fromEntries(checks.map(k=>[k,false])),phd:defaultPhd()}]);e.currentTarget.reset();
    }}>
      <Field name="university" label="University / research institute" required/>
      <Field name="program" label="PhD programme / vacancy title" required/>
      <Field name="url" label="Official programme URL" type="url"/>
      <Field name="deadline" label="Verified application deadline (optional)" type="date"/>
      <button>Add programme</button>
    </form>
  </section>
  {s.apps.length>0&&<section className="panel" aria-label="PhD application comparison">
    <div className="panel-heading"><div><p className="eyebrow">SHORTLIST</p><h2>Compare programmes</h2></div><span className="muted">{visibleApps.length} of {s.apps.length} shown</span></div>
    <div className="form-grid phd-filters">
      <Field label="Sort by" options={['Deadline','Priority','Research fit','Readiness']} value={phdSort} onChange={e=>setPhdSort(e.target.value)}/>
      <Field label="Funding" options={['All',...fundingOptions]} value={phdFunding} onChange={e=>setPhdFunding(e.target.value)}/>
      <Field label="Application status" options={['All',...appStates]} value={phdStatus} onChange={e=>setPhdStatus(e.target.value)}/>
      <Field label="Eligibility" options={['All',...eligibilityOptions]} value={phdEligibility} onChange={e=>setPhdEligibility(e.target.value)}/>
    </div>
    <div className="phd-table-wrap">
      <table className="phd-comparison">
        <thead><tr><th>Programme</th><th>Deadline</th><th>Priority</th><th>Fit</th><th>Funding</th><th>Eligibility</th><th>Checklist</th></tr></thead>
        <tbody>{visibleApps.map(a=>{const ph=phdFor(a),r=applicationReadiness(a);return <tr key={a.id}>
          <td><strong>{a.university}</strong><small>{a.program}</small></td>
          <td>{a.deadline||'Not verified'}</td><td>{ph.priority}</td>
          <td>{ph.researchFit==='Unrated'?'Unrated':ph.researchFit+'/5'}</td>
          <td>{ph.funding}{confirmedFunding(a)&&<small>Source verified</small>}</td>
          <td>{ph.eligibility}</td><td>{r.completed}/{r.total}</td>
        </tr>;})}</tbody>
      </table>
    </div>
    {!visibleApps.length&&<p className="muted">No programmes match these filters.</p>}
    <p className="storage-note">“Verified” means you checked and recorded the source. LearnTwin does not validate eligibility, availability of funding, or the likelihood of admission.</p>
  </section>}
  <div className="cards phd-cards">{visibleApps.map(a=>{const ph=phdFor(a),r=applicationReadiness(a),update=(field,value)=>editPhd(a.id,field,value);return <section className="panel" key={a.id}>
    <div className="panel-heading"><div><p className="eyebrow">{ph.country||'LOCATION UNRECORDED'} · {ph.priority} priority</p><h2>{a.university}</h2></div><button className="text-button" onClick={()=>del('apps',a.id)}>Delete</button></div>
    <div className="phd-readiness"><span>Preparation checklist: {r.completed} of {r.total}</span><progress max={r.total} value={r.completed} aria-label="Completed application checklist items"/>{r.missing.length>0&&<small>Remaining: {r.missing.join(', ')}</small>}</div>
    <div className="form-grid">
      <Field label="University / institute" {...bind('apps',a,'university')}/>
      <Field label="Programme / position" {...bind('apps',a,'program')}/>
      <Field label="Application status" options={appStates} {...bind('apps',a,'status')}/>
      <Field label="Verified deadline" type="date" {...bind('apps',a,'deadline')}/>
      <Field label="Your priority" options={priorityOptions} value={ph.priority} onChange={e=>update('priority',e.target.value)}/>
      <Field label="Country / location" value={ph.country} onChange={e=>update('country',e.target.value)}/>
    </div>
    <Field label="Official programme URL" type="url" {...bind('apps',a,'url')}/>
    {safeUrl(a.url)&&<a href={safeUrl(a.url)} target="_blank" rel="noreferrer">Open programme source ↗</a>}
    <details className="phd-details" open>
      <summary>Research match & eligibility</summary>
      <div className="form-grid">
        <Field label="Research-fit rating (your judgment, 1–5)" options={fitOptions} value={ph.researchFit} onChange={e=>update('researchFit',e.target.value)}/>
        <Field label="Eligibility review" options={eligibilityOptions} value={ph.eligibility} onChange={e=>update('eligibility',e.target.value)}/>
        <Field label="Research group / supervisor" value={ph.supervisor} onChange={e=>update('supervisor',e.target.value)}/>
        <Field label="Research topic / method" value={ph.topic} onChange={e=>update('topic',e.target.value)}/>
      </div>
      <Field label="Official admission requirements URL" type="url" value={ph.requirementsUrl} onChange={e=>update('requirementsUrl',e.target.value)}/>
      <Field label="Eligibility constraints / evidence" type="textarea" value={ph.eligibilityNotes} onChange={e=>update('eligibilityNotes',e.target.value)}/>
    </details>
    <details className="phd-details">
      <summary>Funding & source verification</summary>
      <div className="form-grid">
        <Field label="Funding advertised" options={fundingOptions} value={ph.funding} onChange={e=>update('funding',e.target.value)}/>
        <Field label="Funding evidence review" options={verificationOptions} value={ph.fundingEvidence} onChange={e=>update('fundingEvidence',e.target.value)}/>
        <Field label="Stipend / salary (quoted amount and currency)" value={ph.stipend} onChange={e=>update('stipend',e.target.value)}/>
        <Field label="Tuition / fees coverage" value={ph.tuition} onChange={e=>update('tuition',e.target.value)}/>
        <Field label="Funding duration" value={ph.duration} onChange={e=>update('duration',e.target.value)}/>
        <Field label="Source checked on" type="date" value={ph.fundingVerifiedOn} onChange={e=>update('fundingVerifiedOn',e.target.value)}/>
      </div>
      <Field label="Official funding source URL" type="url" value={ph.fundingUrl} onChange={e=>update('fundingUrl',e.target.value)}/>
      {safeUrl(ph.fundingUrl)&&<a href={safeUrl(ph.fundingUrl)} target="_blank" rel="noreferrer">Open funding source ↗</a>}
      <p className="muted">Fully funded appears in the verified count only when marked Fully funded + Verified with a source URL. Record tuition and living costs separately; advertised funding may not cover both.</p>
    </details>
    <details className="phd-details" open>
      <summary>Preparation & next action</summary>
      <div className="checklist">{checks.map(k=><label key={k}><input type="checkbox" checked={a.checks[k]} onChange={e=>edit('apps',a.id,{checks:{...a.checks,[k]:e.target.checked}})}/>{k}</label>)}</div>
      <div className="form-grid">
        <Field label="Next concrete action" type="textarea" value={ph.nextAction} onChange={e=>update('nextAction',e.target.value)}/>
        <Field label="Next-action target date" type="date" value={ph.actionDue} onChange={e=>update('actionDue',e.target.value)}/>
      </div>
      <Field label="References, document links, contact notes and decisions" type="textarea" {...bind('apps',a,'notes')}/>
    </details>
  </section>;})}</div>
  {!s.apps.length&&<p className="empty">No programmes added. Start with one official programme link; no deadlines, admission chances or funding offers are assumed.</p>}
 </>}

 <footer><span>LearnTwin · Degree & research planning</span><button className="text-button" onClick={()=>file.current.click()}>Import backup</button><input aria-label="Import LearnTwin backup" ref={file} type="file" accept=".json,application/json" hidden onChange={importData}/></footer></main></div>;
}


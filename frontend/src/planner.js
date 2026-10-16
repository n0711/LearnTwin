export const KEY='learntwin.planner.v1';
export const checks=['Eligibility verified','Funding verified','CV ready','Statement ready','Transcript ready','References ready'];
export const courseStates=['Planned','In progress','Passed'];
export const taskStates=['To do','In progress','Done'];
export const appStates=['Researching','Preparing','Submitted','Interview','Offer','Closed'];
export function initial(){return {version:1,baseline:60,capacity:10,courses:[['ACSC401','Algorithms and Complexity'],['ACSC489','Project Preparation'],['ACSC423','Mobile and Ubiquitous Computing'],['ACSC496','AI & Ethics, Big Data, and ICT Sustainability'],['ACSC402','Neural Networks']].map(([id,title])=>({id,title,credits:'',status:'Planned',notes:''})),tasks:[],apps:[],thesis:{topic:'',supervisor:'',milestone:'',notes:''}};}
export function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function days(date,now=today()){return date?Math.round((Date.parse(`${date}T12:00:00Z`)-Date.parse(`${now}T12:00:00Z`))/86400000):null;}
export function safeUrl(v){try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
export function plan(s,now=today()){
 const pending=s.tasks.filter(t=>t.status!=='Done').map(t=>({...t,days:days(t.due,now)})).sort((a,b)=>(a.days??Infinity)-(b.days??Infinity)||Number(b.hours)-Number(a.hours)||a.title.localeCompare(b.title));
 const soon=pending.filter(t=>t.days!==null&&t.days<=7);
 return {actions:pending.slice(0,5),hours:soon.reduce((n,t)=>n+Number(t.hours),0),unknownHours:soon.filter(t=>t.hours==='').length,overdue:pending.filter(t=>t.days!==null&&t.days<0).length,missingDates:pending.filter(t=>!t.due).length,thesisMissing:!pending.some(t=>t.course==='ACSC489'),apps:s.apps.filter(a=>!['Submitted','Interview','Offer','Closed'].includes(a.status)&&a.deadline).sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,3)};
}
export function progress(s){const passed=s.courses.filter(c=>c.status==='Passed');const earned=passed.reduce((n,c)=>n+Number(c.credits),0);return {earned,remaining:Math.max(0,s.baseline-earned),uncredited:passed.filter(c=>c.credits==='').length};}
const str=(v,max=5000)=>typeof v==='string'&&v.length<=max;
const num=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=10000;
const amount=v=>v===''||num(v)||(str(v,20)&&v.trim()!==''&&num(Number(v)));
const date=v=>v===''||(str(v,10)&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v);
export function validate(s){
 const fail=()=>{throw Error('Invalid LearnTwin backup. Existing records have not been changed.');};
 if(!s||s.version!==1||!num(s.baseline)||!num(s.capacity))fail();
 for(const k of ['courses','tasks','apps'])if(!Array.isArray(s[k])||s[k].length>2000||!s[k].every(r=>r&&str(r.id,100)&&r.id.length)||new Set(s[k].map(r=>r.id)).size!==s[k].length)fail();
 if(!s.courses.every(c=>str(c.title,200)&&amount(c.credits)&&courseStates.includes(c.status)&&str(c.notes)))fail();
 if(!s.tasks.every(t=>str(t.title,200)&&s.courses.some(c=>c.id===t.course)&&date(t.due)&&amount(t.hours)&&taskStates.includes(t.status)&&str(t.notes)))fail();
 if(!s.apps.every(a=>str(a.university,200)&&str(a.program,200)&&str(a.url,2000)&&date(a.deadline)&&appStates.includes(a.status)&&str(a.notes)&&a.checks&&checks.every(k=>typeof a.checks[k]==='boolean')))fail();
 if(!s.thesis||!['topic','supervisor','milestone','notes'].every(k=>str(s.thesis[k])))fail();
 return s;
}

import {useEffect,useState} from 'react';

// Local development only: the shared browser-visible key is not production authentication.
const BASE=(import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/,'');
const KEY=import.meta.env.VITE_API_KEY || 'devkey';
async function request(path, options={}) {
  let response;
  try {
    response=await fetch(`${BASE}/academic${path}`, {headers:{'X-API-Key':KEY,...options.headers},...options});
  } catch {throw Error('Cannot reach the local FastAPI server. Start the backend on port 8000.');}
  let payload;
  try {payload=await response.json();} catch {throw Error(`Unexpected API response (${response.status}).`);}
  if(!response.ok)throw Error(typeof payload.detail==='string'?payload.detail:`API request failed (${response.status}).`);
  return payload;
}
export default function TranscriptPanel({plannerCourses}) {
  const [file,setFile]=useState(null), [preview,setPreview]=useState(null);
  const [report,setReport]=useState(null),[error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{let alive=true;request('/summary').then(r=>{if(alive)setReport(r);}).catch(()=>{});return ()=>{alive=false;};},[]);
  async function upload(commit) {
    if(!file)return;
    setBusy(true);setError('');
    try {
      const form=new FormData();form.append('file',file);
      const result=await request(commit?'/import-pdf':'/preview-pdf',{method:'POST',body:form});
      if(commit){setReport(result);setPreview(null);setFile(null);}else setPreview(result);
    } catch(e){setError(e.message);}finally{setBusy(false);}
  }
  async function syncCurrent() {
    const current=plannerCourses.filter(c=>c.status==='In progress' && Number(c.credits)>0).map(c=>({
      code:c.id,title:c.title,ects:Number(c.credits),
    }));
    if(!current.length){setError('In Degree, mark enrolled courses “In progress” and enter verified ECTS first.');return;}
    setBusy(true);setError('');
    try {setReport(await request('/current',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(current)}));}
    catch(e){setError(e.message);}finally{setBusy(false);}
  }
  return <section className="panel" aria-label="Frederick transcript importer">
    <p className="eyebrow">LOCAL ACADEMIC RECORDS</p>
    <h2>Frederick transcript PDF importer</h2>
    <p>Import a text-readable Frederick Academic Record PDF, review parsed grades, then confirm saving to your local Rust/SQLite database. Original PDFs and identity fields are not stored.</p>
    <label className="field"><span>Select transcript PDF (up to 5 MB)</span>
      <input type="file" accept="application/pdf,.pdf" onChange={e=>{setFile(e.target.files?.[0]||null);setPreview(null);setError('');}}/>
    </label>
    <button disabled={!file||busy} onClick={()=>upload(false)}>Review PDF before saving</button>
    {error&&<p role="alert">{error}</p>}
    {preview&&<div className="panel" aria-label="Import preview">
      <h3>Review before saving</h3>
      <p>{preview.courses.length} courses · {preview.history.length} semesters · {preview.earned_ects} cumulative ECTS · GPA {preview.cumulative_gpa.toFixed(2)}/10</p>
      <p>Failed attempts: {preview.courses.filter(c=>c.status==='Failed').map(c=>c.code).join(', ')||'None recognized'}.</p>
      <p>Transferred ECTS: {preview.transferred_ects}. Issued: {preview.issued||'Not found'}.</p>
      <button disabled={busy} onClick={()=>upload(true)}>Confirm and save transcript</button>
      <button className="secondary" disabled={busy} onClick={()=>setPreview(null)}>Cancel</button>
    </div>}
    <p>For currently enrolled courses, enter verified ECTS and select <strong>In progress</strong> in the Degree course cards, then sync:</p>
    <button className="secondary" disabled={busy} onClick={syncCurrent}>Sync current courses to database</button>
    {report?.transcript&&<div>
      <h3>Degree evaluation (unofficial)</h3>
      <p><strong>{report.transcript.earned_ects}</strong> earned ECTS (including {report.transcript.transferred_ects} transferred) · <strong>{report.transcript.cumulative_gpa.toFixed(2)}</strong>/10 cumulative transcript GPA.</p>
      <p>{report.remaining_estimate} ECTS estimated remaining against a configurable {report.degree_target_ects}-ECTS target; {report.current_ects} ECTS currently enrolled are not yet earned.</p>
      <p>{report.note}</p>
      <h3>GPA history</h3>
      <div style={{overflowX:'auto'}}><table><thead><tr><th>Term</th><th>Term GPA</th><th>Cumulative GPA</th><th>Cumulative ECTS</th></tr></thead>
        <tbody>{report.history.map(h=><tr key={h.term}><td>{h.term}</td><td>{h.semester_gpa.toFixed(2)}</td><td>{h.cumulative_gpa.toFixed(2)}</td><td>{h.cumulative_ects}</td></tr>)}</tbody></table></div>
      <details><summary>Course history ({report.courses.length})</summary>
        <div style={{overflowX:'auto'}}><table><thead><tr><th>Term</th><th>Code</th><th>Course</th><th>Grade</th><th>ECTS earned</th><th>Status</th></tr></thead><tbody>
          {report.courses.map(c=><tr key={`${c.term}-${c.code}`}><td>{c.term}</td><td>{c.code}</td><td>{c.title}</td><td>{c.grade.toFixed(2)}</td><td>{c.earned}/{c.attempted}</td><td>{c.status}</td></tr>)}
        </tbody></table></div>
      </details>
    </div>}
    {report?.current?.length>0&&<p>Current courses: {report.current.map(c=>`${c.code} (${c.ects} ECTS)`).join(', ')}.</p>}
    <p className="storage-note">Local FastAPI + Rust service required. This is not an official university degree audit. Keep the database private and backed up.</p>
  </section>;
}

//! Local single-user academic records store. Never saves original PDF content.
use rusqlite::{params, Connection, OptionalExtension};
use serde_json::{json, Value};
use std::{env, error::Error, io::{self, Read}, process};

fn setup(db: &Connection) -> Result<(), Box<dyn Error>> {
    db.execute_batch("PRAGMA foreign_keys=ON;
        CREATE TABLE IF NOT EXISTS transcripts (
            id TEXT PRIMARY KEY, issued TEXT NOT NULL, transferred_ects INTEGER NOT NULL,
            earned_ects INTEGER NOT NULL, cumulative_gpa REAL NOT NULL,
            imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS courses (
            transcript_id TEXT NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
            term TEXT NOT NULL, code TEXT NOT NULL, title TEXT NOT NULL,
            attempted INTEGER NOT NULL, earned INTEGER NOT NULL, grade REAL NOT NULL,
            status TEXT NOT NULL, PRIMARY KEY(transcript_id,term,code)
        );
        CREATE TABLE IF NOT EXISTS gpa_history (
            transcript_id TEXT NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
            ordinal INTEGER NOT NULL, term TEXT NOT NULL, semester_gpa REAL NOT NULL,
            cumulative_gpa REAL NOT NULL, cumulative_ects INTEGER NOT NULL,
            PRIMARY KEY(transcript_id,ordinal)
        );
        CREATE TABLE IF NOT EXISTS current_courses (
            code TEXT PRIMARY KEY, title TEXT NOT NULL, ects INTEGER NOT NULL
        );")?;
    Ok(())
}

fn import(db: &mut Connection, data: &Value) -> Result<Value, Box<dyn Error>> {
    let id = data["id"].as_str().ok_or("Missing transcript fingerprint")?;
    let issued = data["issued"].as_str().unwrap_or("");
    let transferred = data["transferred_ects"].as_i64().ok_or("Missing transferred ECTS")?;
    let earned = data["earned_ects"].as_i64().ok_or("Missing earned ECTS")?;
    let gpa = data["cumulative_gpa"].as_f64().ok_or("Missing GPA")?;
    let courses = data["courses"].as_array().ok_or("Missing course rows")?;
    let history = data["history"].as_array().ok_or("Missing GPA history")?;
    let tx = db.transaction()?;
    tx.execute("INSERT INTO transcripts (id,issued,transferred_ects,earned_ects,cumulative_gpa)
                VALUES (?1,?2,?3,?4,?5)
                ON CONFLICT(id) DO UPDATE SET issued=excluded.issued,
                transferred_ects=excluded.transferred_ects,earned_ects=excluded.earned_ects,
                cumulative_gpa=excluded.cumulative_gpa",
                params![id,issued,transferred,earned,gpa])?;
    tx.execute("DELETE FROM courses WHERE transcript_id=?1", params![id])?;
    tx.execute("DELETE FROM gpa_history WHERE transcript_id=?1", params![id])?;
    for row in courses {
        tx.execute("INSERT INTO courses VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",params![
            id, row["term"].as_str().ok_or("course term")?,
            row["code"].as_str().ok_or("course code")?,
            row["title"].as_str().ok_or("course title")?,
            row["attempted"].as_i64().ok_or("attempted credits")?,
            row["earned"].as_i64().ok_or("earned credits")?,
            row["grade"].as_f64().ok_or("grade")?,
            row["status"].as_str().ok_or("course status")?,
        ])?;
    }
    for (idx,row) in history.iter().enumerate() {
        tx.execute("INSERT INTO gpa_history VALUES (?1,?2,?3,?4,?5,?6)",params![
            id, idx as i64, row["term"].as_str().ok_or("history term")?,
            row["semester_gpa"].as_f64().ok_or("semester gpa")?,
            row["cumulative_gpa"].as_f64().ok_or("cumulative gpa")?,
            row["cumulative_ects"].as_i64().ok_or("cumulative ects")?,
        ])?;
    }
    tx.commit()?;
    Ok(json!({"saved":true,"course_count":courses.len(),"semester_count":history.len()}))
}

fn sync_current(db: &mut Connection, data: &Value) -> Result<Value, Box<dyn Error>> {
    let rows = data.as_array().ok_or("Current courses must be an array")?;
    let tx = db.transaction()?;
    tx.execute("DELETE FROM current_courses", [])?;
    for row in rows {
        tx.execute("INSERT INTO current_courses (code,title,ects) VALUES (?1,?2,?3)",params![
            row["code"].as_str().ok_or("current code")?,
            row["title"].as_str().ok_or("current title")?,
            row["ects"].as_i64().ok_or("current ECTS")?,
        ])?;
    }
    tx.commit()?;
    Ok(json!({"saved":true,"current_count":rows.len()}))
}

fn summary(db: &Connection) -> Result<Value, Box<dyn Error>> {
    let target = env::var("DEGREE_TARGET_ECTS").ok().and_then(|s|s.parse::<i64>().ok()).filter(|x|*x>0).unwrap_or(240);
    let mut current_stmt = db.prepare("SELECT code,title,ects FROM current_courses ORDER BY code")?;
    let current: Vec<Value> = current_stmt.query_map([], |r|Ok(json!({
        "code":r.get::<_,String>(0)?,"title":r.get::<_,String>(1)?,
        "ects":r.get::<_,i64>(2)?,"status":"In progress"
    })))?.collect::<Result<Vec<_>,_>>()?;
    let latest: Option<(String,String,i64,i64,f64)> = db.query_row(
        "SELECT id,issued,transferred_ects,earned_ects,cumulative_gpa FROM transcripts
         ORDER BY CASE WHEN issued='' THEN 0 ELSE 1 END DESC,issued DESC,imported_at DESC LIMIT 1",
        [], |r| Ok((r.get(0)?,r.get(1)?,r.get(2)?,r.get(3)?,r.get(4)?))
    ).optional()?;
    let Some((id, issued, transferred, earned, gpa)) = latest else {
        return Ok(json!({"transcript":null,"courses":[],"history":[],"current":current,
            "degree_target_ects":target,"note":"Import a transcript to evaluate earned credits."}));
    };
    let mut course_stmt = db.prepare("SELECT term,code,title,attempted,earned,grade,status FROM courses WHERE transcript_id=?1 ORDER BY rowid")?;
    let courses: Vec<Value> = course_stmt.query_map(params![id], |r|Ok(json!({
        "term":r.get::<_,String>(0)?,"code":r.get::<_,String>(1)?,
        "title":r.get::<_,String>(2)?,"attempted":r.get::<_,i64>(3)?,
        "earned":r.get::<_,i64>(4)?,"grade":r.get::<_,f64>(5)?,
        "status":r.get::<_,String>(6)?
    })))?.collect::<Result<Vec<_>,_>>()?;
    let mut history_stmt = db.prepare("SELECT term,semester_gpa,cumulative_gpa,cumulative_ects FROM gpa_history WHERE transcript_id=?1 ORDER BY ordinal")?;
    let history: Vec<Value> = history_stmt.query_map(params![id], |r|Ok(json!({
        "term":r.get::<_,String>(0)?,"semester_gpa":r.get::<_,f64>(1)?,
        "cumulative_gpa":r.get::<_,f64>(2)?,"cumulative_ects":r.get::<_,i64>(3)?
    })))?.collect::<Result<Vec<_>,_>>()?;
    Ok(json!({"transcript":{"issued":issued,"transferred_ects":transferred,
        "earned_ects":earned,"cumulative_gpa":gpa},
        "degree_target_ects":target,"remaining_estimate":(target-earned).max(0),
        "current_ects":current.iter().map(|r|r["ects"].as_i64().unwrap_or(0)).sum::<i64>(),
        "courses":courses,"history":history,"current":current,
        "note":"Planning estimate only; university degree requirements and exemptions are not verified."}))
}

fn run() -> Result<(), Box<dyn Error>> {
    let action = env::args().nth(1).ok_or("Expected import, summary, or sync-current")?;
    let filename = env::var("LEARNTWIN_DB").unwrap_or_else(|_|"academic_records.sqlite3".to_string());
    let mut db = Connection::open(filename)?;
    setup(&db)?;
    let mut input = String::new();
    io::stdin().read_to_string(&mut input)?;
    let payload: Value = serde_json::from_str(if input.trim().is_empty() {"{}"} else {&input})?;
    let response = match action.as_str() {
        "import" => import(&mut db,&payload)?,
        "summary" => summary(&db)?,
        "sync-current" => sync_current(&mut db,&payload)?,
        _ => return Err("Unknown operation".into()),
    };
    println!("{}", response);
    Ok(())
}
fn main() { if let Err(err)=run() {eprintln!("academic_store: {err}");process::exit(1);} }

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn academic_snapshot_round_trip() {
        let mut db = Connection::open_in_memory().unwrap();
        setup(&db).unwrap();
        let doc = json!({
          "id":"sample-pdf-hash", "issued":"2026-10-23", "transferred_ects":40,
          "earned_ects":46, "cumulative_gpa":8.1,
          "courses":[{"term":"Fall 2026","code":"ACSC401","title":"Algorithms",
              "attempted":6,"earned":6,"grade":8.1,"status":"Passed"}],
          "history":[{"term":"Fall 2026","semester_gpa":8.1,
              "cumulative_gpa":8.1,"cumulative_ects":46}]
        });
        import(&mut db,&doc).unwrap();
        import(&mut db,&doc).unwrap(); // Re-import is idempotent.
        sync_current(&mut db,&json!([{"code":"ACSC489","title":"Project Preparation","ects":6}])).unwrap();
        let result = summary(&db).unwrap();
        assert_eq!(result["transcript"]["earned_ects"], 46);
        assert_eq!(result["courses"].as_array().unwrap().len(), 1);
        assert_eq!(result["history"].as_array().unwrap().len(), 1);
        assert_eq!(result["current_ects"], 6);
    }
}

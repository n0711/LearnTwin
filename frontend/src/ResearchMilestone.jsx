/** Public research reference only; it has no access to planner records. */
export default function ResearchMilestone() {
  return <section className="panel research-reference" aria-label="Optional research reference">
    <details className="phd-details">
      <summary>Optional research reference: ROS3-Limassol</summary>
      <h2>Offline telemetry evidence exporter</h2>
      <p>Research-software milestone, 25 October 2026. Physical hardware and field validation remain pending.</p>
      <p>Original idea: Christos Paparistodemou. Project lead and manuscript author: Charalampos Nadiotis.</p>
      <p>A merged, read-only offline exporter validates a JSONL receiver-observation recording and fingerprints its exact bytes with SHA-256. It reports accepted/rejected observations, silence ticks and the last 256 observed state changes, with exact aggregate counters.</p>
      <h3>Verified automated evidence</h3>
      <p>At tested commit <code>005f0fcc40b2efeb397704589af871ea9bc38759</code>, all five CI jobs passed: Linux/Python 3.10 and 3.12, Windows/Python 3.12, ROS 2 Humble and ROS 2 Jazzy. A separate Rust run passed formatting, Clippy, tests, build and Python/Rust parity checks.</p>
      <p>These are software and ROS integration checks using synthetic observations. The results apply to that commit.</p>
      <h3>Limits of the evidence</h3>
      <p>Receiver-arrival observations do not establish packet delivery ratio, one-way delay, network jitter, sensor capture freshness, field reliability or vehicle safety. Silence ticks are not proven packet losses; state changes are observed only at recorded ticks. SHA-256 identifies input bytes, not authenticity or provenance.</p>
      <h3>Next research step</h3>
      <p>Prepare a Humble/Jazzy hardware or field study with independent outage/recovery ground truth. Retain raw JSONL, evidence JSON, software/ROS versions, clock assumptions, timeout/tick settings and repeat counts. Execution remains pending; no experiment date is assumed.</p>
      <p>Use this optional reference in your research statement or existing application notes when relevant. Eligibility and funding require separate verification.</p>
      <p>
        <a href="https://github.com/n0711/ROS3-Limassol/pull/12" target="_blank" rel="noreferrer">Merged exporter PR #12</a>{' · '}
        <a href="https://github.com/n0711/ROS3-Limassol/actions/runs/40226507393" target="_blank" rel="noreferrer">Five-job CI run</a>{' · '}
        <a href="https://github.com/n0711/ROS3-Limassol/actions/runs/40226507353" target="_blank" rel="noreferrer">Rust run</a>{' · '}
        <a href="https://github.com/n0711/ROS3-Limassol/blob/2f071da0ec5891ef6dc42c02fa5fab3b9cdbbefb/robotics/ros3_limassol/docs/EVIDENCE.md" target="_blank" rel="noreferrer">Evidence definitions</a>
      </p>
    </details>
  </section>;
}

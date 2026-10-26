# ROS3-Limassol + VERA-MOT research evidence in LearnTwin

**Status: optional research-planning documentation. No browser records are
created, modified, migrated, uploaded, or linked automatically.**

This note extends the [ROS3 milestone](DEGREE_PHD_PLANNER.md) with an optional
independent vision experiment. It is not a PhD application submission or
confirmation of research performance.

## Provenance and project separation

| Source project | Research evidence | Current limitation |
| --- | --- | --- |
| [ROS3-Limassol](https://github.com/n0711/ROS3-Limassol) | Receiver-observation recording/replay and validated offline evidence-v1 JSON | Synthetic CI does not establish field communication reliability or GNSS-denied autonomy |
| [VERA-MOT](https://github.com/n0711/vera-mot) | Frozen UAVDT detector + BoT-SORT no-ReID benchmark; optional track-summary format | VERA reliability-gated association and real VLM inference not established |
| [LearnTwin](https://github.com/n0711/LearnTwin) | Optional PhD milestones and citation/experiment tracking | Planner uses local browser records; no live telemetry, multimodal model or automation |

**Credit:** The initial ROS3-Limassol idea is credited to Christos
Paparistodemou. Project lead/manuscript author: Charalampos Nadiotis.
VERA-MOT results and authorship are independent; do not merge claims or credits
from the distinct research tracks.

## Suggested optional PhD note

"ROS3-Limassol / VERA-MOT multimodal evidence interface (experimental).
ROS3's receiver-observation evidence can be transformed into aggregate
anomaly-baseline features. VERA-MOT provides an independent sequence-local
multi-object tracking evidence summary. A separate external-VLM annotation
manifest may add declared model ID/revision, prompt fingerprint and aggregate
labels. Formats are validated; real VLM inference, cross-modal clock
synchronization, robot/video association, GNSS-denied localization and
field performance have not been established.

Research question: Can independently validated visual evidence and
receiver-arrival telemetry detect *observed* degradation more accurately
than telemetry-only or vision-only baselines in controlled experiments?

Next milestone: collect independent ground truth, timestamp provenance,
separate training/validation/test runs and repeated hardware observations.
Publish results only after objective accuracy, runtime, ablation and failure
analysis."

## How to use the planner without modifying existing data

1. Optionally paste the note into the existing PhD applications
   **References, document links, contact notes and decisions** field for a
   relevant programme, or a thesis note where appropriate.
2. Store GitHub issue/PR URLs and experiment summary links, not raw drone
   video, GNSS positions, private telemetry, credentials or personal images.
3. Keep each proposed experiment labelled **planned**, **synthetic CI**,
   **hardware validated** or **peer reviewed**, as applicable.
4. Export a normal LearnTwin backup for safekeeping. Do not treat the note
   as proof of admission eligibility, funding, research novelty or results.

## Experimental acceptance criteria

- A reproducible report and source fingerprint for **each** dataset/run.
- A held-out telemetry baseline with fixed scoring threshold and independent
  training recordings.
- A documented VERA-MOT output and matching VLM manifest with actual model,
  image and prompt provenance when a VLM exists.
- Verified clock alignment and mapping from video stream to sensor/robot before
  making synchronized cross-modal assertions.
- Ground-truth GNSS-denied scenario labels with repeated quantitative evaluation.
- Controls that prohibit the research evidence path from actuating a robot.

The code and documentation can evolve independently. LearnTwin should remain
the research-planning interface, not a real-time safety monitor.

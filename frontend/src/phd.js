/**
 * PhD application metadata is optional so historical v1 planner backups and
 * existing browser records remain readable without a destructive migration.
 * All data are user-entered; no readiness or research-fit score predicts admission.
 */
export const REQUIRED_CHECKS = [
  'Eligibility verified', 'Funding verified', 'CV ready',
  'Statement ready', 'Transcript ready', 'References ready',
];
export const fundingOptions = ['Unknown', 'Fully funded', 'Partially funded', 'Unfunded'];
export const verificationOptions = ['Not checked', 'Unverified', 'Verified'];
export const eligibilityOptions = ['Not checked', 'Needs review', 'Self-assessed eligible', 'Potential gap', 'Confirmed ineligible'];
export const priorityOptions = ['Unranked', 'High', 'Medium', 'Low'];
export const fitOptions = ['Unrated', '1', '2', '3', '4', '5'];

export function defaultPhd() {
  return {
    country: '',
    topic: '',
    supervisor: '',
    researchFit: 'Unrated',
    priority: 'Unranked',
    eligibility: 'Not checked',
    eligibilityNotes: '',
    requirementsUrl: '',
    funding: 'Unknown',
    fundingEvidence: 'Not checked',
    fundingUrl: '',
    fundingVerifiedOn: '',
    stipend: '',
    tuition: '',
    duration: '',
    nextAction: '',
    actionDue: '',
  };
}
export function phdFor(app) {
  return { ...defaultPhd(), ...(app?.phd ?? {}) };
}
function webUrl(value) {
  if (!value) return true;
  try { return ['https:', 'http:'].includes(new URL(value).protocol); }
  catch { return false; }
}
function validDate(value) {
  return value === '' ||
    (typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value);
}
export function validPhd(value) {
  if (value === undefined) return true; // Legacy v1 record
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const defaults = defaultPhd();
  if (Object.keys(value).some(key => !Object.hasOwn(defaults, key))) return false;
  const phd = { ...defaults, ...value };
  if (Object.entries(phd).some(([key, field]) =>
    typeof field !== 'string' ||
    field.length > (['eligibilityNotes', 'nextAction'].includes(key) ? 5000 : 2000)
  )) return false;
  return fundingOptions.includes(phd.funding) &&
    verificationOptions.includes(phd.fundingEvidence) &&
    eligibilityOptions.includes(phd.eligibility) &&
    priorityOptions.includes(phd.priority) &&
    fitOptions.includes(phd.researchFit) &&
    webUrl(phd.fundingUrl) &&
    webUrl(phd.requirementsUrl) &&
    validDate(phd.fundingVerifiedOn) &&
    validDate(phd.actionDue);
}

export function applicationReadiness(app) {
  const completed = REQUIRED_CHECKS.filter(item => app.checks?.[item] === true);
  return {
    completed: completed.length,
    total: REQUIRED_CHECKS.length,
    missing: REQUIRED_CHECKS.filter(item => app.checks?.[item] !== true),
  };
}
export function confirmedFunding(app) {
  const phd = phdFor(app);
  // The user records and verifies the official source. We never infer funding.
  return phd.funding === 'Fully funded' &&
    phd.fundingEvidence === 'Verified' &&
    Boolean(phd.fundingUrl) && webUrl(phd.fundingUrl);
}
const deadline = a => a.deadline || '9999-12-31';
const fitScore = a => a.researchFit === 'Unrated' ? -1 : Number(a.researchFit);
const priorityOrder = { High: 0, Medium: 1, Low: 2, Unranked: 3 };
export function selectPhdApplications(apps, { sort = 'Deadline', status = 'All', funding = 'All', eligibility = 'All' } = {}) {
  return apps.filter(app => {
    const phd = phdFor(app);
    return (status === 'All' || app.status === status) &&
      (funding === 'All' || phd.funding === funding) &&
      (eligibility === 'All' || phd.eligibility === eligibility);
  }).sort((a, b) => {
    const pa = phdFor(a), pb = phdFor(b);
    let comparison = 0;
    if (sort === 'Priority') comparison = priorityOrder[pa.priority] - priorityOrder[pb.priority];
    if (sort === 'Research fit') comparison = fitScore(pb) - fitScore(pa);
    if (sort === 'Readiness') comparison = applicationReadiness(b).completed - applicationReadiness(a).completed;
    return comparison || deadline(a).localeCompare(deadline(b)) ||
      a.university.localeCompare(b.university) || a.id.localeCompare(b.id);
  });
}

/** Work queue for PhD preparation; an empty action or closed application is excluded. */
export function nextPhdActions(apps) {
  return apps
    .filter(app => app.status !== 'Closed' && phdFor(app).nextAction.trim())
    .sort((a, b) =>
      (phdFor(a).actionDue || '9999-12-31').localeCompare(phdFor(b).actionDue || '9999-12-31') ||
      (a.deadline || '9999-12-31').localeCompare(b.deadline || '9999-12-31') ||
      a.university.localeCompare(b.university) || a.id.localeCompare(b.id))
    .slice(0, 5);
}

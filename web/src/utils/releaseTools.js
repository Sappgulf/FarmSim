import { APP_VERSION, isReleaseMode } from '../config/release';
import { getContentManager } from '../content/ContentManager';
import { getConsoleEvents, getDebugMetrics, isDebugMode } from './debugTools';
import { loadSavedState, SAVE_KEY } from '../components/farm-sim/context/GamePersistence';

const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

const buildGate = ({ id, label, status, detail, meta }) => ({
  id,
  label,
  status,
  detail,
  meta,
});

const getQaSummary = () => {
  if (typeof window === 'undefined') return null;
  return window.__farmQaLastSummary || null;
};

const getContentStatus = () => {
  const content = getContentManager();
  const report = content?.report || { errors: [], warnings: [] };
  const status = report.errors.length === 0 ? 'pass' : 'fail';
  const detail = report.errors.length
    ? `${report.errors.length} error(s) found.`
    : `${report.warnings.length} warning(s) logged.`;
  return buildGate({
    id: 'content_validation',
    label: 'Content validation',
    status,
    detail,
    meta: { errors: report.errors.length, warnings: report.warnings.length },
  });
};

const getConsoleStatus = () => {
  if (!isDebugMode()) {
    return buildGate({
      id: 'console_hygiene',
      label: 'Console hygiene',
      status: 'skip',
      detail: 'Enable ?debug=1 to capture console errors.',
    });
  }
  const debugMetrics = getDebugMetrics() || {};
  const consoleEvents = getConsoleEvents();
  const errorCount = consoleEvents?.errors?.length || debugMetrics.consoleErrorCount || 0;
  const hasUnhandled = Boolean(debugMetrics.lastError);
  const status = errorCount === 0 && !hasUnhandled ? 'pass' : 'fail';
  const detailParts = [];
  if (errorCount > 0) detailParts.push(`${errorCount} console error(s)`);
  if (hasUnhandled) detailParts.push('Unhandled exception captured');
  const detail = detailParts.length ? detailParts.join(' · ') : 'No console errors detected.';
  return buildGate({
    id: 'console_hygiene',
    label: 'Console hygiene',
    status,
    detail,
  });
};

const getQaGateStatus = () => {
  const summary = getQaSummary();
  if (!summary) {
    return buildGate({
      id: 'qa_harness',
      label: 'QA harness suite',
      status: 'skip',
      detail: 'Run the QA suite in debug mode to generate results.',
    });
  }
  const status = summary.status === 'pass' ? 'pass' : 'fail';
  const detail = `Suite ${summary.status?.toUpperCase() || 'UNKNOWN'} (${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped).`;
  return buildGate({
    id: 'qa_harness',
    label: 'QA harness suite',
    status,
    detail,
    meta: summary,
  });
};

const getSaveLoadStatus = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return buildGate({
      id: 'save_load',
      label: 'Save/load verification',
      status: 'skip',
      detail: 'No localStorage available in this environment.',
    });
  }

  const hasSave = Boolean(localStorage.getItem(SAVE_KEY));
  const loaded = loadSavedState();
  if (!hasSave) {
    return buildGate({
      id: 'save_load',
      label: 'Save/load verification',
      status: 'skip',
      detail: 'No save found to validate; create and reload a save.',
    });
  }

  return buildGate({
    id: 'save_load',
    label: 'Save/load verification',
    status: loaded ? 'pass' : 'fail',
    detail: loaded ? 'Latest save loaded without migration errors.' : 'Save failed to load/migrate.',
  });
};

const getVersionStatus = () => buildGate({
  id: 'semver',
  label: 'APP_VERSION format',
  status: SEMVER_REGEX.test(APP_VERSION) ? 'pass' : 'fail',
  detail: SEMVER_REGEX.test(APP_VERSION) ? `APP_VERSION ${APP_VERSION} is valid semver.` : `APP_VERSION ${APP_VERSION} is invalid.`,
});

export const getReleaseGateSummary = () => {
  const gates = [
    getVersionStatus(),
    getQaGateStatus(),
    getContentStatus(),
    getConsoleStatus(),
    getSaveLoadStatus(),
  ];

  const status = gates.every((gate) => gate.status === 'pass') ? 'pass' : 'fail';
  return {
    version: APP_VERSION,
    status,
    gates,
  };
};

export const canRelease = () => {
  if (isReleaseMode()) {
    const summary = {
      version: APP_VERSION,
      status: 'fail',
      gates: [buildGate({
        id: 'release_mode',
        label: 'Release gate runner',
        status: 'skip',
        detail: 'Release mode active; run gates in development mode.',
      })],
    };
    console.info('[release]', 'Release gates skipped: release mode active.', summary);
    return summary;
  }

  const summary = getReleaseGateSummary();
  const header = summary.status === 'pass' ? 'PASS' : 'FAIL';
  console.info(`[release] Gate summary: ${header}`, {
    version: summary.version,
    status: summary.status,
  });
  summary.gates.forEach((gate) => {
    const icon = gate.status === 'pass' ? '✅' : gate.status === 'skip' ? '⚠️' : '❌';
    console.info(`[release] ${icon} ${gate.label}: ${gate.detail}`);
  });
  return summary;
};

export const attachReleaseTools = ({ getState } = {}) => {
  if (typeof window === 'undefined') return;
  window.canRelease = () => canRelease({ state: getState?.() });
  window.getReleaseGateSummary = () => getReleaseGateSummary({ state: getState?.() });
};

export const detachReleaseTools = () => {
  if (typeof window === 'undefined') return;
  delete window.canRelease;
  delete window.getReleaseGateSummary;
};

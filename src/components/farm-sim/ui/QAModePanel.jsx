import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameActions, useGameStore, useGameSystems } from '../context/GameContext';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import {
  clearConsoleEvents,
  clearDebugError,
  getConsoleEvents,
  getDebugMetrics,
  isDebugMode,
  logDebugAction,
} from '../../../utils/debugTools';
import { canRelease } from '../../../utils/releaseTools';
import {
  QA_BACKUP_SAVE_KEY,
  QA_SAVE_KEY,
  clearSaveKey,
} from '../context/GamePersistence';
import {
  advanceChallengeDays,
  clearBuildings,
  clearNotifications,
  fillAllPlots,
  placeBuildings,
  spawnNotifications,
} from '../debug/debugActions';
import { QA_TESTS } from '../qa/qaTests';

const STATUS_COLORS = {
  pass: 'text-emerald-300',
  fail: 'text-red-300',
  skip: 'text-yellow-300',
  running: 'text-blue-300',
};

const cloneState = (state) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(state);
  }
  return JSON.parse(JSON.stringify(state));
};

const QAModePanel = memo(() => {
  const actions = useGameActions();
  const systems = useGameSystems();
  const store = useGameStore();
  const debugEnabled = isDebugMode();
  const [results, setResults] = useState([]);
  const [suiteSummary, setSuiteSummary] = useState(null);
  const [releaseSummary, setReleaseSummary] = useState(null);
  const [running, setRunning] = useState(false);
  const [activeTestId, setActiveTestId] = useState(null);
  const [copyStatus, setCopyStatus] = useState(null);

  const getState = useCallback(() => store.getState(), [store]);
  const systemsRef = useRef(systems);

  useEffect(() => {
    systemsRef.current = systems;
  }, [systems]);

  const sleep = useCallback((ms) => new Promise((resolve) => setTimeout(resolve, ms)), []);

  const waitForPanel = useCallback(async (tabId, timeoutMs = 1500) => {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      const panel = document.getElementById(`panel-${tabId}`);
      if (panel) return panel;
      await sleep(50);
    }
    return null;
  }, [sleep]);

  const switchToTab = useCallback(async (tabId) => {
    if (typeof window === 'undefined' || typeof window.switchToTab !== 'function') {
      throw new Error('window.switchToTab not available');
    }
    window.switchToTab(tabId);
    const panel = await waitForPanel(tabId);
    if (!panel) {
      throw new Error(`Tab panel not found for ${tabId}`);
    }
    return panel;
  }, [waitForPanel]);

  const helpers = useMemo(() => ({
    fillAllPlots: (status) => fillAllPlots(getState(), actions, status),
    spawnNotifications: (count) => spawnNotifications(actions, count),
    clearNotifications: () => clearNotifications(getState(), actions),
    placeBuildings: () => placeBuildings(actions),
    clearBuildings: () => clearBuildings(actions),
    advanceChallengeDays: (days) => advanceChallengeDays(getState(), actions, days),
  }), [actions, getState]);

  const getDebugMetricsSafe = useCallback(() => (
    getDebugMetrics() || {
      timerCount: 0,
      listenerCount: 0,
      consoleErrorCount: 0,
      consoleWarnCount: 0,
      lastError: null,
    }
  ), []);

  const getPerfSnapshot = useCallback((label) => {
    const perf = typeof window !== 'undefined' ? window.__farmPerfMetrics : null;
    const debug = getDebugMetricsSafe();
    const snapshotState = getState() || {};
    return {
      label,
      timestamp: new Date().toISOString(),
      fpsAvg: Math.round(perf?.avgFps || window.__currentFPS || 0),
      frameAvgMs: Number(perf?.avgFrameTime || 0),
      frameWorstMs: Number(perf?.worstFrameTime || 0),
      updateMs: Number(perf?.updateTime || window.__lastUpdateTime || 0),
      renderMs: Number(perf?.renderTime || 0),
      memoryMb: Number(perf?.memory || 0),
      counts: {
        plots: snapshotState.plots?.length || 0,
        notifications: snapshotState.notifications?.length || 0,
        timers: debug.timerCount || 0,
        listeners: debug.listenerCount || 0,
      },
    };
  }, [getDebugMetricsSafe, getState]);

  const buildReport = useCallback((summary, testResults) => {
    const lines = [];
    lines.push('# QA Suite Report');
    lines.push(`Date: ${new Date().toISOString()}`);
    if (summary) {
      lines.push(`Suite Status: ${summary.status.toUpperCase()}`);
      lines.push(`Totals: ${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped`);
    }
    if (summary?.metrics?.start) {
      lines.push(`Suite Start Metrics: ${JSON.stringify(summary.metrics.start)}`);
    }
    if (summary?.metrics?.end) {
      lines.push(`Suite End Metrics: ${JSON.stringify(summary.metrics.end)}`);
    }
    lines.push('');
    lines.push('## Test Results');
    testResults.forEach((result) => {
      lines.push(`- [${result.status.toUpperCase()}] ${result.name} (${result.durationMs}ms) @ ${result.startedAt}`);
      if (result.errors?.length) {
        lines.push(`  Errors: ${result.errors.map((err) => err.message || err).join(' | ')}`);
      }
      if (result.console?.errors?.length) {
        lines.push(`  Console Errors: ${result.console.errors.length}`);
      }
      if (result.console?.warnings?.length) {
        lines.push(`  Console Warnings: ${result.console.warnings.length}`);
      }
      if (result.metrics?.start) {
        lines.push(`  Metrics Start: ${JSON.stringify(result.metrics.start)}`);
      }
      if (result.metrics?.end) {
        lines.push(`  Metrics End: ${JSON.stringify(result.metrics.end)}`);
      }
      if (result.detail) {
        lines.push(`  Detail: ${result.detail}`);
      }
    });
    return lines.join('\n');
  }, []);

  const runTest = useCallback(async (test, testBaselineState) => {
    const startedAt = new Date().toISOString();
    const logs = [];
    const log = (message) => {
      logs.push({ time: new Date().toISOString(), message });
    };

    clearConsoleEvents();
    clearDebugError();

    if (testBaselineState) {
      actions.debugLoadState?.(testBaselineState);
      await sleep(50);
    }

    const ctx = {
      state: getState,
      actions,
      systems: systemsRef.current,
      helpers,
      sleep,
      switchToTab,
      waitForPanel,
      log,
      getDebugMetrics: getDebugMetricsSafe,
    };

    const metricsStart = getPerfSnapshot('test-start');
    const startTime = performance.now();
    let status = 'pass';
    let detail = null;
    let errors = [];

    try {
      const runPromise = test.run(ctx);
      const timeoutMs = test.timeoutMs || 10000;
      const result = await Promise.race([
        runPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout')), timeoutMs)),
      ]);
      if (result?.status === 'skip') {
        status = 'skip';
        detail = result.reason || 'Skipped';
      } else {
        detail = result?.detail || null;
      }
    } catch (error) {
      status = 'fail';
      errors.push(error);
    }

    const consoleEvents = getConsoleEvents();
    const debugMetrics = getDebugMetricsSafe();
    if (debugMetrics.lastError) {
      status = 'fail';
      errors.push(new Error(`Unhandled error: ${debugMetrics.lastError.message}`));
    }
    if (consoleEvents.errors.length > 0) {
      status = 'fail';
      errors = errors.concat(
        consoleEvents.errors.map((entry) => new Error(entry.message || 'Console error'))
      );
    }

    const durationMs = Math.round(performance.now() - startTime);
    const metricsEnd = getPerfSnapshot('test-end');

    return {
      id: test.id,
      name: test.name,
      status,
      startedAt,
      durationMs,
      logs,
      errors,
      detail,
      console: consoleEvents,
      metrics: { start: metricsStart, end: metricsEnd },
    };
  }, [actions, getDebugMetricsSafe, getPerfSnapshot, getState, helpers, sleep, switchToTab, waitForPanel]);

  const runTests = useCallback(async (testIds) => {
    if (running) return;
    setRunning(true);
    setResults([]);
    setSuiteSummary(null);
    setActiveTestId(null);

    const originalState = cloneState(getState());
    const testBaseline = cloneState(originalState);
    testBaseline.settings = { ...testBaseline.settings, autoSave: false };
    testBaseline.gameLoop = { ...testBaseline.gameLoop, paused: true };

    actions.debugLoadState?.(testBaseline);
    await sleep(80);

    logDebugAction('qa_suite_start', { tests: testIds });

    const suiteMetricsStart = getPerfSnapshot('suite-start');
    const selectedTests = QA_TESTS.filter((test) => testIds.includes(test.id));
    const nextResults = [];

    for (const test of selectedTests) {
      setActiveTestId(test.id);
      const result = await runTest(test, testBaseline);
      nextResults.push(result);
      setResults([...nextResults]);
    }

    const suiteMetricsEnd = getPerfSnapshot('suite-end');
    const failed = nextResults.filter((res) => res.status === 'fail').length;
    const skipped = nextResults.filter((res) => res.status === 'skip').length;
    const passed = nextResults.filter((res) => res.status === 'pass').length;
    const summary = {
      status: failed > 0 ? 'fail' : 'pass',
      passed,
      failed,
      skipped,
      metrics: { start: suiteMetricsStart, end: suiteMetricsEnd },
    };

    setSuiteSummary(summary);
    setActiveTestId(null);
    if (typeof window !== 'undefined') {
      window.__farmQaLastSummary = summary;
    }

    actions.debugLoadState?.(originalState);
    await sleep(80);
    logDebugAction('qa_suite_end', summary);

    setRunning(false);
  }, [actions, getPerfSnapshot, getState, runTest, running, sleep]);

  const handleCopyReport = useCallback(async () => {
    try {
      const report = buildReport(suiteSummary, results);
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(report);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = report;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopyStatus('copied');
    } catch (error) {
      setCopyStatus('failed');
    } finally {
      setTimeout(() => setCopyStatus(null), 2000);
    }
  }, [buildReport, results, suiteSummary]);

  const handleReleaseCheck = useCallback(() => {
    const summary = canRelease();
    setReleaseSummary(summary);
  }, []);

  const handleClearQaData = useCallback(() => {
    clearSaveKey(QA_SAVE_KEY);
    clearSaveKey(QA_BACKUP_SAVE_KEY);
    actions.addNotification({
      message: '🧹 Cleared QA save data.',
      type: 'info',
    });
  }, [actions]);

  if (!debugEnabled) return null;

  const testButtons = QA_TESTS.map((test) => (
    <Button
      key={test.id}
      size="sm"
      variant="outline"
      className="h-9 text-[11px]"
      onClick={() => runTests([test.id])}
      disabled={running}
    >
      Run: {test.name}
    </Button>
  ));

  return (
    <div className="fixed bottom-24 right-2 left-2 sm:left-auto sm:w-[420px] z-[9998]">
      <Card className="bg-slate-900/95 text-white border border-slate-700 shadow-2xl p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold tracking-wide text-slate-200">🧪 QA Mode</div>
          <div className="text-[10px] text-slate-400">
            {running ? `Running: ${activeTestId || 'suite'}` : 'Idle'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            size="sm"
            className="h-9 col-span-2"
            onClick={() => runTests(QA_TESTS.map((test) => test.id))}
            disabled={running}
          >
            Run QA Suite
          </Button>
          {testButtons}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span>
            {suiteSummary
              ? `Suite: ${suiteSummary.passed} pass / ${suiteSummary.failed} fail / ${suiteSummary.skipped} skip`
              : 'No QA runs yet.'}
          </span>
          <Button size="sm" variant="ghost" onClick={handleCopyReport} className="h-7 px-2 text-[11px]">
            {copyStatus === 'copied' ? 'Copied' : copyStatus === 'failed' ? 'Copy failed' : 'Copy Report'}
          </Button>
        </div>

        {releaseSummary && (
          <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-2 text-[11px] text-slate-300">
            <div className="font-semibold text-slate-200">
              Release Gates: {releaseSummary.status.toUpperCase()}
            </div>
            <ul className="mt-1 space-y-1">
              {releaseSummary.gates.map((gate) => (
                <li key={gate.id}>
                  {gate.status.toUpperCase()}: {gate.label} — {gate.detail}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="max-h-64 overflow-auto space-y-2 pr-1">
          {results.map((result) => (
            <details key={result.id} className="rounded-lg border border-slate-700 bg-slate-950/60 p-2">
              <summary className={`cursor-pointer text-xs font-semibold ${STATUS_COLORS[result.status] || 'text-slate-200'}`}>
                {result.status.toUpperCase()} • {result.name} • {result.durationMs}ms • {result.startedAt}
              </summary>
              <div className="mt-2 space-y-1 text-[11px] text-slate-300">
                <div>Started: {result.startedAt}</div>
                {result.detail && <div>Detail: {result.detail}</div>}
                {result.errors?.length > 0 && (
                  <div className="text-red-300">
                    Errors:
                    <ul className="ml-4 list-disc">
                      {result.errors.map((error, index) => (
                        <li key={`${result.id}-err-${index}`}>{error.message || String(error)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.console?.errors?.length > 0 && (
                  <div className="text-red-300">
                    Console Errors:
                    <ul className="ml-4 list-disc">
                      {result.console.errors.slice(0, 5).map((entry, index) => (
                        <li key={`${result.id}-cerr-${index}`}>{entry.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.console?.warnings?.length > 0 && (
                  <div className="text-yellow-200">
                    Console Warnings:
                    <ul className="ml-4 list-disc">
                      {result.console.warnings.slice(0, 5).map((entry, index) => (
                        <li key={`${result.id}-cwarn-${index}`}>{entry.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.metrics?.start && (
                  <div className="text-slate-400">Metrics Start: {JSON.stringify(result.metrics.start)}</div>
                )}
                {result.metrics?.end && (
                  <div className="text-slate-400">Metrics End: {JSON.stringify(result.metrics.end)}</div>
                )}
              </div>
            </details>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={handleReleaseCheck}>
            Check Release Gates
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={handleClearQaData}>
            Clear QA Data
          </Button>
        </div>
        <div className="text-[10px] text-slate-500">
          Debug-only QA harness. No production impact.
        </div>
      </Card>
    </div>
  );
});

QAModePanel.displayName = 'QAModePanel';

export default QAModePanel;

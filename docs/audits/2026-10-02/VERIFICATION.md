# Observed verification summary

These are summaries of tool-observed results, not fabricated command logs. Date: 2026-10-02.

- Web test command: `npm run test`. Exit 0. 41 test files, 138 tests passed. Duration 24.19s. One jsdom message: `Not implemented: navigation to another Document`.
- Web build command: `npm run build`. Exit 1. TypeScript errors: `FarmOverview.tsx:37` Record has no length; `:38` Record has no filter and callback parameter is implicitly any; `FieldPlanning.tsx:32` Record has no filter and callback parameter is implicitly any.
- Native core command: `swift test --package-path ios/GameCore`. Exit 0. 108 XCTest cases passed, zero failures. Warnings included an unhandled test Info.plist and variables that could be constants. The core perf output reported a 20×20 average simulation tick of 0.061ms; this is not whole-app frame or physical-device evidence.
- Native app command: `xcodebuild -project ios/FarmSim.xcodeproj -scheme FarmSim -destination 'generic/platform=iOS Simulator' -derivedDataPath /tmp/farmsim-audit-20261002-derived CODE_SIGNING_ALLOWED=NO build`. Exit 65. Both target architectures reported `GameStore.swift:2028:65: Expected ',' separator` and `Expected expression in list of expressions`. Full local output was captured in `ios-build.log` (ignored by the repository's *.log rule).
- Original browser entry and Fields route: blank document, observed TypeError. See current-browser-errors.json and screenshots 01/13.
- Original Barn: shipped five wheat; cash 2430→2540, wheat 60→55, order 60→55. See screenshots 02/03.
- Diagnostic copy: collection-access corrections only, in a temporary directory on a separate local origin. Initial 12 selected plots planted wheat. Four water/advance cycles reached day 16 and twelve ready plots. Harvest increased wheat to 84. Collection yielded one cheese. Entering 1.5 wheat shipment paid 33 and yielded 82.5 wheat and 58.5 remaining order quantity. Refresh preserved these values and cheese; subtab reset to Barn.
- Responsive observations: 1280×720 primary planting button top 741.109375/bottom 785.109375; root overflow-y hidden; document height 899. At 390×844, page width 390; harvest button top 1319.6640625, page height 1476; day/season spans display none. Mobile ship/remove buttons 27×27.
- Probe command: `node docs/audits/2026-10-02/reproduce-simulation.mjs`. Exit 0 on final run. Current simulation/storage modules executed as temporary stripped TypeScript copies. Results saved in simulation-observations.json.
- Saved screenshots 01–13 were individually opened and visually inspected. Blank original captures are blocker records. Diagnostic shots establish only the temporary-copy behavior, not the original application’s health.
- Existing application edits and unrelated untracked data were preserved; no game implementation, dependency installation, commit, push, or deployment was performed by this audit.

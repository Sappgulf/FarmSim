.PHONY: generate build core-tests

generate:
	xcodegen generate --spec project.yml

build:
	xcodebuild -project FarmSim.xcodeproj -scheme FarmSim -destination 'platform=iOS Simulator,name=iPhone 15' build

core-tests:
	swift test --package-path GameCore

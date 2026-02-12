.PHONY: ios-gen ios-build ios-build-small ios-build-large ios-run core-tests

LATEST_DEVICE ?= iPhone 17
SMALL_DEVICE ?= iPhone 16e
LARGE_DEVICE ?= iPhone 17 Pro Max
IOS_DEVICE ?= $(LATEST_DEVICE)

ios-gen:
	xcodegen generate --spec project.yml

ios-build: ios-gen
	xcodebuild -project FarmSim.xcodeproj -scheme FarmSim -destination 'platform=iOS Simulator,name=$(IOS_DEVICE)' build

ios-build-small: ios-gen
	xcodebuild -project FarmSim.xcodeproj -scheme FarmSim -destination 'platform=iOS Simulator,name=$(SMALL_DEVICE)' build

ios-build-large: ios-gen
	xcodebuild -project FarmSim.xcodeproj -scheme FarmSim -destination 'platform=iOS Simulator,name=$(LARGE_DEVICE)' build

ios-run:
	open -a Simulator

core-tests:
	swift test --package-path GameCore

.PHONY: ios-gen ios-build ios-build-small ios-build-large ios-run core-tests

IOS_DESTINATION ?= generic/platform=iOS Simulator
SMALL_DESTINATION ?= $(IOS_DESTINATION)
LARGE_DESTINATION ?= $(IOS_DESTINATION)

ios-gen:
	xcodegen generate --spec project.yml

ios-build: ios-gen
	xcodebuild -project FarmSim.xcodeproj -scheme FarmSim -destination '$(IOS_DESTINATION)' build

ios-build-small: ios-gen
	xcodebuild -project FarmSim.xcodeproj -scheme FarmSim -destination '$(SMALL_DESTINATION)' build

ios-build-large: ios-gen
	xcodebuild -project FarmSim.xcodeproj -scheme FarmSim -destination '$(LARGE_DESTINATION)' build

ios-run:
	open -a Simulator

core-tests:
	swift test --package-path GameCore

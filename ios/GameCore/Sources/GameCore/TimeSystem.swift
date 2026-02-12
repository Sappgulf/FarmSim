import Foundation

public enum TimeSystem {
    public static func advanceDay(world: inout WorldState) {
        world.day += 1
    }
}

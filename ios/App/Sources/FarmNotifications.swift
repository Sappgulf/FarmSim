import Foundation
import UserNotifications

enum FarmNotifications {
    private static let cropsReadyIdentifier = "com.austinbeatty.farmsim.crops_ready"

    static func scheduleCropsReadyReminder(
        day: Int,
        readyCrops: Int,
        plantedCrops: Int = 0,
        farmName: String,
        secondsUntilReady: TimeInterval? = nil
    ) {
        let hasCrops = readyCrops > 0 || plantedCrops > 0
        guard hasCrops else { return }

        let delay: TimeInterval
        let title: String
        let body: String

        if readyCrops > 0 {
            // Crops already ready — fire after 15 minutes as a reminder
            delay = 15 * 60
            title = "Crops Ready on \(farmName)!"
            body = "Day \(day): \(readyCrops) crop\(readyCrops == 1 ? "" : "s") can be harvested."
        } else if let seconds = secondsUntilReady, seconds > 0 {
            // Crops growing — fire when they will be ready (minimum 5 minutes)
            delay = max(5 * 60, seconds)
            title = "Crops Almost Ready on \(farmName)"
            body = "Day \(day): Head back to the farm, your crops are ready to harvest!"
        } else {
            return
        }

        Task {
            let center = UNUserNotificationCenter.current()
            let granted = try? await center.requestAuthorization(options: [.alert, .sound, .badge])
            guard granted == true else { return }

            let content = UNMutableNotificationContent()
            content.title = title
            content.body = body
            content.sound = .default

            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: delay, repeats: false)
            let request = UNNotificationRequest(identifier: cropsReadyIdentifier, content: content, trigger: trigger)

            center.removePendingNotificationRequests(withIdentifiers: [cropsReadyIdentifier])
            try? await center.add(request)
        }
    }

    static func clearCropsReadyReminder() {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [cropsReadyIdentifier])
        center.removeDeliveredNotifications(withIdentifiers: [cropsReadyIdentifier])
    }
}

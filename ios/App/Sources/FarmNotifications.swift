import Foundation
import UserNotifications

enum FarmNotifications {
    private static let cropsReadyIdentifier = "com.austinbeatty.farmsim.crops_ready"

    static func scheduleCropsReadyReminder(day: Int, readyCrops: Int, farmName: String) {
        guard readyCrops > 0 else { return }

        Task {
            let center = UNUserNotificationCenter.current()
            let granted = try? await center.requestAuthorization(options: [.alert, .sound, .badge])
            guard granted == true else { return }

            let content = UNMutableNotificationContent()
            content.title = "Crops Ready on \(farmName)"
            content.body = "Day \(day): \(readyCrops) crop\(readyCrops == 1 ? "" : "s") can be harvested."
            content.sound = .default

            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)
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

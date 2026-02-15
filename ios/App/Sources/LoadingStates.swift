import SwiftUI
import Foundation

// MARK: - Loading State Manager

@MainActor
class LoadingStateManager: ObservableObject {
    @Published var isLoading = false
    @Published var loadingMessage = ""
    @Published var progress: Double = 0
    
    private var loadingTasks: [String: Task<Void, Never>] = [:]
    
    func startLoading(message: String = "Loading...") {
        loadingMessage = message
        progress = 0
        isLoading = true
    }
    
    func updateProgress(_ value: Double) {
        progress = min(max(value, 0), 1)
    }
    
    func finishLoading() {
        withAnimation(.easeOut(duration: 0.3)) {
            isLoading = false
            progress = 1
        }
    }
    
    func performLoadingTask<T>(
        message: String,
        operation: @escaping () async throws -> T
    ) async throws -> T {
        startLoading(message: message)
        defer { finishLoading() }
        
        // Simulate progress updates
        let progressTask = Task {
            for i in 0..<10 {
                try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
                await MainActor.run {
                    updateProgress(Double(i) / 10.0)
                }
            }
        }
        
        let result = try await operation()
        progressTask.cancel()
        updateProgress(1.0)
        
        return result
    }
}

// MARK: - Loading Overlay View

struct LoadingOverlay: View {
    let message: String
    let progress: Double
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.6)
                .ignoresSafeArea()
            
            VStack(spacing: 20) {
                // Animated tractor
                LoadingTractorAnimation()
                    .frame(width: 80, height: 80)
                
                Text(message)
                    .font(.system(.headline, weight: .medium))
                    .foregroundStyle(.white)
                
                // Progress bar
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(.white.opacity(0.2))
                            .frame(height: 8)
                        
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Theme.coinGold)
                            .frame(width: geometry.size.width * progress, height: 8)
                    }
                }
                .frame(width: 200, height: 8)
                
                Text("\(Int(progress * 100))%")
                    .font(.system(.caption, weight: .medium))
                    .foregroundStyle(.white.opacity(0.7))
            }
            .padding(30)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)
                    .shadow(radius: 20)
            )
        }
        .transition(.opacity)
    }
}

// MARK: - Loading Tractor Animation

struct LoadingTractorAnimation: View {
    @State private var rotation: Double = 0
    @State private var bounce: CGFloat = 0
    
    var body: some View {
        ZStack {
            // Tractor body
            Text("🚜")
                .font(.system(size: 48))
                .offset(y: bounce)
            
            // Animated wheels
            HStack(spacing: 8) {
                WheelView(rotation: rotation)
                    .offset(y: bounce)
                WheelView(rotation: rotation)
                    .offset(y: bounce)
            }
            .offset(y: 15)
        }
        .onAppear {
            withAnimation(.linear(duration: 1).repeatForever(autoreverses: false)) {
                rotation = 360
            }
            withAnimation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true)) {
                bounce = -5
            }
        }
    }
}

struct WheelView: View {
    let rotation: Double
    
    var body: some View {
        Image(systemName: "gear")
            .font(.system(.title2, weight: .bold))
            .foregroundStyle(.gray)
            .rotationEffect(.degrees(rotation))
    }
}

// MARK: - Skeleton Loading Views

struct SkeletonCard: View {
    @State private var isAnimating = false
    
    var body: some View {
        RoundedRectangle(cornerRadius: 12)
            .fill(.gray.opacity(0.2))
            .overlay(
                GeometryReader { geometry in
                    LinearGradient(
                        colors: [
                            .clear,
                            .white.opacity(0.3),
                            .clear
                        ],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .offset(x: isAnimating ? geometry.size.width : -geometry.size.width)
                }
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    isAnimating = true
                }
            }
    }
}

struct SkeletonGrid: View {
    let columns: Int
    let rows: Int
    
    var body: some View {
        VStack(spacing: 12) {
            ForEach(0..<rows, id: \.self) { _ in
                HStack(spacing: 12) {
                    ForEach(0..<columns, id: \.self) { _ in
                        SkeletonCard()
                            .frame(height: 100)
                    }
                }
            }
        }
        .padding()
    }
}

// MARK: - Pull to Refresh

struct PullToRefresh: View {
    let coordinateSpaceName: String
    let onRefresh: () -> Void
    
    @State private var needRefresh = false
    @State private var isRefreshing = false
    @State private var pullDistance: CGFloat = 0
    
    var body: some View {
        GeometryReader { geometry in
            if geometry.frame(in: .named(coordinateSpaceName)).midY > 50 {
                Spacer()
                    .onAppear {
                        needRefresh = true
                    }
            } else if geometry.frame(in: .named(coordinateSpaceName)).maxY < 10 {
                Spacer()
                    .onAppear {
                        if needRefresh {
                            needRefresh = false
                            isRefreshing = true
                            onRefresh()
                            DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                                isRefreshing = false
                            }
                        }
                    }
            }
            
            HStack {
                Spacer()
                if isRefreshing {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Image(systemName: "arrow.down")
                        .foregroundStyle(.white)
                        .rotationEffect(.degrees(needRefresh ? 180 : 0))
                        .animation(.easeInOut, value: needRefresh)
                }
                Spacer()
            }
        }
        .padding(.top, -50)
        .frame(height: 50)
    }
}

// MARK: - Toast Notification System

struct Toast: Identifiable {
    let id = UUID()
    let title: String
    let message: String?
    let icon: String
    let color: Color
    let duration: TimeInterval
    
    static func success(_ title: String, message: String? = nil) -> Toast {
        Toast(title: title, message: message, icon: "checkmark.circle.fill", color: .green, duration: 3)
    }
    
    static func info(_ title: String, message: String? = nil) -> Toast {
        Toast(title: title, message: message, icon: "info.circle.fill", color: .blue, duration: 3)
    }
    
    static func warning(_ title: String, message: String? = nil) -> Toast {
        Toast(title: title, message: message, icon: "exclamationmark.triangle.fill", color: .orange, duration: 4)
    }
    
    static func error(_ title: String, message: String? = nil) -> Toast {
        Toast(title: title, message: message, icon: "xmark.circle.fill", color: .red, duration: 4)
    }
}

@MainActor
class ToastManager: ObservableObject {
    @Published var toasts: [Toast] = []
    
    func show(_ toast: Toast) {
        toasts.append(toast)
        
        DispatchQueue.main.asyncAfter(deadline: .now() + toast.duration) { [weak self] in
            self?.dismiss(toast)
        }
    }
    
    func dismiss(_ toast: Toast) {
        withAnimation(.easeOut(duration: 0.3)) {
            toasts.removeAll { $0.id == toast.id }
        }
    }
}

struct ToastView: View {
    let toast: Toast
    let onDismiss: () -> Void
    
    @State private var offset: CGFloat = 0
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: toast.icon)
                .font(.system(.title3))
                .foregroundStyle(toast.color)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(toast.title)
                    .font(.system(.subheadline, weight: .semibold))
                
                if let message = toast.message {
                    Text(message)
                        .font(.system(.caption))
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
            }
            
            Spacer()
            
            Button(action: onDismiss) {
                Image(systemName: "xmark")
                    .font(.system(.caption, weight: .bold))
                    .foregroundStyle(.secondary)
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(.ultraThinMaterial)
                .shadow(color: .black.opacity(0.15), radius: 8, x: 0, y: 4)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(toast.color.opacity(0.3), lineWidth: 1)
        )
        .offset(x: offset)
        .gesture(
            DragGesture()
                .onChanged { gesture in
                    offset = gesture.translation.width
                }
                .onEnded { gesture in
                    if abs(gesture.translation.width) > 100 {
                        withAnimation(.easeOut) {
                            onDismiss()
                        }
                    } else {
                        withAnimation(.spring()) {
                            offset = 0
                        }
                    }
                }
        )
    }
}

struct ToastContainer: View {
    @StateObject private var manager = ToastManager()
    
    var body: some View {
        ZStack {
            // Main content would go here
        }
        .overlay(
            VStack(spacing: 8) {
                Spacer()
                
                ForEach(manager.toasts) { toast in
                    ToastView(toast: toast) {
                        manager.dismiss(toast)
                    }
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 100)
            , alignment: .bottom
        )
        .environmentObject(manager)
    }
}

// MARK: - View Extensions

extension View {
    func withLoadingOverlay(
        isLoading: Bool,
        message: String = "Loading...",
        progress: Double = 0
    ) -> some View {
        ZStack {
            self
            
            if isLoading {
                LoadingOverlay(message: message, progress: progress)
            }
        }
    }
    
    func withToastContainer() -> some View {
        self.modifier(ToastContainerModifier())
    }
}

struct ToastContainerModifier: ViewModifier {
    @StateObject private var manager = ToastManager()
    
    func body(content: Content) -> some View {
        ZStack {
            content
            
            VStack(spacing: 8) {
                Spacer()
                
                ForEach(manager.toasts) { toast in
                    ToastView(toast: toast) {
                        manager.dismiss(toast)
                    }
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 100)
        }
        .environmentObject(manager)
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 20) {
        LoadingTractorAnimation()
            .frame(width: 100, height: 100)
        
        ToastView(
            toast: .success("Harvest Complete!", message: "You harvested 12 wheat"),
            onDismiss: {}
        )
        .padding(.horizontal)
        
        SkeletonGrid(columns: 2, rows: 2)
    }
    .padding()
}

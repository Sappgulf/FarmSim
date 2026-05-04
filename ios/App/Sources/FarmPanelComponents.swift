import SwiftUI

struct FarmPanelBackground: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.08, green: 0.08, blue: 0.03),
                    Color(red: 0.16, green: 0.19, blue: 0.07),
                    Color(red: 0.05, green: 0.05, blue: 0.02)
                ],
                startPoint: .top,
                endPoint: .bottom
            )

            Image("grass")
                .resizable()
                .scaledToFill()
                .opacity(0.18)
                .blur(radius: 10)
        }
        .ignoresSafeArea()
    }
}

struct FarmPanelHeader<Trailing: View>: View {
    let title: String
    let subtitle: String
    let icon: String
    @ViewBuilder let trailing: Trailing

    var body: some View {
        HStack(spacing: DS.Space.md) {
            Image(systemName: icon)
                .font(.title3.weight(.bold))
                .foregroundStyle(DS.Color.money)
                .frame(width: 46, height: 46)
                .background(.black.opacity(0.28), in: RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous))

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(Typography.title)
                    .foregroundStyle(.white)
                Text(subtitle)
                    .font(Typography.caption)
                    .foregroundStyle(.white.opacity(0.72))
                    .lineLimit(1)
                    .minimumScaleFactor(0.75)
            }

            Spacer(minLength: 0)
            trailing
        }
        .padding(DS.Space.md)
        .background(
            RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                .fill(.black.opacity(0.58))
                .overlay(
                    RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                        .strokeBorder(Color.white.opacity(0.12), lineWidth: 1)
                )
        )
    }
}

struct FarmGlassPanel<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        content
            .padding(DS.Space.md)
            .background(
                RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color(red: 0.22, green: 0.18, blue: 0.08).opacity(0.88),
                                Color(red: 0.08, green: 0.07, blue: 0.03).opacity(0.92)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: DS.Radius.lg, style: .continuous)
                            .strokeBorder(Color.white.opacity(0.12), lineWidth: 1)
                    )
            )
            .shadow(color: .black.opacity(0.26), radius: 10, y: 4)
    }
}

struct FarmSegmentBar: View {
    let items: [String]
    let selectedIndex: Int

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: DS.Space.xs) {
                ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                    Text(item)
                        .font(Typography.caption.weight(.bold))
                        .foregroundStyle(index == selectedIndex ? .white : .white.opacity(0.72))
                        .padding(.horizontal, DS.Space.md)
                        .padding(.vertical, DS.Space.xs)
                        .background(
                            RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous)
                                .fill(index == selectedIndex ? DS.Color.accent : .black.opacity(0.32))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous)
                                .strokeBorder(Color.white.opacity(index == selectedIndex ? 0.18 : 0.08), lineWidth: 1)
                        )
                }
            }
        }
    }
}

struct FarmResourceBadge: View {
    let icon: String
    let value: String
    let tint: Color

    var body: some View {
        HStack(spacing: DS.Space.xxs) {
            Image(systemName: icon)
                .font(.caption.weight(.bold))
            Text(value)
                .font(Typography.metric)
                .lineLimit(1)
                .minimumScaleFactor(0.75)
        }
        .foregroundStyle(.white)
        .padding(.horizontal, DS.Space.sm)
        .padding(.vertical, 7)
        .background(.black.opacity(0.36), in: Capsule())
        .overlay(Capsule().strokeBorder(tint.opacity(0.55), lineWidth: 1))
    }
}

struct MiniInfoPill: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 3) {
            Image(systemName: icon)
                .font(.caption2)
            Text(text)
                .font(Typography.caption)
                .lineLimit(1)
        }
        .foregroundStyle(.white.opacity(0.75))
        .padding(.horizontal, 7)
        .padding(.vertical, 4)
        .background(.black.opacity(0.20), in: Capsule())
    }
}

struct FarmCapsuleButtonStyle: ButtonStyle {
    var tint: Color = DS.Color.accent

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Typography.caption.weight(.bold))
            .foregroundStyle(.white)
            .padding(.horizontal, DS.Space.sm)
            .padding(.vertical, DS.Space.xs)
            .background(
                LinearGradient(
                    colors: [tint, tint.opacity(0.72)],
                    startPoint: .top,
                    endPoint: .bottom
                ),
                in: RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous)
            )
            .overlay(
                RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous)
                    .strokeBorder(.white.opacity(0.16), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(DS.Animation.micro, value: configuration.isPressed)
    }
}


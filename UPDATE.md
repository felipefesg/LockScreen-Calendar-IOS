# 🔄 Update: Samsung-Faithful Layout (v2.0)

[#update-samsung-faithful-layout-v20](#update-samsung-faithful-layout-v20)

This update reworks the visual layout of the [LockScreen-Calendar-IOS](https://github.com/felipefesg/LockScreen-Calendar-IOS) script to sit much closer to the real Samsung One UI Always On Display calendar widget, while also improving reliability on iOS.

## ✨ What's New

[#-whats-new](#-whats-new)

- **Filled "today" circle.** The current day is now highlighted with a solid filled circle (matching One UI), instead of a hollow outline. The day number switches to a dark, high-contrast color inside the circle.
- **Compact month label.** The month name moved from a large centered title to a small, left-aligned label (e.g. "July 2026") sitting above the grid — matching how the Samsung widget presents it.
- **Lighter day typography.** Day numbers now use a light-weight font instead of bold, with only the current day rendered in a stronger weight. Non-today days feel closer to the airy, minimal look of the AOD widget.
- **Muted weekday header.** Weekday initials are dimmed by default, with only Sunday rendered in red — matching the Samsung convention (Saturday is no longer red).
- **Event dots.** Days that have an event in your iOS Calendar now get a small dot underneath the number, similar to how Samsung's calendar widget flags days with scheduled items. Requires Calendar permission on first run.
- **Readability panel.** A translucent rounded panel is drawn behind the grid so the calendar stays legible on any wallpaper — bright, dark, or busy. On a real Galaxy AOD screen this isn't needed (it's pure black), but on iOS the calendar always sits on top of a photo, so this compensates for that platform difference.
- **Locale-aware month/weekday names.** Labels are generated through `Intl` (`toLocaleDateString`) instead of a hardcoded English array, so the script now correctly renders in other languages (Portuguese by default) without editing multiple arrays.
- **Optional clock.** A lightweight clock can be toggled on in `CONFIG` for anyone who wants to reposition or replace the native iOS lock screen clock.
- **Safer failure mode.** If the Shortcut forgets to pass a photo, the script now shows a clear on-screen alert instead of silently generating a blank/black image.

## ⚙️ New Config Options

[#-new-config-options](#-new-config-options)

All of the following were added to the `CONFIG` block at the top of `script.js`:

| Key | Purpose |
|---|---|
| `locale` | Language used for month/weekday labels (default `pt-BR`) |
| `useReadabilityPanel` | Toggle the translucent panel behind the grid |
| `panelOpacity`, `panelPaddingX`, `panelPaddingY`, `panelCornerRadius` | Fine-tune the readability panel |
| `todayCircleColor`, `todayTextColor` | Colors for the filled "today" circle and its number |
| `textColorDim` | Color for the muted weekday header / month label |
| `showEventDots`, `eventDotColor` | Toggle and color the event indicator dots |
| `showClock`, `clock24h` | Toggle the optional clock and its format |

## 📱 Why It Can't Be 100% Identical

[#-why-it-cant-be-100-identical](#-why-it-cant-be-100-identical)

Samsung's AOD renders live, directly on a pure black OLED screen, with no image underneath. iOS has no public API that lets a third-party app draw directly on the lock screen in real time — this project works around that limitation by generating a static wallpaper image once a day via Scriptable + Shortcuts. For a look that's visually closest to a real AOD, use a solid black photo as the base wallpaper in your dedicated "Wallpaper" album.

## 🚀 Upgrading

[#-upgrading](#-upgrading)

If you already have the script installed:

1. Open the **Scriptable** app and open your existing `LockScreenCalendar` script (don't create a new one).
2. Select all the code and delete it.
3. Paste in the new `script.js` from this update.
4. Tap **Done** to save.
5. Re-run your existing Shortcut once to confirm the new layout renders correctly.

No changes are needed to the Shortcut itself or to the daily automation — only the script content changed.

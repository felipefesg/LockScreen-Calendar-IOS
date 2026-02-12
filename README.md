# Samsung Style Lock Screen Calendar for iOS

A powerful script designed for **Scriptable** and **iOS Shortcuts** that generates a persistent, Samsung One UI-inspired calendar overlay for your lock screen.

Unlike static widgets, this script draws a dynamic calendar directly onto your current wallpaper, maintaining high transparency and a clean aesthetic.

## ✨ Features

* **One UI Inspired:** Minimalist design based on the Samsung Always On Display (AOD) calendar.
* **Wallpaper Friendly:** Automatically detects and overlays on your existing wallpaper while maintaining aspect ratio.
* **Dynamic Highlighting:** Automatically marks the current day with a sleek circle and highlights weekends in red.
* **Highly Customizable:** Easily adjust positions, opacity, font sizes, and scales directly in the code.
* **Transparent Overlay:** No ugly blocks or backgrounds; the calendar floats naturally on your image.

## 🚀 How to Install

### 1. Requirements

* Install the **[Scriptable](https://www.google.com/search?q=https://apps.apple.com/app/scriptable/id1405459188)** app from the App Store.
* Install the **Shortcuts** (Atalhos) app (built-in on iOS).

### 2. Scriptable Setup

1. Open Scriptable and create a new script by clicking the **+** icon.
2. Name it `LockScreenCalendar`.
3. Copy and paste the code provided in the **[Source Code](#-source-code)** section below.
4. Save and close.

### 3. Shortcut Setup

To make this work as a wallpaper, you need to create a simple Shortcut:

1. **Get File/Select Photo:** Pick the wallpaper you want to use.
2. **Run Scriptable Script:** Select the `LockScreenCalendar` script.
* *Important:* Pass the image/file as a parameter to the script.


3. **Set Wallpaper:** Use the output image from the Scriptable action as your new Lock Screen wallpaper.
4. (Optional) Set an **Automation** to run this shortcut every day at 00:01 AM to keep the date updated.

---
## ⚠️ Important Considerations
* **Daily Automation:** Since the script generates a static image, the date will not change automatically. You **must** set up a "Time of Day" automation in the Shortcuts app to run at **12:00 AM (midnight)**. This ensures the calendar refreshes and marks the new day every 24 hours.
* **Clock Overlap:** Depending on your iPhone model (especially those with the Dynamic Island), the calendar might overlap with the iOS clock. Simply adjust the `monthOffsetY` or `START_Y` variables in the `CONFIG` section of the code to move it.
* **Permissions:** When running for the first time, make sure to grant Scriptable permission to access your **Photos** and **File Manager**.

To ensure the script correctly fetches your background every time, follow these steps:
* **Dedicated Album:** Place your desired background photo **alone** in a specifically created album (e.g., named "Wallpaper").
* **Shortcut Filtering:** Configure your Shortcut to fetch the latest image from that specific album. This prevents errors or the script picking up the wrong media from your gallery.
---
## 🔗 Links & Media

### Screenshots
<p align="center">
  <img src="https://github.com/user-attachments/assets/5605a295-833f-429b-b944-13fbd973c9c6" width="250" alt="LOCKSCREEN">
  <img src="https://github.com/user-attachments/assets/62c9acf1-6cb0-4f8b-82b7-8d6ce9f80257" width="250" alt="SHORTCUT">
  <img src="https://github.com/user-attachments/assets/47f87a03-a16e-418d-96e8-23cec6227dbf" width="250" alt="AUTOMATION">
</p>

### Download & Resources
* 📥 **[iOS Shortcut](https://www.icloud.com/shortcuts/e4394783a9294570bfd42d9388f12382)** - Click here to import the shortcut to your iPhone.
* 📜 **[Scriptable Code](#-source-code)** - Jump directly to the script code below.
---
## 📄 Source Code

---

```javascript
// Tela de bloqueio estilo Samsung IOS

// ===== CONFIG =====
const CONFIG = {
  firstDayOfWeek: 0,        // 0 = Sunday (Samsung style)
  overlayOpacity: 0.25,      // Darken wallpaper slightly
  monthOffsetX: -150,
  monthOffsetY: 0,
  weekdaysOffsetY: 0,
  circleScale: 0.8           // Relative size of the current day circle
};

// ===== SCREEN =====
const screen = Device.screenSize();
const width = screen.width;
const height = screen.height;

// ===== DATE =====
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentDay = today.getDate();

// ===== BACKGROUND IMAGE =====
let bgImage = null;
if (args.images && args.images.length > 0) {
  bgImage = args.images[0];
} else if (args.shortcutParameter) {
  if (typeof args.shortcutParameter === "string") {
    let path = args.shortcutParameter.replace("file://", "");
    if (FileManager.local().fileExists(path)) {
      bgImage = FileManager.local().readImage(path);
    }
  }
}

// ===== DRAW CONTEXT =====
const ctx = new DrawContext();
ctx.size = new Size(width, height);
ctx.respectScreenScale = true;
ctx.opaque = false;  

// ===== DRAW WALLPAPER =====
if (bgImage) {
  const imgSize = bgImage.size;
  const imgAspect = imgSize.width / imgSize.height;
  const screenAspect = width / height;

  let drawRect;
  if (imgAspect > screenAspect) {
    const newWidth = height * imgAspect;
    const xOffset = (newWidth - width) / 2;
    drawRect = new Rect(-xOffset, 0, newWidth, height);
  } else {
    const newHeight = width / imgAspect;
    const yOffset = (newHeight - height) / 2;
    drawRect = new Rect(0, -yOffset, width, newHeight);
  }

  ctx.drawImageInRect(bgImage, drawRect);

  if (CONFIG.overlayOpacity > 0) {
    ctx.setFillColor(new Color("#000000", CONFIG.overlayOpacity));
    ctx.fillRect(new Rect(0, 0, width, height));
  }
}

// ===== CALENDAR LAYOUT =====
const START_Y = height * 0.62;
const GRID_SPACING = width / 9;
const FONT_DAY = GRID_SPACING * 0.55;
const FONT_WEEK = GRID_SPACING * 0.40;
const FONT_MONTH = GRID_SPACING * 0.90;
const totalWidth = GRID_SPACING * 7;
const startX = (width - totalWidth) / 2;

// ===== MONTH NAME =====
const monthNames = ["Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."];
ctx.setFont(Font.boldSystemFont(FONT_MONTH));
ctx.setTextColor(new Color("#ffffff"));
ctx.setTextAlignedCenter();
ctx.drawText(
  monthNames[currentMonth],
  new Point(width / 2 + CONFIG.monthOffsetX, START_Y - GRID_SPACING*2.4 + CONFIG.monthOffsetY)
);

// ===== WEEK DAYS =====
const weekDays = ["S","M","T","W","T","F","S"];
ctx.setFont(Font.mediumSystemFont(FONT_WEEK));

for (let i = 0; i < 7; i++) {
  ctx.setTextColor(i === 0 ? new Color("#ff3b30") : new Color("#ffffff"));
  ctx.drawTextInRect(
    weekDays[i],
    new Rect(startX + i * GRID_SPACING, START_Y - GRID_SPACING*0.7 + CONFIG.weekdaysOffsetY, GRID_SPACING, GRID_SPACING)
  );
}

// ===== DRAW MONTH =====
const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
const firstDay = new Date(currentYear, currentMonth, 1).getDay();
const startOffset = (firstDay - CONFIG.firstDayOfWeek + 7) % 7;

for (let d = 1; d <= daysInMonth; d++) {
  const index = startOffset + d - 1;
  const col = index % 7;
  const row = Math.floor(index / 7);
  const x = startX + col * GRID_SPACING;
  const y = START_Y + row * GRID_SPACING;

  const isWeekend = col === 0;
  const isToday = d === currentDay;

  if (isToday) {
    const circleSize = GRID_SPACING * CONFIG.circleScale;
    ctx.setStrokeColor(new Color("#ffffff"));
    ctx.setLineWidth(2);
    ctx.strokeEllipse(
      new Rect(x + (GRID_SPACING - circleSize)/2, y + (GRID_SPACING - circleSize)/2, circleSize, circleSize)
    );
    ctx.setTextColor(new Color("#ffffff"));
  } else if (isWeekend) {
    ctx.setTextColor(new Color("#ff3b30"));
  } else {
    ctx.setTextColor(new Color("#ffffff"));
  }

  ctx.setFont(Font.boldSystemFont(FONT_DAY));
  ctx.setTextAlignedCenter();
  ctx.drawTextInRect(d.toString(), new Rect(x, y + GRID_SPACING*0.18, GRID_SPACING, GRID_SPACING));
}

// ===== EXPORT =====
const image = ctx.getImage();
const fm = FileManager.local();
const path = fm.joinPath(fm.temporaryDirectory(), "calendar_current_month.png");
fm.writeImage(path, image);
Script.setShortcutOutput(path);
Script.complete();

```

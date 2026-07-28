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
  <img src="https://github.com/user-attachments/assets/9ff4c8aa-d122-41d6-8b6a-0df08f0f6293" width="250" alt="LOCKSCREEN">
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
// ===================== CONFIG =====================
const CONFIG = {
  // --- Idioma / formato ---
  locale: "pt-BR",
  firstDayOfWeek: 0,            // 0 = domingo (padrao Samsung)

  // --- Legibilidade sobre o papel de parede ---
  // O AOD real do Samsung fica sobre uma tela PRETA. Aqui estamos
  // sobre uma foto, entao um leve escurecimento ajuda a leitura.
  overlayOpacity: 0.20,
  useReadabilityPanel: true,
  panelOpacity: 0.30,
  panelPaddingX: 22,
  panelPaddingY: 16,
  panelCornerRadius: 24,

  // --- Posicionamento ---
  monthOffsetX: 0,
  monthOffsetY: 0,
  weekdaysOffsetY: 0,
  verticalPosition: 0.62,

  // --- Estilo (cores no padrao Samsung: branco + vermelho no domingo) ---
  textColor: "#ffffff",
  textColorDim: "#c9c9c9",      // cor mais apagada do cabecalho de dias
  weekendColor: "#ff453a",
  todayCircleColor: "#ffffff",  // cor do circulo PREENCHIDO do dia atual
  todayTextColor: "#1c1c1e",    // cor do numero DENTRO do circulo (escura, contraste)
  eventDotColor: "#ffd60a",

  // --- Recursos opcionais ---
  showEventDots: true,
  showClock: false,
  clock24h: true
};
// ===================== FIM DO CONFIG =====================


// ===== TELA =====
const screen = Device.screenSize();
const width = screen.width;
const height = screen.height;

// ===== DATA =====
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentDay = today.getDate();

// ===== IMAGEM DE FUNDO (vem do Atalho) =====
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

if (!bgImage) {
  const alert = new Alert();
  alert.title = "Nenhuma foto recebida";
  alert.message = "Rode este script a partir do Atalho, passando uma foto como parametro de entrada.";
  alert.addAction("OK");
  await alert.presentAlert();
  Script.complete();
}

// ===== BUSCA DIAS COM EVENTO NO MES ATUAL =====
async function getDaysWithEvents() {
  const daysWithEvent = new Set();
  if (!CONFIG.showEventDots) return daysWithEvent;
  try {
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const events = await CalendarEvent.between(startDate, endDate);
    events.forEach(e => daysWithEvent.add(new Date(e.startDate).getDate()));
  } catch (err) {
    // sem permissao ou erro: segue sem bolinhas
  }
  return daysWithEvent;
}

// ===== CONTEXTO DE DESENHO =====
const ctx = new DrawContext();
ctx.size = new Size(width, height);
ctx.respectScreenScale = true;
ctx.opaque = false;

// ===== DESENHA O PAPEL DE PAREDE =====
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

// ===== LAYOUT DO CALENDARIO (grid mais compacto, estilo Samsung) =====
const START_Y = height * CONFIG.verticalPosition;
const GRID_SPACING = width / 9.5;
const FONT_DAY = GRID_SPACING * 0.50;
const FONT_WEEK = GRID_SPACING * 0.34;
const FONT_MONTH = GRID_SPACING * 0.42;   // rotulo do mes PEQUENO, estilo Samsung
const totalWidth = GRID_SPACING * 7;
const startX = (width - totalWidth) / 2;

// ===== PAINEL DE LEGIBILIDADE (atras do calendario) =====
if (CONFIG.useReadabilityPanel) {
  const panelTop = START_Y - GRID_SPACING * 1.9 - CONFIG.panelPaddingY;
  const panelBottom = START_Y + GRID_SPACING * 6.1 + CONFIG.panelPaddingY;
  const panelLeft = startX - CONFIG.panelPaddingX;
  const panelWidth = totalWidth + CONFIG.panelPaddingX * 2;
  const panelHeight = panelBottom - panelTop;

  const panelPath = new Path();
  panelPath.addRoundedRect(
    new Rect(panelLeft, panelTop, panelWidth, panelHeight),
    CONFIG.panelCornerRadius,
    CONFIG.panelCornerRadius
  );
  ctx.addPath(panelPath);
  ctx.setFillColor(new Color("#000000", CONFIG.panelOpacity));
  ctx.fillPath();
}

// ===== ROTULO DO MES (pequeno, alinhado a esquerda - estilo Samsung) =====
const monthLabelRaw = today.toLocaleDateString(CONFIG.locale, { month: "long", year: "numeric" });
const monthLabel = monthLabelRaw.charAt(0).toUpperCase() + monthLabelRaw.slice(1);
ctx.setFont(Font.mediumSystemFont(FONT_MONTH));
ctx.setTextColor(new Color(CONFIG.textColorDim));
ctx.setTextAlignedLeft();
ctx.drawTextInRect(
  monthLabel,
  new Rect(startX + CONFIG.monthOffsetX, START_Y - GRID_SPACING * 1.6 + CONFIG.monthOffsetY, totalWidth, FONT_MONTH * 1.4)
);

// ===== RELOGIO (opcional) =====
if (CONFIG.showClock) {
  const hours = CONFIG.clock24h
    ? today.getHours().toString().padStart(2, "0")
    : (today.getHours() % 12 || 12).toString();
  const minutes = today.getMinutes().toString().padStart(2, "0");
  ctx.setFont(Font.lightSystemFont(FONT_MONTH * 1.3));
  ctx.setTextColor(new Color(CONFIG.textColor));
  ctx.setTextAlignedRight();
  ctx.drawTextInRect(
    `${hours}:${minutes}`,
    new Rect(0, START_Y - GRID_SPACING * 1.6 + CONFIG.monthOffsetY, startX + totalWidth, FONT_MONTH * 1.4)
  );
}

// ===== DIAS DA SEMANA (discreto, so domingo em vermelho) =====
const weekDaysBase = ["D","S","T","Q","Q","S","S"];
const weekDays = weekDaysBase
  .slice(CONFIG.firstDayOfWeek)
  .concat(weekDaysBase.slice(0, CONFIG.firstDayOfWeek));

ctx.setFont(Font.regularSystemFont(FONT_WEEK));
for (let i = 0; i < 7; i++) {
  const isSundayCol = weekDays[i] === "D";
  ctx.setTextColor(isSundayCol ? new Color(CONFIG.weekendColor) : new Color(CONFIG.textColorDim));
  ctx.drawTextInRect(
    weekDays[i],
    new Rect(startX + i * GRID_SPACING, START_Y - GRID_SPACING * 0.65 + CONFIG.weekdaysOffsetY, GRID_SPACING, GRID_SPACING)
  );
}

// ===== GRID DE DIAS + BOLINHAS DE EVENTO =====
async function drawMonth() {
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = (firstDay - CONFIG.firstDayOfWeek + 7) % 7;
  const daysWithEvent = await getDaysWithEvents();

  for (let d = 1; d <= daysInMonth; d++) {
    const index = startOffset + d - 1;
    const col = index % 7;
    const row = Math.floor(index / 7);
    const x = startX + col * GRID_SPACING;
    const y = START_Y + row * GRID_SPACING;

    const dayOfWeekLabel = weekDaysBase[(col + CONFIG.firstDayOfWeek) % 7];
    const isSunday = dayOfWeekLabel === "D" && ((col + CONFIG.firstDayOfWeek) % 7 === 0);
    const isToday = d === currentDay;

    if (isToday) {
      // Circulo PREENCHIDO, igual ao widget Samsung
      const circleSize = GRID_SPACING * 0.82;
      ctx.setFillColor(new Color(CONFIG.todayCircleColor));
      ctx.fillEllipse(
        new Rect(x + (GRID_SPACING - circleSize) / 2, y + (GRID_SPACING - circleSize) / 2, circleSize, circleSize)
      );
      ctx.setTextColor(new Color(CONFIG.todayTextColor));
      ctx.setFont(Font.boldSystemFont(FONT_DAY));
    } else if (isSunday) {
      ctx.setTextColor(new Color(CONFIG.weekendColor));
      ctx.setFont(Font.lightSystemFont(FONT_DAY));
    } else {
      ctx.setTextColor(new Color(CONFIG.textColor));
      ctx.setFont(Font.lightSystemFont(FONT_DAY));
    }

    ctx.setTextAlignedCenter();
    ctx.drawTextInRect(d.toString(), new Rect(x, y + GRID_SPACING * 0.18, GRID_SPACING, GRID_SPACING));

    if (daysWithEvent.has(d) && !isToday) {
      const dotSize = GRID_SPACING * 0.07;
      ctx.setFillColor(new Color(CONFIG.eventDotColor));
      ctx.fillEllipse(
        new Rect(x + GRID_SPACING / 2 - dotSize / 2, y + GRID_SPACING * 0.74, dotSize, dotSize)
      );
    }
  }

  // ===== EXPORTA =====
  const image = ctx.getImage();
  const fm = FileManager.local();
  const path = fm.joinPath(fm.temporaryDirectory(), "calendar_current_month.png");
  fm.writeImage(path, image);
  Script.setShortcutOutput(path);
  Script.complete();
}

await drawMonth();

```

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

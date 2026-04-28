export function exportToCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = String(row[header] ?? "");
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadChartAsImage(containerId: string, filename: string) {
  const chartRoot = document.getElementById(containerId);
  const svg = chartRoot?.querySelector("svg");
  if (!svg) return;

  const svgText = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.src = url;

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.width || 1200;
  canvas.height = img.height || 700;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(img, 0, 0);

  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportElementToPdf(options: { elementId: string; filename: string; title?: string }) {
  const root = document.getElementById(options.elementId);
  if (!root) return;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  const canvas = await html2canvas(root, { scale: 2, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  if (options.title) {
    pdf.setFontSize(14);
    pdf.text(options.title, 40, 40);
  }

  const marginTop = options.title ? 60 : 40;
  const maxWidth = pageWidth - 80;
  const ratio = canvas.height / canvas.width;
  const imgWidth = maxWidth;
  const imgHeight = imgWidth * ratio;

  let y = marginTop;
  let remaining = imgHeight;
  let offsetY = 0;

  while (remaining > 0) {
    const sliceHeight = Math.min(remaining, pageHeight - y - 40);
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = (sliceHeight / imgHeight) * canvas.height;
    const ctx = sliceCanvas.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(
      canvas,
      0,
      (offsetY / imgHeight) * canvas.height,
      canvas.width,
      sliceCanvas.height,
      0,
      0,
      sliceCanvas.width,
      sliceCanvas.height,
    );
    const sliceData = sliceCanvas.toDataURL("image/png");
    pdf.addImage(sliceData, "PNG", 40, y, imgWidth, sliceHeight);

    remaining -= sliceHeight;
    offsetY += sliceHeight;
    if (remaining > 0) {
      pdf.addPage();
      y = 40;
    }
  }

  pdf.save(options.filename);
}

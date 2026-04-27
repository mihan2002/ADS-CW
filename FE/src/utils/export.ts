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

import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';

export async function downloadChartAsImage(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#0f172a',
      quality: 1,
      pixelRatio: 2,
    });
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Chart exported as image');
  } catch {
    toast.error('Failed to export chart');
  }
}

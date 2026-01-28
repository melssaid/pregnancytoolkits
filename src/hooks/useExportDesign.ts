import { useCallback, RefObject } from 'react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export const useExportDesign = () => {
  const exportAsImage = useCallback(async (
    canvasRef: RefObject<HTMLDivElement>,
    filename: string = 'baby-room-design'
  ): Promise<boolean> => {
    if (!canvasRef.current) {
      toast.error('Nothing to export');
      return false;
    }

    try {
      toast.loading('Preparing high-quality JPG...', { id: 'export' });
      
      const node = canvasRef.current;
      const canvas = await html2canvas(node, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: node.scrollWidth,
        height: node.scrollHeight,
      });

      const download = (url: string) => {
        const link = document.createElement('a');
        link.download = `${filename}-${Date.now()}.jpg`;
        link.href = url;
        link.click();
      };

      // Prefer blob to avoid huge data URLs on mobile
      if (canvas.toBlob) {
        await new Promise<void>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Failed to create JPG blob'));
              const url = URL.createObjectURL(blob);
              download(url);
              setTimeout(() => URL.revokeObjectURL(url), 5000);
              resolve();
            },
            'image/jpeg',
            0.95
          );
        });
      } else {
        download(canvas.toDataURL('image/jpeg', 0.95));
      }

      toast.success('Design exported!', { id: 'export' });
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export design', { id: 'export' });
      return false;
    }
  }, []);

  return { exportAsImage };
};

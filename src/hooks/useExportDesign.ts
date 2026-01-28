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
      toast.loading('Preparing image...', { id: 'export' });
      
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `${filename}-${Date.now()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();

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

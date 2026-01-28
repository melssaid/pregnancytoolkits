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
      toast.loading('Preparing high-quality image...', { id: 'export' });
      
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 3, // Higher resolution for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: canvasRef.current.offsetWidth,
        height: canvasRef.current.offsetHeight,
      });

      const link = document.createElement('a');
      link.download = `${filename}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0); // PNG for better quality
      link.click();

      toast.success('Design exported in HD!', { id: 'export' });
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export design', { id: 'export' });
      return false;
    }
  }, []);

  return { exportAsImage };
};

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, ScanLine, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage } from '@/lib/imageCompression';

interface UploadZoneProps {
  onImageUploaded: (imageUrl: string) => void;
  themeColor: string;
}

export const UploadZone = ({ onImageUploaded, themeColor }: UploadZoneProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setIsScanning(true);
    setScanComplete(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const dataUrl = event.target?.result as string;
        const compressed = await compressImage(dataUrl, 1200, 800, 0.85);
        
        // Simulate AI scanning
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        setScanComplete(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        onImageUploaded(compressed);
        toast.success('Room scanned successfully!');
      } catch {
        toast.error('Failed to process image');
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isScanning ? (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="aspect-[16/10] rounded-2xl overflow-hidden relative"
            style={{ 
              background: `linear-gradient(135deg, hsl(${themeColor} / 0.1), hsl(${themeColor} / 0.2))` 
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Scanning animation */}
              <motion.div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                animate={{
                  top: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mb-4"
              >
                {scanComplete ? (
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                ) : (
                  <ScanLine className="w-16 h-16 text-primary" />
                )}
              </motion.div>
              
              <motion.p
                className="text-lg font-medium text-foreground"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {scanComplete ? 'Room geometry detected!' : 'Scanning room geometry...'}
              </motion.p>
              
              <div className="flex gap-2 mt-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ 
                      duration: 0.6, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Corner markers */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
              <motion.div
                key={corner}
                className={`absolute w-8 h-8 border-2 border-primary ${
                  corner.includes('top') ? 'top-4' : 'bottom-4'
                } ${corner.includes('left') ? 'left-4' : 'right-4'} ${
                  corner.includes('left') ? 'border-r-0 border-b-0' : ''
                } ${corner.includes('right') && corner.includes('top') ? 'border-l-0 border-b-0' : ''}
                ${corner.includes('left') && corner.includes('bottom') ? 'border-r-0 border-t-0' : ''}
                ${corner.includes('right') && corner.includes('bottom') ? 'border-l-0 border-t-0' : ''}`}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: Math.random() }}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[16/10] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 hover:border-primary hover:bg-primary/5 group"
            style={{ 
              borderColor: `hsl(${themeColor} / 0.4)`,
              background: `linear-gradient(135deg, hsl(${themeColor} / 0.05), hsl(${themeColor} / 0.1))` 
            }}
          >
            <div className="h-full flex flex-col items-center justify-center p-6">
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: `hsl(${themeColor} / 0.2)` }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Upload className="w-10 h-10" style={{ color: `hsl(${themeColor})` }} />
              </motion.div>
              
              <h3 className="text-xl font-bold mb-2 text-foreground">Smart Upload Zone</h3>
              <p className="text-muted-foreground text-center text-sm mb-4 max-w-xs">
                Upload a photo of your room and let AI analyze the space for optimal furniture placement
              </p>
              
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 border text-sm">
                  <Camera className="w-4 h-4" />
                  Take Photo
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 border text-sm">
                  <Sparkles className="w-4 h-4" />
                  AI Analysis
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
};

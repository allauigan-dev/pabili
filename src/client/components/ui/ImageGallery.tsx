import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';

interface ImageGalleryProps {
    images: string[];
    initialIndex?: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
    images,
    initialIndex = 0,
    open,
    onOpenChange,
    title = "Image Gallery"
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum distance for swipe
    const minSwipeDistance = 50;

    useEffect(() => {
        if (open) {
            setCurrentIndex(initialIndex);
        }
    }, [open, initialIndex]);

    const handlePrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }, [images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, [images.length]);

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        } else if (isRightSwipe) {
            handlePrevious();
        }
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'Escape') onOpenChange(false);
    }, [handlePrevious, handleNext, onOpenChange]);

    useEffect(() => {
        if (open) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, handleKeyDown]);

    if (!images || images.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-[90vw] h-auto max-h-[90vh] p-0 border border-border bg-background shadow-2xl overflow-hidden rounded-3xl transition-all">
                <DialogTitle className="sr-only">{title}</DialogTitle>

                <div
                    className="relative w-full h-[70vh] sm:h-[80vh] flex items-center justify-center group touch-none"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >

                    {/* Image Counter Badge */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
                        <div className="px-3 py-1 bg-secondary/50 backdrop-blur-sm rounded-full text-foreground text-[10px] font-black tracking-widest uppercase shadow-sm">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>

                    {/* Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                                className="absolute left-4 p-3 bg-secondary/30 hover:bg-secondary/80 text-foreground rounded-2xl transition-all active:scale-90 opacity-0 group-hover:opacity-100 hidden sm:block z-50 shadow-sm"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                className="absolute right-4 p-3 bg-secondary/30 hover:bg-secondary/80 text-foreground rounded-2xl transition-all active:scale-90 opacity-0 group-hover:opacity-100 hidden sm:block z-50 shadow-sm"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </>
                    )}

                    {/* Main Image Container */}
                    <div className="w-full h-full p-6 flex items-center justify-center relative">
                        <img
                            src={images[currentIndex]}
                            alt={`${title} - ${currentIndex + 1}`}
                            className="max-w-full max-h-full object-contain rounded-2xl select-none animate-in fade-in zoom-in-95 duration-500 shadow-2xl transition-transform"
                        />
                    </div>

                    {/* Navigation Indicators (Dots) */}
                    {images.length > 1 && (
                        <div className="absolute bottom-20 sm:bottom-24 left-0 right-0 flex justify-center gap-1.5 z-50">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-6 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 'w-1.5 bg-foreground/20'
                                        }`}
                                    aria-label={`Go to image ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Thumbnails Strip (Mobile Optimized) */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-6 overflow-x-auto no-scrollbar z-50 pb-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 ${currentIndex === idx ? 'border-primary scale-110 shadow-lg ring-2 ring-primary/20' : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                                        }`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};


'use client';

import React from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function SlidePreviewModal({ slideData, currentSlide = 0, isOpen, onClose, onDownload, onSlideChange }) {
  if (!isOpen || !slideData) return null;

  const slide = slideData.slides[currentSlide];
  const totalSlides = slideData.slides.length;

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1 && onSlideChange) {
      onSlideChange(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0 && onSlideChange) {
      onSlideChange(currentSlide - 1);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Add keyboard event listener
  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentSlide]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{slide.title}</h2>
              <p className="text-sm text-gray-600">Slide {currentSlide + 1} of {slideData.slides.length}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onDownload}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Slide Content */}
        <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center bg-gray-50/30">
          <div
            className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-8 border border-gray-100 min-h-[500px] max-h-[700px] overflow-hidden"
            style={{
              backgroundColor: slide.backgroundColor || '#ffffff',
              borderColor: slide.primaryColor || '#e5e7eb',
              borderLeft: `6px solid ${slide.primaryColor || '#8b5cf6'}`,
              aspectRatio: '16/9'
            }}
          >
            <h1
              className="text-3xl font-bold mb-6 text-center leading-tight break-words"
              style={{ color: slide.primaryColor || '#1f2937' }}
            >
              {slide.title}
            </h1>

            <div className="flex-1 overflow-y-auto mb-6">
              {slide.bulletPoints && slide.bulletPoints.length > 0 ? (
                <ul className="space-y-3">
                  {slide.bulletPoints.map((point, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span
                        className="mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: slide.secondaryColor || '#8b5cf6' }}
                      ></span>
                      <span
                        className="text-base leading-relaxed break-words"
                        style={{ color: slide.secondaryColor || '#374151' }}
                      >
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p
                  className="text-base leading-relaxed text-left break-words"
                  style={{ color: slide.secondaryColor || '#374151' }}
                >
                  {slide.content}
                </p>
              )}
            </div>

            {(slide.imageDescription || slide.imageUrl) && (
              <div className="mt-8">
                {slide.imageUrl ? (
                  <div className="text-center">
                    <img
                      src={slide.imageUrl}
                      alt={slide.imageDescription || slide.imageAlt || 'Slide image'}
                      className="max-w-full max-h-48 mx-auto rounded-xl shadow-md object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div 
                      className="hidden p-8 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-gray-50"
                      style={{ display: 'none' }}
                    >
                      <div className="text-6xl mb-4">🖼️</div>
                      <div className="text-sm text-gray-600 font-medium mb-2">Image not available</div>
                      <div className="text-sm text-gray-500">{slide.imageDescription}</div>
                    </div>
                    {slide.imageDescription && (
                      <div className="mt-4 text-sm text-gray-600 italic">{slide.imageDescription}</div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-gray-50">
                    <div className="text-6xl mb-4">🖼️</div>
                    <div className="text-sm text-gray-600 font-medium mb-2">Suggested Image:</div>
                    <div className="text-sm text-gray-500">{slide.imageDescription}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer with navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
          
          <span className="text-sm text-gray-600 font-medium">
            Slide {currentSlide + 1} of {totalSlides}
          </span>
          
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
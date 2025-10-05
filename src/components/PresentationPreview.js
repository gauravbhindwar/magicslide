'use client';

import { Download, FileText, Eye } from 'lucide-react';

export default function PresentationPreview({ slideData, onDownload, onPreview }) {
  if (!slideData) return null;

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <FileText className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900 truncate">{slideData.title}</h3>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          {slideData.slides.length} slides • Ready to download
        </p>
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-sm font-medium"
        >
          <Download className="h-4 w-4" />
          <span>Download PPTX</span>
        </button>
      </div>

      <div className="space-y-2">
        {slideData.slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => onPreview(index)}
            className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all group bg-white"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-md flex items-center justify-center text-xs font-medium text-purple-600">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                  {slide.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {slide.bulletPoints 
                    ? slide.bulletPoints.slice(0, 2).join(' • ') 
                    : slide.content?.substring(0, 40) + '...'
                  }
                </p>
                {slide.imageUrl && (
                  <div className="flex items-center mt-2">
                    <img
                      src={slide.imageUrl}
                      alt={slide.imageDescription || 'Slide image'}
                      className="w-6 h-4 object-cover rounded border border-gray-200 mr-2"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline';
                      }}
                    />
                    <span className="text-xs text-purple-600 hidden">🖼️</span>
                    <span className="text-xs text-purple-600">Image included</span>
                  </div>
                )}
                {slide.imageDescription && !slide.imageUrl && (
                  <div className="flex items-center mt-1 text-xs text-purple-600">
                    <span>🖼️ Image</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
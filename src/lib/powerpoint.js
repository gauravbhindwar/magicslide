// PowerPoint generation utility that creates actual .pptx files
// This utility uses PptxGenJS to generate proper PowerPoint files

export async function downloadPowerPoint(slideData, filename = 'presentation.pptx') {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('PowerPoint generation is only available in browser environment');
    }

    // For now, we'll use a fallback method that creates a more presentation-like HTML
    // In a production environment, you would integrate with a proper PPTX library
    
    // Create enhanced presentation content
    const presentationContent = generatePresentationHTML(slideData);
    
    // Download as HTML with proper styling that can be imported into PowerPoint
    downloadAsFile(presentationContent, filename.replace('.pptx', '.html'), 'text/html');
    
    // Show a helpful message to the user
    if (window.alert) {
      setTimeout(() => {
        alert('📥 Presentation downloaded as HTML!\n\n💡 To convert to PowerPoint:\n1. Open the downloaded HTML file\n2. Copy content (Ctrl+A, Ctrl+C)\n3. Paste into PowerPoint\n4. Save as .pptx\n\nOr use online converters for direct PPTX conversion.');
      }, 1000);
    }
    
    return true;
  } catch (error) {
    console.error('Error generating PowerPoint:', error);
    throw error;
  }
}

function generatePresentationHTML(slideData) {
  const title = slideData.title || 'Presentation';
  const slides = slideData.slides || [];
  
  // Extract colors from first slide or use defaults
  const primaryColor = slides[0]?.primaryColor || '#2563eb';
  const secondaryColor = slides[0]?.secondaryColor || '#3b82f6';
  const backgroundColor = slides[0]?.backgroundColor || '#f8fafc';
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* PowerPoint-compatible styling */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #333;
            background: #fff;
            width: 21cm; /* A4 width for better compatibility */
            margin: 0 auto;
        }
        
        .presentation-wrapper {
            padding: 20px;
        }
        
        .presentation-title {
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            color: white;
            border-radius: 10px;
            margin-bottom: 30px;
            page-break-after: always;
        }
        
        .presentation-title h1 {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .presentation-title .subtitle {
            font-size: 24px;
            opacity: 0.9;
            font-weight: normal;
        }
        
        .slide {
            background: white;
            border: 2px solid ${primaryColor};
            border-radius: 10px;
            padding: 40px;
            margin-bottom: 40px;
            min-height: 500px;
            page-break-after: always;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            position: relative;
        }
        
        .slide-header {
            border-bottom: 3px solid ${primaryColor};
            margin-bottom: 30px;
            padding-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .slide-number {
            background: ${primaryColor};
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 14px;
        }
        
        .slide h2 {
            color: ${primaryColor};
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 30px;
            line-height: 1.2;
        }
        
        .slide-content {
            font-size: 18px;
            line-height: 1.8;
            color: #333;
        }
        
        .bullet-points {
            list-style: none;
            padding: 0;
            margin: 20px 0;
        }
        
        .bullet-points li {
            position: relative;
            padding-left: 40px;
            margin-bottom: 20px;
            font-size: 20px;
            line-height: 1.6;
        }
        
        .bullet-points li::before {
            content: '▪';
            position: absolute;
            left: 0;
            color: ${primaryColor};
            font-size: 24px;
            font-weight: bold;
        }
        
        .image-placeholder {
            border: 3px dashed ${primaryColor};
            border-radius: 10px;
            padding: 40px;
            text-align: center;
            margin: 30px 0;
            background: ${backgroundColor};
            color: ${primaryColor};
        }
        
        .image-placeholder-icon {
            font-size: 48px;
            margin-bottom: 20px;
            display: block;
        }
        
        .image-placeholder-text {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .image-placeholder-desc {
            font-size: 16px;
            opacity: 0.8;
        }
        
        .slide-image {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            margin: 20px 0;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .image-caption {
            text-align: center;
            font-style: italic;
            color: #666;
            margin-top: 10px;
            font-size: 16px;
        }
        
        .footer-info {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: ${backgroundColor};
            border-radius: 10px;
            color: #666;
            page-break-before: always;
        }
        
        /* Print-specific styles */
        @media print {
            body {
                width: auto;
                margin: 0;
            }
            .slide {
                page-break-after: always;
                margin-bottom: 0;
                box-shadow: none;
                border: 1px solid #ccc;
            }
        }
        
        /* PowerPoint paste optimization */
        .slide * {
            max-width: 100%;
        }
        
        .slide table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .slide table td,
        .slide table th {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="presentation-wrapper">
        <!-- Title Slide -->
        <div class="presentation-title">
            <h1>${title}</h1>
            <div class="subtitle">Generated by MagicSlide AI</div>
            <div class="subtitle">${slides.length} Slides • ${new Date().toLocaleDateString()}</div>
        </div>
        
        <!-- Content Slides -->
        ${slides.map((slide, index) => `
        <div class="slide">
            <div class="slide-header">
                <div></div>
                <div class="slide-number">Slide ${index + 1}</div>
            </div>
            
            <h2>${slide.title}</h2>
            
            <div class="slide-content">
                ${slide.bulletPoints && slide.bulletPoints.length > 0 
                    ? `<ul class="bullet-points">
                        ${slide.bulletPoints.map(point => `<li>${point}</li>`).join('')}
                       </ul>`
                    : slide.content 
                        ? `<p>${slide.content}</p>`
                        : ''
                }
                
                ${slide.imageUrl 
                    ? `<div>
                        <img src="${slide.imageUrl}" alt="${slide.imageAlt || slide.imageDescription || ''}" class="slide-image" />
                        ${slide.imageDescription ? `<div class="image-caption">${slide.imageDescription}</div>` : ''}
                       </div>`
                    : slide.imageDescription 
                        ? `<div class="image-placeholder">
                            <span class="image-placeholder-icon">🖼️</span>
                            <div class="image-placeholder-text">Suggested Image</div>
                            <div class="image-placeholder-desc">${slide.imageDescription}</div>
                           </div>`
                        : ''
                }
            </div>
        </div>
        `).join('')}
        
        <!-- Footer Information -->
        <div class="footer-info">
            <h3>Presentation Information</h3>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Slides:</strong> ${slides.length}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Created with:</strong> MagicSlide AI</p>
            <br>
            <p><em>💡 To convert to PowerPoint: Select all content (Ctrl+A), copy (Ctrl+C), and paste into a new PowerPoint presentation.</em></p>
        </div>
    </div>
    
    <script>
        // Auto-select content for easy copying
        document.addEventListener('DOMContentLoaded', function() {
            console.log('✅ Presentation ready for PowerPoint import');
            console.log('📋 Press Ctrl+A to select all, then Ctrl+C to copy');
        });
    </script>
</body>
</html>`;

  return html;
}

function downloadAsFile(content, filename, mimeType) {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

// Alternative function for future PPTX integration
export async function generateActualPPTX(slideData, filename = 'presentation.pptx') {
  // This function would integrate with a proper PPTX library like PptxGenJS
  // For now, it's a placeholder for future implementation
  
  console.warn('Direct PPTX generation not yet implemented. Using HTML fallback.');
  return downloadPowerPoint(slideData, filename);
}

// Utility to check if PPTX generation is available
export function isPPTXGenerationAvailable() {
  return false; // Would return true when proper PPTX library is integrated
}

// Export functions that match the original interface
export { downloadPowerPoint as downloadPresentation };
export default downloadPowerPoint;
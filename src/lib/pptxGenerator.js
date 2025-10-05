// Enhanced PowerPoint generation utility with proper styling and colors

// Image fetching utility using open source APIs
async function fetchImageFromOpenSource(query, width = 800, height = 600) {
  try {
    // Try multiple open source image APIs as fallbacks

    // 1. Try Unsplash (no API key required for basic usage)
    try {
      const unsplashResponse = await fetch(`https://source.unsplash.com/random/${width}x${height}?${encodeURIComponent(query)}`);
      if (unsplashResponse.ok) {
        return unsplashResponse.url;
      }
    } catch (error) {
      console.log('Unsplash failed, trying next source...');
    }

    // 2. Try Pexels (free API, but might need API key)
    try {
      const pexelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
        headers: {
          'Authorization': process.env.PEXELS_API_KEY || ''
        }
      });
      if (pexelsResponse.ok) {
        const data = await pexelsResponse.json();
        if (data.photos && data.photos.length > 0) {
          return data.photos[0].src.large;
        }
      }
    } catch (error) {
      console.log('Pexels failed, trying next source...');
    }

    // 3. Try Pixabay (free API)
    try {
      const pixabayResponse = await fetch(`https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY || 'demo'}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3&safesearch=true`);
      if (pixabayResponse.ok) {
        const data = await pixabayResponse.json();
        if (data.hits && data.hits.length > 0) {
          return data.hits[0].webformatURL;
        }
      }
    } catch (error) {
      console.log('Pixabay failed, trying next source...');
    }

    // 4. Fallback to Lorem Picsum (placeholder images)
    return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`;

  } catch (error) {
    console.error('Error fetching image:', error);
    // Ultimate fallback - return a placeholder
    return `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=${encodeURIComponent(query)}`;
  }
}

// Enhanced function to process slides with real images
async function processSlidesWithImages(slides) {
  const processedSlides = [];

  for (const slide of slides) {
    const processedSlide = { ...slide };

    if (slide.imageDescription) {
      try {
        // Extract keywords from image description for better search
        const searchQuery = extractImageKeywords(slide.imageDescription);
        const imageUrl = await fetchImageFromOpenSource(searchQuery);

        processedSlide.imageUrl = imageUrl;
        processedSlide.imageAlt = slide.imageDescription;
      } catch (error) {
        console.error('Failed to fetch image for slide:', error);
        // Keep the description as fallback
      }
    }

    processedSlides.push(processedSlide);
  }

  return processedSlides;
}

// Extract relevant keywords from image description for better search results
function extractImageKeywords(description) {
  // Remove common words and extract key terms
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'image', 'photo', 'picture', 'illustration', 'graphic'];

  const words = description.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));

  // Take first 3-4 relevant words
  return words.slice(0, 4).join(' ') || 'business presentation';
}

export async function generatePowerPoint(slideData) {
  // Process slides to include real images
  const slidesWithImages = await processSlidesWithImages(slideData.slides);
  const slideDataWithImages = { ...slideData, slides: slidesWithImages };

  // Create PowerPoint-compatible HTML presentation
  const htmlContent = generatePowerPointCompatibleHTML(slideDataWithImages);
  return {
    writeFile: async ({ fileName }) => {
      const htmlFilename = fileName.replace('.pptx', '.html');
      downloadAsFile(htmlContent, htmlFilename, 'text/html');
    }
  };
}

export async function downloadPowerPoint(slideData, filename = 'presentation.pptx') {
  try {
    // Process slides to include real images
    const slidesWithImages = await processSlidesWithImages(slideData.slides);
    const slideDataWithImages = { ...slideData, slides: slidesWithImages };

    // Create a PowerPoint-compatible HTML presentation
    const htmlContent = generatePowerPointCompatibleHTML(slideDataWithImages);
    
    // Download as HTML with instructions for PowerPoint conversion
    const htmlFilename = filename.replace('.pptx', '.html');
    downloadAsFile(htmlContent, htmlFilename, 'text/html');
    
    // Show helpful conversion instructions
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.alert) {
        alert(`📥 Downloaded: ${htmlFilename}\n\n💡 To convert to PowerPoint (.pptx):\n\n1. Open the downloaded HTML file in your browser\n2. Select all content (Ctrl+A / Cmd+A)\n3. Copy (Ctrl+C / Cmd+C)\n4. Open PowerPoint and create a new presentation\n5. Paste the content (Ctrl+V / Cmd+V)\n6. Save as .pptx\n\n✨ The formatting will be preserved during import!`);
      }
    }, 500);
    
    return true;
  } catch (error) {
    console.error('Error generating PowerPoint:', error);
    throw error;
  }
}

function generatePowerPointCompatibleHTML(slideData) {
  const title = slideData.title || 'Presentation';
  const slides = slideData.slides || [];
  const primaryColor = slides[0]?.primaryColor || '#2563eb';
  const secondaryColor = slides[0]?.secondaryColor || '#3b82f6';
  const backgroundColor = slides[0]?.backgroundColor || '#f8fafc';
  
  // Create PowerPoint-optimized HTML with proper page breaks and formatting
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* PowerPoint Import Optimized Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 18px;
            line-height: 1.5;
            color: #333;
            background: white;
            width: 25.4cm; /* PowerPoint slide width */
            margin: 0 auto;
            padding: 20px;
        }
        
        .presentation-wrapper {
            max-width: 100%;
        }
        
        /* Title Slide */
        .title-slide {
            page-break-after: always;
            text-align: center;
            padding: 100px 40px;
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            color: white;
            border-radius: 15px;
            margin-bottom: 40px;
            min-height: 19cm; /* PowerPoint slide height */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        
        .title-slide h1 {
            font-size: 54px;
            font-weight: bold;
            margin-bottom: 30px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            line-height: 1.2;
        }
        
        .title-slide .subtitle {
            font-size: 28px;
            font-weight: 300;
            opacity: 0.95;
            margin-bottom: 20px;
        }
        
        .title-slide .meta {
            font-size: 20px;
            opacity: 0.8;
            margin-top: 40px;
        }
        
        /* Content Slides */
        .slide {
            page-break-after: always;
            background: white;
            border: 3px solid ${primaryColor};
            border-radius: 15px;
            padding: 60px;
            margin-bottom: 40px;
            min-height: 19cm;
            display: flex;
            flex-direction: column;
            position: relative;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .slide-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 4px solid ${primaryColor};
        }
        
        .slide-number {
            background: ${primaryColor};
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: bold;
            font-size: 16px;
        }
        
        .slide-type {
            background: ${backgroundColor};
            color: ${primaryColor};
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .slide h2 {
            color: ${primaryColor};
            font-size: 42px;
            font-weight: bold;
            margin-bottom: 40px;
            line-height: 1.2;
        }
        
        .slide-content {
            flex: 1;
            font-size: 22px;
            line-height: 1.6;
            color: #333;
        }
        
        /* Bullet Points */
        .bullet-points {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .bullet-points li {
            position: relative;
            padding-left: 50px;
            margin-bottom: 25px;
            font-size: 22px;
            line-height: 1.5;
            color: #444;
        }
        
        .bullet-points li::before {
            content: '●';
            position: absolute;
            left: 0;
            color: ${primaryColor};
            font-size: 28px;
            font-weight: bold;
            top: -2px;
        }
        
        /* Content Text */
        .content-text {
            font-size: 22px;
            line-height: 1.6;
            color: #333;
            margin-bottom: 30px;
            text-align: justify;
        }
        
        /* Images */
        .image-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .slide-image {
            max-width: 100%;
            max-height: 400px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            border: 2px solid #e5e7eb;
        }
        
        .image-caption {
            font-size: 18px;
            color: #666;
            font-style: italic;
            margin-top: 15px;
            text-align: center;
        }
        
        .image-placeholder {
            border: 4px dashed ${primaryColor};
            border-radius: 12px;
            padding: 60px 40px;
            text-align: center;
            background: ${backgroundColor};
            color: ${primaryColor};
            margin: 40px 0;
        }
        
        .image-placeholder-icon {
            font-size: 64px;
            margin-bottom: 20px;
            display: block;
        }
        
        .image-placeholder-text {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .image-placeholder-desc {
            font-size: 18px;
            opacity: 0.8;
            line-height: 1.4;
        }
        
        /* Footer */
        .presentation-footer {
            page-break-before: always;
            text-align: center;
            padding: 100px 40px;
            background: ${backgroundColor};
            border-radius: 15px;
            margin-top: 40px;
        }
        
        .presentation-footer h3 {
            color: ${primaryColor};
            font-size: 36px;
            margin-bottom: 30px;
        }
        
        .presentation-footer p {
            font-size: 20px;
            color: #666;
            margin-bottom: 15px;
        }
        
        /* Print Optimization */
        @media print {
            body {
                width: auto;
                margin: 0;
                padding: 0;
            }
            
            .slide, .title-slide, .presentation-footer {
                page-break-after: always;
                margin: 0;
                box-shadow: none;
                min-height: auto;
            }
        }
        
        /* Copy-Paste Optimization for PowerPoint */
        .slide table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        .slide table th,
        .slide table td {
            padding: 15px;
            text-align: left;
            border-bottom: 2px solid #ddd;
            font-size: 20px;
        }
        
        .slide table th {
            background-color: ${backgroundColor};
            color: ${primaryColor};
            font-weight: bold;
        }
        
        /* Ensure content scales properly when copied */
        .slide * {
            max-width: 100%;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <div class="presentation-wrapper">
        <!-- Title Slide -->
        <div class="title-slide">
            <h1>${title}</h1>
            <div class="subtitle">AI-Generated Presentation</div>
            <div class="meta">
                <div>${slides.length} Slides • Created with MagicSlide AI</div>
                <div>${new Date().toLocaleDateString()}</div>
            </div>
        </div>
        
        <!-- Content Slides -->
        ${slides.map((slide, index) => {
          const slideType = slide.type || 'Content';
          return `
        <div class="slide">
            <div class="slide-header">
                <div class="slide-type">${slideType}</div>
                <div class="slide-number">Slide ${index + 1}</div>
            </div>
            
            <h2>${slide.title}</h2>
            
            <div class="slide-content">
                ${slide.bulletPoints && slide.bulletPoints.length > 0 
                    ? `<ul class="bullet-points">
                        ${slide.bulletPoints.map(point => `<li>${point}</li>`).join('')}
                       </ul>`
                    : slide.content 
                        ? `<div class="content-text">${slide.content}</div>`
                        : ''
                }
                
                ${slide.imageUrl 
                    ? `<div class="image-container">
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
        </div>`;
        }).join('')}
        
        <!-- Presentation Footer -->
        <div class="presentation-footer">
            <h3>Thank You</h3>
            <p><strong>Presentation:</strong> ${title}</p>
            <p><strong>Slides:</strong> ${slides.length}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Powered by:</strong> MagicSlide AI & Gemini</p>
            <br>
            <p style="font-size: 18px; color: #999;">
                💡 <em>To import into PowerPoint: Select all (Ctrl+A), Copy (Ctrl+C), then paste into PowerPoint</em>
            </p>
        </div>
    </div>
    
    <script>
        // Auto-copy instructions and content selection
        document.addEventListener('DOMContentLoaded', function() {
            console.log('✅ PowerPoint-compatible presentation ready');
            console.log('📋 Instructions: Select All (Ctrl+A) → Copy (Ctrl+C) → Paste in PowerPoint');
            
            // Optional: Auto-select content for easier copying
            // Uncomment the next line if you want content auto-selected
            // document.getSelection().selectAllChildren(document.body);
        });
        
        // Keyboard shortcut helper
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'a') {
                console.log('📋 Content selected - now press Ctrl+C to copy');
            }
            if (e.ctrlKey && e.key === 'c') {
                console.log('✅ Content copied - paste into PowerPoint with Ctrl+V');
            }
        });
    </script>
</body>
</html>`;
  
  return html;
}

function generateStyledPresentation(slideData) {
  const primaryColor = slideData.slides[0]?.primaryColor || '#2563eb';
  const secondaryColor = slideData.slides[0]?.secondaryColor || '#3b82f6';
  const backgroundColor = slideData.slides[0]?.backgroundColor || '#f8fafc';
  
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${slideData.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, ${backgroundColor} 0%, #ffffff 100%);
            min-height: 100vh;
            overflow-x: hidden;
            overflow-y: auto; /* Enable vertical scrolling */
        }
        
        .presentation-container {
            max-width: 1400px; /* Increased width for better proportions */
            margin: 0 auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .header {
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
            color: white;
            border-radius: 20px;
            margin-bottom: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 1200px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .slide {
            background: white;
            border-radius: 15px;
            padding: 50px; /* Increased padding for better proportions */
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-left: 6px solid ${primaryColor};
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            width: 100%;
            max-width: 1200px; /* Fixed width for consistent proportions */
            min-height: 600px; /* Minimum height for better aspect ratio */
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            box-sizing: border-box;
        }
        
        .slide:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .slide-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid ${backgroundColor};
            flex-shrink: 0;
        }
        
        .slide-number {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
            flex-shrink: 0;
        }
        
        .slide h2 {
            color: ${primaryColor};
            font-size: 2.2rem; /* Slightly larger for better proportions */
            font-weight: 700;
            margin-bottom: 25px;
            line-height: 1.2;
            flex-shrink: 0;
        }
        
        .slide-content {
            line-height: 1.8;
            color: #374151;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 300px; /* Ensure content area has minimum height */
        }
        
        .bullet-points {
            list-style: none;
            padding: 0;
            margin-bottom: 20px;
            flex: 1;
        }
        
        .bullet-points li {
            position: relative;
            padding-left: 30px;
            margin-bottom: 15px;
            font-size: 1.1rem;
            color: #4b5563;
            line-height: 1.6;
        }
        
        .bullet-points li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 10px;
            width: 8px;
            height: 8px;
            background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
            border-radius: 50%;
        }
        
        .image-placeholder {
            background: linear-gradient(135deg, ${backgroundColor} 0%, #e5e7eb 100%);
            border: 2px dashed ${primaryColor};
            border-radius: 10px;
            padding: 30px;
            text-align: center;
            margin: 25px 0;
            color: ${primaryColor};
        }
        
        .image-placeholder-icon {
            font-size: 3rem;
            margin-bottom: 15px;
            display: block;
        }
        
        .image-placeholder-text {
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .image-placeholder-desc {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        .slide-image-container {
            margin: 25px 0;
            text-align: center;
            flex-shrink: 0;
        }
        
        .slide-image {
            max-width: 100%;
            max-height: 350px; /* Increased image height for better proportions */
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            object-fit: cover;
            width: auto;
        }
        
        .image-caption {
            margin-top: 10px;
            font-size: 0.9rem;
            color: #6b7280;
            font-style: italic;
            text-align: center;
        }
        
        .slide-type-indicator {
            display: inline-block;
            background: ${secondaryColor};
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .footer {
            text-align: center;
            padding: 40px 20px;
            color: #6b7280;
            border-top: 2px solid ${backgroundColor};
            margin-top: 40px;
        }
        
        @media print {
            body {
                overflow-y: visible;
            }
            .slide {
                page-break-after: always;
                box-shadow: none;
                border: 1px solid #e5e7eb;
                margin-bottom: 20px;
                min-height: auto;
                max-width: none;
                width: auto;
            }
            .slide:hover {
                transform: none;
            }
        }
        
        @media (max-width: 768px) {
            .presentation-container {
                padding: 10px;
                max-width: 100%;
            }
            .slide {
                padding: 30px 20px;
                min-height: 500px;
                max-width: 100%;
            }
            .header h1 {
                font-size: 2rem;
            }
            .slide h2 {
                font-size: 1.8rem;
            }
            .slide-image {
                max-height: 250px;
            }
        }
    </style>
</head>
<body>
    <div class="presentation-container">
        <div class="header">
            <h1>${slideData.title}</h1>
            <p>Generated by MagicSlide AI • ${slideData.slides.length} Slides</p>
        </div>
`;

  slideData.slides.forEach((slide, index) => {
    const slideType = slide.type || 'content';
    const slideColors = {
      primary: slide.primaryColor || primaryColor,
      secondary: slide.secondaryColor || secondaryColor,
      background: slide.backgroundColor || backgroundColor
    };
    
    html += `
        <div class="slide" style="border-left-color: ${slideColors.primary};">
            <div class="slide-header">
                <div>
                    <span class="slide-type-indicator" style="background: ${slideColors.secondary};">${slideType}</span>
                </div>
                <div class="slide-number" style="background: linear-gradient(135deg, ${slideColors.primary} 0%, ${slideColors.secondary} 100%);">
                    Slide ${index + 1}
                </div>
            </div>
            
            <h2 style="color: ${slideColors.primary};">${slide.title}</h2>
            
            <div class="slide-content">
`;
    
    if (slide.bulletPoints && slide.bulletPoints.length > 0) {
      html += '<ul class="bullet-points">';
      slide.bulletPoints.forEach(point => {
        html += `<li style="color: #4b5563;">${point}</li>`;
      });
      html += '</ul>';
    } else if (slide.content) {
      html += `<p style="font-size: 1.1rem; line-height: 1.8; color: #4b5563;">${slide.content}</p>`;
    }
    
    if (slide.imageUrl) {
      html += `
                <div class="slide-image-container">
                    <img src="${slide.imageUrl}" alt="${slide.imageAlt || slide.imageDescription}" class="slide-image" />
                    ${slide.imageDescription ? `<div class="image-caption">${slide.imageDescription}</div>` : ''}
                </div>
      `;
    } else if (slide.imageDescription) {
      html += `
                <div class="image-placeholder" style="border-color: ${slideColors.primary}; color: ${slideColors.primary};">
                    <span class="image-placeholder-icon">🖼️</span>
                    <div class="image-placeholder-text">Suggested Image</div>
                    <div class="image-placeholder-desc">${slide.imageDescription}</div>
                </div>
      `;
    }
    
    html += `
            </div>
        </div>
    `;
  });
  
  html += `
        <div class="footer">
            <p>Created with MagicSlide AI • Professional Presentation Generator</p>
            <p style="margin-top: 10px; font-size: 0.9rem;">🌟 Powered by Gemini AI • ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
</body>
</html>`;
  
  return html;
}

function downloadAsFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function generateSlidePreview(slideData) {
  // Generate preview data for each slide with proper styling
  return slideData.slides.map((slide, index) => ({
    id: index + 1,
    title: slide.title,
    content: slide.content,
    bulletPoints: slide.bulletPoints,
    type: slide.type,
    primaryColor: slide.primaryColor,
    secondaryColor: slide.secondaryColor,
    backgroundColor: slide.backgroundColor,
    imageDescription: slide.imageDescription,
    preview: generateSlideHTML(slide, index + 1)
  }));
}

function generateSlideHTML(slide, slideNumber) {
  const primaryColor = slide.primaryColor || '#2563eb';
  const secondaryColor = slide.secondaryColor || '#3b82f6';
  const backgroundColor = slide.backgroundColor || '#f8fafc';
  
  let html = `
    <div class="slide-preview" style="
      background: ${backgroundColor}; 
      padding: 16px; 
      border: 1px solid ${primaryColor}; 
      border-radius: 8px; 
      height: 180px; 
      overflow: hidden;
      background: linear-gradient(135deg, ${backgroundColor} 0%, #ffffff 100%);
    ">
      <h3 style="
        color: ${primaryColor}; 
        font-size: 14px; 
        font-weight: 600; 
        margin-bottom: 12px;
        line-height: 1.2;
      ">${slide.title}</h3>
  `;
  
  if (slide.bulletPoints && slide.bulletPoints.length > 0) {
    html += '<div style="font-size: 11px; line-height: 1.4;">';
    slide.bulletPoints.slice(0, 4).forEach(point => {
      html += `<div style="color: ${secondaryColor}; margin-bottom: 4px;">• ${point.substring(0, 40)}${point.length > 40 ? '...' : ''}</div>`;
    });
    html += '</div>';
  } else if (slide.content) {
    html += `<p style="font-size: 11px; color: ${secondaryColor}; line-height: 1.3;">${slide.content.substring(0, 120)}${slide.content.length > 120 ? '...' : ''}</p>`;
  }
  
  if (slide.imageDescription) {
    html += `<div style="margin-top: 8px; padding: 6px; background: rgba(147, 51, 234, 0.1); border-radius: 4px; font-size: 9px; color: #7c3aed;">🖼️ Image: ${slide.imageDescription.substring(0, 30)}...</div>`;
  }
  
  html += `
      <div style="position: absolute; bottom: 4px; right: 8px; font-size: 9px; color: #9ca3af;">Slide ${slideNumber}</div>
    </div>
  `;
  
  return html;
}
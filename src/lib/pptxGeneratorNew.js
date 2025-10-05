// Real PowerPoint (.pptx) generator using PptxGenJS
import pptxgen from 'pptxgenjs';

// Image fetching utility with proper API key usage
async function fetchImageFromOpenSource(query, width = 800, height = 600) {
  try {
    console.log('Fetching image for:', query);

    // 1. Try Pexels first (reliable API)
    try {
      const pexelsApiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
      if (pexelsApiKey) {
        const pexelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
          headers: {
            'Authorization': pexelsApiKey
          }
        });
        
        if (pexelsResponse.ok) {
          const data = await pexelsResponse.json();
          console.log('Pexels response:', data);
          if (data.photos && data.photos.length > 0) {
            console.log('✅ Found image from Pexels:', data.photos[0].src.large);
            return data.photos[0].src.large;
          }
        }
      }
    } catch (error) {
      console.log('Pexels failed:', error.message);
    }

    // 2. Try Pixabay (backup)
    try {
      const pixabayApiKey = process.env.NEXT_PUBLIC_PIXABAY_API_KEY;
      if (pixabayApiKey) {
        const pixabayResponse = await fetch(`https://pixabay.com/api/?key=${pixabayApiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3&safesearch=true`);
        
        if (pixabayResponse.ok) {
          const data = await pixabayResponse.json();
          console.log('Pixabay response:', data);
          if (data.hits && data.hits.length > 0) {
            console.log('✅ Found image from Pixabay:', data.hits[0].webformatURL);
            return data.hits[0].webformatURL;
          }
        }
      }
    } catch (error) {
      console.log('Pixabay failed:', error.message);
    }

    // 3. Try Unsplash (no API key needed for basic usage)
    try {
      const unsplashResponse = await fetch(`https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}`);
      if (unsplashResponse.ok && unsplashResponse.url) {
        console.log('✅ Found image from Unsplash:', unsplashResponse.url);
        return unsplashResponse.url;
      }
    } catch (error) {
      console.log('Unsplash failed:', error.message);
    }

    // 4. Fallback to Lorem Picsum
    const fallbackUrl = `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`;
    console.log('⚠️ Using fallback image:', fallbackUrl);
    return fallbackUrl;

  } catch (error) {
    console.error('Error fetching image:', error);
    // Ultimate fallback
    return `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=${encodeURIComponent(query)}`;
  }
}

// Extract keywords for better image search
function extractImageKeywords(description) {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'image', 'photo', 'picture', 'illustration', 'graphic'];
  
  const words = description.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));

  return words.slice(0, 4).join(' ') || 'business presentation';
}

// Process slides with real images
async function processSlidesWithImages(slides) {
  const processedSlides = [];

  for (const slide of slides) {
    const processedSlide = { ...slide };

    if (slide.imageDescription) {
      try {
        const searchQuery = extractImageKeywords(slide.imageDescription);
        console.log('Searching for image:', searchQuery);
        const imageUrl = await fetchImageFromOpenSource(searchQuery);
        
        processedSlide.imageUrl = imageUrl;
        processedSlide.imageAlt = slide.imageDescription;
        console.log('✅ Added image to slide:', slide.title);
      } catch (error) {
        console.error('Failed to fetch image for slide:', slide.title, error);
      }
    }

    processedSlides.push(processedSlide);
  }

  return processedSlides;
}

// Create actual PPTX file using PptxGenJS
export async function downloadPowerPoint(slideData, filename = 'presentation.pptx') {
  try {
    console.log('🎯 Starting PPTX generation...');
    
    // Process slides with images
    const slidesWithImages = await processSlidesWithImages(slideData.slides);
    const slideDataWithImages = { ...slideData, slides: slidesWithImages };

    // Create new presentation
    const pptx = new pptxgen();
    
    // Set presentation properties
    pptx.author = 'MagicSlide AI';
    pptx.company = 'MagicSlide';
    pptx.title = slideDataWithImages.title || 'AI Generated Presentation';
    pptx.subject = 'Generated with MagicSlide AI';

    // Extract colors
    const primaryColor = slideDataWithImages.slides[0]?.primaryColor || '#2563eb';
    const secondaryColor = slideDataWithImages.slides[0]?.secondaryColor || '#3b82f6';
    const backgroundColor = slideDataWithImages.slides[0]?.backgroundColor || '#f8fafc';

    // Add title slide
    const titleSlide = pptx.addSlide();
    titleSlide.background = { fill: primaryColor };
    
    titleSlide.addText(slideDataWithImages.title || 'Presentation', {
      x: 1,
      y: 2,
      w: 8,
      h: 2,
      fontSize: 44,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });

    titleSlide.addText('Generated by MagicSlide AI', {
      x: 1,
      y: 4.5,
      w: 8,
      h: 1,
      fontSize: 24,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });

    titleSlide.addText(`${slideDataWithImages.slides.length} Slides • ${new Date().toLocaleDateString()}`, {
      x: 1,
      y: 5.5,
      w: 8,
      h: 0.5,
      fontSize: 16,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });

    // Add content slides
    for (let i = 0; i < slideDataWithImages.slides.length; i++) {
      const slide = slideDataWithImages.slides[i];
      const pptxSlide = pptx.addSlide();
      
      // Set background
      pptxSlide.background = { fill: 'FFFFFF' };
      
      // Add header with slide number
      pptxSlide.addText(`Slide ${i + 1}`, {
        x: 8.5,
        y: 0.2,
        w: 1.5,
        h: 0.5,
        fontSize: 12,
        color: primaryColor.replace('#', ''),
        align: 'right'
      });

      // Add title
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 32,
        bold: true,
        color: primaryColor.replace('#', ''),
        align: 'left'
      });

      // Add content
      let contentY = 1.8;
      
      if (slide.bulletPoints && slide.bulletPoints.length > 0) {
        // Add bullet points
        slide.bulletPoints.forEach((point, index) => {
          pptxSlide.addText(`• ${point}`, {
            x: 0.8,
            y: contentY,
            w: 8.5,
            h: 0.6,
            fontSize: 18,
            color: '333333',
            align: 'left',
            valign: 'top'
          });
          contentY += 0.7;
        });
      } else if (slide.content) {
        // Add paragraph content
        pptxSlide.addText(slide.content, {
          x: 0.8,
          y: contentY,
          w: 8.5,
          h: 2,
          fontSize: 18,
          color: '333333',
          align: 'left',
          valign: 'top'
        });
        contentY += 2.5;
      }

      // Add image if available
      if (slide.imageUrl && contentY < 6) {
        try {
          pptxSlide.addImage({
            path: slide.imageUrl,
            x: 1,
            y: contentY,
            w: 8,
            h: 7.5 - contentY,
            sizing: { type: 'contain', w: 8, h: 7.5 - contentY }
          });
          
          // Add image caption if available
          if (slide.imageDescription) {
            pptxSlide.addText(slide.imageDescription, {
              x: 1,
              y: 7.8,
              w: 8,
              h: 0.4,
              fontSize: 12,
              color: '666666',
              align: 'center',
              italic: true
            });
          }
        } catch (imageError) {
          console.warn('Failed to add image to slide:', imageError);
          // Add image placeholder instead
          pptxSlide.addShape('rect', {
            x: 1,
            y: contentY,
            w: 8,
            h: 2,
            fill: backgroundColor.replace('#', ''),
            line: { color: primaryColor.replace('#', ''), width: 2, dashType: 'dash' }
          });
          
          pptxSlide.addText(`🖼️ ${slide.imageDescription || 'Image'}`, {
            x: 1,
            y: contentY + 0.8,
            w: 8,
            h: 0.4,
            fontSize: 16,
            color: primaryColor.replace('#', ''),
            align: 'center'
          });
        }
      } else if (slide.imageDescription) {
        // Add image placeholder
        pptxSlide.addShape('rect', {
          x: 1,
          y: contentY,
          w: 8,
          h: 1.5,
          fill: backgroundColor.replace('#', ''),
          line: { color: primaryColor.replace('#', ''), width: 2, dashType: 'dash' }
        });
        
        pptxSlide.addText(`🖼️ ${slide.imageDescription}`, {
          x: 1,
          y: contentY + 0.6,
          w: 8,
          h: 0.4,
          fontSize: 16,
          color: primaryColor.replace('#', ''),
          align: 'center'
        });
      }
    }

    // Add closing slide
    const closingSlide = pptx.addSlide();
    closingSlide.background = { fill: primaryColor };
    
    closingSlide.addText('Thank You', {
      x: 1,
      y: 2.5,
      w: 8,
      h: 1.5,
      fontSize: 48,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });

    closingSlide.addText('Created with MagicSlide AI', {
      x: 1,
      y: 4.5,
      w: 8,
      h: 0.8,
      fontSize: 20,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });

    // Generate and download PPTX
    console.log('📦 Generating PPTX file...');
    await pptx.writeFile({ fileName: filename });
    
    console.log('✅ PPTX file generated successfully!');
    
    // Show success message
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.alert) {
        alert(`✅ PowerPoint presentation downloaded!\n\n📁 File: ${filename}\n📊 Slides: ${slideDataWithImages.slides.length + 2}\n🎨 Format: Microsoft PowerPoint (.pptx)\n\n🎉 Ready to present!`);
      }
    }, 500);
    
    return true;
  } catch (error) {
    console.error('❌ Error generating PPTX:', error);
    
    // Fallback to HTML if PPTX generation fails
    console.log('🔄 Falling back to HTML generation...');
    const htmlContent = generateFallbackHTML(slideData);
    downloadAsFile(htmlContent, filename.replace('.pptx', '.html'), 'text/html');
    
    if (typeof window !== 'undefined' && window.alert) {
      alert(`⚠️ PPTX generation failed, downloaded HTML instead.\n\nError: ${error.message}\n\n💡 You can import the HTML file into PowerPoint.`);
    }
    
    throw error;
  }
}

// Fallback HTML generation
function generateFallbackHTML(slideData) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>${slideData.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .slide { page-break-after: always; padding: 20px; border: 1px solid #ccc; margin-bottom: 20px; }
        h1 { color: #2563eb; }
        h2 { color: #3b82f6; margin-bottom: 20px; }
        ul { margin: 20px 0; }
        li { margin: 10px 0; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <h1>${slideData.title}</h1>
    ${slideData.slides.map((slide, index) => `
        <div class="slide">
            <h2>Slide ${index + 1}: ${slide.title}</h2>
            ${slide.bulletPoints ? `<ul>${slide.bulletPoints.map(point => `<li>${point}</li>`).join('')}</ul>` : ''}
            ${slide.content ? `<p>${slide.content}</p>` : ''}
            ${slide.imageUrl ? `<img src="${slide.imageUrl}" alt="${slide.imageDescription || ''}" />` : ''}
            ${slide.imageDescription && !slide.imageUrl ? `<p><em>Image: ${slide.imageDescription}</em></p>` : ''}
        </div>
    `).join('')}
</body>
</html>`;
}

// Helper function for file download
function downloadAsFile(content, filename, mimeType) {
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
}

// Export for compatibility
export { downloadPowerPoint as generatePowerPoint };
export default downloadPowerPoint;
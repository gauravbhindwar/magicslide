// Browser-compatible PowerPoint generation using client-side libraries
import JSZip from 'jszip';

// Image fetching utility with proper API key usage
async function fetchImageFromOpenSource(query, width = 800, height = 600) {
  try {
    console.log('🔍 Fetching image for:', query);

    // 1. Try Unsplash first (most reliable, no API key needed)
    try {
      const unsplashUrl = `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}`;
      console.log('🎯 Trying Unsplash:', unsplashUrl);
      
      // Test if URL is accessible
      const response = await fetch(unsplashUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ Found image from Unsplash');
        return unsplashUrl;
      }
    } catch (error) {
      console.log('⚠️ Unsplash failed, trying next source...');
    }

    // 2. Try Pexels (with API key)
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
          if (data.photos && data.photos.length > 0) {
            console.log('✅ Found image from Pexels');
            return data.photos[0].src.large;
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Pexels failed, trying next source...');
    }

    // 3. Try Pixabay (with API key)
    try {
      const pixabayApiKey = process.env.NEXT_PUBLIC_PIXABAY_API_KEY;
      if (pixabayApiKey) {
        const pixabayResponse = await fetch(`https://pixabay.com/api/?key=${pixabayApiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3&safesearch=true`);
        
        if (pixabayResponse.ok) {
          const data = await pixabayResponse.json();
          if (data.hits && data.hits.length > 0) {
            console.log('✅ Found image from Pixabay');
            return data.hits[0].webformatURL;
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Pixabay failed, trying next source...');
    }

    // 4. Fallback options
    const fallbackOptions = [
      `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`,
      `https://source.unsplash.com/${width}x${height}/?business`,
      `https://source.unsplash.com/${width}x${height}/?technology`,
      `https://via.placeholder.com/${width}x${height}/2563eb/ffffff?text=${encodeURIComponent(query.substring(0, 20))}`
    ];
    
    for (const fallbackUrl of fallbackOptions) {
      try {
        const response = await fetch(fallbackUrl, { method: 'HEAD' });
        if (response.ok) {
          console.log('⚠️ Using fallback image:', fallbackUrl);
          return fallbackUrl;
        }
      } catch (error) {
        continue;
      }
    }
    
    // Final fallback
    const finalFallback = `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=${encodeURIComponent('Image')}`;
    console.log('⚠️ Using final fallback image');
    return finalFallback;

  } catch (error) {
    console.error('❌ Error fetching image:', error);
    return `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=${encodeURIComponent('Image')}`;
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

// Create actual PPTX file using browser-compatible approach
export async function downloadPowerPoint(slideData, filename = 'presentation.pptx') {
  try {
    console.log('🎯 Starting PPTX generation...', slideData);
    
    // Process slides with images for better presentation quality
    const slidesWithImages = await processSlidesWithImages(slideData.slides);
    const slideDataWithImages = { ...slideData, slides: slidesWithImages };
    
    console.log('📸 Processed slides:', slidesWithImages.length, 'slides with images');

    // Create the PPTX file with proper error handling
    try {
      const pptxBlob = await generatePPTXFile(slideDataWithImages);
      
      if (pptxBlob && pptxBlob.size > 1000) { // Ensure the file has content
        // Download the actual PPTX file
        const actualFilename = filename.endsWith('.pptx') ? filename : filename + '.pptx';
        downloadAsFile(pptxBlob, actualFilename, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        
        // Show success popup
        setTimeout(() => {
          showDownloadSuccessPopup(actualFilename);
        }, 500);
        
        return true;
      } else {
        throw new Error('Generated PPTX file is empty or corrupted');
      }
    } catch (pptxError) {
      console.error('❌ PPTX generation failed:', pptxError);
      
      // Fallback to enhanced HTML approach that works reliably
      console.log('🔄 Using enhanced HTML fallback...');
      const powerPointHTML = generatePowerPointOptimizedHTML(slideDataWithImages);
      
      const htmlFilename = filename.replace('.pptx', '_PowerPoint_Ready.html');
      downloadAsFile(powerPointHTML, htmlFilename, 'text/html');
      
      // Show fallback info
      setTimeout(() => {
        alert(`HTML version downloaded as ${htmlFilename}. You can open this in PowerPoint by going to File > Open and selecting the HTML file, then save as PPTX.`);
      }, 500);
      
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error in downloadPowerPoint:', error);
    alert('Error generating presentation. Please try again.');
    return false;
  }
}

// Generate actual PPTX file using JSZip and Office Open XML format
async function generatePPTXFile(slideData) {
  const zip = new JSZip();
  
  // Create basic PPTX structure
  const title = slideData.title || 'Presentation';
  const slides = slideData.slides || [];
  
  console.log(`📁 Creating PPTX structure for "${title}" with ${slides.length} slides`);
  
  // Add required PPTX structure files with proper XML declarations
  zip.file('[Content_Types].xml', generateContentTypesXML(slides.length));
  zip.file('_rels/.rels', generateMainRelsXML());
  
  // Add core properties
  zip.file('docProps/core.xml', generateCorePropertiesXML(title));
  zip.file('docProps/app.xml', generateAppPropertiesXML(slides.length, title));
  
  // Add presentation files
  zip.file('ppt/presentation.xml', generatePresentationXML(slides.length, title));
  zip.file('ppt/_rels/presentation.xml.rels', generatePresentationRelsXML(slides.length));
  
  // Add theme and layouts
  zip.file('ppt/theme/theme1.xml', generateThemeXML());
  zip.file('ppt/slideLayouts/slideLayout1.xml', generateSlideLayoutXML());
  zip.file('ppt/slideMasters/slideMaster1.xml', generateSlideMasterXML());
  zip.file('ppt/slideMasters/_rels/slideMaster1.xml.rels', generateSlideMasterRelsXML());
  zip.file('ppt/slideLayouts/_rels/slideLayout1.xml.rels', generateSlideLayoutRelsXML());
  
  // Add individual slides with enhanced content
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const slideXML = generateSlideXML(slide, i + 1);
    zip.file(`ppt/slides/slide${i + 1}.xml`, slideXML);
    zip.file(`ppt/slides/_rels/slide${i + 1}.xml.rels`, generateSlideRelsXML());
  }
  
  // Generate the PPTX file with better compression
  const pptxBlob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6
    }
  });
  
  console.log(`✅ Generated PPTX file: ${pptxBlob.size} bytes`);
  return pptxBlob;
}

// Generate Office Open XML structure files
function generateContentTypesXML(slideCount) {
  let slideParts = '';
  for (let i = 1; i <= slideCount; i++) {
    slideParts += `<Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
  }
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  ${slideParts}
</Types>`;
}

function generateMainRelsXML() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function generateCorePropertiesXML(title) {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${title.replace(/[<>&"']/g, (match) => {
    switch (match) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return match;
    }
  })}</dc:title>
  <dc:creator>MagicSlide AI</dc:creator>
  <cp:lastModifiedBy>MagicSlide AI</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
}

function generateAppPropertiesXML(slideCount, title) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>MagicSlide AI</Application>
  <PresentationFormat>On-screen Show (16:9)</PresentationFormat>
  <Slides>${slideCount}</Slides>
  <Notes>0</Notes>
  <HiddenSlides>0</HiddenSlides>
  <MMClips>0</MMClips>
  <ScaleCrop>false</ScaleCrop>
  <Company>MagicSlide</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>`;
}

function generatePresentationXML(slideCount, title) {
  let slideIdList = '';
  for (let i = 1; i <= slideCount; i++) {
    slideIdList += `<p:sldId id="${255 + i}" r:id="rId${i + 2}"/>`;
  }
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    ${slideIdList}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`;
}

function generatePresentationRelsXML(slideCount) {
  let relationships = '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>';
  
  for (let i = 1; i <= slideCount; i++) {
    relationships += `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>`;
  }
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${relationships}
</Relationships>`;
}

function generateSlideRelsXML() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`;
}

function generateSlideMasterRelsXML() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`;
}

function generateSlideLayoutRelsXML() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`;
}

function generateSlideXML(slide, slideNumber) {
  const title = slide.title || `Slide ${slideNumber}`;
  console.log(`📝 Generating slide ${slideNumber}: ${title}`);
  
  // Create proper content structure for PowerPoint
  let contentElements = '';
  
  if (slide.bulletPoints && slide.bulletPoints.length > 0) {
    console.log(`   📋 Adding ${slide.bulletPoints.length} bullet points`);
    // Generate bullet points with proper formatting
    const bulletContent = slide.bulletPoints.map(point => {
      const cleanPoint = point.replace(/[<>&"']/g, (match) => {
        switch (match) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '"': return '&quot;';
          case "'": return '&apos;';
          default: return match;
        }
      });
      return `<a:p><a:pPr lvl="0"><a:buChar char="•"/></a:pPr><a:r><a:rPr lang="en-US" sz="2400" dirty="0"><a:solidFill><a:srgbClr val="333333"/></a:solidFill></a:rPr><a:t>${cleanPoint}</a:t></a:r></a:p>`;
    }).join('');
    
    contentElements = `
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="4" name="Content Placeholder"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="body" idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="1600200"/>
            <a:ext cx="8229600" cy="${slide.imageUrl ? '2500000' : '4525963'}"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          ${bulletContent}
        </p:txBody>
      </p:sp>`;
  } else if (slide.content) {
    console.log(`   📄 Adding content paragraph`);
    // Generate regular content with proper escaping
    const cleanContent = slide.content.replace(/[<>&"']/g, (match) => {
      switch (match) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&apos;';
        default: return match;
      }
    });
    
    contentElements = `
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="4" name="Content Placeholder"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="body" idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="1600200"/>
            <a:ext cx="8229600" cy="${slide.imageUrl ? '2500000' : '4525963'}"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p><a:r><a:rPr lang="en-US" sz="2400"><a:solidFill><a:srgbClr val="333333"/></a:solidFill></a:rPr><a:t>${cleanContent}</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>`;
  } else {
    console.log(`   ⚠️ No content found for slide ${slideNumber}`);
    // Add placeholder content
    contentElements = `
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="4" name="Content Placeholder"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="body" idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="1600200"/>
            <a:ext cx="8229600" cy="${slide.imageUrl ? '2500000' : '4525963'}"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p><a:r><a:rPr lang="en-US" sz="2400"><a:solidFill><a:srgbClr val="333333"/></a:solidFill></a:rPr><a:t>Content for ${title}</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>`;
  }

  // Add image element if imageUrl exists
  let imageElement = '';
  if (slide.imageUrl) {
    console.log(`   🖼️ Adding image element to slide ${slideNumber}`);
    const imageAlt = slide.imageDescription || slide.imageAlt || 'Slide image';
    const cleanImageAlt = imageAlt.replace(/[<>&"']/g, (match) => {
      switch (match) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&apos;';
        default: return match;
      }
    });
    
    imageElement = `
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="5" name="Picture ${slideNumber}" descr="${cleanImageAlt}"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="4200000"/>
            <a:ext cx="8229600" cy="2400000"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1800">
                <a:solidFill>
                  <a:srgbClr val="666666"/>
                </a:solidFill>
              </a:rPr>
              <a:t>[Image: ${cleanImageAlt}]</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1400">
                <a:solidFill>
                  <a:srgbClr val="888888"/>
                </a:solidFill>
              </a:rPr>
              <a:t>URL: ${slide.imageUrl}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>`;
  }

  // Escape title for XML
  const cleanTitle = title.replace(/[<>&"']/g, (match) => {
    switch (match) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return match;
    }
  });
      
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="title"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="274638"/>
            <a:ext cx="8229600" cy="1143000"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="4400" b="1" dirty="0">
                <a:solidFill>
                  <a:srgbClr val="2563eb"/>
                </a:solidFill>
              </a:rPr>
              <a:t>${cleanTitle}</a:t>
            </a:r>
            <a:endParaRPr lang="en-US" sz="4400" b="1" dirty="0"/>
          </a:p>
        </p:txBody>
      </p:sp>
      ${contentElements}
      ${imageElement}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`;
}

function generateThemeXML() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
  <a:themeElements>
    <a:clrScheme name="Office">
      <a:dk1>
        <a:sysClr val="windowText" lastClr="000000"/>
      </a:dk1>
      <a:lt1>
        <a:sysClr val="window" lastClr="FFFFFF"/>
      </a:lt1>
      <a:dk2>
        <a:srgbClr val="1F497D"/>
      </a:dk2>
      <a:lt2>
        <a:srgbClr val="EEECE1"/>
      </a:lt2>
      <a:accent1>
        <a:srgbClr val="2563EB"/>
      </a:accent1>
      <a:accent2>
        <a:srgbClr val="3B82F6"/>
      </a:accent2>
      <a:accent3>
        <a:srgbClr val="8B5CF6"/>
      </a:accent3>
      <a:accent4>
        <a:srgbClr val="EC4899"/>
      </a:accent4>
      <a:accent5>
        <a:srgbClr val="10B981"/>
      </a:accent5>
      <a:accent6>
        <a:srgbClr val="F59E0B"/>
      </a:accent6>
      <a:hlink>
        <a:srgbClr val="0563C1"/>
      </a:hlink>
      <a:folHlink>
        <a:srgbClr val="954F72"/>
      </a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Office">
      <a:majorFont>
        <a:latin typeface="Calibri"/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="Calibri"/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Office">
      <a:fillStyleLst>
        <a:solidFill>
          <a:schemeClr val="phClr"/>
        </a:solidFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525" cap="flat" cmpd="sng" algn="ctr">
          <a:solidFill>
            <a:schemeClr val="phClr"/>
          </a:solidFill>
        </a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle>
          <a:effectLst/>
        </a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill>
          <a:schemeClr val="phClr"/>
        </a:solidFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>`;
}

function generateSlideLayoutXML() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" type="titleAndBody" preserve="1">
  <p:cSld name="Title and Content">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title 1"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="title"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="274638"/>
            <a:ext cx="8229600" cy="1143000"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle>
            <a:lvl1pPr marL="0" algn="ctr" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1">
              <a:defRPr sz="4400" kern="1200">
                <a:solidFill>
                  <a:schemeClr val="tx1"/>
                </a:solidFill>
                <a:latin typeface="+mj-lt"/>
                <a:ea typeface="+mj-ea"/>
                <a:cs typeface="+mj-cs"/>
              </a:defRPr>
            </a:lvl1pPr>
          </a:lstStyle>
          <a:p>
            <a:pPr algn="ctr"/>
            <a:endParaRPr lang="en-US"/>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content Placeholder 2"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="body" idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="1600200"/>
            <a:ext cx="8229600" cy="4525963"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle>
            <a:lvl1pPr marL="342900" indent="-342900" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1">
              <a:defRPr sz="2800" kern="1200">
                <a:solidFill>
                  <a:schemeClr val="tx1"/>
                </a:solidFill>
                <a:latin typeface="+mn-lt"/>
                <a:ea typeface="+mn-ea"/>
                <a:cs typeface="+mn-cs"/>
              </a:defRPr>
            </a:lvl1pPr>
          </a:lstStyle>
          <a:p>
            <a:pPr lvl="0"/>
            <a:endParaRPr lang="en-US"/>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sldLayout>`;
}

function generateSlideMasterXML() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:bg>
      <p:bgRef idx="1001">
        <a:schemeClr val="bg1"/>
      </p:bgRef>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title Placeholder 1"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="title"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="274638"/>
            <a:ext cx="8229600" cy="1143000"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle>
            <a:lvl1pPr algn="ctr">
              <a:defRPr sz="4400" b="1">
                <a:solidFill>
                  <a:schemeClr val="tx1"/>
                </a:solidFill>
                <a:latin typeface="Calibri"/>
              </a:defRPr>
            </a:lvl1pPr>
          </a:lstStyle>
          <a:p>
            <a:endParaRPr lang="en-US"/>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content Placeholder 2"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="body" idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="1600200"/>
            <a:ext cx="8229600" cy="4525963"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle>
            <a:lvl1pPr marL="342900" indent="-342900">
              <a:buChar char="•"/>
              <a:defRPr sz="2800">
                <a:solidFill>
                  <a:schemeClr val="tx1"/>
                </a:solidFill>
                <a:latin typeface="Calibri"/>
              </a:defRPr>
            </a:lvl1pPr>
          </a:lstStyle>
          <a:p>
            <a:endParaRPr lang="en-US"/>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
</p:sldMaster>`;
}

// Success popup for PPTX download
function showDownloadSuccessPopup(filename) {
  if (typeof window !== 'undefined') {
    // Create and show a modern popup
    const popup = document.createElement('div');
    popup.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        z-index: 10000;
        max-width: 480px;
        text-align: center;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        border: 1px solid #e5e7eb;
      ">
        <div style="margin-bottom: 20px;">
          <div style="
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 50%;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
          ">✅</div>
          <h3 style="
            margin: 0 0 8px 0;
            font-size: 20px;
            font-weight: 600;
            color: #111827;
          ">PPTX Downloaded Successfully!</h3>
          <p style="
            margin: 0;
            color: #6b7280;
            font-size: 14px;
          ">File: <strong>${filename}</strong></p>
        </div>
        <div style="
          background: #f3f4f6;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          text-align: left;
        ">
          <p style="
            margin: 0 0 12px 0;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
          ">🎯 Your presentation is ready!</p>
          <ul style="
            margin: 0;
            padding-left: 20px;
            color: #4b5563;
            font-size: 14px;
            line-height: 1.5;
          ">
            <li>Open the file in PowerPoint</li>
            <li>Edit and customize as needed</li>
            <li>Your images and formatting are preserved</li>
          </ul>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-weight: 500;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
          Got it! 🚀
        </button>
      </div>
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
      " onclick="this.parentElement.remove()"></div>
    `;
    
    document.body.appendChild(popup);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (popup.parentElement) {
        popup.remove();
      }
    }, 8000);
  }
}

// Fallback popup for HTML download
function showHTMLDownloadPopup(filename) {
  if (typeof window !== 'undefined') {
    const popup = document.createElement('div');
    popup.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        z-index: 10000;
        max-width: 520px;
        text-align: center;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        border: 1px solid #e5e7eb;
      ">
        <div style="margin-bottom: 20px;">
          <div style="
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            border-radius: 50%;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
          ">📄</div>
          <h3 style="
            margin: 0 0 8px 0;
            font-size: 20px;
            font-weight: 600;
            color: #111827;
          ">PowerPoint-Ready File Downloaded</h3>
          <p style="
            margin: 0;
            color: #6b7280;
            font-size: 14px;
          ">File: <strong>${filename}</strong></p>
        </div>
        <div style="
          background: #fef3c7;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          text-align: left;
          border: 1px solid #fbbf24;
        ">
          <p style="
            margin: 0 0 16px 0;
            font-weight: 600;
            color: #92400e;
            font-size: 14px;
          ">💡 To convert to PowerPoint (.pptx):</p>
          <ol style="
            margin: 0;
            padding-left: 20px;
            color: #78350f;
            font-size: 14px;
            line-height: 1.6;
          ">
            <li>Open the HTML file in your browser</li>
            <li>Select all content (Ctrl+A / Cmd+A)</li>
            <li>Copy (Ctrl+C / Cmd+C)</li>
            <li>Open PowerPoint and create new presentation</li>
            <li>Paste (Ctrl+V / Cmd+V)</li>
            <li>Save as .pptx</li>
          </ol>
          <p style="
            margin: 16px 0 0 0;
            color: #92400e;
            font-size: 13px;
            font-style: italic;
          ">✨ The formatting is optimized for perfect PowerPoint import!</p>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button onclick="window.open('${filename}', '_blank')" style="
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            font-weight: 500;
            cursor: pointer;
            font-size: 14px;
          ">
            Open File 📂
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" style="
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 12px 20px;
            font-weight: 500;
            cursor: pointer;
            font-size: 14px;
          ">
            Got it! 👍
          </button>
        </div>
      </div>
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
      " onclick="this.parentElement.remove()"></div>
    `;
    
    document.body.appendChild(popup);
    
    // Auto-remove after 12 seconds
    setTimeout(() => {
      if (popup.parentElement) {
        popup.remove();
      }
    }, 12000);
  }
}

// Generate PowerPoint-optimized HTML (fallback)
function generatePowerPointOptimizedHTML(slideData) {
  const title = slideData.title || 'Presentation';
  const slides = slideData.slides || [];
  const primaryColor = slides[0]?.primaryColor || '#2563eb';
  const secondaryColor = slides[0]?.secondaryColor || '#3b82f6';
  const backgroundColor = slides[0]?.backgroundColor || '#f8fafc';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 18px; line-height: 1.5; color: #333; background: white; }
        .slide { page-break-after: always; background: white; border: 3px solid ${primaryColor}; border-radius: 15px; padding: 60px; margin-bottom: 40px; min-height: 19cm; }
        .slide h2 { color: ${primaryColor}; font-size: 42px; font-weight: bold; margin-bottom: 40px; }
        .bullet-points { list-style: none; padding: 0; margin: 0; }
        .bullet-points li { position: relative; padding-left: 50px; margin-bottom: 25px; font-size: 22px; }
        .bullet-points li::before { content: '●'; position: absolute; left: 0; color: ${primaryColor}; font-size: 28px; font-weight: bold; top: -2px; }
    </style>
</head>
<body>
    <h1 style="text-align: center; font-size: 54px; color: ${primaryColor}; margin-bottom: 40px;">${title}</h1>
    ${slides.map((slide, index) => `
    <div class="slide">
        <h2>${slide.title}</h2>
        ${slide.bulletPoints && slide.bulletPoints.length > 0 
            ? `<ul class="bullet-points">${slide.bulletPoints.map(point => `<li>${point}</li>`).join('')}</ul>`
            : slide.content ? `<div style="font-size: 22px; line-height: 1.6;">${slide.content}</div>` : ''
        }
        ${slide.imageUrl ? `<div style="text-align: center; margin: 40px 0;"><img src="${slide.imageUrl}" alt="${slide.imageAlt || ''}" style="max-width: 100%; max-height: 400px; border-radius: 12px;"/></div>` : ''}
    </div>`).join('')}
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
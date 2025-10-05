import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Image fetching utility function
async function fetchImageFromAPI(query) {
  try {
    console.log('🔍 Fetching image for:', query);

    // Try Unsplash first (most reliable, no API key needed)
    try {
      const unsplashUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`;
      const response = await fetch(unsplashUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ Found image from Unsplash');
        return unsplashUrl;
      }
    } catch (error) {
      console.log('⚠️ Unsplash failed, trying next source...');
    }

    // Try Pexels
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

    // Try Pixabay
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
      console.log('⚠️ Pixabay failed, using fallback...');
    }

    // Fallback to Lorem Picsum
    const fallbackUrl = `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
    console.log('⚠️ Using fallback image');
    return fallbackUrl;

  } catch (error) {
    console.error('❌ Error fetching image:', error);
    return `https://via.placeholder.com/800x600/e5e7eb/6b7280?text=${encodeURIComponent('Image')}`;
  }
}

// Process slides to add actual image URLs
async function processSlidesWithImages(slides) {
  const processedSlides = [];

  for (const slide of slides) {
    const processedSlide = { ...slide };

    if (slide.imageDescription) {
      try {
        const searchQuery = slide.imageDescription.toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 2)
          .slice(0, 4)
          .join(' ') || 'business presentation';
          
        const imageUrl = await fetchImageFromAPI(searchQuery);
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

export async function POST(request) {
  try {
    const { prompt, action = 'generate', customization } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key not configured. Please set GOOGLE_API_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create enhanced prompt with customization details
    const fullPrompt = createEnhancedPrompt(prompt, customization, action);

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract slide data
    const slideData = parseSlideResponse(text, customization);
    
    // Fetch actual images if customization includes images
    const includeImages = customization?.includeImages !== false; // Default to true
    let finalSlideData = slideData;
    
    if (includeImages && slideData.slides.some(slide => slide.imageDescription)) {
      console.log('📸 Processing slides with images...');
      const slidesWithImages = await processSlidesWithImages(slideData.slides);
      finalSlideData = { ...slideData, slides: slidesWithImages };
    }
    
    console.log('✅ Successfully processed slide data:', {
      title: finalSlideData.title,
      slideCount: finalSlideData.slides.length,
      imagesProcessed: finalSlideData.slides.filter(s => s.imageUrl).length
    });

    return NextResponse.json({ 
      success: true, 
      data: finalSlideData,
      title: finalSlideData.title,
      slides: finalSlideData.slides
    });

  } catch (error) {
    console.error('Error generating slides:', error);
    
    if (error.message?.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { error: 'Invalid Google AI API key. Please check your API key configuration.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate slides. Please try again.' },
      { status: 500 }
    );
  }
}

function createEnhancedPrompt(prompt, customization, action = 'generate') {
  const {
    colorScheme = { name: 'Professional Blue', primary: '#2563eb', secondary: '#3b82f6', bg: '#f8fafc' },
    presentationType = { name: 'Business Presentation', value: 'business' },
    slideCount = null, // Allow user to specify slide count
    tone = 'professional',
    targetAudience = 'general',
    includeImages = true,
    selectedElements = []
  } = customization || {};

  // Extract slide count from prompt if mentioned
  const slideCountMatch = prompt.match(/(\d+)\s*(?:slides?|pages?)/i);
  const requestedSlideCount = slideCountMatch ? parseInt(slideCountMatch[1]) : slideCount;
  
  const slideCountGuidance = requestedSlideCount 
    ? `Create exactly ${requestedSlideCount} slides as requested.`
    : 'Create an appropriate number of slides (typically 5-12) based on the content depth and complexity. For simple topics use 5-7 slides, for comprehensive topics use 8-12 slides.';

  if (action === 'edit') {
    return `You are an AI assistant that edits PowerPoint slide content. Based on the user's editing request, modify the existing slide content and return the updated JSON structure.

User editing request: ${prompt}

Return the same JSON structure as before but with the requested modifications applied. Ensure all slides maintain their color properties.`;
  }

  return `Create a comprehensive presentation about: "${prompt}"

STRICT REQUIREMENTS:
1. Return ONLY valid JSON without any markdown formatting or code blocks
2. Use this exact color scheme:
   - Primary Color: ${colorScheme.primary}
   - Secondary Color: ${colorScheme.secondary}  
   - Background Color: ${colorScheme.bg}

3. Presentation Style: ${presentationType.name}
4. ${slideCountGuidance}
5. Follow the user's specific content requirements exactly
4. Tone: ${tone}
5. Target Audience: ${targetAudience}
6. Include Images: ${includeImages ? 'Yes' : 'No'}
7. Selected Elements: ${selectedElements.join(', ') || 'Standard elements'}

EXACT JSON FORMAT (no deviations):
{
  "title": "Presentation Title Here",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "content": "Main content paragraph when needed",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"],
      "type": "title|content|conclusion|introduction",
      "primaryColor": "${colorScheme.primary}",
      "secondaryColor": "${colorScheme.secondary}",
      "backgroundColor": "${colorScheme.bg}",
      "imageDescription": "Describe relevant image when includeImages is true"
    }
  ]
}

CONTENT GUIDELINES:
- Create engaging, informative content appropriate for ${targetAudience} audience
- Use ${tone} tone throughout
- Each slide should have 3-5 bullet points OR detailed content paragraph
- Include compelling titles that grab attention
- Add SPECIFIC, DETAILED image descriptions when includeImages is true (e.g., "business team meeting in modern office", "data analytics charts and graphs", "professional woman presenting to audience", "technology innovation concept with circuit boards")
- Vary slide types: title slide, content slides, conclusion slide
- Make content flow logically from introduction to conclusion
- Include elements: ${selectedElements.join(', ') || 'standard presentation elements'}

For image descriptions, be very specific and use keywords that will find good images:
- Instead of "team work": use "business team collaboration meeting office"
- Instead of "technology": use "modern technology innovation digital circuit"
- Instead of "success": use "business success achievement celebration"
- Include relevant objects, settings, and actions

Return the JSON immediately without any explanation or formatting.`;
}

function parseSlideResponse(text, customization) {
  try {
    // Clean the response text
    let cleanText = text.trim();
    
    // Remove any markdown code block markers
    cleanText = cleanText.replace(/```json\s*/g, '');
    cleanText = cleanText.replace(/```\s*/g, '');
    
    // Find JSON content
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }

    const parsed = JSON.parse(cleanText);
    
    // Ensure all slides have color information
    const colorScheme = customization?.colorScheme || {
      primary: '#2563eb',
      secondary: '#3b82f6',
      bg: '#f8fafc'
    };

    const enhancedSlides = parsed.slides.map((slide, index) => ({
      ...slide,
      slideNumber: slide.slideNumber || (index + 1),
      primaryColor: slide.primaryColor || colorScheme.primary,
      secondaryColor: slide.secondaryColor || colorScheme.secondary,
      backgroundColor: slide.backgroundColor || colorScheme.bg,
      type: slide.type || 'content'
    }));

    return {
      title: parsed.title || 'Generated Presentation',
      slides: enhancedSlides
    };
    
  } catch (error) {
    console.error('Error parsing slide response:', error);
    
    // Fallback with proper colors
    const colorScheme = customization?.colorScheme || {
      primary: '#2563eb',
      secondary: '#3b82f6', 
      bg: '#f8fafc'
    };
    
    return {
      title: 'Generated Presentation',
      slides: [
        {
          slideNumber: 1,
          title: 'Welcome to Your Presentation',
          content: 'This presentation was generated based on your request with beautiful styling and colors.',
          bulletPoints: [
            'AI-powered content generation',
            'Custom color schemes and themes',
            'Professional presentation format',
            'Engaging visual design'
          ],
          type: 'title',
          primaryColor: colorScheme.primary,
          secondaryColor: colorScheme.secondary,
          backgroundColor: colorScheme.bg
        },
        {
          slideNumber: 2,
          title: 'Main Content Section',
          content: 'Your presentation content will appear here with beautiful styling and proper color schemes.',
          bulletPoints: [
            'Colorful and engaging slides',
            'Professional design elements',
            'Easy to read and understand',
            'Customizable themes and layouts'
          ],
          type: 'content',
          primaryColor: colorScheme.primary,
          secondaryColor: colorScheme.secondary,
          backgroundColor: colorScheme.bg
        }
      ]
    };
  }
}
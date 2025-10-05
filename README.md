# MagicSlide AI - AI-Powered Presentation Generator

A modern, AI-powered chat application that generates and edits PowerPoint presentations using Google's Gemini AI. Create stunning, customizable presentations with intelligent content generation, beautiful themes, and interactive editing capabilities.

## 🌟 Features

### ✨ AI-Powered Content Generation
- **Google Gemini Integration**: Uses Gemini 2.0 Flash for intelligent slide content creation
- **Smart Content Structuring**: Automatically organizes content into logical slide sequences
- **Context-Aware Editing**: Understands your presentation context for seamless updates

### 🎨 Advanced Customization
- **8+ Color Schemes**: Professional themes from Corporate Blue to Creative Orange
- **6 Presentation Types**: Business, Educational, Creative, Pitch, Marketing, and Reports
- **Flexible Slide Count**: Choose anywhere from 5-20 slides
- **Custom Elements**: Title slides, agendas, content, images, quotes, stats, timelines, team intros, and more
- **Tone & Audience**: Adapt content for different audiences and communication styles

### 🚀 Interactive Features
- **Real-time Chat Interface**: Conversational editing and refinement
- **Live Preview**: See your presentation as it's being created
- **Quick Templates**: Pre-built templates for common presentation types
- **Drag & Drop Elements**: Easy customization of slide components

### 🔒 Secure Data Management
- **Encrypted Storage**: Chat history secured with XOR encryption
- **Local Storage**: Data stays in your browser for privacy
- **Export/Import**: Backup and restore your chat history
- **Auto-cleanup**: Intelligent storage management

### 📱 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Beautiful Animations**: Smooth transitions and hover effects
- **Intuitive Navigation**: Easy-to-use interface inspired by modern chat applications
- **Accessibility**: WCAG compliant design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/magicslide.git
   cd magicslide
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   GOOGLE_API_KEY=your_google_gemini_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage Guide

### Creating Your First Presentation

1. **Choose Your Method**
   - **Quick Templates**: Select from pre-built templates for instant creation
   - **Custom Creation**: Use the advanced customizer for full control

2. **Customize Your Presentation**
   - Enter your topic and target slide count
   - Choose a presentation type and color scheme
   - Select the elements you want included
   - Set the tone and target audience

3. **Generate and Refine**
   - AI generates your presentation instantly
   - Use the chat interface to make adjustments
   - Preview slides in real-time

4. **Download and Share**
   - Export as HTML for web viewing
   - Download for offline presentations
   - Share your creation with others

### Advanced Features

#### Chat-Based Editing
- "Make the introduction more engaging"
- "Add a slide about market analysis"
- "Change the color scheme to something warmer"
- "Make this more suitable for executives"

#### Custom Elements
- **Title Slides**: Professional opening slides
- **Agendas**: Clear presentation outlines
- **Content Slides**: Bullet points and detailed information
- **Image Placeholders**: Visual content suggestions
- **Statistics**: Data visualization recommendations
- **Timelines**: Chronological progressions
- **Team Introductions**: Professional bios and photos
- **Contact Information**: Professional closing slides

## 🛠 Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **React Hooks**: State management and lifecycle

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Google Generative AI**: Gemini AI integration
- **Client-side Storage**: Encrypted localStorage

### Deployment
- **Vercel Ready**: Optimized for Vercel deployment
- **Environment Variables**: Secure configuration management
- **Static Export**: Can be deployed anywhere

## 📁 Project Structure

```
magicslide/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate-slides/
│   │   │       └── route.js          # Gemini AI integration
│   │   ├── globals.css               # Global styles
│   │   ├── layout.js                 # Root layout
│   │   └── page.js                   # Main application
│   ├── components/
│   │   ├── ChatHistory.js            # Chat message display
│   │   ├── ChatInput.js              # Message input component
│   │   ├── ChatMessage.js            # Individual message
│   │   ├── PresentationCustomizer.js # Advanced customization
│   │   ├── PresentationPreview.js    # Slide preview
│   │   ├── SlidePreviewModal.js      # Full-screen preview
│   │   └── WelcomeSection.js         # Landing page
│   └── lib/
│       ├── pptxGenerator.js          # Presentation generation
│       └── secureStorage.js          # Encrypted storage
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── package.json                      # Dependencies
└── README.md                         # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Gemini AI API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL for production | No |

### API Configuration

The application uses Google's Gemini 2.0 Flash model for content generation. You can modify the model or parameters in `src/app/api/generate-slides/route.js`.

## 🎨 Customization

### Adding New Color Schemes
Edit `src/components/PresentationCustomizer.js` and add to the `COLOR_SCHEMES` array:

```javascript
{
  name: 'Your Theme Name',
  primary: '#your-primary-color',
  secondary: '#your-secondary-color', 
  accent: '#your-accent-color',
  bg: '#your-background-color'
}
```

### Adding Presentation Types
Extend the `PRESENTATION_TYPES` array with new templates:

```javascript
{
  id: 'your-type',
  name: 'Your Type Name',
  icon: '🎯',
  description: 'Description of your presentation type'
}
```

### Custom Slide Elements
Add new elements to the `SLIDE_ELEMENTS` array for more customization options.

## 🐛 Troubleshooting

### Common Issues

**API Key Errors**
```bash
Error: Invalid API key
```
- Ensure your Google Gemini API key is correctly set in `.env.local`
- Verify the API key has proper permissions

**Build Errors**
```bash
Module not found errors
```
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder and restart development server

**Storage Issues**
```bash
localStorage not available
```
- The app requires localStorage for chat history
- Ensure your browser supports localStorage
- Check if you're in private/incognito mode

### Performance Optimization

- **Large Presentations**: Limit slide count for better performance
- **Image Generation**: Currently uses placeholders; integrate with image APIs for actual images
- **Caching**: Chat history is cached locally for faster loading

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy**: Automatic deployments on every push

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Docker containers

## 📈 Future Roadmap

### Planned Features
- [ ] **Real PowerPoint Export**: True PPTX file generation
- [ ] **Image Integration**: AI-generated images for slides
- [ ] **Collaboration**: Multi-user editing capabilities
- [ ] **Templates Gallery**: Community-created templates
- [ ] **Animation Support**: Slide transitions and animations
- [ ] **Voice Input**: Speech-to-text for content creation
- [ ] **Analytics**: Presentation performance metrics

### Technical Improvements
- [ ] **Streaming Responses**: Real-time AI generation
- [ ] **Offline Mode**: Service worker for offline usage
- [ ] **Performance**: Lazy loading and code splitting
- [ ] **Testing**: Comprehensive test suite
- [ ] **Accessibility**: Enhanced screen reader support

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful content generation
- **Next.js Team** for the excellent framework
- **Tailwind CSS** for beautiful styling utilities
- **Lucide** for clean, modern icons
- **Open Source Community** for inspiration and tools

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/magicslide/issues)
- **Documentation**: Check this README for common questions
- **Community**: Join discussions in GitHub Discussions

---

**Made with ❤️ by the MagicSlide Team**

*Transform your ideas into beautiful presentations with the power of AI.*

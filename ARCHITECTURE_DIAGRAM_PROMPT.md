# Detailed Prompt for AuraCare System Architecture Diagram

## 🎨 Main Prompt for AI Image Generation

```
Create a professional, modern system architecture diagram for "AuraCare" - an AI-powered mental health companion application. The diagram should be clean, technical, and visually appealing with the following specifications:

LAYOUT & STRUCTURE:
- Title at top: "AuraCare System Architecture" in bold, gradient purple text
- Three horizontal layers stacked vertically with clear separation
- Use modern flat design with subtle gradients and shadows
- White/light gray background with colored accent boxes
- Professional tech diagram aesthetic similar to AWS or Azure architecture diagrams

LAYER 1 - FRONTEND (Top, Purple/Violet Theme):
- Large rounded rectangle container with purple gradient border (#8B5CF6 to #A78BFA)
- Header: "Frontend Layer - React Application"
- Subheader: "Deployed on Firebase Hosting"
- Six component boxes arranged in 2 rows of 3:
  1. "Login & Authentication" (icon: 🔐)
  2. "Welcome Carousel" (icon: 🎠)
  3. "Chat Interface" (icon: 💬)
  4. "Emotion Detector" (icon: 😊)
  5. "Meditation Module" (icon: 🧘)
  6. "Wellness Dashboard" (icon: 💡)
- Technology badges at bottom: React 18 | Framer Motion | face-api.js | styled-components | axios
- Each component box should have: icon, title, brief description

LAYER 2 - BACKEND (Middle, Blue Theme):
- Large rounded rectangle container with blue gradient border (#3B82F6 to #60A5FA)
- Header: "Backend Layer - Flask REST API"
- Subheader: "Deployed on Render.com"
- Left side - API Endpoints (6 boxes in monospace font):
  • POST /auth/register
  • POST /auth/login
  • POST /chat
  • POST /speech-to-text
  • GET /history
  • GET /health
- Right side - Core Components (4 boxes):
  1. "Flask Server" (icon: 🔧)
  2. "Session Manager" (icon: 🗄️)
  3. "AI Integration" (icon: 🤖)
  4. "Speech Processor" (icon: 🎤)
- Technology badges: Flask 2.0+ | Flask-CORS | google-generativeai | SpeechRecognition

LAYER 3 - EXTERNAL SERVICES (Bottom, Teal/Green Theme):
- Large rounded rectangle container with teal gradient border (#14B8A6 to #5EEAD4)
- Header: "External Services & APIs"
- Three main service boxes:
  1. "Google Gemini AI" (icon: 🧠)
     - Model: gemini-2.5-flash-lite
     - Purpose: Empathetic conversation generation
  2. "Firebase Services" (icon: 🔥)
     - Hosting, Analytics, Performance
  3. "Speech APIs" (icon: 🎙️)
     - Web Speech Recognition
     - Text-to-Speech Synthesis

DATA FLOW ARROWS:
- Thick purple arrows between Frontend and Backend (bidirectional)
  Label: "REST API / JSON"
- Blue arrows from Backend to External Services
  Label: "API Calls"
- Green arrows from Frontend to Firebase
  Label: "Hosting & Analytics"
- Use solid arrows for synchronous calls, dashed for asynchronous

SIDE PANELS:
Left side panel (vertical):
- Title: "Key Features"
- Icon list with checkmarks:
  ✓ AI-Powered Conversations
  ✓ Real-time Emotion Detection
  ✓ Voice Input/Output
  ✓ Guided Meditation
  ✓ 24/7 Availability
  ✓ Privacy-First Design

Right side panel (vertical):
- Title: "Data Flow"
- Numbered steps showing user journey:
  1. User Authentication
  2. Emotion Detection (Optional)
  3. Message Input
  4. AI Processing
  5. Response Generation
  6. Audio Output

BOTTOM SECTION:
- Color-coded legend showing:
  • Purple = Frontend Components
  • Blue = Backend Services
  • Teal = External APIs
  • Arrows = Data Flow Direction

VISUAL STYLE:
- Use rounded corners (8-12px radius) for all boxes
- Subtle drop shadows for depth (0 4px 12px rgba(0,0,0,0.1))
- Gradient backgrounds for main layers
- Icons should be colorful and modern
- Font: Clean sans-serif (Inter, Roboto, or similar)
- Color palette: Purple (#8B5CF6), Blue (#3B82F6), Teal (#14B8A6), with lighter tints
- Add subtle grid pattern in background
- Include small decorative elements like dots or lines connecting related components

TECHNICAL DETAILS TO INCLUDE:
- Port numbers where relevant (e.g., "Port 8080" for backend)
- Protocol labels (HTTPS, WebSocket, REST)
- Database icon with "In-Memory Storage (Development)" label
- Security icon with "CORS Enabled" badge
- Version numbers for key technologies

DIMENSIONS:
- Landscape orientation (16:9 or 4:3 ratio)
- High resolution suitable for presentations
- Ensure text is readable at both full size and when scaled down

ADDITIONAL ELEMENTS:
- Small AuraCare logo in top-left corner (stylized "A" with aura/glow effect)
- Version number "v1.0.0" in bottom-right
- Date "February 2026" in bottom-left
- QR code linking to documentation (optional, bottom-right corner)

The overall aesthetic should be: modern, professional, clean, tech-forward, with a calming purple/blue color scheme that reflects the mental health focus of the application.
```

---

## 🎯 Alternative Shorter Prompt (For Quick Generation)

```
Create a modern system architecture diagram for AuraCare mental health app:

3 LAYERS (top to bottom):
1. FRONTEND (Purple): React app with Login, Chat, Emotion Detection, Meditation modules
2. BACKEND (Blue): Flask API with 6 REST endpoints, AI integration, session management
3. EXTERNAL (Teal): Google Gemini AI, Firebase, Speech APIs

STYLE: Clean tech diagram, rounded boxes, gradient colors, arrows showing data flow, icons for each component, modern flat design, professional presentation quality.

INCLUDE: Technology badges, API endpoints, data flow arrows, legend, key features list.
```

---

## 🖼️ Recommended Tools for Generation

### **AI Image Generators:**
1. **DALL-E 3** (via ChatGPT Plus)
   - Best for: Detailed, accurate diagrams
   - Use the main prompt above

2. **Midjourney**
   - Best for: Artistic, visually stunning diagrams
   - Add: `--ar 16:9 --style raw --v 6`

3. **Stable Diffusion**
   - Best for: Customizable, open-source
   - Use with ControlNet for precise layouts

### **Diagramming Tools:**
1. **Lucidchart** - Professional cloud-based
2. **Draw.io (diagrams.net)** - Free, powerful
3. **Figma** - Design-focused
4. **Miro** - Collaborative whiteboard
5. **Canva** - Easy templates

### **Code-Based Tools:**
1. **Mermaid.js** - Markdown-based diagrams
2. **PlantUML** - Text-to-diagram
3. **D3.js** - JavaScript visualization
4. **Graphviz** - DOT language diagrams

---

## 📋 Checklist for Your Diagram

Ensure your final diagram includes:

- [ ] Clear title and subtitle
- [ ] Three distinct architectural layers
- [ ] All major components labeled
- [ ] Technology stack listed
- [ ] API endpoints documented
- [ ] Data flow arrows with labels
- [ ] Color-coded legend
- [ ] Icons for visual clarity
- [ ] Readable at presentation size
- [ ] Professional color scheme
- [ ] Version and date information

---

## 🎨 Color Palette Reference

```
Primary Colors:
- Purple 1: #8B5CF6 (Frontend primary)
- Purple 2: #A78BFA (Frontend light)
- Blue 1: #3B82F6 (Backend primary)
- Blue 2: #60A5FA (Backend light)
- Teal 1: #14B8A6 (External primary)
- Teal 2: #5EEAD4 (External light)

Accent Colors:
- Green: #10B981 (Success states)
- Red: #EF4444 (Error states)
- Yellow: #F59E0B (Warning states)
- Gray: #6B7280 (Text, borders)

Backgrounds:
- White: #FFFFFF
- Light Gray: #F9FAFB
- Dark Gray: #1F2937 (for text)
```

---

## 💡 Tips for Best Results

1. **For AI Image Generators:**
   - Start with the shorter prompt, then refine
   - Request specific aspect ratios (16:9 recommended)
   - Ask for "technical diagram" or "system architecture" style
   - Specify "flat design" to avoid 3D effects

2. **For Manual Creation:**
   - Use the detailed prompt as a blueprint
   - Start with layer containers, then add components
   - Maintain consistent spacing and alignment
   - Use a grid system for clean layout

3. **For Presentations:**
   - Export as SVG for scalability
   - Create both light and dark versions
   - Prepare simplified version for quick reference
   - Add animation layers for step-by-step reveal

---

## 📊 Component Details Reference

### Frontend Components:
1. **Login & Authentication**: User registration/login forms, JWT handling
2. **Welcome Carousel**: Animated onboarding, feature highlights
3. **Chat Interface**: Real-time messaging, typing indicators, history
4. **Emotion Detector**: Webcam integration, face-api.js, emotion analysis
5. **Meditation Module**: Guided exercises, breathing techniques, timers
6. **Wellness Dashboard**: Tips, mood tracking, progress visualization

### Backend Components:
1. **Flask Server**: Main application server, routing, middleware
2. **Session Manager**: User sessions, in-memory storage, state management
3. **AI Integration**: Gemini API client, prompt engineering, response handling
4. **Speech Processor**: Voice transcription, TTS generation, audio processing

### External Services:
1. **Google Gemini AI**: LLM for conversations, emotion-aware responses
2. **Firebase**: Hosting (frontend), Analytics, Performance monitoring
3. **Speech APIs**: Browser-based recognition and synthesis

---

## 🚀 Quick Start Commands

If using code-based tools:

```bash
# Mermaid.js (create .mmd file)
graph TD
    A[User] --> B[Frontend]
    B --> C[Backend]
    C --> D[Gemini AI]

# PlantUML (create .puml file)
@startuml
package "Frontend" {
  [Chat Interface]
  [Emotion Detector]
}
@enduml

# Generate with CLI
mmdc -i diagram.mmd -o diagram.png
plantuml diagram.puml
```

---

## 📝 Example Prompt for Specific Tools

### For ChatGPT/DALL-E:
```
Using the main prompt above, create a system architecture diagram for AuraCare. 
Focus on clarity, professional appearance, and accurate representation of the 
three-layer architecture (Frontend/Backend/External Services).
```

### For Midjourney:
```
professional system architecture diagram, three horizontal layers, purple frontend 
layer with React components, blue backend layer with Flask API, teal external 
services layer, modern flat design, clean tech aesthetic, arrows showing data flow, 
icons for components, white background, gradient accents --ar 16:9 --v 6
```

### For Figma/Design Tools:
Use the detailed prompt as a design specification document and build manually 
following the layout, colors, and component descriptions.

---

**File Purpose:** This prompt document provides everything needed to generate or create 
a professional system architecture diagram for the AuraCare project using AI tools, 
design software, or manual creation methods.

**Last Updated:** February 2026
**Version:** 1.0.0

# AIrnold - AI-Powered Exercise Form Analysis

AIrnold is a sophisticated web application that uses artificial intelligence to analyze exercise form and technique, providing real-time feedback and personalized training recommendations.

## Features

### 1. Real-Time Movement Analysis
- Upload videos (up to 30 seconds) of exercise movements
- Real-time pose detection and keypoint analysis
- Visual feedback with skeleton overlay on the video
- Frame-by-frame movement tracking

### 2. Comprehensive Technique Analysis
- Movement identification and classification
- Detailed feedback on form and technique
- Joint angle measurements and tracking
- Phase detection during exercise execution
- Overall movement score with visual indicators

### 3. Smart Feedback System
- Instant feedback on form corrections
- Detailed recommendations for improvement
- Movement-specific tips and guidelines
- Performance scoring (0-100%)
- Color-coded feedback indicators

### 4. AI-Powered Training Plans
- Personalized training plan generation based on analysis
- Exercise recommendations tailored to improvement areas
- Detailed workout structures including:
  - Sets and repetitions
  - Exercise-specific instructions
  - Form tips and execution notes
  - Progressive improvement strategies

### 5. User Experience
- Intuitive video upload interface
- Real-time analysis visualization
- Responsive design for all devices
- Clean and modern UI
- Easy-to-understand feedback presentation

## Technical Stack

- **Frontend:**
  - Next.js (React)
  - TypeScript
  - Tailwind CSS for styling
  - Real-time pose detection visualization

- **Backend:**
  - Next.js API routes
  - OpenAI GPT-4 for training plan generation
  - TensorFlow.js for pose detection
  - Movement analysis algorithms

- **AI/ML Components:**
  - TensorFlow.js MoveNet for pose estimation
  - Custom movement analysis algorithms
  - GPT-4 for training plan generation
  - Real-time keypoint detection and tracking

## Getting Started

1. **Prerequisites**
   ```bash
   Node.js (v18 or higher)
   npm or yarn
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory with:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/airnold.git

   # Install dependencies
   cd airnold
   npm install
   # or
   yarn install
   ```

4. **Running the Application**
   ```bash
   # Development mode
   npm run dev
   # or
   yarn dev

   # Production build
   npm run build
   npm start
   # or
   yarn build
   yarn start
   ```

## Usage Guide

1. **Video Upload**
   - Click "Upload Video" or drag and drop your exercise video
   - Videos should be clear and show the full body
   - Maximum duration: 30 seconds

2. **Movement Analysis**
   - After upload, the analysis starts automatically
   - Watch the real-time skeleton overlay
   - Wait for the analysis to complete

3. **Review Feedback**
   - Check the detected movement type
   - Review the detailed feedback section
   - Note the overall performance score
   - Read through specific recommendations

4. **Generate Training Plan**
   - Click "Generate Training Plan" after analysis
   - Review the personalized workout plan
   - Check exercise details, sets, and reps
   - Follow the provided form tips

## Contributing

We welcome contributions! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- TensorFlow.js team for the MoveNet model
- OpenAI for GPT-4 API
- All contributors and testers

## Support

For support, please open an issue in the GitHub repository or contact the maintenance team.

---

Built with ❤️ by the AIrnold Team

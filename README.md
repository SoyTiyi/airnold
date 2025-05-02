# AIrnold - CrossFit Technique Analysis Platform

AIrnold is a web application that uses computer vision and AI to analyze weightlifting technique in real-time. It provides immediate feedback on form and generates detailed reports with recommendations for improvement.

## Features

- Real-time pose detection using TensorFlow.js MoveNet
- Phase detection for weightlifting movements
- Angle analysis for key joints
- AI-powered recommendations using OpenAI
- PDF report generation
- Video upload and analysis
- Interactive timeline visualization

## Tech Stack

- Next.js 13+ (React 18+)
- TensorFlow.js
- MoveNet Lightning
- OpenAI API
- Prisma + PostgreSQL
- TailwindCSS
- jsPDF

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/airnold.git
cd airnold
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/airnold"
OPENAI_API_KEY="your-openai-api-key"
```

4. Initialize the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. Upload a video (max 30 seconds) of your weightlifting movement
2. Click "Start Analysis" to begin real-time pose detection
3. View the analysis results and recommendations
4. Download a PDF report with detailed analysis

## Development

### Project Structure

```
ai-lift-analyzer/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── page.jsx           # Main page
├── components/            # React components
├── prisma/               # Database schema
├── public/               # Static assets
├── styles/               # Global styles
└── utils/                # Utility functions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm test` - Run tests
- `npm run cypress:open` - Open Cypress test runner

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

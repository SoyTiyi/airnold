import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RecommendRequest {
  sessionId: string;
}

interface RecommendResponse {
  success: boolean;
  recommendations?: string;
  error?: string;
}

export async function POST(request: Request): Promise<NextResponse<RecommendResponse>> {
  try {
    const { sessionId } = await request.json() as RecommendRequest;

    // Get the session from the database
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Construct the prompt for OpenAI
    const prompt = `Analyze this weightlifting session and provide specific technical recommendations:
    
    Exercise: ${session.exercise}
    Analysis: ${JSON.stringify(session.analysis)}
    
    Please provide:
    1. Overall assessment
    2. Specific technical recommendations for each phase
    3. Common mistakes to watch out for
    4. Suggested drills to improve technique`;

    // Get recommendations from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert weightlifting coach with deep knowledge of Olympic weightlifting and CrossFit techniques."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const recommendations = completion.choices[0].message.content ?? '';

    // Update the session with recommendations
    await prisma.session.update({
      where: { id: sessionId },
      data: { recommendations },
    });

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
} 
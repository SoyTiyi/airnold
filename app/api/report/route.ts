import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jsPDF } from 'jspdf';

const prisma = new PrismaClient();

interface ReportRequest {
  sessionId: string;
}

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json() as ReportRequest;

    // Get session data from database
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Create PDF
    const doc = new jsPDF();
    
    // Add session details
    doc.setFontSize(16);
    doc.text('AIrnold Analysis Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Exercise: ${session.exercise}`, 20, 30);
    doc.text(`Date: ${new Date(session.createdAt).toLocaleDateString()}`, 20, 40);
    
    // Add analysis results
    doc.setFontSize(14);
    doc.text('Analysis Results', 20, 60);
    
    doc.setFontSize(12);
    const analysis = session.analysis as any;
    let y = 70;
    
    if (analysis.phases) {
      analysis.phases.forEach((phase: any) => {
        doc.text(`Phase: ${phase.phase}`, 20, y);
        doc.text(`Duration: ${phase.duration.toFixed(2)}s`, 20, y + 10);
        doc.text(`Average Knee Angle: ${phase.angles.knee.toFixed(1)}°`, 20, y + 20);
        doc.text(`Average Hip Angle: ${phase.angles.hip.toFixed(1)}°`, 20, y + 30);
        y += 50;
      });
    }
    
    // Add recommendations
    if (analysis.recommendations) {
      doc.setFontSize(14);
      doc.text('Recommendations', 20, y + 10);
      
      doc.setFontSize(12);
      analysis.recommendations.forEach((rec: string, index: number) => {
        doc.text(`${index + 1}. ${rec}`, 20, y + 20 + (index * 10));
      });
    }

    // Convert to base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];

    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
} 
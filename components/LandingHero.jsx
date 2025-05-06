'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function LandingHero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800" />
      
      {/* Content container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          {/* Text content */}
          <div className="md:w-1/2 text-white pb-12 md:pb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Mejora tu técnica de CrossFit con IA
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-indigo-100">
              AIrnold analiza tus movimientos y te ofrece feedback personalizado para perfeccionar tu técnica y prevenir lesiones.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/register"
                className="inline-block bg-white text-indigo-700 hover:bg-indigo-100 font-bold py-3 px-8 rounded-lg text-center transform transition hover:-translate-y-1"
              >
                Crear cuenta
              </Link>
              <button
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-700 font-bold py-3 px-8 rounded-lg text-center transform transition hover:-translate-y-1"
              >
                Saber más
              </button>
            </div>
          </div>
          
          {/* Hero image/video */}
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-lg h-96 rounded-xl overflow-hidden shadow-2xl">
              {/* Placeholder for video/image */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="text-white text-center p-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold">Video de demostración</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats or features highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-white">
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-4xl font-bold mb-2">95%</div>
            <p className="text-lg">De precisión en la detección de posiciones incorrectas</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-4xl font-bold mb-2">+50</div>
            <p className="text-lg">Movimientos de CrossFit y halterofilia analizados</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-4xl font-bold mb-2">+1000</div>
            <p className="text-lg">Atletas confían en AIrnold para mejorar su técnica</p>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <button
          onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
          className="flex flex-col items-center"
        >
          <span className="mb-2">Descubre más</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </section>
  );
} 
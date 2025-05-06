'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingHero() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateAccount = () => {
    setIsLoading(true);
    // Simulamos una redirección con delay para mostrar el loading
    router.push('/register');
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-between items-center pt-32 md:pt-36 pb-24 md:pb-10">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800" />
      
      {/* Content container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-grow">
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
              <button
                onClick={handleCreateAccount}
                disabled={isLoading}
                className={`inline-block bg-white text-indigo-700 hover:bg-indigo-100 font-bold py-3 px-8 rounded-lg text-center transform transition hover:-translate-y-1 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                  </span>
                ) : (
                  'Crear cuenta'
                )}
              </button>
              <button
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-700 font-bold py-3 px-8 rounded-lg text-center transform transition hover:-translate-y-1"
              >
                Saber más
              </button>
            </div>
          </div>
          
          {/* Hero image/video - Visible en todos los dispositivos */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-lg h-72 md:h-96 rounded-xl overflow-hidden shadow-2xl">
              {/* Lottie animation usando iframe */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <iframe 
                  src="https://lottie.host/embed/b4d668f7-80fd-49ec-9f92-58438b9169c0/EvhvPjQjXW.lottie" 
                  className="w-full h-full"
                  style={{ border: 'none', overflow: 'hidden' }}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats or features highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 mb-16 text-white">
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
      
      {/* Scroll indicator - Ahora como parte del flex-col en lugar de posición absoluta */}
      <div className="relative z-10 text-white animate-bounce mt-4">
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
'use client';

import Image from 'next/image';
import analyzeMovementImage from '../public/images/analyze_movement.png'
import movementReportsImage from '../public/images/movement_reports.png'

export default function LandingFeatures() {
  return (
    <div className="bg-white">
      {/* How it works section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cómo funciona AIrnold</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestra tecnología de IA analiza tus movimientos para ofrecerte feedback en tiempo real y mejorar tu técnica de CrossFit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-indigo-600 text-white rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Sube tu video</h3>
              <p className="text-gray-600">
                Graba tu entrenamiento y sube el video a nuestra plataforma para comenzar el análisis.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-indigo-600 text-white rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Análisis inteligente</h3>
              <p className="text-gray-600">
                Nuestra IA analiza tus movimientos, posiciones y ángulos para identificar áreas de mejora.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-indigo-600 text-white rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Recibe feedback</h3>
              <p className="text-gray-600">
                Obtén recomendaciones personalizadas y correcciones para mejorar tu técnica y prevenir lesiones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Características principales</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre lo que hace a AIrnold la herramienta perfecta para mejorar tu técnica de CrossFit.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Feature */}
            <div>
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-600 rounded-full p-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Análisis de postura en tiempo real</h3>
                </div>
                <p className="text-gray-600 ml-12">
                  Detectamos la posición de tus articulaciones en cada frame para identificar desviaciones y errores técnicos.
                </p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-600 rounded-full p-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Detección de riesgo de lesiones</h3>
                </div>
                <p className="text-gray-600 ml-12">
                  Identificamos patrones de movimiento que pueden aumentar el riesgo de lesiones y te sugerimos correcciones.
                </p>
              </div>
              
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-600 rounded-full p-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Personalización avanzada</h3>
                </div>
                <p className="text-gray-600 ml-12">
                  El sistema se adapta a tu nivel, morfología y objetivos específicos para ofrecerte recomendaciones útiles.
                </p>
              </div>
            </div>
            
            {/* Right image */}
            <div className="bg-white p-4 rounded-2xl shadow-xl transform rotate-1">
              <div className="h-80 w-full rounded-xl overflow-hidden">
                <Image
                  src={analyzeMovementImage}
                  alt="Análisis de movimiento"
                  className="h-full w-full object-cover"/>
              </div>
            </div>
          </div>
          
          {/* Second features row */}
          <div className="grid md:grid-cols-2 gap-16 items-center mt-20">
            {/* Left image */}
            <div className="bg-white p-4 rounded-2xl shadow-xl transform -rotate-1 order-2 md:order-1">
            <div className="h-80 w-full rounded-xl overflow-hidden">
                <Image
                  src={movementReportsImage}
                  alt="Análisis de movimiento"
                  className="h-full w-full object-cover"/>
              </div>
            </div>
            
            {/* Right features */}
            <div className="order-1 md:order-2">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-600 rounded-full p-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Biblioteca de movimientos</h3>
                </div>
                <p className="text-gray-600 ml-12">
                  Amplia base de datos con +50 movimientos de CrossFit y halterofilia para analizar cualquier ejercicio.
                </p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-600 rounded-full p-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Informes detallados</h3>
                </div>
                <p className="text-gray-600 ml-12">
                  Recibe informes con métricas detalladas sobre tu técnica, progreso y recomendaciones específicas.
                </p>
              </div>
              
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-600 rounded-full p-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Seguimiento del progreso</h3>
                </div>
                <p className="text-gray-600 ml-12">
                  Visualiza tu evolución a lo largo del tiempo y compara tus mejoras en diferentes sesiones de entrenamiento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">¿Listo para mejorar tu técnica?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Únete a los miles de atletas que ya confían en AIrnold para llevar su rendimiento al siguiente nivel.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/register" 
                className="inline-block bg-indigo-600 text-white hover:bg-indigo-700 font-bold py-3 px-8 rounded-lg text-center"
              >
                Crear cuenta gratis
              </a>
              <a 
                href="mailto:santiago.marmartinez@gmail.com" 
                className="inline-block bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-8 rounded-lg text-center"
              >
                Contactar
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 
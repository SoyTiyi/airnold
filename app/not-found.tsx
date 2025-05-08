'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-indigo-900 to-indigo-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Contenedor del 404 con fondo y bordes redondeados */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Elemento decorativo superior */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"></div>
          
          <div className="mb-8 relative text-center">
            <h1 className="text-8xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 mb-4">
              404
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-blue-500 mx-auto rounded-full mb-8"></div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              Página no encontrada
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 border border-indigo-100 hover:border-indigo-200"
            >
              Volver atrás
            </button>
          </div>

          <div className="text-center text-gray-500">
            <p className="text-sm">¿Necesitas ayuda? Contacta con nuestro equipo de soporte</p>
            <Link 
              href="/#contact" 
              className="text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-flex items-center gap-1 text-sm"
            >
              Contactar soporte
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </Link>
          </div>

          {/* Elemento decorativo inferior */}
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
        </div>
      </div>
    </div>
  );
} 
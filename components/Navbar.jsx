'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isAnalyzePage = pathname === '/analyze';
  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  
  // Verificar si el usuario está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Auth status:', data.authenticated);
          setIsAuthenticated(data.authenticated);
        } else {
          // Si hay error en la respuesta, asumimos que no está autenticado
          console.error('Error response from auth check');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Verificar el estado de autenticación cuando se vuelve a enfocar la página
    window.addEventListener('focus', checkAuth);
    return () => window.removeEventListener('focus', checkAuth);
  }, [pathname]); // Actualizar cuando cambia la ruta
  
  // Manejar el scroll para cambiar el estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función para manejar el scroll hacia una sección específica de la página
  const scrollToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (isHomePage) {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(`/#${sectionId}`);
    }
  };
  
  // Manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      setIsLogoutLoading(true);
      
      // Realizar la solicitud de logout
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
        },
        credentials: 'include'
      });
      
      // Independientemente de la respuesta, forzar la redirección
      setIsAuthenticated(false);
      
      // Limpiar cualquier dato de autenticación del almacenamiento local
      localStorage.removeItem('userSession');
      sessionStorage.removeItem('userSession');
      
      // Forzar una redirección directa a la página de login
      setTimeout(() => {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.replace('/login');
      }, 300);
      
    } catch (error) {
      console.error('Logout error:', error);
      setIsLogoutLoading(false);
      
      // En caso de error, intentar redirigir de todos modos
      window.location.href = '/login';
    }
  };

  // Restablecer el estado de carga del login cuando cambia la ruta
  useEffect(() => {
    setIsLoginLoading(false);
  }, [pathname]);

  // Manejar el clic en Iniciar sesión
  const handleLogin = () => {
    // Cerrar el menú móvil si está abierto
    setIsMobileMenuOpen(false);
    setIsLoginLoading(true);
    // La redirección debe ocurrir inmediatamente para evitar problemas
    router.push('/login');
  };

  // Determinar el estilo del navbar basado en la página actual y el scroll
  const getNavbarStyle = () => {
    // En la página de análisis siempre mostrar con fondo
    if (isAnalyzePage) {
      return 'bg-indigo-800 text-white shadow-md';
    }
    
    // En otras páginas, depende del scroll
    if (isScrolled) {
      return 'bg-white shadow-md text-gray-800';
    }
    
    // Por defecto para páginas no scrolleadas
    return 'bg-transparent text-white';
  };

  if (isLoading) {
    // Mostrar un navbar simple mientras se carga el estado de autenticación
    return (
      <nav className={`${getNavbarStyle()} fixed w-full z-50 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold">AIrnold</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className={`${getNavbarStyle()} fixed w-full z-50 transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">AIrnold</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {isAuthenticated ? (
                // Opciones para usuarios autenticados
                <>
                  <Link 
                    href="/analyze"
                    className="text-white hover:text-indigo-200 transition-colors"
                  >
                    Analizar vídeo
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLogoutLoading}
                    className={`${
                      isAnalyzePage 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : isScrolled 
                          ? 'bg-red-600 text-white' 
                          : 'bg-white text-red-600'
                    } px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors ${isLogoutLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLogoutLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cerrando...
                      </span>
                    ) : (
                      'Cerrar sesión'
                    )}
                  </button>
                </>
              ) : (
                // Opciones para usuarios no autenticados
                <>
                  <button
                    onClick={() => scrollToSection('hero')}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Inicio
                  </button>
                  <button
                    onClick={() => scrollToSection('how-it-works')}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Cómo funciona
                  </button>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Características
                  </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Contacto
                  </button>
                  {!isLoginPage && (
                    <button
                      onClick={handleLogin}
                      disabled={isLoginLoading}
                      className={`${
                        isScrolled ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'
                      } px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors ${isLoginLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isLoginLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Cargando...
                        </span>
                      ) : (
                        'Iniciar sesión'
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md hover:bg-indigo-700 focus:outline-none ${
                isScrolled ? 'text-indigo-600' : 'text-white'
              }`}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-indigo-900 shadow-lg">
          {isAuthenticated ? (
            // Opciones para móvil - usuarios autenticados
            <>
              <Link 
                href="/analyze"
                className="block w-full text-left px-3 py-2 text-white hover:bg-indigo-700 rounded-md"
              >
                Analizar vídeo
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLogoutLoading}
                className="block w-full text-center px-3 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                {isLogoutLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cerrando...
                  </span>
                ) : (
                  'Cerrar sesión'
                )}
              </button>
            </>
          ) : (
            // Opciones para móvil - usuarios no autenticados
            <>
              <button
                onClick={() => scrollToSection('hero')}
                className="block w-full text-left px-3 py-2 text-white hover:bg-indigo-700 rounded-md"
              >
                Inicio
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full text-left px-3 py-2 text-white hover:bg-indigo-700 rounded-md"
              >
                Cómo funciona
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-3 py-2 text-white hover:bg-indigo-700 rounded-md"
              >
                Características
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left px-3 py-2 text-white hover:bg-indigo-700 rounded-md"
              >
                Contacto
              </button>
              {!isLoginPage && (
                <button
                  onClick={handleLogin}
                  disabled={isLoginLoading}
                  className="block w-full text-center px-3 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  {isLoginLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cargando...
                    </span>
                  ) : (
                    'Iniciar sesión'
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 
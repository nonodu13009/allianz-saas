import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes protégées qui nécessitent une authentification
const protectedRoutes = [
  '/team-management',
  '/commissions-management',
  '/commercial-activity',
  '/commercial',
  '/gestion-firebase'
];

// Routes API protégées
const protectedApiRoutes = [
  '/api/update-passwords',
  '/api/users',
  '/api/commissions'
];

// Routes admin uniquement
const adminOnlyRoutes = [
  '/team-management',
  '/commissions-management',
  '/gestion-firebase'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si c'est une route protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));
  const isAdminOnlyRoute = adminOnlyRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute || isProtectedApiRoute) {
    try {
      // Pour les routes API, vérifier l'authentification via headers
      if (isProtectedApiRoute) {
        const authHeader = request.headers.get('authorization');
        const sessionToken = request.headers.get('x-session-token');
        
        if (!authHeader && !sessionToken) {
          return NextResponse.json(
            { error: 'Non autorisé - Token manquant' },
            { status: 401 }
          );
        }
        
        // Vérifier le token Firebase si présent
        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          // Ici on pourrait vérifier le token Firebase avec Firebase Admin SDK
          // Pour l'instant, on accepte le token
        }
      }
      
      // Pour les routes pages, vérifier via cookies/session
      if (isProtectedRoute) {
        // Vérifier si l'utilisateur est connecté via les cookies
        const userCookie = request.cookies.get('user-session');
        
        if (!userCookie) {
          // Rediriger vers la page de login
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(loginUrl);
        }
        
        // Vérifier les permissions admin si nécessaire
        if (isAdminOnlyRoute) {
          try {
            const userData = JSON.parse(userCookie.value);
            if (userData.role !== 'administrateur') {
              return NextResponse.json(
                { error: 'Accès refusé - Privilèges administrateur requis' },
                { status: 403 }
              );
            }
          } catch (error) {
            // Cookie invalide, rediriger vers login
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
          }
        }
      }
      
    } catch (error) {
      console.error('Erreur middleware:', error);
      
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: 'Erreur d\'authentification' },
          { status: 500 }
        );
      } else {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

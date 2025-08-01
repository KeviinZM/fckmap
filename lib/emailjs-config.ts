// Configuration EmailJS pour le formulaire de contact

export const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
  TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
  PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
}

// Vérification de la configuration
export const isEmailJSConfigured = () => {
  return EMAILJS_CONFIG.SERVICE_ID && 
         EMAILJS_CONFIG.TEMPLATE_ID && 
         EMAILJS_CONFIG.PUBLIC_KEY
}
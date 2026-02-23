// klaroConfig.js
const klaroConfig = {
  version: 1,
  basePath: '/',
  elementID: 'klaro',
  storageMethod: 'cookie',
  cookieName: 'dilowa-consent',
  cookieExpiresAfterDays: 365,
  privacyPolicy: '/datenschutz',
  default: false,
  mustConsent: false,
  acceptAll: true,
  hideDeclineAll: false,
  hideLearnMore: false,
  disablePoweredBy: true,
  lang: 'en',
  fallbackLang: 'en', 
  noticeAsModal: true,
  htmlTexts: true,

  translations: {
    en: {
      consentModal: {
        title: 'Privacy Settings',
        description:
          'This site uses consent-requiring cookies and third-party technologies to integrate certain features. When you click "Accept All", these features are enabled. You can revoke your consent at any time.',
      },
      consentNotice: {
        title: 'Privacy Settings',
        description:
          'This site uses consent-requiring cookies and third-party technologies to integrate certain features. When you click "Accept All", these features are enabled.<br><br><a href="/datenschutz" target="_blank" rel="noopener">Privacy Policy</a> | <a href="/impressum" target="_blank" rel="noopener">Imprint</a>',
        learnMore: 'More',
        acceptAll: 'Accept All',
        decline: 'Deny',
      },
      essentialCookies: {
        description:
          'Essential cookies ensure basic website functionality including security and language preferences.',
      },
      app: {
        langSelect: 'Language',
      },
    },
    de: {
      consentModal: {
        title: 'Datenschutz-Einstellungen',
        description:
          'Diese Website verwendet zustimmungspflichtige Cookies und Drittanbieter-Technologien zur Integration bestimmter Features. Wenn Sie auf „Alle akzeptieren" klicken, werden diese Funktionen aktiviert. Sie können Ihre Zustimmung jederzeit widerrufen.',
      },
      consentNotice: {
        title: 'Datenschutz-Einstellungen',
        description:
          'Diese Website verwendet zustimmungspflichtige Cookies und Drittanbieter-Technologien. Wenn Sie auf „Alle akzeptieren" klicken, werden diese Funktionen aktiviert.<br><br><a href="/datenschutz" target="_blank" rel="noopener">Datenschutzerklärung</a> | <a href="/impressum" target="_blank" rel="noopener">Impressum</a>',
        learnMore: 'Mehr',
        acceptAll: 'Alle akzeptieren',
        decline: 'Ablehnen',
      },
      essentialCookies: {
        description:
          'Wesentliche Cookies gewährleisten grundlegende Website-Funktionen wie Sicherheit und Spracheinstellungen.',
      },
      app: {
        langSelect: 'Sprache',
      },
    },
  },

  purposes: {
    functional: {
      title: 'Functional',
    },
  },

  services: [
    {
      name: 'essentialCookies',
      title: 'Essential Cookies',
      purposes: ['functional'],
      required: true,
      default: true,
    },
  ],
};

export default klaroConfig;

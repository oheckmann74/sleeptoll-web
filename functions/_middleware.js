const SUPPORTED_LOCALES = [
  'ar','cs','da','de','es','fi','fr','hi','hu','id','it','ja','ko',
  'ms','nb','nl','pl','pt-br','ro','ru','sv','th','tr','uk','vi','zh-hans','zh-hant'
];
const COOKIE_NAME = 'lang';

const LOCALE_MAP = {
  'pt-br': 'pt-br', 'pt': 'pt-br',
  'zh-cn': 'zh-hans', 'zh-hans': 'zh-hans', 'zh-sg': 'zh-hans', 'zh': 'zh-hans',
  'zh-tw': 'zh-hant', 'zh-hant': 'zh-hant', 'zh-hk': 'zh-hant',
  'nb': 'nb', 'no': 'nb', 'nn': 'nb',
};

function getPreferredLocale(request) {
  const accept = request.headers.get('Accept-Language');
  if (!accept) return null;

  const languages = accept.split(',').map(part => {
    const [lang, q] = part.trim().split(';q=');
    return { lang: lang.trim().toLowerCase(), q: q ? parseFloat(q) : 1.0 };
  }).sort((a, b) => b.q - a.q);

  for (const { lang } of languages) {
    if (LOCALE_MAP[lang]) return LOCALE_MAP[lang];
    const prefix = lang.split('-')[0];
    if (LOCALE_MAP[prefix]) return LOCALE_MAP[prefix];
    if (SUPPORTED_LOCALES.includes(prefix)) return prefix;
  }
  return null;
}

function getCookie(request, name) {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  const isRootPage = path === '/' || path === '/privacy' || path === '/privacy/' ||
                     path === '/terms' || path === '/terms/';
  if (!isRootPage) return context.next();

  const cookieLang = getCookie(request, COOKIE_NAME);
  if (cookieLang) return context.next();

  const locale = getPreferredLocale(request);
  if (!locale) {
    const response = await context.next();
    const newResponse = new Response(response.body, response);
    newResponse.headers.append('Set-Cookie', `${COOKIE_NAME}=en; Path=/; Max-Age=31536000; SameSite=Lax`);
    return newResponse;
  }

  const localizedPath = path === '/' ? `/${locale}/` : `/${locale}${path}`;
  const redirectUrl = new URL(localizedPath, url.origin);
  const response = new Response(null, { status: 302, headers: { Location: redirectUrl.toString() } });
  response.headers.append('Set-Cookie', `${COOKIE_NAME}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`);
  return response;
}

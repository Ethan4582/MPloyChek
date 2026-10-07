export const onRequest: PagesFunction = async (context) => {
  const backendBase = 'https://mploychek-api-ouqv.onrender.com';
  const url = new URL(context.request.url);
  const targetUrl = `${backendBase}${url.pathname}${url.search}`;

  const forwardHeaders = new Headers(context.request.headers);
  forwardHeaders.set('host', new URL(backendBase).host);

  const init: RequestInit = {
    method: context.request.method,
    headers: forwardHeaders,
    body: ['GET', 'HEAD'].includes(context.request.method.toUpperCase())
      ? undefined
      : context.request.body,
    redirect: 'follow',
  };

  return fetch(targetUrl, init);
};

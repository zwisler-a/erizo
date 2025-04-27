import "/firebase-messaging-sw.js";
import "/ngsw-worker.js";

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.pathname === '/share' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event));
  }
});

async function handleShareTarget(event) {
  const formData = await event.request.formData();
  const file = formData.get('files'); // only one file
  const link = formData.get('url');   // only one link

  const allClients = await clients.matchAll({ type: 'window' });

  for (const client of allClients) {
    client.postMessage({
      type: 'share-target',
      file: file ? {
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      } : null,
      link: link || null
    });
  }

  return Response.redirect('/', 303);
}

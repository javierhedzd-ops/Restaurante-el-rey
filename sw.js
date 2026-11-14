// Solo existe para que El Rey se pueda instalar en el teléfono. No guarda nada:
// la página siempre se pide al servidor, así los precios y la carta están al día.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

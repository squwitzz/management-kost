/**
 * Quick script to unregister service worker
 * Add this to your HTML temporarily: <script src="/unregister-sw.js"></script>
 * Or run in browser console
 */

(async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length === 0) {
        console.log('✅ No service workers found');
        return;
      }

      console.log(`🗑️ Unregistering ${registrations.length} service worker(s)...`);
      
      for (const registration of registrations) {
        await registration.unregister();
        console.log(`✅ Unregistered: ${registration.scope}`);
      }

      // Clear all caches
      const cacheNames = await caches.keys();
      console.log(`🗑️ Clearing ${cacheNames.length} cache(s)...`);
      
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log(`✅ Cleared cache: ${cacheName}`);
      }

      console.log('✨ All service workers and caches cleared!');
      console.log('🔄 Reloading page in 2 seconds...');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ Error unregistering service worker:', error);
    }
  } else {
    console.log('ℹ️ Service workers not supported in this browser');
  }
})();

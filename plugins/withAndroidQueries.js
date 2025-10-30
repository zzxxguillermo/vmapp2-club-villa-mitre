const { withAndroidManifest } = require('@expo/config-plugins');

const withAndroidQueries = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest;

    // Agregar queries si no existe
    if (!mainApplication.queries) {
      mainApplication.queries = [];
    }

    // Agregar intent para WhatsApp
    const whatsappIntent = {
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': 'https', 'android:host': 'wa.me' } }],
        },
      ],
    };

    // Agregar package para WhatsApp
    const whatsappPackage = {
      package: [{ $: { 'android:name': 'com.whatsapp' } }],
    };

    mainApplication.queries.push(whatsappIntent);
    mainApplication.queries.push(whatsappPackage);

    return config;
  });
};

module.exports = withAndroidQueries;

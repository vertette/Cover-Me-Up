import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@vueuse/nuxt'],
  experimental: {
    sharedPrerenderData: true,
    payloadExtraction: false,
  },
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1',
      title: 'Cover Me Up',
      charset: 'utf-8',
    },
  },
  css: ['~/assets/css/tailwind.css'],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()],
  },
})

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://zenture-seven.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/api',
        '/dashboard',
        '/profile',
        '/messages',
        '/counselor',
        '/appointments',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

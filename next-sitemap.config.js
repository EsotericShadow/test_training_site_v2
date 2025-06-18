/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://test-training-site-v2-xjey.vercel.app/',
  generateRobotsTxt: true,
  exclude: ['/adm_*', '/api/*', '/security-logs'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', disallow: ['/adm_*/', '/api/', '/security-logs/'] },
      { userAgent: '*', allow: ['/admin/', '/wp-login/', '/login/'] },
    ],
  },
  async additionalPaths() {
    const { coursesOps } = require('./lib/database');
    const courses = await coursesOps.getAll();
    return courses.map((course) => ({
      loc: `/courses/${course.slug}`,
      lastmod: course.updated_at || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.9,
    }));
  },
};
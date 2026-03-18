const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Debug endpoint to test image sharing
router.get('/og-debug', (req, res) => {
  // Generate a sample HTML page with the requested image to test Open Graph
  const imageUrl = req.query.image || '/uploads/blogs/default.jpg';
  const title = req.query.title || 'Ajeyam.in - Test Open Graph';
  const description = req.query.description || 'Testing Open Graph image sharing';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${req.protocol}://${req.get('host')}${req.originalUrl}" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
</head>
<body>
  <h1>Open Graph Debug Page</h1>
  <p>This page is used to test Open Graph and Twitter Card meta tags.</p>
  
  <h2>Image Preview:</h2>
  <img src="${imageUrl}" style="max-width: 100%; max-height: 400px;" />
  
  <h2>Meta Tags:</h2>
  <pre>og:title: ${title}
og:description: ${description}
og:image: ${imageUrl}
og:url: ${req.protocol}://${req.get('host')}${req.originalUrl}
twitter:card: summary_large_image
twitter:image: ${imageUrl}</pre>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Share endpoint — serves OG meta tags for crawlers, redirects browsers to frontend
router.get('/share/:blogId', async (req, res) => {
  const { blogId } = req.params;
  const { title, image, description } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'https://ajeyam.in';
  const blogUrl = `${frontendUrl}/blogs/${blogId}`;

  // Regular browsers get redirected to the frontend blog page
  const userAgent = req.headers['user-agent'] || '';
  const isCrawler = /facebookexternalhit|twitterbot|whatsapp|telegram|linkedinbot|bot|crawler|spider|pinterest|slackbot|discordbot/i.test(userAgent);

  if (!isCrawler) {
    return res.redirect(302, blogUrl);
  }

  // For crawlers: use query params if provided, otherwise fetch from DB
  let safeTitle = title ? String(title).substring(0, 100) : '';
  let safeDesc = description ? String(description).substring(0, 200) : '';
  let imageUrl = image || '';

  if (!safeTitle || !imageUrl) {
    try {
      const mongoose = require('mongoose');
      const Blog = require('../models/Blog');
      const query = mongoose.Types.ObjectId.isValid(blogId)
        ? { _id: blogId }
        : { slug: blogId };
      const blog = await Blog.findOne(query).select('title summary content coverImage').lean();
      if (blog) {
        if (!safeTitle) safeTitle = (blog.title || 'Ajeyam.in Blog').substring(0, 100);
        if (!safeDesc) safeDesc = (blog.summary || (blog.content || '').replace(/<[^>]*>/g, '')).substring(0, 200);
        if (!imageUrl) imageUrl = blog.coverImage || '';
      }
    } catch (err) {
      console.error('Share endpoint DB lookup error:', err);
    }
  }

  if (!safeTitle) safeTitle = 'Ajeyam.in Blog';
  if (!safeDesc) safeDesc = 'Read this fascinating article on Ajeyam.in';

  // Ensure image URL is absolute
  if (imageUrl && !imageUrl.startsWith('http')) {
    const apiHost = `${req.protocol}://${req.get('host')}`;
    imageUrl = `${apiHost}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }
  if (!imageUrl) imageUrl = `${frontendUrl}/og-image.jpg`;

  // Escape quotes for HTML attributes
  safeTitle = safeTitle.replace(/"/g, '&quot;');
  safeDesc = safeDesc.replace(/"/g, '&quot;');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safeTitle} | Ajeyam.in</title>
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${blogUrl}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Ajeyam.in" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@ajeyam_speaks" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta http-equiv="refresh" content="0;url=${blogUrl}" />
</head>
<body><p>Redirecting to article...</p></body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(html);
});

// Server-rendered OG tags for social media crawlers (called by nginx)
router.get('/og/blogs/:identifier', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Blog = require('../models/Blog');
    const { identifier } = req.params;

    const query = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { slug: identifier };

    const blog = await Blog.findOne(query)
      .populate('author', 'name')
      .populate('category', 'name')
      .select('title summary content coverImage author category tags createdAt slug')
      .lean();

    if (!blog) {
      return res.redirect(302, `https://ajeyam.in/blogs/${identifier}`);
    }

    const frontendUrl = 'https://ajeyam.in';
    const blogUrl = `${frontendUrl}/blogs/${blog.slug || blog._id}`;

    // Build absolute image URL
    let imageUrl = `${frontendUrl}/og-image.jpg`;
    if (blog.coverImage) {
      if (blog.coverImage.startsWith('http')) {
        imageUrl = blog.coverImage;
      } else {
        imageUrl = `https://api.ajeyam.in${blog.coverImage.startsWith('/') ? '' : '/'}${blog.coverImage}`;
      }
    }

    // Strip HTML for description
    const description = (blog.summary || (blog.content || '').replace(/<[^>]*>/g, '')).substring(0, 200);
    const safeTitle = (blog.title || 'Ajeyam.in Blog').replace(/"/g, '&quot;');
    const safeDesc = description.replace(/"/g, '&quot;');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safeTitle} | Ajeyam.in</title>
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${blogUrl}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Ajeyam.in" />
  <meta property="article:published_time" content="${blog.createdAt}" />
  ${blog.author?.name ? `<meta property="article:author" content="${blog.author.name}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@ajeyam_speaks" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta http-equiv="refresh" content="0;url=${blogUrl}" />
</head>
<body><p>Redirecting...</p></body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(html);
  } catch (error) {
    console.error('OG route error:', error);
    res.redirect(302, `https://ajeyam.in/blogs/${req.params.identifier}`);
  }
});

module.exports = router; 
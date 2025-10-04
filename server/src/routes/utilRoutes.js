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

// Create an endpoint to serve a redirect with proper OG tags
router.get('/share/:blogId', (req, res) => {
  const { blogId } = req.params;
  const { title, image, description } = req.query;
  
  // If this is a direct browser request (not a social media crawler),
  // just redirect to the blog page
  const userAgent = req.headers['user-agent'] || '';
  const isCrawler = /facebookexternalhit|twitterbot|whatsapp|telegram|linkedin|bot|crawler|spider|pinterest/i.test(userAgent);
  
  if (!isCrawler) {
    // For regular browsers, redirect to the client-side route
    return res.redirect(302, `/blogs/${blogId}`);
  }
  
  // For social media crawlers, serve static HTML with OG tags
  
  // Ensure image URL is absolute and valid
  let imageUrl = '/uploads/blogs/default.jpg'; // Default fallback image
  
  // Only use provided image if it's an absolute URL
  if (image && (image.startsWith('http://') || image.startsWith('https://'))) {
    imageUrl = image;
  } else if (image && image.startsWith('/')) {
    // For server-relative URLs, make them absolute
    imageUrl = `${req.protocol}://${req.get('host')}${image}`;
  } else {
    // Use default absolute URL
    imageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
  }
  
  // Create sanitized title and description
  const safeTitle = title ? String(title).substring(0, 100) : 'Ajeyam.in Blog';
  const safeDescription = description ? String(description).substring(0, 200) : 'Read this fascinating article on Ajeyam.in';
  
  // For social crawlers, the target URL should be the full absolute URL to the blog
  const targetUrl = `${req.protocol}://${req.get('host')}/blogs/${blogId}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${safeTitle}</title>
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${targetUrl}" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${imageUrl}" />
  
  <meta http-equiv="refresh" content="0;url=${targetUrl}" />
</head>
<body>
  <p>Redirecting to article...</p>
</body>
</html>
  `;
  
  // Set cache control headers for better performance
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

module.exports = router; 
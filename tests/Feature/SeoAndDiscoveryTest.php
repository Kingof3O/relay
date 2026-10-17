<?php

namespace Tests\Feature;

use Tests\TestCase;

class SeoAndDiscoveryTest extends TestCase
{
    public function test_login_page_contains_optimized_seo_and_font_assets(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);

        // Core Web Vitals Font Optimizations
        $response->assertSee('rel="preconnect" href="https://fonts.bunny.net"', false);
        $response->assertSee('rel="dns-prefetch" href="https://fonts.bunny.net"', false);
        $response->assertSee('plus-jakarta-sans:400,500,600,700|jetbrains-mono:400,500&display=swap', false);

        // Theme and Fallback Metadata
        $response->assertSee('<meta name="theme-color" content="#07090e">', false);
        $response->assertSee('Relay Studio is a high-performance modern workspace', false);
        $response->assertSee('rel="canonical"', false);

        // OpenGraph Social Tags
        $response->assertSee('property="og:site_name" content="Relay Studio"', false);
        $response->assertSee('property="og:type" content="website"', false);
        $response->assertSee('property="og:title" content="Relay Studio · High-Performance Work Management"', false);
        $response->assertSee('property="og:image"', false);

        // Twitter Cards
        $response->assertSee('name="twitter:card" content="summary_large_image"', false);
        $response->assertSee('name="twitter:title"', false);
        $response->assertSee('name="twitter:image"', false);

        // JSON-LD Structured Data Schema
        $response->assertSee('application/ld+json', false);
        $response->assertSee('"@type": "WebApplication"', false);
        $response->assertSee('"name": "Relay Studio"', false);
    }

    public function test_sitemap_xml_exists_and_contains_public_routes(): void
    {
        $sitemapPath = public_path('sitemap.xml');
        $this->assertFileExists($sitemapPath);

        $content = file_get_contents($sitemapPath);
        $this->assertStringContainsString('<urlset', $content);
        $this->assertStringContainsString('/login</loc>', $content);
        $this->assertStringContainsString('<changefreq>weekly</changefreq>', $content);
        $this->assertStringContainsString('<priority>1.0</priority>', $content);
    }

    public function test_robots_txt_exists_and_protects_internal_routes(): void
    {
        $robotsPath = public_path('robots.txt');
        $this->assertFileExists($robotsPath);

        $content = file_get_contents($robotsPath);
        $this->assertStringContainsString('Allow: /', $content);
        $this->assertStringContainsString('Allow: /login', $content);
        $this->assertStringContainsString('Disallow: /dashboard', $content);
        $this->assertStringContainsString('Disallow: /requests', $content);
        $this->assertStringContainsString('Disallow: /settings', $content);
        $this->assertStringContainsString('Disallow: /profile', $content);
        $this->assertStringContainsString('Disallow: /notifications', $content);
        $this->assertStringContainsString('Sitemap:', $content);
        $this->assertStringContainsString('sitemap.xml', $content);
    }
}

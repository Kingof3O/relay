<?php

namespace Tests\Feature;

use Tests\TestCase;

class SeoAndDiscoveryTest extends TestCase
{
    public function test_login_page_contains_optimized_seo_and_font_assets(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);

        // Anti-Indexing Meta Tags for Internal Workspace Privacy
        $response->assertSee('<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">', false);
        $response->assertSee('<meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex">', false);

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

    public function test_sitemap_xml_does_not_exist_for_internal_app(): void
    {
        $this->assertFileDoesNotExist(public_path('sitemap.xml'));
    }

    public function test_robots_txt_disallows_all_crawlers_for_internal_app(): void
    {
        $robotsPath = public_path('robots.txt');
        $this->assertFileExists($robotsPath);

        $content = trim(file_get_contents($robotsPath));
        $this->assertStringContainsString('User-agent: *', $content);
        $this->assertStringContainsString('Disallow: /', $content);
        $this->assertStringNotContainsString('Allow:', $content);
        $this->assertStringNotContainsString('Sitemap:', $content);
    }
}

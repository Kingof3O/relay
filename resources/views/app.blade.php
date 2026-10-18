<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <meta name="theme-color" content="#07090e">

        <title inertia>{{ config('app.name', 'Relay') }}</title>

        <!-- SEO & Fallback Meta Tags -->
        <meta name="description" content="Relay Studio is a high-performance modern workspace for engineering teams, real-time work requests, Kanban boards, and delivery velocity tracking.">
        <link rel="canonical" href="{{ url()->current() }}">

        <!-- OpenGraph Meta Tags -->
        <meta property="og:site_name" content="Relay Studio">
        <meta property="og:type" content="website">
        <meta property="og:title" content="Relay Studio · High-Performance Work Management">
        <meta property="og:description" content="Tactile, high-density engineering work tracking, real-time Kanban boards, and delivery analytics.">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:image" content="{{ asset('/img/og-preview.png') }}">

        <!-- Twitter Card Meta Tags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Relay Studio · High-Performance Work Management">
        <meta name="twitter:description" content="Tactile, high-density engineering work tracking, real-time Kanban boards, and delivery analytics.">
        <meta name="twitter:image" content="{{ asset('/img/og-preview.png') }}">

        <!-- JSON-LD Structured Data Schema -->
        <script type="application/ld+json">
        {
            "@@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Relay Studio",
            "url": "{{ url('/') }}",
            "description": "Tactile, high-density engineering work tracking, real-time Kanban boards, and delivery analytics.",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "All",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            }
        }
        </script>

        <!-- Favicon -->
        <link rel="icon" type="image/svg+xml" href="/img/logo.svg">
        <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/img/favicon-16x16.png">
        <link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
        <link rel="shortcut icon" href="/img/favicon.ico">

        <!-- Fonts: Preconnect, DNS-prefetch & Critical Subset -->
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link rel="dns-prefetch" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=plus-jakarta-sans:400,500,600,700|jetbrains-mono:400,500&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-[#07090e] text-zinc-100 selection:bg-violet-500/30 selection:text-white">
        @inertia
    </body>
</html>

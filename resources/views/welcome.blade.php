<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Dealora — Project agreements clients and freelancers can verify</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <meta
            name="description"
            content="Dealora turns freelance project requirements into a structured agreement and keeps a verifiable on-chain record of it on BOT Chain."
        >

        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body class="min-h-screen bg-black font-sans text-zinc-100 antialiased">
        <div id="app"></div>
    </body>
</html>

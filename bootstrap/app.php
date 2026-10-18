<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'active' => \App\Http\Middleware\EnsureUserIsActive::class,
            'permission' => \App\Http\Middleware\EnsureUserHasPermission::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function ($response, Throwable $e, \Illuminate\Http\Request $request) {
            if (! app()->environment(['local', 'testing']) && in_array($response->getStatusCode(), [500, 503, 404, 403])) {
                return inertia('Error', ['status' => $response->getStatusCode()])
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
            } elseif ($response->getStatusCode() === 419) {
                if ($request->wantsJson()) {
                    return response()->json(['message' => 'The page session expired.'], 419);
                }

                return back()->with([
                    'error' => 'The page session expired. Please try again.',
                ]);
            }

            return $response;
        });
    })->create();

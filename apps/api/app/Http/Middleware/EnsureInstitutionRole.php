<?php

namespace App\Http\Middleware;

use App\Support\CurrentInstitutionSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureInstitutionRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if ($roles === []) {
            abort(403);
        }

        $currentRole = CurrentInstitutionSession::requireRole($request);
        if (! in_array($currentRole, $roles, true)) {
            abort(403);
        }

        return $next($request);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\WorkRequest;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function export(Request $request): StreamedResponse
    {
        $format = strtolower((string) $request->query('format', 'csv'));

        $query = WorkRequest::query()
            ->with(['area', 'assignee', 'requester'])
            ->filter($request->all(), $request->user())
            ->orderBy('id', 'desc');

        if ($format === 'json') {
            $headers = [
                'Content-Type' => 'application/json',
                'Content-Disposition' => 'attachment; filename="relay-backlog-export.json"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ];

            return new StreamedResponse(function () use ($query): void {
                $out = fopen('php://output', 'w');
                fwrite($out, "[\n");
                $first = true;

                foreach ($query->cursor() as $req) {
                    if (! $first) {
                        fwrite($out, ",\n");
                    }
                    $first = false;

                    $status = $req->status instanceof \BackedEnum ? $req->status->value : (string) $req->status;
                    $priority = $req->priority instanceof \BackedEnum ? $req->priority->value : (string) $req->priority;
                    $dueDate = $req->due_date
                        ? (is_string($req->due_date) ? $req->due_date : $req->due_date->format('Y-m-d'))
                        : null;

                    $row = [
                        'id' => $req->id,
                        'title' => $req->title,
                        'project' => $req->area?->name ?? 'Unassigned',
                        'status' => $status,
                        'priority' => $priority,
                        'assignee' => $req->assignee?->name ?? 'Unassigned',
                        'requester' => $req->requester?->name ?? 'System',
                        'due_date' => $dueDate,
                        'created_at' => $req->created_at?->toIso8601String(),
                    ];

                    fwrite($out, (string) json_encode($row, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
                }

                fwrite($out, "\n]");
                fclose($out);
            }, 200, $headers);
        }

        // CSV Export (default)
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="relay-backlog-export.csv"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        return new StreamedResponse(function () use ($query): void {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "ID,Title,Project,Status,Priority,Assignee,Requester,Due Date,Created At\n");

            foreach ($query->cursor() as $req) {
                $status = $req->status instanceof \BackedEnum ? $req->status->value : (string) $req->status;
                $priority = $req->priority instanceof \BackedEnum ? $req->priority->value : (string) $req->priority;
                $dueDate = $req->due_date
                    ? (is_string($req->due_date) ? $req->due_date : $req->due_date->format('Y-m-d'))
                    : '';
                $createdAt = $req->created_at?->toIso8601String() ?? '';

                fputcsv($handle, [
                    $req->id,
                    $req->title,
                    $req->area?->name ?? 'Unassigned',
                    $status,
                    $priority,
                    $req->assignee?->name ?? 'Unassigned',
                    $req->requester?->name ?? 'System',
                    $dueDate,
                    $createdAt,
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}

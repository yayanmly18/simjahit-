<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServiceApiController extends Controller
{
    public function index()
    {
        $services = Service::all()->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'price' => (float) $s->price,
                'estimatedDays' => $s->estimated_days,
                'status' => $s->status,
                'description' => $s->description ?? '',
            ];
        });

        return response()->json($services);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'estimatedDays' => 'required|integer|min:1',
            'status' => 'required|in:Aktif,Nonaktif',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $service = Service::create([
            'name' => $request->name,
            'price' => $request->price,
            'estimated_days' => $request->estimatedDays,
            'status' => $request->status ?? 'Aktif',
            'description' => $request->description ?? '',
        ]);

        return response()->json([
            'id' => $service->id,
            'name' => $service->name,
            'price' => (float) $service->price,
            'estimatedDays' => $service->estimated_days,
            'status' => $service->status,
            'description' => $service->description ?? '',
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'estimatedDays' => 'required|integer|min:1',
            'status' => 'required|in:Aktif,Nonaktif',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $service->update([
            'name' => $request->name,
            'price' => $request->price,
            'estimated_days' => $request->estimatedDays,
            'status' => $request->status,
            'description' => $request->description ?? '',
        ]);

        return response()->json([
            'id' => $service->id,
            'name' => $service->name,
            'price' => (float) $service->price,
            'estimatedDays' => $service->estimated_days,
            'status' => $service->status,
            'description' => $service->description ?? '',
        ]);
    }

    public function destroy($id)
    {
        $service = Service::findOrFail($id);
        $service->delete();

        return response()->json(null, 204);
    }
}
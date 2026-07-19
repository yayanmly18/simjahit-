<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExpenseApiController extends Controller
{
    public function index()
    {
        $expenses = Expense::orderBy('date', 'desc')->get()->map(function ($e) {
            return [
                'id' => $e->id,
                'date' => $e->date->format('Y-m-d'),
                'category' => $e->category,
                'description' => $e->description ?? '',
                'amount' => (float) $e->amount,
            ];
        });

        return response()->json($expenses);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $expense = Expense::create([
            'date' => $request->date,
            'category' => $request->category,
            'description' => $request->description ?? '',
            'amount' => $request->amount,
        ]);

        return response()->json([
            'id' => $expense->id,
            'date' => $expense->date->format('Y-m-d'),
            'category' => $expense->category,
            'description' => $expense->description ?? '',
            'amount' => (float) $expense->amount,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $expense->update([
            'date' => $request->date,
            'category' => $request->category,
            'description' => $request->description ?? '',
            'amount' => $request->amount,
        ]);

        return response()->json([
            'id' => $expense->id,
            'date' => $expense->date->format('Y-m-d'),
            'category' => $expense->category,
            'description' => $expense->description ?? '',
            'amount' => (float) $expense->amount,
        ]);
    }

    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();

        return response()->json(null, 204);
    }
}
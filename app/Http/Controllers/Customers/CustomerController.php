<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $customers = $request->user()
            ->customers()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                });
            })
            ->orderByRaw('CASE WHEN follow_up_at IS NULL THEN 1 ELSE 0 END')
            ->orderBy('follow_up_at')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());
        $request->user()->customers()->create($validated);

        return to_route('customers.index')->with('success', 'Customer created successfully.');
    }

    public function update(Request $request, string $customer): RedirectResponse
    {
        $record = $this->ownedCustomer($request, $customer);
        $record->update($request->validate($this->rules()));

        return to_route('customers.index')->with('success', 'Customer updated successfully.');
    }

    public function destroy(Request $request, string $customer): RedirectResponse
    {
        $this->ownedCustomer($request, $customer)->delete();

        return to_route('customers.index')->with('success', 'Customer deleted successfully.');
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
            'email' => ['nullable', 'email', 'max:255'],
            'source' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:10000'],
            'follow_up_at' => ['nullable', 'date'],
            'follow_up_notes' => ['nullable', 'string', 'max:10000'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }

    private function ownedCustomer(Request $request, string $customer): Customer
    {
        return $request->user()->customers()->findOrFail($customer);
    }
}

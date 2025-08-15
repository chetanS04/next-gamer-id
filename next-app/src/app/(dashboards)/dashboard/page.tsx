'use client';

import ProtectedRoute from '@/components/(sheared)/ProtectedRoute';

export default function BuyerDashboardPage() {
  return (
    <ProtectedRoute role="Admin">
      <div className="p-10 text-center font-semibold text-xl">
        Hello, welcome to Admin dashboard!
      </div>
    </ProtectedRoute>
  );
}

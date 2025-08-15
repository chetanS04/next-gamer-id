// app/buyer-dashboard/page.tsx
'use client';

import ProtectedRoute from '@/components/(sheared)/ProtectedRoute';

export default function BuyerDashboardPage() {


  return (
    <ProtectedRoute role="Buyer">
      <div className="p-10 text-center font-semibold text-xl">
        Hello, welcome to Buyer dashboard!
      </div>
    </ProtectedRoute>
  );
}

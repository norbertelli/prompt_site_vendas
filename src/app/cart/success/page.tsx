import { Suspense } from "react";
import { PayPalSuccess } from "@/components/paypal-success";

export default function CartSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Confirmando pagamento...</p>
        </div>
      }
    >
      <PayPalSuccess />
    </Suspense>
  );
}

const API_KEY = process.env.BANK131_API_KEY ?? "";
const BASE_URL = "https://enter.bank/api/v1";

export async function createBank131Payment(params: {
  orderId: string;
  amount: number; // in rubles
  description: string;
  successUrl?: string;
  failUrl?: string;
}): Promise<{ paymentUrl: string; paymentId: string } | null> {
  try {
    const res = await fetch(`${BASE_URL}/payment-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        payment: {
          amount: { value: params.amount.toString(), currency: "RUB" },
          capture: true,
          description: params.description,
        },
        payment_method: { type: "acquiring" },
        success_return_url: params.successUrl ?? `${process.env.NEXTAUTH_URL}/payment/success`,
        error_return_url: params.failUrl ?? `${process.env.NEXTAUTH_URL}/payment/fail`,
        metadata: { order_id: params.orderId },
      }),
    });

    const data = await res.json();
    if (data.status === "ok") {
      return {
        paymentUrl: data.payment_session?.confirmation?.confirmation_url,
        paymentId: data.payment_session?.id,
      };
    }
    return null;
  } catch {
    return null;
  }
}

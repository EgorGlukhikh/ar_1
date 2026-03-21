import crypto from "crypto";

const TERMINAL_KEY = process.env.TBANK_TERMINAL_KEY ?? "";
const SECRET_KEY = process.env.TBANK_SECRET_KEY ?? "";
const BASE_URL = "https://securepay.tinkoff.ru/v2";

function generateToken(params: Record<string, string | number>): string {
  const entries = Object.entries({ ...params, Password: SECRET_KEY })
    .filter(([k]) => k !== "Token" && k !== "Receipt" && k !== "DATA")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => String(v))
    .join("");
  return crypto.createHash("sha256").update(entries).digest("hex");
}

export async function initTBankPayment(params: {
  orderId: string;
  amount: number; // in kopecks
  description: string;
  email?: string;
  successUrl?: string;
  failUrl?: string;
}): Promise<{ paymentUrl: string; paymentId: string } | null> {
  const body = {
    TerminalKey: TERMINAL_KEY,
    Amount: params.amount,
    OrderId: params.orderId,
    Description: params.description,
    SuccessURL: params.successUrl ?? `${process.env.NEXTAUTH_URL}/payment/success`,
    FailURL: params.failUrl ?? `${process.env.NEXTAUTH_URL}/payment/fail`,
    ...(params.email && {
      DATA: JSON.stringify({ Email: params.email }),
    }),
  };

  const token = generateToken(body as Record<string, string | number>);

  try {
    const res = await fetch(`${BASE_URL}/Init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, Token: token }),
    });
    const data = await res.json();
    if (data.Success) {
      return { paymentUrl: data.PaymentURL, paymentId: data.PaymentId };
    }
    return null;
  } catch {
    return null;
  }
}

export function verifyTBankWebhook(params: Record<string, string>): boolean {
  const { Token, ...rest } = params;
  const expected = generateToken(rest as Record<string, string | number>);
  return expected === Token;
}

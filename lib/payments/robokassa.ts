import crypto from "crypto";

const MERCHANT_LOGIN = process.env.ROBOKASSA_MERCHANT_LOGIN ?? "";
const PASSWORD1 = process.env.ROBOKASSA_PASSWORD1 ?? "";
const PASSWORD2 = process.env.ROBOKASSA_PASSWORD2 ?? "";
const TEST_MODE = process.env.ROBOKASSA_TEST_MODE === "true";

const BASE_URL = TEST_MODE
  ? "https://auth.robokassa.ru/Merchant/Index.aspx"
  : "https://auth.robokassa.ru/Merchant/Index.aspx";

export function generateRobokassaUrl(params: {
  invoiceId: string;
  amount: number;
  description: string;
  email?: string;
}): string {
  const { invoiceId, amount, description, email } = params;
  const outSum = amount.toFixed(2);

  const signString = `${MERCHANT_LOGIN}:${outSum}:${invoiceId}:${PASSWORD1}`;
  const signature = crypto.createHash("md5").update(signString).digest("hex");

  const url = new URL(BASE_URL);
  url.searchParams.set("MerchantLogin", MERCHANT_LOGIN);
  url.searchParams.set("OutSum", outSum);
  url.searchParams.set("InvId", invoiceId);
  url.searchParams.set("Description", description);
  url.searchParams.set("SignatureValue", signature);
  url.searchParams.set("IsTest", TEST_MODE ? "1" : "0");
  if (email) url.searchParams.set("Email", email);
  url.searchParams.set("Culture", "ru");

  return url.toString();
}

export function verifyRobokassaCallback(params: {
  outSum: string;
  invId: string;
  signatureValue: string;
}): boolean {
  const { outSum, invId, signatureValue } = params;
  const signString = `${outSum}:${invId}:${PASSWORD2}`;
  const expected = crypto.createHash("md5").update(signString).digest("hex").toLowerCase();
  return expected === signatureValue.toLowerCase();
}

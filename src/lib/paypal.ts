export type PayPalConfig = {
  clientId: string;
  clientSecret: string;
  apiBase: string;
  webUrl: string;
};

export type CartLine = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export function getPayPalConfig(): PayPalConfig {
  return {
    clientId: process.env.PAYPAL_CLIENT_ID || "",
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
    apiBase: process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com",
    webUrl: process.env.PAYPAL_WEB_URL || "https://www.sandbox.paypal.com",
  };
}

export function isPayPalConfigured(config: PayPalConfig = getPayPalConfig()) {
  return Boolean(config.clientId && config.clientSecret);
}

async function getAccessToken(config: PayPalConfig): Promise<string> {
  const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");

  const res = await fetch(`${config.apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal token error: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createPayPalOrder(items: CartLine[]) {
  const config = getPayPalConfig();
  if (!isPayPalConfigured(config)) {
    throw new Error("PayPal não configurado. Defina PAYPAL_CLIENT_ID e PAYPAL_CLIENT_SECRET no .env.");
  }

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const token = await getAccessToken(config);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${config.apiBase}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description: "Compra no site de vendas",
          amount: {
            currency_code: "BRL",
            value: total.toFixed(2),
            breakdown: {
              item_total: { currency_code: "BRL", value: total.toFixed(2) },
            },
          },
          items: items.map((item) => ({
            name: item.name,
            unit_amount: { currency_code: "BRL", value: item.price.toFixed(2) },
            quantity: String(item.quantity),
            category: "PHYSICAL_GOODS",
          })),
        },
      ],
      application_context: {
        brand_name: "Site de Vendas",
        user_action: "PAY_NOW",
        return_url: `${appUrl}/cart/success`,
        cancel_url: `${appUrl}/cart`,
        shipping_preference: "NO_SHIPPING",
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`PayPal create order error: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    id: string;
    status: string;
    links: { rel: string; href: string }[];
  };

  const approveLink = data.links.find((link) => link.rel === "approve");

  return {
    id: data.id,
    status: data.status,
    approveUrl: approveLink?.href || `${config.webUrl}/checkoutnow?token=${data.id}`,
  };
}

export async function capturePayPalOrder(orderId: string) {
  const config = getPayPalConfig();
  const token = await getAccessToken(config);

  const res = await fetch(`${config.apiBase}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = (await res.json()) as {
    id: string;
    status: string;
    purchase_units?: {
      payments?: {
        captures?: { status: string; id: string }[];
      };
    }[];
  };

  if (!res.ok) {
    throw new Error(`PayPal capture error: ${res.status} ${JSON.stringify(data)}`);
  }

  const capture =
    data.purchase_units?.[0]?.payments?.captures?.[0]?.status || data.status;

  return { id: data.id, status: capture };
}

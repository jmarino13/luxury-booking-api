export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const apiKey = process.env.BOULEVARD_API_KEY?.trim();
    const businessId = process.env.BOULEVARD_BUSINESS_ID?.trim();

    if (!apiKey) {
      return res.status(500).json({
        error: "BOULEVARD_API_KEY is missing",
      });
    }

    if (!businessId) {
      return res.status(500).json({
        error: "BOULEVARD_BUSINESS_ID is missing",
      });
    }

    const query = `
      mutation {
        createCart(
          locationId: "c4d9bb0-b959-4898-8444-23d32a1f994e"
          cart: {
            clientMessage: "Luxury Medical Group online booking"
          }
        ) {
          cartToken
        }
      }
    `;

    const response = await fetch(
      "https://www.joinblvd.com/b/.api/graph",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "x-blvd-bid": businessId,
        },
        body: JSON.stringify({ query }),
      }
    );

    const text = await response.text();

    let boulevardResponse;

    try {
      boulevardResponse = JSON.parse(text);
    } catch {
      boulevardResponse = text;
    }

    return res.status(response.ok ? 200 : response.status).json({
      status: response.status,
      boulevardResponse,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      cause: error.cause?.message || null,
      code: error.cause?.code || null,
    });
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const apiKey = process.env.BOULEVARD_API_KEY?.trim();

    // Business ID is not secret, so we can safely hardcode it for now.
    const businessId = "3a83c246-a294-4eee-9a1a-a960ade6528a";

    if (!apiKey) {
      return res.status(500).json({
        error: "BOULEVARD_API_KEY is missing",
      });
    }

    const endpoint = "https://www.joinblvd.com/b/.api/graph";

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "x-blvd-bid": businessId,
    };

    // STEP 1: Create the production cart.
    const createCartQuery = `
      mutation {
        createCart(
          locationId: "c4d09bb0-b959-4898-8444-23d32a1f994e"
          cart: {
            clientMessage: "Luxury Medical Group online booking"
          }
        ) {
          cartToken
        }
      }
    `;

    const createCartResponse = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: createCartQuery,
      }),
    });

    const createCartData = await createCartResponse.json();

    const cartToken =
      createCartData?.data?.createCart?.cartToken;

    if (!cartToken) {
      return res.status(500).json({
        error: "Boulevard did not return a cart token",
        boulevardResponse: createCartData,
      });
    }

    // STEP 2: Use the token to retrieve available services.
const cartQuery = `
  query GetCart($idOrToken: ID!) {
    cart(idOrToken: $idOrToken) {
      id

      availableCategories {
        name

        availableItems {
          id
          name
        }
      }
    }
  }
`;

    const cartResponse = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: cartQuery,
        variables: {
          id: cartToken,
        },
      }),
    });

    const cartData = await cartResponse.json();

    return res.status(200).json({
      cartToken,
      cart: cartData?.data?.cart || null,
      boulevardErrors: cartData?.errors || null,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      cause: error.cause?.message || null,
      code: error.cause?.code || null,
    });
  }
}

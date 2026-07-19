export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "This endpoint only accepts POST requests."
    });
  }

  try {
    const apiKey = process.env.BOULEVARD_API_KEY?.trim();
    const businessId = "3a83c246-a294-4eee-9a1a-a960ade6528a";

    if (!apiKey) {
      return res.status(500).json({
        error: "BOULEVARD_API_KEY is missing."
      });
    }

    const {
      cartId,
      cartToken,
      bookableTimeId,
      firstName,
      lastName,
      email,
      phoneNumber,
      referralSource,
      utmSource,
      utmMedium,
      utmCampaign
    } = req.body || {};

    if (
      !cartId ||
      !cartToken ||
      !bookableTimeId ||
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber
    ) {
      return res.status(400).json({
        error: "Missing required booking information.",
        required: [
          "cartId",
          "cartToken",
          "bookableTimeId",
          "firstName",
          "lastName",
          "email",
          "phoneNumber"
        ]
      });
    }

    /*
     * Build the referral note that will be stored in Boulevard.
     * These fields are optional, so regular website bookings will
     * continue working even when no referral information is present.
     */
    const referralDetails = [];

    if (referralSource) {
      const formattedReferralSource =
        referralSource === "jesse-metcalfe"
          ? "Jesse Metcalfe"
          : referralSource;

      referralDetails.push(
        `Referral Source: ${formattedReferralSource}`
      );
    }

    if (utmSource) {
      referralDetails.push(`UTM Source: ${utmSource}`);
    }

    if (utmMedium) {
      referralDetails.push(`UTM Medium: ${utmMedium}`);
    }

    if (utmCampaign) {
      referralDetails.push(`UTM Campaign: ${utmCampaign}`);
    }

    const clientMessage =
      referralDetails.length > 0
        ? referralDetails.join("\n")
        : undefined;

    const endpoint = "https://www.joinblvd.com/b/.api/graph";

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "x-blvd-bid": businessId
    };

    // STEP 1: Add patient information and referral details to the cart.
    const updateCartQuery = `
      mutation UpdateCart($cart: UpdateCartInput!) {
        updateCart(cart: $cart) {
          __typename
        }
      }
    `;

    const cartUpdate = {
      id: cartId,
      clientInformation: {
        firstName,
        lastName,
        email,
        phoneNumber
      }
    };

    if (clientMessage) {
      cartUpdate.clientMessage = clientMessage;
    }

    const updateResponse = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: updateCartQuery,
        variables: {
          cart: cartUpdate
        }
      })
    });

    const updateData = await updateResponse.json();

    if (updateData?.errors?.length) {
      return res.status(400).json({
        step: "updateCart",
        errors: updateData.errors
      });
    }

    // STEP 2: Reserve the selected appointment time.
    const reserveQuery = `
      mutation ReserveTime(
        $idOrToken: ID!
        $bookableTimeId: ID!
      ) {
        reserveCartBookableItems(
          idOrToken: $idOrToken
          bookableTimeId: $bookableTimeId
        ) {
          __typename
        }
      }
    `;

    const reserveResponse = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: reserveQuery,
        variables: {
          idOrToken: cartToken,
          bookableTimeId
        }
      })
    });

    const reserveData = await reserveResponse.json();

    if (reserveData?.errors?.length) {
      return res.status(400).json({
        step: "reserveCartBookableItems",
        errors: reserveData.errors
      });
    }

    // STEP 3: Checkout and create the live Boulevard appointment.
    const checkoutQuery = `
      mutation CheckoutCart($idOrToken: ID!) {
        checkoutCart(idOrToken: $idOrToken) {
          __typename
        }
      }
    `;

    const checkoutResponse = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: checkoutQuery,
        variables: {
          idOrToken: cartToken
        }
      })
    });

    const checkoutData = await checkoutResponse.json();

    if (checkoutData?.errors?.length) {
      return res.status(400).json({
        step: "checkoutCart",
        errors: checkoutData.errors
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your appointment has been booked successfully.",
      referralRecorded: Boolean(clientMessage),
      updateCart: updateData,
      reservation: reserveData,
      checkout: checkoutData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      cause: error.cause?.message || null
    });
  }
}

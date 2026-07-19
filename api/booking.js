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

 // STEP 2: Retrieve the cart and available services.
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
      idOrToken: cartToken
    }
  })
});

const cartData = await cartResponse.json();
const serviceId =
  cartData?.data?.cart?.availableCategories?.[0]?.availableItems?.[0]?.id;

if (!serviceId) {
  return res.status(500).json({
    error: "No Boulevard service was found",
    cartData
  });
}

// STEP 3: Add the selected service to the cart.
const addServiceQuery = `
  mutation AddService($input: CartAddSelectedBookableItemInput!) {
    cartAddSelectedBookableItem(input: $input) {
      cart {
        id
      }
    }
  }
`;

const addServiceResponse = await fetch(endpoint, {
  method: "POST",
  headers,
  body: JSON.stringify({
    query: addServiceQuery,
    variables: {
      input: {
        idOrToken: cartToken,
        itemId: serviceId
      }
    }
  })
});

const addServiceData = await addServiceResponse.json();

// STEP 4: Retrieve available appointment dates.
const today = new Date();
const thirtyDaysLater = new Date();

thirtyDaysLater.setDate(today.getDate() + 30);

const startDate = today.toISOString().split("T")[0];
const endDate = thirtyDaysLater.toISOString().split("T")[0];

const datesQuery = `
  query GetAvailableDates(
    $idOrToken: ID!
    $searchRangeLower: Date
    $searchRangeUpper: Date
    $limit: Int
    $tz: Tz
  ) {
    cartBookableDates(
      idOrToken: $idOrToken
      searchRangeLower: $searchRangeLower
      searchRangeUpper: $searchRangeUpper
      limit: $limit
      tz: $tz
    ) {
      date
    }
  }
`;

const datesResponse = await fetch(endpoint, {
  method: "POST",
  headers,
  body: JSON.stringify({
    query: datesQuery,
    variables: {
      idOrToken: cartToken,
      searchRangeLower: startDate,
      searchRangeUpper: endDate,
      limit: 31,
      tz: "America/Denver"
    }
  })
});

const datesData = await datesResponse.json();

const availableDates =
  datesData?.data?.cartBookableDates || [];

const requestedDate =
  typeof req.query.date === "string"
    ? req.query.date
    : null;

const requestedDate =
  typeof req.query.date === "string"
    ? req.query.date
    : null;

const selectedDate =
  requestedDate || availableDates?.[0]?.date;

if (!selectedDate) {
  return res.status(200).json({
    cartToken,
    serviceId,
    serviceAdded:
      !!addServiceData?.data?.cartAddSelectedBookableItem,
    availableDates: [],
    availableTimes: [],
    message: "No appointment dates are currently available."
  });
}

// STEP 5: Retrieve available times for the first available date.
const timesQuery = `
  query GetAvailableTimes(
    $idOrToken: ID!
    $searchDate: Date!
    $tz: Tz
  ) {
    cartBookableTimes(
      idOrToken: $idOrToken
      searchDate: $searchDate
      tz: $tz
    ) {
      id
      startTime
    }
  }
`;

const timesResponse = await fetch(endpoint, {
  method: "POST",
  headers,
  body: JSON.stringify({
    query: timesQuery,
    variables: {
      idOrToken: cartToken,
      searchDate: selectedDate,
      tz: "America/Denver"
    }
  })
});

const timesData = await timesResponse.json();

return res.status(200).json({
  cartToken,
  cartId: cartData?.data?.cart?.id,
  serviceId,
  serviceAdded:
    !!addServiceData?.data?.cartAddSelectedBookableItem,
  selectedDate,
  availableDates,
  availableTimes:
    timesData?.data?.cartBookableTimes || [],
  boulevardErrors:
    timesData?.errors || null
});
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      cause: error.cause?.message || null,
      code: error.cause?.code || null,
    });
  }
}

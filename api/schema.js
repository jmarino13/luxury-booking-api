export default async function handler(req, res) {
  try {
    const apiKey = process.env.BOULEVARD_API_KEY?.trim();
    const businessId = "3a83c246-a294-4eee-9a1a-a960ade6528a";

    if (!apiKey) {
      return res.status(200).json({
        error: "BOULEVARD_API_KEY is missing"
      });
    }

const query = `
  query {
    updateCartInput: __type(name: "UpdateCartInput") {
      name
      inputFields {
        name
        type {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
            }
          }
        }
      }
    }
  }
`;

    const response = await fetch(
      "https://www.joinblvd.com/b/.api/graph",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "x-blvd-bid": businessId
        },
        body: JSON.stringify({ query })
      }
    );

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(200).json({
        status: response.status,
        rawResponse: text
      });
    }

return res.status(200).json({
  status: response.status,
  updateCartInput: data?.data?.updateCartInput || null,
  boulevardErrors: data?.errors || null
});
  } catch (error) {
    return res.status(200).json({
      error: error.message,
      stack: error.stack
    });
  }
}

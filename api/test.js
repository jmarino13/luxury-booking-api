export default async function handler(req, res) {
  try {
    const apiKey = process.env.BOULEVARD_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing BOULEVARD_API_KEY",
      });
    }

    const businessId = "3a83c246-a294-4eee-9a1a-a960ade6528a";

    const credentials = Buffer.from(`${apiKey}:`).toString("base64");

    const query = `
      query {
        business {
          name
          locations(first: 20) {
            edges {
              node {
                id
                name
                tz
              }
            }
          }
        }
      }
    `;

    const response = await fetch(
      `https://dashboard.boulevard.io/api/2020-01/${businessId}/client`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({ query }),
      }
    );

    const text = await response.text();

    return res.status(response.status).json({
      status: response.status,
      response: text,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

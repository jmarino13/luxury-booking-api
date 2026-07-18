export default async function handler(req, res) {
  try {
    const apiKey = process.env.BOULEVARD_API_KEY?.trim();
    const businessId = "3a83c246-a294-4eee-9a1a-a960ade6528a";

    const query = `
      query {
        __type(name: "RootMutationType") {
          fields {
            name
            args {
              name
              type {
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
          Authorization: \`Bearer \${apiKey}\`,
          "x-blvd-bid": businessId,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await response.json();

    const mutations =
      data?.data?.__type?.fields?.filter((field) =>
        [
          "reserveCartBookableItems",
          "checkoutCart",
          "updateCart",
        ].includes(field.name)
      ) || [];

    return res.status(200).json({ mutations });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}

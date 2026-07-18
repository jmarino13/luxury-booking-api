export default async function handler(req, res) {

  try {

    const credentials = Buffer
      .from(process.env.BOULEVARD_API_KEY + ":")
      .toString("base64");


    const query = `
    query {
      __schema {
        queryType {
          fields {
            name
          }
        }
      }
    }
    `;


    const response = await fetch(
    "https://api.joinblvd.com/api/2020-01/graphql"
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${credentials}`
        },
        body: JSON.stringify({
          query
        })
      }
    );


    const text = await response.text();


    res.status(200).json({
      status: response.status,
      boulevardResponse: text
    });


  } catch(error) {

    res.status(500).json({
      error: error.message,
      stack: error.stack
    });

  }

}

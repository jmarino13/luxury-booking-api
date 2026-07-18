export default async function handler(req, res) {

  try {

    const response = await fetch(
      "https://www.joinblvd.com"
    );

    const text = await response.text();

    return res.status(200).json({
      status: response.status,
      response: text.substring(0,200)
    });

  } catch(error) {

    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });

  }

}

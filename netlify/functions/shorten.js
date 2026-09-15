exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }
  try {
    const body = JSON.parse(event.body || "{}");
    const url = body.url;
    if (!url || !/^https?:\/\//i.test(url)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "A valid URL is required." })
      };
    }
    const apiKey = process.env.TINYURL_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "TinyURL API key is not configured." })
      };
    }
    const response = await fetch("https://api.tinyurl.com/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: url
      })
    });
    const data = await response.json();
    if (!response.ok || !data.data || !data.data.tiny_url) {
      return {
        statusCode: response.status || 500,
        body: JSON.stringify({
          error: data.errors?.[0] || "TinyURL could not shorten this link."
        })
      };
    }
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        shortUrl: data.data.tiny_url
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error. Please try again."
      })
    };
  }
};
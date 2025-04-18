exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    return {
      statusCode: 200,
      body: JSON.stringify({ id: 123, message: "Video project created (stub)." }),
    };
  }

  return {
    statusCode: 405,
    body: "Method Not Allowed",
  };
};

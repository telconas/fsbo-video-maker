// netlify/functions/videos-cancel.js
export async function handler(event) {
  return {
    statusCode: 200,
    body: JSON.stringify({ cancelled: true })
  };
}

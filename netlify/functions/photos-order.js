// netlify/functions/photos-order.js
export async function handler(event) {
  const photoId = event.path.split("/")[3];
  const { order } = JSON.parse(event.body);

  console.log(`Photo ${photoId} reordered to index ${order}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
}

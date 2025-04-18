// netlify/functions/photos-cover.js
export async function handler(event) {
  const photoId = event.path.split("/")[3];
  const { isCover } = JSON.parse(event.body);

  console.log(`Photo ${photoId} cover set: ${isCover}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
}

// netlify/functions/videos-generate.js
export async function handler(event) {
  const data = JSON.parse(event.body);
  const fakeUrl = `/uploads/fake-video-${Date.now()}.mp4`;

  return {
    statusCode: 200,
    body: JSON.stringify({ videoUrl: fakeUrl, status: "complete" })
  };
}

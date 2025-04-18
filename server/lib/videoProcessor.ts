import fs from "fs";
import path from "path";
import { PropertyVideo, PropertyPhoto } from "@shared/schema";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

// Music tracks directory
const musicDir = path.join(process.cwd(), "public", "music");
// Output directory for videos
const outputDir = path.join(process.cwd(), "public", "videos");
// Temporary directory for processing
const tempDir = path.join(process.cwd(), "temp");

// Ensure directories exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Helper function to get street address from separate fields or legacy address
function getStreetAddress(video: PropertyVideo): string {
  // First check if we have the specific field
  if (video.streetAddress) {
    return video.streetAddress;
  }

  // Fall back to parsing the full address
  if (video.address && video.address.includes(",")) {
    return video.address.split(",")[0].trim();
  }

  // Last resort, return the full address or a default
  return video.address || "Beautiful Property";
}

// Helper function to format city, state, zip into a single line
function getCityStateZip(video: PropertyVideo): string {
  // First check if we have the specific fields
  if (video.city || video.state || video.zipCode) {
    const parts = [];
    if (video.city) parts.push(video.city);
    if (video.state) parts.push(video.state);
    if (video.zipCode) parts.push(video.zipCode);
    return parts.join(", ");
  }

  // Fall back to parsing the full address
  if (video.address && video.address.includes(",")) {
    return video.address.split(",").slice(1).join(",").trim();
  }

  // If no clear separation, return empty string
  return "";
}

// Helper to format price
function formatPrice(price: string | null | undefined): string {
  if (!price) return "";
  // Remove non-numeric characters except decimal points, then parse as a number
  const numericPrice = Number(price.toString().replace(/[^0-9.]/g, "") || 0);
  // Format with commas for thousands - manually format to ensure 7+ figure numbers are handled properly
  if (numericPrice >= 1000000) {
    const millions = Math.floor(numericPrice / 1000000);
    const thousands = Math.floor((numericPrice % 1000000) / 1000);
    if (thousands > 0) {
      return `${millions},${thousands.toString().padStart(3, "0")}${numericPrice % 1000 > 0 ? "," + (numericPrice % 1000).toString().padStart(3, "0") : ""}`;
    } else {
      return `${millions}${numericPrice % 1000 > 0 ? "," + (numericPrice % 1000).toString().padStart(3, "0") : ",000"}`;
    }
  } else {
    return numericPrice.toLocaleString("en-US", {
      style: "decimal",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }
}

// Helper function to escape text for ffmpeg
function escapeFFmpegText(text: string): string {
  return text
    .replace(/\\/g, "\\\\") // escape backslashes
    .replace(/:/g, "\\:") // escape colons
    .replace(/'/g, "\\'") // escape single quotes
    .replace(/\$/g, "\\$") // escape dollar signs
    .replace(/,/g, "\\,"); // escape commas just in case
}

// Main function to process the video - using ffmpeg to create a real MP4 file
export async function processVideo(
  video: PropertyVideo,
  photos: PropertyPhoto[],
  uploadDir: string,
): Promise<string> {
  // Using ffmpeg to create a real MP4 video
  const { musicTrack, slideDuration = 4 } = video;

  // Using .mp4 extension for a proper video file
  const outputFilename = `property-video-${video.id}-${Date.now()}.mp4`;
  const outputPath = path.join(outputDir, outputFilename);

  // Ensure we have enough photos
  if (photos.length === 0) {
    throw new Error("No photos available for video creation");
  }

  // Sort photos by order
  photos.sort((a, b) => a.order - b.order);

  try {
    console.log("Starting video creation with ffmpeg...");

    // Create title slide image using ffmpeg
    const titleImagePath = path.join(tempDir, `title-${video.id}.png`);
    const titleText = getStreetAddress(video);
    const locationText = getCityStateZip(video);
    const priceText = video.price ? `$${formatPrice(video.price)}` : "";

    // Escape inputs for ffmpeg
    const safeTitle = escapeFFmpegText(titleText);
    const safeLocation = escapeFFmpegText(locationText);
    const safePrice = escapeFFmpegText(priceText);

    // Set the output image path
    console.log(`Creating title slide with price: ${priceText}`);

    // Create title slide using ffmpeg - standard YouTube resolution 1920x1080
    const titleSlideCmd =
      `ffmpeg -y -f lavfi -i color=c=black:s=1920x1080 -vf ` +
      `"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text=\"${safeTitle}\":fontcolor=white:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2-90, ` +
      `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text=\"${safeLocation}\":fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2, ` +
      `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf:text=\"${safePrice}\":fontcolor=white:fontsize=36:x=(w-text_w)/2:y=(h-text_h)/2+100" ` +
      `-frames:v 1 "${titleImagePath}"`;

    console.log("Creating title slide with FFmpeg:");
    console.log(titleSlideCmd);

    // Run the command
    await execPromise(titleSlideCmd);

    // Create contact slide image
    const contactImagePath = path.join(tempDir, `contact-${video.id}.png`);
    const contactName = video.contactName || "";
    const contactPhone = video.contactPhone || "";
    const contactEmail = video.contactEmail || "";

    // Escape inputs for ffmpeg
    const safeContactName = escapeFFmpegText(contactName);
    const safeContactPhone = escapeFFmpegText(contactPhone);
    const safeContactEmail = escapeFFmpegText(contactEmail);

    // Create contact slide with properly escaped text
    const contactSlideCmd =
      `ffmpeg -y -f lavfi -i color=c=black:s=1920x1080 -vf ` +
      `"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text=\"Contact Information\":fontcolor=white:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2-150, ` +
      `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text=\"${safeContactName}\":fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2-30, ` +
      `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text=\"${safeContactPhone}\":fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2+60, ` +
      `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text=\"${safeContactEmail}\":fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2+150" ` +
      `-frames:v 1 "${contactImagePath}"`;

    console.log("Creating contact slide with FFmpeg:");
    console.log(contactSlideCmd);

    // Run the command
    await execPromise(contactSlideCmd);

    // Create a file list for ffmpeg (for concatenation)
    const fileListPath = path.join(tempDir, `filelist-${video.id}.txt`);
    let fileContent = "";

    // Create title.mp4 from titleImagePath with YouTube 1920x1080 resolution
    // Using filter_complex for better compatibility and gentle zoom in effect
    const titleMp4Path = path.join(tempDir, `title-${video.id}.mp4`);
    const durationFrames = slideDuration * 24;

    // Ultra simple, reliable static image (no effects) for maximum compatibility
    const titleFilter = `[0:v]scale=1920:1080,fade=in:0:24,format=yuv420p`;

    // Add detailed logging for better debugging
    const titleFfmpegCmd = `ffmpeg -y -loop 1 -i "${titleImagePath}" -filter_complex "${titleFilter}" -t ${slideDuration} -c:v libx264 -preset fast -r 24 "${titleMp4Path}"`;

    try {
      console.log(`Running FFmpeg for title slide`);
      console.log(titleFfmpegCmd);
      const { stdout, stderr } = await execPromise(titleFfmpegCmd);
      if (stderr) console.log("Title FFmpeg output:", stderr);
    } catch (err: any) {
      console.error(`🔥 FFmpeg failed for title slide`);
      console.error(`Command: ${titleFfmpegCmd}`);
      if (err.stderr) console.error("stderr:", err.stderr);
      throw new Error(
        `FFmpeg failed for title slide: ${err.message || "Unknown error"}`,
      );
    }
    // Add to filelist
    fileContent += `file '${titleMp4Path}'\n`;

    // Process all property photos and convert them to short MP4 clips
    console.log(`Processing ${photos.length} photos for the video segments...`);
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const photoPath = path.join(uploadDir, photo.storedName);

      if (fs.existsSync(photoPath)) {
        // Create a short MP4 video segment for each photo instead of just converting to jpg
        const videoOutputPath = path.join(
          tempDir,
          `video-${photo.id}-${i}.mp4`,
        );

        try {
          // Convert image to video segment with duration, Ken Burns effect, and fade transitions
          console.log(
            `Creating video segment ${i + 1}/${photos.length} from: ${photo.originalName}`,
          );

          // Implement Ken Burns effect properly with filter_complex instead of vf
          // This is the key fix based on the suggestion - use filter_complex for zoompan
          const durationFrames = slideDuration * 24;

          // Ultra simple, no Ken Burns effects for maximum compatibility
          // Just fade in only with static image (no fade out)
          const photoFilter = `[0:v]scale=1920:1080,fade=in:0:24,format=yuv420p`;

          // Use filter_complex with detailed logging for better debugging
          const photoFfmpegCmd = `ffmpeg -y -loop 1 -i "${photoPath}" -filter_complex "${photoFilter}" -t ${slideDuration} -c:v libx264 -preset fast -r 24 "${videoOutputPath}"`;

          try {
            console.log(
              `Running FFmpeg for photo ${i + 1}/${photos.length}: ${photo.originalName}`,
            );
            console.log(`Command: ${photoFfmpegCmd}`);
            const { stdout, stderr } = await execPromise(photoFfmpegCmd);
            if (stderr) console.log(`Photo ${i + 1} FFmpeg output:`, stderr);
          } catch (err: any) {
            console.error(`🔥 FFmpeg failed for photo ${photo.originalName}`);
            console.error(`Command: ${photoFfmpegCmd}`);
            if (err.stderr) console.error("stderr:", err.stderr);
            throw new Error(
              `FFmpeg failed for photo ${photo.originalName}: ${err.message || "Unknown error"}`,
            );
          }

          // Verify the video was created
          if (fs.existsSync(videoOutputPath)) {
            console.log(
              `Successfully created video segment: ${videoOutputPath}`,
            );
            fileContent += `file '${videoOutputPath}'\n`;
          } else {
            console.error(`Failed to create video segment from ${photoPath}`);
          }
        } catch (err) {
          console.error(`Error creating video segment from ${photoPath}:`, err);
        }
      } else {
        console.error(`Photo file not found: ${photoPath}`);
      }
    }

    // Create contact.mp4 from contactImagePath with YouTube 1920x1080 resolution
    // Using filter_complex for consistency with other slides
    const contactMp4Path = path.join(tempDir, `contact-${video.id}.mp4`);

    // Contact slide should be longer - 8 seconds instead of standard slide duration
    const contactSlideDuration = 8;
    const contactDurationFrames = contactSlideDuration * 24;

    // Ultra simple, no Ken Burns effects for maximum compatibility on contact slide - no fade out
    const contactFilter = `[0:v]scale=1920:1080,fade=in:0:24,format=yuv420p`;

    // Use better error handling for contact slide
    const contactFfmpegCmd = `ffmpeg -y -loop 1 -i "${contactImagePath}" -filter_complex "${contactFilter}" -t ${contactSlideDuration} -c:v libx264 -preset fast -r 24 "${contactMp4Path}"`;

    try {
      console.log(`Running FFmpeg for contact slide`);
      console.log(contactFfmpegCmd);
      const { stdout, stderr } = await execPromise(contactFfmpegCmd);
      if (stderr) console.log("Contact FFmpeg output:", stderr);
    } catch (err: any) {
      console.error(`🔥 FFmpeg failed for contact slide`);
      console.error(`Command: ${contactFfmpegCmd}`);
      if (err.stderr) console.error("stderr:", err.stderr);
      throw new Error(
        `FFmpeg failed for contact slide: ${err.message || "Unknown error"}`,
      );
    }
    // Add to filelist
    fileContent += `file '${contactMp4Path}'\n`;

    // Make sure we have at least one photo video segment
    if (!fileContent.includes("video-")) {
      console.error("No photos were successfully processed for the slideshow");
    }

    // filelist is now complete with pre-rendered video segments

    // Write file list to disk
    fs.writeFileSync(fileListPath, fileContent);

    console.log("Created file list for ffmpeg:", fileListPath);

    // Get the music file path
    const validTrack = musicTrack || "upbeat";
    const musicFilePath = path.join(musicDir, `${validTrack}.mp3`);
    if (!fs.existsSync(musicFilePath)) {
      console.warn(
        `Music file not found: ${musicFilePath}, falling back to default`,
      );
    }

    // Command to create video with slides - using YouTube standard format (1920x1080)
    let ffmpegCommand = `ffmpeg -y -f concat -safe 0 -i "${fileListPath}" -c:v libx264 -preset fast -pix_fmt yuv420p -r 24`;

    // Use YouTube standard format (1920x1080) with proper video settings for quality
    ffmpegCommand += ` -vf "fps=24,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p"`;

    // Add background music if available
    if (fs.existsSync(musicFilePath)) {
      // Calculate total video duration for music fade-out timing
      const totalDuration =
        photos.length * slideDuration + slideDuration + contactSlideDuration;
      // Add music with fade out 3 seconds before the end
      ffmpegCommand += ` -i "${musicFilePath}" -c:a aac -b:a 192k -shortest -af "volume=0.1,afade=t=out:st=${totalDuration - 3}:d=3"`;
    }

    // Add narration if available
    if (video.narrationUrl) {
      const narrationPath = path.join(
        process.cwd(),
        "public",
        video.narrationUrl,
      );
      if (fs.existsSync(narrationPath)) {
        // If we have music, mix it with narration
        if (fs.existsSync(musicFilePath)) {
          // Create a temp file with mixed audio
          const mixedAudioPath = path.join(
            tempDir,
            `mixed-audio-${video.id}.mp3`,
          );

          // Calculate total video duration for music fade-out timing
          const totalDuration =
            photos.length * slideDuration +
            slideDuration +
            contactSlideDuration;

          // Mixing music (low volume) and narration (higher volume with delay) with fade out at the end
          const mixAudioCmd =
            `ffmpeg -y -i "${musicFilePath}" -i "${narrationPath}" -filter_complex ` +
            `"[0:a]volume=0.13,afade=t=out:st=${totalDuration - 3}:d=3[music];` +
            `[1:a]volume=2.0,adelay=${slideDuration * 1000}|${slideDuration * 1000}[narration];` +
            `[music][narration]amix=inputs=2:duration=longest,volume=2.0" ` +
            `-c:a libmp3lame "${mixedAudioPath}"`;

          console.log("Creating mixed audio with fade out:");
          console.log(mixAudioCmd);

          await execPromise(mixAudioCmd);

          // Print info about the audio file
          console.log(
            "Created mixed audio file with higher volume and fade out",
          );

          // Now use the mixed audio with consistent loudness - YouTube standard format (1920x1080) with fast preset
          ffmpegCommand = `ffmpeg -y -f concat -safe 0 -i "${fileListPath}" -i "${mixedAudioPath}" -c:v libx264 -preset fast -pix_fmt yuv420p -r 24 -vf "fps=24,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p" -c:a aac -b:a 256k -shortest`;
        } else {
          // Just add narration with a delay - increased volume
          ffmpegCommand += ` -i "${narrationPath}" -filter_complex "[1:a]adelay=${slideDuration * 1000}|${slideDuration * 1000}[delayed];[delayed]volume=2.0[out]" -map 0:v -map "[out]" -c:a aac -b:a 256k -shortest`;
        }
      }
    }

    // Output file
    ffmpegCommand += ` "${outputPath}"`;

    console.log("Running ffmpeg command to create MP4 video:", ffmpegCommand);

    // Execute the ffmpeg command to create the MP4 file
    await execPromise(ffmpegCommand);

    console.log("Video created successfully:", outputPath);

    // Clean up temporary files
    try {
      console.log("Cleaning up temporary files...");

      // Delete title and contact slides
      if (fs.existsSync(titleImagePath)) fs.unlinkSync(titleImagePath);
      if (fs.existsSync(contactImagePath)) fs.unlinkSync(contactImagePath);

      // Delete file list
      if (fs.existsSync(fileListPath)) fs.unlinkSync(fileListPath);

      // Remove mixed audio file if it was created
      const mixedAudioPath = path.join(tempDir, `mixed-audio-${video.id}.mp3`);
      if (fs.existsSync(mixedAudioPath)) {
        fs.unlinkSync(mixedAudioPath);
      }

      // Clean up title MP4
      if (fs.existsSync(titleMp4Path)) {
        console.log(`Cleaning up title MP4: ${titleMp4Path}`);
        fs.unlinkSync(titleMp4Path);
      }

      // Clean up contact MP4
      if (fs.existsSync(contactMp4Path)) {
        console.log(`Cleaning up contact MP4: ${contactMp4Path}`);
        fs.unlinkSync(contactMp4Path);
      }

      // Remove video segments for photos
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const videoPath = path.join(tempDir, `video-${photo.id}-${i}.mp4`);
        if (fs.existsSync(videoPath)) {
          console.log(`Cleaning up video segment: ${videoPath}`);
          fs.unlinkSync(videoPath);
        }
      }
    } catch (err) {
      console.warn("Error cleaning up temp files:", err);
    }

    // Return the URL to the generated MP4 video file
    return `/videos/${outputFilename}`;
  } catch (error) {
    console.error("Error processing video with ffmpeg:", error);
    throw error;
  }
}

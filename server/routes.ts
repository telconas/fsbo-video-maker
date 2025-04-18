import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { insertPropertyVideoSchema, insertPropertyPhotoSchema, type PropertyVideo } from "@shared/schema";
import { processVideo } from "./lib/videoProcessor";
import { generatePropertyAudio } from "./lib/openaiService";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ 
  storage: storage_config,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WEBP images are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create music directory if it doesn't exist
  const musicDir = path.join(process.cwd(), "public/music");
  if (!fs.existsSync(musicDir)) {
    fs.mkdirSync(musicDir, { recursive: true });
  }

  // Set up static file serving for uploads, music, and audio
  app.use('/api/uploads', express.static(uploadDir));
  app.use('/music', express.static(musicDir));
  
  // Directory for audio files (TTS)
  const audioDir = path.join(process.cwd(), 'public', 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }
  app.use('/audio', express.static(audioDir));
  
  // Serve generated video files (HTML slideshows)
  const videosDir = path.join(process.cwd(), 'public', 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }
  app.use('/videos', express.static(videosDir));
  
  // Route to upload a photo
  app.post('/api/photos/upload', upload.single('photo'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const { videoId, order, isCover } = req.body;
      
      if (!videoId) {
        // Clean up the uploaded file if there's no videoId
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'VideoId is required' });
      }
      
      const photoData = {
        videoId: parseInt(videoId),
        originalName: req.file.originalname,
        storedName: req.file.filename,
        order: parseInt(order || '0'),
        isCover: isCover === 'true'
      };
      
      try {
        const validatedData = insertPropertyPhotoSchema.parse(photoData);
        const photo = await storage.createPropertyPhoto(validatedData);
        
        res.status(201).json(photo);
      } catch (error) {
        // Clean up the uploaded file if validation fails
        fs.unlinkSync(req.file.path);
        throw error;
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Route to create a new property video project
  app.post('/api/videos', async (req: Request, res: Response) => {
    try {
      const videoData = req.body;
      const validatedData = insertPropertyVideoSchema.parse(videoData);
      const video = await storage.createPropertyVideo(validatedData);
      
      res.status(201).json(video);
    } catch (error) {
      console.error('Error creating property video:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Route to get a property video
  app.get('/api/videos/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getPropertyVideo(id);
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      res.json(video);
    } catch (error) {
      console.error('Error getting property video:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Route to update a property video
  app.patch('/api/videos/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Get the existing video
      const video = await storage.getPropertyVideo(id);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      // Update the video data
      const updatedVideo = await storage.updatePropertyVideo(id, updateData);
      
      res.json(updatedVideo);
    } catch (error) {
      console.error('Error updating property video:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Route to get photos for a property video
  app.get('/api/videos/:id/photos', async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      const photos = await storage.getPropertyPhotosByVideoId(videoId);
      
      res.json(photos);
    } catch (error) {
      console.error('Error getting property photos:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Route to update photo order
  app.patch('/api/photos/:id/order', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { order } = req.body;
      
      const photo = await storage.updatePropertyPhotoOrder(id, parseInt(order));
      
      if (!photo) {
        return res.status(404).json({ message: 'Photo not found' });
      }
      
      res.json(photo);
    } catch (error) {
      console.error('Error updating photo order:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Route to set a photo as cover
  app.patch('/api/photos/:id/cover', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { isCover } = req.body;
      
      const photo = await storage.updatePropertyPhotoCover(id, isCover === 'true' || isCover === true);
      
      if (!photo) {
        return res.status(404).json({ message: 'Photo not found' });
      }
      
      res.json(photo);
    } catch (error) {
      console.error('Error updating photo cover status:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Route to delete a photo
  app.delete('/api/photos/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the photo to find the file path
      const photo = await storage.getPropertyPhoto(id);
      if (!photo) {
        return res.status(404).json({ message: 'Photo not found' });
      }
      
      const filePath = path.join(uploadDir, photo.storedName);
      
      // Delete the file if it exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Remove from storage
      const result = await storage.deletePropertyPhoto(id);
      
      if (!result) {
        return res.status(404).json({ message: 'Photo not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Route to cancel video generation
  app.post('/api/videos/:id/cancel', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the video data
      const video = await storage.getPropertyVideo(id);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      // Only update if it's in processing state
      if (video.status === 'processing') {
        await storage.updatePropertyVideoStatus(id, 'cancelled');
      }
      
      res.json({ status: 'cancelled', id });
    } catch (error) {
      console.error('Error cancelling video generation:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Route to generate video
  app.post('/api/videos/:id/generate', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the video data
      let video = await storage.getPropertyVideo(id);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      // Check for null or empty values in important fields and provide defaults
      const updates: Partial<PropertyVideo> = {};
      
      if (!video.address || video.address.trim() === '') {
        updates.address = 'Beautiful Property';
      }
      
      if (!video.price || video.price.trim() === '') {
        updates.price = '$375,000';
      }
      
      if (!video.contactName || video.contactName.trim() === '') {
        updates.contactName = 'Property Owner';
      }
      
      // Apply updates if needed
      if (Object.keys(updates).length > 0) {
        video = await storage.updatePropertyVideo(id, updates) || video;
      }
      
      // Get all photos for this video
      const photos = await storage.getPropertyPhotosByVideoId(id);
      
      if (photos.length === 0) {
        return res.status(400).json({ message: 'No photos found for this video' });
      }
      
      // Update video status to processing
      await storage.updatePropertyVideoStatus(id, 'processing');
      
      // First generate AI property description and narration audio
      generatePropertyAudio(video)
        .then(narrationUrl => {
          // Update the video with the narration URL
          return storage.getPropertyVideo(id).then(updatedVideo => {
            if (updatedVideo && updatedVideo.status !== 'cancelled') {
              // Start video processing with the narration
              return processVideo(updatedVideo, photos, uploadDir)
                .then(videoUrl => {
                  storage.updatePropertyVideoUrl(id, videoUrl);
                });
            }
          });
        })
        .catch(error => {
          console.error('Error generating narration:', error);
          // If narration fails, still try to generate video without narration
          return processVideo(video, photos, uploadDir)
            .then(videoUrl => {
              storage.updatePropertyVideoUrl(id, videoUrl);
            });
        })
        .catch(error => {
          console.error('Error processing video:', error);
          storage.updatePropertyVideoStatus(id, 'error');
        });
      
      // Return immediately with processing status
      res.json({ status: 'processing', id });
    } catch (error) {
      console.error('Error generating video:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import express from "express";

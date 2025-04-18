import { 
  users, type User, type InsertUser,
  propertyVideos, type PropertyVideo, type InsertPropertyVideo,
  propertyPhotos, type PropertyPhoto, type InsertPropertyPhoto
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Property video methods
  createPropertyVideo(video: InsertPropertyVideo): Promise<PropertyVideo>;
  getPropertyVideo(id: number): Promise<PropertyVideo | undefined>;
  updatePropertyVideoStatus(id: number, status: string): Promise<PropertyVideo | undefined>;
  updatePropertyVideoUrl(id: number, videoUrl: string): Promise<PropertyVideo | undefined>;
  updatePropertyVideoNarration(id: number, aiDescription: string, narrationUrl: string): Promise<PropertyVideo | undefined>;
  updatePropertyVideo(id: number, updateData: Partial<PropertyVideo>): Promise<PropertyVideo | undefined>;
  
  // Property photo methods
  createPropertyPhoto(photo: InsertPropertyPhoto): Promise<PropertyPhoto>;
  getPropertyPhoto(id: number): Promise<PropertyPhoto | undefined>;
  getPropertyPhotosByVideoId(videoId: number): Promise<PropertyPhoto[]>;
  updatePropertyPhotoOrder(id: number, order: number): Promise<PropertyPhoto | undefined>;
  updatePropertyPhotoCover(id: number, isCover: boolean): Promise<PropertyPhoto | undefined>;
  deletePropertyPhoto(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private propertyVideos: Map<number, PropertyVideo>;
  private propertyPhotos: Map<number, PropertyPhoto>;
  private userId: number;
  private videoId: number;
  private photoId: number;

  constructor() {
    this.users = new Map();
    this.propertyVideos = new Map();
    this.propertyPhotos = new Map();
    this.userId = 1;
    this.videoId = 1;
    this.photoId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Property video methods
  async createPropertyVideo(insertVideo: InsertPropertyVideo): Promise<PropertyVideo> {
    const id = this.videoId++;
    const video: PropertyVideo = { 
      ...insertVideo, 
      id, 
      status: "pending", 
      videoUrl: null,
      narrationUrl: null,
      aiDescription: null,
      description: insertVideo.description || null,
      contactPhone: insertVideo.contactPhone || null,
      contactEmail: insertVideo.contactEmail || null,
      streetAddress: insertVideo.streetAddress || null,
      city: insertVideo.city || null,
      state: insertVideo.state || null,
      zipCode: insertVideo.zipCode || null,
      voiceId: insertVideo.voiceId || "alloy",
      showPrice: insertVideo.showPrice !== undefined ? insertVideo.showPrice : true,
      createdAt: Math.floor(Date.now() / 1000)
    };
    this.propertyVideos.set(id, video);
    return video;
  }

  async getPropertyVideo(id: number): Promise<PropertyVideo | undefined> {
    return this.propertyVideos.get(id);
  }

  async updatePropertyVideoStatus(id: number, status: string): Promise<PropertyVideo | undefined> {
    const video = this.propertyVideos.get(id);
    if (!video) return undefined;
    
    const updatedVideo = { ...video, status };
    this.propertyVideos.set(id, updatedVideo);
    return updatedVideo;
  }

  async updatePropertyVideoUrl(id: number, videoUrl: string): Promise<PropertyVideo | undefined> {
    const video = this.propertyVideos.get(id);
    if (!video) return undefined;
    
    const updatedVideo = { ...video, videoUrl, status: "completed" };
    this.propertyVideos.set(id, updatedVideo);
    return updatedVideo;
  }
  
  async updatePropertyVideoNarration(id: number, aiDescription: string, narrationUrl: string): Promise<PropertyVideo | undefined> {
    const video = this.propertyVideos.get(id);
    if (!video) return undefined;
    
    const updatedVideo = { ...video, aiDescription, narrationUrl };
    this.propertyVideos.set(id, updatedVideo);
    return updatedVideo;
  }
  
  async updatePropertyVideo(id: number, updateData: Partial<PropertyVideo>): Promise<PropertyVideo | undefined> {
    const video = this.propertyVideos.get(id);
    if (!video) return undefined;
    
    // Create updated video with merged data, but don't override the id
    const updatedVideo = { ...video, ...updateData, id };
    this.propertyVideos.set(id, updatedVideo);
    return updatedVideo;
  }

  // Property photo methods
  async createPropertyPhoto(insertPhoto: InsertPropertyPhoto): Promise<PropertyPhoto> {
    const id = this.photoId++;
    // Ensure isCover is always a boolean, defaulting to false if undefined
    const photo: PropertyPhoto = { 
      ...insertPhoto, 
      id, 
      isCover: insertPhoto.isCover === true
    };
    this.propertyPhotos.set(id, photo);
    return photo;
  }

  async getPropertyPhoto(id: number): Promise<PropertyPhoto | undefined> {
    return this.propertyPhotos.get(id);
  }

  async getPropertyPhotosByVideoId(videoId: number): Promise<PropertyPhoto[]> {
    return Array.from(this.propertyPhotos.values())
      .filter(photo => photo.videoId === videoId)
      .sort((a, b) => a.order - b.order);
  }

  async updatePropertyPhotoOrder(id: number, order: number): Promise<PropertyPhoto | undefined> {
    const photo = this.propertyPhotos.get(id);
    if (!photo) return undefined;
    
    const updatedPhoto = { ...photo, order };
    this.propertyPhotos.set(id, updatedPhoto);
    return updatedPhoto;
  }

  async updatePropertyPhotoCover(id: number, isCover: boolean): Promise<PropertyPhoto | undefined> {
    const photo = this.propertyPhotos.get(id);
    if (!photo) return undefined;
    
    // If setting this photo as cover, unset any existing cover photo
    if (isCover) {
      const existingCoverPhotos = Array.from(this.propertyPhotos.values())
        .filter(p => p.videoId === photo.videoId && p.isCover);
      
      for (const coverPhoto of existingCoverPhotos) {
        this.propertyPhotos.set(coverPhoto.id, { ...coverPhoto, isCover: false });
      }
    }
    
    const updatedPhoto = { ...photo, isCover };
    this.propertyPhotos.set(id, updatedPhoto);
    return updatedPhoto;
  }

  async deletePropertyPhoto(id: number): Promise<boolean> {
    return this.propertyPhotos.delete(id);
  }
}

export const storage = new MemStorage();

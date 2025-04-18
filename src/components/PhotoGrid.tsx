import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Trash, MoveIcon } from "lucide-react";
import { PHOTO_LIMIT } from "@/lib/constants";

export interface PhotoItem {
  id: number;
  url: string;
  originalName: string;
  isCover: boolean;
}

interface PhotoGridProps {
  photos: PhotoItem[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onSetCover: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function PhotoGrid({ photos, onReorder, onSetCover, onDelete }: PhotoGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);
    
    // Dropped outside the list
    if (!result.destination) {
      return;
    }
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    // If the position didn't change
    if (startIndex === endIndex) {
      return;
    }
    
    onReorder(startIndex, endIndex);
  };
  
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  // Calculate empty slots
  const emptySlots = Math.max(0, PHOTO_LIMIT - photos.length);
  
  // Using a grid layout with custom styling to make drag and drop work better
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-4 text-lg">
        Your Photos <span className="text-sm font-normal text-slate-500">({photos.length} of {PHOTO_LIMIT})</span>
      </h3>
      
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <Droppable droppableId="photo-grid" type="PHOTO" direction="horizontal">
          {(provided) => (
            <div
              className="flex flex-wrap gap-4"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {photos.map((photo, index) => (
                <Draggable key={photo.id.toString()} draggableId={photo.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{...provided.draggableProps.style, width: 'calc(25% - 12px)', minWidth: '150px'}}
                      className={`bg-slate-100 rounded-lg overflow-hidden relative shadow-sm border 
                        ${snapshot.isDragging ? 'border-primary z-50' : 'border-slate-200'}`}
                    >
                      <img 
                        src={photo.url} 
                        alt={photo.originalName} 
                        className="w-full h-40 object-cover"
                      />
                      
                      {photo.isCover && (
                        <div className="absolute top-2 left-2 bg-slate-800 bg-opacity-70 text-white text-xs py-1 px-2 rounded">
                          Cover Photo
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button 
                          className="bg-slate-800 bg-opacity-70 text-white p-1.5 rounded hover:bg-opacity-90"
                          {...provided.dragHandleProps}
                        >
                          <MoveIcon size={14} />
                        </button>
                        <button 
                          className="bg-slate-800 bg-opacity-70 text-white p-1.5 rounded hover:bg-red-500"
                          onClick={() => onDelete(photo.id)}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                      
                      {!photo.isCover && (
                        <button
                          className="absolute bottom-2 left-2 bg-primary bg-opacity-90 text-white text-xs py-1 px-2 rounded hover:bg-opacity-100"
                          onClick={() => onSetCover(photo.id)}
                        >
                          Set as Cover
                        </button>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: emptySlots }).map((_, index) => (
                <div 
                  key={`empty-${index}`}
                  style={{width: 'calc(25% - 12px)', minWidth: '150px'}} 
                  className="bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-center h-40"
                >
                  <span className="text-slate-400 text-sm">Empty Slot</span>
                </div>
              ))}
              
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <p className="text-sm text-slate-500 mt-4">
        <span className="inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          Drag and drop photos to reorder them. The first photo will be your cover image.
        </span>
      </p>
    </div>
  );
}

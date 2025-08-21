
import React, { useState } from 'react';
import { MOCK_GALLERY_IMAGES } from '../constants';
import { GalleryImage } from '../types';

const GalleryPage: React.FC = () => {
    const albums: GalleryImage['album'][] = ['حصص', 'تكريم', 'أنشطة', 'رحلات'];
    const [activeAlbum, setActiveAlbum] = useState<GalleryImage['album'] | 'الكل'>('الكل');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const filteredImages = activeAlbum === 'الكل' 
        ? MOCK_GALLERY_IMAGES 
        : MOCK_GALLERY_IMAGES.filter(img => img.album === activeAlbum);

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6 text-[hsl(var(--color-text-primary))]">🖼️ معرض الصور</h1>
            
            <div className="flex flex-wrap gap-3 mb-8">
                <button 
                    onClick={() => setActiveAlbum('الكل')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${activeAlbum === 'الكل' ? 'bg-[hsl(var(--color-primary))] text-white shadow-md' : 'bg-[hsl(var(--color-surface))] hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                    الكل
                </button>
                {albums.map(album => (
                    <button 
                        key={album}
                        onClick={() => setActiveAlbum(album)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${activeAlbum === album ? 'bg-[hsl(var(--color-primary))] text-white shadow-md' : 'bg-[hsl(var(--color-surface))] hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        {album}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                    <div key={image.id} className="group relative cursor-pointer" onClick={() => setSelectedImage(image.imageUrl)}>
                        <img src={image.imageUrl} alt={image.title} className="w-full h-48 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <p className="text-white font-bold">{image.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
                    onClick={() => setSelectedImage(null)}
                >
                    <img src={selectedImage} alt="Selected" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" />
                     <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 text-white text-4xl">&times;</button>
                </div>
            )}
        </div>
    );
};

export default GalleryPage;

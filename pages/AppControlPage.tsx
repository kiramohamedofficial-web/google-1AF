import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import type { DefaultProfilePicture } from '../types.ts';
import { TrashIcon, PlusIcon } from '../components/common/Icons.tsx';

// A sub-component for the image grid
const PictureGrid: React.FC<{
    title: string;
    pictures: DefaultProfilePicture[];
    gender: 'male' | 'female';
    onUpload: (gender: 'male' | 'female', file: File) => Promise<void>;
    onDelete: (id: string, imageUrl: string) => Promise<void>;
}> = ({ title, pictures, gender, onUpload, onDelete }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            await onUpload(gender, file);
            setIsUploading(false);
        }
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="bg-[hsl(var(--color-surface))] p-6 rounded-2xl shadow-lg border border-[hsl(var(--color-border))]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{title} ({pictures.length})</h2>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-[hsl(var(--color-primary))] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90 disabled:bg-gray-400"
                >
                    {isUploading ? 'جاري الرفع...' : <><PlusIcon /> إضافة صورة</>}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                />
            </div>
            {pictures.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {pictures.map(pic => (
                        <div key={pic.id} className="relative group aspect-square">
                            <img src={pic.image_url} alt={`Profile picture ${pic.id}`} className="w-full h-full object-cover rounded-lg" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <button
                                    onClick={() => onDelete(pic.id, pic.image_url)}
                                    className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                    aria-label="Delete picture"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed border-[hsl(var(--color-border))] rounded-lg">
                    <p className="text-[hsl(var(--color-text-secondary))]">لا توجد صور. قم بإضافة أول صورة.</p>
                </div>
            )}
        </div>
    );
};


const AppControlPage: React.FC = () => {
    const [malePictures, setMalePictures] = useState<DefaultProfilePicture[]>([]);
    const [femalePictures, setFemalePictures] = useState<DefaultProfilePicture[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const BUCKET_NAME = 'profile-pictures';

    const fetchPictures = useCallback(async () => {
        setIsLoading(true);
        setError('');
        const { data, error } = await supabase
            .from('default_profile_pictures')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pictures:', error);
            setError('فشل تحميل الصور. تأكد من إنشاء جدول `default_profile_pictures`.');
        } else {
            setMalePictures(data.filter(p => p.gender === 'male'));
            setFemalePictures(data.filter(p => p.gender === 'female'));
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchPictures();
    }, [fetchPictures]);

    const handleUpload = async (gender: 'male' | 'female', file: File) => {
        setError('');
        const filePath = `public/${gender}/${Date.now()}_${file.name}`;
        
        const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
        if (uploadError) {
            if (uploadError.message.includes("Bucket not found")) {
                setError(`فشل الرفع: لم يتم العثور على 'bucket' التخزين. يرجى إنشاء 'bucket' باسم '${BUCKET_NAME}' في مشروع Supabase الخاص بك وجعله عامًا (public).`);
            } else {
                setError(`خطأ في رفع الملف: ${uploadError.message}`);
            }
            return;
        }

        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        if (!urlData?.publicUrl) {
            setError('لم نتمكن من الحصول على رابط الصورة بعد الرفع.');
            return;
        }

        const { error: insertError } = await supabase
            .from('default_profile_pictures')
            .insert([{ gender, image_url: urlData.publicUrl }]);

        if (insertError) {
            setError(`خطأ في حفظ رابط الصورة: ${insertError.message}`);
            // Attempt to clean up orphaned storage file
            await supabase.storage.from(BUCKET_NAME).remove([filePath]);
        } else {
            await fetchPictures(); // Refresh the list
        }
    };

    const handleDelete = async (id: string, imageUrl: string) => {
        if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذه الصورة؟")) return;
        setError('');

        // Delete from table first
        const { error: deleteDbError } = await supabase
            .from('default_profile_pictures')
            .delete()
            .eq('id', id);

        if (deleteDbError) {
            setError(`خطأ في حذف الصورة من قاعدة البيانات: ${deleteDbError.message}`);
            return;
        }

        // Delete from storage
        try {
            const url = new URL(imageUrl);
            const filePath = decodeURIComponent(url.pathname.substring(url.pathname.indexOf(BUCKET_NAME) + BUCKET_NAME.length + 1));
            const { error: deleteStorageError } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
            if (deleteStorageError) {
                console.error('Storage deletion error (might be okay if DB entry was orphaned):', deleteStorageError);
                // Don't show this error to user as the main goal (removing from app) is done
            }
        } catch (e) {
            console.error("Could not parse image URL to delete from storage:", e);
        }

        await fetchPictures(); // Refresh list
    };


    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-4xl font-extrabold mb-2 text-[hsl(var(--color-text-primary))]">إدارة صور البروفايل</h1>
                <p className="text-lg text-[hsl(var(--color-text-secondary))]">
                    أضف أو احذف الصور الافتراضية التي يتم تعيينها للطلاب الجدد عند إنشاء حساب.
                </p>
            </div>

            {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-lg text-center font-semibold">{error}</div>}

            {isLoading ? (
                 <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--color-primary))] mx-auto"></div></div>
            ) : (
                <div className="space-y-8">
                    <PictureGrid
                        title="صور الأولاد"
                        pictures={malePictures}
                        gender="male"
                        onUpload={handleUpload}
                        onDelete={handleDelete}
                    />
                    <PictureGrid
                        title="صور البنات"
                        pictures={femalePictures}
                        gender="female"
                        onUpload={handleUpload}
                        onDelete={handleDelete}
                    />
                </div>
            )}
        </div>
    );
};

export default AppControlPage;

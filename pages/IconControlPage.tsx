
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { subjectStyles } from '../constants.ts';
import type { IconSetting } from '../types.ts';
import { HomeIcon, CalendarIcon, UsersIcon, NewsIcon, InformationCircleIcon, PrivacyIcon, TermsIcon, PhotoIcon, Cog6ToothIcon, SparklesIcon, PaintBrushIcon, ArrowLeftOnRectangleIcon, GlobeAltIcon, BookOpenIcon, BellIcon, UserCircleIcon } from '../components/common/Icons.tsx';
import { useIcons } from '../contexts/IconContext.tsx';
import IconDisplay from '../components/common/IconDisplay.tsx';

// Define the required icon keys and their default representations
const REQUIRED_SIDEBAR_ICONS = [
    { key: 'nav_home', label: 'الرئيسية', fallback: <HomeIcon /> },
    { key: 'nav_full-schedule', label: 'جدول الحصص', fallback: <CalendarIcon /> },
    { key: 'nav_teachers', label: 'المدرسين', fallback: <UsersIcon /> },
    { key: 'nav_educational-platform', label: 'المنصة التعليمية', fallback: <GlobeAltIcon /> },
    { key: 'nav_news', label: 'الأخبار', fallback: <NewsIcon /> },
    { key: 'nav_about', label: 'من نحن', fallback: <InformationCircleIcon /> },
    { key: 'nav_privacy-policy', label: 'سياسة الخصوصية', fallback: <PrivacyIcon /> },
    { key: 'nav_terms-of-service', label: 'شروط الاستخدام', fallback: <TermsIcon /> },
    { key: 'nav_admin-dashboard', label: 'لوحة التحكم', fallback: <Cog6ToothIcon /> },
    { key: 'nav_app-control', label: 'صور البروفايل', fallback: <PhotoIcon /> },
    { key: 'nav_icon-control', label: 'التحكم بالأيقونات', fallback: <SparklesIcon /> },
    { key: 'nav_themes', label: 'تغيير الثيم', fallback: <PaintBrushIcon /> },
    { key: 'nav_logout', label: 'تسجيل الخروج', fallback: <ArrowLeftOnRectangleIcon /> },
];

const REQUIRED_HEADER_ICONS = [
    { key: 'header_logo', label: 'شعار الهيدر', fallback: <BookOpenIcon /> },
    { key: 'header_notifications', label: 'أيقونة الإشعارات', fallback: <BellIcon /> },
    { key: 'header_profile', label: 'أيقونة الملف الشخصي (القائمة)', fallback: <UserCircleIcon /> },
    { key: 'header_logout', label: 'أيقونة تسجيل الخروج (القائمة)', fallback: <ArrowLeftOnRectangleIcon /> },
];

const IconEditor: React.FC<{
    iconKey: string;
    label: string;
    currentValue: string;
    fallbackIcon: string | React.ReactNode;
    onChange: (key: string, value: string) => void;
    onFileUpload: (key: string, file: File) => Promise<void>;
}> = ({ iconKey, label, currentValue, fallbackIcon, onChange, onFileUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            await onFileUpload(iconKey, file);
            setIsUploading(false);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="bg-[hsl(var(--color-background))] p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4 border border-[hsl(var(--color-border))]">
            <div className="w-12 h-12 bg-[hsl(var(--color-surface))] rounded-md flex items-center justify-center flex-shrink-0">
                <IconDisplay value={currentValue} fallback={fallbackIcon} className="w-8 h-8" />
            </div>
            <div className="flex-grow text-center sm:text-right">
                <p className="font-bold text-lg">{label}</p>
                <p className="text-xs font-mono text-[hsl(var(--color-text-secondary))]">{iconKey}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => onChange(iconKey, e.target.value)}
                    placeholder="رمز أو SVG أو رابط URL"
                    className="w-full sm:w-48 p-2 rounded-md bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] text-left"
                    dir="ltr"
                />
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*, image/gif"
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full sm:w-auto bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                >
                    {isUploading ? 'جاري الرفع...' : 'رفع صورة/GIF'}
                </button>
            </div>
        </div>
    );
};


const IconControlPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'subjects' | 'sidebar' | 'header'>('subjects');
    const { iconSettings, loading: iconsLoading } = useIcons();

    const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
    const [initialSettings, setInitialSettings] = useState<Record<string, string>>({});
    
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const BUCKET_NAME = 'app-icons';

    useEffect(() => {
        if (!iconsLoading) {
            setLocalSettings(iconSettings);
            setInitialSettings(iconSettings);
        }
    }, [iconSettings, iconsLoading]);

    const subjectIconKeys = useMemo(() => {
        return Object.keys(subjectStyles)
            .filter(label => label !== 'Default')
            .map(label => ({
                key: `subject_${label}`,
                label: label,
                fallback: subjectStyles[label as keyof typeof subjectStyles].icon,
            }));
    }, []);
    
    const allIconDefinitions = useMemo(() => {
        return [
            ...subjectIconKeys.map(i => ({ ...i, category: 'subject' as const })),
            ...REQUIRED_SIDEBAR_ICONS.map(i => ({ ...i, category: 'sidebar' as const })),
            ...REQUIRED_HEADER_ICONS.map(i => ({ ...i, category: 'header' as const }))
        ];
    }, [subjectIconKeys]);

    const handleSettingChange = (key: string, value: string) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleFileUpload = async (key: string, file: File) => {
        setError('');
        setSuccessMessage('');

        const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
        const filePath = `public/${sanitizedKey}_${Date.now()}_${file.name}`;

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

        handleSettingChange(key, urlData.publicUrl);
        setSuccessMessage(`تم رفع '${file.name}' بنجاح. اضغط 'حفظ التغييرات' لتثبيت التغيير.`);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        setSuccessMessage('');

        const changedSettings = Object.entries(localSettings).filter(([key, value]) => value !== initialSettings[key]);

        if (changedSettings.length === 0) {
            setSuccessMessage("لا توجد تغييرات لحفظها.");
            setIsSaving(false);
            return;
        }

        const upsertData = changedSettings.map(([key, value]) => {
            const definition = allIconDefinitions.find(i => i.key === key);
            return {
                key,
                value: value || '',
                label: definition?.label || key.replace(/^(subject_|nav_|header_)/, ''),
                category: definition?.category || (key.startsWith('subject_') ? 'subject' : (key.startsWith('header_') ? 'header' : 'sidebar'))
            };
        });

        const { error: upsertError } = await supabase.from('icon_settings').upsert(upsertData, { onConflict: 'key' });

        if (upsertError) {
            console.error(upsertError);
            setError(`فشل حفظ التغييرات: ${upsertError.message}`);
        } else {
            setSuccessMessage('تم حفظ التغييرات بنجاح! يتم الآن تحديث الموقع بشكل فوري.');
            setInitialSettings(localSettings);
        }
        setIsSaving(false);
    };


    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-4xl font-extrabold mb-2 text-[hsl(var(--color-text-primary))]">التحكم بالأيقونات</h1>
                <p className="text-lg text-[hsl(var(--color-text-secondary))]">
                    إدارة الأيقونات، الرموز التعبيرية، الصور، وملفات GIF المستخدمة في جميع أنحاء المنصة.
                </p>
            </div>
            
            {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-lg text-center font-semibold">{error}</div>}
            {successMessage && <div className="p-4 bg-green-500/10 text-green-500 rounded-lg text-center font-semibold">{successMessage}</div>}


            <div className="bg-[hsl(var(--color-surface))] rounded-xl shadow-lg p-2 border border-[hsl(var(--color-border))] flex flex-wrap items-center gap-2">
                <button onClick={() => setActiveTab('subjects')} className={`flex-grow text-center py-2 px-4 font-semibold rounded-lg transition-all duration-300 ${activeTab === 'subjects' ? 'bg-[hsl(var(--color-primary))] text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>أيقونات المواد</button>
                <button onClick={() => setActiveTab('sidebar')} className={`flex-grow text-center py-2 px-4 font-semibold rounded-lg transition-all duration-300 ${activeTab === 'sidebar' ? 'bg-[hsl(var(--color-primary))] text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>أيقونات القائمة</button>
                <button onClick={() => setActiveTab('header')} className={`flex-grow text-center py-2 px-4 font-semibold rounded-lg transition-all duration-300 ${activeTab === 'header' ? 'bg-[hsl(var(--color-primary))] text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>أيقونات الهيدر</button>
            </div>

            {iconsLoading ? (
                <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--color-primary))] mx-auto"></div></div>
            ) : (
                <div className="space-y-4">
                    {activeTab === 'subjects' && subjectIconKeys.map(({ key, label, fallback }) => (
                        <IconEditor 
                            key={key}
                            iconKey={key}
                            label={label}
                            currentValue={localSettings[key] || ''}
                            fallbackIcon={fallback}
                            onChange={handleSettingChange}
                            onFileUpload={handleFileUpload}
                        />
                    ))}
                     {activeTab === 'sidebar' && REQUIRED_SIDEBAR_ICONS.map(({ key, label, fallback }) => (
                        <IconEditor 
                            key={key}
                            iconKey={key}
                            label={label}
                            currentValue={localSettings[key] || ''}
                            fallbackIcon={fallback}
                            onChange={handleSettingChange}
                            onFileUpload={handleFileUpload}
                        />
                    ))}
                    {activeTab === 'header' && REQUIRED_HEADER_ICONS.map(({ key, label, fallback }) => (
                        <IconEditor 
                            key={key}
                            iconKey={key}
                            label={label}
                            currentValue={localSettings[key] || ''}
                            fallbackIcon={fallback}
                            onChange={handleSettingChange}
                            onFileUpload={handleFileUpload}
                        />
                    ))}
                </div>
            )}
            
            <div className="flex justify-end sticky bottom-6">
                <button
                    onClick={handleSave}
                    disabled={isSaving || iconsLoading}
                    className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-green-700 transition-all text-lg disabled:bg-gray-400"
                >
                    {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
            </div>
        </div>
    );
};

export default IconControlPage;

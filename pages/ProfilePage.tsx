import React, { useState, useEffect } from 'react';
import { User } from '../types.ts';
import { supabase } from '../services/supabaseClient.ts';

interface ProfilePageProps {
    user: User;
    onUserUpdate: (updatedUser: User) => void;
}

const parseGrade = (grade: string | undefined) => {
    let stage: 'preparatory' | 'secondary' | '' = '';
    let year: 'first' | 'second' | 'third' | '' = '';
    const gradeStr = grade || '';

    if (gradeStr.includes('الإعدادي')) stage = 'preparatory';
    else if (gradeStr.includes('الثانوي')) stage = 'secondary';

    if (gradeStr.includes('الأول')) year = 'first';
    else if (gradeStr.includes('الثاني')) year = 'second';
    else if (gradeStr.includes('الثالث')) year = 'third';

    return { stage, year };
};


const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUserUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User>(user);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { stage: initialStage, year: initialYear } = parseGrade(user.grade);
    const [gradeStage, setGradeStage] = useState<'preparatory' | 'secondary' | ''>(initialStage);
    const [gradeYear, setGradeYear] = useState<'first' | 'second' | 'third' | ''>(initialYear);

    useEffect(() => {
        setFormData(user);
        const { stage, year } = parseGrade(user.grade);
        setGradeStage(stage);
        setGradeYear(year);
    }, [user]);

    useEffect(() => {
        if (isEditing && gradeStage && gradeYear) {
            const stageArabic = gradeStage === 'preparatory' ? 'الإعدادي' : 'الثانوي';
            const yearArabicMap = { first: 'الأول', second: 'الثاني', third: 'الثالث' };
            const yearArabic = yearArabicMap[gradeYear as keyof typeof yearArabicMap];
            
            const newGrade = `الصف ${yearArabic} ${stageArabic}`;
            setFormData(prev => ({ ...prev, grade: newGrade }));
        }
    }, [gradeStage, gradeYear, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError('');

        const updatePayload = {
            name: formData.name,
            phone: formData.phone,
            guardianPhone: formData.guardianPhone,
            school: formData.school,
            grade: formData.grade,
            gender: formData.gender,
            section: formData.section
        };

        const { error: updateError } = await supabase
            .from('users')
            .update(updatePayload)
            .eq('id', user.id);
        
        setIsLoading(false);

        if (updateError) {
            console.error("Error updating profile:", updateError);
            setError("حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.");
        } else {
            onUserUpdate(formData);
            setIsEditing(false);
        }
    };
    
    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6">الملف الشخصي</h1>
            <div className="bg-[hsl(var(--color-surface))] rounded-xl shadow-lg p-8 border border-[hsl(var(--color-border))]">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                    <img src={formData.profilePicture} alt="Profile" className="w-40 h-40 rounded-full border-4 border-[hsl(var(--color-primary))] object-cover"/>
                    <div>
                        <h2 className="text-3xl font-bold">{formData.name}</h2>
                        <p className="text-lg text-[hsl(var(--color-text-secondary))]">{formData.grade}</p>
                         <p className="text-sm font-mono text-[hsl(var(--color-text-secondary))] mt-2 bg-[hsl(var(--color-background))] px-2 py-1 rounded-md inline-block">ID: {formData.id}</p>
                    </div>
                </div>
                
                {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-center font-semibold">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">الاسم الكامل</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm disabled:opacity-70 p-2"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">البريد الإلكتروني</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={true} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm disabled:opacity-70 p-2"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">رقم الهاتف</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm disabled:opacity-70 p-2"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">رقم ولي الأمر</label>
                        <input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm disabled:opacity-70 p-2"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">المدرسة</label>
                        <input type="text" name="school" value={formData.school} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm disabled:opacity-70 p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">الصف الدراسي</label>
                        <div className="flex gap-2 mt-1">
                            <select 
                                name="gradeStage" 
                                value={gradeStage} 
                                onChange={(e) => setGradeStage(e.target.value as any)} 
                                disabled={!isEditing} 
                                className="block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm disabled:opacity-70 p-2"
                            >
                                <option value="" disabled>المرحلة</option>
                                <option value="preparatory">إعدادي</option>
                                <option value="secondary">ثانوي</option>
                            </select>
                            <select 
                                name="gradeYear" 
                                value={gradeYear} 
                                onChange={(e) => setGradeYear(e.target.value as any)} 
                                disabled={!isEditing} 
                                className="block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm disabled:opacity-70 p-2"
                            >
                                <option value="" disabled>الصف</option>
                                <option value="first">الأول</option>
                                <option value="second">الثاني</option>
                                <option value="third">الثالث</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">الجنس</label>
                        <select name="gender" value={formData.gender || 'ذكر'} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm disabled:opacity-70 p-2">
                            <option value="ذكر">ذكر</option>
                            <option value="أنثى">أنثى</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">الشعبة</label>
                        <select name="section" value={formData.section || 'عام'} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm disabled:opacity-70 p-2">
                            <option value="عام">عام</option>
                            <option value="علمي علوم">علمي علوم</option>
                            <option value="علمي رياضة">علمي رياضة</option>
                            <option value="أدبي">أدبي</option>
                        </select>
                    </div>
                </div>
                
                <div className="mt-8 flex gap-4">
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} disabled={isLoading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">
                                {isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                            </button>
                            <button onClick={() => { setIsEditing(false); setFormData(user); setError(''); }} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">إلغاء</button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="bg-[hsl(var(--color-primary))] hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg">تعديل البيانات</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
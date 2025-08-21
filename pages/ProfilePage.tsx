
import React, { useState } from 'react';
import { User } from '../types';

interface ProfilePageProps {
    user: User;
    onUserUpdate: (updatedUser: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUserUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User>(user);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onUserUpdate(formData);
        setIsEditing(false);
        // Here you would typically call an API to save the data
        alert('تم حفظ البيانات بنجاح!');
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">الاسم الكامل</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm disabled:opacity-70 p-2"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">البريد الإلكتروني</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm disabled:opacity-70 p-2"/>
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
                        <label className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">تاريخ الميلاد</label>
                        <input type="date" name="dob" value={formData.dob || ''} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm disabled:opacity-70 p-2"/>
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
                            <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg">حفظ التعديلات</button>
                            <button onClick={() => { setIsEditing(false); setFormData(user); }} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">إلغاء</button>
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
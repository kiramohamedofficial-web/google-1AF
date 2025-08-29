
import React, { useState, useMemo, useEffect } from 'react';
import { Lesson, Trip, Teacher, Post, User, Booking, SiteSettings, ToastType } from '../types.ts';
import { 
    UsersIcon, CalendarIcon, AcademicCapIcon, TruckIcon, 
    NewspaperIcon, PencilIcon, TrashIcon, PlusIcon, TicketIcon, StarIcon, UploadIcon
} from '../components/common/Icons.tsx';
import { getSupabaseErrorMessage, uploadFile, getPathFromUrl, getSiteSettings, saveSiteSettings as saveSettingsToDb } from '../services/supabaseService.ts';
import { TeachersManager } from '../components/admin/TeachersManager.tsx';


// --- Reusable InputField Component ---
const InputField: React.FC<{ label: string, name: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void, type?: string, required?: boolean, placeholder?: string, as?: 'input' | 'textarea' | 'select', options?: {value: string, label: string}[], rows?: number }> = 
({ label, name, value, onChange, type = 'text', required = false, placeholder, as = 'input', options, rows = 3 }) => (
    <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        {as === 'textarea' ? (
            <textarea name={name} value={value as string} onChange={onChange} rows={rows} placeholder={placeholder} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm p-2 focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition"/>
        ) : as === 'select' ? (
             <select name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm p-2 focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition">
                <option value="" disabled>{placeholder || `اختر ${label}`}</option>
                {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
             </select>
        ) : (
            <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm p-2 focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
        )}
    </div>
);

// --- MODALS (Lesson, Post, Trip, TripBookings) ---

interface LessonFormModalProps { isOpen: boolean; onClose: () => void; onSave: (lesson: Lesson) => void; lessonToEdit: Lesson | null; teachers: Teacher[]; }
const emptyLesson: Omit<Lesson, 'id'> = { day: 'الأحد', subject: '', teacher: '', time: '', hall: '', grade: '', notes: '', capacity: 50, booked_count: 0, booking_required: true };
const LessonFormModal: React.FC<LessonFormModalProps> = ({ isOpen, onClose, onSave, lessonToEdit, teachers }) => {
    const [formData, setFormData] = useState(emptyLesson);
    useEffect(() => { if (isOpen) setFormData(lessonToEdit ? { ...emptyLesson, ...lessonToEdit } : emptyLesson); }, [lessonToEdit, isOpen]);
    const handleChange = (e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, [e.target.name]: e.target.type === 'number' ? parseInt(e.target.value) : e.target.value }));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ id: lessonToEdit?.id || `new_${Date.now()}`, ...formData }); onClose(); };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16 sm:items-center sm:pt-4" onClick={onClose}>
            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-2xl border border-[hsl(var(--color-border))] transform transition-all animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold p-6 border-b border-[hsl(var(--color-border))]">{lessonToEdit ? '✏️ تعديل حصة' : '➕ إضافة حصة'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                        <InputField label="المادة" name="subject" value={formData.subject} onChange={handleChange} required />
                        <InputField label="الصف" name="grade" value={formData.grade} onChange={handleChange} required placeholder="مثال: الصف الثالث الثانوي"/>
                        <InputField as="select" label="اليوم" name="day" value={formData.day} onChange={handleChange} required options={['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(d => ({value: d, label: d}))} />
                        <InputField label="الوقت" name="time" value={formData.time} onChange={handleChange} required placeholder="4:00 م - 6:00 م"/>
                        <InputField as="select" label="المدرس" name="teacher" value={formData.teacher} onChange={handleChange} required options={teachers.map(t => ({value: t.name, label: t.name}))} placeholder="اختر المدرس" />
                        <InputField label="القاعة" name="hall" value={formData.hall} onChange={handleChange} required />
                        <InputField as="select" label="نظام الحجز" name="booking_required" value={formData.booking_required === false ? 'false' : 'true'} onChange={(e) => setFormData(p => ({ ...p, booking_required: e.target.value === 'true' }))} options={[{value: 'true', label: 'بحجز مسبق'}, {value: 'false', label: 'بدون حجز (حضور مباشر)'}]} />
                        <InputField type="number" label="السعة" name="capacity" value={formData.capacity || 50} onChange={handleChange} />
                        <div className="md:col-span-2"><InputField as="textarea" label="ملاحظات" name="notes" value={formData.notes || ''} onChange={handleChange} /></div>
                    </div>
                    <div className="p-6 flex justify-end gap-4 bg-[hsl(var(--color-background))] rounded-b-2xl">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-6 rounded-lg">إلغاء</button>
                        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg">💾 حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface TripFormModalProps { isOpen: boolean; onClose: () => void; onSave: (trip: Trip) => void; tripToEdit: Trip | null; addToast: (type: ToastType, title: string, message: string) => void;}
const emptyTrip: Omit<Trip, 'id'> = { title: '', description: '', date: '', time: '', meeting_point: '', capacity: 50, booked_count: 0, cost: 0, image_urls: [] };
const TripFormModal: React.FC<TripFormModalProps> = ({ isOpen, onClose, onSave, tripToEdit, addToast }) => {
    const [formData, setFormData] = useState(emptyTrip);
    const [selectedImageFiles, setSelectedImageFiles] = useState<FileList | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => { 
        if (isOpen) {
            setFormData(tripToEdit ? { ...emptyTrip, ...tripToEdit } : emptyTrip);
            setSelectedImageFiles(null);
        }
    }, [tripToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, [e.target.name]: e.target.type === 'number' ? parseInt(e.target.value) : e.target.value }));
    
    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault();
        setIsUploading(true);
        try {
            let finalImageUrls = tripToEdit?.image_urls || [];

            if (selectedImageFiles && selectedImageFiles.length > 0) {
                const uploadPromises = Array.from(selectedImageFiles).map((file: File) => uploadFile('trip_images', file));
                const uploadedPaths = await Promise.all(uploadPromises);
                const successfulPaths = uploadedPaths.filter((path): path is string => path !== null);

                if (successfulPaths.length < uploadedPaths.length) {
                    addToast('warning', 'فشل رفع بعض الصور', 'سيتم حفظ الصور التي تم رفعها بنجاح فقط.');
                }
                finalImageUrls = successfulPaths;
            }
            
            onSave({ ...formData, image_urls: finalImageUrls, id: tripToEdit?.id || `new_${Date.now()}` });
            onClose(); 
        } catch (error) {
            addToast('error', 'فشل حفظ الرحلة', getSupabaseErrorMessage(error));
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16 sm:items-center sm:pt-4" onClick={onClose}>
            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-2xl border border-[hsl(var(--color-border))] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                 <h2 className="text-2xl font-bold p-6 border-b border-[hsl(var(--color-border))]">{tripToEdit ? '✏️ تعديل رحلة' : '➕ إضافة رحلة جديدة'}</h2>
                 <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <div className="md:col-span-2"><InputField label="عنوان الرحلة" name="title" value={formData.title} onChange={handleChange} required /></div>
                        <InputField type="date" label="التاريخ" name="date" value={formData.date} onChange={handleChange} required />
                        <InputField label="الوقت" name="time" value={formData.time} onChange={handleChange} required placeholder="8:00 ص - 6:00 م"/>
                        <InputField label="مكان التجمع" name="meeting_point" value={formData.meeting_point} onChange={handleChange} required />
                        <InputField type="number" label="عدد المقاعد" name="capacity" value={formData.capacity} onChange={handleChange} />
                        <InputField type="number" label="التكلفة (ج.م)" name="cost" value={formData.cost || 0} onChange={handleChange} />
                        <div className="md:col-span-2"><InputField as="textarea" label="وصف الرحلة" name="description" value={formData.description} onChange={handleChange} /></div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">صور الرحلة (يمكن اختيار أكثر من صورة)</label>
                            <input type="file" multiple accept="image/*" onChange={(e) => setSelectedImageFiles(e.target.files)} className="mt-1 block w-full text-sm text-[hsl(var(--color-text-secondary))] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[hsl(var(--color-primary))] file:text-white hover:file:opacity-90 cursor-pointer"/>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(selectedImageFiles ? Array.from(selectedImageFiles) : []).map((file: File, index) => (
                                    <img key={index} src={URL.createObjectURL(file)} alt="Preview" className="w-20 h-20 rounded-md object-cover"/>
                                ))}
                                {!selectedImageFiles && formData.image_urls.map((url, index) => (
                                     <img key={index} src={url} alt="Existing" className="w-20 h-20 rounded-md object-cover"/>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4 p-6 bg-[hsl(var(--color-background))] rounded-b-2xl">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-6 rounded-lg">إلغاء</button>
                        <button type="submit" disabled={isUploading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">
                             {isUploading ? 'جاري الحفظ...' : '💾 حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface PostFormModalProps { isOpen: boolean; onClose: () => void; onSave: (post: Post) => void; postToEdit: Post | null; addToast: (type: ToastType, title: string, message: string) => void; }
const emptyPost: Omit<Post, 'id' | 'timestamp'> = { title: '', content: '', author: 'إدارة السنتر', status: 'published', image_urls: [], is_pinned: false };
const PostFormModal: React.FC<PostFormModalProps> = ({ isOpen, onClose, onSave, postToEdit, addToast }) => {
    const [formData, setFormData] = useState(emptyPost);
    const [selectedImageFiles, setSelectedImageFiles] = useState<FileList | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => { 
        if (isOpen) {
            setFormData(postToEdit ? { ...emptyPost, ...postToEdit } : emptyPost);
            setSelectedImageFiles(null);
        }
    }, [postToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        setIsUploading(true);
        try {
            let finalImageUrls = postToEdit?.image_urls || [];
            
            if (selectedImageFiles && selectedImageFiles.length > 0) {
                const uploadPromises = Array.from(selectedImageFiles).map((file: File) => uploadFile('post_images', file));
                const uploadedPaths = await Promise.all(uploadPromises);
                const successfulPaths = uploadedPaths.filter((path): path is string => path !== null);

                if (successfulPaths.length < uploadedPaths.length) {
                    addToast('warning', 'فشل رفع بعض الصور', 'سيتم حفظ الصور التي تم رفعها بنجاح فقط.');
                }
                finalImageUrls = successfulPaths;
            }

            onSave({ ...formData, image_urls: finalImageUrls, id: postToEdit?.id || `new_${Date.now()}`, timestamp: new Date().toISOString() }); 
            onClose(); 
        } catch (error) {
            addToast('error', 'فشل حفظ المنشور', getSupabaseErrorMessage(error));
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16 sm:items-center sm:pt-4" onClick={onClose}>
            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-2xl border border-[hsl(var(--color-border))] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                 <h2 className="text-2xl font-bold p-6 border-b border-[hsl(var(--color-border))]">{postToEdit ? '✏️ تعديل منشور' : '➕ إنشاء منشور جديد'}</h2>
                 <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 gap-4 max-h-[70vh] overflow-y-auto">
                        <InputField label="العنوان" name="title" value={formData.title} onChange={handleChange} required />
                        <InputField as="textarea" label="المحتوى" name="content" value={formData.content} onChange={handleChange} rows={5} />
                        <div>
                            <label className="block text-sm font-medium mb-1">إرفاق صور (اختياري)</label>
                            <input type="file" multiple accept="image/*" onChange={(e) => setSelectedImageFiles(e.target.files)} className="mt-1 block w-full text-sm text-[hsl(var(--color-text-secondary))] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[hsl(var(--color-primary))] file:text-white hover:file:opacity-90 cursor-pointer"/>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(selectedImageFiles ? Array.from(selectedImageFiles) : []).map((file: File, index) => (
                                    <img key={index} src={URL.createObjectURL(file)} alt="Preview" className="w-20 h-20 rounded-md object-cover"/>
                                ))}
                                {!selectedImageFiles && formData.image_urls?.map((url, index) => (
                                     <img key={index} src={url} alt="Existing" className="w-20 h-20 rounded-md object-cover"/>
                                ))}
                            </div>
                        </div>
                        <InputField as="select" label="الحالة" name="status" value={formData.status} onChange={handleChange} options={[{value: 'published', label: 'نشر فوري'}, {value: 'draft', label: 'حفظ كمسودة'}]}/>
                    </div>
                    <div className="flex justify-end gap-4 p-6 bg-[hsl(var(--color-background))] rounded-b-2xl">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-6 rounded-lg">إلغاء</button>
                        <button type="submit" disabled={isUploading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">
                            {isUploading ? 'جاري الحفظ...' : (formData.status === 'draft' ? '📝 حفظ كمسودة' : '💾 نشر')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface TripBookingsModalProps { isOpen: boolean; onClose: () => void; trip: Trip | null; students: User[]; bookings: Booking[]; }
const TripBookingsModal: React.FC<TripBookingsModalProps> = ({ isOpen, onClose, trip, students, bookings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const bookedStudents = useMemo(() => {
        if (!trip || !bookings) return [];
        const tripBookings = bookings.filter(b => b.service_type === 'رحلة' && b.service_id === trip.id);
        return tripBookings
            .map(booking => students.find(s => s.id === booking.student_id))
            .filter((s): s is User => s !== undefined);
    }, [trip, students, bookings]);

    const filteredStudents = useMemo(() => 
        bookedStudents.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.id.toLowerCase().includes(searchTerm.toLowerCase())
        ), [bookedStudents, searchTerm]);

    if (!isOpen || !trip) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16 sm:items-center sm:pt-4" onClick={onClose}>
            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-3xl border border-[hsl(var(--color-border))] animate-fade-in-up flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold p-6 border-b border-[hsl(var(--color-border))]">👥 الطلاب المحجوزين في: {trip.title}</h2>
                <div className="p-4 border-b border-[hsl(var(--color-border))]">
                    <input 
                        type="text" 
                        placeholder="🔍 ابحث بالاسم أو ID الطالب..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full p-3 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]" 
                    />
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {filteredStudents.length > 0 ? (
                        <table className="w-full text-right">
                            <thead className="border-b-2 border-[hsl(var(--color-border))]">
                                <tr>
                                    <th className="p-3 font-bold text-[hsl(var(--color-text-primary))]">ID الطالب</th>
                                    <th className="p-3 font-bold text-[hsl(var(--color-text-primary))]">الاسم</th>
                                    <th className="p-3 font-bold text-[hsl(var(--color-text-primary))]">الصف الدراسي</th>
                                    <th className="p-3 font-bold text-[hsl(var(--color-text-primary))]">حالة الحجز</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="border-b border-[hsl(var(--color-border))] last:border-b-0">
                                        <td className="p-3 font-mono text-sm">{student.id}</td>
                                        <td className="p-3 font-medium">{student.name}</td>
                                        <td className="p-3 text-[hsl(var(--color-text-secondary))]">{student.grade}</td>
                                        <td className="p-3"><span className="bg-green-500/10 text-green-700 dark:text-green-300 font-semibold px-2 py-1 rounded-full text-xs">مؤكد</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-[hsl(var(--color-text-secondary))] py-8">لا يوجد طلاب مطابقين للبحث أو لا توجد حجوزات بعد.</p>
                    )}
                </div>
                 <div className="p-4 flex justify-end gap-4 bg-[hsl(var(--color-background))] rounded-b-2xl">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-6 rounded-lg">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

interface StudentFormModalProps { isOpen: boolean; onClose: () => void; onSave: (student: User) => void; studentToEdit: User | null; }
const emptyStudent: Omit<User, 'id' | 'role' | 'profile_picture_url'> = { name: '', email: '', phone: '', guardian_phone: '', school: '', grade: '', dob: '', section: 'عام' };
const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, onClose, onSave, studentToEdit }) => {
    const [formData, setFormData] = useState(emptyStudent);
    useEffect(() => { if (isOpen) setFormData(studentToEdit ? { ...emptyStudent, ...studentToEdit } : emptyStudent); }, [studentToEdit, isOpen]);
    const handleChange = (e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        if (!studentToEdit) return; // Should not be called for new students from UI
        onSave({ ...formData, id: studentToEdit.id, role: 'student' }); 
        onClose(); 
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16 sm:items-center sm:pt-4" onClick={onClose}>
            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-2xl border border-[hsl(var(--color-border))] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold p-6 border-b border-[hsl(var(--color-border))]">✏️ تعديل بيانات طالب</h2>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <InputField label="الاسم الكامل" name="name" value={formData.name} onChange={handleChange} required />
                        <InputField label="الصف الدراسي" name="grade" value={formData.grade} onChange={handleChange} required />
                        <InputField label="المدرسة" name="school" value={formData.school} onChange={handleChange} />
                        <InputField type="date" label="تاريخ الميلاد" name="dob" value={formData.dob || ''} onChange={handleChange} />
                        <InputField as="select" label="الشعبة" name="section" value={formData.section || 'عام'} onChange={handleChange} options={[
                            {value: 'عام', label: 'عام'},
                            {value: 'علمي علوم', label: 'علمي علوم'},
                            {value: 'علمي رياضة', label: 'علمي رياضة'},
                            {value: 'أدبي', label: 'أدبي'},
                        ]} />
                        <InputField label="رقم الهاتف" name="phone" value={formData.phone} onChange={handleChange} required />
                        <InputField label="رقم ولي الأمر" name="guardian_phone" value={formData.guardian_phone} onChange={handleChange} />
                        <InputField type="email" label="البريد الإلكتروني" name="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="flex justify-end gap-4 p-6 bg-[hsl(var(--color-background))] rounded-b-2xl">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-6 rounded-lg">إلغاء</button>
                        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg">💾 حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Site Settings Tab ---
function SiteSettingsTab() {
    const [settings, setSettings] = useState<Partial<SiteSettings>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const data = await getSiteSettings();
            if (data) {
                setSettings(data);
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            social_links: {
                ...(prev.social_links || {}),
                [name]: value,
            }
        }));
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        const settingsToSave: Partial<SiteSettings> = {
            id: settings.id,
            key: settings.key,
            site_name: settings.site_name,
            seo_title: settings.seo_title,
            seo_description: settings.seo_description,
            social_links: settings.social_links
        };

        let faviconPath = getPathFromUrl(settings.favicon_url);

        if (faviconFile) {
            const path = await uploadFile('site_assets', faviconFile);
            if (path) {
                faviconPath = path;
            } else {
                setSaving(false);
                return;
            }
        }
        
        settingsToSave.favicon_url = faviconPath;

        const savedSettings = await saveSettingsToDb(settingsToSave);
        if (savedSettings) {
            setSettings(savedSettings);
            alert('تم حفظ الإعدادات بنجاح!');
            // Update the actual favicon in the document head for immediate effect
            if (savedSettings.favicon_url) {
                let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.getElementsByTagName('head')[0].appendChild(link);
                }
                link.href = savedSettings.favicon_url;
            }
        }
        setSaving(false);
    };

    if (loading) return <div className="flex items-center justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--color-primary))]"></div></div>;

    const socialPlatforms = [
        { name: 'twitter', label: 'Twitter', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733a4.67 4.67 0 002.048-2.578a9.3 9.3 0 01-2.958 1.13a4.66 4.66 0 00-7.938 4.25a13.229 13.229 0 01-9.602-4.868c-.337.58-.53 1.25-.53 1.968a4.658 4.658 0 002.065 3.877a4.66 4.66 0 01-2.105-.579v.06a4.66 4.66 0 003.738 4.566a4.678 4.678 0 01-2.1.08a4.66 4.66 0 004.352 3.234a9.348 9.348 0 01-5.786 1.995a9.5 9.5 0 01-1.112-.065a13.175 13.175 0 007.14 2.094c8.57 0 13.255-7.098 13.255-13.254c0-.202-.005-.403-.014-.602a9.454 9.454 0 002.323-2.41z"></path></svg> },
        { name: 'facebook', label: 'Facebook', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5.52 4.5 10.02 10 10.02c5.5 0 10-4.5 10-10.02c0-5.53-4.5-10.02-10-10.02zm3.5 10.32l-.89 3.49h-2.5v-6.32H9.3v-2.8h2.81v-1.93c0-2.31 1.15-3.7 3.59-3.7h2.05v2.8h-1.44c-1.22 0-1.28.6-1.28 1.25v1.59h2.78l-.34 2.8z"></path></svg> },
        { name: 'instagram', label: 'Instagram', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2c2.717 0 3.056.01 4.122.06c1.065.05 1.79.217 2.428.465c.66.254 1.216.598 1.772 1.153c.556.556.9 1.112 1.153 1.772c.248.637.415 1.363.465 2.428c.047 1.066.06 1.405.06 4.122c0 2.717-.01 3.056-.06 4.122c-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772a4.927 4.927 0 01-1.772 1.153c-.637.248-1.363.415-2.428.465c-1.066.047-1.405.06-4.122.06s-3.056-.01-4.122-.06c-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153a4.927 4.927 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12s.01-3.056.06-4.122c.05-1.065.218-1.79.465-2.428a4.883 4.883 0 011.153-1.772A4.89 4.89 0 017.398 2.52c.637-.248 1.363.415 2.428.465C10.944 2.013 11.283 2 12 2zm0 1.802c-2.67 0-2.987.01-4.043.058c-.975.045-1.505.207-1.854.344a2.973 2.973 0 00-1.088.791a2.994 2.994 0 00-.79 1.088c-.137.349-.3.88-.344 1.854c-.048 1.056-.058 1.373-.058 4.043s.01 2.987.058 4.043c.045.975.207 1.505.344 1.854a2.973 2.973 0 00.791 1.088a2.994 2.994 0 001.088.79c.349.137.88.3 1.854.344c1.056.048 1.373.058 4.043.058s2.987-.01 4.043-.058c.975-.045 1.505-.207 1.854-.344a2.973 2.973 0 001.088-.79a2.994 2.994 0 00.79-1.088c.137-.349.3-.88.344-1.854c.048-1.056.058-1.373.058-4.043s-.01-2.987-.058-4.043c-.045-.975-.207-1.505-.344-1.854a2.973 2.973 0 00-.79-1.088a2.994 2.994 0 00-1.088-.79c-.349-.137-.88-.3-1.854-.344C15.013 3.812 14.67 3.802 12 3.802zM12 6.865a5.135 5.135 0 100 10.27a5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666a3.333 3.333 0 010 6.666zm5.338-9.87a1.2 1.2 0 100 2.4a1.2 1.2 0 000-2.4z"></path></svg> },
        { name: 'youtube', label: 'YouTube', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M21.582 7.042c-.225-1.545-1.52-2.73-3.07-2.91C16.52 4 12 4 12 4s-4.52 0-6.512.132c-1.55.18-2.845 1.365-3.07 2.91C2.19 8.528 2 10.16 2 12s.19 3.472.418 4.958c.225 1.545 1.52 2.73 3.07 2.91C7.48 20 12 20 12 20s4.52 0 6.512-.132c1.55-.18 2.845-1.365 3.07-2.91C21.81 15.472 22 13.84 22 12s-.19-3.472-.418-4.958zM9.75 15.5V8.5l6 3.5-6 3.5z"></path></svg> },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-[hsl(var(--color-background))] p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-[hsl(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002L3.407 6.342m5.277 6.999L3.407 17.658M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <h3 className="text-xl font-bold">روابط التواصل الاجتماعي</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socialPlatforms.map(p => (
                         <div key={p.name} className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">{p.icon}</span>
                            <input
                                type="url" name={p.name} placeholder={p.label}
                                value={settings.social_links?.[p.name as keyof typeof settings.social_links] || ''} onChange={handleSocialChange}
                                className="w-full pl-10 pr-3 py-2 rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] shadow-sm focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-[hsl(var(--color-background))] p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <svg className="w-6 h-6 text-[hsl(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <h3 className="text-xl font-bold">شعار الموقع (Favicon)</h3>
                    </div>
                     <label className="cursor-pointer block border-2 border-dashed border-[hsl(var(--color-border))] rounded-xl p-8 text-center hover:border-[hsl(var(--color-primary))] transition-colors">
                        <input type="file" accept="image/png, image/jpeg, image/x-icon, image/svg+xml" className="hidden" onChange={(e) => setFaviconFile(e.target.files ? e.target.files[0] : null)} />
                        <div className="flex flex-col items-center text-[hsl(var(--color-text-secondary))]">
                            <svg className="w-12 h-12 text-[hsl(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <p className="mt-2 font-semibold text-lg">{faviconFile ? faviconFile.name : 'اضغط لرفع الملف'}</p>
                            <p className="text-sm">الحد الأقصى: 8 ميجابايت</p>
                            {(settings.favicon_url || faviconFile) && <img src={faviconFile ? URL.createObjectURL(faviconFile) : settings.favicon_url} alt="Favicon Preview" className="mt-4 h-12 w-12"/>}
                        </div>
                    </label>
                </div>
                 <div className="bg-[hsl(var(--color-background))] p-6 rounded-2xl">
                     <div className="flex items-center gap-3 mb-4">
                         <svg className="w-6 h-6 text-[hsl(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                         <h3 className="text-xl font-bold">إعدادات الموقع و SEO</h3>
                    </div>
                    <div className="space-y-4">
                         <InputField label="اسم الموقع" name="site_name" value={settings.site_name || ''} onChange={handleInputChange} />
                         <InputField label="SEO عنوان" name="seo_title" value={settings.seo_title || ''} onChange={handleInputChange} />
                         <InputField as="textarea" label="SEO وصف" name="seo_description" value={settings.seo_description || ''} onChange={handleInputChange} rows={3} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-6">
                <button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all disabled:bg-gray-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>
            </div>
        </div>
    );
}


// --- Admin Dashboard Page ---
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-[hsl(var(--color-background))] p-6 rounded-2xl flex items-center gap-4">
        <div className="bg-[hsl(var(--color-primary))] text-white p-3 rounded-full">{icon}</div>
        <div><p className="text-3xl font-bold">{value}</p><p className="text-[hsl(var(--color-text-secondary))]">{title}</p></div>
    </div>
);

const InfoItem: React.FC<{label: string, value: string}> = ({label, value}) => (
    <div>
        <p className="text-sm text-[hsl(var(--color-text-secondary))]">{label}</p>
        <p className="font-semibold text-[hsl(var(--color-text-primary))]">{value}</p>
    </div>
);


interface AdminDashboardPageProps {
    teachers: Teacher[]; onSaveTeacher: (teacher: Teacher) => void; onDeleteTeacher: (id: string) => void;
    lessons: Lesson[]; onSaveLesson: (lesson: Lesson) => void; onDeleteLesson: (id: string) => void;
    trips: Trip[]; onSaveTrip: (trip: Trip) => void; onDeleteTrip: (id: string) => void;
    posts: Post[]; onSavePost: (post: Post) => void; onDeletePost: (postId: string) => void; onTogglePinPost: (postId: string) => void;
    bookings: Booking[]; onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
    students: User[]; onSaveStudent: (student: User) => void; onDeleteStudent: (id: string) => void;
    addToast: (type: ToastType, title: string, message: string) => void;
}

type AdminTab = 'stats' | 'lessons' | 'trips' | 'teachers' | 'posts' | 'students' | 'bookings' | 'site_settings';

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ 
    teachers, onSaveTeacher, onDeleteTeacher, 
    lessons, onSaveLesson, onDeleteLesson,
    trips, onSaveTrip, onDeleteTrip,
    posts, onSavePost, onDeletePost, onTogglePinPost, 
    bookings, onUpdateBookingStatus, 
    students, onSaveStudent, onDeleteStudent,
    addToast
}) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('stats');
    
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);
    const [isTripModalOpen, setIsTripModalOpen] = useState(false);
    const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [postToEdit, setPostToEdit] = useState<Post | null>(null);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<User | null>(null);
    const [viewingBookingsTrip, setViewingBookingsTrip] = useState<Trip | null>(null);
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [searchedStudents, setSearchedStudents] = useState<User[] | null>(null);
    
    const stats = useMemo(() => ({
        lessonCount: lessons.length, tripCount: trips.length, studentCount: students.length, teacherCount: teachers.length, postCount: posts.length, bookingCount: bookings.length,
    }), [lessons, trips, students, teachers, posts, bookings]);
    
    const handleStudentSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const term = studentSearchTerm.trim().toLowerCase();
        if (!term) {
            setSearchedStudents(null);
            return;
        }
        const found = students.filter(s => 
            s.id.toLowerCase().includes(term) || 
            s.name.toLowerCase().includes(term)
        );
        setSearchedStudents(found);
    };

    const handleSavePostModal = (post: Post) => {
        onSavePost(post);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'stats': return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title="إجمالي الطلاب" value={stats.studentCount} icon={<UsersIcon />} />
                    <StatCard title="إجمالي الحجوزات" value={stats.bookingCount} icon={<TicketIcon />} />
                    <StatCard title="إجمالي الحصص" value={stats.lessonCount} icon={<CalendarIcon />} />
                    <StatCard title="إجمالي المدرسين" value={stats.teacherCount} icon={<AcademicCapIcon />} />
                    <StatCard title="إجمالي الرحلات" value={stats.tripCount} icon={<TruckIcon />} />
                    <StatCard title="إجمالي المنشورات" value={stats.postCount} icon={<NewspaperIcon />} />
                </div>
            );
            case 'bookings':
                const sortedBookings = [...bookings].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4">🎫 إدارة الحجوزات ({bookings.length})</h3>
                        <div className="overflow-x-auto bg-[hsl(var(--color-background))] p-4 rounded-lg">
                            <table className="w-full text-right whitespace-nowrap text-sm sm:text-base">
                                <thead className="border-b-2 border-[hsl(var(--color-border))]">
                                    <tr>
                                        {['ID الحجز', 'الطالب', 'الخدمة', 'التاريخ والوقت', 'الحالة'].map(h => <th key={h} className="p-3 font-bold text-lg text-[hsl(var(--color-text-primary))]">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedBookings.map(booking => (
                                        <tr key={booking.id} className="border-b border-[hsl(var(--color-border))] last:border-b-0">
                                            <td className="p-3 font-mono text-xs">{booking.id}</td>
                                            <td className="p-3 font-medium">{booking.student_name}</td>
                                            <td className="p-3">{booking.service_name}</td>
                                            <td className="p-3 text-sm">{booking.date} - {booking.time}</td>
                                            <td className="p-3">
                                                <select 
                                                    value={booking.status} 
                                                    onChange={(e) => onUpdateBookingStatus(booking.id, e.target.value as Booking['status'])}
                                                    className={`p-2 rounded-lg text-sm font-semibold border-2 outline-none transition-colors bg-transparent ${
                                                        booking.status === 'مؤكد' ? 'border-green-500 text-green-600' :
                                                        booking.status === 'ملغي' ? 'border-red-500 text-red-600' :
                                                        booking.status === 'قيد المراجعة' ? 'border-yellow-500 text-yellow-600' :
                                                        'border-gray-500 text-gray-600'
                                                    }`}
                                                >
                                                    <option value="قيد المراجعة">قيد المراجعة</option>
                                                    <option value="مؤكد">مؤكد</option>
                                                    <option value="ملغي">ملغي</option>
                                                    <option value="منتهي">منتهي</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            case 'posts': return (
                 <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">📝 إدارة المنشورات ({posts.length})</h3>
                        <button type="button" onClick={() => { setPostToEdit(null); setIsPostModalOpen(true); }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon /> إنشاء منشور</button>
                    </div>
                    <div className="space-y-3">
                        {posts.map(post => (
                            <div key={post.id} className={`bg-[hsl(var(--color-background))] p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${post.is_pinned ? 'ring-2 ring-yellow-400' : ''}`}>
                                <div className="flex-grow"><p className="font-bold flex items-center gap-2">
                                     {post.is_pinned && <StarIcon className="w-5 h-5 text-yellow-400" solid />}
                                     {post.title}
                                     {post.status === 'draft' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full ml-2">مسودة</span>}
                                </p><p className="text-sm text-[hsl(var(--color-text-secondary))]">{post.author} - {post.timestamp ? new Date(post.timestamp).toLocaleString('ar-EG') : ''}</p></div>
                                <div className="flex gap-2 self-end sm:self-center">
                                    <button type="button" onClick={() => onTogglePinPost(post.id)} className="p-2 hover:bg-yellow-500/10 rounded-md" aria-label={post.is_pinned ? "إلغاء تثبيت المنشور" : "تثبيت المنشور"}>
                                        <StarIcon className={`w-5 h-5 ${post.is_pinned ? 'text-yellow-400' : 'text-gray-400'}`} solid={post.is_pinned} />
                                    </button>
                                    <button type="button" onClick={() => { setPostToEdit(post); setIsPostModalOpen(true); }} className="p-2 hover:bg-blue-500/10 rounded-md" aria-label="تعديل المنشور"><PencilIcon /></button>
                                    <button type="button" onClick={() => onDeletePost(post.id)} className="p-2 hover:bg-red-500/10 rounded-md" aria-label="حذف المنشور"><TrashIcon /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
            case 'trips': return (
                 <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">🚌 إدارة الرحلات ({trips.length})</h3>
                        <button type="button" onClick={() => { setTripToEdit(null); setIsTripModalOpen(true); }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon /> إضافة رحلة</button>
                    </div>
                    <div className="space-y-3">
                        {trips.map(trip => (
                            <div key={trip.id} className="bg-[hsl(var(--color-background))] p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex-grow"><p className="font-bold">{trip.title}</p><p className="text-sm text-[hsl(var(--color-text-secondary))]">{trip.date ? new Date(trip.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : 'غير محدد'}</p></div>
                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                    <span className="text-sm font-semibold">الحجوزات: {trip.booked_count}/{trip.capacity}</span>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setViewingBookingsTrip(trip)} className="p-2 hover:bg-purple-500/10 rounded-md" aria-label="عرض الحجوزات"><UsersIcon className="w-5 h-5 text-purple-500" /></button>
                                        <button type="button" onClick={() => { setTripToEdit(trip); setIsTripModalOpen(true); }} className="p-2 hover:bg-blue-500/10 rounded-md" aria-label="تعديل الرحلة"><PencilIcon /></button>
                                        <button type="button" onClick={() => onDeleteTrip(trip.id)} className="p-2 hover:bg-red-500/10 rounded-md" aria-label="حذف الرحلة"><TrashIcon /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
            case 'teachers': return (
                <TeachersManager
                    teachers={teachers}
                    onSaveTeacher={onSaveTeacher}
                    onDeleteTeacher={onDeleteTeacher}
                    addToast={addToast}
                />
            );
            case 'lessons': return (
                 <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">📚 إدارة الحصص ({lessons.length})</h3>
                        <button type="button" onClick={() => { setLessonToEdit(null); setIsLessonModalOpen(true); }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon /> إضافة حصة</button>
                    </div>
                     <div className="space-y-3">
                        {lessons.map(l => (
                            <div key={l.id} className="bg-[hsl(var(--color-background))] p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex-grow">
                                    <p className="font-bold">{l.subject} - {l.grade}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <p className="text-sm text-[hsl(var(--color-text-secondary))]">{l.teacher} - {l.day} {l.time}</p>
                                        {l.booking_required === false ? (
                                            <span className="text-xs font-semibold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 px-2 py-0.5 rounded-full">بدون حجز</span>
                                        ) : (
                                            <span className="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 rounded-full">بحجز</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 self-end sm:self-center">
                                    <button type="button" onClick={() => { setLessonToEdit(l); setIsLessonModalOpen(true); }} className="p-2 hover:bg-blue-500/10 rounded-md" aria-label="تعديل الحصة"><PencilIcon /></button>
                                    <button type="button" onClick={() => onDeleteLesson(l.id)} className="p-2 hover:bg-red-500/10 rounded-md" aria-label="حذف الحصة"><TrashIcon /></button>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            );
            case 'students': return (
                 <div>
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h3 className="text-xl font-bold">🎓 إدارة الطلاب</h3>
                    </div>
                    <form onSubmit={handleStudentSearch} className="flex gap-2 mb-6">
                        <input 
                            type="text" 
                            placeholder="🔍 ابحث بالاسم أو ID الطالب..." 
                            value={studentSearchTerm} 
                            onChange={(e) => setStudentSearchTerm(e.target.value)} 
                            className="w-full p-3 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]" 
                        />
                        <button type="submit" className="bg-[hsl(var(--color-primary))] hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg">بحث</button>
                    </form>
                    
                    {searchedStudents === null ? (
                        <div className="text-center py-10 bg-[hsl(var(--color-background))] rounded-lg">
                            <p className="font-semibold text-lg text-[hsl(var(--color-text-secondary))]">أدخل اسم الطالب أو ID في الحقل أعلاه لعرض بياناته.</p>
                        </div>
                    ) : searchedStudents.length === 0 ? (
                        <div className="text-center py-10 bg-[hsl(var(--color-background))] rounded-lg">
                            <p className="font-bold text-lg">⚠️ لا يوجد طلاب مطابقون للبحث.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                             <h4 className="text-lg font-bold">نتائج البحث ({searchedStudents.length})</h4>
                            {searchedStudents.map(student => (
                               <div key={student.id} className="bg-[hsl(var(--color-background))] p-4 rounded-lg shadow-md">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                        <div className="flex-grow">
                                            <h4 className="text-xl font-bold text-[hsl(var(--color-text-primary))]">{student.name}</h4>
                                            <p className="font-mono text-sm text-[hsl(var(--color-text-secondary))] bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md inline-block my-1">{student.id}</p>
                                        </div>
                                        <div className="flex gap-2 self-end sm:self-center">
                                            <button type="button" onClick={() => { setStudentToEdit(student); setIsStudentModalOpen(true); }} className="p-2 hover:bg-blue-500/10 rounded-md" aria-label="تعديل الطالب"><PencilIcon /></button>
                                            <button type="button" onClick={() => onDeleteStudent(student.id)} className="p-2 hover:bg-red-500/10 rounded-md" aria-label="حذف الطالب"><TrashIcon /></button>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-[hsl(var(--color-border))] grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                        <InfoItem label="الصف الدراسي" value={student.grade} />
                                        <InfoItem label="المدرسة" value={student.school} />
                                        <InfoItem label="رقم الهاتف" value={student.phone} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
            case 'site_settings': return <SiteSettingsTab />;
            default: return <div>Coming soon...</div>;
        }
    };

    const tabs: { id: AdminTab, label: string }[] = [ 
        { id: 'stats', label: '📊 الإحصائيات' }, 
        { id: 'bookings', label: '🎫 الحجوزات'}, 
        { id: 'posts', label: '📝 المنشورات' }, 
        { id: 'trips', label: '🚌 الرحلات' }, 
        { id: 'lessons', label: '📚 الحصص' }, 
        { id: 'teachers', label: '👨‍🏫 المدرسين' }, 
        { id: 'students', label: '🎓 الطلاب' },
        { id: 'site_settings', label: '⚙️ إعدادات الموقع' }
    ];

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6">⚙️ لوحة تحكم المالك</h1>
            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))]">
                <div className="flex border-b border-[hsl(var(--color-border))] overflow-x-auto">
                    {tabs.map(tab => ( <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-[hsl(var(--color-primary))] text-[hsl(var(--color-primary))]' : 'text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-primary))]'}`}>{tab.label}</button>))}
                </div>
                <div className="p-6">{renderContent()}</div>
            </div>
            <LessonFormModal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)} onSave={onSaveLesson} lessonToEdit={lessonToEdit} teachers={teachers} />
            <TripFormModal isOpen={isTripModalOpen} onClose={() => setIsTripModalOpen(false)} onSave={onSaveTrip} tripToEdit={tripToEdit} addToast={addToast} />
            <PostFormModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} onSave={handleSavePostModal} postToEdit={postToEdit} addToast={addToast} />
            <StudentFormModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} onSave={onSaveStudent} studentToEdit={studentToEdit} />
            <TripBookingsModal isOpen={!!viewingBookingsTrip} onClose={() => setViewingBookingsTrip(null)} trip={viewingBookingsTrip} students={students} bookings={bookings}/>
        </div>
    );
};

export default AdminDashboardPage;

import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_STUDENTS } from '../constants';
import { Lesson, Trip, Teacher, Post, User, Booking } from '../types';
import { 
    UsersIcon, CalendarIcon, AcademicCapIcon, TruckIcon, 
    NewspaperIcon, PencilIcon, TrashIcon, PlusIcon, TicketIcon 
} from '../components/common/Icons';

type AdminTab = 'stats' | 'lessons' | 'trips' | 'teachers' | 'posts' | 'students' | 'gallery' | 'bookings';

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

// --- MODALS (Lesson, Teacher, Trip, Post, TripBookings) ---

interface LessonFormModalProps { isOpen: boolean; onClose: () => void; onSave: (lesson: Lesson) => void; lessonToEdit: Lesson | null; teachers: Teacher[]; }
const emptyLesson: Omit<Lesson, 'id'> = { day: 'الأحد', subject: '', teacher: '', time: '', hall: '', grade: '', notes: '', capacity: 50, bookedCount: 0 };
const LessonFormModal: React.FC<LessonFormModalProps> = ({ isOpen, onClose, onSave, lessonToEdit, teachers }) => {
    const [formData, setFormData] = useState(emptyLesson);
    useEffect(() => { if (isOpen) setFormData(lessonToEdit ? { ...emptyLesson, ...lessonToEdit } : emptyLesson); }, [lessonToEdit, isOpen]);
    const handleChange = (e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, [e.target.name]: e.target.type === 'number' ? parseInt(e.target.value) : e.target.value }));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ id: lessonToEdit ? lessonToEdit.id : `l_${Date.now()}`, ...formData }); onClose(); };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
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

interface TeacherFormModalProps { isOpen: boolean; onClose: () => void; onSave: (teacher: Teacher) => void; teacherToEdit: Teacher | null; }
const emptyTeacher: Omit<Teacher, 'id'> = { name: '', subject: '', bio: '', phone: '', email: '', grades: '', imageUrl: '' };
const TeacherFormModal: React.FC<TeacherFormModalProps> = ({ isOpen, onClose, onSave, teacherToEdit }) => {
    const [formData, setFormData] = useState(emptyTeacher);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

    useEffect(() => { 
        if (isOpen) {
            setFormData(teacherToEdit ? { ...emptyTeacher, ...teacherToEdit } : emptyTeacher);
            setSelectedImageFile(null);
        }
    }, [teacherToEdit, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    
    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        let finalImageUrl = teacherToEdit?.imageUrl || '';
        if (selectedImageFile) {
            finalImageUrl = URL.createObjectURL(selectedImageFile);
        } else if (!teacherToEdit) { // If creating new teacher and no file selected
            finalImageUrl = `https://picsum.photos/seed/${Date.now()}/200`;
        }
        onSave({ ...emptyTeacher, ...formData, id: teacherToEdit ? teacherToEdit.id : `t_${Date.now()}`, imageUrl: finalImageUrl }); 
        onClose(); 
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-2xl border border-[hsl(var(--color-border))] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold p-6 border-b border-[hsl(var(--color-border))]">{teacherToEdit ? '✏️ تعديل بيانات مدرس' : '➕ إضافة مدرس جديد'}</h2>
                <form onSubmit={handleSubmit} >
                     <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <InputField label="الاسم بالكامل" name="name" value={formData.name} onChange={handleChange} required />
                        <InputField label="المادة" name="subject" value={formData.subject} onChange={handleChange} required />
                        <InputField label="رقم الهاتف" name="phone" value={formData.phone || ''} onChange={handleChange} />
                        <InputField label="البريد الإلكتروني" name="email" value={formData.email || ''} onChange={handleChange} type="email" />
                        <InputField label="الصفوف الدراسية" name="grades" value={formData.grades || ''} onChange={handleChange} placeholder="مثال: أولى وثانية ثانوي" />
                         <div>
                            <label className="block text-sm font-medium mb-1">الصورة الشخصية</label>
                            <input type="file" accept="image/*" onChange={(e) => setSelectedImageFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-[hsl(var(--color-text-secondary))] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[hsl(var(--color-primary))] file:text-white hover:file:opacity-90 cursor-pointer"/>
                            {(formData.imageUrl || selectedImageFile) && (
                                <img src={selectedImageFile ? URL.createObjectURL(selectedImageFile) : formData.imageUrl} alt="Preview" className="mt-2 w-24 h-24 rounded-full object-cover"/>
                            )}
                        </div>
                        <div className="md:col-span-2"><InputField as="textarea" label="نبذة تعريفية" name="bio" value={formData.bio} onChange={handleChange} /></div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4 p-6 bg-[hsl(var(--color-background))] rounded-b-2xl">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-6 rounded-lg">إلغاء</button>
                        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg">💾 حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface TripFormModalProps { isOpen: boolean; onClose: () => void; onSave: (trip: Trip) => void; tripToEdit: Trip | null; }
const emptyTrip: Omit<Trip, 'id'> = { title: '', description: '', date: '', time: '', meetingPoint: '', capacity: 50, bookedCount: 0, cost: 0, imageUrls: [] };
const TripFormModal: React.FC<TripFormModalProps> = ({ isOpen, onClose, onSave, tripToEdit }) => {
    const [formData, setFormData] = useState(emptyTrip);
    const [selectedImageFiles, setSelectedImageFiles] = useState<FileList | null>(null);

    useEffect(() => { 
        if (isOpen) {
            setFormData(tripToEdit ? { ...emptyTrip, ...tripToEdit } : emptyTrip);
            setSelectedImageFiles(null);
        }
    }, [tripToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, [e.target.name]: e.target.type === 'number' ? parseInt(e.target.value) : e.target.value }));
    
    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        let finalImageUrls = tripToEdit?.imageUrls || [];
        if (selectedImageFiles && selectedImageFiles.length > 0) {
            finalImageUrls = Array.from(selectedImageFiles).map(file => URL.createObjectURL(file));
        } else if (!tripToEdit && finalImageUrls.length === 0) {
            finalImageUrls = [`https://picsum.photos/seed/${formData.title.replace(/\s/g, '')}/400/300`];
        }
        onSave({ ...formData, imageUrls: finalImageUrls, id: tripToEdit ? tripToEdit.id : `trip_${Date.now()}` }); 
        onClose(); 
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-2xl border border-[hsl(var(--color-border))] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                 <h2 className="text-2xl font-bold p-6 border-b border-[hsl(var(--color-border))]">{tripToEdit ? '✏️ تعديل رحلة' : '➕ إضافة رحلة جديدة'}</h2>
                 <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <div className="md:col-span-2"><InputField label="عنوان الرحلة" name="title" value={formData.title} onChange={handleChange} required /></div>
                        <InputField label="التاريخ" name="date" value={formData.date} onChange={handleChange} required placeholder="25 ديسمبر 2024" />
                        <InputField label="الوقت" name="time" value={formData.time} onChange={handleChange} required placeholder="8:00 ص - 6:00 م"/>
                        <InputField label="مكان التجمع" name="meetingPoint" value={formData.meetingPoint} onChange={handleChange} required />
                        <InputField type="number" label="عدد المقاعد" name="capacity" value={formData.capacity} onChange={handleChange} />
                        <InputField type="number" label="التكلفة (ج.م)" name="cost" value={formData.cost || 0} onChange={handleChange} />
                        <div className="md:col-span-2"><InputField as="textarea" label="وصف الرحلة" name="description" value={formData.description} onChange={handleChange} /></div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">صور الرحلة (يمكن اختيار أكثر من صورة)</label>
                            <input type="file" multiple accept="image/*" onChange={(e) => setSelectedImageFiles(e.target.files)} className="mt-1 block w-full text-sm text-[hsl(var(--color-text-secondary))] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[hsl(var(--color-primary))] file:text-white hover:file:opacity-90 cursor-pointer"/>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(selectedImageFiles ? Array.from(selectedImageFiles) : []).map((file, index) => (
                                    <img key={index} src={URL.createObjectURL(file)} alt="Preview" className="w-20 h-20 rounded-md object-cover"/>
                                ))}
                                {!selectedImageFiles && formData.imageUrls.map((url, index) => (
                                     <img key={index} src={url} alt="Existing" className="w-20 h-20 rounded-md object-cover"/>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4 p-6 bg-[hsl(var(--color-background))] rounded-b-2xl">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-6 rounded-lg">إلغاء</button>
                        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg">💾 حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface PostFormModalProps { isOpen: boolean; onClose: () => void; onSave: (post: Post) => void; postToEdit: Post | null; }
const emptyPost: Omit<Post, 'id' | 'timestamp'> = { title: '', content: '', author: 'إدارة السنتر', status: 'published', imageUrls: [] };
const PostFormModal: React.FC<PostFormModalProps> = ({ isOpen, onClose, onSave, postToEdit }) => {
    const [formData, setFormData] = useState(emptyPost);
    const [selectedImageFiles, setSelectedImageFiles] = useState<FileList | null>(null);

    useEffect(() => { 
        if (isOpen) {
            setFormData(postToEdit ? { ...emptyPost, ...postToEdit } : emptyPost);
            setSelectedImageFiles(null);
        }
    }, [postToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        let finalImageUrls = postToEdit?.imageUrls || [];
        if (selectedImageFiles && selectedImageFiles.length > 0) {
            finalImageUrls = Array.from(selectedImageFiles).map(file => URL.createObjectURL(file));
        }
        onSave({ ...formData, imageUrls: finalImageUrls, id: postToEdit ? postToEdit.id : `post_${Date.now()}`, timestamp: `منذ لحظات` }); 
        onClose(); 
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
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
                                {(selectedImageFiles ? Array.from(selectedImageFiles) : []).map((file, index) => (
                                    <img key={index} src={URL.createObjectURL(file)} alt="Preview" className="w-20 h-20 rounded-md object-cover"/>
                                ))}
                                {!selectedImageFiles && formData.imageUrls?.map((url, index) => (
                                     <img key={index} src={url} alt="Existing" className="w-20 h-20 rounded-md object-cover"/>
                                ))}
                            </div>
                        </div>
                        <InputField as="select" label="الحالة" name="status" value={formData.status} onChange={handleChange} options={[{value: 'published', label: 'نشر فوري'}, {value: 'draft', label: 'حفظ كمسودة'}]}/>
                    </div>
                    <div className="flex justify-end gap-4 p-6 bg-[hsl(var(--color-background))] rounded-b-2xl">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-6 rounded-lg">إلغاء</button>
                        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg">{formData.status === 'draft' ? '📝 حفظ كمسودة' : '💾 نشر'} </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface TripBookingsModalProps { isOpen: boolean; onClose: () => void; trip: Trip | null; students: User[]; }
const TripBookingsModal: React.FC<TripBookingsModalProps> = ({ isOpen, onClose, trip, students }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // In a real app, you would have a list of actual bookings. Here we simulate it.
    const bookedStudents = useMemo(() => {
        if (!trip) return [];
        // Simulate bookings by taking a slice of mock students based on bookedCount
        return students.slice(0, trip.bookedCount);
    }, [trip, students]);

    const filteredStudents = useMemo(() => 
        bookedStudents.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.id.toLowerCase().includes(searchTerm.toLowerCase())
        ), [bookedStudents, searchTerm]);

    if (!isOpen || !trip) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
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
const emptyStudent: Omit<User, 'id' | 'role' | 'profilePicture'> = { name: '', email: '', phone: '', guardianPhone: '', school: '', grade: '', dob: '', section: 'عام' };
const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, onClose, onSave, studentToEdit }) => {
    const [formData, setFormData] = useState(emptyStudent);
    useEffect(() => { if (isOpen) setFormData(studentToEdit ? { ...emptyStudent, ...studentToEdit } : emptyStudent); }, [studentToEdit, isOpen]);
    const handleChange = (e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        const nextStudentIdNumber = MOCK_STUDENTS.length + Date.now(); // Simplified for mock data
        const newId = `STU-2024-${String(nextStudentIdNumber).slice(-4)}`;
        onSave({
            ...formData, 
            id: studentToEdit ? studentToEdit.id : newId,
            role: 'student',
        }); 
        onClose(); 
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-2xl border border-[hsl(var(--color-border))] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold p-6 border-b border-[hsl(var(--color-border))]">{studentToEdit ? '✏️ تعديل بيانات طالب' : '➕ إضافة طالب جديد'}</h2>
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
                        <InputField label="رقم ولي الأمر" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} />
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
    teachers: Teacher[]; setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
    lessons: Lesson[]; setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
    trips: Trip[]; setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
    posts: Post[]; setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
    bookings: Booking[];
    onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ teachers, setTeachers, lessons, setLessons, trips, setTrips, posts, setPosts, bookings, onUpdateBookingStatus }) => {
    const [students, setStudents] = useState<User[]>(MOCK_STUDENTS);
    const [activeTab, setActiveTab] = useState<AdminTab>('stats');
    
    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);
    const [isTripModalOpen, setIsTripModalOpen] = useState(false);
    const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [postToEdit, setPostToEdit] = useState<Post | null>(null);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<User | null>(null);
    const [viewingBookingsTrip, setViewingBookingsTrip] = useState<Trip | null>(null);
    const [studentSearchId, setStudentSearchId] = useState('');
    const [searchedStudent, setSearchedStudent] = useState<User | null | 'not_found'>(null);
    
    const stats = useMemo(() => ({
        lessonCount: lessons.length, tripCount: trips.length, studentCount: students.length, teacherCount: teachers.length, postCount: posts.length, bookingCount: bookings.length,
    }), [lessons, trips, students, teachers, posts, bookings]);
    
    const handleStudentSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentSearchId.trim()) {
            setSearchedStudent(null);
            return;
        }
        const found = students.find(s => s.id.toLowerCase() === studentSearchId.toLowerCase().trim());
        setSearchedStudent(found || 'not_found');
    };

    const handleSave = <T extends {id: string}>(item: T, setFn: React.Dispatch<React.SetStateAction<T[]>>, itemToEdit: T | null) => {
        setFn(prev => itemToEdit ? prev.map(i => i.id === item.id ? item : i) : [item, ...prev]);
        if ('role' in item && item.role === 'student') { // Special handling for students to clear search
            setSearchedStudent(item as unknown as User);
        }
    };
    const handleDelete = <T extends {id: string}>(id: string, setFn: React.Dispatch<React.SetStateAction<T[]>>) => {
        if (confirm(`هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.`)) {
            setFn(prev => prev.filter(i => i.id !== id));
            if (activeTab === 'students' && searchedStudent && searchedStudent !== 'not_found' && searchedStudent.id === id) {
                setSearchedStudent(null);
                setStudentSearchId('');
            }
        }
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
                const sortedBookings = [...bookings].sort((a, b) => b.createdAt - a.createdAt);
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4">🎫 إدارة الحجوزات ({bookings.length})</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right whitespace-nowrap">
                                <thead className="border-b-2 border-[hsl(var(--color-border))]">
                                    <tr>
                                        {['ID الحجز', 'الطالب', 'الخدمة', 'التاريخ والوقت', 'الحالة'].map(h => <th key={h} className="p-3 font-bold text-lg text-[hsl(var(--color-text-primary))]">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedBookings.map(booking => (
                                        <tr key={booking.id} className="border-b border-[hsl(var(--color-border))] last:border-b-0">
                                            <td className="p-3 font-mono text-xs">{booking.id}</td>
                                            <td className="p-3 font-medium">{booking.studentName}</td>
                                            <td className="p-3">{booking.serviceName}</td>
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
                        <button onClick={() => { setPostToEdit(null); setIsPostModalOpen(true); }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon /> إنشاء منشور</button>
                    </div>
                    <div className="space-y-2">
                        {posts.map(post => (
                            <div key={post.id} className="bg-[hsl(var(--color-background))] p-3 rounded-lg flex justify-between items-center">
                                <div><p className="font-bold">{post.title} {post.status === 'draft' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full ml-2">مسودة</span>}</p><p className="text-sm text-[hsl(var(--color-text-secondary))]">{post.author} - {post.timestamp}</p></div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setPostToEdit(post); setIsPostModalOpen(true); }} className="p-2 hover:bg-blue-500/10 rounded-md" aria-label="تعديل المنشور"><PencilIcon /></button>
                                    <button onClick={() => handleDelete(post.id, setPosts)} className="p-2 hover:bg-red-500/10 rounded-md" aria-label="حذف المنشور"><TrashIcon /></button>
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
                        <button onClick={() => { setTripToEdit(null); setIsTripModalOpen(true); }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon /> إضافة رحلة</button>
                    </div>
                    <div className="space-y-2">
                        {trips.map(trip => (
                            <div key={trip.id} className="bg-[hsl(var(--color-background))] p-3 rounded-lg flex justify-between items-center flex-wrap">
                                <div className="flex-grow"><p className="font-bold">{trip.title}</p><p className="text-sm text-[hsl(var(--color-text-secondary))]">{trip.date}</p></div>
                                <div className="text-sm font-semibold">الحجوزات: {trip.bookedCount}/{trip.capacity}</div>
                                <div className="flex gap-2 ml-4">
                                    <button onClick={() => setViewingBookingsTrip(trip)} className="p-2 hover:bg-purple-500/10 rounded-md" aria-label="عرض الحجوزات"><UsersIcon className="w-5 h-5 text-purple-500" /></button>
                                    <button onClick={() => { setTripToEdit(trip); setIsTripModalOpen(true); }} className="p-2 hover:bg-blue-500/10 rounded-md" aria-label="تعديل الرحلة"><PencilIcon /></button>
                                    <button onClick={() => handleDelete(trip.id, setTrips)} className="p-2 hover:bg-red-500/10 rounded-md" aria-label="حذف الرحلة"><TrashIcon /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
            case 'teachers': return (
                 <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">👨‍🏫 إدارة المدرسين ({teachers.length})</h3>
                        <button onClick={() => { setTeacherToEdit(null); setIsTeacherModalOpen(true); }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon /> إضافة مدرس</button>
                    </div>
                     <div className="space-y-2">
                        {teachers.map(t => <div key={t.id} className="bg-[hsl(var(--color-background))] p-3 rounded-lg flex justify-between items-center"><div><p className="font-bold">{t.name}</p><p className="text-sm text-[hsl(var(--color-text-secondary))]">{t.subject}</p></div><div className="flex gap-2"><button onClick={() => { setTeacherToEdit(t); setIsTeacherModalOpen(true); }} className="p-2 hover:bg-blue-500/10 rounded-md" aria-label="تعديل المدرس"><PencilIcon /></button><button onClick={() => handleDelete(t.id, setTeachers)} className="p-2 hover:bg-red-500/10 rounded-md" aria-label="حذف المدرس"><TrashIcon /></button></div></div>)}
                    </div>
                </div>
            );
            case 'lessons': return (
                 <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">📚 إدارة الحصص ({lessons.length})</h3>
                        <button onClick={() => { setLessonToEdit(null); setIsLessonModalOpen(true); }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon /> إضافة حصة</button>
                    </div>
                     <div className="space-y-2">
                        {lessons.map(l => <div key={l.id} className="bg-[hsl(var(--color-background))] p-3 rounded-lg flex justify-between items-center"><div><p className="font-bold">{l.subject} - {l.grade}</p><p className="text-sm text-[hsl(var(--color-text-secondary))]">{l.teacher} - {l.day} {l.time}</p></div><div className="flex gap-2"><button onClick={() => { setLessonToEdit(l); setIsLessonModalOpen(true); }} className="p-2 hover:bg-blue-500/10 rounded-md" aria-label="تعديل الحصة"><PencilIcon /></button><button onClick={() => handleDelete(l.id, setLessons)} className="p-2 hover:bg-red-500/10 rounded-md" aria-label="حذف الحصة"><TrashIcon /></button></div></div>)}
                     </div>
                </div>
            );
            case 'students': return (
                 <div>
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h3 className="text-xl font-bold">🎓 إدارة الطلاب</h3>
                        <button onClick={() => { setStudentToEdit(null); setIsStudentModalOpen(true); }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon /> إضافة طالب جديد</button>
                    </div>
                    <form onSubmit={handleStudentSearch} className="flex gap-2 mb-6">
                        <input 
                            type="text" 
                            placeholder="🔍 أدخل ID الطالب للبحث... (مثال: STU-2024-0001)" 
                            value={studentSearchId} 
                            onChange={(e) => setStudentSearchId(e.target.value)} 
                            className="w-full p-3 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]" 
                        />
                        <button type="submit" className="bg-[hsl(var(--color-primary))] hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg">بحث</button>
                    </form>
                    
                    {searchedStudent === 'not_found' ? (
                        <div className="text-center py-10 bg-[hsl(var(--color-background))] rounded-lg">
                            <p className="font-bold text-lg">⚠️ لا يوجد طالب بهذا الـ ID.</p>
                        </div>
                    ) : searchedStudent ? (
                        <div className="bg-[hsl(var(--color-background))] p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-2xl font-bold text-[hsl(var(--color-text-primary))]">{searchedStudent.name}</h4>
                                    <p className="font-mono text-sm text-[hsl(var(--color-text-secondary))] bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md inline-block my-2">{searchedStudent.id}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setStudentToEdit(searchedStudent); setIsStudentModalOpen(true); }} className="p-2 hover:bg-blue-500/10 rounded-md" aria-label="تعديل الطالب"><PencilIcon /></button>
                                    <button onClick={() => handleDelete(searchedStudent.id, setStudents)} className="p-2 hover:bg-red-500/10 rounded-md" aria-label="حذف الطالب"><TrashIcon /></button>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-[hsl(var(--color-border))] grid grid-cols-2 md:grid-cols-3 gap-4">
                                <InfoItem label="الصف الدراسي" value={searchedStudent.grade} />
                                <InfoItem label="الشعبة" value={searchedStudent.section || 'N/A'} />
                                <InfoItem label="تاريخ الميلاد" value={searchedStudent.dob || 'N/A'} />
                                <InfoItem label="المدرسة" value={searchedStudent.school} />
                                <InfoItem label="رقم الهاتف" value={searchedStudent.phone} />
                                <InfoItem label="رقم ولي الأمر" value={searchedStudent.guardianPhone} />
                                <InfoItem label="البريد الإلكتروني" value={searchedStudent.email} />
                            </div>
                        </div>
                    ) : (
                         <div className="text-center py-10 bg-[hsl(var(--color-background))] rounded-lg">
                            <p className="font-semibold text-lg text-[hsl(var(--color-text-secondary))]">أدخل ID الطالب في الحقل أعلاه لعرض بياناته.</p>
                        </div>
                    )}
                </div>
            );
            default: return <div>Coming soon...</div>;
        }
    };

    const tabs: { id: AdminTab, label: string }[] = [ { id: 'stats', label: '📊 الإحصائيات' }, { id: 'bookings', label: '🎫 الحجوزات'}, { id: 'posts', label: '📝 المنشورات' }, { id: 'trips', label: '🚌 الرحلات' }, { id: 'lessons', label: '📚 الحصص' }, { id: 'teachers', label: '👨‍🏫 المدرسين' }, { id: 'students', label: '🎓 الطلاب' } ];

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6">⚙️ لوحة تحكم المالك</h1>
            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))]">
                <div className="flex border-b border-[hsl(var(--color-border))] overflow-x-auto">
                    {tabs.map(tab => ( <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-[hsl(var(--color-primary))] text-[hsl(var(--color-primary))]' : 'text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-primary))]'}`}>{tab.label}</button>))}
                </div>
                <div className="p-6">{renderContent()}</div>
            </div>
            <TeacherFormModal isOpen={isTeacherModalOpen} onClose={() => setIsTeacherModalOpen(false)} onSave={(teacher) => handleSave(teacher, setTeachers, teacherToEdit)} teacherToEdit={teacherToEdit} />
            <LessonFormModal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)} onSave={(lesson) => handleSave(lesson, setLessons, lessonToEdit)} lessonToEdit={lessonToEdit} teachers={teachers} />
            <TripFormModal isOpen={isTripModalOpen} onClose={() => setIsTripModalOpen(false)} onSave={(trip) => handleSave(trip, setTrips, tripToEdit)} tripToEdit={tripToEdit} />
            <PostFormModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} onSave={(post) => handleSave(post, setPosts, postToEdit)} postToEdit={postToEdit} />
            <StudentFormModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} onSave={(student) => handleSave(student, setStudents, studentToEdit)} studentToEdit={studentToEdit} />
            <TripBookingsModal isOpen={!!viewingBookingsTrip} onClose={() => setViewingBookingsTrip(null)} trip={viewingBookingsTrip} students={students} />
        </div>
    );
};

export default AdminDashboardPage;

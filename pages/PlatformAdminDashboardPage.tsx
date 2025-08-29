import React, { useState, useEffect, useMemo } from 'react';
import { User, PlatformTeacher, Course, CourseUnit, CourseLesson, LessonContent, SubscriptionRequest, ToastType } from '../types.ts';
import { uploadFile, getPathFromUrl, getSupabaseErrorMessage } from '../services/supabaseService.ts';
import { v4 as uuidv4 } from 'uuid';
import { MOCK_SUBJECTS } from '../constants.ts';

// --- Reusable Components ---
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

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16 sm:items-center sm:pt-4" onClick={onClose}>
            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-4xl border border-[hsl(var(--color-border))] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold p-6 border-b border-[hsl(var(--color-border))] flex-shrink-0">{title}</h2>
                <div className="flex-grow overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

// --- Modals for Each Tab ---

// Teacher Modal
const emptyTeacher: Omit<PlatformTeacher, 'id'> = { name: '', subject: '', bio: '', image_url: '' };
const TeacherFormModal: React.FC<{ teacher: PlatformTeacher | null; onClose: () => void; onSave: (teacher: PlatformTeacher) => void; addToast: (type: ToastType, title: string, message: string) => void; }> = ({ teacher, onClose, onSave, addToast }) => {
    const [formData, setFormData] = useState(emptyTeacher);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setFormData(teacher ? { ...emptyTeacher, ...teacher } : emptyTeacher);
        setImageFile(null);
    }, [teacher]);

    const handleChange = (e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let finalImageUrl = teacher?.image_url || '';
            if (imageFile) {
                const path = await uploadFile('platform_teacher_images', imageFile);
                if (path) finalImageUrl = path;
                else {
                    throw new Error('File path not returned from upload.');
                }
            }
            onSave({ ...formData, id: teacher?.id || `new_${uuidv4()}`, image_url: finalImageUrl });
            onClose();
        } catch (error) {
            addToast('error', 'فشل حفظ المدرس', getSupabaseErrorMessage(error));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={teacher ? 'تعديل مدرس' : 'إضافة مدرس جديد'}>
            <form onSubmit={handleSubmit}>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="الاسم" name="name" value={formData.name} onChange={handleChange} required />
                    <InputField as="select" label="المادة" name="subject" value={formData.subject} onChange={handleChange} required options={MOCK_SUBJECTS.map(s => ({ value: s, label: s }))} />
                    <div className="md:col-span-2">
                        <InputField as="textarea" label="نبذة تعريفية" name="bio" value={formData.bio} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">الصورة</label>
                        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-[hsl(var(--color-text-secondary))] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[hsl(var(--color-primary))] file:text-white hover:file:opacity-90"/>
                        {(formData.image_url || imageFile) && <img src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url} alt="Preview" className="mt-2 w-24 h-24 rounded-full object-cover"/>}
                    </div>
                </div>
                <div className="p-6 flex justify-end gap-4 bg-[hsl(var(--color-background))] rounded-b-2xl">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-700 font-bold py-2 px-6 rounded-lg">إلغاء</button>
                    <button type="submit" disabled={isUploading} className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">{isUploading ? 'جاري الحفظ...' : 'حفظ'}</button>
                </div>
            </form>
        </Modal>
    );
};

// Course Modal
const emptyCourse: Omit<Course, 'id' | 'teacher_name' | 'teacher_image'> = { title: '', description: '', teacher_id: '', grade: '', subject: '', image_url: '', structure: [] };
const CourseFormModal: React.FC<{ course: Course | null; teachers: PlatformTeacher[]; onClose: () => void; onSave: (course: Course) => void; addToast: (type: ToastType, title: string, message: string) => void; }> = ({ course, teachers, onClose, onSave, addToast }) => {
    const [formData, setFormData] = useState<Omit<Course, 'id' | 'teacher_name' | 'teacher_image'>>(emptyCourse);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setFormData(course ? { ...emptyCourse, ...course } : emptyCourse);
        setImageFile(null);
    }, [course]);

    const handleChange = (e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    
    // --- Structure Management ---
    const updateStructure = (newStructure: CourseUnit[]) => setFormData(p => ({...p, structure: newStructure}));
    const addUnit = () => updateStructure([...formData.structure, { id: uuidv4(), title: 'وحدة جديدة', lessons: [] }]);
    const updateUnit = (unitId: string, newTitle: string) => updateStructure(formData.structure.map(u => u.id === unitId ? {...u, title: newTitle} : u));
    const deleteUnit = (unitId: string) => updateStructure(formData.structure.filter(u => u.id !== unitId));
    
    const addLesson = (unitId: string) => {
        const newLesson: CourseLesson = { id: uuidv4(), title: 'درس جديد', content: [] };
        updateStructure(formData.structure.map(u => u.id === unitId ? {...u, lessons: [...u.lessons, newLesson]} : u));
    };
    const updateLesson = (unitId: string, lessonId: string, newLessonData: Partial<CourseLesson>) => {
        updateStructure(formData.structure.map(u => u.id === unitId 
            ? {...u, lessons: u.lessons.map(l => l.id === lessonId ? {...l, ...newLessonData} : l)}
            : u
        ));
    };
    const deleteLesson = (unitId: string, lessonId: string) => {
         updateStructure(formData.structure.map(u => u.id === unitId ? {...u, lessons: u.lessons.filter(l => l.id !== lessonId)} : u));
    };

    const addContent = (unitId: string, lessonId: string) => {
        const newContent: LessonContent = { id: uuidv4(), title: 'محتوى جديد', type: 'video', url: ''};
        updateStructure(formData.structure.map(u => u.id === unitId 
            ? {...u, lessons: u.lessons.map(l => l.id === lessonId ? {...l, content: [...l.content, newContent]} : l)}
            : u
        ));
    };
    const updateContent = (unitId: string, lessonId: string, contentId: string, newContentData: Partial<LessonContent>) => {
        updateStructure(formData.structure.map(u => u.id === unitId 
            ? {...u, lessons: u.lessons.map(l => l.id === lessonId ? {...l, content: l.content.map(c => c.id === contentId ? {...c, ...newContentData} : c)} : l)}
            : u
        ));
    };
     const deleteContent = (unitId: string, lessonId: string, contentId: string) => {
        updateStructure(formData.structure.map(u => u.id === unitId 
            ? {...u, lessons: u.lessons.map(l => l.id === lessonId ? {...l, content: l.content.filter(c => c.id !== contentId)} : l)}
            : u
        ));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let finalImageUrl = course?.image_url || '';
            if (imageFile) {
                const path = await uploadFile('course_images', imageFile);
                if (path) finalImageUrl = path;
                else {
                    throw new Error('File path not returned from upload.');
                }
            }
            const selectedTeacher = teachers.find(t => t.id === formData.teacher_id);
            const teacherName = selectedTeacher ? selectedTeacher.name : 'غير محدد';
            
            onSave({ ...formData, id: course?.id || `new_${uuidv4()}`, image_url: finalImageUrl, teacher_name: teacherName });
            onClose();
        } catch (error) {
            addToast('error', 'فشل حفظ الكورس', getSupabaseErrorMessage(error));
        } finally {
            setIsUploading(false);
        }
    };

    const gradeOptions = ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي', 'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'].map(g => ({value: g, label: g}));

    return (
        <Modal isOpen={true} onClose={onClose} title={course ? 'تعديل كورس' : 'إضافة كورس جديد'}>
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="عنوان الكورس" name="title" value={formData.title} onChange={handleChange} required />
                        <InputField as="select" label="المدرس" name="teacher_id" value={formData.teacher_id} onChange={handleChange} required options={teachers.map(t => ({ value: t.id, label: t.name }))} placeholder="اختر المدرس"/>
                        <InputField as="select" label="الصف الدراسي" name="grade" value={formData.grade} onChange={handleChange} required options={gradeOptions} />
                        <InputField as="select" label="المادة" name="subject" value={formData.subject} onChange={handleChange} required options={MOCK_SUBJECTS.map(s => ({ value: s, label: s }))} />
                        <div className="md:col-span-2">
                            <InputField as="textarea" label="وصف الكورس" name="description" value={formData.description} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">صورة الكورس</label>
                            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-[hsl(var(--color-text-secondary))] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[hsl(var(--color-primary))] file:text-white hover:file:opacity-90"/>
                            {(formData.image_url || imageFile) && <img src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-md"/>}
                        </div>
                    </div>
                    {/* Structure Editor */}
                    <div className="mt-6 border-t border-[hsl(var(--color-border))] pt-4">
                        <h3 className="text-xl font-bold mb-4">محتوى الكورس</h3>
                        <div className="space-y-4">
                            {formData.structure.map(unit => (
                                <div key={unit.id} className="bg-[hsl(var(--color-background))] p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <input type="text" value={unit.title} onChange={e => updateUnit(unit.id, e.target.value)} className="font-bold text-lg bg-transparent w-full p-1 rounded hover:bg-black/5 focus:bg-black/5"/>
                                        <button type="button" onClick={() => deleteUnit(unit.id)} className="text-red-500 p-1">حذف الوحدة</button>
                                    </div>
                                    <div className="space-y-2 pl-4">
                                        {unit.lessons.map(lesson => (
                                            <div key={lesson.id} className="bg-[hsl(var(--color-surface))] p-3 rounded">
                                                <div className="flex justify-between items-center">
                                                    <input type="text" value={lesson.title} onChange={e => updateLesson(unit.id, lesson.id, {title: e.target.value})} className="font-semibold bg-transparent w-full p-1 rounded hover:bg-black/5 focus:bg-black/5"/>
                                                    <button type="button" onClick={() => deleteLesson(unit.id, lesson.id)} className="text-red-500 text-sm p-1">حذف الدرس</button>
                                                </div>
                                                <div className="pl-4 mt-2 space-y-2">
                                                    {lesson.content.map(content => (
                                                        <div key={content.id} className="flex gap-2 items-center">
                                                            <select value={content.type} onChange={e => updateContent(unit.id, lesson.id, content.id, {type: e.target.value as any})} className="p-1 rounded bg-transparent border border-[hsl(var(--color-border))] text-xs">
                                                                <option value="video">فيديو</option><option value="summary">ملخص</option><option value="exercise">تمرين</option>
                                                            </select>
                                                            <input type="text" placeholder="عنوان المحتوى" value={content.title} onChange={e => updateContent(unit.id, lesson.id, content.id, {title: e.target.value})} className="p-1 rounded bg-transparent border border-[hsl(var(--color-border))] w-full text-sm"/>
                                                            <input type="text" placeholder="رابط المحتوى" value={content.url} onChange={e => updateContent(unit.id, lesson.id, content.id, {url: e.target.value})} className="p-1 rounded bg-transparent border border-[hsl(var(--color-border))] w-full text-sm"/>
                                                            <button type="button" onClick={() => deleteContent(unit.id, lesson.id, content.id)} className="text-red-500 text-xs p-1">X</button>
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={() => addContent(unit.id, lesson.id)} className="text-sm text-green-600 font-semibold">+ إضافة محتوى</button>
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addLesson(unit.id)} className="text-blue-600 font-semibold mt-2">+ إضافة درس</button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addUnit} className="w-full p-2 border-2 border-dashed border-[hsl(var(--color-border))] rounded-lg hover:border-[hsl(var(--color-primary))]">+ إضافة وحدة جديدة</button>
                        </div>
                    </div>
                </div>
                <div className="p-6 flex justify-end gap-4 bg-[hsl(var(--color-background))] rounded-b-2xl">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-700 font-bold py-2 px-6 rounded-lg">إلغاء</button>
                    <button type="submit" disabled={isUploading} className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">{isUploading ? 'جاري الحفظ...' : 'حفظ الكورس'}</button>
                </div>
            </form>
        </Modal>
    );
};


// --- Main Page ---
interface PlatformAdminDashboardPageProps {
  onUserUpdate: (user: User) => void;
  students: User[];
  platformTeachers: PlatformTeacher[];
  onSavePlatformTeacher: (teacher: PlatformTeacher) => void;
  onDeletePlatformTeacher: (id: string) => void;
  courses: Course[];
  onSaveCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  subscriptionRequests: SubscriptionRequest[];
  onApproveSubscription: (request: SubscriptionRequest) => void;
  onRejectSubscription: (request: SubscriptionRequest) => void;
  addToast: (type: ToastType, title: string, message: string) => void;
}

const PlatformAdminDashboardPage: React.FC<PlatformAdminDashboardPageProps> = (props) => {
  const { students, onUserUpdate, platformTeachers, onSavePlatformTeacher, onDeletePlatformTeacher, courses, onSaveCourse, onDeleteCourse, subscriptionRequests, onApproveSubscription, onRejectSubscription, addToast } = props;
  const [activeTab, setActiveTab] = useState('subscriptions');
  
  // State for modals
  const [teacherModal, setTeacherModal] = useState<{isOpen: boolean, teacher: PlatformTeacher | null}>({isOpen: false, teacher: null});
  const [courseModal, setCourseModal] = useState<{isOpen: boolean, course: Course | null}>({isOpen: false, course: null});

  // State for subscriptions tab
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [newSubDate, setNewSubDate] = useState('');
  const [requestFilter, setRequestFilter] = useState<'pending' | 'all'>('pending');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const results = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase()));
    setSearchResults(results);
    setSelectedStudent(null);
  };
  
  const selectStudent = (student: User) => {
    setSelectedStudent(student);
    setNewSubDate(student.subscription_end_date?.split('T')[0] || '');
  };

  const handleUpdateSubscription = () => {
    if (selectedStudent && newSubDate) {
      const updatedUser = { ...selectedStudent, subscription_end_date: new Date(newSubDate).toISOString() };
      onUserUpdate(updatedUser);
      setSelectedStudent(updatedUser);
      setSearchResults(prev => prev.map(s => s.id === updatedUser.id ? updatedUser : s));
      alert(`تم تحديث اشتراك الطالب ${selectedStudent.name}`);
    }
  };

  const filteredRequests = useMemo(() => {
    if (requestFilter === 'pending') {
        return subscriptionRequests.filter(r => r.status === 'pending');
    }
    return subscriptionRequests;
  }, [subscriptionRequests, requestFilter]);

  const statusStyles: Record<SubscriptionRequest['status'], { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'قيد المراجعة' },
    approved: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'مقبول' },
    rejected: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'مرفوض' },
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <h1 className="text-3xl font-bold">لوحة تحكم المنصة التعليمية</h1>
      <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))]">
          <div className="flex border-b border-[hsl(var(--color-border))] overflow-x-auto">
              <button onClick={() => setActiveTab('subscriptions')} className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'subscriptions' ? 'border-b-2 border-[hsl(var(--color-primary))] text-[hsl(var(--color-primary))]' : 'text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-primary))]'}`}>الاشتراكات والطلبات</button>
              <button onClick={() => setActiveTab('teachers')} className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'teachers' ? 'border-b-2 border-[hsl(var(--color-primary))] text-[hsl(var(--color-primary))]' : 'text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-primary))]'}`}>إدارة المدرسين</button>
              <button onClick={() => setActiveTab('content')} className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'content' ? 'border-b-2 border-[hsl(var(--color-primary))] text-[hsl(var(--color-primary))]' : 'text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-primary))]'}`}>إدارة المحتوى</button>
          </div>
          <div className="p-6">
            {activeTab === 'subscriptions' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-xl font-bold mb-4">تحديث اشتراك طالب</h2>
                      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="ابحث بالاسم أو ID..." className="w-full p-2 rounded-md bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))]"/>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold">بحث</button>
                      </form>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                          {searchResults.map(s => <button key={s.id} onClick={() => selectStudent(s)} className={`w-full text-right p-2 rounded-md border-l-4 ${selectedStudent?.id === s.id ? 'bg-blue-500/10 border-blue-500' : 'bg-[hsl(var(--color-background))] border-transparent hover:border-blue-300'}`}>
                              <p className="font-semibold">{s.name}</p>
                              <p className="text-xs text-[hsl(var(--color-text-secondary))]">{s.id}</p>
                          </button>)}
                      </div>
                    </div>
                    {selectedStudent && <div className="bg-[hsl(var(--color-background))] p-4 rounded-lg">
                        <h3 className="font-bold text-lg">{selectedStudent.name}</h3>
                        <p className="text-sm text-[hsl(var(--color-text-secondary))]">ID: {selectedStudent.id}</p>
                        <p>ينتهي الاشتراك في: {selectedStudent.subscription_end_date ? new Date(selectedStudent.subscription_end_date).toLocaleDateString('ar-EG') : 'لا يوجد'}</p>
                        <div className="flex items-center gap-2 mt-4">
                          <label>تاريخ انتهاء جديد:</label>
                          <input type="date" value={newSubDate} onChange={e => setNewSubDate(e.target.value)} className="p-2 rounded-md bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))]"/>
                          <button onClick={handleUpdateSubscription} className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold">تحديث</button>
                        </div>
                    </div>}
                </div>

                <div className="mt-8 pt-6 border-t border-[hsl(var(--color-border))]">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">طلبات الاشتراك</h2>
                      <div>
                        <button onClick={() => setRequestFilter('pending')} className={`px-3 py-1 rounded-md ${requestFilter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>قيد المراجعة ({subscriptionRequests.filter(r => r.status === 'pending').length})</button>
                        <button onClick={() => setRequestFilter('all')} className={`px-3 py-1 rounded-md mr-2 ${requestFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>الكل</button>
                      </div>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      {filteredRequests.map(req => (
                        <div key={req.id} className="bg-[hsl(var(--color-background))] p-4 rounded-lg">
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <div>
                                <p className="font-bold">{req.student_name} <span className="text-xs font-mono text-gray-500">({req.student_id})</span></p>
                                <p className={`font-semibold text-sm px-2 py-1 rounded-full inline-block mt-1 ${statusStyles[req.status].bg} ${statusStyles[req.status].text}`}>{statusStyles[req.status].label}</p>
                              </div>
                              {req.status === 'pending' && <div className="flex gap-2">
                                <button onClick={() => onApproveSubscription(req)} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm">قبول</button>
                                <button onClick={() => onRejectSubscription(req)} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm">رفض</button>
                              </div>}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 text-sm grid grid-cols-2 md:grid-cols-4 gap-2">
                              <p><b>المدة:</b> {req.duration_months} شهور</p>
                              <p><b>المبلغ:</b> {req.amount_paid} ج.م</p>
                              <p><b>رقم الدفع:</b> {req.payment_phone}</p>
                              <p><b>كود الخصم:</b> {req.discount_code || 'لا يوجد'}</p>
                              <div className="col-span-full"><b>المواد:</b> {req.selected_subjects.join(', ')}</div>
                            </div>
                        </div>
                      ))}
                      {filteredRequests.length === 0 && <p className="text-center text-gray-500 py-4">لا توجد طلبات.</p>}
                    </div>
                </div>
              </>
            )}
            {activeTab === 'teachers' && (
              <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">إدارة المدرسين ({platformTeachers.length})</h2>
                    <button onClick={() => setTeacherModal({isOpen: true, teacher: null})} className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold">+ إضافة مدرس</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {platformTeachers.map(t => <div key={t.id} className="bg-[hsl(var(--color-background))] p-4 rounded-lg flex items-center gap-4">
                          <img src={t.image_url} alt={t.name} className="w-16 h-16 rounded-full object-cover"/>
                          <div className="flex-grow">
                            <p className="font-bold">{t.name}</p><p className="text-sm">{t.subject}</p>
                            <div className="flex gap-2 mt-1">
                                <button onClick={() => setTeacherModal({isOpen: true, teacher: t})} className="text-xs text-blue-500">تعديل</button>
                                <button onClick={() => window.confirm(`هل أنت متأكد من حذف ${t.name}؟`) && onDeletePlatformTeacher(t.id)} className="text-xs text-red-500">حذف</button>
                            </div>
                          </div>
                      </div>)}
                  </div>
              </div>
            )}
             {activeTab === 'content' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">إدارة المحتوى (الكورسات) ({courses.length})</h2>
                    <button onClick={() => setCourseModal({isOpen: true, course: null})} className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold">+ إضافة كورس</button>
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.map(c => <div key={c.id} className="bg-[hsl(var(--color-background))] p-4 rounded-lg">
                          <img src={c.image_url} alt={c.title} className="w-full h-32 object-cover rounded-md mb-2"/>
                          <h3 className="font-bold">{c.title}</h3>
                          <p className="text-sm">{c.teacher_name} - {c.grade}</p>
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => setCourseModal({isOpen: true, course: c})} className="text-xs text-blue-500">تعديل</button>
                            <button onClick={() => window.confirm(`هل أنت متأكد من حذف كورس "${c.title}"؟`) && onDeleteCourse(c.id)} className="text-xs text-red-500">حذف</button>
                          </div>
                      </div>)}
                   </div>
                </div>
             )}
          </div>
       </div>
       {teacherModal.isOpen && <TeacherFormModal teacher={teacherModal.teacher} onClose={() => setTeacherModal({isOpen: false, teacher: null})} onSave={onSavePlatformTeacher} addToast={addToast}/>}
       {courseModal.isOpen && <CourseFormModal course={courseModal.course} teachers={platformTeachers} onClose={() => setCourseModal({isOpen: false, course: null})} onSave={onSaveCourse} addToast={addToast} />}
    </div>
  );
};

export default PlatformAdminDashboardPage;
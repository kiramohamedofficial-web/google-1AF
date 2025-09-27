import React, { useState, useMemo, useEffect, useCallback, ChangeEvent } from 'react';
import { Lesson, Teacher, User, Post, Center } from '../types.ts';
import { supabase } from '../services/supabaseClient.ts';
import { 
    UsersIcon, CalendarIcon, AcademicCapIcon, NewsIcon, 
    PencilIcon, TrashIcon, PlusIcon, BuildingOfficeIcon,
    SearchIcon, ClearIcon, BellIcon
} from '../components/common/Icons.tsx';

// --- Time Helper Functions ---
const to24Hour = (timeStr: string): string => {
    if (!timeStr) return '';
    const [time, modifier] = timeStr.split(' ');
    if (!modifier) return timeStr;

    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier.toLowerCase() === 'م') {
        const parsedHours = parseInt(hours, 10);
        if (parsedHours !== 12) hours = (parsedHours + 12).toString();
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
};

const to12Hour = (timeStr: string): string => {
    if (!timeStr || !timeStr.includes(':')) return timeStr;
    const [hoursStr, minutes] = timeStr.split(':');
    let h = parseInt(hoursStr, 10);
    if (isNaN(h)) return timeStr;
    const modifier = h >= 12 ? 'م' : 'ص';
    const displayHours = h % 12 || 12;
    return `${displayHours}:${minutes} ${modifier}`;
};

const TEACHER_GRADE_OPTIONS = ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي', 'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'];

// --- Reusable Form Field Components (defined top-level to prevent re-renders) ---
const inputSharedClass = "w-full p-2 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--color-surface))] focus:ring-[hsl(var(--color-primary))]";

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`${inputSharedClass} break-words`} />
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
    <select {...props} className={inputSharedClass}>
        {children}
    </select>
);

const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} className={`${inputSharedClass} h-32 resize-y break-words`} />
);

const FormFileInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        type="file"
        accept="image/*"
        className="w-full text-sm text-[hsl(var(--color-text-secondary))] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[hsl(var(--color-primary))] file:text-white hover:file:opacity-90 file:cursor-pointer cursor-pointer"
        {...props}
    />
);


// --- Reusable UI Components ---
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-[hsl(var(--color-surface))] p-5 rounded-2xl flex items-center gap-4 border-l-4" style={{ borderColor: color }}>
        <div className="text-white p-4 rounded-full" style={{ backgroundColor: color }}>{icon}</div>
        <div>
            <p className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">{value}</p>
            <p className="text-[hsl(var(--color-text-secondary))]">{title}</p>
        </div>
    </div>
);

const CenterSwitcher: React.FC<{ centers: Center[], selectedCenterId: string | null, onSelect: (id: string) => void, userRole: User['role'] }> = ({ centers, selectedCenterId, onSelect, userRole }) => (
    <div className="bg-[hsl(var(--color-surface))] p-4 rounded-2xl shadow-lg border border-[hsl(var(--color-border))] flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-center sm:text-right">
            لوحة تحكم <span className="text-[hsl(var(--color-primary))]">{centers.find(c => c.id === selectedCenterId)?.name || 'المالك'}</span>
        </h1>
        <div className="flex items-center gap-2">
            <label htmlFor="center-select" className="font-semibold whitespace-nowrap">المركز الحالي:</label>
            <select 
                id="center-select"
                value={selectedCenterId || ''}
                onChange={(e) => onSelect(e.target.value)}
                disabled={userRole !== 'admin'}
                className="p-2 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--color-surface))] focus:ring-[hsl(var(--color-primary))] disabled:opacity-70 disabled:cursor-not-allowed">
                {centers.map(center => (
                    <option key={center.id} value={center.id}>{center.name}</option>
                ))}
            </select>
        </div>
    </div>
);

interface SearchControlsProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    handleSearch: () => void;
    clearFilters: () => void;
    activeSearchQuery: string;
    gradeFilter: string;
    dayFilter: string;
    children?: React.ReactNode;
}

const SearchControls: React.FC<SearchControlsProps> = ({
    searchInput,
    setSearchInput,
    handleSearch,
    clearFilters,
    activeSearchQuery,
    gradeFilter,
    dayFilter,
    children
}) => (
    <div className="flex gap-2 flex-wrap w-full justify-start sm:justify-end items-stretch">
        <div className="relative flex-grow sm:flex-grow-0">
            <input 
                type="text" 
                placeholder="ابحث..." 
                value={searchInput} 
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="p-2 pl-10 h-full rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] w-full outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--color-surface))] focus:ring-[hsl(var(--color-primary))]" 
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[hsl(var(--color-text-secondary))]">
                <SearchIcon />
            </div>
        </div>
        {children}
        <button onClick={handleSearch} className="px-4 rounded-lg bg-blue-600 text-white flex items-center gap-2 font-semibold hover:bg-blue-700 transition-colors">
            <SearchIcon />
        </button>
        {(activeSearchQuery || gradeFilter || dayFilter) && (
            <button onClick={clearFilters} className="px-4 rounded-lg bg-gray-500 text-white flex items-center gap-2 font-semibold hover:bg-gray-600 transition-colors">
                <ClearIcon />
            </button>
        )}
    </div>
);

// --- Main Dashboard Page ---
type AdminTab = 'stats' | 'students' | 'teachers' | 'lessons' | 'posts' | 'notifications';
type ModalType = 'teacher' | 'lesson' | 'post' | 'student' | null;

interface AdminDashboardPageProps { 
    user: User;
    centers: Center[];
    selectedCenterId: string | null;
    onSelectCenter: (id: string) => void;
    students: User[];
    teachers: Teacher[];
    lessons: Lesson[];
    posts: Post[];
    onDataChange: () => void;
    loading: boolean;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ 
    user, centers, selectedCenterId, onSelectCenter,
    students, teachers, lessons, posts, onDataChange, loading
}) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('stats');
    const [modalType, setModalType] = useState<ModalType>(null);
    const [currentItem, setCurrentItem] = useState<any | null>(null);

    // Search and Filter State
    const [searchInput, setSearchInput] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');
    const [gradeFilter, setGradeFilter] = useState('');
    const [dayFilter, setDayFilter] = useState('');
    
    const grades = useMemo(() => Array.from(new Set([...students.map(s => s.grade), ...lessons.map(l => l.grade)])).filter(Boolean).sort(), [students, lessons]);
    const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

    useEffect(() => {
        setSearchInput('');
        setActiveSearchQuery('');
        setGradeFilter('');
        setDayFilter('');
        // If a teacher is viewing, default to students tab
        if (user.role === 'teacher') {
            setActiveTab('students');
        } else {
            setActiveTab('stats');
        }
    }, [selectedCenterId, user.role]);

    // FIX: Define handleSearch and clearFilters to be passed to SearchControls.
    const handleSearch = () => {
        setActiveSearchQuery(searchInput.trim());
    };

    const clearFilters = () => {
        setSearchInput('');
        setActiveSearchQuery('');
        setGradeFilter('');
        setDayFilter('');
    };

    const handleOpenModal = (type: ModalType, item: any | null = null) => {
        setModalType(type);
        setCurrentItem(item);
    };

    const handleCloseModal = (refresh?: boolean) => {
        setModalType(null);
        setCurrentItem(null);
        if (refresh) {
            onDataChange();
        }
    };
    
    const createDeleteHandler = (table: string) => async (id: string) => {
        if (!window.confirm("هل أنت متأكد من رغبتك في الحذف؟ لا يمكن التراجع عن هذا الإجراء.")) return;
        
        const { error } = await supabase.from(table).delete().eq('id', id);
        
        if (error) {
            alert(`خطأ أثناء الحذف: ${error.message}`);
            console.error(`Error deleting item ${id} from ${table}:`, error);
        } else {
            onDataChange();
        }
    };

    // Filtered Data Memos
    const filteredStudents = useMemo(() => {
        const query = activeSearchQuery.toLowerCase();
        if (!query && !gradeFilter) return students;
        return students.filter(s =>
            (
                String(s.name || '').toLowerCase().includes(query) ||
                String(s.email || '').toLowerCase().includes(query) ||
                String(s.phone || '').includes(query)
            ) &&
            (gradeFilter ? s.grade === gradeFilter : true)
        );
    }, [students, activeSearchQuery, gradeFilter]);

    const filteredTeachers = useMemo(() => {
        const query = activeSearchQuery.toLowerCase();
        if (!query) return teachers;
        return teachers.filter(t =>
            String(t.name || '').toLowerCase().includes(query) ||
            String(t.subject || '').toLowerCase().includes(query) ||
            String(t.phone || '').includes(query)
        );
    }, [teachers, activeSearchQuery]);

    const filteredLessons = useMemo(() => {
        const query = activeSearchQuery.toLowerCase();
        if (!query && !gradeFilter && !dayFilter) return lessons;
        return lessons.filter(l =>
            (
                String(l.subject || '').toLowerCase().includes(query) ||
                String(l.teacher || '').toLowerCase().includes(query)
            ) &&
            (gradeFilter ? l.grade === gradeFilter : true) &&
            (dayFilter ? l.day === dayFilter : true)
        );
    }, [lessons, activeSearchQuery, gradeFilter, dayFilter]);

    const filteredPosts = useMemo(() => {
        const query = activeSearchQuery.toLowerCase();
        if (!query) return posts;
        return posts.filter(p =>
            String(p.title || '').toLowerCase().includes(query) ||
            String(p.content || '').toLowerCase().includes(query)
        );
    }, [posts, activeSearchQuery]);
    
    const adminTabItems = [
        { id: 'stats', label: 'الإحصائيات', icon: <AcademicCapIcon /> },
        { id: 'students', label: 'الطلاب', icon: <UsersIcon /> },
        { id: 'teachers', label: 'المدرسون', icon: <UsersIcon className="w-6 h-6 transform scale-x-[-1]" /> },
        { id: 'lessons', label: 'الحصص', icon: <CalendarIcon /> },
        { id: 'posts', label: 'الإعلانات', icon: <NewsIcon /> },
        { id: 'notifications', label: 'إرسال إشعار', icon: <BellIcon /> },
    ];
    
    const teacherTabItems = [
        { id: 'students', label: 'الطلاب', icon: <UsersIcon /> },
        { id: 'lessons', label: 'الحصص', icon: <CalendarIcon /> },
    ];

    const tabItems = user.role === 'admin' ? adminTabItems : teacherTabItems;


    const renderContent = () => {
        if (loading && students.length === 0) return <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--color-primary))] mx-auto"></div></div>;

        const searchProps = {
            searchInput, setSearchInput, handleSearch, clearFilters,
            activeSearchQuery, gradeFilter, dayFilter,
        };

        const filterSelectClass = "p-2 h-full rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--color-surface))] focus:ring-[hsl(var(--color-primary))]";

        switch (activeTab) {
            case 'stats': return user.role === 'admin' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="إجمالي الطلاب" value={students.length} icon={<UsersIcon />} color="#3b82f6" />
                <StatCard title="إجمالي المدرسين" value={teachers.length} icon={<AcademicCapIcon />} color="#8b5cf6" />
                <StatCard title="إجمالي الحصص" value={lessons.length} icon={<CalendarIcon />} color="#10b981" />
                <StatCard title="إجمالي الإعلانات" value={posts.length} icon={<NewsIcon />} color="#f97316" />
            </div> : null;
            case 'students': return <DataTable title="الطلاب" data={filteredStudents} columns={{ name: 'الاسم', email: 'الإيميل', phone: 'الهاتف', grade: 'الصف' }} onEdit={item => handleOpenModal('student', item)} onDelete={user.role === 'admin' ? createDeleteHandler('users') : undefined}>
                <SearchControls {...searchProps}>
                    <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} className={filterSelectClass}><option value="">كل الصفوف</option>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select>
                </SearchControls>
            </DataTable>;
            case 'teachers': return user.role === 'admin' ? <DataTable title="المدرسون" data={filteredTeachers} columns={{ name: 'الاسم', subject: 'المادة', phone: 'الهاتف' }} onEdit={item => handleOpenModal('teacher', item)} onDelete={createDeleteHandler('teachers')} onAdd={() => handleOpenModal('teacher')}>
                <SearchControls {...searchProps} />
            </DataTable> : null;
            case 'lessons': return <DataTable title="الحصص" data={filteredLessons} columns={{ subject: 'المادة', teacher: 'المدرس', day: 'اليوم', time: 'الوقت', hall: 'القاعة', grade: 'الصف' }} onEdit={user.role === 'admin' ? item => handleOpenModal('lesson', item) : undefined} onDelete={user.role === 'admin' ? createDeleteHandler('lessons') : undefined} onAdd={user.role === 'admin' ? () => handleOpenModal('lesson') : undefined} displayTransform={{ teacher: (item) => item.teachers?.name }}>
                <SearchControls {...searchProps}>
                    <select value={dayFilter} onChange={e => setDayFilter(e.target.value)} className={filterSelectClass}><option value="">كل الأيام</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} className={filterSelectClass}><option value="">كل الصفوف</option>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select>
                </SearchControls>
            </DataTable>;
            case 'posts': return user.role === 'admin' ? <DataTable title="الإعلانات" data={filteredPosts} columns={{ title: 'العنوان', author: 'الكاتب', timestamp: 'التاريخ' }} onEdit={item => handleOpenModal('post', item)} onDelete={createDeleteHandler('posts')} onAdd={() => handleOpenModal('post')} displayTransform={{ timestamp: (item) => new Date(item.timestamp).toLocaleDateString() }}>
                 <SearchControls {...searchProps} />
            </DataTable> : null;
            case 'notifications': return user.role === 'admin' ? <NotificationSender students={students} centerId={selectedCenterId} /> : null;
            default: return null;
        }
    };

    return <div className="space-y-8 animate-fade-in-up">
        {centers.length > 0 && <CenterSwitcher centers={centers} selectedCenterId={selectedCenterId} onSelect={onSelectCenter} userRole={user.role} />}
        
        <div className="bg-[hsl(var(--color-surface))] rounded-xl shadow-lg p-2 border border-[hsl(var(--color-border))] flex flex-wrap items-center gap-2">
            {tabItems.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`flex-grow text-center py-2 px-4 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-[hsl(var(--color-primary))] text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>{tab.icon}{tab.label}</button>)}
        </div>
        
        <div>{renderContent()}</div>

        {modalType && <AdminModal type={modalType} item={currentItem} onClose={handleCloseModal} centerId={selectedCenterId} teachers={teachers} user={user} students={students} grades={grades} />}
    </div>;
};

// --- Data Table Component ---
const DataTable: React.FC<{ title: string; data: any[]; columns: Record<string, string>; children?: React.ReactNode; onAdd?: () => void; onEdit?: (item: any) => void; onDelete?: (id: string) => void; displayTransform?: Record<string, (item: any) => string> }> = ({ title, data, columns, children, onAdd, onEdit, onDelete, displayTransform }) => (
    <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))] overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-[hsl(var(--color-border))] flex-wrap">
            <h2 className="text-xl font-bold flex-shrink-0">{title}</h2>
            <div className="flex-grow">{children}</div>
            {onAdd && <button onClick={onAdd} className="bg-[hsl(var(--color-primary))] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90 flex-shrink-0"><PlusIcon /> إضافة جديد</button>}
        </div>
        <div className="overflow-x-auto"><table className="w-full text-right">
            <thead className="bg-[hsl(var(--color-background))]"><tr className="border-b border-[hsl(var(--color-border))]">
                {Object.values(columns).map(label => <th key={label} className="p-3 font-semibold uppercase text-sm text-[hsl(var(--color-text-secondary))]">{label}</th>)}
                {(onEdit || onDelete) && <th className="p-3 font-semibold uppercase text-sm text-[hsl(var(--color-text-secondary))]">إجراءات</th>}
            </tr></thead>
            <tbody className="divide-y divide-[hsl(var(--color-border))]">
                {data.length > 0 ? data.map(item => (
                    <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        {Object.keys(columns).map(key => <td key={key} className="p-3 whitespace-nowrap">{displayTransform?.[key] ? displayTransform[key](item) : item[key]?.toString() || ''}</td>)}
                        {(onEdit || onDelete) && <td className="p-3 flex gap-2">
                            {onEdit && <button onClick={() => onEdit(item)} className="p-2 rounded-md hover:bg-blue-500/10 text-blue-500"><PencilIcon /></button>}
                            {onDelete && <button onClick={() => onDelete(item.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-500"><TrashIcon /></button>}
                        </td>}
                    </tr>
                )) : <tr><td colSpan={Object.keys(columns).length + 1} className="text-center p-8 text-[hsl(var(--color-text-secondary))]">لا توجد بيانات.</td></tr>}
            </tbody>
        </table></div>
        <div className="p-3 bg-[hsl(var(--color-background))] border-t border-[hsl(var(--color-border))] text-sm text-[hsl(var(--color-text-secondary))] font-semibold">إجمالي السجلات: {data.length}</div>
    </div>
);


// --- Modal and Forms ---
interface AdminModalProps { type: ModalType; item: any; onClose: (refresh?: boolean) => void; centerId: string | null; teachers: Teacher[]; user: User; students: User[]; grades: string[]; }

const AdminModal: React.FC<AdminModalProps> = ({ type, item, onClose, centerId, teachers, user, students, grades }) => {
    const isEdit = !!item;
    const [formData, setFormData] = useState(item || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

    useEffect(() => {
        if (type === 'lesson' && item?.time) {
            const [start, end] = item.time.split(' - ');
            setStartTime(to24Hour(start));
            setEndTime(to24Hour(end));
        }
        if (isEdit) {
            if (type === 'teacher' && item.imageUrl) {
                setPreviewUrl(item.imageUrl);
            } else if (type === 'post' && item.imageUrls && item.imageUrls.length > 0) {
                setPreviewUrl(item.imageUrls[0]);
            }
        }
    }, [type, item, isEdit]);

    useEffect(() => {
        const currentPreviewUrl = previewUrl;
        return () => {
            if (currentPreviewUrl && currentPreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(currentPreviewUrl);
            }
        };
    }, [previewUrl]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGradesChange = (newGrades: string[]) => {
        setFormData(prev => ({ ...prev, grades: newGrades }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        } else {
            setFile(null);
            if (isEdit) {
                 if (type === 'teacher' && item.imageUrl) setPreviewUrl(item.imageUrl);
                 else if (type === 'post' && item.imageUrls?.[0]) setPreviewUrl(item.imageUrls[0]);
                 else setPreviewUrl(null);
            } else {
                 setPreviewUrl(null);
            }
        }
    };

    const uploadFile = async (fileToUpload: File, entityType: 'teacher' | 'post'): Promise<string | undefined> => {
        const BUCKET_NAME = 'teacher-avatars';
        const folder = entityType === 'teacher' ? 'teachers' : 'posts';
        const filePath = `public/${folder}/${Date.now()}_${fileToUpload.name}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, fileToUpload);
        if (uploadError) {
            if (uploadError.message.includes("Bucket not found")) {
                setError(`فشل الرفع: لم يتم العثور على 'bucket' التخزين. يرجى إنشاء 'bucket' باسم '${BUCKET_NAME}' في مشروع Supabase الخاص بك وجعله عامًا (public).`);
            } else {
                setError(`File upload error: ${uploadError.message}`);
            }
            return undefined;
        }
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        return data.publicUrl;
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        let hasError = false;

        let finalData: any = { ...formData };

        if (file && (type === 'teacher' || type === 'post')) {
            const fileUrl = await uploadFile(file, type);
            if (!fileUrl) { setIsSubmitting(false); return; }
            if (type === 'teacher') finalData.image_url = fileUrl;
            if (type === 'post') finalData.image_urls = [fileUrl];
        }

        if (type === 'lesson') {
            finalData.time = `${to12Hour(startTime)} - ${to12Hour(endTime)}`;
        }
        
        if (isEdit) {
            const { id, ...updateData } = finalData;
            delete updateData.teachers;
            delete updateData.author;
            delete updateData.center;
            
            let table = '';
            if (type === 'teacher') table = 'teachers';
            if (type === 'lesson') table = 'lessons';
            if (type === 'post') table = 'posts';
            if (type === 'student') table = 'users';

            const { error: updateError } = await supabase.from(table).update(updateData).eq('id', id);
            if (updateError) {
                setError(`Update error: ${updateError.message}`);
                hasError = true;
            }
        } else {
            // CREATE LOGIC
            finalData.center_id = centerId;
            if (type === 'post') {
                finalData.author_id = user.id;
                const { data: newPost, error: insertError } = await supabase.from('posts').insert(finalData).select().single();
                if (insertError) {
                    setError(`Create post error: ${insertError.message}`);
                    hasError = true;
                } else if (newPost && students.length > 0) {
                    const notificationsPayload = students.map(student => ({
                        user_id: student.id,
                        center_id: centerId,
                        message: `📢 إعلان جديد: ${newPost.title}`,
                        type: 'new_post' as const,
                        related_id: newPost.id,
                    }));
                    const { error: notificationError } = await supabase.from('notifications').insert(notificationsPayload);
                    if (notificationError) {
                        console.error('Failed to send post notifications:', notificationError);
                        // This is non-critical, so we don't set the main form error
                    }
                }
            } else {
                let table = '';
                if (type === 'teacher') table = 'teachers';
                if (type === 'lesson') table = 'lessons';
                if (type === 'student') table = 'users';
                const { error: insertError } = await supabase.from(table).insert([finalData]);
                if (insertError) {
                    setError(`Create error: ${insertError.message}`);
                    hasError = true;
                }
            }
        }
        
        setIsSubmitting(false);
        if (!hasError) onClose(true);
    };

    const GradesCheckboxGroup: React.FC<{ selectedGrades: string[], onChange: (grades: string[]) => void }> = ({ selectedGrades = [], onChange }) => {
        const handleCheckboxChange = (grade: string) => {
            const newSelection = selectedGrades.includes(grade)
                ? selectedGrades.filter(g => g !== grade)
                : [...selectedGrades, grade];
            onChange(newSelection);
        };

        return (
            <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-1">الصفوف الدراسية</label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 bg-[hsl(var(--color-background))] rounded-lg border border-[hsl(var(--color-border))]">
                    {TEACHER_GRADE_OPTIONS.map(grade => (
                        <label key={grade} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedGrades.includes(grade)}
                                onChange={() => handleCheckboxChange(grade)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-sm">{grade}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    const renderForm = () => {
        switch (type) {
            case 'teacher': return <>
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-full mx-auto mb-2 object-cover border-2 border-[hsl(var(--color-primary))]" />
                ) : (
                    <div className="w-32 h-32 rounded-full mx-auto mb-2 bg-[hsl(var(--color-background))] flex items-center justify-center border-2 border-dashed border-[hsl(var(--color-border))]">
                        <span className="text-sm text-[hsl(var(--color-text-secondary))] text-center">صورة<br/>المعلم</span>
                    </div>
                )}
                <FormInput name="name" placeholder="الاسم" required value={formData.name || ''} onChange={handleChange} />
                <FormInput name="subject" placeholder="المادة" required value={formData.subject || ''} onChange={handleChange} />
                <GradesCheckboxGroup selectedGrades={formData.grades || []} onChange={handleGradesChange} />
                <FormInput name="phone" placeholder="الهاتف" value={formData.phone || ''} onChange={handleChange} />
                <FormInput name="email" type="email" placeholder="البريد الإلكتروني" value={formData.email || ''} onChange={handleChange} />
                <FormTextarea name="bio" placeholder="نبذة تعريفية" value={formData.bio || ''} onChange={handleChange} />
                <label className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">الصورة الشخصية</label>
                <FormFileInput name="imageFile" onChange={handleFileChange} />
            </>;
            case 'lesson': return <>
                <FormInput name="subject" placeholder="المادة" required value={formData.subject || ''} onChange={handleChange} />
                <FormSelect name="teacher_id" required value={formData.teacher_id || ''} onChange={handleChange}>
                    <option value="" disabled>اختر مدرسًا</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </FormSelect>
                <FormSelect name="day" required value={formData.day || ''} onChange={handleChange}>
                    <option value="" disabled>اختر يومًا</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                </FormSelect>
                <div className="grid grid-cols-2 gap-2">
                    <div><label>وقت البدء</label><FormInput type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required/></div>
                    <div><label>وقت الانتهاء</label><FormInput type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required/></div>
                </div>
                <FormInput name="hall" placeholder="القاعة" required value={formData.hall || ''} onChange={handleChange} />
                <FormSelect name="grade" required value={formData.grade || ''} onChange={handleChange}>
                    <option value="" disabled>اختر الصف الدراسي</option>
                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </FormSelect>
                <FormTextarea name="notes" placeholder="ملاحظات" value={formData.notes || ''} onChange={handleChange} />
            </>;
            case 'post': return <>
                <FormInput name="title" placeholder="العنوان" required value={formData.title || ''} onChange={handleChange} />
                <FormTextarea name="content" placeholder="المحتوى" required value={formData.content || ''} onChange={handleChange} />
                {previewUrl && (
                     <img src={previewUrl} alt="Preview" className="w-full max-h-48 rounded-lg my-2 object-contain bg-[hsl(var(--color-background))]" />
                )}
                <label className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">صورة (اختياري)</label>
                <FormFileInput name="imageFile" onChange={handleFileChange} />
            </>;
            case 'student': return <>
                <FormInput name="name" placeholder="الاسم" required value={formData.name || ''} onChange={handleChange} />
                <FormInput name="email" type="email" placeholder="البريد الإلكتروني" required value={formData.email || ''} onChange={handleChange} />
                <FormInput name="phone" placeholder="الهاتف" value={formData.phone || ''} onChange={handleChange} />
                <FormInput name="grade" placeholder="الصف الدراسي" value={formData.grade || ''} onChange={handleChange} />
            </>;
            default: return null;
        }
    };
    
    return <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => onClose()}>
        <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold">{isEdit ? 'تعديل' : 'إضافة'} {type}</h2>
            {error && <p className="text-red-500 bg-red-500/10 p-2 rounded-md">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">{renderForm()}</form>
            <div className="flex gap-4 justify-end">
                <button onClick={() => onClose()} className="bg-gray-200 dark:bg-gray-700 font-bold py-2 px-6 rounded-lg">إلغاء</button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">{isSubmitting ? 'جاري الحفظ...' : 'حفظ'}</button>
            </div>
        </div>
    </div>
};

const NotificationSender: React.FC<{ students: User[], centerId: string | null }> = ({ students, centerId }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSend = async () => {
        if (!message.trim() || !centerId || students.length === 0) {
            setStatus({ type: 'error', text: 'الرسالة فارغة أو لا يوجد طلاب في هذا المركز.' });
            return;
        }

        setIsSending(true);
        setStatus(null);

        const notificationsPayload = students.map(student => ({
            user_id: student.id,
            center_id: centerId,
            message: message.trim(),
            type: 'general' as const,
        }));

        const { error } = await supabase.from('notifications').insert(notificationsPayload);
        
        setIsSending(false);

        if (error) {
            console.error('Error sending notifications:', error);
            setStatus({ type: 'error', text: `فشل إرسال الإشعارات: ${error.message}` });
        } else {
            setStatus({ type: 'success', text: `تم إرسال الإشعار بنجاح إلى ${students.length} طالب.` });
            setMessage('');
            setTimeout(() => setStatus(null), 5000);
        }
    };

    return (
        <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))] p-6 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold">إرسال إشعار عام</h2>
            <p className="text-[hsl(var(--color-text-secondary))]">سيتم إرسال هذا الإشعار إلى جميع الطلاب المسجلين في المركز الحالي.</p>
            
            {status && (
                <div className={`p-3 rounded-lg text-center font-semibold ${status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {status.text}
                </div>
            )}

            <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="اكتب رسالة الإشعار هنا..."
                rows={5}
                className="w-full p-2 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--color-surface))] focus:ring-[hsl(var(--color-primary))]"
            />
            <button
                onClick={handleSend}
                disabled={isSending || !message.trim()}
                className="w-full bg-[hsl(var(--color-primary))] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:bg-gray-400"
            >
                {isSending ? 'جاري الإرسال...' : 'إرسال الإشعار'}
            </button>
        </div>
    );
};


export default AdminDashboardPage;
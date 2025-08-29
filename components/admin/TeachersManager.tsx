import React, { useState } from 'react';
import { Teacher, ToastType } from '../../types.ts';
import { PencilIcon, TrashIcon, PlusIcon, UploadIcon } from '../common/Icons.tsx';
import { uploadFile, getSupabaseErrorMessage } from '../../services/supabaseService.ts';
import { getPublicUrl } from '../../services/supabaseClient.ts';
import ConfirmationModal from '../common/ConfirmationModal.tsx';

const emptyTeacherFormData = {
    name: '',
    subject: '',
    phone: '',
    bio: '',
    grades: '',
    image_url: ''
};

export const TeachersManager: React.FC<{
  teachers: Teacher[];
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  addToast: (type: ToastType, title: string, message: string) => void;
}> = ({ teachers, onSaveTeacher, onDeleteTeacher, addToast }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState(emptyTeacherFormData);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDeleteState, setConfirmDeleteState] = useState<{ isOpen: boolean; teacher: Teacher | null }>({ isOpen: false, teacher: null });


  const resetForm = () => {
    setFormData(emptyTeacherFormData);
    setEditingTeacher(null);
  };
  
  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      subject: teacher.subject,
      phone: teacher.phone || '',
      bio: teacher.bio || '',
      grades: teacher.grades || '',
      image_url: teacher.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
        const filePath = await uploadFile('teacher_images', file);
        if (!filePath) throw new Error("File path not returned from upload.");
        const publicUrl = getPublicUrl('teacher_images', filePath);
        setFormData(prev => ({ ...prev, image_url: publicUrl }));
        addToast('success', "تم بنجاح", "تم رفع الصورة بنجاح");
    } catch (error) {
        addToast('error', "خطأ في رفع الصورة", getSupabaseErrorMessage(error));
    } finally {
        setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.subject) {
      addToast('error', "خطأ", "يرجى ملء الحقول المطلوبة (الاسم والمادة)");
      return;
    }
    
    const teacherToSave: Teacher = {
        id: editingTeacher?.id || `new_${Date.now()}`,
        name: formData.name,
        subject: formData.subject,
        phone: formData.phone || undefined,
        bio: formData.bio,
        grades: formData.grades || undefined,
        image_url: formData.image_url,
        email: editingTeacher?.email // Preserve fields not in form
    };

    onSaveTeacher(teacherToSave);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setConfirmDeleteState({ isOpen: true, teacher });
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteState.teacher) {
      onDeleteTeacher(confirmDeleteState.teacher.id);
    }
    setConfirmDeleteState({ isOpen: false, teacher: null });
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">👨‍🏫 إدارة المدرسين ({teachers.length})</h3>
            <button onClick={openAddDialog} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                <PlusIcon /> إضافة مدرس
            </button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher) => (
            <div key={teacher.id} className="bg-[hsl(var(--color-background))] rounded-xl shadow-md p-4 flex flex-col">
                <div className="flex items-start gap-4 mb-3">
                    <img src={teacher.image_url} alt={teacher.name} className="w-16 h-16 rounded-full object-cover border-2 border-[hsl(var(--color-primary))]"/>
                    <div className="flex-grow">
                        <h4 className="text-lg font-bold text-[hsl(var(--color-text-primary))]">{teacher.name}</h4>
                        <p className="text-sm text-[hsl(var(--color-text-secondary))]">{teacher.subject}</p>
                    </div>
                </div>
                {teacher.grades && <p className="text-sm text-[hsl(var(--color-text-secondary))] mb-1">📚 {teacher.grades}</p>}
                {teacher.phone && <p className="text-sm text-[hsl(var(--color-text-secondary))] mb-3">📞 {teacher.phone}</p>}
                <p className="text-sm text-[hsl(var(--color-text-secondary))] flex-grow line-clamp-2">{teacher.bio}</p>
                <div className="flex gap-2 mt-4 pt-3 border-t border-[hsl(var(--color-border))]">
                    <button onClick={() => openEditDialog(teacher)} className="p-2 w-full flex justify-center items-center hover:bg-blue-500/10 rounded-md text-blue-500" aria-label="تعديل"><PencilIcon /></button>
                    <button onClick={() => handleDeleteClick(teacher)} className="p-2 w-full flex justify-center items-center hover:bg-red-500/10 rounded-md text-red-500" aria-label="حذف"><TrashIcon /></button>
                </div>
            </div>
        ))}
        </div>

        {teachers.length === 0 && (
             <div className="text-center py-8 bg-[hsl(var(--color-background))] rounded-lg">
                <p className="text-muted-foreground">لا توجد معلمين مسجلين</p>
             </div>
        )}

        {isDialogOpen && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16 sm:items-center sm:pt-4" onClick={() => setIsDialogOpen(false)}>
                <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-lg border border-[hsl(var(--color-border))] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold p-6 border-b border-[hsl(var(--color-border))]">{editingTeacher ? '✏️ تعديل بيانات مدرس' : '➕ إضافة مدرس جديد'}</h2>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <input placeholder="اسم المعلم *" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm p-2 focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                        <input placeholder="المادة *" value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm p-2 focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                        <input placeholder="رقم الهاتف" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm p-2 focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                        <input placeholder="الصفوف (مثال: الصف الأول والثالث الثانوي)" value={formData.grades} onChange={(e) => setFormData(p => ({ ...p, grades: e.target.value }))} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm p-2 focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                        <textarea placeholder="نبذة عن المعلم" value={formData.bio} onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))} className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm p-2 focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">صورة المعلم</label>
                            <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} className="hidden" id="teacher-image" disabled={isUploading} />
                            <label htmlFor="teacher-image" className="cursor-pointer">
                                <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 text-center hover:border-[hsl(var(--color-primary))]">
                                    {isUploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--color-primary))] mx-auto mb-2"></div> : <UploadIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />}
                                    <p className="text-sm text-[hsl(var(--color-text-secondary))]">{isUploading ? 'جاري الرفع...' : 'اضغط لرفع صورة'}</p>
                                </div>
                            </label>
                            {formData.image_url && <img src={formData.image_url} alt="معاينة" className="w-20 h-20 object-cover rounded-full mt-2" />}
                        </div>
                    </div>
                    <div className="p-6 flex justify-end gap-4 bg-[hsl(var(--color-background))] rounded-b-2xl">
                        <button onClick={() => setIsDialogOpen(false)} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-6 rounded-lg">إلغاء</button>
                        <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg">💾 حفظ</button>
                    </div>
                </div>
            </div>
        )}

        <ConfirmationModal
            isOpen={confirmDeleteState.isOpen}
            onClose={() => setConfirmDeleteState({ isOpen: false, teacher: null })}
            onConfirm={handleConfirmDelete}
            title="تأكيد حذف المدرس"
            message={`هل أنت متأكد من حذف المدرس "${confirmDeleteState.teacher?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
            confirmText="نعم، حذف"
        />
    </div>
  )
};

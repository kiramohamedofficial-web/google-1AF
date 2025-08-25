import React from 'react';
import { HomeIcon, CalendarIcon, SmartScheduleIcon, ClipboardListIcon, UsersIcon, NewspaperIcon, TruckIcon, BookOpenIcon, PhotoIcon, AcademicCapIcon, UserCircleIcon } from '../components/common/Icons.tsx';

const InstructionItem: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-[hsl(var(--color-background))] p-6 rounded-xl flex items-start gap-6">
        <div className="text-[hsl(var(--color-primary))]">{icon}</div>
        <div>
            <h3 className="text-xl font-bold text-[hsl(var(--color-text-primary))] mb-2">{title}</h3>
            <p className="text-[hsl(var(--color-text-secondary))]">{children}</p>
        </div>
    </div>
);

const InstructionsPage: React.FC = () => {
    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6">تعليمات استخدام المنصة</h1>
            <div className="space-y-6">
                <InstructionItem icon={<HomeIcon />} title="الصفحة الرئيسية">
                    هي نقطة البداية، حيث تجد ملخصًا سريعًا لحصص اليوم، وآخر الإعلانات والرحلات. يمكنك حجز الحصص مباشرة من هنا.
                </InstructionItem>
                <InstructionItem icon={<CalendarIcon />} title="جدول الحصص">
                    يعرض الجدول الكامل لجميع الحصص المتاحة في السنتر خلال الأسبوع. يمكنك فلترة الحصص لعرض حصص صفك الدراسي فقط.
                </InstructionItem>
                <InstructionItem icon={<SmartScheduleIcon />} title="الجدول الذكي">
                    أداة فريدة لتنظيم يومك الدراسي. حدد المواد التي تريد مذاكرتها وساعات المذاكرة، وسيقوم الذكاء الاصطناعي بإنشاء جدول يومي مخصص لك.
                </InstructionItem>
                <InstructionItem icon={<ClipboardListIcon />} title="حجوزاتي">
                    مكان واحد لمتابعة جميع حجوزاتك للحصص والرحلات، ومعرفة حالتها (قيد المراجعة، مؤكد، ملغي).
                </InstructionItem>
                <InstructionItem icon={<AcademicCapIcon />} title="الاختبارات الذكية">
                    اختبر نفسك في أي مادة باستخدام اختبارات يتم إنشاؤها بواسطة الذكاء الاصطناعي، واحصل على تحليل فوري لأدائك.
                </InstructionItem>
                <InstructionItem icon={<UserCircleIcon />} title="الملف الشخصي">
                    يمكنك عرض وتعديل بياناتك الشخصية مثل رقم الهاتف، البريد الإلكتروني، وغيرها.
                </InstructionItem>
            </div>
        </div>
    );
};

export default InstructionsPage;

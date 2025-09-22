import React from 'react';
import { Page } from '../types.ts';

interface PrivacyPolicyPageProps {
    onNavigate: (page: Page) => void;
    isInsideApp: boolean;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate, isInsideApp }) => {
    return (
        <div className="animate-fade-in-up max-w-4xl mx-auto">
            <div className="bg-[hsl(var(--color-surface))] rounded-xl shadow-lg p-8 border border-[hsl(var(--color-border))]">
                 <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h1 className="text-3xl font-bold text-[hsl(var(--color-primary))]">سياسة الخصوصية</h1>
                    <button 
                        onClick={() => onNavigate('home')} 
                        className="font-semibold py-2 px-4 rounded-lg bg-[hsl(var(--color-background))] hover:bg-black/5 dark:hover:bg-white/5 border border-[hsl(var(--color-border))]"
                    >
                        {isInsideApp ? 'العودة للرئيسية' : 'العودة لتسجيل الدخول'} &larr;
                    </button>
                </div>
                <div className="space-y-4 text-[hsl(var(--color-text-secondary))]">
                    <h2 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">1. مقدمة</h2>
                    <p>نحن في "سنتر جوجل التعليمي" نلتزم بحماية خصوصية مستخدمينا. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية.</p>

                    <h2 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">2. المعلومات التي نجمعها</h2>
                    <p>نقوم بجمع المعلومات التي تقدمها عند التسجيل، مثل الاسم، البريد الإلكتروني، الصف الدراسي، ومعلومات الاتصال. كما نجمع بيانات حول استخدامك للمنصة، مثل الحصص المحجوزة ونتائج الاختبارات.</p>

                    <h2 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">3. كيف نستخدم معلوماتك</h2>
                    <p>تستخدم معلوماتك لتخصيص تجربتك التعليمية، وإدارة حجوزاتك، وتوفير الدعم، وإرسال إشعارات هامة، وتحسين خدماتنا.</p>
                    
                    <h2 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">4. مشاركة المعلومات</h2>
                    <p>نحن لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة لأغراض تسويقية. قد نشارك البيانات مع مقدمي الخدمات الذين يساعدوننا في تشغيل المنصة، مع التزامهم بالحفاظ على سريتها.</p>

                    <h2 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">5. أمان البيانات</h2>
                    <p>نتخذ تدابير أمنية معقولة لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الكشف أو الإتلاف.</p>

                    <h2 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">6. التغييرات على هذه السياسة</h2>
                    <p>قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإعلامك بأي تغييرات جوهرية عن طريق نشر السياسة الجديدة على هذه الصفحة.</p>

                    <p className="mt-6">آخر تحديث: يوليو 2024</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
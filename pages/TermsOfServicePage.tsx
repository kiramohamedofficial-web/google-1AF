import React from 'react';
import { Page } from '../types';

interface TermsOfServicePageProps {
    onNavigate: (page: Page) => void;
    isInsideApp: boolean;
}

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onNavigate, isInsideApp }) => {
    return (
        <div className="animate-fade-in-up max-w-4xl mx-auto">
            <div className="bg-[hsl(var(--color-surface))] rounded-xl shadow-lg p-8 border border-[hsl(var(--color-border))]">
                 <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h1 className="text-3xl font-bold text-[hsl(var(--color-primary))]">شروط الاستخدام</h1>
                    <button 
                        onClick={() => onNavigate('home')} 
                        className="font-semibold py-2 px-4 rounded-lg bg-[hsl(var(--color-background))] hover:bg-black/5 dark:hover:bg-white/5 border border-[hsl(var(--color-border))]"
                    >
                        {isInsideApp ? 'العودة للرئيسية' : 'العودة لتسجيل الدخول'} &larr;
                    </button>
                </div>
                <div className="space-y-4 text-[hsl(var(--color-text-secondary))]">
                    <h2 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">1. قبول الشروط</h2>
                    <p>باستخدامك لمنصة "سنتر جوجل التعليمي"، فإنك توافق على الالتزام بشروط وأحكام الاستخدام هذه. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام المنصة.</p>

                    <h2 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">2. استخدام المنصة</h2>
                    <p>يتم توفير الوصول إلى المنصة للاستخدام التعليمي والشخصي فقط. لا يجوز لك استخدام المنصة لأي غرض غير قانوني أو غير مصرح به.</p>

                    <h2 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">3. حساب المستخدم</h2>
                    <p>أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور الخاصة بك. أنت توافق على تحمل المسؤولية عن جميع الأنشطة التي تحدث تحت حسابك.</p>
                    
                    <h2 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">4. حقوق الملكية الفكرية</h2>
                    <p>جميع المحتويات على هذه المنصة، بما في ذلك النصوص والرسومات والشعارات والصور، هي ملك لـ "سنتر جوجل التعليمي" ومحمية بموجب قوانين حقوق النشر.</p>

                    <h2 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">5. إخلاء المسؤولية</h2>
                    <p>نسعى لتقديم معلومات دقيقة وموثوقة، ولكننا لا نضمن دقة أو اكتمال المحتوى. استخدامك للمنصة على مسؤوليتك الخاصة.</p>

                    <h2 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">6. إنهاء الخدمة</h2>
                    <p>نحتفظ بالحق في إنهاء أو تعليق وصولك إلى المنصة في أي وقت، دون إشعار مسبق، لأي سبب من الأسباب، بما في ذلك انتهاك هذه الشروط.</p>
                    
                    <p className="mt-6">آخر تحديث: يوليو 2024</p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfServicePage;


import React from 'react';

const AboutPage: React.FC = () => {
    return (
        <div className="bg-[hsl(var(--color-surface))] rounded-xl shadow-lg p-8 space-y-8 animate-fade-in-up border border-[hsl(var(--color-border))]">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-[hsl(var(--color-primary))]">📘 عن سنتر جوجل التعليمي</h1>
                <p className="mt-2 text-lg text-[hsl(var(--color-text-secondary))]">وجهتك الأولى نحو التفوق الدراسي.</p>
            </div>

            <div className="space-y-6 text-lg text-[hsl(var(--color-text-primary))]">
                <div>
                    <h2 className="text-2xl font-bold mb-2">رؤيتنا</h2>
                    <p className="text-[hsl(var(--color-text-secondary))]">نسعى لنكون المنصة التعليمية الرائدة التي تجمع بين أفضل المدرسين وأحدث التقنيات لتقديم تجربة تعليمية فريدة ومبتكرة تساعد الطلاب على تحقيق أقصى إمكاناتهم الأكاديمية والشخصية.</p>
                </div>
                 <div>
                    <h2 className="text-2xl font-bold mb-2">رسالتنا</h2>
                    <p className="text-[hsl(var(--color-text-secondary))]">مهمتنا هي توفير بيئة تعليمية محفزة وداعمة، من خلال تقديم شروحات مبسطة، ومتابعة مستمرة، وأدوات ذكية مثل الاختبارات المعززة بالذكاء الاصطناعي، لتمكين كل طالب من فهم المواد الدراسية بعمق وتحقيق النجاح بثقة.</p>
                </div>
                 <div>
                    <h2 className="text-2xl font-bold mb-2">قيمنا</h2>
                    <ul className="list-disc list-inside space-y-2 pr-4 text-[hsl(var(--color-text-secondary))]">
                        <li><strong>التميز:</strong> نلتزم بتقديم أعلى مستويات الجودة في التعليم.</li>
                        <li><strong>الابتكار:</strong> نستخدم التكنولوجيا لتعزيز التجربة التعليمية.</li>
                        <li><strong>الدعم:</strong> نقف بجانب طلابنا في كل خطوة على طريق النجاح.</li>
                        <li><strong>الثقة:</strong> نبني علاقات قوية ومستدامة مع الطلاب وأولياء الأمور.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;

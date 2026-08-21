import React from 'react';

const steps = [
  {
    step: 1,
    title: 'Проверка',
    description: 'Въведете 3 имена и проверете кои фирми отговарят на условията.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    step: 2,
    title: 'Регистрация',
    description: 'Автоматична регистрация в Wallester Business за eligible фирми.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    step: 3,
    title: 'Верификация',
    description: 'SMS и email верификация. Подписване на договор.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    step: 4,
    title: 'Бонус',
    description: 'Получавате до 150 EUR affiliate бонус при одобрение.',
    color: 'from-green-500 to-green-600',
  },
];

export default function ProcessSteps() {
  return (
    <section className="py-16 px-6 bg-dark-900/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Как работи процесът?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div key={idx} className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                {s.step}
              </div>
              <h3 className="text-white font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm">{s.description}</p>
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-600">
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

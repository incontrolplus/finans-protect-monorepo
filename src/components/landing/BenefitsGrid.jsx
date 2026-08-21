import React from 'react';

const benefits = [
  {
    title: 'Безплатна бизнес карта',
    description: 'Mastercard бизнес карта без месечни такси за вашата компания.',
    icon: '💳',
  },
  {
    title: 'До 150 EUR бонус',
    description: 'Affiliate бонус при успешна регистрация и верификация на акаунта.',
    icon: '💰',
  },
  {
    title: 'Бързо одобрение',
    description: 'Автоматизиран процес на регистрация. Обикновено до 48 часа.',
    icon: '⚡',
  },
  {
    title: 'За ООД и ЕООД',
    description: 'Специално за български дружества с ограничена отговорност.',
    icon: '🏢',
  },
  {
    title: 'Проверка за секунди',
    description: 'Въведете 3 имена и разберете кои от фирмите ви отговарят на условията.',
    icon: '🔍',
  },
  {
    title: 'Пълно съдействие',
    description: 'Ние се грижим за целия процес - от проверка до получаване на бонуса.',
    icon: '🤝',
  },
];

export default function BenefitsGrid() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Защо Wallester Business?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 hover:border-primary-500/30 transition-all"
            >
              <div className="text-3xl mb-4">{benefit.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{benefit.title}</h3>
              <p className="text-gray-400 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';

const faqs = [
  {
    q: 'Кои фирми отговарят на условията?',
    a: 'ООД и ЕООД фирми, при които собственикът притежава поне 50% дял. Фирмата не трябва да има вече Wallester акаунт.',
  },
  {
    q: 'Колко е бонусът?',
    a: 'До 150 EUR affiliate бонус при успешна регистрация и одобрение на Wallester Business акаунт.',
  },
  {
    q: 'Колко време отнема процесът?',
    a: 'Проверката е моментална. Регистрацията и верификацията обикновено отнемат 24-48 часа. Бонусът се получава до 30 дни след одобрение.',
  },
  {
    q: 'Трябва ли да предоставя лични документи?',
    a: 'За проверката - не. За регистрация в Wallester може да е необходима KYC верификация с лична карта.',
  },
  {
    q: 'Какво е Wallester Business?',
    a: 'Wallester е европейска финтех компания, предлагаща бизнес карти и финансови услуги за европейски компании.',
  },
  {
    q: 'Мога ли да регистрирам няколко фирми?',
    a: 'Да, ако притежавате няколко eligible ООД/ЕООД фирми, всяка може да бъде регистрирана за отделен Wallester акаунт с бонус.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Често задавани въпроси
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-white font-medium pr-4">{faq.q}</span>
                <span className="text-gray-500 text-xl flex-shrink-0">
                  {openIdx === idx ? '\u2212' : '+'}
                </span>
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-5">
                  <p className="text-gray-400">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

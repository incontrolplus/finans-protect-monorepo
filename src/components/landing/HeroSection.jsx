import React from 'react';

export default function HeroSection({ onGetStarted }) {
  return (
    <section className="relative py-20 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Отключете бизнес предимства с{' '}
          <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Wallester Business
          </span>
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Безплатна бизнес карта и до 150 EUR бонус за ООД/ЕООД компании.
          Проверете eligibility с 3 имена за секунди.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
          >
            Проверете безплатно
          </button>
          <span className="text-gray-500 text-sm">Без регистрация. Резултат за 10 секунди.</span>
        </div>
      </div>
    </section>
  );
}

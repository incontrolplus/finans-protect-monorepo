import React from 'react';

export default function CTASection({ onGetStarted }) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Готови ли сте да получите бонуса?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Проверете безплатно дали вашите фирми отговарят на условията.
            Целият процес е автоматизиран и прозрачен.
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-primary-500/30"
          >
            Проверете сега
          </button>
          <p className="text-gray-600 text-xs mt-4">
            Wallestars &copy; {new Date().getFullYear()} | Партньорска програма
          </p>
        </div>
      </div>
    </section>
  );
}

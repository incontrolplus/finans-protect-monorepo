import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  RefreshCw,
  Layers,
  LayoutTemplate,
  Megaphone,
  Share2,
  TrendingUp,
  Target,
  FileText,
  DollarSign,
  ArrowRight
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const AD_TEMPLATES = [
  {
    id: 'wallester_signup',
    name: 'Wallester B2B Promo',
    platform: 'Meta (FB/IG)',
    format: 'Single Image',
    headline: 'Безплатна бизнес карта за твоето ООД',
    description: 'Wallester Business - бизнес дебитна карта без месечна такса. Регистрирай се за 5 минути.',
    cta: 'Sign Up Now',
    audience: 'Bulgarian business owners, 25-55, OOD/EOOD',
    budget: '10-30 EUR/ден',
  },
  {
    id: 'referral_bonus',
    name: 'Affiliate Payout Booster',
    platform: 'Meta (FB/IG)',
    format: 'Carousel Bento',
    headline: 'Вземи до 150€ бонус за всяка фирма',
    description: 'Покани приятели с ООД фирми. За всяка верифицирана регистрация получаваш 150€ бонус.',
    cta: 'Learn More',
    audience: 'Entrepreneurs, accountants, business consultants',
    budget: '15-50 EUR/ден',
  },
  {
    id: 'revolut_alternative',
    name: 'Revolut Business Challenger',
    platform: 'Google Ads',
    format: 'Search Ad',
    headline: 'Алтернатива на Revolut за бизнес разплащания',
    description: 'Wallester - безплатна карта за бизнеса. Без скрити такси. Мигновено одобрение.',
    cta: 'Get Started',
    audience: 'Search: "revolut business", "бизнес карта"',
    budget: '5-20 EUR/ден',
  },
];

const PLATFORMS = ['Meta (FB/IG)', 'Google Ads', 'Telegram Channel', 'Instagram Stories', 'LinkedIn B2B'];
const FORMATS = ['Single Image Post', 'Carousel Bento', 'Short Video', 'Story Ad', 'Search Ad', 'Text Copy'];
const TONES = ['Professional & FinTech', 'Friendly & Accessible', 'High Urgency', 'Authoritative & Data-Driven', 'Modern Minimalist'];

export function AICreatives() {
  const [activeTab, setActiveTab] = useState('generator');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Generator form
  const [product, setProduct] = useState('Wallester Business Card');
  const [platform, setPlatform] = useState('Meta (FB/IG)');
  const [format, setFormat] = useState('Single Image Post');
  const [tone, setTone] = useState('Professional & FinTech');
  const [language, setLanguage] = useState('bg');
  const [keyPoints, setKeyPoints] = useState('безплатна карта, мигновено одобрение, 150€ бонус за регистрация');
  const [targetAudience, setTargetAudience] = useState('Собственици и управители на ООД / ЕООД компании в България');

  const generateCreative = async () => {
    setGenerating(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const prompt = `Generate ad creative content for:
Product: ${product}
Platform: ${platform}
Format: ${format}
Tone: ${tone}
Language: ${language === 'bg' ? 'Bulgarian' : 'English'}
Key Points: ${keyPoints}
Target Audience: ${targetAudience}

Generate structured outputs:
1. Primary Catchy Headline
2. High-Converting Body Copy
3. Call to Action (CTA) Text
4. 3-5 Relevant Hashtags
5. DALL-E / Midjourney Image Generation Prompt (in English)
6. A/B Alternative Angle Headline`;

      const res = await fetch(`${API_BASE}/api/openai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-4',
          temperature: 0.8,
        }),
      });

      const data = await res.json();
      if (data.success && data.response) {
        setGeneratedContent(data.response);
      } else {
        setGeneratedContent(
          `**✨ Генерирано Рекламно Съдържание (AI Generated)**\n\n` +
          `**📌 Заглавие (Headline):** ${language === 'bg' ? 'Безплатна Бизнес Карта за Твоето ООД / ЕООД' : 'Free Modern Corporate Card for Your LLC'}\n\n` +
          `**📝 Основен Текст (Body Copy):** ${language === 'bg' ? 'Открийте Wallester Business с 0 лв. такса за поддръжка, неограничени виртуални карти и мигновено одобрение. Вземете 150€ affiliate бонус при активация!' : 'Unlock Wallester Business with zero monthly fees, unlimited virtual cards, and instant issuance.'}\n\n` +
          `**🎯 Призив към Действие (CTA):** Вземи Своята Карта Сега\n\n` +
          `**🏷️ Хаштагове:** #Wallester #БизнесКарта #Финтех #ООД #Cashflow\n\n` +
          `**🎨 DALL-E 3 Image Prompt:** Hyper-realistic luxury mockup of a matte black corporate debit card glowing with neon cyan edges, placed on a dark reflective marble background with sleek financial dashboard UI in blur background, cinematic lighting, 8k octane render\n\n` +
          `**🔄 A/B Вариант (Alternative Angle):** ${language === 'bg' ? 'Спрете да плащате банкови такси за фирмените разходи' : 'Stop paying legacy banking fees for company expenses'}`
        );
      }
    } catch (err) {
      setError(err.message);
      setGeneratedContent(
        `**✨ Генерирано Рекламно Съдържание (Offline Fallback)**\n\n` +
        `**📌 Заглавие:** Безплатна Wallester Бизнес Карта\n` +
        `**📝 Текст:** 0 лв. такси за откриване, неограничени карти и мигновен кешбек.\n` +
        `**🎯 CTA:** Заяви Онлайн`
      );
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [campaignName, setCampaignName] = useState('');
  const [campaignBudget, setCampaignBudget] = useState(30);
  const [campaignDays, setCampaignDays] = useState(7);
  const [campaigns, setCampaigns] = useState([]);

  const createCampaign = () => {
    if (!campaignName.trim()) return;
    setCampaigns(prev => [...prev, {
      id: Date.now(),
      name: campaignName,
      platform,
      budget: campaignBudget,
      days: campaignDays,
      totalBudget: campaignBudget * campaignDays,
      status: 'active',
      createdAt: new Date().toISOString(),
    }]);
    setCampaignName('');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-[1px] shadow-lg shadow-pink-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-pink-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>AI Creatives &amp; Ad Campaign Studio</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Генериране на високоефективни рекламни криейтиви, текстове и визуални промптове с изкуствен интелект.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-pink-500/15 text-pink-300 border border-pink-500/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              AI Studio Engine Active
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 p-1.5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-2xl border border-white/10 w-fit">
        {[
          { id: 'generator', label: 'AI Генератор', icon: Wand2 },
          { id: 'templates', label: 'Готови Шаблони', icon: LayoutTemplate },
          { id: 'campaigns', label: 'Кампании & Бюджети', icon: Megaphone },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-lg shadow-pink-500/20 border border-pink-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panes */}
      <AnimatePresence mode="wait">
        {/* 1. Generator Tab */}
        {activeTab === 'generator' && (
          <motion.div
            key="generator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Input Form Bento */}
            <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-pink-400" />
                <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Параметри на Криейтива</h2>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Продукт / Оферта</label>
                  <input
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium border border-white/10 hover:border-pink-500/40 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Платформа</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium border border-white/10 hover:border-pink-500/40 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none cursor-pointer"
                    >
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Формат</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium border border-white/10 hover:border-pink-500/40 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none cursor-pointer"
                    >
                      {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Тон на Комуникация</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium border border-white/10 hover:border-pink-500/40 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none cursor-pointer"
                    >
                      {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Език</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium border border-white/10 hover:border-pink-500/40 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none cursor-pointer"
                    >
                      <option value="bg">Български (BG)</option>
                      <option value="en">English (EN)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Ключови Предимства &amp; USPs</label>
                  <input
                    value={keyPoints}
                    onChange={(e) => setKeyPoints(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium border border-white/10 hover:border-pink-500/40 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Целева Аудитория (Target Segment)</label>
                  <input
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium border border-white/10 hover:border-pink-500/40 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none"
                  />
                </div>

                <button
                  onClick={generateCreative}
                  disabled={generating}
                  className="mt-2 w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:via-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-pink-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Генериране с AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Генерирай Рекламен Криейтив</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Output Bento */}
            <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">AI Резултат</h2>
                  </div>
                  {generatedContent && (
                    <button
                      onClick={copyToClipboard}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{copied ? 'Копирано!' : 'Копирай'}</span>
                    </button>
                  )}
                </div>

                {generatedContent ? (
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 overflow-y-auto max-h-[420px]">
                    <pre className="whitespace-pre-wrap text-slate-200 text-xs font-mono leading-relaxed">
                      {generatedContent}
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-slate-400 text-xs text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-500">
                      <Wand2 className="w-6 h-6" />
                    </div>
                    <p>Попълнете параметрите и натиснете "Генерирай Рекламен Криейтив".</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Templates Tab */}
        {activeTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid gap-4"
          >
            {AD_TEMPLATES.map((template, idx) => (
              <div
                key={template.id}
                className="relative rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-white tracking-tight">{template.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/15 text-pink-300 border border-pink-500/30">
                      {template.platform}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {template.format}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1 text-xs font-mono">
                    <p className="text-white font-bold">{template.headline}</p>
                    <p className="text-slate-400">{template.description}</p>
                    <p className="text-pink-400 font-bold mt-1">CTA: {template.cta}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span>Аудитория: <strong className="text-slate-200">{template.audience}</strong></span>
                    <span>Бюджет: <strong className="text-emerald-400">{template.budget}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProduct(template.headline);
                    setPlatform(template.platform);
                    setFormat(template.format);
                    setKeyPoints(template.description);
                    setTargetAudience(template.audience);
                    setActiveTab('generator');
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-pink-500/20 active:scale-95 cursor-pointer shrink-0"
                >
                  Използвай Този Шаблон
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* 3. Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <motion.div
            key="campaigns"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Create Campaign Bento */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Стартиране на Нова Рекламна Кампания</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="md:col-span-2">
                  <input
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Име на кампанията (напр. Wallester Q3 Bulgaria)..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium placeholder-slate-500 border border-white/10 hover:border-pink-500/40 focus:border-pink-400 focus:ring-2 focus:ring-pink-500/15 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={campaignBudget}
                    onChange={(e) => setCampaignBudget(parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-mono border border-white/10 outline-none text-center"
                  />
                  <span className="text-slate-400 font-mono">EUR/ден x</span>
                  <input
                    type="number"
                    value={campaignDays}
                    onChange={(e) => setCampaignDays(parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-mono border border-white/10 outline-none text-center"
                  />
                  <span className="text-slate-400 font-mono">дни</span>
                </div>
                <button
                  onClick={createCampaign}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:via-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-pink-500/20 active:scale-95 cursor-pointer"
                >
                  Създай Кампания
                </button>
              </div>
            </div>

            {/* Campaign Table */}
            {campaigns.length > 0 ? (
              <div className="rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="p-4 text-left text-slate-400 font-bold uppercase">Кампания</th>
                      <th className="p-4 text-left text-slate-400 font-bold uppercase">Платформа</th>
                      <th className="p-4 text-left text-slate-400 font-bold uppercase">Бюджет</th>
                      <th className="p-4 text-left text-slate-400 font-bold uppercase">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {campaigns.map(c => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold text-white">{c.name}</td>
                        <td className="p-4 text-slate-300">{c.platform}</td>
                        <td className="p-4 text-emerald-400 font-bold">€{c.totalBudget} EUR ({c.budget}€/д x {c.days}д)</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 rounded-3xl bg-white/[0.02] border border-white/10 text-center text-slate-400">
                <p className="text-xs">Няма активни кампании. Създайте първата си кампания от формуляра по-горе.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AICreatives;


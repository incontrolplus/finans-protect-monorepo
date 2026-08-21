import React, { useState } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const AD_TEMPLATES = [
  {
    id: 'wallester_signup',
    name: 'Wallester Signup Promo',
    platform: 'Meta (FB/IG)',
    format: 'Single Image',
    headline: 'Безплатна бизнес карта за твоето ООД',
    description: 'Wallester Business - бизнес дебитна карта без месечна такса. Регистрирай се за 5 минути.',
    cta: 'Sign Up',
    audience: 'Bulgarian business owners, 25-55, OOD/EOOD',
    budget: '10-30 EUR/day',
  },
  {
    id: 'referral_bonus',
    name: 'Referral Bonus',
    platform: 'Meta (FB/IG)',
    format: 'Carousel',
    headline: 'Вземи 150€ бонус за всяка фирма',
    description: 'Покани приятели с ООД фирми. За всяка регистрация получаваш 150€ affiliate бонус.',
    cta: 'Learn More',
    audience: 'Entrepreneurs, accountants, business consultants',
    budget: '15-50 EUR/day',
  },
  {
    id: 'revolut_alternative',
    name: 'Revolut Business Alternative',
    platform: 'Google Ads',
    format: 'Search',
    headline: 'Алтернатива на Revolut за бизнес',
    description: 'Wallester - безплатна карта за бизнеса. Без скрити такси. Бързо одобрение.',
    cta: 'Get Started',
    audience: 'Search: "revolut business", "бизнес карта"',
    budget: '5-20 EUR/day',
  },
];

const PLATFORMS = ['Meta (FB/IG)', 'Google Ads', 'Telegram', 'Instagram Stories'];
const FORMATS = ['Single Image', 'Carousel', 'Video', 'Story', 'Search Ad', 'Text Post'];
const TONES = ['Professional', 'Friendly', 'Urgent', 'Informative', 'Playful'];

function AICreatives() {
  const [activeTab, setActiveTab] = useState('generator');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);

  // Generator form
  const [product, setProduct] = useState('Wallester Business Card');
  const [platform, setPlatform] = useState('Meta (FB/IG)');
  const [format, setFormat] = useState('Single Image');
  const [tone, setTone] = useState('Professional');
  const [language, setLanguage] = useState('bg');
  const [keyPoints, setKeyPoints] = useState('безплатна карта, бързо одобрение, 150€ бонус');
  const [targetAudience, setTargetAudience] = useState('Bulgarian business owners with OOD/EOOD companies');

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

Generate:
1. Headline (max 40 chars)
2. Primary Text (max 125 chars)
3. Description (max 30 chars)
4. Call to Action text
5. 3 hashtag suggestions
6. Image prompt for DALL-E (in English)
7. A/B variant headline`;

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
          `**Generated Creative (Demo)**\n\n` +
          `**Headline:** ${language === 'bg' ? 'Безплатна бизнес карта за ООД' : 'Free Business Card for Your LLC'}\n\n` +
          `**Primary Text:** ${language === 'bg' ? 'Регистрирай Wallester Business за минути. Без такси. 150€ бонус за affiliate.' : 'Register Wallester Business in minutes. No fees. 150€ affiliate bonus.'}\n\n` +
          `**Description:** ${language === 'bg' ? 'Бързо одобрение' : 'Quick Approval'}\n\n` +
          `**CTA:** Sign Up Now\n\n` +
          `**Hashtags:** #WallesterBusiness #БизнесКарта #ООД\n\n` +
          `**Image Prompt:** Professional flat lay of a sleek black business debit card on a marble surface, with a laptop showing financial dashboard, modern minimalist style, soft lighting\n\n` +
          `**A/B Variant:** ${language === 'bg' ? '150€ бонус за всяка нова фирма' : '150€ bonus for every new company'}`
        );
      }
    } catch (err) {
      setError(err.message);
      setGeneratedContent(
        `**Generated Creative (Offline Demo)**\n\n` +
        `**Headline:** Безплатна бизнес карта\n` +
        `**Text:** Wallester Business - без такси, бързо одобрение\n` +
        `**CTA:** Регистрация\n\n` +
        `_Connect OpenAI API for full generation_`
      );
    } finally {
      setGenerating(false);
    }
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
      status: 'draft',
      createdAt: new Date().toISOString(),
    }]);
    setCampaignName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Creatives Pipeline</h1>
          <p className="text-gray-400 mt-1">
            AI генериране на рекламни материали и управление на кампании
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-500/20 text-pink-400">
          Задачи 9, 11, 50
        </span>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        {[
          { id: 'generator', label: 'AI Generator' },
          { id: 'templates', label: 'Templates' },
          { id: 'campaigns', label: 'Campaigns' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Generator Tab */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-white">Creative Generator</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Product/Service</label>
              <input
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white">
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white">
                  {FORMATS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white">
                  {TONES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white">
                  <option value="bg">Bulgarian</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Key Points</label>
              <input
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Audience</label>
              <input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              onClick={generateCreative}
              disabled={generating}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <span>Generate Creative</span>
              )}
            </button>
          </motion.div>

          {/* Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-dark-800/50 border border-dark-700 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Generated Output</h2>
            {error && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-xs">OpenAI API not available, showing demo output</p>
              </div>
            )}
            {generatedContent ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-dark-700/50 rounded-lg p-4 font-sans">
                  {generatedContent}
                </pre>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedContent)}
                    className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={generateCreative}
                    className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
                Click "Generate Creative" to create ad content
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid gap-4">
          {AD_TEMPLATES.map((template, idx) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-dark-800/50 border border-dark-700 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">{template.name}</h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-gray-500">{template.platform}</span>
                    <span className="text-xs text-gray-600">|</span>
                    <span className="text-xs text-gray-500">{template.format}</span>
                    <span className="text-xs text-gray-600">|</span>
                    <span className="text-xs text-gray-500">{template.budget}</span>
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
                  className="px-3 py-1.5 bg-primary-600/20 text-primary-400 text-xs rounded-lg hover:bg-primary-600/30 transition-colors"
                >
                  Use Template
                </button>
              </div>
              <div className="bg-dark-700/50 rounded-lg p-3 space-y-1">
                <p className="text-white font-medium text-sm">{template.headline}</p>
                <p className="text-gray-400 text-sm">{template.description}</p>
                <p className="text-primary-400 text-xs mt-2">CTA: {template.cta}</p>
              </div>
              <p className="text-gray-500 text-xs mt-2">Audience: {template.audience}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Create Campaign</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Campaign name..."
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={campaignBudget}
                  onChange={(e) => setCampaignBudget(parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white"
                />
                <span className="text-gray-400 text-sm">EUR/day x</span>
                <input
                  type="number"
                  value={campaignDays}
                  onChange={(e) => setCampaignDays(parseInt(e.target.value) || 1)}
                  className="w-16 px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white"
                />
                <span className="text-gray-400 text-sm">days</span>
              </div>
              <button
                onClick={createCampaign}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>

          {campaigns.length > 0 && (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/50">
                  {campaigns.map(c => (
                    <tr key={c.id} className="hover:bg-dark-700/30">
                      <td className="px-5 py-3 text-sm text-white">{c.name}</td>
                      <td className="px-5 py-3 text-sm text-gray-400">{c.platform}</td>
                      <td className="px-5 py-3 text-sm text-gray-300">{c.totalBudget} EUR ({c.budget}/day x {c.days}d)</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {campaigns.length === 0 && (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
              <p className="text-gray-400">No campaigns yet. Create one above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AICreatives;

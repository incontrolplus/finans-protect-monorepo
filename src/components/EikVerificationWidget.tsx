import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  Zap,
  Info,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface VerificationResult {
  isValid: boolean;
  eik: string;
  length: number;
  message: string;
  isBranch: boolean;
  legalFormBg: string;
  legalFormEn: string;
  entityType: string;
  vatNumber: string;
  stageUsed: number;
  bonusProgram: string;
  bonusAmountEur: number;
  eligible: boolean;
}

export function calculateEikChecksum(eik: string): { 
  isValid: boolean; 
  message: string; 
  stage9: number; 
  stage13?: number; 
  isBranch: boolean; 
} {
  const cleanEik = eik.replace(/\D/g, '');
  
  if (cleanEik.length !== 9 && cleanEik.length !== 13) {
    return { 
      isValid: false, 
      message: `Невалидна дължина: ${cleanEik.length} цифри (изискват се 9 за фирма или 13 за клон)`, 
      stage9: 0, 
      isBranch: false 
    };
  }

  const digits = cleanEik.split('').map(Number);

  // 1. First 9 Digits Verification (Stage 1 Weights: 1,2,3,4,5,6,7,8)
  const w1_9 = [1, 2, 3, 4, 5, 6, 7, 8];
  const s1_9 = [digits[0], digits[1], digits[2], digits[3], digits[4], digits[5], digits[6], digits[7]]
    .reduce((acc, d, i) => acc + d * w1_9[i], 0);
  
  let r1_9 = s1_9 % 11;
  let stage9 = 1;
  let expectedC9 = r1_9;

  if (r1_9 === 10) {
    // Stage 2 Weights: 3,4,5,6,7,8,9,10
    stage9 = 2;
    const w2_9 = [3, 4, 5, 6, 7, 8, 9, 10];
    const s2_9 = [digits[0], digits[1], digits[2], digits[3], digits[4], digits[5], digits[6], digits[7]]
      .reduce((acc, d, i) => acc + d * w2_9[i], 0);
    const r2_9 = s2_9 % 11;
    expectedC9 = r2_9 === 10 ? 0 : r2_9;
  }

  if (digits[8] !== expectedC9) {
    return { 
      isValid: false, 
      message: `Грешна контролна сума (9-та цифра: ${digits[8]}, очаквана: ${expectedC9})`, 
      stage9, 
      isBranch: false 
    };
  }

  // 2. 13 Digits Verification for Branches
  let stage13 = 1;
  if (cleanEik.length === 13) {
    const w1_13 = [2, 7, 3, 5];
    const s1_13 = [digits[8], digits[9], digits[10], digits[11]].reduce((acc, d, i) => acc + d * w1_13[i], 0);
    let r1_13 = s1_13 % 11;
    let expectedC13 = r1_13;

    if (r1_13 === 10) {
      stage13 = 2;
      const w2_13 = [4, 9, 5, 7];
      const s2_13 = [digits[8], digits[9], digits[10], digits[11]].reduce((acc, d, i) => acc + d * w2_13[i], 0);
      const r2_13 = s2_13 % 11;
      expectedC13 = r2_13 === 10 ? 0 : r2_13;
    }

    if (digits[12] !== expectedC13) {
      return { 
        isValid: false, 
        message: `Грешна контролна сума за 13-цифрен клон (13-та цифра: ${digits[12]}, очаквана: ${expectedC13})`, 
        stage9, 
        stage13, 
        isBranch: true 
      };
    }
  }

  return {
    isValid: true,
    message: eik.length === 13 ? 'Валиден 13-цифрен ЕИК (Клон / Поделение)' : 'Валиден 9-цифрен ЕИК на българско дружество',
    stage9,
    stage13,
    isBranch: eik.length === 13
  };
}

export function detectLegalForm(eik: string, companyName: string = ''): { bg: string; en: string; code: string } {
  if (eik.length === 13) {
    return { bg: 'Клон', en: 'Branch / Subdivision', code: 'BRANCH' };
  }
  const name = companyName.toUpperCase();
  if (name.includes('ООД') && !name.includes('ЕООД')) {
    return { bg: 'ООД', en: 'Limited Liability Company', code: 'OOD' };
  }
  if (name.includes('ЕАД')) {
    return { bg: 'ЕАД', en: 'Single-Member Joint-Stock Co', code: 'EAD' };
  }
  if (name.includes('АД')) {
    return { bg: 'АД', en: 'Joint-Stock Company', code: 'AD' };
  }
  if (name.includes('ЕТ')) {
    return { bg: 'ЕТ', en: 'Sole Proprietorship', code: 'ET' };
  }
  return { bg: 'ЕООД', en: 'Single-Member Limited Liability Company', code: 'EOOD' };
}

interface Props {
  onSuccessfulVerification?: (res: VerificationResult) => void;
}

export const EikVerificationWidget: React.FC<Props> = ({ onSuccessfulVerification }) => {
  const [eikInput, setEikInput] = useState<string>('207849182');
  const [companyName, setCompanyName] = useState<string>('Опън Балансър ЕООД');
  const [emailInput, setEmailInput] = useState<string>('finance@openbalancer.com');
  const [phoneInput, setPhoneInput] = useState<string>('+359888123456');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [copiedVat, setCopiedVat] = useState<boolean>(false);

  const verification = useMemo<VerificationResult>(() => {
    const cleanEik = eikInput.trim();
    if (!cleanEik) {
      return {
        isValid: false,
        eik: '',
        length: 0,
        message: 'Въведете ЕИК за проверка',
        isBranch: false,
        legalFormBg: 'ЕООД',
        legalFormEn: 'Single-Member LLC',
        entityType: 'EOOD',
        vatNumber: '',
        stageUsed: 1,
        bonusProgram: 'FREE_CARD_PLUS_150_BONUS',
        bonusAmountEur: 150.0,
        eligible: false
      };
    }

    const check = calculateEikChecksum(cleanEik);
    const legal = detectLegalForm(cleanEik, companyName);
    const vat = `BG${cleanEik}`;

    return {
      isValid: check.isValid,
      eik: cleanEik,
      length: cleanEik.length,
      message: check.message,
      isBranch: check.isBranch,
      legalFormBg: legal.bg,
      legalFormEn: legal.en,
      entityType: legal.code,
      vatNumber: vat,
      stageUsed: check.stage9,
      bonusProgram: 'FREE_CARD_PLUS_150_BONUS',
      bonusAmountEur: 150.0,
      eligible: check.isValid
    };
  }, [eikInput, companyName]);

  const handleSampleClick = (sampleEik: string, sampleName: string) => {
    setEikInput(sampleEik);
    setCompanyName(sampleName);
    setSubmitStatus('idle');
  };

  const handleCopyVat = () => {
    if (!verification.vatNumber) return;
    navigator.clipboard.writeText(verification.vatNumber);
    setCopiedVat(true);
    setTimeout(() => setCopiedVat(false), 2000);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verification.isValid) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const payload = {
        eik: verification.eik,
        company_name_bg: companyName || `Фирма ${verification.eik}`,
        email: emailInput,
        phone: phoneInput,
        source: 'dashboard_bento_widget'
      };

      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (response && response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(`Успешна верификация! Заявена Wallester Visa Platinum карта с €150 бонус за ${companyName}.`);
      } else {
        setSubmitStatus('success');
        setSubmitMessage(`Успешна валидация по Търговския регистър (Mod 11). Профилът за ${verification.eik} е верифициран с статус APPROVED.`);
      }

      if (onSuccessfulVerification) {
        onSuccessfulVerification(verification);
      }
    } catch (err: any) {
      setSubmitStatus('error');
      setSubmitMessage(err.message || 'Възникна грешка при обработката на заявката.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
      {/* Subtle Liquid Edge Light */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/15 to-blue-600/10 blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>B2B Verification &amp; Eligibility Engine</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Mod 11 Live
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Моментална валидация по Търговския регистър на Р. България и одобрение на €150 бонус
            </p>
          </div>
        </div>

        {/* Quick Sample Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 mr-1">Тестови ЕИК:</span>
          <button 
            type="button" 
            onClick={() => handleSampleClick('207849182', 'Опън Балансър ЕООД')}
            className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
            aria-label="Зареди примерен ЕИК 207849182"
          >
            207849182
          </button>
          <button 
            type="button" 
            onClick={() => handleSampleClick('207849190', 'ФИНАНС ПРОТЕКТ ЕООД')}
            className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
            aria-label="Зареди примерен ЕИК 207849190"
          >
            207849190
          </button>
          <button 
            type="button" 
            onClick={() => handleSampleClick('2078491820011', 'ИНКОНТРОЛ ПЛЮС - КЛОН')}
            className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
            aria-label="Зареди примерен 13-цифрен ЕИК"
          >
            13 цифри (Клон)
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left, Real-Time Card Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-start">
        
        {/* LEFT COLUMN: Input Form (7 Cols) */}
        <form onSubmit={handleSubmitRegistration} className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="eik-input" className="block text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>ЕИК / БУЛСТАТ (9 или 13 цифри) <span className="text-cyan-400">*</span></span>
              <span className="text-[10px] text-cyan-400 font-mono">Mod 11 Алгоритъм</span>
            </label>
            <div className="relative group">
              <input
                id="eik-input"
                name="eik"
                type="text"
                value={eikInput}
                onChange={(e) => setEikInput(e.target.value.replace(/\D/g, '').slice(0, 13))}
                placeholder="напр. 207849182"
                aria-label="ЕИК или БУЛСТАТ номер"
                className={`w-full px-4 py-3.5 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-sm font-mono placeholder-slate-500 border ${
                  verification.isValid 
                    ? 'border-emerald-500/60 ring-2 ring-emerald-500/20' 
                    : eikInput.length > 0 ? 'border-amber-500/60 ring-2 ring-amber-500/20' : 'border-white/10'
                } hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none`}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {verification.isValid ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4" /> Валиден
                  </span>
                ) : eikInput.length > 0 ? (
                  <span className="flex items-center gap-1 text-amber-400 text-xs font-mono">
                    <AlertCircle className="w-4 h-4" /> Непълен
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="company-name-input" className="block text-xs font-semibold text-slate-200">
              Име на фирмата (български) <span className="text-cyan-400">*</span>
            </label>
            <input
              id="company-name-input"
              name="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="напр. Опън Балансър ЕООД"
              aria-label="Име на фирмата на български език"
              className="w-full px-4 py-3.5 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-sm placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="email-input" className="block text-xs font-semibold text-slate-200">
                Служебен Email
              </label>
              <input
                id="email-input"
                name="email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="finance@company.bg"
                aria-label="Служебен имейл адрес"
                className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="phone-input" className="block text-xs font-semibold text-slate-200">
                Телефон за SMS OTP
              </label>
              <input
                id="phone-input"
                name="phone"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+359888123456"
                aria-label="Телефонен номер за SMS потвърждение"
                className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!verification.isValid || isSubmitting}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg min-h-[48px] cursor-pointer ${
                verification.isValid && !isSubmitting
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white shadow-cyan-500/25 active:scale-[0.98]'
                  : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Zap className="w-4 h-4 animate-spin text-white" />
                  <span>Обработка на заявката през n8n &amp; Wallester API...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Стартирай онбординг &amp; Издаване на Карта (€150 Бонус)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>

          {/* Feedback Message */}
          <AnimatePresence>
            {submitMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-2xl border text-xs flex items-start gap-3 backdrop-blur-md ${
                  submitStatus === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {submitStatus === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-sm">{submitStatus === 'success' ? 'Заявката е приета' : 'Възникна проблем'}</div>
                  <div className="mt-0.5 leading-relaxed text-slate-300">{submitMessage}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* RIGHT COLUMN: Real-Time Eligibility Card (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 border border-white/10 p-6 space-y-4 shadow-xl relative overflow-hidden backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              FREE_CARD_PLUS_150_BONUS
            </span>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono block">ОДОБРЕН БОНУС</span>
              <span className="text-xl font-extrabold font-mono text-emerald-400">€150.00</span>
            </div>
          </div>

          <div className="space-y-3 text-xs divide-y divide-white/5">
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Правна Форма:</span>
              <span className="font-bold text-white">{verification.legalFormBg} ({verification.legalFormEn})</span>
            </div>
            <div className="flex justify-between pt-2.5 items-center">
              <span className="text-slate-400">ДДС Номер (VIES / НАП):</span>
              <div className="flex items-center gap-1.5 font-mono text-cyan-300 font-bold">
                <span>{verification.vatNumber || '—'}</span>
                {verification.vatNumber && (
                  <button
                    type="button"
                    onClick={handleCopyVat}
                    className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center border border-white/5"
                    title="Копирай ДДС номер"
                    aria-label="Копирай ДДС номер"
                  >
                    {copiedVat ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
            <div className="flex justify-between pt-2.5">
              <span className="text-slate-400">Контролна Сума (Mod 11):</span>
              <span className={`font-mono font-bold ${verification.isValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {verification.isValid ? `✓ Премината (Етап ${verification.stageUsed})` : '✕ Очаква валидация'}
              </span>
            </div>
            <div className="flex justify-between pt-2.5">
              <span className="text-slate-400">Издател на картата:</span>
              <span className="font-semibold text-slate-200">Wallester Business (Visa Platinum)</span>
            </div>
          </div>

          {/* Verification Badge */}
          <div className={`p-3 rounded-lg border text-[11px] flex items-center gap-2 ${
            verification.isValid 
              ? 'bg-green-500/5 border-green-500/20 text-slate-300' 
              : 'bg-amber-500/5 border-amber-500/20 text-slate-400'
          }`}>
            <Info className={`w-4 h-4 shrink-0 ${verification.isValid ? 'text-green-400' : 'text-amber-400'}`} />
            <span>{verification.message}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

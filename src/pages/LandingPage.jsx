import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/landing/HeroSection';
import BenefitsGrid from '../components/landing/BenefitsGrid';
import EligibilityWidget from '../components/landing/EligibilityWidget';
import ProcessSteps from '../components/landing/ProcessSteps';
import FAQ from '../components/landing/FAQ';
import CTASection from '../components/landing/CTASection';

export default function LandingPage() {
  const [eligibilityResults, setEligibilityResults] = useState(null);
  const eligibilityRef = useRef(null);

  const scrollToEligibility = () => {
    eligibilityRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-0 -m-6">
      {/* Full-width landing page sections */}
      <HeroSection onGetStarted={scrollToEligibility} />

      <BenefitsGrid />

      <div ref={eligibilityRef}>
        <EligibilityWidget onResults={setEligibilityResults} />
      </div>

      {/* Show results if eligibility check was done */}
      {eligibilityResults && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12 px-6"
        >
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-xl p-6 border ${
              eligibilityResults.eligible > 0
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-yellow-500/10 border-yellow-500/30'
            }`}>
              <h3 className={`text-xl font-bold mb-2 ${
                eligibilityResults.eligible > 0 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {eligibilityResults.eligible > 0
                  ? `${eligibilityResults.eligible} от ${eligibilityResults.total} фирми отговарят!`
                  : 'Няма отговарящи фирми'
                }
              </h3>
              {eligibilityResults.companies?.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-t border-white/10 mt-2">
                  <span className="text-gray-300">{c.company_name} ({c.eik})</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    c.is_eligible
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {c.is_eligible ? 'Eligible' : c.reason || 'Not eligible'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      <ProcessSteps />

      <FAQ />

      <CTASection onGetStarted={scrollToEligibility} />
    </div>
  );
}

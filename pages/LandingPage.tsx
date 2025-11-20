import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, BarChart3, ShieldCheck, BrainCircuit, Sun, Moon, Globe, Zap, Users, CheckCircle2 } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const LandingPage: React.FC = () => {
  const { t, toggleTheme, theme, language, setLanguage } = useThemeStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center p-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-primary p-2 rounded-lg">
                <Smartphone className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">SmartPOS</span>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
             <div className="flex items-center space-x-1 md:space-x-2 mr-2 md:mr-4">
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <button 
                  onClick={() => setLanguage(language === 'en' ? 'km' : 'en')}
                  className="flex items-center space-x-1 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <Globe size={20} />
                  <span className="text-xs font-bold uppercase">{language}</span>
                </button>
             </div>

            <Link to="/login" className="hidden md:block text-slate-600 dark:text-slate-300 font-medium hover:text-primary transition-colors">{t('Login')}</Link>
            <Link to="/register" className="px-4 py-2 md:px-5 md:py-2.5 bg-primary text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:scale-105 text-sm md:text-base">
                {t('Get Started')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:bg-purple-900/50"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:bg-blue-900/50"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">{t('Version Info')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-8"
          >
            {t('Landing Title 1')} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                {t('Landing Title 2')}
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            {t('Landing Subtitle')} 
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link to="/register" className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center shadow-xl w-full sm:w-auto justify-center">
              {t('Start Free Trial')} <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a href="#features" className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-full font-bold text-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all w-full sm:w-auto text-center">
              {t('See How It Works')}
            </a>
          </motion.div>

          {/* Trust Badges */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.6 }}
             className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800/50"
          >
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{t('Trusted by')}</p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 grayscale opacity-60">
                {/* Mock Logos */}
                <div className="flex items-center gap-1 font-bold text-lg md:text-xl"><div className="w-6 h-6 bg-slate-400 rounded-full"></div>TechPoint</div>
                <div className="flex items-center gap-1 font-bold text-lg md:text-xl"><div className="w-6 h-6 bg-slate-400 rounded-md"></div>MobileZone</div>
                <div className="flex items-center gap-1 font-bold text-lg md:text-xl"><div className="w-6 h-6 bg-slate-400 rounded-sm"></div>GadgetHub</div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="bg-white dark:bg-slate-800/50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('Everything needed')}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t('Stop wrestling')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-blue-600" />}
              title={t('Real-time Analytics')}
              description={t('Feature Desc 1')}
              bgClass="bg-blue-50 dark:bg-blue-900/20"
            />
            <FeatureCard
              icon={<ShieldCheck className="h-8 w-8 text-green-600" />}
              title={t('Secure Payments')}
              description={t('Feature Desc 2')}
              bgClass="bg-green-50 dark:bg-green-900/20"
            />
            <FeatureCard
              icon={<BrainCircuit className="h-8 w-8 text-purple-600" />}
              title={t('Gemini AI Tools')}
              description={t('Feature Desc 3')}
              bgClass="bg-purple-50 dark:bg-purple-900/20"
            />
             <FeatureCard
              icon={<Zap className="h-8 w-8 text-yellow-600" />}
              title={t('Instant Setup')}
              description={t('Instant Setup Desc')}
              bgClass="bg-yellow-50 dark:bg-yellow-900/20"
            />
             <FeatureCard
              icon={<Users className="h-8 w-8 text-orange-600" />}
              title={t('CRM Built-in')}
              description={t('CRM Desc')}
              bgClass="bg-orange-50 dark:bg-orange-900/20"
            />
             <FeatureCard
              icon={<Globe className="h-8 w-8 text-cyan-600" />}
              title={t('Multi-Language')}
              description={t('Multi-Language Desc')}
              bgClass="bg-cyan-50 dark:bg-cyan-900/20"
            />
          </div>
        </div>
      </section>

      {/* AI Section Showcase */}
      <section className="py-16 md:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <div className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                    {t('Powered by Google')}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">{t('Personal Assistant')}</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                    {t('Imagine having')}
                </p>
                <ul className="space-y-4 mb-8">
                    {[
                        t('AI List 1'),
                        t('AI List 2'),
                        t('AI List 3'),
                        t('AI List 4')
                    ].map((item, i) => (
                        <li key={i} className="flex items-start text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
              </div>
              <div className="lg:w-1/2 relative w-full">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-2xl blur-2xl opacity-20"></div>
                  <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6">
                      {/* Fake Chat Interface UI */}
                      <div className="space-y-4">
                          <div className="flex justify-end">
                              <div className="bg-primary text-white p-3 rounded-2xl rounded-br-none text-sm">
                                  Generate a promo image for the new iPhone 15 Pro.
                              </div>
                          </div>
                          <div className="flex justify-start">
                              <div className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 p-3 rounded-2xl rounded-bl-none text-sm max-w-xs">
                                  Sure! Here is a high-resolution image generated for your campaign.
                                  <div className="mt-2 h-32 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center text-xs text-slate-500">
                                      [AI Generated Image Preview]
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-slate-900 text-white text-center px-6">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('Ready to transform')}</h2>
            <p className="text-slate-400 text-lg mb-10">{t('Join thousands')}</p>
            <Link to="/register" className="inline-flex items-center px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:scale-105 w-full sm:w-auto justify-center">
                {t('Start Free Trial')}
            </Link>
            <p className="mt-6 text-sm text-slate-500">{t('No credit card')}</p>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-white dark:bg-slate-950 py-10 text-center border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-400">
            <p>{t('Footer Copyright')}</p>
            <div className="flex flex-wrap justify-center space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-primary">{t('Privacy Policy')}</a>
                <a href="#" className="hover:text-primary">{t('Terms of Service')}</a>
                <a href="#" className="hover:text-primary">{t('Contact Support')}</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; bgClass: string }> = ({ icon, title, description, bgClass }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all group"
  >
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${bgClass} group-hover:scale-110 transition-transform`}>
        {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
  </motion.div>
);

export default LandingPage;
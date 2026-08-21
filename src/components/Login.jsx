import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Server, Shield, Loader, Key } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn({ email, password });
                if (error) throw error;
                toast.success("Успешно влизане в Wallestars Control Center!");
            } else {
                const { error } = await signUp({ email, password });
                if (error) throw error;
                toast.success("Регистрацията е успешна! Моля, потвърдете вашия email.");
                setIsLogin(true);
            }
        } catch (error) {
            toast.error(error.message || "Грешка при авторизация");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#0B0C10] overflow-hidden text-white font-sans">
            {/* Background Animated Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#45f3ff] rounded-full blur-[120px] opacity-20 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#6a5af9] rounded-full blur-[150px] opacity-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Cyber Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-8 sm:p-10"
            >
                {/* Glassmorphism Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_0_40px_rgba(69,243,255,0.1)] relative overflow-hidden">

                    {/* Top highlight effect */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#45f3ff] to-transparent opacity-50"></div>

                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#6a5af9] to-[#45f3ff] mb-6 shadow-[0_0_30px_rgba(69,243,255,0.3)] relative group"
                        >
                            <Shield className="w-10 h-10 text-white" />
                            <div className="absolute inset-0 border-2 border-white/20 rounded-2xl scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 x-transition duration-300"></div>
                        </motion.div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
                            Wallestars Hub
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest">
                            Access Control Protocol
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Email Identity</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#45f3ff] transition-colors">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#45f3ff] focus:border-transparent transition-all outline-none text-white placeholder-gray-500 shadow-inner"
                                    placeholder="operator@wallestars.net"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Security Key</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#45f3ff] transition-colors">
                                    <Key className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#45f3ff] focus:border-transparent transition-all outline-none text-white placeholder-gray-500 shadow-inner"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-4 bg-gradient-to-r from-[#6a5af9] to-[#45f3ff] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(69,243,255,0.4)] hover:shadow-[0_0_30px_rgba(69,243,255,0.6)] flex items-center justify-center transition-all disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <Lock className="w-5 h-5 mr-2" />
                                    {isLogin ? 'AUTHENICATE' : 'INITIALIZE SEQUENCE'}
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-white/10">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {isLogin ? "Require protocol registration? " : "Already initialized? "}
                            <span className="text-[#45f3ff] font-semibold">
                                {isLogin ? "Request Access" : "Return to Link"}
                            </span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;

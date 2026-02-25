import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Award, Users, TrendingUp } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding with Footix colors */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background gradient with brand colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A]" />
        
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Animated Shapes with gold accent */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-20 w-32 h-32 rounded-3xl bg-[#F5A623]/20 backdrop-blur-sm border border-[#F5A623]/30"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-40 right-20 w-48 h-48 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/3 w-24 h-24 rounded-2xl bg-[#F5A623]/10 backdrop-blur-sm rotate-45 border border-[#F5A623]/20"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            x: [0, 10, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 left-32 w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-[#F5A623] rounded-2xl blur-xl opacity-30" />
                <img 
                  src="/logo.svg" 
                  alt="Footix" 
                  className="relative h-24 w-24 rounded-2xl shadow-2xl border-2 border-[#F5A623]/50"
                />
              </motion.div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Footix</h1>
            <p className="text-xl text-white/80 max-w-md leading-relaxed">
              Testez vos connaissances football avec des quiz interactifs et grimpez dans le classement
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16 grid grid-cols-2 gap-6 w-full max-w-sm"
          >
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center hover:bg-white/15 transition-colors">
              <div className="flex justify-center mb-2">
                <BookOpen className="h-6 w-6 text-[#F5A623]" />
              </div>
              <div className="text-2xl font-bold">100+</div>
              <div className="text-sm text-white/70">Quiz disponibles</div>
            </div>
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center hover:bg-white/15 transition-colors">
              <div className="flex justify-center mb-2">
                <Award className="h-6 w-6 text-[#F5A623]" />
              </div>
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm text-white/70">Thèmes couverts</div>
            </div>
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center hover:bg-white/15 transition-colors">
              <div className="flex justify-center mb-2">
                <Users className="h-6 w-6 text-[#F5A623]" />
              </div>
              <div className="text-2xl font-bold">1k+</div>
              <div className="text-sm text-white/70">Utilisateurs actifs</div>
            </div>
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center hover:bg-white/15 transition-colors">
              <div className="flex justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-[#F5A623]" />
              </div>
              <div className="text-2xl font-bold">95%</div>
              <div className="text-sm text-white/70">Taux de réussite</div>
            </div>
          </motion.div>

          {/* Bottom tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-12 text-sm text-white/60 text-center"
          >
            Rejoignez la communauté des passionnés de football
          </motion.p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F8FAF9] dark:bg-[#0D1512]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}

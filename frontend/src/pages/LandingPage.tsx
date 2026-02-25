import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Trophy,
  FileText,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Bot,
  Users,
  Smartphone,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';


const features = [
  {
    icon: Trophy,
    title: 'Ligue des Champions',
    description: 'Testez vos connaissances sur la plus prestigieuse compétition européenne de clubs.',
    color: 'bg-[#D4AF37]',
  },
  {
    icon: HelpCircle,
    title: 'Quiz Interactifs',
    description: 'Des centaines de questions sur tous les championnats : Liga, Premier League, Serie A, Bundesliga, Ligue 1.',
    color: 'bg-[#C0C0C0]',
  },
  {
    icon: Star,
    title: 'Coupe du Monde',
    description: 'Revivez les moments légendaires des Coupes du Monde et testez votre mémoire.',
    color: 'bg-[#D4AF37]',
  },
  {
    icon: FileText,
    title: 'Blog Football',
    description: 'Découvrez des articles passionnants sur l\'histoire du football, les tactiques et les légendes.',
    color: 'bg-[#C0C0C0]',
  },
  {
    icon: Users,
    title: 'Classement Global',
    description: 'Affrontez d\'autres passionnés et grimpez dans le classement mondial.',
    color: 'bg-[#D4AF37]',
  },
  {
    icon: Bot,
    title: 'Assistant IA Football',
    description: 'Posez toutes vos questions sur le football à notre assistant intelligent.',
    color: 'bg-[#C0C0C0]',
  },
];

const benefits = [
  'Quiz sur tous les championnats majeurs',
  'Suivi personnalisé de votre progression',
  'Contenu mis à jour chaque saison',
  'Accès 100% gratuit à tous les quiz',
  'Classement mondial des joueurs',
  'Statistiques détaillées de vos performances',
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F0F0F]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="Footix" className="h-10 w-10 rounded-xl shadow-lg" />
              <span className="text-xl font-bold text-[#D4AF37] dark:text-[#E5C158]">Footix</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-[#1A1A1A] dark:text-[#F5F5F5] hover:text-[#D4AF37] dark:hover:text-[#E5C158]">
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#D4AF37] hover:bg-[#B8960F] dark:bg-[#E5C158] dark:hover:bg-[#D4AF37] text-[#1A1A1A] shadow-lg shadow-[#D4AF37]/25">
                  S'inscrire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with 3D Animated Background */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F4E8] via-[#FAFAFA] to-[#F0F0F0] dark:from-[#0F0F0F] dark:via-[#1A1A1A] dark:to-[#252525]" />
          
          {/* Animated floating shapes */}
          <motion.div
            animate={{
              y: [0, -30, 0],
              rotate: [0, 5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#E5C158]/10 blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 40, 0],
              rotate: [0, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-40 right-[15%] w-96 h-96 rounded-full bg-gradient-to-br from-[#C0C0C0]/15 to-[#D8D8D8]/10 blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, -20, 0],
              x: [0, 20, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-20 left-[20%] w-80 h-80 rounded-full bg-gradient-to-br from-[#B8960F]/15 to-[#D4AF37]/10 blur-3xl"
          />
          
          {/* 3D Floating geometric shapes */}
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotateX: [0, 360],
              rotateY: [0, 180, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-32 right-[25%] w-16 h-16 border-2 border-[#D4AF37]/30 dark:border-[#E5C158]/30 rounded-xl"
            style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotateZ: [0, 360],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-60 left-[12%] w-12 h-12 border-2 border-[#C0C0C0]/40 rounded-full"
          />
          <motion.div
            animate={{
              y: [0, -25, 0],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-40 right-[10%] w-20 h-20 border-2 border-[#D4AF37]/25 dark:border-[#E5C158]/25"
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          />
          
          {/* Animated dots grid */}
          <div className="absolute inset-0 opacity-30 dark:opacity-20" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
          
          {/* Animated lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-5" xmlns="http://www.w3.org/2000/svg">
            <motion.line
              x1="0%" y1="30%" x2="100%" y2="70%"
              stroke="#D4AF37"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.line
              x1="100%" y1="20%" x2="0%" y2="80%"
              stroke="#C0C0C0"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            />
          </svg>
          
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.sin(i) * 50, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
              className="absolute w-2 h-2 rounded-full bg-[#D4AF37]"
              style={{
                left: `${15 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
            />
          ))}
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 dark:bg-[#E5C158]/20 backdrop-blur-sm text-[#D4AF37] dark:text-[#E5C158] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#D4AF37]/20 dark:border-[#E5C158]/20">
                <Sparkles className="h-4 w-4" />
                Quiz Football - 100% Gratuit
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] dark:text-[#F5F5F5] mb-6">
                Testez vos connaissances{' '}
                <span className="bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C0C0C0] bg-clip-text text-transparent">
                  Football
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-[#6B6B6B] dark:text-[#A0A0A0] max-w-3xl mx-auto mb-8">
                La plateforme ultime pour les passionnés de football.
                Quiz sur la Ligue des Champions, Liga, Premier League, Coupe du Monde et bien plus !
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-[#D4AF37] hover:bg-[#B8960F] dark:bg-[#E5C158] dark:hover:bg-[#D4AF37] text-[#1A1A1A] shadow-lg shadow-[#D4AF37]/25 gap-2">
                    Jouer maintenant
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="gap-2 border-2 border-[#E5E5E5] dark:border-[#333333] hover:bg-[#F8F4E8] dark:hover:bg-[#2A2518] hover:border-[#D4AF37] dark:hover:border-[#E5C158]">
                    J'ai déjà un compte
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: '100+', label: 'Quiz Football', icon: Trophy },
              { value: '1000+', label: 'Questions', icon: HelpCircle },
              { value: '50+', label: 'Articles', icon: FileText },
              { value: '5000+', label: 'Joueurs', icon: Users },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#333333] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-[#D4AF37] dark:text-[#E5C158]">
                  {stat.value}
                </div>
                <div className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F8F4E8]/50 dark:bg-[#2A2518]/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#1A1A1A] dark:text-[#F5F5F5]">
              Tout le football en un seul endroit
            </h2>
            <p className="text-lg text-[#6B6B6B] dark:text-[#A0A0A0] max-w-2xl mx-auto">
              Des quiz sur toutes les compétitions, des articles passionnants et un classement mondial.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border border-[#E5E5E5] dark:border-[#333333] shadow-lg h-full hover:shadow-xl transition-shadow bg-white dark:bg-[#1A1A1A]">
                    <CardContent className="p-6">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color} shadow-lg mb-4`}>
                        <Icon className="h-7 w-7 text-[#1A1A1A]" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-[#1A1A1A] dark:text-[#F5F5F5]">{feature.title}</h3>
                      <p className="text-[#6B6B6B] dark:text-[#A0A0A0]">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#1A1A1A] dark:text-[#F5F5F5]">
                Pourquoi choisir{' '}
                <span className="bg-gradient-to-r from-[#D4AF37] to-[#C0C0C0] bg-clip-text text-transparent">
                  Footix
                </span>
                ?
              </h2>
              <p className="text-lg text-[#6B6B6B] dark:text-[#A0A0A0] mb-8">
                Créé par des passionnés de football pour les passionnés.
                Testez vos connaissances et devenez un expert du ballon rond !
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF37]/10 dark:bg-[#E5C158]/20">
                      <CheckCircle className="h-4 w-4 text-[#D4AF37] dark:text-[#E5C158]" />
                    </div>
                    <span className="text-[#1A1A1A] dark:text-[#F5F5F5]">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-[#C0C0C0]/20 rounded-3xl blur-3xl" />
              <Card className="relative border border-[#E5E5E5] dark:border-[#333333] shadow-2xl bg-white dark:bg-[#1A1A1A]">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
                      <Star className="h-8 w-8 text-[#1A1A1A]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F5F5F5]">Système de récompenses</div>
                      <div className="text-[#6B6B6B] dark:text-[#A0A0A0]">Gagnez des étoiles et montez au classement</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20">
                      <span className="font-medium text-[#1A1A1A] dark:text-[#F5F5F5]">Quiz réussi</span>
                      <span className="font-bold text-[#D4AF37]">+5 à +15 ⭐</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F0F0F0] dark:bg-[#252525]">
                      <span className="font-medium text-[#1A1A1A] dark:text-[#F5F5F5]">Bonus difficulté</span>
                      <span className="font-bold text-[#C0C0C0] dark:text-[#D8D8D8]">x1.5 à x2</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F0F0F0] dark:bg-[#252525]">
                      <span className="font-medium text-[#1A1A1A] dark:text-[#F5F5F5]">Classement mondial</span>
                      <span className="font-bold text-[#D4AF37] dark:text-[#E5C158]">Top 100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile App Gallery Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(212,175,55,0.3)'%3E%3C/circle%3E%3C/svg%3E\")" }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 backdrop-blur-sm text-[#D4AF37] px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Smartphone className="h-4 w-4" />
              Application Mobile
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              Jouez partout, tout le temps
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Emportez Footix avec vous ! Testez vos connaissances football où que vous soyez.
            </p>
          </motion.div>

          {/* Download CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <Link to="/register">
                <Button className="bg-[#D4AF37] hover:bg-[#B8960F] text-[#1A1A1A] font-semibold shadow-lg shadow-[#D4AF37]/25 gap-2 px-6 py-3 h-auto text-base">
                  <Download className="h-5 w-5" />
                  Jouer gratuitement
                </Button>
              </Link>
              <p className="text-white/50 text-sm">Android · iOS · Web</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] p-12 text-center text-white"
          >
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(212,175,55,0.15)'%3E%3C/path%3E%3C/svg%3E\")" }} />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C0C0C0]/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Prêt à devenir un expert du football ?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Rejoignez des milliers de passionnés qui testent leurs connaissances football.
                100% gratuit, inscription en 30 secondes !
              </p>
              <Link to="/register">
                <Button size="lg" className="gap-2 bg-[#D4AF37] hover:bg-[#B8960F] text-[#1A1A1A] font-semibold shadow-lg shadow-[#D4AF37]/30">
                  Commencer à jouer
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E5] dark:border-[#333333] py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Footix" className="h-10 w-10 rounded-xl shadow-lg" />
              <span className="text-xl font-bold text-[#D4AF37] dark:text-[#E5C158]">Footix</span>
            </div>
            <p className="text-[#6B6B6B] dark:text-[#A0A0A0] text-center">
              © {new Date().getFullYear()} Footix. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

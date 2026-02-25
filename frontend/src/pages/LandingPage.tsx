import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Trophy,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
  Smartphone,
  Download,
  Zap,
  Target,
  BarChart3,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="Footix" className="h-10 w-10 rounded-xl" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#E5C158] bg-clip-text text-transparent">Footix</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-white/70 hover:text-[#D4AF37]">
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#D4AF37] hover:bg-[#B8960F] text-black font-semibold shadow-lg shadow-[#D4AF37]/20">
                  Commencer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.15)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(192,192,192,0.08)_0%,_transparent_50%)]" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full bg-[#D4AF37]/10 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 right-[10%] w-[400px] h-[400px] rounded-full bg-[#C0C0C0]/10 blur-[100px]"
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 backdrop-blur-sm text-[#D4AF37] px-5 py-2.5 rounded-full text-sm font-medium mb-8 border border-[#D4AF37]/20">
              <Sparkles className="h-4 w-4" />
              100% Gratuit — Aucune carte requise
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight mb-6"
          >
            <span className="block text-white">Le quiz football</span>
            <span className="block bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C0C0C0] bg-clip-text text-transparent">
              ultime.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Coupe du Monde, Ligue des Champions, Premier League, Liga...
            Testez vos connaissances et grimpez au classement mondial.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button size="xl" className="bg-[#D4AF37] hover:bg-[#B8960F] text-black font-bold shadow-2xl shadow-[#D4AF37]/25 gap-2 px-8">
                Jouer maintenant
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white/10 text-white/70 hover:bg-white/5 hover:text-white hover:border-[#D4AF37]/50">
                J'ai déjà un compte
              </Button>
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20 flex flex-wrap items-center justify-center gap-8 sm:gap-16"
          >
            {[
              { value: '500+', label: 'Quiz' },
              { value: '5 000+', label: 'Questions' },
              { value: '10 000+', label: 'Joueurs' },
              { value: '4.9/5', label: 'Note' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#D4AF37]">{stat.value}</div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              Comment ça <span className="text-[#D4AF37]">marche</span> ?
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Trois étapes pour devenir un expert du ballon rond.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Target, title: 'Choisissez un thème', desc: 'Coupe du Monde, Ligue des Champions, légendes du football, règles du jeu...' },
              { step: '02', icon: Zap, title: 'Répondez aux quiz', desc: 'Questions variées avec différents niveaux de difficulté. Chaque bonne réponse rapporte des étoiles.' },
              { step: '03', icon: Trophy, title: 'Grimpez au classement', desc: 'Comparez-vous aux autres joueurs et visez la première place du classement mondial.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="bg-white/[0.03] border-white/5 backdrop-blur-sm h-full hover:bg-white/[0.06] hover:border-[#D4AF37]/20 transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="text-5xl font-black text-[#D4AF37]/20 group-hover:text-[#D4AF37]/40 transition-colors mb-4">{item.step}</div>
                    <div className="h-12 w-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-5">
                      <item.icon className="h-6 w-6 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-white/40 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0A0A0A] via-[#111111] to-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              Tout pour les <span className="text-[#D4AF37]">passionnés</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Des fonctionnalités pensées pour une expérience de quiz optimale.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: HelpCircle, title: 'Quiz variés', desc: 'QCU, QCM, Vrai/Faux sur tous les aspects du football.' },
              { icon: Star, title: 'Système d\'étoiles', desc: 'Gagnez des étoiles à chaque quiz réussi et débloquez du contenu.' },
              { icon: Trophy, title: 'Classement', desc: 'Affrontez les meilleurs et grimpez dans le top 100 mondial.' },
              { icon: Timer, title: 'Mode Révision', desc: 'Questions aléatoires pour tester votre culture football globale.' },
              { icon: BarChart3, title: 'Statistiques', desc: 'Suivez votre progression avec des stats détaillées.' },
              { icon: Users, title: 'Communauté', desc: 'Rejoignez des milliers de passionnés de football.' },
              { icon: Smartphone, title: 'Multi-plateforme', desc: 'Jouez sur le web, Android ou iOS, vos données sont synchronisées.' },
              { icon: Sparkles, title: 'Quiz IA', desc: 'Des quiz générés par intelligence artificielle pour un contenu infini.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#D4AF37]/20 hover:bg-white/[0.04] transition-all duration-300"
              >
                <feature.icon className="h-8 w-8 text-[#D4AF37] mb-4" />
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / Rewards */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl sm:text-5xl font-bold mb-6">
                Gagnez des <span className="text-[#D4AF37]">récompenses</span>
              </h2>
              <p className="text-white/40 text-lg mb-10 leading-relaxed">
                Chaque quiz réussi vous rapporte des étoiles. Plus la difficulté est élevée, plus vous gagnez. 
                Visez le score parfait pour maximiser vos gains !
              </p>
              <ul className="space-y-5">
                {[
                  'Quiz réussi : +3 à +15 étoiles',
                  'Score parfait (100%) : bonus x2',
                  'Classement mondial en temps réel',
                  'Débloquez des quiz avancés avec vos étoiles',
                  'Statistiques détaillées de progression',
                  'Historique complet de vos performances',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-[#D4AF37] flex-shrink-0" />
                    <span className="text-white/70">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#D4AF37]/20 to-[#C0C0C0]/10 rounded-3xl blur-2xl" />
                <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-8 space-y-4">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8960F] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                      <Star className="h-7 w-7 text-black" />
                    </div>
                    <div>
                      <div className="text-xl font-bold">Système de récompenses</div>
                      <div className="text-white/40 text-sm">Gagnez des étoiles et montez au classement</div>
                    </div>
                  </div>
                  {[
                    { label: 'Quiz Facile réussi', value: '+3 ⭐', bg: 'bg-[#D4AF37]/5' },
                    { label: 'Quiz Moyen réussi', value: '+7 ⭐', bg: 'bg-[#D4AF37]/10' },
                    { label: 'Quiz Difficile réussi', value: '+15 ⭐', bg: 'bg-[#D4AF37]/15' },
                    { label: 'Score parfait', value: 'x2 bonus', bg: 'bg-[#C0C0C0]/10' },
                    { label: 'Classement mondial', value: 'Top 100', bg: 'bg-[#C0C0C0]/5' },
                  ].map((row, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${row.bg} border border-white/5`}>
                      <span className="font-medium text-white/80">{row.label}</span>
                      <span className="font-bold text-[#D4AF37]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile app section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/[0.03] to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 bg-white/5 text-[#D4AF37] px-5 py-2.5 rounded-full text-sm font-medium mb-6 border border-white/5">
              <Smartphone className="h-4 w-4" />
              Disponible partout
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              Jouez sur <span className="text-[#D4AF37]">tous vos appareils</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">
              Application web, Android et iOS. Vos données et votre progression sont automatiquement synchronisées.
            </p>
            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-[#D4AF37] hover:bg-[#B8960F] text-black font-bold shadow-lg shadow-[#D4AF37]/20 gap-2">
                  <Download className="h-5 w-5" />
                  Jouer gratuitement
                </Button>
              </Link>
              <p className="text-white/30 text-sm">Android · iOS · Web</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/20 p-12 sm:p-16 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-[#C0C0C0]/5" />
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#C0C0C0]/5 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-5xl font-bold mb-4">
                  Prêt à relever le <span className="text-[#D4AF37]">défi</span> ?
                </h2>
                <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
                  Rejoignez des milliers de passionnés. Inscription gratuite en 30 secondes.
                </p>
                <Link to="/register">
                  <Button size="xl" className="bg-[#D4AF37] hover:bg-[#B8960F] text-black font-bold shadow-2xl shadow-[#D4AF37]/25 gap-2 px-10">
                    Commencer maintenant
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Footix" className="h-10 w-10 rounded-xl" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#E5C158] bg-clip-text text-transparent">Footix</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/30">
              <Link to="/help" className="hover:text-[#D4AF37] transition-colors">Aide</Link>
              <Link to="/terms" className="hover:text-[#D4AF37] transition-colors">Conditions</Link>
            </div>
            <p className="text-white/30 text-sm">
              © {new Date().getFullYear()} Footix. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

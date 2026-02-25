import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  BookOpen,
  Star,
  Trophy,
  RefreshCw,
  User,
  Bug,
  Mail,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface HelpSectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

function HelpSection({ icon, title, content }: HelpSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] dark:text-[#D4AF37]">
          {icon}
        </div>
        <span className="flex-1 font-semibold text-slate-900 dark:text-white">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <CardContent className="pt-0 pb-4 px-4 pl-[72px]">
          <div className="text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
            {content.split('**').map((part, i) => 
              i % 2 === 1 ? <strong key={i} className="text-slate-800 dark:text-slate-200">{part}</strong> : part
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function HelpPage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <Card className="border-0 bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D] text-white overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                <HelpCircle className="h-7 w-7 text-[#D4AF37]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Centre d'aide</h1>
                <p className="text-white/80 mt-1">
                  Tout ce que vous devez savoir sur Footix
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Help Sections */}
      <motion.div variants={item} className="space-y-3">
        <HelpSection
          icon={<BookOpen className="h-5 w-5" />}
          title="Qu'est-ce que Footix ?"
          content="Footix est une application dédiée aux passionnés de football. Testez et améliorez vos connaissances sur le football grâce à des quiz interactifs couvrant l'histoire, les compétitions, les joueurs, les clubs, les règles et les tactiques. Grimpez dans le classement et devenez le meilleur expert football !"
        />

        <HelpSection
          icon={<Zap className="h-5 w-5" />}
          title="Les Quiz"
          content={`**Comment fonctionnent les quiz ?**

• Chaque quiz contient plusieurs questions à choix unique ou multiple
• Vous avez un temps limité pour répondre à chaque question
• Un score minimum de 70% est requis pour réussir
• Vous gagnez des étoiles en réussissant les quiz

**Tentatives :**
• Vous disposez de 3 tentatives par quiz
• Les tentatives se rechargent automatiquement après 24h
• Vous pouvez acheter des tentatives supplémentaires avec vos étoiles`}
        />

        <HelpSection
          icon={<BookOpen className="h-5 w-5" />}
          title="Les Thèmes"
          content={`Les quiz sont organisés par thèmes liés au football :

• Coupe du Monde
• Ligue des Champions
• Championnat d'Europe
• Joueurs légendaires
• Règles du jeu
• Et bien d'autres...

Chaque thème contient plusieurs quiz de difficulté progressive (Facile, Moyen, Difficile).`}
        />

        <HelpSection
          icon={<Star className="h-5 w-5" />}
          title="Les Étoiles et le Classement"
          content={`**Comment gagner des étoiles ?**

• Réussissez un quiz pour la première fois : +3 étoiles
• Score parfait (100%) : bonus d'étoiles supplémentaires
• Les étoiles permettent de débloquer certains quiz avancés

**Le classement :**
• Comparez-vous aux autres joueurs
• Le classement affiche les 100 meilleurs
• Votre position est mise à jour en temps réel`}
        />

        <HelpSection
          icon={<RefreshCw className="h-5 w-5" />}
          title="Le Mode Révision"
          content={`Le mode Révision vous permet de :

• Répondre à des questions aléatoires de tous les thèmes
• Renforcer vos connaissances globales sur le football
• Vous entraîner de manière transversale

C'est idéal pour tester votre culture football générale !`}
        />

        <HelpSection
          icon={<Trophy className="h-5 w-5" />}
          title="Le Classement"
          content={`Le classement vous permet de vous mesurer aux autres passionnés :

• Gagnez des étoiles pour grimper dans le classement
• Consultez le top 100 des meilleurs joueurs
• Affichez votre rang et vos statistiques

**Astuce :** Réussissez un maximum de quiz avec un score parfait pour accumuler le plus d'étoiles !`}
        />

        <HelpSection
          icon={<User className="h-5 w-5" />}
          title="Votre Profil"
          content={`Dans votre profil, vous pouvez :

• Modifier vos informations personnelles
• Changer votre photo de profil
• Consulter vos statistiques détaillées
• Voir votre historique de quiz`}
        />

        <HelpSection
          icon={<Bug className="h-5 w-5" />}
          title="Signaler un problème"
          content={`Vous rencontrez un bug ou un problème ?

• Contactez-nous à : footixcontact@gmail.com
• Décrivez le problème en détail
• Joignez une capture d'écran si possible

Nous vous répondrons dans les plus brefs délais.`}
        />
      </motion.div>

      {/* Contact Card */}
      <motion.div variants={item}>
        <Card className="border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/5 to-[#C0C0C0]/5">
          <CardContent className="pt-6 text-center">
            <Mail className="h-10 w-10 text-[#D4AF37] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Besoin d'aide supplémentaire ?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Contactez notre équipe support
            </p>
            <Button variant="gradient">
              footixcontact@gmail.com
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

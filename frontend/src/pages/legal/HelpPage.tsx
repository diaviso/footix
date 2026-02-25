import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  BookOpen,
  Star,
  MessageSquare,
  Bot,
  RefreshCw,
  Crown,
  Users,
  FileText,
  User,
  Bug,
  Mail,
  ChevronDown,
  ChevronUp,
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
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1B5E3D]/10 dark:bg-[#3D9A6A]/20 flex items-center justify-center text-[#1B5E3D] dark:text-[#3D9A6A]">
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
        <Card className="border-0 bg-gradient-to-r from-[#1B5E3D] to-[#3D9A6A] text-white overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <HelpCircle className="h-7 w-7" />
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
          content="Footix est une application mobile dédiée à l'apprentissage et à la maîtrise de la déontologie. C'est l'outil d'aide à la préparation de l'examen du DEC et du CAFCAC. Elle vous accompagne dans votre apprentissage avec des quiz interactifs, des cours thématiques, un assistant IA et une communauté d'entraide."
        />

        <HelpSection
          icon={<MessageSquare className="h-5 w-5" />}
          title="Les Quiz"
          content={`**Comment fonctionnent les quiz ?**

• Chaque quiz contient plusieurs questions à choix multiples
• Vous avez un temps limité pour répondre à chaque question
• Un score minimum de 70% est requis pour réussir
• Vous gagnez des étoiles en réussissant les quiz

**Tentatives :**
• Vous disposez de 3 tentatives par quiz
• Les tentatives se rechargent automatiquement après 24h
• Les membres Premium ont des tentatives illimitées`}
        />

        <HelpSection
          icon={<BookOpen className="h-5 w-5" />}
          title="Les Thèmes"
          content={`Les quiz sont organisés par thèmes correspondant aux matières de la déontologie :

• Déontologie de l'EC et du CAC
• Réglementation professionnelle
• Et bien d'autres...

Chaque thème contient plusieurs quiz de difficulté progressive.`}
        />

        <HelpSection
          icon={<Star className="h-5 w-5" />}
          title="Les Étoiles et le Classement"
          content={`**Comment gagner des étoiles ?**

• Réussissez un quiz pour la première fois : +3 étoiles
• Score parfait (100%) : bonus d'étoiles

**Le classement :**
• Comparez-vous aux autres utilisateurs
• Le classement affiche les 100 meilleurs
• Votre position est mise à jour en temps réel`}
        />

        <HelpSection
          icon={<Bot className="h-5 w-5" />}
          title="Le Chatbot IA"
          content={`Notre assistant intelligent est là pour vous aider :

• Posez des questions sur la Déontologie
• Posez des questions sur le DEC
• Obtenez des explications détaillées
• Demandez des clarifications sur les quiz

**Conseils d'utilisation :**
• Soyez précis dans vos questions
• Vous pouvez poser des questions en français
• L'historique de conversation est sauvegardé`}
        />

        <HelpSection
          icon={<RefreshCw className="h-5 w-5" />}
          title="La Révision"
          content={`Le mode Révision vous permet de :

• Réviser des questions aléatoires de tous les thèmes
• Renforcer vos connaissances globales
• Préparer l'examen de manière transversale

**Note :** Cette fonctionnalité est réservée aux membres Premium.`}
        />

        <HelpSection
          icon={<Crown className="h-5 w-5" />}
          title="L'abonnement Premium"
          content={`Devenez Premium pour débloquer :

• ✓ Accès à tous les quiz (y compris premium)
• ✓ Tentatives illimitées
• ✓ Mode Révision
• ✓ Chatbot IA illimité
• ✓ Pas de publicités

**Gestion de l'abonnement :**
• Abonnement mensuel à 9,99€/mois
• Annulation possible à tout moment
• Gérez votre abonnement dans les paramètres`}
        />

        <HelpSection
          icon={<Users className="h-5 w-5" />}
          title="Le Forum"
          content={`Échangez avec la communauté :

• Posez vos questions
• Partagez vos astuces
• Aidez les autres candidats

**Règles du forum :**
• Restez respectueux et bienveillant
• Évitez le hors-sujet
• Signalez les contenus inappropriés`}
        />

        <HelpSection
          icon={<FileText className="h-5 w-5" />}
          title="Le Blog"
          content={`Retrouvez des articles rédigés par des experts :

• Actualités du DEC
• Conseils de préparation
• Analyses de sujets d'examen
• Témoignages de candidats`}
        />

        <HelpSection
          icon={<User className="h-5 w-5" />}
          title="Votre Profil"
          content={`Dans votre profil, vous pouvez :

• Modifier vos informations personnelles
• Changer votre photo de profil
• Consulter vos statistiques
• Gérer votre abonnement Premium`}
        />

        <HelpSection
          icon={<Bug className="h-5 w-5" />}
          title="Signaler un problème"
          content={`Vous rencontrez un bug ou un problème ?

• Contactez-nous à : declearningcontact@gmail.com
• Décrivez le problème en détail
• Joignez une capture d'écran si possible

Nous vous répondrons dans les plus brefs délais.`}
        />
      </motion.div>

      {/* Contact Card */}
      <motion.div variants={item}>
        <Card className="border-[#1B5E3D]/30 bg-gradient-to-r from-[#1B5E3D]/5 to-[#3D9A6A]/5">
          <CardContent className="pt-6 text-center">
            <Mail className="h-10 w-10 text-[#1B5E3D] dark:text-[#3D9A6A] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Besoin d'aide supplémentaire ?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Contactez notre équipe support
            </p>
            <Button variant="gradient">
              declearningcontact@gmail.com
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

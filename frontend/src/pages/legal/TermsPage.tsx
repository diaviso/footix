import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Database, FileText, Scale, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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

export function TermsPage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C0C0C0] mb-4">
          <Scale className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Conditions d'utilisation
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Dernière mise à jour : Février 2026
        </p>
      </motion.div>

      {/* Introduction */}
      <motion.div variants={item}>
        <Card className="border-[#D4AF37]/20 bg-[#D4AF37]/5 dark:border-[#D4AF37]/20 dark:bg-[#D4AF37]/5">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Shield className="h-6 w-6 text-[#D4AF37] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Bienvenue sur Footix
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  En utilisant cette application, vous acceptez les présentes conditions d'utilisation. 
                  Veuillez les lire attentivement avant de continuer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sections */}
      <motion.div variants={item}>
        <Section
          icon={<FileText className="h-5 w-5" />}
          title="1. Objet de l'application"
          content="Footix est une application dédiée aux passionnés de football. Elle propose des quiz interactifs couvrant l'histoire du football, les compétitions, les joueurs, les clubs, les règles et les tactiques. Testez vos connaissances, grimpez dans le classement et devenez le meilleur expert football !"
        />
      </motion.div>

      <motion.div variants={item}>
        <Section
          icon={<Database className="h-5 w-5" />}
          title="2. Collecte et utilisation des données personnelles"
          content={`Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, nous collectons et traitons vos données personnelles de manière transparente et sécurisée.

**Données collectées :**
• Informations d'identification : nom, prénom, adresse email
• Données de connexion : identifiants, mot de passe (chiffré)
• Données d'utilisation : progression dans les quiz, scores, historique d'apprentissage
• Données techniques : type d'appareil, système d'exploitation (à des fins de compatibilité)

**Finalités du traitement :**
• Gestion de votre compte utilisateur
• Personnalisation de votre expérience d'apprentissage
• Suivi de votre progression et statistiques
• Communication relative à votre compte et à l'application
• Amélioration continue de nos services`}
        />
      </motion.div>

      <motion.div variants={item}>
        <Section
          icon={<Scale className="h-5 w-5" />}
          title="3. Base légale du traitement"
          content={`Le traitement de vos données repose sur :

• **Votre consentement** : en créant un compte, vous consentez expressément au traitement de vos données
• **L'exécution du contrat** : le traitement est nécessaire pour vous fournir nos services
• **Notre intérêt légitime** : amélioration de l'application et prévention des fraudes`}
        />
      </motion.div>

      <motion.div variants={item}>
        <Section
          icon={<AlertCircle className="h-5 w-5" />}
          title="4. Durée de conservation"
          content={`Vos données personnelles sont conservées pendant toute la durée de votre inscription, puis pendant une durée de 3 ans après la suppression de votre compte, conformément aux obligations légales.

Les données de connexion et logs techniques sont conservés pendant 1 an.`}
        />
      </motion.div>

      <motion.div variants={item}>
        <Section
          icon={<Shield className="h-5 w-5" />}
          title="5. Vos droits"
          content={`Conformément au RGPD, vous disposez des droits suivants :

• **Droit d'accès** : obtenir une copie de vos données personnelles
• **Droit de rectification** : corriger des données inexactes
• **Droit à l'effacement** : demander la suppression de vos données
• **Droit à la portabilité** : recevoir vos données dans un format structuré
• **Droit d'opposition** : vous opposer au traitement de vos données
• **Droit à la limitation** : limiter le traitement de vos données

Pour exercer ces droits, contactez-nous à : footixcontact@gmail.com`}
        />
      </motion.div>

      <motion.div variants={item}>
        <Section
          icon={<Lock className="h-5 w-5" />}
          title="6. Sécurité des données"
          content={`Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :

• Chiffrement des données sensibles (mots de passe, communications)
• Accès restreint aux données personnelles
• Serveurs sécurisés hébergés dans l'Union Européenne
• Audits de sécurité réguliers`}
        />
      </motion.div>

      <motion.div variants={item}>
        <Section
          icon={<Database className="h-5 w-5" />}
          title="7. Partage des données"
          content={`Vos données personnelles ne sont jamais vendues à des tiers.

Elles peuvent être partagées avec :
• Nos prestataires techniques (hébergement, paiement) dans le cadre strict de leurs missions
• Les autorités compétentes sur demande légale

Tout prestataire est soumis à des obligations de confidentialité strictes.`}
        />
      </motion.div>

      <motion.div variants={item}>
        <Section
          icon={<FileText className="h-5 w-5" />}
          title="8. Propriété intellectuelle"
          content="Tous les contenus de l'application (textes, quiz, images, logos) sont protégés par le droit d'auteur. Toute reproduction ou utilisation non autorisée est interdite."
        />
      </motion.div>

      <motion.div variants={item}>
        <Section
          icon={<Mail className="h-5 w-5" />}
          title="9. Contact et réclamations"
          content={`Pour toute question ou réclamation concernant vos données personnelles :

**Email** : footixcontact@gmail.com\n\nVous pouvez également introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : www.cnil.fr`}
        />
      </motion.div>

      {/* Footer notice */}
      <motion.div variants={item}>
        <Card className="border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/10 to-[#C0C0C0]/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                En créant un compte ou en utilisant l'application, vous confirmez avoir lu et accepté ces conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function Section({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              {title}
            </h3>
            <div className="text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
              {content.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="text-slate-800 dark:text-slate-200">{part}</strong> : part
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

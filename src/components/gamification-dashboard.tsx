'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Zap, Target, Calendar, TrendingUp, Star, Flame, CheckCircle, Sparkles } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface GamificationProfile {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastCheckIn: string | null;
  weeklyCheckIns: number;
  contentGenerated: number;
  threadsCreated: number;
  draftsSaved: number;
  editingIterations: number;
  healthScore: number;
  xPostsCount: number;
  aiGeneratedTweets: number;
  recentActivity: Array<{
    type: string;
    createdAt: string;
  }>;
}

const LEVEL_NAMES = [
  'Beginner', 'Builder', 'Marketer', 'Growth Expert', 'Launch Legend'
];

const LEVEL_COLORS = [
  'bg-gray-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-yellow-500'
];

const MotionButton = motion(Button as any);
const MotionCard = motion(Card as any);

const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } }
};

const cardHover = { whileHover: { y: -6, scale: 1.01 }, whileTap: { scale: 0.995 } };
const btnHoverTransition = { type: 'spring', stiffness: 400, damping: 28 };

const toastVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.5,
    y: 50
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0
  },
  exit: { 
    opacity: 0, 
    scale: 0.5,
    y: 50
  }
};

// Confetti particle component
const ConfettiParticle = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{
      background: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'][Math.floor(Math.random() * 5)],
      left: '50%',
      top: '50%',
    }}
    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
    }}
    transition={{
      duration: 1.2,
      delay,
      ease: "easeOut"
    }}
  />
);

export default function GamificationDashboard() {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [alreadyCheckedInToday, setAlreadyCheckedInToday] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/gamification/profile');
      const data = await response.json();
      console.log('Fetched profile data:', data);
      if (response.ok) {
        setProfile(data.profile);
      } else {
        console.error('Failed to fetch profile:', data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const response = await fetch('/api/gamification/check-in', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.alreadyCheckedIn) {
          setAlreadyCheckedInToday(true);
          setTimeout(() => {
            setAlreadyCheckedInToday(false);
          }, 2000);
        } else {
          // Show celebration
          setXpGained(5);
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            setXpGained(0);
          }, 2000);
          await fetchProfile();
        }
      }
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setCheckingIn(false);
    }
  };

  const getLevelProgress = () => {
    if (!profile) return 0;
    const currentLevelXp = (profile.level - 1) * 500;
    const nextLevelXp = profile.level * 500;
    const progress = ((profile.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getHealthScoreMessage = (score: number) => {
    if (score >= 80) return 'Marketing Master! 🚀';
    if (score >= 60) return 'Great momentum! 💪';
    if (score >= 40) return 'Building habits 📈';
    return 'Time to level up! ⚡';
  };

  const cardVariants = {
    hover: { 
      scale: 0.95,
      transition: { 
        type: 'spring', 
        stiffness: 300,
        damping: 10
      }
    },
    tap: { 
      scale: 1.02,
      transition: { 
        type: 'spring', 
        stiffness: 500,
        damping: 30 
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <MotionCard key={i} className="animate-pulse" initial="hidden" animate="visible" variants={fadeInUp} {...cardHover}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </MotionCard>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Failed to load Progress data</p>
        </CardContent>
      </Card>
    );
  }

  const levelIndex = Math.min(profile.level - 1, LEVEL_NAMES.length - 1);
  const levelName = LEVEL_NAMES[levelIndex];
  const levelColor = LEVEL_COLORS[levelIndex];

  return (
    <motion.div 
      className="space-y-8 pt-6 sm:w-10/10.5 w-11/12 mx-auto relative sm:h-[calc(100vh-7rem)] sm:overflow-y-auto scrollbar-hide bg-background"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
    >
      {/* Daily Check-in Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-cyan-900 via-cyan-800 to-blue-900 border-none overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 ">
              <div className="text-center md:text-left flex-1">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4"
                >
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-semibold">{profile.streak} Day Streak!</span>
                </motion.div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                  <Sparkles className="w-8 h-8 text-yellow-300" />
                  Daily Check-In
                </h2>
                <p className="text-cyan-100 text-lg mb-4 px-2">
                  Did you post today? Keep your streak alive and earn XP! 
                </p>

                <div className="relative inline-block">
                  <MotionButton
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="bg-white hover:bg-gray-100 text-cyan-900 px-10 py-6 text-xl font-bold rounded-2xl shadow-2xl inline-flex items-center justify-center relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={btnHoverTransition}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-green-200 to-blue-200"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10 flex items-center gap-3">
                      {checkingIn ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-900"></div>
                          Checking in...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-7 h-7" />
                          I Posted Today!
                          <span className="py-1 rounded-full text-md font-bold">
                            +5 XP
                          </span>
                        </>
                      )}
                    </span>
                  </MotionButton>

                  {/* Confetti Effect */}
                  {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <ConfettiParticle key={i} delay={i * 0.05} />
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-cyan-200 text-sm mt-4 italic">
                  Honor system - we trust you!
                </p>
              </div>

              {/* Stats Preview */}
              <motion.div 
                className="flex justify-between space-x-4  bg-white/10 backdrop-blur-sm p-6 rounded-2xl"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center text-white">
                  <div>
                    <p className="text-sm opacity-80">This Week</p>
                    <p className="text-2xl font-bold">{profile.weeklyCheckIns} days</p>
                  </div>
                </div>
                <div className="flex items-center  text-white">
                  <div>
                    <p className="text-sm opacity-80">Best Streak</p>
                    <p className="text-2xl font-bold">{profile.longestStreak} days</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {alreadyCheckedInToday && (
          <motion.div 
            className="fixed top-20 right-4 z-50 bg-green-700  text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3"
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            
            <div>
              <p className="font-bold">Already checked in!</p>
              <p className="text-sm">Come back tomorrow </p>
            </div>
          </motion.div>
        )}
        
        {xpGained > 0 && (
          <motion.div 
            className="fixed top-20 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3"
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            <Zap className="w-6 h-6 animate-bounce" />
            <div>
              <p className="font-bold">+{xpGained} XP Earned!</p>
              <p className="text-sm">Streak maintained! 🔥</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MotionCard 
          className=" bg-cyan-900 border-none text-white" 
          initial="hidden"
          animate="visible"
          variants={{
            ...fadeInUp,
            hover: cardVariants.hover,
            tap: cardVariants.tap
          }}
          whileHover="hover"
          whileTap="tap"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Level</p>
                <p className="text-2xl text-white font-bold">{levelName}</p>
                <p className="text-blue-100 text-xs">Lv. {profile.level}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${levelColor} flex items-center justify-center shadow-lg`}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </MotionCard>

        <MotionCard 
          className="bg-cyan-900 border-none text-white" 
          initial="hidden"
          animate="visible"
          variants={{
            ...fadeInUp,
            hover: cardVariants.hover,
            tap: cardVariants.tap
          }}
          whileHover="hover"
          whileTap="tap"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">XP</p>
                <p className="text-2xl text-white font-bold">{profile.xp.toLocaleString()}</p>
                <p className="text-orange-100 text-xs">{getLevelProgress().toFixed(0)}% to next level</p>
              </div>
              <div className="w-12 h-12  rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </MotionCard>

        <MotionCard 
          className="bg-cyan-900 border-none text-white" 
          initial="hidden"
          animate="visible"
          variants={{
            ...fadeInUp,
            hover: cardVariants.hover,
            tap: cardVariants.tap
          }}
          whileHover="hover"
          whileTap="tap"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Streak</p>
                <p className="text-2xl text-white font-bold">{profile.streak}</p>
                <p className="text-red-100 text-xs">Best: {profile.longestStreak}</p>
              </div>
              <div className="w-12 h-12  rounded-full flex items-center justify-center shadow-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </MotionCard>

        <MotionCard 
          className="bg-cyan-900 border-none text-white" 
          initial="hidden"
          animate="visible"
          variants={{
            ...fadeInUp,
            hover: cardVariants.hover,
            tap: cardVariants.tap
          }}
          whileHover="hover"
          whileTap="tap"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Health Score</p>
                <p className={`text-2xl text-white font-bold`}>
                  {profile.healthScore}/100
                </p>
                <p className="text-purple-100 text-xs">{getHealthScoreMessage(profile.healthScore)}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </MotionCard>
      </div>

      {/* Level Progress */}
      <MotionCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Level Progress
          </CardTitle>
          <CardDescription className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <span>{profile.xp.toLocaleString()} XP • {levelName} (Level {profile.level})</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
              Earn 10 XP per post!
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Progress value={getLevelProgress()} className="h-4 " />
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: `${getLevelProgress()}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-3 font-medium">
            {((profile.level) * 500 - profile.xp).toLocaleString()} XP to reach {LEVEL_NAMES[Math.min(profile.level, LEVEL_NAMES.length - 1)]}
          </p>
        </CardContent>
      </MotionCard>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MotionCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Content Creation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div 
              className="flex justify-between items-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              whileHover={{ x: 5 }}
            >
              <span className="text-sm font-semibold text-gray-700">Tweets Generated</span>
              <span className="text-xl font-bold text-blue-600">{profile.aiGeneratedTweets}</span>
            </motion.div>
            <motion.div 
              className="flex justify-between items-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
              whileHover={{ x: 5 }}
            >
              <span className="text-sm font-semibold text-gray-700">Posted to X</span>
              <span className="text-xl font-bold text-green-600">{profile.xPostsCount}</span>
            </motion.div>
            <motion.div 
              className="flex justify-between items-center p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
              whileHover={{ x: 5 }}
            >
              <span className="text-sm font-semibold text-gray-700">Threads Created</span>
              <span className="text-xl font-bold text-purple-600">{profile.threadsCreated}</span>
            </motion.div>
          </CardContent>
        </MotionCard>

        <MotionCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              Consistency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div 
              className="flex justify-between items-center p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
              whileHover={{ x: 5 }}
            >
              <span className="text-sm font-semibold text-gray-700">Current Streak</span>
              <span className="text-xl font-bold text-orange-600">{profile.streak} days </span>
            </motion.div>
            <motion.div 
              className="flex justify-between items-center p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
              whileHover={{ x: 5 }}
            >
              <span className="text-sm font-semibold text-gray-700">Longest Streak</span>
              <span className="text-xl font-bold text-purple-600">{profile.longestStreak} days </span>
            </motion.div>
            <motion.div 
              className="flex justify-between items-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              whileHover={{ x: 5 }}
            >
              <span className="text-sm font-semibold text-gray-700">This Week</span>
              <span className="text-xl font-bold text-blue-600">{profile.weeklyCheckIns} check-ins</span>
            </motion.div>
            <motion.div 
              className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              whileHover={{ x: 5 }}
            >
              <span className="text-sm font-semibold text-gray-700">Last Check-in</span>
              <span className="text-md font-bold text-gray-700">
                {profile.lastCheckIn 
                  ? new Date(profile.lastCheckIn).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </motion.div>
          </CardContent>
        </MotionCard>
      </div>
    </motion.div>
  );
}
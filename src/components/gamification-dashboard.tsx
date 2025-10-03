'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Zap, Target, Calendar, TrendingUp, Star, Flame, CheckCircle } from 'lucide-react';
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

// Motion wrappers (use "as any" to avoid strict typing issues with your UI components)
const MotionButton = motion(Button as any);
const MotionCard = motion(Card as any);

// simple variants
const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } }
};

const cardHover = { whileHover: { y: -6, scale: 1.01 }, whileTap: { scale: 0.995 } };
const btnHoverTransition = { type: 'spring', stiffness: 400, damping: 28 };

// Toast animation variants
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

export default function GamificationDashboard() {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [alreadyCheckedInToday, setAlreadyCheckedInToday] = useState(false);

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
          // User has already checked in today
          setAlreadyCheckedInToday(true);
          
          // Reset after a short animation
          setTimeout(() => {
            setAlreadyCheckedInToday(false);
          }, 2000);
        } else {
          // Successful first check-in
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

  // Motion variants for card interactions
  const cardVariants = {
    hover: { 
      scale: 0.95,  // Slightly less aggressive scaling
      transition: { 
        type: 'spring', 
        stiffness: 300,  // More responsive spring
        damping: 10      // Bouncy effect
      }
    },
    tap: { 
      scale: 1.02,  // Slightly less aggressive scaling
      transition: { 
        type: 'spring', 
        stiffness: 500,
        damping: 30 
      }
    }
  };

  // Congrats animation variants
  const congratsVariants = {
    initial: { 
      scale: 1, 
      opacity: 0,
      rotate: 0
    },
    animate: { 
      scale: 1.2,
      opacity: 1,
      rotate: 10,
      transition: {
        duration: 0.5
      }
    },
    exit: {
      scale: 1,
      opacity: 0,
      rotate: 0,
      transition: {
        duration: 0.5
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
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MotionCard 
          className="bg-cyan-900" 
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
                <p className="text-blue-100 text-sm">Level</p>
                <p className="text-2xl text-cyan-100 font-bold">{levelName}</p>
                <p className="text-blue-100 text-xs">Lv. {profile.level}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${levelColor} flex items-center justify-center`}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </MotionCard>

        <MotionCard 
          className="bg-cyan-900" 
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
                <p className="text-orange-100 text-sm">XP</p>
                <p className="text-2xl text-cyan-100 font-bold">{profile.xp.toLocaleString()}</p>
                <p className="text-orange-100 text-xs">{getLevelProgress().toFixed(0)}% to next level</p>
              </div>
              <div className="w-12 h-12  flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </MotionCard>

        <MotionCard 
          className="bg-cyan-900" 
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
                <p className="text-green-100 text-sm">Streak</p>
                <p className="text-2xl text-cyan-100 font-bold">{profile.streak}</p>
                <p className="text-green-100 text-xs">Best: {profile.longestStreak}</p>
              </div>
              <div className="w-12 h-12   flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </MotionCard>

        <MotionCard 
          className="bg-cyan-900" 
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
                <p className="text-purple-100 text-sm">Health Score</p>
                <p className={`text-2xl text-cyan-100 font-bold ${getHealthScoreColor(profile.healthScore)}`}>
                  {profile.healthScore}/100
                </p>
                <p className="text-purple-100 text-xs">{getHealthScoreMessage(profile.healthScore)}</p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </MotionCard>
      </div>

      {/* Level Progress */}
      <MotionCard >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Level Progress <p className="text-sm px-10 text-gray-500">On Every Post You Get 10 XP</p>
          </CardTitle>
          
          <CardDescription>
            {profile.xp.toLocaleString()} XP • {levelName} (Level {profile.level})
          </CardDescription>
          
        </CardHeader>
        <CardContent>
          <Progress value={getLevelProgress()} className="h-3" />
          <p className="text-sm text-gray-500 mt-2">
            {((profile.level) * 500 - profile.xp).toLocaleString()} XP to reach {LEVEL_NAMES[Math.min(profile.level, LEVEL_NAMES.length - 1)]}
          </p>
        </CardContent>
      </MotionCard>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MotionCard >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Content Creation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold  text-gray-600">Tweets Generated</span>
              <h1  className="text-md font-bold">{profile.aiGeneratedTweets}</h1>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Posted to X</span>
              <h1  className="text-md font-bold">{profile.xPostsCount}</h1>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Threads Created</span>
              <h1  className="text-md font-bold">{profile.threadsCreated}</h1>
            </div>
            {/* <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Drafts Saved</span>
              <h1  className="text-md font-bold">{profile.draftsSaved}</h1>
            </div> */}
            {/* <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Editing Iterations</span>
              <h1  className="text-md font-bold">{profile.editingIterations}</h1>
            </div> */}
          </CardContent>
        </MotionCard>

        <MotionCard >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              Consistency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Current Streak</span>
              <h1  className="text-orange-600 text-md font-bold">
                {profile.streak} days
              </h1>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Longest Streak</span>
              <h1  className="text-purple-600 text-md font-bold">
                {profile.longestStreak} days
              </h1>
              
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">This Week</span>
              <h1  className="text-blue-600 text-md font-bold">
                {profile.weeklyCheckIns} check-ins
              </h1>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Last Check-in</span>
              <h1  className="text-md font-bold">
                {profile.lastCheckIn 
                  ? new Date(profile.lastCheckIn).toLocaleDateString()
                  : 'Never'
                }
              </h1>
            </div>
          </CardContent>
        </MotionCard>
      </div>

      {/* Check-in Button */}
      <Card>
        <CardContent className="p-6 text-center relative">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Daily Check-in</h3>
              <p className="text-gray-600 font-semibold text-sm">
                Mark that you posted content today and keep your streak alive!
              </p>
            </div>

            {/* Checked-in Toast Notification */}
            <AnimatePresence>
              {alreadyCheckedInToday && (
                <motion.div 
                  className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
                  variants={toastVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 10
                  }}
                >
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">
                    You've already checked in today!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Motion Button with friendly hover and tap animations */}
            <MotionButton
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="bg-cyan-900 hover:bg-cyan-800 text-white px-8 py-3 text-lg inline-flex items-center justify-center"
              whileHover={{ scale: 1.03, y: -3, boxShadow: '0 10px 20px rgba(2,6,23,0.12)' }}
              whileTap={{ scale: 0.985 }}
              transition={btnHoverTransition}
              aria-pressed={checkingIn}
            >
              {checkingIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking in...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  I Posted Today! (+5 XP)
                </>
              )}
            </MotionButton>

            <p className="text-xs text-gray-500">
              Honor system - we trust you! 🎯
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

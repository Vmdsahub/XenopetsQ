import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthScreen } from './components/Auth/AuthScreen';
import { TopBar } from './components/Layout/TopBar';
import { BottomNavigation } from './components/Layout/BottomNavigation';
import { PetScreen } from './components/Screens/PetScreen';
import { WorldScreen } from './components/Screens/WorldScreen';
import { InventoryScreen } from './components/Screens/InventoryScreen';
import { ProfileScreen } from './components/Screens/ProfileScreen';
import { AdminPanel } from './components/Admin/AdminPanel';
import { useAuthStore } from './store/authStore';
import { useGameStore } from './store/gameStore';

function App() {
  const { isAuthenticated, user: authUser, initializeAuth } = useAuthStore();
  const { currentScreen, user: gameUser, setUser, initializeNewUser, loadUserData, syncWithDatabase } = useGameStore();

  // Initialize authentication on app start
  useEffect(() => {
    const init = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };
    init();
  }, []);

  // Sync auth user with game user and load data
  useEffect(() => {
    if (isAuthenticated && authUser && (!gameUser || gameUser.id !== authUser.id)) {
      const gameUserData = {
        id: authUser.id,
        email: authUser.email,
        username: authUser.username,
        phone: authUser.phone,
        isAdmin: authUser.isAdmin,
        language: authUser.language,
        accountScore: authUser.accountScore,
        daysPlayed: authUser.daysPlayed,
        totalXenocoins: authUser.totalXenocoins,
        createdAt: authUser.createdAt,
        lastLogin: authUser.lastLogin
      };
      
      if (!gameUser) {
        initializeNewUser(gameUserData);
        // Load user data from database
        loadUserData(authUser.id);
      } else {
        setUser(gameUserData);
        // Sync with database
        syncWithDatabase();
      }
    } else if (!isAuthenticated && gameUser) {
      setUser(null);
    }
  }, [isAuthenticated, authUser?.id]);

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'pet':
        return <PetScreen />;
      case 'world':
        return <WorldScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'admin':
        return gameUser?.isAdmin ? <AdminPanel /> : <ProfileScreen />;
      default:
        return <PetScreen />;
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <TopBar />
      
      <main className="pt-20 pb-24 px-4 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <BottomNavigation />
    </div>
  );
}

export default App;
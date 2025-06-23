import React, { useState } from 'react';
import { Trophy, Calendar, Star, Settings, Shield, Users, Award, Gift, LogOut, Crown, Search, UserPlus, ArrowLeft, Eye, MessageCircle, UserCheck, Lock, CheckCircle, Ticket, Copy, Check } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../../types/game';

export const ProfileScreen: React.FC = () => {
  const { 
    user, 
    activePet, 
    pets, 
    achievements, 
    searchPlayers, 
    getPlayerProfile,
    getAllCollectibles,
    getCollectiblesByType,
    getCollectedCollectibles,
    getTotalCollectiblePoints,
    collectItem,
    redeemCode
  } = useGameStore();
  const { logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  
  // Code redemption state
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleSearchPlayers = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchPlayers(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        // Show no results message
      }
    } catch (error) {
      console.error('Error searching players:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewProfile = async (playerId: string) => {
    try {
      const profile = await getPlayerProfile(playerId);
      if (profile) {
        setViewingProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching player profile:', error);
    }
  };

  const handleRedeemCode = async () => {
    if (!redeemCodeInput.trim()) return;
    
    setIsRedeeming(true);
    setRedeemMessage('');
    
    try {
      const result = await redeemCode(redeemCodeInput.trim());
      setRedeemSuccess(result.success);
      setRedeemMessage(result.message);
      
      if (result.success) {
        setRedeemCodeInput('');
        // Clear message after 5 seconds
        setTimeout(() => {
          setRedeemMessage('');
          setRedeemSuccess(false);
        }, 5000);
      }
    } catch (error) {
      setRedeemSuccess(false);
      setRedeemMessage('Erro ao resgatar código. Tente novamente.');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (!user) {
    return (
      <motion.div 
        className="flex items-center justify-center h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Não Logado</h2>
          <p className="text-gray-600">Por favor, faça login para ver seu perfil.</p>
        </div>
      </motion.div>
    );
  }

  const totalDaysPlayed = Math.floor(
    (new Date().getTime() - user.createdAt.getTime()) / (1000 * 3600 * 24)
  );

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const totalAchievements = achievements.length;

  // Get collectibles data
  const allCollectibles = getAllCollectibles();
  const collectedCollectibles = getCollectedCollectibles();
  const collectedCount = collectedCollectibles.length;
  const totalCollectiblePoints = getTotalCollectiblePoints();

  const quickActions = [
    {
      id: 'redeem',
      title: 'Resgatar Código',
      description: 'Digite um código para recompensas',
      icon: Ticket,
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      iconColor: 'text-orange-600'
    },
    {
      id: 'search',
      title: 'Buscar Jogadores',
      description: 'Encontre outros treinadores',
      icon: Search,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Gerencie preferências da conta',
      icon: Settings,
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
      iconColor: 'text-gray-600'
    }
  ];

  const getRarityColor = (rarity: string) => {
    const colors = {
      Common: 'border-gray-300 bg-gray-50 text-gray-700',
      Uncommon: 'border-green-300 bg-green-50 text-green-700',
      Rare: 'border-blue-300 bg-blue-50 text-blue-700',
      Epic: 'border-purple-300 bg-purple-50 text-purple-700',
      Legendary: 'border-yellow-300 bg-yellow-50 text-yellow-700',
      Unique: 'border-red-300 bg-red-50 text-red-700'
    };
    return colors[rarity as keyof typeof colors] || colors.Common;
  };

  const getCollectibleIcon = (type: string, rarity: string) => {
    const icons = {
      egg: rarity === 'Unique' ? '🥚' : '🥚',
      fish: '🐟',
      gem: '💎',
      stamp: '📜'
    };
    return icons[type as keyof typeof icons] || '📦';
  };

  const renderRedeemCodePage = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Resgatar Código</h2>
            <p className="text-gray-600">Digite um código para receber recompensas especiais</p>
          </div>
        </div>
      </div>

      {/* Code Input */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Digite seu Código</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="redeemCode" className="block text-sm font-medium text-gray-700 mb-2">
              Código de Resgate
            </label>
            <div className="flex space-x-3">
              <input
                id="redeemCode"
                type="text"
                value={redeemCodeInput}
                onChange={(e) => setRedeemCodeInput(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all uppercase"
                placeholder="Digite o código aqui..."
                maxLength={20}
                disabled={isRedeeming}
                onKeyPress={(e) => e.key === 'Enter' && handleRedeemCode()}
              />
              <motion.button
                onClick={handleRedeemCode}
                disabled={isRedeeming || !redeemCodeInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isRedeeming ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Gift className="w-5 h-5" />
                )}
                <span>{isRedeeming ? 'Resgatando...' : 'Resgatar'}</span>
              </motion.button>
            </div>
          </div>

          {/* Result Message */}
          {redeemMessage && (
            <motion.div
              className={`p-4 rounded-2xl border-2 ${
                redeemSuccess 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-red-300 bg-red-50'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center space-x-3">
                {redeemSuccess ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <Lock className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <p className={`${redeemSuccess ? 'text-green-700' : 'text-red-700'} font-medium`}>
                  {redeemMessage}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Como Funciona</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Obtenha um Código</p>
              <p className="text-gray-600 text-sm">Códigos são distribuídos através de eventos, redes sociais, ou promoções especiais.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Digite o Código</p>
              <p className="text-gray-600 text-sm">Insira o código exatamente como recebido (não diferencia maiúsculas/minúsculas).</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Receba Recompensas</p>
              <p className="text-gray-600 text-sm">Ganhe Xenocoins, Cash, itens especiais, colecionáveis e pontos de conta!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Codes (for demonstration) */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Códigos de Exemplo</h3>
        <p className="text-gray-600 text-sm mb-4">Experimente estes códigos para testar o sistema:</p>
        
        <div className="space-y-3">
          {[
            { code: 'ALPHA2025', description: 'Pacote especial para jogadores alpha' },
            { code: 'WELCOME100', description: 'Pacote de boas-vindas para novos jogadores' },
            { code: 'WEEKEND50', description: 'Bônus especial de fim de semana' }
          ].map((sample, index) => (
            <motion.div
              key={sample.code}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div>
                <p className="font-mono font-bold text-gray-900">{sample.code}</p>
                <p className="text-gray-600 text-sm">{sample.description}</p>
              </div>
              <motion.button
                onClick={() => setRedeemCodeInput(sample.code)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Copy className="w-4 h-4" />
                <span>Usar</span>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderAchievementsPage = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Conquistas</h2>
              <p className="text-gray-600">Suas conquistas e progresso</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">{unlockedAchievements.length}</p>
            <p className="text-sm text-gray-500">de {totalAchievements}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <motion.div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalAchievements > 0 ? (unlockedAchievements.length / totalAchievements) * 100 : 0}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <p className="text-center text-sm text-gray-600">
          {totalAchievements > 0 ? Math.round((unlockedAchievements.length / totalAchievements) * 100) : 0}% completo
        </p>
      </div>

      {/* Achievements List */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Todas as Conquistas</h3>
        
        <div className="space-y-4">
          {/* Sample achievements */}
          {[
            { name: 'Primeiro Pet', description: 'Criou seu primeiro pet', category: 'special', unlocked: true, icon: '🐾', reward: '100 Xenocoins' },
            { name: 'Explorador', description: 'Visitou 5 continentes diferentes', category: 'exploration', unlocked: true, icon: '🗺️', reward: '250 Xenocoins' },
            { name: 'Colecionador', description: 'Coletou 10 itens únicos', category: 'collection', unlocked: true, icon: '💎', reward: '500 Xenocoins' },
            { name: 'Guerreiro', description: 'Venceu 10 batalhas', category: 'combat', unlocked: false, icon: '⚔️', reward: '300 Xenocoins', progress: 3, maxProgress: 10 },
            { name: 'Socialite', description: 'Fez 5 amigos', category: 'social', unlocked: false, icon: '👥', reward: '200 Xenocoins', progress: 1, maxProgress: 5 },
            { name: 'Mestre dos Pets', description: 'Alcançou nível 50 com um pet', category: 'special', unlocked: false, icon: '🏆', reward: '1000 Xenocoins', progress: 12, maxProgress: 50 }
          ].map((achievement, index) => (
            <motion.div
              key={achievement.name}
              className={`p-4 rounded-2xl border-2 transition-all ${
                achievement.unlocked 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  achievement.unlocked ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  {achievement.unlocked ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Lock className="w-6 h-6 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 flex items-center space-x-2">
                      <span>{achievement.name}</span>
                      <span className="text-lg">{achievement.icon}</span>
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      achievement.unlocked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {achievement.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                  
                  {!achievement.unlocked && achievement.progress !== undefined && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">
                      🎁 {achievement.reward}
                    </span>
                    {achievement.unlocked && (
                      <span className="text-xs text-green-600 font-medium">
                        ✅ Desbloqueado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderCollectiblesPage = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Colecionáveis</h2>
              <p className="text-gray-600">Sua coleção de itens raros</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-pink-600">{collectedCount}</p>
            <p className="text-sm text-gray-500">de {allCollectibles.length}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <motion.div 
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${allCollectibles.length > 0 ? (collectedCount / allCollectibles.length) * 100 : 0}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">
            {allCollectibles.length > 0 ? Math.round((collectedCount / allCollectibles.length) * 100) : 0}% da coleção completa
          </p>
          <p className="text-purple-600 font-semibold">
            +{totalCollectiblePoints} pontos de conta
          </p>
        </div>
      </div>

      {/* Collectibles by Type */}
      {['egg', 'fish', 'gem', 'stamp'].map((type) => {
        const typeCollectibles = getCollectiblesByType(type as any);
        const collectedInType = typeCollectibles.filter(c => c.isCollected);
        
        // Only show sections that have collected items
        if (collectedInType.length === 0) return null;
        
        const typeNames = {
          egg: 'Ovos',
          fish: 'Peixes', 
          gem: 'Gemas',
          stamp: 'Selos'
        };
        
        const typeIcons = {
          egg: '🥚',
          fish: '🐟',
          gem: '💎', 
          stamp: '📜'
        };

        return (
          <motion.div
            key={type}
            className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <span className="text-2xl">{typeIcons[type as keyof typeof typeIcons]}</span>
                <span>{typeNames[type as keyof typeof typeNames]}</span>
              </h3>
              <span className="text-sm text-gray-500">
                {collectedInType.length} coletado{collectedInType.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {collectedInType.map((collectible, index) => (
                <motion.div
                  key={collectible.id}
                  className={`p-4 rounded-2xl border-2 ${getRarityColor(collectible.rarity)}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md border-2 border-gray-100">
                      <span className="text-3xl">
                        {getCollectibleIcon(collectible.type, collectible.rarity)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{collectible.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(collectible.rarity)}`}>
                            {collectible.rarity}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            +{collectible.accountPoints} pts
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{collectible.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {collectible.obtainMethod}
                        </span>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">
                            Coletado {collectible.collectedAt ? new Date(collectible.collectedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Empty State */}
      {collectedCount === 0 && (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Nenhum Colecionável</h3>
          <p className="text-gray-600 mb-6">
            Você ainda não coletou nenhum item. Explore o mundo, complete quests e visite lojas para encontrar colecionáveis raros!
          </p>
          <motion.button
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection(null)}
          >
            Começar a Explorar
          </motion.button>
        </div>
      )}
    </motion.div>
  );

  const renderPlayerProfile = (player: User) => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Profile Header - Identical to user's own profile */}
      <motion.div 
        className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-4 mb-6">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                {player.username.charAt(0)}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </motion.div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{player.username}</h2>
            <p className="text-gray-600 text-sm">Treinador Xenopets</p>
            <div className="flex items-center space-x-3 mt-2">
              {player.isAdmin && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full border border-yellow-300">
                  <Crown className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700">Admin</span>
                </div>
              )}
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 rounded-full">
                <Star className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Level {Math.floor(player.accountScore / 500) + 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <motion.div 
            className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-200"
            whileHover={{ scale: 1.02 }}
          >
            <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-xs text-blue-600 font-medium">Dias Jogados</p>
            <p className="text-xl font-bold text-blue-800">{player.daysPlayed}</p>
          </motion.div>
          <motion.div 
            className="text-center p-4 bg-yellow-50 rounded-2xl border border-yellow-200"
            whileHover={{ scale: 1.02 }}
          >
            <Star className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
            <p className="text-xs text-yellow-600 font-medium">Pontuação</p>
            <p className="text-xl font-bold text-yellow-800">{player.accountScore.toLocaleString()}</p>
          </motion.div>
          <motion.div 
            className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-200"
            whileHover={{ scale: 1.02 }}
          >
            <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-xs text-purple-600 font-medium">Conquistas</p>
            <p className="text-xl font-bold text-purple-800">12</p>
          </motion.div>
          <motion.div 
            className="text-center p-4 bg-pink-50 rounded-2xl border border-pink-200"
            whileHover={{ scale: 1.02 }}
          >
            <Gift className="w-6 h-6 mx-auto mb-2 text-pink-600" />
            <p className="text-xs text-pink-600 font-medium">Colecionáveis</p>
            <p className="text-xl font-bold text-pink-800">8</p>
          </motion.div>
        </div>

        {/* Online Status */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium text-sm">Perfil Público</span>
          </div>
          <span className="text-green-600 text-sm">Membro desde {player.createdAt.toLocaleDateString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-4">
          <motion.button
            className="flex-1 flex items-center justify-center space-x-2 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Mensagem</span>
          </motion.button>
          <motion.button
            className="flex-1 flex items-center justify-center space-x-2 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <UserPlus className="w-4 h-4" />
            <span>Adicionar</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Player Activity */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Atividade Recente</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Último login</p>
              <p className="text-xs text-gray-600">{player.lastLogin.toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Membro desde</p>
              <p className="text-xs text-gray-600">{player.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderPlayerSearch = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Buscar Jogadores</h3>
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Digite o nome do jogador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearchPlayers()}
          />
          <motion.button
            onClick={handleSearchPlayers}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span>Buscar</span>
          </motion.button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Resultados da Busca ({searchResults.length})</h4>
          <div className="space-y-3">
            {searchResults.map((player, index) => (
              <motion.div
                key={player.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {player.username.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{player.username}</p>
                      {player.isAdmin && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Score: {player.accountScore.toLocaleString()}</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => handleViewProfile(player.id)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Perfil</span>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Nenhum jogador encontrado com o nome "{searchQuery}".</p>
          <p className="text-gray-500 text-sm mt-2">Tente usar um nome diferente ou verifique a ortografia.</p>
        </div>
      )}
    </motion.div>
  );

  // Show redeem code page
  if (activeSection === 'redeem') {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Resgatar Código</h2>
          <motion.button
            onClick={() => setActiveSection(null)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </motion.button>
        </div>
        {renderRedeemCodePage()}
      </div>
    );
  }

  // Show achievements page
  if (activeSection === 'achievements') {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Conquistas</h2>
          <motion.button
            onClick={() => setActiveSection(null)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </motion.button>
        </div>
        {renderAchievementsPage()}
      </div>
    );
  }

  // Show collectibles page
  if (activeSection === 'collectibles') {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Colecionáveis</h2>
          <motion.button
            onClick={() => setActiveSection(null)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </motion.button>
        </div>
        {renderCollectiblesPage()}
      </div>
    );
  }

  // Show player profile view
  if (viewingProfile) {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Perfil do Jogador</h2>
          <motion.button
            onClick={() => setViewingProfile(null)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </motion.button>
        </div>
        {renderPlayerProfile(viewingProfile)}
      </div>
    );
  }

  // Show search interface
  if (activeSection === 'search') {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Buscar Jogadores</h2>
          <motion.button
            onClick={() => setActiveSection(null)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </motion.button>
        </div>
        {renderPlayerSearch()}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div 
        className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-4 mb-6">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                {user.username.charAt(0)}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </motion.div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
            <p className="text-gray-600 text-sm">{user.email}</p>
            <div className="flex items-center space-x-3 mt-2">
              {user.isAdmin && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full border border-yellow-300">
                  <Crown className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700">Admin</span>
                </div>
              )}
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 rounded-full">
                <Star className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Level {Math.floor(user.accountScore / 500) + 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - 4 columns with clickable buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <motion.div 
            className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-200 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-xs text-blue-600 font-medium">Dias Jogados</p>
            <p className="text-xl font-bold text-blue-800">{totalDaysPlayed}</p>
          </motion.div>
          <motion.div 
            className="text-center p-4 bg-yellow-50 rounded-2xl border border-yellow-200 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Star className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
            <p className="text-xs text-yellow-600 font-medium">Pontuação</p>
            <p className="text-xl font-bold text-yellow-800">{user.accountScore.toLocaleString()}</p>
          </motion.div>
          <motion.button
            onClick={() => setActiveSection('achievements')}
            className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-200 hover:bg-purple-100 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-xs text-purple-600 font-medium">Conquistas</p>
            <p className="text-xl font-bold text-purple-800">{unlockedAchievements.length}</p>
          </motion.button>
          <motion.button
            onClick={() => setActiveSection('collectibles')}
            className="text-center p-4 bg-pink-50 rounded-2xl border border-pink-200 hover:bg-pink-100 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Gift className="w-6 h-6 mx-auto mb-2 text-pink-600" />
            <p className="text-xs text-pink-600 font-medium">Colecionáveis</p>
            <p className="text-xl font-bold text-pink-800">{collectedCount}</p>
          </motion.button>
        </div>

        {/* Online Status */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium text-sm">Online</span>
          </div>
          <span className="text-green-600 text-sm">Conectado ao servidor</span>
        </div>

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          className="w-full mt-4 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-semibold shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </motion.button>
      </motion.div>

      {/* My Pets */}
      <motion.div 
        className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Meus Pets</h3>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span>{pets.length}</span>
            <span>/</span>
            <span>3</span>
          </div>
        </div>
        <div className="space-y-3">
          {pets.map((pet, index) => (
            <motion.div
              key={pet.id}
              className={`flex items-center space-x-3 p-3 rounded-2xl border-2 transition-all ${
                activePet?.id === pet.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold">
                  {pet.species === 'Dragon' ? '🐉' : 
                   pet.species === 'Phoenix' ? '🔥' : 
                   pet.species === 'Griffin' ? '🦅' : '🦄'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{pet.name}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{pet.species}</span>
                  <span>•</span>
                  <span>Level {pet.level}</span>
                  <span>•</span>
                  <span className="capitalize">{pet.personality}</span>
                  {pet.conditions.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-orange-600">{pet.conditions.length} condição(ões)</span>
                    </>
                  )}
                </div>
              </div>
              {activePet?.id === pet.id && (
                <motion.span 
                  className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  Ativo
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions - Now includes Redeem Code */}
      <motion.div 
        className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Ações Rápidas</h3>
          <Users className="w-5 h-5 text-blue-500" />
        </div>
        
        <div className="space-y-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                onClick={() => setActiveSection(action.id)}
                className={`w-full flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all text-left ${action.color}`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className={`p-3 rounded-xl ${action.iconColor} bg-white shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
import React, { useState } from 'react';
import { PetPortrait } from '../Pet/PetPortrait';
import { PetCreation } from '../Pet/PetCreation';
import { useGameStore } from '../../store/gameStore';
import { Heart, Plus, MapPin, Package, Gamepad2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pet } from '../../types/game';

export const PetScreen: React.FC = () => {
  const { 
    activePet, 
    pets, 
    user,
    inventory,
    addNotification, 
    setActivePet,
    createPet,
    setCurrentScreen
  } = useGameStore();
  
  const [showPetCreation, setShowPetCreation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePet = async (petData: Pet) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const newPet = await createPet({
        name: petData.name,
        species: petData.species,
        style: petData.style,
        personality: petData.personality,
        happiness: petData.happiness,
        health: petData.health,
        hunger: petData.hunger,
        strength: petData.strength,
        dexterity: petData.dexterity,
        intelligence: petData.intelligence,
        speed: petData.speed,
        attack: petData.attack,
        defense: petData.defense,
        precision: petData.precision,
        evasion: petData.evasion,
        luck: petData.luck,
        conditions: [],
        equipment: {},
        isAlive: true,
        hatchTime: new Date(),
        lastInteraction: new Date(),
        ownerId: user.id
      });
      
      if (newPet) {
        addNotification({
          type: 'success',
          title: 'Pet Criado!',
          message: `Bem-vindo ${newPet.name} à sua família!`
        });
        
        setShowPetCreation(false);
      } else {
        addNotification({
          type: 'error',
          title: 'Erro',
          message: 'Ocorreu um erro ao criar seu pet.'
        });
      }
    } catch (error) {
      console.error('Error creating pet:', error);
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Ocorreu um erro ao criar seu pet.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPet = (pet: Pet) => {
    setActivePet(pet);
    addNotification({
      type: 'info',
      title: 'Pet Selecionado',
      message: `${pet.name} agora é seu pet ativo!`
    });
  };

  // Check if user can create new pet
  const canCreateNewPet = () => {
    if (!user) return false;
    
    const currentPetCount = pets.length;
    const accountScore = user.accountScore;
    
    if (currentPetCount === 0) return true; // First pet is always allowed
    if (currentPetCount === 1 && accountScore >= 5000) return true; // Second pet at 5000 score
    if (currentPetCount === 2 && accountScore >= 15000) return true; // Third pet at 15000 score
    if (currentPetCount >= 3) return false; // Maximum 3 pets
    
    return false;
  };

  const getRequiredScoreForNextPet = () => {
    const currentPetCount = pets.length;
    if (currentPetCount === 1) return 5000;
    if (currentPetCount === 2) return 15000;
    return 0;
  };

  // Show pet creation screen if no pets
  if (!activePet && pets.length === 0) {
    return (
      <>
        <motion.div 
          className="max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Plus className="w-12 h-12 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bem-vindo aos Xenopets!</h2>
            <p className="text-gray-600 mb-6">
              Sua aventura começa agora! Escolha seu primeiro ovo para chocar seu primeiro pet companheiro.
            </p>
            
            <motion.button
              onClick={() => setShowPetCreation(true)}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Escolha Seu Primeiro Ovo</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showPetCreation && (
            <PetCreation
              onComplete={handleCreatePet}
              onCancel={() => setShowPetCreation(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // Show no active pet message if pets exist but none is active
  if (!activePet && pets.length > 0) {
    return (
      <motion.div 
        className="max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecione Seu Pet Ativo</h2>
          <p className="text-gray-600 mb-6">Escolha com qual pet você gostaria de interagir.</p>
          
          <div className="space-y-3 mb-6">
            {pets.slice(0, 5).map((pet) => (
              <motion.button
                key={pet.id}
                onClick={() => handleSelectPet(pet)}
                className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {pet.species === 'Dragon' ? '🐉' : 
                     pet.species === 'Phoenix' ? '🔥' : 
                     pet.species === 'Griffin' ? '🦅' : '🦄'}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{pet.name}</p>
                  <p className="text-sm text-gray-600">{pet.species} • Level {pet.level}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Create New Pet Button */}
          {canCreateNewPet() ? (
            <motion.button
              onClick={() => setShowPetCreation(true)}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span>Criar Novo Pet</span>
            </motion.button>
          ) : (
            <motion.div
              className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl flex items-center justify-center space-x-2 cursor-not-allowed"
              whileHover={{ scale: 1.01 }}
            >
              <Lock className="w-5 h-5" />
              <span>Precisa de {getRequiredScoreForNextPet().toLocaleString()} pontos</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  const quickActions = [
    {
      id: 'inventory',
      title: 'Abrir Inventário',
      description: 'Use itens para cuidar do seu pet',
      icon: Package,
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      iconColor: 'text-green-600',
      action: () => setCurrentScreen('inventory')
    },
    {
      id: 'world',
      title: 'Explorar Mundo',
      description: 'Visite lojas, hospitais e minigames',
      icon: MapPin,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconColor: 'text-blue-600',
      action: () => setCurrentScreen('world')
    },
    {
      id: 'minigames',
      title: 'Jogar Minigames',
      description: 'Encontre minigames no mapa para se divertir',
      icon: Gamepad2,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      iconColor: 'text-purple-600',
      action: () => {
        setCurrentScreen('world');
        addNotification({
          type: 'info',
          title: 'Minigames no Mapa',
          message: 'Procure por pontos de interesse com ícone de jogo no mapa!'
        });
      }
    }
  ];

  return (
    <>
      <div className="max-w-md mx-auto">
        <PetPortrait pet={activePet!} />
        
        {/* Quick Navigation */}
        <motion.div 
          className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Navegação Rápida</h3>
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  onClick={action.action}
                  className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all duration-200 ${action.color}`}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className={`p-3 rounded-xl ${action.iconColor} bg-white shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Pet Status Summary */}
          <motion.div 
            className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h4 className="font-semibold text-gray-900 mb-2">Status Rápido</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Última Interação:</span>
                <span className="font-medium text-gray-900">
                  {new Date(activePet!.lastInteraction).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Condições:</span>
                <span className={`font-medium ${activePet!.conditions.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {activePet!.conditions.length > 0 ? `${activePet!.conditions.length} ativa(s)` : 'Saudável'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status Geral:</span>
                <span className={`font-medium ${
                  activePet!.health >= 7 && activePet!.happiness >= 7 && activePet!.hunger >= 6 ? 'text-green-600' :
                  activePet!.health >= 5 && activePet!.happiness >= 5 && activePet!.hunger >= 4 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {activePet!.health >= 7 && activePet!.happiness >= 7 && activePet!.hunger >= 6 ? 'Excelente' :
                   activePet!.health >= 5 && activePet!.happiness >= 5 && activePet!.hunger >= 4 ? 'Bom' : 'Precisa de Cuidados'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Itens Disponíveis:</span>
                <span className="font-medium text-blue-600">
                  {inventory.filter(item => item.quantity > 0).length} itens
                </span>
              </div>
            </div>
          </motion.div>

          {/* Create New Pet Button - Smaller */}
          <div className="mt-6">
            {canCreateNewPet() ? (
              <motion.button
                onClick={() => setShowPetCreation(true)}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-md flex items-center justify-center space-x-2 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                <span>Criar Novo Pet</span>
              </motion.button>
            ) : (
              <motion.div
                className="w-full py-2 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center space-x-2 cursor-not-allowed text-sm"
                whileHover={{ scale: 1.01 }}
                title={`Você precisa de ${getRequiredScoreForNextPet().toLocaleString()} pontos para criar outro pet`}
              >
                <Lock className="w-4 h-4" />
                <span>Bloqueado ({getRequiredScoreForNextPet().toLocaleString()} pts)</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showPetCreation && (
          <PetCreation
            onComplete={handleCreatePet}
            onCancel={() => setShowPetCreation(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
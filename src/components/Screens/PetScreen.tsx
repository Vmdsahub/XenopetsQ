import React, { useState } from 'react';
import { PetPortrait } from '../Pet/PetPortrait';
import { PetCreation } from '../Pet/PetCreation';
import { useGameStore } from '../../store/gameStore';
import { Heart, Plus, Lock } from 'lucide-react';
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
        level: petData.level,
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
          message: `Bem-vindo ${newPet.name} à sua família!`,
          isRead: false
        });
        
        setShowPetCreation(false);
      } else {
        addNotification({
          type: 'error',
          title: 'Erro',
          message: 'Ocorreu um erro ao criar seu pet.',
          isRead: false
        });
      }
    } catch (error) {
      console.error('Error creating pet:', error);
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Ocorreu um erro ao criar seu pet.',
        isRead: false
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
      message: `${pet.name} agora é seu pet ativo!`,
      isRead: false
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

  return (
    <>
      <div className="max-w-md mx-auto">
        <PetPortrait pet={activePet!} />
        
        {/* Botão de escolher ovo bloqueado */}
        <motion.div 
          className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center space-x-2 cursor-not-allowed"
            whileHover={{ scale: 1.01 }}
            title="Você precisa de 5.000 pontos para desbloquear"
          >
            <Lock className="w-5 h-5" />
            <span>Bloqueado (5.000 pts)</span>
          </motion.div>
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
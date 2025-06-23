import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Lock, Star, MessageSquare, ShoppingCart, X, Coins, DollarSign, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { Item } from '../../types/game';

interface Shop {
  id: string;
  name: string;
  description: string;
  npcName: string;
  npcDialogue: string;
  npcImage: string;
  items: ShopItem[];
}

interface ShopItem {
  id: string;
  itemId: string;
  price: number;
  currency: 'xenocoins' | 'cash';
  stockLimit?: number;
  isAvailable: boolean;
}

const continents = [
  {
    id: 'forest',
    name: 'Mystic Forest',
    description: 'Ancient woods filled with magical creatures and hidden secrets',
    image: 'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=600',
    unlocked: true,
    pois: [
      { 
        id: 'shop1', 
        name: 'Woodland General Store', 
        x: 25, 
        y: 60, 
        type: 'shop', 
        unlocked: true,
        shop: {
          id: 'shop1',
          name: 'Woodland General Store',
          description: 'Your one-stop shop for basic pet care items',
          npcName: 'Merchant Maya',
          npcDialogue: 'Welcome to my shop, traveler! I have the finest items for your pets. What can I help you find today?',
          npcImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
          items: [
            { id: 'si1', itemId: 'health-potion-1', price: 50, currency: 'xenocoins', isAvailable: true },
            { id: 'si2', itemId: 'magic-apple-1', price: 25, currency: 'xenocoins', isAvailable: true },
            { id: 'si3', itemId: 'happiness-toy-1', price: 30, currency: 'xenocoins', isAvailable: true }
          ]
        }
      },
      { id: 'hospital1', name: 'Forest Healing Sanctuary', x: 70, y: 40, type: 'hospital', unlocked: true },
      { id: 'quest1', name: 'Elder Tree Quest', x: 50, y: 25, type: 'quest', unlocked: false }
    ]
  },
  {
    id: 'desert',
    name: 'Golden Desert',
    description: 'Vast dunes hiding ancient treasures and mysterious oases',
    image: 'https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?auto=compress&cs=tinysrgb&w=600',
    unlocked: true,
    pois: [
      { 
        id: 'bank1', 
        name: 'Desert Vault', 
        x: 50, 
        y: 30, 
        type: 'bank', 
        unlocked: true 
      },
      { 
        id: 'shop2', 
        name: 'Oasis Trading Post', 
        x: 35, 
        y: 70, 
        type: 'shop', 
        unlocked: true,
        shop: {
          id: 'shop2',
          name: 'Oasis Trading Post',
          description: 'Rare items and equipment for the adventurous',
          npcName: 'Desert Trader Zara',
          npcDialogue: 'Ah, a fellow traveler! The desert has been kind to me, and I have rare treasures to share. Perhaps something for your companions?',
          npcImage: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200',
          items: [
            { id: 'si4', itemId: 'energy-drink-1', price: 75, currency: 'xenocoins', isAvailable: true },
            { id: 'si5', itemId: 'desert-crystal-1', price: 200, currency: 'xenocoins', isAvailable: true }
          ]
        }
      },
      { id: 'minigame1', name: 'Sand Racing', x: 75, y: 55, type: 'minigame', unlocked: true }
    ]
  },
  {
    id: 'mountains',
    name: 'Crystal Mountains',
    description: 'Towering peaks where warriors test their strength',
    image: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=600',
    unlocked: true,
    pois: [
      { id: 'battle1', name: 'Crystal Arena', x: 60, y: 50, type: 'battle', unlocked: true },
      { 
        id: 'shop3', 
        name: 'Mountain Armory', 
        x: 20, 
        y: 80, 
        type: 'shop', 
        unlocked: true,
        shop: {
          id: 'shop3',
          name: 'Mountain Armory',
          description: 'Premium equipment and weapons for serious trainers',
          npcName: 'Blacksmith Boris',
          npcDialogue: 'Welcome to my forge! These mountains provide the finest materials for crafting. Your pets deserve the best protection and weapons!',
          npcImage: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200',
          items: [
            { id: 'si6', itemId: 'iron-armor-1', price: 500, currency: 'xenocoins', isAvailable: true },
            { id: 'si7', itemId: 'crystal-sword-1', price: 1000, currency: 'xenocoins', isAvailable: true },
            { id: 'si8', itemId: 'premium-elixir-1', price: 5, currency: 'cash', isAvailable: true }
          ]
        }
      },
      { id: 'sage1', name: 'Wise Hermit', x: 80, y: 20, type: 'dialogue', unlocked: false }
    ]
  },
  {
    id: 'ocean',
    name: 'Endless Ocean',
    description: 'Mysterious waters with floating islands and sea creatures',
    image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=600',
    unlocked: false,
    pois: [
      { id: 'port1', name: 'Floating Trading Post', x: 40, y: 85, type: 'shop', unlocked: false },
      { id: 'lighthouse1', name: 'Beacon of Mysteries', x: 80, y: 20, type: 'quest', unlocked: false }
    ]
  },
  {
    id: 'sky',
    name: 'Floating Islands',
    description: 'Ethereal realm among the clouds with ancient magic',
    image: 'https://images.pexels.com/photos/1363876/pexels-photo-1363876.jpeg?auto=compress&cs=tinysrgb&w=600',
    unlocked: false,
    pois: [
      { id: 'temple1', name: 'Sky Temple', x: 50, y: 35, type: 'quest', unlocked: false },
      { id: 'market1', name: 'Cloud Bazaar', x: 30, y: 65, type: 'shop', unlocked: false }
    ]
  },
  {
    id: 'underworld',
    name: 'Shadow Realm',
    description: 'Dark depths where only the bravest dare to venture',
    image: 'https://images.pexels.com/photos/531321/pexels-photo-531321.jpeg?auto=compress&cs=tinysrgb&w=600',
    unlocked: false,
    pois: [
      { id: 'forge1', name: 'Infernal Forge', x: 55, y: 40, type: 'shop', unlocked: false },
      { id: 'dungeon1', name: 'Abyssal Dungeon', x: 25, y: 75, type: 'battle', unlocked: false }
    ]
  }
];

export const WorldScreen: React.FC = () => {
  const [currentContinent, setCurrentContinent] = useState(0);
  const [selectedPoi, setSelectedPoi] = useState<any>(null);
  const [showShop, setShowShop] = useState<Shop | null>(null);
  
  const { xenocoins, cash, updateCurrency, addToInventory, addNotification, getUniversalItem } = useGameStore();

  const continent = continents[currentContinent];

  const nextContinent = () => {
    setCurrentContinent((prev) => (prev + 1) % continents.length);
  };

  const prevContinent = () => {
    setCurrentContinent((prev) => (prev - 1 + continents.length) % continents.length);
  };

  const handlePoiClick = (poi: any) => {
    if (!poi.unlocked) {
      return;
    }
    
    if (poi.type === 'shop' && poi.shop) {
      setShowShop(poi.shop);
    } else {
      setSelectedPoi(poi);
    }
  };

  const handlePurchaseItem = (shopItem: ShopItem) => {
    const userCurrency = shopItem.currency === 'xenocoins' ? xenocoins : cash;
    
    if (userCurrency < shopItem.price) {
      addNotification({
        type: 'error',
        title: 'Insufficient Funds',
        message: `You need ${shopItem.price} ${shopItem.currency} to purchase this item.`
      });
      return;
    }

    // Get the universal item
    const universalItem = getUniversalItem(shopItem.itemId);
    if (!universalItem) {
      addNotification({
        type: 'error',
        title: 'Item Not Available',
        message: 'This item is no longer available in the system.'
      });
      return;
    }

    // Deduct currency
    updateCurrency(shopItem.currency, -shopItem.price);
    
    // Add universal item to inventory
    addToInventory(universalItem);
    
    addNotification({
      type: 'success',
      title: 'Purchase Successful!',
      message: `You bought ${universalItem.name} for ${shopItem.price} ${shopItem.currency}.`
    });
  };

  const getPoiIcon = (type: string) => {
    switch (type) {
      case 'shop': return '🏪';
      case 'hospital': return '🏥';
      case 'bank': return '🏦';
      case 'quest': return '❓';
      case 'battle': return '⚔️';
      case 'dialogue': return '💬';
      case 'minigame': return '🎮';
      default: return '📍';
    }
  };

  const getPoiColor = (type: string) => {
    switch (type) {
      case 'shop': return 'bg-green-500';
      case 'hospital': return 'bg-red-500';
      case 'bank': return 'bg-yellow-500';
      case 'quest': return 'bg-blue-500';
      case 'battle': return 'bg-purple-500';
      case 'dialogue': return 'bg-pink-500';
      case 'minigame': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

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

  return (
    <div className="max-w-md mx-auto">
      <motion.div 
        className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Continent Header */}
        <div className="relative p-6 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <motion.button
                onClick={prevContinent}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              
              <div className="text-center flex-1">
                <motion.h2 
                  className="text-2xl font-bold mb-1"
                  key={continent.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {continent.name}
                </motion.h2>
                <p className="text-sm opacity-90 mb-2">{continent.description}</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xs opacity-75">
                    {currentContinent + 1} of {continents.length}
                  </span>
                  {!continent.unlocked && (
                    <div className="flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span className="text-xs">Locked</span>
                    </div>
                  )}
                </div>
              </div>
              
              <motion.button
                onClick={nextContinent}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center space-x-2">
              {continents.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentContinent ? 'bg-white' : 'bg-white/40'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={continent.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className={`relative ${!continent.unlocked ? 'filter grayscale' : ''}`}>
                <img
                  src={continent.image}
                  alt={continent.name}
                  className="w-full h-64 object-cover"
                />
                
                {!continent.unlocked && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Lock className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-semibold">Continent Locked</p>
                      <p className="text-sm opacity-75">Complete previous areas to unlock</p>
                    </div>
                  </div>
                )}
                
                {/* Points of Interest */}
                {continent.unlocked && continent.pois.map((poi, index) => (
                  <motion.button
                    key={poi.id}
                    onClick={() => handlePoiClick(poi)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all ${
                      poi.unlocked 
                        ? `${getPoiColor(poi.type)} hover:scale-110 text-white` 
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                    style={{
                      left: `${poi.x}%`,
                      top: `${poi.y}%`
                    }}
                    whileHover={poi.unlocked ? { scale: 1.2, rotate: 5 } : {}}
                    whileTap={poi.unlocked ? { scale: 0.9 } : {}}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-lg">{getPoiIcon(poi.type)}</span>
                    {!poi.unlocked && (
                      <Lock className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 text-white rounded-full p-0.5" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* POI List */}
        <div className="p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Points of Interest
          </h3>
          <div className="space-y-3">
            {continent.pois.map((poi, index) => (
              <motion.button
                key={poi.id}
                onClick={() => handlePoiClick(poi)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all text-left ${
                  poi.unlocked 
                    ? 'bg-gray-50 hover:bg-gray-100 hover:shadow-md' 
                    : 'bg-gray-100 opacity-60 cursor-not-allowed'
                }`}
                disabled={!poi.unlocked}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={poi.unlocked ? { x: 4 } : {}}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  poi.unlocked ? getPoiColor(poi.type) : 'bg-gray-400'
                } text-white`}>
                  <span className="text-lg">{getPoiIcon(poi.type)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{poi.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{poi.type}</p>
                </div>
                {poi.unlocked ? (
                  <Star className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Unified Shop Interface */}
      <AnimatePresence>
        {showShop && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShop(null)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100">
                {/* Shop Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{showShop.name}</h3>
                      <p className="text-green-100 text-sm">{showShop.description}</p>
                    </div>
                    <motion.button
                      onClick={() => setShowShop(null)}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {/* NPC Section with Large Image */}
                  <motion.div
                    className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Large NPC Image */}
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                        <img
                          src={showShop.npcImage}
                          alt={showShop.npcName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* NPC Info and Dialogue */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <h4 className="font-bold text-blue-900">{showShop.npcName}</h4>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                          <p className="text-blue-800 text-sm italic leading-relaxed">
                            "{showShop.npcDialogue}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Shop Items */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Available Items</h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Coins className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium">{xenocoins.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{cash}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {showShop.items.map((shopItem, index) => {
                        const universalItem = getUniversalItem(shopItem.itemId);
                        
                        if (!universalItem) {
                          return (
                            <div key={shopItem.id} className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                              <p className="text-red-700 text-sm">Item not available in system</p>
                            </div>
                          );
                        }

                        return (
                          <motion.div
                            key={shopItem.id}
                            className={`border-2 rounded-2xl p-4 ${getRarityColor(universalItem.rarity)}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-start space-x-3 mb-3">
                              {/* Item Image */}
                              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
                                {universalItem.imageUrl ? (
                                  <img
                                    src={universalItem.imageUrl}
                                    alt={universalItem.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl">${getItemEmoji(universalItem)}</div>`;
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl">
                                    {getItemEmoji(universalItem)}
                                  </div>
                                )}
                              </div>
                              
                              {/* Item Info */}
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">{universalItem.name}</h5>
                                <p className="text-sm text-gray-600 mt-1">{universalItem.description}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">
                                    {universalItem.type}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">
                                    {universalItem.rarity}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Item Effects */}
                            {universalItem.effects && Object.keys(universalItem.effects).length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-medium text-gray-700 mb-1">Effects:</p>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(universalItem.effects).map(([effect, value]) => (
                                    <span key={effect} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                      +{value} {effect}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Purchase Section */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {shopItem.currency === 'xenocoins' ? (
                                  <Coins className="w-5 h-5 text-yellow-600" />
                                ) : (
                                  <DollarSign className="w-5 h-5 text-green-600" />
                                )}
                                <span className="font-bold text-lg">{shopItem.price}</span>
                                <span className="text-sm text-gray-600">{shopItem.currency}</span>
                              </div>
                              
                              <motion.button
                                onClick={() => handlePurchaseItem(shopItem)}
                                disabled={!shopItem.isAvailable || 
                                  (shopItem.currency === 'xenocoins' ? xenocoins < shopItem.price : cash < shopItem.price)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <ShoppingCart className="w-4 h-4" />
                                <span>Buy</span>
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Selected POI Modal */}
      <AnimatePresence>
        {selectedPoi && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPoi(null)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 ${getPoiColor(selectedPoi.type)} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <span className="text-3xl text-white">{getPoiIcon(selectedPoi.type)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedPoi.name}</h3>
                  <p className="text-gray-600 capitalize font-medium">{selectedPoi.type}</p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <p className="text-gray-700 text-center">
                    Welcome to {selectedPoi.name}! This location offers unique services and adventures. 
                    Full functionality will be available in the next development phase.
                  </p>
                </div>
                
                <motion.button
                  onClick={() => setSelectedPoi(null)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function to get item emoji fallback
const getItemEmoji = (item: Item) => {
  if (item.type === 'Equipment') return '🛡️';
  if (item.type === 'Weapon') return '⚔️';
  if (item.type === 'Food') return '🍎';
  if (item.type === 'Potion') return '🧪';
  if (item.type === 'Collectible') return '💎';
  if (item.type === 'Special') return '✨';
  if (item.type === 'Style') return '🎨';
  if (item.type === 'Theme') return '🎭';
  return '📦';
};
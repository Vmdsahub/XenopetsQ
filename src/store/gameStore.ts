import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, User, Pet, Item, Notification, Achievement, Collectible, Quest, RedeemCode } from '../types/game';
import { gameService } from '../services/gameService';

// Sistema Universal de Itens - Base de dados central com imagens
// IMPORTANT: The `id` field here MUST be the actual UUID from your `items` database table.
// The `slug` field is the human-readable identifier.
// The keys of this object (e.g., 'health-potion-1') are the slugs used for lookup.
const UNIVERSAL_ITEMS: Record<string, Item> = {
  'health-potion-1': {
    id: 'replace-with-uuid-for-health-potion-1', // ACTUAL UUID REQUIRED
    slug: 'health-potion-1',
    name: 'Health Potion',
    description: 'A magical elixir that restores 5 health points instantly',
    type: 'Potion',
    rarity: 'Common',
    price: 50,
    currency: 'xenocoins',
    effects: { health: 5 },
    quantity: 1,
    imageUrl: 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date()
  },
  'magic-apple-1': {
    id: 'replace-with-uuid-for-magic-apple-1', // ACTUAL UUID REQUIRED
    slug: 'magic-apple-1',
    name: 'Magic Apple',
    description: 'A mystical fruit that restores hunger and provides energy. Hunger decays over time, so feed your pet regularly!',
    type: 'Food',
    rarity: 'Uncommon',
    price: 25,
    currency: 'xenocoins',
    effects: { hunger: 3, happiness: 1 },
    quantity: 1,
    imageUrl: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date()
  },
  'happiness-toy-1': {
    id: 'replace-with-uuid-for-happiness-toy-1', // ACTUAL UUID REQUIRED
    slug: 'happiness-toy-1',
    name: 'Happiness Toy',
    description: 'A colorful toy that brings joy to pets',
    type: 'Special',
    rarity: 'Common',
    price: 30,
    currency: 'xenocoins',
    effects: { happiness: 2 },
    quantity: 1,
    imageUrl: 'https://images.pexels.com/photos/1619690/pexels-photo-1619690.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date()
  },
  'energy-drink-1': {
    id: 'replace-with-uuid-for-energy-drink-1', // ACTUAL UUID REQUIRED
    slug: 'energy-drink-1',
    name: 'Energy Drink',
    description: 'A refreshing beverage that boosts pet stats temporarily',
    type: 'Potion',
    rarity: 'Uncommon',
    price: 75,
    currency: 'xenocoins',
    effects: { speed: 2, dexterity: 1 },
    quantity: 1,
    imageUrl: 'https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date()
  },
  'desert-crystal-1': {
    id: 'replace-with-uuid-for-desert-crystal-1', // ACTUAL UUID REQUIRED
    slug: 'desert-crystal-1',
    name: 'Desert Crystal',
    description: 'A rare crystal that enhances pet intelligence permanently',
    type: 'Special',
    rarity: 'Rare',
    price: 200,
    currency: 'xenocoins',
    effects: { intelligence: 3 },
    quantity: 1,
    imageUrl: 'https://images.pexels.com/photos/1121123/pexels-photo-1121123.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date()
  },
  'iron-armor-1': {
    id: 'replace-with-uuid-for-iron-armor-1', // ACTUAL UUID REQUIRED
    slug: 'iron-armor-1',
    name: 'Iron Armor',
    description: 'Sturdy armor that provides excellent protection',
    type: 'Equipment',
    rarity: 'Rare',
    price: 500,
    currency: 'xenocoins',
    effects: { defense: 5, health: 2 },
    slot: 'torso',
    quantity: 1,
    imageUrl: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date()
  },
  'crystal-sword-1': {
    id: 'replace-with-uuid-for-crystal-sword-1', // ACTUAL UUID REQUIRED
    slug: 'crystal-sword-1',
    name: 'Crystal Sword',
    description: 'A powerful weapon forged from mountain crystals',
    type: 'Weapon',
    rarity: 'Epic',
    price: 1000,
    currency: 'xenocoins',
    effects: { attack: 8, strength: 3 },
    quantity: 1,
    imageUrl: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date()
  },
  'premium-elixir-1': {
    id: 'replace-with-uuid-for-premium-elixir-1', // ACTUAL UUID REQUIRED
    slug: 'premium-elixir-1',
    name: 'Premium Elixir',
    description: 'An expensive but powerful healing potion that fully restores health and happiness',
    type: 'Potion',
    rarity: 'Epic',
    price: 5,
    currency: 'cash',
    effects: { health: 10, happiness: 3 },
    quantity: 1,
    imageUrl: 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date()
  },
  'super-food-1': {
    id: 'replace-with-uuid-for-super-food-1', // ACTUAL UUID REQUIRED
    slug: 'super-food-1',
    name: 'Super Food',
    description: 'Premium pet food that completely satisfies hunger and boosts happiness',
    type: 'Food',
    rarity: 'Rare',
    price: 100,
    currency: 'xenocoins',
    effects: { hunger: 5, happiness: 2, health: 1 },
    quantity: 1,
    imageUrl: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date()
  },
  'strength-potion-1': {
    id: 'replace-with-uuid-for-strength-potion-1', // ACTUAL UUID REQUIRED
    slug: 'strength-potion-1',
    name: 'Strength Potion',
    description: 'A powerful brew that permanently increases your pet\'s strength',
    type: 'Potion',
    rarity: 'Rare',
    price: 150,
    currency: 'xenocoins',
    effects: { strength: 2, attack: 1 },
    quantity: 1,
    imageUrl: 'https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg?auto=compress&cs=tinysrgb&w=200',
    createdAt: new Date()
  }
};

// Sistema de Colecionáveis - Base de dados central
const COLLECTIBLES_DATABASE: Collectible[] = [
  // Ovos
  {
    id: 'alpha-egg',
    name: 'Ovo Alpha',
    type: 'egg',
    rarity: 'Unique',
    description: 'Distribuído através de código para jogadores do alpha, parece ser feito de um material que não existe no plano real, que irônico...',
    isCollected: false,
    accountPoints: 1,
    obtainMethod: 'Disponível em loja especial no continente das Ilhas Flutuantes'
  },
  {
    id: 'dragon-egg',
    name: 'Ovo de Dragão',
    type: 'egg',
    rarity: 'Legendary',
    description: 'Um ovo lendário que brilha com fogo interno',
    isCollected: false,
    accountPoints: 5,
    obtainMethod: 'Encontrado nas Montanhas de Cristal'
  },
  {
    id: 'phoenix-egg',
    name: 'Ovo de Fênix',
    type: 'egg',
    rarity: 'Epic',
    description: 'Um ovo que irradia calor e luz dourada',
    isCollected: false,
    accountPoints: 3,
    obtainMethod: 'Recompensa de quest especial'
  },
  {
    id: 'griffin-egg',
    name: 'Ovo de Grifo',
    type: 'egg',
    rarity: 'Rare',
    description: 'Um ovo com padrões de penas e escamas',
    isCollected: false,
    accountPoints: 2,
    obtainMethod: 'Encontrado explorando o mundo'
  },
  
  // Peixes
  {
    id: 'golden-fish',
    name: 'Peixe Dourado',
    type: 'fish',
    rarity: 'Epic',
    description: 'Um peixe lendário dos oceanos profundos que brilha como ouro',
    isCollected: false,
    accountPoints: 4,
    obtainMethod: 'Pescado no Oceano Infinito'
  },
  {
    id: 'crystal-fish',
    name: 'Peixe de Cristal',
    type: 'fish',
    rarity: 'Rare',
    description: 'Um peixe transparente como cristal',
    isCollected: false,
    accountPoints: 2,
    obtainMethod: 'Pescado em lagos de montanha'
  },
  {
    id: 'rainbow-fish',
    name: 'Peixe Arco-íris',
    type: 'fish',
    rarity: 'Uncommon',
    description: 'Um peixe com escamas que refletem todas as cores',
    isCollected: false,
    accountPoints: 1,
    obtainMethod: 'Pescado em rios da floresta'
  },
  
  // Gemas
  {
    id: 'time-gem',
    name: 'Gema do Tempo',
    type: 'gem',
    rarity: 'Legendary',
    description: 'Uma gema que parece conter o próprio tempo em seu interior',
    isCollected: false,
    accountPoints: 6,
    obtainMethod: 'Recompensa de saga épica'
  },
  {
    id: 'fire-ruby',
    name: 'Rubi de Fogo',
    type: 'gem',
    rarity: 'Epic',
    description: 'Um rubi que arde com chamas eternas',
    isCollected: false,
    accountPoints: 3,
    obtainMethod: 'Minerado no Deserto Dourado'
  },
  {
    id: 'ice-sapphire',
    name: 'Safira de Gelo',
    type: 'gem',
    rarity: 'Rare',
    description: 'Uma safira que emana frio glacial',
    isCollected: false,
    accountPoints: 2,
    obtainMethod: 'Encontrada em cavernas geladas'
  },
  {
    id: 'moon-stone',
    name: 'Pedra Lunar',
    type: 'gem',
    rarity: 'Uncommon',
    description: 'Uma pedra que brilha com luz lunar suave',
    isCollected: false,
    accountPoints: 1,
    obtainMethod: 'Coletada durante a lua cheia'
  },
  
  // Selos
  {
    id: 'ancient-seal',
    name: 'Selo Antigo',
    type: 'stamp',
    rarity: 'Legendary',
    description: 'Um selo de uma civilização perdida há milênios',
    isCollected: false,
    accountPoints: 5,
    obtainMethod: 'Descoberto em ruínas antigas'
  },
  {
    id: 'royal-seal',
    name: 'Selo Real',
    type: 'stamp',
    rarity: 'Epic',
    description: 'O selo oficial de um reino esquecido',
    isCollected: false,
    accountPoints: 3,
    obtainMethod: 'Recompensa de quest real'
  },
  {
    id: 'merchant-seal',
    name: 'Selo Mercante',
    type: 'stamp',
    rarity: 'Rare',
    description: 'Selo usado por comerciantes de terras distantes',
    isCollected: false,
    accountPoints: 2,
    obtainMethod: 'Obtido através de comércio'
  },
  {
    id: 'explorer-seal',
    name: 'Selo do Explorador',
    type: 'stamp',
    rarity: 'Common',
    description: 'Selo dado aos primeiros exploradores',
    isCollected: false,
    accountPoints: 1,
    obtainMethod: 'Recompensa por exploração'
  }
];

// Sistema de Códigos de Resgate - Base de dados central
const REDEEM_CODES_DATABASE: RedeemCode[] = [
  {
    id: 'alpha-welcome',
    code: 'ALPHA2025',
    name: 'Pacote de Boas-vindas Alpha',
    description: 'Recompensas especiais para jogadores do alpha test',
    rewards: {
      xenocoins: 5000,
      cash: 50,
      collectibles: ['alpha-egg'],
      accountPoints: 10
    },
    maxUses: 1000,
    currentUses: 0,
    isActive: true,
    createdBy: 'system',
    createdAt: new Date(),
    usedBy: []
  },
  {
    id: 'starter-pack',
    code: 'WELCOME100',
    name: 'Pacote Iniciante',
    description: 'Itens básicos para começar sua jornada',
    rewards: {
      xenocoins: 1000,
      items: ['health-potion-1', 'magic-apple-1', 'happiness-toy-1'],
      accountPoints: 5
    },
    maxUses: -1, // Unlimited uses
    currentUses: 0,
    isActive: true,
    createdBy: 'system',
    createdAt: new Date(),
    usedBy: []
  },
  {
    id: 'weekend-bonus',
    code: 'WEEKEND50',
    name: 'Bônus de Fim de Semana',
    description: 'Recompensas especiais de fim de semana',
    rewards: {
      xenocoins: 2500,
      cash: 25
    },
    maxUses: 500,
    currentUses: 0,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    isActive: true,
    createdBy: 'system',
    createdAt: new Date(),
    usedBy: []
  }
];

interface GameStore extends GameState {
  // Actions
  setUser: (user: User | null) => void;
  setActivePet: (pet: Pet | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  updateCurrency: (type: 'xenocoins' | 'cash', amount: number) => void;
  setCurrentScreen: (screen: string) => void;
  setLanguage: (language: string) => void;
  addToInventory: (item: Item) => void;
  removeFromInventory: (itemId: string, quantity?: number) => void;
  useItem: (itemId: string, petId: string) => void;
  equipItem: (itemId: string, petId: string) => void;
  unequipItem: (slot: string, petId: string) => void;
  updatePetStats: (petId: string, stats: Partial<Pet>) => void;
  addAchievement: (achievement: Achievement) => void;
  updateQuestProgress: (questId: string, progress: Record<string, number>) => void;
  completeQuest: (questId: string) => void;
  resetProgress: () => void;
  initializeNewUser: (user: User) => void;
  loadUserData: (userId: string) => Promise<void>;
  syncWithDatabase: () => Promise<void>;
  searchPlayers: (query: string) => Promise<User[]>;
  getPlayerProfile: (userId: string) => Promise<User | null>;
  createPet: (petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Pet | null>;
  
  // Universal Item System
  getUniversalItem: (itemId: string) => Item | null;
  getAllUniversalItems: () => Item[];
  addUniversalItem: (item: Item) => void;
  updateUniversalItem: (itemId: string, updates: Partial<Item>) => void;
  deleteUniversalItem: (itemId: string) => void;
  
  // Collectibles System
  getAllCollectibles: () => Collectible[];
  getCollectiblesByType: (type: 'egg' | 'fish' | 'gem' | 'stamp') => Collectible[];
  getCollectedCollectibles: () => Collectible[];
  collectItem: (collectibleId: string) => void;
  getTotalCollectiblePoints: () => number;
  
  // Redeem Codes System
  getAllRedeemCodes: () => RedeemCode[];
  getActiveRedeemCodes: () => RedeemCode[];
  createRedeemCode: (codeData: Omit<RedeemCode, 'id' | 'createdAt' | 'currentUses' | 'usedBy'>) => void;
  updateRedeemCode: (codeId: string, updates: Partial<RedeemCode>) => void;
  deleteRedeemCode: (codeId: string) => void;
  redeemCode: (code: string) => Promise<{ success: boolean; message: string; rewards?: any }>;
  hasUserUsedCode: (codeId: string, userId: string) => boolean;
}

// Helper function to convert date strings back to Date objects
const rehydrateDates = (obj: any): any => {
  if (!obj) return obj;
  
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
    return new Date(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(rehydrateDates);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'createdAt' || key === 'updatedAt' || key === 'lastInteraction' || 
          key === 'hatchTime' || key === 'deathDate' || key === 'lastLogin' ||
          key === 'completedAt' || key === 'startedAt' || key === 'unlockedAt' ||
          key === 'collectedAt' || key === 'acquiredAt' || key === 'lastUsed' ||
          key === 'expiresAt') {
        result[key] = typeof value === 'string' ? new Date(value) : value;
      } else {
        result[key] = rehydrateDates(value);
      }
    }
    return result;
  }
  
  return obj;
};

const createInitialGameState = (): Omit<GameState, 'user'> => ({
  activePet: null,
  pets: [],
  inventory: [],
  xenocoins: 1000,
  cash: 10,
  notifications: [],
  language: 'pt-BR',
  currentScreen: 'pet',
  achievements: [],
  collectibles: [...COLLECTIBLES_DATABASE], // Initialize with all collectibles
  quests: [],
  redeemCodes: [...REDEEM_CODES_DATABASE] // Initialize with default codes
});

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createInitialGameState(),
      user: null,

      setUser: (user) => set({ user }),
      setActivePet: (activePet) => set({ activePet }),
      
      addNotification: async (notification) => {
        const state = get();
        if (state.user) {
          // Add to database
          await gameService.addNotification(state.user.id, notification);
          
          // Add to local state
          set((state) => ({
            notifications: [{
              ...notification,
              id: Date.now().toString(),
              createdAt: new Date()
            }, ...state.notifications.slice(0, 49)]
          }));
        }
      },
      
      markNotificationAsRead: async (id) => {
        await gameService.markNotificationAsRead(id);
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, isRead: true } : n
          )
        }));
      },

      clearNotifications: () => set((state) => ({
        notifications: state.notifications.filter(n => !n.isRead)
      })),
      
      updateCurrency: async (type, amount) => {
        const state = get();
        if (!state.user) return;

        // Update in database
        const success = await gameService.updateUserCurrency(state.user.id, type, amount);
        
        if (success) {
          set((state) => {
            const newAmount = Math.max(0, state[type] + amount);
            
            // Add notification for significant currency changes
            if (Math.abs(amount) >= 100) {
              const notification = {
                type: amount > 0 ? 'success' : 'warning' as const,
                title: amount > 0 ? 'Moedas Ganhas' : 'Moedas Gastas',
                message: `${amount > 0 ? '+' : ''}${amount} ${type === 'xenocoins' ? 'Xenocoins' : 'Cash'}`,
                isRead: false
              };
              
              return {
                [type]: newAmount,
                notifications: [{
                  ...notification,
                  id: Date.now().toString(),
                  createdAt: new Date()
                }, ...state.notifications]
              };
            }
            
            return { [type]: newAmount };
          });
        }
      },
      
      setCurrentScreen: (currentScreen) => set({ currentScreen }),
      setLanguage: (language) => set({ language }),
      
      addToInventory: async (item) => {
        const state = get();
        if (!state.user) return;

        // The `item` parameter already IS the universal item details, fetched by slug,
        // and its `item.id` field now holds the UUID. `item.slug` holds the slug.
        if (!item || !item.id || !item.slug) { // item.id is UUID, item.slug is the string slug
          console.error(`Invalid item data passed to addToInventory:`, item);
          get().addNotification({ type: 'error', title: 'Erro Interno', message: `Dados do item inválidos.`});
          return;
        }

        // The quantity to add is from the passed `item.quantity` (which is usually 1 from UNIVERSAL_ITEMS for a single purchase)
        // or defaults to 1 if not specified on the passed item.
        const quantityToAdd = item.quantity || 1;

        // Call the service to add/update the item in the database
        // Pass item.id (which is the UUID) to the service.
        const dbUpdateResult = await gameService.addItemToInventory(state.user.id, item.id, quantityToAdd);
        
        if (dbUpdateResult) {
          // Database update was successful, now update local state
          // dbUpdateResult = { id: inventory_UUID, itemId: item_UUID, quantity: new_total_quantity }
          set((currentState) => {
            const newInventory = [...currentState.inventory];
            const existingItemIndex = newInventory.findIndex(invItem => invItem.inventoryId === dbUpdateResult.id);

            // `item` here is the full universal item object passed to addToInventory, containing all static details.
            // `dbUpdateResult.itemId` is the item's UUID, which should match `item.id`.
            // `dbUpdateResult.id` is the inventory row's UUID.
            // `dbUpdateResult.quantity` is the new total quantity for this inventory row.

            if (existingItemIndex > -1) {
              // Item stack already exists locally by inventoryId (inventory row UUID), update its quantity
              newInventory[existingItemIndex] = {
                ...newInventory[existingItemIndex], // Preserve existing dynamic properties like isEquipped
                ...item, // Apply all static properties from the universal item definition
                id: dbUpdateResult.itemId, // Item's UUID (same as item.id)
                inventoryId: dbUpdateResult.id, // Inventory row's UUID
                quantity: dbUpdateResult.quantity, // New total quantity
              };
            } else {
              // New item stack or item that didn't have inventoryId locally yet.
              // We should remove any old local-only representation if its item UUID matches,
              // and then add/update using the definitive data from the DB.
              const filteredInventory = newInventory.filter(invItem => {
                // Keep if it's not the item we're adding (match by item UUID) OR if it is, but it already has an inventoryId (it's a different stack/entry)
                // This logic might need refinement if we are sure there's only one unequipped stack per item UUID.
                // For now, this ensures we don't have a local-only version AND a DB version.
                return invItem.id !== dbUpdateResult.itemId || invItem.inventoryId;
              });

              // Add the new item with all details from the input `item` (which is a universal item)
              // and the specific inventory details from `dbUpdateResult`.
              filteredInventory.push({
                ...item, // Base properties from universal definition (name, description, effects, slug, etc.)
                id: dbUpdateResult.itemId, // Item's UUID (same as item.id)
                inventoryId: dbUpdateResult.id, // Inventory entry UUID from DB
                quantity: dbUpdateResult.quantity, // Quantity from DB
                isEquipped: false, // New items are not equipped
                // createdAt might be set by universal_items, or we might want a specific acquisition date.
                // For now, rely on universalItemDetails.createdAt or new Date()
                createdAt: universalItemDetails.createdAt || new Date()
              });
              return { inventory: filteredInventory };
            }
            return { inventory: newInventory };
          });
        } else {
          // Database update failed
          get().addNotification({ type: 'error', title: 'Erro ao Adicionar Item', message: `Não foi possível adicionar ${universalItemDetails.name} ao inventário.`});
          // Optionally, trigger a sync or handle error more gracefully
          await get().syncWithDatabase();
        }
      },
      
      removeFromInventory: async (itemId, quantityToRemove = 1) => {
        const state = get();
        if (!state.user) return;

        try {
          // Primeiro, atualize o estado local para feedback imediato ao usuário
          set((currentState) => ({
            inventory: currentState.inventory.reduce((acc, item) => {
              if (item.id === itemId) {
                const newQuantity = item.quantity - quantityToRemove;
                if (newQuantity > 0) {
                  acc.push({ ...item, quantity: newQuantity });
                }
              } else {
                acc.push(item);
              }
              return acc;
            }, [] as Item[])
          }));

          // Depois, atualize no banco de dados
          const success = await gameService.removeItemFromInventory(state.user.id, itemId, quantityToRemove);
          
          if (!success) {
            // Se falhar no banco de dados, restaure o estado anterior
            console.warn(`Failed to remove item ${itemId} from database. Reverting local state.`);
            await get().syncWithDatabase(); // Sincronize com o banco de dados para garantir consistência
          }
        } catch (error) {
          console.error('Error removing item from inventory store:', error);
          // Em caso de erro, sincronize com o banco de dados para garantir consistência
          await get().syncWithDatabase();
        }
      },
      
      useItem: async (itemId, petId) => { // Made async to align with potential async operations
        const state = get();
        const inventoryItem = state.inventory.find(i => i.id === itemId);
        
        if (!inventoryItem) {
          console.error(`Item ${itemId} not found in inventory`);
          return;
        }
        
        const pet = state.pets.find(p => p.id === petId);
        
        if (!pet) {
          console.error(`Pet ${petId} not found`);
          return;
        }
        
        // Apply item effects to pet
        if (inventoryItem.effects) {
          const updatedStats: Partial<Pet> = {};
          Object.entries(inventoryItem.effects).forEach(([stat, value]) => {
            if (stat in pet) {
              const currentValue = pet[stat as keyof Pet] as number;
              const maxValue = ['health', 'happiness', 'hunger'].includes(stat) ? 10 : currentValue + value;
              updatedStats[stat as keyof Pet] = Math.min(maxValue, Math.max(0, currentValue + value));
            }
          });
          
          get().updatePetStats(petId, updatedStats);
        }
        
        // Remove item from inventory using the inventory item's ID
        if (inventoryItem.inventoryId) {
          get().removeFromInventory(inventoryItem.inventoryId, 1);
        } else {
          console.error('Item does not have inventoryId, falling back to item.id');
          get().removeFromInventory(itemId, 1);
        }
        
        // Add notification with item effects
        const effectsText = inventoryItem.effects ? 
          Object.entries(inventoryItem.effects).map(([stat, value]) => `+${value} ${stat}`).join(', ') : 
          'efeitos aplicados';
        
        get().addNotification({
          type: 'success',
          title: 'Item Usado',
          message: `${inventoryItem.name} foi usado em ${pet.name}! ${effectsText}`,
          isRead: false
        });
      },
      
      equipItem: async (inventoryItemId, petId) => {
        const state = get();
        if (!state.user || !state.activePet || state.activePet.id !== petId) {
          console.error("User or active pet not available for equipping.");
          return;
        }

        const itemToEquip = state.inventory.find(invItem => invItem.id === inventoryItemId);
        if (!itemToEquip || !itemToEquip.slot) {
          console.error("Item not found in inventory or item has no slot.");
          get().addNotification({ type: 'error', title: 'Erro ao Equipar', message: 'Item inválido ou não pode ser equipado.' });
          return;
        }

        try {
          const success = await gameService.equipItem(state.user.id, petId, inventoryItemId, itemToEquip.slot);
          if (success) {
            // Reload all user data to ensure consistency as equipment can affect many things
            // and RPC function handles complex state changes.
            await get().loadUserData(state.user.id);
            get().addNotification({
              type: 'success',
              title: 'Item Equipado',
              message: `${itemToEquip.name} equipado em ${state.activePet.name}!`
            });
          } else {
            get().addNotification({ type: 'error', title: 'Falha ao Equipar', message: 'Não foi possível equipar o item.' });
          }
        } catch (error: any) {
          console.error('Error equipping item in store:', error);
          get().addNotification({ type: 'error', title: 'Erro ao Equipar', message: error.message || 'Ocorreu um erro inesperado.' });
        }
      },
      
      unequipItem: async (inventoryItemId, petId) => { // Changed signature to use inventoryItemId
        const state = get();
        if (!state.user || !state.activePet || state.activePet.id !== petId) {
          console.error("User or active pet not available for unequipping.");
          return;
        }

        const itemToUnequip = state.inventory.find(invItem => invItem.id === inventoryItemId && invItem.isEquipped && invItem.equippedPetId === petId);
        if (!itemToUnequip || !itemToUnequip.slot) {
          console.error("Item not found in pet's equipment or item has no slot.");
          get().addNotification({ type: 'error', title: 'Erro ao Desequipar', message: 'Item inválido ou não está equipado.' });
          return;
        }

        try {
          const success = await gameService.unequipItem(state.user.id, petId, inventoryItemId, itemToUnequip.slot);
          if (success) {
            // Reload all user data for consistency
            await get().loadUserData(state.user.id);
            get().addNotification({
              type: 'success',
              title: 'Item Desequipado',
              message: `${itemToUnequip.name} desequipado de ${state.activePet.name}.`
            });
          } else {
            get().addNotification({ type: 'error', title: 'Falha ao Desequipar', message: 'Não foi possível desequipar o item.' });
          }
        } catch (error: any) {
          console.error('Error unequipping item in store:', error);
          get().addNotification({ type: 'error', title: 'Erro ao Desequipar', message: error.message || 'Ocorreu um erro inesperado.' });
        }
      },
      
      updatePetStats: async (petId, stats) => {
        const state = get();
        if (!state.user) return;

        // Update in database
        await gameService.updatePetStats(petId, stats);
        
        // Update local state
        set((state) => ({
          pets: state.pets.map(pet => 
            pet.id === petId ? { ...pet, ...stats, updatedAt: new Date() } : pet
          ),
          activePet: state.activePet?.id === petId ? { ...state.activePet, ...stats, updatedAt: new Date() } : state.activePet
        }));
      },
      
      addAchievement: (achievement) => set((state) => ({
        achievements: [...state.achievements, achievement]
      })),
      
      updateQuestProgress: (questId, progress) => set((state) => ({
        quests: state.quests.map(quest => 
          quest.id === questId ? { ...quest, progress: { ...quest.progress, ...progress } } : quest
        )
      })),
      
      completeQuest: (questId) => set((state) => ({
        quests: state.quests.map(quest => 
          quest.id === questId ? { ...quest, isCompleted: true, completedAt: new Date() } : quest
        )
      })),

      resetProgress: () => {
        const initialState = createInitialGameState();
        set({
          ...initialState,
          user: get().user
        });
      },

      initializeNewUser: (user) => {
        const initialState = createInitialGameState();
        set({
          ...initialState,
          user,
          language: user.language
        });
      },

      loadUserData: async (userId: string) => {
        try {
          // Load user pets
          const pets = await gameService.getUserPets(userId);
          
          // Load user inventory
          const inventory = await gameService.getUserInventory(userId);
          
          // Load user notifications
          const notifications = await gameService.getUserNotifications(userId);
          
          // Load user currency
          const currency = await gameService.getUserCurrency(userId);
          
          set({
            pets,
            inventory,
            notifications,
            xenocoins: currency?.xenocoins || 1000,
            cash: currency?.cash || 10,
            activePet: pets.length > 0 ? pets[0] : null
          });
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      },

      syncWithDatabase: async () => {
        const state = get();
        if (state.user) {
          await get().loadUserData(state.user.id);
        }
      },

      searchPlayers: async (query: string) => {
        try {
          return await gameService.searchPlayers(query);
        } catch (error) {
          console.error('Error searching players:', error);
          return [];
        }
      },

      getPlayerProfile: async (userId: string) => {
        try {
          return await gameService.getPlayerProfile(userId);
        } catch (error) {
          console.error('Error fetching player profile:', error);
          return null;
        }
      },

      createPet: async (petData) => {
        const state = get();
        if (!state.user) return null;

        try {
          const newPet = await gameService.createPet({
            ...petData,
            ownerId: state.user.id
          });

          if (newPet) {
            set((state) => ({
              pets: [...state.pets, newPet],
              activePet: state.pets.length === 0 ? newPet : state.activePet
            }));
          }

          return newPet;
        } catch (error) {
          console.error('Error creating pet:', error);
          return null;
        }
      },

      // Universal Item System Methods
      getUniversalItem: (itemId: string) => {
        return UNIVERSAL_ITEMS[itemId] || null;
      },

      getAllUniversalItems: () => {
        return Object.values(UNIVERSAL_ITEMS);
      },

      addUniversalItem: (item: Item) => {
        UNIVERSAL_ITEMS[item.id] = { ...item };
        
        // Add notification for admin
        get().addNotification({
          type: 'success',
          title: 'Item Universal Criado',
          message: `${item.name} foi adicionado ao sistema universal de itens!`
        });
      },

      updateUniversalItem: (itemId: string, updates: Partial<Item>) => {
        if (UNIVERSAL_ITEMS[itemId]) {
          UNIVERSAL_ITEMS[itemId] = { ...UNIVERSAL_ITEMS[itemId], ...updates };
          
          // Update all instances in inventories
          set((state) => ({
            inventory: state.inventory.map(item => 
              item.id === itemId ? { ...item, ...updates } : item
            )
          }));
          
          get().addNotification({
            type: 'info',
            title: 'Item Universal Atualizado',
            message: `${UNIVERSAL_ITEMS[itemId].name} foi atualizado no sistema!`
          });
        }
      },

      deleteUniversalItem: (itemId: string) => {
        if (UNIVERSAL_ITEMS[itemId]) {
          const itemName = UNIVERSAL_ITEMS[itemId].name;
          delete UNIVERSAL_ITEMS[itemId];
          
          // Remove from all inventories
          set((state) => ({
            inventory: state.inventory.filter(item => item.id !== itemId)
          }));
          
          get().addNotification({
            type: 'warning',
            title: 'Item Universal Removido',
            message: `${itemName} foi removido do sistema e de todos os inventários!`
          });
        }
      },

      // Collectibles System Methods
      getAllCollectibles: () => {
        return get().collectibles;
      },

      getCollectiblesByType: (type: 'egg' | 'fish' | 'gem' | 'stamp') => {
        return get().collectibles.filter(c => c.type === type);
      },

      getCollectedCollectibles: () => {
        return get().collectibles.filter(c => c.isCollected);
      },

      collectItem: (collectibleId: string) => {
        const state = get();
        
        set((state) => {
          const updatedCollectibles = state.collectibles.map(collectible => {
            if (collectible.id === collectibleId && !collectible.isCollected) {
              // Award account points to user
              if (state.user) {
                // Update user account score
                const updatedUser = {
                  ...state.user,
                  accountScore: state.user.accountScore + collectible.accountPoints
                };
                
                // Add notification
                get().addNotification({
                  type: 'success',
                  title: 'Colecionável Obtido!',
                  message: `${collectible.name} coletado! +${collectible.accountPoints} pontos de conta`
                });
                
                return {
                  ...state,
                  user: updatedUser,
                  collectibles: state.collectibles.map(c => 
                    c.id === collectibleId ? { ...c, isCollected: true, collectedAt: new Date() } : c
                  )
                };
              }
              
              return { ...collectible, isCollected: true, collectedAt: new Date() };
            }
            return collectible;
          });
          
          return { collectibles: updatedCollectibles };
        });
      },

      getTotalCollectiblePoints: () => {
        return get().collectibles
          .filter(c => c.isCollected)
          .reduce((total, c) => total + c.accountPoints, 0);
      },

      // Redeem Codes System Methods
      getAllRedeemCodes: () => {
        return get().redeemCodes;
      },

      getActiveRedeemCodes: () => {
        const now = new Date();
        return get().redeemCodes.filter(code => 
          code.isActive && 
          (!code.expiresAt || code.expiresAt > now) &&
          (code.maxUses === -1 || code.currentUses < code.maxUses)
        );
      },

      createRedeemCode: (codeData) => {
        const state = get();
        if (!state.user?.isAdmin) {
          get().addNotification({
            type: 'error',
            title: 'Acesso Negado',
            message: 'Apenas administradores podem criar códigos de resgate.'
          });
          return;
        }

        const newCode: RedeemCode = {
          ...codeData,
          id: crypto.randomUUID(),
          currentUses: 0,
          usedBy: [],
          createdAt: new Date()
        };

        set((state) => ({
          redeemCodes: [...state.redeemCodes, newCode]
        }));

        get().addNotification({
          type: 'success',
          title: 'Código Criado',
          message: `Código "${newCode.code}" criado com sucesso!`
        });
      },

      updateRedeemCode: (codeId, updates) => {
        const state = get();
        if (!state.user?.isAdmin) {
          get().addNotification({
            type: 'error',
            title: 'Acesso Negado',
            message: 'Apenas administradores podem editar códigos de resgate.'
          });
          return;
        }

        set((state) => ({
          redeemCodes: state.redeemCodes.map(code =>
            code.id === codeId ? { ...code, ...updates } : code
          )
        }));

        get().addNotification({
          type: 'info',
          title: 'Código Atualizado',
          message: 'Código de resgate atualizado com sucesso!'
        });
      },

      deleteRedeemCode: (codeId) => {
        const state = get();
        if (!state.user?.isAdmin) {
          get().addNotification({
            type: 'error',
            title: 'Acesso Negado',
            message: 'Apenas administradores podem deletar códigos de resgate.'
          });
          return;
        }

        const codeToDelete = state.redeemCodes.find(c => c.id === codeId);
        
        set((state) => ({
          redeemCodes: state.redeemCodes.filter(code => code.id !== codeId)
        }));

        get().addNotification({
          type: 'warning',
          title: 'Código Deletado',
          message: `Código "${codeToDelete?.code}" foi removido do sistema.`
        });
      },

      hasUserUsedCode: (codeId, userId) => {
        const code = get().redeemCodes.find(c => c.id === codeId);
        return code ? code.usedBy.includes(userId) : false;
      },

      redeemCode: async (codeInput: string) => {
        const state = get();
        if (!state.user) {
          return { success: false, message: 'Você deve estar logado para resgatar códigos.' };
        }

        const code = state.redeemCodes.find(c => 
          c.code.toLowerCase() === codeInput.toLowerCase() && c.isActive
        );

        if (!code) {
          return { success: false, message: 'Código inválido ou expirado.' };
        }

        // Check if code is expired
        if (code.expiresAt && code.expiresAt < new Date()) {
          return { success: false, message: 'Este código expirou.' };
        }

        // Check if user already used this code
        if (code.usedBy.includes(state.user.id)) {
          return { success: false, message: 'Você já resgatou este código.' };
        }

        // Check if code has reached max uses
        if (code.maxUses !== -1 && code.currentUses >= code.maxUses) {
          return { success: false, message: 'Este código atingiu o limite máximo de usos.' };
        }

        // Apply rewards
        const rewards = code.rewards;
        let rewardText = '';

        // Currency rewards
        if (rewards.xenocoins) {
          get().updateCurrency('xenocoins', rewards.xenocoins);
          rewardText += `+${rewards.xenocoins} Xenocoins `;
        }

        if (rewards.cash) {
          get().updateCurrency('cash', rewards.cash);
          rewardText += `+${rewards.cash} Cash `;
        }

        // Item rewards
        if (rewards.items) {
          for (const itemId of rewards.items) {
            const item = get().getUniversalItem(itemId);
            if (item) {
              get().addToInventory({ ...item, quantity: 1 });
              rewardText += `${item.name} `;
            }
          }
        }

        // Collectible rewards
        if (rewards.collectibles) {
          for (const collectibleId of rewards.collectibles) {
            get().collectItem(collectibleId);
          }
        }

        // Account points
        if (rewards.accountPoints && state.user) {
          const updatedUser = {
            ...state.user,
            accountScore: state.user.accountScore + rewards.accountPoints
          };
          set({ user: updatedUser });
          rewardText += `+${rewards.accountPoints} pontos de conta `;
        }

        // Update code usage
        set((state) => ({
          redeemCodes: state.redeemCodes.map(c =>
            c.id === code.id
              ? {
                  ...c,
                  currentUses: c.currentUses + 1,
                  usedBy: [...c.usedBy, state.user!.id]
                }
              : c
          )
        }));

        get().addNotification({
          type: 'success',
          title: 'Código Resgatado!',
          message: `${code.name} - Recompensas: ${rewardText.trim()}`
        });

        return { 
          success: true, 
          message: `Código resgatado com sucesso! Recompensas: ${rewardText.trim()}`,
          rewards: code.rewards
        };
      }
    }),
    {
      name: 'xenopets-game-state',
      partialize: (state) => ({
        user: state.user,
        language: state.language,
        currentScreen: state.currentScreen,
        // Persist core game data
        pets: state.pets,
        activePet: state.activePet,
        inventory: state.inventory,
        xenocoins: state.xenocoins,
        cash: state.cash,
        notifications: state.notifications.slice(0, 20), // Limit notifications to avoid large storage
        achievements: state.achievements,
        collectibles: state.collectibles,
        quests: state.quests,
        redeemCodes: state.redeemCodes
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Rehydrate all date fields in the entire persisted state
          // The rehydrateDates function is recursive and handles nested objects/arrays
          Object.keys(state).forEach(key => {
            (state as any)[key] = rehydrateDates((state as any)[key]);
          });
        }
      }
    }
  )
);
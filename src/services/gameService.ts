import { supabase, handleSupabaseError, validateGameAction } from '../lib/supabase';
import { Pet, Item, Notification, User } from '../types/game';

export class GameService {
  private static instance: GameService;
  
  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  // Pet operations
  async getUserPets(userId: string): Promise<Pet[]> {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this.mapDatabasePetToPet);
    } catch (error) {
      console.error('Error fetching pets:', error);
      return [];
    }
  }

  async removeItemFromInventory(userId: string, itemId: string, quantityToRemove = 1): Promise<boolean> {
    try {
      await validateGameAction('item_remove', { quantity: quantityToRemove });

      // Find the unequipped item stack in the inventory
      // Primeiro tenta encontrar pelo ID do registro (inventoryId)
      const { data: existingItem, error: fetchError } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('id', itemId)
        .is('equipped_pet_id', null)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: 'single' row not found
        console.error('Error fetching item from inventory:', fetchError);
        throw fetchError;
      }

      if (!existingItem) {
        console.warn(`Inventory entry ${itemId} not found in user ${userId}'s unequipped inventory to remove.`);
        return false; // Or throw an error, depending on desired behavior
      }

      const newQuantity = existingItem.quantity - quantityToRemove;

      if (newQuantity > 0) {
        // Update quantity
        const { error: updateError } = await supabase
          .from('inventory')
          .update({ quantity: newQuantity, last_used: new Date().toISOString() })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Remove item entry
        const { error: deleteError } = await supabase
          .from('inventory')
          .delete()
          .eq('id', existingItem.id);

        if (deleteError) throw deleteError;
      }

      return true;
    } catch (error) {
      console.error('Error removing item from inventory:', error);
      return false;
    }
  }

  async createPet(petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pet | null> {
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert({
          owner_id: petData.ownerId,
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
          is_active: true, // Set as active by default
          hatch_time: petData.hatchTime?.toISOString(),
          last_interaction: petData.lastInteraction.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabasePetToPet(data);
    } catch (error) {
      console.error('Error creating pet:', error);
      return null;
    }
  }

  async updatePetStats(petId: string, stats: Partial<Pet>): Promise<boolean> {
    try {
      await validateGameAction('pet_stat_update', { stats });

      const updateData: any = {};
      
      // Map Pet interface to database columns
      if (stats.happiness !== undefined) updateData.happiness = Math.max(0, Math.min(10, stats.happiness));
      if (stats.health !== undefined) updateData.health = Math.max(0, Math.min(10, stats.health));
      if (stats.hunger !== undefined) updateData.hunger = Math.max(0, Math.min(10, stats.hunger));
      if (stats.strength !== undefined) updateData.strength = Math.max(0, stats.strength);
      if (stats.dexterity !== undefined) updateData.dexterity = Math.max(0, stats.dexterity);
      if (stats.intelligence !== undefined) updateData.intelligence = Math.max(0, stats.intelligence);
      if (stats.speed !== undefined) updateData.speed = Math.max(0, stats.speed);
      if (stats.attack !== undefined) updateData.attack = Math.max(0, stats.attack);
      if (stats.defense !== undefined) updateData.defense = Math.max(0, stats.defense);
      if (stats.precision !== undefined) updateData.precision = Math.max(0, stats.precision);
      if (stats.evasion !== undefined) updateData.evasion = Math.max(0, stats.evasion);
      if (stats.luck !== undefined) updateData.luck = Math.max(0, stats.luck);
      if (stats.lastInteraction) updateData.last_interaction = stats.lastInteraction.toISOString();

      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('pets')
        .update(updateData)
        .eq('id', petId);

      if (error) throw error;

      // Recalculate level if stats changed
      if (Object.keys(updateData).some(key => 
        ['strength', 'dexterity', 'intelligence', 'speed', 'attack', 'defense', 'precision', 'evasion', 'luck'].includes(key)
      )) {
        await supabase.rpc('calculate_pet_level', { pet_id: petId });
      }

      return true;
    } catch (error) {
      console.error('Error updating pet stats:', error);
      return false;
    }
  }

  // Currency operations
  async updateUserCurrency(userId: string, currencyType: 'xenocoins' | 'cash', amount: number, reason = 'game_action'): Promise<boolean> {
    try {
      await validateGameAction('currency_gain', { amount });

      const { data, error } = await supabase.rpc('update_user_currency', {
        user_id: userId,
        currency_type: currencyType,
        amount: amount,
        reason: reason
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating currency:', error);
      return false;
    }
  }

  async getUserCurrency(userId: string): Promise<{ xenocoins: number; cash: number } | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('xenocoins, cash')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        xenocoins: data.xenocoins,
        cash: data.cash
      };
    } catch (error) {
      console.error('Error fetching currency:', error);
      return null;
    }
  }

  // Inventory operations
  async getUserInventory(userId: string): Promise<Item[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          items (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return data.map(inventoryItem => ({
        ...inventoryItem.items,
        inventoryId: inventoryItem.id,
        quantity: inventoryItem.quantity,
        isEquipped: inventoryItem.is_equipped,
        createdAt: new Date(inventoryItem.acquired_at)
      }));
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  }

  async addItemToInventory(userId: string, itemId: string, quantity = 1): Promise<{ id: string, itemId: string, quantity: number } | null> {
    try {
      await validateGameAction('item_add', { quantity });

      // Check if item already exists in inventory (unequipped stack)
      const { data: existingStack, error: fetchError } = await supabase
        .from('inventory')
        .select('id, quantity, item_id')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .is('equipped_pet_id', null) // Ensure we are targeting an unequipped stack
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: 'single' row not found, which is fine if inserting new
        console.error('Error checking existing inventory item:', fetchError);
        throw fetchError;
      }

      if (existingStack) {
        // Update quantity of existing stack
        const newQuantity = existingStack.quantity + quantity;
        const { data: updatedData, error: updateError } = await supabase
          .from('inventory')
          .update({ quantity: newQuantity })
          .eq('id', existingStack.id)
          .select('id, item_id, quantity')
          .single();

        if (updateError) throw updateError;
        if (!updatedData) throw new Error("Failed to get updated item data.");

        return { id: updatedData.id, itemId: updatedData.item_id, quantity: updatedData.quantity };

      } else {
        // Insert new item entry
        const { data: insertedData, error: insertError } = await supabase
          .from('inventory')
          .insert({
            user_id: userId,
            item_id: itemId,
            quantity: quantity
          })
          .select('id, item_id, quantity')
          .single();

        if (insertError) throw insertError;
        if (!insertedData) throw new Error("Failed to get inserted item data.");

        return { id: insertedData.id, itemId: insertedData.item_id, quantity: insertedData.quantity };
      }

    } catch (error) {
      console.error('Error adding item to inventory:', error);
      return null;
    }
  }

  async equipItem(userId: string, petId: string, inventoryItemId: string, itemSlot: string): Promise<boolean> {
    try {
      await validateGameAction('item_equip', { petId, inventoryItemId, itemSlot });

      // Start a transaction
      const { data, error } = await supabase.rpc('equip_item_transaction', {
        p_user_id: userId,
        p_pet_id: petId,
        p_inventory_item_id: inventoryItemId,
        p_item_slot: itemSlot
      });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error equipping item:', error);
      // Check if it's a specific error from the RPC function (e.g., 'Item not found or already equipped')
      if (error.message && error.message.includes("Item not found") ) {
         // Potentially throw a custom error or return a specific response
         throw new Error("Item not found in inventory or does not have quantity 1.");
      }
      if (error.message && error.message.includes("Slot conflict") ) {
        throw new Error("Another item is already equipped in this slot by this pet.");
      }
      return false;
    }
  }

  async unequipItem(userId: string, petId: string, inventoryItemId: string, itemSlot: string): Promise<boolean> {
    try {
      await validateGameAction('item_unequip', { petId, inventoryItemId, itemSlot });

      const { data, error } = await supabase.rpc('unequip_item_transaction', {
        p_user_id: userId,
        p_pet_id: petId,
        p_inventory_item_id: inventoryItemId,
        p_item_slot: itemSlot
      });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error unequipping item:', error);
      if (error.message && error.message.includes("Item not equipped by this pet") ) {
        throw new Error("Item not found or not equipped by this pet in the specified slot.");
     }
      return false;
    }
  }


  // Player search operations
  async searchPlayers(query: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, account_score, created_at, last_login, is_admin')
        .ilike('username', `%${query}%`)
        .limit(20);

      if (error) throw error;

      return data.map(profile => ({
        id: profile.id,
        email: '', // Don't expose email in search
        username: profile.username,
        isAdmin: profile.is_admin,
        language: 'pt-BR',
        accountScore: profile.account_score,
        daysPlayed: Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 3600 * 24)),
        totalXenocoins: 0,
        createdAt: new Date(profile.created_at),
        lastLogin: new Date(profile.last_login)
      }));
    } catch (error) {
      console.error('Error searching players:', error);
      return [];
    }
  }

  async getPlayerProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, account_score, created_at, last_login, is_admin, total_xenocoins, days_played')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        email: '', // Don't expose email
        username: data.username,
        isAdmin: data.is_admin,
        language: 'pt-BR',
        accountScore: data.account_score,
        daysPlayed: data.days_played,
        totalXenocoins: data.total_xenocoins,
        createdAt: new Date(data.created_at),
        lastLogin: new Date(data.last_login)
      };
    } catch (error) {
      console.error('Error fetching player profile:', error);
      return null;
    }
  }

  // Notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.is_read,
        actionUrl: notification.action_url,
        createdAt: new Date(notification.created_at)
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async addNotification(userId: string, notification: Omit<Notification, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          action_url: notification.actionUrl
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error adding notification:', error);
      return false;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Helper methods
  private mapDatabasePetToPet(dbPet: any): Pet {
    return {
      id: dbPet.id,
      name: dbPet.name,
      species: dbPet.species,
      style: dbPet.style,
      level: dbPet.level,
      ownerId: dbPet.owner_id,
      happiness: dbPet.happiness,
      health: dbPet.health,
      hunger: dbPet.hunger,
      strength: dbPet.strength,
      dexterity: dbPet.dexterity,
      intelligence: dbPet.intelligence,
      speed: dbPet.speed,
      attack: dbPet.attack,
      defense: dbPet.defense,
      precision: dbPet.precision,
      evasion: dbPet.evasion,
      luck: dbPet.luck,
      personality: dbPet.personality,
      conditions: [], // Will be loaded separately if needed
      equipment: {}, // Will be loaded separately if needed
      isAlive: dbPet.is_alive,
      hatchTime: dbPet.hatch_time ? new Date(dbPet.hatch_time) : undefined,
      deathDate: dbPet.death_date ? new Date(dbPet.death_date) : undefined,
      lastInteraction: new Date(dbPet.last_interaction),
      createdAt: new Date(dbPet.created_at),
      updatedAt: new Date(dbPet.updated_at)
    };
  }
}

export const gameService = GameService.getInstance();
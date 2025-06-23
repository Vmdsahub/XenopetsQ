import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error?.code === 'PGRST301') {
    return 'Insufficient permissions';
  }
  
  if (error?.code === '23505') {
    return 'This item already exists';
  }
  
  if (error?.code === '23503') {
    return 'Referenced item not found';
  }
  
  return error?.message || 'An unexpected error occurred';
};

// Anti-cheat validation
export const validateGameAction = async (action: string, data: any) => {
  const maxValues = {
    xenocoins_gain: 10000,
    cash_gain: 100,
    pet_stat_change: 5,
    item_quantity: 100
  };
  
  switch (action) {
    case 'currency_gain':
      if (data.amount > maxValues.xenocoins_gain) {
        throw new Error('Invalid currency gain amount');
      }
      break;
    case 'pet_stat_update':
      for (const [stat, value] of Object.entries(data.stats)) {
        if (Math.abs(value as number) > maxValues.pet_stat_change) {
          throw new Error(`Invalid stat change for ${stat}`);
        }
      }
      break;
    case 'item_add':
      if (data.quantity > maxValues.item_quantity) {
        throw new Error('Invalid item quantity');
      }
      break;
  }
  
  return true;
};
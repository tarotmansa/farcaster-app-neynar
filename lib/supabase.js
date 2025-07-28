import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getMarket(marketId) {
  const { data, error } = await supabase
    .from('markets')
    .select('question')
    .eq('id', marketId)
    .single();

  if (error) {
    console.error('Error fetching market:', error);
    return null;
  }

  return data;
}

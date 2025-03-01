-- Create players table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create game_state table
CREATE TABLE IF NOT EXISTS public.game_state (
  id UUID PRIMARY KEY,
  deck JSONB NOT NULL DEFAULT '[]'::jsonb,
  dealer_hand JSONB NOT NULL DEFAULT '[]'::jsonb,
  dealer_score INTEGER NOT NULL DEFAULT 0,
  current_player_index INTEGER NOT NULL DEFAULT -1,
  game_phase TEXT NOT NULL DEFAULT 'waiting',
  timer INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create player_hands table
CREATE TABLE IF NOT EXISTS public.player_hands (
  id UUID PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.game_state(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  seat_position INTEGER NOT NULL,
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  bet_amount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'betting',
  is_turn BOOLEAN NOT NULL DEFAULT false,
  insurance_bet INTEGER,
  is_split BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_player_hands_game_id ON public.player_hands(game_id);
CREATE INDEX IF NOT EXISTS idx_player_hands_player_id ON public.player_hands(player_id);
CREATE INDEX IF NOT EXISTS idx_player_hands_seat_position ON public.player_hands(seat_position);

-- Enable Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_hands ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
-- In a production environment, you would want to restrict access based on user authentication
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow public read access to players" ON public.players;
  DROP POLICY IF EXISTS "Allow public write access to players" ON public.players;
  DROP POLICY IF EXISTS "Allow public update access to players" ON public.players;
  
  DROP POLICY IF EXISTS "Allow public read access to game_state" ON public.game_state;
  DROP POLICY IF EXISTS "Allow public write access to game_state" ON public.game_state;
  DROP POLICY IF EXISTS "Allow public update access to game_state" ON public.game_state;
  
  DROP POLICY IF EXISTS "Allow public read access to player_hands" ON public.player_hands;
  DROP POLICY IF EXISTS "Allow public write access to player_hands" ON public.player_hands;
  DROP POLICY IF EXISTS "Allow public update access to player_hands" ON public.player_hands;
  DROP POLICY IF EXISTS "Allow public delete access to player_hands" ON public.player_hands;
  
  -- Create new policies
  CREATE POLICY "Allow public read access to players" ON public.players FOR SELECT USING (true);
  CREATE POLICY "Allow public write access to players" ON public.players FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow public update access to players" ON public.players FOR UPDATE USING (true);
  
  CREATE POLICY "Allow public read access to game_state" ON public.game_state FOR SELECT USING (true);
  CREATE POLICY "Allow public write access to game_state" ON public.game_state FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow public update access to game_state" ON public.game_state FOR UPDATE USING (true);
  
  CREATE POLICY "Allow public read access to player_hands" ON public.player_hands FOR SELECT USING (true);
  CREATE POLICY "Allow public write access to player_hands" ON public.player_hands FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow public update access to player_hands" ON public.player_hands FOR UPDATE USING (true);
  CREATE POLICY "Allow public delete access to player_hands" ON public.player_hands FOR DELETE USING (true);
END
$$;

-- Enable realtime subscriptions for these tables
DO $$
BEGIN
  -- Safely add tables to the realtime publication
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
    EXCEPTION WHEN duplicate_object THEN
    -- Table is already in the publication, do nothing
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_state;
    EXCEPTION WHEN duplicate_object THEN
    -- Table is already in the publication, do nothing
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.player_hands;
    EXCEPTION WHEN duplicate_object THEN
    -- Table is already in the publication, do nothing
  END;
END
$$; 
-- Create players table
CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    balance INTEGER NOT NULL DEFAULT 10000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create game_state table
CREATE TABLE game_state (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deck JSONB NOT NULL DEFAULT '[]'::jsonb,
    dealer_hand JSONB NOT NULL DEFAULT '[]'::jsonb,
    dealer_score INTEGER NOT NULL DEFAULT 0,
    current_player_index INTEGER NOT NULL DEFAULT -1,
    game_phase VARCHAR(50) NOT NULL DEFAULT 'waiting',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create player_hands table
CREATE TABLE player_hands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES game_state(id),
    player_id UUID REFERENCES players(id),
    seat_position INTEGER NOT NULL,
    cards JSONB NOT NULL DEFAULT '[]'::jsonb,
    bet_amount INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'betting',
    is_turn BOOLEAN NOT NULL DEFAULT false,
    insurance_bet INTEGER,
    is_split BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, seat_position)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_player_hands_updated_at
    BEFORE UPDATE ON player_hands
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_state_updated_at
    BEFORE UPDATE ON game_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_player_hands_game_id ON player_hands(game_id);
CREATE INDEX idx_player_hands_player_id ON player_hands(player_id);
CREATE INDEX idx_players_name ON players(name);

-- Enable Row Level Security (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_hands ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to players"
    ON players FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow public read access to game_state"
    ON game_state FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow public read access to player_hands"
    ON player_hands FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow authenticated insert to players"
    ON players FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update to players"
    ON players FOR UPDATE
    TO anon
    USING (true);

CREATE POLICY "Allow authenticated insert to game_state"
    ON game_state FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update to game_state"
    ON game_state FOR UPDATE
    TO anon
    USING (true);

CREATE POLICY "Allow authenticated insert to player_hands"
    ON player_hands FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update to player_hands"
    ON player_hands FOR UPDATE
    TO anon
    USING (true); 
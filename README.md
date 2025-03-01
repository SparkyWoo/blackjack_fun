# Blackjack Fun

A multiplayer blackjack game built with Next.js, TypeScript, and Supabase with real-time synchronization.

## Features

- Real-time multiplayer gameplay
- Beautiful casino-inspired UI with animations
- Persistent player data and game state
- Responsive design for desktop and mobile
- Complete blackjack rules implementation

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier works fine)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SparkyWoo/blackjack_fun.git
cd blackjack_fun
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Go to the SQL Editor in your Supabase dashboard
   - Run the SQL migration in `supabase/migrations/20230601000000_create_blackjack_tables.sql`
   - Get your Supabase URL and anon key from the API settings

4. Create a `.env.local` file in the root directory with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the game.

## Real-time Multiplayer Setup

The game uses Supabase's real-time functionality to synchronize game state across multiple clients. Here's how it works:

1. **Database Schema**: The game uses three main tables:
   - `players`: Stores player information and balances
   - `game_state`: Stores the current game state (deck, dealer hand, game phase, etc.)
   - `player_hands`: Stores the hands for each player in the current game

2. **Real-time Subscriptions**: The game subscribes to changes in these tables using Supabase's real-time API:
   - When a player joins, places a bet, or takes an action, the changes are saved to the database
   - All connected clients receive these updates in real-time
   - The UI updates automatically to reflect the current game state

3. **State Synchronization**: The game state is synchronized in two ways:
   - When a player first loads the game, it fetches the current state from the database
   - As the game progresses, all changes are broadcast to all connected clients

## Playing the Game

1. Open the game in multiple browser windows to simulate multiple players
2. Enter a name and join a seat
3. Place your bets
4. Take turns playing blackjack!

## Deployment

The game can be deployed to Vercel with the following steps:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add your Supabase environment variables
4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js, TypeScript, and Tailwind CSS
- Real-time functionality powered by Supabase
- Card game logic inspired by classic casino blackjack rules 
import streamDeck, { LogLevel } from '@elgato/streamdeck';

// import { IncrementCounter } from "./actions/increment-counter";
import { AnimalCounter } from './actions/increment-chapaa';
import { BugCounter } from './actions/increment-bug';
import { FishCounter } from './actions/increment-fish';
import { ElderwoodFishCounter } from './actions/increment-elderwoodfish';
import { MiningCounter } from './actions/increment-mining';

streamDeck.logger.setLevel(LogLevel.TRACE);

// Register the increment action.
// streamDeck.actions.registerAction(new IncrementCounter());
streamDeck.actions.registerAction(new AnimalCounter());
streamDeck.actions.registerAction(new BugCounter());
streamDeck.actions.registerAction(new FishCounter());
streamDeck.actions.registerAction(new ElderwoodFishCounter());
streamDeck.actions.registerAction(new MiningCounter());

// Finally, connect to the Stream Deck.
streamDeck.connect();

import { readFileSync, writeFile, writeFileSync } from 'fs';
import * as src from './src';
import * as format from './format';

const ilLevels: src.Level[] = [
  { id: 'owoyz539', name: 'Make a Star 1' },
  { id: 'xd1xgyy9', name: 'Make a Star 2' },
  { id: 'ewprgo4d', name: 'Make a Star 3' },
  { id: 'y9m8lg0d', name: 'Make a Star 4' },
  { id: '5wkpyexd', name: 'Make a Star 5' },
  { id: '5925xr69', name: 'Make a Star 6' },
  { id: '29v2o0xd', name: 'Make a Star 7' },
  { id: 'xd4xqe89', name: 'Make a Star 8' },
  { id: 'xd0xznjd', name: 'Make a Star 9' },
  { id: 'rw63jg6w', name: 'Make the Moon' },
];

const anyCategory: src.Category = { id: '9kvy50ok', name: 'Any%', misc: false };

const getRuns = (username: string, game: string): Promise<Maybe<src.Run[]>> =>
  Promise.all([
    src.getUserId(username),
    src.getGameId(game),
  ]).then(([userId, gameId]) =>
    src.getGameRuns(userId as string, gameId as string),
  );

const mockGetRuns = (): Promise<Maybe<src.Run[]>> =>
  Promise.resolve(JSON.parse(readFileSync('ils.txt').toString()));

const main = (): void => {
  // getRuns('grass', 'katamari damacy reroll')
  mockGetRuns()
    .then(runs => {
      if (runs === undefined) return console.log('error');

      writeFileSync('progression.txt', format.printProgression(runs, anyCategory, ilLevels));
    })
    .catch(console.log);
};

main();

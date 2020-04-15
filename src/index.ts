import request, { RequestPromise } from 'request-promise';

const MAX_PAGINATION: number = 200;

const url = (endpoint: string) => `https://speedrun.com/api/v1/${endpoint}`;

interface APIResponse {
  data: any;
  pagination: {
    links: { rel: string, uri: string }[];
  };
}

const withPagination = <T>(
  nextRequest: string | (() => RequestPromise<APIResponse>),
  parser: (data: any) => Maybe<T[]>,
  results: T[] = [],
): Promise<Maybe<T[]>> => {
  const makeRequest = typeof nextRequest === 'string'
    ? () => request(nextRequest, { json: true })
    : nextRequest;

  return makeRequest()
    .then(res => {
      const newResults = parser(res);
      const nextResults = newResults ? results.concat(newResults) : results;
      const nextLink = res.pagination.links.filter(l => l.rel === 'next')[0];

      return nextLink
        ? withPagination(nextLink.uri, parser, nextResults)
        : nextResults;
    });
}

// gets a game's id from its title
export const getGameId = (title: string): Promise<Maybe<string>> =>
  request(url('games'), { qs: { name: title }, json: true })
    .then(res => {
      console.log(res.pagination);
      for (const game of res.data) {
        for (const key in game.names) {
          if (game.names[key] == title) return game.id;
        }
      }
    });

export interface Level {
  id: string;
  name: string;
}

const extractLevel = (apiLevel: any): Level => ({
  id: apiLevel.id,
  name: apiLevel.name,
});

// gets the level ids of a game from its id
export const getGameLevels = (id: string): Promise<Maybe<Level[]>> =>
  request(url(`games/${id}/levels`), { json: true })
    .then(res => res.data.map(extractLevel))
    .catch(() => undefined);

// gets a user's id from their username
export const getUserId = (username: string): Promise<Maybe<string>> =>
  request(url('users'), { qs: { name: username }, json: true })
    .then(res => {
      for (const user of res.data) {
        for (const key in user.names) {
          if (user.names[key] == username) return user.id;
        }
      }
    });

export interface RunTimes {
  primary: string | null;
  primary_t: number;
  realtime: string | null;
  realtime_t: number;
  realtime_noloads: string | null;
  realtime_noloads_t: number;
  ingame: string | null;
  ingame_t: number;
}

export interface RunIL {
  id: string;
  date: Date;
  levelId: string;
  times: RunTimes;
}

const extractRunIL = (apiRun: any): RunIL => ({
  id: apiRun.id,
  date: new Date(apiRun.date),
  levelId: apiRun.level,
  times: apiRun.times,
});

export const getGameILs = (userId: string, gameId: string): Promise<Maybe<RunIL[]>> =>
  withPagination(
    () => request(url('runs'), { qs: { user: userId, game: gameId, max: MAX_PAGINATION }, json: true }),
    res => res.data ? res.data.map(extractRunIL) : [],
  );

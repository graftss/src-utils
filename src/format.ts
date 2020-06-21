import { readFileSync } from 'fs';
import { RunIL, Level } from './src';

const runs: RunIL[] = JSON.parse(readFileSync('./runs.json').toString());


const sortByDate = (runs: RunIL[]): RunIL[] =>
  runs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

const runTime = (run: RunIL): number => run.times.primary_t;

export interface SumOfBest {
  date: Date;
  value: number;
}

export const computeSumsOfBest = (runs: RunIL[], levels: Level[]): SumOfBest[] => {
  const result: SumOfBest[] = [];
  const validLevelIds = {};
  // this is a hack for testing and it sucks
  runs.forEach(r => (r.date = new Date(r.date)));
  levels.forEach(l => (validLevelIds[l.id] = true));

  const foundTimes: { [K in string]: number } = {};
  let levelsFound = 0;
  const getSOB = (): number =>
    Object.values(foundTimes).reduce((a, b) => a + b, 0);

  for (const run of sortByDate(runs)) {
    const { levelId } = run;
    const time = runTime(run);

    // ignore invalid levels
    if (!validLevelIds[levelId]) continue;
    // take note of newly found levels
    if (!foundTimes[levelId]) levelsFound += 1;
    // ignore times that aren't strict pbs
    if (foundTimes[levelId] <= time) continue;
    // update new pb time
    foundTimes[levelId] = time;
    // don't compute sum of bests until all levels have a time
    if (levelsFound < levels.length) continue;

    const sob: SumOfBest = { date: run.date, value: getSOB() };
    result.push(sob);
  }

  return result;
};

const dateToExcelDate = (date: Date): string =>
  [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('/');

const secondsToExcelTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return [hours, minutes, seconds].join(':') + '.000';
};

export const printSumsOfBest = (sobs: SumOfBest[]): string =>
  sobs
    .map(({ date, value }) => {
      return [dateToExcelDate(date), secondsToExcelTime(value)].join('\t');
    }
    )
    .join('\n');

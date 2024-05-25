import { Run, Level, Category } from './src';

const sortByDate = (runs: Run[]): Run[] =>
  runs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

const runTime = (run: Run): number => run.times.primary_t;

export interface DatedTime {
  date: Date;
  value: number;
}

export interface DatedRun extends DatedTime {
  run: Run;
}

export const computeSumsOfBest = (
  runs: Run[],
  levels: Level[],
): DatedRun[] => {
  const result: DatedRun[] = [];
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

    const sob: DatedRun = { date: run.date, value: getSOB(), run };
    result.push(sob);
  }

  return result;
};

export const computeCategoryProgression = (
  runs: Run[],
  category: Category,
): DatedTime[] => {
  const runsInCategory = runs.filter(run => run.category === category.id);

  sortByDate(runsInCategory);

  return runsInCategory.map(run => ({
    date: run.date,
    value: run.times.primary_t,
  }));
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

const datedTimeToExcelRow = ({ date, value }: DatedTime): string =>
  [dateToExcelDate(date), secondsToExcelTime(value)].join('\t');

const datedRunToExcelRow = (ilLevels: Level[]) => {
  const levelIdToName = ilLevels.reduce((acc, level) => ({ ...acc, [level.id]: level.name }), {});
  console.log({ levelIdToName });
  return (datedRun: DatedRun): string => {
    const ilTimeStr = secondsToExcelTime(datedRun.run.times.realtime_t);
    const ilNameStr = levelIdToName[datedRun.run.levelId];
    console.log({ ilNameStr, id: datedRun.run.levelId });
    return [datedTimeToExcelRow(datedRun), ilNameStr, ilTimeStr].join('\t');
  };
};


export const printSumsOfBest = (runs: Run[], levels: Level[]): string =>
  computeSumsOfBest(runs, levels)
    .map(datedTimeToExcelRow)
    .join('\n');

export const printCategoryProgression = (
  runs: Run[],
  category: Category,
): string =>
  computeCategoryProgression(runs, category)
    .map(datedTimeToExcelRow)
    .join('\n');

export const printProgression = (runs: Run[], rtaCategory: Category, ilLevels: Level[]): string => {
  const ilSobRows = computeSumsOfBest(runs, ilLevels)
    .map(datedRunToExcelRow(ilLevels))
    .map(row => `${row}\tTRUE`);

  const rtaRows = computeCategoryProgression(runs, rtaCategory)
    .map(datedTimeToExcelRow)
    .map(row => `${row}\tFALSE`);

  return ilSobRows.concat(rtaRows).join('\n');
};

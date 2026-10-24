const STEPS = [1, 2, 2.5, 5, 10];

function clean(value: number) {
  return Number(value.toPrecision(12));
}

export type Scale = { min: number; max: number; ticks: number[] };

export function niceTicks(dataMin: number, dataMax: number, count = 5): Scale {
  let low = Math.min(dataMin, dataMax);
  let high = Math.max(dataMin, dataMax);
  if (low === high) {
    const pad = low === 0 ? 1 : Math.abs(low) * 0.1;
    low = low === 0 ? 0 : low - pad;
    high += pad;
  }
  const rough = (high - low) / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = (STEPS.find((candidate) => candidate * magnitude >= rough) ?? 10) * magnitude;
  const min = clean(Math.floor(low / step) * step);
  const max = clean(Math.ceil(high / step) * step);
  const ticks: number[] = [];
  for (let index = 0; clean(min + index * step) <= max; index += 1) {
    ticks.push(clean(min + index * step));
  }
  return { min, max, ticks };
}

export type Tile = { index: number; x: number; y: number; width: number; height: number };

type Area = { index: number; area: number };

function worstRatio(row: readonly Area[], side: number) {
  let sum = 0;
  let largest = 0;
  let smallest = Infinity;
  for (const item of row) {
    sum += item.area;
    largest = Math.max(largest, item.area);
    smallest = Math.min(smallest, item.area);
  }
  const sideSquared = side * side;
  const sumSquared = sum * sum;
  return Math.max((sideSquared * largest) / sumSquared, sumSquared / (sideSquared * smallest));
}

export function squarify(values: readonly number[], width: number, height: number): Tile[] {
  const items = values
    .map((value, index) => ({ value, index }))
    .filter((item) => item.value > 0)
    .toSorted((a, b) => b.value - a.value);
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0 || width <= 0 || height <= 0) {
    return [];
  }
  const scale = (width * height) / total;
  const areas = items.map((item) => ({ index: item.index, area: item.value * scale }));

  const tiles: Tile[] = [];
  let box = { x: 0, y: 0, width, height };

  function place(row: readonly Area[]) {
    const sum = row.reduce((rowTotal, item) => rowTotal + item.area, 0);
    if (box.width >= box.height) {
      const stripWidth = sum / box.height;
      let y = box.y;
      for (const item of row) {
        const tileHeight = item.area / stripWidth;
        tiles.push({ index: item.index, x: box.x, y, width: stripWidth, height: tileHeight });
        y += tileHeight;
      }
      box = { x: box.x + stripWidth, y: box.y, width: box.width - stripWidth, height: box.height };
    } else {
      const stripHeight = sum / box.width;
      let x = box.x;
      for (const item of row) {
        const tileWidth = item.area / stripHeight;
        tiles.push({ index: item.index, x, y: box.y, width: tileWidth, height: stripHeight });
        x += tileWidth;
      }
      box = {
        x: box.x,
        y: box.y + stripHeight,
        width: box.width,
        height: box.height - stripHeight,
      };
    }
  }

  let row: Area[] = [];
  for (const item of areas) {
    const side = Math.min(box.width, box.height);
    if (row.length === 0 || worstRatio([...row, item], side) <= worstRatio(row, side)) {
      row.push(item);
    } else {
      place(row);
      row = [item];
    }
  }
  if (row.length > 0) {
    place(row);
  }
  return tiles.toSorted((a, b) => a.index - b.index);
}

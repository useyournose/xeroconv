import Chart from 'chart.js/auto'
import {ChartConfiguration, Colors, Legend, LegendElement, LegendItem, LegendOptions, ChartEvent } from 'chart.js'
import {HistogramDatasetBinned, RawDataset, BinnedDataset, BinningResult } from "./_types"
import { bulmaTextColor } from './helper/getComputedStyle';
import { mean } from './helper/mean'
import { stddev } from './helper/StandardDeviation'
import { normalPDF } from './helper/NormalDistribution';
import { kde } from './helper/KernelDensityEstimation';
import { std } from './helper/SampleStandardDeviation';
import { sturgesCount } from './helper/SturgesCount';
import { fdCount } from './helper/FriedmanDiaconisBin';

Chart.register(Colors);

type HistogramData = number[];

const newLegendClickHandler = function (e: ChartEvent, legendItem: LegendItem, legend: any) {
    const index = legendItem.datasetIndex;
    const type = legend.chart.config.type;

    let ci = legend.chart;
    [
        ci.getDatasetMeta(index),
        ci.getDatasetMeta(index + 1),
        ci.getDatasetMeta(index + 2)
    ].forEach(function(meta) {
        meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
    });
    ci.update();
};

function binData(data: HistogramData, binSize: number): { labels: string[]; counts: number[] } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const bins = Math.ceil((max - min) / binSize);
  const counts = new Array(bins).fill(0);
  const labels = new Array(bins).fill("").map((_, i) => {
    const start = min + i * binSize;
    const end = start + binSize;
    return `${start.toFixed(1)}–${end.toFixed(1)}`;
  });

  data.forEach(value => {
    const index = Math.floor((value - min) / binSize);
    counts[index]++;
  });

  return { labels, counts };
}

export function renderHistogram(canvasId: string, data: HistogramData, binSize: number) {
  const { labels, counts } = binData(data, binSize);

  new Chart(document.getElementById(canvasId) as HTMLCanvasElement, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Frequency',
        data: counts,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Bins' } },
        y: { title: { display: true, text: 'Count' }, beginAtZero: true, stacked: false }
      }
    }
  });
}

/** Choose bin count using one of several rules, then bin multiple datasets.
 *  - method: 'fd' | 'sturges' | 'sqrt' (default 'sturges' for small n)
 *  - minBins / maxBins clamp the output to a readable range
 */
export function autoBinDatasets(
  raw: RawDataset[],
  opts?: {
    method?: 'fd' | 'sturges' | 'sqrt';
    minBins?: number;
    maxBins?: number;
  }
): BinningResult {
  const method = opts?.method ?? 'sturges';
  const minBins = Math.max(2, Math.floor(opts?.minBins ?? 3));
  const maxBins = Math.max(minBins, Math.floor(opts?.maxBins ?? 10));

  const allValues = raw.flatMap(r => r.values).filter(v => Number.isFinite(v));
  if (allValues.length === 0) {
    return {
      labels: [],
      edges: [],
      datasets: raw.map(r => ({ label: r.label, data: [], color: r.color }))
    };
  }

  const n = allValues.length;
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = Math.max(Number.EPSILON, max - min);

  function sqrtCount(): number {
    return Math.max(1, Math.ceil(Math.sqrt(n)));
  }

  let kRaw: number;
  if (method === 'fd') {
    kRaw = fdCount(allValues, n, range);
  } else if (method === 'sqrt') {
    kRaw = sqrtCount();
  } else {
    kRaw = sturgesCount(n);
  }

  // For very small n (3-20), force a sensible minimum and maximum
  let k = Math.min(maxBins, Math.max(minBins, kRaw));

  // Additional heuristic: if n is extremely small, prefer fewer bins
  if (n <= 5) k = Math.min(k, Math.max(2, Math.floor(n / 1.5)));
  if (n <= 10) k = Math.min(k, Math.max(3, Math.floor(n / 1.2)));

  // Build equally spaced edges (inclusive last edge)
  const edges: number[] = [];
  if (k === 1) {
    edges.push(min, max);
  } else {
    for (let i = 0; i <= k; i++) {
      edges.push(min + (i / k) * range);
    }
    edges[edges.length - 1] = max;
  }

  const labels = edges.slice(0, -1).map((lo, i) => {
    const hi = edges[i + 1];
    return `${lo.toFixed(3)} - ${hi.toFixed(3)}`;
  });

  function countsFor(values: number[]) {
    const counts = Array(edges.length - 1).fill(0);
    for (const v of values) {
      if (!Number.isFinite(v)) continue;
      // assign to bin (include left edge, exclude right except for last bin)
      for (let i = 0; i < edges.length - 1; i++) {
        const left = edges[i];
        const right = edges[i + 1];
        const isLast = i === edges.length - 2;
        if ((v >= left && v < right) || (isLast && v === right)) {
          counts[i]++;
          break;
        }
      }
    }
    return counts;
  }

  const datasets: BinnedDataset[] = raw.map(r => ({ label: r.label, data: countsFor(r.values), color: r.color }));

  return { labels, edges, datasets };
}

export function renderHistogramOverlay(
  canvasId: string,
  labels: string[],
  datasets: HistogramDatasetBinned[],
): Chart | null {
  const el = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!el) return null;

  // if re-rendering, destroy existing Chart instance bound to canvas
  // @ts-ignore 
  if ((el as any)._chart) { /* eslint-disable-line @typescript-eslint/no-explicit-any */
    // @ts-ignore
    (el as any)._chart.destroy();
  }

  const chart = new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: /*ds.color.replace(/rgba?\((.+)\)/, 'rgba($1,0.5)') ?? */ ds.color,
        borderColor: ds.color,
        borderWidth: 1,
        barPercentage: 1.0,
        categoryPercentage: 1.0,
        order: i
      }))
    },
    options: {
      responsive: true,
      scales: {
        x: { stacked: false },
        y: { beginAtZero: true, stacked: false }
      },
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false }
      }
    }
  });

  // store reference for later cleanup
  // @ts-ignore
  (el as any)._chart = chart;
  return chart;
}

export function renderKDEOverlay(canvasId:string, RawData:RawDataset[]): Chart | null {

  const el = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!el) return null;

  // if re-rendering, destroy existing Chart instance bound to canvas
  // @ts-ignore 
  if ((el as any)._chart) { /* eslint-disable-line @typescript-eslint/no-explicit-any */
    // @ts-ignore
    (el as any)._chart.destroy();
  }

  // Gemeinsame X-Achse für Dichten
  const globalMin = Math.min(...RawData.flatMap(({values}) => values));
  const globalMax = Math.max(...RawData.flatMap(({values}) => values));
  const widener = (globalMax-globalMin) * 0.25
  const xValues: number[] = [];
  for (let x = globalMin - widener; x <= globalMax + widener; x += 0.2) xValues.push(x);

  // Gemeinsames h
  function silverman(data:number[]):number {
    const sd=std(data), n=data.length; return 1.06*sd*Math.pow(n,-1/5);
  }
  const pooledValues = RawData.flatMap(d => d.values).filter(Number.isFinite);
  const pooledh = silverman(pooledValues)

  // Datasets sammeln
  const datasets: any[] = [];

  RawData.forEach((s, idx) => {
    const mu = mean(s.values);
    const sigma = stddev(s.values, mu);

    // Histogramm
    const binCount = 10;
    const binWidth = (globalMax - globalMin) / binCount;
    const bins = Array(binCount).fill(0);
    s.values.forEach(v => {
      const i = Math.min(Math.floor((v - globalMin) / binWidth), binCount - 1);
      bins[i]++;
    });
    const binCenters = bins.map((_, i) => globalMin + (i + 0.5) * binWidth);

    // Normalverteilung
    const normalValues = xValues.map(x => normalPDF(x, mu, sigma));

    // KDE
    const h = 1.06 * sigma * Math.pow(s.values.length, -1 / 5);
    //const kdeValues = kde(xValues, s.values, h);
    const kdeValues = kde(xValues, s.values, pooledh);

    // Histogramm-Dataset
    /*datasets.push({
      type: "bar",
      label: `${s.label} Histogramm`,
      data: bins,
      backgroundColor: s.color,
      xAxisID: "xBins" + idx,
      yAxisID: "y"
    });*/

    // Normalverteilung
    /*datasets.push({
      type: "line",
      label: `${s.label} Normal`,
      data: normalValues.map(v => v * s.values.length * binWidth),
      borderColor: s.color,
      fill: false,
      tension: 0.2,
      xAxisID: "xDensity",
      yAxisID: "y"
    });*/

    // KDE
    datasets.push({
      type: 'line',
      label: s.label, 
      data: kdeValues.map(v => v * s.values.length * binWidth).map(value => value === 0 ? null : value),
      borderColor: s.color,
      backgroundColor: s.color + 'AA',
      fill: false,
      tension: 0.2,
      xAxisID: "xDensity",
      yAxisID: "y",
      pointStyle: false, 
      order: 1
    });

    const maxY = Math.max(...kdeValues.flatMap(v => v * s.values.length * binWidth));

    // shots
    datasets.push({
      type: "scatter",
      data: s.values.map((v) => { return {x: v, y: maxY * 0.1 };}),
      label: s.label + ` - Shot`,
      showLine: false,
      borderColor: s.color,
      backgroundColor: s.color + '77',
      pointRadius: 5,
      xAxisID: "xDensity",
      order: 3
    })

    // average bar    
    datasets.push({
      type: 'line',
      label: s.label + ' - AVG',
      data: [{ x: mu, y: 0 }, { x: mu, y: maxY || 2 }],
      borderColor: s.color,
      borderWidth: 2,
      borderDash: [6, 6],
      pointRadius: 0,
      tension: 0,
      fill: false,
      // Put scales & z index so these lines render above KDE curves
      order: 2,
      xAxisID: "xDensity",
      yAxisID: "y",
    });

  });


  // Chart Config

  const cfg:ChartConfiguration = {
    type: "line",
    data: {
      labels: xValues.map(v => v.toFixed(1)), // für Dichten
      datasets
    },
    options: {
      responsive: true,
      scales: {
        xDensity: {
          type: "linear",
          position: "bottom",
          min: globalMin - widener,
          max: globalMax + widener,
          title: { display: true, text: "Velocity",color: bulmaTextColor },
          grid: {color: bulmaTextColor},
          ticks: {color: bulmaTextColor}
        },
        y: {
          title: { display: true, text: "Density", color: bulmaTextColor },
          grid: {color: bulmaTextColor},
          ticks: {color: bulmaTextColor}
        }
      },
      plugins:{
        legend: {
          labels: {
            filter: (legendItem, chart) => {
              const ds = chart.datasets[legendItem.datasetIndex!];
              return ds.type !== 'scatter' && !ds.label.endsWith(" - AVG");
            },
            color: bulmaTextColor
          },
          onClick: newLegendClickHandler
        }
      }
    }
  }
  
  const chart = new Chart(el,cfg);

  // store reference for later cleanup
  // @ts-ignore
  (el as any)._chart = chart;
  return chart;
}
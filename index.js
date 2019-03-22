import data from './data.js';
import Chart from './chart.js';

const chart = new Chart(data[0]);
chart.draw();

window.chart = chart;
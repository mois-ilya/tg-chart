import data from './data.js';
import Chart from './chart.js';

window.charts = [];

data.forEach((value, i) => {
    const element = document.querySelector('#el' + i);
    const chart = new Chart(data[i]);
    chart.draw(element);
    window.charts.push(chart);
})

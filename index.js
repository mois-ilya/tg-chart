import data from './data.js';
import Chart from './chart.js';

const chart = new Chart(data[2]);
chart.draw();

window.chart = chart;

const start = document.querySelector('.start__input');
start.min = 0;
start.max = 999;
start.value = chart.config.start;

start.addEventListener('input', () => {
    chart.setStart(start.value);
})

const end = document.querySelector('.end__input');
end.min = 0;
end.max = 999;
end.value = chart.config.end;

end.addEventListener('input', () => {
    chart.setEnd(end.value);
})
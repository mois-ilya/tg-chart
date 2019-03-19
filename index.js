import data from './data.js';
import Chart from './chart.js';

const chart = new Chart(data[2]);
window.chart = chart;

const x = chart.x;
const y = chart.y;

const start = document.querySelector('.start__input');
start.min = 1;
start.max = x[x.length - 1];
start.value = chart.config.start;

start.addEventListener('input', () => {
    chart.setStart(start.value);
})


const end = document.querySelector('.end__input');
end.min = 2;
end.max = x[x.length - 1];
end.value = chart.config.end;

end.addEventListener('input', () => {
    chart.setEnd(end.value);
})

chart.draw();

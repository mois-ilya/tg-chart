class Chart {
    constructor(data) {

        this.config = {
            start: 0,
            end: 600,
            height: 400,
            rows: 6,
            gap: 0.5,
            marginTopMinimap: 20,
            heightMiniMap: 60,
            get width() {
                return this.wrapperWidth*999 / (this.end - this.start) ;
            },
            get heightRow() {
                return this.height / (this.rows - this.gap)
            },
            get heightChart() {
                return this.height * (this.rows - this.gap) / this.rows
            }
        }
        
        this.data = data;
        this.drawData = {};

        // create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('canvas-chart');
        this.ctx = this.canvas.getContext('2d');
    }

    draw() {
        const div = document.querySelector('.chart-wrapper');
        div.appendChild(this.canvas);
        this.config.wrapperWidth = Number(div.clientWidth);

        this.redrawing();
    }

    redrawing() {
        const canvas = this.canvas;
        
        canvas.width = this.config.width;
        canvas.height = this.config.height + this.config.heightMiniMap + this.config.marginTopMinimap;

        this.drawGrid();
        this.drawChart();
        this.drawMiniMap();
    }

    setStart(value) {
        const config = this.config;
        if (value > config.end) {
            throw 'Start more then end'
        }
        config.start = Number(value);
        this.redrawing();
    }

    setEnd(value) {
        const config = this.config;
        if (value < config.ctart) {
            throw 'End smaller then start'
        }
        config.end = Number(value);
        this.redrawing();
    }

    // setWidth(value) {
    //     const config = this.config;
    //     if (value < config.wrapperWidth) {
    //         throw 'Слишком маленькая ширина графика'
    //     }
    //     config.width = Number(value);
    //     this.redrawing();
    // }

    drawChart () {
        const ctx = this.ctx;
        const chart = this.getParamsChart();
        const xPoints = chart.xs;
        const yPoints = chart.ys;
        
        ctx.beginPath();
        ctx.moveTo(xPoints[0], yPoints[0]);
        for (let i = 0; i < xPoints.length; i++) {
            ctx.lineTo(xPoints[i],yPoints[i]);
        }
        ctx.strokeStyle = this.data.colors.y0;
        ctx.lineJoin = "round";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }
    
    drawMiniMap() {
        const ctx = this.ctx;
        const miniMap = this.getParamsMiniMap();
        const xPoints = miniMap.xs;
        const marginTop = this.config.marginTopMinimap + this.config.height;
        const yPoints = miniMap.ys.map(value => value + marginTop);
        
        // draw chart
        ctx.beginPath();
        ctx.moveTo(xPoints[0], yPoints[0]);
        for (let i = 1; i < this.drawData.allPoints; i++) {
            ctx.lineTo(xPoints[i],yPoints[i]);
        }
        ctx.strokeStyle = this.data.colors.y0;
        ctx.lineJoin = "round";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // draw mask
        const x1 = 0,
              x2 = this.config.wrapperWidth,
              y1 = marginTop,
              y2 = this.config.heightMiniMap + marginTop,
              color = "rgba(0,0,0,0.1)";
        
        ctx.beginPath();

        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y2);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, y1);

        ctx.moveTo(x1+10, y1+10);
        ctx.lineTo(x1+10, y1 + 100);
        ctx.lineTo(x1 + 30, y1 + 100);
        ctx.lineTo(x1 + 30, y1+10);

        // color & fiil
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.fill();
        ctx.closePath();

        // ctx.fillStyle = color;
        // ctx.fillRect(x1, y1, x2, y2);
        // ctx.clearRect(45,45,60,60);
    }

    drawGrid () {
        const ctx = this.ctx;
        const heightRow = this.config.heightRow;
        let posRow = heightRow / 2;

        ctx.beginPath();
        for (let i = 0; i < this.config.rows; i++) {
            ctx.moveTo(0, posRow);
            ctx.lineTo(this.config.wrapperWidth, posRow);
            posRow += heightRow;
        }

        // test
        let posColumn = 0;
        for (let i = 0; i < 20; i++) {
            ctx.moveTo(posColumn, 0);
            ctx.lineTo(posColumn, this.config.height);
            posColumn += 25;
        }
        
        ctx.strokeStyle = '#bbb'; //eee
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    }

    getParamsMiniMap() {
        const originalXs = this.data.columns[0].slice(1);
        const originalYs = this.data.columns[1].slice(1);

        const xChartScale = this.config.wrapperWidth;
        const yChartScale = this.config.heightMiniMap;

        const xsMiniMap = this.normalize(originalXs, xChartScale);
        const ysMiniMap = this.normalize(originalYs, yChartScale);

        this.drawData.allPoints = originalXs.length;
        this.drawData.miniMap = {
            xs: xsMiniMap,
            ys: ysMiniMap
        }
        
        return this.drawData.miniMap;
    }

    getParamsChart() {
        const originalXs = this.data.columns[0].slice(1);
        const gridWidth = this.config.width;
        const preXs = this.normalize(originalXs, gridWidth);

        const startPoint = preXs.findIndex(point => point / gridWidth * 999 >= this.config.start) + 1;
        const endPoint = preXs.findIndex(point => point / gridWidth * 999 >= this.config.end) + 1;

        this.drawData.startPoint = startPoint;
        this.drawData.endPoint = endPoint;

        // const currentXsL = this.data.columns[0].slice(1);
        // const xsL = currentXsL.map(point => );

        // const currentXs = this.data.columns[0].slice(startPoint, endPoint + 2);  // + 2 because in search was been slice(1)
        // const xScale = this.config.width;
        // const xs = this.normalize(currentXs, xScale);

        const currentYs = this.data.columns[1].slice(startPoint, endPoint + 2);
        const yScale = this.config.heightChart;
        const ys = this.normalize(currentYs, yScale);

        this.drawData.chart = {
            xs: preXs,
            ys: ys
        }

        return this.drawData.chart;
    }

    normalize(arr, param) {
        const arrMax = Math.max(...arr);
        const arrMin = Math.min(...arr);
        const arrDif = arrMax - arrMin;
        const arrCoe = param / arrDif;
        const points = arr.map(point => (point - arrMin) * arrCoe); 

        return points;
    }
}

export default Chart;

// console.clear();
// console.log("startPoint: " + startPoint);
// console.log("endPoint: " + endPoint);
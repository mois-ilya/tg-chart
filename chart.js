class Chart {
    constructor(data) {

        this.config = {
            start: 183549620678,
            end: 1083549620678,
            height: 400,
            rows: 6,
            gap: 0.5,
            marginTopMinimap: 20,
            heightMiniMap: 60,
            get heightRow() {
                return this.height / (this.rows - this.gap)
            },
            get heightChart() {
                return this.height * (this.rows - this.gap) / this.rows
            }
        }
        
        this.data = data;
        this.x = data.columns[0].slice(1);
        this.y = data.columns[1].slice(1);
        this.drawData = {
            typeMove: false,
            startPoint: false
        };

        // create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('canvas-chart');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.addEventListener("touchstart", this.handleStart.bind(this), false);
        this.canvas.addEventListener("touchend", this.handleEnd.bind(this), false);
        //   this.canvas.addEventListener("touchcancel", this.handleCancel, false);
        this.canvas.addEventListener("touchmove", this.handleMove.bind(this), false);
    }

    // обработать > 2 пальцев
    handleStart(event) {
        // console.log('Tuch start');
        event.preventDefault()
        const touches = event.changedTouches[0];
        // const color = "#000000";

        const ctx = this.ctx;
        const canvas = this.canvas;

        const x = touches.clientX - canvas.offsetLeft; 
        const y = touches.clientY - canvas.offsetTop;
        
        const heightCanvas = this.config.height + this.config.marginTopMinimap + this.config.heightMiniMap;
        
        if ( heightCanvas > y && y > heightCanvas - this.config.heightMiniMap) {
            if (x > this.drawData.start && x < this.drawData.start + 10) {
                this.drawData.typeMove = 'first';
                // console.log("first");
            }
            if (x > this.drawData.end - 10 && x < this.drawData.end) {
                this.drawData.typeMove = 'end';
                // console.log("end");
            }
            if (x < this.drawData.end - 10 && x > this.drawData.start + 10) {
                this.drawData.typeMove = 'between';
                // console.log("between");
            }

            this.drawData.startMove = x;
            this.drawData.startBefore = this.config.start;
            this.drawData.endBefore = this.config.end;
            // console.log("Попал в игрик")
        }
    }

    handleEnd() {
        this.drawData.typeMove = false;
        this.drawData.startPoint = false;
        // console.log('Tuch end');
    }

    handleMove() {
        event.preventDefault()
        const typeMove = this.drawData.typeMove; 
        if (!typeMove) {
            return ;
        }

        const touches = event.changedTouches[0];
        const ctx = this.ctx;
        const canvas = this.canvas;
        const coefNormal = this.drawData.coefNormal;

        const x = touches.clientX - canvas.offsetLeft;
        
        const heightCanvas = this.config.height + this.config.marginTopMinimap + this.config.heightMiniMap;
        
        if (typeMove === 'first') {
            this.config.start = x / coefNormal;
            // console.log("Move first");
        }
        if (typeMove === 'end') {
            this.config.end = x / coefNormal;
            // console.log("Move end");
        }
        if (typeMove === 'between') {
            const diff = this.drawData.startMove - x;
            // console.log(diff);
            const start = this.drawData.startBefore - (diff / coefNormal);
            const end = this.drawData.endBefore - (diff / coefNormal);
            this.setStart(start);
            this.setEnd(end);
            // console.log("Move between");
        }

        this.redrawing();
    }

    draw() {
        const div = document.querySelector('.chart-wrapper');
        div.appendChild(this.canvas);
        this.config.wrapperWidth = Number(div.clientWidth);

        this.redrawing();
    }

    redrawing() {
        const canvas = this.canvas;
        
        canvas.width = this.config.wrapperWidth;
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
        if (value < config.start) {
            throw 'End smaller then start'
        }
        config.end = Number(value);
        this.redrawing();
    }

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

    getParamsChart() {
        const x = this.x;
        const wrapperWidth = this.config.wrapperWidth;
        const lastX = x[x.length - 1];
        const coefNormal = wrapperWidth / lastX
        const start = this.config.start * coefNormal;
        const end = this.config.end * coefNormal;
        const gap = end - start;
        const last = lastX * coefNormal;
        const wrapperHeigth = this.config.height - this.config.height/2/this.config.rows; //вычисление высоты графика

        this.drawData.coefNormal = coefNormal;

        const xToWindowWidth = this.normalize(x, wrapperWidth);
        const xs = xToWindowWidth.map(x => (x - start) * last / gap);
        
        // поправить баг с округлением
        const startPoint = xs.findIndex(point =>  point >= 0);
        const endPoint = xs.findIndex(point => point >= wrapperWidth) - 1;

        const y = this.y;
        const currentYs = y.slice(startPoint, endPoint + 1);

        // calc boundary points
        const beforePoint = {
            y: y[startPoint - 1],
            x: xs[startPoint - 1]
        };

        const firstPoint = {
            y: y[startPoint],
            x: xs[startPoint]
        }
        
        const lastPoint = {
            y: y[endPoint],
            x: xs[endPoint]
        }

        const afterPoint = {
            y: y[endPoint + 1],
            x: xs[endPoint + 1]
        }

        const frontPoint =  (firstPoint.x*beforePoint.y - beforePoint.x*firstPoint.y) / (firstPoint.x - beforePoint.x);
        const backPoint =  ((afterPoint.y - lastPoint.y)*wrapperWidth + (afterPoint.x*lastPoint.y - lastPoint.x*afterPoint.y)) / (afterPoint.x - lastPoint.x);

        // calc y points
        const yScale = this.config.heightChart;
        const arrMax = Math.max(...currentYs, frontPoint, backPoint);
        const arrMin = Math.min(...currentYs, frontPoint, backPoint);

        const ys = this.normalize(y, yScale, arrMin, arrMax).map(value => wrapperHeigth - value); 

        this.drawData.start = start;
        this.drawData.end = end;
        this.drawData.chart = {
            xs: xs,
            ys: ys
        }

        return this.drawData.chart;
    }

    drawMiniMap() {
        const ctx = this.ctx;
        const miniMap = this.getParamsMiniMap();
        const xPoints = miniMap.xs;
        const marginTop = this.config.marginTopMinimap + this.config.height;
        const yPoints = miniMap.ys.map(value => value + marginTop);

        // draw mask
        {
            const x1 = this.drawData.start,
                x2 = this.drawData.end,
                y1 = marginTop,
                y2 = this.config.heightMiniMap + marginTop,
                colorFrame = "rgb(221,234,234)";

            ctx.beginPath();

            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2, y1);
            
            ctx.moveTo(x2 - 10, y1 + 2);
            ctx.lineTo(x2 - 10, y2 - 2);
            ctx.lineTo(x1 + 10, y2 - 2);
            ctx.lineTo(x1 + 10, y1 + 2);

            ctx.fillStyle = colorFrame;
            ctx.strokeStyle = colorFrame;
            ctx.fill();
            ctx.closePath();        
    
        }

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
              color = "rgba(199,222,233,0.2)";
        
        ctx.beginPath();

        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y2);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, y1);

        ctx.moveTo(this.drawData.end, y1 + 2);
        ctx.lineTo(this.drawData.end, y2 - 2);
        ctx.lineTo(this.drawData.start, y2 - 2);
        ctx.lineTo(this.drawData.start, y1 + 2);

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
        // let posColumn = 0;
        // for (let i = 0; i < 20; i++) {
        //     ctx.moveTo(posColumn, 0);
        //     ctx.lineTo(posColumn, this.config.height);
        //     posColumn += 25;
        // }
        
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
        const heightMiniMap = this.config.heightMiniMap;

        const xsMiniMap = this.normalize(originalXs, xChartScale);
        const ysMiniMap = this.normalize(originalYs, yChartScale).map(value => heightMiniMap - value);

        this.drawData.allPoints = originalXs.length;
        this.drawData.miniMap = {
            xs: xsMiniMap,
            ys: ysMiniMap
        }
        
        return this.drawData.miniMap;
    }

    normalize(arr, param, min = Math.min(...arr), max = Math.max(...arr)) {
        const arrDif = max - min;
        const arrCoe = param / arrDif;
        let points = arr.map(point => (point - min) * arrCoe);

        return points;
    }
}

export default Chart;

// console.clear();
// console.log("startPoint: " + startPoint);
// console.log("endPoint: " + endPoint);
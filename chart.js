class Chart {
    constructor(data) {
        this.y = data.columns[1].slice(1);

        const columnsArr = data.columns.map(column => {
            const head = column.shift();
            return [head, column];
        })
        const columnsMap = new Map(columnsArr);

        const x = columnsMap.get("x");
        columnsMap.delete("x");
        const y = columnsMap;

        this.config = {
            start: 1034341360222.1167,
            end: 1355733117857.9006,
            height: 400,
            rows: 6,
            gap: 0.5,
            marginTopMinimap: 20,
            heightMiniMap: 60,
            xMax:x[x.length -1] - 1,
            xMin: 1,
            x: x,
            y: y,
            mode: 'nightMode',
            nightMode: {
                background: 'rgb(36,47,62)',
                color: '#FFF',
                colorFrame: 'rgb(64,86,107)',
                colorFilter: "rgba(10,10,10,0.2)",
                text: "Swith to Day Mode"
            },
            dayMode: {
                background: '#FFF',
                color: '#000',
                colorFrame: 'rgb(221,234,234)',
                colorFilter: "rgba(199,222,233,0.2)",
                text: "Swith to Night Mode"
            },
            get modeValues() {
                return this[this.mode]
            },
            get heightRow() {
                return this.height / (this.rows - this.gap)
            },
            get heightChart() {
                return this.height * (this.rows - this.gap) / this.rows
            }
        }
        
        this.data = data;
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
        this.canvas.addEventListener("touchmove", this.handleMove.bind(this), false);

        // Тестирование с мышью
        this.canvas.addEventListener("mousedown", this.handleStart.bind(this), false);
        this.canvas.addEventListener("mouseup", this.handleEnd.bind(this), false);
        this.canvas.addEventListener("mousemove", this.handleMove.bind(this), false);

        // create button toggle mode
        this.toggleModeButton = document.createElement('button');
        this.toggleModeButton.classList.add('toggleModeButton');
        this.toggleModeButton.addEventListener("click", () => {
            this.config.mode = this.config.mode === "nightMode" ? "dayMode": "nightMode";
            this.redrawing();
        })

        this.header = document.createElement('h2');
        this.header.classList.add('canvasHead');
        this.header.innerText = "Followers";
    }

    // обработать > 2 пальцев
    handleStart(event) {
        // console.log('Tuch start');
        event.preventDefault()
        const touches = event.changedTouches && event.changedTouches[0] || event;

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

        const touches = event.changedTouches && event.changedTouches[0] || event;
        const canvas = this.canvas;
        const coefNormal = this.drawData.coefNormal;

        const x = touches.clientX - canvas.offsetLeft;
        
        if (typeMove === 'first') {
            this.setStart(x / coefNormal);
            // console.log("Move first");
        }
        if (typeMove === 'end') {
            this.setEnd(x / coefNormal);
            // console.log("Move end");
        }
        if (typeMove === 'between') {
            const config = this.config;
            const diff = this.drawData.startMove - x;

            let start = this.drawData.startBefore - (diff / coefNormal);
            let end = this.drawData.endBefore - (diff / coefNormal);

            const lahe = this.drawData.endBefore - this.drawData.startBefore;

            if (start < config.xMin) {
                start = config.xMin;
                end = config.xMin + lahe;
            }
            
            if (end > config.xMax) {
                start = config.xMax - lahe;
                end = config.xMax;
            }

            this.setStart(start);
            this.setEnd(end);
            
            // console.log("Move between");
        }

        this.redrawing();
    }

    draw() {
        const div = document.querySelector('.chart-wrapper');
        div.appendChild(this.header);
        div.appendChild(this.canvas);
        div.appendChild(this.toggleModeButton);
        this.drawData.wrapperWidth = Number(div.clientWidth);
        
        this.redrawing();
    }

    redrawing() {
        const canvas = this.canvas;
        
        document.body.style.background = this.config.modeValues.background;
        this.header.style.color = this.config.modeValues.color;
        this.toggleModeButton.innerText = this.config.modeValues.text;

        canvas.width = this.drawData.wrapperWidth;
        canvas.height = this.config.height + this.config.heightMiniMap + this.config.marginTopMinimap;

        this.drawGrid();
        this.drawCharts();
        this.drawMiniMap();
    }

    setStart(value) {
        const config = this.config;
        if (value > config.end) {
            config.start = config.end - 1;
            this.redrawing();
        } else if (value >= config.xMin) {
            config.start = Number(value);
            this.redrawing();
        } else if (value !== config.xMin) {
            config.start = config.xMin;
            this.redrawing();
        }
    }

    setEnd(value) {
        const config = this.config;
        if (value < config.start) {
            config.end = config.start + 1;
            this.redrawing();
        } else if (value <= config.xMax) {
            config.end = Number(value);
            this.redrawing();
        } else if (value !== config.xMax){
            config.end = config.xMax;
            this.redrawing();
        }
    }

    drawCharts() {
        const xPoints = this.getXChart();

        const wrapperHeigth = this.config.height - this.config.height/2/this.config.rows; //вычисление высоты графика
        const yScale = this.config.heightChart;
        const yCharts = this.getYCharts(xPoints, wrapperHeigth, yScale);

        yCharts.forEach(yChart => {
            this.drawChart(xPoints, yChart.yPoints, yChart.color);
        });
    }

    drawChart(xPoints, yPoints, color) {
        const ctx = this.ctx;
        
        ctx.beginPath();
        ctx.moveTo(xPoints[0], yPoints[0]);
        for (let i = 0; i < xPoints.length; i++) {
            ctx.lineTo(xPoints[i],yPoints[i]);
        }
        ctx.strokeStyle = color;
        ctx.lineJoin = "round";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
    } 

    getXChart() {
        const x = this.config.x;
        const wrapperWidth = this.drawData.wrapperWidth;
        const lastX = x[x.length - 1];
        const coefNormal = wrapperWidth / lastX
        const start = this.config.start * coefNormal;
        const end = this.config.end * coefNormal;
        const gap = end - start;
        const last = lastX * coefNormal;
        
        this.drawData.coefNormal = coefNormal;

        const xToWindowWidth = this.normalize(x, wrapperWidth);
        const xs = xToWindowWidth.map(x => (x - start) * last / gap);

        this.drawData.start = start;
        this.drawData.end = end;
        this.drawData.xs = xs;
        return xs;
    }

    getYCharts(xs, wrapperHeigth ,yScale, condition) {
        let min = 1000000000;
        let max = 0;
        const ys = this.config.y;

        ys.forEach(value => {
            const params = this.getYChart(xs, value, condition);

            min = Math.min(params.min, min) 
            max = Math.max(params.max, max) 
        });

        const newMap = new Map()
        ys.forEach((y, i) => {
            const yPoints = this.normalize(y, yScale, min, max).map(value => wrapperHeigth - value);
            const color = this.data.colors[i];
            
            const result = {
                yPoints: yPoints,
                color: color
            } 

            newMap.set(i,result)
        })
        
        return newMap;
    }

    getYChart(xs, y, condition) {
        const wrapperWidth = this.drawData.wrapperWidth;

        // поправить баг с округлением
        const startPoint = xs.findIndex(point =>  point >= 0);
        const endPoint = xs.findIndex(point => point >= wrapperWidth) - 1;

        const currentYs = y.slice(startPoint, endPoint + 1);

        // calc boundary points
        if (!condition) {
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
    
            currentYs.push(frontPoint, backPoint)
        }
        
        // calc y points
        const arrMax = Math.max(...currentYs);
        const arrMin = Math.min(...currentYs);

        return {
            max: arrMax,
            min: arrMin
        };
    }

    drawMiniMap() {
        const ctx = this.ctx;
        const miniMap = this.getParamsMiniMap();
        const marginTop = this.config.marginTopMinimap + this.config.height;
        const xPoints = miniMap.xs;
        const yPoints = miniMap.ys;

        // draw mask
        {
            const x1 = this.drawData.start,
                x2 = this.drawData.end,
                y1 = marginTop,
                y2 = this.config.heightMiniMap + marginTop,
                colorFrame = this.config.modeValues.colorFrame;

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
        
        yPoints.forEach(yChart => {
            ctx.beginPath();
            ctx.moveTo(xPoints[0], yChart.yPoints[0]);
            for (let i = 1; i < this.drawData.countAllPoints; i++) {
                ctx.lineTo(xPoints[i],yChart.yPoints[i]);
            }
            ctx.strokeStyle = yChart.color;
            ctx.lineJoin = "round";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        });



        // draw mask
        {
            const x1 = 0,
                x2 = this.drawData.wrapperWidth,
                y1 = marginTop,
                y2 = this.config.heightMiniMap + marginTop,
                color = this.config.modeValues.colorFilter;
            
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
        }
    }

    drawGrid () {
        const ctx = this.ctx;
        const heightRow = this.config.heightRow;
        let posRow = heightRow / 2;

        ctx.beginPath();
        for (let i = 0; i < this.config.rows; i++) {
            ctx.moveTo(0, posRow);
            ctx.lineTo(this.drawData.wrapperWidth, posRow);
            posRow += heightRow;
        }
        
        ctx.strokeStyle = '#bbb'; //eee
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    }

    getParamsMiniMap() {
        const originalXs = this.config.x;
        const xChartScale = this.drawData.wrapperWidth;
        const xsMiniMap = this.normalize(originalXs, xChartScale);

        const marginTop = this.config.marginTopMinimap + this.config.height;
        const heightMiniMap = this.config.heightMiniMap + marginTop;
        const yChartScale = this.config.heightMiniMap;
        const ysMiniMap = this.getYCharts(xsMiniMap, heightMiniMap, yChartScale, true)

        this.drawData.countAllPoints = originalXs.length;
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

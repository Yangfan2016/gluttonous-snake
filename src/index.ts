interface iCircle {
    rx: number,
    ry: number,
    r: number,
    start: number,
    end: number,
    dir?: boolean,
}

class SnakeGame {
    timer: any
    cellWidth: number
    cellNum: number
    gridWidth: number
    circleRadius: number
    flag: number[][] // 占位坐标 (10,10,290,290)
    ctx: CanvasRenderingContext2D
    cx: number
    cy: number
    ax: number
    ay: number
    arrX: number[]
    arrY: number[]
    snake_len: number
    fps: number
    score: number
    count: number
    arrScore: number[]
    maxScore: number
    setScore: Function
    setMaxScore: Function
    constructor(canvas: HTMLCanvasElement, {
        setScore,
        setMaxScore,
    }) {
        // init
        this.ctx = canvas.getContext("2d");
        this.cellWidth = 10;
        this.timer = null;

        let VW = ~~canvas.width;
        // 凑整数 10的倍数
        if (VW % this.cellWidth !== 0) {
            VW = VW - VW % this.cellWidth;
            canvas.width = VW;
            canvas.height = VW;
        }
        this.gridWidth = VW;
        this.cellNum = ~~(this.gridWidth / this.cellWidth);
        this.circleRadius = ~~(this.cellWidth / 2);

        this.flag = [];

        this.setScore = setScore;
        this.setMaxScore = setMaxScore;

        this.initFunc();
    }
    // 绘制 圆
    circle(ctx: CanvasRenderingContext2D, data: iCircle, s_style: string, f_style: string): void {
        ctx.save();
        ctx.beginPath();
        ctx.arc(data.rx, data.ry, data.r, data.start, data.end, data.dir);
        ctx.fillStyle = f_style || "#fff";
        ctx.strokeStyle = s_style || "#666";
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
    // 绘制 坐标图
    coord(): void {
        this.ctx.beginPath();
        for (let i = 0; i <= this.cellNum; i++) {
            this.ctx.moveTo(0, i * this.cellWidth);
            this.ctx.lineTo(this.gridWidth, i * this.cellWidth);
            this.ctx.strokeStyle = "transparent";
        }
        this.ctx.stroke();
        this.ctx.beginPath();
        for (let j = 0; j <= this.cellNum; j++) {
            this.ctx.moveTo(j * this.cellWidth, 0);
            this.ctx.lineTo(j * this.cellWidth, this.gridWidth);
            this.ctx.strokeStyle = "transparent";
        }
        this.ctx.stroke();
    }
    // 存储 占位坐标数据
    coordLabel(cx: number, cy: number, arrX: number[], arrY: number[]): void {
        // 清空所有数据，初始化
        for (let i = 0; i <= this.gridWidth; i += this.cellWidth) {
            this.flag[i] = [];
            for (let j = 0; j <= this.gridWidth; j += this.cellWidth) {
                this.flag[i][j] = 0;
            }
        }
        // 设置蛇头的占位标志为-1
        this.flag[cx][cy] = -1;
        // 设置蛇身的占位坐标标志为1
        for (let k = 0, len = arrX.length; k < len; k++) {
            this.flag[(+arrX[k])][(+arrY[k])] = 1;
        }
    }
    // 生成 随机苹果坐标
    madeRandomCoord() {
        return ~~(Math.random() * (this.cellNum - 1) + 1) * this.cellWidth;
    }
    // 边界 碰撞检测
    isStop(cx: number, cy: number): boolean {
        let stop = false;
        if (cx >= this.gridWidth || cy >= this.gridWidth || cx <= this.cellWidth >> 1 || cy <= this.cellWidth >> 1) {
            stop = true;
        }
        return stop;
    }
    // 绘制 蛇
    drawSnake(cx: number, cy: number, len: number): void {
        // 蛇头
        this.circle(this.ctx, {
            rx: cx,
            ry: cy,
            r: this.circleRadius,
            start: 0,
            end: 2 * Math.PI,
        }, "transparent", "#26f");
        // 蛇身
        for (let i = len - 1; i >= 0; i--) {
            this.circle(this.ctx, {
                rx: this.arrX[i],
                ry: this.arrY[i],
                r: this.circleRadius,
                start: 0,
                end: 2 * Math.PI,
            }, "transparent", '#0c3');
        }
    }
    // 绘制苹果
    drawApple(ax: number, ay: number): void {
        this.circle(this.ctx, {
            rx: ax,
            ry: ay,
            r: this.circleRadius,
            start: 0,
            end: 2 * Math.PI,
        }, "transparent", "#f20");
    }
    // 运动 转换方向
    moveByDir(dir: string): void {
        let strageMode = {
            L: () => {
                this.cx = this.cx - this.cellWidth; this.cy = this.cy;
            },
            T: () => {
                this.cx = this.cx; this.cy = this.cy - this.cellWidth;
            },
            R: () => {
                this.cx = this.cx + this.cellWidth; this.cy = this.cy;
            },
            D: () => {
                this.cx = this.cx; this.cy = this.cy + this.cellWidth;
            },
        };
        strageMode[dir]();
    }
    // 操作
    startToMove(dir: string): void {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.changeToDir(dir);
        }, 1000 / this.fps);
    }
    // 向左
    goLeft() {
        this.startToMove("L");
    }
    // 向上
    goTop() {
        this.startToMove("T");
    }
    // 向右
    goRight() {
        this.startToMove("R");
    }
    // 向下
    goDown() {
        this.startToMove("D");
    }
    // 页面初始化
    initFunc(): void {
        clearInterval(this.timer);

        this.snake_len = 2;
        this.fps = 6;
        this.cx = 3 * this.cellWidth;
        this.cy = this.gridWidth - this.cx;
        this.arrX = [];
        this.arrY = [];
        this.score = 0;
        this.count = 0;
        this.arrScore = [];
        this.maxScore = 0;

        // 队列数据初始化
        for (let i = 0, len = this.snake_len; i < len; i++) {
            this.arrX.push(this.cx);
            this.arrY.push((this.cy + this.cellWidth * this.snake_len) - this.cellWidth * i); // [260,250]
        }

        // 页面初始化
        this.ctx.clearRect(0, 0, this.gridWidth, this.gridWidth);
        this.coord();
        this.drawSnake(this.cx, this.cy, this.snake_len);
        this.coordLabel(this.cx, this.cy, this.arrX, this.arrY);
        // 生成苹果
        this.ax = this.madeRandomCoord();
        this.ay = this.madeRandomCoord();
        while (this.flag[this.ax][this.ay] === 1) {
            this.ax = this.madeRandomCoord();
            this.ay = this.madeRandomCoord();
        }
        this.drawApple(this.ax, this.ay);
        this.setScore(this.score);
    }
    // 主函数
    changeToDir(dir: string): void {
        // 页面初始化
        this.ctx.clearRect(0, 0, this.gridWidth, this.gridWidth);
        this.coord();
        this.drawApple(this.ax, this.ay);
        // 撞墙检测
        if (this.isStop(this.cx, this.cy)) {
            clearInterval(this.timer);
            alert(`Game Over!!!\n本次得分：${this.score}\n最高分：${this.maxScore}`);
            this.initFunc();
            return;
        }
        // 绘制蛇
        this.drawSnake(this.cx, this.cy, this.snake_len);
        // 存储数据 队列 先进先出
        this.arrX.push(this.cx);
        this.arrX.shift();
        this.arrY.push(this.cy); // 入队   [260,250,240*]   [250,240,230*]
        this.arrY.shift(); // 出队	 [250,240]       [240,230]   
        // 执行运动语句
        this.moveByDir(dir);    // 230   220
        // 吃苹果
        if (this.cx === this.ax && this.cy === this.ay) {
            // 计算得分及最高分
            this.count++;
            this.score = this.count * 100;
            this.arrScore.push(this.score);
            this.maxScore = Math.max.apply(null, this.arrScore);
            this.setScore(this.score);
            this.setMaxScore(this.maxScore);
            // 增加游戏难度
            if (this.count % 5 === 0) {
                this.fps = this.fps + 1;
                // 重新生成苹果坐标
                this.ax = this.madeRandomCoord();
                this.ay = this.madeRandomCoord();
                while (this.flag[this.ax][this.ay] === 1) {
                    this.ax = this.madeRandomCoord();
                    this.ay = this.madeRandomCoord();
                }
            } else {
                // 重新生成苹果坐标
                this.ax = this.madeRandomCoord();
                this.ay = this.madeRandomCoord();
                while (this.flag[this.ax][this.ay] === 1) {
                    this.ax = this.madeRandomCoord();
                    this.ay = this.madeRandomCoord();
                }
            }

            this.drawApple(this.ax, this.ay);
            // 蛇身增长一节
            this.snake_len += 1;
            this.arrX.push(this.cx); // 入队
            this.arrY.push(this.cy);
        }
        // 记录蛇的占位坐标
        this.coordLabel(this.cx, this.cy, this.arrX, this.arrY);
        // 撞到自己身体检测
        for (let m = 0, len = this.arrX.length - 1; m < len; m++) {
            if (this.cx === this.arrX[m] && this.cy === this.arrY[m]) {
                clearInterval(this.timer);
                alert('蛇撞到自己了');
                this.initFunc();
            }
        }
    }
}

export default SnakeGame;

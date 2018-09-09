/**
 * 绘制圆
 * @param {CanvasRenderingContext2D} ctx 
 * @param {object} data {rx,ry,r,start,end,dir}
 * @param {string} s_style 
 * @param {string} f_style 
 */
function circle(ctx, data, s_style, f_style) {
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

function init() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var btnReset = document.getElementById("reset");
    var labGet = document.getElementById("get_score");
    var labMax = document.getElementById("max_score");

    canvas.width = 300;
    canvas.height = 300;
    // 坐标
    function coord() {
        ctx.beginPath();
        for (var i = 0; i < 31; i++) {
            ctx.moveTo(0, i * 10);
            ctx.lineTo(300, i * 10);
            ctx.strokeStyle = "#333";
        }
        ctx.stroke();
        ctx.beginPath();
        for (var j = 0; j < 31; j++) {
            ctx.moveTo(j * 10, 0);
            ctx.lineTo(j * 10, 300);
            ctx.strokeStyle = "#333";
        }
        ctx.stroke();
    }
    // 占位坐标 (10,10,290,290)
    var flag = [];
    /**
     * 
     * @param {number} cx 
     * @param {number} cy 
     * @param {number} arrX 
     * @param {number} arrY 
     */
    function coordLabel(cx, cy, arrX, arrY) {
        // 清空所有数据，初始化
        for (var i = 0; i < 300; i++) {
            flag[i] = [];
            for (var j = 0; j < 300; j++) {
                flag[i][j] = 0;
            }
        }
        // 设置蛇头的占位标志为-1
        flag[cx][cy] = -1;
        // 设置蛇身的占位坐标标志为1
        for (var k = 0, len = arrX.length; k < len; k++) {
            flag[(+arrX[k])][(+arrY[k])] = 1;
        }
    }
    /**
     * 碰撞检测
     * @param {number} cx 
     * @param {number} cy 
     */
    function isStop(cx, cy) {
        var stop = false;
        if (cx >= 297 || cy >= 297 || cx <= 3 || cy <= 3) {
            stop = true;
        }
        return stop;
    }
    /**
     * 绘制蛇
     * @param {number} cx 
     * @param {number} cy 
     * @param {number} len 
     */
    function drawSnake(cx, cy, len) {
        // 蛇头
        circle(ctx, {
            rx: cx,
            ry: cy,
            r: 5,
            start: 0,
            end: 2 * Math.PI,
        }, "#333", "#26f");
        // 蛇身
        for (var i = len - 1; i >= 0; i--) {
            circle(ctx, {
                rx: arrX[i],
                ry: arrY[i],
                r: 5,
                start: 0,
                end: 2 * Math.PI,
            }, "#333", '#0c3');
        }
    }
    /**
     * 绘制苹果
     * @param {number} ax 
     * @param {number} ay 
     */
    function drawApple(ax, ay) {
        circle(ctx, {
            rx: ax,
            ry: ay,
            r: 5,
            start: 0,
            end: 2 * Math.PI,
        }, "#333", "#f20");
    }

    var cx = 60;
    var cy = 240;
    var arrX = [];
    var arrY = [];
    var snake_len = (3 - 1);
    var timer;
    var fps = 6;
    var score = 0;
    var count = 0;
    var arrScore = [];
    var maxScore = 0;
    labGet.innerHTML = score + '分';
    labMax.innerHTML = maxScore + '分';
    // 队列数据初始化
    for (var i = 0, len = snake_len; i < len; i++) {
        arrX.push(60);
        arrY.push(260 - 10 * i); // [260,250]
    }
    // 页面初始化
    coord();
    drawSnake(cx, cy, 2);
    coordLabel(cx, cy, arrX, arrY);
    // 生成苹果
    var ax = Math.floor(Math.random() * 270 + 10);
    var ay = Math.floor(Math.random() * 270 + 10);
    while (flag[ax][ay] === 1) {
        ax = Math.floor(Math.random() * 270 + 10);
        ay = Math.floor(Math.random() * 270 + 10);
    }
    drawApple(ax, ay);
    // 页面初始化
    function initFunc() {
        cx = 60;
        cy = 240;
        fps = 6;
        snake_len = (3 - 1);
        arrX = [];
        arrY = [];
        for (var i = 0, len = snake_len; i < len; i++) {
            arrX.push(60);
            arrY.push(260 - 10 * i);  // [260,250]
        }
        score = 0;
        count = 0;
        labGet.innerHTML = score + '分';
        ctx.clearRect(0, 0, 300, 300);
        coord();
        drawSnake(cx, cy, snake_len);
        drawApple(ax, ay);
    }
    // 主函数
    function mainFunc(strExc) {
        // 页面初始化
        ctx.clearRect(0, 0, 300, 300);
        coord();
        drawApple(ax, ay);
        // 撞墙检测
        if (isStop(cx, cy)) {
            clearInterval(timer);
            alert("Game Over!!!");
            initFunc();
            return;
        }
        // 绘制蛇
        drawSnake(cx, cy, snake_len);
        // 存储数据 队列 先进先出
        arrX.push(cx);
        arrX.shift();
        arrY.push(cy); // 入队   [260,250,240*]   [250,240,230*]
        arrY.shift(); // 出队	 [250,240]       [240,230]   
        // 执行运动语句
        eval(strExc);    // 230   220
        // 吃苹果
        if (Math.abs(cx - ax) <= 7 && Math.abs(cy - ay) <= 7) {
            // 计算得分及最高分
            count++;
            score = count * 100;
            arrScore.push(score);
            maxScore = Math.max.apply(null, arrScore);
            labGet.innerHTML = score + '分';
            labMax.innerHTML = maxScore + '分';
            // 增加游戏难度
            if (count % 5 === 0) {
                fps = fps + 1;
                // 重新生成苹果坐标
                ax = Math.floor(Math.random() * 20) + 260;
                ay = Math.floor(Math.random() * 20) + 260;
                while (flag[ax][ay] === 1) {
                    ax = Math.floor(Math.random() * 20) + 260;
                    ay = Math.floor(Math.random() * 20) + 260;
                }
            } else {
                // 重新生成苹果坐标
                ax = Math.floor(Math.random() * 270 + 10);
                ay = Math.floor(Math.random() * 270 + 10);
                while (flag[ax][ay] === 1) {
                    ax = Math.floor(Math.random() * 270 + 10);
                    ay = Math.floor(Math.random() * 270 + 10);
                }
            }

            drawApple(ax, ay);
            // 蛇身增长一节
            snake_len += 1;
            arrX.push(cx); // 入队
            arrY.push(cy);
        }
        // 记录蛇的占位坐标
        coordLabel(cx, cy, arrX, arrY);
        // 幢到自己身体检测
        for (var m = 0, len = arrX.length - 1; m < len; m++) {
            if (cx === arrX[m] && cy === arrY[m]) {
                clearInterval(timer);
                alert('蛇撞到自己了');
                initFunc();
            }
        }
    }

    //  用户操作UI
    document.onkeydown = function (ev) {
        var ev = ev ? ev : window.event;
        // 左
        if (ev.keyCode === 37) {
            clearInterval(timer);
            timer = setInterval(function () {
                mainFunc('cx=cx-10;cy=cy;');
            }, 1000 / fps);
        }
        // 上
        if (ev.keyCode === 38) {
            clearInterval(timer);
            timer = setInterval(function () {
                mainFunc('cx=cx;cy=cy-10;');
            }, 1000 / fps);
        }
        // 右
        if (ev.keyCode === 39) {
            clearInterval(timer);
            timer = setInterval(function () {
                mainFunc('cx=cx+10;cy=cy;');
            }, 1000 / fps);
        }
        // 下
        if (ev.keyCode === 40) {
            clearInterval(timer);
            timer = setInterval(function () {
                mainFunc('cx=cx;cy=cy+10;');
            }, 1000 / fps);
        }
    };

    // 重新开始
    btnReset.onclick = function () {
        clearInterval(timer);
        alert("Ready Go!!!");
        // 页面初始化
        initFunc();
        maxScore = 0;
        arrScore = [];
        labMax.innerHTML = maxScore + '分';
    };

}
window.addEventListener("load", init, false);

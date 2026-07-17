---
title: 连连看小游戏
date: 2025-05-28 17:11:51
description: 一个响应式的连连看小游戏，支持多种屏幕尺寸
keywords: 连连看, 小游戏, JavaScript, 响应式
---

# 🎮 连连看小游戏

欢迎来到连连看小游戏！这是一个完全响应式的连连看游戏，支持不同屏幕尺寸自动调整游戏板大小。

## 🎯 游戏规则

- 点击两个相同的图片方块进行配对
- 两个方块之间的连线不能超过两个转折点
- 消除所有方块即可获胜
- 支持随时重新开始游戏

## 🎲 开始游戏

<div id="lianliankan-game">
  <div class="game-controls">
    <button id="restart" type="button">🎮 新游戏</button>
    <button id="fullscreen-toggle" type="button" aria-pressed="false">⛶ 全屏游玩</button>
  </div>
  <div id="message"></div>
  <div id="game-container"></div>
</div>

<style>
/* 连连看游戏样式 */
#lianliankan-game {
  margin: 20px 0;
  text-align: center;
  width: 100%;
  overflow: hidden;
}

/* 声明全局CSS变量 */
#lianliankan-game {
  --block-size: 45px;
  --gap: 6px;
  --colors-count: 5;
}

#game-container {
  display: grid;
  gap: var(--gap);
  padding: var(--gap);
  background: #000000;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  margin: 20px auto;
  width: fit-content;
  height: fit-content;
  max-width: calc(100% - 40px);
  max-height: 70vh;
  overflow: auto;
  box-sizing: border-box;
}

.block {
  width: var(--block-size);
  height: var(--block-size);
  cursor: pointer;
  transition: all 0.2s ease;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 6px;
  border: 2px solid transparent;
}

.block:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.5);
}

.block.selected {
  transform: scale(0.9);
  box-shadow: 0 0 15px #00ff88;
  border-color: #00ff88;
}

.game-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

#restart,
#fullscreen-toggle {
  padding: 10px 20px;
  font-size: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  margin: 10px 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

#restart:hover,
#fullscreen-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

#restart:active,
#fullscreen-toggle:active {
  transform: translateY(0);
}

#message {
  font-size: clamp(16px, 3vw, 20px);
  color: #00ff88;
  height: 25px;
  margin: 10px;
  text-align: center;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

#lianliankan-game:fullscreen,
#lianliankan-game:-webkit-full-screen {
  width: 100%;
  height: 100%;
  min-height: 100%;
  margin: 0;
  padding: clamp(12px, 2vw, 24px);
  overflow: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #2d1b69 0%, #101026 48%, #050509 100%);
}

#lianliankan-game:fullscreen .game-controls,
#lianliankan-game:-webkit-full-screen .game-controls {
  flex: 0 0 auto;
}

#lianliankan-game:fullscreen #game-container,
#lianliankan-game:-webkit-full-screen #game-container {
  max-width: none;
  max-height: none;
  margin: 8px auto 0;
}

/* 响应式布局调整 */
@media (max-width: 1200px) {
  #lianliankan-game {
    --block-size: 40px;
    --gap: 5px;
  }
}

@media (max-width: 768px) {
  #lianliankan-game {
    --block-size: 35px;
    --gap: 4px;
  }
  
  #restart,
  #fullscreen-toggle {
    font-size: 12px;
    padding: 8px 16px;
  }
  
  #game-container {
    max-height: 60vh;
  }
}

@media (max-width: 480px) {
  #lianliankan-game {
    --block-size: 30px;
    --gap: 3px;
  }
  
  #restart,
  #fullscreen-toggle {
    font-size: 11px;
    padding: 6px 12px;
  }
  
  #message {
    font-size: 14px;
    height: 20px;
  }
  
  #game-container {
    max-height: 50vh;
    padding: 3px;
  }
}

/* 确保游戏容器在小屏幕上不会溢出 */
@media (max-width: 600px) {
  #game-container {
    max-width: 98vw;
  }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // 动态计算游戏板大小
  function calculateBoardSize() {
    const game = document.getElementById('lianliankan-game');
    const isFullscreen = document.fullscreenElement === game || document.webkitFullscreenElement === game;
    const gameStyles = getComputedStyle(game);
    const blockSize = parseInt(gameStyles.getPropertyValue('--block-size'));
    const gap = parseInt(gameStyles.getPropertyValue('--gap'));
    const containerWidth = isFullscreen ? window.innerWidth : (() => {
      const pageContainer = document.getElementById('page') || document.querySelector('.page') || document.querySelector('main') || document.querySelector('article');
      return pageContainer ? pageContainer.clientWidth : window.innerWidth * 0.8;
    })();
    const containerHeight = window.innerHeight;
    const controlsHeight = isFullscreen ? 92 : 100;
    const fullscreenPadding = Math.min(48, Math.max(24, window.innerWidth * 0.04));
    const horizontalPadding = isFullscreen ? fullscreenPadding : 80;
    const verticalPadding = isFullscreen ? fullscreenPadding : 100;
    const availableWidth = Math.max(blockSize + gap, containerWidth - horizontalPadding);
    const availableHeight = Math.max(blockSize + gap, (isFullscreen ? containerHeight : Math.min(containerHeight * 0.8, 800)) - verticalPadding - controlsHeight);
    const availableCols = Math.floor(availableWidth / (blockSize + gap));
    const availableRows = Math.floor(availableHeight / (blockSize + gap));

    if (isFullscreen) {
      const cols = Math.max(6, availableCols - (availableCols % 2));
      const rows = Math.max(8, availableRows - (availableRows % 2));

      return { cols, rows };
    }

    // 根据容器宽度调整最大列数和行数
    const maxCols = containerWidth >= 1000 ? 16 : // 大容器
                  containerWidth >= 800 ? 14 : // 中等容器
                  containerWidth >= 600 ? 12 : // 小容器
                  10; // 很小容器
    
    const maxRows = containerHeight >= 800 ? 16 : // 高屏幕，增加到16行
                   containerHeight >= 600 ? 14 : // 中等屏幕，增加到14行
                   12; // 小屏幕，增加到12行
    
    // 确保至少有一个合理的游戏大小，同时保持行列数为偶数
    const cols = Math.max(6, Math.min(availableCols, maxCols));
    const rows = Math.max(8, Math.min(availableRows, maxRows)); // 最小行数增加到8
    
    // 确保至少有100个球（50对）
    const totalBlocks = (cols - (cols % 2)) * (rows - (rows % 2));
    let finalCols = cols - (cols % 2);
    let finalRows = rows - (rows % 2);
    
    // 如果总数少于100，尝试增加行数
    if (totalBlocks < 100) {
      const minRows = Math.ceil(100 / finalCols);
      finalRows = Math.max(finalRows, minRows - (minRows % 2));
    }
    
    // 确保总方块数是偶数
    return {
      cols: finalCols,
      rows: finalRows
    };
  }

  // 常量配置
  let ROWS = 8;
  let COLS = 12;
  const IMGS_COUNT = 8;
  let BLOCK_SIZE = 45;

  // 全局变量
  let gameData = [];
  let selectedBlocks = [];
  let isProcessing = false;
  let fullscreenTransitionInProgress = false;
  let fullscreenResizeTimer = null;

  // 初始化游戏
  function initGame() {
    const size = calculateBoardSize();
    ROWS = size.rows;
    COLS = size.cols;
    BLOCK_SIZE = parseInt(getComputedStyle(document.querySelector('#lianliankan-game')).getPropertyValue('--block-size'));

    generateMatrix();
    drawBoard();
  }

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (isGameFullscreen() || fullscreenTransitionInProgress || fullscreenResizeTimer) return;

    setTimeout(() => {
      const size = calculateBoardSize();
      if (size.rows !== ROWS || size.cols !== COLS) {
        initGame();
      }
    }, 100);
  });

  function finishFullscreenTransition() {
    clearTimeout(fullscreenResizeTimer);
    fullscreenResizeTimer = setTimeout(() => {
      fullscreenTransitionInProgress = false;
      fullscreenResizeTimer = null;
    }, 200);
  }

  function redrawBoardForFullscreen() {
    const size = calculateBoardSize();
    ROWS = size.rows;
    COLS = size.cols;
    BLOCK_SIZE = parseInt(getComputedStyle(document.querySelector('#lianliankan-game')).getPropertyValue('--block-size'));
    generateMatrix();
    selectedBlocks = [];
    isProcessing = false;
    drawBoard();
  }

  // 开始新游戏，生成游戏数据
  function generateMatrix() {
    const totalBlocks = ROWS * COLS;
    const picPairs = Array.from(
      { length: totalBlocks / 2 },
      (_, i) => (i % IMGS_COUNT) + 1
    ).flatMap(pic => [pic, pic]);

    const shuffled = [...picPairs].sort(() => Math.random() - 0.5);
    gameData = Array.from({ length: ROWS }, (_, i) => 
      shuffled.slice(i * COLS, (i + 1) * COLS)
    );
  }

  // 绘制游戏面板
  function drawBoard() {
    const container = document.getElementById('game-container');
    const gap = parseInt(getComputedStyle(document.querySelector('#lianliankan-game')).getPropertyValue('--gap'));
    container.style.gridTemplateColumns = `repeat(${COLS}, ${BLOCK_SIZE}px)`;
    container.style.width = `${COLS * BLOCK_SIZE + Math.max(0, COLS - 1) * gap + gap * 2}px`;
    container.style.height = `${ROWS * BLOCK_SIZE + Math.max(0, ROWS - 1) * gap + gap * 2}px`;
    
    container.innerHTML = '';
    gameData.forEach((row, i) => {
      row.forEach((picNum, j) => {
        const block = document.createElement('div');
        block.className = 'block';
        block.style.backgroundImage = `url(/LianlianKan/imgs/${picNum}.jpg)`;
        block.dataset.row = i;
        block.dataset.col = j;
        block.addEventListener('click', handleBlockClick);
        container.appendChild(block);
      });
    });
  }

  // 处理方块点击
  function handleBlockClick(e) {
    if (isProcessing) return;
    
    const block = e.target;
    const row = parseInt(block.dataset.row);
    const col = parseInt(block.dataset.col);
    
    if (block.style.backgroundImage === 'none') return;

    block.classList.add('selected');
    selectedBlocks.push({ row, col, element: block });

    if (selectedBlocks.length === 2) {
      checkMatch();
      selectedBlocks.forEach(b => b.element.classList.remove('selected'));
      selectedBlocks = [];
    }
  }

  // 检查匹配
  function checkMatch() {
    const [a, b] = selectedBlocks;
    if (gameData[a.row][a.col] !== gameData[b.row][b.col]) return;
    if (checkPath(a, b)) {
      removeBlocks(a, b);
      checkWin();
    }
  }

  // 检查是否存在合法路径
  function checkPath(start, end) {
    if ((start.row === end.row && start.col === end.col) || 
        gameData[start.row][start.col] !== gameData[end.row][end.col]) {
      return false;
    }

    if (checkStraightLine(start, end)) {
      return true;
    }

    if (checkOneCorner(start, end)) {
      return true;
    }

    return checkTwoCorners(start, end);
  }
  
  // 直线检测
  function checkStraightLine(a, b) {
    if (a.row === b.row) {
      const minCol = Math.min(a.col, b.col);
      const maxCol = Math.max(a.col, b.col);
      for (let col = minCol + 1; col < maxCol; col++) {
        if (gameData[a.row][col] !== 0) return false;
      }
      return true;
    }

    if (a.col === b.col) {
      const minRow = Math.min(a.row, b.row);
      const maxRow = Math.max(a.row, b.row);
      for (let row = minRow + 1; row < maxRow; row++) {
        if (gameData[row][a.col] !== 0) return false;
      }
      return true;
    }

    return false;
  }
  
  // 单折线检测
  function checkOneCorner(a, b) {
    const corner1 = { row: a.row, col: b.col };
    if (gameData[corner1.row][corner1.col] === 0) {
      if (checkStraightLine(a, corner1) && checkStraightLine(corner1, b)) {
        return true;
      }
    }

    const corner2 = { row: b.row, col: a.col };
    if (gameData[corner2.row][corner2.col] === 0) {
      if (checkStraightLine(a, corner2) && checkStraightLine(corner2, b)) {
        return true;
      }
    }

    return false;
  }
  
  // 双折线检测
  function checkTwoCorners(a, b) {
    for (let col = 0; col < COLS; col++) {
      const corner1 = { row: a.row, col };
      const corner2 = { row: b.row, col };
      if (col !== a.col && gameData[a.row][col] === 0 && 
          gameData[b.row][col] === 0 &&
          checkStraightLine(a, corner1) &&
          checkStraightLine(corner1, corner2) &&
          checkStraightLine(corner2, b)
      ) {
        return true;
      }
    }
    
    for (let row = 0; row < ROWS; row++) {
      const corner1 = { row, col: a.col };
      const corner2 = { row, col: b.col };
      if (row !== a.row && gameData[row][a.col] === 0 && 
          gameData[row][b.col] === 0 &&
          checkStraightLine(a, corner1) &&
          checkStraightLine(corner1, corner2) &&
          checkStraightLine(corner2, b)
      ) {
        return true;
      }
    }

    return false;
  }
  
  // 移除方块
  function removeBlocks(...blocks) {
    isProcessing = true;
    blocks.forEach(b => {
      gameData[b.row][b.col] = 0;
      b.element.style.backgroundImage = 'none';
    });
    setTimeout(() => {
      isProcessing = false;
    }, 200);
  }

  // 检查胜利条件
  function checkWin() {
    if (gameData.flat().every(cell => cell === 0)) {
      showMessage('🎉 挑战成功！');
      setTimeout(initGame, 2000);
    }
  }

  // 显示提示信息
  function showMessage(text) {
    const msg = document.getElementById('message');
    msg.textContent = text;
    setTimeout(() => msg.textContent = '', 2000);
  }

  // 全屏模式
  const game = document.getElementById('lianliankan-game');
  const fullscreenToggle = document.getElementById('fullscreen-toggle');

  function isGameFullscreen() {
    return document.fullscreenElement === game || document.webkitFullscreenElement === game;
  }

  function syncFullscreenButton() {
    const isFullscreen = isGameFullscreen();
    fullscreenToggle.textContent = isFullscreen ? '⛶ 退出全屏' : '⛶ 全屏游玩';
    fullscreenToggle.setAttribute('aria-pressed', String(isFullscreen));
    redrawBoardForFullscreen();
    finishFullscreenTransition();
  }

  async function toggleFullscreen() {
    fullscreenTransitionInProgress = true;

    try {
      if (isGameFullscreen()) {
        const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
        if (exitFullscreen) await exitFullscreen.call(document);
      } else {
        const requestFullscreen = game.requestFullscreen || game.webkitRequestFullscreen;
        if (!requestFullscreen) {
          showMessage('当前浏览器不支持全屏模式');
          finishFullscreenTransition();
          return;
        }
        await requestFullscreen.call(game);
      }
    } catch (error) {
      console.warn('无法切换全屏模式：', error);
      showMessage('无法切换全屏模式');
      finishFullscreenTransition();
    }
  }

  // 初始化
  document.getElementById('restart').addEventListener('click', initGame);
  fullscreenToggle.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', syncFullscreenButton);
  document.addEventListener('webkitfullscreenchange', syncFullscreenButton);
  initGame();
});
</script>

---

## 🛠️ 技术特性

- **响应式设计**：自动适配不同屏幕尺寸
- **智能算法**：支持直线、单折线、双折线连接检测
- **流畅动画**：CSS3动画效果，提升用户体验
- **现代化UI**：渐变色彩和阴影效果

## 📱 兼容性

- 支持桌面端和移动端
- 兼容现代浏览器
- 自适应屏幕尺寸

享受游戏吧！🎮

// === WebXR Scrollbar 功能 ===
console.log("=== WebXR Scrollbar Initialize ===");

let isVRMode = false;
let xrSession = null;
let customScrollbar = null;
let scrollWrapper = null;
let isDragging = false;
let dragStartY = 0;
let scrollStartTop = 0;

// WebXR 初始化 - 在原本的 DOMContentLoaded 之後執行
window.addEventListener('load', function() {
    console.log("WebXR Page loaded");
    
    // 強制檢測並設置 Meta Quest 支持
    console.log("User Agent:", navigator.userAgent);
    
    // 更寬鬆的檢測條件
    if (isMetaQuestBrowser()) {
        console.log("Meta Quest Browser detected!");
        document.body.classList.add('meta-quest');
        setupScrollbar();
    } else {
        console.log("Not Meta Quest Browser - using default scrolling");
    }
});

// 檢測是否為 Meta Quest Browser - 更寬鬆的檢測
function isMetaQuestBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    console.log("檢測 User Agent:", userAgent);
    
    // 更多的檢測條件
    const conditions = [
        userAgent.includes('quest'),
        userAgent.includes('oculusbrowser'),
        userAgent.includes('meta'),
    ];
    
    const isQuest = conditions.some(condition => condition);
    console.log("檢測條件結果:", conditions);
    console.log("最終判定為 Meta Quest:", isQuest);
    
    return isQuest;
}

// 設置自定義滾動條 - 只在 Meta Quest 上執行
function setupScrollbar() {
    if (!isMetaQuestBrowser()) {
        console.log("Not Meta Quest - skipping custom scrollbar");
        return;
    }
    
    const contentWrapper = document.querySelector('#content-wrapper');
    scrollWrapper = document.querySelector('.simplebar-content-wrapper');
    
    if (!contentWrapper || !scrollWrapper) {
        console.error('Required elements not found');
        return;
    }
    
    // 創建自定義滾動條
    const scrollbarContainer = document.createElement('div');
    scrollbarContainer.className = 'custom-scrollbar';
    
    const track = document.createElement('div');
    track.className = 'scroll-track';
    
    const upArea = document.createElement('div');
    upArea.className = 'scroll-up-area';
    
    const downArea = document.createElement('div');
    downArea.className = 'scroll-down-area';
    
    const handle = document.createElement('div');
    handle.className = 'scroll-handle';
    
    scrollbarContainer.appendChild(track);
    scrollbarContainer.appendChild(upArea);
    scrollbarContainer.appendChild(downArea);
    scrollbarContainer.appendChild(handle);
    
    // 添加到 body 而不是 contentWrapper，確保在畫面最右邊
    document.body.appendChild(scrollbarContainer);
    
    customScrollbar = {
        container: scrollbarContainer,
        track: track,
        upArea: upArea,
        downArea: downArea,
        handle: handle
    };
    
    // 添加 Meta Quest 控制器事件
    upArea.addEventListener('click', scrollUp);
    downArea.addEventListener('click', scrollDown);
    
    // Quest 控制器拖拽
    handle.addEventListener('mousedown', startDrag);
    handle.addEventListener('touchstart', startDrag);
    handle.addEventListener('pointerdown', startDrag);
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('pointermove', handleDrag);
    
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('pointerup', endDrag);
    
    // 更新手柄位置
    scrollWrapper.addEventListener('scroll', updateHandlePosition);
    updateHandlePosition();
    
    // 更新滾動進度
    scrollWrapper.addEventListener('scroll', updateScrollProgress);
    
    console.log('Meta Quest custom scrollbar created');
}

// 滾動控制函數
function scrollUp() {
    if (!scrollWrapper || !isMetaQuestBrowser()) return;
    const scrollStep = 200;
    scrollWrapper.scrollTop = Math.max(0, scrollWrapper.scrollTop - scrollStep);
    console.log('Scroll up to:', scrollWrapper.scrollTop);
}

function scrollDown() {
    if (!scrollWrapper || !isMetaQuestBrowser()) return;
    const scrollStep = 200;
    const maxScroll = scrollWrapper.scrollHeight - scrollWrapper.clientHeight;
    scrollWrapper.scrollTop = Math.min(maxScroll, scrollWrapper.scrollTop + scrollStep);
    console.log('Scroll down to:', scrollWrapper.scrollTop);
}

// 滑鼠/控制器拖拽
function startDrag(e) {
    if (!isMetaQuestBrowser()) return;
    
    isDragging = true;
    dragStartY = e.clientY || (e.touches && e.touches[0].clientY) || e.pageY || 0;
    scrollStartTop = scrollWrapper.scrollTop;
    customScrollbar.handle.classList.add('active');
    e.preventDefault();
    console.log('Drag started at Y:', dragStartY);
}

function handleDrag(e) {
    if (!isDragging || !scrollWrapper) return;
    
    const currentY = e.clientY || (e.touches && e.touches[0].clientY) || e.pageY || 0;
    const deltaY = currentY - dragStartY;
    
    const maxScroll = scrollWrapper.scrollHeight - scrollWrapper.clientHeight;
    // 可拖拽區域高度：總高度 - 上箭頭(27px) - 下箭頭(27px) - 手柄高度(40px)
    const trackHeight = window.innerHeight - 27 - 27 - 40;
    const scrollRatio = maxScroll / trackHeight;
    
    const newScrollTop = Math.max(0, Math.min(maxScroll, scrollStartTop + deltaY * scrollRatio));
    scrollWrapper.scrollTop = newScrollTop;
    
    console.log(`Dragging: deltaY=${deltaY}, newScrollTop=${newScrollTop}`);
    e.preventDefault();
}

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    if (customScrollbar) {
        customScrollbar.handle.classList.remove('active');
    }
    console.log('Drag ended');
}

// 更新手柄位置 - 修正邊界問題
function updateHandlePosition() {
    if (!customScrollbar || !scrollWrapper) return;
    
    const scrollTop = scrollWrapper.scrollTop;
    const maxScroll = scrollWrapper.scrollHeight - scrollWrapper.clientHeight;
    
    // 可移動區域：從上箭頭下方到下箭頭上方，減去手柄本身高度
    const topBoundary = 27; // 上箭頭高度
    const bottomBoundary = window.innerHeight - 27; // 下箭頭位置
    const handleHeight = 40; // 手柄高度
    const availableHeight = bottomBoundary - topBoundary - handleHeight;
    
    if (maxScroll > 0) {
        const scrollRatio = scrollTop / maxScroll;
        const handleTop = topBoundary + scrollRatio * availableHeight;
        
        // 確保手柄不會超出邊界
        const finalTop = Math.max(topBoundary, Math.min(bottomBoundary - handleHeight, handleTop));
        customScrollbar.handle.style.top = finalTop + 'px';
        
        console.log(`Handle position: ${finalTop}px (scroll: ${scrollRatio * 100}%)`);
    } else {
        customScrollbar.handle.style.top = topBoundary + 'px';
    }
}

// 更新滾動進度
function updateScrollProgress() {
    if (!scrollWrapper) return;
    
    const documentHeight = scrollWrapper.scrollHeight;
    const scrollPosition = scrollWrapper.scrollTop + scrollWrapper.clientHeight;
    const scrollPercentage = (scrollPosition / documentHeight) * 100;
    
    const progressElement = document.getElementById('scroll-progress');
    if (progressElement) {
        progressElement.textContent = Math.round(scrollPercentage) + '%';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // 初始化 checkbox 樣式
    const agreeCheckbox = document.querySelector('.agree_checkbox');
    if (agreeCheckbox) {
        agreeCheckbox.style.setProperty("--custom-before-border", "solid 1px #ccc");
    }

    // 滾動檢測 - 啟用同意按鈕
    const contentElement = document.getElementById('content');
    if (contentElement) {
        contentElement.onscroll = (event) => {
            const heightOffset = 10;
            const scrollPosition = event.target.clientHeight + event.target.scrollTop + heightOffset;

            if (scrollPosition >= event.target.scrollHeight) {
                const agreeButton = document.querySelector("#agree");
                const agreeCheckbox = document.querySelector('.agree_checkbox');
                
                if (agreeButton) agreeButton.disabled = false;
                if (agreeCheckbox) {
                    agreeCheckbox.style.color = "black";
                    agreeCheckbox.style.setProperty("--custom-before-border", "solid 1px black");
                }
            }
        };
    }

    // checkbox 變更處理
    const agreeCheckBox = document.querySelector("#agree");
    if (agreeCheckBox) {
        agreeCheckBox.onchange = event => {
            checkOnchange();
        };
    }

    // 開始按鈕點擊處理
    const startButton = document.querySelector("#start");
    if (startButton) {
        startButton.onclick = event => {
            linkOnclicked();
        };
    }
});

function checkOnchange() {
    const agreeCheckbox = document.querySelector("#agree");
    const startButton = document.querySelector("#start");
    
    if (agreeCheckbox && startButton) {
        if (agreeCheckbox.checked) {
            startButton.disabled = false;
        } else {
            startButton.disabled = true;
        }
    }
}

function linkOnclicked() {
    var url = window.location.href;
    var lang = url.match(".+/(.+?)\.[a-z]+([\?#;].*)?$")[1];
    var tsVer = document.head.querySelector('[name=ts-ver][content]').content;
    var ppVer = document.head.querySelector('[name=pp-ver][content]').content;
    location.href = "?lang=" + lang + "&ts-ver=" + tsVer + "&pp-ver=" + ppVer;
}


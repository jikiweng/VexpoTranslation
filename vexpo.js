document.querySelector('.agree_checkbox').style.setProperty("--custom-before-border", "solid 1px #ccc");

document.getElementById('content').onscroll = (event) => {
    const heightOffset = 10;
    const scrollPosition = event.target.clientHeight + event.target.scrollTop + heightOffset;

    if (scrollPosition >= event.target.scrollHeight) {
        document.querySelector("#agree").disabled = false;
        document.querySelector('.agree_checkbox').style.color = "black";
        document.querySelector('.agree_checkbox').style.setProperty("--custom-before-border", "solid 1px black");
    }
}

function checkOnchange() {
    if (document.querySelector("#agree").checked) {
        document.querySelector("#start").disabled = false;
    } else {
        document.querySelector("#start").disabled = true;
    }
}

function linkOnclicked() {
    var url = window.location.href;
    var lang = url.match(".+/(.+?)\.[a-z]+([\?#;].*)?$")[1];
    var tsVer = document.head.querySelector('[name=ts-ver][content]').content;
    var ppVer = document.head.querySelector('[name=pp-ver][content]').content;
    location.href = "?lang=" + lang + "&ts-ver=" + tsVer + "&pp-ver=" + ppVer;
}

let url = window.location.href;
let lang = url.match(".+/(.+?)\.[a-z]+([\?#;].*)?$")[1];

let agreeCheckBox = document.querySelector("#agree");
agreeCheckBox.onchange = event => {
    checkOnchange();
};

let startButton = document.querySelector("#start");
startButton.onclick = event => {
    linkOnclicked();
};

//修正はここから
// 檢測 Meta Quest 瀏覽器並初始化特殊的滾動控制
if (/OculusBrowser|Quest|MetaQuest/i.test(navigator.userAgent)) {
    console.log("檢測到 Meta Quest Browser");
    
    // 等待 DOM 完全載入
    document.addEventListener('DOMContentLoaded', function() {
        initQuestScrolling();
    });
    
    // 如果 DOM 已經載入完成，直接初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuestScrolling);
    } else {
        initQuestScrolling();
    }
    
    function initQuestScrolling() {
        const contentElement = document.querySelector('#content-wrapper');
        if (!contentElement) {
            console.error("未找到 #content-wrapper");
            return;
        }
        
        // 初始化 SimpleBar
        const simpleBar = new SimpleBar(contentElement, {
            autoHide: false,
            forceEnabled: true,
            scrollbarMinSize: 80,
            scrollbarMaxSize: 80
        });
        
        console.log("SimpleBar 初始化完成");
        
        // 等待 SimpleBar 完全初始化
        setTimeout(() => {
            setupQuestControls(contentElement);
        }, 500);
    }
    
    function setupQuestControls(contentElement) {
        const scrollWrapper = contentElement.querySelector('.simplebar-content-wrapper');
        const track = contentElement.querySelector('.simplebar-track.simplebar-vertical');
        
        if (!track || !scrollWrapper) {
            console.error("未找到必要的滾動元素");
            return;
        }
        
        console.log("開始設置 Quest 控制");
        
        // 移除原有的 SimpleBar 滑塊，創建自定義的 VR 友好控制元件
        const originalScrollbar = track.querySelector('.simplebar-scrollbar');
        if (originalScrollbar) {
            originalScrollbar.style.display = 'none';
        }
        
        // 創建自定義的可點擊區域
        createScrollControls(track, scrollWrapper);
    }
    
    function createScrollControls(track, scrollWrapper) {
        // 清空軌道內容
        track.innerHTML = '';
        
        // 設置軌道為相對定位
        track.style.position = 'relative';
        track.style.width = '80px';
        track.style.height = '100%';
        
        // 創建三個區域：上箭頭、中間拖曳區、下箭頭
        const upButton = document.createElement('div');
        const middleArea = document.createElement('div');
        const downButton = document.createElement('div');
        const dragHandle = document.createElement('div');
        
        // 上箭頭按鈕樣式
        upButton.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 80px;
            background: url('https://i.postimg.cc/d065ncRf/2025-07-11-201925.png') no-repeat center;
            background-size: 100% 100%;
            cursor: pointer;
            z-index: 1001;
            border: 2px solid transparent;
        `;
        
        // 下箭頭按鈕樣式
        downButton.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 80px;
            background: url('https://i.postimg.cc/fWVh38Ds/2025-07-11-201948.png') no-repeat center;
            background-size: 100% 100%;
            cursor: pointer;
            z-index: 1001;
            border: 2px solid transparent;
        `;
        
        // 中間區域樣式
        middleArea.style.cssText = `
            position: absolute;
            top: 80px;
            left: 0;
            width: 100%;
            height: calc(100% - 160px);
            background: url('https://i.postimg.cc/hjJ3G3x3/2025-07-11-202015.png') repeat-y center;
            background-size: 100% auto;
            cursor: pointer;
            z-index: 1000;
        `;
        
        // 拖曳控制柄樣式
        dragHandle.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100px;
            background: url('https://i.postimg.cc/J43BmkcJ/botton.png') no-repeat center;
            background-size: 80% 50%;
            cursor: grab;
            z-index: 1002;
            border: 2px solid transparent;
            transition: border-color 0.2s;
        `;
        
        // 將元素添加到軌道
        track.appendChild(upButton);
        track.appendChild(middleArea);
        track.appendChild(downButton);
        middleArea.appendChild(dragHandle);
        
        // 添加 VR 控制器事件監聽
        addVREventListeners(upButton, downButton, dragHandle, middleArea, scrollWrapper);
        
        // 初始化拖曳柄位置
        updateHandlePosition(scrollWrapper, dragHandle, middleArea);
        
        // 監聽滾動事件以更新拖曳柄位置
        scrollWrapper.addEventListener('scroll', () => {
            updateHandlePosition(scrollWrapper, dragHandle, middleArea);
        });
        
        console.log("VR 滾動控制設置完成");
    }
    
    function addVREventListeners(upButton, downButton, dragHandle, middleArea, scrollWrapper) {
        const scrollStep = 50;
        
        // VR 控制器事件列表
        const vrEvents = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup'];
        
        // 上箭頭事件
        vrEvents.forEach(eventType => {
            upButton.addEventListener(eventType, function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (eventType === 'click' || eventType === 'mousedown' || eventType === 'touchstart' || eventType === 'pointerdown') {
                    scrollWrapper.scrollTop = Math.max(0, scrollWrapper.scrollTop - scrollStep);
                    console.log("上箭頭點擊 - 當前滾動位置:", scrollWrapper.scrollTop);
                    
                    // 視覺反饋
                    upButton.style.borderColor = '#007bff';
                    setTimeout(() => {
                        upButton.style.borderColor = 'transparent';
                    }, 200);
                }
            }, { passive: false });
        });
        
        // 下箭頭事件
        vrEvents.forEach(eventType => {
            downButton.addEventListener(eventType, function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (eventType === 'click' || eventType === 'mousedown' || eventType === 'touchstart' || eventType === 'pointerdown') {
                    const maxScroll = scrollWrapper.scrollHeight - scrollWrapper.clientHeight;
                    scrollWrapper.scrollTop = Math.min(maxScroll, scrollWrapper.scrollTop + scrollStep);
                    console.log("下箭頭點擊 - 當前滾動位置:", scrollWrapper.scrollTop);
                    
                    // 視覺反饋
                    downButton.style.borderColor = '#007bff';
                    setTimeout(() => {
                        downButton.style.borderColor = 'transparent';
                    }, 200);
                }
            }, { passive: false });
        });
        
        // 拖曳控制
        let isDragging = false;
        let startY = 0;
        let startScrollTop = 0;
        
        // 拖曳開始
        dragHandle.addEventListener('mousedown', startDrag, { passive: false });
        dragHandle.addEventListener('touchstart', startDrag, { passive: false });
        dragHandle.addEventListener('pointerdown', startDrag, { passive: false });
        
        function startDrag(e) {
            e.preventDefault();
            e.stopPropagation();
            
            isDragging = true;
            startY = e.clientY || (e.touches && e.touches[0].clientY) || e.pageY;
            startScrollTop = scrollWrapper.scrollTop;
            
            dragHandle.style.cursor = 'grabbing';
            dragHandle.style.borderColor = '#007bff';
            
            console.log("開始拖曳:", startY, startScrollTop);
        }
        
        // 拖曳過程
        document.addEventListener('mousemove', handleDrag, { passive: false });
        document.addEventListener('touchmove', handleDrag, { passive: false });
        document.addEventListener('pointermove', handleDrag, { passive: false });
        
        function handleDrag(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            const currentY = e.clientY || (e.touches && e.touches[0].clientY) || e.pageY;
            const deltaY = currentY - startY;
            
            const maxScroll = scrollWrapper.scrollHeight - scrollWrapper.clientHeight;
            const middleHeight = middleArea.clientHeight;
            const scrollRatio = maxScroll / middleHeight;
            
            const newScrollTop = Math.max(0, Math.min(maxScroll, startScrollTop + deltaY * scrollRatio));
            scrollWrapper.scrollTop = newScrollTop;
            
            console.log("拖曳中:", newScrollTop);
        }
        
        // 拖曳結束
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
        document.addEventListener('pointerup', endDrag);
        
        function endDrag(e) {
            if (isDragging) {
                isDragging = false;
                dragHandle.style.cursor = 'grab';
                dragHandle.style.borderColor = 'transparent';
                console.log("結束拖曳");
            }
        }
    }
    
    function updateHandlePosition(scrollWrapper, dragHandle, middleArea) {
        const scrollTop = scrollWrapper.scrollTop;
        const maxScroll = scrollWrapper.scrollHeight - scrollWrapper.clientHeight;
        const middleHeight = middleArea.clientHeight;
        const handleHeight = dragHandle.clientHeight;
        
        if (maxScroll > 0) {
            const scrollRatio = scrollTop / maxScroll;
            const maxHandleTop = middleHeight - handleHeight;
            const handleTop = scrollRatio * maxHandleTop;
            
            dragHandle.style.top = Math.max(0, Math.min(maxHandleTop, handleTop)) + 'px';
        }
    }
}
//修正はここまで



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
// 檢測 Meta Quest 瀏覽器並初始化 SimpleBar
if (/OculusBrowser|Quest|MetaQuest/i.test(navigator.userAgent)) {
    const contentElement = document.querySelector('.content');
    if (contentElement) {
        const simpleBar = new SimpleBar(contentElement, {
            autoHide: false,
            forceEnabled: true,
            scrollbarMinSize: 50,
            scrollbarMaxSize: 150
        });

        console.log("SimpleBar 初始化完成，userAgent:", navigator.userAgent);

        // 獲取滾動容器
        const scrollWrapper = contentElement.querySelector('.simplebar-content-wrapper');
        const track = contentElement.querySelector('.simplebar-track.simplebar-vertical');
        
        if (track && scrollWrapper) {
            // 創建上下箭頭的可點擊區域
            const upArrow = document.createElement('div');
            const downArrow = document.createElement('div');
            
            // 設置上箭頭樣式和位置
            upArrow.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 20px;
                z-index: 1000;
                cursor: pointer;
                background: transparent;
            `;
            
            // 設置下箭頭樣式和位置
            downArrow.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 20px;
                z-index: 1000;
                cursor: pointer;
                background: transparent;
            `;
            
            // 將箭頭添加到軌道中
            track.style.position = 'relative';
            track.appendChild(upArrow);
            track.appendChild(downArrow);
            
            // 添加多種事件監聽器以確保 VR 控制器響應
            const scrollStep = 100;
            
            // 上箭頭事件
            ['click', 'pointerdown', 'mousedown', 'touchstart'].forEach(eventType => {
                upArrow.addEventListener(eventType, (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    scrollWrapper.scrollTop -= scrollStep;
                    console.log("點擊上箭頭，滾動向上");
                });
            });
            
            // 下箭頭事件
            ['click', 'pointerdown', 'mousedown', 'touchstart'].forEach(eventType => {
                downArrow.addEventListener(eventType, (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    scrollWrapper.scrollTop += scrollStep;
                    console.log("點擊下箭頭，滾動向下");
                });
            });
            
            // 處理滑塊拖曳
            const handle = contentElement.querySelector('.simplebar-scrollbar');
            if (handle) {
                // 確保滑塊可以接收事件
                handle.style.cssText += `
                    pointer-events: auto !important;
                    cursor: grab;
                    touch-action: none;
                `;
                
                let isDragging = false;
                let startY = 0;
                let startScrollTop = 0;
                
                // 拖曳開始
                ['pointerdown', 'mousedown', 'touchstart'].forEach(eventType => {
                    handle.addEventListener(eventType, (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        
                        isDragging = true;
                        startY = event.clientY || (event.touches && event.touches[0].clientY);
                        startScrollTop = scrollWrapper.scrollTop;
                        
                        handle.style.cursor = 'grabbing';
                        console.log("Handle 拖曳開始");
                    });
                });
                
                // 拖曳過程
                ['pointermove', 'mousemove', 'touchmove'].forEach(eventType => {
                    document.addEventListener(eventType, (event) => {
                        if (!isDragging) return;
                        
                        event.preventDefault();
                        const currentY = event.clientY || (event.touches && event.touches[0].clientY);
                        const deltaY = currentY - startY;
                        
                        // 計算滾動比例
                        const trackHeight = track.clientHeight;
                        const contentHeight = scrollWrapper.scrollHeight;
                        const viewportHeight = scrollWrapper.clientHeight;
                        const maxScrollTop = contentHeight - viewportHeight;
                        
                        // 將滑鼠移動轉換為滾動距離
                        const scrollRatio = maxScrollTop / (trackHeight - handle.clientHeight);
                        const newScrollTop = Math.max(0, Math.min(maxScrollTop, startScrollTop + deltaY * scrollRatio));
                        
                        scrollWrapper.scrollTop = newScrollTop;
                        console.log("Handle 拖曳中", newScrollTop);
                    });
                });
                
                // 拖曳結束
                ['pointerup', 'mouseup', 'touchend'].forEach(eventType => {
                    document.addEventListener(eventType, () => {
                        if (isDragging) {
                            isDragging = false;
                            handle.style.cursor = 'grab';
                            console.log("Handle 拖曳結束");
                        }
                    });
                });
                
                // 防止拖曳時選中文字
                handle.addEventListener('selectstart', (event) => {
                    event.preventDefault();
                });
                
            } else {
                console.error("未找到 .simplebar-scrollbar，無法啟用拖曳");
            }
            
        } else {
            console.error("未找到必要的 SimpleBar 元素");
        }
    } else {
        console.error("未找到 .content 元素，無法初始化 SimpleBar");
    }
}
//修正はここまで


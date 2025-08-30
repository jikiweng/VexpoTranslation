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

let isVRMode = false;
        let xrSession = null;
        let customScrollbar = null;
        let scrollWrapper = null;
        let isDragging = false;
        let dragStartY = 0;
        let scrollStartTop = 0;

        // 初始化
        window.addEventListener('load', function() {
            console.log("Page loaded");
            
            // 檢測是否為 Meta Quest Browser
            if (isMetaQuestBrowser()) {
                console.log("Meta Quest Browser detected!");
                document.body.classList.add('meta-quest');
                setupScrollbar();
            } else {
                console.log("Not Meta Quest Browser - using default scrolling");
            }
        });
        
        // 檢測是否為 Meta Quest Browser
        function isMetaQuestBrowser() {
            const userAgent = navigator.userAgent.toLowerCase();
            return userAgent.includes('quest') || 
                   userAgent.includes('oculusbrowser') || 
                   userAgent.includes('meta');
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





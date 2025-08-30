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

window.addEventListener('load', function() {
    console.log("Page loaded");

    if (isMetaQuestBrowser()) {
        console.log("Meta Quest Browser detected!");
        document.body.classList.add('meta-quest');
        setupScrollbar();
    } else {
        console.log("Not Meta Quest Browser - using default scrolling");
    }
});

function isMetaQuestBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('quest') || 
           userAgent.includes('oculusbrowser') || 
           userAgent.includes('meta');
}

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
            
    document.body.appendChild(scrollbarContainer);
            
    customScrollbar = {
        container: scrollbarContainer,
        track: track,
        upArea: upArea,
        downArea: downArea,
        handle: handle
    };

    upArea.addEventListener('click', scrollUp);
    downArea.addEventListener('click', scrollDown);

    handle.addEventListener('mousedown', startDrag);
    handle.addEventListener('touchstart', startDrag);
    handle.addEventListener('pointerdown', startDrag);
            
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('pointermove', handleDrag);
            
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('pointerup', endDrag);
   
    scrollWrapper.addEventListener('scroll', updateHandlePosition);
    updateHandlePosition();

    scrollWrapper.addEventListener('scroll', updateScrollProgress);
            
    console.log('Meta Quest custom scrollbar created');
}

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

function updateHandlePosition() {
    if (!customScrollbar || !scrollWrapper) return;
            
    const scrollTop = scrollWrapper.scrollTop;
    const maxScroll = scrollWrapper.scrollHeight - scrollWrapper.clientHeight;
            
    const topBoundary = 27; 
    const bottomBoundary = window.innerHeight - 27; 
    const handleHeight = 40; 
    const availableHeight = bottomBoundary - topBoundary - handleHeight;
            
    if (maxScroll > 0) {
        const scrollRatio = scrollTop / maxScroll;
        const handleTop = topBoundary + scrollRatio * availableHeight;

        const finalTop = Math.max(topBoundary, Math.min(bottomBoundary - handleHeight, handleTop));
        customScrollbar.handle.style.top = finalTop + 'px';
                
        console.log(`Handle position: ${finalTop}px (scroll: ${scrollRatio * 100}%)`);
    } else {
        customScrollbar.handle.style.top = topBoundary + 'px';
    }
}

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






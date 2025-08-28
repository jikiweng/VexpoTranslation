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
            autoHide: false, // 不自動隱藏 scrollbar
            forceEnabled: true, // 強制啟用互動
            scrollbarMinSize: 50, // 最小 handle 尺寸
            scrollbarMaxSize: 150 // 最大 handle 尺寸
        });

        console.log("SimpleBar 初始化完成，userAgent:", navigator.userAgent);

        // 處理上下箭頭點擊事件
        const track = contentElement.querySelector('.simplebar-track.simplebar-vertical');
        if (track) {
            track.addEventListener('pointerdown', (event) => {
                const rect = track.getBoundingClientRect();
                const clickY = event.clientY - rect.top; // 點擊位置相對軌道頂部
                const trackHeight = rect.height;

                // 上箭頭區域（頂部 20px）
                if (clickY < 20) {
                    contentElement.querySelector('.simplebar-content-wrapper').scrollTop -= 100; // 上滾
                    console.log("點擊上箭頭，滾動向上");
                }
                // 下箭頭區域（底部 20px）
                else if (clickY > trackHeight - 20) {
                    contentElement.querySelector('.simplebar-content-wrapper').scrollTop += 100; // 下滾
                    console.log("點擊下箭頭，滾動向下");
                }
            });

            // 確保 handle 可拖曳
            const handle = contentElement.querySelector('.simplebar-scrollbar');
            if (handle) {
                handle.style.pointerEvents = 'auto'; // 確保 VR 控制器可觸發
                handle.addEventListener('pointerdown', () => {
                    console.log("Handle 點擊/拖曳開始");
                });
                handle.addEventListener('pointermove', () => {
                    console.log("Handle 拖曳中");
                });
                handle.addEventListener('pointerup', () => {
                    console.log("Handle 拖曳結束");
                });
            } else {
                console.error("未找到 .simplebar-scrollbar，無法啟用拖曳");
            }
        } else {
            console.error("未找到 .simplebar-track.simplebar-vertical，無法添加箭頭點擊事件");
        }
    } else {
        console.error("未找到 .content 元素，無法初始化 SimpleBar");
    }
}
//修正はここまで

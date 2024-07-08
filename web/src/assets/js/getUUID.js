const getUUID = {};

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

getUUID.getUUID = function () {
    return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
}

getUUID.getShortID = function () {
    return S4() + S4();
}

// 导出模块
export {getUUID};
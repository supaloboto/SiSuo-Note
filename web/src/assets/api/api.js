import axios from "axios";
import store from '@/store';

function getRequest(url, params) {
    const elnBackUrlPrefix = store.state.elnBackUrlPrefix;
    return axios.get(elnBackUrlPrefix + url, {params});
}

function postRequest(url, params) {
    // 发送请求 添加用户信息
    const userId = store.state.pcParams.userId;
    const userName = store.state.pcParams.userName;
    const elnBackUrlPrefix = store.state.elnBackUrlPrefix;
    return axios.post(elnBackUrlPrefix + url + `?userId=${userId}&userName=${userName}`,
        {...params},
        {
            headers: {'Content-Type': 'application/json; charset=utf-8'}
        });
}

function postRequestParams(url, params) {
    const elnBackUrlPrefix = store.state.elnBackUrlPrefix;
    return axios.post(elnBackUrlPrefix + url,
        params,
        {
            headers: {'Content-Type': 'application/json; charset=utf-8'}
        });
}

function uploadFile(url, files) {
    let formData = new FormData();
    const elnBackUrlPrefix = store.state.elnBackUrlPrefix;
    files.forEach(file => formData.append('files', file));
    return axios({
        url: elnBackUrlPrefix + url,
        method: 'POST',
        headers: {'Content-Type': 'multipart/form-data'},
        data: formData
    });
}

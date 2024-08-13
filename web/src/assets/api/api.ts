/**
 * 请求工具
 *
 * @author 刘志栋
 * @since 2024/08/13
 */
import axios, {type AxiosResponse} from "axios";
import {useGlobalStore} from "@/stores/global";

// 参数类
interface Params {
    [key: string]: any;
}

/**
 * get请求
 * @param url 请求地址
 * @param params 请求参数
 */
export function getRequest(url: string, params: Params): Promise<AxiosResponse> {
    const {token} = useGlobalStore().user;
    return axios.get(`/api${url}?token=${token}`, {params});
}

/**
 * post请求
 * @param url 请求地址
 * @param params 请求参数
 */
export function postRequest(url: string, params: Params): Promise<AxiosResponse> {
    const {token} = useGlobalStore().user;
    return axios.post(`/api${url}`, {...params},
        {
            headers: {'Content-Type': 'application/json; charset=utf-8', 'authorization': token}
        }
    );
}

/**
 * 文件上传
 * @param url 请求地址
 * @param files 文件
 */
export function uploadFile(url: string, files: File[]): Promise<AxiosResponse> {
    const {token} = useGlobalStore().user;
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return axios.post(`/api${url}`, formData, {
        headers: {'Content-Type': 'multipart/form-data', 'authorization': token},
    });
}

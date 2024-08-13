import type {AxiosResponse} from "axios";
import {postRequest} from '@/assets/api/api';

export function register(param: { account: string, username: string, password: string }): Promise<AxiosResponse> {
    return postRequest('/account/register', param);
}

export function login(param: { account: string, password: string }): Promise<AxiosResponse> {
    return postRequest('/account/login', param);
}

export function logout(param: { account: string, token: string }): Promise<AxiosResponse> {
    return postRequest('/account/logout', param);
}

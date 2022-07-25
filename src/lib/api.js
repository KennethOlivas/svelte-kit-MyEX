import {get as getStore} from 'svelte/store'
import {access_token} from '../store/session'
import {newAccessToken} from "./utils";

//API

//export const urlBase = "http://localhost:1337";
//export const urlBase = "http://172.16.33.71:1337";
export const urlBase = "https://young-ocean-73880.herokuapp.com";


export const get = (url) => {
    const urlComplete = urlBase + url;
    const accessToken = getStore(access_token)
    const options = {
        method: 'GET',
        headers: {
            'Authorization':  `Bearer ${accessToken}`
        }
    }
    return fetch(urlComplete, options)
}

export const post = (url, params) => {
    const urlComplete = urlBase + url;
    const accessToken = getStore(access_token)
    const options = {
        method: 'POST',
        headers: {
            'Authorization':  `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }

    return fetch(urlComplete, options)
}

export const put = (url, params) => {
    const urlComplete = urlBase + url;
    const accessToken = getStore(access_token)
    const options = {
        method: 'PUT',
        headers: {
            'Authorization':  `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }

    return fetch(urlComplete, options)
}

export const DELETE = (url) => {
    const urlComplete = urlBase + url;
    const accessToken = getStore(access_token)
    const options = {
        method: 'DELETE',
        headers: {
            'Authorization':  `Bearer ${accessToken}`
        }
    }
    return fetch(urlComplete, options)
}

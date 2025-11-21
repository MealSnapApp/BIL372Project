import AuthService from "./AuthService";

export const signIn = (values:any) : Promise<any[] | null> => {
    return new Promise ((resolve, reject) => {
        AuthService.signIn(values)
            .then((response) => {
                const apiData: any = response;
                // console.log(apiData)
                resolve(apiData);
            })
            .catch((err) => {
                console.error(err);
                // resolve(null);
                reject(err);
            })
    })
}

export const signUp = (values:any) : Promise<any[] | null> => {
    return new Promise ((resolve, reject) => {
        AuthService.signUp(values)
        .then((response) => {
            const apiData:any = response;
            resolve(apiData);
        })
        .catch((error) => {
            console.error(error);
            // resolve(null);
            reject(error);
        })
    })
}

export const logout = () : Promise<any[] | null> => {
    return new Promise ((resolve, reject) => {
        AuthService.logout()
            .then((response) => {
                const apiData: any = response;
                resolve(apiData);
            })
            .catch((err) => {
                console.error(err);
                // resolve(null);
                reject(err);
            })
    })
}

export const checkAuth = () : Promise<any[] | null> => {
    return new Promise ((resolve, reject) => {
        AuthService.checkAuth()
            .then((response) => {
                const apiData: any = response;
                resolve(apiData);
            })
            .catch((err) => {
                console.error(err);
                // resolve(null);
                reject(err);
            })
    })
}
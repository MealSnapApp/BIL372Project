import {RequestMethod} from "../../enums/RequestMethod";
import { makeRequest } from "../../axios/ApiService";

const endpoints: any = {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    logout: '/auth/logout',
    checkAuth: '/auth/check-auth'
}

class AuthService {

    async signIn(values:any): Promise<{ data: any, success: boolean }> {        
        return makeRequest(RequestMethod.POST, endpoints.signIn, {data: values})
            .then(result => {
                return result;
            })
            .catch(error => {
                return error;
            }); 
    }

    async signUp(values:any): Promise<{ data:any,success:boolean}> {
        return makeRequest(RequestMethod.POST, endpoints.signUp, {data: values})
            .then(result => {
                return result;
            })
            .catch(error => {
                return error;
            });
    }

    async logout(): Promise<{ data: any, success: boolean }> {        
        return makeRequest(RequestMethod.POST, endpoints.logout)
            .then(result => {
                return result;
            })
            .catch(error => {
                return error;
            }); 
    }

    async checkAuth(): Promise<{ data: any, success: boolean }> {
        return makeRequest(RequestMethod.GET, endpoints.checkAuth)
            .then(result => {
                return result;
            })
            .catch(error => {
                return error;
            });
    }
}

export default new AuthService();

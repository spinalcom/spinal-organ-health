"use strict";
/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const TokenManager_1 = require("./TokenManager");
const querystring = require('querystring');
class ApiConnector {
    constructor() {
        this.TokenManager = new TokenManager_1.TokenManager();
    }
    getConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                    "x-access-token": yield this.TokenManager.getToken()
                }
            };
        });
    }
    /**
     * @param {string} url
     * @return {*}
     * @memberof ApiConnector
     */
    get(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield this.getConfig();
            return axios_1.default.get(url, config);
        });
    }
    /**
     *
     * @param {string} url
     * @param {*} data
     * @return {*}
     * @memberof ApiConnector
     */
    post(url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield this.getConfig();
            return axios_1.default.post(url, data, config);
        });
    }
    postAuth(url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default.post(url, data);
        });
    }
}
exports.ApiConnector = ApiConnector;
//# sourceMappingURL=ApiConnector.js.map
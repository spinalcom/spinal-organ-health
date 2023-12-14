/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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

import { Lst, spinalCore, Model, FileSystem, Val, Str, Bool } from "spinal-core-connectorjs";
import * as path from "path";
import config from './config';
import { ApiConnector } from './ApiConnector';
import ConfigFile from 'spinal-lib-organ-monitoring';

interface IStatusHubObject extends Model {
  count_models: Val;
  count_users: Val;
  count_sessions: Val;
  ram_usage_res: Val;
  ram_usage_virt: Val;
  btn: IBtn;
  sessions: ISessionsItem[];
  data: IData;
  boot_timestamp: Val;
}
interface IBtn extends Model {
  garbageCollector: Val;
  backup: Val;
}
interface ISessionsItem extends Model {
  id: Val;
  timestamp: Val;
  type: Str;
  actif: Bool;
}
interface IData extends Model {
  len: Val;
  count_models: Str;
  count_users: Str;
  count_sessions: Str;
  ram_usage_res: Str;
  ram_usage_virt: Str;
}



class LoadConfigFiles {
  private static instance: LoadConfigFiles;
  private apiConnector: ApiConnector;
  private constructor() {
    this.apiConnector = new ApiConnector();
  }
  public static getInstance(): LoadConfigFiles {
    if (!this.instance) this.instance = new LoadConfigFiles();
    return this.instance;
  }

  public async initFiles(conn: FileSystem): Promise<any> {
    const promiseEtc = new Promise<IStatusHubObject>(async (resolve, reject) => {
      const directory = await conn.load_or_make_dir("/etc")
      for (const file of directory) {
        if (file) {
          // @ts-ignore
          if (file._info.model_type.get() === "model_status") {
            var fileLoaded = await file.load();
            resolve(fileLoaded);
            return;
          }
        }
      } reject("/etc not Found")
    })

    const promisesOrganFiles = new Promise<any[]>(async (resolve, reject) => {
      const directory = await conn.load_or_make_dir("/etc/Organs/Monitoring")
      if (!directory) reject("/etc/Organs/Monitoring not Found")
      const files: Promise<any>[] = [];
      for (const file of directory) {
        if (file._info?.model_type?.get() === "ConfigFile") {
          files.push(file._ptr.load())
        }
      }
      resolve(Promise.all(files))
    })
    const hubStatus = await promiseEtc;
    const files = await promisesOrganFiles
    await this.pushDataInMonitoringPlatform(this.apiConnector, files, hubStatus);
  }
  public async pushDataInMonitoringPlatform(apiConnector: ApiConnector, files: any, hubStatus: IStatusHubObject) {
    try {
      console.log("Pushing data to monitoring platform...");
      let infoFiles = [];
      for (const file of files) {
        let infofile;
        try {
          infofile = {
            genericOrganData: {
              id: file.genericOrganData?.id.get(),
              name: file.genericOrganData?.name.get(),
              type: file.genericOrganData?.type.get(),
              serverName: file.genericOrganData?.serverName.get(),
              bootTimestamp: file.genericOrganData?.bootTimestamp.get(),
              lastHealthTime: file.genericOrganData?.lastHealthTime.get(),
              ramRssUsed: file.genericOrganData?.ramRssUsed.get(),
              macAdress: file.genericOrganData?.macAdress.get(),
              logList: [],
            },
            specificOrganData: {
              port: file.specificOrganData.port?.get(),
              lastAction: {
                message: file.specificOrganData.lastAction.message?.get(),
                date: file.specificOrganData.lastAction.date?.get()
              }
            },
          }
          infoFiles.push(infofile)
        } catch (error) { }
      }
      
      const objBosFile = {
        TokenBosRegister: config.monitoringApiConfig.TokenBosRegister,
        infoHub: {
          bootTimestamp: hubStatus.boot_timestamp?.get(),
          ramUsageRes: hubStatus.ram_usage_res.get() / 1024,
          ramUsageVirt: hubStatus.ram_usage_virt.get() / 1024,
          countSessions: hubStatus.count_sessions.get(),
          countUsers: hubStatus.count_users.get()
        },
        infoOrgans: infoFiles
      }
      if (config.monitoringApiConfig.monitoring_helath_url !== undefined) {
        await apiConnector.post(config.monitoringApiConfig.monitoring_helath_url, objBosFile)
        console.log("Pushing data done !")
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async _loadConfigFiles(connect: spinal.FileSystem, fileName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      spinalCore.load(connect, path.resolve(`/etc/Organs/Monitoring/${fileName}`),
        (file) => resolve(file),
        () => {
          console.log("error load file");
          reject("error load file")
        }
      )

    });
  }
}
export default LoadConfigFiles.getInstance()  

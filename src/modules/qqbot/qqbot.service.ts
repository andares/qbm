import { Component } from '@nestjs/common';
import { spawnSync, execFileSync, execFile, execSync } from 'child_process';
import {
    existsSync,
    writeFileSync,
    readFileSync,
    chmodSync,
    mkdirSync,
    unlinkSync,
    readdirSync,
} from 'fs';

import { Buffer } from 'buffer';

type BotInfo = {
    port: string,
    qq: string,
    friends: number | any,
    code: any,
};

@Component()
export class QqbotService {

    static readonly binContents = {
        qq: `#!/usr/bin/python
# EASY-INSTALL - ENTRY - SCRIPT: 'qqbot==v2.3.7', 'console_scripts', 'qq'
__requires__ = 'qqbot==v2.3.7'
import sys
from pkg_resources import load_entry_point

if __name__ == '__main__':
    sys.exit(
        load_entry_point('qqbot==v2.3.7', 'console_scripts', 'qq')()
    )`,
        qqbot: `#!/usr/bin/python
# EASY-INSTALL-ENTRY-SCRIPT: 'qqbot==v2.3.7','console_scripts','qqbot'
__requires__ = 'qqbot==v2.3.7'
import sys
from pkg_resources import load_entry_point

if __name__ == '__main__':
    sys.exit(
        load_entry_point('qqbot==v2.3.7', 'console_scripts', 'qqbot')()
    )`,
    };

    static readonly plugin = `# -*- coding: utf-8 -*-
import urllib2
from urlparse import urlparse
from urlparse import parse_qs
import re

lion_domain = "api.shihoutv.com";

def onQQMessage(bot, contact, member, content):
    global lion_domain;

    if member or (contact is None) or contact.qq == "#NULL":
        return 1

    content = content.strip();
    parsed = urlparse(content);

    if content == '验证主播':
        # response = urllib2.urlopen('http://localhost:8080/jenkins/api/json?pretty=true')
        bot.SendTo(contact, '你好，我是QQ机器人')
    elif parsed.hostname is not None:
        query = parse_qs(parsed.query)
        if parsed.hostname == "gamecenter.qq.com"\
            and query.has_key('appid')\
            and query['appid'][0] == '1104512706':
            bot.SendTo(contact, "穿越火线")
        elif parsed.hostname == "gamecenter.qq.com"\
            and query.has_key('appid')\
            and query['appid'][0] == '1104466820':
            bot.SendTo(contact, "王者荣耀")
        else:
            bot.SendTo(contact, "无法识别输入的信息")
    elif content.decode('utf-8')[0:12].encode('utf-8') == '我刚刚建立了一支团战队伍':
        pattern = re.compile(r'^.*(http:\/\/t\.cn\/[a-zA-Z0-9]+)$')
        match = pattern.match(content)
        if match:
            bot.SendTo(contact, "球球大作战 " + match.group(1))
        else:
            bot.SendTo(contact, "无法识别输入的信息")
    else:
        bot.SendTo(contact, '我是狮小Q。你可以说【验证主播】，来确定自己QQ绑定的帐号是否正确。确定身份后，可以直接将游戏中的组队链接复制/分享到QQ中告诉我，我会转发到你的直播间。目前支持的游戏： 穿越火线 , 王者荣耀 , 球球大作战')
`;

    static readonly bin = {
        qq:     "/usr/local/bin/qq",
        qqbot:  "/usr/local/bin/qqbot",
    };

    lists(ports: string[]) {
        let res: any[] = [];
        ports.map(port => {
            let code = this.getLoginCode(port);
            let info: BotInfo = {
                port: port,
                qq: this.getQq(port),
                friends: this.getFriends(port),
                code: code ? 1 : 0,
            };
            res.push(info);
        });
        return res;
    }

    code(port: string) {
        return this.getLoginCode(port);
    }

    private getLoginCode(port: string): string {
        let dir = this.getDir(port);
        let img: string = "";
        let filename = readdirSync(`${dir}`).find(file => /\.png$/.test(file));
        if (!filename) {
            return '';
        }
        return readFileSync(`${dir}/${filename}`, { encoding: "binary" });
    }

    private getFriends(port: string): number {
        let result = this.callAndGetOutput(QqbotService.bin.qq, port, "list", "buddy");
        if (result.startsWith("无法连接")) {
            return -1;
        }

        return result.split("\n").length;
    }

    private getQq(port: string): string {
        let dir = this.getDir(port);
        let qq: string = "0";
        readdirSync(`${dir}`).find(file => {
            let result = /([0-9]+)\-contact\.db$/g.exec(file);
            if (result == null) {
                return false;
            }
            qq = result[1];
            return true;
        });
        return qq;
    }

    kill(port: string) {
        let output = this.callAndGetOutput("ps aux|grep", `qqbot_${port}`);
        let res: string[] = [];
        output.split("\n").map(line => {
            let result = /^\S+\s+([0-9]+)/.exec(line);
            if (result) {
                this.callAndGetOutput("kill", "-9", result[1]);
                res.push(`kill process ${result[1]}`);
            }
        });
        return res;
    }

    stop(port: string) {
        let output = this.callAndGetOutput(QqbotService.bin.qq, port, "stop");
        return output.split("\n");
    }

    start(port: string): Array<any> {
        let dir = this.getDir(port);
        let hport = this.prepareStart(dir, port);
        this.cleanDir(dir);
        let output = '';
        // console.log(`${QqbotService.bin.qqbot} -dm -b "${dir}" -p ${port} -hp ${hport}`);
        output = this.callAndGetOutput(QqbotService.bin.qqbot, "-dm", "-b", dir, "-p", port, "-hp", hport);
        return output.split("\n");
    }

    private getDir(port: string): string {
        let dir = `/tmp/qqbot_${port}`;
        if (!existsSync(dir)) {
            this.callAndGetOutput("mkdir", "-p", dir);
        }
        return dir;
    }

    private prepareStart(dir: string, port: string): string {
        let hport = (Number(port) + 1).toString();

        let confContent: string = readFileSync(`${__dirname}/../../../res/v2.3.conf`, { encoding: "utf8" });
        confContent = confContent
            .replace("8188", port)
            .replace("8189", hport)
            .replace("8:00", "10:00");
        writeFileSync(`${dir}/v2.3.conf`, confContent);

        writeFileSync(`${dir}/plugins/ext.py`, QqbotService.plugin);
        return hport;
    }

    private cleanDir(dir: string) {
        this.callAndGetOutput("rm", "-f", `${dir}/*.log`);
        this.callAndGetOutput("rm", "-f", `${dir}/*.png`);
        this.callAndGetOutput("rm", "-f", `${dir}/*.db`);
    }

    init(): string[] {
        if (!this.checkPipVersion()) {
            return ["pip is not installed"];
        }
        let res: string[] = this.checkQqbotInstalled()
            ? [] : this.installQqbot();
        res.push("qqbot is installed");

        // 处理万一没有创建启动文件时的办法
        if (!existsSync(QqbotService.bin.qqbot)) {
            writeFileSync(QqbotService.bin.qqbot, QqbotService.binContents.qqbot);
            chmodSync(QqbotService.bin.qqbot, 0o755)
            res.push(`${QqbotService.bin.qqbot} created!`);
        }
        if (!existsSync(QqbotService.bin.qq)) {
            writeFileSync(QqbotService.bin.qq, QqbotService.binContents.qq);
            chmodSync(QqbotService.bin.qq, 0o755)
            res.push(`${QqbotService.bin.qq} created!`);
        }

        return res;
    }

    private checkPipVersion(): boolean {
        let output: string = this.callAndGetOutput("pip", "--version");
        return output.startsWith("pip");
    }

    private checkQqbotInstalled(): boolean {
        let output: string[] = this.callAndGetOutput("pip", "list").split("\n");
        return output.find(row => row.toLowerCase().startsWith("qqbot")) != undefined;
    }

    private installQqbot(): string[] {
        let output: string[] = this.callAndGetOutput("pip", "install", "qqbot")
            .split("\n");
        return output;
    }

    private callAndGetOutput(cmd: string, ...args: string[]): string {
        console.log(`${cmd} ${args.join(" ")}`)
        return spawnSync(cmd, args, {
            shell: "/bin/bash",
        }).stdout.toString();
    }
}